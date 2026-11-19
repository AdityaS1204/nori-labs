import NoriMark from "./NoriMark";

/**
 * The clover set inline in the hero headline.
 *
 * Sized in `em` so it tracks the headline's clamped font size;
 * `align-baseline` drops its bottom edge onto the text baseline and the nudge
 * lets it sit a touch below, optically centring it against the caps.
 */
export default function HeadlineMark() {
  return (
    <NoriMark className="mx-[0.12em] inline-block h-[0.82em] w-[0.82em] translate-y-[0.07em] align-baseline" />
  );
}
