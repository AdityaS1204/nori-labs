"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { useLabActions } from "@/components/playground/LabActionsProvider";

type ExportStatus = "idle" | "done" | "failed";

const LABEL: Record<ExportStatus, string> = {
  idle: "Export",
  done: "Exported",
  failed: "Export failed",
};

function ExportButton() {
  const { exportPack } = useLabActions();
  const [status, setStatus] = useState<ExportStatus>("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onClick = useCallback(() => {
    if (!exportPack) return;
    setStatus(exportPack() ? "done" : "failed");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 1600);
  }, [exportPack]);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!exportPack}
      title="Download this face as a .nori.json pack for the Python SDK"
      className={`px-3 py-1.5 text-[12px] font-medium tracking-[0.03em] rounded-md transition-[color,background] duration-150 disabled:opacity-40 ${
        status === "failed"
          ? "text-[#ff8f8f]"
          : status === "done"
            ? "text-[#E8BE3C]"
            : "text-white/50 hover:text-white hover:bg-white/[0.06]"
      }`}
    >
      {LABEL[status]}
    </button>
  );
}

export default function LabNav() {
  return (
    <header className="h-[52px] flex items-center justify-between px-5 border-b border-white/[0.07] bg-[#0d0d0e] flex-shrink-0">
      {/* Left: logo + breadcrumb */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 no-underline text-white/60 hover:text-white transition-colors duration-150">
          <svg className="w-5 h-5" viewBox="0 0 30 30" fill="none" aria-hidden="true">
            <rect x="0.75" y="0.75" width="28.5" height="28.5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" />
            <path d="M6 24V12.5L15 7.5L24 12.5V24" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M11 24V17.5H19V24" stroke="#E8BE3C" strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="15" cy="11.5" r="1.5" fill="currentColor" />
          </svg>
          <span className="text-[13px] font-medium tracking-[0.02em]">nori</span>
        </Link>
        <span className="text-white/20 text-[13px]">/</span>
        <span className="text-[13px] font-medium text-white/90 tracking-[0.02em]">Expression Lab</span>
        <span className="ml-1 px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] uppercase bg-[#E8BE3C]/15 text-[#E8BE3C] rounded-full border border-[#E8BE3C]/20">
          Beta
        </span>
      </div>

      {/* Right: actions. Saving lives in the editor's own toolbar. */}
      <div className="flex items-center gap-2">
        <ExportButton />
      </div>
    </header>
  );
}
