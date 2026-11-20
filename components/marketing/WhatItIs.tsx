import { WHAT_IT_IS } from "@/lib/landing-content";
import MediaCard from "./MediaCard";
import Reveal from "./Reveal";

export default function WhatItIs() {
  return (
    <section
      id="what-it-is"
      aria-labelledby="what-it-is-headline"
      className="scroll-mt-20 bg-cream py-20 md:py-28"
    >
      <div className="mx-auto flex max-w-[1180px] flex-col gap-10 px-5 sm:px-8">

        <Reveal>
          <h2
            id="what-it-is-headline"
            className="m-0 max-w-[24ch] font-display text-[clamp(26px,4vw,44px)] font-semibold leading-[1.18] tracking-[-0.01em] text-ink"
          >
            {WHAT_IT_IS.headline}
          </h2>
        </Reveal>
      </div>

      <div className="mt-10 flex flex-col gap-3 px-3">
        <Reveal>
          <MediaCard media={WHAT_IT_IS.hero} />
        </Reveal>

        <div className="grid gap-3 sm:grid-cols-2">
          {WHAT_IT_IS.pair.map((media, i) => (
            <Reveal key={media.slot} delay={i * 0.06}>
              <MediaCard media={media} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
