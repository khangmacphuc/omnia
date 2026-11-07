---
id: OMNIA-ULTRA-GOAL-PRODUCT-UI
title: Product outcome and UI quality goal
status: normative-target
version: 1.0.0
last_reviewed: 2026-08-14
supersedes: []
requirements_registry_revision: 2026-08-14.6
---

# Product outcome and UI quality

Omnia Ultra is a Windows 11 desktop workbench for conversation, research,
learning, coding, projects, files, media, automation and authorized runtime
work. It should feel calm, technical and premium rather than stereotypically
“AI”: restrained color, coherent modern icons, strong typography, purposeful
motion, generous but efficient spacing, rounded surfaces, high contrast and
visible state provenance.

The shell must support a command palette, activity rail, resizable sidebar,
main conversation/workbench, inspector and background-task surface. Users can
customize theme, density, pane visibility, widths, fullscreen, shortcuts,
motion, contrast, typography, screen reader announcements and focus behavior.

The library must support create project, add or detach workspace roots, create
and move conversations, rename, pin, favorite, archive, restore, search, tag,
filter, import/export and undo-safe bulk actions. Opening a project restores
its last layout/branch/selection without dispatching a request. See
`../interaction/conversation-workspace-library.md`.

Hover and selection interactions are first-class. A selected output range can
open reply, explain, cite, translate, test, refactor, branch and create-task
actions. Modal cards close with Close, Escape or outside click; non-modal cards
remain usable without stealing focus. Every pointer action has a keyboard and
screen-reader equivalent. Background agents expose stable role icons and a
separate animated runtime-state glyph, never an ambiguous icon-only status.

See `../interaction/selection-reference-annotations.md`,
`../interaction/ui-shell-accessibility.md`,
`../interaction/background-work-inspector.md` and `../architecture/client-runtime-topology.md`.
