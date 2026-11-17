import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { TEACHING } from "@/lib/landing-content";
import MediaFrame from "./MediaFrame";
import Section from "./Section";

export default function TeachingFlow() {
  return (
    <Section id="teaching" index="04" label={TEACHING.label}>
      <div className="grid gap-8 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-start md:gap-12">
        <div className="flex flex-col gap-5">
          <h2 className="max-w-[20ch] text-[clamp(26px,3.6vw,38px)] font-semibold leading-[1.1] tracking-[-0.02em] text-white">
            {TEACHING.headline}
          </h2>
          <p className="max-w-[54ch] text-[14.5px] leading-relaxed text-white/50">
            {TEACHING.body}
          </p>
        </div>

        <Link
          href={TEACHING.cta.href}
          className="group flex items-center justify-between gap-4 rounded-[6px] border border-white/[0.12] px-5 py-4 text-[13px] font-medium tracking-[0.04em] text-white/80 no-underline transition-[color,border-color,background-color] duration-150 hover:border-[#E8BE3C]/40 hover:bg-[#E8BE3C]/[0.06] hover:text-white"
        >
          {TEACHING.cta.label}
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={16}
            color="currentColor"
            className="shrink-0 text-white/40 transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-[#E8BE3C]"
          />
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <MediaFrame media={TEACHING.media} video />

        <ol className="m-0 flex list-none flex-col p-0" role="list">
          {TEACHING.steps.map((step, i) => (
            <li
              key={step.title}
              className="flex items-start gap-4 border-b border-white/[0.07] py-5 first:pt-0 last:border-b-0"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/[0.12] font-mono text-[10.5px] tabular-nums text-white/40">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex min-w-0 flex-col gap-1.5">
                <h3 className="text-[15.5px] font-medium tracking-[-0.01em] text-white/90">
                  {step.title}
                </h3>
                <p className="text-[13.5px] leading-relaxed text-white/45">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
