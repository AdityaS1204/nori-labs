/**
 * Data access for presets, backed by Supabase. Isomorphic: `getPresets` /
 * `getPreset` are awaited in Server Components (behind a `<Suspense>` boundary,
 * per the app's Cache Components setup), and `createPreset` runs from the
 * client save dialog. All use the shared anon client.
 */

import { supabase } from "@/lib/supabase";
import type { Author, ExpressionState, Preset } from "@/lib/presets";
import type { NoriEyeParams } from "@/lib/nori-face";

/** Shape of a row in the `presets` table. */
interface PresetRow {
  id: string;
  name: string;
  description: string | null;
  author_name: string;
  author_handle: string | null;
  states: ExpressionState[];
  cover_state_id: string;
  accent: string | null;
  category: string | null;
  likes: number | null;
  created_at: string;
}

/** Backfill eye fields added after a row may have been written (shape/weight). */
function normalizeEye(eye: NoriEyeParams): NoriEyeParams {
  const e = eye as Partial<NoriEyeParams>;
  return { ...eye, shape: e.shape ?? "bar", thickness: e.thickness ?? 16 };
}
function normalizeStates(states: ExpressionState[]): ExpressionState[] {
  return (states ?? []).map((s) => ({
    ...s,
    face: {
      ...s.face,
      left: normalizeEye(s.face.left),
      right: normalizeEye(s.face.right),
    },
  }));
}

function rowToPreset(row: PresetRow): Preset {
  const author: Author = { name: row.author_name };
  if (row.author_handle) author.handle = row.author_handle;
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    author,
    states: normalizeStates(row.states),
    coverStateId: row.cover_state_id,
    accent: row.accent ?? "#eaf3ff",
    category: row.category ?? undefined,
    likes: row.likes ?? 0,
    createdAt: row.created_at,
  };
}

/** All presets, newest first. Returns `[]` when Supabase isn't configured. */
export async function getPresets(): Promise<Preset[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("presets")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getPresets failed:", error.message);
    return [];
  }
  return (data as PresetRow[]).map(rowToPreset);
}

/** One preset by id, or `null` if missing / not configured. */
export async function getPreset(id: string): Promise<Preset | null> {
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

/** The fields the save dialog provides; the rest are defaulted by the DB. */
export interface NewPresetInput {
  name: string;
  description: string;
  author: Author;
  states: ExpressionState[];
  coverStateId: string;
  accent: string;
  category?: string;
}

/** Insert a preset and return the saved row (with its DB id + timestamp). */
export async function createPreset(input: NewPresetInput): Promise<Preset> {
  if (!supabase) {
    throw new Error(
      "Supabase isn't configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    );
  }
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
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return rowToPreset(data as PresetRow);
}
