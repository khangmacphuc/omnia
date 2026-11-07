---
id: OMNIA-AUDIT-UI-ACCESSIBILITY-CUSTOMIZATION-2026-09-30
title: Accessibility and appearance customization renderer receipt
status: bounded-renderer-evidence
date: 2026-09-30
---

# Scope

This receipt records the current bounded evidence for
`OMNIA-CAP-UI-ACCESSIBILITY-CUSTOMIZATION`. The source provides an allowlisted
appearance bootstrap plus renderer-local accessibility, theme, palette and
preset controls. These controls are intentionally preview-only where their
boundary copy says so; they do not claim native preference persistence or OS
assistive-technology mutation.

# Same-snapshot focused checks

Commands:

```text
npm.cmd exec vitest -- run src/features/workspace/accessibility.test.tsx src/features/workspace/accessibility-command-surface-preview.test.tsx src/features/workspace/appearance-preview-deck.test.tsx src/features/workspace/theme-preset-studio.test.tsx --pool=threads --poolOptions.threads.singleThread=true --reporter=dot
npm.cmd exec vitest -- run src/features/workspace/theme-lab-preview.test.tsx src/features/workspace/ui-system.test.tsx src/design-system/appearance.test.ts src/design-system/tokens.test.ts --pool=threads --poolOptions.threads.singleThread=true --reporter=dot
```

Observed result on September 30, 2026:

```text
First command: 4 test files passed, 18 tests passed
Second command: 4 test files passed, 10 tests passed
Total: 8 test files, 28 tests passed
```

The checks cover allowlisted theme/density/motion normalization and fallback,
keyboard/ARIA contracts, accessibility profiles, contrast/focus/reduced-motion
preview controls, command discovery, palette/logo/style customization,
reversible history, malformed-input rejection, and renderer-local export/import
previews.

# Status and limits

The capability remains `partial`. This evidence does not prove Windows
Narrator, OS high-contrast integration, screenshot/visual-regression inspection,
durable native settings, restart persistence, or packaged Tauri runtime. The
preview boundary must remain visible until those gates are independently
verified.
