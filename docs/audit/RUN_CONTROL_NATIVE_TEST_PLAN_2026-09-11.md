---
id: OMNIA-AUDIT-RUN-CONTROL-NATIVE-TEST-PLAN-2026-09-11
title: Native run-control deterministic test plan
status: evidence-plan
version: 1.0.0
last_reviewed: 2026-09-11
supersedes:
  - OMNIA-AUDIT-RUN-CONTROL-TEST-RECEIPT-2026-08-14
---

# Native run-control deterministic test plan

This plan defines the smallest reproducible evidence required before Omnia
can claim that Pause, Resume, Continue, immutable edit, state-aware Retry,
Copy/Duplicate, Branch/Fork, Compare, Promote or Merge are native durable
operations. The plan intentionally separates pure contract validation,
SQLite durability, renderer projection and provider/process integration. A
passing reducer test is not evidence that a provider stream was paused, and a
passing UI test is not evidence that a run-control operation survived restart.

## Evidence vocabulary

Each test receipt must label the layer that actually ran:

| Layer | Evidence it may claim | Evidence it must not imply |
| --- | --- | --- |
| `contract` | enum/field/precondition validation and canonical serialization | durable storage or a real provider/tool pause |
| `reducer` | deterministic state transition and idempotent replay | SQLite transaction atomicity |
| `sqlite` | commit/rollback, CAS, scope, close/reopen and immutable facts | network/provider suspension |
| `renderer` | projection, focus, keyboard, screen-reader and redaction behavior | native command availability |
| `integration` | native command plus a deterministic fake transport/process | a third-party provider's capabilities |
| `packaged` | Windows packaged IPC/session behavior | untested source-tree behavior |

If a host lacks `cargo`, `rustc` or the packaged Windows runner, the receipt
must keep native/integration/packaged status `unverified` or `unavailable`.
Never promote a fixture-only or stale executable result to a runtime claim.

## Canonical deterministic fixture

Tests use one fixed fixture builder so every operation can be replayed without
wall-clock sleeps or a live provider:

```text
project:      project_test_01
conversation: conversation_test_01
branch:       branch_main_01
goal:         goal_science_01
task:         task_proof_01
run:          run_A_01
attempt:      attempt_A_01
prompt:       prompt_A_rev_01
state head:   state_S1
branch seq:   0..N
provider:     provider_fixture_https
model:        model_fixture
policy:       policy_test_v1
authority:    authority_test_read_only
```

The fake transport exposes named deterministic boundaries rather than sleeps:

```text
before_dispatch
provider_accepted
stream_chunk_1
tool_call_started
tool_call_completed
approval_waiting
safe_boundary
provider_outcome_unknown
terminal
```

Every fixture ID is opaque and stable. Prompt/response bytes, credentials,
cookies, attachment bytes and absolute paths stay in test-only storage and are
never copied into renderer receipts or operation manifests.

## Contract and canonicalization tests

The typed resolver/reducer should provide tests with names equivalent to the
following. Tests may be split across `run_control.rs` and a dedicated native
test target, but each assertion must remain deterministic and side-effect
free.

1. `run_control_kind_vocabulary_is_closed` accepts only
   `pause|resume|continue|edit|retry|copy|duplicate|branch|fork|compare|promote|merge`
   and rejects unknown/empty/whitespace values.
2. `run_control_state_vocabulary_is_closed` accepts only
   `resolved|applied|blocked|rejected|cancelled|failed` and rejects a terminal
   state without an outcome/receipt.
3. `run_control_actor_requires_non_secret_opaque_id` validates actor kind and
   bounded ID length, while rejecting prompt, credential, cookie, token and
   absolute-path values in actor metadata.
4. `run_control_idempotency_key_is_bounded_and_canonical` rejects empty,
   oversized and whitespace-only keys; canonical replay compares the complete
   operation payload, not just the key.
5. `run_control_state_base_modes_are_closed` accepts exactly
   `exact-historical`, `current-state`,
   `historical-plus-selected-deltas`, `fresh-branch` and rejects aliases or a
   missing mode.
6. `continue_requires_typed_non_empty_intent` rejects `none`, an empty root,
   absent state revision, an invalid budget or a loop guard with no chain ID.
7. `retry_requires_source_attempt_and_prompt_revision` rejects a retry without
   both source IDs and rejects a source attempt whose outcome is unknown unless
   an explicit reconciliation receipt is attached.
8. `compare_requires_two_distinct_revisions` rejects one revision, duplicates,
   mixed conversations or revisions outside the authorized branch scope.
9. `merge_and_promote_require_two_revisions_and_conflict_policy` rejects an
   empty conflict decision, stale expected head or an unknown external effect.
10. `pause_and_resume_require_run_checkpoint_lineage` rejects Resume without a
    source run, a valid checkpoint, lease/epoch and fresh authority decision.
11. `edit_requires_immutable_message_revision` rejects in-place message IDs,
    missing parent revision and content hashes that do not match the supplied
    bounded revision payload.
12. `active_run_policy_is_explicit` accepts only safe-boundary, interrupt,
    queue-after-terminal, fork-parallel or not-applicable; no operation may
    silently mutate frozen provider input.

## Native continuation and accepted-head integrity tests

The continuation resolver must prove native state-revision eligibility before
it persists an intent or dispatches a provider request. The following
regressions are mandatory and must leave durable projections unchanged on
rejection:

1. `continuation_uses_the_requested_historical_accepted_revision_after_head_advances`
   resolves an explicitly requested historical accepted revision even after a
   newer accepted head is appended; the selected ID must not be substituted.
2. `continuation_candidate_is_previewable_but_never_executable` allows a
   below-watermark candidate only for `preview`, `plan-only` and `draft-only`
   and rejects `execute` with `continuation_state_revision_not_eligible`.
3. `continuation_rejects_every_nonaccepted_status_for_execution` rejects
   candidate, rejected, superseded, outcome-unknown, conflicted, blocked,
   discarded and invalid revisions for executable continuation.
4. `continuation_candidate_beyond_accepted_watermark_is_rejected` rejects a
   candidate whose sequence is newer than the accepted-head watermark even for
   preview resolution.
5. `continuation_candidate_only_stream_remains_previewable_with_empty_head`
   permits preview of a sequence-zero candidate-only stream but refuses
   executable continuation when no accepted revision exists.
6. `continuation_rejects_corrupt_accepted_head_projections_fail_closed`
   covers null/missing heads, impossible null-head sequences, candidate or
   cross-stream heads, missing revisions and sequence mismatches; each must
   return `state_revision_integrity_failed`.
7. `continuation_checkpoint_root_binds_exact_state_revision` accepts a valid
   checkpoint root only with its exact persisted `state_revision_id`; swapping
   the revision must return `continuation_root_not_found`.
8. `continuation_replay_is_immutable_and_payload_drift_creates_no_second_intent`
   returns the same immutable receipt for exact replay, rejects changed
   payload under the same idempotency key as `payload_drift`, and keeps one
   durable intent row.
9. `continuation_rejects_state_revision_from_another_conversation` rejects a
   cross-conversation state revision with `state_revision_scope_conflict`.

These tests also verify that run roots prove run/conversation/branch scope only,
checkpoint roots pin the exact state revision, accepted-head/watermark
projections are native-owned, and no renderer-supplied head substitution is
used. The storage probe may report `nativeRuntime: not-tested-by-this-probe`;
that is not evidence of Rust compilation or native runtime success.

## Reducer and replay tests

The operation reducer must be a pure function over immutable facts and an
observed head. Replaying the same fact sequence must produce byte-equivalent
state and receipt projections.

1. `pause_requested_checkpointing_paused_is_monotonic`: a pause progresses
   `pause_requested -> checkpointing -> paused`; it cannot jump directly to a
   clean `paused` state while provider acceptance or a non-interruptible effect
   is still unknown.
2. `cancellable_provider_pause_reports_abort_then_checkpoint`: the fake stream
   records abort requested, terminal attempt evidence and then a checkpoint;
   the projection never reports a paused stream before the checkpoint fact.
3. `tool_or_external_effect_pause_requires_reconcile`: pending tool/effect
   becomes `pending-effect-checkpoint` or `outcome-unknown`, never a false clean
   pause.
4. `resume_creates_new_execution_segment`: Resume preserves the source run and
   checkpoint IDs but allocates a new segment/attempt lineage and rechecks
   authority, lease, provider acceptance and idempotency.
5. `continue_after_answer_uses_typed_intent`: no text is generated as an empty
   prompt; the continuation preview names goal/task/root, selected next action,
   state watermark, model/effort, tool/approval envelope, budget and stop rule.
6. `continue_from_checkpoint_and_empty_chat_are_safe`: checkpoint Continue may
   resume only after validation; empty-chat Continue creates a planning/action
   chooser unless an explicitly selected starter workflow permits execution.
7. `continue_loop_guard_stops_duplicate_progress`: duplicate action signature,
   no-progress count, max segments, token/cost/time budget or cycle detection
   creates a blocked/checkpointed terminal receipt.
8. `edit_preserves_original_history`: editing a finalized user message creates
   a child revision/branch; the original message, assistant output, telemetry
   and provider input remain unchanged.
9. `retry_state_base_modes_select_exact_manifest`: historical, current,
   selected-delta and fresh-branch modes produce distinct, inspectable context
   manifests with included/excluded reasons and a pinned watermark.
10. `retry_A_accepted_result_is_visible_to_B_current_state`: A retry's accepted
    output becomes a typed state revision; B current-state retry captures that
    revision, while B exact-historical excludes it.
11. `retry_B_waits_or_forks_when_A_is_in_flight`: the user must choose
    current-committed-head, wait dependency, parallel fork or cancel; B never
    claims to have seen an unaccepted A result.
12. `outcome_unknown_is_excluded_until_reconciled`: unknown provider/tool
    effects are omitted from automatic current-state context and block replay
    until a reconciliation decision is durable.
13. `branch_and_fork_pin_source_cursor`: source branch/sequence and output
    disposition are immutable; transient renderer text cannot become durable
    branch content without an explicit interrupted-artifact choice.
14. `compare_is_pinned_and_live_refresh_is_separate`: compare baseline remains
    fixed at its two cursors; live refresh is a separately labelled subscription.
15. `promote_or_merge_creates_new_revision`: promotion/merge preserves all
    parents, requires explicit conflict decisions and never imports secrets,
    grants, cookies or unknown external effects.

## SQLite durability and concurrency tests

These tests require the actual native `Storage` transaction boundary. Each
test records row counts, journal cursors and branch heads before and after a
failure to prove rollback is complete.

1. `run_control_append_is_atomic_with_state_revision`: operation fact, state
   revision, journal event, head CAS and receipt commit together or none do.
2. `run_control_replay_is_idempotent_for_identical_payload`: same key and
   byte-equivalent payload returns the original immutable receipt without a
   second revision/journal event.
3. `run_control_replay_rejects_payload_drift`: same key with any changed field
   (including state base, actor, policy, expected head or source cursor) returns
   a conflict/integrity error and leaves all rows unchanged.
4. `run_control_stale_head_returns_conflict_without_rebase`: competing client
   mutation returns observed/current heads and a safe diff; it never silently
   applies against a newer branch.
5. `run_control_scope_guards_reject_cross_conversation_branch_run`: every
   source/run/attempt/message/checkpoint/revision combination is checked inside
   the transaction and cannot leak another conversation's data.
6. `run_control_immutable_facts_reject_update_and_delete`: SQL triggers or
   native guards reject mutation/deletion of accepted operations, receipts,
   checkpoints, continuation intents and message revisions.
7. `run_control_close_reopen_replays_exact_receipt`: close/reopen preserves
   operation order, immutable hashes, accepted head and journal watermark.
8. `pause_checkpoint_crash_recovery_is_truthful`: crash at each named boundary
   recovers to requested/checkpointing/outcome-unknown as appropriate; it never
   invents `paused` or `completed`.
9. `resume_rejects_expired_lease_changed_policy_or_revoked_authority`: each
   drift leaves the source checkpoint intact and returns an actionable blocked
   receipt.
10. `two_clients_cas_exactly_one_applies`: concurrent retry/pause/branch actions
    with the same expected head yield one applied receipt and one stale/conflict
    receipt; replay converges on every reader.
11. `branch_isolation_excludes_sibling_only_revisions`: current-state context
    cannot import sibling branch facts unless selected and explicitly promoted.
12. `failure_injection_rolls_back_control_and_journal`: trigger/transaction
    failure after each insert/update leaves no orphan operation, receipt,
    checkpoint, continuation intent or message revision.

## Provider/process integration fixtures

Use the existing deterministic provider-fault harness and named checkpoints,
not real network sleeps. Minimum scenarios:

| Scenario | Required disposition | Forbidden claim |
| --- | --- | --- |
| stream before acceptance | cancel/failed, no clean pause | provider was paused |
| accepted cancellable stream | abort requested, then checkpoint/reconcile | old stream resumed in place |
| accepted non-idempotent stream | outcome unknown until reconciliation | automatic duplicate retry |
| tool process at safe boundary | cooperative checkpoint | arbitrary process suspension |
| approval wait | checkpoint at approval gate | approval silently granted on resume |
| child agent running | bounded child policy/lease | child keeps parent authority forever |
| remote non-pausable work | draining/detached/unknown | remote operation stopped |

The fixture must assert request/attempt lineage, provider acceptance evidence,
retry schedule, billing/usage authority, checkpoint hash and final journal
cursor. It must not send secrets or use anti-bot/privilege-bypass behavior.

## Renderer and accessibility tests

The renderer consumes only the typed native projection. Focused tests should
cover:

1. run card shows `state | phase | branch | model/effort | elapsed |
   usage/cost coverage | next safe boundary` and labels unknown/partial values.
2. active controls are keyboard reachable, have accessible names and return
   focus to the invoking control after a dialog closes.
3. Escape/outside-click closes a transient panel but never drops a pending
   durable operation; destructive dismissal requires explicit confirmation.
4. state transitions are announced once in the screen-reader live region;
   reduced-motion mode retains a textual progress signal.
5. stale renderer action returns a visible conflict card and does not invoke a
   second command after the window gains focus.
6. retry inspector renders state-base, watermark, included/excluded context,
   model/effort, budget and redaction coverage without raw prompt, response,
   credential, cookie, URL or filesystem path.
7. A/B retry lineage renders source, candidate, accepted result and B's exact
   selected state base; transient/unaccepted/unknown data is visibly excluded.
8. compare pins left/right revisions and labels live-follow as a separate mode.

## Security and redaction assertions

Serialize every renderer-facing operation, checkpoint and receipt to JSON and
assert that these strings never occur:

```text
api key | bearer | authorization | cookie | password | session token |
prompt body | response body | reasoning body | attachment bytes |
absolute local path | raw provider URL | browser vault | private key
```

Opaque IDs, SHA-256 hashes, bounded provider endpoint fingerprints, policy
revision IDs and diagnostic handles are allowed. Unknown/unavailable values
must remain typed null/coverage states, not `0`, `false` or an invented empty
string.

## Required receipt format

Every focused run-control run should emit a small machine-readable receipt:

```text
RUN_CONTROL_TEST_RECEIPT: PASS|FAIL|UNAVAILABLE
layer: contract|reducer|sqlite|renderer|integration|packaged
source_revision: <git/twin snapshot>
tests: <passed>/<discovered>
rollback: pass|fail|not-run
redaction: pass|fail|not-run
restart: pass|fail|unavailable
concurrency: pass|fail|unavailable
native_runtime: pass|unverified|unavailable
```

The receipt must include the exact command, host date (September 11, 2026 for
this plan), binary/source hash where applicable and a truthful limitation
paragraph. A schema or TypeScript test alone cannot upgrade the capability
ledger from `planned` to `partial`/`verified` without matching native evidence.

## Promotion gate

Do not mark run-control capabilities shipped until all of the following exist
on one source snapshot:

- typed resolver/reducer tests above pass;
- native SQLite atomicity, scope, immutable, restart and two-client CAS tests
  pass on a supported toolchain;
- deterministic provider/process fixtures demonstrate truthful pause
  dispositions and reconciliation;
- renderer tests show the same journal-derived state and safe disabled reasons;
- accessibility and redaction tests pass; and
- Project Twin, implementation status and capability ledger cite the exact
  receipts while retaining any unavailable native/package gates.

Until then, keep the capability status `planned` (or `partial` only for the
already verified prerequisite state-revision graph) and list the missing gate
instead of inferring completion from a button, schema or stale test artifact.
