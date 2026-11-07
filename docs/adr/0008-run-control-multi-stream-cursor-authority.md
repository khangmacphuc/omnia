---
id: OMNIA-ADR-0008
title: Run-control multi-stream cursor authority and provenance
status: proposed
date: 2026-09-12
owners: kernel, storage, desktop protocol, recovery, harness
supersedes: []
related:
  - 0004-durable-run-event-journal-and-cursor-replay.md
  - 0007-state-revision-graph-and-branch-head-cas.md
  - ../omnia-ultra/architecture/run-control-native-mapping.md
  - ../omnia-ultra/architecture/state-revision-graph.md
---

# ADR 0008 — Run-control multi-stream cursor authority and provenance

## Status and purpose

This ADR is an implementation gate for the native `stateBase` resolver. It
defines which durable authority owns each `RunControlCursor` stream kind, how a
cursor is resolved inside one SQLite transaction, and how historical
`legacy-partial` data remains truthful without fabricating an event identity.

The status is intentionally **proposed** until the kernel/storage owners accept
the mapping. No resolver may be implemented by guessing an authority table or by
accepting a renderer-provided sequence as if it were a journal fact.

## Problem

`RunControlCursor` is intentionally generic because state resolution can depend
on more than one durable stream. The current schema, however, does not have one
generic journal table:

- provider execution facts live in `run_journals` and `run_events`;
- state-revision mutations live in `state_revision_journals` and
  `state_revision_events`;
- conversations, tasks, projects, providers and recovery workflows do not yet
  have an equivalent authoritative event journal;
- `state_revisions.watermark_json` is a projection/receipt value, not an
  authority source by itself.

Shape validation therefore cannot prove provenance. A cursor can have a valid
stream kind, ID, non-negative sequence and well-formed optional fields while
still pointing to no committed event. The native boundary must resolve every
cursor to its owning journal (or explicitly classify it as partial/unsupported)
before persisting or executing a run-control operation.

## Decision

### 1. Stream-kind authority mapping

The following mapping is normative for the current schema:

| `streamKind` | Authoritative store | Meaning of `streamId` | Cursor sequence | Complete authority today | Scope proof |
| --- | --- | --- | --- | --- | --- |
| `branch` | `state_revision_journals` + `state_revision_events` | `state_revision_streams.id` (the one-to-one stream for the selected profile/conversation/branch) | `state_revision_events.sequence_no`, 1-based | Yes | Join journal → stream → profile/conversation/branch; the event revision must belong to the same stream |
| `run` | `run_journals` + `run_events` | `run_journals.run_id` / `generations.id` | `run_events.sequence_no`, 1-based | Yes | Join journal → generation → profile/conversation/branch; event run and optional attempt must remain in that lineage |
| `conversation` | No typed journal in the current schema | Reserved logical conversation ID | No authoritative sequence currently exists | No | A `messages.sequence_no` is not a conversation journal cursor and must not be substituted |
| `task` | No typed journal in the current schema | Reserved task ID | No authoritative sequence currently exists | No | Reject complete/executable use until a task journal is introduced |
| `project` | No typed journal in the current schema | Reserved project ID | No authoritative sequence currently exists | No | Reject complete/executable use until a project journal is introduced |
| `provider` | No typed journal in the current schema | Reserved provider profile ID | No authoritative sequence currently exists | No | Provider attempt/run facts do not create a provider-wide cursor |
| `recovery` | No typed journal in the current schema | Reserved recovery workflow ID | No authoritative sequence currently exists | No | Audit events and recovery projections are not a replay journal |

`branch` is the protocol name for the branch-scoped state-revision journal. It
does **not** mean that `streamId` is a `conversation_branches.id`, and it does
not use `state_revisions.branch_sequence` as the journal sequence. The resolver
must join the supplied state stream ID to the selected conversation and branch.

The protocol must not add a second `state-revision` cursor kind merely to make
the current table name visible. A schema/protocol version can introduce one in a
future migration, but until then `branch` is the stable compatibility name.

### 2. Cursor identity and exact row resolution

For a complete cursor, native resolution is an exact lookup, not a range check.
The identity tuple is:

```text
(streamKind, streamId, journalEpoch, sequence, eventId)
```

The resolver must prove all of the following in the same transaction:

1. the stream kind is supported by the mapping above;
2. the stream ID exists in the owning journal table;
3. the journal epoch equals the immutable journal metadata row;
4. the sequence is positive and identifies exactly one event in that stream;
5. the event ID equals the ID stored at that sequence, in both directions;
6. the event belongs to the selected profile/conversation/branch/run scope;
7. the event is not above the fixed snapshot watermark;
8. if a state-revision journal event is used, its `revision_id` belongs to the
   selected state stream and its persisted revision is the revision being
   authenticated;
9. if `payloadHash` is supplied, it matches a native hash computed from the
   persisted event, never from renderer input.

The resolver must not accept a sequence merely because it is less than or equal
to the current maximum, and must not accept an event ID merely because it exists
somewhere in the database. Sequence → event and event → sequence checks are both
required.

### 3. Canonical payload-hash semantics

`payloadHash` is an optional compatibility field in the current wire schema. It
is not an authorization substitute for `journalEpoch`, `sequence` or `eventId`.
When present, it is the lower-case SHA-256 digest of the canonical event
envelope, using canonicalization revision `cursor-event-c14n-v1`:

```json
{
  "schemaVersion": 1,
  "streamKind": "run|branch",
  "streamId": "<native stream id>",
  "journalEpoch": "<native epoch>",
  "sequence": 1,
  "eventId": "<native event id>",
  "eventType": "<native event type>",
  "payload": "<parsed persisted payload_json>"
}
```

The object is serialized with the same deterministic JSON canonicalization used
by the native storage helper. Raw provider wire bytes, request headers, cookies,
renderer JSON and an unparsed JSON string are not valid hash inputs. The
canonicalization revision must be stored or otherwise fixed by the native
implementation before a `payloadHash` is treated as an integrity fact.

If the current schema cannot compute this hash without ambiguity, native must
ignore a missing hash only for backwards compatibility and must reject a
supplied hash that cannot be verified. A future schema migration may make
`payloadHash` mandatory for complete cursors; it must not retroactively invent
hashes for old rows.

### 4. Fixed watermark and deterministic cursor sets

`resolvedAtCursors` is a set of durable positions captured by one native
transaction. It is not a list of renderer counters.

The resolver must enforce:

- at most one cursor for each `(streamKind, streamId)` pair;
- deterministic ordering by `streamKind`, then `streamId`, then `sequence`;
- every complete cursor resolves before the transaction commits;
- no cursor is resolved beyond the native head observed by that transaction;
- a later queue, approval, retry, continuation or replay consumes the stored
  cursor set and does not reread a newer mutable head;
- `resolvedAt` is native-owned. For complete cursors, it must be derived from
  the committed authority facts (the resolver may use the maximum committed
  event time of the resolved cursor set, encoded as RFC3339). A renderer-created
  timestamp is not evidence of a watermark.

The branch journal sequence and the state revision `branch_sequence` are
different coordinates. A resolver may store both, but it must never compare or
substitute one for the other.

For a historical state base, the native resolver freezes the branch cursor
watermark at the selected revision's own `state_revision_events.sequence_no`
anchor, resolved inside the same transaction. It must not derive that
watermark from a mutable journal `MAX(sequence_no)`: a later candidate,
rejected or recovery event must not enter an older replay. A run cursor uses
the exact run-journal sequence captured in that revision's stored cursor set,
not a later run-journal maximum. When the selected revision has a journal
anchor, a resolved cursor event whose native `committed_at_ms` is later than
that anchor is rejected as `cursor_above_fixed_watermark`; this protects the
cross-stream snapshot boundary without treating timestamps as a substitute
for the typed `(epoch, sequence, eventId)` identity.

### 5. Coverage and `legacy-partial`

Coverage is an authority property, not a UI hint:

- `complete` means the owning journal exists and the cursor identity can be
  resolved to an immutable event;
- `legacy-partial` or `recovered-partial` means historical facts are available
  only in a bounded form and one or more event identities are unavailable;
- unsupported stream kinds have no coverage and are not silently converted to
  partial coverage.

For partial historical data:

1. preserve the stored row exactly;
2. keep `journalEpoch`, `eventId` and `payloadHash` all absent when the event is
   unknown; a partially filled identity is invalid;
3. never create a fake event ID, epoch, sequence mapping or payload hash from a
   projection, timestamp or array position;
4. expose the row only as explicitly partial/review-required data for inspect,
   export, recovery diagnostics and read-only compare/copy paths;
5. do not upgrade it to `complete` merely because a newer event exists;
6. executable state-base modes that need a durable replay boundary (`current-state`,
   `historical-plus-selected-deltas`, `resume`, `continue`, branch/fork/merge or
   a semantic retry) must fail closed with an integrity/provenance diagnostic
   when their required cursor authority is partial or unavailable;
7. a future contract may explicitly allow an `exact-historical` compatibility
   replay of a legacy accepted revision, but that allowance must be represented
   by a versioned field and an explicit non-complete outcome. It must never be
   inferred from a nullable cursor.

The existing state-revision receipt rule remains unchanged: complete receipts
carry `journalEpoch`, `journalSequence` and `journalEventId` together; a legacy
receipt may omit all three only when the owning journal is explicitly marked
`legacy-partial`.

### 6. Unsupported stream behavior

Until typed authority journals exist for `conversation`, `task`, `project`,
`provider` and `recovery`, an operation that requires a complete cursor for one
of those kinds must be rejected at the native boundary. The public compatibility
error may remain `invalid_state_base`; the diagnostic must identify the stable
reason (`unsupported_cursor_stream`) and the stream kind. Renderer code must not
fall back to message sequence, audit sequence, provider attempt number, an
in-memory counter or a guessed stream ID.

Adding a new authority follows the same migration pattern:

1. create an immutable journal metadata table with epoch and coverage;
2. create an append-only event table with gap-free per-stream sequence;
3. add scope and lineage triggers;
4. add a typed resolver branch and fixed-watermark tests;
5. migrate the protocol/schema only after complete and partial semantics are
   documented.

### 7. Error taxonomy and fail-closed behavior

The native implementation may keep the existing public error code
`invalid_state_base` for wire compatibility, but diagnostics must distinguish:

```text
unsupported_cursor_stream
cursor_stream_not_found
cursor_scope_conflict
cursor_epoch_mismatch
cursor_event_not_found
cursor_sequence_event_mismatch
cursor_above_fixed_watermark
cursor_payload_hash_mismatch
cursor_partial_provenance
cursor_duplicate_stream
```

Every failure occurs before a run-control operation receipt or state-revision
mutation is committed. A malformed or forged cursor must not create a blocked,
resolved or applied receipt that looks authoritative.

## Resolver contract

The implementation target is a typed transaction-scoped resolver equivalent to:

```text
resolve_cursor_authority(
    transaction,
    cursor,
    selected_scope,
    fixed_watermark,
) -> ResolvedCursorFact
```

`ResolvedCursorFact` is native-owned and may contain the normalized stream kind,
stream ID, epoch, sequence, event ID, event type, revision/run lineage,
committed time, coverage and verified payload hash. The renderer-provided cursor
is an input candidate only; it must not be copied into the receipt as proof before
this function returns successfully.

## Required regression tests

At minimum, native tests must prove both acceptance and rejection for:

```text
state_base_accepts_authoritative_branch_cursor
state_base_accepts_authoritative_run_cursor
state_base_rejects_fake_cursor
state_base_rejects_nonexistent_event
state_base_rejects_wrong_stream_scope
state_base_rejects_epoch_mismatch
state_base_rejects_sequence_event_mismatch
state_base_rejects_payload_hash_mismatch
state_base_rejects_unsupported_cursor_stream
state_base_rejects_duplicate_stream_cursor
state_base_rejects_cursor_above_fixed_watermark
state_base_preserves_legacy_partial_without_fabricating_event
state_base_blocks_executable_operation_on_partial_provenance
```

Tests must seed authoritative journal rows through the same native append path
used in production. A test that only inserts a renderer-shaped `watermark_json`
does not prove cursor provenance.

## Consequences

This decision deliberately leaves some stream kinds unavailable until their
authority stores are implemented. That is safer than treating typed projections,
message sequence numbers or audit events as replay journals. It also means the
existing fixtures that use `conversation` plus null event identity are shape
fixtures, not proof of a complete native state-base; they must be migrated to an
authoritative `branch` or `run` cursor when resolver enforcement is enabled.

The decision preserves historical data and makes its uncertainty visible. It
does not rewrite or delete old rows, and it does not claim that a missing event
can be reconstructed from the final assistant message or a mutable branch head.
