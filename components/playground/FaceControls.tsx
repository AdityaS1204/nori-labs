"use client";

import type {
  NoriBrowParams,
  NoriEyeParams,
  NoriFaceParams,
} from "@/lib/nori-face";
import {
  BROW_FIELDS,
  EYE_FIELDS,
  GLOBAL_FIELDS,
  type BrowFieldKey,
  type EyeFieldKey,
  type EyeSide,
  type GlobalFieldKey,
} from "./faceFields";
import NumberSlider from "@/components/controls/NumberSlider";
import ColorField from "@/components/controls/ColorField";
import Toggle from "@/components/controls/Toggle";
import FieldRow from "@/components/controls/FieldRow";
import ControlSection from "@/components/controls/ControlSection";

interface FaceControlsProps {
  face: NoriFaceParams;
  linked: boolean;
  onToggleLink: (value: boolean) => void;
  onGlobalChange: (key: GlobalFieldKey, value: number) => void;
  onColorChange: (value: string) => void;
  onEyeChange: (side: EyeSide, key: EyeFieldKey, value: number) => void;
  onToggleBrows: (value: boolean) => void;
  onBrowChange: (side: EyeSide, key: BrowFieldKey, value: number) => void;
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
  onToggleBrows,
  onBrowChange,
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
          <EyeSliders
            eye={face.left}
            onChange={(key, value) => onEyeChange("both", key, value)}
          />
        ) : (
          <>
            <EyeGroupLabel>Left</EyeGroupLabel>
            <EyeSliders
              eye={face.left}
              onChange={(key, value) => onEyeChange("left", key, value)}
            />
            <EyeGroupLabel>Right</EyeGroupLabel>
            <EyeSliders
              eye={face.right}
              onChange={(key, value) => onEyeChange("right", key, value)}
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
    </>
  );
}
