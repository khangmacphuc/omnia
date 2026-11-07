---
id: OMNIA-RESEARCH-OFFICIAL-HARNESS-REFRESH-2026-08-14
title: Official harness refresh for Omnia
status: research-addendum
last_reviewed: 2026-08-14
---

# Official harness refresh — 2026-08-14

This addendum captures a small, date-stamped refresh of public harness
contracts that materially affect Omnia's kernel, background-run inspector,
agent graph, model picker, and continuation design. It is intentionally
separate from the larger research files so a future refresh can be compared
without rewriting the historical review.

This is clean-room architecture research. It does not copy source code,
prompts, icons, animations, CSS, or private implementation details into
Omnia. The user-provided `tanbiralam/claude-code` snapshot is excluded from
the evidence base because it describes itself as leaked material without a
clean redistribution basis. Use the official public documentation and the
official repositories listed below instead.

## 1. Evidence register

| Source | Retrieval | Evidence used |
|---|---:|---|
| OpenAI Codex Manual, App Server and multi-agent sections | 2026-08-14; local manual reported current by the official helper | protocol handshake, thread/turn/item lifecycle, fork/steer, pagination, model catalog, bounded ingress, agents, skills, hooks, MCP, background terminals, usage/rate-limit surfaces |
| OpenAI Codex App Server source tree | 2026-08-14 | implementation/protocol location only; behavior claims are taken from the manual unless a pinned source review says otherwise |
| Anthropic Claude Code Agent Teams | 2026-08-14; page metadata modified 2026-08-13 | team/subagent distinction, shared task list, direct messaging, plan approval, display modes, idle-row behavior, token trade-offs |
| Anthropic Claude Code Agent View | 2026-08-14; page metadata modified 2026-08-13 | supervisor lifecycle, persistence across sleep/restart, row summaries, peek/reply, attach/detach, model/effort/permission persistence, PR status projection |
| OpenHands SDK fork/pause/ask/critic guides | 2026-08-14 | immutable deep-copy fork, pause/resume, non-interrupting side question, experimental evaluator/refinement |
| OpenTelemetry GenAI semantic conventions | 2026-08-14 | optional interoperability projection; Omnia's internal event schema remains authoritative |

Primary URLs:

- <https://developers.openai.com/codex/codex-manual.md>
- <https://learn.chatgpt.com/docs/app-server.md>
- <https://learn.chatgpt.com/docs/agent-configuration/subagents.md>
- <https://github.com/openai/codex/tree/main/codex-rs/app-server>
- <https://code.claude.com/docs/en/agent-teams>
- <https://code.claude.com/docs/en/agent-view>
- <https://docs.openhands.dev/sdk/guides/convo-fork.md>
- <https://docs.openhands.dev/sdk/guides/convo-pause-and-resume.md>
- <https://docs.openhands.dev/sdk/guides/convo-ask-agent.md>
- <https://docs.openhands.dev/sdk/guides/critic.md>
- <https://opentelemetry.io/docs/specs/semconv/gen-ai/>

Live documentation is not commit-pinned. Every release decision must record a
fresh retrieval date and preserve the older pinned repository research beside
this addendum.

## 2. Codex app-server deltas

### 2.1 One protocol, many clients

The app-server is the integration boundary for rich clients. It exposes
authentication, conversation history, approvals, and streamed agent events
over a bidirectional JSON-RPC-style protocol. The same semantic contract can
be transported over stdio, WebSocket, Unix socket, or an in-process adapter.
Transport selection must not create a second execution model.

Omnia contract:

- Tauri, CLI, local web, Android, IDE, and remote control clients talk to one
  kernel protocol and consume projections; none may author run state locally.
- Keep transport adapters thin and version the schema with the kernel build.
- Generate TypeScript/Rust schemas from the exact protocol revision used by a
  build; retain the schema hash in each client session.

### 2.2 Initialize and capability negotiation are mandatory

Each connection performs one `initialize` request followed by an
`initialized` notification. Requests before the handshake, repeated
initialization, and experimental methods without an explicit capability opt-in
are rejected. Notification suppression is an exact allowlist, not a wildcard.

Omnia contract:

- Add `ClientHello`, `KernelHello`, `StableCapabilities`, and
  `ExperimentalCapabilities` to the connection journal.
- Reject mutable commands until the handshake and authorization checks pass.
- Record negotiated capability generations in every prepared attempt so a
  reconnect cannot silently widen behavior.

### 2.3 Bounded ingress and retryable overload

The WebSocket transport uses bounded request queues. A full queue is reported
as an explicit overload error (`-32001`, retry later); clients are expected to
retry with increasing delay and jitter. This is distinct from provider
failures, user cancellation, and an outcome-unknown network interruption.

Omnia contract:

- Add `kernel_overloaded` to the normalized retry taxonomy.
- Honor server-provided retry hints first, then use capped exponential backoff
  with jitter and an idempotency key.
- Persist each enqueue, reject, retry, and terminal decision in the run
  journal; never duplicate a non-idempotent tool call while retrying ingress.

### 2.4 Thread, turn, item and goal operations

The app-server keeps thread, turn, and item as separate durable primitives.
Important operations include start/resume/read/list, fork, name/goal updates,
archive/delete, cursor pagination, compact, steer, interrupt, and streamed
item lifecycle notifications. A fork can copy only through a selected turn or
be ephemeral; `steer` adds input to an active turn without manufacturing a new
turn.

Omnia contract:

- Preserve `Project -> Thread -> Turn -> Run -> Attempt -> Iteration -> Item`;
  queue, branch, fork, side-question, and retry are different relations.
- Require an immutable source cursor and snapshot policy for every branch/fork.
- Make `goal/set`, `goal/get`, and `goal/clear` first-class journal events.
- Support read-without-resume and item/turn pagination from the first public
  client; the inspector must work after a renderer restart.
- Treat compaction as a checkpoint with source ranges, omitted items, facts,
  citations, compiler version, and a replay cursor—not as destructive text
  replacement.

### 2.5 Model catalog and runtime capability discovery

The model catalog returns picker-visible models, hidden entries on request,
supported reasoning efforts, defaults, input modalities, personality support,
and optional upgrade metadata. Provider/model capability bounds are queried
separately. Skills, hooks, MCP servers, permission profiles, feature flags,
and background terminal state are also discoverable through typed endpoints.

Omnia contract:

- Store `ModelCatalogSnapshot` with provider health, observed latency, supported
  modalities, effort bounds, pricing provenance, and expiry.
- The picker must display `unknown` when health or pricing is not observed; it
  must not infer liveness from a static name.
- Freeze the selected model, effort, provider, capability profile, and catalog
  revision into the prepared request. A later refresh cannot mutate a running
  attempt.
- Treat plugin/MCP/skill discovery, installation, trust, enablement, and
  capability grant as separate states.

### 2.6 Background terminals and explicit process surfaces

The protocol distinguishes a thread-owned background terminal from a general
process session and exposes list/terminate/cleanup operations. These surfaces
are experimental or permission-bound in the source product; they are not a
license for arbitrary unbounded process control.

Omnia contract:

- Represent terminal/process ownership, environment, capability set, output
  blobs, cancellation, and postconditions explicitly.
- Keep command output outside the main transcript by default, with a compact
  summary and a durable inspector link.
- Require an exact approval receipt for process effects and invalidate it when
  the command, cwd, environment, grant, or binary identity changes.

## 3. Codex multi-agent deltas

### 3.1 Protect the main context

The official guidance distinguishes a subagent workflow from an agent thread.
Parallel workers are particularly useful for read-heavy exploration, tests,
triage, and summarization. Raw logs, stack traces, and command output should
be distilled into structured findings before they return to the main thread;
otherwise context pollution/rot reduces reliability. Write-heavy parallel work
needs ownership, isolation, and conflict control.

Omnia contract:

- Every child returns `Finding[]`, evidence IDs, artifacts, unresolved
  questions, and a compact summary; raw trace remains inspectable but is not
  automatically injected into parent context.
- Scheduler defaults to bounded read parallelism and serializes overlapping
  writes unless worktree/copy-on-write ownership is explicit.
- The parent prompt records the delegation split, join policy, and return
  schema so a child cannot silently change the task shape.

### 3.2 Custom agent resolution and ceilings

Custom agents have stable names, descriptions, developer instructions, and
optional model, effort, sandbox, MCP, and skill settings. Resolution follows
explicit spawn values, configured defaults, then the parent value; child
permissions and sandbox policy inherit from the parent and cannot widen it.
Concurrency limits and interruption-message settings are explicit controls.

Omnia contract:

- Define an immutable `AgentProfileRevision` and persist the effective
  resolution chain (`explicit -> task profile -> workspace -> global`).
- Enforce parent ceilings for capabilities, cost, token, depth, time,
  concurrency, data egress, and write roots.
- Expose child model/effort, context budget, and sandbox in the inspector and
  telemetry without exposing credentials.

## 4. Claude Code agent teams and agent view deltas

### 4.1 Teams are not just more subagents

The official team documentation distinguishes focused subagents (report only
to the lead, lower token cost) from teammates (independent contexts, direct
messages, shared task list, and self-coordination, with higher token cost).
Teams can run in-process or in split panes. Plan approval and lifecycle hooks
are team-level controls; teams are not a reason to bypass policy or use
unbounded parallelism.

Omnia contract:

- Use typed execution primitives: `ChildWorker`, `SideQuestion`, `Teammate`,
  `Workflow`, and `ReviewWorker`; do not collapse them into one generic Agent.
- Give teammates a mailbox and shared task projection, but keep each context
  snapshot and approval scope independent.
- Record the coordination mode, token budget, join condition, and conflict
  policy in the run graph.
- Make plan approval a deterministic gate before mutation-capable work; hooks
  may reject a queue item terminally, but cannot grant new authority.

### 4.2 Agent view is a control plane, not a transcript dump

Agent view groups sessions by state, surfaces pinned and needs-input rows, and
lets the user peek at recent output or a waiting question, reply without
leaving the table, then attach for the full transcript or detach back to the
table. Rows expose age/activity and can surface pull-request status. This is a
compact attention projection over durable sessions, not a replacement for the
event log.

Omnia contract:

- Build `AttentionProjection` with stable row identity, state, age, activity,
  attention reason, latest summary, PR/change links, and a jump-to-run cursor.
- Support `peek`, `reply`, `attach`, `detach`, `steer`, `stop`, and `open full
  trace` without losing the active workspace focus.
- Keep summaries provenance-linked and show whether they came from a cheap
  summarizer, recent output extraction, or a terminal event.

### 4.3 Supervisor-backed persistence

Background sessions are hosted by a per-user supervisor separate from the
terminal and agent-view UI. The documented behavior persists session state to
disk, keeps work alive while the UI/shell closes, reconnects after sleep, and
can restart an unresponsive process to continue an interrupted response. A
pre-warmed worker reduces cold-start latency. Work that cannot be adopted is
stopped after an explicit confirmation rather than silently lost.

Omnia contract:

- Separate `KernelSupervisor`, renderer, and client projections. Closing the
  window must not terminate a durable run unless the user chose stop.
- Add an adoption manifest listing every in-flight child, process, monitor,
  scheduled task, environment, and capability. Adopt only an all-or-nothing
  movable group; otherwise record a blocked adoption and ask the user.
- Persist checkpoint, lease owner, heartbeat, wake/reconnect, and recovery
  reason. After sleep or supervisor restart, resume only from a verified
  checkpoint and never report success from a stale renderer cache.
- Treat pre-warmed workers as an optimization, not as permission to share
  credentials or mutable process state across runs.

### 4.4 Summary and notification budgets

Agent-view rows use a short summary so a user can understand many sessions at
once. The official page describes a cheaper model-generated summary at turn
boundaries and bounded refreshes from recent output while a turn is active;
attention notifications are emitted when a session needs input, completes, or
fails. Reduced-motion and screen-reader modes change notification behavior.

Omnia contract:

- Keep a `SummaryArtifact` separate from the canonical transcript, with source
  cursor, model/algorithm, timestamp, confidence, and expiry.
- Prefer local deterministic extraction while a run is active; call a cheap
  summarizer only at configured boundaries or when the row becomes stale.
- Emit deduplicated attention events and let users tune cadence, channels,
  reduced motion, and screen-reader verbosity.

### 4.5 Persisted model/effort/permission identity

When a background session is restarted, its selected model, effort, permission
mode, name, and carried configuration are restored according to the documented
session rules. Provider endpoint inheritance is scoped by dispatch directory
and configuration; endpoint/credential combinations must not be mixed
accidentally.

Omnia contract:

- Persist effective model/effort/permission/provider identity in the run
  snapshot and show it in the inspector.
- Distinguish a fixed per-run override from a setting that is intentionally
  re-read on restart; record this as `resolutionMode` rather than silently
  changing a request.
- Bind endpoint, credential handle, environment, and provider policy together;
  reject ambiguous cross-directory inheritance.

## 5. OpenHands SDK deltas

### 5.1 Fork is a deep copy with explicit ownership

`Conversation.fork()` creates a new ID, copies events and agent state, keeps the
source immutable, and starts the fork idle. The workspace may remain shared;
that distinction is important. Fork metadata/tags are independent, and cost
accounting can reset or carry over by explicit policy.

Omnia contract:

- Persist `ForkSnapshotPolicy` (`historyThroughCursor`, `workspaceMode`,
  `agentProfileMode`, `costMode`, `contextMode`) rather than a boolean fork.
- Mark shared workspace forks as conflict-prone until a copy-on-write or
  worktree environment is selected.
- Link source/fork IDs and cursors for compare/merge/replay without merging
  transcript text implicitly.

### 5.2 Pause/resume and side questions are separate controls

OpenHands documents pausing execution, performing an operation, and resuming
without losing state. `ask_agent()` provides context-aware sidebar answers
while the main conversation continues; it can be used during or after the run
without changing the primary event count.

Omnia contract:

- `pause` is a durable checkpoint and scheduler state, not cancellation.
- A side question receives a read-only snapshot and its own attempt/usage
  ledger; it must not mutate the main run unless the user explicitly promotes
  its result.
- UI should expose side-question provenance, answer time, model, cost, and
  source cursor next to the selected output span.

### 5.3 Critic feedback is advisory until verified

The OpenHands critic guide describes real-time scores and optional iterative
follow-up prompts below a threshold. The guide labels this feature
experimental. A score predicts quality; it is not deterministic proof that a
patch, answer, or security decision is correct.

Omnia contract:

- Store evaluator score, rubric, model, threshold, and follow-up prompt as
  advisory evidence in the journal.
- Require deterministic validators, tests, citations, or user approval for
  acceptance; learning/routing code cannot expand permissions or mark an
  unverified result complete.
- Bound repair loops by iteration, cost, time, repeated-diff signature, and
  no-progress detection.

## 6. Omnia implementation deltas

These are the minimal new kernel contracts implied by this refresh:

1. `CapabilityHandshake` — negotiated protocol version, stable/experimental
   capabilities, notification filters, client identity, and schema hash.
2. `KernelSupervisor` — durable leases, heartbeats, checkpoint adoption,
   wake/reconnect, process restart, and UI-independent background execution.
3. `AttentionProjection` — grouped state rows, summary artifacts, needs-input
   reasons, peek/reply/attach/detach cursors, notifications, and PR links.
4. `ModelCatalogSnapshot` — model/provider liveness, effort/modalities,
   pricing provenance, health TTL, upgrade metadata, and frozen selection.
5. `ForkSnapshotPolicy` — history/workspace/agent/cost/context copy semantics.
6. `SideQuestionAttempt` — non-interrupting context-aware question with a
   separate usage/cost trace and explicit promotion path.
7. `RetryDecision` — overload/provider outcome, idempotency key, retry hint,
   backoff/jitter, attempt count, and terminal reason.
8. `SummaryArtifact` — short attention text with source cursor, producer,
   confidence, expiry, and redaction policy.

## 7. Required deterministic tests

- handshake rejects pre-initialize, duplicate initialize, and unapproved
  experimental methods;
- bounded ingress returns a typed overload and retries idempotently with jitter;
- fork through a cursor preserves source immutability and explicit workspace
  sharing/copy semantics;
- steer appends to an active turn without creating a phantom turn;
- read/list/item pagination reconstructs the inspector after renderer restart;
- compaction/resume preserves source cursors, goals, citations, and task state;
- model refresh cannot mutate an already-prepared attempt;
- child agent cannot widen parent capability, data egress, or write roots;
- a teammate plan rejection consumes its queue item terminally and does not
  dispatch a provider request;
- supervisor close/sleep/restart adopts only movable work and recovers from a
  verified checkpoint;
- row summaries never overwrite canonical transcript content and expose stale
  or low-confidence state;
- peek/reply and side questions do not alter the primary run's event count;
- critic scores cannot bypass deterministic validators or approval gates;
- provider endpoint and credential handles never cross a directory boundary;
- reduced-motion and screen-reader modes suppress or restyle attention effects;
- every retry, summary, fork, side question, adoption, and evaluator result is
  visible in the request/run inspector with provenance and cost.

## 8. Relationship to existing research

This file supplements, but does not supersede:

- [`OPENAI_CODEX_HARNESS_RESEARCH.md`](OPENAI_CODEX_HARNESS_RESEARCH.md)
- [`CLAUDE_CODE_HARNESS_RESEARCH.md`](CLAUDE_CODE_HARNESS_RESEARCH.md)
- [`OPENHANDS_OFFICIAL_HARNESS_RESEARCH.md`](OPENHANDS_OFFICIAL_HARNESS_RESEARCH.md)
- [`CONTINUE_AIDER_OPENCODE_HARNESS_RESEARCH.md`](CONTINUE_AIDER_OPENCODE_HARNESS_RESEARCH.md)

The implementation-status source of truth remains
[`docs/IMPLEMENTATION_STATUS.md`](../IMPLEMENTATION_STATUS.md), and the
Omnia Ultra execution contract remains
[`docs/omnia-ultra/delivery/99-execution-prompt.md`](../omnia-ultra/delivery/99-execution-prompt.md).
