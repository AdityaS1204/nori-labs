/**
 * Pure, environment-agnostic helpers shared by the server read module
 * (`presets-db.ts`) and the client write module (`presets-create.ts`). No
 * `next/headers` or Supabase client imports here, so it is safe in both
 * bundles.
 */

import type { Author, ExpressionState, Preset } from "@/lib/presets";
import type { NoriEyeParams } from "@/lib/nori-face";

/** Shape of a row in the `presets` table. */
export interface PresetRow {
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
  user_id: string | null;
  is_public: boolean | null;
  created_at: string;
}

/** Thrown when a write is attempted without a signed-in user. */
export class NotAuthenticatedError extends Error {
  constructor() {
    super("You need to be signed in to save a preset.");
    this.name = "NotAuthenticatedError";
  }
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
  /** Share to the community library (false = private, the default). */
  isPublic: boolean;
}

/** Backfill eye fields added after a row may have been written (shape/weight). */
function normalizeEye(eye: NoriEyeParams): NoriEyeParams {
  const e = eye as Partial<NoriEyeParams>;
  return { ...eye, shape: e.shape ?? "bar", thickness: e.thickness ?? 16 };
}
export function normalizeStates(states: ExpressionState[]): ExpressionState[] {
  return (states ?? []).map((s) => ({
    ...s,
    face: {
      ...s.face,
      left: normalizeEye(s.face.left),
      right: normalizeEye(s.face.right),
    },
  }));
}

export function rowToPreset(row: PresetRow): Preset {
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
    isPublic: row.is_public ?? false,
    ownerId: row.user_id,
    createdAt: row.created_at,
  };
}
