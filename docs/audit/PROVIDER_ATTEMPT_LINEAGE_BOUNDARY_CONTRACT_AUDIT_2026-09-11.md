# Provider-attempt lineage boundary contract audit

Date: 2026-09-11  
Scope: `provider_attempt_lineage.rs`, the lineage SQLite DDL, the JSON lineage
schema, and the native storage decode path.  This note is intentionally
content-free: it records validation behavior and does not include provider
URLs, credentials, request bodies, prompts, or attachment data.

## Current verdict

The primary lineage contract is present and independently verifiable:

- `python scripts/verify-provider-attempt-lineage-schema.py` passes.
- `python scripts/verify-state-revision-schema.py` passes, including
  `PROVIDER_ATTEMPT_LINEAGE_VERIFY: PASS`.
- The storage decoder constructs `ProviderAttemptLineageFact` and calls its
  typed `validate()` method before the fact is used.
- The canonical endpoint fingerprint is supplied by
  `endpoint_fingerprint_sha256(...)`; storage does not reconstruct a second
  endpoint hash.
- The lineage fact binds the prepared-input timestamp, scope IDs, parameter
  hash, provider-definition hash, endpoint fingerprint, and adapter revision.

The independent verifiers do not currently exercise every boundary value,
however.  Four validators currently describe slightly different contracts.
These differences should be resolved before treating lineage validation as a
fully interchangeable contract across Rust, JSON, and SQLite.

## Evidence matrix

The following observations were reproduced against the source as of
2026-09-11.  “Rust” means `validate_effective_effort` and its
`validate_nonempty_bounded` helper; “JSON” means the `nullableText` definition
in `provider-attempt-lineage.schema.json`; “SQLite” means the
`effective_effort` `CHECK` in `storage-schema.sql`.

| Value | Rust | JSON | SQLite | Reason |
| --- | --- | --- | --- | --- |
| `native` | accept | accept | accept | Baseline valid value |
| ` native` | accept | reject | accept | JSON pattern rejects a leading whitespace character |
| `native ` | accept | accept | accept | No layer rejects trailing whitespace |
| ` native ` | accept | reject | accept | Same leading-whitespace difference |
| U+000B vertical tab | reject | reject | accept | Rust rejects every Unicode control; JSON/DDL explicitly reject only CR/LF/TAB |
| U+0000 NUL | reject | accept by pattern | reject in the tested SQLite expression | Regex/SQL engine handling differs for NUL |
| 40 × `é` (80 UTF-8 bytes) | accept | accept | accept | Boundary value under the Rust byte bound |
| 41 × `é` (82 UTF-8 bytes, 41 characters) | reject | accept | accept | Rust uses bytes; JSON Schema and SQLite use character length |

The storage preparation path currently applies `str::trim()` while extracting
`effectiveEffort` from `parameters_json`.  That masks surrounding whitespace
for normal prepared inputs, but it does not make direct typed construction or
malformed/legacy SQL rows equivalent to the JSON contract.

## Contract decisions to make

Choose one of the following explicit policies and apply it to all three
layers plus boundary tests.

### Policy A: Unicode-character contract (recommended for provider labels)

- Treat length as Unicode scalar-value count, not UTF-8 byte count.
- Reject leading and trailing whitespace (or change the JSON pattern to allow
  trailing whitespace; do not leave this accidental).
- Reject all Unicode control characters, including C0, DEL, and C1 ranges.
- Normalize/trim only at the preparation boundary, then validate the stored
  value again so direct typed construction has the same behavior.

This policy best matches a renderer-visible provider-native label and avoids
rejecting ordinary non-ASCII labels merely because they occupy multiple UTF-8
bytes.  It requires a JSON pattern that excludes the complete control ranges
and a SQLite check that does not rely solely on `length(...)` plus a
CR/LF/TAB glob.

### Policy B: UTF-8-byte contract (minimal native change)

- Keep Rust byte bounds authoritative.
- Document that JSON/SQLite are admission filters only and native validation is
  the final authority.
- Add a schema/DDL test showing that multi-byte values at the boundary may be
  accepted by admission and rejected by native decode.

This is simpler but makes “valid according to schema” not imply “valid in the
native runtime,” which is undesirable for a public contract.

### Policy C: Narrow printable-text contract

- Restrict `effectiveEffort` to a conservative ASCII/provider-label grammar,
  e.g. `[A-Za-z0-9._:/+-]` plus single internal spaces.
- Use the same grammar in Rust, JSON, and SQLite.

This removes Unicode ambiguity but could discard legitimate provider-native
effort labels and should only be adopted if the product explicitly wants a
display-safe ASCII identifier rather than evidence preservation.

## Required regression tests after choosing a policy

Add the same table-driven cases to the native unit tests and the independent
schema verifier:

1. `native`, ` native`, `native `, and ` native `.
2. Empty string and all-whitespace strings.
3. CR, LF, TAB, NUL, vertical tab, form feed, DEL, and a C1 control.
4. ASCII values at lengths 1, 80, and 81.
5. Non-ASCII values at the chosen character/byte boundary.
6. A direct `ProviderAttemptLineageFact` containing each invalid value.
7. A SQL-loaded row containing each invalid value, proving the storage decoder
   fails closed rather than returning an unvalidated fact.
8. Hash stability for the normalized/stored representation chosen by the
   policy.

Do not weaken the existing immutable-row, paired-ID/hash, scope, or
content-free receipt checks while adding these cases.

## Verification commands

```powershell
python scripts/verify-provider-attempt-lineage-schema.py
python scripts/verify-state-revision-schema.py
python -m py_compile scripts/verify-provider-attempt-lineage-schema.py
python -m py_compile scripts/verify-state-revision-schema.py
git diff --check
npm.cmd run typecheck
```

Native Rust verification remains conditional on the host providing `cargo`,
`rustc`, and `rustfmt`; do not report native tests as passed when those tools
are unavailable.

## Related dispatch concern

This audit is limited to lineage boundaries.  The provider gateway still needs
one atomic native dispatch proof that carries the loaded provider definition and
credential reference through request construction, followed by a final live
definition revalidation immediately before the durable dispatch transition.
Calling `get_provider_profile` and `provider_credential_ref` again after the
initial preparation read can create a profile/credential TOCTOU window even
when the lineage fact itself is correct.
