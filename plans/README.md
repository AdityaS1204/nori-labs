# Animation improvement plans

Audit by `improve-animations` (Emil Kowalski philosophy), focused on the
**playground** and **lab library** interaction surfaces. Stamped at commit
`4a2f5e5`.

| # | Plan | Severity | Status |
|---|------|----------|--------|
| 001 | [Stop grid re-stagger on every keystroke](001-stop-grid-restagger-on-search.md) | HIGH | DONE |
| 002 | [Save-to-library modal entrance/exit](002-save-dialog-entrance.md) | MEDIUM | DONE |
| 003 | [Scale anchored popovers from trigger](003-popover-scale-from-trigger.md) | MEDIUM | DONE |
| 004 | [Sliding category filter indicator](004-category-filter-pill.md) | LOW | DONE |

## Recommended order

1. **001** — highest leverage, 1-line change, no dependencies.
2. **003** — shared shell fix (Dropdown + ColorPicker), independent.
3. **002** — modal; touches `SavePresetDialog` + `ExpressionEditor`.
4. **004** — delight; independent, lowest risk.

No cross-plan dependencies — each can land on its own.

## Not reported (already right)

Face-morph springs, blink `easeIn`-close (physically correct), accordion
`height:auto` (documented exception), slider fill with no transition during drag,
and the press feedback on primary buttons were reviewed and left alone.
