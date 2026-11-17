"""The ``Face`` facade: what robot code actually talks to.

This is the arbitration layer. It owns a persistent base mood and an optional
transient reaction that reverts on its own, so a startle cannot strand the robot
looking startled forever when the next command never arrives.

Deciding *when* to be happy is explicitly not this layer's job — that belongs to
the robot's own behaviour code.
"""

from __future__ import annotations

import logging
import subprocess
import tempfile
import threading
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

from .kiosk import launch
from .pack import FacePack, FacePackError, load_pack, parse_pack
from .server import BundleServer, ControlServer

log = logging.getLogger("nori_face")

BUNDLE_DIR = Path(__file__).resolve().parent / "_bundle"


class BundleMissing(RuntimeError):
    pass


def _bundle_dir() -> Path:
    if not (BUNDLE_DIR / "index.html").exists():
        raise BundleMissing(
            "the renderer bundle is missing from {}. Build it from the repo root "
            "with `bun run build:renderer`.".format(BUNDLE_DIR)
        )
    return BUNDLE_DIR


class _Transient:
    __slots__ = ("state", "priority", "timer")

    def __init__(self, state: str, priority: int, timer: threading.Timer) -> None:
        self.state = state
        self.priority = priority
        self.timer = timer


class Face:
    """Drives a robot's face from a face pack.

    >>> face = Face.from_file("mood.nori.json")
    >>> face.start()
    >>> face.set("curious")
    >>> face.play("surprised", hold=0.8)
    >>> face.close()
    """

    def __init__(self, pack: FacePack) -> None:
        self.pack = pack
        self._lock = threading.RLock()
        self._base = pack.defaultState
        self._current = pack.defaultState
        self._transient: Optional[_Transient] = None

        self._http: Optional[BundleServer] = None
        self._control: Optional[ControlServer] = None
        self._browser: Optional[subprocess.Popen] = None
        self._profile_dir: Optional[tempfile.TemporaryDirectory] = None
        self._started = False

    # ── construction ──

    @classmethod
    def from_file(cls, path: Union[str, Path]) -> "Face":
        return cls(load_pack(path))

    @classmethod
    def from_dict(cls, data: Any) -> "Face":
        return cls(parse_pack(data))

    # ── lifecycle ──

    def start(
        self,
        *,
        browser: Union[bool, str] = True,
        http_port: int = 0,
        ws_port: int = 8765,
    ) -> "Face":
        """Serve the renderer and, unless ``browser=False``, open it in kiosk mode.

        ``browser=False`` prints nothing and opens nothing — use it to drive the
        face from a laptop with an ordinary browser tab, no robot in the loop.
        """
        if self._started:
            return self

        directory = _bundle_dir()

        self._control = ControlServer(port=ws_port)
        self._control.start()

        self._http = BundleServer(directory, self.pack.to_json(), port=http_port)
        self._http.start()

        if browser is not False:
            self._profile_dir = tempfile.TemporaryDirectory(prefix="nori-face-")
            self._browser = launch(
                self.url,
                Path(self._profile_dir.name),
                browser if isinstance(browser, str) else None,
            )

        self._started = True
        self._push(self._current)
        return self

    @property
    def url(self) -> str:
        if self._http is None or self._control is None:
            raise RuntimeError("face not started")
        return "http://127.0.0.1:{}/index.html?ws={}".format(
            self._http.port, self._control.port
        )

    def close(self) -> None:
        with self._lock:
            self._cancel_transient()

        if self._browser is not None:
            self._browser.terminate()
            try:
                self._browser.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self._browser.kill()
            self._browser = None

        if self._http is not None:
            self._http.close()
            self._http = None
        if self._control is not None:
            self._control.close()
            self._control = None
        if self._profile_dir is not None:
            self._profile_dir.cleanup()
            self._profile_dir = None

        self._started = False

    def __enter__(self) -> "Face":
        return self

    def __exit__(self, *exc: Any) -> None:
        self.close()

    # ── expression control ──

    @property
    def states(self) -> List[str]:
        return self.pack.state_ids

    @property
    def current(self) -> str:
        """The state actually on screen, transient included."""
        with self._lock:
            return self._current

    @property
    def mood(self) -> str:
        """The persistent base mood, ignoring any transient reaction."""
        with self._lock:
            return self._base

    def set(self, state_id: str, *, priority: int = 0) -> None:
        """Set the persistent mood. Holds until changed."""
        self._require_state(state_id)
        with self._lock:
            self._base = state_id
            # A transient outranks a mood change unless the caller says otherwise.
            if self._transient is not None and priority < self._transient.priority:
                return
            self._cancel_transient()
            self._push(state_id)

    def play(self, state_id: str, *, hold: float = 0.8, priority: int = 1) -> bool:
        """Show a reaction for ``hold`` seconds, then revert to the base mood.

        Returns False if a higher-priority reaction is already playing.
        """
        self._require_state(state_id)
        if hold <= 0:
            raise ValueError("hold must be positive")

        with self._lock:
            if self._transient is not None and priority < self._transient.priority:
                return False
            self._cancel_transient()
            timer = threading.Timer(hold, self._revert, args=(state_id,))
            timer.daemon = True
            self._transient = _Transient(state_id, priority, timer)
            self._push(state_id)
            timer.start()
            return True

    def _revert(self, from_state: str) -> None:
        with self._lock:
            # Ignore a timer that fired after its reaction was already replaced.
            if self._transient is None or self._transient.state != from_state:
                return
            self._transient = None
            self._push(self._base)

    def _cancel_transient(self) -> None:
        if self._transient is not None:
            self._transient.timer.cancel()
            self._transient = None

    def _require_state(self, state_id: str) -> None:
        if not self.pack.has(state_id):
            raise FacePackError(
                "unknown state {!r}; pack has: {}".format(
                    state_id, ", ".join(self.pack.state_ids)
                )
            )

    def _push(self, state_id: str) -> None:
        self._current = state_id
        if self._control is not None:
            self._control.send_state(state_id)

    # ── introspection ──

    def describe(self) -> Dict[str, Any]:
        with self._lock:
            return {
                "pack": self.pack.name,
                "url": self.url if self._started else None,
                "current": self._current,
                "mood": self._base,
                "transient": None if self._transient is None else self._transient.state,
                "states": self.pack.state_ids,
            }
