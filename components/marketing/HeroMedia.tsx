"use client";

import { useSyncExternalStore } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";

import { HERO } from "@/lib/landing-content";
import MediaCard from "./MediaCard";

/** Scroll distance, in px, over which the card reaches its full width. */
const TRAVEL = 460;

/** Never changes: the store exists only to separate server and client renders. */
const subscribe = () => () => {};

/**
 * The hero card opens out as the page scrolls: it starts inset and widens to
 * the full 12px gutter, easing its corner radius down as it goes.
 *
 * It renders inset on the server, which is also the no-JS resting state, so the
 * first client render matches and there is no widen-then-snap on load. Reduced
 * motion settles it at full width once mounted instead of tracking the scroll.
 */
export default function HeroMedia() {
  const reduced = useReducedMotion();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  const { scrollY } = useScroll();

  // Spring-smoothed so the width trails the wheel rather than snapping to it.
  const progress = useSpring(useTransform(scrollY, [0, TRAVEL], [0, 1], { clamp: true }), {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  const width = useTransform(progress, [0, 1], ["78%", "100%"]);
  const radius = useTransform(progress, [0, 1], [22, 10]);

  const settled = mounted && reduced;

  return (
    <motion.div
      className="mx-auto overflow-hidden"
      style={settled ? { width: "100%", borderRadius: 10 } : { width, borderRadius: radius }}
    >
      <MediaCard media={HERO.media} className="!rounded-none" />
    </motion.div>
  );
}
