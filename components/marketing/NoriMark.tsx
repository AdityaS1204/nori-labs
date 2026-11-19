import { MARK } from "@/lib/landing-content";

type Props = { className?: string };

/** The clover glyph. Decorative everywhere it appears: the words carry the meaning. */
export default function NoriMark({ className = "" }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- a glyph sized by its caller, not a layout image
    <img
      src={MARK.src}
      alt=""
      aria-hidden="true"
      className={`select-none object-contain ${className}`}
    />
  );
}
