import Squircle from "@/components/ui/Squircle";
import { RADIUS } from "@/components/ui/radius";
import { HARDWARE } from "@/lib/landing-content";
import MediaCard from "./MediaCard";
import Reveal from "./Reveal";

const [head, arm, base, workshop] = HARDWARE.cards;

/** Caption plate sitting under each image in the mosaic. */
function Plate({ title, caption }: { title: string; caption: string }) {
  return (
    <div className="flex flex-col gap-1 px-3.5 py-3">
      <h3 className="m-0 text-[13px] font-semibold tracking-[-0.01em] text-ink">{title}</h3>
      <p className="m-0 text-[12px] leading-snug text-ink/50">{caption}</p>
    </div>
  );
}

function Card({ card, className = "" }: { card: (typeof HARDWARE.cards)[number]; className?: string }) {
  return (
    <Squircle cornerRadius={RADIUS.surface}>
      <div className={`flex flex-col overflow-hidden bg-white ${className}`}>
        <MediaCard media={card.media} cornerRadius={0} />
        <Plate title={card.title} caption={card.caption} />
      </div>
    </Squircle>
  );
}

export default function Hardware() {
  return (
    <section id="hardware" aria-labelledby="hardware-headline" className="scroll-mt-20 bg-cream">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-10 px-5 py-20 sm:px-8 md:py-28">

        <Reveal>
          <h2
            id="hardware-headline"
            className="m-0 font-display text-[clamp(26px,4vw,44px)] font-semibold leading-[1.08] tracking-[-0.03em] text-ink"
          >
            {HARDWARE.headline}
          </h2>
        </Reveal>

        <Reveal className="grid gap-4 md:grid-cols-2">
          <Card card={head} />
          <div className="grid content-start gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card card={arm} />
              <Card card={base} />
            </div>
            <Card card={workshop} />
          </div>
        </Reveal>

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
