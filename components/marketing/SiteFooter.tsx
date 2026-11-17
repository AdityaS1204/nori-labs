import Link from "next/link";
import Image from "next/image";

import { FOOTER_LINKS, SOCIAL_LINKS } from "@/lib/landing-content";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.07]">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
        <Link
          href="/"
          aria-label="Nori Robotics home"
          className="flex w-fit items-center gap-2.5 text-white no-underline transition-opacity duration-150 hover:opacity-70"
        >
          <Image
            src="/mark.webp"
            alt=""
            width={26}
            height={26}
            className="h-[26px] w-[26px] shrink-0 object-contain"
          />
          <span className="flex flex-col gap-[2px] leading-none">
            <span className="text-[14px] font-extrabold uppercase tracking-[0.08em]">nori</span>
            <span className="text-[9px] uppercase tracking-[0.14em] text-white/50">robotics</span>
          </span>
        </Link>

        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {FOOTER_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[13px] tracking-[0.04em] text-white/45 no-underline transition-colors duration-150 hover:text-white"
            >
              {label}
            </Link>
          ))}
        </nav>

        <ul className="m-0 flex list-none items-center gap-2 p-0" role="list">
          {SOCIAL_LINKS.map(({ href, label }) => (
            <li key={href}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={label}
                title={label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.1] font-mono text-[10px] uppercase tracking-[0.04em] text-white/45 no-underline transition-[color,border-color] duration-150 hover:border-white/30 hover:text-white"
              >
                {label.slice(0, 2)}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto max-w-[1200px] border-t border-white/[0.05] px-5 py-5 sm:px-8">
        <p className="m-0 font-mono text-[11px] tracking-[0.06em] text-white/30">
          © 2026 Nori Robotics
        </p>
      </div>
    </footer>
  );
}
