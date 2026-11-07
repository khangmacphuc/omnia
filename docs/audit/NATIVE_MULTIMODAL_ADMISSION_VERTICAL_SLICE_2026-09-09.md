# Native multimodal admission vertical-slice receipt — 2026-09-09

## Scope

This receipt covers the native pre-bridge admission boundary only. It does not
claim provider-native file delivery, local transform execution, specialist
routing, renderer hydration, or full multimodal send capability.

## Contract verified by source inspection

- Opaque attachment draft IDs are the only attachment input accepted by native
  run preparation.
- Binding, message/run/attempt creation, frozen text input, source-manifest
  construction, planning-only bridge plan, admit-stage receipt and journal
  pointer share one SQLite transaction.
- Source artifacts require exact immutable binding-receipt provenance.
- Planning-only stage receipts reject an approved-provider boundary and any
  provider acceptance other than `not-applicable`.
- Unknown syntactically canonical MIME values return
  `attachment_media_type_unclassified`; no durable `unclassified` modality is
  allowed and the admission transaction rolls back.
- A prepared input with bound attachments remains blocked by the text-only
  provider gateway with `multimodal_bridge_required`.

## Same-snapshot evidence

Frontend gates on 2026-09-09:

- `npm run typecheck` — pass.
- Focused multimodal/composer tests — 7 files, 54 tests passed.
- Full frontend suite — 55 files, 359 tests passed.
- `npm run build` — pass.
- `npm run check:bundle` — pass.
- `npm run tokens:check` — pass.
- `npm run check:acl` — pass.
- `npm run check:typography` — pass.
- `npm run check:hit-targets` — pass.
- Host-side SQLite smoke check for the v9 fixture plus v10 hardening SQL — pass;
  this validates the migration SQL shape only and is not a substitute for the
  native Rust test binary.
- `docs/omnia-ultra/tools/validate-spec.ps1` — pass (112 Markdown files,
  38 JSON files, 112 unique document IDs, 55 requirements, 55 capability rows).
- `npm run twin:bootstrap` followed by `npm run twin:check` — pass on the same
  snapshot. The generated hash is recorded by the Project Twin manifest rather
  than duplicated here, avoiding a self-referential evidence hash.

Native source tests added or retained in this slice include:

- `attachment_draft_admission_binds_immutable_receipts_and_blocks_text_only_dispatch`;
- `attachment_provenance_mismatch_rolls_back_every_admission_write`;
- `unknown_canonical_mime_rolls_back_the_complete_admission_transaction`;
- `attachment_admission_replay_requires_the_exact_draft_set_but_ignores_order`;
- `v9_bridge_rows_migrate_to_v10_without_widening_authority`;
- `file_backed_attachment_admission_survives_close_and_reopen`;
- `selector_mime_and_modality_registry_are_canonical_and_fail_closed`;
- current-schema migration coverage from the v8 fixture through schema v10;
- a populated v9 bridge fixture that preserves trusted plan, artifact and local
  stage rows while asserting the v10 receipt-provenance and planning-only
  provider-stage guards.

## Verification limitation

No Cargo/Rust executable is available on this Windows host (`cargo` and
`rustc` are absent from PATH and the checked local runtime locations). Native
format, compilation, integration-test and restart/reopen gates therefore
remain **unverified** in this receipt. This limitation is intentional and must
not be converted into a native `Verified` or `Shipped` claim.

## Truthful status

**Partial — native pre-bridge foundation.** The next gate is a supported Rust
toolchain run of migration, replay, tamper, restart and integration tests,
followed by the provider-carrier contract and reconciliation slice.
