import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * A single anon Supabase client, shared by server reads and client writes.
 * There's no auth yet, so the public anon key works on both sides.
 *
 * Both env vars are `NEXT_PUBLIC_*` so the value is available in the browser
 * bundle. When they're missing (e.g. a fresh clone with no `.env.local`), the
 * client is `null` and the data layer degrades gracefully to empty results
 * instead of throwing at import time.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

export const isSupabaseConfigured = Boolean(url && anonKey);
