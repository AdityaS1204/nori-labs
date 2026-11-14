"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";

interface ControlSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/**
 * A collapsible group with a DialKit-style header: a small label and a chevron
 * that points up when open. No surrounding box — the rows below carry the look.
 */
export default function ControlSection({
  title,
  defaultOpen = true,
  children,
}: ControlSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-1 py-1.5"
      >
        <span className="text-[13px] font-medium text-white/55">{title}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex text-white/40"
        >
          <HugeiconsIcon icon={ArrowDown01Icon} size={15} color="currentColor" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 pb-1 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
