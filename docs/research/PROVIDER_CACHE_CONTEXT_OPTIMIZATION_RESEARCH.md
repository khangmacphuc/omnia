---
id: OMNIA-RESEARCH-PROVIDER-CACHE-CONTEXT-2026-08-14
title: Provider cache and context optimization research
status: research-current
last_reviewed: 2026-08-14
---

# Provider cache and context optimization research

This note records public provider behavior that affects Omnia's cache planner.
It is design input, not proof that Omnia currently implements these paths.

## Evidence method

- Retrieval date: 2026-08-14.
- Evidence class: official public provider documentation.
- Claims are classified as documented, inferred or unknown.
- Provider billing/cache counters remain provider-authoritative; Omnia never
  manufactures a cache hit from local reuse.

## OpenAI prompt caching

Official source:

- https://developers.openai.com/api/docs/guides/prompt-caching

Documented observations:

- eligible prompts are cached automatically;
- cache matching depends on an exact shared prefix;
- stable instructions/examples/tools should precede variable user content;
- cache usage is surfaced through response usage details when available;
- supported APIs expose cache-routing/retention controls such as a prompt cache
  key or retention policy on compatible models/endpoints.

Omnia implication:

- build a stable-prefix plan rather than reordering prompts accidentally;
- freeze tool/schema/order revisions in the cache identity;
- accept only provider-reported cached usage as provider cache evidence;
- treat model/endpoint/control support as a dated capability snapshot.

## Anthropic prompt caching

Official source:

- https://platform.claude.com/docs/en/build-with-claude/prompt-caching

Documented observations:

- the API supports explicit cache breakpoints through `cache_control`;
- cache lifetime and cache creation/read accounting are provider-defined;
- exact prefix structure and block order affect reuse;
- cache reads and writes have distinct usage/cost semantics.

Omnia implication:

- the provider adapter owns breakpoint translation and TTL compatibility;
- never normalize cache-write and cache-read counters into one undifferentiated
  cache number;
- changing tools, system blocks or earlier content invalidates downstream
  prefix reuse and must be visible in the cache plan.

## Gemini context caching

Official source:

- https://ai.google.dev/gemini-api/docs/caching

Documented observations:

- Gemini supports implicit caching on eligible requests and explicit cached
  content resources on supported models;
- explicit cache resources have provider-managed identity and lifetime;
- minimum input, model, content and TTL constraints are model/API dependent;
- cached-token metadata may be returned through provider usage fields.

Omnia implication:

- model discovery is not enough; cache capability and constraints need their
  own live capability snapshot;
- provider cache handles are restricted native secrets/identifiers, not a
  cross-provider cache format;
- expiry, deletion and fallback-to-uncached behavior must be tested.

## DeepSeek context caching

Official source:

- https://api-docs.deepseek.com/guides/kv_cache

Documented observations:

- disk context caching is automatic on eligible requests;
- a cache hit depends on a repeated prefix;
- usage can distinguish cache-hit and cache-miss input tokens;
- applications do not upload arbitrary local KV state to force a provider hit.

Omnia implication:

- preserve prefix stability and report hit/miss counters when the provider
  supplies them;
- local cache reuse alone is not provider cache/billing proof;
- missing hit/miss counters remain unknown.

## Provider compaction and context editing

Official sources:

- https://developers.openai.com/api/docs/guides/compaction
- https://platform.claude.com/docs/en/build-with-claude/context-windows
- https://platform.claude.com/docs/en/build-with-claude/context-editing

Documented observations:

- supported provider APIs may offer server-side compaction or context editing;
- provider-native compacted state is model/API specific and not a neutral
  summary that can be replayed unchanged to every provider;
- compaction changes the effective context and therefore requires lifecycle,
  provenance and evaluation semantics.

Omnia implication:

- represent provider-native compaction separately from Omnia-owned checkpoint
  compaction;
- preserve raw journal/source history and create a new context revision;
- evaluate instruction, citation, task, approval and unresolved-effect
  survival before automatically promoting a compacted context.

## Non-claims and cross-provider boundary

- A client-side content cache cannot label an arbitrary provider request as a
  billable provider cache hit.
- Provider KV/cache handles are not portable between providers or model
  families unless an official API explicitly states otherwise.
- Omnia can save cost locally by avoiding irrelevant context, reusing OCR/AST/
  embeddings/summaries, reusing allowed upload/cache handles, and preserving a
  provider-compatible stable prefix.
- A local cached model response may be served only under a visible response-
  reuse policy with freshness, source input hash and safety constraints; it is
  not silently substituted for a new inference.
