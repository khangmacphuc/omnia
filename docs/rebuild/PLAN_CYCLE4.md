# Companion continuity and verified milestone implementation plan

> **For agentic workers:** Use subagent-driven-development for independent owned
> slices and verification-before-completion for integration. The human has
> explicitly authorized implementation, testing and publication.

**Goal:** Preserve a usable chat in every workspace at the minimum supported
window size, refresh honest runtime evidence and publish the original rebuild
milestone while keeping the full product goal active.

**Architecture:** The root shell owns navigation and responsive companion state.
Native IPC remains authoritative. Each independent slice has exclusive files in
ASSIGNMENTS.md; root validates the assembled source, evidence and release.

**Stack:** React 19, TypeScript, Tauri/Rust, Vitest, Playwright, Node gate scripts.

**Spec:** SPEC.md, WORKFLOW.md, DOD.json and the latest human requirements.

## Three useful planning passes

1. **Continuity:** The current CSS hides companion Chat below 1100px. Keep the
   desktop split and provide a named toggle/drawer at 800x600. A permanent three
   column grid cannot meet the minimum window width.
2. **Keyboard:** Modal overlays currently lack root-level focus isolation. Use one
   shell overlay boundary, Escape dismissal and restoration to the opening
   control. Keep the companion nonmodal; Escape closes the drawer before exiting
   the workspace. Test focus containment and session continuity.
3. **Evidence:** Preserve the stale prior cycle manifest as historical data.
   New cycle stages require artifacts, novel source snapshots, current command
   receipts and a separate reviewer. A reviewed milestone may retain partial
   product criteria; incomplete criteria never become Done from preview.

## Global constraints

- Exactly Chat, Browser, IDE in top navigation; fresh launch is projectless Chat.
- All original UI is under src/rebuild; no old UI code, CSS or external live iframe.
- Minimum supported window 800x600; dark/light; 2px visible focus.
- Default context 200000 tokens, tool truncation 10000, retry 5 seconds x 1.
- Keep D:/Omnia original/release checkouts untouched.
- Serialize Cargo. No downloaded script execution. Do not publish private data.

## Review focus

- Browser/IDE at 800x600 must keep the composer reachable.
- Opening settings/research must not leave keyboard focus behind the modal.
- Switching workspaces must preserve selected session and draft.
- Native-unavailable paths must retain explicit status, without invented output.
- A changed source/receipt must invalidate stale review and reread hashes.

## Task 1: Responsive companion and keyboard overlays (root)

Files: src/rebuild/rebuild-app.tsx, rebuild-app.css, rebuild-app.test.tsx;
new src/rebuild/use-modal-boundary.ts if the hook keeps the shell focused.

- [ ] Add regression tests for companion toggle, Escape and modal focus restore.
- [ ] Run focused test and observe failure before implementation.
- [ ] Implement a named companion toggle and close control without adding a mode.
- [ ] Implement modal focus containment and restore the prior focused element.
- [ ] Run focused tests, typecheck, narrow/light/dark capture and geometry check.

## Task 2: Native settings and ask-user seams (assigned agents)

Inputs: existing native commands/events and clean-room settings/chat contracts.
Outputs: complete safe modules or precise blocker evidence, with tests for failed,
stale, duplicate and canceled actions. Native dispatch success is not inferred.

## Task 3: Audit, research and review (independent agents)

- [ ] Refresh UI-007 review; inspect actual companion source.
- [ ] Capture 800x600, light/dark, keyboard and control inventory.
- [ ] Read NEW OSS paths; pin license/revision/hash and record decisions.
- [ ] Audit pointer/RAG/native/session continuity and release claims.

## Task 4: Integration and publication (root)

- [ ] Run architecture/gate suite, renderer tests/typecheck/build and UI QA.
- [ ] Update goal/spec/DoD/checkpoint/source register with current receipts.
- [ ] Re-read canonical docs and validate current hashes/stage/checklist.
- [ ] Record the expected incomplete strict completion gate honestly.
- [ ] Review exact diff, README/screenshots, commit/tag/push the verified milestone.
- [ ] Continue the next incomplete criterion with goal still Active.
