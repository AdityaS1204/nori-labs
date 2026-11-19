import Link from "next/link";

import { HERO, SUPPORTING_DETAILS } from "@/lib/landing-content";
import Squircle from "@/components/ui/Squircle";
import { RADIUS } from "@/components/ui/radius";
import HeadlineMark from "./HeadlineMark";
import HeroMedia from "./HeroMedia";
import Reveal from "./Reveal";
import SectionLabel from "./SectionLabel";

export default function Hero() {
  return (
    <section id="intro" aria-labelledby="hero-headline" className="bg-ink">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-10 px-5 pb-6 pt-28 sm:px-8 md:pt-32">
        <SectionLabel>{HERO.label}</SectionLabel>

        <Reveal className="flex flex-col gap-7">
          <h1
            id="hero-headline"
            className="m-0 font-display text-[clamp(40px,8vw,76px)] font-semibold leading-[0.98] tracking-[-0.035em] text-white"
          >
            {HERO.headline.map((line, lineIndex) => (
              <span key={`line-${lineIndex}`} className="block">
                {line.map((part, i) =>
                  typeof part === "string" ? (
                    <span key={part}>{part}</span>
                  ) : (
                    <HeadlineMark key={`mark-${i}`} />
                  ),
                )}
              </span>
            ))}
          </h1>

          <p className="m-0 max-w-[36ch] font-display text-[15px] leading-relaxed text-white/55">
            {HERO.body}
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <Squircle cornerRadius={RADIUS.control}>
              <Link
                href={HERO.primaryCta.href}
                className="bg-lime px-5 py-2.5 text-[13px] font-medium text-ink no-underline transition-[filter,transform] duration-150 hover:brightness-105 motion-safe:active:scale-[0.97]"
              >
                {HERO.primaryCta.label}
              </Link>
            </Squircle>
            <Squircle cornerRadius={RADIUS.control}>
              <Link
                href={HERO.secondaryCta.href}
                className="border border-white/20 px-5 py-2.5 text-[13px] font-medium text-white/85 no-underline transition-[color,border-color,background-color] duration-150 hover:border-white/40 hover:bg-white/[0.05] hover:text-white"
              >
                {HERO.secondaryCta.label}
              </Link>
            </Squircle>
          </div>
        </Reveal>
      </div>

      <div className="px-3 pb-16">
        <HeroMedia />

        <Reveal className="mx-auto mt-3 max-w-[1180px]" delay={0.05}>
          <Squircle cornerRadius={RADIUS.surface}>
            <dl className="m-0 grid gap-px overflow-hidden bg-white/[0.08] sm:grid-cols-3">
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
          </Squircle>
        </Reveal>
      </div>
    </section>
  );
}
