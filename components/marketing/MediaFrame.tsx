import type { MediaSlot } from "@/lib/landing-content";

type Props = {
  media: MediaSlot;
  className?: string;
  /** Renders a centred play affordance, for slots that will hold video. */
  video?: boolean;
};

/**
 * Placeholder for a product photo or video. The diagonal cross and the ratio box
 * hold the real layout, so dropping an asset in later is a swap of this element
 * for an <Image>/<video> with the same aspect-ratio wrapper.
 */
export default function MediaFrame({ media, className = "", video = false }: Props) {
  return (
    <figure className={`m-0 flex flex-col gap-3 ${className}`}>
      <div
        className="relative w-full overflow-hidden rounded-[6px] border border-white/[0.09] bg-white/[0.02]"
        style={{ aspectRatio: media.ratio }}
        role="img"
        aria-label={`Placeholder: ${media.label}`}
      >
        <svg
          className="absolute inset-0 h-full w-full text-white/[0.07]"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" vectorEffect="non-scaling-stroke" />
          <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" vectorEffect="non-scaling-stroke" />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
          {video ? (
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-[#0d0d0e]/70 backdrop-blur-sm">
              <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true">
                <path d="M0 0L12 7L0 14Z" fill="#E8BE3C" />
              </svg>
            </span>
          ) : null}
          <span className="font-mono text-[11px] tracking-[0.08em] text-white/35">
            {media.label}
          </span>
        </div>
      </div>

      {media.caption ? (
        <figcaption className="font-mono text-[11px] tracking-[0.06em] text-white/35">
          {media.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
