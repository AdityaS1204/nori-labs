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

/**
 * DialKit-style slider: the whole row IS the track. A lighter fill grows from
 * the left to show the value; label and value sit on top. Drag anywhere on the
 * row, or focus it and use the arrow keys. `role="slider"`.
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
  const rowRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const pct = ((clamp(value, min, max) - min) / (max - min)) * 100;

  const setFromClientX = (clientX: number) => {
    const el = rowRef.current;
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
      ref={rowRef}
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
      className={`${ROW_BASE} w-full cursor-ew-resize touch-none select-none overflow-hidden transition-colors hover:bg-[#2a2a2e] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#E8BE3C]/50`}
    >
      {/* value fill */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 bg-white/[0.11]"
        style={{ width: `${pct}%` }}
      />
      {/* label + value */}
      <div className="relative flex h-full items-center justify-between px-3.5">
        <span className="text-[13px] text-white/80">{label}</span>
        <span className="text-[13px] tabular-nums text-white/95">{readout}</span>
      </div>
    </div>
  );
}
