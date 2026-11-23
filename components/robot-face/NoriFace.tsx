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
 * Renders the Nori robot's on-screen face as a single SVG: two glowing,
 * rounded-rectangle eyes on a transparent (screen) background.
 *
 * Purely presentational and server-renderable — it draws whatever
 * `NoriFaceParams` it is given, so the playground can feed it live edits.
 */

interface NoriFaceProps {
  face: NoriFaceParams;
  /** Rendered width in px. Height follows the viewBox aspect ratio. */
  width?: number;
  className?: string;
}

const { width: VB_W, height: VB_H } = FACE_VIEWBOX;
const CENTER_X = VB_W / 2;
const CENTER_Y = VB_H / 2;

function Eye({
  eye,
  cx,
  color,
  side,
}: {
  eye: NoriEyeParams;
  cx: number;
  color: string;
  side: "left" | "right";
}) {
  const cy = CENTER_Y + eye.offsetY;
  const shape = eye.shape ?? "bar";

  if (shape === "bar") {
    const h = Math.max(eye.width * 0.2, eye.height * eye.openness);
    const x = cx - eye.width / 2;
    const y = cy - h / 2;
    // Clamp the radius so a squinting eye never over-rounds into a lens shape.
    const r = Math.min(eye.radius, eye.width / 2, h / 2);
    return (
      <rect
        x={x}
        y={y}
        width={eye.width}
        height={h}
        rx={r}
        ry={r}
        fill={color}
        transform={eye.tilt ? `rotate(${eye.tilt} ${cx} ${cy})` : undefined}
      />
    );
  }

  if (shape === "custom") {
    const openH = Math.max(eye.height * eye.openness, 2);
    return (
      <g transform={eye.tilt ? `rotate(${eye.tilt} ${cx} ${cy})` : undefined}>
        <CustomSvgEye
          svg={eye.customSvg}
          viewBox={eye.customViewBox}
          x={cx - eye.width / 2}
          y={cy - openH / 2}
          width={eye.width}
          height={openH}
        />
      </g>
    );
  }

  const stroke = eyeRenderMode(shape) === "stroke";
  const mirror = side === "right" && isDirectional(shape) ? -1 : 1;
  // Openness squashes vertically.
  const sy = Math.max(eye.openness, 0.04);

  return (
    <path
      d={buildEyePath(eye)}
      transform={`translate(${cx} ${cy}) rotate(${eye.tilt}) scale(${mirror} ${sy})`.trim()}
      fill={stroke ? "none" : color}
      stroke={stroke ? color : undefined}
      strokeWidth={stroke ? eye.thickness : undefined}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function Brow({
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
  const cy = browCenterY(eye, brow);
  return (
    <path
      d={buildBrowPath(brow)}
      fill={color}
      transform={`translate(${cx} ${cy}) rotate(${brow.tilt * mirror})`}
    />
  );
}

function Mouth({ mouth, color }: { mouth: NoriMouthParams; color: string }) {
  const cy = mouthCenterY(mouth);
  const stroke = mouthRenderMode(mouth.shape) === "stroke";
  return (
    <path
      d={buildMouthPath(mouth)}
      transform={`translate(${CENTER_X} ${cy})`}
      fill={stroke ? "none" : color}
      stroke={stroke ? color : undefined}
      strokeWidth={stroke ? mouth.thickness : undefined}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

export default function NoriFace({ face, width = 460, className }: NoriFaceProps) {
  const { color, glow, gap, left, right, browsEnabled, leftBrow, rightBrow, mouthEnabled, mouth } =
    face;
  const leftX = CENTER_X - gap / 2;
  const rightX = CENTER_X + gap / 2;

  // Soft bloom via stacked drop-shadows — no SVG filter ids, so the component
  // stays server-renderable and safe to use more than once on a page.
  const glowFilter =
    glow > 0
      ? `drop-shadow(0 0 ${6 * glow}px ${color}) drop-shadow(0 0 ${16 * glow}px ${color}aa)`
      : undefined;

  return (
    <svg
      width={width}
      height={(width * VB_H) / VB_W}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      fill="none"
      role="img"
      aria-label="Nori robot neutral expression"
      className={className}
    >
      <g style={{ filter: glowFilter }}>
        <Eye eye={left} cx={leftX} color={color} side="left" />
        <Eye eye={right} cx={rightX} color={color} side="right" />
        {browsEnabled && (
          <>
            <Brow brow={leftBrow} eye={left} cx={leftX} color={color} mirror={1} />
            <Brow brow={rightBrow} eye={right} cx={rightX} color={color} mirror={-1} />
          </>
        )}
        {mouthEnabled && <Mouth mouth={mouth} color={color} />}
      </g>
    </svg>
  );
}
