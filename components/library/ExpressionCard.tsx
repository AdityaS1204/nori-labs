import Link from "next/link";

import { coverState, initials, type Preset } from "@/lib/presets";
import NoriFaceLive from "@/components/robot-face/NoriFaceLive";

interface ExpressionCardProps {
  preset: Preset;
}

/**
 * A single preset in the library grid — a simple, screen-like tile. The cover
 * state renders as a *live* preview (the eyes glance around on their own), and
 * the creator's identity stays hidden until the card is hovered. The whole
 * card links into the playground (`/lab/[id]`).
 */
export default function ExpressionCard({ preset }: ExpressionCardProps) {
  const { id, name, accent, author } = preset;
  const cover = coverState(preset);

  return (
    <Link
      href={`/lab/${id}`}
      aria-label={`Open ${name || "Untitled preset"} in the expression playground`}
      className="group relative block overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#0b0b0c] shadow-[0_6px_20px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1.5 hover:border-white/[0.16] hover:shadow-[0_20px_46px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8BE3C]/60 motion-safe:active:scale-[0.99]"
    >
      {/* ── Live preview (the robot screen) ── */}
      <div className="relative aspect-[4/3] w-full">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60 transition-opacity duration-300 group-hover:opacity-90"
          style={{
            background: `radial-gradient(150px 120px at 50% 46%, ${accent}26, transparent 70%)`,
          }}
        />
        <NoriFaceLive
          face={cover.face}
          gazeMode="random"
          className="absolute inset-0 h-full w-full p-5"
        />

        {/* bottom scrim for label legibility */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/25 to-transparent"
        />
      </div>

      {/* ── Overlay: name (always) + author (on hover) ── */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
        <span className="max-w-[58%] truncate rounded-full border border-white/[0.08] bg-[#141416]/80 px-3 py-1.5 text-[12px] font-medium text-white/85 backdrop-blur-sm">
          {name || "Untitled preset"}
        </span>

        <div className="flex items-center gap-2">
          <span className="min-w-0 translate-x-1 text-right text-[11px] leading-tight opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100">
            <span className="block truncate font-medium text-white/85">
              {author.name}
            </span>
            {author.handle && (
              <span className="block truncate text-white/45">@{author.handle}</span>
            )}
          </span>
          <span
            className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full border border-white/[0.14] bg-white/[0.08] text-[11px] font-semibold text-white/75"
            aria-hidden="true"
          >
            {initials(author.name)}
          </span>
        </div>
      </div>
    </Link>
  );
}
