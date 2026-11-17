"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.23, 1, 0.32, 1] as const;

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Stagger a section's own sub-blocks by passing an increasing delay. */
  delay?: number;
};

/**
 * Subtle on-scroll entrance: a short rise, no opacity fade.
 *
 * Two deliberate constraints:
 * - Opacity is left alone. motion writes `initial` as inline style during SSR,
 *   so fading from 0 would ship the page with its content invisible whenever
 *   hydration is slow or fails.
 * - Reduced motion collapses the duration rather than swapping the element, so
 *   the first client render matches the server byte for byte. `useReducedMotion`
 *   resolves synchronously, so branching on the markup would mismatch instead.
 */
export default function Reveal({ children, className = "", delay = 0 }: Props) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ y: 22 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: reduced ? 0 : 0.65,
        ease: EASE,
        delay: reduced ? 0 : delay,
      }}
    >
      {children}
    </motion.div>
  );
}
