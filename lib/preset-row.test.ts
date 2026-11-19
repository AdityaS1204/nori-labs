import { describe, expect, it } from "vitest";

import { rowToPreset, type PresetRow } from "@/lib/preset-row";
import { DEFAULT_RENDER } from "@/lib/render-target";
import { NEUTRAL_FACE } from "@/lib/nori-face";

function row(overrides: Partial<PresetRow> = {}): PresetRow {
  return {
    id: "row-1",
    name: "Test",
    description: null,
    author_name: "Someone",
    author_handle: null,
    states: [{ id: "s1", label: "Neutral", face: NEUTRAL_FACE }],
    cover_state_id: "s1",
    accent: null,
    category: null,
    likes: null,
    user_id: null,
    is_public: true,
    render: null,
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("rowToPreset render config", () => {
  it("opens a row written before the render column as a web preset", () => {
    expect(rowToPreset(row()).render).toEqual(DEFAULT_RENDER);
  });

  it("carries a stored LVGL config through", () => {
    const preset = rowToPreset(
      row({ render: { target: "lvgl", durationMs: 320, ease: "easeOut" } }),
    );
    expect(preset.render).toEqual({ target: "lvgl", durationMs: 320, ease: "easeOut" });
  });

  it("falls back to the web target when the stored value is malformed", () => {
    const preset = rowToPreset(
      row({ render: { target: "metal" } as unknown as PresetRow["render"] }),
    );
    expect(preset.render.target).toBe("web");
  });
});
