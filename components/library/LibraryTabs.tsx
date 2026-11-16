"use client";

import { motion } from "motion/react";

export type LibraryTab = "public" | "mine";

const TABS: { key: LibraryTab; label: string }[] = [
  { key: "public", label: "Community" },
  { key: "mine", label: "My presets" },
];

/**
 * Segmented toggle between the public community feed and the signed-in user's
 * own presets. The active pill slides between tabs (shared `layoutId`).
 */
export default function LibraryTabs({
  tab,
  onChange,
}: {
  tab: LibraryTab;
  onChange: (mine: boolean) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Library view"
      className="inline-flex gap-1 self-start rounded-full border border-white/[0.07] bg-white/[0.02] p-1"
    >
      {TABS.map(({ key, label }) => {
        const active = tab === key;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(key === "mine")}
            className={`relative rounded-full px-4 py-1.5 text-[12px] font-medium tracking-[0.02em] transition-colors duration-150 ${
              active ? "text-[#0d0d0e]" : "text-white/55 hover:text-white/85"
            }`}
          >
            {active && (
              <motion.span
                layoutId="library-tab-pill"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="absolute inset-0 -z-10 rounded-full bg-[#E8BE3C]"
              />
            )}
            {label}
          </button>
        );
      })}
    </div>
  );
}
