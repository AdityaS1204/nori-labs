import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import Capabilities from "./Capabilities";
import FaqAndClosing from "./FaqAndClosing";
import HardwareDetails from "./HardwareDetails";
import Hero from "./Hero";
import InContext from "./InContext";
import SiteFooter from "./SiteFooter";
import TeachingFlow from "./TeachingFlow";
import {
  CAPABILITIES,
  CLOSING,
  FAQ,
  HARDWARE,
  HERO,
  IN_CONTEXT,
  SOCIAL_LINKS,
  SUPPORTING_DETAILS,
  TEACHING,
} from "@/lib/landing-content";

const strip = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

const decode = (html: string) =>
  html
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const text = (node: React.ReactElement) => decode(strip(renderToStaticMarkup(node)));
const markup = (node: React.ReactElement) => decode(renderToStaticMarkup(node));

describe("Hero", () => {
  const html = markup(<Hero />);
  const body = text(<Hero />);

  it("renders headline, eyebrow and both calls to action", () => {
    expect(body).toContain(HERO.headline);
    expect(body).toContain(HERO.eyebrow);
    expect(body).toContain(HERO.primaryCta.label);
    expect(body).toContain(HERO.secondaryCta.label);
    expect(html).toContain(`href="${HERO.primaryCta.href}"`);
  });

  it("uses a single h1", () => {
    expect(html.match(/<h1\b/g)).toHaveLength(1);
  });

  it("renders every supporting detail", () => {
    for (const { label, value } of SUPPORTING_DETAILS) {
      expect(body).toContain(label);
      expect(body).toContain(value);
    }
  });
});

describe("InContext", () => {
  it("renders the headline, caption and every chapter tab", () => {
    const body = text(<InContext />);
    expect(body).toContain(IN_CONTEXT.headline);
    expect(body).toContain(IN_CONTEXT.videoCaption.title);
    for (const chapter of IN_CONTEXT.chapters) expect(body).toContain(chapter);
  });

  it("marks exactly one chapter tab selected on first paint", () => {
    const html = markup(<InContext />);
    expect(html.match(/aria-selected="true"/g)).toHaveLength(1);
  });
});

describe("Capabilities", () => {
  const html = markup(<Capabilities />);

  it("renders every capability title", () => {
    const body = text(<Capabilities />);
    for (const { title } of CAPABILITIES) expect(body).toContain(title);
  });

  it("renders every capability body server-side so the copy is crawlable", () => {
    const body = text(<Capabilities />);
    for (const { body: copy } of CAPABILITIES) expect(body).toContain(copy);
  });

  it("marks exactly one row current on first paint", () => {
    expect(html.match(/aria-current="true"/g)).toHaveLength(1);
  });
});

describe("TeachingFlow", () => {
  it("renders the headline, the lab cta and all three steps in order", () => {
    const body = text(<TeachingFlow />);
    expect(body).toContain(TEACHING.headline);
    expect(body).toContain(TEACHING.cta.label);

    const positions = TEACHING.steps.map((s) => body.indexOf(s.title));
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });
});

describe("HardwareDetails", () => {
  it("renders every spec label and value", () => {
    const body = text(<HardwareDetails />);
    expect(body).toContain(HARDWARE.headline);
    for (const { label, value } of HARDWARE.specs) {
      expect(body).toContain(label);
      expect(body).toContain(value);
    }
  });
});

describe("FaqAndClosing", () => {
  const html = markup(<FaqAndClosing />);
  const body = text(<FaqAndClosing />);

  it("renders every question and answer", () => {
    for (const { question, answer } of FAQ) {
      expect(body).toContain(question);
      expect(body).toContain(answer);
    }
  });

  it("renders answers in details elements so they work without javascript", () => {
    expect(html.match(/<details\b/g)).toHaveLength(FAQ.length);
  });

  it("renders the closing price card and its cta", () => {
    expect(body).toContain(CLOSING.price);
    expect(body).toContain(CLOSING.headline);
    expect(html).toContain(`href="${CLOSING.cta.href}"`);
  });
});

describe("SiteFooter", () => {
  const html = markup(<SiteFooter />);

  it("opens every social link in a new tab with a safe rel", () => {
    for (const { href } of SOCIAL_LINKS) expect(html).toContain(`href="${href}"`);
    expect(html.match(/target="_blank"/g)).toHaveLength(SOCIAL_LINKS.length);
    expect(html.match(/rel="noreferrer noopener"/g)).toHaveLength(SOCIAL_LINKS.length);
  });

  it("labels every social link for screen readers", () => {
    for (const { label } of SOCIAL_LINKS) expect(html).toContain(`aria-label="${label}"`);
  });
});

describe("placeholder media", () => {
  it("labels each placeholder as an image for assistive tech", () => {
    const all = [
      markup(<Hero />),
      markup(<InContext />),
      markup(<Capabilities />),
      markup(<TeachingFlow />),
      markup(<HardwareDetails />),
    ].join("");
    expect(all.match(/aria-label="Placeholder: /g)?.length).toBe(5);
  });
});
