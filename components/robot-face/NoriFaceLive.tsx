"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  animate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type MotionValue,
} from "motion/react";

import {
  FACE_VIEWBOX,
  browCenterY,
  buildBrowPath,
  buildEyePath,
  eyeRenderMode,
  isDirectional,
  type NoriBrowParams,
  type NoriEyeParams,
  type NoriFaceParams,
} from "@/lib/nori-face";
import CustomSvgEye from "./CustomSvgEye";

/**
 * Motion-animated version of the Nori face used by the playground. Every
 * parameter change springs into place in real time, and the eyes blink on
 * their own. Eye geometry (width/height/radius/colour) animates on the rect;
 * placement and deformation (gap/offset/openness/tilt) animate as transforms.
 */

/** How the eyes should move. */
export type GazeMode = "off" | "cursor" | "random";

interface NoriFaceLiveProps {
  face: NoriFaceParams;
  /** Sizing is controlled via `className` (the SVG fills its container). */
  className?: string;
  /** Idle blinking. Defaults on (disabled under reduced-motion). */
  ambient?: boolean;
  /**
   * Eye movement mode: `"off"` holds the gaze centred, `"cursor"` makes the
   * eyes look toward the pointer, `"random"` glances in random directions.
   */
  gazeMode?: GazeMode;
}

const { width: VB_W, height: VB_H } = FACE_VIEWBOX;
const CX = VB_W / 2;
const CY = VB_H / 2;

const spring = { type: "spring", stiffness: 300, damping: 30, mass: 0.6 } as const;

/** Maximum gaze shift (viewBox units) — enough to read as a glance, not a slide. */
const GAZE_X = 24;
const GAZE_Y = 16;
const gazeSpring = { stiffness: 140, damping: 18, mass: 0.6 } as const;

const clamp1 = (n: number) => Math.max(-1, Math.min(1, n));

/**
 * Drives a gaze offset (viewBox units) onto two springs, from either the
 * pointer (`cursor`) or a random timer (`random`). Returns the SVG ref the
 * pointer geometry is measured against.
 */
function useGaze(mode: GazeMode, reduce: boolean) {
  const svgRef = useRef<SVGSVGElement>(null);
  const x = useSpring(0, gazeSpring);
  const y = useSpring(0, gazeSpring);

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
      x.set(clamp1(nx) * GAZE_X);
      y.set(clamp1(ny) * GAZE_Y);
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
  }, [mode, x, y]);

  // Random: glance to a new random point at random intervals.
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
          x.set(Math.cos(a) * d * GAZE_X);
          y.set(Math.sin(a) * d * GAZE_Y);
          tick();
        },
        650 + Math.random() * 2200,
      );
    };
    tick();

    return () => {
      active = false;
      clearTimeout(timer);
      x.set(0);
      y.set(0);
    };
  }, [mode, reduce, x, y]);

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
function useBlink(enabled: boolean) {
  const blink = useMotionValue(1);

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
          await animate(blink, 0.06, { duration: 0.07, ease: "easeIn" }).finished;
          if (!active) return;
          await animate(blink, 1, { duration: 0.13, ease: "easeOut" }).finished;
          schedule();
        },
        2500 + Math.random() * 3500,
      );
    };
    schedule();

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [enabled, blink]);

  return blink;
}

function LiveEye({
  eye,
  cx,
  color,
  blink,
  side,
}: {
  eye: NoriEyeParams;
  cx: number;
  color: string;
  blink: MotionValue<number>;
  side: "left" | "right";
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
        transition={spring}
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
            transition={spring}
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
}: {
  brow: NoriBrowParams;
  eye: NoriEyeParams;
  cx: number;
  color: string;
  mirror: 1 | -1;
}) {
  // Float above the eye's base top edge (clamped to stay in the viewBox).
  const browY = browCenterY(eye, brow);

  return (
    <motion.g
      style={{ transformBox: "fill-box", transformOrigin: "center" }}
      initial={false}
      animate={{ x: cx - CX, y: browY - CY, rotate: brow.tilt * mirror }}
      transition={spring}
    >
      <path d={buildBrowPath(brow)} fill={color} transform={`translate(${CX} ${CY})`} />
    </motion.g>
  );
}

export default function NoriFaceLive({
  face,
  className,
  ambient = true,
  gazeMode = "off",
}: NoriFaceLiveProps) {
  const reduce = useReducedMotion();
  const blink = useBlink(ambient && !reduce);
  const { svgRef, gazeX, gazeY } = useGaze(gazeMode, !!reduce);

  const { color, glow, gap, left, right, browsEnabled, leftBrow, rightBrow } =
    face;
  const glowFilter =
    glow > 0
      ? `drop-shadow(0 0 ${6 * glow}px ${color}) drop-shadow(0 0 ${16 * glow}px ${color}aa)`
      : undefined;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      role="img"
      aria-label="Nori robot face preview"
      className={className}
    >
      <g style={{ filter: glowFilter }}>
        {/* Gaze: shifts the eyes (and brows) toward where they're looking. */}
        <motion.g style={{ x: gazeX, y: gazeY }}>
          <LiveEye eye={left} cx={CX - gap / 2} color={color} blink={blink} side="left" />
          <LiveEye eye={right} cx={CX + gap / 2} color={color} blink={blink} side="right" />
          {browsEnabled && (
            <>
              <LiveBrow
                brow={leftBrow}
                eye={left}
                cx={CX - gap / 2}
                color={color}
                mirror={1}
              />
              <LiveBrow
                brow={rightBrow}
                eye={right}
                cx={CX + gap / 2}
                color={color}
                mirror={-1}
              />
            </>
          )}
        </motion.g>
      </g>
    </svg>
  );
}
