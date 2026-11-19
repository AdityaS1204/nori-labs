import { describe, expect, it } from "vitest";

import {
  CAPABILITIES,
  DEFAULT_RENDER,
  TWEEN_MS_RANGE,
  capabilities,
  droppedShapeIn,
  faceForTarget,
  normalizeRender,
  shapesFor,
  supportsShape,
} from "@/lib/render-target";
import { NEUTRAL_FACE, type NoriFaceParams } from "@/lib/nori-face";
import { cloneFace } from "@/lib/presets";

function glowingCustomFace(): NoriFaceParams {
  const face = cloneFace(NEUTRAL_FACE);
  face.glow = 1.5;
  face.gap = 150.7;
  face.left = {
    ...face.left,
    shape: "custom",
    customSvg: "<svg><circle r='5'/></svg>",
    customViewBox: [0, 0, 10, 10],
    width: 50.4,
    openness: 0.666,
  };
  return face;
}

describe("capabilities", () => {
  it("denies LVGL the glow, the pasted SVG and the spring", () => {
    const lvgl = capabilities("lvgl");
    expect(lvgl.glow).toBe(false);
    expect(lvgl.customSvg).toBe(false);
    expect(lvgl.spring).toBe(false);
  });

  it("grants the web target everything the editor can author", () => {
    const web = capabilities("web");
    expect(web.glow).toBe(true);
    expect(web.customSvg).toBe(true);
    expect(web.spring).toBe(true);
    expect(web.shapes).toContain("custom");
  });

  it("offers LVGL every curated shape except the pasted SVG", () => {
    expect(shapesFor("lvgl").map((s) => s.id)).toEqual(["bar", "circle", "oval", "arc", "angle"]);
    expect(supportsShape("lvgl", "custom")).toBe(false);
    expect(supportsShape("lvgl", "arc")).toBe(true);
    expect(supportsShape("lvgl", undefined)).toBe(true);
  });

  it("budgets fewer frames on the device than in the browser", () => {
    expect(CAPABILITIES.lvgl.fps).toBeLessThan(CAPABILITIES.web.fps);
  });
});

describe("faceForTarget", () => {
  it("returns the same face untouched for the web target", () => {
    const face = glowingCustomFace();
    expect(faceForTarget(face, "web")).toBe(face);
  });

  it("drops the glow for LVGL", () => {
    expect(faceForTarget(glowingCustomFace(), "lvgl").glow).toBe(0);
  });

  it("falls a pasted-SVG eye back to a bar and strips the markup", () => {
    const eye = faceForTarget(glowingCustomFace(), "lvgl").left;
    expect(eye.shape).toBe("bar");
    expect(eye.customSvg).toBeUndefined();
    expect(eye.customViewBox).toBeUndefined();
  });

  it("keeps a shape LVGL can draw", () => {
    const face = cloneFace(NEUTRAL_FACE);
    face.left = { ...face.left, shape: "arc" };
    expect(faceForTarget(face, "lvgl").left.shape).toBe("arc");
  });

  it("snaps geometry to whole units for LVGL's integer pixels", () => {
    const lvgl = faceForTarget(glowingCustomFace(), "lvgl");
    expect(lvgl.gap).toBe(151);
    expect(lvgl.left.width).toBe(50);
    expect(lvgl.left.openness).toBe(0.67);
  });

  it("does not mutate the authored face, so toggling back restores it", () => {
    const face = glowingCustomFace();
    faceForTarget(face, "lvgl");
    expect(face.glow).toBe(1.5);
    expect(face.left.shape).toBe("custom");
    expect(face.left.customSvg).toBeTruthy();
  });
});

describe("droppedShapeIn", () => {
  it("is null when the target can draw every shape in the face", () => {
    expect(droppedShapeIn(glowingCustomFace(), "web")).toBeNull();
    expect(droppedShapeIn(cloneFace(NEUTRAL_FACE), "lvgl")).toBeNull();
  });

  it("names a pasted SVG eye that LVGL has to replace", () => {
    expect(droppedShapeIn(glowingCustomFace(), "lvgl")).toBe("Custom");
  });

  it("stays quiet about the neutral face's glow, which every preset carries", () => {
    expect(NEUTRAL_FACE.glow).toBeGreaterThan(0);
    expect(droppedShapeIn(cloneFace(NEUTRAL_FACE), "lvgl")).toBeNull();
  });
});

describe("normalizeRender", () => {
  it("defaults a row written before the column existed to the web target", () => {
    expect(normalizeRender(null)).toEqual(DEFAULT_RENDER);
    expect(normalizeRender(undefined)).toEqual(DEFAULT_RENDER);
    expect(normalizeRender("lvgl")).toEqual(DEFAULT_RENDER);
  });

  it("keeps a valid stored config", () => {
    expect(normalizeRender({ target: "lvgl", durationMs: 400, ease: "easeOut" })).toEqual({
      target: "lvgl",
      durationMs: 400,
      ease: "easeOut",
    });
  });

  it("replaces an unknown target or easing with the default", () => {
    const r = normalizeRender({ target: "metal", ease: "bounce", durationMs: 300 });
    expect(r.target).toBe("web");
    expect(r.ease).toBe("easeInOut");
    expect(r.durationMs).toBe(300);
  });

  it("clamps the tween length into the slider's range", () => {
    expect(normalizeRender({ target: "lvgl", durationMs: 9999 }).durationMs).toBe(
      TWEEN_MS_RANGE.max,
    );
    expect(normalizeRender({ target: "lvgl", durationMs: 1 }).durationMs).toBe(TWEEN_MS_RANGE.min);
    expect(normalizeRender({ target: "lvgl", durationMs: -5 }).durationMs).toBe(
      DEFAULT_RENDER.durationMs,
    );
  });
});
