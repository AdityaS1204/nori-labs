/**
 * Preset model — a bundle of named expression *states* (neutral, happy, error,
 * thinking, idle, …), each posed in the real Nori robot face model
 * (`NoriFaceParams`). A preset is the unit shown as one card in the public
 * library and edited as a whole in the playground.
 *
 * This replaces the earlier stylised "cartoon" model (`lib/expressions.ts`):
 * the library and the playground now share one model.
 */

import { NEUTRAL_FACE, type NoriFaceParams } from "@/lib/nori-face";

export interface Author {
  name: string;
  /** Handle without the leading "@". Optional. */
  handle?: string;
}

/** One named, editable emotional state inside a preset. */
export interface ExpressionState {
  /** Stable id (local within the preset). */
  id: string;
  /** Display name, user-editable, e.g. "Happy", "Error". */
  label: string;
  /** The robot face posed for this state. */
  face: NoriFaceParams;
}

/** A bundle of states — the thing saved to and shown in the library. */
export interface Preset {
  /** Supabase row id; empty string for an unsaved draft. */
  id: string;
  name: string;
  description: string;
  author: Author;
  /** At least one state. */
  states: ExpressionState[];
  /** Which state the library card thumbnail shows. */
  coverStateId: string;
  /** Hex accent for card tint; defaults to the cover state's eye colour. */
  accent: string;
  /** Optional free-form category, used by the library filter chips. */
  category?: string;
  likes: number;
  /** ISO date; assigned by the database on save. */
  createdAt: string;
}

/** Quick-pick labels offered by the "add state" menu (free text also allowed). */
export const SUGGESTED_LABELS = [
  "Neutral",
  "Happy",
  "Thinking",
  "Error",
  "Idle",
  "Surprised",
  "Sleepy",
  "Angry",
] as const;

export type SortKey = "popular" | "recent" | "alpha";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "popular", label: "Most liked" },
  { key: "recent", label: "Newest" },
  { key: "alpha", label: "A–Z" },
];

/** Deep-clone a face so edits to one state never alias another. */
export function cloneFace(f: NoriFaceParams): NoriFaceParams {
  return {
    ...f,
    left: { ...f.left },
    right: { ...f.right },
    leftBrow: { ...f.leftBrow },
    rightBrow: { ...f.rightBrow },
  };
}

/** Deep-clone a preset (states + faces). */
export function clonePreset(p: Preset): Preset {
  return {
    ...p,
    author: { ...p.author },
    states: p.states.map((s) => ({ ...s, face: cloneFace(s.face) })),
  };
}

/**
 * A fresh local id. Uses `crypto.randomUUID` when available (browser / modern
 * Node). Only ever called from client event handlers, so it never runs during
 * a server prerender.
 */
export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `s-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

/** A new state seeded from the neutral face (or a provided face). */
export function newState(label = "Neutral", face: NoriFaceParams = NEUTRAL_FACE): ExpressionState {
  return { id: uid(), label, face: cloneFace(face) };
}

/**
 * A blank draft preset with a single neutral state. The first state's id is
 * deterministic (no `crypto`/`Date`) so this is safe to run during the SSR of
 * the playground's static shell.
 */
export function newPreset(): Preset {
  const first: ExpressionState = {
    id: "s1",
    label: "Neutral",
    face: cloneFace(NEUTRAL_FACE),
  };
  return {
    id: "",
    name: "",
    description: "",
    author: { name: "" },
    states: [first],
    coverStateId: first.id,
    accent: NEUTRAL_FACE.color,
    likes: 0,
    createdAt: "",
  };
}

/** The state shown on the card — the cover, or the first as a fallback. */
export function coverState(preset: Preset): ExpressionState {
  return preset.states.find((s) => s.id === preset.coverStateId) ?? preset.states[0];
}

/** Compact count, e.g. 1200 → "1.2k". */
export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  const k = n / 1000;
  return `${k >= 10 || Number.isInteger(k) ? Math.round(k) : k.toFixed(1)}k`;
}

/** Two-letter avatar initials from a name. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
