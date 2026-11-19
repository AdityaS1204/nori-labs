import Link from "next/link";

import Squircle from "@/components/ui/Squircle";
import { RADIUS } from "@/components/ui/radius";
import { TEACH_IT } from "@/lib/landing-content";
import MediaCard from "./MediaCard";
import Reveal from "./Reveal";
import SectionLabel from "./SectionLabel";

export default function TeachIt() {
  return (
    <section id="teach-it" aria-labelledby="teach-it-headline" className="scroll-mt-20 bg-cream">
      <div className="mx-auto grid max-w-[1180px] gap-10 px-5 pb-24 sm:px-8 md:grid-cols-2 md:items-center md:gap-14">
        <Reveal className="flex flex-col items-start gap-5">
          <SectionLabel tone="light">{TEACH_IT.label}</SectionLabel>

          <h2
            id="teach-it-headline"
            className="m-0 font-display text-[clamp(26px,4vw,44px)] font-semibold leading-[1.08] tracking-[-0.03em] text-ink"
          >
            {TEACH_IT.headline}
          </h2>

          <p className="m-0 max-w-[42ch] font-display text-[15px] leading-relaxed text-ink/65">
            {TEACH_IT.body}
          </p>

          <ol className="m-0 flex list-none flex-col gap-3 p-0" role="list">
            {TEACH_IT.steps.map((step, i) => (
              <li key={step.title} className="flex items-start gap-3">
                <span className="mt-px font-mono text-[10.5px] tabular-nums text-ink/35">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-col gap-0.5">
                  <h3 className="m-0 text-[13.5px] font-semibold tracking-[-0.01em] text-ink">
                    {step.title}
                  </h3>
                  <p className="m-0 max-w-[40ch] text-[12.5px] leading-snug text-ink/50">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <Squircle cornerRadius={RADIUS.control}>
            <Link
              href={TEACH_IT.cta.href}
              className="mt-1 bg-ink px-5 py-2.5 text-[13px] font-medium text-cream no-underline transition-[filter,transform] duration-150 hover:brightness-150 motion-safe:active:scale-[0.97]"
            >
              {TEACH_IT.cta.label}
            </Link>
          </Squircle>
        </Reveal>

        <Reveal delay={0.06}>
          <MediaCard media={TEACH_IT.media} />
        </Reveal>
      </div>
    </section>
  );
}
