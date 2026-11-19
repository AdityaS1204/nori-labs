"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { RefreshIcon, Copy01Icon, Tick02Icon, FloppyDiskIcon } from "@hugeicons/core-free-icons";

import { type EyeShape, type NoriFaceParams } from "@/lib/nori-face";
import {
  clonePreset,
  coverState,
  newPreset,
  newState,
  type Preset,
} from "@/lib/presets";
import { packFileName, presetToPack } from "@/lib/face-pack";
import { createPreset } from "@/lib/presets-create";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLabActions } from "@/components/playground/LabActionsProvider";
import { clearDraft, readDraft, stashDraft } from "@/lib/preset-draft";
import type {
  BrowFieldKey,
  EyeFieldKey,
  EyeSide,
  GlobalFieldKey,
} from "./faceFields";
import ControlPanel from "@/components/controls/ControlPanel";
import FaceControls from "./FaceControls";
import StatePicker from "./StatePicker";
import SavePresetDialog, { type SavePresetMeta } from "./SavePresetDialog";
import NoriFaceLive, { type GazeMode } from "@/components/robot-face/NoriFaceLive";

interface ExpressionEditorProps {
  /** Opens an existing preset for remixing; defaults to a fresh draft. */
  initialPreset?: Preset;
}

/**
 * The playground. Owns a whole `Preset` — a bundle of named expression states
 * — and edits one active state at a time with the control kit, while the
 * Motion-animated face previews it. The active state is chosen from the
 * `StatePicker` dropdown; the bundle is published to the library via the save
 * dialog.
 */
export default function ExpressionEditor({ initialPreset }: ExpressionEditorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();

  const [preset, setPreset] = useState<Preset>(() =>
    initialPreset ? clonePreset(initialPreset) : newPreset(),
  );
  const [activeId, setActiveId] = useState<string>(() =>
    initialPreset ? initialPreset.states[0].id : preset.states[0].id,
  );
  const [linked, setLinked] = useState(true);
  const [copied, setCopied] = useState(false);

  // Eye-movement preview mode (not part of the saved face).
  const [gazeMode, setGazeMode] = useState<GazeMode>("off");
  const [lastGaze, setLastGaze] = useState<Exclude<GazeMode, "off">>("cursor");
  const toggleGaze = useCallback(
    (on: boolean) => setGazeMode(on ? lastGaze : "off"),
    [lastGaze],
  );
  const changeGazeMode = useCallback((mode: Exclude<GazeMode, "off">) => {
    setLastGaze(mode);
    setGazeMode(mode);
  }, []);

  const [saveOpen, setSaveOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const active = useMemo(
    () => preset.states.find((s) => s.id === activeId) ?? preset.states[0],
    [preset.states, activeId],
  );

  /* Resume after the login detour: if a draft was stashed when a signed-out
     user hit Save, restore the exact preset they were editing (once we know
     they're signed in) and reopen the Save dialog. */
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current || authLoading || !user) return;
    const draft = readDraft();
    if (!draft) return;
    restoredRef.current = true;
    clearDraft();
    // Restoring persisted work once auth resolves is exactly what this effect
    // is for; the setState calls run at most once (guarded by restoredRef).
    /* eslint-disable react-hooks/set-state-in-effect */
    setPreset(draft.preset);
    setActiveId(draft.activeId);
    if (draft.wantSave) {
      setSaveError(null);
      setSaveOpen(true);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [authLoading, user]);

  /* Save is gated: signed-out users stash their work and go to /login, then
     land back here (?next=) where the effect above restores and resumes. */
  const requestSave = useCallback(() => {
    if (!user) {
      stashDraft(preset, activeId);
      router.push(`/login?next=${encodeURIComponent(pathname ?? "/lab")}`);
      return;
    }
    setSaveError(null);
    setSaveOpen(true);
  }, [user, preset, activeId, router, pathname]);

  /* ── Face edits (write into the active state's face) ── */
  const patchFace = useCallback(
    (patch: (f: NoriFaceParams) => NoriFaceParams) => {
      setPreset((p) => ({
        ...p,
        states: p.states.map((s) =>
          s.id === activeId ? { ...s, face: patch(s.face) } : s,
        ),
      }));
    },
    [activeId],
  );

  const onGlobalChange = useCallback(
    (key: GlobalFieldKey, value: number) =>
      patchFace((f) => ({ ...f, [key]: value })),
    [patchFace],
  );
  const onColorChange = useCallback(
    (value: string) => patchFace((f) => ({ ...f, color: value })),
    [patchFace],
  );
  const onEyeChange = useCallback(
    (side: EyeSide, key: EyeFieldKey, value: number) =>
      patchFace((f) => ({
        ...f,
        left: side === "right" ? f.left : { ...f.left, [key]: value },
        right: side === "left" ? f.right : { ...f.right, [key]: value },
      })),
    [patchFace],
  );
  const onEyeShapeChange = useCallback(
    (side: EyeSide, shape: EyeShape) =>
      patchFace((f) => ({
        ...f,
        left: side === "right" ? f.left : { ...f.left, shape },
        right: side === "left" ? f.right : { ...f.right, shape },
      })),
    [patchFace],
  );
  const onEyeCustomSvgChange = useCallback(
    (
      side: EyeSide,
      customSvg: string,
      customViewBox?: [number, number, number, number],
    ) =>
      patchFace((f) => ({
        ...f,
        left: side === "right" ? f.left : { ...f.left, customSvg, customViewBox },
        right: side === "left" ? f.right : { ...f.right, customSvg, customViewBox },
      })),
    [patchFace],
  );

  const onToggleBrows = useCallback(
    (value: boolean) => patchFace((f) => ({ ...f, browsEnabled: value })),
    [patchFace],
  );
  const onBrowChange = useCallback(
    (side: EyeSide, key: BrowFieldKey, value: number) =>
      patchFace((f) => ({
        ...f,
        leftBrow:
          side === "right" ? f.leftBrow : { ...f.leftBrow, [key]: value },
        rightBrow:
          side === "left" ? f.rightBrow : { ...f.rightBrow, [key]: value },
      })),
    [patchFace],
  );

  /* ── State (bundle) management ── */
  const addState = useCallback((label: string) => {
    const s = newState(label);
    setPreset((p) => ({ ...p, states: [...p.states, s] }));
    setActiveId(s.id);
  }, []);

  const renameState = useCallback((id: string, label: string) => {
    setPreset((p) => ({
      ...p,
      states: p.states.map((s) => (s.id === id ? { ...s, label } : s)),
    }));
  }, []);

  const removeState = useCallback(
    (id: string) => {
      setPreset((p) => {
        if (p.states.length <= 1) return p;
        const states = p.states.filter((s) => s.id !== id);
        const coverStateId =
          p.coverStateId === id ? states[0].id : p.coverStateId;
        return { ...p, states, coverStateId };
      });
      setActiveId((cur) => {
        if (cur !== id) return cur;
        const rest = preset.states.filter((s) => s.id !== id);
        return rest[0]?.id ?? cur;
      });
    },
    [preset.states],
  );

  const setCover = useCallback(
    (id: string) => setPreset((p) => ({ ...p, coverStateId: id })),
    [],
  );

  const moveState = useCallback((id: string, dir: -1 | 1) => {
    setPreset((p) => {
      const i = p.states.findIndex((s) => s.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= p.states.length) return p;
      const states = [...p.states];
      [states[i], states[j]] = [states[j], states[i]];
      return { ...p, states };
    });
  }, []);

  /* ── Toolbar actions ── */
  const resetActive = useCallback(() => {
    const fresh = newState(active.label).face;
    patchFace(() => fresh);
    setLinked(true);
  }, [active.label, patchFace]);

  /* Download the whole bundle as a face pack for the robot SDK. The clipboard
     copy below is a different affordance: one state's raw parameters. */
  const exportPack = useCallback((): boolean => {
    try {
      const pack = presetToPack(preset);
      const blob = new Blob([JSON.stringify(pack, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${packFileName(pack.name)}.nori.json`;
      a.click();
      // Revoking synchronously races the download, which may not have read the blob yet.
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      return true;
    } catch (err) {
      console.error("Face pack export failed", err);
      return false;
    }
  }, [preset]);

  const { registerExport } = useLabActions();
  useEffect(() => {
    registerExport(exportPack);
    return () => registerExport(null);
  }, [registerExport, exportPack]);

  const copyValues = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(active.face, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard may be unavailable */
    }
  }, [active.face]);

  const handleSubmit = useCallback(
    async (meta: SavePresetMeta) => {
      setSaving(true);
      setSaveError(null);
      try {
        await createPreset({
          name: meta.name,
          description: meta.description,
          author: meta.author,
          category: meta.category,
          states: preset.states,
          coverStateId: preset.coverStateId,
          accent: coverState(preset).face.color,
          render: preset.render,
          isPublic: meta.isPublic,
        });
        setSaveOpen(false);
        router.push("/library");
        router.refresh();
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : "Could not save.");
      } finally {
        setSaving(false);
      }
    },
    [preset, router],
  );

  const toolbar = (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={resetActive}
          aria-label="Reset this state to neutral"
          title="Reset this state to neutral"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[9px] bg-white/[0.05] text-white/55 transition-colors hover:bg-white/[0.09] hover:text-white"
        >
          <HugeiconsIcon icon={RefreshIcon} size={16} color="currentColor" />
        </button>

        <StatePicker
          states={preset.states}
          activeId={activeId}
          coverStateId={preset.coverStateId}
          onSelect={setActiveId}
          onAdd={addState}
          onRename={renameState}
          onRemove={removeState}
          onSetCover={setCover}
          onMove={moveState}
        />

        <button
          type="button"
          onClick={copyValues}
          aria-label="Copy this state's parameters"
          title="Copy this state's parameters as JSON"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[9px] bg-white/[0.05] text-white/55 transition-colors hover:bg-white/[0.09] hover:text-white"
        >
          <HugeiconsIcon
            icon={copied ? Tick02Icon : Copy01Icon}
            size={16}
            color={copied ? "#E8BE3C" : "currentColor"}
          />
        </button>
      </div>

      <button
        type="button"
        onClick={requestSave}
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[9px] bg-[#E8BE3C] text-[13px] font-semibold text-[#0d0d0e] transition-[box-shadow,transform] hover:shadow-[0_0_0_1px_#E8BE3C,0_4px_16px_rgba(232,190,60,0.25)] motion-safe:active:scale-[0.99]"
      >
        <HugeiconsIcon icon={FloppyDiskIcon} size={15} color="currentColor" />
        Save to library
      </button>
    </div>
  );

  return (
    <div className="flex h-full gap-3 overflow-hidden p-3">
      {/* ── Control panel ── */}
      <aside className="w-[300px] flex-shrink-0">
        <ControlPanel title="Expression" toolbar={toolbar}>
          <FaceControls
            face={active.face}
            linked={linked}
            onToggleLink={setLinked}
            onGlobalChange={onGlobalChange}
            onColorChange={onColorChange}
            onEyeChange={onEyeChange}
            onEyeShapeChange={onEyeShapeChange}
            onEyeCustomSvgChange={onEyeCustomSvgChange}
            onToggleBrows={onToggleBrows}
            onBrowChange={onBrowChange}
            gazeEnabled={gazeMode !== "off"}
            gazeMode={gazeMode === "off" ? lastGaze : gazeMode}
            onToggleGaze={toggleGaze}
            onGazeModeChange={changeGazeMode}
          />
        </ControlPanel>
      </aside>

      {/* ── Preview canvas (the robot's screen) ── */}
      <main
        className="flex flex-1 flex-col overflow-hidden rounded-xl border border-white/[0.07] bg-black"
        style={{ paddingTop: 0 }}
      >
        <div className="flex flex-shrink-0 items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
          <span className="text-[11px] font-semibold tracking-[0.08em] text-white/35">
            Preview
          </span>
          <span className="text-[11px] font-medium text-white/40">
            {active.label}
          </span>
        </div>
        <div className="min-h-0 flex-1 bg-black p-4">
          <NoriFaceLive
            face={active.face}
            gazeMode={gazeMode}
            className="h-full w-full"
          />
        </div>
      </main>

      <AnimatePresence>
        {saveOpen && (
          <SavePresetDialog
            preset={preset}
            onClose={() => setSaveOpen(false)}
            onSubmit={handleSubmit}
            submitting={saving}
            error={saveError}
            isRemix={Boolean(initialPreset)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
