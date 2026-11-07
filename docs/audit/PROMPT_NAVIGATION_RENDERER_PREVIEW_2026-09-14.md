# Prompt-navigation renderer-preview receipt — September 14, 2026

## Scope

This receipt records the renderer-local conversation map that is present in
the current source tree. It complements
`PROMPT_NAVIGATION_DOMAIN_SLICE_2026-09-14.md`; it does not promote the full
Jump Prompt requirement to verified and it is not evidence of native runtime,
durable persistence, or packaged Windows behavior.

## Working-tree implementation observed

- `src/features/workspace/conversation-navigation-model.ts` builds a bounded
  renderer projection from the active message list. It classifies prompt,
  output and issue markers, preserves branch metadata, bounds excerpts, and
  provides deterministic first/latest/next/previous helper indices.
- `src/features/workspace/conversation-navigation.tsx` renders a compact local
  conversation map with accessible labels, active-target state, unavailable
  target state, Escape dismissal, pointer-outside dismissal, focus return to
  the trigger, and direct navigation to renderer-owned message anchors.
- `src/features/workspace/conversation-view.tsx` integrates the map with the
  active conversation and local keyboard navigation for next/previous prompt,
  next/previous issue, first message and latest output. Destination scrolling
  is local and uses reduced-motion-aware behavior.
- The implementation deliberately labels itself `local` and `preview`; it
  does not present the renderer projection as a durable native JumpTarget.

## Same-snapshot focused verification

The following checks were run from
`C:\Users\khang\source\repos\omnia`:

```text
npx.cmd vitest run src/features/workspace/conversation-navigation.test.tsx `
  --testTimeout=30000 `
  --maxWorkers=1 `
  --minWorkers=1 `
  --reporter=verbose
PASS — 1 test file, 7 tests

npm.cmd run typecheck -- --pretty false
PASS
```

The seven focused tests cover projection classification and bounded excerpts,
branch metadata, non-wrapping helper indices, empty conversations, mounted
anchor navigation, Escape/pointer-outside dismissal, and accessible
unavailable-target reporting. These tests do not prove native IPC or packaged
desktop behavior.

## Explicit limitations

The renderer preview does not provide:

- native durable target records, state-revision cursor authority, IPC,
  startup hydration, cross-process replay, or restart persistence;
- a global jump command palette, indexed search, transcript minimap, browser
  back/forward history, bookmarks, named anchors, deep links, or durable
  scroll-position restoration;
- artifact, source, citation, tool, agent, run, attempt, task, goal, plan,
  PDF-region, spreadsheet-range, slide, or audio/video timestamp targets;
- branch switching, edit/fork/retry/compare actions, queue/steer/scheduler
  execution, or request-inspector deep linking;
- full screen-reader ancestry announcements, Windows accessibility proof,
  packaged Tauri behavior, or native Rust compilation/runtime evidence.

## Truthful status

**Partial — tested local/domain resolver plus renderer conversation-map
preview.** The next dependency-ready gate is native durable target records and
state-revision cursor/IPC hydration, followed by a complete renderer
jump-palette/minimap/history/deep-link/accessibility surface and adapters for
non-message targets. Do not promote `OMNIA-CAP-JUMP-PROMPT` to `verified`.
