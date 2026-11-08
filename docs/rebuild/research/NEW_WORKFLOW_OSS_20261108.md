# Cycle 0007 new OSS research — PydanticAI model fallback and agent runtime

- **Query:** `everything super power pro max open source agent workflow model routing fallback capability negotiation PydanticAI`
- **Retrieved:** 2026-11-08T06:49:31Z (UTC; repository HEAD resolved with `git ls-remote`)
- **Canonical repository:** https://github.com/pydantic/pydantic-ai
- **Revision:** `0f7648a1b0685389ea368ea4f7b754b393cea8c7`
- **License:** MIT (`LICENSE`)
- **Novelty:** This repository/revision/path tuple is not present in `docs/rebuild/SOURCE_REGISTER.json` or the cycle baseline. It is a new workflow/model-routing reference for cycle `rebuild-0007`.
- **Safety:** Source was read from a shallow, no-checkout clone and copied into evidence snapshots. No downloaded scripts, agents, providers, credentials, profiles or external accounts were executed or accessed.

## Exact source read and evidence

| Upstream path | Omnia snapshot | SHA-256 |
| --- | --- | --- |
| `LICENSE` | `docs/rebuild/research/snapshots/cycle7/pydantic-ai/LICENSE.txt` | `a9c6706a17a6136f0685a9b1af3c5750ba7cb58c699cac6a90b2f98ca667db86` |
| `pydantic_ai_slim/pydantic_ai/agent/abstract.py` | `docs/rebuild/research/snapshots/cycle7/pydantic-ai/agent-abstract.py.txt` | `39dac7d85bd63ca1f2c6948bdec8bc19f02d3493f4f8038019212ad508755da1` |
| `pydantic_ai_slim/pydantic_ai/models/_abstract.py` | `docs/rebuild/research/snapshots/cycle7/pydantic-ai/models-abstract.py.txt` | `1ffb7dec8c323eaa18cdaafb48ca40648232ec8bde0709182acff727e72c0d433` |
| `pydantic_ai_slim/pydantic_ai/models/fallback.py` | `docs/rebuild/research/snapshots/cycle7/pydantic-ai/models-fallback.py.txt` | `398f82aee5bd500f39ec1cc84e2b878a34a78be1bc1e6da038f7e73a758bca0a` |

> The `models-abstract.py.txt` hash above is shown with spacing only for readability; the exact lowercase SHA-256 is recorded in the machine-readable research receipt below.

## Observations

1. `agent/abstract.py` defines a broad run/stream lifecycle boundary with explicit cancellation tokens, run bindings, tool managers, result events and model settings. This makes cancellation and per-run settings part of the contract rather than renderer-only state.
2. `models/_abstract.py` exposes model request/response abstractions and request-attempt metadata alongside instrumentation spans and deadlines. Attempt lineage, timeout/deadline propagation and telemetry are represented at the model boundary.
3. `models/fallback.py` implements a fallback chain with explicit exception/response predicates, serialized entry locking, continuation pins and cancellation of suspended jobs. Fallback is selected by typed failure policy instead of blind retry.

## Strengths

- Explicit model boundary separates request parameters, response streams, attempt metadata and capability-specific settings.
- Fallback predicates can distinguish typed API errors and rejected responses, which maps to Omnia's retryable/permanent/unknown outcome policy.
- Deadline, cancellation and continuation lineage are first-class and can survive a provider switch.
- Instrumentation hooks provide a model/provider span boundary for observability.

## Weaknesses and limits

- Python/AnyIO implementation is not a Windows Tauri/Rust runtime proof and is not vendored.
- Fallback behavior depends on adapter error classification; an unfenced provider adapter could still duplicate side effects.
- The inspected paths do not provide Omnia's catalog snapshot persistence, profile-to-chat CAS binding, or packaged ask-user UI evidence.

## Omnia decision

**Decision: apply-as-reference.** Translate the observed contracts into Omnia-owned Rust/TypeScript types:

- add an attempt lineage and cancellation/deadline envelope to the catalog-to-chat route adapter;
- resolve model effort and retry behavior from typed provider capabilities and terminal error classes;
- preserve fallback/route changes in run receipts with explicit `retryable`, `permanent`, `cancelled` and `unknown` outcomes;
- keep provider catalog snapshots and profile bindings durable and CAS-acknowledged;
- do not copy or embed PydanticAI source, Python runtime or UI.

This research informs cycle 0007 criteria `ADVSET-003`, `ADVSET-001` and `CHAT-008`; it does not satisfy native/runtime/live evidence by itself.

