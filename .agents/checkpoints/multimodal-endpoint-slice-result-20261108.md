# Multimodal generation endpoint planning slice

Date: 2026-11-08

## Goal

Close one measured gap in the multimodal media ledger with a provider-agnostic,
capability-gated generation endpoint plan. The slice is intentionally metadata
only: native code can use the plan as an input to a later dispatch stage, while
the renderer cannot manufacture provider payloads or claim a provider job was
accepted.

## Implemented

- `src/domain/media-generation-endpoint.ts`
  - validates immutable prompt revision/hash and frozen artifact IDs;
  - maps image/video/audio/document generation intent to endpoint operations;
  - validates and reuses the native-owned `ProviderEndpointCapabilitySnapshot`;
  - requires generation/bidirectional direction and native/model-gated support;
  - fails closed for stale/unknown evidence, model mismatch, modality mismatch,
    and declared width/height/duration/variant constraints;
  - emits a deterministic request fingerprint and scoped idempotency key;
  - includes only redacted capability evidence and metadata in the projection;
  - always keeps `providerWirePayload: null`.
- `src/domain/media-generation-endpoint.test.ts`
  - 5 tests / 5 assertions groups covering admission, deterministic hashing,
    stale and adapter-gated evidence, mismatch/constraint failures, and prompt
    hash boundaries.
- `src/domain/index.ts` exports the new contract.

## Verification

- `node_modules\\.bin\\tsc.cmd --noEmit --pretty false` — passed.
- `npm.cmd exec vitest -- run src/domain/media-generation-endpoint.test.ts --pool=threads --poolOptions.threads.singleThread=true --reporter=dot` — passed (1 file, 5 tests).
- The returned plan contains no prompt text, provider wire body, file path, or
  bytes. This is verified structurally in the focused test.

## Coverage and remaining boundary

This closes the capability-admitted planning portion of the media-generation
slice. It does **not** claim provider probing, upload, dispatch, artifact
persistence, download provenance, or encrypted document decoding. Those remain
native/provider work and are represented as blocked until an authoritative
adapter and receipt are connected.
