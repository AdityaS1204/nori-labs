import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FaceControls from "@/components/playground/FaceControls";
import { NEUTRAL_FACE, type NoriFaceParams } from "@/lib/nori-face";
import { DEFAULT_RENDER, type RenderConfig } from "@/lib/render-target";
import { cloneFace } from "@/lib/presets";

const LVGL: RenderConfig = { target: "lvgl", durationMs: 300, ease: "easeOut" };

function markup(render: RenderConfig, face: NoriFaceParams = NEUTRAL_FACE): string {
  return renderToStaticMarkup(
    <FaceControls
      face={face}
      render={render}
      onRenderChange={() => {}}
      linked
      onToggleLink={() => {}}
      onGlobalChange={() => {}}
      onColorChange={() => {}}
      onEyeChange={() => {}}
      onEyeShapeChange={() => {}}
      onEyeCustomSvgChange={() => {}}
      onToggleBrows={() => {}}
      onBrowChange={() => {}}
      onToggleMouth={() => {}}
      onMouthChange={() => {}}
      onMouthShapeChange={() => {}}
      gazeEnabled={false}
      gazeMode="cursor"
      onToggleGaze={() => {}}
      onGazeModeChange={() => {}}
    />,
  );
}

describe("FaceControls on the web target", () => {
  const html = markup(DEFAULT_RENDER);

  it("offers the glow and the pasted SVG", () => {
    expect(html).toContain("Glow");
    expect(html).toContain('aria-label="Custom"');
  });

  it("hides the tween controls, since the web target springs", () => {
    expect(html).not.toContain("Duration");
    expect(html).not.toContain("LVGL mode");
  });
});

describe("FaceControls on the LVGL target", () => {
  const html = markup(LVGL);

  it("drops the glow slider", () => {
    expect(html).not.toContain("Glow");
    expect(html).toContain("Eye gap");
  });

  it("drops the pasted-SVG shape but keeps every shape LVGL can draw", () => {
    expect(html).not.toContain('aria-label="Custom"');
    for (const shape of ["Bar", "Circle", "Oval", "Arc", "Angle"]) {
      expect(html).toContain(`aria-label="${shape}"`);
    }
  });

  it("offers a tween duration and easing in place of the spring", () => {
    expect(html).toContain("Duration");
    expect(html).toContain("In-out");
  });

  it("states what the engine leaves out", () => {
    expect(html).toContain("LVGL mode");
    expect(html).toContain("glow and bloom");
  });

  it("stays calm about the glow every neutral face carries", () => {
    expect(NEUTRAL_FACE.glow).toBeGreaterThan(0);
    expect(html).not.toContain("fall back to a bar");
  });

  it("names a pasted-SVG eye it had to replace with a bar", () => {
    const face = cloneFace(NEUTRAL_FACE);
    face.left = { ...face.left, shape: "custom", customSvg: "<svg/>" };
    expect(markup(LVGL, face)).toContain("Custom eyes fall back to a bar");
  });
});

describe("FaceControls mouth section", () => {
  it("shows the mouth toggle and hides sliders while off", () => {
    const html = markup(DEFAULT_RENDER);
    expect(html).toContain("Show mouth");
    expect(html).not.toContain('aria-label="Smile"');
  });

  it("shows the mouth sliders and shape picker when the mouth is on", () => {
    const face = cloneFace(NEUTRAL_FACE);
    face.mouthEnabled = true;
    const html = markup(DEFAULT_RENDER, face);
    expect(html).toContain('aria-label="Smile"'); // the curve slider
    expect(html).toContain('aria-label="Line"'); // the shape picker
  });

  it("shows Weight only for the arc shape", () => {
    const line = cloneFace(NEUTRAL_FACE);
    line.mouthEnabled = true;
    expect(markup(DEFAULT_RENDER, line)).not.toContain('aria-label="Weight"');

    const arc = cloneFace(NEUTRAL_FACE);
    arc.mouthEnabled = true;
    arc.mouth = { ...arc.mouth, shape: "arc" };
    expect(markup(DEFAULT_RENDER, arc)).toContain('aria-label="Weight"');
  });
});
