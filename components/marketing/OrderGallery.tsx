"use client";

import { useCallback, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import Squircle from "@/components/ui/Squircle";
import { RADIUS } from "@/components/ui/radius";
import type { MediaSlot, MediaTone } from "@/lib/landing-content";

const EASE = [0.23, 1, 0.32, 1] as const;

/** The skeleton fill, keyed to the slot tone, shown until a photo has a src. */
const TONES: Record<MediaTone, string> = {
  sage: "bg-sage",
  ink: "bg-[#1c1b1e]",
  haze: "bg-gradient-to-br from-[#d6d2c4] via-[#bdb9a8] to-[#8d8a7c]",
};

const MARKER: Record<MediaTone, string> = {
  sage: "text-ink/55",
  ink: "text-white/45",
  haze: "text-ink/55",
};

type Props = { slides: readonly MediaSlot[]; className?: string };

/**
 * The price-section carousel. Works over skeletons today: a slide with no `src`
 * shows a toned placeholder, and dropping a `src` on it swaps in the photo with
 * no other change. The page control is a frosted-glass pill floated over the
 * image itself; the dots page the carousel and arrow keys do when one has focus.
 *
 * SSR renders the first slide at full opacity — the enter/exit motion is
 * client-only, so no slide ships hidden (the rule Reveal documents). Direction
 * is tracked so paging left slides the opposite way to paging right.
 */
export default function OrderGallery({ slides, className = "" }: Props) {
  const reduced = useReducedMotion();
  const labelId = useId();
  const [[active, dir], setState] = useState<[number, number]>([0, 0]);

  const count = slides.length;
  const paginate = useCallback(
    (step: number) => setState(([i]) => [(i + step + count) % count, step]),
    [count],
  );
  const goTo = useCallback((i: number) => setState(([prev]) => [i, Math.sign(i - prev)]), []);

  const slide = slides[active];
  const filled = Boolean(slide.src);

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label="Nori A3 from different angles"
      className={`w-full ${className}`}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") paginate(-1);
        else if (e.key === "ArrowRight") paginate(1);
      }}
    >
      <Squircle cornerRadius={RADIUS.gallery}>
        <div
          className={`relative w-full md:h-full md:w-auto ${TONES[slide.tone]}`}
          style={{ aspectRatio: slide.ratio }}
        >
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.div
              key={active}
              custom={dir}
              initial={reduced ? false : { opacity: 0, x: dir >= 0 ? 48 : -48 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: dir >= 0 ? -48 : 48 }}
              transition={{ duration: reduced ? 0 : 0.4, ease: EASE }}
              className={`absolute inset-0 ${TONES[slide.tone]}`}
            >
              {filled ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={slide.src}
                  alt={slide.slot}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center motion-safe:animate-pulse"
                  aria-hidden="true"
                >
                  <span
                    className={`font-mono text-[10.5px] uppercase tracking-[0.18em] ${MARKER[slide.tone]}`}
                  >
                    {slide.slot}
                  </span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Frosted-glass page control, floated over the image's bottom edge. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center">
            <div
              role="tablist"
              aria-label="Choose an angle"
              className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-2 shadow-lg shadow-black/20 backdrop-blur-md"
            >
              {slides.map((s, i) => (
                <button
                  key={s.slot}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={s.slot}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === active ? "w-5 bg-lime" : "w-1.5 bg-white/55 hover:bg-white/85"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </Squircle>

      <p id={labelId} aria-live="polite" className="sr-only">
        {slide.slot} — {active + 1} of {count}
      </p>
    </div>
  );
}
