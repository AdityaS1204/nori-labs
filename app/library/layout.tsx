import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";

import AuthButton from "@/components/auth/AuthButton";

export const metadata = { title: "Expression Library — Nori Robotics" };

function LibraryHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-[52px] flex-shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#0d0d0e]/85 px-5 backdrop-blur-md">
      {/* Left: logo + breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-white/60 no-underline transition-colors duration-150 hover:text-white"
        >
          <svg className="h-5 w-5" viewBox="0 0 30 30" fill="none" aria-hidden="true">
            <rect x="0.75" y="0.75" width="28.5" height="28.5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" />
            <path d="M6 24V12.5L15 7.5L24 12.5V24" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M11 24V17.5H19V24" stroke="#E8BE3C" strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="15" cy="11.5" r="1.5" fill="currentColor" />
          </svg>
          <span className="text-[13px] font-medium tracking-[0.02em]">nori</span>
        </Link>
        <span className="text-[13px] text-white/20">/</span>
        <span className="text-[13px] font-medium tracking-[0.02em] text-white/90">
          Library
        </span>
      </div>

      {/* Right: auth + link to the lab */}
      <div className="flex items-center gap-1">
        <AuthButton />
        <Link
          href="/lab"
          className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-[12px] font-medium tracking-[0.03em] text-white/50 no-underline transition-[color,background-color] duration-150 hover:bg-white/[0.06] hover:text-white"
        >
          Open playground
          <HugeiconsIcon icon={ArrowUpRight01Icon} size={13} color="currentColor" />
        </Link>
      </div>
    </header>
  );
}

export default function LibraryLayout({ children }: LayoutProps<"/library">) {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0b]">
      <LibraryHeader />
      <div className="flex-1">{children}</div>
    </div>
  );
}
