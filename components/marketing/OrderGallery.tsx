"use client";

import { useCallback, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

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

type Props = { slides: readonly MediaSlot[] };

/**
 * The price-section carousel. Works over skeletons today: a slide with no `src`
 * shows a toned placeholder, and dropping a `src` on it swaps in the photo with
 * no other change.
 *
 * SSR renders the first slide at full opacity — the enter/exit motion is
 * client-only, so no slide ships hidden (the rule Reveal documents). Direction
 * is tracked so paging left slides the opposite way to paging right.
 */
export default function OrderGallery({ slides }: Props) {
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
      className="flex w-full max-w-[460px] flex-col gap-4"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") paginate(-1);
        else if (e.key === "ArrowRight") paginate(1);
      }}
    >
      <Squircle cornerRadius={RADIUS.gallery}>
        <div
          className={`relative w-full ${TONES[slide.tone]}`}
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
        </div>
      </Squircle>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Control label="Previous angle" icon={ArrowLeft01Icon} onClick={() => paginate(-1)} />
          <Control label="Next angle" icon={ArrowRight01Icon} onClick={() => paginate(1)} />
        </div>

        <div className="flex items-center gap-1.5" role="tablist" aria-label="Choose an angle">
          {slides.map((s, i) => (
            <button
              key={s.slot}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={s.slot}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active ? "w-5 bg-lime" : "w-1.5 bg-white/25 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      <p id={labelId} aria-live="polite" className="sr-only">
        {slide.slot} — {active + 1} of {count}
      </p>
    </div>
  );
}

function Control({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: typeof ArrowLeft01Icon;
  onClick: () => void;
}) {
  return (
    <Squircle cornerRadius={RADIUS.control}>
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className="flex h-9 w-9 items-center justify-center border border-white/15 bg-white/[0.04] text-white/80 transition-colors duration-150 hover:border-white/30 hover:bg-white/[0.08] hover:text-white"
      >
        <HugeiconsIcon icon={icon} size={17} color="currentColor" />
      </button>
    </Squircle>
  );
}
