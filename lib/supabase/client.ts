import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client (singleton) for Client Components. Carries the auth
 * session via cookies, so inserts run as the signed-in user. Returns `null`
 * when env isn't configured, matching the graceful-empty behaviour the data
 * layer already relies on.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let cached: SupabaseClient | null | undefined;

export function getBrowserSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  cached = url && anonKey ? createBrowserClient(url, anonKey) : null;
  return cached;
}

export const isSupabaseConfigured = Boolean(url && anonKey);
