"use client";

import { useRef, useState } from "react";
import { ROW_BASE } from "./FieldRow";
import ColorPicker from "./ColorPicker";

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

/**
 * A row with a hex value and a swatch. Clicking the swatch opens a custom
 * colour picker (no native browser picker), styled to match the sidebar.
 */
export default function ColorField({ label, value, onChange }: ColorFieldProps) {
  const [open, setOpen] = useState(false);
  const swatchRef = useRef<HTMLButtonElement>(null);

  return (
    <div className={`${ROW_BASE} flex items-center justify-between px-3.5`}>
      <label className="text-[13px] text-white/80">{label}</label>
      <div className="flex items-center gap-2.5">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} hex value`}
          spellCheck={false}
          className="w-[72px] bg-transparent text-right text-[13px] tabular-nums text-white/95 focus:outline-none"
        />
        <button
          ref={swatchRef}
          type="button"
          aria-label={`Edit ${label}`}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="h-5 w-5 rounded-[5px] ring-1 ring-white/15 transition-shadow hover:ring-white/35"
          style={{ background: value }}
        />
      </div>

      {open && (
        <ColorPicker
          value={value}
          onChange={onChange}
          anchorRef={swatchRef}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
