import Link from "next/link";

import Squircle from "@/components/ui/Squircle";
import { RADIUS } from "@/components/ui/radius";
import { CLOSING } from "@/lib/landing-content";
import OrderGallery from "./OrderGallery";
import Reveal from "./Reveal";

export default function Closing() {
  return (
    <section
      id="order"
      aria-labelledby="closing-headline"
      className="relative grid scroll-mt-20 bg-ink pb-16 sm:pb-20 md:min-h-[92svh] md:grid-cols-2 md:pb-24"
    >
      <Reveal className="flex flex-col items-start justify-center gap-6 px-5 py-16 sm:px-8 md:py-20 md:pl-[max(2rem,calc((100vw-1600px)/2+2rem))]">

        <h2
          id="closing-headline"
          className="m-0 font-display text-[clamp(32px,5vw,54px)] font-semibold leading-[1.1] tracking-[-0.01em] text-white"
        >
          {CLOSING.headline.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h2>

        <p className="m-0 font-display text-[clamp(28px,3.6vw,40px)] font-semibold leading-none tracking-[-0.01em] text-lime tabular-nums">
          {CLOSING.price}
        </p>

        <p className="m-0 max-w-[40ch] font-display text-[15px] leading-relaxed text-white/55">{CLOSING.body}</p>

        <Squircle cornerRadius={RADIUS.control}>
          <Link
            href={CLOSING.cta.href}
            className="bg-lime px-5 py-2.5 text-[13px] font-medium text-ink no-underline transition-[filter,transform] duration-150 hover:brightness-105 motion-safe:active:scale-[0.97]"
          >
            {CLOSING.cta.label}
          </Link>
        </Squircle>
      </Reveal>

      <Reveal delay={0.08} className="flex items-center justify-center px-5 py-16 sm:px-8 md:h-[92svh] md:py-0">
        <OrderGallery slides={CLOSING.gallery} className="md:h-[90%] md:w-auto" />
      </Reveal>

      {/* Seamless gradient mask & blend into the cream footer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-28 sm:h-40 md:h-52 bg-gradient-to-b from-transparent via-cream/40 to-cream"
      />
    </section>
  );
}
