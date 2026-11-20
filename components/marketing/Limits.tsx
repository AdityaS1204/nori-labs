import Squircle from "@/components/ui/Squircle";
import { RADIUS } from "@/components/ui/radius";
import { LIMITS } from "@/lib/landing-content";
import Reveal from "./Reveal";

export default function Limits() {
  return (
    <section id="limits" aria-labelledby="limits-headline" className="scroll-mt-20 bg-ink">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-9 px-5 py-20 sm:px-8 md:py-28">

        <Reveal className="flex flex-col gap-5">
          <h2
            id="limits-headline"
            className="m-0 font-display text-[clamp(26px,4vw,44px)] font-semibold leading-[1.08] tracking-[-0.03em] text-white"
          >
            {LIMITS.headline}
          </h2>
          <p className="m-0 max-w-[48ch] font-display text-[15px] leading-relaxed text-white/55">
            {LIMITS.body}
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <Squircle cornerRadius={RADIUS.surface}>
            <dl className="m-0 grid gap-px overflow-hidden bg-white/[0.08] sm:grid-cols-2">
              {LIMITS.items.map(({ title, body }) => (
                <div key={title} className="flex flex-col gap-2 bg-[#1c1b1e] px-5 py-5">
                  <dt className="text-[13px] font-semibold tracking-[-0.01em] text-white/85">
                    {title}
                  </dt>
                  <dd className="m-0 text-[13px] leading-relaxed text-white/55">{body}</dd>
                </div>
              ))}
            </dl>
          </Squircle>
        </Reveal>
      </div>
    </section>
  );
}
