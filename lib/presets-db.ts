/**
 * Server-side reads for presets, backed by Supabase. These run in Server
 * Components behind a `<Suspense>` boundary (Cache Components) via the
 * cookie-bound server client, so they see the visitor's session for RLS.
 *
 * The write path is `createPreset` in `./presets-create` (client-only) — kept
 * in a separate module so this one's `next/headers` import never reaches the
 * browser bundle.
 */

import { getServerSupabase } from "@/lib/supabase/server";
import { rowToPreset, type PresetRow } from "@/lib/preset-row";
import type { Preset } from "@/lib/presets";

export { NotAuthenticatedError, type NewPresetInput } from "@/lib/preset-row";

/** Public community presets, newest first. Works for anonymous visitors. */
export async function getPresets(): Promise<Preset[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("presets")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getPresets failed:", error.message);
    return [];
  }
  return (data as PresetRow[]).map(rowToPreset);
}

/**
 * The signed-in user's own presets (private + public), newest first. Returns
 * `[]` when nobody is signed in or Supabase isn't configured.
 */
export async function getMyPresets(): Promise<Preset[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("presets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getMyPresets failed:", error.message);
    return [];
  }
  return (data as PresetRow[]).map(rowToPreset);
}

/** One preset by id, or `null` if missing / not visible / not configured. */
export async function getPreset(id: string): Promise<Preset | null> {
  const supabase = await getServerSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("presets")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("getPreset failed:", error.message);
    return null;
  }
  return data ? rowToPreset(data as PresetRow) : null;
}
