# ADR 0006 — Native Multimodal Bridge Admission Authority

- Status: Accepted for the native pre-bridge admission slice; provider delivery remains gated
- Date: 2026-08-15
- Last amended: 2026-09-09
- Owners: storage, attachment, bridge, provider, security, desktop
- Supersedes: the implementation-order portions of ADR 0003 that describe
  attachment binding before the v6 receipt/re-home guards existed

## Context

Omnia has the durable primitives needed to make an attachment selection
auditable:

- attachment drafts are native-owned, profile-scoped, expiring records;
- schema v6 creates immutable `attachment_binding_receipts` when a draft is
  transitioned from `open` to `bound`;
- schema v6 permits attachment re-homing only through that receipt;
- schema v9 persists immutable bridge plans and stage receipts, and verifies
  each planned artifact against the exact user-message attachment blob;
- the renderer receives only attachment metadata and opaque identifiers.

The production seam is nevertheless incomplete. `AttachmentRepository` has no
native bind operation. `Storage::prepare_conversation_run` creates text-only
frozen provider input and does not accept a draft. The bridge persistence
wrapper opens its own SQLite transaction, while `prepare_conversation_run`
already owns one. Calling the wrapper from preparation would either break
atomicity or try to re-enter the storage mutex.

Opening attachment dispatch before resolving this is unsafe. It would make it
possible to display a direct/native route without a bound source receipt,
silently produce a text-only provider request, or reconstruct source hashes
from renderer supplied data.

## Decision

### Accepted amendment — fail-closed classification and v10 hardening

The native admission contract is deliberately stricter than a renderer-facing
review fallback. A syntactically canonical MIME value that is not mapped to a
trusted native modality is rejected with the typed error
`attachment_media_type_unclassified`. It is not persisted as an
`unclassified` artifact and it is not converted into a durable human-review
plan. The complete admission transaction rolls back: the draft remains open
and draft-owned, and no user/assistant message, generation, attempt, frozen
provider input, binding receipt, bridge plan, artifact, stage receipt, or run
journal event may remain from that attempt. `review-required` is still a valid
planning disposition, but only after the source has passed trusted MIME
classification and ordinary capability/policy evaluation.

Schema v10 is part of this accepted boundary. In addition to removing a
durable `unclassified` modality, it requires every bridge artifact to prove
exact immutable `attachment_binding_receipts` provenance for the plan's
profile/project/conversation/branch/message/run and exact source blob. It also
rejects planning-only stage receipts that claim an `approved-provider`
boundary or any provider acceptance other than `not-applicable`. These guards
are storage-level invariants, not renderer conventions.

This amendment does not claim provider-native multimodal delivery. The
provider gateway and public renderer command remain text-only and must fail
closed with `multimodal_bridge_required` whenever a prepared input has bound
attachments. The implementation status for this slice is therefore
**Partial — native pre-bridge foundation** until carrier, provider acceptance,
reconciliation, native-to-renderer hydration, and end-to-end evidence exist.

### 1. One trusted admission transaction is the authority boundary

The future production entry point is an internal native orchestration method:

```text
prepare_conversation_run_with_bridge(
  NewConversationRun,
  BridgeAdmissionIntent,
  NativeBridgeAdmissionAuthority
) -> PreparedBridgeAdmission
```

It owns one SQLite transaction and either commits the entire durable admission
record or commits none of it. It may not be exposed as a renderer IPC command
until the provider adapter can consume the frozen bridge manifest and produce
stage receipts/reconciliation evidence. The existing text-only
`conversation_run_prepare` remains unchanged and attachment dispatch remains
fail-closed in the composer until that end-to-end capability exists.

The required order inside that single transaction is:

```text
validate opaque client intent
  -> expire and validate open draft / exact captured scope
  -> create user message, assistant draft, run, first attempt
  -> freeze text-only provider input (current checkpoint)
  -> bind draft to exact user message + run using native binding key
  -> allow v6 trigger to create immutable binding receipts
  -> re-home attachments through those receipts
  -> rebuild source manifest from receipts and canonical attachment/blob rows
  -> resolve concrete bridge plan using trusted capability/policy authority
  -> persist immutable v9 plan and prepared admission-stage receipt
  -> append a compact run-journal pointer event
  -> return a renderer-safe bridge projection
```

The ordering is intentional. The v6 bound-receipt trigger requires the frozen
input, queued run, created first attempt, and draft assistant message to exist
before the draft can be marked `bound`. The receipt is created while each
attachment is still draft-owned; only then may rows be re-homed to the user
message. A re-home before the receipt is invalid under the v6 guards and must
never be reintroduced.

### 2. Split transaction-level primitives from public wrappers

The following primitives must accept the caller-owned transaction and must not
lock storage or commit independently:

```rust
attachment_repository::bind_draft_to_run_in_transaction(
    transaction,
    BindAttachmentDraftToRun { draft_id, user_message_id, run_id, binding_key, now_ms },
) -> BoundAttachmentManifest;

multimodal_bridge::persist_multimodal_bridge_plan_in_transaction(
    transaction,
    PersistMultimodalBridgePlan,
) -> MultimodalBridgeStateRecord;

multimodal_bridge::append_multimodal_bridge_stage_receipt_in_transaction(
    transaction,
    AppendBridgeStageReceipt,
) -> MultimodalBridgeStageReceiptRecord;
```

Existing storage-level convenience methods may remain as thin wrappers that
open a transaction and delegate to the primitive. The admission orchestration
method uses the primitives directly. This prevents nested transactions and
preserves all-or-nothing message, run, binding, source-manifest, plan, and
journal lineage.

### 3. Client intent is not bridge authority

The renderer may provide only bounded, opaque intent:

- a native draft ID (one draft binds its complete live attachment set);
- a requested route preference such as `auto` or `local-only`;
- an optional user-selected fidelity preference or explicit review request;
- ordinary prompt/run identifiers already validated by native preparation.

The renderer must not provide or derive any of the following facts:

- attachment byte hash, byte size, MIME type, filename, blob ID, blob path, or
  source manifest hash;
- resolved mode, disposition, selected/rejected route reasons, stage DAG, or
  stage status;
- egress decision, data boundary, capability snapshot revision, policy
  revision, destination provider/model, approval, or cost authority;
- plan ID, stage receipt ID, source selector, provider payload, base64 body,
  provider file ID, credential, cookie, header, or filesystem location.

`BridgeAdmissionIntent` is a request for evaluation, not a route grant. It
must use a separate type from the native-only resolved plan so serde/IPC cannot
accidentally deserialize authority-bearing fields from renderer JSON.

### 4. Native source manifests are rebuilt from immutable receipts

`BoundAttachmentManifest` is derived only after the draft becomes bound. Its
ordered source entries are built by joining:

```text
attachment_binding_receipts
  -> attachments
  -> blob_objects
  -> bound user message / run / first attempt
```

For every entry, native verifies all of the following before it becomes bridge
input:

- the receipt belongs to the target draft, profile, captured project,
  conversation, branch, exact user message, and exact run;
- the attachment is live, now message-owned, and still references the exact
  receipt blob hash;
- attachment byte size and canonical MIME match the durable row;
- the content-addressed blob ID is the canonical plaintext SHA-256;
- the selected source selector is a native-derived coordinate such as
  `region:full`, never a path or URL;
- artifact-derived text, OCR, captions, metadata, archive names, and model
  descriptions are classified as untrusted data rather than control text.

The manifest is sorted by deterministic receipt order (`attachment_id`, with a
documented stable tie-breaker) and hashed from a versioned canonical JSON
material. It is not a hash of a renderer list, database row order, a provider
payload, or a decrypted byte stream copied into memory merely for planning.

### 5. Authority facts must have a native provenance chain

`NativeBridgeAdmissionAuthority` is constructed by trusted kernel/broker code,
not by the Tauri command argument. It contains only revision-pinned,
freshness-checked references and evaluators for:

- provider/model/operation capability evidence, including MIME, size, carrier,
  fidelity, observed time, expiry, and evidence ID;
- data classification, local retention, provider egress policy, user approval,
  destination, and region constraints;
- local transform or specialist availability, sandbox profile, tool/model
  revision, hardware/resource admission, and fidelity declaration;
- deterministic route and rejection reasoning, including stale/unknown
  capability handling;
- retry/idempotency/reconciliation policy for any provider-bound stage.

At this checkpoint the provider gateway is text-only. Therefore a native plan
may be persisted only as a *prepared admission/planning fact*. No plan may be
reported as provider-uploaded, provider-accepted, billable, or direct-native
executed without a later explicit approved-provider stage receipt. A plan that
cannot be supported by the current runtime resolves truthfully to
`local-transform`, `human-review`, `unsupported`, or another documented
non-dispatchable disposition; it never silently downgrades to text-only.

### 6. Binding idempotency is native-derived and conflict-safe

The binding key is native-generated from a versioned canonical material that
includes the draft ID, target user-message ID, target run ID, first attempt ID,
and the draft's immutable captured scope. It does not include prompt body,
file path, raw attachment bytes, provider secret, or mutable UI state.

The helper has exactly these outcomes:

| Existing / requested state | Required result |
| --- | --- |
| Same open draft, same target, first use | Bind, create receipts, re-home, return manifest |
| Same already-bound draft and same native binding key/target | Return the existing bound manifest idempotently |
| Bound draft with any different target or key | Deterministic `attachment_binding_conflict`; do not move it |
| Missing, abandoned, expired, or empty draft | Deterministic validation error; do not create a partial run |
| Scope/profile/branch/project mismatch | Deterministic scope error; do not reveal cross-scope metadata |
| Receipt, attachment, or blob mismatch | `attachment_provenance_conflict`; roll back the entire preparation |

An idempotent replay is useful only if the original transaction committed and
the caller lost the response. If run/message creation did not commit, there is
no partially bound draft to recover.

### 7. Prepared projection is metadata-only and truthful

The return type may expose a compact `BridgePlanProjection` only after durable
admission facts exist. It contains opaque IDs and safe metadata:

```text
planId, requestedMode, resolvedMode, disposition,
capabilityFreshness, selectedReasonCodes, rejectedAlternatives,
fidelityProfile, dataBoundary, egressDecision,
stage summaries, reconciliation status, source count
```

It excludes paths, byte bodies, decrypted text, provider request bodies,
provider file IDs, headers, credentials, approval internals, and unredacted
policy material. All renderer surfaces (composer, run inspector, background
task drawer, timeline, and screen reader) render the same durable projection.
They may never infer a route from a model label or attachment MIME.

### 8. Recovery and later dispatch are separate authority phases

The admitted bridge plan freezes historical evidence; it does not carry an
evergreen right to dispatch. Immediately before every provider-bound stage,
the trusted broker re-evaluates current policy, grant, exact destination,
capability freshness, data class, approval, idempotency, and prior acceptance.

If a provider upload/job/inference loses transport after possible acceptance,
native appends `outcome-unknown` / `reconcile-required`. It must reconcile by
provider status, idempotency key, user decision, or documented compensation
before duplicate-risk replay. Neither retry, branch, fork, copy, nor restart
inherits active credentials, sessions, grants, approval, machine authority, or
an unverified provider-upload outcome.

## Consequences

This decision deliberately delays renderer-visible attachment send capability
until all authoritative stages are connected. It gives the future provider
adapter a canonical source manifest, creates a durable record that can be
replayed and audited after restart, and prevents historical planning evidence
from being confused with current dispatch authority.

It also makes the implementation boundary small and testable: the next code
slice can implement transaction-local bind/re-home and manifest construction
without pretending to support provider multipart/file upload yet.

## Rejected alternatives

### Bind in `AttachmentRepository`, then prepare the run separately

Rejected because the v6 trigger requires the run/attempt/frozen-input lineage
at bind time. Two commits create an observable state where a draft, message,
or receipt can exist without the exact run contract.

### Let the renderer supply a bridge plan after upload

Rejected because it makes renderer data authoritative for capability, source
hash, policy, egress, and provider acceptance. It also cannot survive lost
responses or multi-window races safely.

### Extend frozen provider input with opaque attachment IDs now

Rejected as an incomplete bridge. The gateway currently serializes only text;
adding IDs without an adapter-specific carrier and stage receipt would invite a
silent text-only downgrade or a false native-multimodal claim.

### Reconstruct the manifest from storage paths or decrypted source bytes

Rejected because it exposes a filesystem boundary and makes planning depend on
mutable storage topology. The content-addressed blob ID and durable receipt
already establish source integrity without exposing either.

## Required implementation tests

1. Atomic success: draft with multiple attachments produces one user message,
   one run/attempt/frozen input, receipts for every attachment, re-homed rows,
   deterministic source manifest, plan, prepared admission receipt, and one
   journal pointer in a single commit.
2. Rollback: invalid final artifact, stale authority, invalid plan, or journal
   failure leaves no messages/runs/attempts/frozen inputs/bound draft/receipts
   from the attempted admission.
3. Idempotency: replay after a committed transaction returns the same bound
   manifest and does not add receipts, plans, re-homes, or journal events.
4. Conflict: same draft targeting a different user message/run is rejected
   without modifying historical provenance.
5. Scope/expiry: cross-profile, project, conversation, branch, expired,
   abandoned, or empty drafts are rejected before user-message mutation.
6. Provenance: tampering with attachment blob, MIME, byte size, or receipt
   linkage prevents source-manifest construction and bridge-plan persistence.
7. Transaction discipline: static/behavioral test proves the bridge-plan helper
   called by admission does not acquire a second storage lock/transaction.
8. Truthfulness: a persisted planning record with no provider stage receipt is
   never projected as uploaded, accepted, incurred provider cost, or native
   execution.
9. Unknown external outcome: provider-bound stage with uncertain acceptance is
   persisted as reconciliation-required and cannot be blindly retried.
10. Restart: reopen after each commit boundary and verify durable receipt,
    manifest, plan, and projection reconstruct consistently; no source path or
    raw bytes appear in any safe DTO/journal projection.

## Implementation sequence

1. Add transaction-local bind/re-home/manifest helper and focused tests. Do
   not add IPC or remove composer fail-closed behavior.
2. Refactor bridge persistence into transaction-local primitives plus existing
   wrapper methods; add nested-transaction regression coverage.
3. Implement native `BridgeAdmissionIntent` and trusted
   `NativeBridgeAdmissionAuthority` contracts, then the one-transaction
   preparation method and journal pointer.
4. Add a metadata-only IPC projection only after steps 1–3 pass.
5. Add isolated transforms, provider carrier translation, explicit provider
   stage acceptance/reconciliation, and end-to-end UI states before enabling
   attachment dispatch.

## Exit gates for this ADR

- no public renderer command can bind a draft or persist a resolved bridge plan
  from renderer-supplied facts;
- no nested storage transaction exists inside the admission path;
- every planned artifact can be traced through immutable binding receipt to a
  message-owned attachment and its canonical blob hash;
- failed admission is atomic and leaves a usable open draft;
- a plan without a provider stage receipt is rendered as planning only;
- no source path, raw body, credential, cookie, header, or provider wire body
  crosses the projection boundary;
- focused native tests and schema integrity checks supply current evidence
  before the composer is allowed to send an attachment.
