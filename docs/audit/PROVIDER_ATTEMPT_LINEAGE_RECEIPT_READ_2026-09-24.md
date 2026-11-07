---
id: OMNIA-AUDIT-PROVIDER-ATTEMPT-LINEAGE-RECEIPT-READ-2026-09-24
title: Provider attempt lineage receipt read slice
status: development-evidence
date: 2026-09-24
---

# Provider attempt lineage receipt read slice

## Scope

This slice adds a read-only, renderer-safe path for inspecting the immutable
provider-attempt lineage fact already written with a prepared provider input.
The request is scoped by `conversationId`, `branchId`, `runId`, and `attemptId`.
It never grants dispatch authority and never reconstructs a receipt from the
current mutable provider profile.

## Changed surfaces

- `src-tauri/src/provider_attempt_lineage.rs`
  - Added the strict `ReadProviderAttemptLineageRequest` address contract.
- `src-tauri/src/storage.rs`
  - Added historical lineage reads from one SQLite transaction.
  - Historical reads validate frozen-input integrity and lineage scope, but do
    not require the provider profile to remain enabled or undeleted.
  - Added cross-scope and soft-profile-deletion regression tests.
- `src-tauri/src/native_commands.rs` and `src-tauri/src/lib.rs`
  - Registered `provider_attempt_lineage_read` behind the existing guarded IPC.
- `src/lib/desktop.ts`
  - Added the typed bridge and renderer-safe receipt DTO.
- `src/features/workspace/inspector.tsx` and `src/styles/chat.css`
  - Added the Run Inspector's `Frozen provider attempt` read-only projection.
  - Browser preview and missing native receipts remain explicitly unavailable.
- Focused tests cover guarded IPC, scoped receipt rendering, unavailable-state
  handling, and redaction.

## Evidence from the September 24, 2026 moving snapshot

- `npm.cmd exec -- vitest run src/features/workspace/inspector.provider-lineage.test.tsx src/features/workspace/inspector.telemetry.test.tsx src/lib/desktop.native-session.test.ts --pool=threads --maxWorkers=1`: **19/19 passed**.
- `npm.cmd run typecheck:app -- --pretty false`: **PASS**.
- `npm.cmd run build:renderer`: **PASS**, 2,009 modules transformed.
- `npm.cmd run check:imports`: **PASS**, 299 production modules / 643 local imports.
- `npm.cmd run check:typography`: **PASS**.
- `npm.cmd run check:hit-targets`: **PASS**.
- `git diff --check`: **PASS**.
- `npm.cmd run smoke:preview`: **PASS**, HTTP 200 with Omnia/HMR markers at `http://127.0.0.1:1420/`.

## Boundary and next gate

The host has no `cargo`, `rustc`, or `rustfmt` available on `PATH`, so Rust
compilation, Tauri startup, packaged Windows execution, and provider HTTP are
not verified by this receipt. The next native provider phase is a migration for
durable historical provider-definition snapshots and a dispatch proof that can
use that exact snapshot without rereading mutable profile fields; it must keep
soft deletion/revocation and credential-purpose checks fail-closed.
