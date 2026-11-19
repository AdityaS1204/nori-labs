/**
 * Client-side preset write. Runs from the save dialog via the browser client,
 * which carries the auth session cookie — so the insert is attributed to the
 * signed-in user and satisfies the `insert own` RLS policy. Separate from
 * `presets-db.ts` so no server-only (`next/headers`) code enters the bundle.
 */

import { getBrowserSupabase } from "@/lib/supabase/client";
import {
  NotAuthenticatedError,
  rowToPreset,
  type NewPresetInput,
  type PresetRow,
} from "@/lib/preset-row";
import type { Preset } from "@/lib/presets";

/**
 * Insert a preset owned by the signed-in user and return the saved row. Always
 * an insert — never an update — so opening and editing someone else's preset
 * saves a new copy and never changes the original. Throws
 * `NotAuthenticatedError` when no user is signed in.
 */
export async function createPreset(input: NewPresetInput): Promise<Preset> {
  const supabase = getBrowserSupabase();
  if (!supabase) {
    throw new Error(
      "Supabase isn't configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    );
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new NotAuthenticatedError();

  const { data, error } = await supabase
    .from("presets")
    .insert({
      name: input.name,
      description: input.description,
      author_name: input.author.name,
      author_handle: input.author.handle ?? null,
      states: input.states,
      cover_state_id: input.coverStateId,
      accent: input.accent,
      category: input.category ?? null,
      render: input.render,
      user_id: user.id,
      is_public: input.isPublic,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return rowToPreset(data as PresetRow);
}
