---
id: OMNIA-ULTRA-DELIVERY-RESEARCH-DECISIONS
title: Research-derived design decisions
status: research-derived
last_reviewed: 2026-08-14
---

# Research-derived decisions

This file records how public/official research is transformed into Omnia-owned
contracts. It is not a license to copy product visuals or private prompts.

## Codex Manual and official Codex source

Observed design implications:

- thread/turn/item protocols make lifecycle observable;
- fork and steer need exact source/active-turn identity;
- model/effort overrides belong to a turn or run;
- background terminal and agent inspection need durable references;
- token/usage categories should be per turn and provider attempt;
- app-server protocols need pagination, resume and cursor semantics.

Omnia decision:

- durable run/turn/item model;
- expected-active-run check for steer;
- immutable frozen input;
- branch/fork source cursor;
- request inspector and usage ledger;
- reconnectable clients.

## Anthropic public agent documentation

Observed design implications:

- fresh subagents and fuller context forks are distinct;
- background sessions need attention grouping;
- peer teams need task board/mailbox semantics;
- context window and cost trade-offs affect primitive choice.

Omnia decision:

- typed execution primitives, not one Agent type;
- explicit ContextTransferManifest;
- separate background, side-question, team and workflow worker surfaces;
- stable agent instance IDs.

## OpenHands public SDK/Canvas material

Observed design implications:

- conversation fork can deep-copy state while preserving source;
- pause/resume and sending a message while running are first-class operations;
- critic/review can trigger refinement but is not deterministic proof.

Omnia decision:

- fork/branch/side-question/steer are separate commands;
- checkpointed pause/resume;
- independent completion judge;
- deterministic evidence remains stronger than model score.

## OpenAI Agents SDK

Observed design implications:

- traces cover generation, tools, handoffs, guardrails and custom events;
- handoff is distinct from a normal function call;
- guardrails may attach to different transition types.

Omnia decision:

- provider-neutral attribution tree;
- typed handoff package and input filter;
- guardrail coverage per transition;
- local durable trace before optional export.

## OpenTelemetry GenAI conventions

Observed design implications:

- common span attributes help interoperability but are evolving;
- prompt/response content and high-cardinality identifiers need privacy care.

Omnia decision:

- internal schema is versioned and authoritative;
- optional OTel projection is bounded/content-minimized;
- raw content never becomes a metric label;
- absent usage remains unknown.

## Provider telemetry and request provenance

Observed design implications:

- provider usage can arrive as incremental stream observations, a final
  response, a later administrative aggregation, or an invoice statement;
- providers expose different cache, reasoning, modality, tool, search, and
  billing counters, and compatible transports do not make those meanings
  interchangeable;
- model discovery, authentication, quota, route health, and successful
  inference are separate observations;
- request identifiers and error headers help restricted diagnostics but are
  not safe renderer fields or unbounded metric dimensions;
- token throughput is meaningful only with a named numerator, denominator,
  timing boundary, and coverage statement.

Omnia decision:

- freeze provider, model, effort, translated parameters, adapter revision,
  capability snapshot, context snapshot, and route decision per attempt;
- preserve immutable attempt-scoped observations and use explicit
  supersession/reconciliation rather than mutating one total;
- expose a dedicated bounded, content-free renderer DTO instead of storage
  records or raw provider payloads;
- keep estimates, provider reports, and invoice reconciliation as parallel
  cost and usage statements with authority labels;
- keep timing, TTFT, throughput, RPM/TPM, quota, health, cache-write, visible
  output, and final cost unknown until the native system records their exact
  evidence;
- distinguish retryable transport/provider conditions from authentication,
  permission, invalid-request, quota, policy, and outcome-unknown states;
- use `docs/research/PROVIDER_TELEMETRY_REQUEST_PROVENANCE_RESEARCH.md` as the
  detailed source-backed design input for inspector and usage-ledger work.

## Provider cache, local reuse and compaction

Observed design implications:

- providers use different implicit prefix caches, explicit cache breakpoints,
  provider cache resources/handles, TTLs and usage/cost counters;
- repeated exact prefixes and stable block/tool/schema ordering commonly affect
  provider cache eligibility, while local semantic reuse alone does not prove a
  provider cache hit;
- provider-native compacted/context state is API/model specific and cannot be
  treated as a provider-neutral transcript summary;
- context minimization can reduce sent tokens but may trade off against a warm
  provider prefix, so both effects need measured provenance.

Omnia decision:

- separate content-addressed local cache, retrieval/context compilation cache,
  provider-native cache and optional response reuse into distinct typed layers;
- accept provider cache/billing evidence only from adapter-validated provider
  fields and preserve missing values as unknown;
- freeze a provider cache plan per attempt with prefix segments, controls,
  capability snapshot, TTL and invalidation dependencies;
- make compaction an immutable context revision/checkpoint with fidelity tests,
  source/citation survival and rollback;
- use `docs/research/PROVIDER_CACHE_CONTEXT_OPTIMIZATION_RESEARCH.md` as the
  detailed official-source input for cache/context work.

## Microsoft Windows automation and capture

Observed design implications:

- UI Automation is semantic and often works without the physical cursor;
- Graphics Capture has source and rendering constraints;
- input injection has explicit platform boundaries;
- minimized applications may stop producing useful pixels.

Omnia decision:

- semantic UIA/DOM/CDP first;
- target-contained virtual pointer;
- isolated desktop/virtual display/VM fallback for rendering;
- truthful unsupported state instead of promising universal minimized capture;
- physical input only with explicit opt-in.

## Provider error and usage docs

Observed design implications:

- providers expose different usage fields and rate-limit metadata;
- 429 retry timing may be available in headers;
- cached input, reasoning and visible output are not universal fields.

Omnia decision:

- normalized schema with provider-specific extension fields;
- estimates, provider reports and invoices remain separate;
- Retry-After is honored;
- retry/fallback decisions are durable and billing-aware;
- UI displays unknown rather than inventing values.

## Clean-room rule

Use behavior classes, contracts and failure modes from research. Create Omnia-owned
names, icons, copy, geometry, animations and source implementation. Pin source
revision and retrieval date for any claim that influences a release decision.
