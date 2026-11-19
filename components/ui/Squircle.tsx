"use client";

import { useLayoutEffect, useRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { getSvgPath } from "figma-squircle";

/** Figma's squircle default, and the closest match to Apple's continuous corners. */
export const CORNER_SMOOTHING = 0.6;

type Props = {
  /** Corner radius in px, usually a value from `RADIUS`. */
  cornerRadius: number;
  cornerSmoothing?: number;
  children: React.ReactNode;
};

/**
 * Continuous ("squircle") corners on the single child element.
 *
 * The clip path can only be drawn once the box has been measured, so the child
 * is given a plain `border-radius` of the same size to carry the server render
 * and no-JS. The path itself is written straight to the node in a layout
 * effect, before paint, and never through state, so measuring never re-renders
 * the tree it is wrapping.
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

    // Layout size, not getBoundingClientRect: the rect is scaled by any
    // animating ancestor transform (the nav panel's `layout`), which would bake
    // a clip path a fraction of the real box and never correct itself.
    const apply = () => {
      const { offsetWidth: width, offsetHeight: height } = node;
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
    <Slot ref={ref} data-squircle={cornerRadius} style={{ borderRadius: cornerRadius }}>
      {children}
    </Slot>
  );
}
