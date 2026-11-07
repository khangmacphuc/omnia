---
id: OMNIA-AUDIT-PROVIDER-ATTEMPT-LINEAGE-V14-TEST-PLAN
title: Provider attempt lineage v14 test plan
status: evidence-plan
version: 1.0.0
last_reviewed: 2026-09-10
supersedes: []
---

# Provider attempt lineage v14 test plan

This plan defines the acceptance boundary for the additive provider-attempt
lineage fact introduced after storage schema v13. It is deliberately separate
from provider catalog discovery and from the renderer inspector. A passing SQL
or Rust test proves persistence and integrity only; it does not prove that a
provider was reachable, that a model supports a capability, or that a UI
renders the lineage correctly.

## Required identity and provenance

Every prepared provider input must have at most one immutable lineage fact
covering the exact run, attempt, frozen-input row, provider profile, model and
pre-dispatch revisions. The row may contain opaque IDs and SHA-256 addresses,
but must never contain credentials, cookies, raw prompt bodies, raw file bytes,
or unredacted provider URLs. Missing provenance remains missing; it must not be
represented as an invented empty string or zero.

The minimum contract is:

| Area | Required fact |
| --- | --- |
| Scope | run ID, attempt ID, frozen-input ID, provider profile ID, model ID |
| Provider | provider-definition revision/hash, endpoint fingerprint, adapter revision |
| Catalog | catalog snapshot ID/hash, model descriptor revision/hash, capability snapshot ID/hash |
| Routing | route revision, routing receipt ID, retry-policy revision, cache-policy revision/plan |
| Billing | price snapshot ID/hash |
| Parameters | parameter-profile revision, resolved-parameter hash, requested/effective effort |
| Context/policy | context-manifest ID/hash, authority-continuity record, data-classification revision |
| Audit | schema version and creation timestamp |

## Native test matrix

The following tests belong beside the storage migration and preparation code.
Names are descriptive; the implementation may use the repository's existing
test naming convention.

1. `v14_fresh_database_contains_lineage_table_and_indexes` verifies the table,
   one-to-one uniqueness on frozen input/attempt, foreign keys, bounded text,
   hash representation checks, and the immutable update trigger.
2. `v14_prepare_run_persists_lineage_in_same_transaction` prepares a run and
   proves that the lineage row appears with the exact run, attempt and frozen
   input IDs. Injecting a failure after the lineage insert leaves no message,
   run, frozen input or lineage row.
3. `v14_scope_guard_rejects_cross_run_attempt_input_profile_or_model` attempts
   each cross-scope combination and expects an atomic constraint failure.
4. `v14_hash_and_canonicalization_are_deterministic` inserts semantically
   equivalent canonical JSON in different key order and proves equal hashes;
   a changed byte, revision, or endpoint fingerprint proves unequal hashes.
5. `v14_immutable_body_rejects_update_and_delete` rejects updates to every
   provenance field and rejects deletion while its parent attempt exists.
6. `v14_redacted_projection_contains_no_secret_or_raw_body` serializes the
   renderer-safe receipt and asserts that it contains only IDs, fingerprints,
   bounded revisions and hashes; it must not contain credential, cookie,
   prompt, message, attachment bytes, raw URL or absolute path markers.
7. `v14_missing_is_not_zero_or_empty` proves nullable/unavailable fields remain
   SQL NULL (or the typed unavailable representation) and are not normalized to
   `0`, `false`, or `""`.
8. `v14_retry_creates_new_lineage_without_mutating_original` creates a semantic
   retry or fallback attempt with a new frozen input and lineage fact, then
   proves every original field and hash remains unchanged.
9. `v14_transport_retry_reuses_only_explicit_same_attempt_evidence` permits a
   same-attempt transport retry only when idempotency/acceptance evidence says
   it is safe; changing model, route, context, parameters, policy or authority
   must create a new attempt and new lineage fact.
10. `v14_provider_definition_drift_does_not_rewrite_history` changes the active
    provider profile/catalog after preparation and proves the historical row
    still validates against its frozen hash while a later preparation receives
    a different revision/hash.
11. `v14_migration_from_v13_is_atomic_and_repeatable` migrates a v13 fixture,
    validates schema metadata/checksum/indexes, injects a migration failure and
    confirms rollback, then reruns successfully without duplicate facts.
12. `v14_close_reopen_preserves_lineage` closes and reopens the SQLite profile,
    validates foreign-key integrity and reloads the exact same immutable row.

## Independent SQL contract probe

When the Rust toolchain is unavailable, a Python/SQLite probe may validate the
DDL, trigger and migration contract independently. Its output must be labelled
as SQL-contract evidence, not native runtime evidence. The probe should report:

```text
PROVIDER_ATTEMPT_LINEAGE_VERIFY: PASS
```

and include table/index/trigger presence, valid-row count, scope rejection,
tamper rejection, rollback and redaction results. It must build its fixture from
the checked-in schema or the exact v14 migration fragment; a hand-written,
unrelated fixture is not evidence about production DDL.

## Renderer and telemetry follow-up

The native tests above are necessary but insufficient for the request
inspector. A later renderer test must prove that provider, model, effort,
parameters, route, cache, price and context tabs resolve the opaque lineage
receipt without exposing secrets. Telemetry tests must keep provider-reported
usage/cost separate from local estimates and must retain the frozen price
snapshot when a catalog price changes.

## Evidence status rules

Do not mark this slice `verified` until the same source snapshot has passed the
native compile/test gate. If `cargo` is unavailable, report static review and
independent SQL-contract results separately and leave native runtime status
unverified. A stale executable, old log or generated Project Twin snapshot is
not substitute evidence.
