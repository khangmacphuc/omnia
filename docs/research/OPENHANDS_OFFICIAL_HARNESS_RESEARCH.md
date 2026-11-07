# OpenHands official harness research for Omnia

- Status: research complete; recommendations are informative and are not shipped-capability claims
- Research date: 2026-08-13
- Agent Canvas repository: `All-Hands-AI/OpenHands`
- Reviewed Agent Canvas commit: `4f465f3ccada5271a3bbe4a0148941b0c40d243b`
- Exact Agent Canvas tag: `v1.13.0`
- Agent Canvas commit timestamp: `2026-08-12T21:46:20-04:00`
- Agent Canvas license: MIT, Copyright © 2025 OpenHands contributors
- Software Agent SDK repository: `OpenHands/software-agent-sdk`
- Reviewed SDK commit: `131b7523554b88135ab66d5c733d26263260f3bf`
- SDK commit timestamp: `2026-08-13T02:28:04-04:00`
- SDK license: MIT, Copyright (c) 2026 OpenHands contributors
- Related Omnia research: [`OMNIA_HARNESS_BENCHMARKS.md`](OMNIA_HARNESS_BENCHMARKS.md), [`OPENAI_CODEX_HARNESS_RESEARCH.md`](OPENAI_CODEX_HARNESS_RESEARCH.md), and [`CLAUDE_CODE_HARNESS_RESEARCH.md`](CLAUDE_CODE_HARNESS_RESEARCH.md)

## 1. Purpose, scope, and non-shipped disclaimer

This document records clean-room architectural lessons from the official
OpenHands Agent Canvas and Software Agent SDK source trees. It focuses on the
parts most relevant to Omnia's planned unified Windows 11 product:

- frontend, agent-server, and workspace boundaries;
- local, isolated, and remote environments;
- append-only events, branches, projections, compaction, and recovery;
- leases, resource-aware concurrency, cancellation, and bounded goal loops;
- typed tools, confirmation policy, security analysis, subagents, and workflows;
- memory, skills, provider metrics, telemetry privacy, browser use, and UI
  hierarchy.

This is research, not an implementation inventory. A pattern described here
does not become `Implemented` or `Verified` in Omnia until the current source,
tests, Windows evidence, and release manifest satisfy the applicable Omnia
gate. In particular, this review does not prove that Omnia currently has:

- a production Agent Server or sidecar;
- durable run-event replay end to end;
- supported Windows isolation;
- a persistent-machine lifecycle;
- native tools, subagents, browser control, automations, or remote clients;
- exact native approval enforcement;
- automatic memory or skill execution;
- safe reuse of an existing Edge Canary profile;
- complete provider, usage, latency, or cost telemetry.

OpenHands is a valuable implementation reference, not a substitute for Omnia's
accepted ADRs, threat model, storage contracts, provider contracts, UI
specification, and deterministic release evidence.

## 2. Provenance, licensing, and clean-room boundary

### 2.1 Agent Canvas provenance

The reviewed product/frontend tree was cloned from:

```text
https://github.com/All-Hands-AI/OpenHands.git
```

The reviewed commit is the exact `v1.13.0` tag:

```text
4f465f3ccada5271a3bbe4a0148941b0c40d243b
chore(main): release 1.13.0 (#16413)
```

The public project is also presented under the `OpenHands/OpenHands` GitHub
organization path. The local clone remote and commit above are the provenance
used for this document.

The repository license at the reviewed commit is MIT. Omnia may learn from and,
subject to normal dependency and notice review, reuse permissively licensed
code. This document nevertheless prefers independent contracts over copying
implementation structure because Omnia has different requirements for Windows
privilege boundaries, durable storage, exact approvals, encrypted artifacts,
remote device identity, and cross-client protocol compatibility.

### 2.2 Software Agent SDK provenance

The reviewed runtime tree was cloned from:

```text
https://github.com/OpenHands/software-agent-sdk.git
```

The reviewed commit is:

```text
131b7523554b88135ab66d5c733d26263260f3bf
perf(agent-server): cache unchanged conversation summaries (#4483)
```

The repository license at the reviewed commit is MIT. This tree provides the
strongest source evidence in this review for events, conversation state,
condensation, context integrity, leases, workspaces, tools, workflows, goal
loops, telemetry, memory, skills, and browser execution.

### 2.3 Evidence levels used here

| Level | Evidence | Use in this document |
|---|---|---|
| A | Source or tests pinned to one of the two commits above | Strong evidence for the reviewed implementation contract at that commit. |
| B | Official public architecture, README, or self-hosting guidance in the pinned tree | Strong product-boundary evidence, but not proof of every deployment property. |
| D | Visual inspection of the official automation preview image | Interaction and hierarchy observations only; no pixels, assets, wording, or branding are copied. |
| Not established | A behavior not demonstrated by the pinned sources or supported-platform tests | Must remain unknown, deferred, or independently verified before Omnia relies on it. |

### 2.4 Clean-room UI and product boundary

Omnia may adapt general interaction principles such as calm hierarchy, visible
backend identity, active/inactive states, compact metadata, inspectable traces,
and one clear primary action. Omnia must not copy:

- the OpenHands hand logo or other brand marks;
- exact icons, screenshots, illustrations, or animations;
- exact palette, typography, spacing, card geometry, navigation composition,
  or wording;
- vendor-specific prompts, templates, default agents, or workflow content
  without separate license and product review.

Omnia keeps its own Windows 11 visual language, aperture mark, custom entity
icons, semantic tokens, interaction contracts, terminology, and accessibility
matrix.

## 3. Executive findings

The strongest OpenHands patterns for Omnia are:

1. Keep the frontend, agent server, and workspace runtime as separate
   responsibilities even when they ship in one desktop application.
2. Allow one client to register and switch among multiple backends, but model
   each backend as a typed environment rather than an arbitrary URL.
3. Treat direct host mode as dangerous host authority, not as a harmless local
   default.
4. Persist immutable events and rebuild model-visible state from an explicit
   active branch.
5. Represent branches as event ancestry with an explicit leaf/head; navigation
   changes the selected branch, not history.
6. Preserve raw history during condensation and apply a summary/forgetting
   marker to the context view.
7. Enforce atomic context properties so tool calls, results, parallel batches,
   and thinking/tool loops are never separated by compaction.
8. Detect actions with unknown outcomes after a crash and avoid treating them
   as safe automatic retries.
9. Fence concurrent conversation ownership with a monotonic lease generation.
10. Serialize only overlapping tool resources and allow independent work to run
    concurrently.
11. Treat REST/OpenAPI shape as a public compatibility contract with
    deterministic schema generation and a deprecation runway.
12. Bound autonomous work with iteration limits, goal-controller separation,
    stuck detection, cancellation, and terminal reasons.
13. Model subagents as child conversations and give workflows explicit
    concurrency limits and structured map/reduce primitives.
14. Keep telemetry payloads allowlisted and reject prompts, paths, secrets,
    tracebacks, and raw exception messages from exported analytics.
15. Keep browser recording and storage/session access behind explicit product
    policy rather than silently exposing them to the model.

OpenHands is especially strong evidence for a multi-backend agent product,
append-oriented conversation trees, view-based condensation, leases,
resource-aware parallelism, goal-loop safeguards, workflow tooling, and
privacy-constrained telemetry. Omnia should adopt those invariants while
intentionally exceeding the reviewed design in exact approval receipts,
transactional persistence, Windows capability separation, structured memory
supersession, browser-session privacy, encrypted artifacts, remote device
identity, and full task/run/attempt/iteration/item provenance.

## 4. Product, backend, and runtime boundaries

### 4.1 What Agent Canvas owns

The pinned Agent Canvas architecture assigns the frontend responsibility for:

- rendering conversations, terminal, browser, files, settings, and automations;
- managing frontend state for conversations, backend selection, settings,
  profiles, and local metadata;
- translating user actions into Agent Server calls;
- shipping a standalone app and embeddable library entrypoints.

It explicitly does not assign the frontend responsibility for:

- executing agent actions directly;
- providing the sandbox or isolation layer;
- owning backend LLM credentials outside the configured backend;
- running automation jobs without an automation backend.

This separation matters more than process topology. Even if Omnia initially
embeds a kernel in the Tauri process, the renderer must interact through one
typed protocol and must not become the authoritative agent loop.

### 4.2 Omnia decision: one kernel, many client adapters

Omnia should use this boundary:

```text
Windows desktop / web / CLI / IDE / Android / remote clients
                         |
              versioned Omnia protocol
                         |
                    Omnia Kernel
          +--------------+---------------+
          |              |               |
    run journal     capability broker   environment manager
          |              |               |
    context/tools   approvals/effects   local/isolated/remote
          |              |               |
       providers       audit          workspaces/machines
```

The Tauri renderer is a client adapter. It may cache or optimistically project
state, but it must not author authoritative run IDs, context snapshots,
provider payloads, environment grants, approval receipts, or durable events.

### 4.3 Boundary invariants

- A renderer restart cannot lose the authoritative run.
- A second client can subscribe without creating a second execution contract.
- A compromised renderer cannot read provider secrets, blob keys, raw browser
  credentials, or unrestricted workspace paths.
- Backend selection cannot grant filesystem, network, process, browser, or
  privileged capabilities.
- Automation scheduling cannot bypass the same run, policy, environment,
  provider, budget, and audit gates used by interactive work.
- Every client-visible state must be a projection of durable kernel facts or be
  labeled explicitly as local/ephemeral UI state.

## 5. Multi-backend environments

### 5.1 OpenHands evidence

Agent Canvas can register more than one Agent Server and switch among local,
remote, and hosted backends. Its architecture also distinguishes optional
ingress and automation services. The backend supplies runtime-service
information instead of requiring the agent to guess service ports.

This is strong evidence that environment/backend identity belongs in product
state rather than hidden connection configuration.

### 5.2 Omnia environment model

Omnia should model every execution target as a first-class `Environment` with:

- stable environment ID and display name;
- kind: `none`, `persistent`, `isolated`, or `remote`;
- backend/kernel endpoint identity;
- lifecycle and ownership state;
- supported operating system and architecture;
- workspace mounts and access mode;
- network policy and DNS/proxy/tunnel configuration;
- secret-binding references;
- snapshot, reset, pause, resume, and delete capabilities;
- health, capacity, drift, software inventory, and last-attested time;
- policy and capability ceiling;
- lease/fencing generation;
- provenance for how `Auto` selected it.

`Auto` is an environment selector only. It may decide that a text-only request
needs no execution, that trusted continuing work benefits from a persistent
environment, or that risky parsing needs an isolated environment. It cannot
grant a capability or approve an operation.

### 5.3 Never infer isolation from backend labels

A connected Agent Server URL is not proof of isolation. A Docker, VM, cloud, or
remote label is also insufficient without tested containment properties.

Before Omnia calls an environment `isolated`, it needs supported-platform
evidence for:

- mount and path containment;
- process, token, and named-object isolation;
- network egress policy;
- host secret and environment-variable exclusion;
- clipboard, browser, GPU, device, and IPC boundaries;
- restart, reset, snapshot, and deletion semantics;
- escape and confused-deputy tests;
- auditability of capability and approval decisions.

The reviewed OpenHands sources do not establish Omnia's supported Windows
isolation story. That capability remains deferred until Omnia has its own
Windows test matrix.

## 6. Host mode and persistent-machine danger

### 6.1 OpenHands warning

The pinned Agent Canvas architecture says its full local development mode gives
the agent host filesystem access and should be used only in trusted
environments. The self-hosting guide is more explicit: an agent can read and
write the host filesystem, execute shell commands, and reach the network, and
anyone able to control the Agent Server can exercise the same powers.

The SDK `LocalWorkspace` is therefore evidence of a host workspace mechanism,
not evidence of safe isolation.

### 6.2 Omnia decision

Omnia must not present direct host mode as silently safe. A persistent machine
may retain work and caches, but persistence does not widen authority.

Required controls include:

- explicit, revocable workspace grants;
- a typed capability evaluation for each operation;
- exact operation-bound approval when policy requires it;
- no unauthenticated public listener;
- process and environment-variable allowlists;
- network egress policy and visible proxy/VPN/DNS provenance;
- durable effect and audit ledgers;
- device identity, TLS, replay protection, and granular remote grants;
- snapshot/reset/drift reporting that does not imply effect rollback beyond the
  recorded coverage.

A bearer API key may be one authentication factor, but it is not sufficient as
Omnia's complete remote-control security model.

## 7. Protocol and API evolution

### 7.1 OpenHands evidence

The Agent Server treats its REST/OpenAPI surface as a public contract. The
pinned repository includes:

- deterministic OpenAPI serialization tests;
- typed request and response schemas;
- discriminated unions for MCP server/auth variants;
- checks against unrestricted or missing schemas;
- a five-minor-release deprecation runway for breaking REST changes;
- compatibility comparison against a previous release.

Its own engineering guidance also notes that WebSocket and SSE surfaces are not
covered by the OpenAPI compatibility policy.

### 7.2 Omnia decision

Omnia should adopt deterministic, generated schemas for every client-facing
contract and extend compatibility coverage beyond REST:

- protocol initialize/initialized handshake;
- request, response, notification, and error envelopes;
- durable event/replay cursor format;
- WebSocket and streaming item lifecycle;
- Tauri IPC adapter;
- CLI stdio/socket adapter;
- remote web and Android transports;
- extension, MCP, tool, skill, and provider manifests.

Privileged APIs must avoid unrestricted opaque dictionaries. Typed extension
bags require namespaces, size limits, redaction rules, and a clear untrusted
data classification.

### 7.3 Compatibility gates

- Schema export is byte-deterministic.
- Every union has a stable discriminator.
- Additive fields have explicit defaults and downgrade behavior.
- Breaking changes require a versioned migration path and deprecation window.
- Stable and experimental surfaces are distinguishable.
- A client can negotiate capabilities without assuming version equality.
- Streaming and replay protocols receive the same compatibility tests as REST.
- A weak-schema allowlist is exact, owned, justified, expiring, and ratcheted.

## 8. Append-only events and rebuildable state

### 8.1 OpenHands event log

The SDK event base carries a stable ID, timestamp, source, and optional
`parent_id`. Events sharing a parent are sibling branches. The event log:

- appends immutable event records;
- rejects duplicate event IDs;
- rejects an explicit parent that does not exist;
- supports explicit roots;
- preserves a legacy linear-parent fallback;
- reconstructs a root-to-leaf path;
- detects cycles and missing ancestors;
- locks concurrent writes.

OpenHands persists file-per-event records. That is useful reference behavior,
but it is not the target Omnia storage architecture.

### 8.2 Omnia journal decision

Omnia should use a transactional SQLite event journal plus rebuildable typed
projections:

```text
normalized runtime fact
  -> validate identity, parent, state, epoch, and idempotency
  -> append immutable event
  -> update affected projection in the same transaction
  -> commit
  -> publish committed event and durable cursor
```

Each event should include or bind:

- event and schema version;
- task/thread, branch, run, iteration, attempt, item, agent, and environment IDs
  where applicable;
- parent/causal identity;
- per-run sequence and journal epoch;
- producer identity and idempotency key/hash;
- canonical payload hash;
- provenance and authority classification;
- policy, tool, provider, model, context, attachment, and capability references;
- created/committed time;
- terminal/recovery semantics.

Renderer notifications are consequences of committed events. They are never
the only copy of provider or tool output.

### 8.3 Projection behavior

- A projection can be rebuilt from a fixed journal cursor.
- Rebuild produces byte-equivalent canonical projection output.
- Projection corruption is reported as `recovering` or `invalid`, never as an
  empty conversation.
- A lost response to an append command can return the existing committed event
  only when exact idempotency identity matches.
- Text/content equality alone never deduplicates events.
- Legacy incomplete histories are labeled partial rather than backfilled with
  invented facts.

## 9. Event trees, branches, forks, and navigation

### 9.1 OpenHands evidence

Conversation state persists an active `leaf_event_id`, supports explicit empty
head semantics, reconstructs the active branch, and exposes navigation to a
chosen event. Appending after navigation creates a divergent branch without
rewriting existing events.

This is a clean demonstration that branch selection and event history are
different state.

### 9.2 Omnia branch contract

Omnia should adopt immutable ancestry and an explicit active head while keeping
its richer graph:

```text
Profile
  -> Project? / projectless Conversation
       -> Branch
            -> Task? / ordinary chat
                 -> Run
                      -> Iteration
                           -> Provider Attempt
                                -> Item / Event
```

The exact `Iteration` versus `Provider Attempt` order must remain consistent
with the accepted Omnia run ADR and storage schema. This document does not
silently migrate that semantic.

Branch rules:

- navigation changes only the active projection/head;
- branch creation never mutates old messages or events;
- edit-message creates a replacement on a new branch;
- retry/regenerate creates an explicit sibling run or branch;
- background, automation, and subagent output remains bound to the producing
  branch captured at dispatch;
- switching the UI's active branch cannot redirect a live producer;
- fork-at-event excludes later siblings;
- mid-run fork requires an explicit interruption/partial-output policy;
- branch compare reads immutable inputs and outputs and cannot promote changes
  without a separate operation.

## 10. Journal-preserving condensation

### 10.1 OpenHands evidence

OpenHands represents condensation as an event containing:

- the event IDs to forget from the model-visible view;
- an optional summary;
- an optional summary insertion offset;
- the LLM response ID that produced the condensation.

The view removes forgotten events and optionally inserts a deterministic
summary event. The raw event log remains intact. Condensers also calculate
forgetting ranges around atomic units rather than trimming arbitrary messages.

### 10.2 Omnia decision

Omnia should strongly adopt journal-preserving compaction/checkpoint markers.
It should not delete or rewrite raw user, provider, tool, approval, citation, or
artifact history merely to reduce model context.

An Omnia compaction checkpoint should persist:

- algorithm name and version;
- input branch cursor and input event IDs/hashes;
- omitted IDs and exact omission reasons;
- summary and summary hash;
- insertion/serialization location;
- model/provider/parameters if model-assisted;
- deterministic pre-reduction output when applicable;
- token counts before and after;
- protected dependency groups;
- survival-rule decisions;
- validation results;
- creation reason and creator;
- superseded checkpoint identity when relevant.

Retry with the same frozen provider input reuses the same checkpoint. A new
compaction creates a new context snapshot and a new journal fact.

### 10.3 Typed survival rules

OpenHands condensation is a strong base, but Omnia requires explicit survival
rules for:

- current user intent and corrections;
- active goal, constraints, budgets, and completion gates;
- exact approvals and unresolved confirmation requests;
- unresolved tool calls and outcome-unknown effects;
- provider/tool message dependency groups;
- source citations and claim support;
- active memory revisions and supersession edges;
- skill versions and activation reasons;
- artifact lineage and user-selected files;
- branch/agent/environment identity;
- user-visible omissions and uncertainty.

Old and new revisions must not be merged as equal instructions. A current
correction supersedes the older fact in the active context while preserving
historical provenance.

## 11. Context-view integrity

### 11.1 OpenHands evidence

The SDK context view defines properties for:

- observation uniqueness;
- parallel tool-call batch atomicity;
- tool-call/action and result/observation matching;
- thinking/tool-loop atomicity.

The condenser uses these properties to avoid producing provider histories that
violate tool or reasoning structure.

### 11.2 Omnia dependency groups

Omnia should generalize this into a typed context dependency graph. A selected
or omitted group must remain atomic when provider semantics require it:

- user turn and its assistant answer;
- provider tool-call batch and all required results;
- approval request, decision, effect, and observation;
- shell/terminal command, exit, stdout/stderr digest, and file effects;
- browser action, fresh frame/state, and postcondition;
- citation claim, source snapshot, locator/span, and validation result;
- structured output schema, payload, and validation result;
- artifact derivation chain;
- thinking/reasoning item and its provider-required tool loop;
- subagent assignment, result, evidence, and merge decision.

Provider adapters own exact serialization and post-serialization token
recounting. The context inspector projects the frozen snapshot and exact span
mapping; it does not reconstruct a different context from current UI state.

## 12. Crash recovery and unknown effects

### 12.1 OpenHands evidence

OpenHands scans for actions that have no matching observation, user rejection,
or error. Recovery can synthesize terminal observations so a conversation does
not remain permanently hung after a crash.

This is an important invariant: an incomplete action/result pair must become a
visible recovery state rather than disappearing.

### 12.2 Omnia recovery semantics

Omnia should distinguish:

- `failed`: the operation is known not to have succeeded;
- `cancelled`: work stopped cooperatively, without implying rollback;
- `rejected`: policy or user denied the operation before execution;
- `outcome_unknown`: the operation may have produced an external effect;
- `recovered`: recovery logic produced a synthetic terminal record;
- `completed`: postconditions or authoritative response prove completion.

Rules:

- `outcome_unknown` is never retried automatically.
- Synthetic recovery events are visibly distinguishable from real tool/provider
  results.
- Recovery records the previous observed state, recovery reason, recovery
  algorithm version, and ownership epoch.
- A cancel request records what was cancelled and what could still have escaped.
- Git or conversation rewind never claims to reverse process, service, network,
  database, browser, remote, or privileged effects it did not record and undo.
- Provider replay requires a durable request identity and explicit idempotency
  evidence.

## 13. Conversation leases and fencing

### 13.1 OpenHands evidence

The Agent Server conversation lease includes:

- owner instance identity;
- monotonic generation;
- expiry;
- optional host and PID metadata.

Renewal and guarded writes require the claimed generation. Takeover after expiry
increments the generation, and tests prove that a stale owner cannot write or
release the new owner's lease.

### 13.2 Omnia decision

Omnia should adopt fencing tokens for:

- conversations and runs;
- execution environments and persistent machines;
- agents and subagents;
- automation, indexing, compaction, retrieval, and evaluation jobs;
- provider uploads and long-running artifact transforms.

Every worker mutation carries the current ownership epoch. A stale epoch cannot
append events, mutate projections, release the new lease, publish artifacts, or
claim completion.

Takeover should append a durable recovery/ownership event. Omnia's authoritative
lease should use database-backed transactions or an equivalently atomic store;
file locks alone are not the target cross-process/remote contract.

### 13.3 Required lease tests

- Repeated claim by the same owner preserves generation.
- Live conflicting owner is denied.
- Expired takeover increments generation.
- Stale owner cannot renew, write, complete, or release.
- Crash during takeover leaves one authoritative owner.
- Lease expiry during a provider/tool call prevents stale completion publish.
- Replay and projections expose the ownership transition.

## 14. Resource-aware parallelism

### 14.1 OpenHands evidence

The SDK resource lock manager:

- locks named resources independently;
- acquires keys in sorted order to prevent deadlock;
- serializes overlapping resources;
- allows different resources to execute concurrently;
- uses timeouts;
- releases partial acquisitions on timeout or exception.

### 14.2 Omnia decision

Omnia tool descriptors should declare read/write effects and canonical resource
claims, for example:

```text
workspace:<grant-id>:path:<canonical-relative-path>
git:<repo-id>:index
terminal:<environment-id>:session:<session-id>
browser:<session-handle>:tab:<tab-id>
artifact:<artifact-id>
provider-upload:<provider-id>:<upload-id>
machine:<environment-id>:policy
```

The scheduler acquires a deterministic sorted set and records wait,
acquisition, timeout, release, and contention telemetry.

Resource locking and security approval are separate gates. A lock prevents
concurrent corruption; it does not authorize the operation. Conversely, an
approval does not make two conflicting writes safe to run concurrently.

## 15. Workspaces and environment abstractions

### 15.1 OpenHands evidence

The SDK defines base, local, and remote workspace abstractions and has tests for
Docker, Apptainer, API remote workspaces, pause/resume, command isolation, and
remote output behavior. Agent Canvas can select among Agent Server backends.

This supports a transport-neutral workspace interface, but the reviewed stress
guidance also notes POSIX-specific assumptions in parts of the test suite.

### 15.2 Omnia adaptation

Omnia should define one workspace contract whose implementation can be:

- no-execution/model-only;
- explicitly granted Windows host workspace;
- isolated Windows sandbox or VM;
- WSL/Linux container where supported;
- remote Windows/Linux/macOS machine;
- hosted ephemeral workspace.

The contract must expose real capabilities instead of pretending every
workspace supports the same operations. Examples:

- file read/write/watch;
- process/terminal sessions;
- Git/worktree operations;
- ports and preview URLs;
- snapshots and resets;
- network controls;
- file transfer and artifact publication;
- pause/resume;
- browser and display availability;
- supported privilege broker;
- cancellation and cleanup guarantees.

Unsupported operations fail closed with a stable reason. Provider/model,
skill, rule, or agent role cannot widen the workspace capability ceiling.

## 16. Typed tools and execution effects

### 16.1 OpenHands evidence

The SDK uses typed action and observation models, tool definitions, annotations,
executors, and cancellation. Tool annotations can describe read-only,
destructive, idempotent, and open-world properties. The workflow tool exposes a
small capability object rather than arbitrary runtime internals.

### 16.2 Omnia tool descriptor

Omnia should require each tool/version to declare:

- stable tool ID, version, code/content hash, publisher, and trust state;
- input and output schemas;
- capability requirements;
- read/write/external/privileged effects;
- resource claims;
- environment requirements;
- network destinations and data classes;
- secret handles it may consume;
- cancellation and timeout semantics;
- idempotency and retry policy;
- approval template and canonicalization method;
- audit redaction rules;
- postconditions and validators;
- terminal outcome vocabulary.

The model receives only tools exposed by the current mode, environment,
capability decision, trust policy, and budget. A tool description is untrusted
metadata and cannot grant authority.

## 17. Security analysis versus exact approvals

### 17.1 OpenHands evidence

OpenHands provides risk levels, security analyzers, confirmation policies, and
defense-in-depth tests, including adversarial and shell-parser cases. These are
useful signals for when an action deserves confirmation or denial.

### 17.2 Critical Omnia divergence

Risk-oriented confirmation is not a substitute for Omnia's exact,
operation-bound, single-use approval receipt.

An Omnia approval should bind at least:

- operation/tool ID and version hash;
- canonical full arguments hash;
- target, cwd, workspace grant, and environment ID;
- capability set and policy decision/version;
- provider/network/secret egress when applicable;
- user-visible preview hash;
- scope, allowed count, expiry, and consumption state;
- approving identity and decision time.

Any material change invalidates the receipt. Analyzer output is a risk input,
not authority. Analyzer failure, parser ambiguity, or canonicalization failure
must fail conservatively.

The confirmation policy, OS sandbox, resource lock, workspace grant, privileged
Windows broker, and audit ledger remain distinct layers.

## 18. Goal loops, stuck detection, and cancellation

### 18.1 OpenHands evidence

Conversation state has a maximum iteration count and optional stuck detection.
The goal subsystem separates controller, runner, and judge responsibilities.
Tests cover goal-loop outcomes and interruption. The stuck detector identifies:

- repeated action/observation loops;
- repeated action/error loops;
- agent monologues;
- alternating repetitive patterns;
- a reserved path for repeated context-window failures.

The workflow executor also has explicit concurrency and time limits, and
conversation cancellation propagates through running work.

### 18.2 Omnia completion gates

Omnia should interpret “continue until perfect” as a request for a bounded
quality controller, not an infinite loop.

Each autonomous run needs:

- objective and non-goals;
- explicit completion gates;
- iteration, wall-clock, token, cost, tool, subagent, and storage budgets;
- no-progress and repeated-diff/diagnostic detection;
- deterministic validators;
- citation and artifact requirements;
- policy and effect checks;
- independent review where the risk warrants it;
- checkpoint and resumability semantics;
- terminal reason: completed, capped, stuck, cancelled, denied, failed, or
  outcome unknown.

An unparseable or unavailable LLM judge cannot falsely mark a run complete.
Cancellation stops future work but does not claim effect rollback.

## 19. Subagents and dynamic workflows

### 19.1 OpenHands evidence

OpenHands provides named subagent definitions and child-conversation/task
infrastructure. Its dynamic workflow tool exposes:

- `run_agent`;
- bounded `map_agents`;
- `reduce_agent`;
- per-item pipeline stages;
- a maximum concurrency setting;
- time and input-size bounds;
- fresh child tasks tied to a parent conversation.

The workflow schema marks the tool as destructive, non-idempotent, and
open-world, and its own description warns that generated Python executes
in-process after best-effort validation. This is useful evidence and also an
important warning against treating generated orchestration code as a safe
sandbox.

### 19.2 Omnia agent DAG

Omnia should adopt bounded map/reduce workflows but represent every child as a
first-class durable agent/run node with:

- immutable agent ID and role/version;
- parent-child edge and producing branch;
- frozen input/context/provider/environment/tool set;
- capability intersection with the parent ceiling;
- depth, concurrency, token, cost, time, and effect budgets;
- lease/fencing generation;
- typed progress and terminal events;
- structured findings, citations, artifacts, and unresolved questions;
- explicit merge/reduce decision and reviewer evidence.

Display names are not identities. Browser, terminal, repository, and other
executors must not be hidden mutable globals shared across children.

Generated workflow code should run only in an isolated, capability-limited
runtime after validation and approval appropriate to its effects. In-process
execution in the authoritative kernel is not the Omnia target.

## 20. Memory and skills

### 20.1 OpenHands memory evidence

The reviewed SDK supports a small two-tier Markdown memory model, commonly
represented by user and project memory files. This is useful because it is
human-readable and can be included in context without a proprietary store.

It is not sufficient for Omnia's correction, deletion, sensitivity, and
supersession requirements.

### 20.2 Omnia memory model

Markdown should be an editable projection, not the authoritative record. Native
memory needs:

- stable memory and revision IDs;
- global/profile/project/conversation/branch scope;
- proposal, approval, active, superseded, rejected, expired, and deleted state;
- source evidence and authority;
- confidence and sensitivity;
- created/updated/expiry time;
- contradiction and supersession edges;
- retrieval eligibility and omission reason;
- encryption/egress policy;
- derivative indexes and deletion status.

The active context includes only the current valid revision for the applicable
scope. Explicit current user corrections dominate older memory. Memory may
suggest but cannot grant a capability, approve an operation, or insert secret
material into a provider request without egress policy.

### 20.3 OpenHands skills evidence

The SDK skill system includes public, user, organization, and project sources;
keyword, task, and path-style activation; explicit invocation; and progressive
disclosure. Conversation state tracks activated and invoked skills to avoid
repeated injection.

### 20.4 Omnia skill model

Omnia should adopt conditional activation and progressive disclosure while
requiring:

- stable skill and immutable version IDs;
- content and manifest hashes;
- publisher/origin/license/trust state;
- declared tools, MCP, network, process, storage, secret, and capability needs;
- scope and activation rules;
- validation and test evidence;
- activation/omission reason recorded in the context snapshot;
- frozen version before agent dispatch;
- explicit update capability diff and reapproval when authority changes.

Skills are untrusted instructions. Repository or imported skills do not execute
or gain capabilities merely because a project was opened.

## 21. Provider metrics and telemetry privacy

### 21.1 OpenHands evidence

The reviewed SDK tracks model request metrics such as token usage, cache usage,
reasoning tokens, cost, latency, context window, and child/subagent attribution.

The Agent Server product telemetry is intentionally narrower. Its versioned
analytics models use allowlisted fields and coarse buckets, and its tests reject
or exclude prompts, messages, concrete paths, secrets, exception messages, and
tracebacks. Telemetry is disabled by default in the reviewed test contract.

### 21.2 Omnia telemetry split

Omnia should separate:

1. **Local high-fidelity trace:** encrypted/local, inspectable, retention-bound,
   and capable of correlating run, attempt, context, tool, agent, citation,
   artifact, environment, approval, and effect events.
2. **Optional exported diagnostics:** consented, allowlisted, redacted, bounded,
   and unable to contain prompt/output bodies, secrets, raw paths, cookies,
   authorization headers, signed URLs, response bodies, or tracebacks.

Per-attempt timing should extend beyond a single latency number:

- DNS, connect, TLS, provider queue, request upload;
- time to headers, first token, first meaningful token, and last token;
- output tokens per second;
- retry and backoff;
- tool wait, resource-lock wait, approval wait, and subagent wait;
- cache read/write and reasoning/visible-output tokens;
- provider-reported versus estimated usage;
- pricing-table version, currency, and cost confidence.

Parameter degradation, capability emulation, provider fallback, and model
substitution must remain visible. Telemetry never becomes a covert prompt or
secret export channel.

## 22. Browser, desktop, IDE, and remote boundaries

### 22.1 OpenHands browser evidence

The browser toolset includes typed navigation and interaction actions,
screenshots/state observations, allowed-domain configuration, tabs, lazy
initialization, action timeouts, dead-session reset behavior, rrweb-style
recording, and cleanup tests.

This is useful evidence for a durable browser executor lifecycle. It does not
authorize Omnia to expose a user's cookie/password stores or to evade website
security challenges.

### 22.2 Omnia browser policy

- Existing Edge Canary sessions are represented by opaque, revocable session
  handles.
- Raw cookies, passwords, tokens, browser databases, and vault contents are not
  model-accessible.
- Login recovery uses browser autofill, Windows Hello, or explicit user action.
- CAPTCHA or challenge appearance pauses for the user; Omnia does not implement
  anti-bot or stealth fingerprint evasion.
- Browser recording requires explicit scoped consent, a visible indicator,
  bounded retention, and deletion controls.
- Rights-bound, non-DRM media/file capture uses an auditable request/manifest/
  segment ledger with size, count, domain, and time limits.
- Download/merge logic does not bypass authorization, paywalls, DRM, signed-URL
  scope, or regional access controls.
- DNS, proxy, VPN, and tunnel options remain user-controlled network policy;
  they are not covert bypass features.

### 22.3 IDE and computer-use adaptation

OpenHands demonstrates browser, terminal, file, and workspace surfaces, but
Omnia should continue to keep IDE, computer use, and privileged Windows
operations physically gated until the kernel journal, exact approvals,
environment policy, effect ledger, and supported-platform tests are ready.

Visual input/control and privileged system mutation are separate capabilities.
Administrative work should use typed UAC-elevated operations with canonical
arguments and postcondition verification, never a silently reusable generic
SYSTEM or TrustedInstaller shell.

## 23. UI observations from Agent Canvas

### 23.1 Evidence boundary

The official automation preview image was visually inspected as D-level
evidence. One screenshot cannot establish the whole product design system,
responsive behavior, accessibility, or every state.

### 23.2 Patterns worth adapting

- A restrained dark shell with low decorative noise.
- Compact left navigation separated from the main reading surface.
- A centered content column with generous readable width.
- One clear primary action for the screen.
- Search and view controls close to the content they affect.
- Explicit active and inactive sections.
- Cards that prioritize title, description, action, and typed metadata.
- Integration-specific icons used sparingly.
- Muted secondary text and limited glow/gradient decoration.

### 23.3 Patterns not to copy

- the OpenHands logo or hand mark;
- exact layout proportions, sidebar structure, typography, palette, spacing,
  card sizes, border treatment, labels, or copy;
- GitHub, Slack, or other third-party marks outside their permitted integration
  contexts;
- screenshots or vendor assets in Omnia product UI.

Omnia should preserve its own Windows 11 shell, semantic density modes,
aperture identity, custom entity-icon family, accessible focus behavior,
light/dark/forced-color support, and independent visual-regression matrix.

## 24. Adopt, adapt, defer, and reject matrix

| OpenHands pattern | Omnia decision | Rationale and boundary |
|---|---|---|
| Agent Canvas separate from Agent Server/workspace | **Adopt** | Keeps every client on one authoritative protocol and removes secrets/execution from the renderer. |
| Multiple local/remote/hosted backends | **Adapt** | Model typed environments with lifecycle, health, policy, mounts, identity, and drift instead of arbitrary URLs. |
| Host-mode workspace | **Defer as default; constrain** | Useful for explicitly trusted workflows, but never evidence of isolation or unrestricted safe persistence. |
| Append-only event log | **Adopt** | Use transactional SQLite journal and rebuildable projections rather than file-per-event storage. |
| Event-tree active leaf/navigation | **Adopt + extend** | Add first-class conversation branches, runs, attempts, iterations, items, agents, environments, and immutable output routing. |
| View-based condensation | **Adopt + extend** | Preserve raw history and add hashes, versions, reasons, protected groups, citations, memory supersession, and validation. |
| Context atomicity properties | **Adopt + generalize** | Apply dependency groups to tools, approvals, citations, artifacts, structured outputs, and agent handoffs. |
| Synthetic crash-recovery observations | **Adapt** | Distinguish synthetic recovery from real results and preserve `outcome_unknown`; never auto-retry unknown effects. |
| Conversation lease generation | **Adopt** | Extend fencing to environments, agents, jobs, uploads, transforms, and every worker mutation. |
| Per-resource sorted locks | **Adopt** | Serialize overlapping effects while preserving safe parallelism; keep authorization separate. |
| REST/OpenAPI compatibility checks | **Adopt + extend** | Include WebSocket, event/replay, Tauri, CLI, remote, and extension protocols. |
| Risk analyzer and confirmation policy | **Adapt only** | Use as risk signals; exact single-use Omnia approval receipt remains authoritative. |
| Bounded goal controller/judge | **Adopt + extend** | Add deterministic validators, citation/artifact/effect gates, budgets, and conservative judge failure. |
| Repetition/stuck detection | **Adopt + extend** | Add repeated diff, diagnostic, search, citation, provider, browser, and subagent no-progress signals. |
| Dynamic in-process workflow Python | **Reject as Omnia kernel default** | Generated code needs an isolated capability-limited runtime; best-effort AST checks are not a security boundary. |
| Bounded map/reduce subagent workflows | **Adopt + extend** | Persist a typed agent DAG, budgets, capabilities, environments, evidence, and merge decisions. |
| Markdown user/project memory | **Adapt as projection** | Native source of truth needs revisions, evidence, scope, sensitivity, contradiction, supersession, expiry, and deletion. |
| Progressive-disclosure skills | **Adopt + extend** | Freeze version/hash, record activation reasons, validate trust, and never let skills grant authority. |
| Provider usage/latency/cost metrics | **Adopt + extend** | Preserve attempt-level attribution, richer timing, pricing provenance, health, fallback, and parameter degradation. |
| Allowlisted privacy telemetry | **Adopt** | Keep high-fidelity local traces separate from optional exported diagnostics. |
| Browser tabs/screenshots/recording | **Adapt and gate** | Require opaque sessions, explicit recording consent, retention policy, challenge handoff, and no credential-vault export. |
| API key as primary public self-host defense | **Insufficient for Omnia remote control** | Add device identity, TLS, replay protection, granular grants, revocation, and remote audit. |
| OpenHands visual identity | **Reject copying** | Preserve independent Omnia design, icons, brand, wording, and Windows integration. |

## 25. Deterministic regression catalogue

The following test names are proposed Omnia contracts. They are not claims that
the tests already exist.

### 25.1 Events, projections, and branches

```text
event_append_rejects_duplicate_id
event_append_rejects_missing_explicit_parent
event_append_rejects_stale_journal_epoch
active_branch_reconstructs_exact_root_to_leaf_path
active_branch_rejects_missing_ancestor
active_branch_rejects_cycle
branch_navigation_never_mutates_existing_event
fork_at_event_excludes_later_siblings
background_output_returns_to_producing_branch
journal_replay_rebuilds_identical_projection
event_append_and_projection_update_commit_atomically
renderer_receives_only_committed_event_cursor
legacy_partial_history_never_claims_complete_replay
```

### 25.2 Context and compaction

```text
compaction_marker_never_deletes_raw_history
compaction_checkpoint_binds_input_cursor_and_hashes
compaction_preserves_parallel_tool_batch_atomicity
compaction_preserves_action_result_pairing
compaction_preserves_thinking_tool_loop_atomicity
compaction_preserves_current_user_correction
compaction_preserves_unresolved_approval_and_effect
compaction_never_reactivates_superseded_memory
context_snapshot_records_every_selection_and_omission_reason
provider_serialization_maps_exact_snapshot_spans
```

### 25.3 Recovery, leases, and concurrency

```text
recovery_marks_orphaned_action_outcome_unknown
synthetic_recovery_is_distinguishable_from_real_observation
outcome_unknown_action_is_never_auto_retried
cancelled_run_does_not_claim_effect_rollback
lease_takeover_increments_fencing_generation
stale_lease_owner_cannot_write_or_release_new_owner
lease_loss_blocks_stale_provider_completion_publish
resource_locks_serialize_overlapping_effects_only
resource_locks_allow_independent_effects_in_parallel
resource_lock_acquisition_order_prevents_deadlock
resource_lock_timeout_releases_partial_acquisitions
```

### 25.4 Protocol and environments

```text
api_schema_export_is_deterministic
protocol_union_has_stable_discriminator
breaking_protocol_change_requires_versioned_migration
weak_privileged_schema_fails_quality_gate
environment_selection_never_grants_permission
host_environment_never_implies_unrestricted_capability
isolated_environment_requires_supported_platform_attestation
remote_environment_requires_device_identity_and_replay_protection
stale_environment_lease_cannot_mutate_workspace
```

### 25.5 Goals, cancellation, and subagents

```text
goal_loop_stops_at_completion_or_hard_cap
unparseable_goal_verdict_cannot_false_complete
no_progress_detector_stops_repeated_action_error_loop
no_progress_detector_stops_repeated_diff_diagnostic_loop
interrupt_reaches_pending_and_running_tool_workers
subagent_concurrency_never_exceeds_parent_budget
child_capabilities_never_exceed_parent_ceiling
failed_subagent_batch_creation_releases_reservations
child_usage_is_attributed_without_double_counting
subagent_output_never_changes_branch_destination_after_dispatch
workflow_generated_code_cannot_run_in_authoritative_kernel
```

### 25.6 Security, memory, skills, browser, and telemetry

```text
risk_analyzer_result_never_substitutes_user_approval
approval_receipt_rejects_changed_arguments_environment_or_tool_hash
skill_activation_never_grants_capability
skill_version_is_frozen_before_dispatch
stale_memory_revision_is_excluded_after_supersession
memory_deletion_removes_retrieval_and_projection_derivatives
browser_storage_secret_export_is_not_model_accessible
browser_recording_requires_explicit_scoped_consent
browser_challenge_pauses_for_user_instead_of_evasion
telemetry_payload_rejects_prompt_path_secret_or_traceback
exported_diagnostics_never_contains_raw_provider_response
local_trace_and_exported_telemetry_have_separate_retention_policy
```

## 26. Implementation slices for Omnia

These slices fit the dependency order in
[`OMNIA_HARNESS_BENCHMARKS.md`](OMNIA_HARNESS_BENCHMARKS.md). They are proposed
work packages, not current implementation status.

### OH-0: protocol and environment identity

- Define canonical environment, backend, runtime-service, lease, and capability
  schemas.
- Extend initialize/capability negotiation to every client adapter.
- Add deterministic schemas and protocol compatibility fixtures.
- Keep host, isolated, persistent, and remote claims explicit and testable.

Exit gate: no renderer-created authority, no arbitrary backend URL treated as a
trusted environment, and deterministic schema compatibility tests pass.

### OH-1: durable event tree and projections

- Implement transactional run events, parent/causal identity, branch cursor,
  journal epoch, fixed-watermark replay, and projection rebuild.
- Bind live producers to immutable branch destinations.
- Add projectless conversation and branch corruption recovery states.

Exit gate: restart/reconnect replay produces identical visible output and never
duplicates a billable request.

### OH-2: condensation and context integrity

- Implement checkpoint markers over raw events.
- Add dependency groups, protected survival rules, supersession, citations,
  omission ledger, provider serialization spans, and post-serialization token
  counts.
- Validate condensed payloads with exact provider-history tests.

Exit gate: lost-in-the-middle, stale memory, tool atomicity, citation, and
provider-payload regression corpora pass.

### OH-3: recovery, leases, and resource scheduling

- Implement fencing for runs, environments, agents, jobs, uploads, and artifact
  transforms.
- Add outcome-unknown recovery and synthetic recovery facts.
- Add typed resource claims, deterministic acquisition, timeout, telemetry, and
  cancellation propagation.

Exit gate: fault injection proves one authoritative owner, no stale completion,
no automatic unknown-effect retry, and no deadlock for overlapping resources.

### OH-4: bounded goals and agent workflows

- Implement controller/driver/verifier separation.
- Add hard budgets, no-progress detectors, terminal reasons, checkpoints, and
  deterministic completion gates.
- Persist child-agent DAG, capability intersection, reservations, evidence, and
  reducer/merge decisions.
- Run generated orchestration only in an isolated tool runtime.

Exit gate: stress tests prove concurrency/budget ceilings, cancellation, branch
ownership, reservation cleanup, and usage attribution.

### OH-5: memory, skills, providers, and privacy telemetry

- Implement versioned memory proposals/revisions/supersession/deletion.
- Implement frozen skill versions and conditional activation explanations.
- Complete per-attempt provider usage/latency/cost/health ledgers.
- Separate local trace from optional exported allowlisted diagnostics.

Exit gate: secret canaries, stale-revision tests, telemetry schema tests,
provider fallback/degradation tests, and deletion/retention tests pass.

### OH-6: browser, automation, and remote clients

- Add explicit browser session broker, allowed-domain/network policy, recording
  consent, retention, fresh-frame evidence, and challenge handoff.
- Run automations through the same run, environment, capability, budget, and
  audit contracts.
- Add remote device pairing, TLS, E2E session keys where applicable, replay
  protection, revocation, granular grants, and offline/reconnect behavior.

Exit gate: no cookie/password export, no anti-bot/DRM bypass, no unauthenticated
listener, and external-network security/revocation/replay tests pass.

## 27. Official source map

All source links below are pinned to the reviewed commits unless marked as the
standalone visual-evidence asset.

### 27.1 Agent Canvas

- [Agent Canvas architecture](https://github.com/All-Hands-AI/OpenHands/blob/4f465f3ccada5271a3bbe4a0148941b0c40d243b/docs/architecture.md)
- [Self-hosting and host-authority warning](https://github.com/All-Hands-AI/OpenHands/blob/4f465f3ccada5271a3bbe4a0148941b0c40d243b/docs/SELF_HOSTING.md)
- [Agent Canvas README](https://github.com/All-Hands-AI/OpenHands/blob/4f465f3ccada5271a3bbe4a0148941b0c40d243b/README.md)
- [Official automation preview image](https://assets.openhands.dev/screenshot/automation-preview.png) — D-level visual evidence only

### 27.2 Events, branches, and context

- [Event log](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-sdk/openhands/sdk/conversation/event_store.py)
- [Conversation state and active leaf](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-sdk/openhands/sdk/conversation/state.py)
- [Base event identity and parent semantics](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-sdk/openhands/sdk/event/base.py)
- [Condensation event](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-sdk/openhands/sdk/event/condenser.py)
- [Condenser design README](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-sdk/openhands/sdk/context/condenser/README.md)
- [Context view](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-sdk/openhands/sdk/context/view/view.py)
- [Batch atomicity property](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-sdk/openhands/sdk/context/view/properties/batch_atomicity.py)
- [Observation uniqueness property](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-sdk/openhands/sdk/context/view/properties/observation_uniqueness.py)
- [Tool-call matching property](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-sdk/openhands/sdk/context/view/properties/tool_call_matching.py)
- [Tool-loop atomicity property](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-sdk/openhands/sdk/context/view/properties/tool_loop_atomicity.py)

### 27.3 Leases, concurrency, recovery, and protocol

- [Conversation lease and fencing](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-agent-server/openhands/agent_server/conversation_lease.py)
- [Agent Server event service](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-agent-server/openhands/agent_server/event_service.py)
- [Resource lock manager](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-sdk/openhands/sdk/conversation/resource_lock_manager.py)
- [Conversation lease tests](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/tests/agent_server/test_conversation_lease.py)
- [Resource lock tests](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/tests/sdk/conversation/test_resource_lock_manager.py)
- [Agent Server engineering and API compatibility policy](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-agent-server/AGENTS.md)
- [Deterministic OpenAPI contract tests](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/tests/agent_server/test_openapi_contract.py)

### 27.4 Goals, workflows, memory, skills, and security

- [Goal controller](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-sdk/openhands/sdk/conversation/goal/controller.py)
- [Goal judge](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-sdk/openhands/sdk/conversation/goal/judge.py)
- [Goal runner](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-sdk/openhands/sdk/conversation/goal/runner.py)
- [Stuck detector](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-sdk/openhands/sdk/conversation/stuck_detector.py)
- [Cancellation primitive](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-sdk/openhands/sdk/conversation/cancellation.py)
- [Workflow definition](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-tools/openhands/tools/workflow/definition.py)
- [Workflow implementation](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-tools/openhands/tools/workflow/impl.py)
- [Task manager](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-tools/openhands/tools/task/manager.py)
- [Memory context](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-sdk/openhands/sdk/context/memory.py)
- [Skill model](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-sdk/openhands/sdk/skills/skill.py)
- [Skill triggers](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-sdk/openhands/sdk/skills/trigger.py)
- [Confirmation policy](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-sdk/openhands/sdk/security/confirmation_policy.py)
- [Security analyzer](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-sdk/openhands/sdk/security/analyzer.py)

### 27.5 Workspaces, telemetry, and browser

- [Local workspace](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-sdk/openhands/sdk/workspace/local.py)
- [Base workspace](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-sdk/openhands/sdk/workspace/base.py)
- [Remote workspace base](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-sdk/openhands/sdk/workspace/remote/base.py)
- [LLM metrics](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-sdk/openhands/sdk/llm/utils/metrics.py)
- [Telemetry allowlisted models](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-agent-server/openhands/agent_server/telemetry/models.py)
- [Telemetry sanitizer](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-agent-server/openhands/agent_server/telemetry/sanitizer.py)
- [Telemetry schema tests](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/tests/agent_server/telemetry/test_telemetry_schema.py)
- [Browser tool definition](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-tools/openhands/tools/browser_use/definition.py)
- [Browser executor](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-tools/openhands/tools/browser_use/impl.py)
- [Browser recording](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/openhands-tools/openhands/tools/browser_use/recording.py)
- [Browser executor tests](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/tests/tools/browser_use/test_browser_executor.py)
- [Browser recording flush tests](https://github.com/OpenHands/software-agent-sdk/blob/131b7523554b88135ab66d5c733d26263260f3bf/tests/tools/browser_use/test_recording_flush.py)

## 28. Conclusion

OpenHands is a strong primary-source reference for a client/server agent
product with multiple backends, append-oriented event histories, event-tree
branches, view-based condensation, conversation leases, resource-aware
parallelism, workspace abstractions, bounded goals, subagent workflows,
privacy-constrained telemetry, and browser/terminal/file surfaces.

Omnia should adopt those durable invariants, but it should not clone the product
or inherit its weaker boundaries. Omnia's target is stricter in the areas that
matter for a unified Windows 11 assistant:

- exact, operation-bound, single-use approval receipts;
- capability policy separated from environment selection;
- explicit Windows host, sandbox, UAC, and privileged-broker boundaries;
- transactional journal and projection coupling;
- frozen provider, context, parameter, memory, skill, and attachment inputs;
- structured memory correction and supersession;
- first-class task/run/iteration/attempt/item/agent DAG identity;
- browser-session and credential privacy;
- encrypted artifact storage and auditable file/media capture;
- remote device identity, granular grants, revocation, and replay protection;
- provenance-rich citations, effects, usage, cost, and completion evidence;
- deterministic quality gates that do not rely only on an LLM judge.

The immediate value of this research is not another feature list. It is a set
of implementation boundaries and regression contracts that let Omnia add
power without creating parallel, unauditable, renderer-owned execution paths.
