---
id: OMNIA-ULTRA-GOAL-PROVIDER-OBSERVABILITY
title: Provider, model and request observability goal
status: normative-target
version: 1.0.0
last_reviewed: 2026-08-14
supersedes: []
requirements_registry_revision: 2026-08-14.6
---

# Provider and observability

BYOK and custom providers share one native secret boundary and one telemetry
contract. A model picker refreshes catalog, capability and health snapshots,
shows what is alive, supports clone/search/manual onboarding and preserves both
requested and effective effort. Unsupported parameters are visible and blocked
instead of silently ignored.

Every request/run/attempt records durable IDs, provider/model/profile revision,
effort, frozen input/context/parameter hashes, queue/start/first-byte/
first-provider/first-visible/last/terminal timestamps, duration, visible and
total token/s, input/uncached/cache-read/cache-write/output/reasoning/visible
tokens, RPM/TPM/quota source, retry/fallback/outcome-unknown, estimated cost,
provider report, invoice and redacted trace lineage. Missing values are
`unknown`, never fabricated zeroes. The inspector expands the active request by
default and collapses completed requests while retaining drill-down details.

Retry policy is typed: 400/401/402/403 require repair or explicit user action;
429 honors `Retry-After` and safe backoff; 500/502/timeout/transport retry only
when acceptance and billing evidence allow it. Every retry shows the originating
error, attempt, countdown, next action, idempotency/acceptance evidence and
Stop/Retry-now/change-provider/change-model/repair controls. AI repair advice
cannot silently mutate intent or duplicate a billable request.

See `../observability/request-usage-telemetry.md`,
`../observability/cost-usage-analytics.md`,
`../observability/model-picker-health-profiles.md`,
`../observability/retry-fallback-repair.md` and
`../observability/logs-traces-debug.md`.
