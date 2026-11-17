"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";

import { NAV_CTA, NAV_LINKS } from "@/lib/landing-content";

export default function PillNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 py-4">
      <nav
        aria-label="Main navigation"
        className="pointer-events-auto flex w-full max-w-[560px] items-center gap-2 rounded-full border border-white/[0.09] bg-[#1c1b1e]/90 p-1.5 pl-4 backdrop-blur-md sm:w-auto"
      >
        <Link
          href="/"
          aria-label="Nori Robotics home"
          className="shrink-0 text-[15px] font-semibold tracking-[-0.01em] text-white no-underline transition-opacity duration-150 hover:opacity-70"
        >
          nori
        </Link>

        <ul className="m-0 hidden list-none items-center gap-0.5 p-0 sm:flex" role="list">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="block rounded-full px-3 py-1.5 text-[13px] text-white/55 no-underline transition-[color,background-color] duration-150 hover:bg-white/[0.07] hover:text-white"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href={NAV_CTA.href}
          className="ml-auto shrink-0 rounded-full bg-lime px-4 py-1.5 text-[13px] font-medium text-ink no-underline transition-[filter,transform] duration-150 hover:brightness-105 motion-safe:active:scale-[0.97] sm:ml-0"
        >
          {NAV_CTA.label}
        </Link>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="pill-nav-drawer"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white transition-colors duration-150 hover:bg-white/[0.07] sm:hidden"
        >
          <HugeiconsIcon icon={open ? Cancel01Icon : Menu01Icon} size={18} color="currentColor" />
        </button>
      </nav>

      <div
        id="pill-nav-drawer"
        role="dialog"
        aria-label="Navigation menu"
        aria-modal="true"
        aria-hidden={!open}
        className={[
          "pointer-events-auto fixed inset-x-4 top-[76px] z-40 flex flex-col overflow-hidden rounded-[14px] border border-white/[0.09] bg-[#1c1b1e] sm:hidden",
          "transition-[opacity,transform] duration-300 ease-out",
          open ? "opacity-100 translate-y-0" : "pointer-events-none -translate-y-2 opacity-0",
        ].join(" ")}
      >
        <ul className="m-0 list-none p-0" role="list">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href} className="border-b border-white/[0.07] last:border-b-0">
              <Link
                href={href}
                onClick={() => setOpen(false)}
                className="block px-5 py-4 text-[17px] font-medium text-white no-underline transition-colors duration-150 hover:bg-white/[0.04]"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
