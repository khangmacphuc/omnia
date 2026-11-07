---
id: OMNIA-ULTRA-OBS-USAGE
title: Token, throughput, quota and request usage
status: normative-target
schema: schemas/request-telemetry.schema.json
---

# Request usage telemetry

## Required fields

### Identity/configuration

- request, run, iteration and attempt IDs;
- provider and provider configuration revision;
- model and model profile revision;
- requested effort and effective effort if provider reports it;
- parameter profile and resolved parameters;
- prompt/context/attachment revision;
- agent/workflow/machine/environment;
- branch and project;
- privacy and approval policy.

### Tokens

- input_tokens;
- uncached_input_tokens;
- cache_read_input_tokens;
- cache_write_input_tokens;
- output_tokens;
- reasoning_tokens;
- visible_output_tokens;
- multimodal input units;
- tool input/output units;
- transferred-to-subagent tokens;
- returned-from-subagent tokens;
- context compaction loss;
- estimated, provider-reported and invoiced source.

Missing is unknown, never zero.

Provider error classes are an allowlisted taxonomy, not free-form provider
text. The canonical values are `authentication`, `authorization`, `billing`,
`rate-limit`, `quota`, `dns`, `tls`, `transport`, `timeout`, `protocol`,
`schema`, `model-unavailable`, `content-policy`, `cancelled`, and `unknown`.
Native persistence and renderer constructors must reject unknown, case-folded,
underscore, or provider-specific aliases; raw provider error text belongs only
in bounded native diagnostics and must not become a telemetry classification.

### Throughput

Report separately:

- visible_output_tokens_per_second =
  visible_output_tokens / visible_generation_seconds;
- provider_output_tokens_per_second when provider supplies it;
- total_generated_tokens_per_second;
- average inter-token latency;
- p50/p95 inter-token latency;
- stall count and longest stall.

If denominator or token class is unknown, show unavailable with reason. Do not call
hidden reasoning throughput visible throughput.

### Quota

- RPM limit/used/remaining;
- TPM limit/used/remaining;
- concurrency limit/used/remaining;
- reset time;
- Retry-After;
- source: provider header, provider API, configured, inferred or unknown;
- freshness timestamp.

A missing limit is unknown, not unlimited.

### Timing

- created_at;
- queued_at;
- started_at;
- first_byte_at;
- first_provider_output_at;
- first_visible_output_at;
- last_visible_output_at;
- completed_at;
- duration_ms;
- queue_ms;
- preparation_ms;
- provider_ms;
- tool_ms;
- retry_wait_ms;
- total_wall_ms.

### Cost

- input cost;
- cached-input cost;
- output cost;
- reasoning cost;
- image/audio/video cost;
- tool/search cost;
- subagent cost;
- retry/fallback cost;
- estimate;
- provider-reported;
- invoice;
- currency;
- price snapshot;
- formula revision;
- unknown/partial flag.

## UI

The sidebar has Context, Usage, Cost, Provider, Model, Effort, Parameters,
Thinking, Tools, Sources, Artifacts, Retry, Logs, Trace and Evaluation tabs.
The current request expands these panels by default; older requests collapse them.
