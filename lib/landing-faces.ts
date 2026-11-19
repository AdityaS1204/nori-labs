import { NEUTRAL_FACE, type NoriEyeParams, type NoriFaceParams } from "@/lib/nori-face";

/**
 * The four faces in the "its face tells you what it's doing" grid. They are
 * robot *states* rather than moods: a face you have to read at a glance is a
 * status display, not decoration. Real NoriFaceParams, so the landing page
 * draws them with the same renderer that runs on the robot.
 */

const eye = (over: Partial<NoriEyeParams> = {}): NoriEyeParams => ({
  ...NEUTRAL_FACE.left,
  ...over,
});

const face = (over: Partial<NoriFaceParams> = {}): NoriFaceParams => ({
  ...NEUTRAL_FACE,
  ...over,
});

/** Both eyes posed the same way — the symmetric states. */
const evenly = (over: Partial<NoriEyeParams>, rest: Partial<NoriFaceParams> = {}) =>
  face({ left: eye(over), right: eye(over), ...rest });

export type NamedFace = {
  id: string;
  label: string;
  /** What the robot is doing in this state. A state label alone is not legible. */
  note: string;
  face: NoriFaceParams;
};

export const FACE_GRID: readonly NamedFace[] = [
  {
    id: "idle",
    label: "Idle",
    note: "Charged, parked, waiting for a job.",
    face: NEUTRAL_FACE,
  },
  {
    id: "listening",
    label: "Listening",
    note: "Mic is live and it is taking the instruction.",
    // Wide open and a touch taller: attention, without a mouth to show it.
    face: evenly({ width: 56, height: 150 }),
  },
  {
    id: "working",
    label: "Working",
    note: "Running a skill you taught it. Hands busy.",
    // Narrowed and squared off — concentration reads as less eye, not sadder eye.
    face: evenly({ openness: 0.52, radius: 8 }),
  },
  {
    id: "needs-help",
    label: "Needs help",
    note: "Stuck mid-task. It stopped and wants you.",
    // The one state that must carry across a room: brows on, bowed down.
    face: evenly(
      { openness: 0.74, offsetY: 10 },
      {
        browsEnabled: true,
        leftBrow: { ...NEUTRAL_FACE.leftBrow, arc: -14, thickness: 12, offsetY: 16 },
        rightBrow: { ...NEUTRAL_FACE.rightBrow, arc: -14, thickness: 12, offsetY: 16 },
      },
    ),
  },
];
