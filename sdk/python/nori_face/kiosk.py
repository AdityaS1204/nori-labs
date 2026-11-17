"""Locating and launching Chromium in kiosk mode."""

from __future__ import annotations

import logging
import os
import shutil
import subprocess
import sys
from pathlib import Path
from typing import List, Optional

log = logging.getLogger("nori_face")

# Raspberry Pi OS ships `chromium-browser`; Debian and most desktops use `chromium`.
BROWSER_CANDIDATES = (
    "chromium-browser",
    "chromium",
    "google-chrome-stable",
    "google-chrome",
    "chrome",
)

_WINDOWS_FALLBACKS = (
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
)


class BrowserNotFound(RuntimeError):
    pass


def find_browser(explicit: Optional[str] = None) -> str:
    if explicit:
        if shutil.which(explicit) or Path(explicit).exists():
            return explicit
        raise BrowserNotFound("no such browser: {}".format(explicit))

    for name in BROWSER_CANDIDATES:
        found = shutil.which(name)
        if found:
            return found

    if sys.platform == "win32":
        for path in _WINDOWS_FALLBACKS:
            if Path(path).exists():
                return path

    raise BrowserNotFound(
        "could not find Chromium. Install it (`sudo apt install chromium-browser`), "
        "pass browser=..., or run with browser=False and open the URL yourself."
    )


def kiosk_flags(url: str, profile_dir: Path) -> List[str]:
    """Flags for an unattended robot face: no chrome, no prompts, no updates."""
    return [
        "--kiosk",
        "--app={}".format(url),
        "--user-data-dir={}".format(profile_dir),
        "--no-first-run",
        "--no-default-browser-check",
        "--noerrdialogs",
        "--disable-infobars",
        "--disable-session-crashed-bubble",
        "--disable-features=TranslateUI,Translate",
        "--disable-pinch",
        "--overscroll-history-navigation=0",
        "--hide-scrollbars",
        "--autoplay-policy=no-user-gesture-required",
        # A face that pops an update prompt mid-interaction is worse than a stale build.
        "--check-for-update-interval=31536000",
        "--disable-component-update",
    ]


def launch(url: str, profile_dir: Path, browser: Optional[str] = None) -> subprocess.Popen:
    exe = find_browser(browser)
    profile_dir.mkdir(parents=True, exist_ok=True)
    argv = [exe] + kiosk_flags(url, profile_dir)
    log.debug("launching %s", " ".join(argv))
    return subprocess.Popen(
        argv,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        start_new_session=os.name != "nt",
    )
