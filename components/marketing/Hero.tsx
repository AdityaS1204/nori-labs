import Link from "next/link";

import { HERO, SUPPORTING_DETAILS } from "@/lib/landing-content";
import MediaCard from "./MediaCard";
import SectionLabel from "./SectionLabel";

export default function Hero() {
  return (
    <section id="intro" aria-labelledby="hero-headline" className="bg-ink">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-10 px-5 pb-6 pt-28 sm:px-8 md:pt-32">
        <SectionLabel>{HERO.label}</SectionLabel>

        <div className="flex flex-col gap-7">
          <h1
            id="hero-headline"
            className="m-0 text-[clamp(40px,8vw,76px)] font-semibold leading-[0.98] tracking-[-0.035em] text-white"
          >
            {HERO.headline.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>

          <p className="m-0 max-w-[36ch] text-[14.5px] leading-relaxed text-white/50">
            {HERO.body}
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={HERO.primaryCta.href}
              className="rounded-full bg-lime px-5 py-2.5 text-[13px] font-medium text-ink no-underline transition-[filter,transform] duration-150 hover:brightness-105 motion-safe:active:scale-[0.97]"
            >
              {HERO.primaryCta.label}
            </Link>
            <Link
              href={HERO.secondaryCta.href}
              className="rounded-full border border-white/20 px-5 py-2.5 text-[13px] font-medium text-white/85 no-underline transition-[color,border-color,background-color] duration-150 hover:border-white/40 hover:bg-white/[0.05] hover:text-white"
            >
              {HERO.secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>

      <div className="px-3 pb-16">
        <MediaCard media={HERO.media} />

        <dl className="m-0 mt-3 grid gap-px overflow-hidden rounded-[10px] bg-white/[0.08] sm:grid-cols-3">
          {SUPPORTING_DETAILS.map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-1.5 bg-ink px-5 py-4">
              <dt className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/35">
                {label}
              </dt>
              <dd className="m-0 text-[15px] font-medium tracking-[-0.01em] text-white/85">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
