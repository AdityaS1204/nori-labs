"""``nori-face`` command line: preview a pack, pull one from the playground,
and install the boot service on a robot."""

from __future__ import annotations

import argparse
import json
import logging
import signal
import sys
import threading
import urllib.error
import urllib.request
from pathlib import Path
from typing import List, Optional

from .face import BUNDLE_DIR, Face
from .pack import FacePackError, load_pack, parse_pack

DEFAULT_ORIGIN = "http://localhost:3000"
SERVICE_TEMPLATE = Path(__file__).resolve().parent / "systemd" / "nori-face.service.tmpl"


def _preview(args: argparse.Namespace) -> int:
    face = Face.from_file(args.pack)
    face.start(browser=False if args.no_browser else True, ws_port=args.ws_port)

    print("pack:   {} ({} states)".format(face.pack.name, len(face.pack.states)))
    print("states: {}".format(", ".join(face.states)))
    print("url:    {}".format(face.url))
    if args.no_browser:
        print("\nOpen that URL in any browser. Ctrl-C to stop.")
    if args.state:
        face.set(args.state)
        print("showing: {}".format(args.state))

    stop = threading.Event()
    signal.signal(signal.SIGINT, lambda *_: stop.set())
    try:
        stop.wait()
    finally:
        face.close()
    return 0


def _pull(args: argparse.Namespace) -> int:
    url = "{}/api/packs/{}".format(args.origin.rstrip("/"), args.id)
    try:
        with urllib.request.urlopen(url, timeout=args.timeout) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as err:
        print("error: {} returned {}".format(url, err.code), file=sys.stderr)
        return 1
    except (urllib.error.URLError, TimeoutError) as err:
        print("error: could not reach {}: {}".format(url, err), file=sys.stderr)
        return 1

    # Validate before writing, so a broken pack never lands on disk.
    pack = parse_pack(payload)
    out = Path(args.out) if args.out else Path("{}.nori.json".format(args.id))
    out.write_text(pack.to_json(), encoding="utf-8")
    print("wrote {} ({} states: {})".format(out, len(pack.states), ", ".join(pack.state_ids)))
    return 0


def _install(args: argparse.Namespace) -> int:
    pack_path = Path(args.pack).resolve()
    load_pack(pack_path)  # fail now rather than at boot

    unit = SERVICE_TEMPLATE.read_text(encoding="utf-8").format(
        user=args.user,
        python=sys.executable,
        pack=pack_path,
        ws_port=args.ws_port,
    )

    out = Path(args.out) if args.out else Path("/etc/systemd/system/nori-face.service")
    if args.dry_run:
        print(unit)
        return 0

    try:
        out.write_text(unit, encoding="utf-8")
    except PermissionError:
        print("error: cannot write {} (try sudo)".format(out), file=sys.stderr)
        return 1

    print("wrote {}".format(out))
    print("\nNext:")
    print("  sudo systemctl daemon-reload")
    print("  sudo systemctl enable --now nori-face")
    print("\nThe unit disables screen blanking and hides the cursor. On Raspberry Pi")
    print("OS Lite you must also install a display stack (X11 + openbox, or cage).")
    return 0


def _info(args: argparse.Namespace) -> int:
    pack = load_pack(args.pack)
    print("name:         {}".format(pack.name))
    print("schema:       {}".format(pack.schema))
    print("default:      {}".format(pack.defaultState))
    print("fit:          {}".format(pack.fit))
    print("background:   {}".format(pack.background))
    print("states:       {}".format(", ".join(pack.state_ids)))
    print("bundle:       {}".format("present" if (BUNDLE_DIR / "index.html").exists() else "MISSING"))
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="nori-face", description=__doc__)
    parser.add_argument("-v", "--verbose", action="store_true", help="debug logging")
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("preview", help="serve a pack and open it")
    p.add_argument("pack", help="path to a .nori.json pack")
    p.add_argument("--no-browser", action="store_true", help="do not launch Chromium")
    p.add_argument("--ws-port", type=int, default=8765)
    p.add_argument("--state", help="state to show instead of the pack default")
    p.set_defaults(func=_preview)

    p = sub.add_parser("pull", help="download a pack from the playground")
    p.add_argument("id", help="preset id")
    p.add_argument("--origin", default=DEFAULT_ORIGIN)
    p.add_argument("--out", help="output path (default: <id>.nori.json)")
    p.add_argument("--timeout", type=float, default=10.0)
    p.set_defaults(func=_pull)

    p = sub.add_parser("install", help="write the systemd unit for boot")
    p.add_argument("pack", help="path to the pack the robot should boot with")
    p.add_argument("--user", default="pi")
    p.add_argument("--ws-port", type=int, default=8765)
    p.add_argument("--out", help="unit path (default: /etc/systemd/system/nori-face.service)")
    p.add_argument("--dry-run", action="store_true", help="print the unit instead")
    p.set_defaults(func=_install)

    p = sub.add_parser("info", help="validate a pack and summarise it")
    p.add_argument("pack")
    p.set_defaults(func=_info)

    return parser


def main(argv: Optional[List[str]] = None) -> int:
    args = build_parser().parse_args(argv)
    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.WARNING,
        format="%(levelname)s %(name)s: %(message)s",
    )
    try:
        return int(args.func(args))
    except FacePackError as err:
        print("error: {}".format(err), file=sys.stderr)
        return 2
    except KeyboardInterrupt:
        return 130


if __name__ == "__main__":
    raise SystemExit(main())
