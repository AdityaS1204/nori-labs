# 002 — Give the Save-to-library modal an entrance and exit

- **Status**: DONE
- **Commit**: 4a2f5e5
- **Severity**: MEDIUM
- **Category**: Physicality & origin
- **Estimated scope**: 2 files

## Problem

`components/playground/SavePresetDialog.tsx:67-80` renders the backdrop and
dialog with plain `<div>`s — they appear and disappear instantly. A modal is the
documented place for a short `ease-out` scale-from-0.96 + fade. It is mounted by
`components/playground/ExpressionEditor.tsx:329` as `{saveOpen && <SavePresetDialog…/>}`,
so there is also no exit.

```tsx
/* SavePresetDialog.tsx:68 — current */
<div className="fixed inset-0 z-[60] flex items-center justify-center p-4" ...>
  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" ... />
  <div className="relative z-10 flex max-h-[90vh] w-full max-w-[460px] ...">
```

## Target

Backdrop fades opacity `0→1`. Panel enters `{opacity:0, scale:0.96, y:8}` →
`{opacity:1, scale:1, y:0}` and exits the reverse. `transform-origin: center`
is correct for a centered modal — keep it. Duration ~220ms, strong ease-out
`cubic-bezier(0.23, 1, 0.32, 1)`; backdrop a touch faster (180ms). Under reduced
motion, drop scale/translate but keep the opacity fade.

```tsx
/* target — Motion, inside an AnimatePresence owned by the parent */
const reduce = useReducedMotion();
const EASE = [0.23, 1, 0.32, 1] as const;
// backdrop
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
  transition={{ duration: 0.18, ease: EASE }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" ... />
// panel
<motion.div
  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 6 }}
  transition={{ duration: 0.22, ease: EASE }}
  className="relative z-10 flex max-h-[90vh] ...">
```

## Repo conventions to follow

- Motion is imported as `import { motion, useReducedMotion } from "motion/react"`.
  `AnimatePresence` is already used this way in
  `components/controls/ControlSection.tsx:4,43`.
- The portal (`createPortal(..., document.body)`) stays; `motion.div` works
  inside a portal as long as it is within the `AnimatePresence` subtree.

## Steps

1. In `SavePresetDialog.tsx`, import `motion, useReducedMotion` from `motion/react`.
2. Convert the backdrop `<div>` and the panel `<div>` (the two inner elements of
   the portal root) to `motion.div` with the `initial/animate/exit/transition`
   above. Add `const reduce = useReducedMotion();` and the `EASE` const near the
   top of the component. Keep every existing className and handler unchanged.
   Leave the outer `fixed inset-0` wrapper as a plain `<div>`.
3. In `components/playground/ExpressionEditor.tsx`, import `AnimatePresence` from
   `motion/react` (add to the existing motion import if present, else a new
   import). Wrap the dialog mount:
   ```tsx
   <AnimatePresence>
     {saveOpen && (
       <SavePresetDialog ... />
     )}
   </AnimatePresence>
   ```
   Keep all existing props on `SavePresetDialog`.

## Boundaries

- Do NOT change the modal's markup, fields, copy, or submit logic.
- Do NOT change `transform-origin` (center is correct for a modal).
- Do NOT animate `width`/`height`/`top`/`left` — transform + opacity only.
- Do NOT add a new dependency.

## Verification

- **Mechanical**: typecheck / lint pass.
- **Feel check**: in the playground, click **Save to library**.
  - Panel scales up slightly from 0.96 with a fade; backdrop fades in — no pop.
  - Close via Cancel / Escape / backdrop click: the panel scales down and fades
    out (exit plays) rather than vanishing instantly.
  - DevTools Animations panel at 10%: motion is transform+opacity, ~220ms.
  - `prefers-reduced-motion` on: panel fades only, no scale/slide.
- **Done when**: open and close both animate; reduced motion keeps only opacity.
