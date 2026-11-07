# State-revision/CAS implementation receipt — September 9, 2026

## Scope

This receipt records the state-revision graph and branch-head compare-and-swap
(CAS) foundation present in the current Omnia working tree. It is an
implementation-progress receipt, not a shipped-capability or native-runtime
acceptance receipt.

## Working-tree implementation observed

- SQLite schema version **11** contains the six state-revision tables:
  `state_revision_streams`, `state_revisions`, `state_revision_parents`,
  `state_revision_edges`, `state_revision_heads` and
  `state_revision_idempotency`.
- `docs/storage-schema.sql` contains immutable, scope, head and idempotency
  guards plus fixed-watermark indexes.
- `Storage::append_state_revision` and
  `Storage::read_state_revision_graph` are present in
  `src-tauri/src/storage.rs`.
- Tauri commands `state_revision_append` and `state_revision_graph_read` are
  registered in `src-tauri/src/lib.rs` and exposed through
  `src/lib/desktop.ts`.
- Graph reads use one SQLite read transaction and clamp a requested future
  watermark to the native fact horizon. The projection is redacted and does
  not expose raw secrets, credentials, cookies, provider bodies, file bytes or
  unrestricted sensitive paths.
- The source contains a fixed-watermark behavior test covering an accepted
  root, a candidate, an accepted continuation, historical accepted-head
  reconstruction and future-watermark clamping.

## Same-snapshot checks run

The following commands were run from `C:\Users\khang\source\repos\Omnia` on
September 9, 2026:

```text
python -m py_compile scripts\verify-state-revision-schema.py       PASS
python scripts\verify-state-revision-schema.py                     PASS
npm run typecheck                                                   PASS
```

The independent SQLite verifier reported:

```json
{
  "constraintMatrixVerified": true,
  "freshObjects": 185,
  "migrationReceipt": "0011_state_revision_graph_cas",
  "rollbackVerified": true,
  "sqlite": "3.50.4",
  "v11Tables": [
    "state_revision_edges",
    "state_revision_heads",
    "state_revision_idempotency",
    "state_revision_parents",
    "state_revision_streams",
    "state_revisions"
  ],
  "v11Triggers": 19
}
```

The verifier covers fresh-schema creation, v10-to-v11 migration, migration
rollback, migration receipt/checksum/version, `PRAGMA quick_check`,
`PRAGMA foreign_key_check`, fresh/migrated schema parity, scope constraints,
accepted-head guards, candidate-head rejection, sequence constraints, parent
and edge scope, immutability and projection-schema safety. This SQL evidence
does not execute the Rust repository implementation.

The edge-direction contract is now explicit and independently checked by the
verifier: `from_revision_id` is the derived/new revision and
`to_revision_id` is the referenced source/parent revision. A
`continues-from` edge therefore points `child -> parent`. This closes the
schema/contract alignment question; native runtime execution still remains a
separate acceptance gate.

## Open acceptance blockers

The capability remains **partial/unverified** until the following are closed:

1. A supported Rust toolchain runs the native compile and behavior tests. The
   current host has no `cargo`, `rustc` or `rustfmt`.
2. Each state mutation appends its matching run-journal fact in the same
   transaction and publishes only after commit.
3. Idempotency replay returns the original receipt/revision identity while
   clearly separating it from the current live head.
4. Canonical payload hashing binds the exact resolved parent set, including
   implicit-parent resolution, and has equivalence/drift tests.
5. Native tests cover stale-head rollback with zero orphan rows, cross-stream
   conflicts, all non-accepted statuses, sibling isolation, tamper detection,
   close/reopen reconstruction, projection redaction and two-client CAS.
6. Startup recovery, reconciliation and journal/state replay are exercised at
   a fixed watermark.

Until these checks have same-snapshot evidence, do not promote
`OMNIA-CAP-STATE-REVISION-CAS` to `verified`, and do not enable pause/resume,
Continue, immutable prompt edit/retry or active-run compare as durable product
claims.
