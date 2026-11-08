# Native RAG context envelope — cycle 9

**Observed:** 2026-11-08, Asia/Bangkok  
**Owner:** `/root/cycle9_native_rag_impl`  
**Scope:** native context admission only; no renderer, provider adapter, or packaged Windows claim.

## Change

`src-tauri/src/storage.rs::append_context_admission_messages` now wraps every
retrieved workspace chunk in an explicit untrusted-data envelope. The envelope
preserves source ID, relative path, chunk ID, and the original content while
instructing the downstream model to treat the body as reference material and
not follow instructions found inside it. Existing content hash, token, scope,
and size validation remains unchanged and runs before insertion.

The native context-admission regression now checks the opening marker, the
untrusted-data instruction, the content delimiters, and the closing marker.

## Verification

| Check | Result |
| --- | --- |
| `git diff --check` scoped to changed source | Pass for `src-tauri/src/storage.rs`; unrelated pre-existing research files have trailing whitespace |
| Source inspection | Pass; envelope is emitted only after `validate_context_admission_draft` |
| Native test/build | Not run; AGENTS contract reserves serialized Cargo builds for the root integrator |
| Current source SHA-256 | `868313f67a177d536c77e99dcc3485a613a2730658fadbb3e5b6aec239e695f7` (`src-tauri/src/storage.rs`) |

## Claim boundary

This is a clean-room native source hardening change. It does not prove that a
packaged Tauri command delivered the context, that a provider received it, or
that the renderer displays the receipt. Those remain open cycle-9 evidence.
