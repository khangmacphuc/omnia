---
id: OMNIA-ULTRA-GOAL-INTERACTION-OPERATIONS
title: Atomic interaction operations matrix
status: normative-target
version: 1.0.0
last_reviewed: 2026-08-14
supersedes: []
requirements_registry_revision: 2026-08-14.6
---

# Atomic interaction operations matrix

This file prevents superficially similar actions from being implemented as one
ambiguous mutation. Each action below needs a typed intent, durable actor and
source revision, authorization check, journal fact, recovery behavior,
telemetry and test evidence. A visible button is not implementation evidence.

## Stable targets and Jump Prompt

Every jumpable object has an immutable target kind and ID: user prompt,
assistant segment, selected range, source claim, tool event, request/run,
attempt, retry, branch point, task, agent checkpoint, approval, artifact,
file symbol/line, PDF page, spreadsheet range, slide or media timestamp. A
deep link stores the target ID, containing revision, optional quote/hash and
the source watermark used to resolve it.

Resolution may return `resolved`, `relocated-with-evidence`, `stale`,
`unauthorized` or `missing`. It never silently lands on a merely similar
message. The transcript minimap, result filters, back/forward history,
bookmarks, keyboard shortcuts, voice commands and screen-reader landmarks all
use the same resolver. A stale target presents its last known label and safe
recovery choices without exposing revoked content.

## Copy, duplicate, branch, fork and replay

| Operation | Creates | Must preserve | Must not inherit |
| --- | --- | --- | --- |
| Copy | Clipboard/export representation | Source citation, selected revision and redaction classification | Authority, secrets, grants, live handles or execution lineage |
| Duplicate | Editable draft | Source prompt/version provenance | Run/attempt identity, accepted dispatch or billable state |
| Branch | Sibling route in one conversation | Exact source cursor and immutable branch parent | Future messages from the original route |
| Fork | New conversation/project/task snapshot | Explicit selected context manifest and origin lineage | Permissions, cookies, active grants, secret material or privileged handles |
| Replay | New attempt from frozen input | Original frozen input, profile/config revisions and reason | Reuse of an old acceptance claim or idempotency key without policy proof |
| Regenerate | New alternative attempt | Message/branch origin and comparison lineage | Overwrite of the previous response or its telemetry |
| Compare/promote/merge | A reviewed relation between routes | Both immutable ancestors, conflict set and decision actor | Silent deletion or blending of incompatible facts |

`branch` is not a cosmetic copy, and `fork` is not merely a different route
name. The UI must show the source cursor, included context, excluded context,
new authority boundary and any merge conflicts before a destructive or
privileged continuation. Merge rules operate on typed revisions; they cannot
merge passwords, approvals, active machine sessions, browser sessions or
restricted observations.

## Ordered prompt work

A submitted intent has a durable order key, priority, dependencies, deadline,
creator, destination branch, model/profile request, approval state and desired
mode. The scheduler detects self-dependency and cycles before persistence.
Moving an item creates an order revision rather than silently changing a
running request.

- **Queue** waits for earlier required work to reach its terminal policy state.
- **Steer** is attached to the currently running route and dispatches only at a
  declared safe boundary; it never edits frozen provider input in flight.
- **Btw** is a side route with its own context and return policy; it cannot
  mutate the primary branch without an explicit promote/merge operation.
- **Parallel** creates independently attributable child work with bounded
  concurrency, authority attenuation and join semantics.
- **Scheduled** work records time zone, trigger, missed-run policy, idempotency
  key, suspension conditions and next-run calculation.

Bulk delete, move, enhance, model change, schedule, pause, resume, retry and
priority changes first generate a preview of affected IDs, blocked items,
permission changes and irreversible consequences. Each is undoable only when
its durable state has not crossed an external side-effect boundary. The live
queue distinguishes `draft`, `blocked`, `scheduled`, `queued`, `waiting for
approval`, `running`, `safe-boundary-ready`, `retrying`, `outcome-unknown`,
`completed`, `failed`, `cancelled` and `superseded`.

## Selection, hover and reply references

Selecting output, input, an artifact or a source creates an explicit reference
object rather than copying loose text into a prompt. It records range offsets,
revision, quote fingerprint, redaction class and resolution policy. Actions
include reply, explain, cite, translate, derive, challenge, test, refactor,
make exercise, create goal/task/memory/skill, branch from selection and jump
to source. The user may edit the reference before dispatch.

Hover cards must be focus-safe: an explicit Close control, Escape and outside
click dismiss a modal/focus-trapping card; a non-modal card does not steal
focus or block normal clicks. Touch, keyboard and screen-reader users receive
an equivalent context menu with named controls. A click on an unfocused Omnia
window must work normally; focus cannot be a hidden prerequisite for a valid
action.

## Long answers and continuation

Long output is segmented at semantic boundaries with an immutable continuation
cursor. Each segment carries its source/attempt lineage, citation range and
deduplication key. If a provider or renderer limit is reached, Omnia creates a
visible continuation task rather than pretending the answer is complete. The
user can branch, quote, copy or jump to a segment without loading the full
transcript, and recovery after restart resumes only after duplicate/billing
safety checks.

## Acceptance evidence

For every operation, tests must cover normal execution, restart/replay,
authorization denial, stale target, malformed target, cross-branch isolation,
accessibility path, cancellation and telemetry attribution. See
`../interaction/prompt-navigation-and-jump.md`,
`../interaction/branching-copy-fork.md`,
`../interaction/queue-steer-schedule.md` and
`../interaction/selection-reference-annotations.md` for canonical contracts.
