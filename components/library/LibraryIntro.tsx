import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, UserGroupIcon } from "@hugeicons/core-free-icons";

interface LibraryIntroProps {
  /** Total number of published presets. */
  total: number;
  /** Number of distinct creators. */
  creators: number;
}

/** Page header for the library: title, blurb, stats and create CTA. */
export default function LibraryIntro({ total, creators }: LibraryIntroProps) {
  return (
    <header className="flex flex-col gap-5 border-b border-white/[0.06] pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-xl">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#E8BE3C]/80">
          Community
        </span>
        <h1 className="mt-2 text-[28px] font-bold leading-tight tracking-[-0.01em] text-white sm:text-[34px]">
          Expression Library
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-white/45">
          Browse expression presets shared by the community. Open any one to
          remix its states in the playground and make it your own.
        </p>

        <div className="mt-4 flex items-center gap-5 text-[12px] text-white/40">
          <span>
            <strong className="font-semibold text-white/70">{total}</strong>{" "}
            presets
          </span>
          <span className="flex items-center gap-1.5">
            <HugeiconsIcon icon={UserGroupIcon} size={14} color="currentColor" />
            <strong className="font-semibold text-white/70">{creators}</strong>{" "}
            creators
          </span>
        </div>
      </div>

      <Link
        href="/lab"
        className="inline-flex flex-shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#E8BE3C] px-4 py-2.5 text-[13px] font-semibold tracking-[0.02em] text-[#0d0d0e] no-underline transition-[box-shadow,transform] duration-150 hover:shadow-[0_0_0_1px_#E8BE3C,0_4px_16px_rgba(232,190,60,0.25)] motion-safe:active:scale-[0.97]"
      >
        <HugeiconsIcon icon={PlusSignIcon} size={16} color="currentColor" />
        Create preset
      </Link>
    </header>
  );
}
