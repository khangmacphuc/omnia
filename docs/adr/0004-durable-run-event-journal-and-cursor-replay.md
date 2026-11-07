# ADR 0004 — Durable run event journal and cursor replay

- Status: Accepted for incremental implementation
- Date: 2026-08-13
- Owners: kernel, storage, desktop protocol, provider, observability

## Context

Omnia currently persists a useful conversation/run projection, but provider
stream facts are still emitted directly to the Tauri renderer. The live gateway
starts its sequence counter again for each invocation, assigns sequence only to
some delta events, and cannot replay committed usage, terminal, reasoning, or
error facts after a renderer reload or process restart. Updating the assistant
message before emitting the corresponding transient event also creates two
different, partially ordered sources of truth.

This is not sufficient for a unified harness. Desktop, web, CLI, Android,
remote clients, subagents, tools and recovery workers must observe the same
durable facts. The app must also distinguish an exact lost-response retry from
a conflicting producer event without guessing from content.

The security `audit_events` chain is intentionally separate. It records
redacted security decisions and effects; it is not a transcript of user/model
content and cannot reconstruct run output.

## Decision

### 1. Persist facts before publishing them

The kernel is the sole allocator of a run event sequence. A provider, tool,
subagent or renderer submits an event without a sequence. Native storage:

1. validates scope, type, source, size, redaction and producer identity;
2. allocates the next gap-free per-run sequence inside a SQLite transaction;
3. appends the immutable normalized event;
4. mutates materialized projections and the usage ledger in that same
   transaction where the fact changes state;
5. commits; and
6. only then publishes the committed event/cursor to live subscribers.

Delivery failure does not fail or roll back a provider run. The subscriber
reconnects from its last durable cursor. Projection mutation without the event,
or event append without its required projection mutation, is a transaction
failure.

### 2. One normalized envelope

Every journal event carries:

```text
schema version
event ID
per-run sequence
type and occurrence time
project/conversation/branch/run lineage
optional run-set/attempt/iteration/item lineage
optional command/correlation identity
source, visibility and sensitivity
bounded JSON payload
bounded namespaced extensions
```

Unknown provider wire events are not promoted to an invented common event.
Adapters may retain a bounded, namespaced diagnostic after redaction. Raw
headers, credentials, secret values, cookies, filesystem paths and unrestricted
provider payloads are forbidden from journal and renderer IPC.

Fine-grained text may be coalesced before persistence by an ordered native
buffer, but committed event content is never rewritten. Lifecycle, approval,
tool, citation, artifact, usage and terminal events cannot be dropped.

### 3. Deduplication requires proven identity

Content-based duplicate detection is forbidden. An append can be idempotently
replayed only by:

- the same local event ID and byte-equivalent canonical envelope;
- a command idempotency identity bound to the same normalized fact; or
- a provider/tool event ID or cursor whose canonical identity was hashed and
  bound to the exact attempt/tool scope before persistence.

The raw remote cursor or event ID is adapter-private. The common journal stores
only its namespace and non-secret identity hash. Reusing an identity with a
different fact is a deterministic conflict. Without proven identity, equal text
is a new event; Omnia does not silently discard it.

### 4. Cursors are durable positions, not renderer counters

The internal cursor position binds:

```text
run ID
journal epoch
sequence
event ID at that sequence
```

Native IPC serializes it as an opaque authenticated token and independently
revalidates protocol session, profile and run authorization. A cursor from a
different run or journal epoch is rejected. Import/restore/re-keyed projection
replacement creates a new epoch rather than accepting ambiguous old cursors.

Replay is a two-boundary protocol:

1. the first page captures a `throughCursor` at the current committed head;
2. every subsequent page reuses that fixed watermark;
3. after the finite replay reaches the watermark, the client subscribes to the
   live tail from that exact cursor.

This prevents events appended during pagination from being skipped, duplicated
or mixed into an unstable page window. Server implementations must close the
replay-to-live race atomically: register the live subscription at the watermark
before returning the tail, or buffer committed events until registration is
complete.

### 5. Terminality and completeness are explicit

A journal contains at most one run terminal fact:

```text
run.completed
run.cancelled
run.failed
```

It must agree with the materialized run state in the same transaction. Provider
attempt terminal events do not imply run terminality; a retry or approved
fallback may follow. Once the run is terminal, additional provider stream,
tool-execution or run-lifecycle facts are rejected. Bounded post-run job facts
such as validation, citation validation, memory proposal, evaluation and
checkpoint results may still append; they cannot reopen or alter the terminal
run outcome.

New runs use coverage `complete`. Runs imported from the current pre-journal
schema or recovered after incomplete historical telemetry are marked
`legacy-partial` or `recovered-partial` with an explicit reason. Omnia does not
fabricate missing deltas from the final assistant projection and does not label
a partial journal complete.

### 6. Canonical storage target

The native migration should create a typed table similar to:

```sql
CREATE TABLE run_events (
    run_id TEXT NOT NULL,
    sequence_no INTEGER NOT NULL CHECK (sequence_no >= 1),
    id TEXT NOT NULL UNIQUE,
    event_type TEXT NOT NULL,
    occurred_at_ms INTEGER NOT NULL,
    committed_at_ms INTEGER NOT NULL,
    attempt_id TEXT,
    iteration_id TEXT,
    item_id TEXT,
    command_id TEXT,
    correlation_id TEXT,
    source TEXT NOT NULL,
    visibility TEXT NOT NULL,
    sensitivity TEXT NOT NULL,
    payload_json TEXT NOT NULL CHECK (json_valid(payload_json)),
    extensions_json TEXT CHECK (extensions_json IS NULL OR json_valid(extensions_json)),
    ingress_kind TEXT,
    ingress_namespace TEXT,
    ingress_identity_hash TEXT,
    PRIMARY KEY (run_id, sequence_no),
    UNIQUE (run_id, id)
) WITHOUT ROWID, STRICT;
```

Production schema must additionally provide composite lineage guards, bounded
ingress identity uniqueness scoped to the relevant attempt/tool producer,
immutable row triggers, journal epoch/coverage metadata, and an index suitable
for `run_id + sequence_no` replay. The exact migration version is coordinated
with the attachment schema work; this ADR does not claim a schema number.

Large payload bodies remain in the encrypted content store and journal events
carry immutable blob IDs/hashes. The journal is append-only application data,
not a generic logging sink.

### 7. Recovery and projection rebuild

At startup, storage verifies per-run sequence continuity, terminal uniqueness,
lineage, and projection watermark. It can rebuild message, item, usage and run
state projections from a complete journal plus immutable snapshots. A checksum
or projection watermark mismatch is a recovery condition, not a reason to
silently trust renderer state.

For a nonterminal provider attempt after a crash, recovery records a new durable
fact describing reattachment, interruption or outcome uncertainty. It never
assumes that absence of a terminal event proves the remote request was not
accepted, and it never automatically retries an ambiguous non-idempotent
dispatch.

## Consequences

- Live UI becomes a projection of durable facts and can reconnect without
  losing usage, terminal or diagnostic state.
- Provider gateway code can normalize wire events without owning sequence,
  persistence, projection or renderer-delivery policy.
- A run inspector, replay export, subagent trace and remote client share one
  provenance boundary.
- Streaming persistence adds write load. Native batching/coalescing and WAL
  tuning are required, while non-droppable event classes remain lossless.
- Legacy runs must be truthfully marked partial rather than backfilled with
  synthetic events.

## Rejected alternatives

### Tauri events as the source of truth

Rejected because renderer delivery is transient, sequence restarts on process
boundaries, and a disconnected client cannot prove what it missed.

### Final assistant message as the only durable record

Rejected because it loses provider attempts, usage corrections, citations,
tools, approvals, interruption boundaries, timing and recovery provenance.

### Security audit log as the run journal

Rejected because audit records deliberately omit prompt and output bodies and
serve a different integrity/retention policy.

### Content-based stream deduplication

Rejected because providers can legitimately emit identical adjacent text and
different fragments can produce the same final content.

### An ever-growing global sequence exposed to clients

Rejected as the primary replay contract because clients subscribe by run and a
global database order would leak unrelated activity and complicate retention.
An internal commit/outbox order may still exist for efficient fan-out.

## Implementation slices

1. Land and keep testing the pure domain journal/cursor/idempotency contract.
2. Add transactional schema, migration, immutable guards and lineage tests.
3. Add one storage repository method that appends events and updates projection
   state atomically.
4. Change provider gateway to submit normalized facts to the repository and
   publish only committed events.
5. Add `run_events_read` and `run_events_subscribe` with opaque cursor/session
   binding, fixed-watermark replay and bounded pages.
6. Hydrate renderer projections through replay, deduplicate by sequence/event
   ID, and remove the transient per-dispatch counter.
7. Add startup verification, projection rebuild and explicit partial-coverage
   recovery.
8. Extend the same boundary to tools, subagents, approvals, citations, artifacts
   and usage ledger entries.

## Exit gates

- concurrent appenders cannot allocate the same sequence or create a gap;
- a transaction crash cannot leave an event and projection on opposite sides
  of a commit;
- lost-response retries return the existing canonical event only when identity
  and normalized fact match;
- duplicate text without proven producer identity is preserved;
- reconnect from every cursor returns every committed event exactly once in
  sequence order;
- replay remains stable while new live events are appended;
- cursor from another run, epoch, profile or protocol session is rejected;
- exactly one run terminal event agrees with the terminal run projection;
- unknown/non-idempotent attempts are not automatically resent after restart;
- projection rebuild matches the journal hash/watermark;
- partial historical coverage is visible to the UI and replay export;
- secret/path/provider-header canaries never appear in journal, IPC, telemetry
  or replay bundles.
