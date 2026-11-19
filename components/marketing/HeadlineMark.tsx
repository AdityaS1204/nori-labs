import { HERO } from "@/lib/landing-content";

/**
 * The Nori mark set inline in the hero headline.
 *
 * Sized in `em` so it tracks the headline's clamped font size; `align-baseline`
 * drops its bottom edge onto the text baseline and the nudge lets it sit a
 * touch below, optically centring it against the caps.
 */
export default function HeadlineMark() {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- em-sized inline glyph, not a layout image
    <img
      src={HERO.mark.src}
      alt=""
      aria-hidden="true"
      className="mx-[0.12em] inline-block h-[0.82em] w-[0.82em] translate-y-[0.07em] select-none object-contain align-baseline"
    />
  );
}
