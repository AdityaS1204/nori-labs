"""Loading and validation for Nori face packs.

The Python mirror of ``lib/face-pack.ts``. Both are checked against the same
fixtures in ``tests/fixtures`` so the two readers cannot drift apart.

Format reference: ``docs/face-pack-v1.md``.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Mapping, Optional, Sequence, Tuple

SCHEMA_VERSION = 1

EASINGS = ("linear", "easeIn", "easeOut", "easeInOut")
FITS = ("contain", "cover", "stretch")
GAZE_MODES = ("off", "random")
TARGETS = ("web", "lvgl")

DEFAULT_BACKGROUND = "#000000"
DEFAULT_TARGET = "web"
DEFAULT_TWEEN_MS = 220.0
DEFAULT_TWEEN_EASE = "easeInOut"

_HEX6 = re.compile(r"^#[0-9a-fA-F]{6}$")
_HEX3 = re.compile(r"^#[0-9a-fA-F]{3}$")


class FacePackError(ValueError):
    """Raised when a pack is malformed. Deliberately fatal: a bad pack should
    fail before deploy rather than render the wrong face on a robot."""


@dataclass(frozen=True)
class Spring:
    stiffness: float = 300.0
    damping: float = 30.0
    mass: float = 0.6

    def to_dict(self) -> Dict[str, float]:
        return {"stiffness": self.stiffness, "damping": self.damping, "mass": self.mass}


@dataclass(frozen=True)
class Blink:
    closeMs: float = 70.0
    closeEase: str = "easeIn"
    openMs: float = 130.0
    openEase: str = "easeOut"
    closedScale: float = 0.06
    everyMs: Tuple[float, float] = (2500.0, 6000.0)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "closeMs": self.closeMs,
            "closeEase": self.closeEase,
            "openMs": self.openMs,
            "openEase": self.openEase,
            "closedScale": self.closedScale,
            "everyMs": list(self.everyMs),
        }


@dataclass(frozen=True)
class Gaze:
    mode: str = "random"
    clamp: Tuple[float, float] = (24.0, 16.0)
    retargetMs: Tuple[float, float] = (650.0, 2850.0)
    spring: Spring = field(default_factory=lambda: Spring(140.0, 18.0, 0.6))

    def to_dict(self) -> Dict[str, Any]:
        return {
            "mode": self.mode,
            "clamp": list(self.clamp),
            "retargetMs": list(self.retargetMs),
            "spring": self.spring.to_dict(),
        }


@dataclass(frozen=True)
class Ambient:
    blink: Blink = field(default_factory=Blink)
    gaze: Gaze = field(default_factory=Gaze)

    def to_dict(self) -> Dict[str, Any]:
        return {"blink": self.blink.to_dict(), "gaze": self.gaze.to_dict()}


@dataclass(frozen=True)
class Transition:
    spring: Spring = field(default_factory=Spring)
    # Set for targets with no spring solver (LVGL); wins over `spring` there.
    durationMs: Optional[float] = None
    ease: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        out: Dict[str, Any] = {"spring": self.spring.to_dict()}
        if self.durationMs is not None:
            out["durationMs"] = self.durationMs
        if self.ease is not None:
            out["ease"] = self.ease
        return out


@dataclass(frozen=True)
class FaceState:
    id: str
    label: str
    face: Mapping[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        return {"id": self.id, "label": self.label, "face": dict(self.face)}


@dataclass(frozen=True)
class FacePack:
    name: str
    defaultState: str
    states: Sequence[FaceState]
    background: str = DEFAULT_BACKGROUND
    fit: str = "contain"
    transition: Transition = field(default_factory=Transition)
    ambient: Ambient = field(default_factory=Ambient)
    target: str = DEFAULT_TARGET
    schema: int = SCHEMA_VERSION

    @property
    def state_ids(self) -> List[str]:
        return [s.id for s in self.states]

    def has(self, state_id: str) -> bool:
        return any(s.id == state_id for s in self.states)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "schema": self.schema,
            "name": self.name,
            "target": self.target,
            "defaultState": self.defaultState,
            "background": self.background,
            "fit": self.fit,
            "transition": self.transition.to_dict(),
            "ambient": self.ambient.to_dict(),
            "states": [s.to_dict() for s in self.states],
        }

    def to_json(self, *, indent: Optional[int] = 2) -> str:
        return json.dumps(self.to_dict(), indent=indent)


def normalize_hex(value: Any, field_name: str) -> str:
    """Normalise to 6-digit hex. The renderer builds the glow by appending an
    alpha suffix, so a short form or an rgb() value breaks the bloom."""
    if not isinstance(value, str):
        raise FacePackError("{} must be a hex colour string".format(field_name))
    v = value.strip()
    if _HEX6.match(v):
        return v.lower()
    if _HEX3.match(v):
        r, g, b = v[1], v[2], v[3]
        return "#{}{}{}{}{}{}".format(r, r, g, g, b, b).lower()
    raise FacePackError(
        "{} must be 3- or 6-digit hex, got {!r}".format(field_name, value)
    )


def _record(value: Any, field_name: str) -> Mapping[str, Any]:
    if not isinstance(value, Mapping):
        raise FacePackError("{} must be an object".format(field_name))
    return value


def _num(value: Any, field_name: str, fallback: float) -> float:
    if value is None:
        return fallback
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise FacePackError("{} must be a finite number".format(field_name))
    f = float(value)
    if f != f or f in (float("inf"), float("-inf")):
        raise FacePackError("{} must be a finite number".format(field_name))
    return f


def _pair(value: Any, field_name: str, fallback: Tuple[float, float]) -> Tuple[float, float]:
    if value is None:
        return fallback
    if not isinstance(value, (list, tuple)) or len(value) != 2:
        raise FacePackError("{} must be a pair of numbers".format(field_name))
    return (
        _num(value[0], "{}[0]".format(field_name), fallback[0]),
        _num(value[1], "{}[1]".format(field_name), fallback[1]),
    )


def _range(value: Any, field_name: str, fallback: Tuple[float, float]) -> Tuple[float, float]:
    """A pair that must additionally be ordered — for delay ranges, not [x, y]."""
    lo, hi = _pair(value, field_name, fallback)
    if hi < lo:
        raise FacePackError("{} max must be >= min".format(field_name))
    return (lo, hi)


def _one_of(value: Any, field_name: str, allowed: Sequence[str], fallback: str) -> str:
    if value is None:
        return fallback
    if not isinstance(value, str) or value not in allowed:
        raise FacePackError("{} must be one of {}".format(field_name, ", ".join(allowed)))
    return value


def _spring(value: Any, field_name: str, fallback: Spring) -> Spring:
    if value is None:
        return fallback
    r = _record(value, field_name)
    return Spring(
        stiffness=_num(r.get("stiffness"), field_name + ".stiffness", fallback.stiffness),
        damping=_num(r.get("damping"), field_name + ".damping", fallback.damping),
        mass=_num(r.get("mass"), field_name + ".mass", fallback.mass),
    )


def _normalize_eye(eye: Any, field_name: str) -> Dict[str, Any]:
    """Backfill fields added after a pack may have been written."""
    e = dict(_record(eye, field_name))
    e.setdefault("shape", "bar")
    e.setdefault("thickness", 16)
    return e


def _transition(t: Mapping[str, Any], target: str) -> Transition:
    """Keep a stated tween; give a target with no spring solver the default one,
    so an LVGL pack still describes motion the device can run."""
    spring = _spring(t.get("spring"), "pack.transition.spring", Spring())
    stated = t.get("durationMs") is not None or t.get("ease") is not None
    if not stated and target == DEFAULT_TARGET:
        return Transition(spring=spring)
    return Transition(
        spring=spring,
        durationMs=_num(t.get("durationMs"), "pack.transition.durationMs", DEFAULT_TWEEN_MS),
        ease=_one_of(t.get("ease"), "pack.transition.ease", EASINGS, DEFAULT_TWEEN_EASE),
    )


def parse_pack(data: Any) -> FacePack:
    raw = _record(data, "pack")

    if raw.get("schema") != SCHEMA_VERSION:
        raise FacePackError(
            "unsupported schema {!r}; this build reads schema {}".format(
                raw.get("schema"), SCHEMA_VERSION
            )
        )

    raw_states = raw.get("states")
    if not isinstance(raw_states, (list, tuple)) or len(raw_states) == 0:
        raise FacePackError("pack.states must be a non-empty array")

    seen: set = set()
    states: List[FaceState] = []
    for i, entry in enumerate(raw_states):
        r = _record(entry, "states[{}]".format(i))
        state_id = r.get("id")
        if not isinstance(state_id, str) or not state_id:
            raise FacePackError("states[{}].id must be a non-empty string".format(i))
        if state_id in seen:
            raise FacePackError("duplicate state id {!r}".format(state_id))
        seen.add(state_id)

        face = dict(_record(r.get("face"), "states[{}].face".format(i)))
        for part in ("left", "right"):
            face[part] = _normalize_eye(
                face.get(part), "states[{}].face.{}".format(i, part)
            )
        for part in ("leftBrow", "rightBrow"):
            face[part] = dict(
                _record(face.get(part), "states[{}].face.{}".format(i, part))
            )
        face["color"] = normalize_hex(
            face.get("color"), "states[{}].face.color".format(i)
        )

        label = r.get("label")
        states.append(
            FaceState(
                id=state_id,
                label=label if isinstance(label, str) and label else state_id,
                face=face,
            )
        )

    default_state = raw.get("defaultState")
    if not isinstance(default_state, str) or default_state not in seen:
        raise FacePackError(
            "pack.defaultState {!r} does not match any state id".format(default_state)
        )

    t = _record(raw.get("transition"), "pack.transition") if raw.get("transition") is not None else {}
    a = _record(raw.get("ambient"), "pack.ambient") if raw.get("ambient") is not None else {}
    blink = _record(a.get("blink"), "pack.ambient.blink") if a.get("blink") is not None else {}
    gaze = _record(a.get("gaze"), "pack.ambient.gaze") if a.get("gaze") is not None else {}

    d_blink = Blink()
    d_gaze = Gaze()

    name = raw.get("name")
    background = raw.get("background")
    target = _one_of(raw.get("target"), "pack.target", TARGETS, DEFAULT_TARGET)

    return FacePack(
        schema=SCHEMA_VERSION,
        name=name.strip() if isinstance(name, str) and name.strip() else "Untitled face",
        defaultState=default_state,
        background=DEFAULT_BACKGROUND
        if background is None
        else normalize_hex(background, "pack.background"),
        fit=_one_of(raw.get("fit"), "pack.fit", FITS, "contain"),
        target=target,
        transition=_transition(t, target),
        ambient=Ambient(
            blink=Blink(
                closeMs=_num(blink.get("closeMs"), "pack.ambient.blink.closeMs", d_blink.closeMs),
                closeEase=_one_of(
                    blink.get("closeEase"), "pack.ambient.blink.closeEase", EASINGS, d_blink.closeEase
                ),
                openMs=_num(blink.get("openMs"), "pack.ambient.blink.openMs", d_blink.openMs),
                openEase=_one_of(
                    blink.get("openEase"), "pack.ambient.blink.openEase", EASINGS, d_blink.openEase
                ),
                closedScale=_num(
                    blink.get("closedScale"), "pack.ambient.blink.closedScale", d_blink.closedScale
                ),
                everyMs=_range(blink.get("everyMs"), "pack.ambient.blink.everyMs", d_blink.everyMs),
            ),
            gaze=Gaze(
                mode=_one_of(gaze.get("mode"), "pack.ambient.gaze.mode", GAZE_MODES, d_gaze.mode),
                clamp=_pair(gaze.get("clamp"), "pack.ambient.gaze.clamp", d_gaze.clamp),
                retargetMs=_range(
                    gaze.get("retargetMs"), "pack.ambient.gaze.retargetMs", d_gaze.retargetMs
                ),
                spring=_spring(gaze.get("spring"), "pack.ambient.gaze.spring", d_gaze.spring),
            ),
        ),
        states=states,
    )


def load_pack(path: "str | Path") -> FacePack:
    p = Path(path)
    try:
        raw = json.loads(p.read_text(encoding="utf-8"))
    except FileNotFoundError:
        raise FacePackError("no such pack: {}".format(p))
    except json.JSONDecodeError as err:
        raise FacePackError("{} is not valid JSON: {}".format(p, err))
    return parse_pack(raw)
