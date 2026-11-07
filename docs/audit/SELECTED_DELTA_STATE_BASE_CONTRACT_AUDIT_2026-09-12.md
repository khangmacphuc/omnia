---
id: OMNIA-AUDIT-SELECTED-DELTA-STATE-BASE-2026-09-12
title: Selected-delta state-base contract and native enforcement gap
status: audit-open
date: 2026-09-12
scope: native-run-control/state-revision-graph
---

# Selected-delta state-base contract audit

## Executive result

The current native boundary performs useful fail-closed checks for
`historical-plus-selected-deltas`, but it does not yet prove the full
selected-delta contract described by the Omnia Ultra interaction and graph
documents. This is an intentional contract gap, not evidence that the native
resolver is safe to broaden by inference.

The current wire value is only:

```text
stateBase.selectedDeltaIds: string[]
```

The native resolver currently proves that each selected ID:

- is syntactically valid;
- belongs to the selected conversation/branch state-revision stream;
- has `status = accepted`;
- is not beyond the native accepted-head sequence watermark.

Those checks prevent cross-stream, candidate, rejected and future-head
references. They do **not** prove that the selected revisions are the deltas
the caller is authorized to apply to the historical source or that the
resolved digest represents the historical source plus exactly those deltas.

## Evidence reviewed

The following sources were compared on 2026-09-12:

- `src-tauri/src/run_control.rs`
  - `RunControlStateBase.selected_delta_ids` is an opaque ID list.
  - Pure validation requires a non-empty list for
    `historical-plus-selected-deltas`, but has no per-delta provenance fields.
- `src-tauri/src/storage.rs`
  - `validate_native_state_base` checks scope, accepted status, branch sequence,
    native head, digest algorithm/value/canonicalization and stored watermark.
  - It does not currently traverse selected-delta ancestry or validate a
    selected-delta edge manifest.
- `docs/omnia-ultra/interaction/run-control-edit-retry.md`
  - Requires origin, revision/hash, authority/data classification, inclusion
    reason and conflict/supersession result for every selected delta.
- `docs/omnia-ultra/architecture/state-revision-graph.md`
  - Defines `derives-selected-delta-from` and the child-to-source edge
    orientation.
- `docs/omnia-ultra/schemas/state-revision-graph.schema.json`
  - Defines the edge kind, but does not define a selected-delta manifest or a
    resolved-digest composition record.
- `docs/storage-schema.sql`
  - Stores immutable state-revision edges, including
    `derives-selected-delta-from`, but has no table that binds a run-control
    request's ordered selected-delta set to its source revision and resolved
    revision.

## Invariants that are still unspecified

Before native enforcement is tightened, the product/schema contract must
answer all of the following.

1. **Origin and ancestry**

   Is every selected delta required to be a direct child of the source, a
   descendant at any depth, or merely an accepted revision in the same stream?
   If ancestry is required, does the proof use parent edges, a
   `derives-selected-delta-from` edge, or both?

2. **Order and visibility**

   Is the request order authoritative? Must selected deltas be strictly
   increasing by branch sequence? May a later delta be selected without its
   accepted ancestors? What visibility/cursor rule applies when a delta and
   source were captured at different journal watermarks?

3. **Conflict and supersession**

   Which statuses and edge kinds exclude a delta? Does a `supersedes` or
   `conflicts-with` edge make the selected delta invalid, require an explicit
   resolution, or permit a preview-only result?

4. **Resolved-state identity**

   Is `resolvedStateRevisionId` an already-materialized accepted revision, or
   should the native layer derive a new immutable resolution revision from the
   source plus selected deltas? If it derives one, what operation fact and
   edge(s) are mandatory?

5. **Digest composition**

   Is the digest computed from an ordered canonical tuple of source revision,
   selected delta IDs, selected-delta hashes, manifests, authority snapshot,
   and policy revision? The current contract only carries a digest value and
   canonicalization revision; it does not specify the composition input.

6. **Authority/data classification**

   Where are per-delta origin, data class, inclusion reason, approval and
   redaction decisions durably stored? A list of IDs cannot authenticate these
   facts.

7. **Freshness and revocation**

   Must the resolver re-check approvals, grants, revocations, leases and
   external-effect reconciliation at the selected watermark, or is an
   accepted historical delta sufficient for executable retry?

## Current safe behavior

Until the contract is versioned, the safe native behavior is:

- retain the existing same-stream/accepted/horizon checks;
- reject malformed, duplicate, cross-stream, non-accepted or future selected
  IDs through the existing pure/native validators;
- do not fabricate provenance, edge, authority or digest-composition fields;
- do not silently convert a selected-delta request into `current-state`;
- do not silently promote a preview-only selected delta into executable state;
- expose the limitation as an integrity/coverage diagnostic when a future
  resolver cannot prove the required selected-delta facts.

## Required future contract change

The preferred next design is a versioned selected-delta resolution manifest,
bound immutably to the run-control operation. At minimum it should carry:

```text
sourceStateRevisionId
selectedDeltas[] {
  stateRevisionId
  originRevisionId
  revisionHash
  branchSequence
  sourceCursor
  authoritySnapshotId
  dataClass
  inclusionReason
  conflictResolution
  visibilityWatermark
}
resolvedStateRevisionId
resolvedStateDigest
digestCompositionRevision
```

The manifest must be canonicalized and hashed into the operation payload. The
native transaction should then verify, in one snapshot:

- source and every selected delta share the stream and permitted branch
  lineage;
- selected deltas are ordered and visible at the declared watermark;
- required `derives-selected-delta-from` edges exist with the normative
  child-to-source orientation;
- rejected, superseded, conflicted, revoked and outcome-unknown facts are
  excluded or explicitly resolved;
- the resolved revision/digest and operation fact bind to the exact manifest;
- replay returns the immutable original receipt and rejects payload drift.

## Regression-test gate for implementation

Do not mark this contract complete until native tests cover at least:

1. selected delta from a sibling branch is rejected;
2. selected delta that is accepted but unrelated to the source is rejected;
3. selected deltas in non-monotonic order are rejected or deterministically
   canonicalized according to the versioned contract;
4. missing or reversed `derives-selected-delta-from` edge is rejected;
5. superseded/conflicted/revoked/outcome-unknown selected delta is excluded or
   requires explicit resolution;
6. digest tampering or composition mismatch is rejected;
7. watermark/cursor mismatch is rejected;
8. exact replay returns the same immutable manifest and receipt;
9. a later accepted head does not silently alter a previously resolved
   selected-delta operation;
10. crash rollback leaves no orphan manifest, edge, revision or receipt.

## Decision

No production change is made by this audit. The existing native checks are
kept because they are strictly safer than trusting renderer-provided selected
deltas, while additional enforcement is deferred until the selected-delta
manifest, edge semantics and digest composition are made authoritative in the
schema and storage model.

