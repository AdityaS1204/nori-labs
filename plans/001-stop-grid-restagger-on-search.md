# 001 — Stop the library grid re-staggering on every keystroke

- **Status**: DONE
- **Commit**: 4a2f5e5
- **Severity**: HIGH
- **Category**: Purpose & frequency
- **Estimated scope**: 1 file, 1-line dependency change

## Problem

`components/library/ExpressionGrid.tsx:63-79` runs a GSAP stagger entrance whose
effect depends on `visible`. `visible` is recomputed on every search keystroke
(`query` is in its `useMemo` deps), so **each character typed re-animates the
whole grid** — every card drops `y:12` and un-blurs again. Typing is a
high-frequency interaction; an entrance stagger must never fire on it.

```tsx
/* components/library/ExpressionGrid.tsx:63 — current */
useEffect(() => {
  const grid = gridRef.current;
  if (!grid) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = gsap.context(() => {
    gsap.from(".lib-card", {
      y: 12,
      filter: "blur(5px)",
      duration: 0.3,
      ease: "power3.out",
      stagger: 0.035,
    });
  }, grid);

  return () => ctx.revert();
}, [visible]);   // ← re-runs on every keystroke
```

## Target

The entrance plays on **mount** and on deliberate **category / sort** changes
(a meaningful "the set changed" cue), but **not** on `query`. Typing just
filters the cards instantly with no motion.

```tsx
/* target — only the dependency array changes */
}, [category, sort]);
```

Nothing else in the effect changes. `query`-driven filtering still updates the
DOM (via `visible` in render), the cards just appear without re-animating.

## Repo conventions to follow

- The effect body, the `prefers-reduced-motion` guard, and the `gsap.context` /
  `ctx.revert()` pattern are already correct — leave them exactly as they are.
- Per the project's documented GSAP rule, the entrance animates `y` + `blur`
  only, never `opacity` (cards must stay visible if motion is skipped). Do NOT
  add `opacity` to the tween.

## Steps

1. In `components/library/ExpressionGrid.tsx`, change the dependency array of
   the entrance `useEffect` from `[visible]` to `[category, sort]`.
2. Leave the effect body unchanged.

## Boundaries

- Do NOT touch any other file.
- Do NOT debounce the search input — that is not the fix; the fix is decoupling
  the entrance from `query`.
- Do NOT add `opacity` to the GSAP tween.
- If the effect no longer reads `visible` and lint flags an unused-dep warning,
  that is expected; do not reintroduce `visible`.

## Verification

- **Mechanical**: typecheck / lint pass; no new errors.
- **Feel check**: open `/library`, type several characters in the search box.
  - The grid must **not** shimmer or re-drop cards while typing — results just
    narrow instantly.
  - Click a different category chip or change the sort select: the grid **does**
    re-play the stagger once. That is intended.
  - Toggle `prefers-reduced-motion`: no entrance motion at all, cards visible.
- **Done when**: typing filters with zero card motion; filter/sort still stagger.
