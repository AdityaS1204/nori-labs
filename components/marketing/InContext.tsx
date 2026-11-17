"use client";

import { useState } from "react";

import { IN_CONTEXT } from "@/lib/landing-content";
import MediaFrame from "./MediaFrame";
import Section from "./Section";

export default function InContext() {
  const [chapter, setChapter] = useState(0);

  return (
    <Section id="context" index="02" label={IN_CONTEXT.label}>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-12">
        <h2 className="max-w-[14ch] text-[clamp(26px,3.6vw,38px)] font-semibold leading-[1.1] tracking-[-0.02em] text-white">
          {IN_CONTEXT.headline}
        </h2>
        <p className="max-w-[44ch] text-[14.5px] leading-relaxed text-white/50 md:text-right">
          {IN_CONTEXT.body}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[minmax(0,8fr)_minmax(0,3fr)] md:gap-10">
        <MediaFrame
          media={{
            ...IN_CONTEXT.media,
            label: `${IN_CONTEXT.media.label} — ${IN_CONTEXT.chapters[chapter]}`,
          }}
          video
        />

        <div className="flex flex-col gap-5">
          <h3 className="text-[15px] font-medium leading-snug tracking-[-0.01em] text-white/85">
            {IN_CONTEXT.videoCaption.title}
          </h3>
          <p className="text-[13.5px] leading-relaxed text-white/45">
            {IN_CONTEXT.videoCaption.body}
          </p>

          <div className="mt-auto flex flex-col gap-3">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/30">
              Chapters
            </span>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Demo chapters">
              {IN_CONTEXT.chapters.map((name, i) => {
                const active = i === chapter;
                return (
                  <button
                    key={name}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setChapter(i)}
                    className={[
                      "rounded-full border px-3.5 py-1.5 font-mono text-[11px] tracking-[0.06em] transition-[color,border-color,background-color] duration-150 motion-safe:active:scale-[0.96]",
                      active
                        ? "border-[#E8BE3C]/50 bg-[#E8BE3C]/10 text-[#E8BE3C]"
                        : "border-white/[0.1] text-white/40 hover:border-white/25 hover:text-white/70",
                    ].join(" ")}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
