"use client";

import { useCallback, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { RefreshIcon, Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";

import { NEUTRAL_FACE, type NoriFaceParams } from "@/lib/nori-face";
import type {
  BrowFieldKey,
  EyeFieldKey,
  EyeSide,
  GlobalFieldKey,
} from "./faceFields";
import ControlPanel from "@/components/controls/ControlPanel";
import FaceControls from "./FaceControls";
import NoriFaceLive from "@/components/robot-face/NoriFaceLive";

const cloneFace = (f: NoriFaceParams): NoriFaceParams => ({
  ...f,
  left: { ...f.left },
  right: { ...f.right },
  leftBrow: { ...f.leftBrow },
  rightBrow: { ...f.rightBrow },
});

interface ExpressionEditorProps {
  /** Starting face; defaults to the robot's neutral expression. */
  initial?: NoriFaceParams;
  /** Display name shown in the toolbar. */
  name?: string;
}

/**
 * The playground: owns the live `NoriFaceParams` state, renders the DialKit-
 * style control panel (left) and the Motion-animated face on the preview
 * canvas (right).
 */
export default function ExpressionEditor({
  initial = NEUTRAL_FACE,
  name = "Neutral",
}: ExpressionEditorProps) {
  const [face, setFace] = useState<NoriFaceParams>(() => cloneFace(initial));
  const [linked, setLinked] = useState(true);
  const [copied, setCopied] = useState(false);

  const onGlobalChange = useCallback((key: GlobalFieldKey, value: number) => {
    setFace((f) => ({ ...f, [key]: value }));
  }, []);

  const onColorChange = useCallback((value: string) => {
    setFace((f) => ({ ...f, color: value }));
  }, []);

  const onEyeChange = useCallback(
    (side: EyeSide, key: EyeFieldKey, value: number) => {
      setFace((f) => ({
        ...f,
        left: side === "right" ? f.left : { ...f.left, [key]: value },
        right: side === "left" ? f.right : { ...f.right, [key]: value },
      }));
    },
    [],
  );

  const onToggleBrows = useCallback((value: boolean) => {
    setFace((f) => ({ ...f, browsEnabled: value }));
  }, []);

  const onBrowChange = useCallback(
    (side: EyeSide, key: BrowFieldKey, value: number) => {
      setFace((f) => ({
        ...f,
        leftBrow:
          side === "right" ? f.leftBrow : { ...f.leftBrow, [key]: value },
        rightBrow:
          side === "left" ? f.rightBrow : { ...f.rightBrow, [key]: value },
      }));
    },
    [],
  );

  const reset = useCallback(() => {
    setFace(cloneFace(NEUTRAL_FACE));
    setLinked(true);
  }, []);

  const copyValues = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(face, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard may be unavailable */
    }
  }, [face]);

  const toolbar = (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={reset}
        aria-label="Reset to neutral"
        title="Reset to neutral"
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[9px] bg-white/[0.05] text-white/55 transition-colors hover:bg-white/[0.09] hover:text-white"
      >
        <HugeiconsIcon icon={RefreshIcon} size={16} color="currentColor" />
      </button>
      <div className="flex h-9 flex-1 items-center justify-center rounded-[9px] bg-white/[0.05] px-3">
        <span className="truncate text-[13px] font-medium text-white/85">
          {name}
        </span>
      </div>
      <button
        type="button"
        onClick={copyValues}
        aria-label="Copy parameters"
        title="Copy parameters as JSON"
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[9px] bg-white/[0.05] text-white/55 transition-colors hover:bg-white/[0.09] hover:text-white"
      >
        <HugeiconsIcon
          icon={copied ? Tick02Icon : Copy01Icon}
          size={16}
          color={copied ? "#E8BE3C" : "currentColor"}
        />
      </button>
    </div>
  );

  return (
    <div className="flex h-full gap-3 overflow-hidden p-3">
      {/* ── Control panel ── */}
      <aside className="w-[300px] flex-shrink-0">
        <ControlPanel title="Expression" toolbar={toolbar}>
          <FaceControls
            face={face}
            linked={linked}
            onToggleLink={setLinked}
            onGlobalChange={onGlobalChange}
            onColorChange={onColorChange}
            onEyeChange={onEyeChange}
            onToggleBrows={onToggleBrows}
            onBrowChange={onBrowChange}
          />
        </ControlPanel>
      </aside>

      {/* ── Preview canvas (the robot's screen) ── */}
      <main
        className="flex flex-1 flex-col overflow-hidden rounded-xl border border-white/[0.07] bg-black"
        style={{ paddingTop: 0 }}
      >
        <div className="flex flex-shrink-0 items-center border-b border-white/[0.06] px-4 py-2.5">
          <span className="text-[11px] font-semibold tracking-[0.08em] text-white/35">
            Preview
          </span>
        </div>
        <div className="min-h-0 flex-1 bg-black p-4">
          <NoriFaceLive face={face} className="h-full w-full" />
        </div>
      </main>
    </div>
  );
}
