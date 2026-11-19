"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { VolumeHighIcon, VolumeMute01Icon } from "@hugeicons/core-free-icons";

import Squircle from "@/components/ui/Squircle";
import { RADIUS } from "@/components/ui/radius";
import type { NavMedia } from "@/lib/landing-content";

/** Gap between the cursor and the tooltip's bottom edge. */
const TIP_OFFSET = 16;

const FOLLOW = { stiffness: 520, damping: 42, mass: 0.6 } as const;
const EASE = [0.23, 1, 0.32, 1] as const;

type ReelProps = { media: NavMedia; muted: boolean };

/**
 * The clips of one preview, played as a single reel: each runs to its end and
 * hands over to the next, and the last loops back to the first.
 *
 * Every clip is mounted and buffered for the whole time, and the next one is
 * started a beat before it is revealed, so a hand-over cuts straight from one
 * last frame to the next first frame instead of flashing the poster or black.
 */
function Reel({ media, muted }: ReelProps) {
  const [index, setIndex] = useState(0);
  const clips = useRef<(HTMLVideoElement | null)[]>([]);
  const single = media.clips.length === 1;

  useEffect(() => {
    const video = clips.current[index];
    if (video && !muted) void video.play().catch(() => {});
  }, [muted, index]);

  const handOver = () => {
    const next = (index + 1) % media.clips.length;
    const video = clips.current[next];

    if (video) {
      video.currentTime = 0;
      void video.play().catch(() => {});
    }
    setIndex(next);
  };

  return (
    <>
      {media.clips.map((src, i) => (
        <video
          key={src}
          ref={(node) => {
            clips.current[i] = node;
          }}
          src={src}
          poster={i === 0 ? media.poster : undefined}
          aria-label={i === 0 ? media.label : undefined}
          aria-hidden={i > 0}
          className={`absolute inset-0 h-full w-full object-cover ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          autoPlay={i === 0}
          muted={muted}
          loop={single}
          onEnded={single ? undefined : handOver}
          playsInline
          preload={single ? "none" : "auto"}
        />
      ))}
    </>
  );
}

type Props = { media: NavMedia; className?: string };

/**
 * The preview beside a tab's links: the clip for whichever link the pointer is
 * on, under a tooltip that trails the cursor.
 *
 * Media swaps crossfade between stacked layers, so a new clip is already
 * painted before the old one clears rather than flashing the frame empty.
 * Pointer position is clamped to the frame to keep the tooltip inside the
 * squircle's clip path, and lives in motion values rather than state, so
 * following the cursor never re-renders the nav.
 */
export default function NavVideo({ media, className = "" }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [muted, setMuted] = useState(true);
  const reduced = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, FOLLOW);
  const springY = useSpring(y, FOLLOW);

  const place = (event: React.PointerEvent, jump = false) => {
    const frame = frameRef.current;
    if (!frame) return;

    const rect = frame.getBoundingClientRect();
    const tip = tipRef.current;
    const halfWidth = (tip?.offsetWidth ?? 120) / 2 + 8;
    const minY = (tip?.offsetHeight ?? 40) + TIP_OFFSET;

    const next = {
      x: Math.min(Math.max(event.clientX - rect.left, halfWidth), rect.width - halfWidth),
      y: Math.min(Math.max(event.clientY - rect.top, minY), rect.height),
    };

    x.set(next.x);
    y.set(next.y);
    if (jump) {
      springX.jump(next.x);
      springY.jump(next.y);
    }
  };

  const onEnter = (event: React.PointerEvent) => {
    setHovered(true);
    place(event, true);
  };

  const toggleSound = () => setMuted((on) => !on);

  return (
    <Squircle cornerRadius={RADIUS.control}>
      <div
        ref={frameRef}
        onPointerEnter={onEnter}
        onPointerMove={place}
        onPointerLeave={() => setHovered(false)}
        className={`relative overflow-hidden bg-black/40 ${className}`}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={media.clips.join("|")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.28, ease: EASE }}
            className="absolute inset-0"
          >
            <Reel media={media} muted={muted} />
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {hovered ? (
            <motion.div
              className="pointer-events-none absolute left-0 top-0 z-20"
              style={{ x: reduced ? x : springX, y: reduced ? y : springY }}
            >
              <motion.div
                ref={tipRef}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={reduced ? { duration: 0 } : { duration: 0.16, ease: EASE }}
                className="-translate-x-1/2 whitespace-nowrap rounded-[14px] bg-black px-4 py-2.5 text-[13.5px] font-medium leading-none text-white shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
                style={{ translateY: `calc(-100% - ${TIP_OFFSET}px)` }}
              >
                {media.label}
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <button
          type="button"
          onClick={toggleSound}
          aria-label={muted ? "Unmute video" : "Mute video"}
          aria-pressed={!muted}
          className={`absolute bottom-2 right-2 z-30 flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition-[opacity,background-color] duration-200 hover:bg-white/20 ${
            hovered ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <HugeiconsIcon
            icon={muted ? VolumeMute01Icon : VolumeHighIcon}
            size={15}
            color="currentColor"
          />
        </button>
      </div>
    </Squircle>
  );
}
