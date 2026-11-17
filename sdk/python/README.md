# nori-face

Render [Nori](../../README.md) face packs on a robot's display.

Design a face in the Nori playground, export it as a `.nori.json` **face pack**, and this SDK
renders it on the robot — using the playground's own renderer, so what the designer saw is what
the robot shows.

```bash
pip install nori-face
```

## Quick start

```python
from nori_face import Face

face = Face.from_file("mood.nori.json")
face.start()                      # serves the renderer, opens Chromium in kiosk mode

face.set("curious")               # persistent mood, holds until changed
face.play("surprised", hold=0.8)  # transient reaction, reverts to "curious" on its own

face.close()
```

`Face` is also a context manager:

```python
with Face.from_file("mood.nori.json") as face:
    face.start()
    face.set("happy")
```

### Developing without a robot

```python
face.start(browser=False)
print(face.url)   # open this in any browser
```

## What this SDK is and is not

It owns two things:

- **Rendering** — the pose, the transition between poses, and the ambient life (blinking, gaze
  drift) that makes a face read as alive rather than as a static image.
- **Arbitration** — a persistent base mood, plus transient reactions that revert on their own so a
  startle cannot strand the robot looking startled forever.

It deliberately does **not** decide *when* to be happy. That belongs in your robot's own behaviour
code — a state machine, a behaviour tree, an LLM, whatever fits. The SDK's whole surface is
`face.set("happy")`.

```
your sensors  ──▶  your behaviour code  ──▶  face.set("happy")  ──▶  the panel
                   (when to feel what)        (this SDK)
```

## API

| Call | Effect |
|---|---|
| `Face.from_file(path)` | Load and validate a pack. |
| `Face.from_dict(data)` | Same, from parsed JSON. |
| `face.start(browser=True, http_port=0, ws_port=8765)` | Serve the renderer; launch Chromium unless `browser=False`. Pass a string to name a specific browser binary. |
| `face.set(state, priority=0)` | Set the persistent mood. |
| `face.play(state, hold=0.8, priority=1)` | Show a reaction for `hold` seconds, then revert. Returns `False` if outranked. |
| `face.current` / `face.mood` | What is on screen / the base mood underneath it. |
| `face.states` | State ids in the pack. |
| `face.describe()` | Everything above, as a dict. |
| `face.close()` | Stop the browser and both servers. |

Priorities arbitrate between a reaction and a mood change: a `play` at priority 2 stays on screen
through a `set` at priority 0, and the new mood lands when the reaction ends.

## Command line

```bash
nori-face preview mood.nori.json          # serve and open it
nori-face preview mood.nori.json --no-browser
nori-face pull <preset-id> --origin https://your-nori-host
nori-face info mood.nori.json             # validate and summarise
nori-face install mood.nori.json --user pi --dry-run
```

## On a Raspberry Pi

Targets a DSI panel on a Pi 3 or newer (Chromium needs ≥1GB RAM).

```bash
pip install nori-face
nori-face pull <preset-id> --origin https://your-nori-host --out /home/pi/face.nori.json
sudo nori-face install /home/pi/face.nori.json --user pi
sudo systemctl daemon-reload
sudo systemctl enable --now nori-face
```

The unit disables screen blanking and DPMS, and the renderer hides the cursor. Raspberry Pi OS
**Lite** ships no display stack, so install one first (X11 + openbox, or `cage` on Wayland).

The pack is read from disk, so the face comes up with no network at all. Use `nori-face pull` at
build or deploy time, not at boot.

## Notes

- The pack is validated on load. A malformed pack raises `FacePackError` immediately rather than
  rendering a wrong face on a robot.
- If `pack.json` ever fails to load in the browser, the renderer falls back to a neutral face and
  reconnects forever — a blank or stuck panel reads as a broken robot.
- Building from a source checkout requires the renderer bundle: run `bun run build:renderer` from
  the repo root first.

Format reference: [`docs/face-pack-v1.md`](../../docs/face-pack-v1.md).
