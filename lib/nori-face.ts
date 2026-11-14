/**
 * The Nori robot's on-screen face model.
 *
 * Unlike the stylised gallery faces (`lib/expressions.ts`), this mirrors the
 * robot's *actual* display: a dark screen with two glowing, rounded-rectangle
 * "eyes" and no mouth. Emotion is expressed entirely through eye geometry
 * (height, corner radius, tilt, offset), which is what the playground edits.
 */

export interface NoriEyeParams {
  /** Eye width in viewBox units. */
  width: number;
  /** Fully-open eye height in viewBox units. */
  height: number;
  /** Corner radius; `width / 2` gives a stadium/pill shape. */
  radius: number;
  /** 0–1 vertical scale, for blinks and squints (1 = fully open). */
  openness: number;
  /** Rotation in degrees around the eye centre, for emotion. */
  tilt: number;
  /** Vertical offset from the face centre line. */
  offsetY: number;
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
