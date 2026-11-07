---
id: OMNIA-ULTRA-INT-PROMPT-EDIT-STATE-RETRY
title: Immutable prompt revisions and state-aware retry contract
status: normative-target
version: 1.0.0
last_reviewed: 2026-08-14
supersedes: []
---

# Immutable prompt edits and state-aware retry

Prompt, message and execution revisions are append-only. Editing a draft,
queued item or finalized user message has a distinct effect and never rewrites
an accepted response, attempt, telemetry row or branch history.

## Edit effects

- `edit-draft` changes only the unsent composer revision;
- `replace-queued` creates a queue-item revision under its dependency lock;
- `edit-as-branch` forks before a finalized user message and appends the edit;
- `replay-historical` reuses an immutable historical input/state base;
- `retry-current-state` keeps the intent but compiles a new current-state base;
- `selected-delta-retry` names each later revision explicitly;
- `annotation-or-correction` records feedback without mutating assistant/tool/
  system transcript content.

Frozen provider input is immutable. A requested mid-flight change applies at a
safe boundary, interrupts into a new attempt, queues after terminal state or
forks in parallel. The UI shows exact prompt/context/model/approval diffs.

## Canonical retry bases

Machine IDs are hyphenated and centralized:

1. `exact-historical` — frozen prompt, context, tools, model/profile and
   parameter revisions, excluding later state;
2. `current-state` — the authorized branch head captured at an explicit
   watermark, including accepted later changes;
3. `historical-plus-selected-deltas` — historical base plus named revisions;
4. `fresh-branch` — new branch with selected goal, prompt and authority only.

Snapshot policy is `capture-on-click`, `capture-on-dispatch` or
`follow-until-safe-boundary`. The receipt stores captured and dispatch state
revision IDs, state-advance disposition, context manifest, excluded/unknown
effects and policy/permission revision. A stale head requires rebase,
recompile, queue-after, fork or cancellation; it never silently changes
meaning.

## Retry A then B

A retry creates before-state, candidate output and accepted/promoted result
revisions. B with `current-state` sees A only after A's result is accepted or
promoted into the branch head. If A is still running, B chooses committed-head
now, wait-for-A, parallel-fork or cancel. An `outcome-unknown` effect is never
implicitly inherited. Exact-historical B remains reproducible and excludes
later state. Transport retry, semantic retry, repair and fallback are separate
attempt types with independent billing/idempotency evidence.

## Acceptance evidence

Test draft/queue/final edit, immutable history, A→B accepted-state visibility,
all four retry bases, snapshot timing, stale-head conflicts, branch isolation,
revocation/supersession, unknown-effect exclusion, provider acceptance and
duplicate-billing protection after crash/restart.

See `../schemas/message-revision.schema.json`,
`../schemas/run-control-operation.schema.json` and
`run-control-edit-retry.md`.
