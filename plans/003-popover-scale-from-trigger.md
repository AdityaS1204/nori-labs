# 003 — Scale anchored popovers from their trigger

- **Status**: DONE
- **Commit**: 4a2f5e5
- **Severity**: MEDIUM
- **Category**: Physicality & origin
- **Estimated scope**: 2 files

## Problem

The two anchored popovers appear instantly with no entrance:

- `components/controls/Dropdown.tsx:71-82` (the state-picker menu shell)
- `components/controls/ColorPicker.tsx:172-179` (the colour picker)

A trigger-anchored popover should scale from the trigger edge with a short
`ease-out` (150–200ms) + opacity, not pop in from nothing and not from center.

```tsx
/* Dropdown.tsx:71 — current */
return createPortal(
  <div ref={popRef} role="menu" ... style={{ top: pos.top, left: pos.left, width }}>
    {children}
  </div>,
  document.body,
);
```

## Target

Enter `{opacity:0, scale:0.96}` → `{opacity:1, scale:1}`, 160ms, ease-out
`cubic-bezier(0.23, 1, 0.32, 1)`. `transform-origin` points back at the trigger:
top when the popover opens below the anchor, bottom when it flips above; left or
right to match the horizontal alignment. Reduced motion: opacity only, no scale.

```tsx
/* target (Dropdown) */
const reduce = useReducedMotion();
// track whether it opened above or below the anchor:
const [placement, setPlacement] = useState<"top" | "bottom">("bottom");
// ...in the layout effect, when flipping above: setPlacement("top"), else "bottom"
<motion.div
  ref={popRef} role="menu" ...
  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
  style={{
    top: pos.top, left: pos.left, width,
    transformOrigin: `${placement === "bottom" ? "top" : "bottom"} ${align === "right" ? "right" : "left"}`,
  }}
>
```

For `ColorPicker.tsx` the same treatment; it always right-aligns, so the
horizontal origin is `right`. It already computes the above/below flip in its
`useLayoutEffect` (`r.top - EST_HEIGHT - 8` branch) — set a `placement` state
there the same way.

## Repo conventions to follow

- Import `motion, useReducedMotion` from `motion/react` (same as
  `components/controls/Toggle.tsx:3` / `ControlSection.tsx:4`).
- Keep the `createPortal(..., document.body)` wrapper and every existing class,
  ref, role, and style key. Only the element type (`div` → `motion.div`), the
  motion props, and the added `transformOrigin` change.
- The flip decision already lives in each file's position `useLayoutEffect`; add
  a `placement` state set from the exact same condition — do not recompute it
  separately.

## Steps

1. `Dropdown.tsx`: import `motion, useReducedMotion`; add `placement` state
   (`"top" | "bottom"`, default `"bottom"`); in the `useLayoutEffect` set it to
   `"top"` on the flip-above branch, `"bottom"` otherwise; convert the portal
   root `<div>` to `motion.div` with the entrance + `transformOrigin` above.
2. `ColorPicker.tsx`: same four changes; horizontal origin is always `right`.
3. No exit animation (the popovers unmount on close) — entrance only.

## Boundaries

- Do NOT touch the dismissal logic, positioning math, or children.
- Do NOT add `AnimatePresence` or an exit (out of scope; would require call-site
  changes in `StatePicker`/`ColorField`).
- Do NOT animate layout properties — scale + opacity only.

## Verification

- **Mechanical**: typecheck / lint pass.
- **Feel check**:
  - Open the state picker (toolbar) and the colour picker (a colour row): each
    grows from its trigger edge, not from center and not instantly.
  - Force one near the bottom of the viewport so it flips above — it must scale
    from its **bottom** edge, not the top.
  - DevTools Animations at 10%: ~160ms, transform-origin anchored to the trigger.
  - `prefers-reduced-motion` on: fade only, no scale.
- **Done when**: both popovers scale from the trigger, correct origin on flip.
