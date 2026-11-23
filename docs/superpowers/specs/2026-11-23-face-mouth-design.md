# Design — Face mouth + posed expressions

Date: 2026-11-23
Status: approved

## Intent & why

The Nori face currently expresses emotion through eye geometry alone — the model
is explicitly "a dark screen with two glowing rounded-rectangle eyes and no
mouth" (`lib/nori-face.ts`). We're adding an **optional mouth** so authors can
reach a wider emotional range (smile, frown, surprise, open "talking" mouth),
and shipping a set of **default posed expressions** (Happy, Surprised, Angry, …)
that pose eyes *and* mouth together, reachable from the existing "add state"
menu.

The mouth is modeled so one flexible shape covers the core range: a rounded
rectangle that flattens to a line (neutral), bows up into a smile, down into a
frown, and opens tall for an open mouth — plus two more curated shapes for
range.

## Goals

- A mouth element in the face model, renderer (static + live), controls, target
  gating, and export — consistent with how eyebrows already work.
- Mouth is **off by default** (toggle like brows); the neutral/resting face
  stays eyes-only, true to the robot today.
- A small curated set of **mouth-relevant shapes**: `line` (bowed bar:
  line↔smile↔frown↔open), `arc` (stroke smile/frown), `oval` (open mouth / "O").
- **Posed default expressions**: picking a suggested label (Happy, Surprised,
  Angry, Sleepy, Thinking, Error, Idle) seeds a posed face (eyes + mouth, brows
  where apt) instead of neutral. Custom names still seed neutral.
- **Back-compat**: old DB presets and exported face packs keep loading — the
  mouth defaults in when absent. Pack schema stays v1 (additive, same precedent
  as the `target` field).
- LVGL parity: every mouth shape is LVGL-drawable (rounded rect / arc / ellipse);
  mouth geometry integer-snaps for LVGL like the rest of the face.

## Non-goals

- No new eye shapes, no change to existing eye/brow behavior.
- No separate "expression gallery" UI — posed expressions reuse `SUGGESTED_LABELS`
  + `StatePicker`.
- No new pack schema version; no change to the pack's motion/ambient blocks.
- No spring-interpolation of the mouth's **curve/shape** between states beyond
  what eyebrows already do (see Known limitation).

## Anti-goals (would make this a failure even if it "works")

- Breaking load of any existing saved preset or previously exported `.nori.json`
  pack.
- Making the default/neutral robot face show a mouth it didn't have before.
- A mouth that previews in Web but silently can't be drawn by LVGL.

## Constraints

- `NoriFaceParams` is the shared model for DB rows, the renderer, and packs, so
  any field added must be defaulted everywhere a face is read from storage
  (`preset-row.normalizeStates`, `face-pack.parsePack`).
- `faceForTarget` is the single clamp on the way to preview + export; the mouth
  must pass through it (integer-snap under LVGL).
- The live renderer springs element *placement*; shape paths are recomputed per
  render (not path-morphed). The mouth matches this.

## Approaches considered

- **A1 — Dedicated mouth reusing the eyebrow "bowed bar" math. (CHOSEN)**
  A `mouth` + `mouthEnabled` on the face, a mouth-specific shape set and params,
  with the primary `line` shape built by the same bowed-rounded-bar method as
  `buildBrowPath`. Reuses the one proven piece that already does
  "rectangle that bows into a smile", stays consistent with the Eyebrows
  controls, LVGL-safe. Chosen.
- **A2 — Make the mouth a third "eye" reusing the whole `EyeShape` system.**
  Rejected: eye shapes (circle, angle bracket, custom SVG) and params (openness,
  radius) don't map to a mouth; would hide half the controls and bend an eye into
  a mouth.
- **A3 — Fully bespoke mouth with hand-built shapes (grin, teeth…).**
  Rejected: most new code and a second parallel shape/animation system for
  marginal gain over A1.

## Design (the decided how)

### 1. Data model (`lib/nori-face.ts`)

Add:

```ts
export type MouthShape = "line" | "arc" | "oval";

export interface NoriMouthParams {
  width: number;       // mouth length
  height: number;      // body height of `line` (tall = block, small = line); opening of `oval`
  radius: number;      // corner radius of the bar ends (`line`)
  curve: number;       // + = smile (bows up), − = frown (bows down), 0 = flat
  thickness: number;   // stroke weight — `arc` only (like the eye's weight)
  offsetY: number;     // vertical position in the lower face
  shape: MouthShape;
}
```

This maps your description exactly: the `line` shape is a filled rounded
rectangle — **decrease `height` → it becomes a straight line; raise `curve` → it
bows into a smile** (negative = frown). `thickness` is only the stroke weight for
the open `arc` shape (shown just like the eye's weight field), not used by `line`.

On `NoriFaceParams`, add `mouthEnabled: boolean` and `mouth: NoriMouthParams`
(placed after the brows). Add `NEUTRAL_MOUTH` (a flat, centered thin line in the
lower third) and set `NEUTRAL_FACE.mouthEnabled = false`, `mouth: NEUTRAL_MOUTH`.

- `MOUTH_SHAPES: MouthShapeDef[]` (id/label/mode/glyph) for the picker, mirroring
  `EYE_SHAPES`. `line` = fill, `arc` = stroke, `oval` = fill.
- `buildMouthPath(mouth)` — `line` reuses the bowed-bar construction from
  `buildBrowPath`, mapping width→length, height→thickness(bar body),
  curve→arc, radius→radius (so a thin height is a flat line, a positive curve a
  smile); `arc` returns an open quadratic stroke (like the eye `arc`), stroked at
  `thickness`; `oval` returns a width×height ellipse.
- `mouthCenterY(mouth)` — baseline in the lower third of the viewBox, offset by
  `mouth.offsetY`, clamped to stay inside the viewBox (analogous to
  `browCenterY`).

### 2. Clone & defaults

- `presets.cloneFace` clones `mouth` (`mouth: { ...f.mouth }`) so states never
  alias.
- `preset-row.normalizeStates` gets a `normalizeFace` that backfills
  `mouthEnabled ?? false` and `mouth ?? NEUTRAL_MOUTH` (and keeps the existing
  eye backfill). This covers both DB rows and (via `parsePack`) packs.

### 3. Rendering

- `NoriFace.tsx` (static): a `Mouth` subcomponent drawn after the brows when
  `face.mouthEnabled`, using `buildMouthPath` + `mouthCenterY`, filled or stroked
  per shape mode. Inside the same glow group.
- `NoriFaceLive.tsx`: a `LiveMouth` mirroring `LiveBrow` — a `motion.g` that
  springs `x`/`y`/`rotate` (placement), with the path `d` recomputed from params.
  Rendered when `mouthEnabled`, inside the gaze group (so the mouth travels with
  the face), after the brows.

### 4. Controls

- `faceFields.ts`: `MouthFieldKey` + `MOUTH_FIELDS` core = width, height/"Height",
  radius/"Corner radius", curve/"Smile", offsetY; plus a separate
  `MOUTH_THICKNESS_FIELD` ("Weight") shown only for the `arc` shape (exactly like
  `EYE_THICKNESS_FIELD`). Ranges TBD-by-builder within sensible bounds; all fields
  LVGL-safe.
- `FaceControls.tsx`: a new `ControlSection title="Mouth"` after Eyebrows with a
  "Show mouth" `Toggle` (→ `onToggleMouth`), a `ShapePicker` over `MOUTH_SHAPES`,
  and the mouth sliders (the "Weight" field shown only for `arc`; `radius`/`curve`
  apply to `line`). Shape picker reuses the existing `ShapePicker` pattern.
- `ExpressionEditor.tsx`: `onToggleMouth`, `onMouthChange(key,value)`,
  `onMouthShapeChange(shape)` via `patchFace` (mouth is a single element, no
  left/right split).

### 5. Target gating & export

- `render-target.ts`: `faceForTarget` includes `mouthEnabled` and a
  `mouthForTarget(mouth, caps)` that integer-snaps numeric fields under LVGL;
  web path passes the face through unchanged (mouth included). All mouth shapes
  are in the LVGL set, so `droppedShapeIn` and the LVGL notice are unaffected.
- `face-pack.ts`: `parsePack` stays additive — `mouth` is optional; the existing
  `normalizeStates(migrated)` call backfills it, and `faceForTarget` clamps it.
  `presetToPack` needs no change (mouth rides inside the face). Schema stays `1`.

### 6. Posed default expressions

- New `lib/face-poses.ts`: `POSES: Partial<Record<SuggestedLabel, NoriFaceParams>>`
  — authored full faces for **Happy, Surprised, Angry, Sleepy, Thinking, Error,
  Idle** (eyes + mouth, brows where apt). `Neutral` stays the eyes-only
  `NEUTRAL_FACE`. A `poseFor(label)` returns the posed face or `NEUTRAL_FACE`.
- Wire-up: `StatePicker.onAdd` / `ExpressionEditor.addState` seed the posed face
  for a suggested label, neutral for a custom name. `presets.newState` gains an
  optional `face` (already supports it) — pass `poseFor(label)`.

### 7. Tests

- `nori-face`: `NEUTRAL_FACE` has `mouthEnabled:false` + a mouth; `buildMouthPath`
  flat vs smile vs frown differ as expected; `cloneFace` doesn't alias the mouth.
- `render-target`: `faceForTarget("lvgl")` integer-snaps mouth; web passes mouth
  through.
- `preset-row`: `normalizeStates` backfills mouth on a face without one.
- `face-pack`: round-trip keeps the mouth; `parsePack` of a pack lacking a mouth
  backfills it; a pre-mouth pack still parses.
- `face-poses`: `poseFor("Happy")` returns an enabled, smiling mouth;
  `poseFor("Neutral")`/custom returns neutral (mouth off).
- `FaceControls`: the Mouth section renders the toggle; sliders appear when on.

## Known limitation

Between states, the mouth's **curve/shape** change snaps rather than
spring-interpolating (the path `d` is recomputed), exactly as the eyebrow path
does today; placement (position/rotation) springs smoothly. Smooth curve-morphing
would be a later enhancement for eyes, brows, and mouth together.

## Left to the builder

- Exact slider ranges for `MOUTH_FIELDS` and the `NEUTRAL_MOUTH` default numbers
  (follow the brow ranges as a starting point; mouth sits in the lower third).
- The authored parameter values for each pose in `face-poses.ts` (make them read
  clearly at a glance; keep eyes within existing ranges).
- Whether `Thinking`/`Error`/`Idle` warrant a mouth or read better eyes-only —
  builder's judgment while posing, as long as the clearly mouth-driven ones
  (Happy, Surprised, Angry, Sleepy) ship.
```
