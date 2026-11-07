---
id: OMNIA-AUDIT-UI-FIRST-CLICK-FOCUS-2026-09-30
title: First-click and focus-safe overlay renderer receipt
status: bounded-renderer-evidence
date: 2026-09-30
---

# Scope

This receipt corrects the capability-ledger mapping for
`OMNIA-CAP-UI-FIRST-CLICK`. The previous row referenced multimodal storage and
projection modules, which did not provide evidence for first-click or overlay
focus behavior. The current row points to the actual renderer primitives:

- `src/components/modal-surface.tsx`
- `src/components/panel-scrim.tsx`
- `src/components/panel-drawer.tsx`

# Same-snapshot focused check

Command:

```text
npm.cmd exec vitest -- run src/components/modal-surface.test.tsx src/features/workspace/panel-drawer.test.tsx --pool=threads --poolOptions.threads.singleThread=true
```

Observed result on September 30, 2026:

```text
Test Files  2 passed (2)
Tests       9 passed (9)
```

The checks cover modal accessible naming, initial focus, Tab wrapping, Escape
dismissal, focus restoration, scrim-only dismissal, topmost-modal Escape
ownership, narrow temporary-drawer focus entry, drawer Tab wrapping, and
pointer-scrim close behavior. The visual fixture contract also keeps the
representative command-palette overlay keyboard-bounded and dismissible.

# Status and limits

This is renderer-local evidence only. It does not prove that every shell
control works on its first click, Narrator behavior on Windows, persistent
layout/accessibility preferences, native IPC authority, packaged Tauri startup,
or screenshot/visual-regression success. The capability therefore remains
`partial`, and no native or release claim is promoted by this receipt.
