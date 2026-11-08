# Cycle 8 native capability negotiation receipt

- Criterion: `ADVSET-001`
- Owner: `/root/cycle8_native_capability`
- Scope: `src-tauri/src/capability_runtime.rs` and module registration in `src-tauri/src/lib.rs`.
- Source hashes at this receipt revision:
  - `src-tauri/src/capability_runtime.rs`: `dfe48a747298e24e85de3ca0943dcc3400635ba8306f890960a974dc723d5408`
  - `src-tauri/src/lib.rs`: `c9bb1d8c58d953cff62f9bae78e4d8dd905a4365d136a60ca659ef88d9265d8a`
  - `src-tauri/src/storage.rs`: `3b58e2183dc99352d4176d81b44ee692885590998698ea527015991811e59583`
- Source behavior:
  - Normalizes and validates native provider capability values (`none`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max`).
  - Resolves `ultra` to the highest explicitly advertised provider effort; unsupported values produce a durable rejected receipt.
  - Binds request to session, provider profile and model; rejects scope conflicts and stale settings revisions.
  - Records per-session settings/session revisions, capability hash, adapter revision, receipt hash and predecessor hash.
  - Restores a journal with per-session lineage validation and rejects tampered receipt hashes.
  - Preserves rejected receipts in the chain so later applied changes remain auditable.
- Tests: 14 Rust unit tests are defined in the module, including supported, unsupported, `xhigh`, `ultra`, dynamic-workflow gating, scope, stale revision, hot change, persistence, tamper and rejected-lineage cases.
- Verification:
  - `rustfmt --edition 2021 src-tauri/src/capability_runtime.rs`: passed.
  - `git diff --check -- src-tauri/src/lib.rs src-tauri/src/capability_runtime.rs`: passed.
  - `cargo test --manifest-path src-tauri/Cargo.toml -p omnia-desktop --test omnia_native --all-features capability_runtime -- --nocapture`: exit 0; **14 passed, 0 failed, 717 filtered out**, finished in 0.03s after a 7m47s serialized build. The executable was the native harness `src-tauri/src/native_test_harness.rs`.
- Boundary: Native capability negotiation and journal behavior are now verified in the native harness. Packaged Tauri command delivery, Windows UI behavior and live-provider capability negotiation remain unproven.


