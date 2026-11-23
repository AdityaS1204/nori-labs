"use client";

import { useRef } from "react";
import { ROW_BASE } from "./FieldRow";

interface NumberSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  /** Custom readout formatter (overrides `unit`). */
  format?: (value: number) => string;
  unit?: string;
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/** Snap to the step grid and strip floating-point dust. */
function snap(value: number, step: number, min: number) {
  const snapped = Math.round((value - min) / step) * step + min;
  return Number(snapped.toFixed(6));
}

// Even spacing (px) of the decorative ruler ticks across the track.
const TICK_GAP = 16;
const faintTicks = `repeating-linear-gradient(to right, rgba(255,255,255,0.14) 0 1px, transparent 1px ${TICK_GAP}px)`;
const brightTicks = `repeating-linear-gradient(to right, rgba(255,255,255,0.4) 0 1px, transparent 1px ${TICK_GAP}px)`;

/**
 * DialKit-style ruler slider: label on the left, a tick ruler across the
 * middle with a bold amber handle at the value, and the readout on the right.
 * Ticks left of the handle brighten to read as "filled". Drag anywhere on the
 * row (pointer maps to the ruler track) or focus it and use the arrow keys.
 * `role="slider"`.
 */
export default function NumberSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
  unit,
}: NumberSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const pct = ((clamp(value, min, max) - min) / (max - min)) * 100;

  const setFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    onChange(clamp(snap(min + ratio * (max - min), step, min), min, max));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragging.current) setFromClientX(e.clientX);
  };
  const endDrag = (e: React.PointerEvent) => {
    dragging.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* capture may already be released */
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const mult = e.shiftKey ? 10 : 1;
    let next = value;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = value + step * mult;
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown")
      next = value - step * mult;
    else if (e.key === "Home") next = min;
    else if (e.key === "End") next = max;
    else return;
    e.preventDefault();
    onChange(clamp(snap(next, step, min), min, max));
  };

  const readout = format ? format(value) : `${value}${unit ?? ""}`;

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={readout}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      className={`${ROW_BASE} flex w-full cursor-ew-resize touch-none select-none items-center gap-3 overflow-hidden px-3.5 transition-colors hover:bg-[#2a2a2e] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#E8BE3C]/50`}
    >
      <span className="flex-shrink-0 text-[13px] text-white/80">{label}</span>

      {/* ── Ruler track ── */}
      <div ref={trackRef} className="relative h-full min-w-0 flex-1">
        {/* faint ticks across the full track */}
        <div
          aria-hidden="true"
          className="absolute left-0 right-0 top-1/2 h-[11px] -translate-y-1/2"
          style={{ backgroundImage: faintTicks }}
        />
        {/* brighter ticks up to the handle (the "filled" portion) */}
        <div
          aria-hidden="true"
          className="absolute left-0 top-1/2 h-[11px] -translate-y-1/2 overflow-hidden"
          style={{ width: `${pct}%`, backgroundImage: brightTicks }}
        />
        {/* handle */}
        <div
          aria-hidden="true"
          className="absolute top-1/2 h-[18px] w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E8BE3C]"
          style={{ left: `${pct}%` }}
        />
      </div>

      <span className="flex-shrink-0 text-[13px] tabular-nums text-white/95">
        {readout}
      </span>
    </div>
  );
}
