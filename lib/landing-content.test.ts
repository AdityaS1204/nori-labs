import { describe, expect, it } from "vitest";

import {
  CAPABILITIES,
  CLOSING,
  FAQ,
  FOOTER_LINKS,
  HARDWARE,
  HERO,
  IN_CONTEXT,
  NAV_LINKS,
  SOCIAL_LINKS,
  SUPPORTING_DETAILS,
  TEACHING,
  type MediaSlot,
} from "@/lib/landing-content";

const allMedia: MediaSlot[] = [
  HERO.media,
  IN_CONTEXT.media,
  TEACHING.media,
  HARDWARE.media,
  ...CAPABILITIES.map((c) => c.media),
];

describe("landing content", () => {
  it("fills every slot the wireframe defines", () => {
    expect(CAPABILITIES).toHaveLength(4);
    expect(TEACHING.steps).toHaveLength(3);
    expect(SUPPORTING_DETAILS).toHaveLength(3);
    expect(HARDWARE.specs.length).toBeGreaterThanOrEqual(4);
    expect(FAQ.length).toBeGreaterThanOrEqual(3);
  });

  it("keeps the production price and ship date consistent everywhere", () => {
    expect(HERO.headline).toContain("$1,688");
    expect(CLOSING.price).toBe("$1,688");
    expect(HERO.eyebrow).toMatch(/fall 2026/i);
    expect(CLOSING.body).toMatch(/Fall 2026/);
    expect(HERO.availability).toMatch(/no deposit/i);
  });

  it("carries the real hardware specs through unchanged", () => {
    const byLabel = Object.fromEntries(HARDWARE.specs.map((s) => [s.label, s.value]));
    expect(byLabel.Arms).toContain("7+1 DOF");
    expect(byLabel.Arms).toContain("1.5kg");
    expect(byLabel.Lidar).toContain("12m");
    expect(byLabel.Cameras).toContain("720p");
    expect(byLabel.Battery).toContain("6-8 hours");
  });

  it("gives every capability a stable id and a media slot", () => {
    const ids = CAPABILITIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of CAPABILITIES) {
      expect(c.title.length).toBeGreaterThan(0);
      expect(c.body.length).toBeGreaterThan(0);
    }
  });

  it("gives every media slot a label and a parseable ratio", () => {
    for (const media of allMedia) {
      expect(media.label.length).toBeGreaterThan(0);
      expect(media.ratio).toMatch(/^\d+ \/ \d+$/);
    }
  });

  it("points every in-page nav and footer link at a section that exists", () => {
    const sectionIds = new Set(["context", "capabilities", "teaching", "hardware", "faq"]);
    for (const { href } of [...NAV_LINKS, ...FOOTER_LINKS]) {
      if (href.startsWith("#")) expect(sectionIds).toContain(href.slice(1));
      else expect(href.startsWith("/")).toBe(true);
    }
  });

  it("uses absolute https urls for socials", () => {
    expect(SOCIAL_LINKS.length).toBeGreaterThan(0);
    for (const { href, label } of SOCIAL_LINKS) {
      expect(href).toMatch(/^https:\/\//);
      expect(label.length).toBeGreaterThan(0);
    }
  });

  it("has no unresolved copy placeholders", () => {
    const blob = JSON.stringify({
      HERO,
      IN_CONTEXT,
      CAPABILITIES,
      TEACHING,
      HARDWARE,
      FAQ,
      CLOSING,
    });
    expect(blob).not.toMatch(/lorem|ipsum|TODO|TBD|xxx/i);
  });
});
