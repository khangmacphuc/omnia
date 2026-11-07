---
id: OMNIA-ULTRA-GOAL-CACHE-CONTEXT-ROUTING
title: Cache, model routing, context delivery and compaction goal
status: normative-target
version: 1.0.0
last_reviewed: 2026-08-14
supersedes: []
requirements_registry_revision: 2026-08-14.6
---

# Cache, model routing, context delivery and compaction

Omnia must minimize cost and latency without lowering answer quality or
fabricating provider cache evidence. It combines encrypted user-managed caches,
provider-native prompt/context cache adapters, stable-prefix planning,
provider-neutral derived artifacts and context selection with explicit
invalidation, privacy and provenance.

A local cache can reuse OCR, AST, embeddings, summaries, retrieval results,
compiled context and deterministic tool artifacts. It can avoid sending
irrelevant tokens. Only a provider-supported API and provider-reported fields
can establish a provider cache hit/read/write for billing. Omnia must never
label locally reused context as provider-cached input merely to show savings.

Main-agent and subagent models are configurable separately at global, project,
workflow, skill, persona/role, agent instance, task, prompt and retry scope.
Users choose explicit provider/model/profile/effort, a candidate pool or `Auto`.
The resolved route, precedence, fallback, data-locality and effective settings
are shown per attempt.

`Auto` uses a versioned evaluated policy informed by task/modality, difficulty,
context size, tools, provider health/quota, latency/cost, local resources,
privacy, prior outcomes and user corrections. It begins with deterministic
rules, then may adopt learned ranking/bandit/RL-style improvements only through
consented data, offline evaluation, shadow/A-B tests, guardrails and rollback.

Context delivery supports full, partial, auto, summary-plus-sources,
manifest-only, retrieval-on-demand, fresh and forked-snapshot modes. Every
subagent context is relevant, budgeted and inspectable; omitted segments retain
reasons and resolvable sources. Child authority never exceeds parent authority.

Compaction can be manual, prompt-triggered, threshold-based, predictive or
Auto. Users set token/percentage/cost/latency thresholds. Compaction creates a
new checkpoint/context revision, preserves raw history, active goals/tasks,
instructions, user corrections, approvals/effects, citations, code/file state,
memory supersession and agent lineage, and passes a fidelity evaluation before
promotion. Provider-native compaction remains distinct from Omnia-owned
compaction.

See `../architecture/cache-context-routing.md`,
`../harness/model-routing-context-policy.md`,
`../schemas/cache-policy.schema.json`,
`../schemas/model-routing-policy.schema.json` and
`../schemas/context-delivery-policy.schema.json`.
