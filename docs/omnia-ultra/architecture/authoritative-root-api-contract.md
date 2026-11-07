---
id: OMNIA-ULTRA-ARCH-AUTHORITATIVE-ROOT-API
title: Authoritative-root native API contract
status: normative-target
last_reviewed: 2026-09-15
---

# Authoritative-root native API contract

Status: normative design contract for the native Goal/Task/Starter Workflow
slice. The current source contains the guarded storage/Tauri paths described
here, including revision-head compare-and-swap (CAS). Source/static presence
does not claim Rust compilation, native runtime, packaging, or product
completion; schema presence alone is never API-completeness evidence.

## 1. Authority boundary

`goals`, `tasks`, and `starter_workflows` are native authority roots for
continuation planning and durable project state. Renderer code may propose an
ID, title, definition, or desired transition, but it cannot create authority
by inventing an ID or by writing SQL-shaped data into a renderer projection.

Every authoritative-root create, revision, or lifecycle mutation must be
resolved and committed in one native SQLite write transaction. The transaction
owns:

1. profile/project/conversation/branch scope resolution;
2. canonical JSON validation and SHA-256 calculation;
3. root/revision identity allocation or exact idempotent replay;
4. optional state-revision anchor validation;
5. lifecycle transition validation;
6. dependency-cycle validation for task edges;
7. the root/revision write, current-revision pointer update, and immutable
   root mutation receipt.

Task-dependency creation is also one native write transaction, but creates an
immutable edge with natural uniqueness rather than a root receipt/idempotency
envelope. The bridge returns bounded verified snapshots, not the full receipt
row; any future receipt projection must remain bounded/redacted. Never return
credentials, cookies, provider payloads, raw prompts, unrestricted paths,
attachment bytes, or opaque filesystem manifests.

## 2. Root vocabulary and identity

| Root kind | Root ID prefix | Revision ID prefix | Live statuses | Terminal/lifecycle statuses |
| --- | --- | --- | --- | --- |
| `goal` | `goal_` | `goal_revision_` | `draft`, `active`, `paused` | `completed`, `archived`, `cancelled` |
| `task` | `task_` | `task_revision_` | `pending`, `ready`, `in_progress`, `blocked` | `completed`, `cancelled`, `archived` |
| `starter-workflow` | `starter_workflow_` | `starter_workflow_revision_` | `draft`, `active` | `archived` |

IDs are native-generated (UUID/ULID-compatible opaque identifiers). A caller
may provide an idempotency key, but it may not choose an arbitrary root ID for
the create operation. Read and revision operations may address a native ID
only after exact profile and lineage checks succeed.

Root identity and lineage are immutable after creation:

- `profile_id` never changes;
- `project_id`, `conversation_id`, and `branch_id` never change;
- a task's `goal_id` never changes;
- root creation timestamps never change;
- revisions are append-only and cannot be edited or physically deleted.

Lifecycle deletion is represented by `archived`/`cancelled` plus
`deleted_at_ms` where the table supports it. SQL `DELETE` remains forbidden by
the existing immutable-delete triggers.

## 3. Command surface

The eventual guarded Tauri surface should use explicit commands. Names are
normative suggestions; a compatible naming scheme is acceptable only if the
scope, receipt, and replay semantics remain identical.

### Root commands

- `goal_create`, `goal_read`, `goal_list`; `task_create`, `task_read`, `task_list`;
  `starter_workflow_create`, `starter_workflow_read`, `starter_workflow_list`

### Revision commands

- `goal_revision_create`, `goal_revision_read`; `task_revision_create`,
  `task_revision_read`; `starter_workflow_revision_create`,
  `starter_workflow_revision_read`

### Lifecycle and graph commands

- `goal_status_update`, `task_status_update`; `task_dependency_create`,
  `task_dependency_list`; `starter_workflow_status_update`,
  `starter_workflow_enabled_update`

A generic command may be used internally, but public IPC requests should keep
the root kind explicit and use `deny_unknown_fields` so a renderer cannot
silently smuggle fields from another root type.

### Live preview command-to-bridge mapping

The following names are the current preview surface, not merely naming
suggestions. They are registered in `src-tauri/src/lib.rs`, delegated through
thin wrappers in `src-tauri/src/native_commands.rs`, and invoked by typed
methods in `src/lib/desktop.ts`.

| Operation | Renderer bridge method(s) | Tauri command(s) |
| --- | --- | --- |
| Goal root read/write | `createGoal`, `readGoal`, `listGoals` | `goal_create`, `goal_read`, `goal_list` |
| Goal revision | `readGoalRevision`, `createGoalRevision` | `goal_revision_read`, `goal_revision_create` |
| Goal lifecycle | `updateGoalStatus` | `goal_status_update` |
| Task root read/write | `createTask`, `readTask`, `listTasks` | `task_create`, `task_read`, `task_list` |
| Task revision | `readTaskRevision`, `createTaskRevision` | `task_revision_read`, `task_revision_create` |
| Task lifecycle | `updateTaskStatus` | `task_status_update` |
| Task dependency graph | `createTaskDependency`, `listTaskDependencies` | `task_dependency_create`, `task_dependency_list` |
| Starter Workflow root read/write | `createStarterWorkflow`, `readStarterWorkflow`, `listStarterWorkflows` | `starter_workflow_create`, `starter_workflow_read`, `starter_workflow_list` |
| Starter Workflow revision | `readStarterWorkflowRevision`, `createStarterWorkflowRevision` | `starter_workflow_revision_read`, `starter_workflow_revision_create` |
| Starter Workflow lifecycle | `updateStarterWorkflowStatus`, `updateStarterWorkflowEnabled` | `starter_workflow_status_update`, `starter_workflow_enabled_update` |

Each wrapper delegates the typed request to its corresponding `Storage`
method. This mapping is source/static evidence, not proof of Rust compilation
or native runtime behaviour.

## 4. Mutation request envelope

### 4.1 Current preview profile and session binding

The preview DTOs are narrower than the eventual multi-profile envelope. None
of the Goal, Task, Starter Workflow, or dependency requests accepts `profileId`;
native storage binds them to:

```text
profileId = profile_default (native DEFAULT_PROFILE_ID)
```

Returned roots, summaries, and receipts still carry the bound `profileId`.
`x-omnia-session` proves webview protocol negotiation only; it is not durable
authentication and does not select a profile.

The future multi-profile target may add `profileId` or derive it from an
authenticated profile context. Native code must reject a mismatch and never
switch profile implicitly. Until then, it is not renderer-supplied.

### 4.2 Current root/revision request shapes

Current root-create DTOs (camelCase IPC names) contain:

- Goal: optional `projectId`, `conversationId`, `branchId`, `stateRevisionId`;
  required `title`, `idempotencyKey`; optional `description`,
  `acceptanceCriteriaJson`, `roadmapJson`, `metadataJson`, `status`.
- Task: required `goalId`, `title`, `idempotencyKey`; optional `projectId`,
  `conversationId`, `branchId`, `stateRevisionId`, `description`,
  `metadataJson`, `status`. Native storage enforces Goal lineage.
- Starter Workflow: optional `projectId`, `conversationId`, `branchId`,
  `stateRevisionId`; required `name`, `title`, `definitionJson`,
  `idempotencyKey`; optional `description`, `status`, `enabled`.

Revision-create DTOs contain a root ID, optional
`expectedCurrentRevisionId`/`stateRevisionId`, root-specific `payloadJson`
(Goal/Task) or `definitionJson` (Starter Workflow), and `idempotencyKey`.

Root create, revision, and lifecycle mutations require a bounded
`idempotencyKey`. Dependency creation is the exception: its request contains
only `fromTaskId`, `toTaskId`, and `dependencyKind`; scope is resolved from the
two tasks and an exact existing edge is returned.

### 4.3 Current lifecycle request shapes

The live lifecycle DTOs use an optimistic timestamp precondition, not the
generic `expectedStatus`/`nextStatus` vocabulary:

- Goal: `goalId`, `status`, optional `expectedUpdatedAtMs`, `idempotencyKey`.
- Task: `taskId`, `status`, optional `expectedUpdatedAtMs`, `idempotencyKey`.
- Starter Workflow status: `starterWorkflowId`, `status`, optional `enabled`,
  optional `expectedUpdatedAtMs`, `idempotencyKey`.
- Starter Workflow enabled-only: `starterWorkflowId`, `enabled`, optional
  `expectedUpdatedAtMs`, `idempotencyKey`.

If a future public contract adopts `expectedStatus` and `nextStatus`, those
names must be documented as a future wire shape (or explicitly translated at
the bridge); they are not accepted fields in the current preview DTOs. A stale
`expectedUpdatedAtMs` returns a typed conflict and does not create a partial
receipt.

## 5. Canonical payload and hash rules

Native code parses each bounded JSON manifest as an object, rejects duplicate
or unknown typed fields, applies only contract-defined normalization, then
serializes once and hashes the canonical bytes with SHA-256.

The following values must be stored and replay-compared byte-for-byte after
canonicalization:

- goal `acceptance_criteria_json`, `roadmap_json`, and `metadata_json`;
- goal revision `payload_json`;
- task `metadata_json` and task revision `payload_json`;
- starter workflow `definition_json` and workflow revision
  `definition_json`.

### Starter-workflow hash domains

Starter Workflows expose two related but non-interchangeable hash domains; the
domain is part of the storage contract and is never inferred from a field name:

1. `starter_workflow_revisions.content_sha256` is SHA-256 over canonical UTF-8
   `definition_json` only: “Is this immutable definition revision unchanged?”
2. `starter_workflows.canonical_payload_sha256` and
   `authoritative_root_mutation_receipts.canonical_payload_sha256` hash the
   canonical payload containing schema version, name, title, description,
   definition, status, enabled, and optional state anchor: “Does this root or
   receipt still represent the complete workflow state?”

Validate each hash against its matching domain on create, revision, lifecycle,
snapshot, and replay. Comparing a full-payload hash to
`starter_workflow_revisions.content_sha256` (or definition-only to a root/
receipt hash) is an integrity failure, not `payload_drift`.

For root create, revision, and lifecycle operations, a key may be reused only
with the exact canonical request hash. Different payloads return `payload_drift`
without a second root, revision, event, or pointer update. Dependencies have no
key/receipt; immutable uniqueness uses profile, endpoints, and kind.

## 6. Goal creation transaction

The minimum atomic Goal-create sequence is:

1. validate profile and project/conversation/branch lineage (including branch↔conversation);
2. validate/canonicalize payload and look up the idempotency receipt;
3. exact receipt ⇒ `replayed = true`; different hash ⇒ `payload_drift`;
4. allocate root/revision IDs, insert root with a null pointer, insert revision 1;
5. advance the pointer with ownership guard and persist one immutable receipt;
6. commit and return the bounded verified snapshot.

The same pattern applies to Task and Starter Workflow. Task creation also
requires a live Goal and exact project/conversation/branch lineage.

## 7. Revision and pointer CAS

Revision creation is append-only. Read the current pointer and highest revision
number in the same write transaction; a mismatched `expectedCurrentRevisionId`
returns `stale_revision_head` without inserting a revision.

The new number is `max(revision_no) + 1`, never renderer authority. Pointer and
revision insert share one transaction; a failed pointer update rolls back both.

Historical revisions remain readable and addressable by ID. Updating the
current pointer must never mutate historical revision rows.

Goal, Task, and Starter Workflow revision paths share these CAS/receipt rules:

- a matching expected head is accepted and advances the authoritative pointer;
- a stale expected head returns `stale_revision_head` without a revision,
  pointer, root, or receipt write;
- an exact idempotent replay returns the historically selected revision while
  leaving a newer authoritative current head in place;
- reusing an idempotency key with a different expected head is
  `payload_drift`, even when the payload is otherwise unchanged; and
- omitting the expected head remains compatible with the legacy request form.

The expected head is part of receipt scope, so replay cannot reinterpret a
request against another head. Static/source tests cover this; native compile,
runtime concurrency, and close/reopen still require a Rust environment.

## 8. State-anchor validation

An optional `stateRevisionId` is valid only in the exact profile/
conversation/branch stream. For a project-global root with no conversation or
branch lineage it must be `NULL`; existence alone is insufficient.

v17 SQL triggers enforce this for direct SQL; storage repeats it for typed
errors and no partial receipt. A `candidate`, rejected, or otherwise
non-authoritative anchor is allowed only for an explicitly preview operation,
never as executable continuation authority.

## 9. Lifecycle transitions

Native storage owns the lifecycle transition matrix. At minimum:

- goal: `draft -> active -> paused -> active -> completed`; `draft/active/paused -> cancelled`; completed/cancelled/archived are terminal;
- task: `pending -> ready -> in_progress -> completed`; `pending/ready/in_progress -> blocked`; `blocked -> ready`; any non-terminal live state may be cancelled; completed/cancelled/archived are terminal;
- starter workflow: `draft -> active -> archived`; `enabled = 1` is allowed only for an active, non-deleted workflow.

Invalid transitions return `goal_status_transition_invalid`,
`task_status_transition_invalid`, or `starter_workflow_status_transition_invalid`
for the corresponding root. Exact replays may return the immutable receipt;
different payloads under one key return `payload_drift`.

### 9.1 Starter-workflow lifecycle mutation shape

Starter Workflow status and enabled commands share the stable
`starter-workflow.status.update` receipt operation. Every new receipt records
the caller shape in its canonical result envelope:

- `status-only`: `status` supplied and `enabled` omitted;
- `status-and-enabled`: both `status` and `enabled` supplied; and
- `enabled-only`: `enabled` supplied while native storage resolves the current
  status inside the same immediate transaction.

The envelope also records `expectedUpdatedAtMs` (including explicit `null`). A
replay with a different shape/status/enabled value returns `payload_drift` and
creates no revision. The timestamp is integrity-checked, but not reapplied as
a live precondition, so retries survive later mutations. Legacy receipts
without these metadata fields remain replayable under old comparisons.

## 10. Task dependencies

`task_dependency_create` resolves both tasks in one profile/Goal, rejects
self-edges, deleted/terminal tasks, and cycles for `blocks`/`requires`.
`related` is non-blocking and cannot authorize execution. There is no key or
root receipt; an exact repeat returns the existing immutable edge. Removal is a
future lifecycle/tombstone contract, not SQL `DELETE`.

## 11. Read/list receipts

Read/list commands use one bounded SQLite snapshot and typed DTOs, never raw
rows. Full Goal/Task/Starter Workflow snapshots identify the typed root and ID,
and include exact scope, current revision ID plus `revisionNo`,
lifecycle/timestamps, canonical hash, optional `stateRevisionId`, bounded summaries, aggregate
`integrity: "valid"`, and `executionDisposition: "preview-only"`. Historical
reads/replays expose `selectedRevision` separately from the current pointer.

List DTOs are intentionally smaller: they expose `currentRevisionId`, scope,
status, timestamps, state-anchor ID, and canonical hash, but no `revisionNo`,
full revision, dependency, or separate `integrity` field. Starter Workflow
`definitionJson` is returned only after bounded native validation/hash checks;
unbounded or secret-bearing definitions, prompts, credentials, cookies, and
local paths remain redacted/omitted. Tampered rows fail closed with
`continuation_root_integrity_failed`. `stateAnchorIntegrity` is a future
refinement, not a current bridge field.

## 12. Suggested public receipt projection (future)

```json
{
  "schemaVersion": 1,
  "receiptId": "root_receipt_<opaque>",
  "operationKind": "goal.create",
  "rootKind": "goal",
  "rootId": "goal_<opaque>",
  "revisionId": "goal_revision_<opaque>",
  "revisionNo": 1,
  "canonicalPayloadSha256": "<64 lowercase hex chars>",
  "scope": {
    "profileId": "profile_default",
    "projectId": null,
    "conversationId": "conversation_<opaque>",
    "branchId": "branch_<opaque>"
  },
  "replayed": false,
  "integrity": "valid",
  "createdAt": "RFC3339"
}
```

This is future/public only. Current commands return verified snapshots with
`replayed`, current/selected revision data, `integrity`, and
`executionDisposition`; storage retains the receipt. Internal receipt fields
are `receiptId`, `operationKind`, `rootKind`, `rootId`, optional `revisionId`,
`canonicalPayloadSha256`, canonical `scope`/`result`, `receiptSha256`, and
`createdAtMs`; only an idempotency-key hash is stored. A future projection must
remain append-only, hash-protected, bounded/redacted, and migration-checked.

## 13. Required regression matrix

Native tests must cover exact create/replay, payload drift, cross-scope and
branch/conversation rejection, terminal Goal/Task lineage, stale revision CAS,
immutable historical rows, pointer/hash tampering, missing/cross-stream/
non-authoritative anchors, invalid transition/replay, dependency self-edge /
cross-Goal / cycle, disabled or archived workflow execution rejection, and
close/reopen receipt replay. Static SQL/source probes do not prove Rust
compilation or native runtime.

## 14. Current implementation status

As of September 15, 2026, source/static evidence covers typed Goal, Task, and
Starter Workflow create/read/list, revisions, dependencies, lifecycle, atomic
first revisions, canonical JSON/SHA-256, scope/lineage and state-anchor
validation, append-only numbering, revision-head CAS, immutable receipts,
exact replay/payload-drift handling, historical/current revision separation, and
`preview-only` snapshots. `python scripts/verify-authoritative-root-contract.py
--require-api` passes, as do the helper/storage/source probes.

The verifier is a bounded source-shape gate: explicit command→storage mappings,
active definition/registration, standalone `state`, one outer storage call, and
negative fixtures for aliases, comments/literals, inactive cfg ranges,
shadowed/missing state, unterminated bodies, duplicates, and extra calls. It is
not a Rust parser/type checker and cannot prove transaction atomicity.

This host has no `cargo`, `rustc`, or `rustfmt`; Rust compilation, native
runtime, packaged Windows IPC, and multi-client concurrency therefore remain
unverified. Do not claim whole-product, provider, UI, or execution completion.
