import { WHAT_IT_IS } from "@/lib/landing-content";
import MediaCard from "./MediaCard";
import SectionLabel from "./SectionLabel";

export default function WhatItIs() {
  return (
    <section
      id="what-it-is"
      aria-labelledby="what-it-is-headline"
      className="scroll-mt-20 bg-cream"
    >
      <div className="mx-auto flex max-w-[1180px] flex-col gap-10 px-5 py-20 sm:px-8 md:py-28">
        <SectionLabel tone="light">{WHAT_IT_IS.label}</SectionLabel>

        <h2
          id="what-it-is-headline"
          className="m-0 max-w-[24ch] text-[clamp(26px,4vw,44px)] font-semibold leading-[1.08] tracking-[-0.03em] text-ink"
        >
          {WHAT_IT_IS.headline}
        </h2>

        <MediaCard media={WHAT_IT_IS.hero} />

        <div className="grid gap-5 sm:grid-cols-2">
          {WHAT_IT_IS.pair.map((media) => (
            <MediaCard key={media.slot} media={media} />
          ))}
        </div>
      </div>
    </section>
  );
}
