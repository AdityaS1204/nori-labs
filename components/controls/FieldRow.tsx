/** Shared visual base for every control row — a raised, rounded "pill". */
export const ROW_BASE =
  "relative h-11 rounded-[10px] bg-[#242427] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]";

interface FieldRowProps {
  children: React.ReactNode;
  className?: string;
}

/** A static (non-slider) row: label left, content right. */
export default function FieldRow({ children, className }: FieldRowProps) {
  return (
    <div
      className={`${ROW_BASE} flex items-center justify-between px-3.5 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
