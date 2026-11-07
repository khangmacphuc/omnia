---
id: OMNIA-ULTRA-SECURITY-AUTHORITY-CONTINUITY
title: Authority continuity, replay and side-effect reconciliation
status: normative-target
version: 1.0.0
last_reviewed: 2026-08-14
supersedes: []
---

# Authority continuity, replay and side-effect reconciliation

Pause, Continue, Resume, Edit, Retry, Regenerate, Branch, Fork, Clone,
Compare, Promote, Merge, automation and agent handoff preserve *content
lineage*; they do not preserve execution authority. A historical message,
checkpoint, provider input, tool trace, grant ID or approval receipt is
evidence for audit and comparison, never a reusable permission token.

## Two-phase control rule

Every control operation has two separate phases:

1. Record the user or automation intent as an immutable, idempotent journal
   fact. This phase has no external effect.
2. Immediately before a provider, tool, browser, machine, remote, Git,
   scheduler or privileged dispatch, the trusted broker builds canonical
   arguments and evaluates the *current* policy, environment, scope, grants,
   approval receipts, secret bindings, data classification and destination.

The second phase may allow, reduce, request approval, defer, deny or require
reconciliation. A renderer, model, agent, queue item, old checkpoint or
learned policy cannot convert a pending intent into authority.

## Authority checkpoint

Each control operation and pause checkpoint records an opaque authority
snapshot with:

- source and effective authority snapshot IDs;
- capability-set, policy, workspace-grant, provider-profile and machine or
  remote-session revision hashes;
- actor, owner, execution environment, data class and exact target scope;
- requested effect mode, evaluation result, expiry and revocation state;
- references to approval receipts and secret handles, never their contents;
- effect/reconciliation state, idempotency evidence and compensation plan;
- reason for any scope reduction, re-approval, denial or redaction.

Snapshots are encrypted local audit data and may expose only redacted,
user-safe summaries to the renderer and model. They must not contain raw API
keys, passwords, cookies, browser sessions, OAuth tokens, vault material,
unredacted clipboard/screen/audio content, UAC credentials or privileged
handles.

## Continuation and restart

`Continue` without text may derive a next task or a plan from durable state,
but it starts with no new external authority. A configured execute mode is an
upper bound on intent, not permission. At dispatch time, every affected action
is re-evaluated against current policy and requires a valid exact approval
where policy requires one.

After pause, crash, restart, reconnect, machine migration, remote reconnect,
model reroute, session change or policy revision, Resume creates a new
execution segment. It must re-check the checkpoint's environment, user/device
enrollment, target scope, grant expiry, provider secret availability, approval
receipt consumption and external-effect status. A previously allowed action is
not resumed merely because it was queued or visible before the interruption.

If no valid authority remains, Omnia may safely inspect state, prepare a draft,
or ask for a decision. It must not silently dispatch network writes, browser
input, filesystem writes, package installation, Git push, messages, remote
control, capture, secret use or privileged operations.

## Retry, replay and unknown outcomes

An idempotency key is useful evidence, not proof that a side effect did not
occur. Effect state is recorded as one of:

`none`, `not-dispatched`, `prepared`, `dispatched`, `accepted`, `succeeded`,
`failed`, `cancelled`, `outcome-unknown` or `reconciled`.

The authority-continuity record keeps this detailed dispatch lifecycle and also
emits one high-level state-graph projection: `not-started`, `pending`,
`confirmed`, `unknown`, `reconciled`, `blocked` or `cancelled`. The mapping is
`none`/`not-dispatched` → `not-started`; `prepared`/`dispatched`/`accepted` →
`pending`; `succeeded` → `confirmed`; `failed` → `blocked`; `cancelled` →
`cancelled`; `outcome-unknown` → `unknown`; `reconciled` → `reconciled`.
It is versioned and inspectable; a renderer must never infer it from text or
collapse `outcome-unknown` into failed/succeeded.

Only a transport retry whose provider/tool contract supplies appropriate
same-attempt idempotency evidence may reuse the same attempt. A user retry,
fallback, repair, model change, context change, environment change or
authority change creates a new attempt and re-evaluates authority.

`outcome-unknown` blocks automatic replay of any non-idempotent or externally
visible action. Omnia must first query an authoritative status endpoint,
inspect an exact local receipt, request user resolution, or execute a
documented safe compensating/reconciliation workflow. “Retry until success”
never authorizes duplicate payments, messages, pushes, file changes,
installations, captures or privileged changes.

`exact-historical` reproduces content and configuration evidence as closely as
policy permits; it never resurrects expired grants, approval receipts, secret
handles, cookies, remote sessions, trusted installations or elevation.

## Branch, fork, clone and agent boundaries

Branching, forking and cloning copy selected content, source references,
context manifests, plans and lineage only. They do not copy active approvals,
execution leases, scheduler locks, queued side effects, remote sessions,
browser cookies, secret bindings, machine persistence grants or privileged
handles. A child starts inside the parent's capability ceiling and receives a
fresh, exact-target policy evaluation for every effect.

An agent-to-agent message can carry a redacted task contract and evidence
references. It cannot grant a capability, approve an operation, transfer a
secret, widen a destination, weaken a sandbox or confirm an unknown external
effect. Automation and scheduled work use the same rule: a scheduled record
is intent and may expire, become draft-only, wait for approval or be cancelled
at its dispatch boundary.

## Merge and promotion

Compare, annotation merge and visible-branch promotion are content operations.
They may never merge or promote secrets, grants, receipts, cookie/session
material, machine handles, remote-control authority or unknown side effects.
An artifact or plan whose adoption would cause an external effect stays a
proposal until the recipient branch independently dispatches it through the
broker.

## Required user-visible evidence

For every control card, show the historical authority state separately from
the effective state that will be evaluated now: target/environment, requested
effect, policy result, expiry, approval requirement, capability reduction,
side-effect state, idempotency/reconciliation decision and reason. Never
label an operation “resumed”, “retried” or “safe to retry” while its effect
state is unknown.

## Acceptance evidence

Test at minimum:

- pause/restart/resume after an approval expires, a grant is revoked, policy
  changes, a device is revoked, or the target environment changes;
- Continue from an empty chat with no goal/authority, and with a plan that
  requests a side effect;
- exact-historical retry after secret/session/receipt expiry;
- provider/tool timeout after dispatch with idempotent and non-idempotent
  operation contracts;
- fork, clone, agent handoff and scheduled execution cannot reuse authority;
- compare/merge/promotion cannot import a secret, grant or unknown outcome;
- audit export remains redacted while preserving evidence hashes and lineage.

See `approvals-sandbox-secrets.md`, `hard-boundaries.md`,
`../architecture/authority-and-event-model.md`,
`../architecture/state-revision-graph.md`,
`../interaction/run-control-edit-retry.md`,
`../interaction/branching-copy-fork.md`,
`../interaction/queue-steer-schedule.md` and
`../schemas/run-control-operation.schema.json` and
`../schemas/authority-continuity.schema.json`.
