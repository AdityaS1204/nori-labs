"use client";

import { useMemo, useSyncExternalStore } from "react";
import DOMPurify from "dompurify";

/**
 * Renders a user-supplied SVG *exactly* inside one eye, as a nested `<svg>`
 * whose own viewBox is scaled into the eye's width×height box. The surrounding
 * groups (placement / openness / tilt / blink) pose it.
 *
 * The markup is sanitised (DOMPurify, SVG profile) on every render before it's
 * injected — presets are public, so stored markup is always treated as
 * untrusted. Sanitising needs a DOM, so it runs on the client only: the eye is
 * empty during SSR and fills in on hydration.
 */

const emptySubscribe = () => () => {};
/** false on the server, true once hydrated — no effect, no hydration mismatch. */
const useIsClient = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

/** Sanitise pasted markup (or a bare path `d`) to safe inner SVG markup. */
export function sanitizeInner(raw: string | undefined): string {
  const s = raw?.trim();
  if (!s) return "";
  if (!s.includes("<")) {
    // A bare path `d` — wrap it so it's visible on the dark screen.
    const d = s.replace(/[<>"]/g, "");
    return `<path d="${d}" fill="#eaf3ff" />`;
  }
  if (typeof window === "undefined") return "";
  const clean = DOMPurify.sanitize(s, {
    USE_PROFILES: { svg: true, svgFilters: true },
  });
  try {
    const wrapped = clean.includes("<svg")
      ? clean
      : `<svg xmlns="http://www.w3.org/2000/svg">${clean}</svg>`;
    const doc = new DOMParser().parseFromString(wrapped, "image/svg+xml");
    if (doc.querySelector("parsererror")) return "";
    return doc.querySelector("svg")?.innerHTML ?? "";
  } catch {
    return "";
  }
}

interface CustomSvgEyeProps {
  svg: string | undefined;
  viewBox: [number, number, number, number] | undefined;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function CustomSvgEye({
  svg,
  viewBox,
  x,
  y,
  width,
  height,
}: CustomSvgEyeProps) {
  const isClient = useIsClient();
  const inner = useMemo(() => (isClient ? sanitizeInner(svg) : ""), [isClient, svg]);
  if (!inner) return null;
  const vb = viewBox ?? [0, 0, 100, 100];

  return (
    <svg
      x={x}
      y={y}
      width={width}
      height={height}
      viewBox={`${vb[0]} ${vb[1]} ${vb[2]} ${vb[3]}`}
      preserveAspectRatio="xMidYMid meet"
      overflow="visible"
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
}
