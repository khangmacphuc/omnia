# State-revision graph contract audit — September 10, 2026

## Finding

The repository currently contains **two intentionally different graph
contracts**:

1. `docs/omnia-ultra/schemas/state-revision-graph.schema.json` is the rich
   Omnia Ultra **normative target**. It describes a portable graph export and
   inspection envelope with scope, projection watermarks, actor/causation,
   manifest references, authority, routing/cache snapshots, state digests,
   journal cursors and graph-integrity diagnostics.
2. `src-tauri/src/storage.rs::StateRevisionGraphSnapshot` and
   `src/lib/desktop.ts::StateRevisionGraphSnapshot` are the current native IPC
   **runtime projection v1**. They are deliberately compact and redacted for a
   bounded branch read. They expose only stream/scope IDs, a bounded accepted
   head, branch-watermark facts, redacted revision/edge projections and a
   coarse integrity state.

The current IPC payload therefore **does not validate against** the rich JSON
schema. This is a contract mismatch if the IPC DTO is presented as a direct
instance of `state-revision-graph.schema.json`; it is not a defect in the
redaction boundary by itself. The schema's front matter says
`status: normative-target`, while the native implementation status remains
partial/unverified.

## Field-level comparison

| Rich target field | Current native IPC field/evidence | Result |
| --- | --- | --- |
| `schemaVersion` | `schemaVersion: 1` | compatible value, but different envelope version semantics are not yet declared |
| `graphId` | absent | missing; no stable export/projection identity |
| `scope.profileId` / `projectId` | profile is native-default and project is not returned | missing/redacted; cannot satisfy target scope object |
| `scope.conversationId` / `branchId` | top-level `conversationId` / `branchId` | relocatable by adapter only |
| `projection.watermarkId` / `throughCursors` / `materializedAt` | `throughBranchSequence` only | missing journal/projection watermark provenance |
| `headStateRevisionIds` | nullable `acceptedHeadStateRevisionId` plus sequence | shape/semantics differ; target permits explicit multiple heads |
| `stateRevisions` | `revisions` | relocatable by adapter; native rows are compact and omit target state-read/manifests/authority/routing/causation |
| target `stateRevision.stateDigest` object | `revisions[].stateDigest` string | shape differs; algorithm/canonicalization are not carried in the read DTO |
| target `createdAt` RFC3339 | `revisions[].createdAtMs` integer | representation differs; conversion must be explicit and timezone-safe |
| `edges` | `edges` | partial compatibility; native edges omit actor, cursor, expiry and reason |
| target `graphIntegrity` object | `integrity: "valid" | "recovering" | "invalid"` | shape differs; diagnostics/checker revision/timestamp absent |
| `generatedAt` | absent | missing |

The native projection also intentionally omits raw manifest, authority and
routing JSON. An adapter must not reconstruct those values from mutable
tables or invent placeholders. If a rich export needs them, it must read the
immutable typed facts at one fixed watermark and preserve omission/redaction
state explicitly.

## Contract decision

Until a versioned adapter or a unified DTO is implemented:

- treat the rich schema as a **future export/inspection contract**, not as the
  wire schema of `state_revision_graph_read`;
- treat the Rust/TypeScript DTO as `native-state-revision-graph-read-v1`, a
  bounded internal projection whose redaction and fixed-watermark semantics
  are authoritative for the current slice;
- do not claim that the rich schema validates native IPC responses;
- do not widen the native DTO by adding target fields with guessed values;
- keep graph reads fail-closed when the accepted-head projection or bounded
  lineage is inconsistent.

## Required adapter boundary

The eventual adapter should be a pure, versioned transformation with an
explicit source watermark and coverage result:

```text
native-state-revision-graph-read-v1
  -> graph-export-adapter-v1
  -> state-revision-graph.schema.json
```

The adapter must either load the complete immutable facts needed by the rich
schema in the same SQLite snapshot or return an explicit `partial`/
`review-required` result. It must never synthesize:

- `graphId`, projection cursors, generated timestamps or checker diagnostics
  that are presented as historical facts;
- actor, causation, authority, routing/cache or manifest references that were
  not captured for the selected revision;
- multiple heads from a single accepted-head projection;
- RFC3339 timestamps or digests without documenting the conversion and
  algorithm/canonicalization source.

The adapter acceptance gate should include rich-schema validation, fixed-
watermark replay, redaction checks, candidate-versus-accepted separation,
edge orientation (`child -> parent`), legacy coverage handling and close/
reopen parity. The current native graph tests and IPC session tests remain
valid tests of the compact v1 projection; they are not rich-schema tests.

## Evidence and status

Observed in the September 10, 2026 working tree:

- native and TypeScript DTOs agree with each other on the compact payload;
- fixed-watermark and close/reopen graph-read tests exist in
  `src-tauri/src/storage.rs`;
- renderer IPC tests exercise the compact payload and fail closed outside
  Tauri;
- no runtime adapter or JSON-schema validation test connects the compact DTO
  to `state-revision-graph.schema.json`;
- Rust toolchain/runtime evidence is unavailable on this host, so the native
  graph capability remains partial/unverified.

This audit closes the ambiguity about whether the existing JSON schema is an
active IPC contract: it is not. A future implementation may promote the
adapter to a verified export contract after the gates above pass.
