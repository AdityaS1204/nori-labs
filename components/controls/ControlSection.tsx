"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import gsap from "gsap";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";

interface ControlSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/**
 * A collapsible group rendered as a recessed, filled tray: a header with a
 * chevron on top, and the control rows inside. On open the rows stagger in
 * (y + blur only — never opacity — so they stay visible if motion is skipped).
 */
export default function ControlSection({
  title,
  defaultOpen = true,
  children,
}: ControlSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  /* Stagger the rows in when the section opens. The body's children flatten
     from nested fragments into direct DOM rows, so targeting them staggers
     each control individually. */
  useEffect(() => {
    if (!open || reduce) return;
    const body = bodyRef.current;
    if (!body || body.children.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.from(gsap.utils.toArray<HTMLElement>(body.children), {
        y: 8,
        filter: "blur(4px)",
        duration: 0.3,
        ease: "power3.out",
        stagger: 0.04,
      });
    }, body);
    return () => ctx.revert();
  }, [open, reduce]);

  return (
    <div className="flex flex-col rounded-2xl border border-white/[0.05] bg-[#141416] p-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-1 py-1"
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
            <div ref={bodyRef} className="flex flex-col gap-2 pb-0.5 pt-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
