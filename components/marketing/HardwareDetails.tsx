import { HARDWARE } from "@/lib/landing-content";
import MediaFrame from "./MediaFrame";
import Section from "./Section";

export default function HardwareDetails() {
  return (
    <Section id="hardware" index="05" label={HARDWARE.label}>
      <div className="grid gap-8 md:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] md:gap-12">
        <MediaFrame media={HARDWARE.media} />

        <div className="flex flex-col gap-6">
          <h2 className="max-w-[18ch] text-[clamp(26px,3.6vw,38px)] font-semibold leading-[1.1] tracking-[-0.02em] text-white">
            {HARDWARE.headline}
          </h2>
          <p className="max-w-[52ch] text-[14.5px] leading-relaxed text-white/50">
            {HARDWARE.body}
          </p>

          <dl className="m-0 grid gap-px overflow-hidden rounded-[6px] border border-white/[0.07] bg-white/[0.07] sm:grid-cols-2">
            {HARDWARE.specs.map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-2 bg-[#0d0d0e] px-5 py-5">
                <dt className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#E8BE3C]/70">
                  {label}
                </dt>
                <dd className="m-0 text-[13.5px] leading-relaxed text-white/60">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  );
}
