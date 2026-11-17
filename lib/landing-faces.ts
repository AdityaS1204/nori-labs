import { NEUTRAL_FACE, type NoriEyeParams, type NoriFaceParams } from "@/lib/nori-face";

/**
 * The four expressions shown in the "its face is a screen" grid. They are real
 * NoriFaceParams, so the landing page draws them with the same renderer that
 * runs on the robot rather than with hand-drawn mock shapes.
 */

const eye = (over: Partial<NoriEyeParams> = {}): NoriEyeParams => ({
  ...NEUTRAL_FACE.left,
  ...over,
});

const face = (over: Partial<NoriFaceParams> = {}): NoriFaceParams => ({
  ...NEUTRAL_FACE,
  ...over,
});

export type NamedFace = { id: string; label: string; face: NoriFaceParams };

export const FACE_GRID: readonly NamedFace[] = [
  {
    id: "idle",
    label: "Idle",
    face: NEUTRAL_FACE,
  },
  {
    id: "curious",
    label: "Curious",
    // One eye rides higher and opens wider: a head-tilt read without a tilt.
    face: face({
      left: eye({ openness: 0.82, offsetY: 10 }),
      right: eye({ height: 148, offsetY: -8 }),
    }),
  },
  {
    id: "happy",
    label: "Happy",
    face: face({
      left: eye({ openness: 0.34, offsetY: -26, radius: 24 }),
      right: eye({ openness: 0.34, offsetY: -26, radius: 24 }),
    }),
  },
  {
    id: "sleepy",
    label: "Sleepy",
    face: face({
      left: eye({ openness: 0.1, offsetY: 18, radius: 8 }),
      right: eye({ openness: 0.1, offsetY: 18, radius: 8 }),
    }),
  },
];
