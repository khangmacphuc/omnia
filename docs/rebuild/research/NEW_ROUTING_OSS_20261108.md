# Cycle 0007 new OSS routing research — LiteLLM Router

**Retrieved:** 2026-11-08 (UTC)  
**Canonical repository:** https://github.com/BerriAI/litellm  
**Revision:** `cb7c3a65c6e480fc26e97617fca5ec9b76fd0979`  
**Query:** `open source everything super power pro max model routing provider catalog retries cooldown latency routing architecture`

This is a genuinely new repository/revision/path tuple for the Omnia rebuild;
the existing source register contains no LiteLLM path. The repository's files
outside its `enterprise/` directory are MIT licensed. No downloaded code was
executed and no provider credentials or live account were used.

## Exact source reviewed

| Upstream path | Local snapshot | SHA-256 | Why it was read |
| --- | --- | --- | --- |
| `LICENSE` | [`snapshots/cycle7/litellm/LICENSE`](snapshots/cycle7/litellm/LICENSE) | `b170d6bf8e8835dd357e011681db028f4d51e2fb0ea892058f56e01fb39b8273` | MIT boundary and enterprise exception |
| `README.md` | [`snapshots/cycle7/litellm/README.md`](snapshots/cycle7/litellm/README.md) | `374d8fdb228a6d528cdcf075aa807b43c5cec7669ee3adf0b21aedbbafd90e7b` | Public routing/provider scope and limitations |
| `litellm/router.py` | [`snapshots/cycle7/litellm/router.py`](snapshots/cycle7/litellm/router.py) | `9ac88f94eb8a3f0b82bf7a88c3afaa428f8f0f15eb4820c531c6a4c7cc780ac8` | Router configuration and retry/fallback/cooldown contracts |
| `litellm/router_strategy/lowest_latency.py` | [`snapshots/cycle7/litellm/lowest_latency.py`](snapshots/cycle7/litellm/lowest_latency.py) | `4c4b703ed7ab5f9986405625fbcd07b6607f36e1908d5be1a4d6654d4e56d05b` | Bounded latency samples and healthy deployment choice |

## Observations

`Router` groups deployments by a stable model alias and makes routing policy
explicit. The constructor documents retry count, retry delay, allowed failures,
cooldown time, fallbacks, context-window prechecks, health checks, budget
checks, session affinity and named routing groups. Supported strategies include
simple shuffle, least busy, usage based, latency based and cost based routing.
The code also distinguishes retryable deployment failure from cross-group
fallback and can preserve a session pin when a deployment enters cooldown.

The lowest-latency strategy keeps a bounded rolling sample per deployment,
normalizes latency and treats timeouts as a high-latency observation. It does
not pretend that an unobserved deployment has a measured score; a deployment
with no samples is handled explicitly before sampled candidates are compared.

## Omnia decision

**Decision: apply-as-reference; do not vendor or embed LiteLLM.**

1. Add a renderer/native catalog adapter that treats `(providerProfileId,
   modelId)` as the stable route identity and stores a catalog snapshot ID/hash
   with each session/run receipt.
2. Resolve `ultra` to the selected model's maximum supported effort and retain
   the requested value plus the resolved value in the receipt. Unsupported
   efforts become an explicit unavailable state rather than silently dropping
   the setting.
3. Keep retry, cooldown and fallback policy typed and idempotency-aware. A
   permission denial, cancellation or outcome-unknown dispatch is terminal or
   asks the user; it must not be blindly replayed.
4. Use bounded latency/health samples for optional routing hints only. The
   catalog and native provider response remain authoritative; renderer cache
   rows cannot claim a live model is healthy.
5. Bind catalog refresh to the active session without replacing the model
   metadata of an in-flight attempt. Mark disappeared models as stale and
   preserve the last known snapshot for replay.

## Limits and gap mapping

LiteLLM is a Python gateway and its tests or deployment behavior do not prove
Omnia's Rust/Tauri provider integration, Windows permissions, native HTTP
cancellation, live model discovery, or packaged UI. It also assumes provider
credentials and external services that Omnia must protect behind its own
permission boundary. The research therefore informs contracts for `ADVSET-003`
and `ADVSET-001`; it cannot move either criterion to Done by itself.

## Reproducibility

Source was retrieved with read-only HTTPS requests at the pinned revision and
hashed locally. The local snapshots are reference data only. No upstream
script, package installer, provider request, or authenticated service was run.
