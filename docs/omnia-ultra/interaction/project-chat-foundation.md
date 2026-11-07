---
id: OMNIA-ULTRA-INT-PROJECT-CHAT-FOUNDATION
title: Project and Chat interaction foundation
status: normative-target
version: 1
---

# Project and Chat interaction foundation

This document defines the first interaction slice for Omnia's two primary
user-facing surfaces: **Project** and **Chat**. It is a UI and interaction
contract, not a claim that every operation is already wired to the native
runtime.

The design target is a fast, desktop-first workspace that can grow into a
research, coding, media and agent product without turning every subsystem into
another top-level mode.

## 1. Product boundary

Omnia has two canonical work objects:

```text
Project
  owns scope and reusable context:
  chats, folders, files, memory, skills, models, permissions,
  goals/tasks/DAGs, agents, artifacts and exports.

Chat
  owns one conversation/run history:
  messages, revisions, branches, attachments, citations,
  run events, queued prompts and chat-level overrides.
```

The global rail may expose utility destinations such as Home, Library, Memory,
Skills and Settings, but these are control surfaces. They are not a third
competing work mode. Opening a Project or Chat must always remain the shortest
path to useful work.

### 1.1 Ownership invariant

- A Chat may be standalone (`projectId = null`) or belong to exactly one
  Project (`projectId = <id>`).
- A Project may contain zero or more Chats.
- A Project may show a linked Chat reference for discovery, but the Chat has one
  canonical owner and one canonical history. A reference never duplicates or
  forks message history.
- Moving a Chat changes its owner; it does not rewrite message, branch or run
  lineage.
- Forking or continuing creates an explicit new Chat or branch record. It is
  never an implicit copy hidden behind a visual action.
- A Chat can be temporarily opened in several windows/tabs. Selection state,
  draft text and panel layout are window-local; durable content is shared by
  ID and reconciles through native revisions.

### 1.2 Workspace ownership

A Project may have no workspace folder. This supports research/knowledge
projects as well as filesystem projects. P1 renders zero or one primary folder
cleanly, while the record and UI vocabulary remain compatible with multiple
roots later.

The presence of a folder never implies indexing, upload, code execution or
provider access. Every folder row shows its explicit state and scope.

## 2. Navigation model

### 2.1 Canonical locations

The renderer should be able to derive these locations from stable IDs:

```text
omnia://chats/inbox
omnia://chats/pinned
omnia://chats/archived
omnia://chat/<chat-id>
omnia://project/<project-id>
omnia://project/<project-id>/chat/<chat-id>
```

The last form is a contextual view of the same Chat, not a second Chat record.
Deep links that point at a missing, archived or stale target return a typed
notice with the nearest valid ancestor; they never silently open an unrelated
conversation.

### 2.2 Global rail and object sidebar

The recommended wide layout is:

```text
┌──────┬──────────────────────┬──────────────────────────────┬─────────────┐
│ rail │ object sidebar       │ active Project or Chat        │ inspector   │
│      │ Chats                │                              │ optional    │
│      │  Inbox / Recent      │                              │             │
│      │  Pinned              │                              │             │
│      │  Archived            │                              │             │
│      │ Projects             │                              │             │
│      │  project             │                              │             │
│      │   nested chats       │                              │             │
└──────┴──────────────────────┴──────────────────────────────┴─────────────┘
```

The object sidebar is contextual:

- Chat mode shows Inbox/Recent, Pinned and Archived, with project markers.
- Project mode shows the project list and expandable nested Chats.
- Selecting a nested Chat switches to Chat mode while preserving the Project
  breadcrumb and inherited context indicator.
- Selecting a Project opens its Overview and expands its Chat group.
- On narrow windows the object sidebar becomes a modal drawer; selecting an
  object closes it and returns focus to the canvas.

Home is a utility landing surface. Its primary actions are `New chat`,
`Create project` and `Continue`; it must not become a duplicate Projects or
Chats library.

### 2.3 Project Overview landing state

Opening a Project defaults to an Overview containing, in this order:

1. Project identity: name, accent, description, pin state and effective model.
2. Quick actions: New chat, Add folder, Open Chat list, Project settings.
3. Recent Chats, grouped by active/paused/archived state.
4. Goals/tasks/DAG summary, with `Preview`, `Planned`, `Configured`, `Wired`,
   `Verified` status badges where applicable.
5. Workspace and files summary, including explicit folder scope/health.
6. Memory, Skills, Models, Permissions and Artifacts cards that open contextual
   drawers without changing the primary Project location.
7. Evidence, changes and runtime status with provenance and freshness.

Cards are actionable only when the underlying operation is available. A
preview card may open an explanatory UI, but must not imply that a native
indexer, agent, compiler or model runtime is active.

### 2.4 Chat landing state

Opening a Chat defaults to a calm conversation canvas. The toolbar shows:

- Project breadcrumb or `Standalone` label.
- Chat title and status (`Draft`, `Active`, `Paused`, `Completed`, `Archived`).
- branch indicator when the active path is not the root path;
- model/profile and effective-scope summary;
- conversation map trigger (local preview until durable jump targets exist);
- inspector toggle and Chat actions.

The inspector is collapsed by default on narrow windows and may be pinned on
wide windows. Its tabs are contextual (`Context`, `Run`, `Parameters`, later
`Sources`, `Artifacts`, `Agents`) and never replace the Chat canvas.

## 3. Chat lifecycle and actions

### 3.1 Lifecycle

```text
Draft → Active → Completed
             ↘ Paused
Any non-deleted state → Archived → Restored
```

`Failed` and `Waiting` are orthogonal attention states on the active lifecycle;
they are not terminal deletion states. A stopped or failed run remains visible
and can be retried or continued.

### 3.2 Chat row

Every row has a stable accessible name composed of title, project, status and
updated time. The visual row contains:

- title and one-line excerpt;
- relative/absolute time according to locale;
- project marker or `Standalone`;
- pin, unread, draft, running and attention indicators only when applicable;
- a hidden-on-idle actions button that becomes visible on hover/focus.

Clicking the row selects the Chat and clears unread state. It must not send a
request, change the active branch or mutate Project settings.

### 3.3 Chat context menu

P1 should render and wire the low-risk local actions:

```text
Rename
Pin / Unpin
Mark read / Mark unread
Move to Project…
Continue in new Chat
Copy deep link
Open in new window
Archive / Restore
Export…
```

The menu also reserves explicit entries for future operations:

```text
Duplicate branch
Continue in new worktree
Compare models
Delete permanently
```

Future entries are either hidden until relevant or visibly marked `Planned`;
they must not be clickable no-ops. A destructive action requires a typed
confirmation or an undo affordance and emits a durable receipt when native
storage is available.

### 3.4 Project row actions

Project rows support:

- select/open;
- expand/collapse nested Chats;
- pin/unpin;
- rename and edit description;
- add/detach folder;
- open Project settings;
- export/import Project bundle (when available).

Detaching a folder never deletes local files, Chat history, artifacts or
citations. A detached/offline folder remains visible with a typed reason.

## 4. Creation and move flows

### 4.1 New Chat

`New chat` opens a Chat immediately and leaves the composer focused. The user
may choose a Project in the creation popover, or keep it standalone. The
popover exposes defaults but does not block creation on provider setup.

Recommended fields:

- Project: `Standalone` or one Project;
- mode: Ask, Create, Research;
- model profile: `Auto` or a favorite profile;
- temporary Chat: off by default;
- optional title and starter prompt.

Creating a Chat never starts a model run. The first run happens only after an
explicit send/queue action.

### 4.2 New Project

The minimum flow creates an empty Project with a name and optional description.
The advanced step can set an accent, instructions, model profile, permission
preset and workspace folder. All advanced values show their inheritance source
and can be reset to defaults.

After creation, open Project Overview and offer `New project chat`; do not
automatically dispatch a prompt or index a folder.

### 4.3 Move Chat to Project

Moving is a two-step interaction:

1. Choose a destination (`Standalone` or a Project) with search and recent
   destinations.
2. Confirm the scope change, showing what changes (Project instructions,
   memory/skill/model defaults) and what remains unchanged (history, branches,
   artifacts and run receipts).

The effective context is recalculated after the move. If the destination is
missing, archived or unavailable, keep the Chat where it was and show a typed
failure; do not silently detach it.

## 5. Scope and inheritance UX

Use one visible precedence chain everywhere:

```text
App default → Profile → Project → Chat → Run/Turn override
```

For model, parameters, permissions, memory, skills, workspace roots, style
instructions and export policy, the UI shows:

- effective value;
- source level and revision;
- lock/availability state;
- `Reset to <parent>` and `Reset all overrides`;
- Undo/Redo for the current edit batch;
- import/export preset with a diff preview.

An override is never hidden behind a color or icon alone. A compact badge may
read `Inherited · Project`, `Override · Chat` or `This run`.

`Allow all` is a scoped capability preset, not a refusal bypass. It supports
session/Chat/Project/persistent scope, expiry, quota, audit, revoke and reset.
Model/provider refusal, OS/UAC/ACL boundaries and secret handling remain
outside the renderer toggle.

## 6. Keyboard, focus and accessibility

P1 keyboard contract:

- `Ctrl+K`: command palette and global navigation.
- `Ctrl+N`: New Chat.
- `Ctrl+Shift+P`: New Project.
- `Ctrl+Shift+B`: toggle object sidebar.
- `Ctrl+Shift+I`: toggle inspector.
- `Ctrl+Shift+F`: focus Chat/project search.
- `Ctrl+Enter`: send when the user's Enter preference is newline-first.
- `Enter`: send by default; `Shift+Enter`: newline by default.
- `Esc`: close menu/drawer/popover, then return focus to its trigger.
- Arrow keys move within a row/list; `Home`/`End` move to first/last item.

All menus and drawers must:

- expose a labelled trigger and `aria-expanded` state;
- trap focus only when modal;
- restore focus to the invoking control on close;
- announce rename/move/archive results in a live region;
- preserve a visible focus ring in dark, light and high-contrast modes;
- provide non-drag alternatives for reorder and move operations.

Drag-and-drop is an optional accelerator. It must never be the only way to
move a Chat or reorder Projects.

## 7. Responsive and multi-window behavior

- Wide windows use rail + object sidebar + canvas + optional inspector.
- Medium windows collapse the inspector to a drawer first.
- Narrow windows use one modal drawer at a time; opening the sidebar closes the
  inspector and vice versa.
- Persist sidebar/inspector sizes per window and activity. Double-clicking a
  divider restores its default size.
- Opening a Chat in a new window preserves the deep link and draft but does not
  clone active grants or approvals.
- A second window viewing the same Chat receives visible revision/reconcile
  state instead of silently overwriting local edits.

## 8. Truthful preview states

Every secondary Project/Chat surface uses one of these states:

```text
Preview     renderer interaction exists; native operation is not claimed
Configured  user settings are stored, but execution may not be available
Planned     interaction is designed but not yet exposed
Wired       renderer/native path exists
Verified    current focused check proves the path on this runtime
Unavailable typed reason prevents this operation
```

The state badge is accompanied by a short explanation and, where useful, an
action to inspect the roadmap or required setup. Never use a disabled button
with a generic tooltip when a typed state can explain the limitation.

## 9. P1 acceptance slice

The first implementation should be considered complete when a user can:

1. Open Chats and Projects from the shell.
2. Create a standalone Chat and a Project-owned Chat.
3. See Projects with expandable nested Chats.
4. Open a Project Overview and return to its Chat list.
5. Rename, pin, mark unread/read, archive/restore and move a Chat through the
   UI preview state.
6. Create a Project, edit basic metadata and add a folder grant without any
   implicit model request or indexing side effect.
7. Inspect inherited model/context/permission labels and reset an override.
8. Open a Chat in a new tab/window or copy a deep link when the host supports
   it.
9. Use the same flows with keyboard and a narrow viewport.
10. Understand which actions are preview/planned versus wired/verified.

Minimal smoke checks for this slice are boot, TypeScript/JS syntax, focused
component tests and one manual user-facing HMR pass. Full native, security,
recovery and visual suites belong to CI/nightly/release gates.

