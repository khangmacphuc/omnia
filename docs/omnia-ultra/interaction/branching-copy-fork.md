---
id: OMNIA-ULTRA-INT-BRANCH
title: Branch, copy, fork, clone, replay and merge semantics
status: normative-target
schema: schemas/conversation-navigation.schema.json
depends_on: [docs/CONVERSATION_BRANCH_ARCHITECTURE.md]
---

# Branch, copy, fork and lineage

## Distinct operations

- Copy: copy content or a reference; no new execution lineage.
- Copy as Markdown/plain/rich/JSON/citation bundle: presentation/export only.
- Branch: create a sibling continuation inside the same conversation.
- Fork conversation: create a new conversation from an exact source cursor.
- Clone task: create a new task with a copied plan but fresh run state.
- Clone project: create a new project with selected docs/artifacts, never secrets
  or grants by default.
- Retry: new provider attempt when safe; user-visible retry is a sibling outcome.
- Regenerate: new run with explicit model/parameter/context provenance.
- Replay: rerun a frozen input under an explicitly selected environment.
- Compare: run two or more candidates with independent usage and provenance.
- Promote: make a branch or candidate the visible path without deleting others.
- Merge: combine selected artifacts/annotations/plan facts only through a
  conflict-aware command; never silently merge incompatible instructions.

## Branch creation

Persist:

- source conversation and branch;
- source event cursor;
- exact fork boundary;
- active producer policy;
- creator and reason;
- inherited message revisions;
- excluded partial output;
- new branch name;
- branch lineage.

An active run must use one explicit policy:

- completed_only;
- interrupt_then_fork;
- include_partial_as_interrupted.

The UI must never infer “whatever is visible now”.

## Fork authority boundary

A fork copies content lineage, not authority. Do not copy:

- secrets;
- active grants;
- browser cookies;
- scheduled side effects;
- remote sessions;
- approvals;
- trusted tool installation;
- privileged machine handles.

The fork receives fresh policy evaluation and explicit context selection.

## Compare and merge

Compare shows:

- prompt/context differences;
- model/provider/effort differences;
- token/cost/latency;
- sources and tool calls;
- output diff;
- verification result.

Merge supports:

- artifact merge;
- annotation merge;
- plan/task merge;
- selected message promotion;
- user-reviewed conflict resolution.

Instruction conflicts, permission conflicts and stale source conflicts block
automatic merge.

