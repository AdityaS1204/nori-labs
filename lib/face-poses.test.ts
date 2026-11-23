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
