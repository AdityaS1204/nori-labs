"use client";

import { useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Delete02Icon,
  ImageIcon,
  PencilEdit02Icon,
  PlusSignIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";

import Dropdown from "@/components/controls/Dropdown";
import { SUGGESTED_LABELS, type ExpressionState } from "@/lib/presets";

interface StatePickerProps {
  states: ExpressionState[];
  activeId: string;
  coverStateId: string;
  onSelect: (id: string) => void;
  onAdd: (label: string) => void;
  onRename: (id: string, label: string) => void;
  onRemove: (id: string) => void;
  onSetCover: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
}

const iconBtn =
  "grid h-6 w-6 flex-shrink-0 place-items-center rounded-md text-white/45 transition-colors hover:bg-white/[0.08] hover:text-white disabled:pointer-events-none disabled:opacity-25";

/**
 * The toolbar dropdown that replaces the static state pill. Shows the active
 * state's label; opens a menu to switch, rename, reorder, delete, choose the
 * cover, and add states (suggested or custom).
 */
export default function StatePicker({
  states,
  activeId,
  coverStateId,
  onSelect,
  onAdd,
  onRename,
  onRemove,
  onSetCover,
  onMove,
}: StatePickerProps) {
  const [open, setOpen] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState("");
  const [custom, setCustom] = useState("");
  const anchorRef = useRef<HTMLButtonElement>(null);

  const active = states.find((s) => s.id === activeId) ?? states[0];
  const canDelete = states.length > 1;

  const startRename = (s: ExpressionState) => {
    setRenamingId(s.id);
    setRenameText(s.label);
  };
  const commitRename = () => {
    if (renamingId) {
      const label = renameText.trim();
      if (label) onRename(renamingId, label);
    }
    setRenamingId(null);
  };

  const addCustom = () => {
    const label = custom.trim();
    if (!label) return;
    onAdd(label);
    setCustom("");
  };

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 min-w-0 flex-1 items-center justify-between gap-2 rounded-[9px] bg-white/[0.05] px-3 transition-colors hover:bg-white/[0.08]"
      >
        <span className="truncate text-[13px] font-medium text-white/85">
          {active?.label ?? "State"}
        </span>
        <span className="flex flex-shrink-0 items-center gap-1.5 text-white/40">
          <span className="text-[11px] tabular-nums">{states.length}</span>
          <span
            className="transition-transform duration-200"
            style={{ transform: open ? "rotate(180deg)" : "none" }}
            aria-hidden="true"
          >
            <HugeiconsIcon icon={ArrowDown01Icon} size={15} color="currentColor" />
          </span>
        </span>
      </button>

      {open && (
        <Dropdown
          anchorRef={anchorRef}
          onClose={() => {
            setOpen(false);
            setRenamingId(null);
          }}
          width={300}
          label="Expression states"
        >
          <div className="max-h-[240px] overflow-y-auto [scrollbar-width:thin]">
            {states.map((s, i) => {
              const isActive = s.id === activeId;
              const isCover = s.id === coverStateId;

              if (renamingId === s.id) {
                return (
                  <div key={s.id} className="px-1 py-0.5">
                    <input
                      autoFocus
                      value={renameText}
                      onChange={(e) => setRenameText(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename();
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                      aria-label="Rename state"
                      className="h-8 w-full rounded-lg bg-white/[0.06] px-2.5 text-[13px] text-white/90 focus:outline-none focus:ring-1 focus:ring-[#E8BE3C]/50"
                    />
                  </div>
                );
              }

              return (
                <div
                  key={s.id}
                  className={`group flex items-center gap-0.5 rounded-lg px-1 ${
                    isActive ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"
                  }`}
                >
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={isActive}
                    onClick={() => {
                      onSelect(s.id);
                      setOpen(false);
                    }}
                    className="flex min-w-0 flex-1 items-center gap-2 py-2 pl-1.5 text-left"
                  >
                    <span className="flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center text-[#E8BE3C]">
                      {isActive && (
                        <HugeiconsIcon icon={Tick02Icon} size={13} color="currentColor" />
                      )}
                    </span>
                    <span className="truncate text-[13px] text-white/85">{s.label}</span>
                    {isCover && (
                      <span
                        className="flex-shrink-0 text-[#E8BE3C]/80"
                        title="Cover"
                        aria-label="Cover state"
                      >
                        <HugeiconsIcon icon={ImageIcon} size={12} color="currentColor" />
                      </span>
                    )}
                  </button>

                  <div className="flex items-center opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                    <button
                      type="button"
                      className={iconBtn}
                      disabled={i === 0}
                      onClick={() => onMove(s.id, -1)}
                      aria-label="Move up"
                      title="Move up"
                    >
                      <HugeiconsIcon icon={ArrowUp01Icon} size={13} color="currentColor" />
                    </button>
                    <button
                      type="button"
                      className={iconBtn}
                      disabled={i === states.length - 1}
                      onClick={() => onMove(s.id, 1)}
                      aria-label="Move down"
                      title="Move down"
                    >
                      <HugeiconsIcon icon={ArrowDown01Icon} size={13} color="currentColor" />
                    </button>
                    <button
                      type="button"
                      className={iconBtn}
                      onClick={() => onSetCover(s.id)}
                      aria-label="Set as cover"
                      title="Set as cover"
                    >
                      <HugeiconsIcon
                        icon={ImageIcon}
                        size={13}
                        color={isCover ? "#E8BE3C" : "currentColor"}
                      />
                    </button>
                    <button
                      type="button"
                      className={iconBtn}
                      onClick={() => startRename(s)}
                      aria-label="Rename"
                      title="Rename"
                    >
                      <HugeiconsIcon icon={PencilEdit02Icon} size={13} color="currentColor" />
                    </button>
                    <button
                      type="button"
                      className={iconBtn}
                      disabled={!canDelete}
                      onClick={() => onRemove(s.id)}
                      aria-label="Delete state"
                      title={canDelete ? "Delete" : "A preset needs at least one state"}
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={13} color="currentColor" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add state */}
          <div className="mt-1 border-t border-white/[0.06] px-1 pt-2">
            <div className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/30">
              Add state
            </div>
            <div className="flex flex-wrap gap-1 px-0.5">
              {SUGGESTED_LABELS.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => onAdd(label)}
                  className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[11px] font-medium text-white/60 transition-colors hover:border-white/[0.16] hover:text-white"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-1.5 flex items-center gap-1 px-0.5 pb-0.5">
              <input
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addCustom();
                }}
                placeholder="Custom name…"
                aria-label="Custom state name"
                className="h-8 min-w-0 flex-1 rounded-lg bg-white/[0.05] px-2.5 text-[12px] text-white/90 placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#E8BE3C]/50"
              />
              <button
                type="button"
                onClick={addCustom}
                disabled={!custom.trim()}
                aria-label="Add custom state"
                className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-white/[0.06] text-white/70 transition-colors hover:bg-white/[0.1] hover:text-white disabled:pointer-events-none disabled:opacity-30"
              >
                <HugeiconsIcon icon={PlusSignIcon} size={15} color="currentColor" />
              </button>
            </div>
          </div>
        </Dropdown>
      )}
    </>
  );
}
