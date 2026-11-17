/**
 * The Nori face pack — the versioned, portable format the playground exports and
 * the robot SDK renders. See `docs/face-pack-v1.md`.
 *
 * Unlike `Preset` (a database row), a pack carries the motion parameters needed to
 * reproduce the playground's feel, and its state ids are human-readable slugs so
 * robot code reads `face.set("happy")`.
 */

import { NEUTRAL_FACE, type NoriFaceParams } from "@/lib/nori-face";
import { normalizeStates } from "@/lib/preset-row";
import type { ExpressionState, Preset } from "@/lib/presets";

export const SCHEMA_VERSION = 1;

export type FitMode = "contain" | "cover" | "stretch";
export type Easing = "linear" | "easeIn" | "easeOut" | "easeInOut";
/** Gaze modes a pack may request. The playground's `cursor` mode is preview-only. */
export type PackGazeMode = "off" | "random";

export interface SpringSpec {
  stiffness: number;
  damping: number;
  mass: number;
}

export interface BlinkSpec {
  /** Lid-close duration. */
  closeMs: number;
  closeEase: Easing;
  /** Lid-open duration. */
  openMs: number;
  openEase: Easing;
  /** Vertical scale at full close; a sliver, never 0. */
  closedScale: number;
  /** Inclusive range the next blink delay is drawn from. */
  everyMs: [number, number];
}

export interface GazeSpec {
  mode: PackGazeMode;
  /** Maximum gaze shift in viewBox units, as [x, y]. */
  clamp: [number, number];
  /** Inclusive range the next re-target delay is drawn from. */
  retargetMs: [number, number];
  spring: SpringSpec;
}

export interface AmbientSpec {
  blink: BlinkSpec;
  gaze: GazeSpec;
}

export interface TransitionSpec {
  /** Spring used when morphing between states. */
  spring: SpringSpec;
}

export interface FacePackState {
  /** Slug used by the SDK, e.g. "happy". Unique within the pack. */
  id: string;
  /** Human label as authored in the playground. */
  label: string;
  face: NoriFaceParams;
}

export interface FacePack {
  schema: typeof SCHEMA_VERSION;
  name: string;
  /** Id of the state shown at boot. Must resolve to a member of states. */
  defaultState: string;
  /** Screen colour behind the face; 6-digit hex. */
  background: string;
  /** How the 440x320 face viewBox maps onto the physical panel. */
  fit: FitMode;
  transition: TransitionSpec;
  ambient: AmbientSpec;
  /** At least one state. */
  states: FacePackState[];
}

/** Lifted verbatim from `NoriFaceLive` so an exported pack matches the preview. */
export const DEFAULT_TRANSITION: TransitionSpec = {
  spring: { stiffness: 300, damping: 30, mass: 0.6 },
};

export const DEFAULT_AMBIENT: AmbientSpec = {
  blink: {
    closeMs: 70,
    closeEase: "easeIn",
    openMs: 130,
    openEase: "easeOut",
    closedScale: 0.06,
    everyMs: [2500, 6000],
  },
  gaze: {
    mode: "random",
    clamp: [24, 16],
    retargetMs: [650, 2850],
    spring: { stiffness: 140, damping: 18, mass: 0.6 },
  },
};

export const DEFAULT_BACKGROUND = "#000000";

export class FacePackError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FacePackError";
  }
}

/**
 * Normalise to 6-digit hex. The glow in `NoriFaceLive` is built by appending an
 * alpha suffix to this string, so a 3-digit or rgb() colour breaks the bloom.
 */
export function normalizeHex(value: unknown, field: string): string {
  if (typeof value !== "string") throw new FacePackError(`${field} must be a hex colour string`);
  const v = value.trim();
  if (/^#[0-9a-f]{6}$/i.test(v)) return v.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(v)) {
    const [r, g, b] = v.slice(1);
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  throw new FacePackError(`${field} must be 3- or 6-digit hex, got ${JSON.stringify(value)}`);
}

export function slugifyStateId(label: string, index: number): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `state-${index + 1}`;
}

function uniqueId(candidate: string, used: Set<string>): string {
  if (!used.has(candidate)) return candidate;
  let n = 2;
  while (used.has(`${candidate}-${n}`)) n += 1;
  return `${candidate}-${n}`;
}

/**
 * Build an export-ready pack from a playground preset. One-way: a pack does not
 * parse back into a `Preset`, since state ids are re-slugged from labels.
 */
export function presetToPack(preset: Preset): FacePack {
  const source: ExpressionState[] = normalizeStates(preset.states);
  if (source.length === 0) throw new FacePackError("a pack needs at least one state");

  const used = new Set<string>();
  const states: FacePackState[] = source.map((state, i) => {
    const id = uniqueId(slugifyStateId(state.label, i), used);
    used.add(id);
    return {
      id,
      label: state.label,
      face: { ...state.face, color: normalizeHex(state.face.color, `states[${i}].face.color`) },
    };
  });

  // normalizeStates preserves order, so the cover's index still addresses the same state.
  const coverIndex = source.findIndex((s) => s.id === preset.coverStateId);

  return {
    schema: SCHEMA_VERSION,
    name: preset.name.trim() || "Untitled face",
    defaultState: states[coverIndex >= 0 ? coverIndex : 0].id,
    background: DEFAULT_BACKGROUND,
    fit: "contain",
    transition: DEFAULT_TRANSITION,
    ambient: DEFAULT_AMBIENT,
    states,
  };
}

function asRecord(value: unknown, field: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new FacePackError(`${field} must be an object`);
  }
  return value as Record<string, unknown>;
}

function num(value: unknown, field: string, fallback: number): number {
  if (value === undefined) return fallback;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new FacePackError(`${field} must be a finite number`);
  }
  return value;
}

function pair(value: unknown, field: string, fallback: [number, number]): [number, number] {
  if (value === undefined) return fallback;
  if (!Array.isArray(value) || value.length !== 2) {
    throw new FacePackError(`${field} must be a pair of numbers`);
  }
  return [num(value[0], `${field}[0]`, fallback[0]), num(value[1], `${field}[1]`, fallback[1])];
}

/** A `pair` that additionally must be ordered — for delay ranges, not for [x, y]. */
function range(value: unknown, field: string, fallback: [number, number]): [number, number] {
  const [lo, hi] = pair(value, field, fallback);
  if (hi < lo) throw new FacePackError(`${field} max must be >= min`);
  return [lo, hi];
}

function oneOf<T extends string>(
  value: unknown,
  field: string,
  allowed: readonly T[],
  fallback: T,
): T {
  if (value === undefined) return fallback;
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new FacePackError(`${field} must be one of ${allowed.join(", ")}`);
  }
  return value as T;
}

function springOf(value: unknown, field: string, fallback: SpringSpec): SpringSpec {
  if (value === undefined) return fallback;
  const r = asRecord(value, field);
  return {
    stiffness: num(r.stiffness, `${field}.stiffness`, fallback.stiffness),
    damping: num(r.damping, `${field}.damping`, fallback.damping),
    mass: num(r.mass, `${field}.mass`, fallback.mass),
  };
}

const EASINGS = ["linear", "easeIn", "easeOut", "easeInOut"] as const;
const FITS = ["contain", "cover", "stretch"] as const;
const GAZE_MODES = ["off", "random"] as const;

/**
 * Validate and fill in a pack from untrusted JSON. Missing motion fields fall back
 * to the shipped defaults; malformed ones throw, so a bad pack fails before deploy
 * rather than rendering the wrong face on a robot.
 */
export function parsePack(input: unknown): FacePack {
  const raw = asRecord(input, "pack");

  if (raw.schema !== SCHEMA_VERSION) {
    throw new FacePackError(
      `unsupported schema ${JSON.stringify(raw.schema)}; this build reads schema ${SCHEMA_VERSION}`,
    );
  }

  if (!Array.isArray(raw.states) || raw.states.length === 0) {
    throw new FacePackError("pack.states must be a non-empty array");
  }

  const seen = new Set<string>();
  const parsed: FacePackState[] = raw.states.map((entry, i) => {
    const r = asRecord(entry, `states[${i}]`);
    const id = r.id;
    if (typeof id !== "string" || id.length === 0) {
      throw new FacePackError(`states[${i}].id must be a non-empty string`);
    }
    if (seen.has(id)) throw new FacePackError(`duplicate state id ${JSON.stringify(id)}`);
    seen.add(id);

    const face = asRecord(r.face, `states[${i}].face`) as unknown as NoriFaceParams;
    for (const part of ["left", "right", "leftBrow", "rightBrow"] as const) {
      asRecord((face as unknown as Record<string, unknown>)[part], `states[${i}].face.${part}`);
    }

    return {
      id,
      label: typeof r.label === "string" && r.label ? r.label : id,
      face: { ...face, color: normalizeHex(face.color, `states[${i}].face.color`) },
    };
  });

  // Reuse the one existing migration path for eyes written before shape/thickness existed.
  const migrated = normalizeStates(parsed.map((s) => ({ id: s.id, label: s.label, face: s.face })));
  const states = parsed.map((s, i) => ({ ...s, face: migrated[i].face }));

  const defaultState = raw.defaultState;
  if (typeof defaultState !== "string" || !seen.has(defaultState)) {
    throw new FacePackError(
      `pack.defaultState ${JSON.stringify(defaultState)} does not match any state id`,
    );
  }

  const t = raw.transition === undefined ? {} : asRecord(raw.transition, "pack.transition");
  const a = raw.ambient === undefined ? {} : asRecord(raw.ambient, "pack.ambient");
  const blink = a.blink === undefined ? {} : asRecord(a.blink, "pack.ambient.blink");
  const gaze = a.gaze === undefined ? {} : asRecord(a.gaze, "pack.ambient.gaze");
  const d = DEFAULT_AMBIENT;

  return {
    schema: SCHEMA_VERSION,
    name: typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : "Untitled face",
    defaultState,
    background:
      raw.background === undefined
        ? DEFAULT_BACKGROUND
        : normalizeHex(raw.background, "pack.background"),
    fit: oneOf(raw.fit, "pack.fit", FITS, "contain"),
    transition: { spring: springOf(t.spring, "pack.transition.spring", DEFAULT_TRANSITION.spring) },
    ambient: {
      blink: {
        closeMs: num(blink.closeMs, "pack.ambient.blink.closeMs", d.blink.closeMs),
        closeEase: oneOf(
          blink.closeEase,
          "pack.ambient.blink.closeEase",
          EASINGS,
          d.blink.closeEase,
        ),
        openMs: num(blink.openMs, "pack.ambient.blink.openMs", d.blink.openMs),
        openEase: oneOf(blink.openEase, "pack.ambient.blink.openEase", EASINGS, d.blink.openEase),
        closedScale: num(blink.closedScale, "pack.ambient.blink.closedScale", d.blink.closedScale),
        everyMs: range(blink.everyMs, "pack.ambient.blink.everyMs", d.blink.everyMs),
      },
      gaze: {
        mode: oneOf(gaze.mode, "pack.ambient.gaze.mode", GAZE_MODES, d.gaze.mode),
        clamp: pair(gaze.clamp, "pack.ambient.gaze.clamp", d.gaze.clamp),
        retargetMs: range(gaze.retargetMs, "pack.ambient.gaze.retargetMs", d.gaze.retargetMs),
        spring: springOf(gaze.spring, "pack.ambient.gaze.spring", d.gaze.spring),
      },
    },
    states,
  };
}

/** A minimal single-state pack, used as the renderer's last-resort fallback. */
export function neutralPack(): FacePack {
  return {
    schema: SCHEMA_VERSION,
    name: "Neutral",
    defaultState: "neutral",
    background: DEFAULT_BACKGROUND,
    fit: "contain",
    transition: DEFAULT_TRANSITION,
    ambient: DEFAULT_AMBIENT,
    states: [{ id: "neutral", label: "Neutral", face: NEUTRAL_FACE }],
  };
}

export function packState(pack: FacePack, id: string): FacePackState | undefined {
  return pack.states.find((s) => s.id === id);
}
