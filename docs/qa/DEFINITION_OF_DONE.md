---
id: OMNIA-DOCS-DEFINITION-OF-DONE
status: normative-guidance
version: 1.0.0
last_reviewed: 2026-11-07
---

# Definition of done for Omnia feature slices

This checklist is the minimum completion contract for a feature slice in the
current Omnia tree. It applies to renderer, native, storage, provider,
workspace, and cross-surface work. A feature is not `Verified` because a
component exists or a design review passed; it is `Verified` only when the
applicable behavior and evidence are from the same source revision.

## 1. State the boundary before implementation

Every slice starts with a short scope note that names:

- the user job and entry points;
- what the slice intentionally does not do;
- the owning renderer, native, schema, and test files;
- the required acceptance IDs from
  [`delivery/acceptance-gates.md`](../omnia-ultra/delivery/acceptance-gates.md);
- the runtime boundary (browser preview, Tauri desktop, or both).

Use the status vocabulary in [`README.md`](../README.md): `Proposed`,
`Accepted`, `In progress`, `Implemented`, `Verified`, and `Deferred`. Keep
`Preview`/`Partial`/`Planned` descriptions in `IMPLEMENTATION_STATUS.md` when a
slice has useful code without a complete user journey.

## 2. Define the complete user journey

The implementation and its acceptance evidence must cover the states that are
possible for the surface:

- loading and initialization;
- empty and first-use;
- success, including streamed or incremental output where applicable;
- cancellation and close/reopen behavior;
- offline, timeout, provider rejection, and other recoverable errors;
- denied or unavailable capability states;
- partial or outcome-unknown results; and
- restart/reconnect recovery where the feature persists data.

A control that is visible but has no supported path must say so in the UI and
in the status matrix. Do not label a renderer rehearsal as a native operation.

## 3. Preserve contract, provenance, and authority

For any persisted or externally visible effect, document and test:

- the versioned domain/IPC contract and schema migration;
- ownership, scope, revision or cursor, idempotency key, and immutable lineage;
- the source of each displayed status, usage, cost, timing, and provider fact;
- recovery and reconciliation for a lost or ambiguous outcome; and
- deletion, retention, export, and redaction behavior.

Provider capabilities must be explicit. Unsupported parameters, adapters,
operations, or model features fail closed with an actionable explanation;
they are never silently dropped or reported as effective. Secrets, raw
credentials, private prompts, response bodies, and sensitive local paths stay
outside ordinary logs, fixtures, exports, and renderer state.

## 4. Meet interaction and accessibility gates

The surface must have semantic names and roles, keyboard and focus behavior,
visible focus, sensible tab order, and accessible loading/error announcements.
Verify responsive layout at the supported window sizes and DPI/scale settings;
record any known limitation for high contrast, IME, screen readers, zoom, wheel,
pinch, or touch input. Destructive, network, credential, and permissioned
actions require the same confirmation and denial semantics as the surrounding
product.

## 5. Produce same-snapshot evidence

Attach the exact source revision, environment, command, and result for the
smallest useful evidence set:

- focused domain/component/native tests for changed behavior;
- schema or migration validation for persisted changes;
- static/type/lint checks for affected packages;
- build or bundle checks when module graph or shipped assets change; and
- manual or packaged smoke evidence when the acceptance gate requires a real
  Tauri window, OS integration, provider, filesystem, or signed artifact.

Evidence must distinguish **observed** results from source inspection and
historical receipts. A test that was not run on the current revision cannot be
used to promote a capability to `Verified`.

## 6. Update the smallest authoritative document set

Before marking a slice complete, update the documents that own its claims:

| Change | Required documentation |
| --- | --- |
| User-visible workflow or state | UI specification, component contract, acceptance checklist |
| New or changed persisted object | domain contract, `storage-schema.sql`, migration/recovery evidence, security architecture when sensitive |
| Provider, routing, or run behavior | provider/harness contract and conformance or fault evidence |
| Trust boundary, permission, or secret handling | `THREAT_MODEL.md`, `security-storage-architecture.md`, and denial-path evidence |
| Runtime/library/protocol decision | an accepted ADR |
| Developer command, setup, or repository layout | root `README.md` |
| Current implementation or evidence status | `IMPLEMENTATION_STATUS.md` and a dated receipt when material |

Keep examples provider-neutral and secret-free. Update `docs/README.md` when a
new normative document is added so contributors can find its source of truth.

## 7. Completion record

The final handoff for a slice should include:

1. scope and files changed;
2. status (`Implemented` or `Verified`) and the exact boundary;
3. acceptance IDs exercised;
4. commands and results, including any intentionally skipped gate;
5. known limitations and follow-up work; and
6. links to the updated contract and evidence receipt.

If any required item is missing, leave the slice `In progress`, `Partial`, or
`Deferred` and record the blocker. Do not convert an implementation plan into
a shipped-capability claim.
