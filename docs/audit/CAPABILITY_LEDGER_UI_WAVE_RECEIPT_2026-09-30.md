---
id: OMNIA-AUDIT-CAPABILITY-LEDGER-UI-WAVE-2026-09-30
date: 2026-09-30
status: renderer-partial
scope: capability-ledger-wave-audit
---

# Capability ledger UI wave receipt

This receipt records the evidence review performed on September 30, 2026 for
the cache/context, routing, telemetry, local-model, adaptive-learning and agent
orchestration slices currently present in the Omnia worktree.

The ledger uses `partial` for a capability when a user-visible renderer/domain
slice and focused tests exist, while authoritative native/provider/runtime
behavior is still absent or unverified. No capability in this receipt is
promoted to `verified`, `wired`, or `shipped`.

## Evidence matrix

| Capability | Renderer/domain evidence | Focused tests or checks | Boundary that remains explicit |
|---|---|---|---|
| `OMNIA-CAP-CLIENT-PROVIDER-CACHE` | `cache-context-routing-contract.ts`, `cache-context-routing-preview.tsx` | `cache-context-routing-contract.test.ts`, `cache-context-routing-preview.test.tsx`; cache contract checks cover unknown provider evidence, invalid counters, stable-prefix estimates and encryption-boundary labeling | No native cache store/key lifecycle, provider cache handle, provider billing evidence, or durable policy write |
| `OMNIA-CAP-MAIN-SUBAGENT-MODEL-ROUTING` | `role-routing-preview-contract.ts`, `role-routing-preview.tsx`, `routing-workbench.tsx`, `adaptive-auto-routing-learning-preview.tsx` | `role-routing-preview-contract.test.ts`, `role-routing-preview.test.tsx`, `routing-workbench.test.tsx`, `adaptive-auto-routing-learning-preview.test.tsx`; route readiness remains fail-closed for unavailable/degraded candidates | No native route resolver, provider dispatch, learned-policy promotion, agent lease, or durable routing receipt |
| `OMNIA-CAP-CONTEXT-DELIVERY-COMPACTION` | `context-preflight-preview.tsx`, `context-compiler-preview.tsx`, `project-policy-summary.tsx` | `context-preflight-preview.test.tsx`, `composer-context-preflight.component.test.tsx`, `project-policy-summary.test.tsx`; delivery modes and token/cost/latency thresholds are renderer controls | No native frozen context manifest, provider-input binding, compaction trigger, checkpoint, or fidelity authority |
| `OMNIA-CAP-TELEMETRY-TIMESERIES` | `observability-preview.tsx`, `observability-evidence-dashboard.tsx` | `observability-preview.test.tsx`; metric labels include TPS/TPM/RPS/RPM/visible characters-per-second/cost rates and bounded day/week windows | Values are synthetic/renderer-visible; no native time-series query engine, authoritative anchors, billing, quota, or provider timing ledger |
| `OMNIA-CAP-ADAPTIVE-INTELLIGENCE` | `adaptive-auto-routing-learning-preview.tsx`, `learning-loop-lab.tsx`, `data-intake-learning-review.tsx` | `adaptive-auto-routing-learning-preview.test.tsx`; explicit observe/recommend/promotion-review modes, signal allowlist and reversible controls are visible | No raw-keystroke capture, hidden collection, model training, online adaptation, durable dataset, or policy promotion |
| `OMNIA-CAP-AGENT-SWARM` | `agent-orchestration-prompt-preview.tsx`, `agent-dag-orchestration-preview.tsx`, `agent-mesh-supervisor-preview.tsx` | `agent-orchestration-prompt-preview.test.tsx`, `agent-dag-orchestration-preview.test.tsx`; graph diagnostics and prompt-derived role planning are deterministic renderer projections | No native spawn/scheduler, lease/mailbox/checkpoint, provider request, filesystem write, or durable agent receipt |
| `OMNIA-CAP-LOCAL-MODEL-CATALOG-TUNING` | `local-model-catalog-preview.tsx`, `local-model-readiness-preview.tsx` | `local-model-catalog-preview.test.tsx`, `local-model-readiness-preview.test.tsx`; filtering, compare, fit/readiness gates, import/export rehearsals are bounded | No network catalog query, filesystem scan, download, license/hash verification, runtime launch, benchmark, or installed local portfolio |

## Verification posture

- Renderer typecheck/build and focused interaction suites are the relevant
  evidence for this wave; they do not establish native Tauri behavior.
- Existing native/provider rows remain `partial` or `planned` where their
  receipts are incomplete, and are not inferred from renderer previews.
- `unknown`, `not observed`, `degraded`, and `unavailable` states remain
  fail-closed. Synthetic metrics and seeded catalogs are labeled as such.
- User-managed cache planning is not relabeled as provider-native cache, and
  renderer Auto routing is not relabeled as learned routing.
- The adaptive-learning surfaces intentionally exclude covert keylogging,
  raw keystroke capture, secret collection and hidden system-wide observation.

## Follow-up required before promotion

1. Bind each renderer projection to the authoritative native contract and
   persist the exact revision/receipt used for dispatch.
2. Add provider capability probes, request/response usage, cache accounting,
   timing, quota, retry and cost observations before claiming telemetry or
   provider-native cache behavior.
3. Add consented dataset manifests, evaluation/safety gates, rollback and
   retention/export/delete controls before claiming adaptive intelligence.
4. Add agent lifecycle leases, mailbox/checkpoint recovery and authority
   attenuation before claiming agent execution.
5. Add verified catalog federation, hash/license gates, downloads, runtime
   probes and measured benchmarks before claiming local-model readiness.

