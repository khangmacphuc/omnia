# Omnia UI component contracts

These contracts are framework-agnostic. They define what the view layer must represent and are intended to map cleanly to typed component properties and application state.

They describe the target Chat Complete component model. A component may expose only states backed by the current implementation and evidence; unsupported target fields must render as unavailable/planned rather than receiving fabricated values. Current capability truth is recorded in [`../IMPLEMENTATION_STATUS.md`](../IMPLEMENTATION_STATUS.md).

## 1. App shell

### `AppShell`

Required state:

- `activeActivity`
- `activeTabId`
- `tabs[]`
- `sidebarMode: docked | overlay | hidden`
- `inspectorMode: docked | overlay | hidden`
- `windowDensity: compact | comfortable | touch`
- `connectivity: online | degraded | offline`
- `syncState: idle | syncing | conflict | error | disabled`
- `backgroundOperations[]`

Rules:

- Panel modes derive from window width but preserve an explicit user override where feasible.
- Focus returns to the control that opened an overlay.
- Closing a tab with a non-empty unsent draft requires a recoverable decision: keep draft in history, discard, or cancel.

### `ActivityRail`

Each item supplies `id`, localized label, icon, destination, optional count, active state, and availability. Counts are reserved for actionable items such as pending memory approvals; never show decorative zeros.

### `TabStrip`

Tab states: idle, active, unread-update, running, error, dirty-draft. Running state must not obscure the close affordance. Tabs support keyboard reorder and an overflow list.

## 2. Conversation collection

### `ConversationListItem`

```ts
type ConversationListItem = {
  id: string;
  title: string;
  excerpt?: string;
  project?: { id: string; name: string };
  updatedAt: string;
  pinned: boolean;
  archived: boolean;
  localOnly: boolean;
  hasDraft: boolean;
  runState?: 'queued' | 'streaming' | 'awaiting-approval' | 'failed';
  syncState?: 'synced' | 'pending' | 'conflict' | 'error';
};
```

Visual priority: title → excerpt → time. Metadata icons are conditional. The full row is a navigation target; nested action buttons must not trigger navigation.

### `ConversationSearchResult`

Adds `matchedMessageId`, `matchedBranchId`, `highlightRanges`, and breadcrumb. Activating it opens the exact message and briefly emphasizes it without moving focus unexpectedly.

## 3. Message timeline

### `MessageGroup`

A visible turn may contain multiple typed parts:

```ts
type MessagePart =
  | { type: 'text'; markdown: string }
  | { type: 'reasoning-summary'; markdown: string; visibility: 'user-visible' | 'metadata-only' }
  | { type: 'attachment'; attachmentId: string }
  | { type: 'citation'; citationIds: string[] }
  | { type: 'artifact-ref'; artifactId: string; versionId: string }
  | { type: 'tool-event'; eventId: string }
  | { type: 'error'; errorId: string };
```

Message state:

- `pending-local` — optimistic user message not yet persisted.
- `queued` — accepted but provider run has not started.
- `streaming` — partial assistant content.
- `complete` — stable final content.
- `stopped` — partial content retained after cancellation.
- `failed` — recoverable inline failure.
- `superseded` — hidden by a branch change but addressable.

Every message includes stable IDs for conversation, branch, message, and run. Never key streaming DOM by array index.

### `MessageActions`

Actions are capability-driven. For assistant messages: copy, feedback, regenerate, continue, branch, read aloud, export. For user messages: edit, copy, branch, resend. Disabled actions expose a reason; unavailable actions should normally be omitted.

### `BranchNavigator`

Properties: current sibling index, sibling count, branch labels, previous/next handlers, open-map handler. It is absent when there is only one branch.

### `RunQueue`

```ts
type QueuedRunView = {
  id: string;
  position: number;
  promptPreview: string;
  attachmentCount: number;
  contextRefCount: number;
  modelProfileId: string | 'auto';
  createdAt: string;
  state: 'queued' | 'blocked' | 'starting';
  blockingReason?: string;
};
```

Queue reordering is persisted transactionally and keyboard accessible. Editing creates a new immutable input snapshot for the queue item. Removing an item uses Undo but never affects the active run.

### `ComparisonRun`

```ts
type ComparisonCandidateView = {
  id: string;
  runId: string;
  modelProfileId: string;
  displayIdentity: 'visible' | 'blind';
  state: 'queued' | 'streaming' | 'complete' | 'stopped' | 'failed';
  outputMessageId?: string;
  metrics?: { latencyMs?: number; inputTokens?: number; outputTokens?: number; cost?: number; currency?: string };
  rating?: Record<string, number>;
  promoted: boolean;
};
```

All candidates reference one frozen logical comparison input, while each run keeps its own translated request and effective parameters. Promoting one candidate adds it to the visible conversation path without orphaning the others.

### `CitationMarker` and `SourcesInspector`

A citation has stable source ID, display index, span/range association, title, source type, URI or local reference, retrieved timestamp, quoted excerpt subject to policy, and verification state. Keyboard activation opens and focuses the corresponding source row. Returning closes/backs out without losing the source marker position.

### `CodeBlock`

Properties: language, optional filename, code, streaming state, wrap state, truncation state, artifact reference, line highlights. Copy uses the full underlying value, not visually truncated text. Announce copy success without stealing focus.

## 4. Composer

### `ChatComposer`

```ts
type ComposerState = {
  conversationId?: string;
  branchId?: string;
  draft: string;
  attachments: ComposerAttachment[];
  contextRefs: ContextReference[];
  invokedSkills: SkillReference[];
  capabilityPreset: 'ask' | 'create' | 'research' | string;
  modelProfileId: string | 'auto';
  parameterOverrides: Record<string, unknown>;
  tokenEstimate?: { used: number; available: number; confidence: 'exact' | 'estimated' };
  state: 'ready' | 'uploading' | 'blocked' | 'submitting' | 'streaming';
  blockingReasons: ComposerBlockReason[];
};
```

Submission invariants:

- Persist the user draft/message before dispatching a provider request.
- One click/keystroke creates at most one run; guard against double submission.
- Preserve text and recoverable attachments on failure.
- Generate an idempotency key at the interaction boundary.
- While streaming, the primary action stops only the active run tied to this composer.
- If files are still processing, communicate whether send waits, excludes them, or is blocked.

### `AttachmentChip`

States: queued, reading, hashing, uploading-if-required, parsing, indexing, ready, warning, failed, removed. Show source/local-cloud boundary and size. Removal during an active run affects only future requests unless the provider run can actually be canceled and rebuilt.

### `ContextChip`

Includes source type, label, scope, status, token estimate, and removal. `Memory`, `Project instructions`, `Folder selection`, and `Skill` are visually distinguishable by icon plus text, not color alone.

### `ModelPicker`

Model option contract:

```ts
type ModelOption = {
  profileId: string;
  displayName: string;
  providerName: string;
  providerModelId: string;
  status: 'available' | 'degraded' | 'unavailable' | 'unknown';
  capabilities: Array<'text' | 'vision' | 'audio-in' | 'audio-out' | 'tools' | 'json-schema' | 'reasoning'>;
  contextWindow?: number;
  maxOutput?: number;
  favorite: boolean;
  recent: boolean;
  compatibilityWarnings?: string[];
};
```

Changing model with incompatible current attachments or parameters opens a concise compatibility review. Never silently drop context.

### `ParameterEditor`

Each field requires: canonical key, label, description, typed value, inherited value, source scope, provider support state, numeric/string constraints, reset action, and optional provider mapping. Values validate before send. The UI retains unsupported saved values but excludes them from requests unless developer override is explicitly enabled.

## 5. Run activity

### `RunStatus`

```ts
type RunStage =
  | 'preparing-context'
  | 'routing'
  | 'queued'
  | 'requesting'
  | 'reasoning'
  | 'retrieving'
  | 'awaiting-approval'
  | 'using-capability'
  | 'writing'
  | 'finalizing'
  | 'complete'
  | 'stopped'
  | 'failed';
```

The displayed label comes from real events. Stages can be skipped. Do not animate progress percentages without measurable progress.

### `RunTimeline`

Event base fields: ID, run ID, parent event ID, sequence, type, stage, start/end time, status, user-visible summary, details reference, capability/provider attribution, approval reference, retry attempt. Nested events form a tree but default presentation is a readable chronological list with collapsible groups.

### `UsageSummary`

Only show values with provenance:

- tokens: input, cached input, output, reasoning if separately reported;
- monetary amount: reported or estimated, currency, price table timestamp;
- latency: queue, first token, total;
- context composition.

An unavailable value displays `Not reported`, never zero.

## 6. Projects and workspace folders

### `ProjectContextHeader`

At the target Chat Complete boundary, this displays project name, model policy, evidence-backed context health, attached folder count, enabled skill count, and a single context-management action. The current Provider Preview must report skills as unavailable/not enabled and context as not compiled; it must not synthesize `ready` or a nonzero skill count. Later context-health states include ready, indexing, over-budget, missing access, and error.

### `WorkspaceFolderRow`

```ts
type WorkspaceFolderView = {
  id: string;
  displayName: string;
  canonicalPath: string;
  state: 'referenced' | 'indexing' | 'ready' | 'partial' | 'permission-lost' | 'offline' | 'error';
  scope: 'metadata' | 'selected-files' | 'full-index';
  ignoreRulesSummary?: string;
  fileCount?: number;
  chunkCount?: number;
  lastIndexedAt?: string;
  localOnly: boolean;
  error?: ActionableError;
};
```

For the current Provider Preview, only `referenced` is an affirmative workspace state: the grant is read-only and not indexed. Indexing-related state, scope, counts, and timestamps require later native evidence and must remain absent until then.

Selecting a row opens details. Primary row actions are rescan/reconnect based on state; remove lives in overflow and explicitly states it does not delete source files.

## 7. Memory

### `MemoryItem`

```ts
type MemoryItemView = {
  id: string;
  content: string;
  scope: { type: 'global' | 'profile' | 'project' | 'conversation'; id?: string; label: string };
  kind: 'preference' | 'identity' | 'workflow' | 'project-fact' | 'constraint';
  status: 'suggested' | 'active' | 'paused' | 'archived';
  origin: 'explicit' | 'inferred' | 'imported';
  confidence?: number;
  provenance?: { conversationId: string; messageId: string; excerpt?: string };
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
};
```

Confidence is only displayed for inferred content and must be explained in accessible text. The “used in this answer” surface takes actual run-context IDs, not a re-run of retrieval.

## 8. Assistants and prompt templates

### `AssistantProfileEditor`

Required fields: stable ID, editable draft version, display metadata, instructions, model/routing profile, parameter preset, knowledge references, memory policy, enabled skills, starter prompts, and project visibility. Saving creates a version when execution-affecting content changes. A conversation records the selected version per run.

### `PromptTemplateForm`

```ts
type PromptVariable = {
  id: string;
  name: string;
  label: string;
  type: 'short-text' | 'long-text' | 'number' | 'choice' | 'boolean' | 'date' | 'context-ref';
  required: boolean;
  defaultValue?: unknown;
  options?: Array<{ label: string; value: string }>;
  validation?: Record<string, unknown>;
};
```

Variable values validate before resolution. The UI can preview the exact resolved prompt. The run stores template ID/version and resolved prompt, never only a pointer to mutable template content.

## 9. Skills

### `SkillCard` / `SkillListItem`

Properties include ID, name, description, version, source, trust level, scope, enabled state, permissions, capability requirements, validation result, test result, update state, and modified state. Enable toggles that require new permissions launch review before committing the new state.

### `PermissionDiff`

Groups added, removed, and changed permissions. Added high-risk permissions require individual acknowledgement. Permission labels name actual resources such as `Read files in C:\\Work\\Demo`, not abstract scopes.

## 10. Evaluations

Evaluation UI consumes immutable run IDs and typed score provenance:

```ts
type EvaluationCellView = {
  caseId: string;
  candidateId: string;
  status: 'not-started' | 'queued' | 'running' | 'complete' | 'failed' | 'cancelled';
  aggregateScore?: number;
  assertionSummary?: { passed: number; failed: number; unknown: number };
  humanReviewState: 'not-required' | 'pending' | 'complete';
  runIds: string[];
};
```

Scores always expose `source: deterministic-assertion | model-judge | human`, evaluator/model version where applicable, and timestamp. Missing scores remain blank/unknown, never zero.

## 11. Errors

```ts
type ActionableError = {
  code: string;
  title: string;
  message: string;
  source: 'app' | 'provider' | 'network' | 'storage' | 'permission' | 'parser' | 'sync';
  retryable: boolean;
  retryAfterMs?: number;
  actions: Array<{ id: string; label: string; kind: 'primary' | 'secondary' | 'link' }>;
  diagnosticId?: string;
  safeDetails?: Record<string, unknown>;
};
```

The UI maps known errors to specific recovery actions. Raw exceptions never become primary user copy. Secrets, auth headers, full local paths outside explicitly requested diagnostics, and unredacted prompts are excluded from clipboard diagnostics by default.

## 12. Loading and optimistic UI

- Optimistic updates are permitted for rename, pin, archive, local draft save, and local preference changes; rollback is visible on failure.
- Provider connection, secret storage, delete, permission grant, folder indexing completion, and message send completion are never falsely shown as succeeded.
- Skeleton rows have stable dimensions. Do not mix spinner, skeleton, and progress bar for one operation.
- Indeterminate progress uses stage text; determinate progress uses a progress bar with numeric accessible value.

## 13. Focus and overlay rules

- Only one modal dialog is active at a time.
- Popovers close on Escape and restore focus.
- An overlay inspector is non-modal unless its content demands a permission decision.
- Command palette traps focus while open; sidebar drawers do not trap focus on desktop unless presented modally at the minimum width.
- When new streamed content appears, focus never moves automatically.
- After message send, focus stays in the composer unless the user initiated a navigation-affecting command.
