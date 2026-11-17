export default function SectionLabel({ index, children }: { index: string; children: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="rounded-[3px] bg-white/[0.07] px-2 py-1 font-mono text-[11px] leading-none tracking-[0.1em] text-white/70 tabular-nums">
        {index}
      </span>
      <span className="font-mono text-[11px] uppercase leading-none tracking-[0.18em] text-white/40">
        {children}
      </span>
    </div>
  );
}
