"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon, Cancel01Icon, Menu01Icon } from "@hugeicons/core-free-icons";

import Squircle from "@/components/ui/Squircle";
import { RADIUS } from "@/components/ui/radius";
import { NAV_CTA, NAV_LINKS } from "@/lib/landing-content";
import NavVideo from "./NavVideo";
import NoriMark from "./NoriMark";

const EASE = [0.23, 1, 0.32, 1] as const;

const TAB_RADIUS = 12;
const FILLET = 8;

const CLOSE_DELAY = 140;
const SURFACE = "#171717";
const SHELL = "#262626";

/**
 * Concave corner flaring the tab base out into the panel top edge. Same fill as
 * both, so the three elements read as the one shape the clip-path describes.
 *
 * The box sits beside the tab, its bottom on the panel edge. Masking out a
 * circle centred on its outer top corner leaves exactly the curved triangle
 * that meets the tab on one side and the panel on the other.
 */
function Fillet({ side }: { side: "left" | "right" }) {
  const at = side === "left" ? "0% 0%" : "100% 0%";
  const mask = `radial-gradient(circle ${FILLET}px at ${at}, transparent 99%, #000 100%)`;

  // `layout` is what keeps the curve a curve: the parent moves between tabs of
  // different widths by animating scale, which would stretch an unflagged child
  // into an ellipse. Flagged children get that scale counteracted each frame.
  return (
    <motion.span
      layout
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0"
      style={{
        width: FILLET,
        height: FILLET,
        [side === "left" ? "right" : "left"]: "100%",
        backgroundColor: SURFACE,
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  );
}

export default function TabNav() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [hoveredChild, setHoveredChild] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const reduced = useReducedMotion();

  const openTab = useCallback((i: number) => {
    clearTimeout(closeTimer.current);
    setOpenIdx(i);
    setHoveredChild(0);
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

  // Critically damped (damping = 2*sqrt(stiffness*mass)), so the highlight
  // settles on the new tab without the overshoot that reads as a wobble.
  const spring = reduced
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 400, damping: 40, mass: 1 };

  const active = openIdx === null ? null : NAV_LINKS[openIdx];
  // A tab's own clip is the fallback for links that bring none of their own.
  const preview = active ? (active.items[hoveredChild]?.media ?? active.media) : undefined;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 py-4">
      <div
        className="pointer-events-auto w-full max-w-[640px] overflow-hidden rounded-[20px] border border-white/[0.07] backdrop-blur-md"
        style={{ backgroundColor: SHELL }}
        onMouseLeave={scheduleClose}
      >
        {/* Tab row */}
        <div className="flex h-[52px] items-stretch gap-1 px-2 pt-2">
          <Link
            href="/"
            aria-label="Nori Robotics home"
            className="flex shrink-0 items-center gap-1.5 px-2 pb-2 text-[15px] font-semibold tracking-[-0.01em] text-white no-underline transition-opacity duration-150 hover:opacity-70"
          >
            <NoriMark className="h-[17px] w-[17px]" />
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
                        backgroundColor: SURFACE,
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
                    // Weight stays constant across states: bolding on activation
                    // would re-measure the tab mid-slide, so the highlight would
                    // be chasing a target that moves under it.
                    className={`relative z-10 flex items-center whitespace-nowrap px-4 pb-2 text-[13px] font-medium no-underline transition-colors duration-150 ${
                      isOpen ? "text-white" : "text-white/55 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="ml-auto flex shrink-0 items-center gap-1 pb-2">
            <Squircle cornerRadius={RADIUS.control}>
              <Link
                href={NAV_CTA.href}
                className="bg-lime px-4 py-1.5 text-[13px] font-medium text-ink no-underline transition-[filter,transform] duration-150 hover:brightness-105 motion-safe:active:scale-[0.97]"
              >
                {NAV_CTA.label}
              </Link>
            </Squircle>

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
              layout
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={reduced ? { duration: 0 } : { duration: 0.3, ease: EASE }}
              className="hidden overflow-hidden sm:block"
            >
              {/* Flush with the tab base, pulled 1px under it so no hairline shows at the seam. */}
              <div className="-mt-px px-2 pb-2">
                {/* No key here on purpose: keying by tab would unmount the list and
                    remount it at opacity 0, flashing an empty panel for a frame
                    between tabs. Reusing it lets the rows swap under a height
                    that `layout` morphs. */}
                <motion.div
                  layout
                  transition={reduced ? { duration: 0 } : { duration: 0.22, ease: EASE }}
                  className={`grid gap-2 rounded-[16px] p-2 ${
                    preview ? "sm:grid-cols-[1.15fr_1fr]" : ""
                  }`}
                  style={{ backgroundColor: SURFACE }}
                >
                  <ul className="m-0 flex list-none flex-col gap-0.5 p-0" role="list">
                    {active.items.map((child, childIdx) => (
                      <li
                        key={child.href + child.label}
                        onPointerEnter={() => setHoveredChild(childIdx)}
                        onFocus={() => setHoveredChild(childIdx)}
                      >
                        <Squircle cornerRadius={RADIUS.control}>
                          <Link
                            href={child.href}
                            onClick={() => setOpenIdx(null)}
                            className="group flex items-center justify-between gap-4 px-4 py-3 no-underline transition-colors duration-150 hover:brightness-125"
                            style={{ backgroundColor: SHELL }}
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
                        </Squircle>
                      </li>
                    ))}
                  </ul>

                  {preview ? (
                    // Grid stretch sizes this, not `h-full`: a percentage height
                    // against an auto row collapses to its (absolute) content.
                    <NavVideo media={preview} className="self-stretch min-h-[136px]" />
                  ) : null}
                </motion.div>
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
                    <Squircle cornerRadius={RADIUS.control}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="block px-3 py-3 text-[16px] font-medium text-white no-underline transition-colors duration-150 hover:bg-white/[0.05]"
                      >
                        {item.label}
                      </Link>
                    </Squircle>
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
