---
id: OMNIA-AUDIT-RELEASE-PROVENANCE-2026-09-09
title: Release provenance and source-manifest audit
status: observed-failure
date: 2026-09-09
scope: current working tree at C:\\Users\\khang\\source\\repos\\Omnia
---

# Release provenance and source-manifest audit

## Result

The current working tree is **not eligible for a Phase 1 preview or release
claim** based on the preserved `omnia-0.1.0-phase1-preview` evidence. The
preserved manifest and executable evidence describe an older August 2026
snapshot, while the current tree contains substantial additional source,
schema, contract, and test files. The historical evidence must remain labeled
historical until a new candidate is frozen and rebuilt as one evidence chain.

This is a provenance finding, not an implementation failure. It prevents a
stale manifest or binary from being presented as evidence for the September 9
working tree.

## Reproduction

Run from the canonical repository root:

```powershell
node scripts/verify-source-manifest.mjs --json
```

Observed on September 9, 2026:

```text
ok: false
snapshotId: source-manifest:sha256:44beef1a358bdd93d6d05eb23f9ba040f19ee7884de7e34af4a990655051de12
manifest entries: 163
source files: 543
missing: 1
extra: 381
mismatched: 67
structural issues: 1 (non-deterministic-order)
```

The missing path is:

```text
src/features/workspace/screens.tsx
```

The extra set includes current `docs/omnia-ultra/**` specification and schema
files, current audit receipts, new native/renderer modules, test fixtures, and
diagnostic outputs. The hash mismatch set includes core files such as
`README.md`, `docs/IMPLEMENTATION_STATUS.md`, `docs/storage-schema.sql`,
`src-tauri/src/storage.rs`, `src-tauri/src/multimodal_bridge.rs`, and the
renderer entry points. These differences are expected when the source tree has
moved on, but they make the August manifest invalid for this snapshot.

The verifier's current policy excludes generated/build material such as
`.cargo-target-test`, `.cargo-target-verify`, `target`, `dist`, `node_modules`,
and `artifacts/`. It rejects symlinks and requires deterministic UTF-8 path
ordering. The structural-order failure is therefore a property of the
preserved manifest, not evidence that generated caches belong in a candidate
source snapshot.

## Historical artifact boundary

The following files retain their original August 12/13, 2026 provenance and
must not be relabeled as current evidence without a fresh build:

- `artifacts/Omnia_0.1.0-phase1-preview_RELEASE_EVIDENCE.md`
- `artifacts/Omnia_0.1.0-phase1-preview_RELEASE_RECEIPT.json`
- `artifacts/Omnia_0.1.0-phase1-preview_x64-setup.exe`
- `artifacts/omnia-desktop-phase1-preview.exe`
- `docs/releases/omnia-0.1.0-phase1-preview-source.sha256`

The preserved receipt may document what was observed in August, but it does
not prove the current September tree, current dependency lockfiles, current
toolchain, or current packaged binaries.

## Current release blockers

No current candidate evidence was produced by this audit. The release lane
therefore remains an unsigned internal/developer preview, and these items are
still unverified or absent:

- immutable candidate source revision or newly generated source manifest;
- lockfile and dependency provenance for the candidate;
- current renderer and native gate results from a supported toolchain;
- current package hashes and packaged Windows smoke evidence;
- Authenticode identity/signature verification;
- updater, rollback, clean-VM install/upgrade/uninstall, backup/restore, and
  SBOM evidence.

The host check also found no `AGENTS.md` under the canonical repository and no
`cargo`, `rustc`, or `rustfmt` executable on `PATH` or at
`C:\\Users\\khang\\.cargo\\bin\\`. Consequently this audit does not claim
Rust formatting, Clippy, native tests, packaging, or packaged-app behavior.

## Candidate hand-off procedure

When the implementation slice is intentionally frozen, create a new
candidate-specific evidence directory or receipt that records, in one chain:

1. source revision or immutable source-manifest hash;
2. exact exclusion policy and deterministic file list;
3. Node/npm, Rust/Cargo, Tauri CLI, and Windows build environment;
4. lockfile hashes and dependency/license/SBOM outputs;
5. renderer, schema, native, security, accessibility, visual, and migration
   gate results;
6. package names, SHA-256 hashes, Authenticode status, and timestamp;
7. packaged Windows 11 smoke and recovery results;
8. explicit limitations and sign-off authority.

Do **not** overwrite the historical Phase 1 manifest or receipt. A candidate
must use a distinct, date/versioned name so that an old binary cannot be
mistaken for a build of the current source tree.

## Evidence classification

| Item | Classification | Reason |
| --- | --- | --- |
| Source-manifest verifier | Implemented diagnostic | Runs without mutating the tree and reports exact missing/extra/hash/order findings. |
| Preserved Phase 1 manifest | Historical | Fails against the current tree; its hash and file list describe an older snapshot. |
| Preserved Phase 1 binaries | Historical diagnostic artifacts | No current source/build/package chain has been established by this audit. |
| Current release claim | Blocked | Candidate source, toolchain, package, signature, and clean-VM evidence are not joined. |

