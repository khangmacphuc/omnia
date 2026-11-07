---
id: OMNIA-ULTRA-ARCH-RUN-CONTROL-NATIVE-MAPPING
title: Run-control operation to state-revision and native receipt mapping
status: normative-target
version: 1.0.0
last_reviewed: 2026-09-11
supersedes: []
---

# Run-control to native state mapping

This contract gives the renderer, native kernel, recovery worker and harness a
single mapping for pause, resume, Continue, edit, retry, branch, fork, compare,
promote, merge, copy and duplicate. It closes a common source of drift: a UI
action is not itself a state revision, and a provider attempt is not the same
thing as the durable state that may later be accepted into a branch.

Cursor authority and provenance are defined by
`../../adr/0008-run-control-multi-stream-cursor-authority.md`; this mapping must
not be implemented without that authority contract.

The rich portable graph is defined by
`../schemas/state-revision-graph.schema.json`. The operation envelope is
`../schemas/run-control-operation.schema.json`; its `stateBase` is a resolved,
immutable input selection, not a live pointer to the current branch head.

## Canonical operation mapping

The graph edge always points from the derived/new fact to the source/parent
fact (`child -> parent`). A row marked **read-only** does not append a state
revision or edge; it may still create an audit/read receipt in a separate
projection.

| Operation | Durable revision kind | Graph edge | State-base rule | Mutation boundary |
| --- | --- | --- | --- | --- |
| `pause` | `checkpoint` (when a truthful checkpoint exists) | `checkpoint-of` | Pin the active run/checkpoint cursor; never claim a clean pause while an effect is unknown | Request first; commit only the resolved disposition |
| `resume` | `resume` | `resumes-from-checkpoint` | Validate the checkpoint, leases, approvals, provider acceptance and external effects before dispatch | New execution segment; old attempt remains immutable |
| `continue` | `continuation` | `continues-from` | Use a typed intent; `none` is invalid. Resolve current state or an explicit fresh-goal bootstrap | New segment only after loop/budget/authority checks |
| `edit` | `prompt-edit` | `edits` | Preserve the source message/revision; choose draft, queued replacement, historical replay or edit-as-branch | Never mutate frozen provider input |
| `retry` | `retry-result` | `retries` | Explicitly pin `exact-historical`, `current-state`, `historical-plus-selected-deltas` or `fresh-branch` | Fresh semantic attempt unless same-attempt transport retry is proven safe |
| `branch` | `branch` | `branches-from` | Pin source cursor and re-evaluate authority for the destination branch | Isolated child branch; source branch is unchanged |
| `fork` | `fork` | `forks-from` | Pin source cursor and choose parallel/isolated execution policy | Parallel route; no unaccepted effects are inherited |
| `merge` | `merge` | `merges-from` | Require at least two pinned parents and explicit conflict resolution | New merge decision; parents remain immutable |
| `promote` | `promotion` | `promotes` | Promote only a candidate revision whose authority, conflicts and evidence are valid | New accepted decision; candidate is retained for comparison |
| `copy` | none | none | Read a pinned snapshot and preserve source identities | Read-only; no credentials, secrets or unknown effects are copied |
| `duplicate` | `branch` or `fork` | matching `branches-from` or `forks-from` | Duplication is an explicit branch/fork policy, never a blind deep copy | Fresh identity and authority evaluation |
| `compare` | none | none | Pin two or more revisions/cursors before diffing | Read-only; live-follow is a separate labelled subscription |

`pause` is intentionally mapped to the resulting checkpoint rather than to a
fictional frozen network stream. If the target can only be cancelled and
reconciled, the checkpoint disposition is `cancel-then-reconcile` or
`outcome-unknown`; the operation must not report `paused` as if suspension had
been proven.

## Native continuation eligibility and root binding

`continue`, `resume` and executable `retry` must resolve an accepted
state-revision row from the same native conversation, branch and stream. The
revision must be within the accepted-head watermark. A historical accepted
revision remains the requested base even after a newer accepted head exists;
the resolver never silently substitutes that newer head. Candidate, rejected,
superseded, `outcome-unknown`, conflicted, blocked, discarded and invalid
revisions are preview/plan/draft-only and must be marked non-executable.

The accepted-head projection and watermark are native-owned CAS invariants. A
null/missing/cross-stream head, an impossible null-head sequence, a missing
revision or a head sequence/status mismatch fails closed as an integrity error.
Checkpoint roots bind to the exact requested `state_revision_id`; run roots
validate run/conversation/branch scope only and do not establish that the
state revision was produced by the run. Exact replay returns the original
immutable receipt, while idempotency-key payload drift is rejected without a
second durable intent.

## Required identity and causality

Every mutating operation carries an immutable operation ID, actor, conversation
and branch scope, idempotency key, expected head/version, source cursor and a
resolved `stateBase`. The result receipt records the resulting state revision,
run/attempt/checkpoint/branch IDs and any diagnostic or reconciliation ID.

The source facts remain addressable after edit, retry, branch, fork, merge or
promotion. A child revision may have multiple parents for a merge, but every
parent ID must be present in the pinned state graph and in the same authorized
read watermark. No renderer-generated ID, timestamp, actor, cursor or hash may
be invented to fill a missing native fact.

The operation and graph layers use these identity rules:

- `pause` requires `sourceRunId`; the resolved checkpoint carries the active
  run, state revision, cursor, content hash, provider-acceptance evidence and
  reconciliation IDs.
- `resume` requires `sourceRunId` and `continuationIntent = resume-checkpoint`.
  It creates a new segment and revalidates the checkpoint instead of reusing a
  dead stream.
- `continue` requires a non-`none` continuation intent. An empty composer
  value is not a valid substitute for the typed intent.
- `edit` requires source message ID, source prompt-revision ID and a new edit
  revision ID. The original content hash and telemetry remain immutable.
- `retry` requires source attempt ID and source prompt-revision ID. Its state
  base and snapshot timing are explicit in the operation receipt.
- `compare` requires at least two distinct state-revision IDs. `merge` and
  `promote` require at least two parent/candidate IDs and explicit conflicts.

## State-base and context pinning

`stateBase` is resolved before queueing, approval, background handoff or a
process boundary. The executor consumes that exact digest and watermark; it
does not reread a mutable head after confirmation.

| Mode | Meaning | Typical operations |
| --- | --- | --- |
| `exact-historical` | Reuse the selected frozen historical input/state, subject to current authorization | historical retry, replay, compare |
| `current-state` | Compile from the authorized branch head at a captured watermark | current-state retry, Continue, steer-after-boundary |
| `historical-plus-selected-deltas` | Add explicitly named later revisions with origin, hash and conflict result | selected-delta retry, merge preview |
| `fresh-branch` | Start an isolated branch with selected goal/prompt/authority only | branch, fork, fresh retry |
| `fresh-goal-start` | Bootstrap a configured goal or starter workflow without inventing authority | Continue in an empty chat |

The context compiler emits included, omitted and retrieval-eligible units,
their revisions/hashes, data class, inclusion reason and token/byte estimate.
Secrets, cookies, revoked grants, sibling-only work and `outcome-unknown`
effects are denied or redacted; they are never silently copied into a provider
request.

## Result, blocked and unknown states

An operation may be `resolved`, `applied`, `blocked`, `rejected`, `cancelled`
or `failed`. `blocked` must include a non-empty `result.blockedReason` and an
actionable diagnostic when available. A provider or external effect with an
uncertain outcome is represented explicitly and remains excluded from replay
until reconciliation or an explicit user decision establishes safe use.

The native receipt is the source of truth for these distinctions. A renderer
may show a compact state ribbon, but it must not turn `requested`,
`checkpointing`, `reconciling` or `outcome-unknown` into a green “done” badge.
Unknown fields and secret-bearing payloads are rejected at the renderer
boundary.

## CAS, idempotency and recovery

The kernel appends the operation fact and state-revision mutation under one
transactional journal watermark. A stale expected branch head returns an
observed-versus-current conflict; it never silently rebases. The caller must
choose rebase/recompile, queue-after, fork, discard or cancel.

Idempotency replays the original receipt, not a second mutation. If a provider
request may already have been accepted, recovery first reconciles acceptance,
billing and external effects. A semantic retry, repair, fallback route or
changed context always receives a fresh attempt ID and provenance. Lease epoch,
policy revision, attachment/workspace revision and authority continuity are
revalidated before resume or dispatch.

## Native/renderer boundary

`native-state-revision-graph-read-v1` is deliberately smaller than the rich
portable graph. It contains bounded, content-free summaries only. Consumers
must not validate that IPC projection as a direct instance of the rich schema
or infer omitted manifests, actors, policy, routing/cache, diagnostics or
timestamps. A future export adapter may join immutable typed facts from one
SQLite snapshot; missing history must remain explicit partial/review-required
state.

## Minimum acceptance vectors

The implementation is not accepted until evidence covers:

- resume with expired lease, changed policy, missing attachment and unknown
  external effect;
- Continue from incomplete output, a paused checkpoint and an empty chat,
  including no-progress and budget loop guards;
- edit/retry without mutating source history, with all four state-base modes;
- retry A followed by current-state retry B, where only accepted A state is
  visible and an unknown A effect is excluded;
- two-client stale-head CAS, idempotent duplicate submission and crash/restart
  recovery without duplicate provider billing;
- branch/fork isolation, merge/promotion conflicts and read-only copy/compare;
- redacted native projection, keyboard/screen-reader status and truthful
  requested/checkpointing/paused/reconciling/unknown UI states.

See `../interaction/run-control-edit-retry.md`,
`../interaction/run-checkpoint-resume.md`,
`../interaction/continue-without-prompt.md`,
`../interaction/prompt-edit-state-aware-retry.md`,
`../schemas/run-control-operation.schema.json`,
`../schemas/run-checkpoint.schema.json` and
`../security/authority-continuity-and-replay.md`.
