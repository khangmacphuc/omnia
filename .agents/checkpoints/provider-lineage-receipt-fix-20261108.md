# Provider lineage receipt contract fix — 2026-11-08

## Scope

The native provider-attempt lineage receipt now exposes the context-manifest pair
that is already part of the immutable lineage fact and JSON schema. The focused
secret-free deterministic receipt test was stale after context admission added
these two fields.

## Change

- `src-tauri/src/provider_attempt_lineage.rs`
  - Include `contextManifestId` and `contextManifestSha256` in
    `ProviderAttemptLineageReceipt`.
  - Project both fields from the validated lineage fact.
  - Assert explicit `null` values when context evidence is unavailable.
  - Extend the receipt allowlist to 18 schema fields.
  - Keep fact serialization compatible with the schema, which requires all
    fields to be present and unavailable evidence to be represented as `null`.

## Validation

```text
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
PASS

cargo test --manifest-path src-tauri/Cargo.toml -p omnia-desktop --test omnia_native --all-features provider_attempt_lineage::tests::lineage_hash_is_deterministic_and_receipt_is_secret_free -- --exact --nocapture
PASS — 1 passed, 712 filtered out
```

## Evidence boundary

This proves deterministic native hashing and a secret-free renderer receipt for
context-unavailable lineage. It does not claim live provider dispatch, billing,
packaged WebView2, or GitHub publication.
