# Task and Starter Workflow Native API Test Matrix

Date: 2026-09-12  
Scope: native authoritative-root storage and IPC contracts for `tasks`,
`task_revisions`, `task_dependencies`, `starter_workflows`, and
`starter_workflow_revisions`.

## Current evidence

The v16-v19 SQLite schema is present and has scope, immutability, state-anchor,
dependency-cycle, and terminal-dependency guards. The native continuation gate
also has regression coverage for task and starter-workflow execution eligibility.
Those tests prove that a persisted row is checked before continuation; they do
not prove that a renderer can create, read, list, revise, link, or transition a
root through an authoritative native writer.

As of the latest shared-worktree scan on September 12, 2026, the renderer-safe
Task and Starter Workflow DTO/request shapes and the corresponding public
`Storage` method call sites are present in `src-tauri/src/storage.rs`. The
observed public Storage methods are:

- Task: `create_task`, `read_task`, `read_task_revision`, `list_tasks`,
  `create_task_revision`, `update_task_status`, `create_task_dependency`, and
  `list_task_dependencies`.
- Starter Workflow: `create_starter_workflow`,
  `read_starter_workflow`, `read_starter_workflow_revision`,
  `list_starter_workflows`, `create_starter_workflow_revision`, and
  `update_starter_workflow_status`.

This is not yet a verified native API implementation. The public methods call
Task/Workflow helper symbols (for example `CanonicalTaskPayload`,
`CanonicalWorkflowPayload`, `load_task_snapshot_for_revision`,
`load_workflow_snapshot`, normalization/canonicalization/validation helpers,
and row decoders) that were not found by the latest repository-wide symbol scan.
The existing `verify-rust-helper-definitions.py` manifest covers run-control and
Goal helpers only, so its pass result does not prove that these new Task/Workflow
symbols are defined or that Rust can compile. Rust toolchain availability is
also still blocked on this host. Do not mark the Storage methods complete until
the helper-definition audit and native compile gate both pass.

The following public writer/read and IPC surfaces therefore remain pending and
must not be marked complete merely because the tables, DTOs, or continuation
fixtures exist:

- Task create/read/list.
- Task immutable revision create/read.
- Task dependency create/read/list.
- Task lifecycle/status update.
- Starter workflow create/read/list.
- Starter workflow immutable revision create/read.
- Starter workflow lifecycle/status and enabled-state update.
- Tauri command registration and frontend IPC adapters for the above.

At the same scan, `src-tauri/src/native_commands.rs` contained no
`#[tauri::command]` wrappers for the Task or Starter Workflow methods, and
`src-tauri/src/lib.rs` registered only the Goal commands. The authoritative-root
verifier therefore correctly reports all Task/Starter Workflow capabilities as
pending under `--require-api`. This is an expected fail-closed state, not a
reason to weaken the verifier or to treat Storage call sites as IPC evidence.

The authoritative-root verifier should remain run with `--require-api` once
the implementation lands. A passing default verifier only proves that the
schema and the intentionally-pending capability inventory are coherent; it
does not prove that any CRUD operation is callable or transactionally safe.

The existing continuation tests currently cover (among other cases):

- task status and dependency readiness;
- terminal, deleted, cross-goal, cross-profile, missing-target, malformed-ID,
  and cyclic dependency rejection;
- replay rechecking dependency and lifecycle state;
- draft/disabled starter-workflow preview versus active/enabled execution;
- exact state-revision binding and non-accepted revision rejection.

## Required native API test matrix

Each mutating operation must be tested at the `Storage` boundary and, after
command wiring exists, at the thin Tauri IPC boundary. Tests should assert
both the returned DTO/error code and the number/content of affected rows.

### Shared invariants

1. Native IDs, timestamps, revision numbers, canonical JSON, SHA-256 hashes,
   scope JSON, and mutation receipts are generated/validated in one immediate
   transaction.
2. A fresh idempotency key creates exactly one immutable fact.
3. Repeating the exact request returns the original immutable result with a
   replay marker and does not create a second root, revision, dependency, or
   receipt.
4. Reusing an idempotency key with any payload/scope/lineage difference returns
   `payload_drift` and leaves all counts unchanged.
5. No physical delete is exposed for a lifecycle root, revision, or dependency.
6. A tampered persisted root, revision, hash, pointer, receipt, or state anchor
   fails closed with an integrity/scope error rather than being repaired from
   renderer input.

### Task root

#### Create

- Valid task under an active, non-deleted goal creates one task, first revision,
  and one `task.create` receipt atomically.
- Goal status `archived` or `cancelled`, deleted goal, wrong profile, wrong
  project, conversation, branch, or state-revision stream is rejected.
- Project/conversation/branch combinations must match the goal lineage; a
  branch without its conversation and a conversation from another project are
  rejected.
- Invalid task status, blank/over-limit title or description, malformed or
  wrong-type metadata JSON, NUL input, and over-limit JSON are rejected.
- The first revision pointer is populated only after the immutable revision
  exists; a transaction failure leaves no orphan task, revision, or receipt.

#### Read and list

- Read verifies root identity, goal lineage, current-revision ownership,
  revision number, state anchor, canonical payload hash, projected fields, and
  deletion/lifecycle coherence in one transaction.
- Read of a missing, deleted, cross-profile, or cross-goal task fails closed.
- List filters by goal/project/conversation/branch/status and bounded limit;
  archived/deleted inclusion is explicit and never leaks large manifests.
- List validates every returned summary against the same native root/revision
  integrity contract.

#### Revisions

- A valid revision canonicalizes payload and atomically advances the current
  pointer with a `task.revision.create` receipt.
- Revision numbers are monotonic and unique; revision rows are immutable.
- A revision cannot change task/goal/project/conversation/branch identity.
- Revisions are rejected for completed, cancelled, archived, or deleted tasks
  and for tasks whose goal is terminal/deleted.
- Current-pointer tampering, foreign revision pointer, state-anchor drift,
  content-hash drift, and non-object payloads fail closed.

#### Lifecycle

- Valid transitions are tested individually (pending → ready/blocked/cancelled,
  ready → in-progress/blocked/cancelled, in-progress → completed/blocked,
  blocked → ready/in-progress/cancelled, completed → archived, and any other
  product-approved transitions).
- Invalid backward/terminal transitions return a stable error and do not create
  a revision or receipt.
- `expected_updated_at_ms` conflicts are CAS failures with no mutation.
- Lifecycle replay is exact; payload drift is rejected.

### Task dependencies

- Valid `blocks`, `requires`, and `related` edges create exactly one immutable
  dependency fact.
- Duplicate edge replay is idempotent; same address with changed kind/payload
  is drift/conflict.
- Self-edge, cross-goal, cross-profile, deleted-task, terminal-source/target,
  missing-target, malformed-ID, and cycle insertion attempts fail closed.
- `related` does not block execution; `blocks` and `requires` block until the
  target is completed according to the continuation contract.
- Dependency rows cannot be updated or deleted and remain valid after replay.

### Starter workflow root

#### Create/read/list

- Valid workflow creates one root, first immutable revision, and one
  `starter-workflow.create` receipt atomically.
- Invalid name/title/description, malformed or wrong-type definition JSON,
  over-limit definition, bad project/conversation/branch/state scope, and
  profile mismatch are rejected.
- Read verifies current pointer, revision ownership/number, definition hash,
  projected fields, exact scope, deletion marker, and enabled/status coherence.
- List is bounded and filters by project/conversation/branch/status/enabled;
  deleted rows are excluded unless an explicit audit-only mode exists.

#### Revisions and lifecycle

- Valid definition revision canonicalizes JSON, increments revision number, and
  advances the pointer atomically.
- Revision rows are immutable; terminal/archived/deleted workflows cannot be
  revised.
- Lifecycle tests cover draft ↔ active (per product policy), active → archived,
  invalid resurrection, and enabled/disabled updates with CAS and replay.
- Execution eligibility remains separate: preview may inspect draft/disabled
  workflows, while execute requires active + enabled + exact state anchor.

## Tamper and transaction probes

Once the public methods exist, add test-only direct SQL corruption probes for:

- root hash differing from current revision hash;
- current pointer owned by another root;
- revision payload/hash mismatch;
- root projection fields differing from canonical revision payload;
- root/revision state-anchor mismatch;
- receipt scope/result/hash drift;
- task dependency profile/goal mismatch;
- workflow enabled/status mismatch.

For every failed mutation, assert no partial rows remain. For every exact
replay, assert the immutable result is byte-for-byte equivalent apart from the
explicit replay marker.

## Completion gate

Task/workflow authoritative-root work is complete only when all of the
following are true:

1. Storage methods and DTOs exist for every operation above.
2. Thin commands are registered and statically discoverable.
3. The native regression matrix is implemented, not only documented.
4. Schema/storage/static probes pass.
5. Frontend typecheck/tests/build pass after IPC adapters are added.
6. Native `cargo check`/`cargo test`/runtime evidence is recorded when a Rust
   toolchain is available. Until then, native compilation remains unverified.

## 2026-09-12 implementation-state re-audit

The source tree changed after the matrix above was written. The authoritative
root verifier now reports all required command names, including Task and
Starter Workflow commands, and `--require-api` currently exits successfully.
That result is only a command-discovery/static contract result; it is not Rust
compile or runtime evidence.

The current `src-tauri/src/storage.rs` still has a critical compile-blocking
duplication. Every Task and Starter Workflow public method is defined twice in
the same `impl Storage` block. The duplicated method pairs include:

- `create_task` (around lines 1748 and 2566);
- `read_task` (around lines 1864 and 2704);
- `read_task_revision` (around lines 1871 and 2711);
- `list_tasks` (around lines 1887 and 2737);
- `create_task_revision` (around lines 1944 and 2802);
- `update_task_status` (around lines 2035 and 2938);
- `create_task_dependency` (around lines 2113 and 3060);
- `list_task_dependencies` (around lines 2163 and 3140);
- `create_starter_workflow` (around lines 2180 and 3166);
- `read_starter_workflow` (around lines 2304 and 3297);
- `read_starter_workflow_revision` (around lines 2312 and 3307);
- `list_starter_workflows` (around lines 2339 and 3332);
- `create_starter_workflow_revision` (around lines 2396 and 3393);
- `update_starter_workflow_status` (around lines 2481 and 3524).

The two blocks also call different helper families. A repository-wide Rust
source scan currently finds call sites but no function definitions for the
Task/Workflow helpers, including `normalize_task_payload_fields`,
`normalize_task_payload_json`, `load_task_snapshot_for_revision`,
`validate_task_status`, `validate_task_scope`, `validate_task_dependency_record`,
`task_dependency_from_row`, `normalize_workflow_payload_fields`,
`normalize_workflow_payload_json`, `load_workflow_snapshot`,
`validate_workflow_status`, `validate_workflow_scope`,
`workflow_revision_from_row`, and `workflow_summary_from_row`.

The existing `scripts/verify-rust-helper-definitions.py` does not cover these
symbols: it currently verifies the run-control/Goal helper manifest only. The
existing authoritative-root verifier detects command names in
`native_commands.rs`/`lib.rs`, but does not parse Rust method uniqueness or
resolve helper definitions. Therefore both verifiers can pass while native
Rust compilation is still blocked by duplicate methods and unresolved helper
symbols.

Required corrective gate before claiming Task/Workflow native completion:

1. Select and retain one coherent Task/Workflow implementation block; remove
   the duplicate block rather than weakening the verifier.
2. Define every helper used by the retained block exactly once, with a manifest
   checked by the helper verifier.
3. Add duplicate-method and unresolved-helper static checks to CI.
4. Re-run the full Storage/authoritative-root regression matrix.
5. When the Rust toolchain is available, run `cargo fmt --check`, `cargo check`,
   `cargo test`, and `cargo clippy`; until then, report native compilation as
   unverified.
