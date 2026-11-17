"""Render Nori face packs on a robot's display.

    from nori_face import Face

    face = Face.from_file("mood.nori.json")
    face.start()
    face.set("curious")
    face.play("surprised", hold=0.8)
    face.close()
"""

from .face import BundleMissing, Face
from .pack import (
    SCHEMA_VERSION,
    Ambient,
    Blink,
    FacePack,
    FacePackError,
    FaceState,
    Gaze,
    Spring,
    Transition,
    load_pack,
    parse_pack,
)

__version__ = "0.1.0"

__all__ = [
    "Ambient",
    "Blink",
    "BundleMissing",
    "Face",
    "FacePack",
    "FacePackError",
    "FaceState",
    "Gaze",
    "SCHEMA_VERSION",
    "Spring",
    "Transition",
    "__version__",
    "load_pack",
    "parse_pack",
]
