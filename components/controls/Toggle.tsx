"use client";

import { motion } from "motion/react";

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

/** Compact switch with a spring-animated knob. */
export default function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-150 ${
        checked ? "bg-[#E8BE3C]" : "bg-white/[0.16]"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 34 }}
        className={`absolute top-[2px] h-4 w-4 rounded-full bg-white ${
          checked ? "left-[18px]" : "left-[2px]"
        }`}
      />
    </button>
  );
}
