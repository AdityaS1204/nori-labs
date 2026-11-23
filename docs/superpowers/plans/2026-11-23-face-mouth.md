# Face Mouth + Posed Expressions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an optional mouth to the Nori face (model, renderer, controls, target-clamp, export) and ship posed default expressions that pose eyes + mouth from the "add state" menu.

**Architecture:** The mouth is a single face element modeled on the existing eyebrow. Its primary `line` shape reuses `buildBrowPath`'s bowed-rounded-bar construction; `arc` and `oval` reuse the eye-path idioms. It threads through every place a face already flows — clone, migration, renderers, `faceForTarget`, pack parse — defaulting off so the resting face is unchanged. Posed expressions are a lookup table keyed to the suggested labels.

**Tech Stack:** Next 16, React 19, TypeScript, Tailwind v4, Motion (`motion/react`), vitest, bun.

**Spec:** `docs/superpowers/specs/2026-11-23-face-mouth-design.md`

## Global Constraints

- Package manager is **bun**. Tests: `bunx vitest run <file>`. Lint: `bun run lint`. Types: `bun run typecheck`.
- Styling is **Tailwind classes in JSX**, not custom CSS classes.
- Any GSAP/entrance animation must **never start from `opacity: 0`** on UI that must stay visible (not relevant to this plan's motion, which is Motion springs).
- Comments **sparse and short** — only where the code is non-obvious.
- Pack **schema stays `1`**; the mouth is additive, same precedent as the `target` field.
- The resting/neutral face must **not** show a mouth it didn't have before (`mouthEnabled` defaults `false`).
- Commit per task; each commit is a non-breaking rollback. `git add` only the files that task names (other uncommitted work — the slider and section-container changes — must stay out of these commits).

## Review Focus

- **Old DB row without a mouth field** loads and renders — a reasonable author opens a pre-mouth preset and expects it to work. → pinned in Task 2 (`normalizeStates` backfill test).
- **Pre-mouth exported `.nori.json` pack** still parses — → pinned in Task 4 (`parsePack` backfill test).
- **LVGL target** integer-snaps mouth geometry like the rest of the face — → pinned in Task 4 (`faceForTarget("lvgl")` test).
- **`mouthEnabled: false`** draws no mouth element at all — → pinned in Task 3 (static-render test).
- **Editing one state's mouth** must not alias another state's — → pinned in Task 2 (`cloneFace` test).

---

### Task 1: Mouth data model + path builder

**Files:**
- Modify: `lib/nori-face.ts`
- Test: `lib/nori-face.test.ts`

**Interfaces:**
- Consumes: existing `FACE_VIEWBOX`, `buildBrowPath`, `NoriFaceParams`, `NEUTRAL_FACE`.
- Produces:
  - `export type MouthShape = "line" | "arc" | "oval"`
  - `export interface NoriMouthParams { width: number; height: number; radius: number; curve: number; thickness: number; offsetY: number; shape: MouthShape }`
  - `NoriFaceParams` gains `mouthEnabled: boolean` and `mouth: NoriMouthParams` (declared after `rightBrow`).
  - `export const NEUTRAL_MOUTH: NoriMouthParams`
  - `export function buildMouthPath(mouth: Pick<NoriMouthParams, "shape" | "width" | "height" | "radius" | "curve">): string`
  - `export function mouthCenterY(mouth: Pick<NoriMouthParams, "offsetY" | "height">): number`
  - `export interface MouthShapeDef { id: MouthShape; label: string; mode: "fill" | "stroke"; glyph: string }`
  - `export const MOUTH_SHAPES: MouthShapeDef[]` and `export function mouthRenderMode(shape: MouthShape | undefined): "fill" | "stroke"`

- [ ] **Step 1: Write the failing tests** in `lib/nori-face.test.ts`

```ts
describe("mouth model", () => {
  it("ships a neutral face with the mouth off but present", () => {
    expect(NEUTRAL_FACE.mouthEnabled).toBe(false);
    expect(NEUTRAL_FACE.mouth.shape).toBe("line");
  });

  it("keeps the neutral mouth inside the viewBox", () => {
    const y = mouthCenterY(NEUTRAL_FACE.mouth);
    expect(y).toBeGreaterThan(FACE_VIEWBOX.height / 2);
    expect(y + NEUTRAL_MOUTH.height / 2).toBeLessThan(FACE_VIEWBOX.height);
  });

  it("builds distinct line paths for flat, smile and frown", () => {
    const flat = buildMouthPath({ shape: "line", width: 120, height: 10, radius: 5, curve: 0 });
    const smile = buildMouthPath({ shape: "line", width: 120, height: 10, radius: 5, curve: 20 });
    const frown = buildMouthPath({ shape: "line", width: 120, height: 10, radius: 5, curve: -20 });
    expect(smile).not.toBe(flat);
    expect(frown).not.toBe(flat);
    expect(smile).not.toBe(frown);
  });

  it("a positive-curve line bows its middle below its ends (a smile ◡)", () => {
    // buildBrowPath's +arc bows up; the mouth negates curve so +curve bows down.
    const smile = buildMouthPath({ shape: "line", width: 120, height: 10, radius: 5, curve: 20 });
    const bowedUp = buildBrowPath({ length: 120, thickness: 10, radius: 5, arc: 20 });
    expect(smile).not.toBe(bowedUp);
    expect(smile).toBe(buildBrowPath({ length: 120, thickness: 10, radius: 5, arc: -20 }));
  });

  it("renders line/oval as fill and arc as stroke", () => {
    expect(mouthRenderMode("line")).toBe("fill");
    expect(mouthRenderMode("oval")).toBe("fill");
    expect(mouthRenderMode("arc")).toBe("stroke");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bunx vitest run lib/nori-face.test.ts -t "mouth model"`
Expected: FAIL (exports not defined).

- [ ] **Step 3: Implement the model in `lib/nori-face.ts`**

Add the type, interface, and the two `NoriFaceParams` fields. Add `NEUTRAL_MOUTH` as a flat, centered line in the lower third — suggested: `{ width: 120, height: 10, radius: 5, curve: 0, thickness: 10, offsetY: 0, shape: "line" }`. Set `NEUTRAL_FACE.mouthEnabled = false` and `mouth: { ...NEUTRAL_MOUTH }`.

`buildMouthPath`: switch on shape.
- `line`: `return buildBrowPath({ length: width, thickness: height, radius, arc: -curve });` — the negation makes **+curve a smile** (buildBrowPath's +arc bows up, a mouth wants +curve to bow the middle down). One short comment states this.
- `arc`: an open quadratic stroked later — `M ${-hw} 0 Q 0 ${n(curve)} ${hw} 0` (hw = width/2; +curve dips the middle for a smile).
- `oval`: a width×height ellipse, same idiom as `buildEyePath`'s `oval`.
Use the same `n = (v) => Number(v.toFixed(2))` rounding as the neighbors.

`mouthCenterY`: baseline in the lower third — `const raw = FACE_VIEWBOX.height / 2 + 80 + mouth.offsetY;` then clamp below the frame: `return Math.min(FACE_VIEWBOX.height - mouth.height / 2 - 14, raw);`

`MOUTH_SHAPES`: three entries with 24×24 glyphs — `line` (fill, a flat rounded bar), `arc` (stroke, a smile curve), `oval` (fill, an ellipse). `mouthRenderMode` looks up `MOUTH_SHAPES` and falls back to the first entry's mode.

- [ ] **Step 4: Run tests to verify they pass**

Run: `bunx vitest run lib/nori-face.test.ts`
Expected: PASS (new + existing).

- [ ] **Step 5: Commit**

```bash
git add lib/nori-face.ts lib/nori-face.test.ts
git commit -m "feat(face): add mouth data model and path builder"
```

---

### Task 2: Clone + migration defaults

**Files:**
- Modify: `lib/presets.ts` (`cloneFace`)
- Modify: `lib/preset-row.ts` (`normalizeStates`)
- Test: `lib/preset-row.test.ts`

**Interfaces:**
- Consumes: `NEUTRAL_MOUTH`, `NoriMouthParams` from Task 1.
- Produces: `cloneFace` deep-clones `mouth`; `normalizeStates` guarantees every returned face has `mouthEnabled: boolean` and `mouth: NoriMouthParams`.

- [ ] **Step 1: Write the failing tests** in `lib/preset-row.test.ts`

```ts
it("backfills the mouth on a face written before it existed", () => {
  const face = { ...NEUTRAL_FACE } as Record<string, unknown>;
  delete face.mouth;
  delete face.mouthEnabled;
  const [out] = normalizeStates([{ id: "s1", label: "X", face: face as unknown as NoriFaceParams }]);
  expect(out.face.mouthEnabled).toBe(false);
  expect(out.face.mouth).toEqual(NEUTRAL_MOUTH);
});

it("cloneFace does not alias the mouth between states", () => {
  const a = cloneFace(NEUTRAL_FACE);
  a.mouth.curve = 30;
  expect(NEUTRAL_FACE.mouth.curve).toBe(0);
});
```

Add the imports these need (`cloneFace` from `@/lib/presets`, `NEUTRAL_MOUTH` from `@/lib/nori-face`) at the top of the test file; follow the file's existing import style.

- [ ] **Step 2: Run tests to verify they fail**

Run: `bunx vitest run lib/preset-row.test.ts -t "mouth"`
Expected: FAIL.

- [ ] **Step 3: Implement**

In `lib/presets.ts` `cloneFace`, add `mouth: { ...f.mouth }` to the returned object (and keep `mouthEnabled` — it rides in via `...f`).

In `lib/preset-row.ts` `normalizeStates`, inside the per-state map add to the `face` object: `mouthEnabled: s.face.mouthEnabled ?? false, mouth: s.face.mouth ?? { ...NEUTRAL_MOUTH }`. Import `NEUTRAL_MOUTH` from `@/lib/nori-face`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `bunx vitest run lib/preset-row.test.ts lib/presets.test.ts`
Expected: PASS. (If `lib/presets.test.ts` does not exist, run only `preset-row.test.ts`.)

- [ ] **Step 5: Commit**

```bash
git add lib/presets.ts lib/preset-row.ts lib/preset-row.test.ts
git commit -m "feat(face): clone and backfill the mouth on load"
```

---

### Task 3: Rendering (static + live)

**Files:**
- Modify: `components/robot-face/NoriFace.tsx` (add `Mouth`)
- Modify: `components/robot-face/NoriFaceLive.tsx` (add `LiveMouth`)
- Test: `components/robot-face/NoriFace.test.tsx`

**Interfaces:**
- Consumes: `buildMouthPath`, `mouthCenterY`, `mouthRenderMode`, `NoriMouthParams` from Task 1.
- Produces: both renderers draw the mouth after the brows, inside the glow group, only when `face.mouthEnabled`.

- [ ] **Step 1: Write the failing tests** in `components/robot-face/NoriFace.test.tsx`

Follow the file's existing render approach (`renderToStaticMarkup`). Add:

```ts
it("draws no mouth when the mouth is disabled", () => {
  const html = renderToStaticMarkup(<NoriFace face={NEUTRAL_FACE} />);
  // neutral mouth is off; the only paths are brows (also off here) — assert the
  // mouth path is absent by checking the mouth's distinctive y-band is not drawn.
  expect(NEUTRAL_FACE.mouthEnabled).toBe(false);
  // A disabled mouth adds no <path>; neutral face with brows off renders only <rect> eyes.
  expect(html).not.toContain("<path");
});

it("draws the mouth when enabled", () => {
  const face = cloneFace(NEUTRAL_FACE);
  face.mouthEnabled = true;
  const html = renderToStaticMarkup(<NoriFace face={face} />);
  expect(html).toContain("<path");
});
```

Import `cloneFace` from `@/lib/presets` if not already imported.

- [ ] **Step 2: Run tests to verify they fail**

Run: `bunx vitest run components/robot-face/NoriFace.test.tsx -t "mouth"`
Expected: FAIL (mouth not rendered).

- [ ] **Step 3: Implement the static `Mouth`** in `NoriFace.tsx`

Add a `Mouth` subcomponent taking `{ mouth, color }`. It computes `cy = mouthCenterY(mouth)`, renders a `<path d={buildMouthPath(mouth)} transform={`translate(${CENTER_X} ${cy})`} …>`. For `mouthRenderMode(mouth.shape) === "stroke"` (the `arc`): `fill="none" stroke={color} strokeWidth={mouth.thickness} strokeLinecap="round"`. Otherwise `fill={color}`. Render it after the `browsEnabled` block, still inside the glow `<g>`, gated on `face.mouthEnabled`.

- [ ] **Step 4: Implement `LiveMouth`** in `NoriFaceLive.tsx`

Mirror `LiveBrow`: a `motion.g` with `transformBox: "fill-box"`, `initial={false}`, `animate={{ y: mouthCenterY(mouth) - CY }}`, `transition={morph}`, containing the path drawn as in Step 3 (`translate(${CX} ${CY})`, fill or stroke per mode). The mouth is centered, so no `x`; it has no tilt. Render it after the `browsEnabled` block inside the gaze group, gated on `mouthEnabled` (destructure `mouthEnabled, mouth` from `face`).

- [ ] **Step 5: Run tests to verify they pass**

Run: `bunx vitest run components/robot-face/NoriFace.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/robot-face/NoriFace.tsx components/robot-face/NoriFaceLive.tsx components/robot-face/NoriFace.test.tsx
git commit -m "feat(face): render the mouth in the static and live faces"
```

---

### Task 4: Target gating + pack round-trip

**Files:**
- Modify: `lib/render-target.ts` (`mouthForTarget`, wire into `faceForTarget`)
- Test: `lib/render-target.test.ts`
- Test: `lib/face-pack.test.ts`

**Interfaces:**
- Consumes: `NoriMouthParams` (Task 1), `normalizeStates` backfill (Task 2, already called inside `parsePack`).
- Produces: `faceForTarget` returns a face whose `mouth` is integer-snapped under LVGL and passed through unchanged on web; `mouthEnabled` is preserved.

- [ ] **Step 1: Write the failing tests**

In `lib/render-target.test.ts`:

```ts
it("integer-snaps the mouth under LVGL", () => {
  const face = cloneFace(NEUTRAL_FACE);
  face.mouth = { ...face.mouth, width: 120.7, height: 10.4, curve: 12.9, offsetY: 3.6, radius: 4.8, thickness: 9.3 };
  const out = faceForTarget(face, "lvgl").mouth;
  for (const v of [out.width, out.height, out.curve, out.offsetY, out.radius, out.thickness]) {
    expect(Number.isInteger(v)).toBe(true);
  }
});

it("passes the mouth through unchanged on web", () => {
  const face = cloneFace(NEUTRAL_FACE);
  face.mouth = { ...face.mouth, width: 120.7 };
  expect(faceForTarget(face, "web").mouth.width).toBe(120.7);
});
```

In `lib/face-pack.test.ts` (follow its existing round-trip style):

```ts
it("parses a pre-mouth pack by backfilling the mouth", () => {
  const pack = presetToPack(/* a one-state preset built the way this file already does */);
  const raw = JSON.parse(JSON.stringify(pack));
  for (const s of raw.states) { delete s.face.mouth; delete s.face.mouthEnabled; }
  const parsed = parsePack(raw);
  expect(parsed.states[0].face.mouthEnabled).toBe(false);
  expect(parsed.states[0].face.mouth).toEqual(NEUTRAL_MOUTH);
});
```

Reuse whatever preset/pack fixture the test file already constructs; do not invent a new builder.

- [ ] **Step 2: Run tests to verify they fail**

Run: `bunx vitest run lib/render-target.test.ts lib/face-pack.test.ts -t "mouth"`
Expected: FAIL.

- [ ] **Step 3: Implement `mouthForTarget`** in `lib/render-target.ts`

```ts
function mouthForTarget(mouth: NoriMouthParams, caps: TargetCapabilities): NoriMouthParams {
  if (!caps.integerGeometry) return { ...mouth };
  return { ...mouth, width: whole(mouth.width), height: whole(mouth.height), radius: whole(mouth.radius), curve: whole(mouth.curve), thickness: whole(mouth.thickness), offsetY: whole(mouth.offsetY) };
}
```

In `faceForTarget`'s rebuilt object add `mouth: mouthForTarget(face.mouth, caps)` (`mouthEnabled` rides in via `...face`). The web early-return path is unchanged (returns `face`, mouth included). Import `NoriMouthParams`.

No change needed in `face-pack.ts`: `parsePack` already runs `normalizeStates` (Task 2 backfills the mouth) and then `faceForTarget` (clamps it). Confirm the test passes without editing it.

- [ ] **Step 4: Run tests to verify they pass**

Run: `bunx vitest run lib/render-target.test.ts lib/face-pack.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/render-target.ts lib/render-target.test.ts lib/face-pack.test.ts
git commit -m "feat(face): clamp the mouth per render target"
```

---

### Task 5: Mouth controls

**Files:**
- Modify: `components/playground/faceFields.ts` (`MOUTH_FIELDS`, `MOUTH_THICKNESS_FIELD`, `MouthFieldKey`)
- Modify: `components/playground/FaceControls.tsx` (generic `ShapePicker`, Mouth section)
- Modify: `components/playground/ExpressionEditor.tsx` (`onToggleMouth`, `onMouthChange`, `onMouthShapeChange`)
- Test: `components/playground/FaceControls.test.tsx`

**Interfaces:**
- Consumes: `MOUTH_SHAPES`, `mouthRenderMode`, `MouthShape`, `NoriMouthParams` (Task 1).
- Produces:
  - `export type MouthFieldKey = keyof Pick<NoriMouthParams, "width" | "height" | "radius" | "curve" | "offsetY">`
  - `export const MOUTH_FIELDS: FieldDef<MouthFieldKey>[]`, `export const MOUTH_THICKNESS_FIELD: FieldDef<"thickness">`
  - `FaceControls` gains props `onToggleMouth: (value: boolean) => void`, `onMouthChange: (key: MouthFieldKey, value: number) => void`, `onMouthShapeChange: (shape: MouthShape) => void`.

- [ ] **Step 1: Write the failing tests** in `components/playground/FaceControls.test.tsx`

Add the three new props to the `markup` helper's `<FaceControls>` (all `() => {}`). Then:

```ts
describe("FaceControls mouth section", () => {
  it("shows the mouth toggle and hides sliders while off", () => {
    const html = markup(DEFAULT_RENDER);
    expect(html).toContain("Show mouth");
    expect(html).not.toContain('aria-label="Smile"');
  });

  it("shows the mouth sliders when the mouth is on", () => {
    const face = cloneFace(NEUTRAL_FACE);
    face.mouthEnabled = true;
    const html = markup(DEFAULT_RENDER, face);
    expect(html).toContain('aria-label="Smile"'); // the curve slider
    expect(html).toContain('aria-label="Line"'); // the shape picker
  });

  it("shows Weight only for the arc shape", () => {
    const line = cloneFace(NEUTRAL_FACE); line.mouthEnabled = true;
    expect(markup(DEFAULT_RENDER, line)).not.toContain('aria-label="Weight"');
    const arc = cloneFace(NEUTRAL_FACE); arc.mouthEnabled = true; arc.mouth = { ...arc.mouth, shape: "arc" };
    expect(markup(DEFAULT_RENDER, arc)).toContain('aria-label="Weight"');
  });
});
```

(`NumberSlider`'s row carries `aria-label={label}`, and `ShapePicker` buttons carry `aria-label={s.label}` — these assertions rely on those existing attributes. There are two "Weight" labels in the eye section only for stroke eyes; the neutral face has bar eyes, so "Weight" is unique to the mouth here.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `bunx vitest run components/playground/FaceControls.test.tsx -t "mouth"`
Expected: FAIL.

- [ ] **Step 3: Add the fields** in `faceFields.ts`

```ts
export type MouthFieldKey = keyof Pick<NoriMouthParams, "width" | "height" | "radius" | "curve" | "offsetY">;

export const MOUTH_FIELDS: FieldDef<MouthFieldKey>[] = [
  { key: "width", label: "Width", min: 20, max: 200, step: 1 },
  { key: "height", label: "Height", min: 2, max: 120, step: 1 },
  { key: "radius", label: "Corner radius", min: 0, max: 30, step: 0.5 },
  { key: "curve", label: "Smile", min: -40, max: 40, step: 1 },
  { key: "offsetY", label: "Vertical offset", min: -60, max: 80, step: 1 },
];

export const MOUTH_THICKNESS_FIELD: FieldDef<"thickness"> = { key: "thickness", label: "Weight", min: 2, max: 30, step: 1 };
```

Import `NoriMouthParams` from `@/lib/nori-face`.

- [ ] **Step 4: Generalize `ShapePicker` and add the Mouth section** in `FaceControls.tsx`

Make `ShapePicker` generic so both eye and mouth shapes use it:
`function ShapePicker<T extends string>({ shape, shapes, onPick }: { shape: T; shapes: { id: T; label: string; mode: "fill" | "stroke"; glyph: string }[]; onPick: (shape: T) => void })` — body unchanged. `EyeShapeDef` and `MouthShapeDef` both satisfy the `shapes` element type.

Add a `MouthSection` (or inline block) after the Eyebrows `ControlSection`:
- `ControlSection title="Mouth"` containing a `FieldRow` with "Show mouth" + `Toggle` (`checked={face.mouthEnabled}`, `onChange={onToggleMouth}`).
- When `face.mouthEnabled`: `<ShapePicker shape={face.mouth.shape} shapes={MOUTH_SHAPES} onPick={onMouthShapeChange} />`, then a `NumberSlider` per `MOUTH_FIELDS` (`value={face.mouth[f.key]}`, `onChange={(v) => onMouthChange(f.key, v)}`), then the `MOUTH_THICKNESS_FIELD` slider only when `mouthRenderMode(face.mouth.shape) === "stroke"`.

Add `onToggleMouth`, `onMouthChange`, `onMouthShapeChange` to `FaceControlsProps` and destructure them. Import `MOUTH_FIELDS`, `MOUTH_THICKNESS_FIELD`, `MouthFieldKey`, `MOUTH_SHAPES`, `mouthRenderMode`, `MouthShape`.

- [ ] **Step 5: Wire handlers** in `ExpressionEditor.tsx`

```ts
const onToggleMouth = useCallback((value: boolean) => patchFace((f) => ({ ...f, mouthEnabled: value })), [patchFace]);
const onMouthChange = useCallback((key: MouthFieldKey, value: number) => patchFace((f) => ({ ...f, mouth: { ...f.mouth, [key]: value } })), [patchFace]);
const onMouthShapeChange = useCallback((shape: MouthShape) => patchFace((f) => ({ ...f, mouth: { ...f.mouth, shape } })), [patchFace]);
```

Pass all three to `<FaceControls>`. Import `MouthFieldKey` from `./faceFields` and `MouthShape` from `@/lib/nori-face`.

- [ ] **Step 6: Run tests to verify they pass**

Run: `bunx vitest run components/playground/FaceControls.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add components/playground/faceFields.ts components/playground/FaceControls.tsx components/playground/ExpressionEditor.tsx components/playground/FaceControls.test.tsx
git commit -m "feat(playground): add mouth controls"
```

---

### Task 6: Posed default expressions

**Files:**
- Create: `lib/face-poses.ts`
- Modify: `lib/presets.ts` (export `SuggestedLabel`)
- Modify: `components/playground/ExpressionEditor.tsx` (seed posed face in `addState`)
- Test: `lib/face-poses.test.ts`

**Interfaces:**
- Consumes: `NEUTRAL_FACE`, `NoriMouthParams`, `MouthShape` (Task 1); `SUGGESTED_LABELS`, `cloneFace`, `newState` (presets).
- Produces:
  - `lib/presets.ts`: `export type SuggestedLabel = (typeof SUGGESTED_LABELS)[number];`
  - `lib/face-poses.ts`: `export const POSES: Partial<Record<SuggestedLabel, NoriFaceParams>>` and `export function poseFor(label: string): NoriFaceParams` (returns a clone of the posed face, or a clone of `NEUTRAL_FACE`).

- [ ] **Step 1: Write the failing tests** in `lib/face-poses.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { poseFor } from "@/lib/face-poses";

describe("poseFor", () => {
  it("gives Happy an enabled, smiling mouth", () => {
    const f = poseFor("Happy");
    expect(f.mouthEnabled).toBe(true);
    expect(f.mouth.curve).toBeGreaterThan(0);
  });

  it("gives Neutral and custom names the neutral eyes-only face", () => {
    expect(poseFor("Neutral").mouthEnabled).toBe(false);
    expect(poseFor("Banana").mouthEnabled).toBe(false);
  });

  it("returns a fresh face each call (no shared aliasing)", () => {
    const a = poseFor("Happy");
    a.mouth.curve = 999;
    expect(poseFor("Happy").mouth.curve).not.toBe(999);
  });

  it("poses the clearly mouth-driven labels", () => {
    for (const label of ["Happy", "Surprised", "Angry", "Sleepy"]) {
      expect(poseFor(label).mouthEnabled).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bunx vitest run lib/face-poses.test.ts`
Expected: FAIL (module missing).

- [ ] **Step 3: Implement `lib/face-poses.ts`**

Add `export type SuggestedLabel` to `presets.ts`. Author `POSES` for at least **Happy, Surprised, Angry, Sleepy** (mouth on, shaped to read at a glance) and optionally Thinking/Error/Idle (builder's judgment — may stay eyes-only). Build each from a `cloneFace(NEUTRAL_FACE)` base, then set eye geometry within existing field ranges (see `EYE_FIELDS`/`BROW_FIELDS`/`MOUTH_FIELDS` for bounds) and `mouthEnabled: true` with a mouth shaped for the emotion (e.g. Happy: `shape: "line", curve: +`, small `height`; Surprised: `shape: "oval"`, tall; Angry: `curve: -`). `poseFor(label)` returns `cloneFace(POSES[label as SuggestedLabel] ?? NEUTRAL_FACE)`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `bunx vitest run lib/face-poses.test.ts`
Expected: PASS.

- [ ] **Step 5: Wire into `addState`** in `ExpressionEditor.tsx`

Change `const s = newState(label);` to `const s = newState(label, poseFor(label));`. Import `poseFor` from `@/lib/face-poses`. (`newState(label, face)` already clones the face.)

- [ ] **Step 6: Commit**

```bash
git add lib/face-poses.ts lib/face-poses.test.ts lib/presets.ts components/playground/ExpressionEditor.tsx
git commit -m "feat(playground): seed posed expressions from suggested labels"
```

---

### Task 7: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Full test suite** — `bunx vitest run` → all pass.
- [ ] **Step 2: Types** — `bun run typecheck` → clean.
- [ ] **Step 3: Lint** — `bun run lint` → clean.
- [ ] **Step 4: Browser check** — run the dev server (usually already on :3000), open the playground, toggle the mouth on, change its shape and sliders, confirm the preview mouth updates and springs into place; add a "Happy" state and confirm it comes in smiling. Note any console errors. (If the Chrome extension is unavailable, report that this step could not be run and ask the user to eyeball it.)
- [ ] **Step 5: Report** — commands run, results, files changed, and the known limitation (mouth curve/shape morph snaps between states, like the eyebrow path).
