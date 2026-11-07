---
id: OMNIA-ULTRA-HARNESS-AGENTS
title: Agent, subagent, team and persona taxonomy
status: normative-target
---

# Agent primitives

Do not use one Agent abstraction for every execution pattern.

## Required primitives

- MainSession: durable user-facing task.
- FreshSubagent: role prompt plus selected context.
- ContextFork: parent snapshot at a checkpoint.
- BackgroundSession: durable independent work.
- PeerTeamAgent: role context plus shared task board/mailbox.
- WorkflowWorker: typed node input for deterministic fan-out.
- ReviewerJudge: artifact/evidence review, read-only by default.
- SideQuestionAgent: read-only answer without mutating main run.
- MonitorAgent: health/event watcher and trigger source.
- RemoteHumanAgent: explicit human collaborator context package.

Each primitive specifies context, communication, persistence, tools, permissions,
budget, lifecycle, UI grouping and recovery behavior.

## Agent profile

Every profile has:

- stable profile ID and revision;
- purpose and non-goals;
- input/output schema;
- preferred model/effort;
- context policy;
- memory/skill policy;
- tools and permissions;
- cost/latency profile;
- failure modes;
- evaluation suite;
- icon role;
- status/attention semantics;
- examples.

## Specialist families

Orchestration, requirements, product, UX, accessibility, visual design,
frontend, backend, native Windows, Rust, TypeScript, Python, C++, database,
distributed systems, performance, Git, PR, CI/CD, Docker, testing, fuzzing,
security, privacy, supply chain, research, source audit, science, math,
physics, AI/ML, data, competitive programming, documents, PDF, Office,
LaTeX, web, image, audio, video, browser, network, machine, automation,
integration, scheduler, cost, routing, evaluation and education.

## Teams

Teams have a lead, role-specific agents, shared tasks, a mailbox, dependency
graph, budget and reviewer. Team membership does not grant additional authority.
A parent can only attenuate, never amplify, child capabilities.

