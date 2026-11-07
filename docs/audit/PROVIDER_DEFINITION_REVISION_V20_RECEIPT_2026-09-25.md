# Provider-definition revision v20 receipt

Observation date: September 25, 2026  
Evidence class: source/static plus SQLite/schema probes; native runtime not observed

## Scope

Schema v20 adds immutable, content-addressed provider-definition revisions for
prepared provider attempts. A revision captures the bounded transport and
routing definition selected at preparation time, including an opaque
`credential_ref` handle. Credential bytes, request bodies, prompts, response
content, cookies, attachment bytes, and local paths are not stored in the
revision or renderer receipts.

## Implemented path

- `provider_definition_revisions` has immutable update/delete guards, profile
  scope guards, profile/hash uniqueness, and profile/time lookup indexes.
- Provider-attempt lineage persistence records the revision ID in the same
  SQLite transaction as the frozen provider input and lineage fact.
- Dispatch proof resolves the historical revision by its opaque revision ID,
  re-canonicalizes and hashes it, checks that it matches the lineage facts,
  and separately requires the current provider profile to remain enabled and
  owned by the active profile.
- Transport fields used to build the provider client come from the immutable
  revision, while disabled/deleted profiles still fail closed.
- Pre-v20 lineage rows without a revision ID fail closed for dispatch rather
  than being reconstructed from a mutable profile.

## Focused evidence

```text
python scripts/verify-provider-attempt-lineage-schema.py       PASS
npm.cmd run verify:run-control-storage                         PASS
npm.cmd run verify:cursor-authority:required                   PASS
python scripts/verify-rust-helper-definitions.py               PASS
```

The run-control storage probe now separates the v20 provider-definition suffix
from the v15–v19 run-control redaction scan. This keeps `credential_ref` as an
opaque native handle without weakening the run-control prohibition on persisted
credential, prompt, response, cookie, URL, request-body, attachment-byte, or
absolute-path columns.

## Claim boundary

`cargo`, `rustc`, and `rustfmt` are unavailable on this host. Rust compilation,
Tauri startup, packaged Windows behavior, provider HTTP, crash recovery, and
multi-client concurrency remain unverified. The receipt therefore proves a
source/SQL contract and not a production dispatch guarantee.
