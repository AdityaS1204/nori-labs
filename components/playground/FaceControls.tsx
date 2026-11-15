"use client";

import {
  EYE_SHAPES,
  eyeRenderMode,
  type EyeShape,
  type NoriBrowParams,
  type NoriEyeParams,
  type NoriFaceParams,
} from "@/lib/nori-face";
import {
  BROW_FIELDS,
  EYE_FIELDS,
  EYE_THICKNESS_FIELD,
  GLOBAL_FIELDS,
  type BrowFieldKey,
  type EyeFieldKey,
  type EyeSide,
  type GlobalFieldKey,
} from "./faceFields";
import type { GazeMode } from "@/components/robot-face/NoriFaceLive";
import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { parseCustomSvg } from "./customSvg";
import NumberSlider from "@/components/controls/NumberSlider";
import ColorField from "@/components/controls/ColorField";
import Toggle from "@/components/controls/Toggle";
import FieldRow, { ROW_BASE } from "@/components/controls/FieldRow";
import ControlSection from "@/components/controls/ControlSection";

interface FaceControlsProps {
  face: NoriFaceParams;
  linked: boolean;
  onToggleLink: (value: boolean) => void;
  onGlobalChange: (key: GlobalFieldKey, value: number) => void;
  onColorChange: (value: string) => void;
  onEyeChange: (side: EyeSide, key: EyeFieldKey, value: number) => void;
  onEyeShapeChange: (side: EyeSide, shape: EyeShape) => void;
  onEyeCustomSvgChange: (
    side: EyeSide,
    svg: string,
    viewBox?: [number, number, number, number],
  ) => void;
  onToggleBrows: (value: boolean) => void;
  onBrowChange: (side: EyeSide, key: BrowFieldKey, value: number) => void;
  /** Eye-movement preview (not part of the saved face). */
  gazeEnabled: boolean;
  /** Active mode when enabled: "cursor" or "random". */
  gazeMode: Exclude<GazeMode, "off">;
  onToggleGaze: (value: boolean) => void;
  onGazeModeChange: (mode: Exclude<GazeMode, "off">) => void;
}

/** The six per-eye sliders for a single eye. */
function EyeSliders({
  eye,
  onChange,
}: {
  eye: NoriEyeParams;
  onChange: (key: EyeFieldKey, value: number) => void;
}) {
  return (
    <>
      {EYE_FIELDS.map((f) => (
        <NumberSlider
          key={f.key}
          label={f.label}
          value={eye[f.key]}
          min={f.min}
          max={f.max}
          step={f.step}
          unit={f.unit}
          format={f.format}
          onChange={(v) => onChange(f.key, v)}
        />
      ))}
    </>
  );
}

/** The six per-brow sliders for a single eyebrow. */
function BrowSliders({
  brow,
  onChange,
}: {
  brow: NoriBrowParams;
  onChange: (key: BrowFieldKey, value: number) => void;
}) {
  return (
    <>
      {BROW_FIELDS.map((f) => (
        <NumberSlider
          key={f.key}
          label={f.label}
          value={brow[f.key]}
          min={f.min}
          max={f.max}
          step={f.step}
          unit={f.unit}
          format={f.format}
          onChange={(v) => onChange(f.key, v)}
        />
      ))}
    </>
  );
}

function EyeGroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-1 pt-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/30">
      {children}
    </span>
  );
}

/** A row of glyph buttons for choosing the eye silhouette. */
function ShapePicker({
  shape,
  onPick,
}: {
  shape: EyeShape;
  onPick: (shape: EyeShape) => void;
}) {
  return (
    <div className={`${ROW_BASE} flex items-center gap-1 px-2`}>
      {EYE_SHAPES.map((s) => {
        const active = s.id === shape;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onPick(s.id)}
            title={s.label}
            aria-label={s.label}
            aria-pressed={active}
            className={`grid h-8 flex-1 place-items-center rounded-md transition-colors ${
              active
                ? "bg-[#E8BE3C]/15 text-[#E8BE3C]"
                : "text-white/50 hover:bg-white/[0.06] hover:text-white/80"
            }`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d={s.glyph}
                fill={s.mode === "fill" ? "currentColor" : "none"}
                stroke={s.mode === "stroke" ? "currentColor" : "none"}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Paste-your-SVG field: accepts a full `<svg>`, a shape tag, or a bare path `d`.
 * The markup is kept verbatim (rendered exactly) — only its coordinate box is
 * read so the renderer can size it into the eye.
 */
function CustomSvgInput({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (svg: string, viewBox?: [number, number, number, number]) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="group relative flex items-center gap-1 px-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/30">
          Custom SVG
        </span>
        <span
          className="flex text-white/35 transition-colors group-hover:text-white/70"
          tabIndex={0}
          aria-label="About custom SVG parameters"
        >
          <HugeiconsIcon icon={InformationCircleIcon} size={13} color="currentColor" />
        </span>
        <span
          role="tooltip"
          className="pointer-events-none absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-white/[0.1] bg-[#232326] px-2.5 py-2 text-[11px] leading-snug text-white/75 opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.55)] transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
        >
          A custom SVG renders exactly as pasted. Width, height, tilt and openness
          still apply, but some parameters — corner radius, weight and eye colour —
          won’t affect it.
        </span>
      </div>
      <div className={`${ROW_BASE} flex min-h-11 items-center px-3.5 py-2`}>
        <textarea
          value={value ?? ""}
          onChange={(e) => {
            const parsed = parseCustomSvg(e.target.value);
            onChange(e.target.value, parsed.viewBox);
          }}
          placeholder="Paste your SVG — it renders exactly, sized by the sliders"
          spellCheck={false}
          rows={3}
          aria-label="Custom eye SVG"
          className="w-full resize-none bg-transparent font-mono text-[12px] leading-snug text-white/85 placeholder:text-white/30 focus:outline-none"
        />
      </div>
    </div>
  );
}

/** Shape picker + custom input + geometry sliders + weight, for one eye. */
function EyeGroup({
  eye,
  onEyeChange,
  onShape,
  onCustom,
}: {
  eye: NoriEyeParams;
  onEyeChange: (key: EyeFieldKey, value: number) => void;
  onShape: (shape: EyeShape) => void;
  onCustom: (svg: string, viewBox?: [number, number, number, number]) => void;
}) {
  const shape = eye.shape ?? "bar";
  const isCustom = shape === "custom";
  const strokeWeightShown = eyeRenderMode(shape) === "stroke";
  return (
    <>
      <ShapePicker shape={shape} onPick={onShape} />
      {isCustom && <CustomSvgInput value={eye.customSvg} onChange={onCustom} />}
      <EyeSliders eye={eye} onChange={onEyeChange} />
      {strokeWeightShown && (
        <NumberSlider
          label={EYE_THICKNESS_FIELD.label}
          value={eye.thickness ?? 16}
          min={EYE_THICKNESS_FIELD.min}
          max={EYE_THICKNESS_FIELD.max}
          step={EYE_THICKNESS_FIELD.step}
          onChange={(v) => onEyeChange("thickness", v)}
        />
      )}
    </>
  );
}

/**
 * Face-specific panel body: a Screen group and an Eyes group built from the
 * generic control kit. "Link eyes" edits both together; unlink to pose them
 * separately.
 */
export default function FaceControls({
  face,
  linked,
  onToggleLink,
  onGlobalChange,
  onColorChange,
  onEyeChange,
  onEyeShapeChange,
  onEyeCustomSvgChange,
  onToggleBrows,
  onBrowChange,
  gazeEnabled,
  gazeMode,
  onToggleGaze,
  onGazeModeChange,
}: FaceControlsProps) {
  return (
    <>
      <ControlSection title="Screen">
        <ColorField label="Eye color" value={face.color} onChange={onColorChange} />
        {GLOBAL_FIELDS.map((f) => (
          <NumberSlider
            key={f.key}
            label={f.label}
            value={face[f.key]}
            min={f.min}
            max={f.max}
            step={f.step}
            format={f.format}
            onChange={(v) => onGlobalChange(f.key, v)}
          />
        ))}
      </ControlSection>

      <ControlSection title="Eyes">
        <FieldRow>
          <span className="text-[13px] text-white/80">Link sides</span>
          <Toggle label="Link sides" checked={linked} onChange={onToggleLink} />
        </FieldRow>

        {linked ? (
          <EyeGroup
            eye={face.left}
            onEyeChange={(key, value) => onEyeChange("both", key, value)}
            onShape={(shape) => onEyeShapeChange("both", shape)}
            onCustom={(svg, vb) => onEyeCustomSvgChange("both", svg, vb)}
          />
        ) : (
          <>
            <EyeGroupLabel>Left</EyeGroupLabel>
            <EyeGroup
              eye={face.left}
              onEyeChange={(key, value) => onEyeChange("left", key, value)}
              onShape={(shape) => onEyeShapeChange("left", shape)}
              onCustom={(svg, vb) => onEyeCustomSvgChange("left", svg, vb)}
            />
            <EyeGroupLabel>Right</EyeGroupLabel>
            <EyeGroup
              eye={face.right}
              onEyeChange={(key, value) => onEyeChange("right", key, value)}
              onShape={(shape) => onEyeShapeChange("right", shape)}
              onCustom={(svg, vb) => onEyeCustomSvgChange("right", svg, vb)}
            />
          </>
        )}
      </ControlSection>

      <ControlSection title="Eyebrows">
        <FieldRow>
          <span className="text-[13px] text-white/80">Show eyebrows</span>
          <Toggle
            label="Show eyebrows"
            checked={face.browsEnabled}
            onChange={onToggleBrows}
          />
        </FieldRow>

        {face.browsEnabled &&
          (linked ? (
            <BrowSliders
              brow={face.leftBrow}
              onChange={(key, value) => onBrowChange("both", key, value)}
            />
          ) : (
            <>
              <EyeGroupLabel>Left</EyeGroupLabel>
              <BrowSliders
                brow={face.leftBrow}
                onChange={(key, value) => onBrowChange("left", key, value)}
              />
              <EyeGroupLabel>Right</EyeGroupLabel>
              <BrowSliders
                brow={face.rightBrow}
                onChange={(key, value) => onBrowChange("right", key, value)}
              />
            </>
          ))}
      </ControlSection>

      <ControlSection title="Eye movement" defaultOpen={false}>
        <FieldRow>
          <span className="text-[13px] text-white/80">Track eyes</span>
          <Toggle label="Eye movement" checked={gazeEnabled} onChange={onToggleGaze} />
        </FieldRow>

        {gazeEnabled && (
          <div className={`${ROW_BASE} flex items-center justify-between gap-2 px-3.5`}>
            <button
              type="button"
              onClick={() => onGazeModeChange("cursor")}
              className={`text-[13px] transition-colors ${
                gazeMode === "cursor" ? "text-white" : "text-white/40 hover:text-white/70"
              }`}
            >
              Follow cursor
            </button>
            <Toggle
              label="Switch between follow-cursor and random eye movement"
              checked={gazeMode === "random"}
              onChange={(v) => onGazeModeChange(v ? "random" : "cursor")}
            />
            <button
              type="button"
              onClick={() => onGazeModeChange("random")}
              className={`text-[13px] transition-colors ${
                gazeMode === "random" ? "text-white" : "text-white/40 hover:text-white/70"
              }`}
            >
              Random
            </button>
          </div>
        )}
      </ControlSection>
    </>
  );
}
