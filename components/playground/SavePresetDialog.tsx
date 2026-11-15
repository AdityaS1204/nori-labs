"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, FloppyDiskIcon } from "@hugeicons/core-free-icons";

import NoriFace from "@/components/robot-face/NoriFace";
import type { Author, Preset } from "@/lib/presets";

export interface SavePresetMeta {
  name: string;
  description: string;
  author: Author;
  category?: string;
}

interface SavePresetDialogProps {
  preset: Preset;
  onClose: () => void;
  onSubmit: (meta: SavePresetMeta) => void;
  submitting: boolean;
  error: string | null;
  /**
   * True when the preset was opened from the library (a remix). Saving always
   * creates a *new* preset — never edits the original — so in this mode the
   * author fields start blank (the remixer enters their own name) and the title
   * is seeded as a remix, so a remix is never published under the original
   * maker's name.
   */
  isRemix?: boolean;
}

/** Modal that captures preset metadata and publishes the bundle to the library. */
export default function SavePresetDialog({
  preset,
  onClose,
  onSubmit,
  submitting,
  error,
  isRemix = false,
}: SavePresetDialogProps) {
  const [name, setName] = useState(
    isRemix && preset.name ? `${preset.name} (remix)` : preset.name,
  );
  const [description, setDescription] = useState(preset.description);
  // A remix is the remixer's own preset — don't inherit the original author.
  const [authorName, setAuthorName] = useState(isRemix ? "" : preset.author.name);
  const [authorHandle, setAuthorHandle] = useState(
    isRemix ? "" : preset.author.handle ?? "",
  );
  const [category, setCategory] = useState(preset.category ?? "");
  const reduce = useReducedMotion();
  const EASE = [0.23, 1, 0.32, 1] as const;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, submitting]);

  const canSubmit = name.trim() && authorName.trim() && !submitting;

  const submit = () => {
    if (!canSubmit) return;
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      author: {
        name: authorName.trim(),
        handle: authorHandle.trim() || undefined,
      },
      category: category.trim() || undefined,
    });
  };

  const field =
    "h-10 w-full rounded-lg bg-white/[0.05] px-3 text-[13px] text-white/90 placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#E8BE3C]/50";
  const labelCls = "mb-1.5 block text-[12px] font-medium text-white/55";

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Save preset"
    >
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => !submitting && onClose()}
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: EASE }}
      />

      <motion.div
        className="relative z-10 flex max-h-[90vh] w-full max-w-[460px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1a1a1c] shadow-[0_24px_70px_rgba(0,0,0,0.6)]"
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 6 }}
        transition={{ duration: 0.22, ease: EASE }}
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <h2 className="text-[16px] font-semibold text-white">
            {isRemix ? "Save your remix" : "Save to library"}
          </h2>
          <button
            type="button"
            onClick={() => !submitting && onClose()}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-lg text-white/45 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} color="currentColor" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 [scrollbar-width:thin]">
          {isRemix && (
            <p className="mb-4 rounded-lg border border-[#E8BE3C]/20 bg-[#E8BE3C]/[0.06] px-3 py-2 text-[12px] leading-relaxed text-white/60">
              This saves a <span className="text-white/85">new preset under your name</span>.
              {preset.author.name
                ? ` The original by ${preset.author.name} stays unchanged.`
                : " The original preset stays unchanged."}
            </p>
          )}

          {/* State previews */}
          <p className={labelCls}>
            {preset.states.length}{" "}
            {preset.states.length === 1 ? "state" : "states"} in this preset
          </p>
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {preset.states.map((s) => (
              <div
                key={s.id}
                className={`flex flex-shrink-0 flex-col items-center gap-1 rounded-lg border p-1.5 ${
                  s.id === preset.coverStateId
                    ? "border-[#E8BE3C]/40 bg-[#E8BE3C]/[0.06]"
                    : "border-white/[0.07] bg-black/40"
                }`}
              >
                <div className="grid h-[52px] w-[72px] place-items-center overflow-hidden rounded bg-black">
                  <NoriFace face={s.face} width={72} />
                </div>
                <span className="max-w-[72px] truncate text-[10px] text-white/55">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label className={labelCls} htmlFor="preset-name">
                Preset name
              </label>
              <input
                id="preset-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Friendly companion"
                className={field}
                autoFocus
              />
            </div>

            <div>
              <label className={labelCls} htmlFor="preset-desc">
                Description
              </label>
              <textarea
                id="preset-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this set of expressions for?"
                rows={2}
                className={`${field} h-auto resize-none py-2 leading-relaxed`}
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className={labelCls} htmlFor="preset-author">
                  Your name
                </label>
                <input
                  id="preset-author"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Jane Doe"
                  className={field}
                />
              </div>
              <div className="flex-1">
                <label className={labelCls} htmlFor="preset-handle">
                  Handle <span className="text-white/25">(optional)</span>
                </label>
                <input
                  id="preset-handle"
                  value={authorHandle}
                  onChange={(e) => setAuthorHandle(e.target.value)}
                  placeholder="jane"
                  className={field}
                />
              </div>
            </div>

            <div>
              <label className={labelCls} htmlFor="preset-category">
                Category <span className="text-white/25">(optional)</span>
              </label>
              <input
                id="preset-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Playful"
                className={field}
              />
            </div>
          </div>

          {error && (
            <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-white/[0.06] px-5 py-4">
          <button
            type="button"
            onClick={() => !submitting && onClose()}
            className="rounded-lg px-4 py-2 text-[13px] font-medium text-white/60 transition-colors hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#E8BE3C] px-4 py-2 text-[13px] font-semibold text-[#0d0d0e] transition-[box-shadow,transform,opacity] hover:shadow-[0_0_0_1px_#E8BE3C,0_4px_16px_rgba(232,190,60,0.25)] disabled:pointer-events-none disabled:opacity-40 motion-safe:active:scale-[0.97]"
          >
            <HugeiconsIcon icon={FloppyDiskIcon} size={15} color="currentColor" />
            {submitting ? "Saving…" : "Save to library"}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
