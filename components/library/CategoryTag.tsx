interface CategoryTagProps {
  category: string;
  /** Hex accent to tint the tag. Defaults to brand amber. */
  accent?: string;
}

/** Small pill showing the preset's category, tinted by its accent. */
export default function CategoryTag({ category, accent = "#E8BE3C" }: CategoryTagProps) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]"
      style={{
        color: accent,
        backgroundColor: `${accent}1f`, // ~12% alpha
        border: `1px solid ${accent}33`, // ~20% alpha
      }}
    >
      {category}
    </span>
  );
}
