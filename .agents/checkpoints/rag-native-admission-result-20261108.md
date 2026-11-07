# Native RAG admission evidence — 2026-11-08

## Scope

Close the native provider-input admission evidence gap for the workspace
retrieval path while preserving the frozen-input authority boundary.

## Implementation

- `src-tauri/src/native_commands.rs`
  - Extracted the live retrieval compiler used by `conversation_run_prepare`.
  - The renderer supplies only the opaque workspace grant and query; native
    scope checks, index construction, bounded selection and content hashes are
    authoritative.
  - Added an end-to-end native test using a temporary workspace grant.
- `src-tauri/src/storage.rs`
  - Emits a redacted `contextAdmission` pointer on `attempt.created` after the
    selected retrieval is frozen into the provider input and context snapshot.
  - Pointer contains snapshot IDs/hashes, query/index hashes and bounded counts
    only; source text and paths are excluded.
- `src-tauri/src/run_journal.rs`
  - Accepts the native context pointer as part of the preparation journal
    payload without changing provider dispatch authority.

## Verification

```text
cargo check --manifest-path src-tauri/Cargo.toml --offline                         PASS
cargo test --manifest-path src-tauri/Cargo.toml -p omnia-desktop --test omnia_native \
  --offline live_context_admission_populates_frozen_provider_input_and_journal_pointer \
  -- --nocapture                                                                  PASS (1/1)
```

The test proves that a live native retrieval result becomes a developer context
message in the frozen provider input, that the final user prompt remains last,
that the context content hash is retained, and that the durable journal pointer
is content-free and hash-consistent.

## Boundary

This closes the native population/admission evidence for workspace lexical/MMR
retrieval. Provider-side embedding and reranker execution still require a live
provider adapter and fixture, so the RAG criterion remains partial until that
capability is implemented and verified.
