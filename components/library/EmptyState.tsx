import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";

interface EmptyStateProps {
  query: string;
  onReset: () => void;
}

/** Shown when no expression matches the current search / filter. */
export default function EmptyState({ query, onReset }: EmptyStateProps) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/[0.1] py-16 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/[0.04] text-white/30">
        <HugeiconsIcon icon={Search01Icon} size={22} color="currentColor" />
      </div>
      <div>
        <p className="text-[14px] font-medium text-white/60">
          No presets found
        </p>
        <p className="mt-1 text-[12px] text-white/35">
          {query
            ? `Nothing matches “${query}”.`
            : "Try a different category."}
        </p>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="mt-1 rounded-md border border-white/[0.1] px-3 py-1.5 text-[12px] font-medium text-white/60 transition-colors duration-150 hover:bg-white/[0.06] hover:text-white"
      >
        Clear filters
      </button>
    </div>
  );
}
