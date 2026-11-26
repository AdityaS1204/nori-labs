import { WHAT_IT_IS } from "@/lib/landing-content";
import MediaCard from "./MediaCard";
import Reveal from "./Reveal";

export default function WhatItIs() {
  return (
    <section
      id="what-it-is"
      aria-labelledby="what-it-is-headline"
      className="scroll-mt-20 bg-cream py-14 md:py-20"
    >
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-10 px-5 sm:px-8 lg:px-12">

        <Reveal>
          <h2
            id="what-it-is-headline"
            className="m-0 max-w-[24ch] font-display text-[clamp(26px,4vw,44px)] font-semibold leading-[1.18] tracking-[-0.01em] text-ink"
          >
            {WHAT_IT_IS.headline}
          </h2>
        </Reveal>
      </div>

      <div className="mx-auto mt-10 flex w-full max-w-[1600px] flex-col gap-3 px-5 sm:px-8 lg:px-12">
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
