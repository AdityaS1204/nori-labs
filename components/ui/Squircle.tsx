"use client";

import { useLayoutEffect, useRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { getSvgPath } from "figma-squircle";

/** Figma's squircle default, and the closest match to Apple's continuous corners. */
export const CORNER_SMOOTHING = 0.6;

type Props = {
  /** Corner radius in px. Keep the child's matching `rounded-*` class: it is what shows before the clip is measured. */
  cornerRadius: number;
  cornerSmoothing?: number;
  children: React.ReactNode;
};

/**
 * Continuous ("squircle") corners on the single child element.
 *
 * The clip path can only be drawn once the box has been measured, so the child
 * keeps its own `border-radius` for the server render and for no-JS: the shape
 * is written straight to the node in a layout effect, before paint, and never
 * through state, so measuring never re-renders the tree it is wrapping.
 */
export default function Squircle({
  cornerRadius,
  cornerSmoothing = CORNER_SMOOTHING,
  children,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const apply = () => {
      const { width, height } = node.getBoundingClientRect();
      node.style.clipPath =
        width > 0 && height > 0
          ? `path('${getSvgPath({ width, height, cornerRadius, cornerSmoothing })}')`
          : "";
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(node);
    return () => {
      observer.disconnect();
      node.style.clipPath = "";
    };
  }, [cornerRadius, cornerSmoothing]);

  return (
    <Slot ref={ref} data-squircle={cornerRadius}>
      {children}
    </Slot>
  );
}
