---
id: OMNIA-ULTRA-GOAL-UNIVERSAL-ENDPOINTS-LOCAL-MODELS
title: Universal provider endpoints and hardware-aware local model catalog goal
status: normative-target
version: 1.0.0
last_reviewed: 2026-08-14
supersedes: []
requirements_registry_revision: 2026-08-14.6
---

# Universal endpoints and local model catalog

Omnia must support OpenAI Responses, Chat Completions, Embeddings and the other
declared OpenAI methods; Anthropic Messages and related model/token/file/batch
methods; Google Gemini `v1`/`v1beta` generation, streaming/live, embedding,
token, batch, file and model methods; OpenAI/Anthropic-compatible services;
Ollama, llama.cpp, LM Studio, vLLM, TGI, LiteLLM and custom REST/SSE/WebSocket/
polling/webhook adapters. Support is capability-probed per operation and version,
never inferred from a provider label.

Every advanced parameter is exposed through provider/model/runtime-specific
schemas with optimized defaults, expert raw view, requested/translated/
effective provenance and scoped profiles. Unsupported fields must fail or show
unavailable; they are never silently ignored.

Omnia also provides a hardware-aware model catalog across Hugging Face, Ollama,
LM Studio/local files and plugin sources with deep search/sort/filter/compare,
fit/quality/speed/resource recommendations, resumable revision-pinned download,
hash/license verification, storage management, runtime selection, benchmarks
and complete load/inference/fine-tuning hyperparameter profiles.

Completion requires native provider authority, adapter conformance, durable
capability snapshots, schema-driven parameters, truthful usage/error/retry,
secure downloads, measured hardware compatibility and current evidence.

See `../observability/universal-provider-protocol-adapters.md`,
`../workbenches/local-model-catalog-and-tuning.md`,
`../schemas/provider-endpoint-capability.schema.json` and
`../schemas/local-model-catalog-query.schema.json`.
