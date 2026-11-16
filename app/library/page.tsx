import { Suspense } from "react";

import { getMyPresets, getPresets } from "@/lib/presets-db";
import { getServerSupabase } from "@/lib/supabase/server";
import LibraryIntro from "@/components/library/LibraryIntro";
import ExpressionGrid from "@/components/library/ExpressionGrid";

export default function LibraryPage(props: PageProps<"/library">) {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 py-8 sm:px-8 sm:py-10">
      <Suspense fallback={<LibrarySkeleton />}>
        <LibraryFeed searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

/**
 * Fetches the public community feed always; also the signed-in user's own
 * presets (private + public) so the "My presets" tab can show them. Kept
 * uncached and behind `<Suspense>` (reads session cookies) so newly saved
 * presets appear immediately.
 */
async function LibraryFeed({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;

  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  const isLoggedIn = Boolean(user);

  const [presets, myPresets] = await Promise.all([
    getPresets(),
    isLoggedIn ? getMyPresets() : Promise.resolve([]),
  ]);

  const creators = new Set(
    presets.map((p) => p.author.handle || p.author.name),
  ).size;

  return (
    <>
      <LibraryIntro total={presets.length} creators={creators} />
      <div className="mt-8">
        <ExpressionGrid
          publicPresets={presets}
          myPresets={myPresets}
          isLoggedIn={isLoggedIn}
          initialTab={tab === "mine" ? "mine" : "public"}
        />
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
