import Link from "next/link";

import { coverState, type Preset } from "@/lib/presets";
import NoriFaceLive from "@/components/robot-face/NoriFaceLive";

interface ExpressionCardProps {
  preset: Preset;
}

/**
 * A single preset in the library grid — a simple, screen-like tile. The cover
 * state renders as a *live* preview (the eyes glance around on their own). The
 * whole card links into the playground (`/lab/[id]`).
 */
export default function ExpressionCard({ preset }: ExpressionCardProps) {
  const { id, name, accent } = preset;
  const cover = coverState(preset);

  return (
    <Link
      href={`/lab/${id}`}
      aria-label={`Open ${name || "Untitled preset"} in the expression playground`}
      className="group relative block overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#0b0b0c] shadow-[0_6px_20px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] transition-[box-shadow,border-color] duration-300 ease-out hover:border-white/[0.16] hover:shadow-[0_20px_46px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8BE3C]/60"
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

      {/* ── Overlay: name ── */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end p-3">
        <span className="max-w-full truncate rounded-full border border-white/[0.08] bg-[#141416]/80 px-3 py-1.5 text-[12px] font-medium text-white/85 backdrop-blur-sm">
          {name || "Untitled preset"}
        </span>
      </div>
    </Link>
  );
}
