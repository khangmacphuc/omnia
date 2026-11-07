---
id: OMNIA-ULTRA-GOAL-ADAPTIVE-INTELLIGENCE
title: Adaptive intelligence and evaluation governance
status: normative-target
version: 1.0.0
last_reviewed: 2026-08-14
supersedes: []
requirements_registry_revision: 2026-08-14.6
---

# Adaptive intelligence and evaluation governance

Omnia may improve its retrieval, model routing, prompt assistance, retry
choices, agent scheduling, personalization and resource planning over time,
but learning is a controlled product subsystem rather than an opaque privilege
escalator. A learned recommendation never grants authority, reads a new data
class, weakens sandboxing or converts a denied action into an allowed action.

## Decision pipeline

Each adaptive decision has separate records for: eligible inputs, redaction and
consent outcome, policy baseline, candidate policies/models, feature revision,
chosen action, confidence/uncertainty, user override, observed outcome,
evaluation label and rollback relation. The input snapshot is data-minimized;
raw secrets, credentials, private provider bodies, raw system-wide keystrokes
and restricted browser/capture observations are excluded before indexing or
learning.

Retrieval may combine lexical/sparse, dense/embedding, graph, recency,
salience, task/goal and code-symbol signals. It must show why a source was
included, excluded, superseded or de-prioritized. Routing may use capability,
cost, latency, modality, health, context length, privacy, local/cloud policy,
evaluation and user preference signals, but must publish a human-readable
decision explanation and manual override.

## Learning modes and privacy controls

Default behavior is local-first, consented and redacted. The settings surface
offers per-signal collection, retention, deletion/export, local-only versus
approved remote evaluation, training schedule, resource cap, dataset size cap,
pause and emergency deletion. Inference logs and debug traces use a stricter
redaction classification than ordinary analytics.

`Auto` may collect eligible events and stage candidates, but it does not deploy
unreviewed changes. A user can choose batch learning at a quiet scheduled
window, on-demand evaluation, or bounded real-time adaptation. Real-time
adaptation is limited to reversible preference/ranking parameters inside a
pre-approved policy envelope; structural model, permission or security policy
changes require explicit review and a versioned rollout.

Supported methods may include rules, calibrated heuristics, k-nearest-neighbor,
linear/gradient-boosted ranking, contextual bandits, supervised models and
reinforcement-learning-style policy improvement. The architecture records the
method, feature schema, objective, reward/label definition, training dataset
manifest, seed, evaluation results and rollback path. It does not promise that
every algorithm is appropriate for every dataset or task.

## Evaluation, shadowing and rollback

Every candidate competes with an explicit baseline on replayable redacted
fixtures, offline holdouts and task-specific evaluation suites. Promotion uses
quality, factuality/grounding, user correction rate, latency, cost, failure,
security and accessibility guardrails—not a single aggregate score. Shadow and
A/B assignments are deterministic/auditable, budget-capped and never applied
to an action with unproven idempotency or irreversible external side effects.

Drift monitors watch feature distribution, provider/model changes, user
correction/override rate, cost, latency, error/retry outcomes and safety
violations. A guardrail breach automatically falls back to the last known-good
baseline and surfaces the reason. All promoted routes retain a rollback slot;
historical decisions remain reproducible against their policy/model revisions.

## Personalized experience without surveillance

Personalization can adjust layout density, preferred model class, explanation
depth, study cadence, suggestion ordering, coding/research templates and
notification schedules only from approved, inspectable signals. It must not
infer sensitive traits, track the user across unrelated apps/sites, collect
passwords or protected content, or inspect an unfocused application outside an
explicit capture/control session. Keyboard and mouse observations for improving
Omnia interactions are opt-in, scoped to Omnia, redacted/aggregated where
possible and displayed in the data inventory.

## Acceptance gate

An adaptive feature requires typed policy/configuration, consent and data
inventory, redaction tests, baseline, deterministic evaluation fixture,
shadow/A-B assignment logic, metrics, drift/rollback, user-visible explanation
and export/delete paths. See `../architecture/adaptive-intelligence-plane.md`,
`../harness/evaluations-learning-routing.md` and
`../security/hard-boundaries.md`.
