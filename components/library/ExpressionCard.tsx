import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FavouriteIcon,
  LayersLogoIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";

import { formatCount, coverState, type Preset } from "@/lib/presets";
import NoriFace from "@/components/robot-face/NoriFace";
import CategoryTag from "./CategoryTag";
import AuthorBadge from "./AuthorBadge";
import StatItem from "./StatItem";

interface ExpressionCardProps {
  preset: Preset;
}

/**
 * A single preset in the library grid. The whole card is a link that opens the
 * preset (all its states) in the playground (`/lab/[id]`). The thumbnail shows
 * the preset's cover state rendered in the real robot face model.
 */
export default function ExpressionCard({ preset }: ExpressionCardProps) {
  const { id, name, description, category, accent, author, likes, states } = preset;
  const cover = coverState(preset);

  return (
    <Link
      href={`/lab/${id}`}
      aria-label={`Open ${name} in the expression playground`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] no-underline transition-[transform,border-color,background-color] duration-200 hover:-translate-y-1 hover:border-white/[0.14] hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8BE3C]/60 motion-safe:active:scale-[0.99]"
    >
      {/* ── Preview (robot screen) ── */}
      <div className="relative flex h-[180px] items-center justify-center overflow-hidden border-b border-white/[0.06] bg-[#060607]">
        {/* accent glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-50 transition-opacity duration-200 group-hover:opacity-80"
          style={{
            background: `radial-gradient(140px 120px at 50% 50%, ${accent}26, transparent 70%)`,
          }}
        />
        <NoriFace
          face={cover.face}
          width={210}
          className="relative transition-transform duration-300 ease-out group-hover:scale-[1.06]"
        />

        {category && (
          <span className="absolute left-3 top-3">
            <CategoryTag category={category} accent={accent} />
          </span>
        )}

        {/* state-count badge */}
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#0d0d0e]/80 px-2 py-0.5 text-[10px] font-medium tracking-[0.03em] text-white/70 backdrop-blur-sm">
          <HugeiconsIcon icon={LayersLogoIcon} size={11} color="currentColor" />
          {states.length} {states.length === 1 ? "state" : "states"}
        </span>

        {/* open affordance on hover */}
        <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-[#0d0d0e]/80 px-2.5 py-1 text-[10px] font-medium tracking-[0.04em] text-white/70 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
          Open
          <HugeiconsIcon icon={ArrowRight01Icon} size={12} color="currentColor" />
        </span>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="text-[15px] font-semibold tracking-[0.01em] text-white/90">
          {name}
        </h3>
        {description && (
          <p className="line-clamp-2 text-[12px] leading-relaxed text-white/45">
            {description}
          </p>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] px-4 py-3">
        <AuthorBadge author={author} />
        <div className="flex flex-shrink-0 items-center gap-3">
          <StatItem icon={FavouriteIcon} value={formatCount(likes)} label="likes" />
        </div>
      </div>
    </Link>
  );
}
