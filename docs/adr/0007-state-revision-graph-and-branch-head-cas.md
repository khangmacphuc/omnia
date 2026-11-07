# ADR 0007 — Immutable state revisions and branch-head compare-and-swap

- Status: Accepted implementation contract; the September 9, 2026 v11/v12 implementation snapshot below is historical and remains unverified for native runtime
- Date: 2026-09-09
- Owners: kernel, storage, run-control, recovery, security, desktop
- Depends on: ADR 0002 unified kernel execution, ADR 0004 durable run-event journal and cursor replay
- Canonical contract: `docs/omnia-ultra/architecture/state-revision-graph.md`
- Schema contract: `docs/omnia-ultra/schemas/state-revision-graph.schema.json`

## Context

Conversation state is projected through messages, branches, runs and the durable
run journal. The state-revision/CAS slice now has native v11 tables plus the v12
append-only state-revision journal, an append/read repository surface, Tauri
commands and a TypeScript bridge, but the slice is not yet a shipped capability:
the host cannot compile/run the Rust implementation and journal integration,
recovery/reconciliation and two-client concurrency evidence are still
outstanding. Until those gates close,
run-control features cannot safely distinguish a committed state from visible
streaming text, an unreviewed file diff, a rejected result, or an external
effect whose outcome is unknown. A renderer-side transcript or a last-writer-
wins update is not sufficient: two windows, a recovery worker and an
automation client can otherwise overwrite each other or silently compile
different context.

The graph is a redacted materialized projection. Typed durable facts remain the
source of truth, and the graph must never contain raw secrets, credentials,
cookies, unrestricted provider payloads, file bytes or sensitive absolute
paths. Every operation must bind a fixed journal watermark, an explicit state
base and the observed/expected branch head used for the mutation.

For typed causal edges, `from_revision_id` is the derived/new revision and
`to_revision_id` is the referenced source/parent revision. A child that
`continues-from` a parent therefore points `child -> parent`; this direction is
part of the storage and projection contract and is covered by the independent
SQLite verifier.

At the dated September 9, 2026 snapshot, the storage schema was version 12. The narrowly scoped
`0011_state_revision_graph_cas` and `0012_state_revision_journal` migrations,
immutable guards, fixed-watermark read path, append-only journal constraints and
append/read native APIs are present in the working tree. The independent SQLite
verifier passes fresh-schema, v10-to-v11 and v11-to-v12 migration, rollback,
integrity and constraint checks. This is implementation evidence for the
foundation only; it is not native Rust runtime evidence and does not claim the
full capability is shipped.

### Historical implementation evidence (September 9, 2026)

This section is a date-qualified record of the v11/v12 foundation, not a
current-schema inventory. For the current source snapshot, use
[`docs/IMPLEMENTATION_STATUS.md`](../IMPLEMENTATION_STATUS.md) and
[`docs/omnia-ultra/04-CURRENT-STATE-BRIDGE.md`](../omnia-ultra/04-CURRENT-STATE-BRIDGE.md).
Those documents record later v13/v14 state-revision/provider-lineage evidence
and the same native-toolchain/runtime boundary; they do not promote this ADR's
static evidence to a native-runtime or packaged-app claim.

At that dated snapshot, the working tree contained:

- v11 tables for streams, immutable revisions, parents, causal edges, accepted
  heads and idempotency receipts;
- v12 `state_revision_journals` and append-only `state_revision_events` tables
  with immutable metadata, scope and monotonic-sequence guards;
- immutable/scope/head/idempotency SQLite guards and fixed-watermark indexes;
- `Storage::append_state_revision` and `Storage::read_state_revision_graph`;
- Tauri commands `state_revision_append` and `state_revision_graph_read`;
- a fail-closed TypeScript desktop bridge;
- one source-level fixed-watermark test covering accepted/candidate history and
  future-watermark clamping;
- an independent verifier receipt with SQLite 3.50.4, nineteen v11 triggers,
  six v12 triggers, both migration receipts, migration rollback,
  `quick_check`, `foreign_key_check` and fresh/migrated schema parity.

The following remain explicit blockers to capability verification: native Rust
toolchain/runtime evidence on this host, a matching append-only run-journal fact
inside the same mutation transaction, original-receipt idempotency replay
semantics, canonical hashing after implicit parent resolution, full native
CAS/rollback/branch-integrity tests, and close/reopen, tamper,
recovery/reconciliation and two-client concurrency evidence. Edge orientation
itself is no longer an unresolved contract question: it is explicitly
canonicalized as child→parent and independently asserted by the SQLite
verifier; native runtime exercise is still pending. The capability therefore
remains **partial/unverified**.

## Decision

### 1. Immutable typed facts are authoritative

Every mutation appends facts; no state-revision, parent, edge, receipt or
accepted-head row is updated in place. A materialized head/projection can be
recomputed from those facts at a fixed watermark. The graph may contain only
opaque identifiers, hashes, manifests, policy/authority snapshot references,
classification summaries and bounded diagnostics.

The minimum state lineage is:

```text
scope (profile/project/conversation/branch)
  -> state stream
  -> immutable state revision
  -> typed parent/causal edges
  -> accepted-head projection
```

State statuses remain distinct: `candidate`, `accepted`, `rejected`,
`superseded`, `blocked`, `conflicted`, `discarded`, `invalid` and
`outcome-unknown`. Candidate or unknown work never becomes normal context by
accident.

### 2. Narrow v11 storage shape plus v12 mutation journal

The implementation uses typed, strict SQLite tables equivalent to:

```sql
CREATE TABLE state_revision_streams (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL REFERENCES app_profiles(id),
    project_id TEXT REFERENCES projects(id),
    conversation_id TEXT REFERENCES conversations(id),
    branch_id TEXT NOT NULL REFERENCES conversation_branches(id),
    created_at_ms INTEGER NOT NULL,
    UNIQUE (profile_id, conversation_id, branch_id)
) STRICT;

CREATE TABLE state_revisions (
    id TEXT PRIMARY KEY,
    stream_id TEXT NOT NULL REFERENCES state_revision_streams(id),
    kind TEXT NOT NULL,
    status TEXT NOT NULL,
    branch_sequence INTEGER NOT NULL CHECK (branch_sequence >= 0),
    watermark_json TEXT NOT NULL CHECK (json_valid(watermark_json)),
    observed_head_id TEXT REFERENCES state_revisions(id),
    expected_head_id TEXT REFERENCES state_revisions(id),
    actor_json TEXT NOT NULL CHECK (json_valid(actor_json)),
    causation_json TEXT NOT NULL CHECK (json_valid(causation_json)),
    manifest_json TEXT NOT NULL CHECK (json_valid(manifest_json)),
    authority_json TEXT NOT NULL CHECK (json_valid(authority_json)),
    routing_cache_json TEXT NOT NULL CHECK (json_valid(routing_cache_json)),
    state_digest TEXT NOT NULL,
    canonicalization_revision TEXT NOT NULL,
    created_at_ms INTEGER NOT NULL,
    UNIQUE (stream_id, branch_sequence)
) STRICT;

CREATE TABLE state_revision_parents (
    revision_id TEXT NOT NULL REFERENCES state_revisions(id),
    parent_revision_id TEXT NOT NULL REFERENCES state_revisions(id),
    ordinal INTEGER NOT NULL CHECK (ordinal >= 0),
    PRIMARY KEY (revision_id, parent_revision_id),
    UNIQUE (revision_id, ordinal)
) WITHOUT ROWID, STRICT;

CREATE TABLE state_revision_edges (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL,
    from_revision_id TEXT NOT NULL REFERENCES state_revisions(id),
    to_revision_id TEXT NOT NULL REFERENCES state_revisions(id),
    operation_id TEXT,
    causal_cursor_json TEXT NOT NULL CHECK (json_valid(causal_cursor_json)),
    policy_revision_id TEXT NOT NULL,
    created_at_ms INTEGER NOT NULL
) STRICT;

CREATE TABLE state_revision_heads (
    stream_id TEXT PRIMARY KEY REFERENCES state_revision_streams(id),
    accepted_revision_id TEXT REFERENCES state_revisions(id),
    branch_sequence INTEGER NOT NULL CHECK (branch_sequence >= 0),
    updated_at_ms INTEGER NOT NULL
) STRICT;

CREATE TABLE state_revision_idempotency (
    stream_id TEXT NOT NULL REFERENCES state_revision_streams(id),
    idempotency_key_hash TEXT NOT NULL,
    canonical_payload_hash TEXT NOT NULL,
    result_revision_id TEXT NOT NULL REFERENCES state_revisions(id),
    receipt_json TEXT NOT NULL CHECK (json_valid(receipt_json)),
    created_at_ms INTEGER NOT NULL,
    PRIMARY KEY (stream_id, idempotency_key_hash)
) WITHOUT ROWID, STRICT;
```

The final migration must add append-only triggers, scope/branch foreign-key
guards, parent/edge cycle checks where practical, and indexes for fixed-
watermark replay. The current migrations provide the v11 tables, immutable and
scope/head/idempotency guards, fixed-watermark indexes, and the v12 journal
metadata/event tables with append-only, scope and sequence guards; the
independent verifier confirms those structural/constraint properties. The exact
SQL may differ, but the authority and uniqueness constraints above and the v12
journal invariants are mandatory.

### 3. One transaction owns a mutation

The native mutation path is:

```text
validate command, scope and authority
  -> resolve fixed journal/state-read watermark
  -> validate idempotency key and canonical payload hash
  -> read observed accepted head
  -> compare expected head (CAS)
  -> append revision, parent rows and edge rows
  -> update accepted-head projection when the revision is accepted
  -> append the matching journal fact
  -> build the immutable receipt from the returned journal cursor
  -> insert the idempotency receipt exactly once
  -> commit once
  -> publish a best-effort notification after commit
```

No renderer event, head update or external dispatch may be visible before the
transaction commits. A stale caller is rejected; the kernel never adopts a
newer head with last-writer-wins and never leaves an orphan revision after a
failed CAS. Candidate revisions may be appended without changing the accepted
head. The journal cursor and receipt are produced inside this same transaction;
the immutable receipt must never be inserted before the cursor is known or
rewritten after insertion. Native Rust runtime and end-to-end replay evidence
remain separately required before this decision can be marked verified.

### 4. Idempotency and typed outcomes

The operation idempotency key is native-scoped and binds to the canonical
payload hash, stream, actor/operation identity and policy revision. Reusing a
key with the same canonical payload returns the original receipt as
`already-applied`. Reusing it with a different payload returns `payload-drift`
and does not mutate any table.

The native result vocabulary is:

```text
applied
already-applied
stale-head
payload-drift
branch-conflict
unauthorized
invalid-state-base
policy-stale
reconciliation-required
```

`stale-head` includes the current accepted head, sequence and safe diff
metadata so the caller can explicitly choose rebase, recompile, queue-after,
fork, discard or cancel. It must not receive unrelated branch content or
redacted data outside its authority.

#### Immutable receipt contract

The `state_revision_idempotency.receipt_json` value is a private,
redacted `StateRevisionReceipt` v1. Its normative JSON Schema is
`docs/omnia-ultra/schemas/state-revision-receipt.schema.json`. A receipt created
on a complete v12 journal has exactly the following fields, including the
all-or-none cursor of the event that committed the mutation:

```json
{
  "schemaVersion": 1,
  "outcome": "applied",
  "revisionId": "state_rev_…",
  "streamId": "state_stream_…",
  "acceptedHeadStateRevisionId": "state_rev_…",
  "expectedHeadStateRevisionId": "state_rev_…",
  "branchSequence": 7,
  "canonicalPayloadHash": "<lower-case sha-256>",
  "journalEpoch": "journal_epoch_…",
  "journalSequence": 42,
  "journalEventId": "state_event_…"
}
```

The only compatibility exception is an existing idempotency row from a v11
stream whose v12 journal metadata is `legacy-partial`. Such a historical row
may retain exactly the base eight fields shown below because the migration
does not fabricate an event for facts that predate the journal:

```json
{
  "schemaVersion": 1,
  "outcome": "applied",
  "revisionId": "state_rev_…",
  "streamId": "state_stream_…",
  "acceptedHeadStateRevisionId": "state_rev_…",
  "expectedHeadStateRevisionId": "state_rev_…",
  "branchSequence": 7,
  "canonicalPayloadHash": "<lower-case sha-256>"
}
```

The legacy exception is scoped to `legacy-partial` coverage and does not make
partial cursors valid: `journalEpoch`, `journalSequence` and `journalEventId`
must either all be present and identify one immutable event or all be absent
on that explicitly covered historical row. Fresh v12 mutations must never use
the cursor-less form.

`revisionId`, `streamId`, `branchSequence` and
`canonicalPayloadHash` must agree with the relational idempotency row and its
referenced immutable revision. For a complete receipt, the journal epoch,
sequence and event ID must additionally resolve to one `state_revision_events`
row in the same stream, for the same revision and sequence, and the event's
hash-only payload must agree with the receipt. `expectedHeadStateRevisionId`
is the effective CAS expectation after implicit-parent resolution; it is not
necessarily the value that the renderer originally omitted.
`acceptedHeadStateRevisionId` is the accepted head immediately after the
original mutation committed. For a candidate mutation it remains the previous
accepted head (or `null` when the stream has no accepted head), while an
accepted mutation records the new revision. Neither field is rewritten when a
later mutation advances the live head.

The stored `outcome` is always `applied`: `already-applied` and
`payload-drift` are replay responses derived from the immutable receipt and
the newly computed canonical payload hash. They must never be persisted by
overwriting the original receipt. `currentHeadStateRevisionId` is deliberately
not part of the receipt because it is a mutable observation supplied separately
by the replay result.

On replay, native code must parse and validate the receipt against this
contract, then cross-check its stream, revision, sequence and hash against the
typed tables. A missing, malformed, tampered or contradictory receipt is a
`state_revision_integrity_failed` error (fail closed); native code must not
silently reconstruct it from the current head or return a successful replay.
Receipt JSON contains no secrets, credentials, cookies, provider payloads,
raw file bytes or sensitive paths.

### 5. State-base capture is explicit and pinned

Retry, edit, Continue, compare and recovery operations must select one of the
machine-readable modes from the graph schema:

```text
exact-historical
current-state
historical-plus-selected-deltas
fresh-branch
fresh-goal-start
```

The resulting state base records source revision, requested/resolved head,
resolved digest, selected delta IDs, context manifest and resolved cursors.
Once captured, later queueing, approval waits and provider dispatch consume
that pinned base rather than rereading a mutable head. A current-state retry of
B may include A only when A's accepted successor is visible at B's fixed
watermark; candidate or `outcome-unknown` effects are excluded.

#### Continuation authorization is accepted-state based

Native execution authorization is based on the requested state revision, not
on whatever head happens to be current when the renderer asks to continue. The
requested revision must be accepted, belong to the same conversation/branch/
stream, and be at or below the native accepted-head watermark. A historical
accepted revision remains executable after the branch advances and is never
silently replaced by the newer head. Candidate, rejected, superseded,
`outcome-unknown`, conflicted, blocked, discarded and invalid revisions may be
previewed or planned only as visibly non-executable context.

The accepted-head projection is a native integrity invariant. Missing or
cross-stream heads, impossible null-head sequences, missing revisions and
head sequence/status mismatches fail closed. Checkpoint roots must bind to the
exact requested state revision; run roots establish run/conversation/branch
scope but do not prove revision provenance. Exact idempotent replay returns the
immutable original receipt, while payload drift under the same key is rejected
without creating a second intent.

### 6. Recovery and replay

On startup, recovery replays immutable facts through a fixed watermark,
validates digests, parent/edge scope, branch sequence monotonicity and head
projection, then marks unresolved external effects for reconciliation. It must
not infer a missing provider result from a renderer transcript and must not
blindly resend an ambiguous non-idempotent request. A reconciliation receipt
creates a new revision/edge; it does not rewrite the unknown fact.

Graph exports and inspector projections are safe by construction: they expose
IDs, hashes, typed status and redacted metadata only. A tamper or digest
mismatch is a recovery/invalid-integrity result, never a reason to trust the
latest renderer state.

The current graph-read implementation pins one SQLite read transaction and
clamps a requested future watermark to the native fact horizon. It does not yet
provide the complete startup recovery, reconciliation or journal-to-state
replay contract described above.

## Consequences

- Pause/resume, immutable prompt edits, state-aware retry, branch/fork and
  active-run comparison gain one concurrency and provenance boundary.
- Two clients cannot silently overwrite a branch head; the loser receives a
  deterministic conflict and current-head metadata.
- The first implementation adds migration, indexing and transaction cost, and
  must keep journal and head projection updates atomic.
- Run-control UI remains planned until the native mutation is runtime-verified
  and journal, replay, recovery and concurrency evidence exists. Adding
  controls before this boundary would create a false capability claim.

## Rejected alternatives

### Renderer transcript as state

Rejected because it is transient, mutable and cannot prove the watermark,
authority or exact state base used by a provider request.

### Last-writer-wins branch head

Rejected because stale retries and concurrent windows can erase accepted work
without an explicit user decision.

### Mutable revision rows

Rejected because in-place status/content edits destroy causal replay and make
tamper detection dependent on the latest projection.

### Content equality as deduplication

Rejected because equal text is not proof of the same operation or external
effect. Deduplication requires a native idempotency key and canonical payload
hash.

## Required implementation tests

1. Create a root revision and reconstruct it after close/reopen.
2. Reject revision/edge mutation attempts after commit.
3. Preserve parent and typed causal-edge lineage with monotonic branch sequence.
4. Return `already-applied` for the same idempotency key and payload.
5. Return `payload-drift` for the same key and changed canonical payload.
6. Reject a stale expected head without an orphan revision or head change.
7. Run two concurrent CAS writers and prove one winner plus deterministic
   loser metadata.
8. Keep sibling branches isolated and prevent rejected/superseded revisions
   from becoming accepted heads.
9. Keep candidate and `outcome-unknown` effects out of future context until
   promotion/reconciliation creates a new accepted revision.
10. Reconstruct the same projection at a fixed watermark while live facts are
    appended, and close the replay-to-live race.
11. Migrate v10 to v11 and v11 to v12, exercise rollback for each migration,
    and pass `PRAGMA quick_check` and `PRAGMA foreign_key_check`.
12. Reject tampered digest/manifest/authority rows and prove safe projections
    contain no secret, credential, cookie, raw file bytes or sensitive path.

## Implementation sequence and exit gates

1. Land v11 schema and v12 journal tables, immutable/append-only triggers and
   migration/rollback tests.
2. Implement transaction-local append/CAS/idempotency repository methods.
3. Add fixed-watermark graph reconstruction and safe projection export.
4. Join every mutation to the durable run journal and post-commit notifier.
5. Add recovery, reconciliation and two-client concurrency evidence.
6. Only then wire run-control UI and promote
   `OMNIA-CAP-STATE-REVISION-CAS` from `partial` to `verified`.

Current status is **partial/unverified**: v11/v12 schema and independent SQL
evidence exist, while native Rust runtime, same-transaction journal proof,
recovery/reconciliation and concurrency evidence do not. Exit requires all
twelve tests above, current migration receipts, matching native Rust evidence
from the same revision, and the transaction/replay gates described in this ADR.
Source-level types, bridge plumbing or JSON-schema validation alone do not
constitute capability completion.
