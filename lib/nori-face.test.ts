import { describe, expect, it } from "vitest";

import {
  FACE_VIEWBOX,
  NEUTRAL_FACE,
  browCenterY,
  buildEyePath,
  eyeRenderMode,
  isDirectional,
} from "@/lib/nori-face";

describe("NEUTRAL_FACE", () => {
  it("is laterally symmetric", () => {
    expect(NEUTRAL_FACE.left).toEqual(NEUTRAL_FACE.right);
    expect(NEUTRAL_FACE.leftBrow).toEqual(NEUTRAL_FACE.rightBrow);
  });

  it("matches the robot's resting face: brows off, bar eyes, 6-digit colour", () => {
    expect(NEUTRAL_FACE.browsEnabled).toBe(false);
    expect(NEUTRAL_FACE.left.shape).toBe("bar");
    expect(NEUTRAL_FACE.color).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("keeps both eyes inside the viewBox", () => {
    const { gap, left } = NEUTRAL_FACE;
    expect(gap / 2 + left.width / 2).toBeLessThan(FACE_VIEWBOX.width / 2);
    expect(left.height).toBeLessThan(FACE_VIEWBOX.height);
  });
});

describe("browCenterY", () => {
  it("floats the brow above the eye's top edge", () => {
    const eye = { offsetY: 0, height: 100 };
    const brow = { length: 56, thickness: 10, radius: 5, arc: 0, tilt: 0, offsetY: 22 };
    expect(browCenterY(eye, brow)).toBe(FACE_VIEWBOX.height / 2 - 50 - 22);
  });

  it("clamps so the bar, its arc and its glow stay in frame", () => {
    const eye = { offsetY: -60, height: 210 };
    const brow = { length: 56, thickness: 10, radius: 5, arc: 30, tilt: 0, offsetY: 80 };
    expect(browCenterY(eye, brow)).toBe(10 / 2 + 30 + 14);
  });
});

describe("buildEyePath", () => {
  it("keeps a circle circular by using the smaller half-axis", () => {
    const wide = buildEyePath({ shape: "circle", width: 120, height: 40 });
    const tall = buildEyePath({ shape: "circle", width: 40, height: 120 });
    expect(wide).toBe(tall);
  });

  it("returns empty markup for a custom eye with no path", () => {
    expect(buildEyePath({ shape: "custom", width: 50, height: 50 })).toBe("");
  });

  it("falls back to a centred rect for bar, which renders as <rect>", () => {
    expect(buildEyePath({ shape: "bar", width: 50, height: 132 })).toBe(
      "M -25 -66 H 25 V 66 H -25 Z",
    );
  });
});

describe("shape metadata", () => {
  it("strokes only the line-like shapes", () => {
    expect(eyeRenderMode("arc")).toBe("stroke");
    expect(eyeRenderMode("angle")).toBe("stroke");
    expect(eyeRenderMode("bar")).toBe("fill");
  });

  it("mirrors only directional shapes onto the right eye", () => {
    expect(isDirectional("angle")).toBe(true);
    expect(isDirectional("bar")).toBe(false);
    expect(isDirectional(undefined)).toBe(false);
  });
});
