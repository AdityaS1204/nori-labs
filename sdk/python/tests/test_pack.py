"""Parser tests, mirroring lib/face-pack.test.ts so the two readers stay aligned."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from nori_face import FacePackError, load_pack, parse_pack
from nori_face.pack import Blink, Gaze, Spring, normalize_hex

FIXTURES = Path(__file__).resolve().parents[3] / "tests" / "fixtures"


def minimal(**over):
    face = json.loads((FIXTURES / "demo.nori.json").read_text(encoding="utf-8"))["states"][0]["face"]
    base = {
        "schema": 1,
        "defaultState": "a",
        "states": [{"id": "a", "face": face}],
    }
    base.update(over)
    return base


class TestFixtureParity:
    """The shared fixture is the conformance anchor between TS and Python."""

    def test_demo_fixture_loads(self):
        pack = load_pack(FIXTURES / "demo.nori.json")
        assert pack.name == "Nori demo moods"
        assert pack.defaultState == "neutral"
        assert pack.state_ids == ["neutral", "happy", "surprised", "sleepy", "angry"]
        assert pack.fit == "contain"
        assert pack.background == "#000000"

    def test_demo_fixture_round_trips(self):
        pack = load_pack(FIXTURES / "demo.nori.json")
        assert parse_pack(json.loads(pack.to_json())).to_dict() == pack.to_dict()

    def test_fixture_motion_matches_the_shipped_defaults(self):
        pack = load_pack(FIXTURES / "demo.nori.json")
        assert pack.transition.spring == Spring(300, 30, 0.6)
        assert pack.ambient.blink == Blink()
        assert pack.ambient.gaze == Gaze()


class TestDefaults:
    def test_fills_in_motion_defaults_when_omitted(self):
        pack = parse_pack(minimal())
        assert pack.ambient.blink == Blink()
        assert pack.ambient.gaze == Gaze()
        assert pack.transition.spring == Spring()
        assert pack.background == "#000000"
        assert pack.fit == "contain"

    def test_merges_a_partial_ambient_block(self):
        pack = parse_pack(minimal(ambient={"blink": {"closeMs": 40}, "gaze": {"mode": "off"}}))
        assert pack.ambient.blink.closeMs == 40
        assert pack.ambient.blink.openMs == Blink().openMs
        assert pack.ambient.gaze.mode == "off"
        assert pack.ambient.gaze.clamp == Gaze().clamp

    def test_defaults_a_missing_label_to_the_state_id(self):
        assert parse_pack(minimal()).states[0].label == "a"

    def test_names_an_untitled_pack(self):
        assert parse_pack(minimal(name="  ")).name == "Untitled face"

    def test_backfills_eyes_written_before_shape_and_thickness(self):
        data = minimal()
        for side in ("left", "right"):
            data["states"][0]["face"][side].pop("shape", None)
            data["states"][0]["face"][side].pop("thickness", None)
        pack = parse_pack(data)
        assert pack.states[0].face["left"]["shape"] == "bar"
        assert pack.states[0].face["left"]["thickness"] == 16


class TestRejections:
    def test_unknown_schema(self):
        with pytest.raises(FacePackError, match="unsupported schema"):
            parse_pack(minimal(schema=2))

    def test_dangling_default_state(self):
        with pytest.raises(FacePackError, match="does not match any state id"):
            parse_pack(minimal(defaultState="nope"))

    def test_empty_states(self):
        with pytest.raises(FacePackError, match="non-empty"):
            parse_pack(minimal(states=[]))

    def test_duplicate_state_ids(self):
        data = minimal()
        data["states"].append(dict(data["states"][0]))
        with pytest.raises(FacePackError, match="duplicate state id"):
            parse_pack(data)

    def test_malformed_motion_value(self):
        with pytest.raises(FacePackError, match="must be a finite number"):
            parse_pack(minimal(transition={"spring": {"stiffness": "fast"}}))

    def test_inverted_range(self):
        with pytest.raises(FacePackError, match="max must be >= min"):
            parse_pack(minimal(ambient={"blink": {"everyMs": [6000, 2500]}}))

    def test_face_missing_an_eye_object(self):
        data = minimal()
        data["states"][0]["face"]["left"] = None
        with pytest.raises(FacePackError, match=r"face\.left must be an object"):
            parse_pack(data)

    def test_missing_file(self):
        with pytest.raises(FacePackError, match="no such pack"):
            load_pack(FIXTURES / "does-not-exist.nori.json")


class TestGazeClamp:
    def test_clamp_is_an_xy_pair_not_a_range(self):
        # [24, 16] is descending by design; validating it as a range would reject it.
        pack = parse_pack(minimal(ambient={"gaze": {"clamp": [40, 8]}}))
        assert pack.ambient.gaze.clamp == (40, 8)


class TestNormalizeHex:
    def test_expands_three_digit_hex(self):
        assert normalize_hex("#abc", "color") == "#aabbcc"

    def test_lowercases_six_digit_hex(self):
        assert normalize_hex("#EAF3FF", "color") == "#eaf3ff"

    @pytest.mark.parametrize("bad", ["rgb(1,2,3)", "red", 123, None])
    def test_rejects_non_hex(self, bad):
        with pytest.raises(FacePackError):
            normalize_hex(bad, "color")


class TestRenderTarget:
    """`target` is additive in schema 1: it must survive the SDK's re-serialize,
    since the kiosk reads the JSON this parser writes, not the exported file."""

    def test_defaults_to_web_when_absent(self):
        pack = parse_pack(minimal())
        assert pack.target == "web"
        assert pack.transition.durationMs is None
        assert "durationMs" not in pack.to_dict()["transition"]

    def test_reads_an_lvgl_pack_with_a_tween(self):
        pack = parse_pack(
            minimal(target="lvgl", transition={"durationMs": 300, "ease": "easeOut"})
        )
        assert pack.target == "lvgl"
        assert pack.transition.durationMs == 300
        assert pack.transition.ease == "easeOut"

    def test_gives_an_lvgl_pack_a_default_tween(self):
        pack = parse_pack(minimal(target="lvgl"))
        assert pack.transition.durationMs == 220
        assert pack.transition.ease == "easeInOut"

    def test_target_and_tween_survive_reserialization(self):
        pack = parse_pack(
            minimal(target="lvgl", transition={"durationMs": 300, "ease": "linear"})
        )
        served = json.loads(pack.to_json())
        assert served["target"] == "lvgl"
        assert served["transition"]["durationMs"] == 300
        assert parse_pack(served).to_dict() == pack.to_dict()

    def test_rejects_an_unknown_target(self):
        with pytest.raises(FacePackError):
            parse_pack(minimal(target="metal"))
