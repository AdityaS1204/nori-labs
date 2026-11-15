# 004 — Slide a shared indicator between category filter tabs

- **Status**: DONE
- **Commit**: 4a2f5e5
- **Severity**: LOW (missed opportunity)
- **Category**: Cohesion & tokens
- **Estimated scope**: 1 file

## Problem

`components/library/LibraryToolbar.tsx:86-107` indicates the active category with
an instant background/border colour swap. The selection teleports between tabs
with nothing explaining the move — a spatially-connected set of tabs where a
sliding indicator belongs.

```tsx
/* LibraryToolbar.tsx:95 — current (active state baked into the button class) */
active
  ? "border-[#E8BE3C]/30 bg-[#E8BE3C]/15 text-[#E8BE3C]"
  : "border-white/[0.07] bg-white/[0.02] text-white/45 hover:border-white/[0.12] hover:text-white/75",
```

## Target

A single `motion.span` with `layoutId="category-pill"` rendered only inside the
active tab, absolutely positioned behind the label; Motion animates it sliding
to the newly-selected tab. The tab text keeps its colour change; the pill
carries the amber fill/border. Spring: `{ type: "spring", stiffness: 420,
damping: 34 }`.

```tsx
/* target */
<button ... className={[
  "relative flex-shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium tracking-[0.02em] transition-colors duration-150",
  active ? "text-[#E8BE3C]" : "text-white/45 hover:text-white/75",
].join(" ")}>
  {active && (
    <motion.span
      layoutId="category-pill"
      transition={{ type: "spring", stiffness: 420, damping: 34 }}
      className="absolute inset-0 -z-10 rounded-full border border-[#E8BE3C]/30 bg-[#E8BE3C]/15"
    />
  )}
  {filter}
</button>
```

## Repo conventions to follow

- Motion import style matches `components/controls/Toggle.tsx:3`.
- `LibraryToolbar.tsx` is currently a plain module imported by the client
  component `ExpressionGrid`. Add `"use client";` as the first line so the
  `motion` usage is unambiguous.
- Amber accent is `#E8BE3C` throughout — reuse it, do not introduce a new colour.

## Steps

1. Add `"use client";` at the top of `LibraryToolbar.tsx`.
2. Import `motion` from `motion/react`.
3. In the filter `.map`, make the button `relative`, move the amber
   `bg`/`border` off the button class, and render the `layoutId` pill inside the
   active button (markup above). Keep the inactive hover styles and the text
   colour swap.
4. Keep `role="tab"`, `aria-selected`, and the click handler untouched.

## Boundaries

- Do NOT touch the search input, sort select, or the grid.
- Do NOT change the filter data model or handlers.
- Keep the non-amber hover border on inactive tabs (`hover:text-white/75`); it is
  acceptable to drop the inactive `border`/`bg` entirely for a cleaner pill, but
  do not add new colours.

## Verification

- **Mechanical**: typecheck / lint pass; `"use client"` present.
- **Feel check**: on `/library` with multiple categories, click between chips —
  the amber pill slides from the old tab to the new one (shared-element move),
  it does not fade/teleport. Label colour still updates.
  - `prefers-reduced-motion`: the slide is small and non-blocking; acceptable to
    leave. If it feels wrong, gate with `useReducedMotion()` and render the pill
    without layout animation.
- **Done when**: the active indicator visibly travels between tabs.
