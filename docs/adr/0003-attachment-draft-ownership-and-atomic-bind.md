# ADR 0003 — Durable attachment drafts and atomic message binding

- Status: Accepted for incremental implementation
- Date: 2026-08-13
- Owners: storage, desktop, harness, provider, security

## Context

The native file picker runs before the durable user message and run exist. The
old attachment shape requires every row to belong immediately to either a
message or a project. Assigning a newly picked file to a project is incorrect:
it changes ownership, makes conversation-local selection ambiguous, and can
leak a draft into unrelated runs. Keeping the selection only in Zustand is
also unsafe because it cannot survive restart or establish a native audit
boundary.

Attachments additionally need to be bound to the exact user message, branch,
and run that consume them. A failed send must preserve a recoverable selection,
while a retry must not bind the same file set to a different message or run.

## Decision

### 1. Native-owned draft scope

The picker creates a durable `attachment_draft` owned by the active profile.
The draft contains opaque attachment IDs, an optional project/conversation /
branch scope, creation and expiry timestamps, and a lifecycle state:

```text
open -> bound
open -> abandoned
open -> expired
```

The renderer may display metadata and retain the opaque draft ID, but it never
sends a filesystem path, blob path, secret, or raw file handle. A draft must
contain at least one unique attachment ID. Removal is persisted natively and
cannot leave an empty draft.

### 2. Exact atomic bind

`conversation_run_prepare` accepts a draft ID and a stable binding key. In one
SQLite transaction, native code must:

1. validate profile, conversation, branch, project, and provider ownership;
2. lock and validate the draft is `open` and not expired;
3. validate every attachment belongs to the draft, is live, and belongs to the
   same profile;
4. create the user message with attachment references;
5. re-home the attachment rows from draft scope to that message;
6. create the assistant message, generation, and first attempt;
7. create the frozen attachment/context provenance references required by the
   run; and
8. mark the draft `bound` with the exact message/run target before commit.

No renderer-side sequence of “list then attach then send” is authoritative.
The transaction must either commit the complete relationship or leave all
rows unchanged.

### 3. Retry and failure behavior

The binding key is idempotency material. Replaying the same bind request after
a lost response returns the existing bound projection. A different message,
branch, run, profile, or project conflicts and is rejected. A provider failure
after preparation does not unbind the draft; the message/run history records
the failure and a user-visible retry creates a new attempt under the same
message/run policy rather than silently moving attachment ownership.

Drafts abandoned by explicit user action or expired by retention policy are
not bindable. Cleanup may remove only unreferenced attachment/blob metadata;
it must never delete a blob still referenced by a message, ingestion, source,
artifact, or audit record.

### 4. Provider projection

The durable attachment identity is provider-neutral. Before dispatch, the
harness resolves each attachment through a frozen run snapshot and translates
it to the provider's declared input form (native file part, inline bytes,
remote upload reference, or extracted text). Unsupported media or size limits
fail preflight without dropping the draft. The provider adapter never receives
native paths or unredacted storage metadata.

### 5. Security and recovery invariants

- Blob bodies remain encrypted in the native content store and are addressed by
  content hash; only opaque IDs cross IPC.
- Draft expiry is enforced by native storage, not by renderer timers.
- Profile, project, conversation, branch, and attachment scope are rechecked
  at bind time to prevent stale UI or cross-project reuse.
- Attachment extraction/index rows are derived records and are invalidated
  when their source attachment is deleted or its workspace authority changes.
- Native recovery must mark in-flight runs deterministically after restart;
  it must not recreate a user message from a renderer-only draft.
- Provider/model capability negotiation happens before dispatch; no unsupported
  attachment is silently converted or discarded.

## Consequences

The schema gains one small durable draft table and explicit attachment draft
commands. This adds migration/recovery work, but it removes duplicate writable
ownership projections and gives restart-safe, auditable attachment selection.
The existing message/project attachment columns remain useful for historical
bound records; the draft table is only a pre-message scope.

## Rejected alternatives

### Renderer-only draft IDs

Rejected because restart and multi-window races can lose or duplicate the
selection, and native code cannot prove which attachment set was approved.

### Temporary project ownership

Rejected because project ownership is durable semantic state, not a staging
area.

### Synthetic draft message

Rejected for now because a draft user message would collide with assistant
recovery semantics and complicate conversation ordering. If product later
needs offline draft transcript rows, that is a separate message-draft ADR.

## Implementation slices

1. Add `attachment_drafts` schema/migration with profile and scope checks.
2. Add typed native create/list/update/abandon commands; return only metadata and
   opaque IDs.
3. Extend picker to create a draft and attach blobs transactionally.
4. Extend `conversation_run_prepare` with `attachmentDraftId` and atomic bind.
5. Persist attachment IDs in message content/projection and expose a normalized
   catalog (`attachmentsById`, `messageAttachmentIds`, draft IDs).
6. Add extraction/index dispatch from bound attachment ingestion rows and freeze
   provider-ready multimodal projections.
7. Add restart, race, lost-response, expiry, scope-drift, blob-deduplication,
   unsupported-media, and deletion-retention tests.

## Exit gates

- no renderer raw path/handle reaches native mutation commands;
- concurrent bind attempts produce one bound result and one deterministic
  conflict/idempotent replay;
- a failed provider send preserves the attachment selection and provenance;
- restart hydrates open drafts and bound attachment metadata without loss;
- deleting an attachment cannot orphan source/chunk/citation provenance;
- schema migration and rollback tests pass;
- provider conformance tests cover text-only, native multimodal, inline, and
  extracted-text fallback paths.
