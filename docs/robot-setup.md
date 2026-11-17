# Running a Nori face on a Raspberry Pi

How to get a face pack onto a robot's DSI panel and keep it there across reboots.

See also: [`docs/face-pack-v1.md`](face-pack-v1.md) (the format) and
[`sdk/python/README.md`](../sdk/python/README.md) (the SDK).

---

## What runs where

```
┌─ Raspberry Pi ──────────────────────────────────────────┐
│                                                          │
│  your robot code ──▶ nori_face.Face                      │
│                        ├── http  :NNNNN  bundle+pack     │
│                        └── ws    :8765   expression cmds │
│                                   ▲                      │
│                        chromium --kiosk                  │
│                                   │                      │
│                             DSI panel                    │
└──────────────────────────────────────────────────────────┘
```

Everything is local. The pack is read from disk and the renderer is served from
localhost, so the face comes up with **no network at all**. Pull packs at deploy
time, never at boot — a robot whose face shows a connection error is a broken robot.

## Hardware

- **Pi 3 or newer**, ≥1GB RAM. Chromium will not run acceptably below that.
- A **DSI panel** (the official 7" is 800×480). HDMI works identically.
- The face viewBox is 440×320 (ratio 1.375); an 800×480 panel is 1.667, so the
  default `fit: "contain"` letterboxes left and right. The bars are the same black as
  the background, so this is invisible. Only reach for `cover` or `stretch` if your
  panel is far from 4:3.

## OS and display stack

Chromium needs a display server. **Raspberry Pi OS Lite ships none**, so pick one:

| Image | What to do |
|---|---|
| Pi OS **Desktop** (simplest) | Nothing. Enable auto-login with `sudo raspi-config` → System Options → Boot / Auto Login → Desktop Autologin. |
| Pi OS **Lite**, X11 | `sudo apt install --no-install-recommends xserver-xorg x11-xserver-utils xinit openbox chromium-browser` |
| Pi OS **Lite**, Wayland (Bookworm, Pi 4/5) | `sudo apt install --no-install-recommends cage chromium-browser` and run the service under `cage -- ...` |

The shipped unit targets the X11 path (it sets `DISPLAY=:0` and calls `xset`). On
Wayland, drop the `xset` line — blanking is handled by the compositor instead.

## Install

```bash
sudo apt install -y python3-pip chromium-browser
pip install nori-face

# Fetch the face the designer exported, once, at deploy time.
nori-face pull <preset-id> --origin https://your-nori-host --out /home/pi/face.nori.json

# Or copy a .nori.json exported from the playground's Export button.
nori-face info /home/pi/face.nori.json     # validates it before you rely on it

sudo nori-face install /home/pi/face.nori.json --user pi
sudo systemctl daemon-reload
sudo systemctl enable --now nori-face
```

`nori-face install --dry-run` prints the unit without writing it, which is worth
doing first.

## Driving it from your robot code

Run the face in your own process instead of the service when your robot code owns
the lifecycle:

```python
from nori_face import Face

face = Face.from_file("/home/pi/face.nori.json")
face.start()

face.set("curious")
face.play("surprised", hold=0.8)
```

Expressions are **commanded, not inferred**. Deciding that a bump means "surprised"
is your behaviour code's job; the SDK only renders what it is told. A minimal
version of that layer:

```python
def on_event(event):
    if event == "bump":        face.play("surprised", hold=0.8, priority=2)
    elif event == "charging":  face.set("sleepy")
    elif event == "idle":      face.set("neutral")
```

If you already run ROS 2, subscribe to a topic and call `face.set` in the callback;
nothing in the SDK assumes otherwise.

## Troubleshooting

**Black screen, no face.** Check the service: `journalctl -u nori-face -f`. If it
reports the bundle is missing, the wheel was built without it — build the renderer
(`bun run build:renderer`) before packaging.

**The face is frozen — no blinking, no eye movement.** The browser is reporting
`prefers-reduced-motion`. The kiosk renderer passes `forceMotion` to override this
exactly so the robot keeps blinking; if you embedded the renderer yourself, pass it
too. A face that never blinks reads as crashed, not calm.

**Screen goes dark after a few minutes.** Blanking or DPMS. The unit runs
`xset s off -dpms s noblank`; confirm it actually took effect with `xset q`. On
Wayland, use the compositor's own setting.

**A mouse cursor sits on the face.** The renderer sets `cursor: none`, which covers
the page. For the X root window, also install `unclutter`.

**Panel is upside down.** That is an OS-level concern, not a pack field. Set
`display_rotate` / `video=` in `/boot/firmware/config.txt`, or use `wlr-randr` on
Wayland.

**Chromium shows a "restore pages" bar after a hard power-off.** The SDK launches
with an isolated, throwaway profile and `--disable-session-crashed-bubble`, so this
should not appear. If it does, confirm nothing else is launching Chromium with the
default profile.

**Expression changes do nothing.** Check the websocket port matches. The service
passes `--ws-port`, and the page connects to the `?ws=` port in its URL. The page
reconnects forever with backoff, so restarting the SDK is safe — the face resyncs
to the current state on reconnect.

## Updating a face

```bash
nori-face pull <preset-id> --origin https://your-nori-host --out /home/pi/face.nori.json
sudo systemctl restart nori-face
```

The pack is validated before it is written, so a broken export cannot replace a
working face on disk.
