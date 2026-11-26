import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DiscordIcon,
  GithubIcon,
  Linkedin01Icon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons";

import { FOOTER } from "@/lib/landing-content";
import NewsletterForm from "./NewsletterForm";
import NoriMark from "./NoriMark";

/** Brand glyph per social, keyed by the label carried in content. */
const SOCIAL_ICON: Record<string, typeof NewTwitterIcon> = {
  X: NewTwitterIcon,
  Discord: DiscordIcon,
  LinkedIn: Linkedin01Icon,
  GitHub: GithubIcon,
};

export default function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-cream text-ink">
      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-5 py-14 sm:px-8 lg:px-12">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)_1.6fr]">
          {/* Brand: small logo, tagline, social chips */}
          <div className="flex flex-col gap-5">
            <Link
              href="/"
              aria-label="Nori Robotics home"
              className="flex w-fit items-center gap-2 text-[26px] no-underline transition-opacity duration-150 hover:opacity-70"
            >
              <NoriMark className="h-[0.9em] w-[0.9em]" />
              <span className="font-display font-semibold leading-none tracking-[-0.02em] text-ink">
                nori
              </span>
            </Link>

            <p className="m-0 max-w-[22ch] text-[13px] leading-snug text-ink/65">
              {FOOTER.tagline}
            </p>

            <ul className="m-0 flex list-none gap-2 p-0">
              {FOOTER.socials.map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-ink/10 bg-ink/[0.04] text-ink/70 transition-colors duration-150 hover:border-ink/25 hover:bg-ink/[0.08] hover:text-ink"
                  >
                    <HugeiconsIcon icon={SOCIAL_ICON[label] ?? GithubIcon} size={16} color="currentColor" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Link columns */}
          {FOOTER.columns.map((column) => (
            <nav key={column.title} aria-label={column.title} className="flex flex-col gap-3">
              <h2 className="m-0 font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink/40">
                {column.title}
              </h2>
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {column.links.map(({ href, label }) => (
                  <li key={href + label}>
                    <Link
                      href={href}
                      className="text-[13px] text-ink/65 no-underline transition-colors duration-150 hover:text-ink"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Newsletter */}
          <NewsletterForm />
        </div>

        <p className="m-0 mt-12 max-w-[48ch] font-mono text-[9.5px] uppercase leading-[1.6] tracking-[0.14em] text-ink/40">
          {FOOTER.note}
        </p>
      </div>

      {/* Oversized brand mark, centred and bled off the bottom edge. */}
      <Link
        href="/"
        aria-hidden="true"
        tabIndex={-1}
        className="pointer-events-none relative z-10 flex w-full items-center justify-center gap-[0.12em] text-[clamp(96px,26vw,260px)] leading-[0.8] text-ink/90"
        style={{ marginBottom: "-0.18em" }}
      >
        <NoriMark className="h-[0.82em] w-[0.82em]" />
        <span className="font-display font-semibold tracking-[-0.03em]">nori</span>
      </Link>
    </footer>
  );
}
