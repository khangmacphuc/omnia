---
id: OMNIA-AUDIT-DYNAMIC-ROUTING-LEARNING-2026-08-14
title: Dynamic routing and adaptive-learning contract audit
status: audit-evidence
last_reviewed: 2026-08-14
scope: docs/omnia-ultra dynamic routing and telemetry learning contracts
---

# Dynamic routing and adaptive-learning contract audit

## Verdict

**Partial, well-governed specification; not a shipped learning router.** The
pack correctly makes deterministic security and authority rules dominate learned
selection, makes collection and training separately consented, and requires
shadow/canary/rollback. However, its current contracts do not yet make every
route decision, policy release, training eligibility decision and delayed
outcome reconstructible enough to safely operate an evidence-backed `Auto`
router at product scale.

This audit concerns architecture and release gates. It does **not** claim that
Omnia currently trains, deploys, or safely replaces manual routing with a
production adaptive policy.

## Scope and evidence inspected

- `architecture/adaptive-intelligence-plane.md`;
- `harness/model-routing-context-policy.md`;
- `harness/evaluations-learning-routing.md`;
- `goal/10-adaptive-intelligence-and-evaluation.md`;
- `goal/13-cache-context-routing-compaction.md`;
- `goal/14-telemetry-data-and-safe-learning.md`;
- `observability/request-usage-telemetry.md` and
  `schemas/request-telemetry.schema.json`;
- `schemas/model-routing-policy.schema.json` and
  `schemas/context-delivery-policy.schema.json`;
- research plans for evaluation, provider provenance and benchmark gates.

The audit follows the existing project rule that local, versioned facts are the
authority; OpenTelemetry-style fields are an interoperability projection rather
than Omnia's source of truth.

## Strengths retained

1. `Auto` is explicitly a policy-constrained choice, not a hidden default.
2. Router inputs already include capability, modality, privacy/locality,
   context, provider health, cost, latency, evaluation and user preferences.
3. Learned selection is forbidden from granting capability, weakening a
   sandbox, altering permissions or sending restricted data to an unapproved
   destination.
4. The pack distinguishes collection, datasets, training and deployment; it
   requires consent, redaction, baseline evaluation, shadow/A-B, drift and
   rollback.
5. Context and multimodal plans preserve source/transform lineage, so routing
   can be explained rather than merely asserted.

## Findings

| ID | Severity | Finding | Required resolution |
| --- | --- | --- | --- |
| DRL-01 | High | Product effort labels were inconsistent: `model-routing-policy` used `instant/low/medium/high/max`, while model profiles, request telemetry, navigation and continuation use `fast/balanced/deep/ultra/custom`. | Normalize route-choice effort to the public product taxonomy; translate it to provider-native settings only in a revision-pinned model profile. This audit applies that narrow schema correction. |
| DRL-02 | High | There is no canonical immutable **routing-decision receipt**. A policy revision alone cannot reconstruct candidate eligibility, feature provenance, estimates, overrides, chosen joint action, fallback chain or post-dispatch effective route. | Add `schemas/routing-decision-receipt.schema.json`, then require its ID in every prepared provider input and request telemetry projection. |
| DRL-03 | High | Policy training/release state has no typed lifecycle record. Therefore a deploy cannot prove its dataset/feature/label/objective/seed/evaluation/baseline/rollback relationship. | Add `schemas/adaptive-policy-release.schema.json` with a state machine from draft through retired, fixed baseline and rollback IDs, dataset manifest, evaluator revisions, rollout segment, approval and emergency-stop evidence. |
| DRL-04 | High | The router can jointly select model, effort, context, cache, bridge, agent, tool, machine and workflow, but no contract captures dependencies or prevents a later planner stage from silently invalidating the earlier decision. | Treat routing as a constrained staged plan. Freeze policy/capability/context/authority snapshots before dispatch; re-evaluate only the specifically invalidated stage and emit a successor receipt that names its predecessor and invalidation reason. |
| DRL-05 | High | Training eligibility is described in prose but is not an event-level fact. “Delete/export” alone cannot prove that an observation, derived feature, dataset row, trained policy and deployed release are handled correctly after consent withdrawal. | Add immutable consent/eligibility/tombstone references; a deletion request must produce a deletion receipt, exclude future training, identify affected dataset/policy releases and schedule retraining or retirement according to a declared unlearning policy. Preserve no secret content in the receipt. |
| DRL-06 | High | A request may retry, fallback, use a bridge and spawn subagents. Without an episode key and attribution rules, it can double-count token cost, failure, user correction and reward. | Introduce `decisionEpisodeId`, logical-task/branch/head snapshot, attempt lineage and attribution weights. Distinguish observed result, evaluation label, user correction and reward; missing feedback is not implicit negative feedback. |
| DRL-07 | High | Shadow/A-B is named but the non-interference boundary is not executable. A shadow candidate could otherwise call a tool, consume a paid provider budget or create a second side effect. | Require `executionMode` (`offline`, `shadow`, `canary`, `promoted`) and an allowed-effect ceiling in the receipt. Shadow may use only approved read-only/deterministic simulators or pre-recorded provider responses; no external mutation, paid dispatch or approval consumption without a separate explicit policy. |
| DRL-08 | Medium | Health, quota, capability and price data are volatile. A selection is unsafe/reproducibility-poor if it records only “healthy” rather than the freshness, source, confidence and frozen snapshot used. | Pin `capabilitySnapshotId`, `healthSnapshotId`, `priceSnapshotId`, observed time/TTL and uncertainty. When stale, the decision must use policy-declared conservative behavior and show that fact. |
| DRL-09 | Medium | The evaluation plan requires counterfactual replay/randomized traffic but no receipt requires propensity/assignment data. Off-policy estimates are otherwise biased or impossible to audit. | For every eligible exploratory decision, record assignment unit, deterministic bucket/seed, candidate-set hash, selected-action propensity or exact allocation rule, traffic eligibility, exposure cost and stopping rule. Never add this field for user-forced/manual routes. |
| DRL-10 | Medium | The existing schemas do not prevent a malformed explicit/pool route choice from omitting a selected model or candidate pool. | Add conditional schema requirements: `explicit` requires `modelProfileId`; `pool` requires a non-empty candidate pool. This audit applies the correction. |
| DRL-11 | Medium | A learned score can become a self-confirming reward if it trains from only the same provider/model's judge. | Every release must disclose evaluator independence, deterministic validators, source/citation/code-test evidence, human calibration where applicable and degradation slices. A learned score is evidence, never a sole promotion gate. |

## Canonical atomic design

### A. Decision episode and receipt

Create exactly one `RoutingDecisionReceipt` for each route-planning decision.
It is append-only and may be superseded but never rewritten. It contains:

- identity: `receiptId`, `decisionEpisodeId`, `logicalTaskId`, `runId`,
  `attemptId`, `branchId`, `stateRevisionId`, `parentReceiptId` and monotonic
  sequence;
- trigger: initial dispatch, retry, fallback, provider health change, context
  overflow, modality bridge escalation, user override, policy rollout or
  restart recovery;
- frozen inputs: user/settings policy revision, authority/grant snapshot,
  privacy/data-locality decision, context manifest, cache plan, capability,
  health, quota and price snapshots, hardware/runtime snapshot and time/TTL;
- candidate set: every considered composite route, exclusion reason for each
  rejected candidate, candidate-set hash, policy eligibility result and exact
  data classes each candidate can receive;
- prediction: quality/groundedness/reliability/latency/cost/failure-risk
  estimates, uncertainty/calibration revision and hard budget margins;
- decision: selected model/profile/effort/context/cache/bridge/agent/tool/
  machine/workflow, execution mode, fallback order and human-readable reason;
- overrides: user setting, explicit manual choice, deterministic safety/budget
  veto or incident kill switch, with neither raw secrets nor hidden prompts;
- experiment evidence: assignment unit, experiment/release/baseline IDs,
  bucket/seed, propensity or allocation rule, opt-in eligibility and exposure
  accounting, only if the policy actually explores;
- completion join: prepared-input ID, actual dispatched provider/model/effort,
  provider attempt IDs, response/request telemetry IDs, outcome class and
  successor receipt if fallback/replan occurs.

The planner may recommend, but the policy compiler enforces hard constraints.
A dispatch gateway accepts only a validated prepared-input record whose route
receipt remains fresh and authorized. Any stale capability, policy, context,
grant or budget turns into a new receipt—not a silent mutation of an old one.

### B. Policy release lifecycle

Use an immutable release record with these states:

```text
draft -> offline-evaluated -> shadow -> canary -> promoted
  -> paused | rolled-back | retired
```

Promotion requires a named baseline, redacted dataset manifest, feature schema
and transform hashes, label/reward definition, trainer/seed/environment,
objective and constraints, evaluator/fixture versions, statistical and practical
non-inferiority results, per-slice error analysis, cost/latency/reliability
budgets, rollback target, owner and approval. A release is ineligible for
promotion if any deterministic safety, citation, code-test, authorization or
privacy gate is missing.

The emergency circuit breaker is independent of the learning policy. It can
instantly pin a deterministic baseline and block new exploration, while leaving
historical decision receipts readable and reproducible.

### C. Data, feedback and deletion lifecycle

Model events become training examples only after a separate eligible-data
projection. That projection contains redaction revision, consent scope,
retention deadline, purpose, event hashes and derived-feature hashes—not raw
credentials, passwords, cookies, unrelated system keystrokes or restricted
capture contents. Feature stores must reject rows after consent expiry or a
tombstone.

Rewards must be decomposed rather than collapsed:

- deterministic task/pass/fail, citation/code/test/validator outcomes;
- quality evaluator values and evaluator independence;
- user rating/correction/undo/route override as separately consented signals;
- operational cost/latency/error/retry/fallback outcomes;
- delayed project outcome, tagged with its attribution horizon and confidence.

The system must not treat completion, absence of correction or a manual route
override as a universally positive/negative label. It must reject labels that
arrive after a branch divergence unless the declared attribution rule permits
the join.

### D. Temporal and evaluation integrity

Offline replay uses records no newer than the decision cutoff; fixtures, source
snapshots, model profiles, policy revisions and evaluation rubrics are pinned.
The train/validation/test split is grouped by user/project/conversation/branch
where leakage would otherwise occur. Time-aware splits prevent a later user
correction, retry acceptance or promoted state from influencing the historical
decision it evaluates.

When exploring, use deterministic assignment and record propensity/allocation
only for authorized quality choices. Counterfactual estimates must report
coverage, clipping, uncertainty and unsupported slices. A candidate that lacks
sufficient evidence defaults to baseline, manual selection or a documented
read-only shadow—not a speculative live route.

## Required contract changes

1. Extend `schemas/model-routing-policy.schema.json`:
   - retain public effort tiers `fast`, `balanced`, `deep`, `ultra`, `custom`;
   - constrain explicit and pool choices as implemented in this audit;
   - add policy-level references for baseline/release/kill-switch and permitted
     experiment modes, instead of inferring them from a Boolean `enabled`.
2. Add `schemas/routing-decision-receipt.schema.json` and
   `schemas/adaptive-policy-release.schema.json`.
3. Extend `schemas/request-telemetry.schema.json` with nullable IDs for routing
   receipt, decision episode, prepared input, capability/health/price snapshots,
   policy release and attribution outcome. Existing telemetry remains a compact
   projection; it must not duplicate protected planning data.
4. Extend `schemas/modality-bridge-plan.schema.json` to reference the routing
   receipt and include a policy-validity/freshness result for every remote stage.
5. Extend `architecture/adaptive-intelligence-plane.md`,
   `harness/model-routing-context-policy.md` and
   `harness/evaluations-learning-routing.md` with the lifecycle above, then add
   the new files to the manifest, harness/architecture README navigation,
   requirements registry, capability ledger and acceptance catalogue.

## Mandatory verification matrix

| Test ID | Deterministic assertion |
| --- | --- |
| DRL-T01 | The same frozen policy/settings/candidate/health/context inputs produce a byte-equivalent decision receipt excluding timestamps and IDs. |
| DRL-T02 | An explicit route lacking `modelProfileId`, and a pool route with an empty candidate set, fail schema validation. |
| DRL-T03 | Public product effort resolves to a revision-pinned provider-native parameter map; no schema/telemetry layer accepts a conflicting product tier. |
| DRL-T04 | Restricted attachment or local-only policy excludes every cloud candidate before scoring; a learned policy cannot reintroduce it. |
| DRL-T05 | Capability/health/price snapshot expiry forces the declared conservative replan and retains the first receipt as historical evidence. |
| DRL-T06 | Fallback/retry after a possible provider acceptance produces a successor receipt and honors outcome-unknown/idempotency rules. |
| DRL-T07 | Shadow mode makes no external mutation, paid model dispatch, approval consumption, cache write or provider-visible request unless explicitly simulated and budgeted. |
| DRL-T08 | Policy release promotion fails if its baseline, dataset manifest, evaluator evidence, safety slice, rollback target or consent purpose is absent. |
| DRL-T09 | Consent withdrawal tombstones examples, blocks future training, exposes affected releases and follows the declared retraining/retirement policy. |
| DRL-T10 | Retry/bridge/subagent chains attribute cost and reward once per decision episode without double-counting ancestor work. |
| DRL-T11 | Offline evaluation cannot access post-cutoff corrections, future branch state or live mutable provider metadata. |
| DRL-T12 | A kill switch immediately restores the last known-good deterministic baseline and preserves an explanatory audit trail. |

## Delivery order

1. Land the schemas and schema validators with red/green fixtures.
2. Implement a pure, deterministic constraint compiler and receipt creator;
   keep scoring models behind that compiler.
3. Join receipts to prepared input, provider attempts, bridges, subagents,
   retries and telemetry without storing secrets.
4. Build offline fixtures and deterministic replay before any online learning.
5. Implement local-only dataset eligibility, retention, tombstones, export and
   deletion receipts before training UI.
6. Add shadow mode with a zero-side-effect implementation and test it against
   provider/broker mocks.
7. Add canary/promotion, drift monitoring, independent evaluators, circuit
   breaker and rollback only after the prior gates are fresh and reproducible.

## Non-negotiable boundaries

- `Auto` never grants authority, chooses a privileged action, bypasses approval,
  evades a challenge, extracts credentials/cookies/passwords or changes a
  restricted data destination.
- No covert system-wide keylogging or training projection from hidden captures.
- A recommendation, score, LLM judge, simulated reward or generated summary is
  not proof of correctness or permission.
- Policy and training changes never rewrite historical route, cost, provider,
  consent, branch or effect evidence.

## References within the pack

- `../research/LEARNING_HARNESS_EVALUATION_PLAN.md` (counterfactual routing,
  rollout and rollback requirements);
- `../research/PROVIDER_TELEMETRY_REQUEST_PROVENANCE_RESEARCH.md` (frozen
  provenance, data classes and adaptive-routing preconditions);
- `../research/CLAUDE_CODE_HARNESS_RESEARCH.md` (auditable contextual-bandit
  starting point);
- `../omnia-ultra/harness/model-routing-context-policy.md`;
- `../omnia-ultra/goal/10-adaptive-intelligence-and-evaluation.md`.
