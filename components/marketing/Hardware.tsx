import Squircle from "@/components/ui/Squircle";
import { RADIUS } from "@/components/ui/radius";
import { HARDWARE } from "@/lib/landing-content";
import BodyWalkthrough from "./BodyWalkthrough";
import Reveal from "./Reveal";

export default function Hardware() {
  return (
    <section id="hardware" aria-labelledby="hardware-headline" className="scroll-mt-20 bg-cream py-14 md:py-20">
      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <Reveal>
          <h2
            id="hardware-headline"
            className="m-0 font-display text-[clamp(26px,4vw,44px)] font-semibold leading-[1.18] tracking-[-0.01em] text-ink"
          >
            {HARDWARE.headline}
          </h2>
        </Reveal>
      </div>

      {/* Outside the measured column: the tour runs full-bleed. */}
      <BodyWalkthrough />

      <div className="mx-auto mt-14 w-full max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <Reveal delay={0.05}>
          <Squircle cornerRadius={RADIUS.surface}>
            <dl className="m-0 grid gap-px overflow-hidden bg-ink/10 sm:grid-cols-2 lg:grid-cols-3">
              {HARDWARE.specs.map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-2 bg-cream px-5 py-5">
                  <dt className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink/40">
                    {label}
                  </dt>
                  <dd className="m-0 text-[13px] leading-relaxed text-ink/70">{value}</dd>
                </div>
              ))}
            </dl>
          </Squircle>
        </Reveal>
      </div>
    </section>
  );
}
