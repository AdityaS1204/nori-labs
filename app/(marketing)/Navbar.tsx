'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HugeiconsIcon } from '@hugeicons/react';
import { Menu01Icon, Cancel01Icon, ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
import gsap from 'gsap';

const NAV_LINKS = [
  { href: '#platform', label: 'Platform' },
  { href: '#research', label: 'Research' },
  { href: '#products', label: 'Products' },
  { href: '#company', label: 'Company' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  /* ── Scroll detection ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Body scroll lock ── */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  /* ── Escape key ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  /* ── Drawer stagger — y+blur only, no opacity, so items stay visible if GSAP fails ── */
  useEffect(() => {
    if (!open) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.from('.nb-di', {
      y: 10,
      filter: 'blur(4px)',
      duration: 0.28,
      ease: 'power4.out',
      stagger: 0.04,
      delay: 0.08,
    });
  }, [open]);

  return (
    <>
      {/* ─── Navbar ─── */}
      <nav
        aria-label="Main navigation"
        className={[
          'fixed top-0 inset-x-0 z-50 h-[60px]',
          'flex items-center justify-between gap-6 px-6',
          'border-b transition-[background-color,border-color,backdrop-filter] duration-200',
          scrolled
            ? 'bg-[#0d0d0e]/85 backdrop-blur-md border-white/[0.08]'
            : 'bg-transparent border-transparent',
        ].join(' ')}
      >
        {/* Logo */}
        <Link
          href="/"
          aria-label="Nori Robotics home"
          className="flex items-center gap-2.5 no-underline text-white flex-shrink-0 opacity-100 hover:opacity-70 transition-opacity duration-150"
        >
          <Image
            src="/mark.webp"
            alt="Nori Robotics logo"
            width={28}
            height={28}
            className="w-[28px] h-[28px] object-contain flex-shrink-0"
            priority
          />
          <div className="flex flex-col leading-none gap-[2px]">
            <span
              className="text-[15px] font-extrabold tracking-[0.08em] uppercase"
              style={{ fontFamily: "var(--font-space-grotesk, 'Space Grotesk', sans-serif)" }}
            >
              nori
            </span>
            <span className="text-[9px] tracking-[0.14em] uppercase text-white/50">
              robotics
            </span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-0.5 list-none m-0 p-0 flex-1" role="list">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="block px-3 py-1.5 text-[13px] tracking-[0.04em] text-white/50 hover:text-white hover:bg-white/[0.06] rounded-md no-underline transition-[background-color,transform] duration-150 motion-safe:active:scale-[0.96]"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-4 flex-shrink-0">
          <span
            className="flex items-center gap-1.5 text-[11px] tracking-[0.06em] text-white/40"
            aria-label="System status: online"
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-green-400"
              style={{ boxShadow: '0 0 6px 1px rgba(74,222,128,0.5)', animation: 'pulse 2.4s ease-in-out infinite' }}
              aria-hidden="true"
            />
            System online
          </span>
          <Link
            href="#demo"
            className="inline-flex items-center gap-1.5 px-[14px] py-[7px] text-[12px] tracking-[0.06em] uppercase text-[#0d0d0e] bg-[#E8BE3C] rounded-[4px] no-underline transition-[box-shadow,transform] duration-150 hover:shadow-[0_0_0_1px_#E8BE3C,0_4px_16px_rgba(232,190,60,0.25)] motion-safe:active:scale-[0.96]"
          >
            Request Demo
            <HugeiconsIcon icon={ArrowUpRight01Icon} size={12} color="currentColor" />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-md text-white hover:bg-white/[0.06] transition-[background-color,transform] duration-150 motion-safe:active:scale-[0.96] flex-shrink-0"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
          aria-controls="nb-mobile-drawer"
        >
          <HugeiconsIcon icon={open ? Cancel01Icon : Menu01Icon} size={20} color="currentColor" />
        </button>
      </nav>

      {/* ─── Mobile drawer — always in DOM; opacity/translate drive visibility ─── */}
      <div
        id="nb-mobile-drawer"
        role="dialog"
        aria-label="Navigation menu"
        aria-modal="true"
        aria-hidden={!open}
        className={[
          'fixed inset-x-0 top-[60px] bottom-0 z-40',
          'flex flex-col md:hidden',
          'bg-[#0d0d0e] border-t border-white/[0.08]',
          'overflow-y-auto overscroll-contain',
          'transition-[opacity,transform]',
          open
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-2 pointer-events-none',
        ].join(' ')}
        style={{
          transitionDuration: open ? '400ms' : '350ms',
          transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        <ul className="list-none m-0 p-0" role="list">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href} className="nb-di border-b border-white/[0.06]">
              <Link
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-6 py-[18px] text-[20px] font-extrabold tracking-[0.04em] text-white no-underline hover:bg-white/[0.04] hover:text-[#E8BE3C] transition-[background-color,color] duration-150"
                style={{ fontFamily: "var(--font-space-grotesk, 'Space Grotesk', sans-serif)" }}
              >
                {label}
                <HugeiconsIcon icon={ArrowUpRight01Icon} size={18} color="rgba(255,255,255,0.35)" />
              </Link>
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="mt-auto p-6 flex flex-col gap-4 border-t border-white/[0.06]">
          <span className="flex items-center gap-1.5 text-[11px] tracking-[0.06em] text-white/40">
            <span
              className="w-1.5 h-1.5 rounded-full bg-green-400"
              style={{ boxShadow: '0 0 6px 1px rgba(74,222,128,0.5)', animation: 'pulse 2.4s ease-in-out infinite' }}
              aria-hidden="true"
            />
            System online
          </span>
          <Link
            href="#demo"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1.5 px-[14px] py-3 text-[12px] tracking-[0.06em] uppercase text-[#0d0d0e] bg-[#E8BE3C] rounded-[4px] no-underline transition-transform duration-150 motion-safe:active:scale-[0.96]"
          >
            Request Demo
            <HugeiconsIcon icon={ArrowUpRight01Icon} size={12} color="currentColor" />
          </Link>
        </div>
      </div>
    </>
  );
}

