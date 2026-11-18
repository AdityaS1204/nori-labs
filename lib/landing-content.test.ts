import { describe, expect, it } from "vitest";

import {
  CLOSING,
  FOOTER,
  HARDWARE,
  HERO,
  NAV_CTA,
  NAV_LINKS,
  SUPPORTING_DETAILS,
  TEACH_IT,
  THE_FACE,
  WHAT_IT_IS,
  type MediaSlot,
} from "@/lib/landing-content";
import { FACE_GRID } from "@/lib/landing-faces";

const allMedia: MediaSlot[] = [
  HERO.media,
  WHAT_IT_IS.hero,
  ...WHAT_IT_IS.pair,
  ...HARDWARE.cards.map((c) => c.media),
  TEACH_IT.media,
  CLOSING.media,
];

describe("landing content", () => {
  it("fills every slot the design defines", () => {
    expect(HERO.headline).toHaveLength(2);
    expect(WHAT_IT_IS.pair).toHaveLength(2);
    expect(HARDWARE.cards).toHaveLength(4);
    expect(FACE_GRID).toHaveLength(4);
    expect(TEACH_IT.steps).toHaveLength(3);
    expect(SUPPORTING_DETAILS).toHaveLength(3);
    expect(HARDWARE.specs.length).toBeGreaterThanOrEqual(4);
  });

  it("keeps the production price and ship date consistent everywhere", () => {
    expect(HERO.body).toContain("$1,688");
    expect(CLOSING.price).toBe("$1,688");
    expect(HERO.body).toMatch(/fall 2026/i);
    expect(CLOSING.body).toMatch(/Fall 2026/);
    expect(CLOSING.headline.join(" ")).toMatch(/no deposit/i);
  });

  it("carries the real hardware specs through unchanged", () => {
    const byLabel = Object.fromEntries(HARDWARE.specs.map((s) => [s.label, s.value]));
    expect(byLabel.Arms).toContain("7+1 DOF");
    expect(byLabel.Arms).toContain("1.5kg");
    expect(byLabel.Lidar).toContain("12m");
    expect(byLabel.Cameras).toContain("720p");
    expect(byLabel.Battery).toContain("6-8 hours");
  });

  it("gives every media slot a marker, a known tone and a parseable ratio", () => {
    const seen = new Set<string>();
    for (const media of allMedia) {
      expect(media.slot.length).toBeGreaterThan(0);
      expect(["sage", "ink", "haze"]).toContain(media.tone);
      expect(media.ratio).toMatch(/^\d+ \/ \d+$/);
      expect(seen.has(media.slot)).toBe(false);
      seen.add(media.slot);
    }
  });

  it("points every in-page link at a section that exists", () => {
    const ids = new Set(["intro", "what-it-is", "the-face", "hardware", "teach-it", "order"]);
    const links = [
      ...NAV_LINKS,
      NAV_CTA,
      HERO.primaryCta,
      HERO.secondaryCta,
      THE_FACE.cta,
      TEACH_IT.cta,
      CLOSING.cta,
      ...FOOTER.links,
    ];
    const all = [...links, ...NAV_LINKS.flatMap((n) => n.items)];
    for (const { href } of all) {
      if (href.startsWith("#")) expect(ids).toContain(href.slice(1));
      else expect(href.startsWith("/")).toBe(true);
    }
  });

  it("gives every nav tab a dropdown with distinct children", () => {
    expect(NAV_LINKS.length).toBeGreaterThanOrEqual(3);
    for (const item of NAV_LINKS) {
      expect(item.items.length).toBeGreaterThanOrEqual(2);
      const labels = item.items.map((c) => c.label);
      expect(new Set(labels).size).toBe(labels.length);
      for (const child of item.items) expect(child.note.length).toBeGreaterThan(0);
    }
  });

  it("uses absolute https urls for socials", () => {
    expect(FOOTER.socials.length).toBeGreaterThan(0);
    for (const { href, label } of FOOTER.socials) {
      expect(href).toMatch(/^https:\/\//);
      expect(label.length).toBeGreaterThan(0);
    }
  });

  it("gives every grid face a unique id and a visible eye", () => {
    const ids = FACE_GRID.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const { face, label } of FACE_GRID) {
      expect(label.length).toBeGreaterThan(0);
      expect(face.left.openness).toBeGreaterThan(0);
      expect(face.right.openness).toBeGreaterThan(0);
    }
  });

  it("has no unresolved copy placeholders", () => {
    const blob = JSON.stringify({ HERO, WHAT_IT_IS, THE_FACE, HARDWARE, TEACH_IT, CLOSING });
    expect(blob).not.toMatch(/lorem|ipsum|TODO|TBD|xxx/i);
  });
});
