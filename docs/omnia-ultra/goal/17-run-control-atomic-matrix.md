---
id: OMNIA-ULTRA-GOAL-RUN-CONTROL-ATOMIC-MATRIX
title: Atomic run-control, state graph and retry goal matrix
status: normative-target
version: 1.0.0
last_reviewed: 2026-08-14
supersedes: []
requirements_registry_revision: 2026-08-14.6
---

# Atomic run-control goal matrix

This file decomposes the broad run-control request into independently
traceable contracts. The aggregate requirement remains a routing umbrella;
these atomic rows are the implementation and acceptance units.

| Atomic area | Canonical contract | Durable proof required |
| --- | --- | --- |
| State graph and CAS | `../architecture/state-revision-graph.md` | replay, watermark, stale-head conflict and branch isolation |
| Pause/checkpoint/resume | `../interaction/run-checkpoint-resume.md` | truthful disposition, checkpoint hash, restart and reconciliation |
| No-text Continue | `../interaction/continue-without-prompt.md` | planner receipt, safe authority, empty-chat bootstrap and loop guard |
| Immutable edit/retry | `../interaction/prompt-edit-state-aware-retry.md` | revision lineage, four bases, A→B current-state and billing safety |
| Active variants/compare | `../interaction/active-run-variants-compare.md` | pinned cursors, partial-output choice, CAS, compare and merge conflict |

## Non-negotiable semantics

- current state is an authorized branch revision at a durable watermark;
- accepted state is distinct from visible/candidate/unknown output;
- frozen provider input is immutable;
- every mutation has an idempotent command and immutable receipt;
- no-text Continue never invents authority or an external effect;
- Retry B sees accepted Retry A only under the selected current-state policy;
- stale state, expired approvals and unknown effects require explicit recovery;
- all surfaces read one native status model and expose disabled reasons;
- a capability is not complete until native authority, persistence, recovery,
  tests, accessibility, telemetry and evidence agree.

## Delivery order

Implement state revision/CAS and journal facts first; then checkpoint/resume;
then continuation planning; then immutable prompt/retry; then active-run
variants/compare. Connect learned routing, remote clients and self-update only
after deterministic receipts and authority gates exist.

See `00-copy-ready-prompt.md`, `16-run-control-edit-retry-state.md`,
`goal/requirements.json` and `delivery/capability-ledger.json`.
