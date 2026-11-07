---
id: OMNIA-AUDIT-RUN-CONTROL-TEST-RECEIPT-2026-08-14
title: Run-control contract test receipt
status: audit-current-tree
last_reviewed: 2026-08-14
scope:
  - pause-resume-continue
  - immutable-edit-retry
  - state-aware-retry
  - branch-fork-copy-compare
  - existing-source-and-test-evidence
---

# Run-control contract test receipt

## Outcome

The Omnia Ultra specification pack is internally consistent for the current
Pause, Resume, Continue, edit, retry, branch/fork and compare target. The
existing renderer/domain tests and TypeScript typecheck also pass.

This is **not** evidence that the complete run-control product capability has
shipped. The current application has useful run-state, frozen-input,
attempt-lineage and event-journal primitives, but it does not yet expose
durable native operations or enabled UI flows for Pause, Resume, no-text
Continue, immutable message editing, retry state-base selection, branch/fork,
compare or promotion. This distinction is intentional: a passing projection
test must not turn a normative target into a release claim.

## Commands and observed result

Run from `C:\\Users\\khang\\source\\repos\\Omnia` on 2026-08-14:

```powershell
docs\omnia-ultra\tools\validate-spec.ps1
```

Observed result:

```text
PASS - Omnia Ultra spec pack: 92 Markdown files, 19 JSON files,
92 unique document IDs, 41 requirements, 41 capability rows
```

The same verification pass also parsed every file under
`docs/omnia-ultra/schemas/` plus the manifest, requirement registry and
capability ledger as JSON before invoking the spec validator.

```powershell
npm run test -- src/features/workspace/run-graph-projection.test.ts `
  src/features/workspace/run-journal-projection.test.ts `
  src/features/workspace/store.test.ts `
  src/features/workspace/prepared-run-dispatch.test.ts `
  src/features/workspace/conversation-catalog.test.ts `
  src/domain/run-event-journal.test.ts
```

Observed result: 6 test files passed; 39 tests passed.

```powershell
npm run typecheck
```

Observed result: exit code `0`.

## What the passing tests actually cover

| Evidence area | What is covered | What it does not prove |
| --- | --- | --- |
| Run graph projection | deterministic native-known conversation, branch, message, run and attempt lineage; invalid/orphan detection | a user can create, navigate or promote a branch/fork in the application |
| Journal projection and store | ordered event reduction, replay cursors, duplicate suppression and renderer state handling | native Pause/Resume checkpoints or a Continue execution segment |
| Prepared dispatch | prepared attempt dispatch boundaries and frozen-input ownership | edit/retry operation revisions, selected deltas or a full current-state context compiler |
| Conversation catalog | snapshot-to-conversation projection | immutable message editing, sibling retries or compare UI |
| Domain journal | append-only run-event validation | cross-surface operation CAS/epoch handling, active-run mutation policy or recovery of a paused workflow |

## Current source-grounded boundaries

- `src/domain/run.ts` defines `paused` as a run state and names
  `run.paused`, `run.resumed` and `checkpoint.created` event types. Its state
  transition model is a useful prerequisite, not a durable control service.
- The same domain requires provider dispatch to use a frozen snapshot and
  rejects an automatic retry when the preceding attempt is `unknown`. This
  protects a bounded attempt chain, but does not implement the four user
  retry state-base modes.
- `src/features/workspace/composer.tsx` currently provides Send and Stop for
  the active text-chat path; sending requires nonempty draft text. Therefore
  it cannot substantiate no-text Continue from an answer, checkpoint or empty
  conversation.
- `src/features/workspace/conversation-view.tsx` deliberately renders Edit,
  Branch and branch-navigation actions as disabled planned controls. They are
  honest placeholders, not completed product behavior.
- The native command surface includes run preparation, journal reading,
  telemetry reading and cancellation. It has no dedicated pause/resume/
  continue/edit/retry-state-base/branch/fork/compare command yet.

For deeper state/race analysis and the required contract amendments, see
[`ACTIVE_RUN_UX_AUDIT_2026-08-14.md`](ACTIVE_RUN_UX_AUDIT_2026-08-14.md).
The canonical implementation target remains
[`run-control-edit-retry.md`](../omnia-ultra/interaction/run-control-edit-retry.md)
with its durable operation envelope in
[`run-control-operation.schema.json`](../omnia-ultra/schemas/run-control-operation.schema.json).

## Required implementation gates before status may become shipped

1. Persist typed control operations and compare-and-swap outcomes, including
   control idempotency, expected state revision/run epoch, source and resulting
   revisions, active-run policy and a durable receipt.
2. Implement truthful Pause dispositions and safe-boundary checkpoints for
   provider, tool, approval, child-agent, queued and remote-work targets;
   Resume must start a new linked execution segment after reconciliation.
3. Implement no-text Continue as an inspectable typed continuation intent. It
   must work after output, from a checkpoint and from an empty conversation
   without inventing authority or external effects.
4. Persist immutable prompt revisions and all four retry state bases:
   `exact_historical`, `current_state`,
   `historical_plus_selected_deltas` and `fresh_branch`. Test the A-retry then
   B-current-state scenario, including supersession, revocation and branch
   isolation.
5. Wire enabled copy, duplicate, branch, fork, compare, promote and merge
   surfaces to the same native operation journal. Frozen in-flight provider
   input must only be changed by an explicit safe-boundary, interrupt,
   queue-after-terminal or fork-parallel outcome.
6. Add deterministic reducer tests, native persistence/restart tests,
   two-client conflict tests, provider acceptance/outcome-unknown tests and
   keyboard/screen-reader/focus tests for every enabled control.

No native-runtime claim is made here for those six gates. They remain planned
until implementation and the corresponding test-process receipts exist.
