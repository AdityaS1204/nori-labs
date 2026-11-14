import type { Author } from "@/lib/presets";
import { initials } from "@/lib/presets";

interface AuthorBadgeProps {
  author: Author;
  /** Smaller variant for dense card footers. */
  size?: "sm" | "md";
}

/** Avatar (initials) + name/handle for the person who uploaded an expression. */
export default function AuthorBadge({ author, size = "sm" }: AuthorBadgeProps) {
  const avatar = size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-[12px]";

  return (
    <span className="flex items-center gap-2 min-w-0">
      <span
        className={`${avatar} flex-shrink-0 grid place-items-center rounded-full bg-white/[0.08] border border-white/[0.1] font-semibold text-white/70`}
        aria-hidden="true"
      >
        {initials(author.name)}
      </span>
      <span className="flex flex-col min-w-0 leading-tight">
        <span className="truncate text-[12px] font-medium text-white/70">
          {author.name}
        </span>
        {author.handle && (
          <span className="truncate text-[10px] text-white/35">
            @{author.handle}
          </span>
        )}
      </span>
    </span>
  );
}
