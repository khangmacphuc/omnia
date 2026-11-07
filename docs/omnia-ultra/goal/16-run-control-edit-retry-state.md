---
id: OMNIA-ULTRA-GOAL-RUN-CONTROL-RETRY-STATE
title: Pause, continue, edit, retry and state-aware history goal
status: normative-target
version: 1.1.1
last_reviewed: 2026-08-14
supersedes: []
requirements_registry_revision: 2026-08-14.6
---

# Pause, continue, edit, retry and state-aware history

Omnia exposes Pause, Resume and Continue as durable workflow controls. A pause
has an explicit cooperative-checkpoint, provider-supported suspend,
cancel-then-reconcile or pending-effect outcome; it never falsely claims to
freeze an arbitrary remote stream or unknown external action. Continue can run
without new prompt text after an answer, from a paused checkpoint, or at the
start of a new chat using a configured active project/global goal, resumable
task or safe starter workflow. It records a typed continuation intent, state
watermark, completion/no-progress judgment and cannot invent permission or
external side effects.

Every control captures a source anchor, authorized state-read watermark,
observed and expected branch-head revision, context manifest, destination
branch policy, authority policy and idempotency key. `current-state` means the
full authorized state graph at that durable branch watermark--not merely what
the renderer currently displays. The provider context compiler may select
within a bounded window, but must retain an inspectable manifest of every
included, omitted and retrievable state unit. A stale branch head requires an
explicit rebase, recompile, queue dependency, fork or cancellation decision;
it never silently adopts a different state.

Executable Continue/retry additionally requires an accepted state revision in
the same native conversation, branch and stream, at or below the accepted-head
watermark. A requested historical accepted revision remains the selected
revision after the head advances; the resolver never substitutes the newer
head. Candidate, rejected, superseded, outcome-unknown, conflicted, blocked,
discarded and invalid revisions are preview/plan/draft-only and must be marked
non-executable. Accepted-head and watermark projections are native integrity
invariants and fail closed when null, missing, cross-stream or sequence
mismatched. Checkpoint roots bind the exact requested state revision, while run
roots prove scope only and do not prove revision provenance.

Prompt/message edits create immutable revisions. The user can edit a draft,
replace a queued item, branch/fork from the edit, replay exact historical
input, retry against current state or combine a historical base with selected
deltas. Original messages, attempts and telemetry remain available for compare
and rollback.

Retry explicitly offers `exact-historical`, `current-state`,
`historical-plus-selected-deltas` and `fresh-branch`. If A is retried and B is
later retried with current-state mode, B's context includes A's state before
and after retry plus accepted later changes, filtered by branch, permission,
supersession and relevance. While A is still running, B must explicitly use
the committed head, wait for A's accepted terminal state, fork in parallel or
cancel; it cannot claim to have inherited a result that is not yet accepted.
Exact-historical retry remains reproducible and intentionally excludes later
state. Provider transport retry, user-visible semantic retry, repair and
fallback remain distinct and preserve duplicate/billing safety.

While a run is active, the user can pause, stop, steer, queue, schedule, create
Btw, copy/duplicate, compare, edit future work, and create branch/fork/retry at
the latest durable cursor. Frozen in-flight provider input is never mutated;
the operation applies at a safe boundary, interrupts into a new attempt, queues
after termination or forks in parallel. The active-run ribbon exposes the
source/branch cursor, run/attempt/iteration identity, current atomic unit,
frozen-input revision, provider acceptance state, checkpoint availability,
pending controls and their selected resolution.

Compare covers prompts, state/context manifests, branches, provider/model/
effort/parameters, outputs, sources, files/code, tools/effects, tests, tokens,
cache, cost, latency and evaluation. Merge/promotion is conflict-aware and
never imports secrets, active grants or unknown side effects.

History and authority are separate lineages. A control intent, checkpoint,
branch, fork, clone, scheduler record, child-agent message or exact-historical
retry never carries execution permission. The native broker re-evaluates
current policy, exact target, environment, grants, approval receipts, secret
bindings and effect/reconciliation state immediately before each external
dispatch; expired or revoked authority is never resurrected.

See `../interaction/run-control-edit-retry.md`,
`../interaction/run-checkpoint-resume.md`,
`../interaction/continue-without-prompt.md`,
`../interaction/prompt-edit-state-aware-retry.md`,
`../interaction/active-run-variants-compare.md`,
`../schemas/run-control-operation.schema.json`,
`../schemas/state-revision-graph.schema.json`,
`../architecture/state-revision-graph.md`,
`../security/authority-continuity-and-replay.md`,
`../interaction/branching-copy-fork.md` and
`../interaction/queue-steer-schedule.md`.
