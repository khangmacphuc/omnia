---
id: OMNIA-ULTRA-OBS-PROVIDER-ATTEMPT-LINEAGE
title: Immutable provider attempt lineage contract
status: normative-target
version: 1.0.0
schema: ../schemas/provider-attempt-lineage.schema.json
last_reviewed: 2026-09-10
supersedes: []
---

# Immutable provider attempt lineage

This contract closes the gap between a prepared request and the evidence shown
by the request inspector. It freezes the provider, endpoint, adapter, model
capability, route, parameter, cache, context, policy and price revisions that
were selected for one provider attempt. The record is content-free by default:
it stores bounded identifiers and cryptographic hashes, not credentials,
cookies, prompts, responses, raw URLs or file bytes.

The fact is one-to-one with a `frozen_provider_inputs` row. It is created in
the same native transaction that prepares that input and is committed before
dispatch can start. A provider, catalog or policy update therefore affects
future attempts only; it cannot rewrite the evidence for an already prepared
attempt.

## Authority and lifecycle

The native storage/journal layer is authoritative. Renderer projections,
request-inspector cards, analytics and export receipts are derived views and
must be rebuildable from this fact plus the referenced immutable snapshots.

The required lifecycle is:

```text
resolve provider/model/policy snapshots
  -> canonicalize and hash the resolved preparation
  -> insert frozen provider input + one lineage fact atomically
  -> commit preparation
  -> dispatch using only the committed snapshot IDs/hashes
  -> append telemetry, retry and cost facts separately
```

An attempt that is retried, repaired or sent to a fallback provider receives a
new frozen input and a new lineage fact. The old record remains unchanged and
is linked through the run/attempt and routing-decision journal lineage. A
request whose outcome is unknown must not reuse the old fact for a blind resend.

## Required invariants

1. `frozenProviderInputId`, `runId`, `attemptId` and `providerProfileId` must
   identify the same preparation scope. Cross-run, cross-attempt and
   cross-profile joins are rejected before commit.
2. `frozenProviderInputId` is unique. There may be exactly one lineage fact for
   a prepared input; duplicate insertion is a hard error.
3. The fact is append-only. Updates and deletes are rejected by native
   immutability triggers (or an equivalent journal-authority guard). A repair or
   retry appends a successor fact rather than changing history.
4. Every non-null snapshot/hash pair refers to the exact immutable revision
   used for preparation. The hash is computed over canonical, deterministic
   JSON; key ordering, insignificant whitespace and platform line endings do
   not change it.
5. Provider definition and endpoint fingerprints are opaque fingerprints. Raw
   API keys, authorization headers, cookies, saved browser credentials, full
   URLs with secrets, prompts, responses, reasoning and attachment bytes are
   never stored in this fact.
6. Missing or unavailable evidence remains `null`/unknown. `0`, an empty
   string, or an empty array may only be used when the source explicitly
   reported that value.
7. Requested and effective effort are separate. A provider translation,
   model default or policy cap must not overwrite the user's requested value.
8. Local context/cache reuse and a provider-reported cache hit remain separate
   facts. This lineage records the selected cache policy/plan; usage telemetry
   records observed provider cache counters and source.
9. Historical price identity is frozen by `priceSnapshotId` and
   `priceSnapshotSha256`. A later catalog price update cannot recalculate an
   old attempt's cost.
10. Security and data-handling policy revisions outrank routing or cache
    optimization. A revoked authority/consent/data class must make the route
    unavailable or require a new preparation; it must never mutate old lineage.

## Field groups

The JSON schema uses camelCase for renderer/API interchange. Native SQL may use
snake_case, but the mapping must be explicit and tested.

- **Scope:** lineage fact, run, attempt, frozen input and provider profile IDs.
- **Provider:** provider-definition schema/hash, endpoint fingerprint and
  adapter revision.
- **Catalog/model:** catalog snapshot, model descriptor and model capability
  snapshot IDs/hashes.
- **Execution policy:** route revision, routing receipt, retry policy and
  cache policy/plan IDs.
- **Parameters:** parameter-profile revision, canonical resolved-parameter
  hash, requested effort and effective effort. Requested effort is nullable
  when the preparation request did not carry an explicit Omnia effort value;
  effective effort is nullable until a provider adapter or policy records the
  applied value. Neither field may be inferred from a model name or filled
  with a default merely to satisfy the receipt shape.
- **Context and authority:** context-manifest ID/hash, authority-continuity
  record and data-classification revision.
- **Cost provenance:** price snapshot ID/hash; cost observations themselves
  stay in the append-only usage/cost ledger.
- **Time:** creation time for the preparation fact. Dispatch and response
  milestones belong to request telemetry and the run journal.

The JSON contract requires every provenance key to be present so that an
inspector can distinguish an explicitly unavailable value from an omitted
field. Evidence that has no first-class native snapshot at preparation time is
represented as JSON `null`: catalog/model/capability snapshots, route and
policy revisions, price, parameter-profile, context, authority and data
classification. A value is never replaced with `""`, `0`, `false`, or a
fabricated revision. If a paired snapshot ID/hash is available, both values
must be non-null and must validate against the referenced immutable snapshot.

The durable Fact and renderer-safe Receipt use camelCase and the authoritative
`createdAtMs` positive Unix-milliseconds integer. This value must exactly equal
the frozen provider input's `created_at_ms`; it is not independently authored
by a renderer or adapter. Native SQLite uses the explicit `created_at_ms`
snake-case spelling, which maps directly to `createdAtMs`. An ISO-8601 string
may be derived for display or log presentation, but it is not part of the
durable v14 JSON contract and must never replace or compete with `createdAtMs`.

## Request inspector projection

The inspector may join this record with the frozen input, routing receipt,
telemetry and journal, but the projection is renderer-safe by default:

```text
provider profile -> definition hash -> endpoint fingerprint -> adapter revision
model -> descriptor/capability snapshot -> requested/effective effort
route -> context/cache/retry policy -> parameter hash
authority/data handling -> price snapshot -> attempt timeline/usage/cost
```

It should show a clear `unknown` reason when a snapshot is unavailable and a
clear `stale/revoked` state when a referenced policy is no longer active. It
must not silently fall back to the current provider profile when inspecting a
historical attempt.

## Migration and verification requirements

The additive migration that introduces this contract must:

- create the table, unique scope index, foreign-key/scope checks and
  immutability triggers atomically;
- leave existing frozen inputs valid and represent pre-migration history as
  explicitly unavailable rather than fabricating current snapshots;
- roll back cleanly after an injected failure at every insert stage;
- verify canonicalization determinism, tamper rejection, duplicate rejection,
  cross-scope rejection, close/reopen reconstruction and retry successor
  lineage;
- provide an independent SQL/schema verifier in addition to Rust tests;
- expose only a bounded, content-free read projection to the renderer.

Until same-snapshot native compile/test evidence exists, this file and its
schema are a contract, not proof that the complete runtime or UI inspector is
implemented.

See also:

- [`universal-provider-protocol-adapters.md`](universal-provider-protocol-adapters.md)
- [`request-usage-telemetry.md`](request-usage-telemetry.md)
- [`request-lifecycle.md`](request-lifecycle.md)
- [`retry-fallback-repair.md`](retry-fallback-repair.md)
- [`../architecture/cache-context-routing.md`](../architecture/cache-context-routing.md)
- [`../schemas/provider-attempt-lineage.schema.json`](../schemas/provider-attempt-lineage.schema.json)
- [`../schemas/provider-attempt-lineage-receipt.schema.json`](../schemas/provider-attempt-lineage-receipt.schema.json)
