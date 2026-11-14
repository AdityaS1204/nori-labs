import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

interface StatItemProps {
  icon: IconSvgElement;
  value: string;
  /** Accessible label, e.g. "likes". */
  label: string;
}

/** Icon + compact count, used for likes / remixes on a card. */
export default function StatItem({ icon, value, label }: StatItemProps) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-medium text-white/40"
      title={`${value} ${label}`}
    >
      <HugeiconsIcon icon={icon} size={13} color="currentColor" />
      {value}
      <span className="sr-only"> {label}</span>
    </span>
  );
}
