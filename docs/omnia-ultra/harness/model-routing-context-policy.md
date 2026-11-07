---
id: OMNIA-ULTRA-HARNESS-MODEL-ROUTING-CONTEXT
title: Main and subagent model routing, context delivery and compaction
status: normative-target
last_reviewed: 2026-08-14
---

# Main and subagent model routing, context delivery and compaction

Every main-agent and subagent dispatch freezes an explicit model-routing and
context-delivery decision. `Auto` is an evidence-backed policy, not a hidden
hard-coded default and not permission to route private data anywhere.

## Model-selection scopes and precedence

Users can configure a model/provider/effort/profile or `Auto` at global,
profile, project, workflow, skill, persona, agent role, agent instance, task,
prompt and retry/fallback scope. More specific explicit settings override less
specific settings. The resolved precedence is:

1. prompt/request override;
2. task or current agent-instance override;
3. specialist role/persona/workflow/skill policy;
4. project policy;
5. profile/global main-agent or subagent default;
6. evaluated `Auto` router.

The UI separately exposes main-agent default, subagent default, per-role model
pool, allowed local/cloud providers, effort mapping, fallback pool, maximum
cost/latency, quality floor, privacy/data-residency rules and concurrency.
Every dispatched attempt records requested and effective route plus why a
fallback or override changed it.

## Evidence-backed Auto router

The router can use task type/difficulty, modality, required tools, context
length, provider capability/health/quota, latency/cost history, local hardware,
privacy, user preferences, prior evaluation, retry state and subagent role. It
predicts quality, latency, cost and failure risk with confidence and chooses
only among policy-allowed candidates.

Initial behavior uses deterministic rules and offline evaluation. Learned
ranking, gradient-boosted models, contextual bandits or reinforcement-style
policy improvement may be introduced through shadow/A-B evaluation and
rollback. User overrides and corrections become labels only under the selected
consent policy. A learned model cannot add a provider, grant a permission,
weaken sandboxing or upload a restricted context.

## Context delivery modes

Every agent/task can choose:

- `full` — the complete authorized frozen context up to the declared budget;
- `partial` — user-selected sections/ranges and mandatory policy segments;
- `auto` — inspectable retrieval and budget allocation based on the task;
- `summary-plus-sources` — compacted summary with resolvable source anchors;
- `manifest-only` — metadata and on-demand retrieval handles without content;
- `retrieval-on-demand` — minimal start plus capability-limited search/read;
- `fresh` — no inherited conversation history except explicit task/authority;
- `forked-snapshot` — immutable parent context snapshot with selected deltas.

The context manifest lists every included and omitted segment, source revision,
reason, token/byte estimate, data class, priority, survival policy and retrieval
handle. A subagent receives no more authority than the parent and no unrelated
context merely because budget remains.

## Budget allocation and relevance

Budgets are allocated across system/security rules, user intent, current task,
recent turns, pinned facts, project instructions, files/code, sources,
memory/skills, tools, agent handoff and reserved output. Selection combines
mandatory constraints, lexical/dense/graph retrieval, code symbols, dependency
groups, recency/salience, contradiction/supersession and estimated marginal
value. Omnia logs the inclusion/exclusion decision and tests output quality
against cheaper context plans.

## Auto-compaction policy

Users can select manual, prompt-triggered, threshold, predictive or `Auto`
compaction and configure token/percentage/cost/latency thresholds. Automatic
triggers may include predicted context overflow, lost-in-the-middle risk,
excessive irrelevant context, cache-break tradeoff, long tool traces or a
provider context-window change.

Compaction creates a new immutable context revision and checkpoint. It never
deletes the raw journal. It preserves current user corrections, security and
project instructions, active goal/task state, unresolved approvals/effects,
branch/fork lineage, source/citation IDs, memory supersession and continuation
cursors. Tool request/result batches and provider reasoning/tool loops remain
atomic where their protocol requires it.

Before promotion, a fidelity evaluator checks decisive facts, constraints,
citations, tasks, code symbols and contradictions. Low-confidence compaction
falls back to fuller context, retrieval-on-demand or user review. Provider-
native compaction and Omnia-owned compaction remain distinct provenance layers.

## Learning and telemetry

For each route/context plan, record candidate set, features revision, selected
model/profile/effort, context mode, included/omitted tokens, compaction work,
provider cache plan, quality/evaluation, user correction, cost, latency,
retry/failure and downstream artifact/test outcome. These records support
offline evaluation and safe routing improvements; raw secrets and covert
system-wide keystrokes are excluded.

See `../schemas/model-routing-policy.schema.json`,
`../schemas/context-delivery-policy.schema.json`,
`../architecture/cache-context-routing.md` and
`evaluations-learning-routing.md`.
