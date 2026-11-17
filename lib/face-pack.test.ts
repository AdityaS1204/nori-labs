import { describe, expect, it } from "vitest";

import {
  DEFAULT_AMBIENT,
  DEFAULT_TRANSITION,
  FacePackError,
  SCHEMA_VERSION,
  neutralPack,
  normalizeHex,
  packFileName,
  packState,
  parsePack,
  presetToPack,
  slugifyStateId,
} from "@/lib/face-pack";
import { NEUTRAL_FACE } from "@/lib/nori-face";
import { cloneFace, newPreset, type Preset } from "@/lib/presets";

function presetWith(labels: string[]): Preset {
  const base = newPreset();
  const states = labels.map((label, i) => ({
    id: `uuid-${i}`,
    label,
    face: cloneFace(NEUTRAL_FACE),
  }));
  return { ...base, name: "Test pack", states, coverStateId: states[0].id };
}

describe("presetToPack", () => {
  it("slugifies labels into SDK-friendly state ids", () => {
    const pack = presetToPack(presetWith(["Happy", "Deep Thinking", "Error!"]));
    expect(pack.states.map((s) => s.id)).toEqual(["happy", "deep-thinking", "error"]);
    expect(pack.states.map((s) => s.label)).toEqual(["Happy", "Deep Thinking", "Error!"]);
  });

  it("de-duplicates colliding slugs", () => {
    const pack = presetToPack(presetWith(["Happy", "happy", "HAPPY"]));
    expect(pack.states.map((s) => s.id)).toEqual(["happy", "happy-2", "happy-3"]);
  });

  it("falls back to a positional id when a label has no usable characters", () => {
    const pack = presetToPack(presetWith(["***"]));
    expect(pack.states[0].id).toBe("state-1");
  });

  it("points defaultState at the cover state", () => {
    const preset = presetWith(["Neutral", "Happy"]);
    const pack = presetToPack({ ...preset, coverStateId: preset.states[1].id });
    expect(pack.defaultState).toBe("happy");
  });

  it("falls back to the first state when the cover id is dangling", () => {
    const preset = presetWith(["Neutral", "Happy"]);
    const pack = presetToPack({ ...preset, coverStateId: "gone" });
    expect(pack.defaultState).toBe("neutral");
  });

  it("embeds the playground's motion defaults so the export matches the preview", () => {
    const pack = presetToPack(presetWith(["Neutral"]));
    expect(pack.transition).toEqual(DEFAULT_TRANSITION);
    expect(pack.ambient).toEqual(DEFAULT_AMBIENT);
    expect(pack.schema).toBe(SCHEMA_VERSION);
    expect(pack.background).toBe("#000000");
    expect(pack.fit).toBe("contain");
  });

  it("names an untitled preset rather than exporting an empty name", () => {
    const pack = presetToPack({ ...presetWith(["Neutral"]), name: "   " });
    expect(pack.name).toBe("Untitled face");
  });

  it("rejects a preset with no states", () => {
    expect(() => presetToPack({ ...presetWith(["Neutral"]), states: [] })).toThrow(FacePackError);
  });
});

describe("shipped motion defaults", () => {
  // These were hardcoded in NoriFaceLive before the pack format existed. They are
  // the tuned "feel" of the playground, so pin the numbers, not just the shape.
  it("matches the values the playground was tuned with", () => {
    expect(DEFAULT_TRANSITION.spring).toEqual({ stiffness: 300, damping: 30, mass: 0.6 });
    expect(DEFAULT_AMBIENT.blink).toEqual({
      closeMs: 70,
      closeEase: "easeIn",
      openMs: 130,
      openEase: "easeOut",
      closedScale: 0.06,
      everyMs: [2500, 6000],
    });
    expect(DEFAULT_AMBIENT.gaze).toEqual({
      mode: "random",
      clamp: [24, 16],
      retargetMs: [650, 2850],
      spring: { stiffness: 140, damping: 18, mass: 0.6 },
    });
  });
});

describe("parsePack", () => {
  it("round-trips an exported pack unchanged", () => {
    const pack = presetToPack(presetWith(["Neutral", "Happy"]));
    const reparsed = parsePack(JSON.parse(JSON.stringify(pack)));
    expect(reparsed).toEqual(pack);
    // Idempotent: parsing twice is a fixed point.
    expect(parsePack(JSON.parse(JSON.stringify(reparsed)))).toEqual(reparsed);
  });

  it("fills in motion defaults when a hand-written pack omits them", () => {
    const pack = parsePack({
      schema: 1,
      name: "Minimal",
      defaultState: "neutral",
      states: [{ id: "neutral", label: "Neutral", face: NEUTRAL_FACE }],
    });
    expect(pack.ambient).toEqual(DEFAULT_AMBIENT);
    expect(pack.transition).toEqual(DEFAULT_TRANSITION);
    expect(pack.background).toBe("#000000");
  });

  it("merges a partial ambient block instead of discarding the rest", () => {
    const pack = parsePack({
      schema: 1,
      defaultState: "neutral",
      ambient: { blink: { closeMs: 40 }, gaze: { mode: "off" } },
      states: [{ id: "neutral", face: NEUTRAL_FACE }],
    });
    expect(pack.ambient.blink.closeMs).toBe(40);
    expect(pack.ambient.blink.openMs).toBe(DEFAULT_AMBIENT.blink.openMs);
    expect(pack.ambient.gaze.mode).toBe("off");
    expect(pack.ambient.gaze.clamp).toEqual(DEFAULT_AMBIENT.gaze.clamp);
  });

  it("backfills eye fields written before shape and thickness existed", () => {
    const legacyEye = { ...NEUTRAL_FACE.left } as Record<string, unknown>;
    delete legacyEye.shape;
    delete legacyEye.thickness;
    const pack = parsePack({
      schema: 1,
      defaultState: "neutral",
      states: [
        { id: "neutral", face: { ...NEUTRAL_FACE, left: legacyEye, right: legacyEye } },
      ],
    });
    expect(pack.states[0].face.left.shape).toBe("bar");
    expect(pack.states[0].face.left.thickness).toBe(16);
  });

  it("defaults a missing label to the state id", () => {
    const pack = parsePack({
      schema: 1,
      defaultState: "neutral",
      states: [{ id: "neutral", face: NEUTRAL_FACE }],
    });
    expect(pack.states[0].label).toBe("neutral");
  });

  it("rejects an unknown schema version", () => {
    expect(() =>
      parsePack({ schema: 2, defaultState: "a", states: [{ id: "a", face: NEUTRAL_FACE }] }),
    ).toThrow(/unsupported schema/);
  });

  it("rejects a dangling defaultState", () => {
    expect(() =>
      parsePack({ schema: 1, defaultState: "nope", states: [{ id: "a", face: NEUTRAL_FACE }] }),
    ).toThrow(/does not match any state id/);
  });

  it("rejects duplicate state ids", () => {
    expect(() =>
      parsePack({
        schema: 1,
        defaultState: "a",
        states: [
          { id: "a", face: NEUTRAL_FACE },
          { id: "a", face: NEUTRAL_FACE },
        ],
      }),
    ).toThrow(/duplicate state id/);
  });

  it("rejects an empty states array", () => {
    expect(() => parsePack({ schema: 1, defaultState: "a", states: [] })).toThrow(/non-empty/);
  });

  it("rejects a malformed motion value rather than silently defaulting", () => {
    expect(() =>
      parsePack({
        schema: 1,
        defaultState: "a",
        transition: { spring: { stiffness: "fast" } },
        states: [{ id: "a", face: NEUTRAL_FACE }],
      }),
    ).toThrow(/must be a finite number/);
  });

  it("accepts a descending gaze clamp, which is [x, y] and not a range", () => {
    const pack = parsePack({
      schema: 1,
      defaultState: "a",
      ambient: { gaze: { clamp: [40, 8] } },
      states: [{ id: "a", face: NEUTRAL_FACE }],
    });
    expect(pack.ambient.gaze.clamp).toEqual([40, 8]);
  });

  it("rejects an inverted range", () => {
    expect(() =>
      parsePack({
        schema: 1,
        defaultState: "a",
        ambient: { blink: { everyMs: [6000, 2500] } },
        states: [{ id: "a", face: NEUTRAL_FACE }],
      }),
    ).toThrow(/max must be >= min/);
  });

  it("rejects a face missing its eye objects", () => {
    expect(() =>
      parsePack({
        schema: 1,
        defaultState: "a",
        states: [{ id: "a", face: { ...NEUTRAL_FACE, left: undefined } }],
      }),
    ).toThrow(/face\.left must be an object/);
  });
});

describe("normalizeHex", () => {
  it("expands 3-digit hex so the glow suffix stays valid", () => {
    expect(normalizeHex("#abc", "color")).toBe("#aabbcc");
  });

  it("lowercases 6-digit hex", () => {
    expect(normalizeHex("#EAF3FF", "color")).toBe("#eaf3ff");
  });

  it("rejects non-hex colours", () => {
    expect(() => normalizeHex("rgb(1,2,3)", "color")).toThrow(FacePackError);
    expect(() => normalizeHex("red", "color")).toThrow(FacePackError);
    expect(() => normalizeHex(123, "color")).toThrow(FacePackError);
  });
});

describe("packFileName", () => {
  it("slugifies a pack name", () => {
    expect(packFileName("Nori Default Moods")).toBe("nori-default-moods");
  });

  it("falls back to a generic basename when the name has no usable characters", () => {
    expect(packFileName("***")).toBe("face");
    expect(packFileName("")).toBe("face");
  });
});

describe("slugifyStateId", () => {
  it("collapses runs of punctuation and trims the edges", () => {
    expect(slugifyStateId("  Low   battery!! ", 0)).toBe("low-battery");
  });
});

describe("neutralPack", () => {
  it("is a valid pack", () => {
    const pack = neutralPack();
    expect(parsePack(JSON.parse(JSON.stringify(pack)))).toEqual(pack);
    expect(packState(pack, "neutral")?.label).toBe("Neutral");
    expect(packState(pack, "missing")).toBeUndefined();
  });
});
