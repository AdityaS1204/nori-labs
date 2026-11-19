import type {
  NoriBrowParams,
  NoriEyeParams,
  NoriFaceParams,
} from "@/lib/nori-face";
import { TWEEN_MS_RANGE, capabilities, type RenderTarget } from "@/lib/render-target";

/** Which half (or both) of the face an eye/brow edit applies to. */
export type EyeSide = "left" | "right" | "both";

export type EyeFieldKey = keyof Pick<
  NoriEyeParams,
  "width" | "height" | "radius" | "openness" | "tilt" | "offsetY" | "thickness"
>;

export type BrowFieldKey = keyof Pick<
  NoriBrowParams,
  "length" | "thickness" | "radius" | "arc" | "tilt" | "offsetY"
>;

export type GlobalFieldKey = keyof Pick<NoriFaceParams, "gap" | "glow">;

interface FieldDef<K extends string> {
  key: K;
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
  format?: (value: number) => string;
}

const asPercent = (v: number) => `${Math.round(v * 100)}%`;

/** Per-eye editable fields, with their slider ranges. */
export const EYE_FIELDS: FieldDef<EyeFieldKey>[] = [
  { key: "width", label: "Width", min: 10, max: 120, step: 1 },
  { key: "height", label: "Height", min: 20, max: 210, step: 1 },
  { key: "radius", label: "Corner radius", min: 0, max: 60, step: 1 },
  { key: "openness", label: "Openness", min: 0, max: 1, step: 0.01, format: asPercent },
  { key: "tilt", label: "Tilt", min: -45, max: 45, step: 1, unit: "°" },
  { key: "offsetY", label: "Vertical offset", min: -60, max: 60, step: 1 },
];

/** Stroke weight — shown only for line-like eye shapes (arc/bracket/angle). */
export const EYE_THICKNESS_FIELD: FieldDef<"thickness"> = {
  key: "thickness",
  label: "Weight",
  min: 4,
  max: 40,
  step: 1,
};

/** Per-eyebrow editable fields. */
export const BROW_FIELDS: FieldDef<BrowFieldKey>[] = [
  { key: "length", label: "Length", min: 10, max: 140, step: 1 },
  { key: "thickness", label: "Width", min: 2, max: 30, step: 1 },
  { key: "radius", label: "Corner radius", min: 0, max: 15, step: 0.5 },
  { key: "arc", label: "Arc", min: -20, max: 30, step: 1 },
  { key: "tilt", label: "Tilt", min: -45, max: 45, step: 1, unit: "°" },
  { key: "offsetY", label: "Height above eye", min: 0, max: 80, step: 1 },
];

/** Screen-wide fields. */
export const GLOBAL_FIELDS: FieldDef<GlobalFieldKey>[] = [
  { key: "gap", label: "Eye gap", min: 40, max: 300, step: 1 },
  { key: "glow", label: "Glow", min: 0, max: 2, step: 0.05, format: (v) => v.toFixed(2) },
];

/** Screen-wide fields the target can actually render (LVGL has no glow). */
export const globalFieldsFor = (target: RenderTarget): FieldDef<GlobalFieldKey>[] =>
  capabilities(target).glow ? GLOBAL_FIELDS : GLOBAL_FIELDS.filter((f) => f.key !== "glow");

/** Tween length, offered in place of the spring on a target without one. */
export const TWEEN_MS_FIELD: FieldDef<"durationMs"> = {
  key: "durationMs",
  label: "Duration",
  min: TWEEN_MS_RANGE.min,
  max: TWEEN_MS_RANGE.max,
  step: TWEEN_MS_RANGE.step,
  unit: "ms",
};
