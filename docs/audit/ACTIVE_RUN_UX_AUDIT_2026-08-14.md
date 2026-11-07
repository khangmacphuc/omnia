---
id: OMNIA-AUDIT-ACTIVE-RUN-UX-2026-08-14
title: Active-run control UX and state-consistency audit
status: audit-current-tree
last_reviewed: 2026-08-14
scope:
  - pause-resume-continue
  - immutable-edit-retry
  - active-run-branch-fork-copy-compare
  - queue-steer-and-recovery
---

# Active-run control UX and state-consistency audit

## Scope and outcome

This audit reviews the current normative target for the following user-visible
operations while a model, tool, agent or queued workflow is active:

- Pause, Resume and Continue without entering another prompt, including an
  empty new chat;
- immutable edit and retry, including a retry of B after an accepted retry of
  A;
- Copy, duplicate, branch, fork, compare and promotion; and
- queue, steer, cancellation, restart recovery and accessibility.

The main contract already captures the core intention correctly: run controls
are durable operations over immutable revisions; an in-flight provider input is
frozen; Retry has explicit state-base modes; and `current_state` can include
accepted consequences of earlier retries. The key remaining work is to make
the *time*, *transport*, *concurrency* and *visible-control* semantics equally
explicit. Without them, two implementations can show the same buttons but make
opposite claims about whether a run stopped, which state a retry saw, or
whether a branch contains partial stream content.

This is an audit and does not claim these capabilities are implemented in the
native application.

## Existing coverage worth preserving

The following requirements are already present and should remain canonical:

| User need | Existing canonical target |
| --- | --- |
| Pause creates a durable intent and waits for a declared safe boundary | [`run-control-edit-retry.md`](../omnia-ultra/interaction/run-control-edit-retry.md) |
| Continue can work after an answer, after a pause and in an empty new chat | [`run-control-edit-retry.md`](../omnia-ultra/interaction/run-control-edit-retry.md) |
| Edit never overwrites accepted history | [`run-control-edit-retry.md`](../omnia-ultra/interaction/run-control-edit-retry.md) |
| Retry exposes historical, current-state, selected-delta and fresh-branch modes | [`run-control-edit-retry.md`](../omnia-ultra/interaction/run-control-edit-retry.md) |
| B retry can use A's accepted retry result in current-state mode | [`run-control-edit-retry.md`](../omnia-ultra/interaction/run-control-edit-retry.md) |
| Active run mutations must apply safely, interrupt, queue or fork | [`run-control-edit-retry.md`](../omnia-ultra/interaction/run-control-edit-retry.md) |
| Branch/fork authority attenuation and compare/merge rules | [`branching-copy-fork.md`](../omnia-ultra/interaction/branching-copy-fork.md) |
| Order, queue, steer, Btw, bulk action and scheduler semantics | [`queue-steer-schedule.md`](../omnia-ultra/interaction/queue-steer-schedule.md) |

## P0: control-state truthfulness

### Finding

`Pause` is a user intent, not a universal primitive supplied by every provider,
tool process or remote machine. The current documents distinguish
`requested`, `checkpointing` and `paused`, but do not yet require the control
card to disclose what happened to each active transport.

### Required contract addition

For every target in a run, persist and render a `pauseDisposition`:

| Target kind | Allowed disposition | Truthful UI wording |
| --- | --- | --- |
| locally checkpointable planner/tool | `checkpointed` | "Paused at safe boundary" |
| cancellable provider stream | `abort_requested`, then terminal receipt | "Stopping provider attempt"; never "paused" until checkpoint exists |
| non-pausable remote operation | `draining`, `detached`, or `outcome_unknown` | "Remote work may still be running" |
| scheduled/queued descendant | `held` | "Future work held" |
| external side effect | `reconcile_required` | "Verify effect before retry or resume" |

The pause button must become an immediately visible, durable `pause_requested`
state. It must display the last safe boundary, outstanding target count,
checkpoint progress, deadline/escalation policy and a link to the eventual
checkpoint receipt. A user may withdraw an unfulfilled pause request only if
the operation has not crossed the cancellation boundary; otherwise the UI
offers a new Resume segment.

### Why it matters

Otherwise a UI could instantly show "Paused" while model generation, browser
automation or an external write continues in the background. That is unsafe,
misleading and impossible to debug from later telemetry.

## P0: state snapshot timing for `current_state` retry

### Finding

"Use the entire current state" must mean the full *logical* state revision,
not an unbounded raw transcript. A retry may be queued, start later, and race
with another retry, edit, file change or agent completion. The current schema
has `currentStateRevisionId`, but it does not state when that revision is
captured or what happens if the live branch advances before dispatch.

### Required contract addition

Add explicit fields and UI choices:

```text
stateSnapshotPolicy = capture_on_click | capture_on_dispatch | follow_until_safe_boundary
capturedStateRevisionId
dispatchStateRevisionId
stateAdvanceDisposition = use_captured | recompile_latest | require_user_review | fork
```

`capture_on_click` should be the reproducible default for a deliberate Retry;
`capture_on_dispatch` is useful for a queue item explicitly configured to use
the newest accepted state. `follow_until_safe_boundary` must show that it can
change its context and must freeze into a visible revision before provider
dispatch. A queued retry whose intended state advanced across a conflicting
file, approval, branch or security revision must block for review rather than
silently changing meaning.

For every retry, persist both its requested state base and the materialized
context manifest. The inspector must show included and excluded state segments,
their hashes/revisions, reasons, redactions, token/byte estimates and the
difference between click time and dispatch time.

### A then B acceptance scenario

1. A is retried and produces a candidate state revision `A2`.
2. The user accepts selected A2 results, creating `S2` with typed provenance.
3. B's `current_state` retry captures `S2` (or visibly chooses a later state
   under its snapshot policy).
4. B's context compiler receives the logical current state and produces a
   bounded relevance/context manifest, not an opaque "all chat" string.
5. Exact-historical B still resolves to B's frozen historical manifest;
   selected-delta B names each accepted later revision it imports.

This satisfies state awareness without accidental token blow-up, stale facts,
secret leakage or irreproducible race conditions.

## P0: serializable mutation and multi-surface conflict UX

### Finding

The same task can be controlled by a local window, web/remote client,
automation, agent or recovery worker. A retry, pause, branch or queue reorder
must not use last-writer-wins behavior.

### Required contract addition

Every run-control mutation needs:

- `expectedStateRevisionId`, `expectedRunEpoch` and operation idempotency key;
- an atomic append/compare-and-swap result: `applied`, `already_applied`,
  `stale`, `conflicted`, `blocked`, `reconcile_required` or `denied`;
- a conflict card that names the competing operation, actor category, time,
  affected branch/run and safe choices; and
- a subscription sequence/watermark so a disconnected surface can detect and
  reconcile missed facts without replaying a destructive action.

Do not surface raw identifiers or secret values in a shared client. User-facing
language can say "another control action changed this run" while the protected
inspector preserves the durable correlation ID.

## P0: frozen input versus live partial output

### Finding

An active response has at least three distinct views: rendered transient text,
durably journaled segments and provider/tool effects. Branching or copying from
"what is currently visible" is ambiguous when a stream is mid-token, a tool
call is incomplete or the renderer has not persisted the segment.

### Required contract addition

The active-run toolbar must offer explicit source choices:

- last durable cursor;
- stable output through checkpoint N;
- include visible partial output as an explicitly interrupted artifact;
- wait for the next safe boundary; or
- fork without active output.

Copy remains presentation-only and must label whether it came from a durable
revision or transient selection. Compare during a live run is a timestamped
snapshot comparison; a live-refresh mode cannot silently rewrite the baseline.
Branch/fork cards must show the source cursor, source-output disposition,
included context revision, excluded data classes and fresh authority boundary.

## P0: Continue needs a visible planner contract

### Finding

The typed continuation intent is strong, but a no-text Continue can otherwise
look like the app "did something on its own." The controls need a concise,
inspectable proposal and an explicit terminal rule.

### Required contract addition

Before execution, show a Continue preview containing:

- selected goal/plan/task and why it was selected;
- continuation intent, dependency/blocked state and source checkpoint;
- proposed next action, model/effort, context policy, tool/machine scope,
  approval needs, cost/time budget and stop conditions;
- whether the action is plan-only, draft-only or executable; and
- a compact "why not the other candidates" explanation when routing chose
  among pending tasks.

An immediate user click may approve a preconfigured low-risk, in-scope action;
the same click cannot implicitly approve a new privilege, secret release,
untrusted download, paid transaction, external communication or machine
effect. When no next action is eligible, preserve the run as terminal with an
explanation rather than fabricating a follow-on request.

Require loop guards: a continuation-chain ID, maximum consecutive automatic
segments, progress/evidence score, duplicate-action signature, budget guard
and a "no-progress" terminal receipt. The user can always Continue again
manually with adjusted settings.

## P1: cancellation, errors and outcome-unknown affordances

Separate `Pause`, `Stop`, `Cancel queued`, `Abort provider transport`,
`Detach remote work` and `Dismiss UI` as distinct visible operations. Each card
must say whether already-billed output, partial output, file changes, tool
calls or remote effects are retained. A transport failure or app crash produces
`outcome_unknown` until reconciliation determines whether the provider/tool
accepted or completed the action. Retry from this state needs the same billing,
idempotency and effect safety gate as automatic recovery.

The retry/error card should include error classification, retry-after/backoff,
attempt number, time/budget remaining, current route/fallback candidate,
observed versus estimated usage and a link to the redacted request/trace.

## P1: operational information architecture

The run card should remain compact by default but expose a single consistent
detail panel for the current run, background task and historical attempt. The
minimum visible line is:

```text
state | current phase | branch | model/effort | elapsed | usage/cost authority | next safe boundary
```

Expanded details should show input revision, context manifest, selected model
route and policy revision, target machine/sandbox, provider request/attempt
IDs where safe, child-agent progress, tool/effect receipts, retry policy,
checkpoint lineage and controls available *now*. Disabled controls must state
why and what action/event will enable them. Icons complement named accessible
labels; animation must respect reduced-motion settings and never be the sole
progress signal.

The same status model must be rendered in the conversation, background-task
drawer, run inspector, branch graph, notification and screen-reader live
region. It must not be possible for one surface to say `paused` while another
says `running` for the same journal revision.

## P1: interaction and accessibility gates

- Outside-click dismissal, Escape and explicit close only dismiss transient
  non-destructive popovers; no pending execution/control intent is discarded
  without a durable status or confirmation.
- Keyboard users can reach, activate and inspect every active-run control;
  focus returns predictably after a branch/fork/retry dialog closes.
- Screen readers announce state transitions once, with an abbreviated update
  policy during high-frequency streaming. They provide a direct shortcut to
  the affected run card and error/checkpoint receipt.
- Touch, pointer and remote-client actions use the same typed command and
  cannot bypass a reasoned disabled state.
- User click on an unfocused Omnia window executes the intended eligible action
  once; it must not be eaten merely to focus the window or accidentally invoke
  a second click.
- The UI preserves local draft/selection/scroll position across run-card
  updates and does not steal compositor focus when a background task changes
  state.

## P1: data retention, privacy and authority limits

Retry, branch, compare and support logs preserve forensic value but must follow
the same classification and retention policy as the original state. A child
branch never gains access to an excluded attachment, browser session, password,
secret, grant, remote-control handle or protected observation merely because
the parent state was current. Current-state context compilation must record
redacted/denied items as such, without inserting the protected raw content into
the provider request or common telemetry store.

Exported compare bundles, copied prompts and support diagnostics must have an
explicit redaction mode and preview. A visibility change or revocation after a
historical attempt invalidates any future reuse even if its cache record still
exists.

## Acceptance matrix

The following automated and manual cases should gate promotion of this area:

| Area | Minimum evidence |
| --- | --- |
| Pause | provider stream, tool subprocess, approval wait, agent child and remote machine each expose truthful disposition and recover after restart |
| Resume | verifies checkpoint hash, lease/epoch, policy/permission drift, idempotency and unknown effects before a new segment starts |
| Continue | works after response, from a checkpoint and in an empty new chat; proposes the source/action; respects budget, authority and no-progress guards |
| Edit | immutable draft/message revisions, queued replacement, mid-stream mutation attempt and offline/reconnect conflict all preserve original lineage |
| Retry | all four state-base modes; snapshot-on-click versus dispatch; A2 accepted then B current-state retry; B historical retry; stale/revoked source exclusion |
| Branch/fork/copy | durable cursor, explicit partial-output mode, authority attenuation, live compare baseline, branch isolation and conflict-aware promotion |
| Concurrency | two clients issue pause/retry/reorder/branch concurrently; exactly one expected revision applies and every surface converges |
| Error recovery | 429/502, connection drop after possible provider acceptance, tool timeout and restart never duplicate a paid or external effect without proof |
| Accessibility | keyboard, touch, screen reader, reduced motion, outside click, focus restore and unfocused-window single-click paths |
| Telemetry | every operation, snapshot policy, disposition, receipt, latency, usage authority and redaction state is attributable without content leakage |

## Recommended integration order

1. Extend the run-control operation schema and durable journal facts with
   snapshot timing, run epoch, disposition, terminal receipt and conflict
   result.
2. Implement a reducer/state machine shared by the native backend and every
   renderer surface; prohibit renderer-only terminal-state inference.
3. Build the compact run card and inspector from that shared model before
   adding visual polish or optimistic shortcuts.
4. Add deterministic simulation tests for the acceptance matrix, then chaos
   tests for process crash, provider disconnect, concurrent remote controllers
   and stale worker leases.
5. Connect learned routing and continuation planning only after their decision
   receipts, authority gates, budgets and rollback paths are observable.

## Canonical files to amend

This audit recommends amendments to, rather than replacements for:

- [`run-control-edit-retry.md`](../omnia-ultra/interaction/run-control-edit-retry.md);
- [`run-control-operation.schema.json`](../omnia-ultra/schemas/run-control-operation.schema.json);
- [`branching-copy-fork.md`](../omnia-ultra/interaction/branching-copy-fork.md);
- [`queue-steer-schedule.md`](../omnia-ultra/interaction/queue-steer-schedule.md); and
- the run-journal/authority/event contracts referenced by those files.

The canonical delivery status remains planned until native durable operations,
cross-surface UI and the acceptance evidence above exist.
