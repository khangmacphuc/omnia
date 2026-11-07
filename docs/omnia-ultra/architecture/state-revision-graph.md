---
id: OMNIA-ULTRA-ARCH-STATE-REVISION-GRAPH
title: Authorized state revision graph and causality contract
status: normative-target
version: 1.0.0
last_reviewed: 2026-08-14
supersedes: []
schema: schemas/state-revision-graph.schema.json
---

# Authorized state revision graph

Omnia treats conversation state as an immutable, branch-scoped revision graph.
It is not a mutable transcript string and it is never reconstructed from what
a renderer happens to display. A run-control command reads one declared graph
scope at a durable watermark and records the exact state base used for the
next operation.

Typed durable tables and the append-only journal remain authoritative. The
graph is a redacted materialized projection for inspect, compare, export,
recovery and replay; it cannot become a second untyped source of truth. It
contains IDs, manifests, policy snapshots, cursors and hashes rather than raw
secret values, cookies, credential material, unrestricted provider payloads or
file bytes.

Cursor provenance for `stateBase.resolvedAtCursors` is governed by
`../../adr/0008-run-control-multi-stream-cursor-authority.md`. The graph
projection and watermark JSON are not cursor authority by themselves.

## State units and edges

State units may reference messages, message revisions, prompt revisions,
assistant segments, tool calls/results, files, artifacts, source/citation
records, goals, plans, tasks, memory/skill revisions, approvals, model and
parameter policies, cache plans, machine/session bindings and reconciliation
receipts. Large or sensitive values remain content-addressed references with
classification and retention metadata.

Typed edges include `inherits-from`, `checkpoint-of`, `continues-from`,
`resumes-from-checkpoint`, `edits`, `retries`, `branches-from`, `forks-from`,
`merges-from`, `promotes`, `compacts`, `reconciles-external-effect`,
`supersedes`, `conflicts-with` and `derives-selected-delta-from`. Every edge
carries source/target state-revision IDs, event cursor, actor, timestamp,
policy revision and optional expiry.

Edge orientation is normative: `fromStateRevisionId` is the derived/new fact
and `toStateRevisionId` is the source/parent fact it references. Thus a child
revision that `continues-from` a parent is represented as `child -> parent`.
This orientation is used by the native append path, graph projection and
independent schema verifier; consumers must not reverse it when rendering
lineage or computing ancestors.

## Causality and branch heads

Every state revision has:

- `stateRevisionId`, parent state-revision IDs and a monotonic branch sequence;
- conversation/project/branch scope and source event cursor;
- a typed state-read watermark plus observed and expected branch-head revision;
- content/derived hashes, data-class summary and authority boundary;
- accepted, candidate, rejected, superseded, blocked, conflicted or
  `outcome-unknown` status;
- provenance, actor, correlation ID and immutable creation time.

The native kernel applies a state mutation with compare-and-swap semantics. A
stale expected head returns a typed conflict and the observed/current diff; it
never silently adopts the newer head or uses last-writer-wins. A caller must
choose rebase, recompile, queue-after, fork, discard or cancel. Remote clients,
automation and recovery workers use the same command and watermark path.

## Accepted versus visible work

Visible streaming text, an unreviewed file diff, a side-question answer and a
tool result with unknown outcome are candidate evidence. They do not become
branch state until the configured finalization, promotion or acceptance policy
records a durable decision. `outcome_unknown` is excluded from future context
and external-effect replay unless a reconciliation receipt or explicit user
decision establishes safe use.

### Accepted head, watermark and continuation eligibility

The native stream owns the accepted-head projection and its sequence watermark.
An executable continuation must name an accepted revision in the same
conversation, branch and stream, and that revision must be at or below the
accepted watermark. Historical accepted revisions remain executable after the
head advances; resolving a historical request never silently substitutes the
newer head. Candidate, rejected, superseded, `outcome-unknown`, conflicted,
blocked, discarded and invalid revisions are not executable inherited context.
They may be included in preview/plan/draft projections only with an explicit
non-executable marker.

The projection is an integrity boundary: accepted revisions with a null head,
a non-zero watermark with no head, a cross-stream or missing head, or a head
whose sequence/status does not match the accepted revision fails closed. A
checkpoint root binds to the exact requested state revision. A run root proves
run/conversation/branch scope only; it does not prove that a state revision was
produced by that run.

## Context and authority projection

`current-state` retry and Continue resolve the authorized branch head at the
captured watermark. A context compiler may select only relevant segments, but
must emit a manifest containing included, omitted and retrieval-eligible units,
revisions, hashes, security class, inclusion reason and token/byte estimate.
Sibling branches, revoked grants, secrets, cookies, remote sessions, expired
approvals and protected observations are excluded and represented as denied or
redacted metadata rather than copied into a provider request.

The resulting `stateBase` records source state, expected head, resolved state
revision, content hash, context manifest, selected delta IDs and all committed
watermarks. Once captured, a queue, approval wait, background handoff or
provider dispatcher consumes exactly that pinned base rather than rereading a
newer branch head. `exact-historical`, `current-state`,
`historical-plus-selected-deltas`, `fresh-branch` and `fresh-goal-start` are
distinct machine modes, never an unlabelled “retry” default.

If A is retried, its accepted successor creates a new state revision. A later
`current-state` retry of B resolves the valid branch head at its own fixed
watermark, so B can include A's accepted successor without merging a visible
candidate or an `outcome-unknown` effect. Exact historical B stays pinned to
its previous state. When A is still running, B must use an explicit committed
head, wait-for-A dependency, parallel fork or cancellation policy.

## Lifecycle and recovery

State transitions are append-only facts followed by atomic projections. A
checkpoint, retry, edit, branch, compare, promotion or merge creates a new
revision and preserves all parents. On restart, the kernel replays to a fixed
watermark, validates hashes and policy freshness, reclaims stale leases and
marks unresolved external effects for reconciliation before allowing replay.

## Runtime projection and export boundary

The rich graph schema in
`../schemas/state-revision-graph.schema.json` is the portable export and
inspection target. It is not automatically the wire shape of every native
read. The current bounded Tauri command exposes a deliberately smaller
`native-state-revision-graph-read-v1` projection containing the stream/scope
IDs, bounded accepted head, branch watermark, redacted revision summaries and
redacted causal edges. Its implementation types are
`src-tauri/src/storage.rs::StateRevisionGraphSnapshot` and
`src/lib/desktop.ts::StateRevisionGraphSnapshot`.

### Bounded pagination semantics

The native read uses two independent keyset cursors: one for revisions and one
for edges. Each cursor is scoped to the conversation, branch, state-revision
stream and inclusive `throughBranchSequence` watermark that created it. The
cursor MAC is process-local; a native-process restart invalidates outstanding
cursors, so they are continuation handles rather than durable or restart-safe
capabilities. A malformed, truncated, oversized, tampered or wrong-collection
cursor fails closed before any page is returned.

The cursor intentionally does **not** bind the page-size request. A caller may
use a different positive page size (within the native maximum) when following a
valid cursor; keyset ordering still prevents duplicates or skips, while the
fixed watermark prevents later appends from entering the continuation. The
revision and edge limits remain independent, and either collection may be
continued without advancing the other. A requested watermark supplied with a
cursor must equal the cursor's frozen watermark; conflicting watermarks are
rejected.

Native storage applies the serialized-response byte budget after continuation
metadata is encoded. If the nominal page would exceed that budget, only whole
trailing items are moved into continuation work. A single item that cannot fit
the bounded response fails closed; the reader never emits a partial revision,
edge or parent list.

Consumers must not validate that compact IPC object directly against the rich
schema or infer omitted authority, manifest, causation, routing/cache,
projection-cursor, actor, diagnostic or timestamp facts. A future
`graph-export-adapter-v1` may transform the compact read plus immutable typed
facts into the rich schema, but only from one fixed SQLite snapshot. Missing
historical coverage must be represented as explicit partial/review-required
state; the adapter must never fabricate IDs, cursors, actors, policy records,
multiple heads or digest algorithms. The current mismatch and acceptance
boundary are recorded in
`docs/audit/STATE_REVISION_GRAPH_CONTRACT_AUDIT_2026-09-10.md`.

## Acceptance evidence

The graph contract is accepted only when tests prove deterministic replay,
stale-head rejection, two-client CAS convergence, accepted-versus-candidate
separation, branch isolation, supersession/contradiction handling, revocation
exclusion, A-retry-to-B-current-state visibility and crash recovery without
duplicating provider billing or external effects.

See `authority-and-event-model.md`,
`../interaction/run-control-edit-retry.md`,
`../schemas/state-revision-graph.schema.json` and
`../schemas/run-control-operation.schema.json`.
