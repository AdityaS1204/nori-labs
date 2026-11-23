import Link from "next/link";

import { FOOTER } from "@/lib/landing-content";
import NoriMark from "./NoriMark";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.07] bg-ink">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-10 px-5 py-14 sm:px-8">
        {/* The brand mark at display scale: the hero clover and the wordmark in
            the heading font, sized in em so the two stay locked as it grows. */}
        <Link
          href="/"
          aria-label="Nori Robotics home"
          className="flex w-fit items-center gap-[0.2em] text-[clamp(56px,13vw,120px)] no-underline transition-opacity duration-150 hover:opacity-70"
        >
          <NoriMark className="h-[0.82em] w-[0.82em]" />
          <span className="font-display font-semibold leading-none tracking-[-0.03em] text-white">
            nori
          </span>
        </Link>

        <div className="flex flex-col gap-6 border-t border-white/[0.06] pt-8 md:flex-row md:items-start md:justify-between">
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
      </div>
    </footer>
  );
}
