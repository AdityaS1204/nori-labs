# Nori Face Pack — schema 1

A **face pack** is a single JSON file (`*.nori.json`) describing a robot face: a set of named
expression states plus the motion parameters that make the face feel alive. The playground exports
one; the `nori-face` Python SDK renders it on the robot.

This document is the normative reference. It should be enough to write an independent renderer.

Canonical implementation: [`lib/face-pack.ts`](../lib/face-pack.ts) (`parsePack`, `presetToPack`).

---

## Coordinate space

Everything is in **viewBox units**: a landscape box of **440 x 320**, origin top-left. The face
centre is `(220, 160)`. There is deliberate headroom above the eyes so brows stay in frame when the
eyes are tall.

`fit` decides how that box maps onto the physical panel:

| `fit` | Meaning |
|---|---|
| `contain` | Scale to fit, preserving aspect ratio; letterbox the remainder (default) |
| `cover` | Scale to fill, preserving aspect ratio; crop the overflow |
| `stretch` | Scale both axes independently to fill exactly |

On the official 7" Raspberry Pi DSI panel (800x480, ratio 1.667) against the face box (ratio 1.375),
`contain` letterboxes horizontally. Because the bars are the same colour as `background`, this is
invisible in practice.

---

## Top level

```json
{
  "schema": 1,
  "name": "Nori default",
  "target": "web",
  "defaultState": "neutral",
  "background": "#000000",
  "fit": "contain",
  "transition": { "spring": { "stiffness": 300, "damping": 30, "mass": 0.6 } },
  "ambient": { "blink": { "...": "" }, "gaze": { "...": "" } },
  "states": [{ "id": "neutral", "label": "Neutral", "face": { "...": "" } }]
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `schema` | `1` | yes | Exact match. A reader must refuse any other value rather than guess. |
| `name` | string | no | Display name. Blank or missing becomes `"Untitled face"`. |
| `target` | `"web"` \| `"lvgl"` | no | Engine the pack was authored for. Default `web`. See [Render targets](#render-targets). |
| `defaultState` | string | yes | Must equal some `states[].id`. Shown at boot. |
| `background` | hex string | no | Screen colour behind the face. Default `#000000`. |
| `fit` | enum above | no | Default `contain`. |
| `transition` | object | no | Defaults below. |
| `ambient` | object | no | Defaults below. |
| `states` | array | yes | At least one entry; ids unique. |

**Colours** are `#rgb` or `#rrggbb`. A reader must expand `#rgb` to `#rrggbb`: the reference
renderer builds the eye glow by appending an alpha suffix to the colour string, so a short form or
a `rgb()` value breaks the bloom. Named colours and `rgb()` are invalid.

**Unknown fields** should be ignored, so additive changes stay backward compatible.
**Malformed known fields must throw** rather than silently fall back — a bad pack should fail before
it reaches a robot. Missing optional fields do fall back to the defaults below.

---

## `transition`

Applied when morphing from one state to another. The reference renderer springs eye geometry,
placement, openness, tilt and brow position simultaneously.

```json
{ "spring": { "stiffness": 300, "damping": 30, "mass": 0.6 }, "durationMs": 220, "ease": "easeInOut" }
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `spring` | object | no | Default `{300, 30, 0.6}`. Used by a renderer that solves springs. |
| `durationMs` | number | no | Tween length. **When present it wins over `spring`.** |
| `ease` | `linear` \| `easeIn` \| `easeOut` \| `easeInOut` | no | Tween curve. Default `easeInOut`. |

Snapping between poses reads as broken, so a transition is not optional behaviour. A renderer that
cannot spring eases over `durationMs` instead; a pack with `target: "lvgl"` always carries one.
`spring` is written either way, so a browser reading an LVGL pack still has tuned motion.

---

## `ambient`

Continuous, involuntary motion that runs **underneath** whatever state is active. This is most of
what makes a face read as alive rather than as a static image, and it must not stop while a state
is held.

```json
{
  "blink": {
    "closeMs": 70,
    "closeEase": "easeIn",
    "openMs": 130,
    "openEase": "easeOut",
    "closedScale": 0.06,
    "everyMs": [2500, 6000]
  },
  "gaze": {
    "mode": "random",
    "clamp": [24, 16],
    "retargetMs": [650, 2850],
    "spring": { "stiffness": 140, "damping": 18, "mass": 0.6 }
  }
}
```

**`blink`** — a shared vertical scale applied to both eyes together, about each eye's centre. Close
to `closedScale` over `closeMs` with `closeEase`, open back to `1` over `openMs` with `openEase`,
then wait a delay drawn uniformly from `everyMs` before repeating. `closedScale` is a sliver rather
than `0` so a closed eye stays visible as a line.

**`gaze`** — a shared positional offset applied to the eyes and brows.
- `off`: hold centred.
- `random`: every delay drawn from `retargetMs`, pick a new target uniformly over the ellipse with
  semi-axes `clamp`, and spring to it. Sample radius as `sqrt(random())` for a uniform distribution
  over the disc, otherwise glances cluster in the centre.

`clamp` is **`[x, y]` — not a `[min, max]` range**, so its second value is normally smaller than its
first. Validate it as an unordered pair. `everyMs` and `retargetMs` *are* ranges and must be
ordered.

`easeIn` / `easeOut` / `easeInOut` / `linear` are the four permitted easings.

**Accessibility note:** a renderer embedded in a general-purpose browser should respect
`prefers-reduced-motion` and suspend ambient motion. A renderer driving a robot's own face should
**not** — the reference kiosk explicitly overrides it, because a robot whose face never blinks looks
broken rather than calm.

---

## `states[]`

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | Unique within the pack. This is what robot code names: `face.set("happy")`. |
| `label` | string | no | Human label. Defaults to `id`. |
| `face` | object | yes | See below. |

Ids are slugs derived from the playground's labels (`"Deep Thinking"` becomes `"deep-thinking"`),
de-duplicated with a numeric suffix. Export is one-way: a pack does not convert back into a
playground preset.

### `face`

```json
{
  "color": "#eaf3ff",
  "glow": 1,
  "gap": 150,
  "left":  { "...": "" },
  "right": { "...": "" },
  "browsEnabled": false,
  "leftBrow":  { "...": "" },
  "rightBrow": { "...": "" }
}
```

| Field | Type | Notes |
|---|---|---|
| `color` | hex | Eye and brow fill, and the glow colour. |
| `glow` | number | Bloom multiplier. `0` is flat. The reference renderer stacks two drop-shadows at `6 * glow` and `16 * glow` pixels, the second at `aa` alpha. |
| `gap` | number | Distance between eye centres. Eye centres sit at `220 -/+ gap / 2`. |
| `browsEnabled` | bool | When false, both brows are omitted entirely. Nori's neutral face has no brows. |

The face has **no mouth**. Emotion is carried entirely by eye geometry.

### Eye (`left`, `right`)

| Field | Type | Notes |
|---|---|---|
| `shape` | `bar` \| `circle` \| `oval` \| `arc` \| `angle` \| `custom` | Silhouette. |
| `width`, `height` | number | Size at full openness. |
| `radius` | number | Corner radius; `width / 2` gives a stadium. `bar` only. |
| `openness` | 0..1 | Vertical scale, for squints. Multiplies with blink. |
| `tilt` | degrees | Rotation about the eye centre. |
| `offsetY` | number | Vertical offset from the centre line. |
| `thickness` | number | Stroke weight. `arc` and `angle` only. |
| `customSvg` | string | `custom` only. See capabilities. |
| `customViewBox` | `[x, y, w, h]` | `custom` only. The markup's own coordinate box. |

Rendering rules:
- `bar` is an axis-aligned rounded rectangle. Its drawn height is
  `max(width * 0.2, height * openness)` — a floor, so a nearly-closed eye stays a visible slit — and
  its effective radius is `min(radius, width / 2, drawnHeight / 2)`.
- `circle` uses the **smaller** half-axis of `width`/`height` so it stays circular.
- `oval` is the full `width` x `height` ellipse.
- `arc` is an upward dome, stroked at `thickness` with round caps.
- `angle` is a chevron, stroked at `thickness` with round caps.
- `angle` and `custom` are **directional**: mirror them horizontally on the right eye so the pair
  reads symmetric. `bar`, `circle`, `oval` and `arc` are not mirrored.
- `openness` applies as a vertical scale with a floor of `0.04` for path shapes, `0.02` for the
  group transform.

Fields marked for a single shape are ignored by the others. A legacy pack may omit `shape` and
`thickness`; a reader should backfill `"bar"` and `16`. The deprecated `customPath` and
`customStroke` fields may appear on very old data and should be ignored.

### Brow (`leftBrow`, `rightBrow`)

| Field | Type | Notes |
|---|---|---|
| `length` | number | Horizontal length. |
| `thickness` | number | Bar thickness. |
| `radius` | number | End-cap radius, clamped to `thickness / 2`. |
| `arc` | number | Upward bow of both edges; negative bows down. |
| `tilt` | degrees | **Mirrored on the right brow**, so a positive tilt reads symmetric. |
| `offsetY` | number | Float height above the eye's top edge. |

Brow centre Y is `160 + eye.offsetY - eye.height / 2 - brow.offsetY`, clamped to a minimum of
`brow.thickness / 2 + max(0, brow.arc) + 14` so neither the bar, its arc, nor its glow leaves the
viewBox.

---

## Render targets

`target` names the engine the pack was posed for, so a reader knows which parameters to trust.

| `target` | Engine | Glow | `shape: "custom"` | Motion |
|---|---|---|---|---|
| `web` | Chromium + SVG (the kiosk renderer) | yes | yes | spring |
| `lvgl` | LVGL on the device, no shader stage | no — `glow` is `0` | no | tween (`durationMs` + `ease`) |

An `lvgl` pack is **already clamped by the writer**: `glow` is `0`, every eye uses a shape LVGL can
rasterise (`bar`, `circle`, `oval`, `arc`, `angle`), no `customSvg` is present, and geometry is
snapped to whole units because LVGL addresses integer pixels. A reader should nonetheless re-clamp
on load, since a pack can be hand-edited.

Because `target` is additive, a reader that predates it treats every pack as `web` — which is safe:
an `lvgl` pack carries no field such a reader would mishandle, only fewer of them.

Budget roughly **30fps on the device** against 60 in the browser, so prefer shape animation over
image or Lottie frames, which eat memory on a robot.

---

## Capabilities

`shape: "custom"` carries **raw SVG markup** in `customSvg`, rendered as-is and merely sized and
posed by the eye params — its own fills, gradients and strokes win, so `color`, `radius` and
`thickness` do not apply to it.

This is the one browser-coupled field in the format. A renderer that cannot execute SVG must
**declare `custom` unsupported and refuse the pack** rather than approximate it — which is why an
`lvgl` pack never carries one. Markup from an
untrusted author must be sanitised before rendering; the reference renderer runs it through
DOMPurify with the SVG profile.

Everything else in the format is plain geometry and is portable to any 2D rasteriser.

---

## Versioning

`schema` is a single integer with no minor component.

- Adding an optional field with a safe default is **not** a version bump; readers ignore unknown
  fields and writers keep emitting `1`.
- Removing or repurposing a field, or changing a default's meaning, bumps to `2`.

Planned for a future version, shaped so it can arrive additively: per-state `transition` overrides,
and a `clip` keyframe track so a state can be a short animation (anticipation, peak, settle) rather
than a single pose.
