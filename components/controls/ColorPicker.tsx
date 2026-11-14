"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  clamp01,
  hexToHsv,
  hsvToHex,
  normalizeHex,
  type Hsv,
} from "@/lib/color";

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
}

const WIDTH = 220;
const EST_HEIGHT = 250;

const PRESETS = [
  "#eaf3ff",
  "#ffffff",
  "#E8BE3C",
  "#7dd3fc",
  "#86efac",
  "#f0a6ca",
  "#fca5a5",
  "#a5b4fc",
];

/** A custom colour picker popover (SV box + hue slider + hex + presets). */
export default function ColorPicker({
  value,
  onChange,
  anchorRef,
  onClose,
}: ColorPickerProps) {
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(value));
  const [hexText, setHexText] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const popRef = useRef<HTMLDivElement>(null);
  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const svActive = useRef(false);
  const hueActive = useRef(false);

  const currentHex = hsvToHex(hsv);

  /* Keep internal HSV in sync when `value` changes from outside (e.g. the row's
     hex field or a preset) — the React "adjust state during render" pattern,
     which avoids clobbering hue mid-drag without a sync effect. */
  if (value !== prevValue) {
    setPrevValue(value);
    const incoming = normalizeHex(value);
    if (incoming && incoming !== currentHex) {
      setHsv(hexToHsv(incoming));
      setHexText(incoming);
    }
  }

  const commit = (next: Hsv) => {
    setHsv(next);
    const hex = hsvToHex(next);
    setHexText(hex);
    onChange(hex);
  };

  /* ── Position (fixed, via portal) ── */
  useLayoutEffect(() => {
    const a = anchorRef.current;
    if (!a) return;
    const r = a.getBoundingClientRect();
    const left = Math.max(
      8,
      Math.min(r.right - WIDTH, window.innerWidth - WIDTH - 8),
    );
    const top =
      r.bottom + 8 + EST_HEIGHT > window.innerHeight - 8
        ? Math.max(8, r.top - EST_HEIGHT - 8)
        : r.bottom + 8;
    setPos({ top, left });
  }, [anchorRef]);

  /* ── Dismiss ── */
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (popRef.current?.contains(t) || anchorRef.current?.contains(t)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onScrollResize = () => onClose();
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScrollResize, true);
    window.addEventListener("resize", onScrollResize);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScrollResize, true);
      window.removeEventListener("resize", onScrollResize);
    };
  }, [anchorRef, onClose]);

  /* ── Saturation / value box ── */
  const updateSv = (clientX: number, clientY: number) => {
    const el = svRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const s = clamp01((clientX - r.left) / r.width);
    const v = 1 - clamp01((clientY - r.top) / r.height);
    commit({ ...hsv, s, v });
  };
  const onSvDown = (e: React.PointerEvent) => {
    svActive.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateSv(e.clientX, e.clientY);
  };
  const onSvMove = (e: React.PointerEvent) => {
    if (svActive.current) updateSv(e.clientX, e.clientY);
  };

  /* ── Hue slider ── */
  const updateHue = (clientX: number) => {
    const el = hueRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    commit({ ...hsv, h: clamp01((clientX - r.left) / r.width) * 360 });
  };
  const onHueDown = (e: React.PointerEvent) => {
    hueActive.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateHue(e.clientX);
  };
  const onHueMove = (e: React.PointerEvent) => {
    if (hueActive.current) updateHue(e.clientX);
  };
  const releasePointer = (e: React.PointerEvent) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  };
  const onSvUp = (e: React.PointerEvent) => {
    svActive.current = false;
    releasePointer(e);
  };
  const onHueUp = (e: React.PointerEvent) => {
    hueActive.current = false;
    releasePointer(e);
  };

  const onHexChange = (text: string) => {
    setHexText(text);
    const hex = normalizeHex(text);
    if (hex) {
      setHsv(hexToHsv(hex));
      onChange(hex);
    }
  };

  if (!pos) return null;

  return createPortal(
    <div
      ref={popRef}
      role="dialog"
      aria-label="Colour picker"
      className="fixed z-50 rounded-xl border border-white/[0.08] bg-[#1a1a1c] p-3 shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
      style={{ top: pos.top, left: pos.left, width: WIDTH }}
    >
      {/* Saturation / value */}
      <div
        ref={svRef}
        onPointerDown={onSvDown}
        onPointerMove={onSvMove}
        onPointerUp={onSvUp}
        onPointerCancel={onSvUp}
        className="relative h-32 w-full cursor-crosshair touch-none rounded-lg"
        style={{
          background: `linear-gradient(to top, #000, rgba(0,0,0,0)), linear-gradient(to right, #fff, rgba(255,255,255,0)), hsl(${hsv.h} 100% 50%)`,
        }}
      >
        <span
          className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
          style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }}
        />
      </div>

      {/* Hue */}
      <div
        ref={hueRef}
        onPointerDown={onHueDown}
        onPointerMove={onHueMove}
        onPointerUp={onHueUp}
        onPointerCancel={onHueUp}
        className="relative mt-3 h-3 w-full cursor-ew-resize touch-none rounded-full"
        style={{
          background:
            "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
        }}
      >
        <span
          className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
          style={{ left: `${(hsv.h / 360) * 100}%` }}
        />
      </div>

      {/* Hex + preview */}
      <div className="mt-3 flex items-center gap-2">
        <span
          className="h-7 w-7 flex-shrink-0 rounded-md ring-1 ring-white/15"
          style={{ background: currentHex }}
          aria-hidden="true"
        />
        <input
          type="text"
          value={hexText}
          onChange={(e) => onHexChange(e.target.value)}
          spellCheck={false}
          aria-label="Hex value"
          className="h-7 w-full rounded-md bg-white/[0.05] px-2 text-[12px] tabular-nums text-white/90 focus:outline-none focus:ring-1 focus:ring-[#E8BE3C]/50"
        />
      </div>

      {/* Presets */}
      <div className="mt-3 grid grid-cols-8 gap-1.5">
        {PRESETS.map((hex) => (
          <button
            key={hex}
            type="button"
            onClick={() => {
              setHsv(hexToHsv(hex));
              setHexText(hex);
              onChange(hex);
            }}
            aria-label={hex}
            className="aspect-square w-full rounded-md ring-1 ring-white/10 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#E8BE3C]/60"
            style={{ background: hex }}
          />
        ))}
      </div>
    </div>,
    document.body,
  );
}
