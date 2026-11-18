import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import TabNav from "./TabNav";
import { NAV_CTA, NAV_LINKS } from "@/lib/landing-content";

const decode = (html: string) =>
  html.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, "&");

const html = decode(renderToStaticMarkup(<TabNav />));
const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

describe("TabNav", () => {
  it("renders the wordmark, every tab label and the cta", () => {
    expect(text).toContain("nori");
    for (const { label } of NAV_LINKS) expect(text).toContain(label);
    expect(text).toContain(NAV_CTA.label);
    expect(html).toContain(`href="${NAV_CTA.href}"`);
  });

  it("links each tab at its own section", () => {
    for (const { href } of NAV_LINKS) expect(html).toContain(`href="${href}"`);
  });

  it("renders closed, with no dropdown panel in the server markup", () => {
    for (const item of NAV_LINKS) {
      for (const child of item.items) expect(text).not.toContain(child.note);
    }
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain('aria-expanded="true"');
  });

  it("keeps the nav itself visible rather than fading it in", () => {
    expect(html).not.toMatch(/opacity:\s*0[^.\d]/);
    expect(html).not.toMatch(/visibility:\s*hidden/);
  });

  it("labels the mobile toggle for screen readers", () => {
    expect(html).toContain('aria-label="Open navigation menu"');
  });
});
