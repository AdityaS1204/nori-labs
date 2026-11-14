"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

import { type Preset, type SortKey } from "@/lib/presets";
import ExpressionCard from "./ExpressionCard";
import LibraryToolbar, { type CategoryFilter } from "./LibraryToolbar";
import EmptyState from "./EmptyState";

interface ExpressionGridProps {
  presets: Preset[];
}

function sortPresets(list: Preset[], sort: SortKey): Preset[] {
  const copy = [...list];
  switch (sort) {
    case "recent":
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "alpha":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "popular":
    default:
      return copy.sort((a, b) => b.likes - a.likes);
  }
}

/**
 * Interactive gallery: owns the search / filter / sort state and renders the
 * filtered set of preset cards. The server component passes the full list in.
 */
export default function ExpressionGrid({ presets }: ExpressionGridProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [sort, setSort] = useState<SortKey>("recent");

  const gridRef = useRef<HTMLDivElement>(null);

  /** Distinct categories present in the data, for the filter chips. */
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of presets) if (p.category) set.add(p.category);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [presets]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = presets.filter((p) => {
      const matchesCategory = category === "All" || p.category === category;
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.author.name.toLowerCase().includes(q) ||
        (p.author.handle?.toLowerCase().includes(q) ?? false);
      return matchesCategory && matchesQuery;
    });
    return sortPresets(filtered, sort);
  }, [presets, query, category, sort]);

  /* Entrance / reflow animation — y + blur only (never opacity), so cards stay
     visible even if the animation is skipped. Re-runs when the set changes. */
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.from(".lib-card", {
        y: 12,
        filter: "blur(5px)",
        duration: 0.3,
        ease: "power3.out",
        stagger: 0.035,
      });
    }, grid);

    return () => ctx.revert();
  }, [visible]);

  const resetFilters = () => {
    setQuery("");
    setCategory("All");
  };

  return (
    <div className="flex flex-col gap-6">
      <LibraryToolbar
        query={query}
        onQueryChange={setQuery}
        category={category}
        onCategoryChange={setCategory}
        sort={sort}
        onSortChange={setSort}
        categories={categories}
      />

      <p className="text-[12px] text-white/35" aria-live="polite">
        {visible.length} {visible.length === 1 ? "preset" : "presets"}
      </p>

      <div
        ref={gridRef}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {visible.length === 0 ? (
          <EmptyState query={query} onReset={resetFilters} />
        ) : (
          visible.map((preset) => (
            <div key={preset.id} className="lib-card">
              <ExpressionCard preset={preset} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
