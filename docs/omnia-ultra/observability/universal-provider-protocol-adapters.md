---
id: OMNIA-ULTRA-OBS-UNIVERSAL-PROVIDER-PROTOCOLS
title: Universal provider endpoint and protocol adapter contract
status: normative-target
version: 1.1.0
last_reviewed: 2026-08-14
supersedes: []
---

# Universal provider protocol adapters

Omnia supports provider capabilities through versioned adapters and durable
capability snapshots. It does not hard-code one chat endpoint as the universal
shape, and it never assumes that branding implies support for a method,
parameter, modality or usage field.

## First-class protocol families

The built-in adapter surface covers:

- OpenAI Responses, Chat Completions, legacy Completions where required,
  Embeddings, Realtime, Batch, Files/uploads, Images, Audio/speech/transcription,
  Moderation, Models, vector/file-search resources and provider usage/cost APIs;
- Anthropic Messages, streaming events, token counting, Message Batches,
  Models and Files, with beta headers and provider-specific cache/tool/content
  blocks represented explicitly;
- Google Gemini REST/streaming/Live protocols across supported `v1` and
  `v1beta` resources, including generate/stream/live content, embeddings,
  token counting, batches, files and model capability discovery;
- OpenAI-compatible and Anthropic-compatible endpoints with conformance probes
  rather than assumed full compatibility;
- native/local protocols for Ollama, llama.cpp, LM Studio, vLLM, TGI, LiteLLM
  and plugin runtimes, plus embedding and reranking servers;
- declarative REST, SSE, WebSocket, polling, webhook and batch adapters whose
  auth, paths, request/response mapping, pagination, uploads, errors, usage and
  cancellation are defined by a signed/approved manifest.

New or vendor-specific endpoint methods are added through adapter/plugin
manifests and conformance fixtures without changing the core conversation
model. Unsupported methods remain unavailable and explain why.

## Capability snapshot

Each endpoint snapshot records base URL, protocol family/version, adapter
revision, auth scheme, operations, transports, modalities, stream event types,
context/output limits, tool/structured-output support, upload/file semantics,
cache rules, batch/job lifecycle, idempotency, error/retry mapping, rate/quota
headers, usage/cost authority, data retention/residency and freshness.

Model discovery is reconciled with endpoint probes and user overrides. A
request freezes the endpoint/model/capability/parameter revisions before native
dispatch. If a provider changes behavior, later requests use a new snapshot;
historical attempts retain the old one.

### Operation-by-modality evidence

A broad `modalities` list is a discovery hint, not dispatch authority. Each
usable attachment or media capability is represented by an
`operationCapabilities[]` record that joins the exact operation, direction,
modality, model/runtime scope, content carrier, MIME family, fidelity,
constraints, support level, probe requirement and source/probe evidence. This
prevents an OpenAI-compatible, Anthropic-compatible or local-server label from
being shown as universal semantic parity.

The route planner permits direct dispatch only when an unexpired,
policy-compatible record accepts the exact model, API version, artifact and
carrier. A documented native path can still be model-gated; provider/model
metadata and a licensed synthetic capability probe are distinct evidence. A
401/403/quota/region/transport failure does not prove that a modality is
unsupported. Unknown/adapter-gated/bridge-required cases compile a provenance
preserving local or specialist bridge plan, request review, or return a
truthful unavailable result.

For source-backed matrix rows, carrier/fidelity caveats and conformance fixture
requirements, see
[`../../research/OFFICIAL_MULTIMODAL_PROVIDER_OPERATION_MATRIX_2026-08-14.md`](../../research/OFFICIAL_MULTIMODAL_PROVIDER_OPERATION_MATRIX_2026-08-14.md).

## Advanced parameters

Parameters are layered as:

1. cross-provider intent (`temperature`, output limit, stop, seed, tools,
   response format, effort, cache, service tier, timeout/retry);
2. protocol-native fields and content blocks;
3. model-specific capability schema;
4. expert extension fields validated against an adapter JSON Schema.

The UI supports search, groups, presets, diff, reset, clone and raw expert view.
It displays requested, translated, effective, ignored and rejected values. It
never silently drops a parameter or sends an unsupported field. Every model and
effort preset may have optimized defaults, while the user can override all
allowed fields and save global/provider/model/project/agent/task/request scopes.

## Conformance and acceptance

Adapters require golden request/response/stream fixtures, malformed/truncated
stream tests, auth/redirect/TLS/local-network policy, model discovery, parameter
translation, tool calls, files, usage/cache/cost, 4xx/5xx/retry, cancellation,
idempotency, rate limits and redaction tests. “Compatible” is scoped per method
and snapshot, never shown as total protocol parity without evidence.

See `../schemas/provider-endpoint-capability.schema.json`,
`model-picker-health-profiles.md`, `request-lifecycle.md` and
`retry-fallback-repair.md`.
