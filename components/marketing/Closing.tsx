import Link from "next/link";

import Squircle from "@/components/ui/Squircle";
import { CLOSING } from "@/lib/landing-content";
import MediaCard from "./MediaCard";
import Reveal from "./Reveal";
import SectionLabel from "./SectionLabel";

export default function Closing() {
  return (
    <section
      id="order"
      aria-labelledby="closing-headline"
      className="grid scroll-mt-20 bg-ink md:grid-cols-2"
    >
      <Reveal className="flex flex-col items-start justify-center gap-6 px-5 py-20 sm:px-8 md:py-28 md:pl-[max(2rem,calc((100vw-1180px)/2))]">
        <SectionLabel>{CLOSING.label}</SectionLabel>

        <h2
          id="closing-headline"
          className="m-0 font-display text-[clamp(32px,5vw,54px)] font-semibold leading-[1.02] tracking-[-0.03em] text-white"
        >
          {CLOSING.headline.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h2>

        <p className="m-0 font-display text-[clamp(28px,3.6vw,40px)] font-semibold leading-none tracking-[-0.03em] text-lime tabular-nums">
          {CLOSING.price}
        </p>

        <p className="m-0 max-w-[40ch] font-display text-[15px] leading-relaxed text-white/55">{CLOSING.body}</p>

        <Squircle cornerRadius={18}>
          <Link
            href={CLOSING.cta.href}
            className="rounded-[18px] bg-lime px-5 py-2.5 text-[13px] font-medium text-ink no-underline transition-[filter,transform] duration-150 hover:brightness-105 motion-safe:active:scale-[0.97]"
          >
            {CLOSING.cta.label}
          </Link>
        </Squircle>
      </Reveal>

      <MediaCard media={CLOSING.media} className="min-h-full" cornerRadius={0} />
    </section>
  );
}
