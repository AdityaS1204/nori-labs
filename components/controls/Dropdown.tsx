"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface DropdownProps {
  /** The trigger the popover is anchored to. */
  anchorRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  children: React.ReactNode;
  /** Popover width in px. */
  width?: number;
  /** Align the popover's left or right edge to the anchor. */
  align?: "left" | "right";
  /** Accessible label for the menu container. */
  label?: string;
}

const EST_HEIGHT = 340;

/**
 * A portal popover anchored to a trigger, with viewport-aware placement and
 * outside-click / Escape dismissal. The visual shell for menus and pickers
 * (same dismissal model as `ColorPicker`).
 */
export default function Dropdown({
  anchorRef,
  onClose,
  children,
  width = 240,
  align = "left",
  label,
}: DropdownProps) {
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    const a = anchorRef.current;
    if (!a) return;
    const r = a.getBoundingClientRect();
    const left =
      align === "right"
        ? Math.max(8, Math.min(r.right - width, window.innerWidth - width - 8))
        : Math.max(8, Math.min(r.left, window.innerWidth - width - 8));
    const top =
      r.bottom + 8 + EST_HEIGHT > window.innerHeight - 8
        ? Math.max(8, r.top - EST_HEIGHT - 8)
        : r.bottom + 8;
    setPos({ top, left });
  }, [anchorRef, width, align]);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (popRef.current?.contains(t) || anchorRef.current?.contains(t)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [anchorRef, onClose]);

  if (!pos) return null;

  return createPortal(
    <div
      ref={popRef}
      role="menu"
      aria-label={label}
      className="fixed z-50 rounded-xl border border-white/[0.08] bg-[#1a1a1c] p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
      style={{ top: pos.top, left: pos.left, width }}
    >
      {children}
    </div>,
    document.body,
  );
}
