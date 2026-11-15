/**
 * The Nori robot's on-screen face model.
 *
 * This mirrors the robot's *actual* display: a dark screen with two glowing, rounded-rectangle
 * "eyes" and no mouth. Emotion is expressed entirely through eye geometry
 * (height, corner radius, tilt, offset), which is what the playground edits.
 */

/** The eye's silhouette. `bar` is the default rounded rectangle. */
export type EyeShape = "bar" | "circle" | "oval" | "arc" | "angle" | "custom";

export interface NoriEyeParams {
  /** Eye width in viewBox units. */
  width: number;
  /** Fully-open eye height in viewBox units. */
  height: number;
  /** Corner radius; `width / 2` gives a stadium/pill shape. Used by `bar`. */
  radius: number;
  /** 0–1 vertical scale, for blinks and squints (1 = fully open). */
  openness: number;
  /** Rotation in degrees around the eye centre, for emotion. */
  tilt: number;
  /** Vertical offset from the face centre line. */
  offsetY: number;
  /** Which silhouette to draw. Defaults to `bar`. */
  shape: EyeShape;
  /** Stroke weight for line-like shapes (arc / bracket / angle). */
  thickness: number;
  /**
   * Custom eye (`shape === "custom"`): the pasted SVG markup, rendered exactly
   * (its own paths, fills and gradients), sized/posed by the eye params.
   */
  customSvg?: string;
  /** The custom SVG's coordinate box [x, y, w, h] (its viewBox), for sizing. */
  customViewBox?: [number, number, number, number];
  /** @deprecated earlier auto-fit path mode; kept for back-compat on load. */
  customPath?: string;
  /** @deprecated earlier custom-path outline flag. */
  customStroke?: boolean;
}

export interface NoriBrowParams {
  /** Horizontal length of the brow. */
  length: number;
  /** Bar thickness (its "width"). */
  thickness: number;
  /** Corner radius of the bar ends. */
  radius: number;
  /** Arc / curvature — how much the brow bows upward (negative bows down). */
  arc: number;
  /** Rotation in degrees (mirrored per side, so +tilt is symmetric). */
  tilt: number;
  /** Distance the brow floats above the eye. */
  offsetY: number;
}

export interface NoriFaceParams {
  /** Eye colour (the glowing fill). */
  color: string;
  /** Glow intensity multiplier (0 = flat, 1 = default bloom). */
  glow: number;
  /** Distance between the two eye centres. */
  gap: number;
  left: NoriEyeParams;
  right: NoriEyeParams;
  /** Whether eyebrows are drawn (the robot's neutral face has none). */
  browsEnabled: boolean;
  leftBrow: NoriBrowParams;
  rightBrow: NoriBrowParams;
}

/** The face coordinate space. Landscape, with headroom above the eyes for
 *  eyebrows even when the eyes are tall. */
export const FACE_VIEWBOX = { width: 440, height: 320 } as const;

/**
 * A single neutral eye — an upright rounded rectangle (not a full pill), fully
 * open. The modest corner radius keeps it rectangular, matching the robot.
 */
const NEUTRAL_EYE: NoriEyeParams = {
  width: 50,
  height: 132,
  radius: 14,
  openness: 1,
  tilt: 0,
  offsetY: 0,
  shape: "bar",
  thickness: 16,
};

/** A single neutral brow — a flat, softly-rounded bar floating above the eye. */
const NEUTRAL_BROW: NoriBrowParams = {
  length: 56,
  thickness: 10,
  radius: 5,
  arc: 0,
  tilt: 0,
  offsetY: 22,
};

/**
 * The robot's default resting face — the neutral expression shipped on Nori.
 * Two upright glowing rectangles, set wide apart around centre. Eyebrows are
 * off by default, matching the robot.
 */
export const NEUTRAL_FACE: NoriFaceParams = {
  color: "#eaf3ff",
  glow: 1,
  gap: 150,
  left: { ...NEUTRAL_EYE },
  right: { ...NEUTRAL_EYE },
  browsEnabled: false,
  leftBrow: { ...NEUTRAL_BROW },
  rightBrow: { ...NEUTRAL_BROW },
};

/**
 * Build the SVG path for one eyebrow, centred on the origin. A rounded bar
 * whose top and bottom edges bow by `arc`; `radius` rounds the end caps.
 */
/**
 * Vertical centre of a brow: it floats above the eye's base top edge, but is
 * clamped so neither the bar, its upward arc, nor its glow leaves the viewBox
 * when the eye is tall or the offset is large.
 */
export function browCenterY(
  eye: Pick<NoriEyeParams, "offsetY" | "height">,
  brow: NoriBrowParams,
): number {
  const raw = FACE_VIEWBOX.height / 2 + eye.offsetY - eye.height / 2 - brow.offsetY;
  const minY = brow.thickness / 2 + Math.max(0, brow.arc) + 14;
  return Math.max(minY, raw);
}

export function buildBrowPath({
  length,
  thickness,
  radius,
  arc,
}: Pick<NoriBrowParams, "length" | "thickness" | "radius" | "arc">): string {
  const half = length / 2;
  const t = thickness;
  const topY = -t / 2;
  const botY = t / 2;
  const r = Math.min(Math.max(radius, 0), t / 2, half);
  const n = (x: number) => Number(x.toFixed(2));

  return [
    `M ${n(-half + r)} ${n(topY)}`,
    `Q 0 ${n(topY - 2 * arc)} ${n(half - r)} ${n(topY)}`,
    `A ${n(r)} ${n(r)} 0 0 1 ${n(half)} ${n(topY + r)}`,
    `L ${n(half)} ${n(botY - r)}`,
    `A ${n(r)} ${n(r)} 0 0 1 ${n(half - r)} ${n(botY)}`,
    `Q 0 ${n(botY - 2 * arc)} ${n(-half + r)} ${n(botY)}`,
    `A ${n(r)} ${n(r)} 0 0 1 ${n(-half)} ${n(botY - r)}`,
    `L ${n(-half)} ${n(topY + r)}`,
    `A ${n(r)} ${n(r)} 0 0 1 ${n(-half + r)} ${n(topY)}`,
    "Z",
  ].join(" ");
}

export interface EyeShapeDef {
  id: EyeShape;
  label: string;
  /** How the path is painted. `bar` is drawn as a `<rect>` fill. */
  mode: "fill" | "stroke";
  /** Directional shapes mirror horizontally on the right eye. */
  directional: boolean;
  /** A 24×24 glyph `d` for the shape-picker button. */
  glyph: string;
}

/** The curated eye shapes offered in the picker (plus `custom`). */
export const EYE_SHAPES: EyeShapeDef[] = [
  { id: "bar", label: "Bar", mode: "fill", directional: false, glyph: "M10 5 h4 a2 2 0 0 1 2 2 v10 a2 2 0 0 1 -2 2 h-4 a2 2 0 0 1 -2 -2 v-10 a2 2 0 0 1 2 -2 Z" },
  { id: "circle", label: "Circle", mode: "fill", directional: false, glyph: "M5 12 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 Z" },
  { id: "oval", label: "Oval", mode: "fill", directional: false, glyph: "M4 12 a8 6 0 1 0 16 0 a8 6 0 1 0 -16 0 Z" },
  { id: "arc", label: "Arc", mode: "stroke", directional: false, glyph: "M5 15 Q12 6 19 15" },
  { id: "angle", label: "Angle", mode: "stroke", directional: true, glyph: "M9 5 L16 12 L9 19" },
  { id: "custom", label: "Custom", mode: "fill", directional: true, glyph: "M6 6 H18 V18 H6 Z" },
];

export function eyeShapeDef(shape: EyeShape | undefined): EyeShapeDef {
  return EYE_SHAPES.find((s) => s.id === shape) ?? EYE_SHAPES[0];
}
export const isDirectional = (shape: EyeShape | undefined) =>
  eyeShapeDef(shape).directional;
export const eyeRenderMode = (shape: EyeShape | undefined) =>
  eyeShapeDef(shape).mode;

/**
 * Build the SVG path for one non-`bar` eye, centred on the origin and sized to
 * width×height (like `buildBrowPath`). `bar` renders as a `<rect>`, not here.
 * `custom` returns the author's raw path (the renderer scales it).
 */
export function buildEyePath(
  eye: Pick<NoriEyeParams, "shape" | "width" | "height" | "customPath">,
): string {
  const hw = eye.width / 2;
  const hh = eye.height / 2;
  const n = (v: number) => Number(v.toFixed(2));

  switch (eye.shape) {
    case "circle": {
      // A round eye, sized by the smaller half-axis so it stays circular.
      const r = Math.min(hw, hh);
      return `M ${n(-r)} 0 a ${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0 a ${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0 Z`;
    }
    case "oval":
      // A full width×height ellipse.
      return `M ${n(-hw)} 0 a ${n(hw)} ${n(hh)} 0 1 0 ${n(2 * hw)} 0 a ${n(hw)} ${n(hh)} 0 1 0 ${n(-2 * hw)} 0 Z`;
    case "arc":
      // Gentle upward dome ◠ (happy / content).
      return `M ${n(-hw)} ${n(hh * 0.55)} Q 0 ${n(-hh * 1.1)} ${n(hw)} ${n(hh * 0.55)}`;
    case "angle": {
      // ">" pointing inward on the left eye; the right mirrors to "<".
      const bx = -hw * 0.5;
      return `M ${n(bx)} ${n(-hh)} L ${n(hw)} 0 L ${n(bx)} ${n(hh)}`;
    }
    case "custom":
      return eye.customPath?.trim() || "";
    default:
      // Fallback centred rectangle (bar normally uses <rect>).
      return `M ${n(-hw)} ${n(-hh)} H ${n(hw)} V ${n(hh)} H ${n(-hw)} Z`;
  }
}

