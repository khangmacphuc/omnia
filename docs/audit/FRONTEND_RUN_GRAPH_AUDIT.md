# Frontend run-graph audit

Date: 2026-08-13  
Scope: renderer contracts, native `ConversationSnapshot` projection, and the
relationship between the Phase 1 chat path and the unified Omnia kernel graph.

## Outcome

The current desktop chat path does not yet project a complete unified run
graph. Native storage returns conversations, branches, messages, logical runs,
and provider attempts. The renderer reduces those records to a conversation
array plus one transient `activeRun`, so attempt lineage, retry safety,
context/environment provenance, and replay state are not available to the UI.

This audit added `run-graph-projection.ts`, a fail-closed projection of the
native facts that do exist. It deliberately labels the result `partial` and
reports missing kernel layers instead of inventing task, iteration, item,
context, or environment identities.

## Shipped audit guard

`src/features/workspace/run-graph-projection.ts` now provides:

- deterministic ordering independent of database row order;
- project or projectless conversation roots;
- explicit conversation, branch, message, run, and attempt nodes;
- run-to-branch, run-to-assistant-message, and run-to-attempt lineage;
- branch-parent, ownership, duplicate-ID, attempt-ordinal, and orphan checks;
- explicit capability gaps for every native DTO field/layer not yet exposed;
- `partial` versus `invalid` completeness without silent repair.

The module is intentionally not connected to the inspector yet. The durable
native schema and IPC must expose the missing identities before a renderer can
truthfully present a complete kernel graph.

## P0 contract gaps

### 1. Projectless conversation scope is now represented in the domain graph

`ConversationRecord.projectId` is nullable and the product creates ordinary
conversations without a project. `UnifiedRunGraph` now supports a profile root
for durable projectless chat and retains an explicit conversation-root form for
legacy/import boundaries. It never creates a fake project.

The frontend projection therefore no longer reports `project-root` as a
capability gap when `projectId` is null; the conversation itself is the truthful
native-known root until a profile identity crosses that transport.

### 2. Branch is now first-class in the domain graph

Every native message and run is branch-scoped, while the domain hierarchy is:

```text
profile/project -> conversation -> branch -> optional task -> run
  -> provider attempt -> iteration -> item
```

Branch nodes now provide a durable output-routing boundary after a user forks a
chat. Ordinary chat runs may attach directly to a branch, while explicit tasks
remain available for goals, plans, and background work. Native persistence and
IPC still need to adopt this domain contract before it can be advertised as a
shipped durable graph.

The existing TypeScript graph still uses `run -> attempt -> iteration -> item`.
The attempt/iteration edge remains an explicit architecture blocker rather than
being silently migrated: native storage treats attempts as provider dispatches,
while a multi-step tool loop generally needs a new dispatch per iteration.

### 3. Native run records now bind the triggering user message

`RunRecord` now exposes `userMessageId`, derived from the persisted assistant
projection's `parent_message_id` in the same native snapshot query. The
frontend projection validates role, conversation, and branch ownership instead
of inferring the previous message from sequence order. This closes the current
DTO gap without changing schema; future canonical run storage should persist
the user-message foreign key directly with composite lineage constraints.

### 4. Frozen context and environment identity do not cross IPC

Native `RunRecord` has no context snapshot ID/hash, execution environment ID,
policy version, capability-set hash, memory/skill versions, or resolved model
profile identity. The renderer cannot truthfully show reproducible pre-dispatch
inputs or connect citations to the exact frozen context.

### 5. Retry-safety state now crosses IPC

SQLite stores `run_attempts.idempotency_supported`, but `RunAttemptRecord` in
Rust serialization and TypeScript now preserve it. The fail-closed frontend
projection no longer reports this field as missing, and a resumed client can
inspect whether the provider declared idempotent retry support. This fact does
not authorize automatic replay of an outcome-unknown attempt; replay policy
still requires durable request identity and native recovery semantics.

### 6. No durable item/event journal is hydrated

`runTimelineEvents` exists only as a renderer collection and is not populated
from `ConversationSnapshot`. There is no event cursor, item lifecycle,
iteration identity, tool-call lineage, or replay boundary in the frontend
transport. The inspector must not imply a complete audit trail until these are
native, append-only facts.

## P1 frontend projection gaps

### 7. `conversation-catalog.ts` discards attempts

The catalog maps `snapshot.runs` only to assistant `runId` and ignores
`snapshot.attempts`. Retry, fallback, provider acceptance, remote request ID,
and outcome-unknown state never reach the UI.

### 8. Latest-run selection trusts array order

`runStateForSnapshot()` uses `snapshot.runs.at(-1)`. Native SQL currently sorts
rows, but ordering is not expressed in the IPC contract. Projection should sort
by a durable ordinal or timestamp plus ID, and the future event projection must
prefer authoritative sequence/cursor order.

### 9. Native branch reconstruction hides corrupt snapshots

`activeMessageIds()` returns an empty array for a branch cycle or a missing
branch/fork point. That converts corruption into an apparently empty chat.
Hydration should surface a typed recovery/diagnostic state and retain the raw
snapshot for inspection.

### 10. Only one transient run is represented globally

`useWorkspaceStore.activeRun` permits one active run for the entire renderer.
It is cleared during hydration and is not a projection of native runs. This
cannot support queued turns, simultaneous projects, subagents, background
research, downloads, terminal work, or remote-machine jobs.

Required direction: normalize durable run summaries by ID and track UI focus
separately from lifecycle. A selected run is not the same thing as the only run.

### 11. Stream events are projected without a replay cursor

`ChatComposer` subscribes directly to `omnia://run-event` and appends deltas to
the current in-memory message. It has no per-run sequence ledger, reconnect
cursor, duplicate suppression, or subscription epoch. A reload or event replay
can lose or duplicate text.

### 12. Provider dispatch bypasses the frozen run snapshot contract

The current desktop sequence persists the prompt/run and then independently
constructs provider history from the renderer conversation. Attachments,
compiled context, memory/skills, policy decisions, and the exact frozen
parameters are not dispatched from a single immutable native snapshot. The
kernel must own this assembly and dispatch atomically.

## Required integration sequence

1. Finalize graph identity semantics, including projectless scope and branch.
2. Add durable task, run, attempt, iteration, item/event, context snapshot, and
   environment tables/projections with authoritative ordinals/sequences.
3. Expand Rust and TypeScript DTOs without lossy state vocabulary translation.
4. Hydrate normalized renderer projections from native read APIs and cursors.
5. Replace component-owned stream orchestration with an application run
   controller that subscribes/replays by run ID and cursor.
6. Bind composer attachments and the user message before context compilation.
7. Freeze and persist context/provider/parameter/policy/environment inputs
   before native dispatch.
8. Render the Run inspector from the durable projection, including explicit
   partial/invalid states and capability gaps.

## Verification

The focused test suite covers:

- complete native-known lineage;
- deterministic row ordering;
- cross-branch and orphan-attempt corruption;
- projectless conversations;
- branch cycles and duplicate attempt IDs.

Commands:

```powershell
npx vitest run src/features/workspace/run-graph-projection.test.ts
npm run typecheck
```

Result on 2026-08-13: six focused tests passed. A later whole-tree
typecheck/storage run was affected by concurrent UI and attachment-repository
edits; focused run-contract gates are reported separately in the parent
handoff rather than overstating a full-tree green result.
