---
id: OMNIA-ULTRA-OBS-TELEMETRY-TIMESERIES
title: Telemetry time-series analytics and anchor queries
status: normative-target
last_reviewed: 2026-08-14
---

# Telemetry time-series analytics and anchor queries

Omnia records all policy-eligible operational data needed for debugging,
evaluation, routing and product improvement, while explicitly excluding secret
material and covert surveillance. Every metric has an unambiguous namespace,
unit, source, scope, formula, coverage and freshness.

## Metric namespaces

- `tokens.generated_per_second`, `tokens.input_per_minute`,
  `tokens.cache_read_per_minute`, `tokens.cache_write_per_minute`;
- `requests.per_second`, `requests.per_minute`, accepted/retried/failed/
  outcome-unknown rates and concurrency;
- `cost.currency_per_second`, `cost.currency_per_minute`,
  `cost.currency_per_hour` and per-request/project/agent totals;
- `characters.visible_per_second` as a separate named display metric rather
  than an ambiguous `CPS` label;
- queue, context compile, cache, provider, tool, agent, approval, retry and
  total latency distributions;
- cache hit/miss/write/read, bytes/tokens avoided, prefix stability, TTL and
  invalidation;
- retrieval precision/grounding, context inclusion, compaction fidelity,
  model-route outcome, user correction and test/artifact quality;
- system CPU/GPU/RAM/VRAM/disk/network/thermal observations when collected by
  an explicit local performance policy.

UI shorthand such as TPS, TPM, RPS, RPM, cost/s, cost/min and cost/hour always
expands to its exact metric/unit on hover, keyboard focus and export.

## Time windows and anchors

Presets include 30 minutes; 1, 2, 3, 5, 6, 8, 10, 12 and 24 hours; 1, 2, 3
and 5 days; and 1 week. Users can define arbitrary absolute or relative
windows, time zone, bucket size and comparison period.

Either boundary can be pinned to `now`, a prompt, request/run/attempt, message,
conversation, branch/fork, model/provider switch, retry/error, checkpoint,
agent/task, artifact, commit/build/test or user bookmark. The opposite boundary
can be a duration, another anchor or a custom timestamp. The query stores
anchor IDs and resolution status so a deleted/stale object is not silently
replaced with a different time.

## Aggregation and analysis

Queries support count, sum, min/max, mean, median, p50/p75/p90/p95/p99,
histogram, rate, cumulative total, moving average, exponential smoothing,
change point, anomaly, baseline comparison and correlation. Dimensions include
provider, model/profile/effort, main/subagent/role, project/conversation/branch,
task/workflow/skill, cache/context/compaction mode, tool, runtime/machine,
error/retry/fallback and data-locality policy.

Dashboards show raw observations and rollups separately, with partial/final/
estimated/provider/invoice coverage. Downsampling retains count/sum/min/max and
quantile-sketch provenance; audit receipts and billing reconciliation are not
discarded merely because a dashboard rollup expires.

## Event and trace completeness

Eligible user-visible actions, native commands, provider attempts, context
decisions, cache operations, agent handoffs, tool effects, errors, retries,
settings revisions, model/profile changes, artifacts and evaluation results
receive typed events and trace linkage. Unknown or unavailable data records a
reason such as not-collected, unsupported, permission-denied, redacted,
sampling-excluded, expired or integrity-failed.

High-cardinality content and raw provider payloads do not become metric labels.
Prompt/response/file content is linked through restricted content IDs and
classification rather than copied into general analytics.

## Safe interaction learning boundary

Omnia may collect opt-in interaction telemetry inside its own UI or an explicit
targeted capture/control session: command/action IDs, focus transitions,
accepted/dismissed suggestions, edit/undo counts, latency, accessibility path,
target role/category and derived navigation patterns. Password fields, secret
values and protected content are excluded.

Omnia does not install a covert system-wide keylogger, record raw keys across
unrelated applications, capture credentials or monitor the user's machine
without a visible scoped session. A user may explicitly opt into draft-revision
history inside an Omnia composer; even then secret detection/redaction,
retention, pause, export and delete controls apply.

Computer-use learning uses authorized UIA/DOM/CDP actions, target-scoped screen/
audio observations and explicit takeover signals. It stores derived training
features where possible and raw media only under a separate retention grant.

## Governance

Users configure collection classes, raw/rollup retention, encryption,
sampling, local-only versus approved export, storage budgets, scheduled
training/evaluation, pause, per-project exclusion and secure deletion. Every
adaptive consumer declares which metrics/features it reads and its last
evaluation/rollback state. Data collection does not imply automatic training,
and training does not imply deployment.

See `../schemas/telemetry-analytics-query.schema.json`,
`request-usage-telemetry.md`, `logs-traces-debug.md`,
`../architecture/adaptive-intelligence-plane.md` and
`../security/hard-boundaries.md`.
