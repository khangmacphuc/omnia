---
id: OMNIA-AUDIT-QUEUE-RENDERER-FEASIBILITY-2026-09-14
title: Queue and steer renderer feasibility audit
status: evidence-bound-audit
date: 2026-09-14
scope: renderer-contract-and-native-boundary
---

# Queue and steer renderer feasibility audit

## Verdict

The current renderer can host a queue/steer surface, but it does not currently
have a durable queue projection, queue store, queue IPC bridge, or native queue
command. The correct classification is **planned** for
`OMNIA-CAP-QUEUE-STEER-SCHEDULE`. A renderer-only queue panel would be a mock or
preview and must not be presented as durable execution.

This audit is intentionally additive. It does not enable queue execution, add
renderer authority, or change the capability ledger.

## Evidence from the current tree

### Existing renderer seams

- `src/features/workspace/conversation-view.tsx` owns the conversation
  toolbar, timeline, local navigation state and composer placement. It has no
  queue projection or queue controls.
- `src/features/workspace/store.ts` owns conversations, drafts, active runs,
  run journal projections, checkpoints and continuation projections. It has no
  durable queue collection or queue mutation methods.
- `src/features/workspace/types.ts` has conversation/run view types, but no
  renderer-safe queue item, queue batch, dependency graph, lease, scheduler or
  queue receipt type.
- `src/features/workspace/run-control-projection.ts` and
  `src/features/workspace/run-control-sync.ts` provide run-control projection
  helpers, but they do not represent queue order, dependency state or
  scheduler state and are not a queue implementation.
- `src/lib/desktop.ts` exposes `run_control_resolve` and
  `run_control_apply`, but no `queue.add`, `queue.reorder`, `queue.remove`,
  `run.steer`, `queue.pause`, `queue.resume` or scheduler bridge.

### Existing native boundary

- `src-tauri/src/run_control.rs` has a closed `RunControlKind` vocabulary for
  pause, resume, continue, edit, retry, copy, duplicate, branch, fork,
  compare, promote and merge. It does not contain queue, steer, Btw, parallel
  or scheduled operation kinds.
- `src-tauri/src/native_commands.rs` registers run-control resolve/apply and
  checkpoint commands, but no queue or scheduler commands.
- No queue-item table, durable queue journal, scheduler lease table or queue
  receipt API is present in the current storage contract.
- `docs/omnia-ultra/delivery/capability-ledger.json` therefore correctly keeps
  `OMNIA-CAP-QUEUE-STEER-SCHEDULE` at `planned` with empty implementation and
  test evidence.

### Normative target already available

- `docs/omnia-ultra/interaction/queue-steer-schedule.md` defines the target
  semantics: steer-before-queue ordering, Btw isolation, parallel and
  scheduled modes, transactional reorder, dependency safety, cancellation
  receipts and conflict rules.
- `docs/omnia-ultra/schemas/conversation-navigation.schema.json` provides the
  initial operation/queue-item envelope, including `itemId`, `mode`,
  `orderKey`, `priority`, dependency IDs, schedule/deadline, model/effort and
  machine mode.
- `docs/omnia-ultra/tools/validate-conversation-navigation.mjs` validates
  schema cross-fields and deterministic batch dependency fixtures. It is a
  contract gate only; it does not persist, lease, execute or recover queue
  work.

## Renderer design that is feasible after native contracts exist

The first renderer slice should be a read projection, not a client-side
scheduler. Native should return a bounded snapshot such as:

```ts
interface QueueSnapshot {
  schemaVersion: 1;
  conversationId: string;
  branchId: string;
  stateRevisionId: string;
  watermark: number;
  queueRevision: number;
  items: readonly QueueItemProjection[];
  leases: readonly QueueLeaseProjection[];
  scheduler: QueueSchedulerProjection;
  receipts: readonly QueueReceiptSummary[];
  coverage: "complete" | "partial" | "unknown";
}
```

The renderer projection must be content-bounded and must not include provider
secrets, cookies, raw authorization headers, hidden reasoning, attachment
bytes, or unbounded prompt/response text. Each item should expose only a
bounded excerpt or a native redacted label plus:

- immutable `itemId`, parent batch and source cursor;
- mode (`steer`, `queue`, `btw`, `parallel`, `scheduled`, `draft`);
- lifecycle state (`draft`, `blocked`, `scheduled`, `queued`, `running`,
  `paused`, `completed`, `cancelled`, `failed`, `outcome-unknown`, `removed`);
- order key, priority, dependency IDs, conflict set and deadline;
- model/profile/effort and machine/sandbox policy labels;
- created/started/completed timestamps and bounded retry summary;
- stale/conflict/approval indicators and receipt IDs.

The snapshot must be fixed-watermark and revision-addressed. The renderer must
never infer queue authority from `activeRun`, `conversation.runState`, item
visibility or a local array reorder.

## Required UI behavior

Once the native read/write bridge is available, a queue drawer can be added to
the conversation toolbar and the background-activity rail:

1. Show the active item, steer lane, ordinary queue, Btw lane, parallel lane
   and scheduled lane as distinct groups.
2. Keep the active item expanded and other items collapsed by default. Clicking
   an item opens a bounded inspector showing prompt revision, context policy,
   model/effort, timing, retry and receipt summaries.
3. Drag/reorder must be a preview transaction: show dependency/conflict impact,
   stale revision warnings and an explicit Apply/Cancel pair. Do not mutate the
   local order optimistically as if the operation committed.
4. Bulk select supports delete, duplicate, split, merge, enhance, change
   model, change agent, pause/resume, retry, schedule, promote and demote only
   when native capability evidence for that operation is present.
5. Steer is visibly distinct from queue: it waits for the current atomic step
   and is not silently inserted into the ordinary order.
6. Btw remains side-context until promoted; it must not mutate the main branch
   merely because it is visible in the drawer.
7. Outside-pointer, Escape and close-button behavior must dismiss overlays and
   restore focus. Reduced-motion and keyboard reorder paths must be supported.
8. A stale snapshot, missing receipt, lease conflict or unknown outcome is
   displayed as an explicit state with recovery/reload actions, never as
   success.

## Native prerequisites before enabling controls

The renderer should keep all queue controls disabled or absent until all of the
following are true and tested:

- durable queue item/batch tables and immutable receipts exist;
- native queue read, add, reorder, remove and bulk-operation commands exist;
- queue operations resolve a typed state-revision/cursor base and use CAS;
- dependency cycles, unknown dependencies, conflict sets, deadlines and
  scheduler timezones are checked natively;
- steer applies at a declared safe boundary and cannot rewrite frozen provider
  input;
- leases, pause/resume, cancellation, retry and restart recovery are durable;
- operation idempotency and payload-drift behavior are covered;
- renderer hydration/reconnect uses fixed-watermark replay;
- capability-ledger implementation/test/evidence fields are populated;
- native Rust compilation, tests and packaged Windows runtime are verified.

## Non-goals for this feasibility slice

This document does not enable local timers, background fetches, optimistic
reordering, provider calls, autonomous scheduling, hidden retry loops,
computer/browser execution or remote control. Those would bypass the current
native authority and approval boundary.

## Acceptance gates for the future renderer slice

- Snapshot rendering is deterministic for identical queue revision and
  watermark.
- Reorder preview shows the exact before/after order and dependency impact.
- A stale queue revision is rejected and leaves the local projection unchanged.
- Duplicate, remove and bulk actions remain visible through receipts rather
  than disappearing from history.
- Steer, queue, Btw, parallel and scheduled items retain distinct semantics
  after restart and reconnect.
- Accessibility tests cover focus, keyboard movement, dialog dismissal,
  reduced motion and screen-reader labels.
- No queue UI test claims native execution when only a renderer fixture exists.

