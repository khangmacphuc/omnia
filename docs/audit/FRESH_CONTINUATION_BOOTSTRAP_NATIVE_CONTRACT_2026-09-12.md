---
id: OMNIA-AUDIT-FRESH-CONTINUATION-BOOTSTRAP-2026-09-12
title: Native fresh continuation bootstrap contract
status: design-blocker
version: 1.0.0
last_reviewed: 2026-09-12
---

# Native fresh continuation bootstrap contract

## Decision

Fresh continuation modes must be bootstrapped by the native SQLite authority
before they can become executable. The renderer may request a fresh goal,
starter workflow, or isolated branch, but it must never invent the initial
state-revision identifier, digest, timestamp, watermark, cursor, branch
sequence, stream identifier, accepted-head projection, or continuation receipt.

Until the transaction described below exists, rejecting `fresh-branch` and
`fresh-goal-start` with `run_control_bootstrap_required` is the correct
fail-closed behavior. A synthetic renderer envelope is not a bootstrap fact.

This document records the implementation contract and regression matrix. It
does not claim that fresh bootstrap is already shipped.

## Current native boundary

The relevant code paths are:

- `src-tauri/src/run_control.rs`
  - `ResolveContinuationIntentRequest` currently requires
    `state_revision_id`.
  - `ResolvedRunControlOperation::to_state_revision_append_request()` rejects
    `fresh-branch` and `fresh-goal-start` with `run_control_bootstrap_required`.
  - `validate_state_base()` accepts the shape of fresh modes, but shape
    validation is not authority.
- `src-tauri/src/storage.rs`
  - `resolve_continuation_intent()` persists the immutable continuation row
    only after root, state scope, eligibility, provider and replay checks.
  - `validate_native_state_base()` rejects fresh state bases until a native
    bootstrap receipt exists.
  - `append_state_revision_in_transaction()` is the reusable transaction-aware
    primitive for stream, root revision, parent/edge facts, journal, accepted
    head and idempotency receipt.
  - `ensure_continuation_root()` validates goal, task, starter-workflow,
    checkpoint, run and branch roots in profile/conversation/branch scope.
- `src-tauri/src/native_commands.rs`
  - `continuation_intent_resolve` is the native IPC boundary and must remain
    the only caller that can authorize a durable continuation intent.

## Required atomic transaction

The fresh path must use one native writer transaction (or one outer
`TransactionBehavior::Immediate` transaction with savepoints) for all of the
following steps:

```text
validate request shape and idempotency address
  -> resolve conversation/branch and authoritative root
  -> validate root lifecycle, profile, project and optional anchors
  -> resolve or create the native state-revision stream
  -> append an accepted bootstrap root revision
  -> bind the root and revision to one immutable native fact
  -> create the immutable bootstrap/continuation receipt
  -> persist continuation_intents
  -> commit
```

No provider request, scheduler dispatch, tool call, external side effect, or
renderer success response may occur before that commit succeeds.

The public `append_state_revision()` must not be called from inside the
continuation transaction because it opens a second transaction. Reuse
`append_state_revision_in_transaction()` or introduce a transaction-aware
bootstrap helper that returns the same typed mutation result.

## Renderer input contract

The renderer may provide only bounded intent data:

- `conversationId` and `branchId` as routing hints;
- `rootKind` and `rootId` as a native lookup address;
- `intentKind`, execution mode, model profile, effort, tools, budget, loop
  guard, approval-policy revision and idempotency key.

For a fresh mode, the renderer must not provide an authoritative
`stateRevisionId`. The native request should either make this field optional or
use a separate native bootstrap request. If an ID is supplied for a fresh
request, native code must ignore it or reject the request; it must never adopt
it as the new revision identity.

The renderer must never be authoritative for:

- `stateRevisionId`, `streamId`, branch sequence or accepted head;
- digest or canonicalization revision;
- `resolvedAt`, watermark and cursor values;
- receipt ID, receipt JSON, created timestamp or replay result;
- root status, current revision, deletion state, project scope or task
  dependency validity.

## Root authorization rules

The bootstrap transaction must run the same root checks used by ordinary
continuation resolution, but without requiring a pre-existing state revision
anchor for a genuinely unanchored root:

### Goal

- `goals.profile_id = profile_default`;
- goal is not deleted;
- status is one of the existing allowed statuses (`draft`, `active`, `paused`);
- current goal revision exists and belongs to the goal;
- project, conversation and branch constraints match the selected scope;
- if the goal already has a state anchor, it must match the newly created
  bootstrap revision or the request must fail closed.

### Task

- profile, deletion, status, current-revision and project/conversation/branch
  checks pass;
- current task revision and parent goal revision belong to their entities;
- parent goal is valid in the same scope;
- `blocks`/`requires` dependency graph has no cycle;
- any existing task/goal state anchor must match the bootstrap revision.

### Starter workflow

- workflow is in the default profile, not deleted, `status = active` and
  `enabled = 1`;
- current workflow revision exists and belongs to the workflow;
- project, conversation and branch constraints match;
- any existing workflow/revision state anchor must match the bootstrap
  revision.

### Branch or isolated fresh branch

- branch belongs to the selected conversation and default profile;
- branch is not deleted;
- a fresh branch must not silently reuse another branch's accepted head;
- if a fork source is requested, the source branch/message/checkpoint must be
  resolved natively and recorded as an explicit parent/edge fact.

## Bootstrap revision requirements

The native bootstrap revision must satisfy all normal state-revision rules:

- canonical ID with the `state_rev_` prefix;
- selected conversation/branch stream and default profile;
- `kind = root` for an empty isolated stream, or the explicitly contracted
  branch/fork kind when a source parent is intentionally selected;
- `status = accepted` exactly;
- empty parent set for a true root;
- branch sequence and accepted-head CAS generated by native storage;
- native SHA-256 state digest and canonicalization revision;
- native `watermark_json` and causal cursor facts;
- bounded redacted manifest describing the root kind and authority source;
- matching journal event, operation fact, idempotency receipt and accepted-head
  projection;
- no accepted-head overflow, duplicate root, cross-stream parent, or orphan
  journal/edge/idempotency row.

The bootstrap manifest must not contain prompt bodies, credentials, cookies,
provider payloads, attachment bytes, raw filesystem paths or secrets.

## Receipt and replay semantics

The bootstrap address must be idempotent. The canonical replay address should
include the default profile, root identity, selected scope, fresh mode, intent
configuration and idempotency key hash. The persisted receipt must contain the
native revision/stream/journal facts needed to replay the original result.

Exact replay:

- returns the original immutable receipt and continuation envelope;
- does not append another revision, journal event, parent, edge, head update,
  bootstrap fact or continuation row;
- does not reread a newer mutable branch head and rewrite history.

Payload drift:

- the same idempotency key with any canonical payload difference returns
  `payload_drift`;
- it creates no second bootstrap fact and no second continuation intent.

Replay must fail closed if a later integrity check proves that:

- the root was deleted or made inactive;
- the root/revision scope no longer matches;
- the bootstrap revision is no longer `accepted` or is outside the native
  accepted-head horizon;
- the persisted receipt, operation fact, digest, journal cursor or canonical
  payload hash was tampered with;
- the root-to-revision lineage no longer matches.

## Failure and rollback contract

Any error before commit must roll back every row created by the attempted
bootstrap, including:

```text
state_revision_streams
state_revision_heads
state_revisions
state_revision_parents
state_revision_edges
state_revision_journals
state_revision_events
state_revision_idempotency
state_revision_operation_facts
continuation_bootstrap_receipts (if introduced)
continuation_intents
run-control operation facts
```

The transaction must not leave an empty stream with a non-zero head, an
accepted head without a revision, a revision without its journal/operation
fact, a receipt pointing to a missing revision, or a continuation intent
pointing to a non-executable revision.

## Concurrency contract

Concurrent calls with the same idempotency key must converge to one immutable
bootstrap fact. Use an immediate writer transaction (or equivalent native
serialization) around the idempotency lookup and insert. The losing caller
must receive the exact persisted receipt, not a uniqueness error and not a
second root.

Concurrent calls with different idempotency keys must use accepted-head CAS and
root uniqueness guards. At most one can create the first accepted root in an
empty stream. A stale caller receives a typed conflict and leaves no orphan
facts.

## Provider dispatch ordering

Provider dispatch is downstream of native authority. The sequence must be:

```text
native bootstrap commit
  -> native continuation receipt returned
  -> scheduler/provider prepares input from the receipt
  -> provider request dispatch
```

If the provider fails, the native bootstrap fact remains an accepted historical
state and retry/recovery must create a new explicit state/attempt lineage. It
must not mutate or overwrite the original bootstrap receipt.

## Required regression tests

At minimum, add native tests with the following names or equivalent coverage:

```text
fresh_goal_bootstrap_creates_native_accepted_revision_and_continuation_receipt
fresh_starter_workflow_bootstrap_creates_native_accepted_revision
fresh_branch_bootstrap_creates_isolated_native_root
fresh_goal_bootstrap_exact_replay_returns_original_receipt
fresh_goal_bootstrap_payload_drift_is_rejected
fresh_goal_bootstrap_unknown_root_is_rejected
fresh_goal_bootstrap_deleted_root_is_rejected
fresh_goal_bootstrap_inactive_root_is_rejected
fresh_goal_bootstrap_cross_profile_root_is_rejected
fresh_goal_bootstrap_cross_project_root_is_rejected
fresh_goal_bootstrap_cross_conversation_root_is_rejected
fresh_goal_bootstrap_cross_branch_root_is_rejected
fresh_goal_bootstrap_root_anchor_mismatch_is_rejected
fresh_goal_bootstrap_rolls_back_stream_and_all_facts_on_failure
fresh_goal_bootstrap_does_not_leave_orphan_head_or_journal
fresh_goal_bootstrap_concurrent_same_key_has_one_bootstrap_fact
fresh_goal_bootstrap_replay_after_revision_ineligible_fails_closed
fresh_goal_bootstrap_replay_after_root_deleted_fails_closed
fresh_goal_bootstrap_does_not_dispatch_provider_before_commit
```

Rejected requests should assert that counts remain unchanged in every affected
state/continuation table, not only that an error code was returned.

## Implementation order

1. Split root identity/scope validation from state-anchor validation.
2. Add a transaction-aware native bootstrap helper around
   `append_state_revision_in_transaction()`.
3. Add an immutable bootstrap receipt or extend the continuation receipt with
   explicit bootstrap provenance and canonical payload hash.
4. Make the fresh request's state revision optional only for fresh modes;
   preserve mandatory state revision validation for current/historical modes.
5. Persist continuation intent only after the bootstrap revision and receipt
   are validated in the same transaction.
6. Add exact replay, payload-drift, rollback, tamper and concurrency tests.
7. Run static/schema/storage/frontend probes. Do not claim native Rust
   compilation or runtime until `cargo check`/`cargo test` execute on a host
   with the Rust toolchain.

## Non-goals

This contract does not authorize:

- renderer-supplied synthetic revision IDs or timestamps;
- creating provider attempts before the native commit;
- making a `candidate`, `rejected`, `blocked`, `invalid`, `discarded`,
  `superseded`, `conflicted` or `outcome-unknown` revision executable;
- weakening existing profile/project/conversation/branch scope checks;
- silently converting a historical continuation into current-head execution;
- treating a root row's mere existence as permission to execute arbitrary work.

