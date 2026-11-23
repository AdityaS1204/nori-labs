"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  motion,
  animate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type MotionValue,
} from "motion/react";

import {
  DEFAULT_AMBIENT,
  DEFAULT_TRANSITION,
  type AmbientSpec,
  type BlinkSpec,
  type Easing,
  type FitMode,
  type GazeSpec,
  type TransitionSpec,
} from "@/lib/face-pack";
import {
  FACE_VIEWBOX,
  browCenterY,
  buildBrowPath,
  buildEyePath,
  buildMouthPath,
  eyeRenderMode,
  isDirectional,
  mouthCenterY,
  mouthRenderMode,
  type NoriBrowParams,
  type NoriEyeParams,
  type NoriFaceParams,
  type NoriMouthParams,
} from "@/lib/nori-face";
import CustomSvgEye from "./CustomSvgEye";

/**
 * Motion-animated version of the Nori face. Every parameter change springs into
 * place in real time, and the eyes blink and glance on their own. Eye geometry
 * (width/height/radius/colour) animates on the rect; placement and deformation
 * (gap/offset/openness/tilt) animate as transforms.
 *
 * Shared by the playground preview and the robot kiosk renderer — the motion
 * parameters come from a face pack so both move identically.
 */

/** How the eyes should move. `cursor` is preview-only and never persisted. */
export type GazeMode = "off" | "cursor" | "random";

interface NoriFaceLiveProps {
  face: NoriFaceParams;
  /** Sizing is controlled via `className` (the SVG fills its container). */
  className?: string;
  /**
   * Idle blinking and gaze tuning. `true` uses the shipped defaults, `false`
   * disables blinking, or pass a pack's `ambient` block.
   */
  ambient?: boolean | AmbientSpec;
  /** Spring or tween used when morphing between faces. Defaults to the shipped spring. */
  transition?: TransitionSpec;
  /**
   * Eye movement mode: `"off"` holds the gaze centred, `"cursor"` makes the
   * eyes look toward the pointer, `"random"` glances in random directions.
   */
  gazeMode?: GazeMode;
  /** How the face viewBox maps onto its container. */
  fit?: FitMode;
  /**
   * Ignore `prefers-reduced-motion`. Set on a robot's own face, where a
   * permanently still face reads as broken rather than calm.
   */
  forceMotion?: boolean;
}

const { width: VB_W, height: VB_H } = FACE_VIEWBOX;
const CX = VB_W / 2;
const CY = VB_H / 2;

const PRESERVE_ASPECT: Record<FitMode, string> = {
  contain: "xMidYMid meet",
  cover: "xMidYMid slice",
  stretch: "none",
};

const clamp1 = (n: number) => Math.max(-1, Math.min(1, n));
const inRange = ([lo, hi]: [number, number]) => lo + Math.random() * (hi - lo);

/**
 * Drives a gaze offset (viewBox units) onto two springs, from either the
 * pointer (`cursor`) or a random timer (`random`). Returns the SVG ref the
 * pointer geometry is measured against.
 */
function useGaze(mode: GazeMode, reduce: boolean, spec: GazeSpec) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [clampX, clampY] = spec.clamp;
  const { stiffness, damping, mass } = spec.spring;
  const config = useMemo(() => ({ stiffness, damping, mass }), [stiffness, damping, mass]);
  const x = useSpring(0, config);
  const y = useSpring(0, config);

  // Cursor-follow: look toward the pointer, relative to the face centre.
  useEffect(() => {
    if (mode !== "cursor") return;
    const svg = svgRef.current;
    const host = svg?.parentElement ?? svg;
    if (!svg || !host) return;

    const onMove = (e: PointerEvent) => {
      const r = svg.getBoundingClientRect();
      const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2 || 1);
      const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2 || 1);
      x.set(clamp1(nx) * clampX);
      y.set(clamp1(ny) * clampY);
    };
    const onLeave = () => {
      x.set(0);
      y.set(0);
    };

    host.addEventListener("pointermove", onMove as EventListener);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      host.removeEventListener("pointermove", onMove as EventListener);
      host.removeEventListener("pointerleave", onLeave);
      x.set(0);
      y.set(0);
    };
  }, [mode, x, y, clampX, clampY]);

  // Random: glance to a new random point at random intervals.
  const [retargetLo, retargetHi] = spec.retargetMs;
  useEffect(() => {
    if (mode !== "random" || reduce) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      timer = setTimeout(
        () => {
          if (!active) return;
          const a = Math.random() * Math.PI * 2;
          const d = Math.sqrt(Math.random()); // uniform over the disc
          x.set(Math.cos(a) * d * clampX);
          y.set(Math.sin(a) * d * clampY);
          tick();
        },
        inRange([retargetLo, retargetHi]),
      );
    };
    tick();

    return () => {
      active = false;
      clearTimeout(timer);
      x.set(0);
      y.set(0);
    };
  }, [mode, reduce, x, y, clampX, clampY, retargetLo, retargetHi]);

  // Recentre when movement is off.
  useEffect(() => {
    if (mode === "off") {
      x.set(0);
      y.set(0);
    }
  }, [mode, x, y]);

  return { svgRef, gazeX: x, gazeY: y };
}

const clampRadius = (e: NoriEyeParams) =>
  Math.min(e.radius, e.width / 2, e.height / 2);

/** A blink loop driven onto a shared vertical-scale MotionValue. */
function useBlink(enabled: boolean, spec: BlinkSpec) {
  const blink = useMotionValue(1);
  const { closeMs, closeEase, openMs, openEase, closedScale } = spec;
  const [everyLo, everyHi] = spec.everyMs;

  useEffect(() => {
    if (!enabled) {
      blink.set(1);
      return;
    }
    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      timer = setTimeout(
        async () => {
          if (!active) return;
          await animate(blink, closedScale, {
            duration: closeMs / 1000,
            ease: closeEase,
          }).finished;
          if (!active) return;
          await animate(blink, 1, { duration: openMs / 1000, ease: openEase }).finished;
          schedule();
        },
        inRange([everyLo, everyHi]),
      );
    };
    schedule();

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [enabled, blink, closeMs, closeEase, openMs, openEase, closedScale, everyLo, everyHi]);

  return blink;
}

/**
 * How one pose morphs into the next. A spring when the pack ships one, a tween
 * when it states `durationMs` — which an LVGL pack always does, since the
 * device has no spring solver and the preview must match what it will do.
 */
type Morph =
  | { type: "spring"; stiffness: number; damping: number; mass: number }
  | { type: "tween"; duration: number; ease: Easing };

function LiveEye({
  eye,
  cx,
  color,
  blink,
  side,
  morph,
}: {
  eye: NoriEyeParams;
  cx: number;
  color: string;
  blink: MotionValue<number>;
  side: "left" | "right";
  morph: Morph;
}) {
  const w = eye.width;
  const h = eye.height;
  const r = clampRadius(eye);
  const shape = eye.shape ?? "bar";

  return (
    // Outer group: involuntary blink (shared scaleY), about the eye centre.
    <motion.g
      style={{ scaleY: blink, transformBox: "fill-box", transformOrigin: "center" }}
    >
      {/* Inner group: placement + posed deformation. */}
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        initial={false}
        animate={{
          x: cx - CX,
          y: eye.offsetY,
          scaleY: Math.max(eye.openness, 0.02),
          rotate: eye.tilt,
        }}
        transition={morph}
      >
        {shape === "bar" ? (
          <motion.rect
            initial={false}
            animate={{
              x: CX - w / 2,
              y: CY - h / 2,
              width: w,
              height: h,
              rx: r,
              fill: color,
            }}
            transition={morph}
          />
        ) : shape === "custom" ? (
          <CustomSvgEye
            svg={eye.customSvg}
            viewBox={eye.customViewBox}
            x={CX - w / 2}
            y={CY - h / 2}
            width={w}
            height={h}
          />
        ) : (
          <EyePath eye={eye} color={color} side={side} />
        )}
      </motion.g>
    </motion.g>
  );
}

/** Curated non-`bar` eyes (arc / bracket / angle): a path, mirrored on the right. */
function EyePath({
  eye,
  color,
  side,
}: {
  eye: NoriEyeParams;
  color: string;
  side: "left" | "right";
}) {
  const stroke = eyeRenderMode(eye.shape) === "stroke";
  const mirror = side === "right" && isDirectional(eye.shape) ? -1 : 1;

  return (
    <path
      d={buildEyePath(eye)}
      transform={`translate(${CX} ${CY}) scale(${mirror} 1)`}
      fill={stroke ? "none" : color}
      stroke={stroke ? color : undefined}
      strokeWidth={stroke ? eye.thickness : undefined}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function LiveBrow({
  brow,
  eye,
  cx,
  color,
  mirror,
  morph,
}: {
  brow: NoriBrowParams;
  eye: NoriEyeParams;
  cx: number;
  color: string;
  mirror: 1 | -1;
  morph: Morph;
}) {
  // Float above the eye's base top edge (clamped to stay in the viewBox).
  const browY = browCenterY(eye, brow);

  return (
    <motion.g
      style={{ transformBox: "fill-box", transformOrigin: "center" }}
      initial={false}
      animate={{ x: cx - CX, y: browY - CY, rotate: brow.tilt * mirror }}
      transition={morph}
    >
      <path d={buildBrowPath(brow)} fill={color} transform={`translate(${CX} ${CY})`} />
    </motion.g>
  );
}

function LiveMouth({
  mouth,
  color,
  morph,
}: {
  mouth: NoriMouthParams;
  color: string;
  morph: Morph;
}) {
  const stroke = mouthRenderMode(mouth.shape) === "stroke";
  return (
    <motion.g
      style={{ transformBox: "fill-box", transformOrigin: "center" }}
      initial={false}
      animate={{ y: mouthCenterY(mouth) - CY }}
      transition={morph}
    >
      <path
        d={buildMouthPath(mouth)}
        transform={`translate(${CX} ${CY})`}
        fill={stroke ? "none" : color}
        stroke={stroke ? color : undefined}
        strokeWidth={stroke ? mouth.thickness : undefined}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.g>
  );
}

export default function NoriFaceLive({
  face,
  className,
  ambient = true,
  transition = DEFAULT_TRANSITION,
  gazeMode = "off",
  fit = "contain",
  forceMotion = false,
}: NoriFaceLiveProps) {
  const prefersReduced = useReducedMotion();
  const reduce = !forceMotion && !!prefersReduced;

  const ambientSpec = typeof ambient === "object" ? ambient : DEFAULT_AMBIENT;
  const blinkEnabled = ambient !== false && !reduce;

  const blink = useBlink(blinkEnabled, ambientSpec.blink);
  const { svgRef, gazeX, gazeY } = useGaze(gazeMode, reduce, ambientSpec.gaze);

  const { spring: s, durationMs, ease } = transition;
  const morph = useMemo<Morph>(
    () =>
      durationMs === undefined
        ? { type: "spring", stiffness: s.stiffness, damping: s.damping, mass: s.mass }
        : { type: "tween", duration: durationMs / 1000, ease: ease ?? "easeInOut" },
    [durationMs, ease, s.stiffness, s.damping, s.mass],
  );

  const { color, glow, gap, left, right, browsEnabled, leftBrow, rightBrow, mouthEnabled, mouth } =
    face;
  const glowFilter =
    glow > 0
      ? `drop-shadow(0 0 ${6 * glow}px ${color}) drop-shadow(0 0 ${16 * glow}px ${color}aa)`
      : undefined;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio={PRESERVE_ASPECT[fit]}
      fill="none"
      role="img"
      aria-label="Nori robot face preview"
      className={className}
    >
      <g style={{ filter: glowFilter }}>
        {/* Gaze: shifts the eyes (and brows) toward where they're looking. */}
        <motion.g style={{ x: gazeX, y: gazeY }}>
          <LiveEye eye={left} cx={CX - gap / 2} color={color} blink={blink} side="left" morph={morph} />
          <LiveEye eye={right} cx={CX + gap / 2} color={color} blink={blink} side="right" morph={morph} />
          {browsEnabled && (
            <>
              <LiveBrow
                brow={leftBrow}
                eye={left}
                cx={CX - gap / 2}
                color={color}
                mirror={1}
                morph={morph}
              />
              <LiveBrow
                brow={rightBrow}
                eye={right}
                cx={CX + gap / 2}
                color={color}
                mirror={-1}
                morph={morph}
              />
            </>
          )}
          {mouthEnabled && <LiveMouth mouth={mouth} color={color} morph={morph} />}
        </motion.g>
      </g>
    </svg>
  );
}
