---
id: OMNIA-ULTRA-START
title: Omnia Ultra specification pack entry point
status: normative-target
version: 1.0.0
last_reviewed: 2026-08-14
---

# Omnia Ultra specification pack

This folder is the maintainable, AI-readable product charter for Omnia Ultra.
It converts the large product goal into small, linked specifications instead
of one giant prompt. It is intentionally separate from implementation-status
documents: the pack describes the target; the current repository and tests
decide what is actually implemented.

## Required reading order for an AI worker

1. Read this file completely.
2. Read 01-MASTER-CHARTER.md.
3. Read 02-PRECEDENCE-AND-STATUS.md.
4. Read 03-TERMINOLOGY.md.
5. Read 04-CURRENT-STATE-BRIDGE.md.
6. Read the domain bundle matching the requested task.
7. Read delivery/acceptance-gates.md and delivery/test-matrix.md.
8. Read security/hard-boundaries.md before adding any browser, machine,
   credential, capture, network, privileged or remote capability.
9. Read schemas/ and update the relevant schema when a durable contract changes.
10. Inspect source, tests and git status before claiming implementation.

The copy-friendly product goal is split under `goal/`. Read
`goal/00-copy-ready-prompt.md` when handing the execution contract to another
AI; it is the **single canonical copy-ready prompt**. Use the smaller
neighboring files for focused routing and maintenance. The
`delivery/99-execution-prompt.md` file is only an operational alias that
redirects to this canonical prompt; it must never carry an independently
maintained product goal.

## Domain routing

| User request | Read these bundles first |
|---|---|
| Project/Chat information architecture, ownership, sidebar and P1 interaction | interaction/project-chat-foundation.md |
| Create project, add folder/workspace, chat library, archive/search/import/export | interaction/conversation-workspace-library.md |
| Jump prompt, jump-to-message, copy, branch, fork, compare | interaction/prompt-navigation-and-jump.md, interaction/branching-copy-fork.md |
| Queue, steer, reorder, bulk action, schedule | interaction/queue-steer-schedule.md |
| Selection, hover, reply, annotation | interaction/selection-reference-annotations.md |
| Large paste, file conversion, Markdown/LaTeX input | interaction/composer-large-paste-live-render.md |
| Voice | interaction/voice-input-and-conversation.md |
| Model picker, model settings, health | observability/model-picker-health-profiles.md |
| OpenAI Responses/Chat/Embeddings, Anthropic Messages, Gemini v1/v1beta, local/custom endpoints | observability/universal-provider-protocol-adapters.md |
| Make a selected model handle unsupported image/audio/video/PDF/Office/archive/scientific inputs | architecture/multimodal-capability-bridge.md, schemas/modality-bridge-plan.schema.json |
| Tokens, cache, RPM, cost, request timing | observability/request-usage-telemetry.md, observability/cost-usage-analytics.md |
| Retry, fallback, 429, 502, timeout, auto-reprompt | observability/retry-fallback-repair.md |
| Pause, checkpoint, no-text Continue, edit/retry state and active-run compare | interaction/run-control-edit-retry.md, interaction/run-checkpoint-resume.md, interaction/continue-without-prompt.md, interaction/prompt-edit-state-aware-retry.md, interaction/active-run-variants-compare.md |
| Logs, traces, request inspector | observability/logs-traces-debug.md |
| Ultra, agents, subagents, skills, MCP | harness/ultra-workflow.md, harness/agents-subagents-personas.md, harness/memory-skills-tools-mcp.md |
| Specialist roles/personas for design, CP, math, science, code, cyber, AI, engineering and research | harness/specialist-agent-persona-catalog.md, schemas/agent-role-profile.schema.json |
| Memory, RAG, routing, learning | architecture/context-memory-search.md, harness/evaluations-learning-routing.md |
| Goal, roadmap, blueprint, plan, task, project atlas | project-twin/roadmaps-blueprints-plans.md, project-twin/graph-and-atlas.md |
| Project overview, smart title or material-change refresh | project-twin/project-overview-smart-refresh.md |
| Browser, capture, virtual mouse, minimized window | runtimes/virtual-pointer-window-control.md, runtimes/browser-network-capture.md |
| Capture one window/tab/process with screen or audio | runtimes/targeted-capture-and-presence.md |
| Persistent/isolated machine, remote, headless | runtimes/machines-headless-remote.md |
| Admin, secrets, approvals, sandbox | security/approvals-sandbox-secrets.md, security/hard-boundaries.md |
| Files, Office, PDF, media, IDE, Git, Docker | workbenches/file-artifact-studio.md, workbenches/ide-git-docker-devops.md |
| Image/video generation endpoints and authorized image/video/PDF cleanup | workbenches/generative-media-endpoints.md |
| Syntax-highlighted input/output, terminal and build/test logs | interaction/structured-io-log-rendering.md |
| Local models, downloads, runtime, resource planning, evaluation | workbenches/local-model-lab.md |
| Hugging Face/Ollama/LM Studio-style model search, sort, filter, download and tuning | workbenches/local-model-catalog-and-tuning.md |
| Research, learning, science, CP | workbenches/research-learning-science.md |
| Email, calendar, channels, scheduler | workbenches/integrations-automation.md |
| Build order, gates, verification | delivery/roadmap.md, delivery/workstreams-and-dependencies.md, delivery/acceptance-gates.md |

## Non-negotiable execution loop

~~~text
inspect repository
-> read relevant spec files
-> inspect current implementation and tests
-> make the smallest coherent change
-> update contract/schema/docs
-> run focused tests
-> run same-snapshot gates
-> record evidence
-> update capability coverage and Project Twin
-> report truthful status
~~~

Do not implement a visually convincing placeholder and call it shipped.
Do not use old research or old test output as current evidence after a material
source change. Do not rewrite or delete user work.

## Pack map

The machine-readable manifest is manifest.json. The human-readable research
ledger is delivery/source-ledger.md. The execution prompt intended for another
AI is goal/00-copy-ready-prompt.md. Current mutable continuation state belongs
in this pack's `04-CURRENT-STATE-BRIDGE.md`,
`docs/IMPLEMENTATION_STATUS.md` and dated evidence/audit receipts—not in the
long-lived prompt.
