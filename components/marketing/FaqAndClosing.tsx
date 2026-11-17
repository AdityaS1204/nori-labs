import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { CLOSING, FAQ } from "@/lib/landing-content";
import Section from "./Section";

export default function FaqAndClosing() {
  return (
    <Section id="faq" index="06" label="Questions and next step">
      <div className="grid gap-10 md:grid-cols-2 md:gap-14">
        <div className="flex flex-col gap-6">
          <h2 className="text-[clamp(24px,3.2vw,32px)] font-semibold leading-[1.1] tracking-[-0.02em] text-white">
            Common questions
          </h2>

          <div className="flex flex-col border-t border-white/[0.07]">
            {FAQ.map(({ question, answer }) => (
              <details key={question} className="group border-b border-white/[0.07]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[14.5px] font-medium tracking-[-0.01em] text-white/80 transition-colors duration-150 marker:hidden hover:text-white [&::-webkit-details-marker]:hidden">
                  {question}
                  <span
                    className="relative h-3.5 w-3.5 shrink-0 text-white/40 transition-colors duration-150 group-hover:text-white/70 group-open:text-[#E8BE3C]"
                    aria-hidden="true"
                  >
                    <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
                    <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current transition-transform duration-200 group-open:rotate-90 group-open:scale-y-0" />
                  </span>
                </summary>
                <p className="m-0 max-w-[52ch] pb-5 pr-8 text-[13.5px] leading-relaxed text-white/50">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </div>

        <aside className="flex flex-col gap-5 self-start rounded-[8px] border border-[#E8BE3C]/25 bg-[#E8BE3C]/[0.05] p-7 md:p-9">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#E8BE3C]/80">
            {CLOSING.label}
          </span>

          <div className="flex flex-col gap-1.5">
            <span className="text-[clamp(34px,4.4vw,46px)] font-semibold leading-none tracking-[-0.03em] text-white tabular-nums">
              {CLOSING.price}
            </span>
            <h2 className="text-[17px] font-medium tracking-[-0.01em] text-white/85">
              {CLOSING.headline}
            </h2>
          </div>

          <p className="max-w-[40ch] text-[13.5px] leading-relaxed text-white/50">{CLOSING.body}</p>

          <Link
            href={CLOSING.cta.href}
            className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-[6px] bg-[#E8BE3C] px-5 py-3 text-[13px] font-semibold tracking-[0.04em] text-[#0d0d0e] no-underline transition-[box-shadow,transform] duration-150 hover:shadow-[0_0_0_1px_#E8BE3C,0_6px_20px_rgba(232,190,60,0.28)] motion-safe:active:scale-[0.97]"
          >
            {CLOSING.cta.label}
            <HugeiconsIcon icon={ArrowRight01Icon} size={15} color="currentColor" />
          </Link>
        </aside>
      </div>
    </Section>
  );
}
