"use client";

import {
  eyeRenderMode,
  mouthRenderMode,
  MOUTH_SHAPES,
  type EyeShape,
  type MouthShape,
  type NoriBrowParams,
  type EyeShapeDef,
  type NoriEyeParams,
  type NoriFaceParams,
  type NoriMouthParams,
} from "@/lib/nori-face";
import {
  BROW_FIELDS,
  EYE_FIELDS,
  EYE_THICKNESS_FIELD,
  MOUTH_FIELDS,
  MOUTH_THICKNESS_FIELD,
  TWEEN_MS_FIELD,
  globalFieldsFor,
  type BrowFieldKey,
  type EyeFieldKey,
  type EyeSide,
  type GlobalFieldKey,
  type MouthFieldKey,
} from "./faceFields";
import {
  EASINGS,
  UNSUPPORTED_IN_LVGL,
  capabilities,
  droppedShapeIn,
  shapesFor,
  type Easing,
  type RenderConfig,
} from "@/lib/render-target";
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
  /** Target the controls are constrained to, plus its tween settings. */
  render: RenderConfig;
  onRenderChange: (patch: Partial<RenderConfig>) => void;
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
  onToggleMouth: (value: boolean) => void;
  onMouthChange: (key: MouthFieldKey, value: number) => void;
  onMouthShapeChange: (shape: MouthShape) => void;
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

/** The mouth's shape picker, sliders, and (for `arc`) its stroke weight. */
function MouthGroup({
  mouth,
  onChange,
  onShape,
}: {
  mouth: NoriMouthParams;
  onChange: (key: MouthFieldKey, value: number) => void;
  onShape: (shape: MouthShape) => void;
}) {
  const weightShown = mouthRenderMode(mouth.shape) === "stroke";
  return (
    <>
      <ShapePicker shape={mouth.shape} shapes={MOUTH_SHAPES} onPick={onShape} />
      {MOUTH_FIELDS.map((f) => (
        <NumberSlider
          key={f.key}
          label={f.label}
          value={mouth[f.key]}
          min={f.min}
          max={f.max}
          step={f.step}
          unit={f.unit}
          format={f.format}
          onChange={(v) => onChange(f.key, v)}
        />
      ))}
      {weightShown && (
        <NumberSlider
          label={MOUTH_THICKNESS_FIELD.label}
          value={mouth.thickness}
          min={MOUTH_THICKNESS_FIELD.min}
          max={MOUTH_THICKNESS_FIELD.max}
          step={MOUTH_THICKNESS_FIELD.step}
          onChange={(v) => onChange("thickness", v)}
        />
      )}
    </>
  );
}

function EyeGroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-1 pt-1 text-[11px] font-semibold tracking-[0.1em] text-white/30">
      {children}
    </span>
  );
}

/** A row of glyph buttons for choosing a silhouette (eye or mouth). */
function ShapePicker<T extends string>({
  shape,
  shapes,
  onPick,
}: {
  shape: T;
  shapes: { id: T; label: string; mode: "fill" | "stroke"; glyph: string }[];
  onPick: (shape: T) => void;
}) {
  return (
    <div className={`${ROW_BASE} flex items-center gap-1 px-2`}>
      {shapes.map((s) => {
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
  shapes,
  customSvgAllowed,
  onEyeChange,
  onShape,
  onCustom,
}: {
  eye: NoriEyeParams;
  shapes: EyeShapeDef[];
  customSvgAllowed: boolean;
  onEyeChange: (key: EyeFieldKey, value: number) => void;
  onShape: (shape: EyeShape) => void;
  onCustom: (svg: string, viewBox?: [number, number, number, number]) => void;
}) {
  // An unsupported shape (a pasted SVG in LVGL mode) reads as the bar the
  // preview and the export fall back to, so the picker cannot show nothing.
  const authored = eye.shape ?? "bar";
  const shape = shapes.some((s) => s.id === authored) ? authored : "bar";
  const isCustom = shape === "custom" && customSvgAllowed;
  const strokeWeightShown = eyeRenderMode(shape) === "stroke";
  return (
    <>
      <ShapePicker shape={shape} shapes={shapes} onPick={onShape} />
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

const EASE_LABEL: Record<Easing, string> = {
  linear: "Linear",
  easeIn: "In",
  easeOut: "Out",
  easeInOut: "In-out",
};

/** Four-way easing picker for the LVGL tween. */
function EasingPicker({
  ease,
  onPick,
}: {
  ease: Easing;
  onPick: (ease: Easing) => void;
}) {
  return (
    <div className={`${ROW_BASE} flex items-center gap-1 px-2`}>
      {EASINGS.map((e) => {
        const active = e === ease;
        return (
          <button
            key={e}
            type="button"
            onClick={() => onPick(e)}
            aria-pressed={active}
            className={`h-7 flex-1 rounded-md text-[11px] font-medium transition-colors ${
              active
                ? "bg-[#E8BE3C]/15 text-[#E8BE3C]"
                : "text-white/50 hover:bg-white/[0.06] hover:text-white/80"
            }`}
          >
            {EASE_LABEL[e]}
          </button>
        );
      })}
    </div>
  );
}

/**
 * What LVGL mode leaves out, stated plainly, plus a pointed line when a shape
 * the device cannot rasterise has been replaced — so the changed preview reads
 * as a constraint rather than a bug.
 */
function LvglNotice({ droppedShape }: { droppedShape: string | null }) {
  return (
    <div className="rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[11px] leading-snug">
      <span className="text-white/55">LVGL mode: shapes, colour and tweens only.</span>
      <span className="mt-0.5 block text-white/35">
        No {UNSUPPORTED_IN_LVGL.join(", ")}. ~{capabilities("lvgl").fps}fps on the device.
      </span>
      {droppedShape && (
        <span className="mt-1.5 block text-[#E8BE3C]/90">
          {droppedShape} eyes fall back to a bar here and on export.
        </span>
      )}
    </div>
  );
}

/**
 * Face-specific panel body: a Screen group and an Eyes group built from the
 * generic control kit. "Link eyes" edits both together; unlink to pose them
 * separately.
 *
 * Every control is gated on what `render.target` can draw, so LVGL mode offers
 * no parameter the robot would silently ignore.
 */
export default function FaceControls({
  face,
  render,
  onRenderChange,
  linked,
  onToggleLink,
  onGlobalChange,
  onColorChange,
  onEyeChange,
  onEyeShapeChange,
  onEyeCustomSvgChange,
  onToggleBrows,
  onBrowChange,
  onToggleMouth,
  onMouthChange,
  onMouthShapeChange,
  gazeEnabled,
  gazeMode,
  onToggleGaze,
  onGazeModeChange,
}: FaceControlsProps) {
  const caps = capabilities(render.target);
  const shapes = shapesFor(render.target);
  const eyeGroupProps = { shapes, customSvgAllowed: caps.customSvg };

  return (
    <>
      {render.target === "lvgl" && (
        <LvglNotice droppedShape={droppedShapeIn(face, "lvgl")} />
      )}

      <ControlSection title="Screen">
        <ColorField label="Eye color" value={face.color} onChange={onColorChange} />
        {globalFieldsFor(render.target).map((f) => (
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
            {...eyeGroupProps}
            onEyeChange={(key, value) => onEyeChange("both", key, value)}
            onShape={(shape) => onEyeShapeChange("both", shape)}
            onCustom={(svg, vb) => onEyeCustomSvgChange("both", svg, vb)}
          />
        ) : (
          <>
            <EyeGroupLabel>Left</EyeGroupLabel>
            <EyeGroup
              eye={face.left}
              {...eyeGroupProps}
              onEyeChange={(key, value) => onEyeChange("left", key, value)}
              onShape={(shape) => onEyeShapeChange("left", shape)}
              onCustom={(svg, vb) => onEyeCustomSvgChange("left", svg, vb)}
            />
            <EyeGroupLabel>Right</EyeGroupLabel>
            <EyeGroup
              eye={face.right}
              {...eyeGroupProps}
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

      <ControlSection title="Mouth">
        <FieldRow>
          <span className="text-[13px] text-white/80">Show mouth</span>
          <Toggle
            label="Show mouth"
            checked={face.mouthEnabled}
            onChange={onToggleMouth}
          />
        </FieldRow>

        {face.mouthEnabled && (
          <MouthGroup
            mouth={face.mouth}
            onChange={onMouthChange}
            onShape={onMouthShapeChange}
          />
        )}
      </ControlSection>

      {!caps.spring && (
        <ControlSection title="Transition">
          <NumberSlider
            label={TWEEN_MS_FIELD.label}
            value={render.durationMs}
            min={TWEEN_MS_FIELD.min}
            max={TWEEN_MS_FIELD.max}
            step={TWEEN_MS_FIELD.step}
            unit={TWEEN_MS_FIELD.unit}
            onChange={(v) => onRenderChange({ durationMs: v })}
          />
          <EasingPicker ease={render.ease} onPick={(ease) => onRenderChange({ ease })} />
        </ControlSection>
      )}

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
