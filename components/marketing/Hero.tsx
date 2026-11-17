import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, PlayIcon } from "@hugeicons/core-free-icons";

import { HERO, SUPPORTING_DETAILS } from "@/lib/landing-content";
import MediaFrame from "./MediaFrame";
import SectionLabel from "./SectionLabel";

export default function Hero() {
  return (
    <section id="intro" aria-labelledby="hero-headline" className="scroll-mt-[var(--nav-h)]">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-5 py-14 sm:px-8 md:gap-14 md:py-20">
        <SectionLabel index="01">Product introduction</SectionLabel>

        <div className="grid items-center gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-14">
          <div className="flex flex-col items-start gap-6">
            <p className="font-mono text-[12px] tracking-[0.08em] text-[#E8BE3C]">
              {HERO.eyebrow}
            </p>

            <h1
              id="hero-headline"
              className="max-w-[16ch] text-[clamp(34px,6.2vw,60px)] font-semibold leading-[1.04] tracking-[-0.025em] text-white"
            >
              {HERO.headline}
            </h1>

            <p className="max-w-[52ch] text-[15px] leading-relaxed text-white/55">{HERO.body}</p>

            <div className="mt-1 flex flex-wrap items-center gap-3">
              <Link
                href={HERO.primaryCta.href}
                className="inline-flex items-center gap-1.5 rounded-[6px] bg-[#E8BE3C] px-5 py-3 text-[13px] font-semibold tracking-[0.04em] text-[#0d0d0e] no-underline transition-[box-shadow,transform] duration-150 hover:shadow-[0_0_0_1px_#E8BE3C,0_6px_20px_rgba(232,190,60,0.28)] motion-safe:active:scale-[0.97]"
              >
                {HERO.primaryCta.label}
                <HugeiconsIcon icon={ArrowRight01Icon} size={15} color="currentColor" />
              </Link>
              <Link
                href={HERO.secondaryCta.href}
                className="inline-flex items-center gap-2 rounded-[6px] border border-white/[0.12] px-5 py-3 text-[13px] font-medium tracking-[0.04em] text-white/80 no-underline transition-[color,border-color,background-color] duration-150 hover:border-white/25 hover:bg-white/[0.04] hover:text-white"
              >
                <HugeiconsIcon icon={PlayIcon} size={14} color="currentColor" />
                {HERO.secondaryCta.label}
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#E8BE3C]/35 bg-[#E8BE3C]/10"
                aria-hidden="true"
              >
                <span className="h-[6px] w-[6px] rounded-full bg-[#E8BE3C]" />
              </span>
              <p className="text-[12.5px] leading-snug text-white/45">{HERO.availability}</p>
            </div>

            <ul className="m-0 flex list-none flex-wrap gap-2 p-0" role="list">
              {HERO.badges.map((badge) => (
                <li
                  key={badge}
                  className="rounded-full border border-white/[0.1] px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-white/40"
                >
                  {badge}
                </li>
              ))}
            </ul>
          </div>

          <MediaFrame media={HERO.media} />
        </div>

        <dl className="m-0 grid gap-px overflow-hidden rounded-[6px] border border-white/[0.07] bg-white/[0.07] sm:grid-cols-3">
          {SUPPORTING_DETAILS.map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-1.5 bg-[#0d0d0e] px-5 py-5">
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/35">
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
