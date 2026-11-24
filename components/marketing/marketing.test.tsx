import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import Closing from "./Closing";
import FeatureBento from "./FeatureBento";
import Hardware from "./Hardware";
import Hero from "./Hero";
import SiteFooter from "./SiteFooter";
import WhatItIs from "./WhatItIs";
import {
  CLOSING,
  FOOTER,
  HARDWARE,
  HERO,
  MARK,
  SUPPORTING_DETAILS,
  TEACH_IT,
  THE_FACE,
  WALKTHROUGH,
  WHAT_IT_IS,
  type MediaSlot,
} from "@/lib/landing-content";
import { FACE_GRID } from "@/lib/landing-faces";

const decode = (html: string) =>
  html
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const markup = (node: React.ReactElement) => decode(renderToStaticMarkup(node));
const text = (node: React.ReactElement) =>
  markup(node).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

describe("Hero", () => {
  const html = markup(<Hero />);

  it("renders both headline lines and both calls to action", () => {
    const body = text(<Hero />);
    for (const line of HERO.headline) {
      const words = line.filter((p): p is string => typeof p === "string").join(" ");
      expect(body).toContain(words);
    }
    expect(body).toContain(HERO.primaryCta.label);
    expect(body).toContain(HERO.secondaryCta.label);
    expect(html).toContain(`href="${HERO.primaryCta.href}"`);
  });

  it("uses a single h1", () => {
    expect(html.match(/<h1\b/g)).toHaveLength(1);
  });

  it("sets the nori mark inline in the headline, hidden from assistive tech", () => {
    const h1 = html.slice(html.indexOf("<h1"), html.indexOf("</h1>"));
    expect(h1).toContain(`src="${HERO.mark.src}"`);
    expect(h1).toContain('aria-hidden="true"');
  });

  it("renders every supporting detail", () => {
    const body = text(<Hero />);
    for (const { label, value } of SUPPORTING_DETAILS) {
      expect(body).toContain(label);
      expect(body).toContain(value);
    }
  });
});

describe("WhatItIs", () => {
  it("renders the headline and all three media slots", () => {
    const body = text(<WhatItIs />);
    expect(body).toContain(WHAT_IT_IS.headline);
    const html = markup(<WhatItIs />);
    for (const m of [WHAT_IT_IS.hero, ...WHAT_IT_IS.pair]) {
      if (m.src) expect(html).toContain(`src="${m.src}"`);
      else expect(html).toContain(`aria-label="Placeholder: ${m.slot}"`);
    }
  });

  it("sets the overlay headline over the lead video", () => {
    expect(text(<WhatItIs />)).toContain(WHAT_IT_IS.hero.overlay);
  });
});

// The two old sections ("Teach it a skill" and "Its face tells you what it's
// doing") are now one bento grid, so both halves — and both nav anchors — have
// to survive in the single component.
describe("FeatureBento", () => {
  const el = <FeatureBento />;
  const html = markup(el);
  const body = text(el);

  it("carries the teaching half: headline, the library cta, and every step in order", () => {
    expect(body).toContain(TEACH_IT.headline);
    expect(body).toContain(TEACH_IT.cta.label);
    expect(html).toContain(`href="${TEACH_IT.cta.href}"`);
    const positions = TEACH_IT.steps.map((s) => body.indexOf(s.title));
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it("carries the face half: headline, playground cta, and every state said in full", () => {
    expect(body).toContain(THE_FACE.headline);
    expect(body).toContain(THE_FACE.cta.label);
    expect(html).toContain(`href="${THE_FACE.cta.href}"`);
    for (const { label, note } of FACE_GRID) {
      expect(body).toContain(label);
      expect(body).toContain(note);
    }
  });

  it("draws each face with the real svg renderer rather than mock shapes", () => {
    expect(html.match(/<svg/g)?.length).toBeGreaterThanOrEqual(FACE_GRID.length);
    expect(html).toContain('viewBox="0 0 440 320"');
  });

  it("keeps both section anchors and a labelled heading", () => {
    expect(html).toContain('id="teach-it"');
    expect(html).toContain('id="the-face"');
    expect(html).toContain('id="bento-headline"');
  });
});

describe("Hardware", () => {
  // The server render is the walkthrough's list mode, so every stage has to be
  // in the markup: that is what a crawler, a no-JS reader and a failed
  // hydration all get instead of three captions stuck at opacity 0.
  it("renders the headline and every walkthrough stage", () => {
    const body = text(<Hardware />);
    expect(body).toContain(HARDWARE.headline);
    for (const { title, body: copy } of WALKTHROUGH.stages) {
      expect(body).toContain(title);
      expect(body).toContain(copy);
    }
  });

  it("marks the unbacked claim exactly once", () => {
    expect(text(<Hardware />).match(/unconfirmed/g)).toHaveLength(1);
  });

  // The server render is list mode, which hands the clip over with controls
  // rather than scrubbing it, so the footage is reachable without JS.
  it("serves the walkthrough clip with its poster", () => {
    const html = markup(<Hardware />);
    expect(html).toContain(`src="${WALKTHROUGH.clip.src}"`);
    expect(html).toContain(`poster="${WALKTHROUGH.clip.poster}"`);
    expect(html).toContain("controls");
    expect(html).not.toContain("autoplay");
  });

  it("renders every spec label and value", () => {
    const body = text(<Hardware />);
    for (const { label, value } of HARDWARE.specs) {
      expect(body).toContain(label);
      expect(body).toContain(value);
    }
  });
});

describe("Closing", () => {
  it("renders both headline lines, the price and the cta", () => {
    const body = text(<Closing />);
    for (const line of CLOSING.headline) expect(body).toContain(line);
    expect(body).toContain(CLOSING.price);
    expect(markup(<Closing />)).toContain(`href="${CLOSING.cta.href}"`);
  });

  it("carries the angle carousel with every slide and its controls", () => {
    const html = markup(<Closing />);
    // Each slide is reachable: the dots label every angle even though only the
    // first renders server-side.
    for (const { slot } of CLOSING.gallery) expect(html).toContain(`aria-label="${slot}"`);
    // The dots live in a glass page-control pill floated over the image.
    expect(html).toContain('aria-label="Choose an angle"');
    expect(html).toContain("backdrop-blur-md");
    expect(html).toContain('aria-roledescription="carousel"');
  });
});

describe("SiteFooter", () => {
  const html = markup(<SiteFooter />);

  it("opens every social link in a new tab with a safe rel", () => {
    for (const { href } of FOOTER.socials) expect(html).toContain(`href="${href}"`);
    expect(html.match(/target="_blank"/g)).toHaveLength(FOOTER.socials.length);
    expect(html.match(/rel="noreferrer noopener"/g)).toHaveLength(FOOTER.socials.length);
  });

  it("renders the draft note", () => {
    expect(text(<SiteFooter />)).toContain(FOOTER.note);
  });

  it("locks the home link up as the mark beside the wordmark", () => {
    const home = html.slice(html.indexOf('aria-label="Nori Robotics home"'));
    const link = home.slice(0, home.indexOf("</a>"));
    expect(link).toContain(`src="${MARK.src}"`);
    expect(link).toContain("font-display");
    expect(link).toContain("nori");
  });
});

describe("scroll entrance", () => {
  const pages = [
    markup(<Hero />),
    markup(<WhatItIs />),
    markup(<FeatureBento />),
    markup(<Hardware />),
    markup(<Closing />),
  ];

  // motion writes `initial` as inline style during SSR, so a fade from 0 would
  // ship the page with its content invisible until hydration finishes.
  it("never ships hidden content in the server-rendered markup", () => {
    for (const html of pages) {
      expect(html).not.toMatch(/opacity:\s*0[^.\d]/);
      expect(html).not.toMatch(/visibility:\s*hidden/);
    }
  });

  // The squircle clip can only be drawn from a measured box, so the server
  // render must fall back to a plain radius rather than an empty clip path,
  // which would hide the element until hydration.
  it("never ships an unmeasured clip path", () => {
    for (const html of pages) {
      expect(html).not.toContain("clip-path");
      for (const [, radius, fallback] of html.matchAll(
        /data-squircle="(\d+)"[^>]*style="[^"]*border-radius:(\d+)px/g,
      )) {
        expect(fallback).toBe(radius);
      }
    }
    const squircled = pages.join("").match(/data-squircle=/g) ?? [];
    expect(squircled.length).toBeGreaterThan(5);
  });

  it("starts each revealed block offset rather than faded", () => {
    const all = pages.join("");
    expect(all).toMatch(/translateY\(22px\)|translateY\(22\)/);
  });
});

const ALL_SLOTS: MediaSlot[] = [HERO.media, WHAT_IT_IS.hero, ...WHAT_IT_IS.pair];

// Hardware and the bento are left out: Hardware's only footage is the
// walkthrough clip (not a MediaSlot), and the bento renders faux UI rather than
// any media slot, so neither feeds the counts below.
const everySection = [markup(<Hero />), markup(<WhatItIs />), markup(<Closing />)].join("");

describe("media slots", () => {
  it("renders a looping muted video for every filled slot", () => {
    const filled = ALL_SLOTS.filter((m) => m.src);
    expect(filled.length).toBe(4);
    for (const m of filled) {
      expect(everySection).toContain(`src="${m.src}"`);
      // A filled slot is footage, not a placeholder graphic.
      expect(everySection).not.toContain(`aria-label="Placeholder: ${m.slot}"`);
    }
    expect(everySection.match(/<video/g)?.length).toBe(filled.length);
    expect(everySection.match(/loop=""|loop/g)?.length).toBeGreaterThanOrEqual(filled.length);
  });

  it("never shows the play affordance on a slot that already has footage", () => {
    for (const m of ALL_SLOTS) {
      if (m.src) expect(m.video).toBeFalsy();
    }
  });
});
