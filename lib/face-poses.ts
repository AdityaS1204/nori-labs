/**
 * Posed default expressions. Picking a suggested label in the "add state" menu
 * seeds one of these (eyes + mouth, brows where apt) instead of a neutral face;
 * a custom name still seeds neutral. All geometry stays within the playground's
 * own slider ranges, so every pose is editable from where it lands.
 */

import { NEUTRAL_FACE, type NoriFaceParams } from "@/lib/nori-face";
import { cloneFace, type SuggestedLabel } from "@/lib/presets";

/** A posed face from a neutral base, with the given overrides applied. */
function pose(build: (f: NoriFaceParams) => void): NoriFaceParams {
  const f = cloneFace(NEUTRAL_FACE);
  build(f);
  return f;
}

export const POSES: Partial<Record<SuggestedLabel, NoriFaceParams>> = {
  Happy: pose((f) => {
    f.color = "#9bffd0";
    f.left = { ...f.left, shape: "arc" };
    f.right = { ...f.right, shape: "arc" };
    f.mouthEnabled = true;
    f.mouth = { ...f.mouth, shape: "line", width: 130, height: 12, curve: 26 };
  }),

  Surprised: pose((f) => {
    f.gap = 180;
    f.left = { ...f.left, shape: "circle", width: 90, height: 90 };
    f.right = { ...f.right, shape: "circle", width: 90, height: 90 };
    f.browsEnabled = true;
    f.leftBrow = { ...f.leftBrow, offsetY: 44, arc: 10 };
    f.rightBrow = { ...f.rightBrow, offsetY: 44, arc: 10 };
    f.mouthEnabled = true;
    f.mouth = { ...f.mouth, shape: "oval", width: 56, height: 70 };
  }),

  Angry: pose((f) => {
    f.color = "#ff8f7a";
    f.left = { ...f.left, shape: "angle", tilt: 12 };
    f.right = { ...f.right, shape: "angle", tilt: 12 };
    f.browsEnabled = true;
    f.leftBrow = { ...f.leftBrow, tilt: -18, arc: -6 };
    f.rightBrow = { ...f.rightBrow, tilt: -18, arc: -6 };
    f.mouthEnabled = true;
    f.mouth = { ...f.mouth, shape: "line", width: 110, height: 12, curve: -22 };
  }),

  Sleepy: pose((f) => {
    f.glow = 0.3;
    f.left = { ...f.left, shape: "oval", openness: 0.18, offsetY: 24 };
    f.right = { ...f.right, shape: "oval", openness: 0.18, offsetY: 24 };
    f.mouthEnabled = true;
    f.mouth = { ...f.mouth, shape: "line", width: 70, height: 8, curve: 6, offsetY: 10 };
  }),

  Thinking: pose((f) => {
    f.browsEnabled = true;
    f.leftBrow = { ...f.leftBrow, offsetY: 40, arc: 8, tilt: 6 };
    f.rightBrow = { ...f.rightBrow, offsetY: 18, tilt: -6 };
  }),

  Error: pose((f) => {
    f.color = "#ff6b6b";
    f.left = { ...f.left, shape: "angle", tilt: 14 };
    f.right = { ...f.right, shape: "angle", tilt: 14 };
    f.mouthEnabled = true;
    f.mouth = { ...f.mouth, shape: "line", width: 90, height: 12, curve: -16 };
  }),
};

/** The posed face for a suggested label, or a fresh neutral face otherwise. */
export function poseFor(label: string): NoriFaceParams {
  const posed = POSES[label as SuggestedLabel];
  return cloneFace(posed ?? NEUTRAL_FACE);
}
