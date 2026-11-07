# Omnia provider-neutral multimodal input design

Status: normative design and conformance target; not yet a shipped capability  
Last reviewed: 2026-08-13  
Scope: attachments selected in Omnia, frozen run input, native content resolution, provider capability negotiation, deterministic wire translation, telemetry, and safe failure behavior

This document specializes the canonical provider protocol in
PROVIDER_ARCHITECTURE.md. It does not make the current live gateway
multimodal. IMPLEMENTATION_STATUS.md remains authoritative: the installed
provider path is text-only until the complete native attachment vertical slice
and the gates below are wired and verified.

## 1. Decision summary

Omnia will not let the renderer construct provider image, audio, document, URL,
base64, multipart, or file-path payloads.

The renderer may select native-owned attachment IDs. Before dispatch, the
trusted core must:

1. durably bind those attachment IDs to the exact user message and run;
2. freeze their selected representation in the context/run snapshot;
3. prove profile, project, conversation, message, and provider egress scope;
4. resolve encrypted content through the native content store;
5. revalidate the content hash, media type, size, and selected transform;
6. negotiate the frozen model and adapter capability snapshot;
7. compile the provider payload deterministically;
8. persist only redacted translation provenance, never the transient base64
   body or decrypted bytes;
9. dispatch through the existing native egress and credential gateway.

Unsupported and unknown modality states fail closed. Omnia may offer an
explicit extracted-text, OCR, transcription, rasterization, or provider-upload
transform, but it must never silently substitute one representation for
another.

## 2. Security and truthfulness invariants

The following are release-blocking invariants:

- Renderer IPC contains attachment IDs and frozen selection IDs only. It never
  contains an arbitrary local path, file URL, remote URL, blob descriptor,
  wrapped key, decrypted bytes, or base64 payload.
- An attachment can enter a request only after it is durably owned by the exact
  message/run or selected by the exact frozen context snapshot.
- Project ownership is not a substitute for message/run authorization.
- A deleted, revoked, quarantined, incomplete, hash-mismatched, or unavailable
  attachment cannot be sent.
- Native bytes are read only after route eligibility and provider data-class
  policy pass.
- Model-name heuristics are not capability evidence. Unknown support is not
  treated as supported.
- Provider extensions cannot override canonical messages, attachment data,
  endpoint, authentication, stream controls, or security-owned fields.
- Role or modality loss is either rejected or recorded as a named transform
  selected before dispatch.
- Raw provider payload capture is off by default. If a future diagnostic mode
  retains it, it must be explicit, encrypted, bounded, redacted where possible,
  and governed by a short retention policy.
- Retry and fallback reuse the frozen input. They cannot re-read a changed file
  or send the data to a new provider that was not authorized for its data
  classes.
- Provider-side file IDs are opaque remote resources with provider/profile
  scope, retention, expiry, and deletion state. They are not reusable global
  attachment IDs.

## 3. Four representations, never one overloaded attachment object

### 3.1 Draft selection

The composer owns only:

    DraftAttachmentSelection {
      attachmentId
      observedState
    }

This is presentation state. It is not proof that content is safe or authorized
for dispatch.

### 3.2 Durable attachment record

Native storage owns:

    AttachmentRecord {
      attachmentId
      profileId
      projectId?
      messageId?
      blobId
      filename
      mediaType
      byteSize
      contentSha256
      ingestionState
      quarantineState
      deletedAt?
    }

Blob cryptographic metadata remains in native storage and is never projected to
the renderer.

### 3.3 Frozen run selection

Run preparation creates an immutable selection:

    FrozenAttachmentSelection {
      attachmentId
      messageId
      runId
      contentSha256
      mediaType
      byteSize
      selectedRepresentation
      transformVersion?
      transformOutputSha256?
      capabilitySnapshotId
      providerProfileId
      providerModelId
      dataClasses
    }

selectedRepresentation is one of:

- native-inline-image
- native-inline-audio
- native-inline-file
- provider-upload
- extracted-text
- OCR-text
- transcript-text
- rasterized-pages
- omitted

Every non-native representation records why it was selected and which
deterministic transform/version produced it.

### 3.4 Ephemeral resolved input

Only native code may create:

    ResolvedProviderBinary {
      attachmentId
      filename
      mediaType
      contentSha256
      verifiedBytes
    }

This value is short-lived, bounded, non-serializable across IPC, and excluded
from logs and crash diagnostics. It is destroyed after request construction and
dispatch ownership transfer.

## 4. Required transaction boundary

The safe prepare path is one native transaction plus a bounded content
verification stage:

    composer selection
      -> native prepare request with attachment IDs
      -> verify draft ownership
      -> create/finalize user message
      -> bind attachments to that message
      -> create run and attempt
      -> create/freeze context snapshot
      -> persist frozen attachment selections
      -> commit
      -> resolve and verify encrypted blobs
      -> compile provider input
      -> mark attempt dispatching
      -> send

If the transaction fails, no partially bound message/run may be dispatched. If
blob resolution fails after commit, the attempt becomes failed before remote
acceptance and the durable user message remains inspectable.

The provider command must ultimately take an attempt ID or a frozen provider
input ID, not a second renderer-authored copy of conversation messages. Keeping
conversation_run_prepare and start_provider_run as two independently writable
message inputs would allow drift between the persisted record and the bytes
actually sent.

## 5. Canonical content protocol

The next provider protocol version is block-oriented:

    CanonicalMessage {
      role
      content[]
    }

    CanonicalContent =
      InputText {
        text
        authority
        sourceRef
        contentSha256
      }
      | InputImage {
          attachmentSelectionId
          detail
        }
      | InputAudio {
          attachmentSelectionId
        }
      | InputFile {
          attachmentSelectionId
          filename
        }
      | ToolCall
      | ToolResult
      | Refusal

The durable protocol references frozen selections. Bytes appear only in the
ephemeral native compiler representation.

InputText created by extraction, OCR, transcription, or rasterization must keep
its source attachment, transform version, output hash, trust level, citation
mapping, and omission/selection reason. Retrieved document text is untrusted
data; it is never concatenated into a system or developer instruction.

## 6. Capability snapshot

Each selected model freezes a modality capability snapshot with:

    InputModalityCapability {
      state: native | emulated | unsupported | unknown
      evidenceSource
      allowedMediaTypes[]
      allowedRoles[]
      deliveryMethods[]
      maxParts
      maxRawBytesPerPart
      maxRawBytesTotal
      maxEncodedRequestBytes
      maxPixels?
      maxPages?
      maxDurationMs?
      adapterVersion
      modelDescriptorVersion
      observedAt
    }

Evidence precedence follows PROVIDER_ARCHITECTURE.md. A provider-live claim may
tighten or disable an adapter-static claim. User descriptive metadata can
inform the UI, but it cannot by itself authorize a native modality.

Capability checks happen twice:

1. route planning checks the frozen descriptor before reading bytes;
2. the adapter compiler checks the exact resolved parts and byte counts before
   encoding.

Any disagreement fails with a stable pre-dispatch error.

## 7. Deterministic compiler pipeline

The compiler stages are:

1. Validate IDs, role order, content-block count, and frozen snapshot identity.
2. Validate attachment ownership, availability, transform state, and
   content-hash binding.
3. Validate modality capability and exact media-type allowlist.
4. Validate raw-byte, pixel/page/duration, part-count, and total-request bounds.
5. Compute base64 expansion and JSON framing overhead before allocation.
6. Translate canonical roles and blocks to provider-native JSON.
7. Emit a loss report and translation notes.
8. Canonicalize and hash the effective provider input metadata.
9. Materialize authentication only in the egress gateway.
10. Dispatch without logging or persisting the transient body.

Encoding must be all-or-nothing. A compiler must not encode several large parts
and then discover that a later part makes the request invalid.

## 8. Adapter mapping

### 8.1 OpenAI Chat Completions adapter

- Text maps to text content parts.
- Supported images map to image_url content parts with an in-memory data URL.
- Explicit image detail maps only when the selected adapter/model capability
  declares equivalent support.
- Audio may map only for explicitly supported formats and models.
- Generic file/PDF input is unsupported in the Chat Completions adapter.
  Extracted text is a separate visible transform. Native files belong in a
  future OpenAI Responses adapter or a reviewed provider-upload path.
- System and developer content must be text-only in this adapter.

### 8.2 Anthropic Messages adapter

- Text maps to text blocks.
- Supported images map to base64 image source blocks.
- PDF maps to a document block only when both adapter and frozen model
  capability explicitly support it.
- Audio is unsupported until Anthropic exposes and Omnia implements a reviewed
  native input contract.
- Developer instructions are folded into the system instruction only with a
  persisted translation note.
- Binary content is accepted only on user messages.

### 8.3 Gemini generateContent adapter

- Text maps to text parts.
- Explicitly supported image, audio, and document inputs map to inlineData
  parts.
- Large content should use a future provider-upload lifecycle instead of
  unbounded inline data.
- Assistant maps to model; system/developer content is compiled into
  systemInstruction with a translation note for developer-role folding.
- Exact MIME support remains capability-gated per model.

### 8.4 Compatible and local endpoints

Sharing an OpenAI-shaped transport does not imply multimodal support. A
compatible endpoint must supply trusted capability evidence or pass an explicit
conformance probe. Omnia must not infer vision/audio/file support from model
names, provider branding, or a successful text request.

## 9. Provider-upload lifecycle

Inline base64 is not suitable for every file size or provider. A future remote
upload is a first-class effect:

    ProviderFileLease {
      leaseId
      providerProfileId
      providerModelScope?
      attachmentSelectionId
      remoteFileId
      remoteContentSha256?
      state
      createdAt
      expiresAt?
      retentionPolicyVersion
      deletionState
    }

Upload, poll, attach, reuse, expiry, and deletion are individually journaled.
A remote file ID can be reused only when profile, provider, content hash,
purpose, retention policy, and user routing policy still match. Provider
fallback cannot reuse a file lease from another destination.

## 10. Stable pre-dispatch errors

The native boundary should normalize at least:

- attachment_not_bound
- attachment_scope_violation
- attachment_deleted
- attachment_quarantined
- attachment_ingestion_incomplete
- attachment_blob_missing
- attachment_integrity_failed
- provider_capability_unknown
- unsupported_input_modality
- unsupported_media_type
- unsupported_input_option
- multimodal_transform_required
- provider_input_too_large
- provider_input_too_many_parts
- provider_upload_required
- provider_upload_failed
- provider_upload_expired
- provider_payload_compile_failed

These errors are semantic, non-billable, and occur before the attempt is marked
accepted by the provider.

## 11. Telemetry and inspector

Per attempt, retain bounded metadata:

- attachment and representation counts by modality;
- raw bytes, estimated encoded bytes, and provider-upload bytes;
- transform type/version, duration, and cache hit/miss;
- capability snapshot/evidence source;
- adapter/version and translation-note codes;
- compile latency and upload latency;
- request-body size, never body contents;
- provider acceptance state and remote request/file IDs where safe;
- authoritative versus estimated input token/byte accounting;
- explicit omission and rejection reasons.

The run inspector must show exactly which representation was sent. It must not
label extracted text as a native PDF/image input or an inline image as a remote
provider file.

## 12. IPC evolution

Interim renderer request:

    PrepareConversationRunRequest {
      ...
      attachmentIds[]
    }

Target provider dispatch:

    StartPreparedAttemptRequest {
      attemptId
      frozenProviderInputId
    }

The target removes renderer-authored messages and parameters from the dispatch
command. Native storage becomes the only source of the effective provider
request.

Protocol capability names should be versioned independently:

- attachment.pick.v1
- attachment.ingest.v1
- attachment.bind-message.v1
- context.freeze.v1
- provider.input-blocks.v1
- provider.multimodal.inline.v1
- provider.file-upload.v1

The renderer enables an affordance only after the initialize handshake declares
the required end-to-end capability, not merely because a component exists.

## 13. Implementation slices

### Slice A: durable ownership

- Resolve the draft-attachment owner design.
- Implement picker, encrypted blob publication, attachment repository, restart
  hydration, deletion, and quarantine state.
- Atomically bind selected IDs to the user message/run.

Exit gate: a renderer cannot bind another profile, project, conversation, or
message attachment.

### Slice B: extraction and frozen context

- Implement extraction attempts and indexed attachment sources.
- Freeze selected chunks and citations.
- Preserve transform/version/hash provenance.

Exit gate: a run can be replayed with the exact same selected text and
citations after restart.

### Slice C: native image input

- Add provider-input block contracts.
- Resolve/verify images from encrypted storage.
- Implement OpenAI, Anthropic, and Gemini image translators behind explicit
  capability snapshots.
- Add deterministic request fixtures and strict limits.

Exit gate: all adapters pass shared positive and negative image conformance
tests; unknown model vision support fails closed.

### Slice D: PDF and audio

- Add Anthropic/Gemini native PDF where explicitly supported.
- Add Gemini/OpenAI audio only for reviewed exact formats.
- Add extracted-text/OCR/transcript transforms as separately inspectable
  representations.

Exit gate: no UI or telemetry confuses native input with a transform.

### Slice E: provider uploads

- Add upload leases, provider retention disclosure, cleanup, retry, expiry, and
  fallback isolation.

Exit gate: remote content lifecycle is observable and deletable without
retaining secrets or raw payloads in logs.

## 14. Conformance matrix

Every adapter must test:

- text-only regression;
- one image, multiple images, and mixed text/image order;
- unknown, unsupported, and explicitly disabled modality;
- MIME mismatch and MIME parameters;
- zero-byte and over-limit data;
- raw versus base64-expanded request limit;
- content-hash mismatch;
- duplicate attachment reference;
- attachment not bound to the attempt;
- deleted/revoked/quarantined attachment;
- assistant/system binary rejection;
- explicit image-detail loss;
- extraction transform versus native input labeling;
- cancellation during blob resolution, encoding, upload, and response stream;
- provider rejection before and after remote acceptance;
- retry/replay uses frozen bytes and hashes;
- provider fallback cannot widen the data destination;
- diagnostics contain no path, key, raw bytes, base64, signed URL, or prompt
  content.

## 15. Definition of done

Multimodal input is complete only when:

- the full picker-to-provider-to-restart vertical slice is implemented;
- dispatch is sourced from one frozen native input, not duplicate renderer
  messages;
- model capability and data-class routing are frozen and inspectable;
- all provider translations are deterministic and covered by golden fixtures;
- file/path/hash/scope and size-limit denial tests pass;
- cancellation and crash recovery have known durable outcomes;
- raw content is absent from normal logs and telemetry;
- UI truthfully distinguishes native, transformed, omitted, uploading, failed,
  and unsupported states;
- release packaging, migration, security, accessibility, and end-to-end gates
  pass.

Until then, Omnia must continue to report the live provider path as text-only.
