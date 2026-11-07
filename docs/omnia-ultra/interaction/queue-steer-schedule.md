---
id: OMNIA-ULTRA-INT-QUEUE
title: Queue, steer, interrupt, side question and scheduling
status: normative-target
schema: schemas/conversation-navigation.schema.json
---

# Queue and steering

## Semantics

- Interrupt: stop at a safe cancellation point, checkpoint and report effects.
- Steer: wait for the current atomic step, then execute before ordinary queue.
- Queue: wait for earlier queued items according to order/dependency.
- Btw: side question that cannot mutate main context until promoted.
- Parallel: execute independent items concurrently.
- Scheduled: execute at time/trigger with timezone and missed-run policy.
- Draft-only: prepare but do not execute.

## Queue item fields

- item ID and parent batch;
- mode;
- order key;
- priority;
- deadline;
- dependency IDs;
- conflict set;
- prompt revision;
- context policy;
- model/provider/effort;
- machine/sandbox;
- approval policy;
- retry policy;
- created/started/completed timestamps;
- owner and provenance.

## Operations

Drag/reorder, move up/down, stack, batch, edit, delete, duplicate, split, merge,
enhance, pause, resume, retry, fork, schedule, promote, demote, change model,
change agent and bulk actions are required.

Reorder must be transactional, undoable and cycle-safe. The UI previews the
dependency impact before commit.

## Scheduler

Support time, cron, calendar, email, file, Git, CI, webhook, provider health,
cost threshold, artifact completion and manual triggers. Persist timezone,
missed-run behavior, retry/backoff, deadline, concurrency, locks, budgets,
approvals and notification routing.

## Conflict rules

- A steer supersedes obsolete semantic instructions only when the user intent
  explicitly corrects them.
- A queue item never silently edits an already-running input.
- A cancelled item remains visible with a cancellation receipt.
- A removed item remains in audit history as removed, not as missing data.
- Concurrent branch output never moves to the currently visible branch by accident.

