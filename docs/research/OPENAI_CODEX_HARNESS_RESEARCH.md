# OpenAI Codex Harness Research for Omnia

- Status: Research complete; implementation recommendations are not shipped capabilities
- Research date: 2026-08-13
- Repository: `openai/codex`
- Reviewed commit: `72fa74fbc9c4b72d513304bfa0eda427d2402ed9`
- Commit timestamp: 2026-08-13T12:04:29Z
- Refresh verified at: 2026-08-13T12:25:00Z
- Refresh baseline: `e0de12a126f2beb10599a18fd4ca6b08f6e0a1a0`
- Refresh range: six official commits through the reviewed commit
- License: Apache-2.0
- Primary sources: the pinned source tree above and the OpenAI Codex Manual fetched on 2026-08-13

## 1. Purpose and provenance boundary

This document records architectural and harness patterns that Omnia can learn
from the official open-source Codex implementation. It is not a source-code
port, a UI asset inventory, or a claim that Omnia currently implements these
features. Omnia should reproduce useful invariants through its own contracts,
tests, data model, visual language, and Windows-specific security boundary.

The repository contains the open-source CLI, terminal UI, core runtime,
app-server protocol and supporting crates. It does not contain the full Codex
desktop application's proprietary React UI or its complete icon library. The
useful UI evidence in this source is therefore structural rather than visual:
streaming item lifecycles, subagent topology, approvals, model discovery,
history pagination, skills metadata, terminal behavior and protocol schemas.
Omnia's desktop visual system should be independently designed and validated
against its own UI specification.

## 2. Executive findings

The strongest Codex patterns for Omnia are:

1. One durable interaction vocabulary across clients: thread, turn and item.
2. A versioned, bidirectional app-server protocol instead of renderer-owned
   agent logic.
3. Explicit lifecycle operations for start, steer, interrupt, resume, fork,
   rollback and compaction.
4. Append-oriented rollout persistence plus a query/projection store.
5. Context as a versioned model-visible projection, not an unstructured prompt
   string.
6. Approval decisions bound to exact action arguments and environment context.
7. A typed tool registry with collision rules, visibility, hooks, cancellation
   and terminal outcomes.
8. Subagents as real child threads with persisted parent-child topology,
   resource limits and inspectable status.
9. Layered configuration, skills, plugins and hooks with provenance and trust.
10. Provider configuration separated from live model-catalog management.
11. Telemetry emitted at session, request, stream, tool and decision boundaries.
12. Deterministic integration tests that inspect the exact model-visible request
    after compaction, resume and fork.
13. Durable operational or security observations that remain deliberately
    outside model context, ordinary thread history, search and memory inputs.
14. Capability-negotiated sandboxed file streaming that opens the file inside
    the sandbox and transfers an already-open descriptor or handle.

Omnia should adopt these principles, then extend them with frozen retrieval and
citation provenance, first-class persistent/isolated/remote environments,
multi-provider cost and health telemetry, capability receipts, artifact lineage,
and a richer learning/research harness.

## 3. Architectural map

```text
Desktop / CLI / IDE / Web / Android clients
                  |
          versioned Omnia protocol
                  |
          Omnia Kernel / app service
        +---------+----------+
        |         |          |
   Run graph  Capability   Event journal
               broker
        |         |          |
   Harness    Environments   Projections
        |
  Provider gateway -- Model catalog -- Telemetry
        |
 Context compiler -- Tool runtime -- Agent graph
        |
 Memory / skills / retrieval / artifacts / citations
```

Codex demonstrates why the protocol and kernel must remain authoritative even
when a client is embedded in-process: its in-process app-server keeps the same
request/response and event semantics rather than creating a second execution
contract. Omnia should do the same for Tauri IPC, CLI, local web control and
remote clients.

## 4. Pattern analysis and Omnia decisions

### 4.1 Thread, turn and item are the shared product language

Codex app-server exposes three durable primitives:

- a thread is the long-lived interaction;
- a turn is one user request plus the agent work that follows;
- an item is an ordered unit such as a message, reasoning item, tool call,
  command, file change or artifact-like result.

Each item streams through a start, zero-or-more delta, and completed lifecycle.
Thread and turn operations remain separate from presentation. This allows CLI,
IDE and richer clients to project the same run without rebuilding agent state.

Omnia decision:

- Use `Project -> Thread/Task -> Run/Turn -> Attempt -> Iteration -> Item/Event`.
- Keep `Attempt` and `Iteration` as Omnia extensions for provider retries,
  evaluator loops, multi-model discussion and reinforcement/adaptive routing.
- Every item receives a stable ID, producer, environment, status and provenance.
- A terminal item event is authoritative and idempotent; deltas are never the
  durable source of truth.
- Desktop, CLI, web and Android consume the same protocol and projections.

### 4.2 Protocol first; transport is replaceable

Codex app-server uses typed bidirectional request/response messages and server
notifications. It supports schema generation tied to a specific binary version,
requires an initialize handshake, distinguishes stable and experimental fields,
uses bounded queues, reports overload as retryable, and can run over stdio,
socket, WebSocket or in-process channels while retaining the same semantics.

Omnia decision:

- Define one canonical protocol schema and generate Rust and TypeScript types.
- Require `initialize -> initialized` before mutable operations.
- Negotiate protocol version, stable capabilities and experimental capability
  generations explicitly.
- Keep the Tauri command layer as a thin transport adapter over the kernel.
- Use bounded queues and an explicit overload result with retry-after guidance.
- Require monotonically increasing durable cursors and event IDs for replay.
- Keep remote transports authenticated, encrypted and independently revocable.
- Do not expose an unauthenticated non-loopback control listener.

### 4.3 Start, steer, interrupt, resume and fork are different operations

Codex treats lifecycle changes as explicit operations rather than overloading
message send. Thread resume reconstructs state from persisted history. Forking
has defined snapshot semantics. A fork taken while the source thread is mid-turn
receives an interruption boundary instead of silently inheriting an apparently
complete partial turn. Settings may be overridden on start/resume/fork while the
effective thread configuration remains inspectable.

Omnia decision:

- Persist `turn_started`, `turn_interrupted`, `turn_completed` and recovery
  boundaries as first-class events.
- A fork must name the source thread, source event cursor and snapshot policy.
- Forking an unstable suffix either waits for a stable boundary or appends an
  explicit interrupted boundary; it never invents completion.
- Resume validates the stored provider, model, capability, environment and
  instruction snapshot before continuing.
- Steering appends input to an active turn without creating a fake new turn.
- Goal continuation across a fork is an explicit, persisted choice.

### 4.4 Durable log plus query projection

Codex keeps a rollout/history representation for replay and a state-backed
projection for listing, filtering, pagination, topology and metadata. It can
read stored threads without resuming them and paginate turns/items separately.

Omnia decision:

- Use an append-only event journal as the behavioral source of truth.
- Build SQLite projections for fast UI queries, usage analytics, search and
  indexes; projections must be rebuildable from durable events plus immutable
  blobs.
- Persist large bodies and binary data in the encrypted content store rather
  than duplicating them in event rows.
- Support read-without-resume and cursor pagination from the beginning.
- Record projection schema and reducer version so rebuild drift is detectable.

The refreshed source adds a useful separation contract for security-risk
scores: the score is persisted in rollout history, yet it is explicitly omitted
from model-visible context, ordinary thread-item projection, search, fork
history, reconstructed conversation history and memory extraction. This is a
stronger design than either dropping the observation or injecting it into the
prompt.

Omnia decision:

- Classify every durable record by projection eligibility, not merely by
  whether it is persisted.
- Keep security classifiers, evaluator scores, policy diagnostics and sensitive
  operational signals in restricted journal channels by default.
- Require explicit, typed promotion before such a signal can become model input
  or user-visible content; a raw numeric score never becomes an instruction.
- Fork, compaction, memory extraction, search and export each apply their own
  allowlisted projection policy rather than inheriting all journal rows.

### 4.5 Context is a versioned projection

Codex's context manager keeps ordered response-item envelopes, a history
version, token accounting, a reference context baseline and a world-state
baseline. History rewriting increments its version. Context sent to the model is
normalized by modality, and tool-call/output relationships are preserved when
truncating. Settings and world-state updates can be emitted as diffs against an
established baseline.

Omnia decision:

- Compile every provider request from a frozen `ContextSnapshot`.
- Store the snapshot version, compiler version, token estimate, selected and
  omitted items, rank/score, reason, content hash, source version and scope.
- Treat conversation history, retrieval, memory, skills, project overview,
  instructions, environment state and tool schemas as typed context channels.
- Preserve call/output pairs and other dependency groups atomically.
- Increment context history version on compaction, rollback, memory correction,
  retrieval refresh or any rewrite.
- A provider retry may reuse a frozen snapshot; it may not silently compile a
  materially different prompt under the same attempt ID.

This is the key mechanism for avoiding stale facts and lost-in-the-middle
failures: Omnia should diff current world state against a referenced baseline,
track fact identity and supersession, then preferentially place high-priority
updates near the relevant instruction/user boundary instead of concatenating
old and new versions.

### 4.6 Compaction is a checkpoint, not lossy string replacement

Codex supports manual, pre-turn and mid-turn compaction with distinct context
reinjection behavior. Replacement history has checkpoint metadata; retained
recent user messages and harness metadata remain aligned; compaction hooks and
analytics surround the operation. Integration tests inspect the exact
model-visible sequence across compact, resume, fork and rollback.

Omnia decision:

- Persist `CompactionCheckpoint` with source cursor range, model/prompt/scorer
  versions, replacement items, retained facts, omitted facts and reason.
- Keep a machine-readable fact ledger alongside narrative summaries.
- Preserve provenance IDs through compaction so citations and artifact lineage
  never point only to summary text.
- Run contradiction and supersession checks before accepting a checkpoint.
- Support pre-turn, mid-turn and user-requested compaction as separate policies.
- Test the exact provider payload before and after compaction, restart, fork and
  rollback.

Omnia should improve on plain summarization with hierarchical context:

1. immutable raw event/blob layer;
2. turn and task summaries;
3. entity/fact ledger with temporal validity and supersession links;
4. project blueprint and decisions;
5. retrieval-selected raw excerpts for the current run.

### 4.7 Approvals are exact, contextual and auditable

Codex models approval actions separately for commands, unified execution,
patches, MCP calls and network access. Cache keys include meaningful execution
arguments such as environment, canonical command, working directory, TTY,
sandbox and additional permissions. Hook, automated reviewer and user decisions
have a defined precedence, and decision source is included in telemetry.

Omnia decision:

- Implement an `ApprovalReceipt` bound to:
  - operation kind and version;
  - canonical argument hash;
  - capability-set hash;
  - environment ID and snapshot/version;
  - workspace/grant roots;
  - caller thread, turn and tool-call ID;
  - expiry, scope and user decision;
  - policy/hook/reviewer provenance;
  - audit-event ID.
- Any argument, environment or capability mutation invalidates the receipt.
- Approval cache scope is never broader than the user's explicit decision.
- Separate turn-only, session-only and persistent policy amendments.
- Network approval identifies host, protocol, port and initiating operation.
- Privileged Windows operations require UAC and an exact operation manifest;
  silent SYSTEM/TrustedInstaller escalation is forbidden.
- Content, memory, skills and model output cannot approve their own capability
  expansion.

### 4.8 Tools are typed runtimes, not arbitrary callback maps

Codex registers trusted and external tools with explicit collision behavior,
reserved names, exposure modes, parallelism declarations, cancellation
semantics, pre/post hooks, lifecycle events and telemetry. Deferred namespaces
can remain callable by a runtime without flooding the ordinary model-facing
tool list. Tool calls always resolve to a terminal outcome.

Omnia decision:

- Define `ToolDescriptor`, `ToolRuntime`, `ToolInvocation`, `ToolResult` and
  `ToolLifecycle` independently of UI and model-provider schemas.
- Every tool declares capability requirements, trust origin, environments,
  parameter/result schemas, timeout, cancellation, idempotency, concurrency,
  data sensitivity and output-size policy.
- Reserve core namespaces and reject ambiguous collisions.
- Support hidden, deferred/searchable and model-visible exposure states.
- Run policy and hooks before execution, not only after the model selects a tool.
- Large output is blob-backed with an inline preview; truncation is recorded.
- Terminal outcomes include completed, failed, blocked, rejected, cancelled,
  timed out and orphaned/recovered.

The refreshed queue tests also make a subtle lifecycle rule concrete: when a
prompt hook rejects a queued item, the item is consumed and receives its terminal
result without a provider request. Explicitly starting the item must not bypass
the same hook or leave a poison item that retries forever.

Omnia decision:

- A hook or policy rejection is a terminal queue outcome, not a transient model
  failure.
- Consume the rejected queue item atomically with its durable rejection event.
- Never dispatch a model/provider request after a pre-dispatch hook rejection.
- Allow later independent queued items to proceed according to scheduler policy.

### 4.9 Subagents are persisted child threads

Codex's subagents have real thread IDs, parent-child edges, role/nickname/path
metadata, spawn depth and thread-count limits. Child histories fork from a
persisted snapshot. Clients can inspect status and descendants. The official
manual emphasizes returning distilled summaries to the main thread to reduce
context pollution rather than copying raw logs into it.

Omnia decision:

- Persist an `AgentGraph` rather than keeping subagents only in renderer state.
- A spawn records parent, child, role, objective, context snapshot, environment,
  budget, model/provider policy and write scope.
- Enforce maximum threads, depth, token/cost/time budgets and write-conflict
  policy in the kernel.
- Default parallelism to bounded read-heavy work; serialize or isolate
  overlapping writes.
- Return structured findings, evidence IDs, produced artifacts and unresolved
  questions to the parent, not raw logs by default.
- Permit the user to open each child thread and inspect its full trace.
- Do not let child permissions exceed the parent grant without a new approval.

### 4.10 Skills and hooks carry identity, scope and trust

Codex skills separate metadata from content and include scope, canonical path,
plugin identity, optional UI metadata, dependencies and implicit-invocation
policy. Skill roots can be cached, watched and invalidated. Explicit skill
selection avoids ambiguous plain-name matches. Hooks cover session, prompt,
tool, permission, compaction and stop lifecycles. A normalized hook identity is
hashed; managed, trusted, modified and untrusted states are distinguishable.

Omnia decision:

- A skill is a versioned package with immutable version hash, origin, scope,
  owner, signature/trust state, manifest, instructions, scripts, assets,
  dependencies, requested capabilities and evaluation results.
- Resolve explicit mentions by stable ID/path first; names only when unique.
- Freeze selected skill versions into the run snapshot.
- Watch local roots but do not hot-swap a running attempt.
- Treat skill dependency installation and capability changes as explicit flows.
- Hash normalized hook manifests; editing a trusted hook returns it to modified
  state and requires re-review.
- Every hook has timeout, output limit, failure policy and provenance.
- Keep policy-enforcing hooks separate from advisory context hooks.

### 4.11 Memory uses extraction, consolidation, leasing and citations

Codex's memory pipeline is gated to eligible non-ephemeral root sessions. It
claims bounded rollout jobs, extracts structured per-rollout memory with
concurrency caps, redacts secrets, uses retry backoff, then runs a globally
leased consolidation phase. Consolidation selects memories by usage and
recency, synchronizes filesystem artifacts, prunes stale resources, records a
workspace diff and runs an isolated internal agent with no network and no
recursive collaboration. Memory citations refer back to source material.

Omnia decision:

- Split memory into proposal, extraction, normalization, contradiction review,
  promotion, consolidation, retrieval, usage and deletion stages.
- Use leases/idempotency keys for all background stages.
- Never learn from temporary/private modes that opted out.
- Store provenance down to thread/turn/item/source range and extractor version.
- Redact or reject secrets before promotion.
- Maintain supersession and contradiction edges instead of merging incompatible
  facts into one sentence.
- Memory writes are policy decisions, not direct model side effects.
- Consolidation runs in an isolated environment with no network and no ability
  to recursively create agents.
- Usage telemetry affects ranking but never erases explicit pinned memory.
- Every answer that uses memory can identify exact memory entries and original
  source evidence.

### 4.12 Provider definitions and model discovery are separate services

Codex separates provider transport/auth configuration from model-catalog
management. Provider definitions validate incompatible authentication modes,
headers, timeouts, retry behavior and capabilities. Model managers support
static or remote catalogs, caching, TTL/version checks, priority sorting and
controlled fallback behavior.

Omnia decision:

- Separate `ProviderDefinition`, `ProviderCredentialHandle`,
  `ProviderHealthSnapshot`, `ModelDescriptor` and `ModelCatalogSnapshot`.
- BYOK secrets remain opaque handles owned by the native secret broker.
- Validate mutually exclusive auth methods and unsupported transports.
- Fetch model catalogs with ETag/version/TTL where supported and retain the last
  known good snapshot with explicit freshness.
- Never silently replace a requested model unless routing policy explicitly
  allows fallback and records it.
- Freeze provider definition version, model descriptor version, effective
  parameters and fallback decision into every attempt.
- Add Omnia-specific capability and conformance probes because custom providers
  frequently overstate OpenAI compatibility.

Codex intentionally centers the Responses protocol. Omnia's broader provider
scope needs adapters for different native APIs, but they should normalize into
one internal run/item/tool protocol instead of forcing every provider into a
lossy lowest-common-denominator request.

### 4.13 Telemetry spans behavior, not only HTTP latency

Codex records session metadata, request attempts, stream events, time-to-first
token, token usage, tool decisions, sandbox outcomes, tool results and errors.
Telemetry can be disabled or configured, and raw user-prompt logging is a
separate setting.

Omnia decision:

- Emit structured local telemetry for:
  - queue, compile, approval, connection, TTFT and completion latency;
  - request/stream retry and cancellation;
  - input, output, reasoning, cached input/output and tool tokens;
  - RPM, TPM, concurrency and rate-limit windows;
  - provider/model health, conformance and fallback;
  - prompt/context channel cost and omission reasons;
  - per-tool latency, result size, outcome and capability decisions;
  - subagent topology, budget and useful-result ratio;
  - memory/retrieval/skill hit, citation and correction rates;
  - estimated and provider-reported cost with formula provenance.
- Keep diagnostics local by default; remote telemetry is opt-in and redacted.
- Store exact upstream usage alongside normalized fields when policy permits.
- Distinguish measured, provider-reported and estimated values in the UI.
- Do not log prompt bodies, credentials or file contents by default.
- Persist restricted policy/evaluator observations with category, score,
  producer, policy version and timestamp, but exclude them from model context,
  ordinary search, memory learning and user-visible history unless an explicit
  projection contract permits them.

### 4.14 Configuration is layered and provenance-aware

Codex separates global, project, profile, session and managed configuration.
Effective values are resolved with precedence and restrictions; a thread keeps
an inspectable configuration snapshot. The same durable configuration is shared
across CLI, IDE and app surfaces.

Omnia decision:

- Resolve defaults through `system -> managed -> global user -> profile ->
  project -> thread -> turn -> attempt` layers.
- Every effective value can reveal its source layer and validation status.
- Managed constraints narrow user settings; lower-trust content cannot widen
  capabilities.
- Persist snapshots, not mutable config pointers, on runs.
- Provide excellent defaults while allowing advanced values to be exposed and
  reset individually.

## 5. What Omnia should not copy blindly

1. Do not treat a terminal UI's information density as a desktop design system.
2. Do not copy proprietary branding, screenshots or icon assets.
3. Do not expose experimental remote control without authentication and TLS.
4. Do not inherit provider-specific assumptions into Omnia's neutral kernel.
5. Do not equate compaction summaries with source-of-truth facts.
6. Do not let user-initiated shell escape the capability and audit system merely
   because it originated from a UI button.
7. Do not rely on renderer state for approvals, agent topology or durable
   completion.
8. Do not import every upstream feature flag; Omnia needs a smaller stable core
   and capability modules with explicit maturity.

## 6. Omnia gaps exposed by the comparison

The current Omnia foundation already states several correct invariants in ADR
0001, but implementation still needs to close these gaps:

- durable event journal and cursor replay;
- generated, version-matched Rust/TypeScript protocol artifacts;
- authoritative thread/run/item lifecycle and restart recovery;
- append-only run log plus rebuildable projections;
- exact approval receipts and server-initiated resolution;
- a typed tool runtime with terminal outcomes and backpressure;
- persistent agent graph and subagent budgets;
- frozen context/retrieval/memory/skill/provider snapshots;
- compaction checkpoints with provenance and contradiction handling;
- provider catalog freshness, conformance and controlled fallback;
- local-first telemetry covering cost, cache, reasoning and tool behavior;
- memory proposal/extraction/consolidation with leases and source citations;
- stable/experimental capability negotiation across desktop, CLI, web and
  Android clients.

## 7. Recommended implementation slices

### Slice A — protocol and run journal

Deliver:

- protocol initialization and capability negotiation;
- thread, turn, attempt, iteration and item/event schemas;
- bounded transport and retryable overload;
- append-only journal plus SQLite projection;
- start, steer, interrupt, read, resume and fork APIs;
- cursor replay and projection rebuild tests.

Exit gates:

- restarting during every lifecycle phase produces one coherent final state;
- duplicate/reordered events do not corrupt projections;
- fork-mid-turn contains an explicit interruption boundary;
- stable clients reject experimental fields unless opted in.

### Slice B — context compiler and checkpointing

Deliver:

- typed context channels and frozen snapshots;
- retrieval, memory, skill and project-overview inputs;
- selected/omitted reasons and token budgets;
- dependency-group preservation;
- compaction checkpoints and fact supersession.

Exit gates:

- exact provider payload fixtures pass across compile, compact, resume, fork and
  rollback;
- changing a memory/source version invalidates only affected snapshots;
- citations can only target chunks present in the frozen snapshot;
- an updated fact suppresses its obsolete version unless comparison is
  explicitly requested.

### Slice C — capability broker, tools and approvals

Deliver:

- tool registry/runtime contracts;
- environment-aware capability broker;
- exact approval receipts;
- hook lifecycle and trust hashing;
- cancellation, timeouts, output spilling and audit records.

Exit gates:

- argument mutation invalidates approval;
- environment or workspace-root mutation invalidates approval;
- untrusted content cannot widen capabilities;
- every started tool has one terminal outcome after crash recovery;
- unsupported/duplicate/reserved tool names fail closed.

### Slice D — agent graph, environments and goals

Deliver:

- persisted parent/child graph and inspectable child threads;
- role, objective, budget and environment snapshots;
- `Auto`, persistent, isolated and remote environment selection;
- goal lifecycle and continuation policy;
- conflict-aware parallel scheduling.

Exit gates:

- child capabilities are a subset of parent grants unless reapproved;
- thread/depth/cost/time limits are enforced under concurrency;
- overlapping writes are isolated or serialized;
- persistent and isolated environments resume or dispose according to policy;
- child summaries preserve evidence links without flooding parent context.

### Slice E — providers, telemetry, memory and skills

Deliver:

- provider definitions and opaque credential handles;
- live model catalog and conformance probes;
- attempt-level usage/cost/latency health data;
- versioned skill packages and watched roots;
- leased memory extraction/consolidation with citations.

Exit gates:

- catalog fallback is never silent;
- telemetry clearly separates measured/reported/estimated values;
- secrets do not enter logs, memory, artifacts or exports;
- skill edits invalidate trust/version without mutating active attempts;
- memory contradictions and deletion propagate to retrieval and future context.

## 8. Required deterministic test catalog

### Lifecycle and persistence

- initialize is mandatory before mutation;
- start emits one thread start and one turn start;
- deltas never outlive the authoritative completed item;
- interrupt persists an explicit boundary;
- crash after side effect but before acknowledgement is reconciled idempotently;
- resume preserves exact model-visible history;
- fork at completed, active and compacted boundaries is coherent;
- projection rebuild matches the live projection byte-for-byte where practical.

### Context and compaction

- tool calls and outputs are retained/dropped together;
- unsupported modalities are removed with an omission record;
- context version increments after rewrite;
- mid-turn compaction reinjects context at the defined boundary;
- recent user intent and harness metadata remain aligned;
- stale entity facts are superseded rather than merged;
- retrieval and memory citations survive compaction and restart.

### Capabilities and approvals

- canonical command, cwd, environment, TTY or permission changes invalidate a
  cached approval;
- network host/protocol/port changes require a new decision;
- approval expiry and turn/session scope are enforced;
- hook, automated reviewer and user decision provenance is recorded;
- denied/blocked/cancelled actions cannot produce success projections;
- renderer-crafted arbitrary paths are rejected.

### Tools and agents

- reserved and duplicate names are rejected deterministically;
- hidden/deferred tools are absent from the ordinary model-visible list;
- parallel safety declarations are enforced;
- cancellation produces one terminal outcome;
- agent depth/thread/budget limits hold under races;
- closing a parent deterministically handles descendants;
- child write scopes cannot overlap without scheduler policy.

### Providers and telemetry

- auth modes that conflict fail validation;
- stale catalog behavior is explicit;
- requested-model fallback is opt-in and audited;
- fragmented/malformed streams normalize correctly;
- TTFT, retry, tokens, cache, reasoning and cost attach to the correct attempt;
- local telemetry opt-out prevents remote export without disabling diagnostics.

### Memory and skills

- ephemeral/private threads are not learned from;
- concurrent workers cannot claim the same memory job;
- failures back off rather than hot-loop;
- secret canaries are rejected/redacted before promotion;
- contradictory memories remain distinct and reviewable;
- deleted/revoked sources invalidate dependent memory and retrieval;
- ambiguous skill names do not trigger;
- a modified trusted skill/hook becomes modified/untrusted until reviewed.

### Restricted observations, queues and sandboxed streams

- a durable security or evaluator score survives restart and replay but is
  absent from model context, ordinary thread projection, search, forks and
  memory extraction;
- explicit promotion is required before a restricted observation becomes
  model-visible or user-visible;
- a hook-rejected queued item is consumed exactly once and sends zero provider
  requests;
- a rejected queue item cannot block unrelated later items indefinitely;
- sandboxed stream capability is negotiated and defaults to unsupported for a
  legacy executor;
- a streamed file is opened inside the sandbox and continues reading the same
  opened object if the pathname is replaced afterward;
- symlink or reparse-point escapes outside readable roots are rejected;
- Unix descriptor and Windows handle transfer failures produce no ambient
  unsandboxed fallback.

## 9. UI implications derived from the harness

These are interaction requirements, not a request to copy Codex visuals:

- Show thread/turn/item state and recovery honestly; never present a partial
  stream as completed.
- Render subagents as a calm hierarchy with role, status, environment, budget
  and result—not a collection of decorative robot icons.
- Approval surfaces show the exact command/diff/network target, environment,
  requested capability and decision scope.
- Model picker distinguishes provider, model, freshness, health, capability,
  latency, cost and fallback policy.
- Context inspector shows selected and omitted channels, token budget and
  provenance.
- Telemetry dashboards distinguish measured, reported and estimated metrics.
- Memory and skill panels show scope, provenance, version, trust and last use.
- Advanced controls reveal effective value plus source layer and offer a reset
  to the excellent default.

## 10. Source map

Important source locations reviewed at the pinned commit:

| Concern | Codex source |
| --- | --- |
| App-server protocol and lifecycle | `codex-rs/app-server/README.md` |
| Typed thread start/resume/fork contracts | `codex-rs/app-server-protocol/src/protocol/v2/thread.rs` |
| Thread config snapshot and runtime facade | `codex-rs/core/src/codex_thread.rs` |
| Resume/fork/interruption semantics | `codex-rs/core/src/thread_manager.rs` |
| Context history/version/token behavior | `codex-rs/core/src/context_manager/history.rs` |
| Compaction and replacement history | `codex-rs/core/src/compact.rs` |
| Exact compact/resume/fork tests | `codex-rs/core/tests/suite/compact_resume_fork.rs` |
| Tool registry, lifecycle and hooks | `codex-rs/core/src/tools/registry.rs` |
| Approval action and decision flow | `codex-rs/core/src/tools/approvals.rs` |
| Permission request scope | `codex-rs/protocol/src/request_permissions.rs` |
| Agent registry and graph store | `codex-rs/core/src/agent`, `codex-rs/agent-graph-store` |
| Skill identity, roots and selection | `codex-rs/skills`, `codex-rs/core/src/skills.rs` |
| Hook trust and lifecycle | `codex-rs/hooks` |
| Provider definitions | `codex-rs/model-provider-info`, `codex-rs/model-provider` |
| Model discovery/cache/fallback | `codex-rs/models-manager` |
| Session/request/tool telemetry | `codex-rs/otel/src/events/session_telemetry.rs` |
| Memory extraction/consolidation | `codex-rs/memories/README.md`, `codex-rs/memories/read`, `codex-rs/memories/write` |
| Restricted durable security observations | `codex-rs/protocol/src/security_risk.rs`, `codex-rs/history/src/rollout_payload.rs`, `codex-rs/rollout`, `codex-rs/core/src/session/rollout_reconstruction.rs` |
| Sandboxed file streaming and capability negotiation | `codex-rs/exec-server-protocol/src/protocol.rs`, `codex-rs/exec-server/src/sandboxed_file_open.rs`, `codex-rs/exec-server/src/sandboxed_file_system.rs` |
| Queue hook rejection lifecycle | `codex-rs/ext/queue/tests/queue_service.rs` |

Relevant official manual sections reviewed:

- Best practices and durable configuration;
- Multi-agent operations;
- Agent approvals, permissions and sandboxing;
- advanced configuration, hooks and agent roles;
- custom instructions, skills and MCP;
- memory configuration;
- Codex App Server.

Pinned upstream source links:

- Repository tree: <https://github.com/openai/codex/tree/72fa74fbc9c4b72d513304bfa0eda427d2402ed9>
- App-server: <https://github.com/openai/codex/tree/72fa74fbc9c4b72d513304bfa0eda427d2402ed9/codex-rs/app-server>
- Core runtime: <https://github.com/openai/codex/tree/72fa74fbc9c4b72d513304bfa0eda427d2402ed9/codex-rs/core>
- Protocol: <https://github.com/openai/codex/tree/72fa74fbc9c4b72d513304bfa0eda427d2402ed9/codex-rs/app-server-protocol>
- Refresh comparison: <https://github.com/openai/codex/compare/e0de12a126f2beb10599a18fd4ca6b08f6e0a1a0...72fa74fbc9c4b72d513304bfa0eda427d2402ed9>
- Official Codex documentation: <https://developers.openai.com/codex>

The URLs are pinned where source behavior matters so future upstream changes do
not silently alter the evidence behind these recommendations.

## 11. Conclusion

The most valuable lesson from Codex is not a single prompt or tool. It is that
quality comes from a coherent execution contract: durable lifecycle, exact
context, bounded permissions, typed tools, inspectable child agents, replayable
events, versioned configuration and tests that assert what the model actually
saw. Omnia should make that contract the kernel shared by every product surface,
then add its differentiators—deep provenance, adaptive multi-provider routing,
persistent/isolated machines, research/learning structure, artifact workflows
and exceptionally clear Windows UI—without weakening those invariants.
