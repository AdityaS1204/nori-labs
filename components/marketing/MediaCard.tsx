import Squircle from "@/components/ui/Squircle";
import { RADIUS } from "@/components/ui/radius";
import type { MediaSlot, MediaTone } from "@/lib/landing-content";
import MediaVideo from "./MediaVideo";

const TONES: Record<MediaTone, string> = {
  sage: "bg-sage",
  ink: "bg-[#1c1b1e]",
  haze: "bg-gradient-to-br from-[#d6d2c4] via-[#bdb9a8] to-[#8d8a7c]",
};

/** Corner markers read as light-on-dark except over the pale haze fill. */
const MARKER: Record<MediaTone, string> = {
  sage: "text-ink/55",
  ink: "text-white/40",
  haze: "text-ink/50",
};

type Props = {
  media: MediaSlot;
  className?: string;
  /** Continuous-corner radius in px; 0 renders the card square. */
  cornerRadius?: number;
};

/**
 * A media card: real footage when the slot has a `src`, otherwise a toned
 * colour block carrying the slot marker and shot note from the design. The tone
 * doubles as the backdrop a video sits on while it loads.
 */
export default function MediaCard({ media, className = "", cornerRadius = RADIUS.surface }: Props) {
  const filled = Boolean(media.src);
  // Over footage the markers need their own contrast, not the tone's.
  const marker = filled ? "text-white/70" : MARKER[media.tone];

  const card = (
    <figure
      className={`group relative m-0 overflow-hidden ${TONES[media.tone]} ${className}`}
      style={{ aspectRatio: media.ratio }}
      {...(filled ? {} : { role: "img", "aria-label": `Placeholder: ${media.slot}` })}
    >
      {media.src ? <MediaVideo src={media.src} label={media.slot} /> : null}

      {filled ? (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 z-[5] h-2/5 bg-gradient-to-t from-black/55 to-transparent"
        />
      ) : null}

      <figcaption
        className={`absolute left-3 top-3 z-10 rounded-[3px] px-2 py-1 font-mono text-[9.5px] uppercase leading-none tracking-[0.1em] ${
          filled ? "bg-black/35 backdrop-blur-sm" : "bg-black/[0.07]"
        } ${marker}`}
      >
        {media.slot}
      </figcaption>

      {media.video && !filled ? (
        <span
          className="absolute left-1/2 top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-[0_2px_12px_rgba(0,0,0,0.18)] transition-transform duration-200 motion-safe:group-hover:scale-105"
          aria-hidden="true"
        >
          <svg width="13" height="15" viewBox="0 0 13 15">
            <path d="M0 0L13 7.5L0 15Z" fill="#121113" />
          </svg>
        </span>
      ) : null}

      {media.overlay ? (
        <p className="absolute bottom-5 left-5 z-10 m-0 max-w-[14ch] font-display text-[clamp(22px,3.4vw,38px)] font-semibold leading-[1.04] tracking-[-0.025em] text-white drop-shadow-[0_1px_12px_rgba(0,0,0,0.35)]">
          {media.overlay}
        </p>
      ) : null}

      {media.note ? (
        <p
          className={`absolute bottom-3 right-3 z-10 m-0 max-w-[26ch] text-right font-mono text-[9.5px] leading-[1.5] tracking-[0.04em] ${marker}`}
        >
          {media.note}
        </p>
      ) : null}
    </figure>
  );

  if (cornerRadius <= 0) return card;

  return (
    <Squircle cornerRadius={cornerRadius}>
      {card}
    </Squircle>
  );
}
