"use client";

import { motion } from "motion/react";

import { TARGETS, type RenderTarget } from "@/lib/render-target";

interface TargetToggleProps {
  target: RenderTarget;
  onChange: (target: RenderTarget) => void;
}

/**
 * Segmented Web / LVGL switch. The active pill slides between the two with a
 * shared layout id, so the control reads as one surface rather than two
 * buttons.
 */
export default function TargetToggle({ target, onChange }: TargetToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Render target"
      className="relative flex h-9 items-center gap-0.5 rounded-[9px] bg-[#242427] p-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
    >
      {TARGETS.map((t) => {
        const active = t.id === target;
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(t.id)}
            title={t.hint}
            className="relative flex-1 rounded-[7px] px-2 py-1.5 text-[12px] font-medium transition-colors"
          >
            {active && (
              <motion.span
                layoutId="target-toggle-pill"
                transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.6 }}
                className="absolute inset-0 rounded-[7px] bg-[#E8BE3C]"
              />
            )}
            <span
              className={`relative z-10 ${active ? "text-[#0d0d0e]" : "text-white/50 hover:text-white/80"}`}
            >
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
