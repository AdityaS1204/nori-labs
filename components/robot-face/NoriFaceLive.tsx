"use client";

import { useEffect } from "react";
import {
  motion,
  animate,
  useMotionValue,
  useReducedMotion,
  type MotionValue,
} from "motion/react";

import {
  FACE_VIEWBOX,
  browCenterY,
  buildBrowPath,
  type NoriBrowParams,
  type NoriEyeParams,
  type NoriFaceParams,
} from "@/lib/nori-face";

/**
 * Motion-animated version of the Nori face used by the playground. Every
 * parameter change springs into place in real time, and the eyes blink on
 * their own. Eye geometry (width/height/radius/colour) animates on the rect;
 * placement and deformation (gap/offset/openness/tilt) animate as transforms.
 */

interface NoriFaceLiveProps {
  face: NoriFaceParams;
  /** Sizing is controlled via `className` (the SVG fills its container). */
  className?: string;
  /** Idle blinking. Defaults on (disabled under reduced-motion). */
  ambient?: boolean;
}

const { width: VB_W, height: VB_H } = FACE_VIEWBOX;
const CX = VB_W / 2;
const CY = VB_H / 2;

const spring = { type: "spring", stiffness: 300, damping: 30, mass: 0.6 } as const;

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
}: {
  eye: NoriEyeParams;
  cx: number;
  color: string;
  blink: MotionValue<number>;
}) {
  const w = eye.width;
  const h = eye.height;
  const r = clampRadius(eye);

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
      </motion.g>
    </motion.g>
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
}: NoriFaceLiveProps) {
  const reduce = useReducedMotion();
  const blink = useBlink(ambient && !reduce);

  const { color, glow, gap, left, right, browsEnabled, leftBrow, rightBrow } =
    face;
  const glowFilter =
    glow > 0
      ? `drop-shadow(0 0 ${6 * glow}px ${color}) drop-shadow(0 0 ${16 * glow}px ${color}aa)`
      : undefined;

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      role="img"
      aria-label="Nori robot face preview"
      className={className}
    >
      <g style={{ filter: glowFilter }}>
        <LiveEye eye={left} cx={CX - gap / 2} color={color} blink={blink} />
        <LiveEye eye={right} cx={CX + gap / 2} color={color} blink={blink} />
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
      </g>
    </svg>
  );
}
