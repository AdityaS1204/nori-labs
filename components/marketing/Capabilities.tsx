"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";

import { CAPABILITIES } from "@/lib/landing-content";
import MediaFrame from "./MediaFrame";
import Section from "./Section";

export default function Capabilities() {
  const [selected, setSelected] = useState(0);
  const active = CAPABILITIES[selected];

  return (
    <Section id="capabilities" index="03" label="Capabilities">
      <h2 className="max-w-[20ch] text-[clamp(26px,3.6vw,38px)] font-semibold leading-[1.1] tracking-[-0.02em] text-white">
        What it does around the house
      </h2>

      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <ul className="m-0 flex list-none flex-col p-0" role="list">
          {CAPABILITIES.map((capability, i) => {
            const isActive = i === selected;
            return (
              <li key={capability.id}>
                <button
                  type="button"
                  onClick={() => setSelected(i)}
                  aria-current={isActive}
                  aria-controls="capability-visual"
                  className={[
                    "group flex w-full items-start gap-4 border-b border-white/[0.07] px-4 py-5 text-left transition-[background-color] duration-200",
                    isActive ? "bg-white/[0.045]" : "hover:bg-white/[0.02]",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[10.5px] tabular-nums transition-colors duration-200",
                      isActive
                        ? "border-[#E8BE3C]/50 bg-[#E8BE3C]/10 text-[#E8BE3C]"
                        : "border-white/[0.12] text-white/35",
                    ].join(" ")}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <span
                      className={[
                        "text-[15.5px] font-medium tracking-[-0.01em] transition-colors duration-200",
                        isActive ? "text-white" : "text-white/70 group-hover:text-white/90",
                      ].join(" ")}
                    >
                      {capability.title}
                    </span>
                    <span
                      className={[
                        "grid text-[13.5px] leading-relaxed text-white/45 transition-[grid-template-rows] duration-300 ease-out",
                        isActive ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                      ].join(" ")}
                    >
                      <span className="overflow-hidden">{capability.body}</span>
                    </span>
                  </span>

                  <HugeiconsIcon
                    icon={ArrowUpRight01Icon}
                    size={16}
                    color="currentColor"
                    className={[
                      "mt-1 shrink-0 transition-colors duration-200",
                      isActive ? "text-[#E8BE3C]" : "text-white/25 group-hover:text-white/50",
                    ].join(" ")}
                  />
                </button>
              </li>
            );
          })}
        </ul>

        <div id="capability-visual" aria-live="polite">
          <MediaFrame media={active.media} />
        </div>
      </div>
    </Section>
  );
}
