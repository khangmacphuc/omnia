# ADR 0005: Local-first telemetry and an append-only usage ledger

- Status: Accepted as an architecture contract; native persistence and UI are not yet complete
- Date: 2026-08-13
- Owners: Omnia Kernel, Provider Gateway, Storage, Observability, UI
- Depends on: ADR 0002 unified kernel execution, ADR 0004 durable run-event journal

## Context

Omnia must help a user improve provider choice and harness quality with evidence,
not decorative dashboard numbers. The product needs to explain, at minimum:

- queue, context compilation, approval, request upload, first byte, first provider
  output, first visible output, first complete item, last visible output, terminal,
  cancellation and recovery latency;
- input, cache-read input, cache-write input, output, reasoning and visible-output
  tokens without assuming one provider's accounting taxonomy;
- estimated, provider-reported and invoiced cost with a frozen price/formula
  receipt;
- RPM, TPM, concurrency and quota-window headroom without inventing limits when
  a provider does not report them;
- provider health by authentication, authorization, billing, DNS, TLS,
  transport, protocol/schema, streaming, model availability and rate limits;
- context compilation, retrieval, memory, skill, tool, subagent, validation,
  artifact and checkpoint efficiency;
- the provider attempt, iteration, item, tool/subagent and frozen route to which
  each fact belongs.

The current database projects token totals onto the assistant message and stores
some timestamps on `generations`. That projection cannot preserve retries,
fallbacks, provider corrections, provisional/final usage, cost provenance,
provider health, tool waits or subagent efficiency. It also cannot distinguish
"not reported" from zero.

Telemetry itself can be sensitive. Trace correlation, timing, model choice,
token counts, file/result sizes, tool names, error classes and provider health
may reveal behavior even without raw prompts. Raw prompts, model responses,
reasoning, credentials, auth headers, cookies, filesystem paths and tool payloads
must not silently enter an analytics pipeline.

## Decision

### 1. Local-first and content-free by default

Omnia v1 collects operational telemetry locally by default. Remote export is
off by default and is a separate explicit policy. The telemetry contract cannot
contain prompt text, response text, reasoning content or raw tool payloads.

The default policy is:

```text
collection = local
remote export = off
raw retention = 30 days
aggregate retention = 365 days
provider numeric counters = enabled
prompt/response/reasoning/tool content = structurally disabled
```

Changing retention or enabling a bounded operational export does not grant
access to content. Diagnostics that need content use an independent,
user-reviewed support-bundle workflow with a preview and explicit redaction;
they are not telemetry.

### 2. Journal facts first, project metrics second

Every durable run fact is appended before it is emitted to a renderer. The run
event journal remains the lifecycle truth. Telemetry tables retain structured
measurements referenced by journal events. Query-time or maintained projections
produce dashboards and percentiles.

```text
runtime/provider/tool fact
  -> validate and redact
  -> append run event + measurement + affected projection in one transaction
  -> commit
  -> publish by durable journal cursor
  -> aggregate asynchronously from committed facts
```

Dashboards and OpenTelemetry export are projections, never the sole source of
truth. Export failure cannot block or corrupt a run.

### 3. Usage is an append-only ledger

Usage observations are immutable and scoped to one logical run and, when
provider-authored, one provider attempt. The ledger accepts these source types:

```text
local-estimate
provider-incremental
provider-final
provider-invoice
user-correction
```

A final provider correction may be lower than a provisional event. Omnia keeps
both facts and records a `supersedes` edge. It does not force counters to be
monotonic across observations and does not overwrite history.

Provider-authored usage requires a hashed remote response/event identity. Raw
remote request IDs may remain in a restricted diagnostic record but are never a
metric label. Retry and fallback attempts have independent usage; a logical-run
total is a derived sum over the selected attempt facts.

Normalized counters are intentionally separate:

```text
input_tokens
cache_read_input_tokens
cache_write_input_tokens
output_tokens
reasoning_tokens
visible_output_tokens
```

Missing is `NULL`/unknown, never zero. Provider-specific numeric counters are
retained under lowercase qualified keys such as `anthropic.cache_creation_input_tokens`.
Arbitrary provider strings are bounded diagnostic data, not metric dimensions.

### 4. Cost statements preserve multiple truths

Estimated, provider-reported and invoice costs are not mutually destructive.
Each cost statement includes:

- kind and cost component;
- integer microunits and currency;
- for calculated estimates: frozen price snapshot ID/hash and formula version;
- observation time and attempt/run lineage.

The UI can show estimate, provider report and invoice reconciliation side by
side. Unknown pricing stays unknown. A later catalog update never changes the
historical cost of an existing run.

### 5. Timing uses monotonic offsets

Durations use a monotonic clock in one process/clock domain. A wall-clock anchor
exists only for display and cross-record ordering. The contract records named
milestones rather than one ambiguous `latency` number:

```text
dispatch started
request committed
first byte
first provider output
first reasoning output
first visible output
first complete item
last visible output
terminal
```

Derived measures include request-upload time, TTFB, time to first provider
output, time to first reasoning, TTFT/first visible output, TTFM/first complete
item, visible generation duration, total attempt duration and visible tokens per
second. Hidden reasoning must not be presented as visible TTFT or visible output
throughput.

Queue, context compilation, approval, provider backoff, tool wait and renderer
backpressure are recorded separately so optimization targets the real bottleneck.
Clock-domain changes, sleep/resume and crash recovery create a new sample or
partial-coverage marker; Omnia does not subtract unrelated wall clocks.

### 6. Provider health is typed, scoped and freshness-bound

Provider health is not a single online/offline boolean. Each observation has a
dimension, outcome, typed error class, optional latency and optional quota
window. Health is projected separately for a provider connection and optionally
a model profile.

Critical fresh failures such as rejected authentication, authorization, billing,
protocol or model availability can mark the route unavailable. Rate-limit
degradation remains distinguishable from bad credentials. Stale data or too few
samples yields `unknown`, not healthy.

RPM/TPM and concurrency UI is based on explicit quota windows:

- provider headers/API values may be authoritative;
- configured limits are declared rather than measured;
- inferred values are always non-authoritative;
- `remaining`, `resetAt`, window and source are shown together;
- absence of a limit is not rendered as unlimited.

Active probes are conservative, user-visible and budgeted. Omnia prefers passive
observations and provider-supported health/catalog endpoints. It does not send
expensive hidden model prompts merely to keep a green health badge.

### 7. Harness operation spans cover tools and agents

Context compile, retrieval, memory read, skill load, approval wait, tool call,
subagent run, validation, artifact build and checkpoint operations have typed
records with:

- run/attempt/iteration/item lineage and optional parent span;
- outcome and duration;
- queue and approval wait;
- bounded item/byte counts;
- mutation count;
- cache outcome;
- verification outcome;
- bounded content-free details.

Subagent efficiency is derived from child spans and child usage, never from
display names. Suggested measures include successful child completion, useful
output promoted to the parent, verification pass rate, duplicated context,
wait/queue ratio and cost/token/time consumed. Learned routing may use these
quality/performance projections offline or in shadow mode, but it cannot alter
permission, approval, secret, isolation or security policy.

### 8. Cardinality and privacy rules

Trace records may carry opaque run/attempt/item IDs for local inspection.
Metrics use a bounded allowlist of dimensions such as provider type, capability,
model profile bucket, operation kind, outcome and error class. Metrics must not
label by:

- run, conversation, project, user, prompt, URL, path or raw model ID;
- remote request ID;
- tool arguments, error text or arbitrary provider fields.

Unknown provider/model values map to an explicit bounded bucket. Diagnostic
strings are length-bounded, locally retained and excluded from metrics.

### 9. Recommended storage target

The migration version must be chosen only after the active schema-v4 attachment
migration is accepted. Do not append these tables under the same migration
marker. The target typed schema is:

```text
run_timing_observations
run_usage_ledger
run_cost_statements
provider_health_observations
provider_quota_windows
harness_operation_observations
telemetry_export_checkpoints
telemetry_daily_rollups
```

Every table has a schema version, strict size/range checks, exact run/attempt
lineage guards, observation time, provenance and retention class. Provider
attempt usage and timing must reference `run_attempts`. Journal event and
projection mutations occur transactionally. Raw tables are deletable according
to retention while rollups retain only bounded aggregate dimensions.

The assistant-message token columns remain transitional materialized projections
for UI compatibility. They must be rebuilt from the ledger and cannot become a
second writable source.

### 10. Inspector and dashboard truthfulness

The run inspector shows data for the exact run and attempt. It labels:

- Reported, Estimated, Invoiced, Partial, Unknown and Stale;
- visible output separately from reasoning;
- retry/fallback attempts independently;
- percentiles with sample count and time window;
- provider/model health with the failing dimension;
- quota source and reset time;
- measurement gaps and clock/recovery coverage.

The product must not render fabricated sample charts. Empty history uses an
honest empty state. User-facing aggregate views include a drill-down to the
source runs/attempts when local retention still permits it.

## Denial, migration and fault gates

No telemetry persistence or dashboard is complete until tests cover:

1. timing milestones cannot move backwards and unrelated clock domains are not
   subtracted;
2. hidden reasoning does not reduce visible TTFT or inflate visible TPS;
3. provider usage without exact attempt and hashed response identity is denied;
4. final usage may correct provisional usage downward without losing either fact;
5. retry/fallback usage is never attributed to the wrong attempt;
6. missing counters and pricing remain unknown rather than zero;
7. calculated cost without price snapshot/hash/formula is denied;
8. estimated, reported and invoice costs remain independently inspectable;
9. auth, rate-limit, schema/protocol and transport health stay distinct;
10. stale or statistically insufficient health becomes unknown;
11. inferred quota is never authoritative;
12. unqualified/arbitrary provider counters and high-cardinality metric labels
    are rejected;
13. tool/subagent wait cannot exceed its total duration;
14. raw prompt, response, reasoning, secret, auth header, path and tool payload
    fixtures cannot cross the telemetry DTO/persistence/export boundary;
15. event, usage/timing record and projection update roll back together on fault;
16. duplicate provider event identity is idempotent only when the normalized fact
    is identical;
17. crash/restart and renderer reconnect replay usage/terminal facts by cursor;
18. v4-to-telemetry migration preserves existing conversations/runs and rolls
    back entirely on conflict;
19. `integrity_check`, `quick_check`, `foreign_key_check`, retention and rollup
    rebuild tests pass;
20. disabled or failing export never blocks local runs and resumes from a durable
    export checkpoint without duplicate external spans.

## Consequences

This design costs more storage and implementation effort than overwriting token
totals on a message. It prevents silent accounting drift, supports reliable
provider/harness comparison, and preserves enough provenance for later quality
evaluation and safe adaptive routing.

The new TypeScript domain contract is implemented in `src/domain/telemetry.ts`
with focused denial tests. Native storage, provider-gateway instrumentation,
OpenTelemetry export, retention jobs and production UI remain separate delivery
slices and must not be advertised as shipped until their gates pass.

