---
id: OMNIA-ULTRA-GOAL-TELEMETRY-DATA-SAFE-LEARNING
title: Comprehensive telemetry, analytics and safe learning data goal
status: normative-target
version: 1.0.0
last_reviewed: 2026-08-14
supersedes: []
requirements_registry_revision: 2026-08-14.6
---

# Comprehensive telemetry, analytics and safe learning data

Every policy-eligible request, model route, context/cache/compaction decision,
agent/tool action, file/artifact transform, error/retry, setting revision,
evaluation and user-visible interaction must have typed traceable data. Missing
values state why they are unavailable. Data is used for debugging, quality,
cost, routing, context optimization, product research and personalization only
through declared consumers and evaluation/rollback policy.

The analytics workbench exposes TPS/TPM, RPS/RPM, explicit cost/s, cost/min and
cost/hour, token/cache/cost breakdowns, latency distributions, cache/retrieval/
compaction/model-route metrics, quality/evaluation and system-resource metrics.
Ambiguous abbreviations such as CPS are expanded to an exact metric and unit.

Time windows include 30 minutes; 1, 2, 3, 5, 6, 8, 10, 12 and 24 hours; 1, 2,
3 and 5 days; 1 week; and arbitrary custom ranges. Either boundary can anchor
to now, a prompt/request/attempt/message/chat/branch, model switch, error/retry,
checkpoint, agent/task, artifact, commit/build/test or bookmark. Aggregations,
percentiles, histograms, moving averages, anomalies, comparisons and filters
remain source/coverage aware.

“Record all data” means complete coverage of **allowed, classified data**, not
credentials or covert surveillance. Omnia can record opt-in interaction events
inside its UI or an explicit targeted capture session and can preserve draft
revision history when enabled. It must not install a covert system-wide
keylogger, record raw keys from unrelated applications, capture passwords or
monitor the machine without a visible scoped session. Users control collection,
retention, sampling, local/export scope, pause, export and secure deletion.

Raw data, rollups, immutable audit receipts and training datasets remain
distinct. Collection never automatically implies training; training never
automatically implies deployment. Every adaptive consumer records feature
schema, dataset manifest, baseline, evaluation, drift and rollback.

See `../observability/telemetry-timeseries-analytics.md`,
`../architecture/adaptive-intelligence-plane.md`,
`../security/hard-boundaries.md` and
`../schemas/telemetry-analytics-query.schema.json`.
