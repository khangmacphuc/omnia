# Omnia Ultra specification and state-revision evidence receipt — September 10, 2026

## Scope

This receipt records checks run against the current working tree on September
10, 2026. It is an evidence snapshot, not a release certificate and not a
claim that the complete Omnia Ultra product is implemented. The working tree
has no committed baseline, so all results are tied to the files present at the
time of these commands.

## Commands and observed results

All commands below were run from `C:\Users\khang\source\repos\Omnia`.

### Spec-pack integrity

```text
pwsh -NoProfile -ExecutionPolicy Bypass -File docs/omnia-ultra/tools/validate-spec.ps1
PASS - Omnia Ultra spec pack: 113 Markdown files, 47 JSON files, 113 unique document IDs, 55 requirements, 55 capability rows
```

This verifies manifest path resolution, JSON parsing and local references,
Markdown front matter/document IDs, dependency-cycle checks and the declared
requirement/capability registry. It does not execute native Rust code.

### SQLite schema and migration verifier

```text
python -m py_compile scripts/verify-state-revision-schema.py
python scripts/verify-state-revision-schema.py
STATE_REVISION_SCHEMA_VERIFY: PASS
{"constraintMatrixVerified": true, "currentMigrationReceipt": "0013_state_revision_operation_facts", "currentSchemaVersion": 13, "freshObjects": 200, "rollbackVerified": true, "sqlite": "3.50.4", "v11Indexes": ["state_revision_edges_from_idx", "state_revision_edges_to_idx", "state_revision_idempotency_result_idx", "state_revision_parents_parent_idx", "state_revision_streams_scope_idx", "state_revisions_stream_sequence_idx", "state_revisions_stream_status_idx"], "v11MigrationReceipt": "0011_state_revision_graph_cas", "v11RollbackVerified": true, "v11Tables": ["state_revision_edges", "state_revision_heads", "state_revision_idempotency", "state_revision_parents", "state_revision_streams", "state_revisions"], "v11Triggers": 19, "v12Indexes": ["state_revision_events_replay_idx", "state_revision_events_revision_idx"], "v12MigrationReceipt": "0012_state_revision_journal", "v12RollbackVerified": true, "v12Tables": ["state_revision_events", "state_revision_journals"], "v12Triggers": 6, "v13Indexes": ["state_revision_operation_facts_coverage_idx"], "v13MigrationReceipt": "0013_state_revision_operation_facts", "v13RollbackVerified": true, "v13Tables": ["state_revision_operation_facts"], "v13Triggers": 3}
```

The independent verifier covers fresh-schema creation, v10-to-v11 and
v11-to-v12-to-v13 migration/rollback, SQLite quick/foreign-key checks,
append-only and scope/head guards, journal sequence/cursor shape, lower-case
SHA-256 payload fields, operation-fact coverage and atomic rollback fixtures.
This is SQL/schema evidence only; it does not prove the native Rust mutation
path, restart recovery, runtime replay, concurrency or packaged Windows
behavior.

### Renderer typecheck and production build

```text
npm run typecheck
PASS (exit code 0)

npm run build
vite v7.3.6 building client environment for production...
✓ 1992 modules transformed.
✓ built in 5.78s
```

The production renderer build emitted the Vite `dist/` bundle. This does not
prove Tauri packaging, native linkage, signed artifacts or a Windows packaged
smoke run.

### Renderer quality/test/check gate

```text
npm run check
Design token outputs match docs/ui/design-tokens.json.
Tauri renderer ACL OK: one main-window capability, 7 reviewed permissions.
Typography gate OK: 10 stylesheet(s), no literal font-size below 10px.
Hit-target contract OK: 30 density-bound controls and 3 wrapper surfaces checked.
Test Files  60 passed (60)
Tests       404 passed (404)
Vite build  ✓ built in 5.78s
Bundle gate OK (Vite manifest verified)
exit code 0
```

This is a renderer/static-quality and browser-test gate. It does not supersede
the missing native Rust, packaged-app, provider, or Windows assistive-technology
evidence described below.

### Project Twin freshness

```text
npm run twin:bootstrap
Project Twin bootstrap OK: generated from the current filesystem snapshot

npm run twin:check
Project Twin check OK
```

The regenerated projection contains 25 nodes, 32 edges and 45 evidence
records. The manifest, graph and atlas hashes, source-reference ranges and
embedded graph were checked against the generated files. Project Twin is a
derived evidence projection; it does not independently prove native runtime
behavior.

### Frozen release-manifest provenance

```text
npm run manifest:verify
FAIL source-manifest verification
  snapshot: source-manifest:sha256:44beef1a358bdd93d6d05eb23f9ba040f19ee7884de7e34af4a990655051de12
  entries: 163; files: 593
  missing: 1; extra: 431; mismatched: 69; structural: 1
```

The missing path is `src/features/workspace/screens.tsx`; the structural issue
is `non-deterministic-order`. This command compares the preserved
`docs/releases/omnia-0.1.0-phase1-preview-source.sha256` manifest with the
current tree. The manifest is an older frozen-release snapshot, so this is a
release-provenance failure, not evidence that the current renderer or schema
gates failed. The historical manifest and binaries must remain labeled
historical until a new candidate source snapshot is intentionally frozen and
rebuilt.

### Native toolchain availability

```text
cargo=NOT_FOUND
rustc=NOT_FOUND
rustfmt=NOT_FOUND
```

Consequently, this host cannot provide current `cargo fmt`, `cargo check`,
`cargo test` or packaged native runtime evidence. Native claims must remain
partial/unverified until a supported Rust toolchain and the required Windows
runtime gates are executed against the same source snapshot.

## Status interpretation

The current implementation/status documents remain authoritative. In
particular, state-revision graph and branch-head CAS are a native foundation
with independent SQL evidence but remain **partial/unverified** pending native
compile/runtime, original-receipt replay, full CAS/rollback/branch/recovery and
concurrency evidence. Run-control features that depend on those guarantees
(pause/resume, Continue, immutable edit/retry and active-run compare) must not
be promoted to verified product capabilities from this receipt.

Do not infer from these checks that Omnia is production-ready, fully
multimodal, billing-safe, replay-safe, secure/hardened, signed, updater-enabled
or equivalent to a complete ChatGPT/Claude/Gemini/IDE/computer-use product.

## Re-run protocol

To refresh this evidence, stop writers, record the source manifest or commit
hash, run the commands above again, and append a new dated receipt. If a Rust
toolchain is available, add `cargo fmt --check`, `cargo check` and the focused
state-revision/native tests; record their exact exit codes and test counts.
