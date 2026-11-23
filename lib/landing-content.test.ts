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
  WALKTHROUGH,
  WHAT_IT_IS,
  type MediaSlot,
} from "@/lib/landing-content";
import { FACE_GRID } from "@/lib/landing-faces";

const allMedia: MediaSlot[] = [
  HERO.media,
  WHAT_IT_IS.hero,
  ...WHAT_IT_IS.pair,
  WALKTHROUGH.fallback,
  TEACH_IT.media,
  ...CLOSING.gallery,
];

describe("landing content", () => {
  it("fills every slot the design defines", () => {
    expect(HERO.headline).toHaveLength(2);
    expect(WHAT_IT_IS.pair).toHaveLength(2);
    expect(WALKTHROUGH.stages).toHaveLength(4);
    expect(FACE_GRID).toHaveLength(4);
    expect(TEACH_IT.steps).toHaveLength(4);
    expect(SUPPORTING_DETAILS).toHaveLength(3);
    expect(HARDWARE.specs.length).toBeGreaterThanOrEqual(4);
  });

  it("offers the order carousel several angles, each ready for a photo", () => {
    expect(CLOSING.gallery.length).toBeGreaterThanOrEqual(2);
    for (const { slot, ratio } of CLOSING.gallery) {
      expect(slot.length).toBeGreaterThan(0);
      const [w, h] = ratio.split("/").map((n) => Number(n.trim()));
      expect(w).toBeGreaterThan(0);
      expect(h).toBeGreaterThan(0);
    }
  });

  it("places the inline mark inside the first headline line", () => {
    expect(HERO.headline[0].some((p) => typeof p !== "string" && p.mark)).toBe(true);
    expect(HERO.headline[1].every((p) => typeof p === "string")).toBe(true);
    expect(HERO.mark.src).toMatch(/^https:\/\/res\.cloudinary\.com\//);
  });

  it("keeps the production price and ship date consistent everywhere", () => {
    expect(HERO.body).toContain("$1,688");
    expect(CLOSING.price).toBe("$1,688");
    expect(HERO.body).toMatch(/fall 2026/i);
    expect(CLOSING.body).toMatch(/Fall 2026/);
    expect(CLOSING.headline.join(" ")).toMatch(/no deposit/i);
  });

  // A review found "Learn more" on three of the five buttons; it said nothing
  // about where it went, on a page whose job is an order.
  // Repeating one label for one destination is fine; the same label on two
  // different destinations is what made the buttons unreadable.
  it("gives every call to action a label that names its destination", () => {
    const ctas = [HERO.primaryCta, HERO.secondaryCta, THE_FACE.cta, TEACH_IT.cta, CLOSING.cta];
    const byLabel = new Map<string, string>();
    for (const { label, href } of ctas) {
      expect(label).not.toMatch(/learn more/i);
      expect(byLabel.get(label) ?? href).toBe(href);
      byLabel.set(label, href);
    }
  });

  // The numbered eyebrows ("01 / what it is") are gone, and with them the
  // renumbering every reorder of the page used to require.
  it("carries no section eyebrow label", () => {
    for (const section of [HERO, WHAT_IT_IS, TEACH_IT, THE_FACE, HARDWARE, CLOSING]) {
      expect(section).not.toHaveProperty("label");
    }
  });

  it("walks the body top to bottom, once per stage", () => {
    const ids = WALKTHROUGH.stages.map((s) => s.id);
    expect(ids).toEqual(["head", "arm", "torso", "base"]);

    // Cue points are fractions of the clip, in order, opening on frame one.
    const cues = WALKTHROUGH.stages.map((s) => s.at);
    expect(cues[0]).toBe(0);
    expect([...cues].sort((a, b) => a - b)).toEqual(cues);
    expect(Math.max(...cues)).toBeLessThan(1);
    for (const { title, body } of WALKTHROUGH.stages) {
      expect(title.length).toBeGreaterThan(0);
      expect(body.length).toBeGreaterThan(0);
    }
  });

  // The panel type is the one thing the walkthrough cannot source from the spec
  // sheet, so it is flagged on the stage instead of written as fact.
  it("flags the unbacked claim rather than asserting it", () => {
    const flagged = WALKTHROUGH.stages.filter((s) => s.unconfirmed);
    expect(flagged).toHaveLength(1);
    expect(flagged[0]!.id).toBe("head");
    for (const { value } of HARDWARE.specs) expect(value).not.toMatch(/touch/i);
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
    const ids = new Set([
      "intro",
      "what-it-is",
      "the-face",
      "hardware",
      "teach-it",
      "order",
    ]);
    const links = [
      ...NAV_LINKS,
      NAV_CTA,
      HERO.primaryCta,
      HERO.secondaryCta,
      THE_FACE.cta,
      TEACH_IT.cta,
      CLOSING.cta,
      ...FOOTER.columns.flatMap((c): readonly { href: string }[] => c.links),
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

  it("gives every nav preview clips, a poster and a label", () => {
    const media = [
      ...NAV_LINKS.map((item) => item.media),
      ...NAV_LINKS.flatMap((item) => item.items.map((child) => child.media)),
    ].filter((m) => m !== undefined);

    expect(media.length).toBeGreaterThanOrEqual(4);
    for (const { clips, poster, label } of media) {
      expect(clips.length).toBeGreaterThan(0);
      for (const src of clips) expect(src).toMatch(/^https:\/\/.+\.mp4$/);
      expect(poster).toMatch(/^https:\/\//);
      expect(label.length).toBeGreaterThan(0);
    }
  });

  // Hovering a link swaps the clip beside it, so the whole tab needs covering.
  it("gives the home tab a clip on every link", () => {
    const home = NAV_LINKS.find((item) => item.label === "In the home");
    expect(home?.items.every((child) => child.media)).toBe(true);
    expect(home?.items[0].media?.clips).toHaveLength(2);
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
    for (const { face, label, note } of FACE_GRID) {
      expect(label.length).toBeGreaterThan(0);
      expect(note.length).toBeGreaterThan(0);
      expect(face.left.openness).toBeGreaterThan(0);
      expect(face.right.openness).toBeGreaterThan(0);
    }
  });

  // The face is the robot's status display, so the grid shows what it is doing,
  // not how it feels. Moods belong in the community library instead.
  it("shows the face as robot states rather than moods", () => {
    expect(FACE_GRID.map((f) => f.id)).toEqual(["idle", "listening", "working", "needs-help"]);
    for (const { label, note } of FACE_GRID) {
      expect(label).not.toMatch(/happy|sad|sleepy|angry|excited/i);
      expect(note).not.toMatch(/happy|sad|sleepy|angry|excited/i);
    }
  });

  it("has no unresolved copy placeholders", () => {
    const blob = JSON.stringify({
      HERO,
      WHAT_IT_IS,
      THE_FACE,
      HARDWARE,
      TEACH_IT,
          CLOSING,
    });
    expect(blob).not.toMatch(/lorem|ipsum|TODO|TBD|xxx/i);
  });
});
