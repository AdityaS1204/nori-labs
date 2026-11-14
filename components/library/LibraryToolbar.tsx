import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";

import { SORT_OPTIONS, type SortKey } from "@/lib/presets";

export type CategoryFilter = string | "All";

interface LibraryToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  category: CategoryFilter;
  onCategoryChange: (value: CategoryFilter) => void;
  sort: SortKey;
  onSortChange: (value: SortKey) => void;
  /** Distinct categories present in the data (without "All"). */
  categories: string[];
}

/**
 * Controlled search / filter / sort bar. Stateless on purpose — the parent
 * (`ExpressionGrid`) owns the state so the same values drive the grid.
 */
export default function LibraryToolbar({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  sort,
  onSortChange,
  categories,
}: LibraryToolbarProps) {
  const filters: CategoryFilter[] = ["All", ...categories];

  return (
    <div className="flex flex-col gap-4">
      {/* Search + sort row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35">
            <HugeiconsIcon icon={Search01Icon} size={16} color="currentColor" />
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search presets or creators…"
            aria-label="Search presets"
            className="h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] pl-9 pr-9 text-[13px] text-white/80 placeholder:text-white/30 transition-colors duration-150 focus:border-[#E8BE3C]/50 focus:bg-white/[0.05] focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 grid -translate-y-1/2 place-items-center rounded text-white/35 transition-colors duration-150 hover:text-white/70"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={14} color="currentColor" />
            </button>
          )}
        </div>

        <label className="flex items-center gap-2 text-[12px] text-white/40">
          <span className="hidden sm:inline">Sort</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            aria-label="Sort presets"
            className="h-10 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-[13px] text-white/75 transition-colors duration-150 focus:border-[#E8BE3C]/50 focus:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key} className="bg-[#0d0d0e]">
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Category tabs — only shown when the data has categories */}
      {categories.length > 0 && (
        <div
          className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1"
          role="tablist"
          aria-label="Filter by category"
        >
          {filters.map((filter) => {
            const active = filter === category;
            return (
              <button
                key={filter}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onCategoryChange(filter)}
                className={[
                  "flex-shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium tracking-[0.02em] transition-[color,background-color,border-color] duration-150",
                  "border",
                  active
                    ? "border-[#E8BE3C]/30 bg-[#E8BE3C]/15 text-[#E8BE3C]"
                    : "border-white/[0.07] bg-white/[0.02] text-white/45 hover:border-white/[0.12] hover:text-white/75",
                ].join(" ")}
              >
                {filter}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
