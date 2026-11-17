import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import Closing from "./Closing";
import Hardware from "./Hardware";
import Hero from "./Hero";
import SiteFooter from "./SiteFooter";
import TeachIt from "./TeachIt";
import TheFace from "./TheFace";
import WhatItIs from "./WhatItIs";
import {
  CLOSING,
  FOOTER,
  HARDWARE,
  HERO,
  SUPPORTING_DETAILS,
  TEACH_IT,
  THE_FACE,
  WHAT_IT_IS,
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

  it("renders both headline lines, the label and both calls to action", () => {
    const body = text(<Hero />);
    for (const line of HERO.headline) expect(body).toContain(line);
    expect(body).toContain(HERO.primaryCta.label);
    expect(body).toContain(HERO.secondaryCta.label);
    expect(html).toContain(`href="${HERO.primaryCta.href}"`);
  });

  it("uses a single h1", () => {
    expect(html.match(/<h1\b/g)).toHaveLength(1);
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
      expect(html).toContain(`aria-label="Placeholder: ${m.slot}"`);
    }
  });

  it("sets the overlay headline over the lead video", () => {
    expect(text(<WhatItIs />)).toContain(WHAT_IT_IS.hero.overlay);
  });
});

describe("TheFace", () => {
  const html = markup(<TheFace />);

  it("renders the headline, body and playground cta", () => {
    const body = text(<TheFace />);
    expect(body).toContain(THE_FACE.headline);
    expect(body).toContain(THE_FACE.cta.label);
  });

  it("labels all four expressions", () => {
    const body = text(<TheFace />);
    for (const { label } of FACE_GRID) expect(body).toContain(label);
  });

  it("draws each face with the real svg renderer rather than mock shapes", () => {
    expect(html.match(/<svg/g)?.length).toBeGreaterThanOrEqual(FACE_GRID.length);
    expect(html).toContain('viewBox="0 0 440 320"');
  });
});

describe("Hardware", () => {
  it("renders every mosaic card title and caption", () => {
    const body = text(<Hardware />);
    expect(body).toContain(HARDWARE.headline);
    for (const { title, caption } of HARDWARE.cards) {
      expect(body).toContain(title);
      expect(body).toContain(caption);
    }
  });

  it("renders every spec label and value", () => {
    const body = text(<Hardware />);
    for (const { label, value } of HARDWARE.specs) {
      expect(body).toContain(label);
      expect(body).toContain(value);
    }
  });
});

describe("TeachIt", () => {
  it("renders the headline, cta and all three steps in order", () => {
    const body = text(<TeachIt />);
    expect(body).toContain(TEACH_IT.headline);
    expect(body).toContain(TEACH_IT.cta.label);
    const positions = TEACH_IT.steps.map((s) => body.indexOf(s.title));
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });
});

describe("Closing", () => {
  it("renders both headline lines, the price and the cta", () => {
    const body = text(<Closing />);
    for (const line of CLOSING.headline) expect(body).toContain(line);
    expect(body).toContain(CLOSING.price);
    expect(markup(<Closing />)).toContain(`href="${CLOSING.cta.href}"`);
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
});

describe("placeholder media", () => {
  it("labels every placeholder as an image for assistive tech", () => {
    const all = [
      markup(<Hero />),
      markup(<WhatItIs />),
      markup(<Hardware />),
      markup(<TeachIt />),
      markup(<Closing />),
    ].join("");
    expect(all.match(/aria-label="Placeholder: /g)?.length).toBe(10);
  });
});
