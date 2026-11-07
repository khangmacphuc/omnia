# Omnia Conversation and Branch Architecture

Status: implementation contract

Audience: kernel, storage, provider runtime, renderer, CLI, web and remote clients

Last reviewed: 2026-08-13

## 1. Decision summary

Omnia treats a conversation as a durable tree container, not as one mutable
message array. A project is optional. Every conversation belongs to exactly one
profile and owns at least one durable branch. Every message, run and background
producer is routed to a specific branch captured at creation time.

The canonical hierarchy is:

```text
profile
  -> project?                 optional organization and policy scope
    -> conversation           durable tree container
      -> branch               immutable-history and output-routing boundary
        -> task?              optional explicit goal/background work
          -> run              one logical requested outcome
            -> iteration      one model/tool-loop step
              -> provider attempt
                -> item/event
```

For ordinary chat, `task` is absent and a run attaches directly to a branch.
Projectless chat is not an error or a temporary compatibility mode: the
conversation is profile-scoped and remains eligible for memory, attachments,
citations, search, export and durable replay.

## 2. Scope invariants

1. A conversation has one immutable `profile_id` and zero or one mutable
   `project_id`.
2. A project, when present, must belong to the same profile as the conversation.
3. A conversation has one or more branches and exactly one active branch per
   client preference/projection. Active selection does not determine where an
   already-created producer writes.
4. A branch belongs to exactly one conversation. Its parent branch, when
   present, belongs to that same conversation.
5. A root branch has neither a parent nor a fork point.
6. A non-root branch has a parent and an explicit fork boundary. The boundary
   may be the conversation start, represented explicitly rather than by an
   ambiguous null with multiple meanings.
7. A fork point must be visible in the resolved parent path at the exact source
   revision/cursor used to create the branch.
8. Branch ancestry is acyclic. Missing parents, missing fork points and cycles
   are corruption states; clients must show recovery diagnostics rather than an
   empty conversation.
9. A message belongs to the same conversation as its branch. A local message is
   immutable after finalization. Editing creates a new branch and replacement
   message; it never rewrites the source branch.
10. A run stores `conversation_id`, `branch_id` and `user_message_id`. These
    fields are immutable after preparation.
11. A run's assistant projection belongs to the same conversation and branch,
    and references that producing run.
12. A provider attempt cannot exist without its semantic iteration/run parent.
13. Project reassignment changes future project-scoped context eligibility; it
    never rewrites the frozen provenance of existing messages or runs.

## 3. Projectless conversation semantics

The storage scope is represented as a tagged union, never inferred from a null
in an unrelated field:

```ts
type ConversationScope =
  | { kind: "profile"; profileId: ProfileId }
  | { kind: "project"; profileId: ProfileId; projectId: ProjectId };
```

Rules:

- Creating a conversation without a project creates a profile-scoped durable
  conversation and root branch in one transaction.
- Profile-scoped chats use global and conversation memory according to policy.
  They do not silently borrow project instructions, workspace grants, project
  files, project memory or project skills.
- Retrieval, citations, attachments, artifacts and context snapshots must all
  support profile/conversation scope; `project_id NOT NULL` cannot be used as a
  universal retrieval assumption.
- Moving a conversation into a project is an explicit command with a receipt.
  The move validates profile ownership. Previously frozen inputs retain their
  original scope and hashes.
- Removing a conversation from a project similarly affects only future runs.
- Search and library projections include projectless conversations instead of
  hiding or placing them under a synthetic project.

## 4. Branch path model

Each branch stores only messages created locally on that branch. Its visible
path is the immutable parent prefix through the fork boundary followed by local
messages:

```text
resolve(branch B):
  parent_prefix = resolve(B.parent) through B.fork_boundary
  return parent_prefix + B.local_messages ordered by local ordinal
```

The durable branch record must preserve:

```ts
interface BranchRecord {
  id: BranchId;
  conversationId: ConversationId;
  parentBranchId?: BranchId;
  forkBoundary:
    | { kind: "conversation_start" }
    | { kind: "after_message"; messageId: MessageId };
  sourceCursor: EventCursor;
  name?: string;
  createdAt: IsoTimestamp;
  createdBy: "user" | "retry" | "edit" | "compare" | "agent" | "recovery";
}
```

`sourceCursor` makes a fork deterministic even if the source branch is active.
If a producer has emitted partial output beyond that cursor, those later events
are not inherited. A fork made from an active turn must also record one of:

- `completed_only`: inherit only the last completed boundary;
- `interrupt_then_fork`: interrupt and terminalize the source producer first;
- `include_partial_as_interrupted`: inherit a durable partial item explicitly
  marked interrupted.

There is no implicit "whatever the UI currently shows" fork policy.

## 5. Command contracts

Commands request state changes. Each successful command appends durable events
and returns an authoritative receipt. Expected commands are:

```text
conversation.create
conversation.update_metadata
conversation.move_scope
conversation.archive
conversation.restore
conversation.soft_delete

branch.create
branch.activate
branch.rename
branch.archive

message.edit_as_branch
run.retry_as_sibling
run.regenerate_as_branch
conversation.compare_branches
```

### 5.1 Create branch

Input:

```ts
interface CreateBranchRequest {
  conversationId: ConversationId;
  sourceBranchId: BranchId;
  sourceCursor: EventCursor;
  forkBoundary:
    | { kind: "conversation_start" }
    | { kind: "after_message"; messageId: MessageId };
  activeProducerPolicy: "completed_only" | "interrupt_then_fork" | "include_partial_as_interrupted";
  activate: boolean;
  idempotencyKey: string;
  expectedConversationVersion: number;
  name?: string;
}
```

The native kernel validates the boundary against the source branch at
`sourceCursor`, creates the branch and appends `branch.created` in one
transaction. Replaying the same idempotency key returns the same receipt;
changing any canonical argument returns a conflict.

### 5.2 Edit user message

Editing is a compound native transaction:

1. validate the target user message is visible at the supplied source cursor;
2. create a child branch whose prefix ends immediately before the target;
3. append the immutable replacement user message with `replaces_message_id`;
4. optionally prepare a new run against the new branch;
5. append branch/message/run events;
6. optionally activate the new branch.

The original message and any descendant response remain intact on the source
branch. Attachments are rebound through native attachment ownership rules; a
renderer cannot reuse arbitrary attachment IDs from another message.

### 5.3 Retry and regenerate

- Transport retry stays within the same logical run only when provider
  acceptance/idempotency rules prove that it is safe.
- User-visible "Try again" creates a sibling outcome. It must not mutate the
  existing assistant message or conceal the previous attempt.
- Regenerate with changed model, parameters, context, skills, memory or policy
  creates a new run with a new frozen input and explicit comparison provenance.
- An `outcome_unknown` provider attempt is never resent automatically.

## 6. Output routing and concurrency

The active branch is navigation state, not a routing pointer. Every producer
captures an immutable `OutputRoute` before work starts:

```ts
interface OutputRoute {
  profileId: ProfileId;
  projectId?: ProjectId;
  conversationId: ConversationId;
  branchId: BranchId;
  taskId?: TaskId;
  runId: RunId;
  producerId: string;
  createdAtCursor: EventCursor;
}
```

Consequences:

- Switching the visible branch cannot redirect streaming output.
- A background research job or subagent continues writing to its originating
  branch unless an explicit typed handoff command changes the route.
- Opening the same conversation in two windows does not make either window the
  owner of the branch.
- Multiple runs may exist across sibling branches. Within one branch, the
  concurrency policy is explicit (`reject`, `queue`, or `parallel`) and frozen
  into each run; it is never inferred from one renderer-global `activeRun`.
- Notifications identify the destination conversation and branch. They do not
  force navigation or silently activate the producer's branch.

## 7. Durable event and projection model

Branch/conversation facts use the same append-before-publish rule as run facts:

```text
validate command
  -> append typed event(s)
  -> update materialized projection in the same SQLite transaction
  -> commit
  -> publish by durable cursor
```

Minimum event vocabulary:

```text
conversation.created
conversation.scope_changed
conversation.metadata_changed
conversation.archived
conversation.restored
conversation.deleted
branch.created
branch.activated
branch.renamed
branch.archived
message.appended
message.finalized
message.superseded
run.prepared
run.output_routed
run.terminalized
```

Events contain schema version, profile/conversation/branch/run identities as
applicable, monotonic cursor, correlation and idempotency keys, actor, timestamp
and canonical payload hash. Materialized `active_branch_id` is a convenience
projection and can be rebuilt from events.

Renderer subscriptions use `afterCursor` plus a pinned `throughCursor` for page
reads. They deduplicate by event ID/cursor and reject gaps. Reconnect or restart
replays committed events; transient webview delivery is never the sole source
of truth.

## 8. Storage requirements

The next conversation/run-graph migration must enforce lineage in SQLite, not
only in TypeScript:

- composite uniqueness sufficient for same-conversation references;
- branch parent and fork-point guards;
- message/branch/conversation guards;
- parent/replacement message lineage guards;
- generation/run user-message and assistant-message lineage guards;
- immutable branch ancestry and immutable finalized message provenance;
- event cursor uniqueness and gap-free append within its stream;
- atomic event append plus projection mutation;
- optimistic conversation version or equivalent compare-and-swap;
- idempotency-key table/receipt with canonical argument hash;
- no destructive cascade from project removal into a conversation moved to
  profile scope;
- integrity, quick-check and foreign-key verification after migration.

Do not add a generic untyped graph table as a second source of truth. Use typed
tables and typed edges; derive a graph projection for inspection.

## 9. Renderer contract

The renderer receives a validated branch projection with diagnostics:

```ts
type BranchProjection =
  | { status: "ready"; branch: BranchView; messages: readonly MessageView[]; cursor: EventCursor }
  | { status: "recovering"; lastValidCursor: EventCursor; diagnosticId: string }
  | { status: "invalid"; diagnosticId: string; safeActions: readonly RecoveryAction[] };
```

It must not:

- resolve a cycle or missing fork point to an empty message list;
- choose `runs.at(-1)` globally to infer the active branch status;
- flatten sibling branches into one timeline;
- assign fake branch counts or indices;
- fabricate tasks, iterations, context snapshots or environment identities;
- route events according to whichever conversation is currently visible.

The UI should expose branch ancestry, source fork point, active producers,
comparison provenance and recovery state. Until native branch commands exist,
edit/fork/retry controls remain visibly disabled or labelled planned.

## 10. Migration and compatibility

1. Preserve every existing conversation, branch, message, generation and
   attempt ID.
2. Materialize explicit root fork boundaries for existing root branches.
3. Validate every existing child branch fork point against its parent path.
4. Quarantine invalid graphs with a diagnostic record; do not truncate them.
5. Backfill each run's triggering user message where lineage is unambiguous.
   Ambiguous rows remain migration conflicts requiring recovery, not guessed
   links.
6. Backfill output route from immutable run/conversation/branch ownership.
7. Do not rewrite historical project scope into frozen context or provider
   inputs.
8. Fresh schema and upgraded schema must produce equivalent contracts.
9. A migration failure rolls back the whole migration and leaves the previous
   database readable by the previous application version.

## 11. Deterministic acceptance tests

### Domain and storage

- create a durable projectless conversation and root branch;
- create a project-scoped conversation only when profile ownership matches;
- move projectless -> project -> projectless without altering historical run
  provenance;
- reject cross-conversation parent branches and fork messages;
- reject root branch with a message fork point;
- reject a missing parent, missing fork point and ancestry cycle;
- resolve nested inherited prefixes exactly once and in order;
- edit first, middle and last user messages without changing the source branch;
- reject editing assistant/tool/system messages through the user-edit command;
- idempotently replay the same branch creation and reject payload drift;
- reject stale `expectedConversationVersion`;
- preserve branch trees through restart, archive, restore and migration;
- reject cross-branch message parents/replacements and run projections;
- enforce immutable run output route;
- never resend an outcome-unknown attempt.

### Concurrency and replay

- switch active branch while a run streams and prove all events remain on the
  originating branch;
- run sibling branches concurrently without interleaving their projections;
- fork at a pinned cursor while the source emits later events;
- exercise every active-producer fork policy;
- disconnect after event N, replay after N, suppress duplicates and detect a
  deliberate gap;
- restart during queued, dispatching, streaming and finalizing states;
- prove background/subagent output does not follow UI navigation;
- compare branches while both receive new events without moving the pinned
  comparison boundary.

### UI truthfulness

- show projectless scope without a synthetic project;
- show invalid/recovering graph state instead of an empty chat;
- expose branch count/index derived from durable sibling data;
- keep edit/fork/retry unavailable until the native command is registered;
- preserve keyboard focus and selected branch after a non-active branch event;
- announce new background output without forced navigation.

## 12. Delivery slices

1. **Contract reconciliation**: canonical IDs, state vocabulary,
   run/iteration/attempt semantics and this scope/branch contract.
2. **Native lineage migration**: composite guards, explicit fork boundary,
   `user_message_id`, output route, version/idempotency receipts and migration
   denial tests.
3. **Durable journal**: append-before-publish, cursor replay and recovery.
4. **Native branch commands**: create, activate, edit-as-branch, retry sibling
   and scope move.
5. **Renderer projection**: fail-closed branch resolver, per-branch run state,
   background producer indicators and recovery UI.
6. **Branch UX**: tree/history, compare, rename/archive, keyboard navigation and
   accessibility/visual regression matrix.

Each slice ships only after fresh-schema, upgraded-schema, denial, crash,
concurrency and renderer truthfulness gates pass. A TypeScript-only branch
helper is not evidence that end-to-end branching has shipped.
