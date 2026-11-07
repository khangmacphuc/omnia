---
id: OMNIA-ULTRA-GOAL-REQUEST-INSPECTOR-RECOVERY
title: Request inspector and recovery contract
status: normative-target
version: 1.0.0
last_reviewed: 2026-08-14
supersedes: []
requirements_registry_revision: 2026-08-14.6
---

# Request inspector and recovery contract

The inspector is a forensic, user-readable projection of durable facts. It is
not a debug mock and it never fills missing telemetry with zeroes. Each screen
must distinguish provider-reported, locally observed, calculated, estimated,
partial, unavailable, stale and final/invoice values.

## Identity and frozen configuration

Every request summary exposes a request ID, run ID, iteration ID and attempt
ID plus conversation, project/task, branch, prompt revision and context
revision. It shows provider profile/configuration revision, model ID/profile
revision, requested and effective effort, actual validated advanced parameters,
tool/context policy, runtime/machine/sandbox, approval state, agent/workflow
and frozen input/context/parameter hashes. Redacted log/trace/artifact/source
links are available only through their own permission policy.

The active request is expanded by default. Historical requests are collapsed
but show model, effective effort, lifecycle state, duration, known token
summary, cost coverage, attempt count and visible error/retry state. Thinking
and tool sections default collapsed. Omnia may expose provider-supplied
reasoning or an Omnia-authored structured progress summary, but never hidden
chain-of-thought or raw private reasoning.

## Time, token, quota and cost definitions

The following are separate optional observations, never interchangeable
guesses: created, queued, context-preparation start/end, approval wait,
dispatch start, provider accepted, outcome unknown, first byte, first provider
output, first provider reasoning output, first visible output, last visible
output, terminal, retry wait, tool duration and agent wait. Duration badges
state their endpoints and clock domain.

Input, uncached input, cache-read, cache-write, output, reasoning, visible
output, multimodal, tool, subagent-sent and subagent-returned units retain
their provider/local provenance and coverage. Visible token/s and total token/s
are shown only when a compatible numerator and timing denominator are present;
otherwise they are `Unavailable` with the missing dependency. Inter-token
latency, stall count and longest stall follow the same rule.

RPM/TPM must show limit, used, remaining, reset time, source and freshness. A
provider catalog or health refresh is not a quota observation. Cost rows keep
input, cache, output, reasoning, tool/search, media, subagent, retry/fallback,
estimated, provider-reported and invoice amounts separate, with currency,
price snapshot/formula revision and reconciliation state. No final/invoice
cost appears until a final source actually exists.

## Failure, retry and outcome-unknown

The request card renders the original failure immediately, alongside its error
classification, safe retry decision, attempt number, next retry time/countdown,
`Retry-After` evidence, idempotency/acceptance/billing-safety state and scoped
controls: Stop, Retry now, inspect, change model/provider, repair payload or
prompt, and request user action. Invalid request/auth/quota/permission/security
errors are not blindly retried. A cancelled request is terminal unless the user
creates an explicit new operation.

The default retry cadence is configurable and starts at 1 s, 3 s, 5 s, 10 s,
15 s, 30 s, 60 s, 120 s, 300 s, 600 s and 900 s with bounded jitter. The
default maximum elapsed retry horizon can be 24 hours, but a waiting retry
continues only while its policy, budget, approval and idempotency conditions
remain valid. 429 honors a valid `Retry-After`; 500/502/503/504 and transient
network errors require acceptance and billing evidence; timeout/truncated
stream/connection reset/DNS/TLS errors may become `outcome-unknown` rather than
being mislabelled as safe failure.

The AI retry controller may propose exact retry, wait, concurrency reduction,
fallback, context compression, attachment splitting, capability bridge,
payload repair, a follow-up prompt, user question or stop. Semantic repair is
always a reviewable diff, never a silent intent change. Repeated retry loops
must emit an explainable stop reason rather than consuming budget invisibly.

## Model picker and parameter provenance

Model selection opens cached known profiles immediately, refreshes catalog and
health in the background, and displays the check time, source, compatibility,
status and freshness. Profiles can be cloned from a verified model, matched by
policy, proposed by an advisor, searched through documented official sources
or entered manually. New profiles remain provisional until tested; unsupported
parameters are visible and blocked, not silently dropped.

Ultra effort is a workflow profile: strongest supported provider settings plus
planning, research, critique, verification and completion judgement. It always
records requested and effective effort and which provider-native controls were
actually sent. Automatic routing cannot conceal a provider/model change; the
inspector records the policy, decision inputs, confidence and override path.

## Test and privacy gate

Tests cover exact run/attempt/profile scope, malformed input, stale/native
session rejection, bounded response size, unknown versus zero, incremental
usage selection without double counting, error redaction, retry transition,
outcome-unknown, model-profile compatibility and inspector accessibility.
Renderer DTOs structurally exclude prompt/response/reasoning content, raw
remote identifiers, credentials, headers, cookies, filesystem paths and raw
tool payloads. See `../observability/README.md` and its request lifecycle,
usage, cost, retry, model-health and logs/trace contracts.
