import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import NoriFace from "@/components/robot-face/NoriFace";
import { NEUTRAL_FACE, type NoriEyeParams, type NoriFaceParams } from "@/lib/nori-face";

/**
 * Golden-pose snapshots. These pin the output of buildEyePath, buildBrowPath and
 * browCenterY so a geometry change cannot silently alter faces already authored
 * in the playground or shipped inside a face pack.
 */

const eye = (over: Partial<NoriEyeParams> = {}): NoriEyeParams => ({
  ...NEUTRAL_FACE.left,
  ...over,
});

const face = (over: Partial<NoriFaceParams> = {}): NoriFaceParams => ({
  ...NEUTRAL_FACE,
  ...over,
});

const poses: [string, NoriFaceParams][] = [
  ["neutral", NEUTRAL_FACE],
  [
    "happy: arc eyes",
    face({ left: eye({ shape: "arc" }), right: eye({ shape: "arc" }), color: "#9bffd0" }),
  ],
  [
    "angry: angled eyes with tilted brows",
    face({
      left: eye({ shape: "angle", tilt: 12 }),
      right: eye({ shape: "angle", tilt: 12 }),
      browsEnabled: true,
      leftBrow: { ...NEUTRAL_FACE.leftBrow, tilt: -18, arc: -6 },
      rightBrow: { ...NEUTRAL_FACE.rightBrow, tilt: -18, arc: -6 },
    }),
  ],
  [
    "surprised: wide circles, brows raised",
    face({
      gap: 190,
      left: eye({ shape: "circle", width: 90, height: 90 }),
      right: eye({ shape: "circle", width: 90, height: 90 }),
      browsEnabled: true,
      leftBrow: { ...NEUTRAL_FACE.leftBrow, offsetY: 40, arc: 10 },
      rightBrow: { ...NEUTRAL_FACE.rightBrow, offsetY: 40, arc: 10 },
    }),
  ],
  [
    "sleepy: squinted ovals, low glow",
    face({
      glow: 0.3,
      left: eye({ shape: "oval", openness: 0.18, offsetY: 24 }),
      right: eye({ shape: "oval", openness: 0.18, offsetY: 24 }),
    }),
  ],
  [
    "asymmetric: unlinked eyes",
    face({
      left: eye({ shape: "arc", width: 70, tilt: -8 }),
      right: eye({ shape: "bar", height: 60, radius: 30, offsetY: -12 }),
    }),
  ],
  [
    "brow clamped against the viewBox ceiling",
    face({
      left: eye({ height: 210, offsetY: -60 }),
      right: eye({ height: 210, offsetY: -60 }),
      browsEnabled: true,
      leftBrow: { ...NEUTRAL_FACE.leftBrow, offsetY: 80, arc: 30 },
      rightBrow: { ...NEUTRAL_FACE.rightBrow, offsetY: 80, arc: 30 },
    }),
  ],
  ["glow off", face({ glow: 0 })],
];

describe("NoriFace golden poses", () => {
  for (const [name, params] of poses) {
    it(name, () => {
      expect(renderToStaticMarkup(<NoriFace face={params} />)).toMatchSnapshot();
    });
  }
});

describe("NoriFace invariants", () => {
  it("renders no brow markup when brows are disabled", () => {
    const markup = renderToStaticMarkup(<NoriFace face={face({ browsEnabled: false })} />);
    const withBrows = renderToStaticMarkup(<NoriFace face={face({ browsEnabled: true })} />);
    expect(markup.match(/<path/g) ?? []).toHaveLength(0);
    expect(withBrows.match(/<path/g) ?? []).toHaveLength(2);
  });

  it("keeps a nearly-closed bar eye visible as a slit", () => {
    const markup = renderToStaticMarkup(
      <NoriFace face={face({ left: eye({ openness: 0 }), right: eye({ openness: 0 }) })} />,
    );
    // Floor is width * 0.2, so a 50-wide eye never collapses below 10 units.
    expect(markup).toContain('height="10"');
  });

  it("mirrors directional shapes onto the right eye only", () => {
    const markup = renderToStaticMarkup(
      <NoriFace face={face({ left: eye({ shape: "angle" }), right: eye({ shape: "angle" }) })} />,
    );
    expect(markup).toContain("scale(1 1)");
    expect(markup).toContain("scale(-1 1)");
  });
});
