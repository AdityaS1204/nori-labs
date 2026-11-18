"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon, Cancel01Icon, Menu01Icon } from "@hugeicons/core-free-icons";

import { NAV_CTA, NAV_LINKS } from "@/lib/landing-content";

const EASE = [0.23, 1, 0.32, 1] as const;

/** Geometry from the supplied clip-path, scaled to a 44px tab. */
const TAB_RADIUS = 12;
const FILLET = 10;

/** Grace period so sweeping the cursor between tabs does not flash the panel shut. */
const CLOSE_DELAY = 140;

const PANEL = "#0f0e10";

/**
 * Concave corner flaring the active tab base into the panel below. Drawn in the
 * panel colour, so the panel top edge appears to curve up into the tab.
 */
function Fillet({ side }: { side: "left" | "right" }) {
  const at = side === "left" ? "0% 0%" : "100% 0%";
  const mask = `radial-gradient(circle ${FILLET}px at ${at}, transparent 99%, #000 100%)`;

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0"
      style={{
        width: FILLET,
        height: FILLET,
        [side === "left" ? "right" : "left"]: "100%",
        backgroundColor: PANEL,
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  );
}

export default function TabNav() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const reduced = useReducedMotion();

  const openTab = useCallback((i: number) => {
    clearTimeout(closeTimer.current);
    setOpenIdx(i);
  }, []);

  const scheduleClose = useCallback(() => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenIdx(null), CLOSE_DELAY);
  }, []);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpenIdx(null);
      setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const spring = reduced
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 420, damping: 38, mass: 0.7 };

  const active = openIdx === null ? null : NAV_LINKS[openIdx];

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 py-4">
      <div
        className="pointer-events-auto w-full max-w-[580px] overflow-hidden rounded-[18px] border border-white/[0.09] bg-[#1c1b1e]/95 backdrop-blur-md"
        onMouseLeave={scheduleClose}
      >
        {/* Tab row */}
        <div className="flex h-[52px] items-stretch gap-1 px-2 pt-2">
          <Link
            href="/"
            aria-label="Nori Robotics home"
            className="flex shrink-0 items-center px-2 pb-2 text-[15px] font-semibold tracking-[-0.01em] text-white no-underline transition-opacity duration-150 hover:opacity-70"
          >
            nori
          </Link>

          <ul className="m-0 hidden list-none items-stretch gap-1 p-0 sm:flex" role="list">
            {NAV_LINKS.map((item, i) => {
              const isOpen = openIdx === i;
              return (
                <li
                  key={item.href}
                  className="relative flex items-stretch"
                  onMouseEnter={() => openTab(i)}
                  onFocus={() => openTab(i)}
                >
                  {isOpen ? (
                    <motion.span
                      layoutId="nav-tab"
                      transition={spring}
                      className="absolute inset-0"
                      style={{
                        backgroundColor: "var(--lime)",
                        borderTopLeftRadius: TAB_RADIUS,
                        borderTopRightRadius: TAB_RADIUS,
                      }}
                    >
                      <Fillet side="left" />
                      <Fillet side="right" />
                    </motion.span>
                  ) : null}

                  <Link
                    href={item.href}
                    aria-expanded={isOpen}
                    onClick={() => setOpenIdx(null)}
                    className={`relative z-10 flex items-center whitespace-nowrap px-4 pb-2 text-[13px] no-underline transition-colors duration-150 ${
                      isOpen ? "font-medium text-ink" : "text-white/55 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="ml-auto flex shrink-0 items-center gap-1 pb-2">
            <Link
              href={NAV_CTA.href}
              className="rounded-full bg-lime px-4 py-1.5 text-[13px] font-medium text-ink no-underline transition-[filter,transform] duration-150 hover:brightness-105 motion-safe:active:scale-[0.97]"
            >
              {NAV_CTA.label}
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileOpen}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors duration-150 hover:bg-white/[0.07] sm:hidden"
            >
              <HugeiconsIcon
                icon={mobileOpen ? Cancel01Icon : Menu01Icon}
                size={18}
                color="currentColor"
              />
            </button>
          </div>
        </div>

        {/* Hover panel */}
        <AnimatePresence initial={false}>
          {active ? (
            <motion.div
              key="panel"
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={reduced ? { duration: 0 } : { duration: 0.3, ease: EASE }}
              className="hidden overflow-hidden sm:block"
            >
              {/* No top padding: the panel edge must meet the tab base for the fillets to read. */}
              <div className="px-2 pb-2">
                <motion.ul
                  key={active.href}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.22, ease: EASE }}
                  className="m-0 flex list-none flex-col gap-1 rounded-[14px] p-2"
                  style={{ backgroundColor: PANEL }}
                  role="list"
                >
                  {active.items.map((child) => (
                    <li key={child.href + child.label}>
                      <Link
                        href={child.href}
                        onClick={() => setOpenIdx(null)}
                        className="group flex items-center justify-between gap-4 rounded-[10px] bg-white/[0.04] px-4 py-3 no-underline transition-colors duration-150 hover:bg-white/[0.08]"
                      >
                        <span className="flex flex-col gap-0.5">
                          <span className="text-[14px] font-medium tracking-[-0.01em] text-white">
                            {child.label}
                          </span>
                          <span className="text-[12px] leading-snug text-white/40">
                            {child.note}
                          </span>
                        </span>
                        <HugeiconsIcon
                          icon={ArrowUpRight01Icon}
                          size={18}
                          color="currentColor"
                          className="shrink-0 text-white/30 transition-[color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-lime"
                        />
                      </Link>
                    </li>
                  ))}
                </motion.ul>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Mobile drawer */}
        <AnimatePresence initial={false}>
          {mobileOpen ? (
            <motion.div
              key="mobile"
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={reduced ? { duration: 0 } : { duration: 0.3, ease: EASE }}
              className="overflow-hidden sm:hidden"
            >
              <ul className="m-0 list-none p-2 pt-0" role="list">
                {NAV_LINKS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-[10px] px-3 py-3 text-[16px] font-medium text-white no-underline transition-colors duration-150 hover:bg-white/[0.05]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  );
}
