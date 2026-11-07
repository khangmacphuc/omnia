---
id: OMNIA-AUDIT-BRIDGE-NATIVE-PERSISTENCE-2026-08-15
title: Native multimodal bridge persistence review
status: evidence
version: 1.0.0
last_reviewed: 2026-08-15
---

# Native multimodal bridge persistence review

## Decision

The next multimodal implementation slice must begin at the native
**attachment-draft binding + run-preparation transaction**, then persist a
v2 bridge envelope and append-only stage receipts. It must not enable
attachment dispatch by serializing renderer-selected IDs, generic model
capabilities, derived text, or provider bytes into the current text-only
prepared-input flow.

The current UI's fail-closed attachment boundary is therefore correct and
must remain in place until this transaction exists.

This is a design/code review performed on August 15, 2026. It records the
actual storage seams and a safe implementation order; it is not evidence that
native bridge persistence or multimodal provider dispatch has shipped.

## Observed native foundations

The repository already has strong primitives that the bridge should reuse:

1. `attachment_drafts` capture the conversation/branch/project scope and
   enforce a terminal `bound` transition.
2. `attachment_binding_receipts` are immutable and preserve the exact
   draft/attachment/blob/run/message lineage after a bind.
3. `frozen_provider_inputs` are immutable, hash-validated, and bound to one
   run attempt. The renderer receives only an opaque receipt.
4. `run_journals` and `run_events` are append-only, cursor-replayable native
   lifecycle facts.
5. `blob_objects` retain encrypted native-owned content while renderer IPC
   deliberately excludes paths, keys, nonces, and plaintext bytes.
6. restart recovery already distinguishes a provider `outcome_unknown`
   attempt from a definitive failure at the provider-attempt layer.

These are the correct substrate for a durable bridge. A second renderer-owned
queue, a JSON file beside an attachment, or an unbounded `run_events` payload
would weaken those existing guarantees.

## Blocking implementation gaps

### P0: draft binding is schema-only today

`AttachmentRepository` implements ingest, get, list, remove, and abandon, but
does not expose a production bind operation. `Storage::prepare_conversation_run`
does not accept a draft ID or attachment selection and never transitions an
open draft to `bound`. Consequently, the existing `attachment_binding_receipts`
trigger cannot create a real receipt in the application path.

This matters because the schema intentionally permits draft-to-message rehome
only through that receipt. A bridge envelope must refer to the receipt and
its immutable blob hash; an arbitrary renderer attachment ID is not sufficient
authority or provenance.

### P0: current prepared input and gateway are text-only

`FrozenProviderInput` contains `FrozenProviderMessage { role, content }` and
the OpenAI, Anthropic, and Gemini request builders consume only those text
messages. There is no native attachment carrier, native provider-upload
receipt, bridge-plan binding, stage idempotency key, or provider media payload.

Therefore a persisted `direct-native` plan would currently be a planning fact
only. It must never be displayed as an executed native upload, and it must not
unlock the existing `start_prepared_attempt` path until the provider gateway
can consume a verified native bridge stage.

### P0: the renderer cannot supply trusted capability or source facts

The TypeScript planner is intentionally byte-free and useful for unit-tested
decision logic, but native persistence must recompute or verify every durable
input from native-owned rows and trusted broker records:

- recompute the source-manifest digest from binding receipts and blob hashes;
- derive MIME/type/modality from byte-sniffed native admission rather than a
  renderer label alone;
- obtain the current operation/model/API capability snapshot from the native
  provider registry or probe evidence, not a model-name heuristic;
- re-check policy, data class, residency, approval and egress immediately
  before each external stage; and
- treat all extraction/OCR/ASR/archive metadata as `untrusted_data`.

### P0: current run recovery is insufficient for external bridge replay

On restart, an active ordinary provider attempt becomes a durable
`attempt.outcome_unknown` plus a terminal failed run. This is appropriate for
the current text stream, but a bridge stage can be an upload, job, transform,
or provider inference with its own checkpoint and duplicate-charge risk.

Bridge recovery must persist a stage receipt with
`outcome-unknown` / `reconcile-required` first and must suppress blind retry.
The user or a reconciliation worker may create a successor plan/attempt only
after querying permissible provider evidence. It may not assume a failed
network call means no upload or no charge occurred.

## Required atomic preparation seam

Introduce a native operation conceptually named
`prepare_conversation_run_with_bridge`. The renderer may supply opaque draft
IDs and a requested mode/preference, but never bytes, paths, hashes, provider
file IDs, capability claims, or bridge-plan JSON as authority.

Within one SQLite transaction, in this order:

1. validate conversation, branch, provider, user/assistant/run/attempt IDs,
   requested mode, and every opaque draft ID;
2. create the user message, assistant draft, generation, first attempt, and
   the initial frozen text input exactly as the current preparation flow does;
3. validate each open draft's captured profile/project/conversation/branch
   scope, expiry, attachment count, and live blob ownership;
4. transition the selected draft(s) to `bound` using a unique native binding
   key and the newly created user message/run; let the existing trigger create
   immutable `attachment_binding_receipts`;
5. rehome the bound attachment rows to the user message only after receipts
   exist, preserving their original blob IDs and leaving receipts immutable;
6. build a native source manifest from receipts, including the original blob
   SHA-256, normalized filename/MIME, byte size, native selector, data class,
   sniff result, and no path/byte payload;
7. resolve a non-`auto` bridge plan against a current capability snapshot and
   current policy/authority state; persist the immutable v2 envelope;
8. persist the finite stage DAG and an initial `prepared` receipt for the
   admission stage; append a lightweight journal event that points to the
   envelope/receipt IDs; and
9. return a renderer-safe preparation receipt containing opaque envelope/plan
   IDs, resolved mode, truthful disposition, reason codes, and visible stage
   summaries only.

Any failure rolls back messages, draft binding, receipts, prepared input, and
bridge records together. No external process, provider request, blob read, or
transform starts inside this transaction.

### Draft selection rule

The present schema binds a *draft* and creates receipts for every live
attachment inside that draft. The renderer currently remembers individual
attachment IDs but not the draft grouping. Before enabling send, make the
composer model draft-centric:

- either bind one draft containing the exact selected files; or
- allow multiple draft IDs and bind every file in each selected draft.

Do not claim that an arbitrary subset of a draft was sent unless the schema and
native bind operation are explicitly extended to preserve subset receipts.

## Suggested v9 storage shape

The exact table names may vary, but the invariant boundaries must remain.

| Object | Suggested durable record | Required immutable bindings |
| --- | --- | --- |
| v2 envelope | `multimodal_bridge_envelopes` | `run_id`, optional predecessor envelope, request/plan/source-manifest/capability/route digests, resolved mode, disposition, policy revision, egress boundary, created timestamp |
| original source | `multimodal_bridge_sources` | envelope ID, attachment binding receipt `(draft_id, attachment_id)`, blob/hash, selector, declared/sniffed type, data class digest; never a path or raw bytes |
| capability decision | `multimodal_bridge_capability_snapshots` | exact provider operation, model/API profile revision, observation/expiry/freshness, evidence digest and admitted limits |
| route decision | `multimodal_bridge_route_decisions` | envelope ID, candidate-set digest, selected/rejected modes and deterministic reasons, planner revision; no authority grant |
| frozen DAG | `multimodal_bridge_stages` + dependency rows | stage ID, kind, input/output contracts, boundary, tool/model/parameter revisions, cancellation/recovery policy |
| stage attempt evidence | `multimodal_bridge_stage_receipts` | envelope/stage/run/attempt, plan digest, idempotency scope/key, fresh authority check, acceptance evidence, checkpoint, status, usage/cost coverage, classified error |
| reconciliation | `multimodal_bridge_reconciliations` | receipt ID, reason codes, status, evidence IDs, resolved-at; append-only successor records rather than mutation of historical evidence |
| derivative lineage | `multimodal_bridge_derivatives` | source receipt/artifact, output blob/hash, transform/tool/parameter digest, loss declaration, retention/cache-policy digest |

Use compact bounded JSON only for structured, redacted reason/evidence lists
that need schema evolution. Store IDs, hashes, status, timestamps, and
lineage as indexed columns so recovery and inspectors do not reconstruct them
from opaque payloads. Preserve SQLite `STRICT`, foreign keys, scoped profile
checks, append-only triggers, and bounded lengths.

The envelope should be immutable. A changed capability snapshot, policy,
approval, source/derivative hash, plan, correction, retry, or reconciliation
result creates a successor envelope or stage receipt; it must not update the
historical route in place.

## Binding to the existing prepared-input and journal contracts

`frozen_provider_inputs` must not remain the only dispatch proof once a bridge
exists. Add an immutable one-to-one dispatch-manifest binding, or extend the
prepared input contract so native dispatch validates all of the following in
the same transaction before an external stage starts:

```text
run + attempt + frozen provider input
  + bridge envelope + frozen plan digest
  + source manifest digest + selected stage receipt
  + current policy/approval/capability recheck
```

The exact dispatch binding must be checked before marking a provider-facing
stage `dispatched`. A stage receipt then records provider acceptance as
`not-dispatched`, `accepted`, `rejected`, or `unknown`; it must never be
inferred from a later response body.

`run_events` should remain a compact, cursor-replayable timeline projection.
Do not use `payload_json` as the canonical envelope, transform output, OCR,
media data, provider body, credentials, cookie, path, or base64 store. Add
bridge lifecycle event types only as ID/digest/status pointers to the canonical
tables, for example:

```text
bridge.envelope_prepared
bridge.stage_prepared
bridge.stage_dispatched
bridge.stage_checkpointed
bridge.stage_completed
bridge.stage_failed
bridge.stage_outcome_unknown
bridge.reconciliation_required
bridge.reconciled
bridge.unsupported
```

Because `run_events.event_type` currently has a SQL `CHECK` allow-list, this
requires a reviewed v9 migration that rebuilds the table/index/trigger set (or
an equally durable compatible extension) rather than silently inserting an
unknown event value. The renderer projection must map these events to bridge
states without treating them as provider text/usage facts.

## Restart, retry, and cache rules

1. On startup, inspect nonterminal bridge stage receipts before attempting any
   automatic recovery.
2. A local deterministic transform may be resumed/reused only when the source
   hash/selector, tool/model revision, parameters, policy, data class,
   retention/cache policy, and output contract still match.
3. A provider upload/job/inference with an unknown acceptance outcome becomes
   `reconcile-required`; automatic retry is prohibited until reconciliation
   proves the effect did not occur or a user explicitly selects a new
   successor attempt with understood risk.
4. A stale capability snapshot, expired approval, changed provider profile,
   changed source hash, or plan digest mismatch causes `replan-required`, not
   mutation or reuse of a historical plan.
5. Local transform cache and provider-native cache must be recorded under
   different authority/usage fields. A local hit must never be counted as
   provider cached input.

## Minimum focused native tests

Before the composer sends an attachment, add native tests for:

1. atomic preparation binds a valid open draft, creates all immutable
   attachment receipts, rehomes exactly those attachments, and persists one
   plan/envelope without a path or blob byte in renderer receipts;
2. cross-conversation, cross-branch, expired, deleted, empty, duplicate, or
   already-bound draft selection rolls back the entire preparation transaction;
3. a plan source must match receipt blob hash and selector; a renderer hash,
   MIME, data class, provider file ID, or capability claim cannot override it;
4. an unsupported/no-egress plan persists truthful `unsupported` with no
   provider dispatchable stage and leaves provider bytes untouched;
5. current/stale capability and current/expired approval cause the expected
   direct/local/replan/blocked result;
6. immutable plan/source/receipt triggers reject updates and deletion;
7. stage status transitions are contiguous, source/attempt-scoped, and
   preserve provider acceptance / idempotency / reconciliation evidence;
8. a crash after a provider-facing stage begins produces
   `outcome-unknown` + `reconcile-required`, never an automatic duplicate
   upload or inference;
9. run-journal replay and bridge inspector read reconstruct the same durable
   stage order without exposing paths, secrets, cookies, headers, base64, or
   artifact content; and
10. a text-only run continues to use the existing frozen-input path unchanged.

## Smallest safe implementation order

1. Implement native draft-centric bind/rehome inside `prepare_conversation_run`
   or a clearly named successor command, with tests. Keep dispatch disabled.
2. Add v9 envelope/source/stage/receipt persistence and read-only inspector
   projection. Persist `unsupported` and local-preparing states first.
3. Add native byte-sniffed admission and a local-only deterministic transform
   stage under the trusted content store. Add restart/reconciliation fixtures.
4. Extend the provider gateway with a separate verified media-carrier contract
   and atomic bridge-stage dispatch binding. Only then enable
   `direct-native`, specialist, hybrid, or surrogate-to-primary provider paths.
5. Add bridge telemetry/usage, cache attribution, retries, and one shared
   composer/inspector/background/accessibility projection.

This order preserves truthful product behavior at every checkpoint: a route
may be planned and inspected before it is executable, but it is never
presented as a successful provider multimodal dispatch until native receipt
evidence exists.
