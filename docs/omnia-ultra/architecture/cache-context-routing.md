---
id: OMNIA-ULTRA-ARCH-CACHE-CONTEXT-ROUTING
title: Cache, context and provider reuse architecture
status: normative-target
last_reviewed: 2026-08-14
---

# Cache, context and provider reuse architecture

Omnia treats caching as several typed layers with different authority,
privacy, invalidation and billing semantics. It never reports a local reuse as
a provider cache hit and never assumes one provider's KV/cache handle is
portable to another provider or model family.

## Cache layers

1. **Content-addressed local object cache** — immutable file bytes, extracted
   text, OCR, thumbnails, ASTs, embeddings, summaries and deterministic tool
   results keyed by source hash, transform revision and security scope.
2. **Context compilation cache** — provider-neutral selected segments,
   citations, token estimates and context manifests keyed by goal, branch,
   source revision, policy and capability snapshot.
3. **Retrieval cache** — query normalization, lexical/dense/graph candidates,
   reranker revision and evidence watermark; invalidated when the index or
   access grants change.
4. **Provider-native prompt/context cache** — implicit prefix cache, explicit
   breakpoints, provider cache resources/handles, TTL and provider-reported
   cache usage translated by a provider adapter.
5. **Provider upload/state reuse** — provider file IDs or response/conversation
   state reused only while allowed by provider policy and the user's data
   classification.
6. **Response reuse cache** — optional visible reuse of a prior final answer
   under an explicit freshness/exact-input policy; never silently presented as
   a new provider inference.

## Provider cache capability snapshot

Each provider/model/profile revision records whether caching is implicit,
explicit or unsupported; minimum eligible input; exact-prefix/block rules;
available cache key/breakpoint/TTL controls; supported retention; cache usage
fields; write/read cost semantics; data residency; cache-handle lifecycle;
streaming behavior; and the retrieval time/source of the capability claim.

The adapter compiles a `ProviderCachePlan` containing stable prefix segments,
dynamic suffix segments, tool/schema order, cache breakpoints or handles,
expected reuse, privacy classification, TTL, invalidation dependencies and a
fallback path. Provider-specific fields never leak into the neutral frozen
context contract without an extension namespace and adapter revision.

## Stable-prefix planner

The planner maximizes provider-native cache eligibility without changing user
intent:

- keep durable system/project instructions, examples and stable tool schemas in
  an ordered prefix when the provider requires prefix matching;
- place request-specific user content and volatile telemetry in a dynamic tail;
- keep tool lists, JSON schema/property order and multimodal segment order
  deterministic when semantically safe;
- avoid injecting timestamps, random IDs or unnecessary run-specific text into
  the reusable prefix;
- calculate whether a compaction/reordering would save context but destroy a
  valuable warm prefix, and expose the tradeoff;
- never omit a current security rule, user correction or task constraint merely
  to preserve a cache hit.

## Local user-managed cache

The local cache is encrypted by the native storage boundary and partitioned by
profile, project, data classification, provider-sharing consent and workspace
grant. Users can inspect size, objects, original/derived lineage, hit/miss,
last use, TTL, pin, export, invalidate, secure-delete, maximum size and eviction
policy. Default eviction combines TTL, least-recently-used, recomputation cost,
source availability and sensitivity.

Local cache may reduce cost by avoiding repeated OCR/indexing/embedding/tool
work and by compiling only relevant context. It cannot force a provider to bill
an input as cached. Provider cache status becomes `hit`, `miss`, `write`,
`partial` or `unknown` only from provider-native evidence or an exact adapter-
verified response field.

## Invalidation and correctness

Cache identity includes source hash, access-grant revision, transform/model/
tokenizer/provider adapter revision, endpoint/model family, system and project
instruction revisions, tool definitions/order, response schema, safety policy,
context selection/compaction revision and applicable user settings. An
invalidation records the reason and affected dependent objects.

Security revocation, file deletion, credential/profile deletion or project
scope changes take precedence over hit rate. Restricted content must not remain
retrievable through a stale semantic index, cache preview, export or agent
handoff after its grant is revoked.

## Cache metrics and evaluation

Record local object/context/retrieval hit and miss, provider-reported cache
read/write tokens, bytes/tokens avoided locally, input still sent, cache
creation cost, read cost, storage, warm-up latency, TTL expiry, invalidation
reason, prefix stability, cache-break cause and unused-write rate. Keep local
estimates, provider usage and invoice reconciliation separate.

Evaluate cache plans on total quality, correctness, cost, latency, privacy and
context fidelity. A high hit ratio is not a success if it preserves stale
instructions, hides a user correction or degrades output quality.

See `../schemas/cache-policy.schema.json`,
`../architecture/context-memory-search.md`,
`../observability/request-usage-telemetry.md` and
`../../research/PROVIDER_CACHE_CONTEXT_OPTIMIZATION_RESEARCH.md`.
