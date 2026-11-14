import { Suspense } from "react";

import { getPresets } from "@/lib/presets-db";
import LibraryIntro from "@/components/library/LibraryIntro";
import ExpressionGrid from "@/components/library/ExpressionGrid";

export default function LibraryPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 py-8 sm:px-8 sm:py-10">
      <Suspense fallback={<LibrarySkeleton />}>
        <LibraryFeed />
      </Suspense>
    </div>
  );
}

/**
 * Fetches presets at request time. Kept uncached and behind `<Suspense>` so
 * newly saved presets appear immediately (Cache Components model).
 */
async function LibraryFeed() {
  const presets = await getPresets();
  const creators = new Set(
    presets.map((p) => p.author.handle || p.author.name),
  ).size;

  return (
    <>
      <LibraryIntro total={presets.length} creators={creators} />
      <div className="mt-8">
        <ExpressionGrid presets={presets} />
      </div>
    </>
  );
}

/** Lightweight placeholder shown in the static shell while presets load. */
function LibrarySkeleton() {
  return (
    <div className="animate-pulse">
      <div className="border-b border-white/[0.06] pb-8">
        <div className="h-3 w-24 rounded bg-white/[0.06]" />
        <div className="mt-3 h-8 w-72 rounded bg-white/[0.08]" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-white/[0.05]" />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-[300px] rounded-2xl border border-white/[0.06] bg-white/[0.02]"
          />
        ))}
      </div>
    </div>
  );
}
