---
id: OMNIA-ULTRA-GOAL-CONVERSATION-HARNESS
title: Conversation navigation and Ultra harness goal
status: normative-target
version: 1.0.0
last_reviewed: 2026-08-14
supersedes: []
requirements_registry_revision: 2026-08-14.6
---

# Conversation and harness

Conversation history is an immutable, navigable timeline. Jump Prompt must
resolve prompts, selections, responses, tool events, sources, branches, goals,
tasks and telemetry records through stable deep links and stale-target errors.
Copy, duplicate, branch, fork, replay, regenerate, compare, promote and merge
must preserve alternate history and exact provenance rather than overwriting it.

The surrounding library supports create project, attach or detach multiple
workspace roots, create/move/rename/pin/archive/restore conversations, tags,
smart collections, global/hybrid search, import/export and undo-safe bulk
actions. Long answers can continue across several linked assistant items with a
durable cursor, semantic boundary, deduplication and restart recovery.

Queue, steer, `Btw`, parallel work and schedules need durable order, cursor,
actor, permissions, undo-safe bulk actions and restart recovery. `steer` waits
for a safe boundary; queue waits for ordered completion; `Btw` is an isolated
side question with no mutation of the primary branch.

Ultra harness roles include planner, researcher, source auditor, implementer,
tester, critic, security auditor, accessibility auditor, visual QA, cost
optimizer, retry advisor, release engineer and completion judge. Subagents have
bounded budgets, recursion, concurrency, leases, mailboxes, context transfer,
approval boundaries, child authority ceilings and structured handoff packets.
Memory and skills are scoped, versioned, provenance-aware and explicitly
approvable; newer facts supersede older revisions instead of being silently
blended.

Prompt Enhance is reversible. Prompt Workshop supports multi-model discussion,
inline user steering and a final `Finalize/chốt` action that inserts the chosen
revision into the composer. Prompt suggestions are separate from action
suggestions and include confidence, expected value, cost/time and permissions.

See `../interaction/branching-copy-fork.md`,
`../interaction/conversation-workspace-library.md`,
`../interaction/queue-steer-schedule.md`, `../interaction/prompt-intelligence.md`,
`../harness/ultra-workflow.md`, `../harness/agents-subagents-personas.md` and
`../harness/memory-skills-tools-mcp.md`.
