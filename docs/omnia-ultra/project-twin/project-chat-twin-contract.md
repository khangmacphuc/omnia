---
id: OMNIA-ULTRA-PROJECT-CHAT-TWIN
title: Project and Chat information architecture contract
status: normative-target
---

# Project and Chat information architecture contract

Omnia has two primary user-facing work entities: **Project** and **Chat**.
Everything else (tasks, agents, memory, skills, files, artifacts, providers,
permissions and Project Twin projections) is scoped to one of these entities
or to a run inside a Chat. A feature may add a contextual surface, but it must
not introduce a competing third top-level work mode.

This contract describes identity and ownership. It does not claim that every
operation is wired in the current Phase 1 preview.

## 1. Entity boundary

```text
Project
  owns durable scope and defaults
  ├─ zero or more Chat records
  ├─ optional workspace roots / folder grants
  ├─ project files, memories, skills and artifacts
  ├─ goals, tasks, workflows and agent configuration
  └─ Project Twin revisions and evidence projections

Chat
  owns one conversation/thread history
  ├─ messages, branches and prompt/output lineage
  ├─ runs, attempts, tool/approval events and receipts
  ├─ chat-level context and override settings
  └─ optional Project owner (standalone chats have no owner)
```

`Chat` is the product/UI name. The durable domain may use `Conversation` or
`Thread` internally, but it must expose one stable identity and one canonical
history. A branch, fork, run or agent task is not a second Chat unless the
user explicitly creates one.

## 2. Ownership and identity

### 2.1 Project ownership

- A Project has a stable `ProjectId` and a durable profile owner.
- A Project may be filesystem-backed or research/context-only.
- A workspace root is optional in the chat-first boundary and is represented by
  an explicit grant, never by an untracked renderer path string.
- A Project may contain unlimited Chats subject to storage and policy quotas.
- Project deletion is soft-delete/archive first; child records retain their
  provenance and can be restored or exported.

### 2.2 Chat ownership

- A Chat has one stable `ConversationId`/`ChatId` and one canonical owner:
  either exactly one Project or the standalone Inbox/Recent scope.
- A Chat can be moved between Projects without copying its message history.
- A Chat may appear as a shortcut/reference in another Project, but a shortcut
  is not a second owner and cannot mutate ownership implicitly.
- Fork/duplicate/continue creates an explicitly new Chat or branch and records
  the source Chat, source branch and fork point in immutable lineage.
- Archive, pin, unread and rename are Chat metadata operations; they do not
  rewrite messages or invalidate run receipts.

The canonical ownership invariant is:

```text
Chat.ownerProjectId ∈ {null, one ProjectId}
```

`null` means standalone Inbox/Recent. It must not mean “unknown project” once
the Chat has been hydrated from authoritative storage.

## 3. Scope and inheritance

Settings resolve from broadest to narrowest scope:

```text
app default → profile → Project → Chat → run/turn override
```

Project-scoped candidates include model/provider defaults, instructions,
workspace grants, selected files/indexes, memory policy, skills, agent roster,
task/DAG context, artifact defaults, budget and permission presets. A Chat may
override a value for itself or one run while preserving the inherited source.

Every effective value shown in the UI should expose:

- the resolved value;
- the source scope (`app`, `profile`, `project`, `chat`, `run`);
- whether it is verified, preview-only, planned or unavailable;
- reset-to-parent and undo/redo actions where mutation is supported.

An override must never silently broaden a Project permission. A run can narrow
scope without additional approval; broadening scope requires the normal
capability/approval path and a receipt.

## 4. Chat lifecycle

The minimum user-visible lifecycle is:

```text
Draft → Active → Completed / Paused
                   └→ Archived
```

Orthogonal metadata includes pinned, unread, temporary/ephemeral, deleted
(soft-delete), branch/fork lineage and current run state. A Chat can be
resumed, retried, branched, compared, exported, moved or opened in a new
window without losing the prior immutable records.

Filesystem-specific actions (for example, “continue in a new worktree”) may be
visible as Planned/Unavailable until the native Git/worktree capability is
actually verified. The renderer must not present a disabled placeholder as a
successful runtime operation.

## 5. Project Twin projection

The Twin is a projection of authoritative Project and Chat facts; it is not a
second store of mutable truth. A Project Twin revision may include these node
families:

- `project` — Project identity, scope and lifecycle;
- `chat` — canonical Chat identity and ownership;
- `branch`, `prompt`, `run`, `attempt`, `event`, `receipt` — Chat lineage;
- `workspace`, `file`, `artifact`, `memory`, `skill`, `provider`, `permission`;
- `goal`, `task`, `workflow`, `agent`, `tool`, `approval`;
- `source`, `claim`, `citation`, `test`, `evidence`, `risk`, `decision` and
  `release`.

Required ownership/lineage edges include:

```text
project contains chat
chat has_branch branch
chat produces run
run has_attempt attempt
run emits event
run creates receipt
project scopes workspace|memory|skill|artifact|goal|task|agent
chat references file|artifact|memory|skill|source
node verified_by evidence
node stale_due_to source|revision
```

Each edge keeps provenance, evidence class, source snapshot/revision and stale
state. Inferred edges require an explicit inference class and confidence;
decorative AI-generated relationships are not allowed in the canonical graph.

### 5.1 Projection rules

- The renderer may cache and filter a Twin projection but cannot promote a
  preview/unknown field to an authoritative fact.
- Project overview fields deep-link to a Project, Chat, run or evidence node.
- Cosmetic Chat activity (typing, cursor, hover, token delta) must not churn a
  Project Overview revision.
- Material changes (ownership, goal, branch, workspace, task state, verified
  evidence, permission or budget) produce a deterministic candidate revision.
- A stale projection remains visible with its old revision and reason until a
  replacement is accepted; refresh must not destroy prior history.

## 6. UI navigation contract

The global rail may contain supporting control centers, but the work hierarchy
must remain legible:

```text
Chats
  Inbox / Recent
  Pinned
  Archived
Projects
  Project A
    Chat 1
    Chat 2
  Project B
    Chat 3
```

Opening a Project lands on a Project Overview with recent Chats, active
goals/tasks, workspace and files, memory, artifacts, agent activity, model,
permission and attention status. Opening a Chat lands on a focused thread
canvas; context, files, memory, artifacts and agents are collapsible inspector
panels that can be pinned for power users.

Context-menu actions should preserve the distinction between metadata and
runtime capabilities. The first useful set is pin, rename, archive/restore,
mark unread, copy deep link/ID, move to Project, continue in new Chat and open
in a new window. Worktree and machine actions remain capability-gated.

## 7. Acceptance invariants

The Project/Chat slice is structurally ready when all of the following hold:

1. A standalone Chat and a Project-owned Chat render in distinct scopes.
2. Moving a Chat changes one ownership field and does not duplicate history.
3. Fork/continue records source Chat, branch and fork point.
4. Project defaults and Chat overrides show effective value plus source scope.
5. Archive/restore, pin, unread and rename are reversible metadata operations.
6. Project Overview never displays an unverified field as a confirmed fact.
7. Twin graph validation rejects a Chat with multiple canonical owners.
8. Twin revisions retain source hashes, evidence class and stale state.
9. UI-only Planned/Unavailable actions cannot emit a success receipt.
10. Project and Chat deep links remain stable across renderer restart.

## 8. Current-tree mapping

The current renderer already has useful primitives for this contract:

- `src/domain/project.ts` — Project and workspace-grant invariants;
- `src/domain/conversation.ts` — Chat identity, project relation, branches,
  immutable messages, pin/archive and move/update operations;
- `src/features/workspace/project-catalog.ts` — Project and overview projection;
- `src/features/workspace/store.ts` — renderer projection and `projectId`-
  aware conversation actions.

These files are implementation evidence for existing slices, not proof that the
full Project/Chat acceptance gate is complete. Native runtime and packaged
Windows evidence remain separate verification requirements.
