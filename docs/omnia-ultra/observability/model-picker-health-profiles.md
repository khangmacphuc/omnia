---
id: OMNIA-ULTRA-OBS-MODEL
title: Live model picker, health and effort profiles
status: normative-target
schema: schemas/model-profile.schema.json
---

# Model picker and profiles

Open the picker immediately from a cached catalog, then refresh asynchronously.
Use passive observations and provider-supported catalog/health endpoints before
active probes. Active probes are visible, budgeted and rate-limited.

## Model health states

Healthy, Live, Degraded, High latency, Rate limited, Temporarily unavailable,
Authentication failed, Permission denied, Quota exhausted, Deprecated, Unknown,
Not tested, Loading local model and Incompatible with current input.

Each state has last checked, source, confidence and freshness. Do not call a
model dead after one transient error.

## Picker views

- provider/family;
- capability and modality;
- context size;
- tool/structured-output support;
- cost;
- latency;
- quality history;
- local/cloud;
- favorites/recent;
- recommended;
- healthy-only;
- project presets.

## Effort profiles

Fast, Balanced, Deep, Ultra and Custom are model-aware contracts, not arbitrary
numeric extremes. Each profile resolves the strongest quality configuration
within its latency, cost, context, reasoning and tool budget.

Resolve:

- reasoning/thinking effort;
- temperature/top-p/top-k;
- max output;
- tool iterations;
- cache behavior;
- context strategy;
- search/retrieval;
- retry;
- timeout;
- provider-specific controls.

Show requested effort and effective effort separately.

## New model onboarding

When a fetched model has no profile, offer:

- Auto-match nearest profile;
- clone from another model;
- search official documentation;
- run capability/smoke benchmark;
- manual configuration;
- save provisional profile.

Display compatible, ignored, missing and changed parameters. Never silently copy
a setting whose semantics differ.

