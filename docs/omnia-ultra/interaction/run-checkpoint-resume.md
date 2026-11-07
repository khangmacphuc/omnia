---
id: OMNIA-ULTRA-INT-RUN-CHECKPOINT-RESUME
title: Truthful pause, checkpoint and resume contract
status: normative-target
version: 1.0.0
last_reviewed: 2026-08-14
supersedes: []
---

# Truthful pause, checkpoint and resume

`Pause` is a durable control intent. It is not a promise that every provider,
tool, browser, child agent or remote machine can freeze immediately.

## State machine

~~~text
running -> pause_requested -> checkpointing -> paused
                         \-> abort_requested -> reconciling -> paused|unknown
                         \-> draining|detached|reconcile_required
paused -> resume_requested -> validating -> resuming -> running
paused -> expired|blocked|cancelled
~~~

The UI must distinguish `pause_requested`, `checkpointing`, `paused`,
`abort_requested`, `draining`, `detached`, `outcome_unknown` and
`reconcile_required`. It never labels a run simply “Paused” while a billable,
privileged or external effect may still be executing.

## Target dispositions

Each active target receives one disposition and a receipt:

- `cooperative_checkpoint` — the target stopped between declared atomic units;
- `provider_supported_suspend` — a validated remote continuation handle exists;
- `cancel_then_reconcile` — cancellation was requested and acceptance/billing
  must be reconciled before replay;
- `pending_effect_checkpoint` — a non-interruptible effect is isolated or
  explicitly marked unknown;
- `held` — queued descendants are prevented from starting.

The run card shows the disposition, active target count, current atomic unit,
last safe boundary, checkpoint progress, expected wait, escalation policy and
the difference between Stop, Abort transport, Detach remote work and Dismiss.

## Checkpoint envelope

A checkpoint binds goal/plan/task, branch and state revision, run/attempt/agent
IDs, durable output cursor, partial-output disposition, frozen provider input,
provider acceptance evidence, tool/effect receipts, approvals, leases/locks,
queue/steer dependencies, context/cache manifests, retry schedule, telemetry
watermark, redaction policy and pending reconciliation items. It has a content
hash and an idempotency key.

## Resume and restart

Resume creates a new execution segment linked to the checkpoint; it never
pretends a dead network stream stayed alive. Before dispatch, native code
verifies checkpoint hash, state head, policy/capability revision, lease epoch,
attachments, workspace revisions, approval expiry, provider acceptance and
external-effect outcome. It may resume from the cursor, create a fresh frozen
input, request approval, block for reconciliation or report an actionable
conflict. Crash recovery replays the journal to a fixed watermark before
exposing Resume.

## Acceptance gates

Test provider streams, tools, approval waits, child agents, queued work,
remote work, process crash/restart, expired leases, policy drift, missing
attachments, unknown effects, duplicate-control retries and keyboard,
screen-reader, reduced-motion and remote-client surfaces.

See `../schemas/run-checkpoint.schema.json` and
`run-control-edit-retry.md`.
