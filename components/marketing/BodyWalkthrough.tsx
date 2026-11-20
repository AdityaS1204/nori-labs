"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react";

import Squircle from "@/components/ui/Squircle";
import { RADIUS } from "@/components/ui/radius";
import { WALKTHROUGH, type WalkthroughStage } from "@/lib/landing-content";
import MediaCard from "./MediaCard";

const EASE = [0.23, 1, 0.32, 1] as const;
const STAGES = WALKTHROUGH.stages;
const CLIP = WALKTHROUGH.clip;

/** Never changes: the store exists only to separate server and client renders. */
const subscribe = () => () => {};

/** Printed wherever a stage outruns the spec sheet, rather than dropping the line. */
function Unconfirmed() {
  return (
    <span className="w-fit rounded-[3px] bg-ink/[0.07] px-2 py-1 font-mono text-[9.5px] uppercase leading-none tracking-[0.1em] text-ink/50">
      unconfirmed
    </span>
  );
}

function Caption({ stage }: { stage: WalkthroughStage }) {
  return (
    <div className="flex flex-col items-start gap-2">
      <h3 className="m-0 font-display text-[clamp(18px,2.2vw,24px)] font-semibold tracking-[-0.01em] text-ink">
        {stage.title}
      </h3>
      <p className="m-0 max-w-[46ch] text-[13px] leading-relaxed text-ink/60">{stage.body}</p>
      {stage.unconfirmed ? <Unconfirmed /> : null}
    </div>
  );
}

/** Which quarter of the clip is on screen. */
function Rail({ active }: { active: number }) {
  return (
    <ol className="m-0 flex list-none gap-1.5 p-0" aria-hidden="true">
      {STAGES.map((stage, i) => (
        <li
          key={stage.id}
          className={`h-[3px] w-8 rounded-full transition-colors duration-300 ${
            i <= active ? "bg-ink/70" : "bg-ink/15"
          }`}
        />
      ))}
    </ol>
  );
}

/**
 * The body tour, head to base.
 *
 * Two render modes. `list` stacks every stage in normal flow and is what the
 * server, a no-JS client, a reduced-motion client and a missing clip all get:
 * motion writes `initial` as inline style during SSR, so the three inactive
 * captions of the scrubbed layout would ship as `opacity: 0` and stay that way
 * if hydration never lands. `scroll` is entered only after mount, where the
 * clip is pinned and scroll progress drives its `currentTime`.
 */
export default function BodyWalkthrough() {
  const reduced = useReducedMotion();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  const track = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  // The wheel fires far faster than the decoder can serve a seek, so the latest
  // position is latched and spent once per frame instead of per event.
  const wanted = useRef(0);
  const frame = useRef(0);

  useMotionValueEvent(progress, "change", (p) => {
    wanted.current = Math.min(Math.max(p, 0), 1);

    // Cued to the shot, not to even quarters: the camera spends longer on the
    // base than on the face, so the captions have to follow it.
    const index = STAGES.reduce((found, stage, i) => (wanted.current >= stage.at ? i : found), 0);
    setActive((current) => (current === index ? current : index));

    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const el = video.current;
      // duration is NaN until metadata lands; the next scroll event retries.
      if (el && Number.isFinite(el.duration)) el.currentTime = wanted.current * el.duration;
    });
  });

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const scrubbing = mounted && !reduced && Boolean(CLIP.src);

  if (!scrubbing) {
    return (
      <div className="mt-10 flex flex-col gap-6 px-3">
        {CLIP.src ? (
          <Squircle cornerRadius={RADIUS.surface}>
            {/* No autoplay here: reduced motion gets a clip it chooses to play. */}
            <video
              src={CLIP.src}
              poster={CLIP.poster}
              aria-label={CLIP.label}
              className="w-full bg-[#1c1b1e] object-cover"
              controls
              muted
              playsInline
              preload="metadata"
            />
          </Squircle>
        ) : (
          <MediaCard media={WALKTHROUGH.fallback} />
        )}

        <ol className="m-0 grid list-none gap-8 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((stage) => (
            <li key={stage.id}>
              <Caption stage={stage} />
            </li>
          ))}
        </ol>
      </div>
    );
  }

  const stage = STAGES[active];

  return (
    <div ref={track} className="relative mt-10" style={{ height: `${STAGES.length * 100}svh` }}>
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center gap-7 overflow-hidden px-5 py-20">
        <video
          ref={video}
          src={CLIP.src}
          poster={CLIP.poster}
          className="max-h-[52svh] w-auto max-w-full object-contain"
          aria-hidden="true"
          tabIndex={-1}
          muted
          playsInline
          preload="auto"
        />

        {/* Client-only, so an opacity entrance cannot ship as invisible markup. */}
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="w-full max-w-[560px]"
          >
            <Caption stage={stage} />
          </motion.div>
        </AnimatePresence>

        <Rail active={active} />

        {/* Only the active caption is painted, so the full tour stays readable
            to a screen reader that is not scrolling through it. */}
        <ol className="sr-only m-0 list-none p-0">
          {STAGES.map((s) => (
            <li key={s.id}>
              {s.title}. {s.body}
              {s.unconfirmed ? " (unconfirmed)" : ""}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
