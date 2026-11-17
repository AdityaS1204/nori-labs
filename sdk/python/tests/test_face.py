"""Arbitration and serving behaviour."""

from __future__ import annotations

import json
import time
import urllib.request
from pathlib import Path

import pytest

from nori_face import Face, FacePackError
from nori_face.face import BUNDLE_DIR

FIXTURES = Path(__file__).resolve().parents[3] / "tests" / "fixtures"
DEMO = FIXTURES / "demo.nori.json"

bundle_built = pytest.mark.skipif(
    not (BUNDLE_DIR / "index.html").exists(),
    reason="renderer bundle not built (run `bun run build:renderer`)",
)


@pytest.fixture
def face():
    f = Face.from_file(DEMO)
    yield f
    f.close()


class TestArbitration:
    """These run without starting a server: arbitration is pure state."""

    def test_starts_on_the_pack_default(self, face):
        assert face.current == "neutral"
        assert face.mood == "neutral"

    def test_set_changes_the_persistent_mood(self, face):
        face.set("happy")
        assert face.current == "happy"
        assert face.mood == "happy"

    def test_play_reverts_to_the_base_mood(self, face):
        face.set("happy")
        assert face.play("surprised", hold=0.15)
        assert face.current == "surprised"
        assert face.mood == "happy", "the base mood must survive a reaction"
        time.sleep(0.3)
        assert face.current == "happy"

    def test_a_reaction_outranks_a_mood_change_while_it_plays(self, face):
        face.play("surprised", hold=0.3, priority=2)
        face.set("sleepy")
        assert face.current == "surprised", "the reaction should still be on screen"
        assert face.mood == "sleepy", "but the new mood is queued underneath"
        time.sleep(0.45)
        assert face.current == "sleepy", "and it lands once the reaction ends"

    def test_a_high_priority_set_interrupts_a_reaction(self, face):
        face.play("surprised", hold=5, priority=1)
        face.set("angry", priority=1)
        assert face.current == "angry"

    def test_a_lower_priority_reaction_is_refused(self, face):
        assert face.play("surprised", hold=0.4, priority=5)
        assert face.play("sleepy", hold=0.2, priority=1) is False
        assert face.current == "surprised"

    def test_a_superseded_timer_does_not_clobber_a_newer_reaction(self, face):
        face.set("neutral")
        face.play("surprised", hold=0.12)
        face.play("angry", hold=0.6)
        time.sleep(0.25)
        # The first reaction's timer has fired by now; it must not revert us.
        assert face.current == "angry"

    def test_unknown_states_are_rejected(self, face):
        with pytest.raises(FacePackError, match="unknown state"):
            face.set("nope")
        with pytest.raises(FacePackError, match="unknown state"):
            face.play("nope")

    def test_hold_must_be_positive(self, face):
        with pytest.raises(ValueError):
            face.play("happy", hold=0)

    def test_states_lists_the_pack(self, face):
        assert face.states == ["neutral", "happy", "surprised", "sleepy", "angry"]


@bundle_built
class TestServing:
    def test_serves_the_bundle_and_the_pack(self):
        with Face.from_file(DEMO) as f:
            f.start(browser=False, ws_port=0)

            index = urllib.request.urlopen(f.url.split("?")[0], timeout=5)
            assert index.status == 200
            assert b"<div id=\"root\">" in index.read()

            base = f.url.split("/index.html")[0]
            pack = json.loads(urllib.request.urlopen(base + "/pack.json", timeout=5).read())
            assert pack["schema"] == 1
            assert [s["id"] for s in pack["states"]] == f.states

    def test_url_carries_the_websocket_port(self):
        with Face.from_file(DEMO) as f:
            f.start(browser=False, ws_port=0)
            assert "ws=" in f.url
            assert int(f.url.split("ws=")[1]) > 0

    def test_describe_reports_live_state(self):
        with Face.from_file(DEMO) as f:
            f.start(browser=False, ws_port=0)
            f.set("happy")
            info = f.describe()
            assert info["current"] == "happy"
            assert info["mood"] == "happy"
            assert info["transient"] is None
            assert info["pack"] == "Nori demo moods"


@bundle_built
class TestControlChannel:
    def test_a_renderer_receives_state_changes(self):
        websockets = pytest.importorskip("websockets.sync.client")

        with Face.from_file(DEMO) as f:
            f.start(browser=False, ws_port=0)
            port = int(f.url.split("ws=")[1])

            with websockets.connect("ws://127.0.0.1:{}".format(port), open_timeout=5) as ws:
                # A connecting page is brought in sync with the current state.
                first = json.loads(ws.recv(timeout=5))
                assert first == {"type": "set", "state": "neutral"}

                ws.send(json.dumps({"type": "hello", "states": f.states, "current": "neutral"}))

                f.set("angry")
                assert json.loads(ws.recv(timeout=5)) == {"type": "set", "state": "angry"}

                f.play("surprised", hold=0.2)
                assert json.loads(ws.recv(timeout=5)) == {"type": "set", "state": "surprised"}
                assert json.loads(ws.recv(timeout=5)) == {"type": "set", "state": "angry"}
