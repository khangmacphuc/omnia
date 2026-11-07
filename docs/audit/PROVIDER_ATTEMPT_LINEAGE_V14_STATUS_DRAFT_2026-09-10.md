# Provider-attempt lineage v14 status draft — September 10, 2026

## Purpose and evidence boundary

This is a same-day working-tree status draft for the additive provider-attempt
lineage slice. It is not a release certificate and it does not promote native
Rust behavior to verified status. The repository has no committed baseline;
all observations below refer to the files and commands present in the
uncommitted tree at the time of the checks.

The normative contract is
[`docs/omnia-ultra/observability/provider-attempt-lineage.md`](../omnia-ultra/observability/provider-attempt-lineage.md),
and its JSON shape is
[`docs/omnia-ultra/schemas/provider-attempt-lineage.schema.json`](../omnia-ultra/schemas/provider-attempt-lineage.schema.json).
The acceptance matrix is
[`PROVIDER_ATTEMPT_LINEAGE_V14_TEST_PLAN_2026-09-10.md`](PROVIDER_ATTEMPT_LINEAGE_V14_TEST_PLAN_2026-09-10.md).

## Current observed implementation state

The checked-in source currently contains the v14 migration seam and the SQL
contract for `provider_attempt_lineage_facts`:

- native storage reports `SCHEMA_VERSION = 14`;
- the migration receipt is `0014_provider_attempt_lineage_facts`;
- the v14 table has three lookup indexes and three immutable/scope triggers;
- the independent SQLite verifier exercises migration, rollback, scope,
  immutable-body, projection-safety and valid-row fixtures;
- the native preparation path contains an immutable lineage insertion after
  the frozen provider input is persisted, and the load/dispatch path contains
  fail-closed lineage validation seams;
- optional catalog, routing, cache, context and price provenance remains
  unknown (`NULL`) when no native immutable snapshot exists. The current code
  must not fabricate those facts merely to satisfy the shape.

These source observations are implementation evidence only. They are not
equivalent to compiling the Rust crate, opening a profile with the native
runtime, dispatching a provider request, or exercising a packaged Windows
application.

## Commands run and observed results

All commands were run from `C:\Users\khang\source\repos\Omnia` on
September 10, 2026.

### SQL/schema evidence — PASS

```text
python -m py_compile scripts\verify-state-revision-schema.py
python scripts\verify-state-revision-schema.py
STATE_REVISION_SCHEMA_VERIFY: PASS
PROVIDER_ATTEMPT_LINEAGE_VERIFY: PASS
{
  "currentSchemaVersion": 14,
  "currentMigrationReceipt": "0014_provider_attempt_lineage_facts",
  "freshObjects": 207,
  "v14ImmutableGuardsVerified": true,
  "v14ProjectionSafetyVerified": true,
  "v14RollbackVerified": true,
  "v14ScopeGuardsVerified": true,
  "v14ValidLineageRows": 2
}
```

This is independent SQLite/DDL and migration evidence. It does not prove the
Rust storage implementation or native dispatch path.

### Spec-pack evidence — PASS

```text
pwsh -NoProfile -ExecutionPolicy Bypass -File docs\omnia-ultra\tools\validate-spec.ps1
PASS - Omnia Ultra spec pack: 114 Markdown files, 48 JSON files,
114 unique document IDs, 55 requirements, 55 capability rows
```

The provider-lineage contract and schema are registered in the spec manifest.

### Provider-lineage JSON verifier — PASS

```text
python -m py_compile scripts\verify-provider-attempt-lineage-schema.py
python scripts\verify-provider-attempt-lineage-schema.py
PROVIDER_ATTEMPT_LINEAGE_SCHEMA_VERIFY: PASS
{
  "additionalPropertiesRejected": true,
  "conditionalPairRules": 5,
  "optionalFields": 2,
  "requiredFields": 30,
  "secretFieldNames": 0
}
```

The verifier and schema now agree that requested effort preserves the bounded
Omnia vocabulary while still allowing explicit unknown/null provenance where
the current preparation path has no dedicated effort input. This gate checks
the JSON contract only; it does not prove native runtime behavior.

### Renderer/spec checks — PASS where observed

```text
python -m json.tool docs\omnia-ultra\schemas\provider-attempt-lineage.schema.json
PROVIDER_SCHEMA_JSON: PASS
```

```text
npm.cmd run typecheck
exit code 0
```

The command completed without output from the host wrapper; the exit code is
the authoritative result for this focused invocation. It should still be
included in a final quiet-snapshot receipt alongside the complete renderer
test/build gate.

### Native Rust/runtime evidence — UNAVAILABLE

The host does not provide `cargo`, `rustc`, `rustfmt` or `rustup`. Therefore
the following remain unverified for this snapshot:

- Rust format/check/test compilation;
- native v14 migration execution through `Storage`;
- atomic preparation of frozen input plus lineage in the Rust runtime;
- load-time and final pre-dispatch lineage checks;
- provider-definition drift rejection in a live gateway call;
- close/reopen/recovery and concurrency behavior;
- packaged Windows smoke and renderer request-inspector projection.

No stale executable, historical receipt or generated Project Twin is accepted
as a substitute for these native gates.

## Status classification

| Surface | Status | Evidence class |
| --- | --- | --- |
| v14 normative provider-lineage contract | Designed / documented | Markdown contract + JSON schema |
| v14 SQLite DDL, triggers and migration fragment | Independently verified | Python/SQLite contract verifier |
| v14 native storage wiring | Implemented in source, runtime unverified | Static source inspection only |
| Provider-definition drift gate | Source seam present, runtime unverified | Static source inspection only |
| Provider-lineage JSON verifier | Independently verified | JSON schema contract verifier |
| Renderer request-inspector lineage tab | Planned/partial | No v14 end-to-end UI evidence |
| Rust/native/package/restart evidence | Unverified | Rust toolchain unavailable |

## Required next actions before promotion

1. Let the native implementation agents finish, then run `git diff --check`
   and inspect the exact v14 source diff for duplicate or contradictory seams.
2. Rerun `npm run typecheck`, focused renderer tests and the two Python
   verifiers from one quiet snapshot.
3. If a Rust toolchain becomes available, run `cargo fmt --check`, `cargo
   check`, and the focused native storage/provider tests; record exact counts.
4. Refresh Project Twin only after all writers stop, then run `npm run twin:check`.
5. Update `docs/IMPLEMENTATION_STATUS.md` and the capability ledger only when
   the evidence level changes; retain the limitation that v14 is not native
   runtime verified on this host.

Until these actions pass, label the v14 slice **partial / independently SQL
verified / native runtime unverified**. Do not call it production-ready,
provider-complete, billing-safe, replay-safe or Chat Complete.
