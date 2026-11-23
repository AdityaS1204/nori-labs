import Link from "next/link";

import { FOOTER } from "@/lib/landing-content";
import NoriMark from "./NoriMark";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.07] bg-ink">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
        {/* Logo lockup: the hero clover beside the wordmark in the heading font. */}
        <Link
          href="/"
          aria-label="Nori Robotics home"
          className="flex w-fit items-center gap-3 no-underline transition-opacity duration-150 hover:opacity-70"
        >
          <NoriMark className="h-10 w-10 sm:h-11 sm:w-11" />
          <span className="font-display text-[clamp(30px,4vw,40px)] font-semibold leading-none tracking-[-0.02em] text-white">
            nori
          </span>
        </Link>

        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {FOOTER.links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[12.5px] text-white/45 no-underline transition-colors duration-150 hover:text-white"
            >
              {label}
            </Link>
          ))}
          {FOOTER.socials.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="text-[12.5px] text-white/45 no-underline transition-colors duration-150 hover:text-white"
            >
              {label}
            </a>
          ))}
        </nav>

        <p className="m-0 max-w-[40ch] font-mono text-[9.5px] uppercase leading-[1.6] tracking-[0.14em] text-white/30 md:text-right">
          {FOOTER.note}
        </p>
      </div>
    </footer>
  );
}
