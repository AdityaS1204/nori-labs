import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

export default function Home() {
  return (
    <section
      style={{
        minHeight: "calc(100vh - var(--nav-h))",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
        textAlign: "center",
        gap: "24px",
      }}
    >
      <p style={{ color: "var(--muted)", fontSize: "13px", letterSpacing: "0.06em" }}>
        Hero section coming soon.
      </p>

      <div className="flex flex-col items-center gap-4">
        <h2 className="max-w-[28ch] text-[clamp(22px,4vw,34px)] font-semibold leading-tight tracking-[-0.01em] text-white">
          Give Nori a face.
        </h2>
        <p className="max-w-[46ch] text-[14px] leading-relaxed text-white/50">
          Browse the community expression library or open the playground to design
          your own — no account needed to look around.
        </p>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 rounded-[6px] bg-[#E8BE3C] px-5 py-2.5 text-[13px] font-semibold tracking-[0.04em] text-[#0d0d0e] no-underline transition-[box-shadow,transform] duration-150 hover:shadow-[0_0_0_1px_#E8BE3C,0_6px_20px_rgba(232,190,60,0.28)] motion-safe:active:scale-[0.97]"
          >
            Explore the library
            <HugeiconsIcon icon={ArrowRight01Icon} size={15} color="currentColor" />
          </Link>
          <Link
            href="/lab"
            className="inline-flex items-center gap-1.5 rounded-[6px] border border-white/[0.12] px-5 py-2.5 text-[13px] font-medium tracking-[0.04em] text-white/80 no-underline transition-[color,border-color,background-color] duration-150 hover:border-white/25 hover:bg-white/[0.04] hover:text-white"
          >
            Open the playground
          </Link>
        </div>
      </div>
    </section>
  );
}
