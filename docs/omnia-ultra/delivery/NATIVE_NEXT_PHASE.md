---
id: OMNIA-DELIVERY-NATIVE-NEXT-PHASE
title: Native runtime next phase
status: planned
---

# Native/runtime next phase (after the UI-first preview)

This note is a source-first implementation queue. It is not a claim that the native runtime is currently green.

## Current boundary

- Browser preview is available at `http://127.0.0.1:1420/`.
- Renderer UI, local previews, portable exports, and truthful capability labels are the active surface.
- Rust/Tauri compilation and packaged Windows execution remain unverified on this host because `cargo`, `rustc`, `rustfmt`, and `rustup` are unavailable.

## Ordered implementation slices

1. **Toolchain and desktop smoke gate**
   - Install/verify pinned Rust, Tauri CLI, Windows SDK, and WebView2 prerequisites.
   - Run `cargo check`, `cargo test`, `cargo fmt --check`, and a packaged launch smoke.
   - Record machine, toolchain, commit, and artifact hashes.

2. **Context compiler authority**
   - Define a native context-manifest receipt matching the renderer preview schema.
   - Resolve folders, instructions, memories, and skills through native scope/revision checks.
   - Emit omission reasons, token accounting, source hashes, and an immutable context revision.
   - Keep renderer `ContextManifestPreview` reference-only until this receipt is available.

3. **Exact approval and capability bridge**
   - Move the in-memory exact-approval prototype behind `AppState` and a durable repository.
   - Revalidate profile/session, environment revision, policy hash, target handles, budgets, and expiry on every dispatch.
   - Add outcome-unknown recovery and duplicate-dispatch rejection before enabling process/browser/computer capabilities.

4. **Provider and run journal completion**
   - Persist normalized provider/tool/approval/artifact/agent/memory events with idempotent ingress.
   - Add replay cursors, export checkpoints, retry lineage, and cross-process sequence tests.
   - Expose native source/coverage/freshness fields to the Observability preview.

5. **Machine/runtime layer**
   - Add typed machine/environment records, leases, attestation, resource limits, and crash recovery.
   - Implement workspace handle identity/reparse/TOCTOU checks and verified backup/restore paths.

6. **Acceptance and release gates**
   - Run the focused UI suite first, then native contract/security tests, then packaged desktop smoke.
   - Regenerate source-ledger and Project Twin on the same frozen snapshot.
   - Do not promote a capability from `Planned`/`Partial` to `Verified` without same-snapshot evidence.

The UI can keep expanding independently while these slices are implemented; all renderer-only workbenches must continue to say `Preview`, `Renderer-local`, `No durable write`, or `Planned` where appropriate.
