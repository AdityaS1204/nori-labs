import Link from "next/link";

import NoriFace from "@/components/robot-face/NoriFace";
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
            className="m-0 text-[clamp(26px,4vw,44px)] font-semibold leading-[1.08] tracking-[-0.03em] text-white"
          >
            {THE_FACE.headline}
          </h2>
          <p className="m-0 max-w-[48ch] text-[14px] leading-relaxed text-white/50">
            {THE_FACE.body}
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <ul className="m-0 grid list-none grid-cols-2 gap-4 p-0 lg:grid-cols-4" role="list">
            {FACE_GRID.map(({ id, label, face }) => (
              <li
                key={id}
                className="flex flex-col items-center gap-5 rounded-[10px] bg-[#1c1b1e] px-4 py-8"
              >
                <NoriFace face={face} width={120} />
                <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/35">
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1} className="w-fit">
          <Link
            href={THE_FACE.cta.href}
            className="block rounded-full border border-white/20 px-5 py-2.5 text-[13px] font-medium text-white/85 no-underline transition-[color,border-color,background-color] duration-150 hover:border-white/40 hover:bg-white/[0.05] hover:text-white"
          >
            {THE_FACE.cta.label}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
