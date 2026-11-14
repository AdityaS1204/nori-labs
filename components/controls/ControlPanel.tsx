import { HugeiconsIcon } from "@hugeicons/react";
import { SlidersHorizontalIcon } from "@hugeicons/core-free-icons";

interface ControlPanelProps {
  title: string;
  /** Optional toolbar row rendered under the header. */
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * The DialKit-style panel shell: an elevated, rounded dark surface with a
 * title + icon header, an optional toolbar, and a scrollable body with a
 * tactile (rounded, grooved) scrollbar.
 */
export default function ControlPanel({
  title,
  toolbar,
  children,
}: ControlPanelProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#1a1a1c] shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <span className="text-[15px] font-semibold tracking-[0.01em] text-white">
          {title}
        </span>
        <span className="text-white/35" aria-hidden="true">
          <HugeiconsIcon icon={SlidersHorizontalIcon} size={18} color="currentColor" />
        </span>
      </div>

      {toolbar && <div className="px-3 pb-3">{toolbar}</div>}

      <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 pb-3 [scrollbar-color:rgba(255,255,255,0.3)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-[2px] [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-thumb]:bg-clip-padding hover:[&::-webkit-scrollbar-thumb]:bg-white/45 [&::-webkit-scrollbar-track]:my-1 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-white/[0.06] [&::-webkit-scrollbar]:w-3">
        {children}
      </div>
    </div>
  );
}
