import Link from "next/link";

import NoriFaceLive from "@/components/robot-face/NoriFaceLive";
import Squircle from "@/components/ui/Squircle";
import { RADIUS } from "@/components/ui/radius";
import { THE_FACE } from "@/lib/landing-content";
import { FACE_GRID } from "@/lib/landing-faces";
import Reveal from "./Reveal";
import SectionLabel from "./SectionLabel";

export default function TheFace() {
  return (
    <section id="the-face" aria-labelledby="the-face-headline" className="scroll-mt-20 bg-ink">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-9 px-5 py-20 sm:px-8 md:py-28">
        <SectionLabel>{THE_FACE.label}</SectionLabel>

        <Reveal className="flex flex-col gap-5">
          <h2
            id="the-face-headline"
            className="m-0 font-display text-[clamp(26px,4vw,44px)] font-semibold leading-[1.08] tracking-[-0.03em] text-white"
          >
            {THE_FACE.headline}
          </h2>
          <p className="m-0 max-w-[48ch] font-display text-[15px] leading-relaxed text-white/55">
            {THE_FACE.body}
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <ul className="m-0 grid list-none grid-cols-2 gap-4 p-0 lg:grid-cols-4" role="list">
            {FACE_GRID.map(({ id, label, note, face }) => (
              <Squircle cornerRadius={RADIUS.surface} key={id}>
                {/* Gaze is bound to the card, so each face tracks the pointer over itself. */}
                <li className="flex flex-col items-center gap-5 bg-[#1c1b1e] px-4 py-8">
                  <div className="h-[87px] w-[120px]">
                    <NoriFaceLive face={face} gazeMode="cursor" className="h-full w-full" />
                  </div>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">
                      {label}
                    </span>
                    <span className="max-w-[22ch] font-display text-[12.5px] leading-snug text-white/45">
                      {note}
                    </span>
                  </div>
                </li>
              </Squircle>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1} className="w-fit">
          <Squircle cornerRadius={RADIUS.control}>
            <Link
              href={THE_FACE.cta.href}
              className="block border border-white/20 px-5 py-2.5 text-[13px] font-medium text-white/85 no-underline transition-[color,border-color,background-color] duration-150 hover:border-white/40 hover:bg-white/[0.05] hover:text-white"
            >
              {THE_FACE.cta.label}
            </Link>
          </Squircle>
        </Reveal>
      </div>
    </section>
  );
}
