/**
 * Render targets — which face engine a preset is posed for.
 *
 * The playground previews in Chromium, where an SVG filter can bloom the eyes
 * and a pasted SVG can be drawn verbatim. Nori's firmware draws the face with
 * LVGL, which has no shader stage: no blur, no glow, no arbitrary vector
 * markup, and tweens on a duration + easing curve rather than a spring.
 *
 * A preset therefore records its target, and both the preview and the exporter
 * pass every face through `faceForTarget`, so what the playground shows is what
 * the robot can actually draw.
 */

import {
  EYE_SHAPES,
  eyeShapeDef,
  type EyeShape,
  type EyeShapeDef,
  type NoriBrowParams,
  type NoriEyeParams,
  type NoriFaceParams,
} from "@/lib/nori-face";

export type RenderTarget = "web" | "lvgl";

export type Easing = "linear" | "easeIn" | "easeOut" | "easeInOut";

export const EASINGS: readonly Easing[] = ["linear", "easeIn", "easeOut", "easeInOut"] as const;

export interface TargetCapabilities {
  /** Bloom around the eyes. An SVG filter, so LVGL cannot draw it. */
  glow: boolean;
  /** A pasted SVG eye kept verbatim, with its own fills and gradients. */
  customSvg: boolean;
  /** Spring morphs between states. LVGL tweens on duration + easing instead. */
  spring: boolean;
  /** Silhouettes the engine can draw. */
  shapes: readonly EyeShape[];
  /** Geometry is snapped to whole units (LVGL addresses integer pixels). */
  integerGeometry: boolean;
  /** Frame budget the engine realistically holds, stated plainly in the UI. */
  fps: number;
}

/**
 * LVGL draws rounded rectangles, circles, ellipses, arcs and polylines, all
 * anti-aliased — which covers every curated shape except the pasted SVG.
 */
const LVGL_SHAPES: readonly EyeShape[] = ["bar", "circle", "oval", "arc", "angle"] as const;

export const CAPABILITIES: Record<RenderTarget, TargetCapabilities> = {
  web: {
    glow: true,
    customSvg: true,
    spring: true,
    shapes: EYE_SHAPES.map((s) => s.id),
    integerGeometry: false,
    fps: 60,
  },
  lvgl: {
    glow: false,
    customSvg: false,
    spring: false,
    shapes: LVGL_SHAPES,
    integerGeometry: true,
    fps: 30,
  },
};

export const TARGETS: { id: RenderTarget; label: string; hint: string }[] = [
  {
    id: "web",
    label: "Web",
    hint: "Chromium kiosk — glow, pasted SVG and spring morphs all render.",
  },
  {
    id: "lvgl",
    label: "LVGL",
    hint: "Nori's firmware renderer — shapes, colour and tweens only. No glow or shaders.",
  },
];

export const capabilities = (target: RenderTarget): TargetCapabilities => CAPABILITIES[target];

export const supportsShape = (target: RenderTarget, shape: EyeShape | undefined): boolean =>
  capabilities(target).shapes.includes(shape ?? "bar");

/** The shape-picker entries a target can offer, in the curated order. */
export const shapesFor = (target: RenderTarget): EyeShapeDef[] =>
  EYE_SHAPES.filter((s) => capabilities(target).shapes.includes(s.id));

/** What the UI names as dropped when LVGL mode is on. */
export const UNSUPPORTED_IN_LVGL = [
  "glow and bloom",
  "pasted custom SVG",
  "spring morphing",
] as const;

/** Motion settings a target needs beyond the shared spring. */
export interface RenderConfig {
  target: RenderTarget;
  /** State-to-state tween length, used when the target has no spring. */
  durationMs: number;
  ease: Easing;
}

export const DEFAULT_RENDER: RenderConfig = {
  target: "web",
  durationMs: 220,
  ease: "easeInOut",
};

export const TWEEN_MS_RANGE = { min: 60, max: 1200, step: 10 } as const;

const isTarget = (v: unknown): v is RenderTarget => v === "web" || v === "lvgl";
const isEasing = (v: unknown): v is Easing => EASINGS.includes(v as Easing);

/**
 * Coerce a stored or untrusted render config into a usable one. Anything
 * missing or malformed falls back to the web defaults, so an older preset row
 * (written before this column existed) opens as the web preset it was.
 */
export function normalizeRender(value: unknown): RenderConfig {
  if (typeof value !== "object" || value === null) return { ...DEFAULT_RENDER };
  const r = value as Partial<RenderConfig>;
  const durationMs =
    typeof r.durationMs === "number" && Number.isFinite(r.durationMs) && r.durationMs > 0
      ? Math.min(Math.max(r.durationMs, TWEEN_MS_RANGE.min), TWEEN_MS_RANGE.max)
      : DEFAULT_RENDER.durationMs;
  return {
    target: isTarget(r.target) ? r.target : DEFAULT_RENDER.target,
    durationMs,
    ease: isEasing(r.ease) ? r.ease : DEFAULT_RENDER.ease,
  };
}

const whole = (n: number) => Math.round(n);

function eyeForTarget(eye: NoriEyeParams, caps: TargetCapabilities): NoriEyeParams {
  const next: NoriEyeParams = { ...eye };

  if (!caps.shapes.includes(next.shape ?? "bar")) next.shape = "bar";
  if (!caps.customSvg) {
    delete next.customSvg;
    delete next.customViewBox;
    delete next.customPath;
    delete next.customStroke;
  }
  if (caps.integerGeometry) {
    next.width = whole(next.width);
    next.height = whole(next.height);
    next.radius = whole(next.radius);
    next.tilt = whole(next.tilt);
    next.offsetY = whole(next.offsetY);
    next.thickness = whole(next.thickness);
    next.openness = Number(next.openness.toFixed(2));
  }
  return next;
}

function browForTarget(brow: NoriBrowParams, caps: TargetCapabilities): NoriBrowParams {
  if (!caps.integerGeometry) return { ...brow };
  return {
    length: whole(brow.length),
    thickness: whole(brow.thickness),
    radius: whole(brow.radius),
    arc: whole(brow.arc),
    tilt: whole(brow.tilt),
    offsetY: whole(brow.offsetY),
  };
}

/**
 * Clamp a face to what `target` can draw. Non-destructive by design: the
 * playground keeps the authored face intact and only passes it through here on
 * the way to the preview and the exporter, so flipping LVGL mode off restores
 * the glow and the pasted SVG untouched.
 */
export function faceForTarget(face: NoriFaceParams, target: RenderTarget): NoriFaceParams {
  const caps = capabilities(target);
  if (caps.glow && caps.customSvg && !caps.integerGeometry) return face;

  return {
    ...face,
    glow: caps.glow ? face.glow : 0,
    gap: caps.integerGeometry ? whole(face.gap) : face.gap,
    left: eyeForTarget(face.left, caps),
    right: eyeForTarget(face.right, caps),
    leftBrow: browForTarget(face.leftBrow, caps),
    rightBrow: browForTarget(face.rightBrow, caps),
  };
}

/** Whether a face uses anything `target` would have to drop. */
export function facesLostDetail(face: NoriFaceParams, target: RenderTarget): boolean {
  const caps = capabilities(target);
  if (!caps.glow && face.glow > 0) return true;
  return [face.left, face.right].some(
    (eye) => !caps.shapes.includes(eye.shape ?? "bar") || (!caps.customSvg && !!eye.customSvg),
  );
}

/** Shape label for a message naming what a target replaced. */
export const shapeLabel = (shape: EyeShape | undefined): string => eyeShapeDef(shape).label;
