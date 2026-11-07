---
id: OMNIA-AUDIT-WORKSPACE-LIBRARY-RENDERER-PREVIEW-2026-09-30
title: Workspace library renderer-preview receipt
status: bounded-renderer-evidence
date: 2026-09-30
---

# Scope

This receipt records current renderer evidence for
`OMNIA-CAP-WORKSPACE-LIBRARY`. The implementation supplies a useful
conversation-library rehearsal plus a grouped picker for optional Library
workbenches. Its lifecycle controls are renderer/local state only; this is not
evidence for durable project, conversation, folder-root, import, deletion, or
cross-client behavior.

# Same-snapshot focused check

Command:

```text
npm.cmd exec vitest -- run src/features/workspace/library-conversation-crud-preview.test.tsx src/features/workspace/activities/library-activity-screen.test.tsx --pool=threads --poolOptions.threads.singleThread=true --reporter=dot
```

Observed result on September 30, 2026:

```text
Test Files  2 passed (2)
Tests       11 passed (11)
```

Coverage includes renderer-local rename, pin, archive/restore, move with
unavailable-destination rejection, delete/restore and duplicate/undo rehearsal,
folder/tag/saved-collection organization, scoped and ranked search, keyboard
destination navigation with focus restoration, and the grouped picker opening
one lazy workbench at a time with truthful preview boundary text.

# Status and limits

The capability is `partial`, not `wired` or `verified`. Current evidence does
not establish native project/workspace-root/conversation persistence, restart
recovery, idempotent native receipts, import/export of canonical records,
deterministic multi-client conflict handling, or safe detach of real files.
Keep the renderer-preview label visible until those gates are independently
verified.
