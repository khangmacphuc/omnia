---
id: OMNIA-ULTRA-INT-CONVERSATION-LIBRARY
title: Conversation, project and workspace library lifecycle
status: normative-target
schema: schemas/conversation-library.schema.json
---

# Conversation and workspace library

Omnia needs the complete library layer expected from a serious chat, research
and engineering product. A conversation is not only a rendered message list;
it belongs to durable projects, workspace roots, context policy, artifacts,
branches, goals, tasks, memory, skills and exact execution lineage.

## Canonical records

Keep stable IDs and revisions for:

- project;
- workspace root;
- conversation;
- conversation branch;
- message revision;
- library collection;
- tag;
- saved search;
- import/export bundle;
- deletion or restoration receipt.

A project records title, optional locked title, description, icon/color, status,
owners, roots, active branch, goal, context profile, provider/runtime defaults,
memory/skill scope, Project Twin revision, created/updated time and retention
policy. Presentation fields never replace the canonical IDs.

## Create project and add workspace folder

Users can:

- create an empty project, project from template or project from a folder/repo;
- add, remove, reorder, rename or temporarily disable multiple local folders;
- attach read-only folders, repositories, network drives, remote roots, cloud
  objects or virtual research collections through explicit connectors;
- choose per-root indexing, ignore rules, sensitivity, mount mode and tool
  permissions;
- inspect canonical path, repository identity, branch/worktree, availability,
  index revision and last scan;
- detach a root without deleting its files or silently erasing historical
  citations and artifact lineage.

Canonicalize paths and detect duplicate/overlapping roots. Never recursively
index, upload, mount or expose a root to a provider until the effective policy
allows it. Offline or disconnected roots remain visible with an unavailable
reason rather than disappearing.

## Conversation library operations

Support create, rename, duplicate, move between projects, pin, favorite,
archive, unarchive, soft-delete, restore and policy-controlled permanent
delete. Add tags, folders, smart collections, saved filters, recent/history,
unread/attention state and bulk operations with preview, undo receipt and
partial-failure reporting.

Search and filters include:

- title, prompt, response, attachment, source, citation, tool and artifact;
- project, workspace root, branch, tag, goal, task and agent;
- provider, model, effort, status, date, cost and token range;
- active, archived, deleted, failed, waiting, scheduled and background work;
- exact, lexical, semantic and hybrid modes with visible scope and provenance.

Search results deep-link to the exact message, selection, source, tool event,
request attempt or artifact. Stale or deleted targets return a typed state and
the nearest valid ancestor; they never jump silently to unrelated content.

## Chat fundamentals and history integrity

The conversation surface supports streaming, Stop, Continue, edit, regenerate,
replay, branch, fork, compare, promote, merge, copy/export, attachments, voice,
citations and per-conversation settings. Editing a historical user message
creates a new revision/branch; it does not rewrite executed history.

Message deletion, redaction and retention use tombstones and auditable receipts
where policy requires lineage. Export can include Markdown, rich text, JSON,
artifacts, citations, telemetry summaries and a portable encrypted archive.
Import validates schema/version, hashes, limits and untrusted content before it
becomes active.

## Long-answer continuation

A single user request may produce several assistant continuation items without
losing the original goal. Persist a continuation cursor containing source run,
completed outline nodes, unresolved questions, citations, context revision and
deduplication hash.

Allow configurable behavior:

- stop at the provider limit and offer Continue;
- continue automatically up to a time, cost, token or item budget;
- pause at semantic section boundaries;
- resume after renderer, kernel or machine restart;
- cancel without deleting completed output.

Each continuation identifies its part and predecessor, avoids repeating already
committed text, keeps references valid and remains branchable. A completion
judge may recommend another continuation but cannot exceed user or policy
budgets silently.

## Sidebar and command UX

The library provides fast create, project switcher, global search, pinned,
recent, projects, archived, scheduled and background sections. Support drag and
drop, keyboard reordering, context menus, command palette, multi-select and
touch alternatives. Every action announces result/failure to assistive
technology and preserves focus predictably.

Opening a project restores its last valid layout, conversation, branch,
selection and scroll anchor when possible. It must not dispatch a model request
as a side effect of navigation.

## Sync and conflict policy

Clients synchronize committed event cursors, not mutable UI snapshots. Offline
changes carry actor, device, base revision and idempotency key. Conflicts use
explicit merge, keep-both or choose-revision flows; titles, tags, ordering,
deletion and retention never use invisible last-write-wins when data could be
lost.

## Acceptance

- Creating a project and adding/removing a root survives restart.
- Detaching a root never deletes user files.
- Rename/pin/archive/delete/restore and bulk undo are durable and idempotent.
- Search resolves an exact deep link or a typed stale result.
- Editing history creates lineage instead of mutating executed messages.
- Long-answer continuation resumes without duplicated committed sections.
- Import/export round-trips supported records and reports unsupported fields.
- Keyboard, screen-reader, touch and reduced-motion paths are tested.
