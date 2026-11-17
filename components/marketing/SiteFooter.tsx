import Link from "next/link";

import { FOOTER } from "@/lib/landing-content";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.07] bg-ink">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-6 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
        <Link
          href="/"
          aria-label="Nori Robotics home"
          className="w-fit text-[15px] font-semibold tracking-[-0.01em] text-white no-underline transition-opacity duration-150 hover:opacity-70"
        >
          nori
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
