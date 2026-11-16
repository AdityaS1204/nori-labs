/**
 * Persists an in-progress preset across the magic-link login round-trip.
 *
 * When a signed-out user hits Save, the editor stashes the working preset here
 * and redirects to `/login`. The magic link returns them to the editor, which
 * reads the draft back and reopens the Save dialog — so nothing they built is
 * lost to the detour. Best-effort `localStorage`; wrapped in try/catch and
 * safe to call where storage is unavailable (SSR, private mode).
 */

import type { Preset } from "@/lib/presets";

const KEY = "nori:pending-preset";

interface PresetDraft {
  preset: Preset;
  activeId: string;
  /** Reopen the Save dialog on restore. */
  wantSave: boolean;
  savedAt: number;
}

/** Drafts older than this are ignored on restore (stale tab/link). */
const MAX_AGE_MS = 1000 * 60 * 60; // 1 hour

export function stashDraft(preset: Preset, activeId: string): void {
  try {
    const draft: PresetDraft = {
      preset,
      activeId,
      wantSave: true,
      savedAt: Date.now(),
    };
    localStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    /* storage unavailable — the detour just won't restore */
  }
}

export function readDraft(): PresetDraft | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as PresetDraft;
    if (!draft?.preset || Date.now() - draft.savedAt > MAX_AGE_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
