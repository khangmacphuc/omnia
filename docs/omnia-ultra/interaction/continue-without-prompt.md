---
id: OMNIA-ULTRA-INT-CONTINUE-WITHOUT-PROMPT
title: Typed no-text continuation planner and loop guards
status: normative-target
version: 1.0.0
last_reviewed: 2026-08-14
supersedes: []
---

# Continue without another prompt

The composer `Continue` action submits a typed continuation intent, never an
empty ambiguous provider prompt. It can advance an incomplete answer, resume
a checkpoint, execute the next dependency-ready task or bootstrap a configured
goal in a new/empty chat.

## Intent roots and modes

Each intent names one root: `run`, `task`, `goal`, `branch`, `checkpoint` or
`starter_workflow`. It records `unfinished_answer`, `next_plan_task`,
`resume_checkpoint`, `bootstrap_active_goal`, `research_next`, `test_next`,
`review_next`, `plan_only` or `draft_only`, plus a state watermark and
completion-chain ID.

`fresh-goal-start` is a Continue/bootstrap state base, not a semantic retry
mode. Retry machine IDs remain `exact-historical`, `current-state`,
`historical-plus-selected-deltas` and `fresh-branch`.

## Native state-revision eligibility

Executable continuation is authorized only when the native kernel resolves an
accepted state revision in the same conversation, branch and stream as the
intent. The revision must be at or below the accepted-head watermark and the
requested historical ID remains the selected ID even when a newer accepted
head exists. Continue never silently substitutes the current head for an
explicit historical revision.

Candidate, rejected, superseded, outcome-unknown, conflicted, blocked,
discarded and invalid revisions are not executable inherited context. They may
be shown in `preview`, `plan-only` or `draft-only`, but the UI and receipt must
label them non-executable and no provider dispatch may use them as accepted
state. A candidate-only stream can therefore be previewed, but executable
Continue is refused until an accepted revision exists.

The continuation intent kind and execution mode are also validated as one
native semantic pair. `plan-only` and `draft-only` intent kinds may be stored
for `preview`, `plan-only` or `draft-only` inspection, but they can never be
stored or replayed with `executionMode = execute`. A malformed request is
rejected as `invalid_input`; a restored or tampered receipt fails closed as
`run_control_integrity_failed` before replay.

The accepted-head projection and watermark are native-owned invariants. A
missing head with accepted revisions, a non-zero watermark with a null head, a
head pointing at another stream, a missing revision or a sequence mismatch is
an integrity failure and fails closed. A checkpoint root binds to its exact
requested state-revision ID; a run root proves run/conversation/branch scope
only and does not prove that the referenced state revision was produced by that
run.

## Preview before execution

Before a configured low-risk auto action dispatches, the UI shows the selected
goal/plan/task, why it is eligible, unresolved dependencies, proposed action,
context policy and manifest summary, provider/model/effort, machine/tool and
approval envelope, estimated time/cost, budget, stop condition and whether the
operation is plan-only, draft-only or executable. A Continue click cannot grant
new privilege, release secrets, send an external message, make a paid purchase
or start an unapproved machine effect.

At the start of a new chat, Omnia uses the active project/global goal, pinned
goal, last resumable checkpoint or configured starter workflow. With no eligible
state it opens a planning/choice action and records a terminal explanation; it
does not invent work or authority.

## Loop and budget guards

Every continuation checks unresolved dependencies, a duplicate-action/effect
signature, semantic progress, evidence delta, cycle graph, token/time/cost
budget, maximum automatic segments, retry limit and external-effect count. A
no-progress or budget limit creates a resumable blocked/checkpointed receipt.
The user may press Continue again with changed settings.

## Shared status and evidence

Planner receipts are visible in the chat, background-task drawer, run inspector,
branch graph, notifications and screen-reader live region. They include the
chosen state revision, context manifest, route/policy revision and next safe
boundary. Tests cover response continuation, paused continuation, empty-chat
bootstrap, no eligible action, loop prevention, restart and multi-client races.

See `../schemas/continuation-intent.schema.json`,
`run-control-edit-retry.md` and `../harness/ultra-workflow.md`.
