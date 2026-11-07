---
id: OMNIA-AUDIT-CANONICAL-GOAL-HARDENING-V2-2026-08-14
title: Canonical goal hardening v2 receipt
status: audit-current-tree
version: 1.0.0
last_reviewed: 2026-08-14
supersedes: []
---

# Canonical goal hardening v2

## Scope

This receipt records a narrow hardening pass over the portable execution goal
and its machine-readable requirement schema. It changes target-language
clarity only; it does not claim that the planned Omnia Ultra product is
implemented, wired or verified.

## Changes

1. `goal/00-copy-ready-prompt.md` now names the exact resolved multimodal
   execution modes from `schemas/modality-bridge-plan.schema.json`:

   - `direct-native`
   - `local-transform`
   - `specialist-bridge-model`
   - `hybrid-ensemble`
   - `surrogate-to-primary`
   - `human-review`
   - `unsupported`

   The prompt explicitly states that `Auto` is a request preference and must
   be resolved before execution. It also separates the executable
   `surrogate-to-primary` mode from the `grounded-surrogate` representation,
   and states that `specialist-bridge-model` never proves native support in
   the destination model. An unavailable route must be rendered as a truthful
   `unsupported` result with reason, evidence, limits and next action.

2. `schemas/goal-requirements.schema.json` now documents that `targetStatus`
   is the intended terminal maturity, not current shipping evidence. Current
   truth remains the linked capability ledger plus same-snapshot tests and
   evidence; no UI or registry target may be rendered as verified without
   those facts.

## Verification

```text
GOAL_REQUIREMENTS_SCHEMA_PARSE=PASS
COPY_START_COUNT=1
COPY_END_COUNT=1
PROMPT_RESOLVED_BRIDGE_MODE_COVERAGE=PASS
PROMPT_SURROGATE_SEMANTICS=PASS
```

The global validator was also run on the shared worktree. At this checkpoint
it reports only four concurrent manifest-registration gaps:

```text
schemas/adaptive-policy-release.schema.json
schemas/grounded-surrogate-observation.schema.json
schemas/modality-bridge-execution-receipt.schema.json
schemas/routing-decision-receipt.schema.json
```

Those files belong to active routing/fidelity integration work and are not
silently treated as shipped by this receipt.

## Claim boundary

This receipt does not assert native multimodal dispatch, provider parity,
local-model installation, specialist runtime execution or end-to-end UI
support. It only records documentation/schema hardening and bounded static
checks.
