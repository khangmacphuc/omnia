---
id: OMNIA-ULTRA-INTERACTION-RUN-CONTROL-RETRY
title: Pause, continue, edit, retry and state-aware run control
status: normative-target
version: 1.1.0
last_reviewed: 2026-08-14
schema: ../schemas/run-control-operation.schema.json
---

# Pause, continue, edit, retry and state-aware run control

Run controls are durable operations over immutable state revisions. They never
rewrite an accepted provider attempt or silently replace conversation history.
Every operation records actor, source cursor, source and current state
revisions, context policy, branch destination, idempotency key and resulting
state transition.

## State snapshot, causality and receipts

The phrase **current state** has a precise meaning. It is the authorized state
head of one declared branch and scope at one durable event watermark, not
whatever happens to be visible in a renderer and not an unbounded union of all
conversations. The state record includes branch-visible message/revision
lineage, accepted retry outcomes, active goal/plan/task state, accepted
decisions and memories, source/citation handles, file/artifact revisions or
hashes, pending approvals/effects, selected model/parameter policy and context
or compaction lineage. Large objects remain immutable references in the state
manifest; the context compiler may select the relevant authorized content for a
provider window, but it must expose every included, omitted and retrievable
state unit rather than silently forgetting it.

The canonical graph projection and reusable resolved `stateBase` contract are
defined by `../architecture/state-revision-graph.md` and
`../schemas/state-revision-graph.schema.json`. A command must pin that resolved
base before it enters a queue, waits for approval or crosses a process boundary.

Every run-control command carries all of the following before native dispatch:

- a source anchor: conversation, source branch, source event cursor and source
  message/run/attempt/prompt-revision when applicable;
- a state-read watermark and the observed source/branch-head state revision;
- an expected branch-head/version for optimistic concurrency, a destination
  branch or new-branch policy, and an explicit context/state-base mode;
- the authority, approval and data-class policy used to compile the next
  frozen provider input;
- a fresh idempotency key, correlation ID and requested active-run policy.

The native kernel appends a command fact and returns a receipt with accepted,
rejected, deferred, checkpointing, reconciliating or completed state. A stale
branch head never causes the kernel to silently substitute a newer state: it
returns the observed-versus-current diff and requires an explicit rebase,
recompile, queue-after dependency, fork or cancellation choice. The receipt
records the resulting event cursor/state revision, checkpoint or continuation
cursor, attempt IDs created, external-effect reconciliation status, and the
exact reason for every deferred or refused action.

`current-state` therefore means the full authorized state graph as of the
captured watermark. It does not implicitly import sibling-only work,
unaccepted/draft output, secrets, grants, cookies, remote sessions or an
outcome-unknown side effect. Users can deliberately add eligible selected
deltas or promote a branch; the resulting manifest makes that choice visible.

### Continuation eligibility and root binding

The native continuation resolver accepts an executable state base only when
the requested revision is accepted, belongs to the requested conversation,
branch and stream, and is not beyond the accepted-head watermark. A historical
accepted revision remains executable after the branch advances; resolving it
does not replace its ID with the newer accepted head. Candidate, rejected,
superseded, outcome-unknown, conflicted, blocked, discarded and invalid
revisions are never executable inherited context. They may be referenced by a
preview, plan-only or draft-only operation only when the receipt visibly marks
the result non-executable.

Accepted-head and watermark validation is native-owned and fail-closed. A
missing or mismatched head projection, an impossible null-head sequence, a
head from another stream, a missing revision or a sequence mismatch is an
integrity failure rather than a reason to guess. A checkpoint root is bound to
the exact requested state-revision ID; a run root establishes run,
conversation and branch scope, but does not establish that the state revision
was produced by that run. Replaying an identical continuation intent returns
the original immutable receipt; reusing its idempotency key with changed
payload creates a payload-drift error and no second intent.

## Pause and resume

`Pause` records a control intent immediately and asks the active workflow to
reach the nearest declared safe boundary. The UI distinguishes requested,
checkpointing and paused. A pause checkpoint preserves active goal/plan/task,
branch, input/output cursor, tool/action state, approvals, files/diffs,
artifacts, sources, agent children, queue, context manifest, model route,
cache plan and telemetry watermark. It also preserves source and state-read
watermarks, provider acceptance evidence, frozen-input IDs, retry schedule,
leases, locks, pending side-effect reconciliation and the exact safe-boundary
reason.

`Pause` is a durable orchestration control, not a false promise to freeze an
arbitrary remote process. At the time it is requested, Omnia chooses and shows
one of these outcomes:

1. **Cooperative checkpoint:** pause between declared atomic units, such as
   model chunks, tool calls, task nodes or approval gates.
2. **Provider-supported suspend:** persist the validated remote continuation
   handle and its expiry, then checkpoint locally.
3. **Cancel then reconcile:** request cancellation when a stream cannot be
   suspended, preserve all received output with its terminal uncertainty, and
   reconcile provider acceptance/billing before any replay.
4. **Pending-effect checkpoint:** wait for a non-interruptible tool/effect
   boundary or mark the effect `outcome_unknown`; it must never report a clean
   paused state while a privileged or billable action may still be running.

The pause card exposes requested time, responsible run/agent, current atomic
unit, safe-boundary estimate when available, cancellation/reconciliation risk,
checkpoint cursor and a Stop-now option whose duplicate/billing consequences
are stated before it is used. Parent and child agents pause through a bounded
tree policy: the parent can checkpoint children, let a safely independent child
finish, or split the child into an explicitly detached background task. No
child silently keeps authority after its parent pause expires.

`Resume` or `Continue` from a pause verifies checkpoint integrity, permissions,
external side-effect state, provider acceptance and idempotency. It creates a
new execution segment linked to the same logical workflow; it does not pretend
the old network stream remained alive. If an external action has unknown
outcome, reconciliation is required before replay. Resume rechecks expired
leases, changed policy/model/provider capability, deleted attachments, changed
workspace/file revision and stale approvals. It either resumes from the
declared continuation cursor, creates a new attempt from a freshly frozen
input, requests a required approval, or reports an actionable blocked state;
it never silently reuses a credential, approval or provider acceptance claim.

## Continue without another prompt

The composer exposes a `Continue` action that can run without new user text.
Its input is a typed continuation intent rather than an empty prompt. The
continuation planner derives the next dependency-ready action from the active
goal, plan/task DAG, last checkpoint, unresolved questions, incomplete answer,
pending tests/research and current project state.

Each Continue operation names one root (`run`, `task`, `goal`, `branch` or
starter workflow), an intent such as `unfinished_answer`, `next_plan_task`,
`resume_checkpoint` or `bootstrap_active_goal`, and a state-read watermark.
The continuation planner produces a preview containing the selected next step,
why it is dependency-ready, context manifest, route/model/effort, tool and
approval envelope, expected cost/time and stop condition. A configured
auto-execute mode may dispatch only work already permitted by its active goal,
task policy and approval grant; it cannot broaden authority merely because the
user pressed Continue. In a new or empty chat, the safe default is a no-text
planning/choice action unless a selected starter workflow explicitly permits
execution.

At the beginning of a new conversation, `Continue` can bootstrap from a chosen
default scope: active project goal, pinned global goal, scheduled workflow,
last resumable checkpoint or a user-configured starter persona. If no eligible
goal/state exists, it opens a no-text action chooser or creates a safe planning
task; it does not invent authorization or perform external side effects merely
because the button was pressed.

Users configure continuation depth, model/effort, context mode, time/cost
budget, whether to execute or draft a plan, allowed tools and stop conditions.
Repeated Continue operations receive stable lineage and completion-judge
checks so they do not loop or repeat finished work indefinitely. The judge
checks a durable no-progress signature, unresolved dependency set, semantic
output delta, duplicate tool/effect key, budget usage and cycle graph before it
creates another segment. Limits cover automatic depth, concurrent descendants,
elapsed time, spend, tokens, retries and external effects; a limit crossing
creates a resumable blocked/checkpointed task rather than an invisible loop.

## Editing prompts and messages

Editing creates a new immutable prompt/message revision. The original remains
addressable and comparable. The user chooses an effect:

- edit draft only;
- branch from the edited message;
- replace the next queued item;
- replay from the historical state at that cursor;
- retry the intent against current state;
- create a selected-delta state base;
- promote the edited revision after comparison.

Draft-only edits can revise an unsubmitted composer revision. A queued edit
creates a replacement queue-item revision under its ordering/dependency lock.
Editing a finalized user message uses `edit-as-branch`: it creates a child
branch whose inherited prefix ends immediately before the edited message,
appends the replacement message revision and optionally prepares a new run.
It never changes the source branch, original response, accepted provider
attempt or historical telemetry. Editing an assistant/tool/system item is not
an in-place transcript mutation; it is an annotation, correction, branch or
new user intent with its own authority and provenance.

An edit that affects already frozen provider input never mutates that attempt.
It schedules, branches or forks a new attempt and displays the exact diff,
source cursor, selected state base, context-manifest delta, model/profile,
approval change and cost estimate before dispatch. The system distinguishes
editing the words from changing the execution environment: either change must
receive a new revision and can be compared or rolled back independently.

## Retry state-base modes

Retry has explicit modes:

1. `exact-historical` — reproduce the target attempt's frozen provider input,
   context, model/profile, tools and parameter revisions as closely as current
   policy allows. Later conversation state is excluded. If the historical
   provider/input/artifact is unavailable or now forbidden, Omnia reports the
   exact missing/denied component and offers a new explicit mode; it does not
   silently downgrade to current state.
2. `current-state` — reuse the target prompt/intent but compile context from the
   captured authorized branch/project state head, including accepted changes
   produced after the original attempt and previous retries. The receipt pins
   the head/cursor observed at command creation or at an explicitly requested
   dependency boundary, so concurrent changes cannot change the meaning after
   the user confirms it.
3. `historical-plus-selected-deltas` — start from the historical state and add
   explicitly selected later facts/files/decisions/retry results. Each delta
   has an origin, revision/hash, authority/data classification, inclusion
   reason and conflict/supersession result.
4. `fresh-branch` — create a clean branch with only selected goal, prompt,
   source and authority manifests.

The default is user-configurable by action type. The retry card always shows
which state base was selected, its state watermark, source/destination branch,
inclusion summary, excluded/unknown side effects, model/effort/parameter
revision and expected dispatch behavior. “Retry” alone is never an ambiguous
hidden policy.

Semantic retry, provider transport retry, repair and fallback are distinct.
A same-attempt transport retry is allowed only with provider-specific
acceptance/idempotency proof. A user-visible retry, repaired prompt, fallback
route or changed context creates a new attempt with fresh provenance and never
reuses an old paid acceptance claim. An `outcome_unknown` attempt cannot become
a background semantic retry until reconciliation or an explicit user decision
establishes safety.

## Retry A followed by retry B

State is a revision graph, not a mutable transcript string. If prompt A is
retried, Omnia records the before state, retry operation, new attempt/output,
accepted file/task/decision changes and resulting state revision. When prompt B
is later retried with `current-state`, its context compiler sees both A's
original lineage and A's retry-before/retry-after state, subject to branch,
permission, supersession and relevance policy.

The word **accepted** is material. A streamed candidate, side-question answer,
partial tool result or unreviewed file diff is visible evidence but does not
automatically become a state fact inherited by B. A retry result becomes part
of the branch head when its message/artifact/decision is finalized or promoted
under its stated policy. The retry card therefore shows `A before`, `A retry
candidate`, `A accepted result` and the exact B state base.

If B is requested while A's retry is still running, the user chooses one
explicit scheduling policy: use the current committed head immediately, wait
for A's terminal/accepted state as a queue dependency, fork B in parallel from
the current head, or cancel. B never races ahead while falsely claiming to have
seen A's result. If A ends `outcome_unknown`, B is blocked from inheriting any
unreconciled effect and shows that exclusion in the state manifest.

Exact historical retry of B remains available and intentionally excludes those
later changes. This distinction permits reproducibility and state-aware
iteration without silently blending histories. Retry graphs detect cycles,
superseded facts and conflicting edits; conflicts are shown before merge or
promotion.

## Controls while a run is active

During execution, the user can pause, stop, steer, queue, schedule, create Btw,
copy/duplicate inputs or outputs, fork/branch at the latest durable cursor,
compare current and prior snapshots, edit future queue items and open a
background retry/fork. An active provider attempt remains frozen. Operations
that would change it select one of: apply at safe boundary, interrupt and start
a new attempt, queue after terminal state or fork in parallel.

The following resolution is explicit per operation and never inferred from the
currently focused window:

| Requested action | In-flight behavior | Durable result |
| --- | --- | --- |
| Pause | request a declared safe boundary or cancellation/reconciliation | checkpoint or outcome-unknown receipt |
| Stop | cancel at a safe cancellation boundary | terminal/cancellation receipt; no hidden replay |
| Steer | attach to the active route for the next permitted boundary | new steer intent; frozen input unchanged |
| Edit/retry/regenerate | rebase, queue, interrupt into a new attempt, or fork | immutable revision plus new attempt/run if dispatched |
| Branch/fork | pin an exact durable cursor and choose active-producer policy | isolated route with fresh authority evaluation |
| Copy/duplicate/compare | operate on a pinned snapshot | no mutation of provider input or execution lineage |
| Promote/merge | wait for stable inputs and conflict/authority checks | reviewed promotion/merge receipt |

An active run exposes a state ribbon with run/attempt/iteration IDs, phase,
atomic unit, source/branch cursor, frozen-input revision, provider acceptance
status, queue/steer dependencies, checkpoint availability, child-agent state,
cost/time budget and the selected resolution of every pending control. All
controls remain keyboard-accessible and narratable; a disabled action states
whether it is unsupported, awaiting a boundary, blocked by authority or
requires reconciliation.

Compare can diff prompt revision, state/context manifest, branch graph,
provider/model/effort/parameters, output, sources/citations, files/code,
tools/effects, tests, tokens/cache/cost/latency and evaluations. Promote/merge
requires explicit conflict resolution and never imports secrets, grants,
cookies, privileged handles or unknown external-action outcomes.

A compare begins from pinned left/right (or N-way) state cursors. A live follow
mode is only a separately labeled subscription; it never changes the pinned
comparison result. Copy/export includes the compared revision IDs and redaction
class. Promotion and merge create a new decision/state revision, preserve all
parents and require the user to resolve instruction, file, task, source,
authority and external-effect conflicts explicitly.

## Acceptance evidence

Tests cover pause during streaming/tool/approval/retry, each provider pause
outcome, restart-resume with expired lease or changed policy, Continue from
incomplete output and empty new chat, no-progress/budget loop prevention, edit
without history loss, queue-edit races, all retry state-base modes,
A-then-B state awareness, B-waits-for-A ordering, unaccepted/unknown-effect
exclusion, stale-head denial/rebase, branch isolation, in-flight mutation
prevention, compare pinning and accuracy, idempotency/payload-drift denial,
reconciliation before duplicate-risk replay, crash/restart replay, keyboard,
screen-reader and focus-safe accessibility paths.

See `../schemas/run-control-operation.schema.json`,
`../schemas/state-revision-graph.schema.json`,
`../architecture/state-revision-graph.md`,
`queue-steer-schedule.md`, `branching-copy-fork.md`,
`../architecture/authority-and-event-model.md` and
`../security/authority-continuity-and-replay.md` and
`../harness/agent-lifecycle-and-lineage.md`.
