import Link from "next/link";

import NoriFaceLive from "@/components/robot-face/NoriFaceLive";
import Squircle from "@/components/ui/Squircle";
import { RADIUS } from "@/components/ui/radius";
import { TEACH_IT, THE_FACE } from "@/lib/landing-content";
import { FACE_GRID } from "@/lib/landing-faces";
import Reveal from "./Reveal";

/**
 * One bento grid for the two halves of the loop: you teach the robot a skill,
 * and its face tells you what it is doing. Four tiles, dark ground, one hero.
 *
 * Per the bento rules: window chrome appears once (the Nori Lab hero), the live
 * faces are the only moving tile (they track the pointer), and neighbours
 * contrast — a window beside glowing faces, a step diagram beside a collection.
 * It is a server component rendering client children (Reveal, NoriFaceLive),
 * exactly as the two sections it replaces did.
 */

const LANES = [
  { name: "Left arm", fill: "62%" },
  { name: "Right arm", fill: "54%" },
  { name: "Grip", fill: "71%" },
];

const SKILLS = [
  { name: "Fold laundry", installs: "1.2k" },
  { name: "Water the plants", installs: "860" },
  { name: "Load dishwasher", installs: "540" },
];

/** A tile: a squircled dark panel that fills its grid cell. */
function Tile({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <Squircle cornerRadius={RADIUS.surface}>
      <article
        id={id}
        className={`relative flex h-full flex-col overflow-hidden border border-white/[0.06] bg-[#1c1b1e] ${className}`}
      >
        {children}
      </article>
    </Squircle>
  );
}

/** The faux Nori Lab app window — a demonstration mid-record. */
function NoriLabWindow() {
  return (
    <div className="mt-auto w-[min(108%,440px)] translate-x-5 translate-y-6" aria-hidden="true">
      <div className="rounded-[14px] border border-white/10 bg-[#121113] shadow-2xl shadow-black/50">
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-3.5 py-2.5">
          <span className="flex gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <i className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <i className="h-2.5 w-2.5 rounded-full bg-white/15" />
          </span>
          <span className="ml-1 font-mono text-[10.5px] tracking-[0.08em] text-white/45">Nori Lab</span>
          <span className="ml-auto flex items-center gap-1.5 rounded-full bg-lime/15 px-2 py-0.5 font-mono text-[9px] tracking-[0.1em] text-lime">
            <i className="h-1.5 w-1.5 rounded-full bg-lime motion-safe:animate-pulse" />
            REC 00:12
          </span>
        </div>
        <div className="flex flex-col gap-2.5 px-3.5 py-4">
          {LANES.map((lane) => (
            <div key={lane.name} className="flex items-center gap-2.5">
              <span className="w-12 shrink-0 font-mono text-[9px] uppercase tracking-[0.08em] text-white/35">
                {lane.name}
              </span>
              <span className="relative h-3.5 flex-1 rounded-full bg-white/[0.05]">
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-white/20"
                  style={{ width: lane.fill }}
                >
                  <span className="absolute -top-[3px] bottom-[-3px] right-0 w-[2px] rounded bg-lime" />
                </span>
              </span>
            </div>
          ))}
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded-full bg-white/[0.06] px-2 py-1 font-mono text-[9px] text-white/40">
              3 demos
            </span>
            <span className="ml-auto rounded-[8px] bg-lime px-3 py-1.5 text-[11px] font-semibold text-ink">
              Train skill
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeatureBento() {
  return (
    <section id="teach-it" aria-labelledby="bento-headline" className="scroll-mt-20 bg-ink">
      <div className="mx-auto max-w-[1180px] px-5 pb-20 pt-12 sm:px-8 md:pb-28 md:pt-16">
        <Reveal className="flex max-w-[52ch] flex-col gap-4">
          <h2
            id="bento-headline"
            className="m-0 font-display text-[clamp(26px,4vw,44px)] font-semibold leading-[1.14] tracking-[-0.01em] text-white"
          >
            Teach it by showing. Read it at a glance.
          </h2>
          <p className="m-0 font-display text-[15px] leading-relaxed text-white/55">
            A robot you teach runs on its own — so Nori Lab trains it from a few demonstrations, and
            its face tells you what it&apos;s doing while it works.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[repeat(2,minmax(236px,1fr))]">
          {/* Hero — teach a skill in Nori Lab */}
          <Reveal className="sm:col-span-2 lg:col-span-2 lg:row-span-2">
            <Tile className="p-6 sm:p-7">
              <div className="flex flex-col items-start gap-3">
                <h3 className="m-0 font-display text-[clamp(19px,2vw,24px)] font-semibold tracking-[-0.01em] text-white">
                  {TEACH_IT.headline}
                </h3>
                <p className="m-0 max-w-[34ch] text-[13.5px] leading-relaxed text-white/50">
                  Record a demo in the Nori Lab app — a few are enough to generalise to new spots and
                  light.
                </p>
                <Squircle cornerRadius={RADIUS.control}>
                  <Link
                    href={TEACH_IT.cta.href}
                    className="bg-lime px-4 py-2 text-[12.5px] font-medium text-ink no-underline transition-[filter,transform] duration-150 hover:brightness-105 motion-safe:active:scale-[0.97]"
                  >
                    {TEACH_IT.cta.label}
                  </Link>
                </Squircle>
              </div>
              <NoriLabWindow />
            </Tile>
          </Reveal>

          {/* Faces — the robot's status display */}
          <Reveal delay={0.06} className="sm:col-span-2 lg:col-span-2">
            <Tile id="the-face" className="scroll-mt-20 p-6 sm:p-7">
              <div className="flex flex-col items-start gap-3">
                <h3 className="m-0 font-display text-[clamp(19px,2vw,24px)] font-semibold tracking-[-0.01em] text-white">
                  {THE_FACE.headline}
                </h3>
                <p className="m-0 max-w-[44ch] text-[13.5px] leading-relaxed text-white/50">
                  Waiting, listening, working, stuck — drawn by the renderer that runs on the robot.
                </p>
              </div>

              <ul
                className="m-0 mt-6 grid list-none grid-cols-2 gap-2.5 p-0 sm:grid-cols-4"
                role="list"
              >
                {FACE_GRID.map(({ id, label, note, face }) => (
                  <li
                    key={id}
                    className="flex flex-col items-center gap-3 rounded-[12px] bg-[#151417] px-2.5 py-4"
                  >
                    <div className="h-[62px] w-[86px]">
                      <NoriFaceLive face={face} gazeMode="cursor" className="h-full w-full" />
                    </div>
                    <div className="flex flex-col items-center gap-1 text-center">
                      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/60">
                        {label}
                      </span>
                      <span className="max-w-[18ch] text-[10.5px] leading-snug text-white/40">
                        {note}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              <Link
                href={THE_FACE.cta.href}
                className="mt-5 w-fit text-[12.5px] font-medium text-lime no-underline transition-opacity duration-150 hover:opacity-70"
              >
                {THE_FACE.cta.label} →
              </Link>
            </Tile>
          </Reveal>

          {/* Step flow — demo to skill */}
          <Reveal delay={0.12} className="lg:col-span-1">
            <Tile className="p-6">
              <h3 className="m-0 mb-5 font-display text-[clamp(18px,2vw,22px)] font-semibold tracking-[-0.01em] text-white">
                From demo to skill.
              </h3>
              <ol className="relative m-0 flex list-none flex-col gap-4 p-0" role="list">
                <span
                  aria-hidden="true"
                  className="absolute left-[13.5px] top-4 bottom-4 w-px bg-white/10"
                />
                {TEACH_IT.steps.map((step, i) => (
                  <li key={step.title} className="relative flex items-center gap-3.5">
                    <span
                      className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] tabular-nums ${
                        i === 0
                          ? "border-lime/60 bg-lime/10 text-lime"
                          : "border-white/15 bg-ink text-white/35"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[13.5px] font-medium tracking-[-0.01em] text-white/80">
                      {step.title}
                    </span>
                  </li>
                ))}
              </ol>
            </Tile>
          </Reveal>

          {/* Marketplace — share its skills */}
          <Reveal delay={0.18} className="lg:col-span-1">
            <Tile className="p-6">
              <h3 className="m-0 font-display text-[clamp(18px,2vw,22px)] font-semibold tracking-[-0.01em] text-white">
                Share its skills anywhere.
              </h3>
              <p className="m-0 mt-2 max-w-[30ch] text-[12.5px] leading-relaxed text-white/50">
                Publish to the Skills Marketplace, or install one someone else trained.
              </p>
              <ul
                className="m-0 mt-5 flex list-none flex-col gap-2 p-0 [mask-image:linear-gradient(to_bottom,#000_66%,transparent)]"
                role="list"
                aria-hidden="true"
              >
                {SKILLS.map((s) => (
                  <li
                    key={s.name}
                    className="flex items-center gap-3 rounded-[10px] border border-white/[0.06] bg-white/[0.03] px-3 py-2.5"
                  >
                    <span className="h-7 w-7 shrink-0 rounded-[7px] bg-gradient-to-br from-sage to-lime/70" />
                    <span className="text-[12.5px] font-medium text-white/80">{s.name}</span>
                    <span className="ml-auto font-mono text-[10px] tabular-nums text-white/35">
                      ↓ {s.installs}
                    </span>
                  </li>
                ))}
              </ul>
            </Tile>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
