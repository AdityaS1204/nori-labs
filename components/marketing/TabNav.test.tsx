import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import NavVideo from "./NavVideo";
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

  it("keeps the tab preview out of the closed nav", () => {
    expect(html).not.toContain("<video");
  });
});

describe("NavVideo", () => {
  const media = NAV_LINKS.find((item) => item.media)?.media;
  const markup = media ? decode(renderToStaticMarkup(<NavVideo media={media} />)) : "";

  it("is wired to a tab", () => {
    expect(media).toBeDefined();
  });

  it("posters the frame and leaves fetching to playback", () => {
    expect(markup).toContain('preload="none"');
    expect(markup).toContain(`poster="${media!.poster}"`);
  });

  it("tiles a multi-clip preview into one frame, with one soundtrack", () => {
    const stacked = NAV_LINKS.flatMap((item) => item.items)
      .map((child) => child.media)
      .find((m) => m && m.clips.length > 1)!;
    const html = decode(renderToStaticMarkup(<NavVideo media={stacked} />));

    expect(html.match(/<video/g)).toHaveLength(stacked.clips.length);
    for (const src of stacked.clips) expect(html).toContain(`src="${src}"`);
    // Every clip past the first is muted outright and hidden from the a11y tree.
    expect(html.match(/aria-hidden="true"/g)).toHaveLength(stacked.clips.length - 1);
  });

  it("starts muted and looping, with the sound toggle labelled", () => {
    expect(markup).toContain("loop");
    expect(markup).toContain('aria-label="Unmute video"');
    expect(markup).toContain('aria-pressed="false"');
  });

  // The label is on the video for assistive tech; the tooltip that paints it
  // on screen belongs to the hover state and must not ship with the panel.
  it("holds the tooltip back until the pointer arrives", () => {
    expect(markup.match(new RegExp(media!.label, "g"))).toHaveLength(1);
    expect(markup).not.toContain("bg-black px-4");
  });
});
