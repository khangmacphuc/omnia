# Omnia harness benchmark and adoption matrix

- Status: research synthesis and implementation guidance; not a shipped-capability claim
- Date: 2026-08-13
- Scope: the unified Omnia kernel, chat workbench, files/retrieval, memory/skills, providers, and later IDE/browser/computer/remote modes
- Normative authority: accepted ADRs and architecture contracts, especially [`HARNESS_ARCHITECTURE.md`](../HARNESS_ARCHITECTURE.md), [`THREAT_MODEL.md`](../THREAT_MODEL.md), [`PRODUCT_SPEC.md`](../PRODUCT_SPEC.md), and [`IMPLEMENTATION_STATUS.md`](../IMPLEMENTATION_STATUS.md)

This document turns the Codex, Claude Code, OpenHands, Continue, Aider, and
OpenCode research notes into a comparable benchmark and a build order for Omnia. It also records which ideas are adopted,
adapted, deferred, rejected, or still awaiting primary-source review.

The benchmark is deliberately stricter than a feature checklist. A product can
expose a feature in its UI without proving durable state, context fidelity,
permission isolation, crash recovery, or output quality. Omnia therefore scores
patterns by the strength of their contracts and evidence, not by the number of
buttons that appear in a screenshot.

## 1. How to read this benchmark

### 1.1 Evidence levels

| Level | Meaning | Allowed use in this document |
|---|---|---|
| A — pinned primary source | A reviewed source tree or protocol is pinned to a commit and its license/provenance is known. | Strong architectural evidence; may inform an Omnia contract after clean-room review. |
| B — official current documentation | Official documentation was read at a named date but is not commit-pinned. | Evidence of a public behavior or configuration; must be rechecked before a release claim. |
| C — official release history/examples | Official changelog, examples, plugin manifests, or public demonstrations. | Useful edge-case and interaction evidence; not a substitute for a protocol contract. |
| D — visual/interaction observation | A public demo or product surface was inspected for hierarchy or workflow. | Interaction inspiration only; never copy pixels, assets, wording, or branding. |
| U — unreviewed candidate | A product was named as a benchmark target but no primary-source review is recorded here. | Do not make implementation or capability claims from it. Create a research task first. |

### 1.2 Adoption labels

| Label | Definition |
|---|---|
| Adopt | The invariant belongs in the Omnia kernel or a current normative contract. Implement it with Omnia-owned types, tests, and UI. |
| Adapt | The pattern is useful, but Omnia changes its scope, persistence, privacy, provider neutrality, or Windows boundary. |
| Defer | The pattern is in scope for a later capability phase and must remain unavailable until its enablement gate passes. |
| Reject | The pattern conflicts with provenance, safety, user control, or Omnia's product principles. |
| Pending | The idea is worth investigating, but evidence is insufficient to choose an implementation. |

### 1.3 Maturity notation for the current tree

The current implementation inventory uses the project's evidence language:

```text
Specified  -> contract exists
Implemented -> user-reachable path plus automated evidence
Automated  -> deterministic tests cover relevant success and denial paths
Verified   -> complete phase/release evidence on supported Windows
Preview    -> renderer/mock projection, not a native product claim
Planned/Deferred -> intentionally unavailable
```

The benchmark never upgrades a feature's maturity on its own. `IMPLEMENTATION_STATUS.md`
and the release evidence manifest remain authoritative.

## 2. Provenance and clean-room boundary

### 2.1 Codex

The Codex comparison uses the official open-source repository:

```text
Repository: openai/codex
Reviewed commit: 72fa74fbc9c4b72d513304bfa0eda427d2402ed9
License: Apache-2.0
Research note: docs/research/OPENAI_CODEX_HARNESS_RESEARCH.md
```

The open-source tree is strong evidence for protocol, core runtime, event,
approval, tool, agent, skills, model-catalog, memory, and telemetry patterns.
It is not evidence that the proprietary Codex desktop UI or icon library is
available to copy. Omnia uses structural lessons and writes its own contracts,
visual system, icons, wording, and implementation.

### 2.2 Claude Code

The Claude Code comparison uses the official repository and documentation as
recorded in the dedicated research note:

```text
Repository: anthropics/claude-code
Reviewed commit: be90077c6a353f292fa612d97173865a9ab21b83
Official repository terms: Anthropic PBC, all rights reserved; commercial terms apply
Research note: docs/research/CLAUDE_CODE_HARNESS_RESEARCH.md
```

The user-provided `tanbiralam/claude-code` snapshot at commit
`6f6f12b37f529488b10e53928dd5508bb93535c7` is excluded from implementation
research because its own README describes leaked/recovered source and it does
not provide a clean license basis. Omnia must not copy code, prompts,
algorithms, dependency bundles, icons, screenshots, animations, or distinctive
implementation structure learned only from that snapshot.

### 2.3 OpenHands

The OpenHands comparison now uses two official, pinned MIT-licensed trees:

```text
Agent Canvas: All-Hands-AI/OpenHands
Reviewed commit: 4f465f3ccada5271a3bbe4a0148941b0c40d243b
Exact tag: v1.13.0
License: MIT

Software Agent SDK: OpenHands/software-agent-sdk
Reviewed commit: 131b7523554b88135ab66d5c733d26263260f3bf
License: MIT

Research note: docs/research/OPENHANDS_OFFICIAL_HARNESS_RESEARCH.md
```

The pinned sources provide A-level evidence for frontend/backend/workspace
separation, multi-backend selection, append-only event trees, active branch
heads, view-based condensation, context atomicity, recovery, conversation
leases, resource locks, typed workspaces/tools, bounded goals, subagent
workflows, memory/skills, provider metrics, privacy telemetry, browser tooling,
and deterministic OpenAPI contracts. They do not prove Omnia has implemented
those capabilities, that OpenHands provides Omnia's supported Windows
isolation, or that risk-oriented confirmation is equivalent to Omnia's exact
operation-bound approval receipt.

### 2.4 Other named products

Continue, Aider, and OpenCode now have a pinned official-source review:

```text
Continue: continuedev/continue
Commit: 5522c6f44ca0ac3528b37244818fbfa39b5af470
License: Apache-2.0

Aider: Aider-AI/aider
Commit: 5dc9490bb35f9729ef2c95d00a19ccd30c26339c
License: Apache-2.0

OpenCode: anomalyco/opencode
Commit: cc4b45612974f735ddec46009ede07729511fba4
License: MIT

Research note: docs/research/CONTINUE_AIDER_OPENCODE_HARNESS_RESEARCH.md
```

Their evidence is now A-level where tied to the pinned repositories and
B-level where tied to current official documentation read on 2026-08-13. They
strengthen the benchmark for model-task roles, plan/build separation, repository
maps, typed edit protocols, lint/test repair, layered permissions, provider
neutrality, client/server projection, agents, MCP, skills, plugins, LSP, and
session operations. They do not make those capabilities shipped in Omnia.

Cursor, VS Code agent mode, Google AI Studio/Gemini, NotebookLM/Gemini
Notebook, Hermes Agent, Droid, Pearl, Trae, and Antigravity remain useful
research targets. They are not all equally reviewed in the current repository.
Where this document has no pinned official source, the entry is marked `U —
unreviewed candidate` and contributes no capability claim. The local
architecture note records high-level Hermes-style provider/context/memory
influences, but that reference is not a substitute for an independent source
review.

## 3. Executive benchmark result

Codex, Claude Code, and OpenHands are complementary rather than interchangeable
references:

- Codex is the stronger source for a versioned app-server protocol, replayable
  event semantics, exact approval inputs, context/world-state projections,
  typed tool registration, model-catalog separation, persisted child threads,
  and memory extraction/consolidation jobs.
- Claude Code is the stronger source for long-lived session UX, explicit
  resume/branch/clear/compact/steer distinctions, lazy context loading,
  permission/sandbox separation, typed hooks, workflow packaging, specialized
  agent roles, worktree/task coordination, prompt workshop/side-question
  separation, and autonomous-loop completion gates.
- OpenHands is the stronger source for frontend/agent-server/workspace
  separation, multi-backend control, append-only event trees, active-leaf
  navigation, view-based condensation, context atomicity, conversation leases,
  resource-aware parallelism, bounded goal loops, map/reduce subagent workflows,
  privacy-constrained telemetry, browser executor lifecycle, and deterministic
  REST/OpenAPI compatibility checks.
- Omnia must combine the invariants in one kernel instead of creating a Codex
  path, a Claude path, and provider-specific exceptions.

The target architecture is therefore:

```text
Desktop / web / CLI / Android / future IDE clients
                    |
             versioned Omnia protocol
                    |
        Kernel + event journal + projections
        /          |          \
 context       policy       environments
 compiler      broker       persistent/isolated/remote
        \          |          /
 provider gateway + tools + agent DAG
          /         |          \
 memory/skills  artifacts  telemetry/evals
```

The highest-value Omnia differentiators are not a larger model list or more
decorative screens. They are frozen, inspectable context; source and citation
provenance; privacy-safe BYOK; deterministic recovery; explicit environment
selection; memory/skill supersession; durable agent topology; and evidence-based
quality loops.

## 4. Cross-product benchmark matrix

The matrix compares patterns, not marketing feature counts. “Other ecosystem
signal” is intentionally conservative when the corresponding product has not
yet received a pinned primary-source review.

| Harness concern | Codex evidence (A/B) | Claude Code evidence (A/B/C) | Other ecosystem signal | Omnia decision | Gate / current status |
|---|---|---|---|---|---|
| Durable user identity | Thread → turn → item; stable IDs and projections | Project/session with saved transcript and task/session state | Most coding agents expose a session/task concept, but U-level evidence varies | **Adopt + adapt** into `Project → Task/Thread → Branch → Run → Attempt → Iteration → Item/Event` | Kernel contract exists; native graph is still incomplete. |
| Versioned protocol boundary | App-server handshake, schema generation, capabilities, bounded queues | Public behavior is session-oriented rather than a reusable open protocol | Pinned OpenHands evidence separates Agent Canvas, Agent Server and workspaces and deterministically tests public OpenAPI contracts | **Adopt** one transport-neutral Omnia protocol; Tauri is an adapter | Handshake exists; durable cursor/replay and full command coverage remain partial. |
| Append-only journal | Rollout/history plus rebuildable state projections | JSONL-style session persistence and recovery behavior | OpenHands persists immutable events, rejects duplicate IDs/missing explicit parents and rebuilds an active view from the event tree | **Adopt** journal as source of truth; use transactional SQLite rather than file-per-event persistence | Run events are not yet fully durable/native. Stop before advertising replay. |
| Start/resume/steer/interrupt/fork | Explicit thread operations and interrupted fork boundary | Distinct resume, branch, clear, compact, rewind, steer, interrupt, retry | U-level products often overload “send” or “continue” | **Adopt** separate commands and receipts | Domain vocabulary exists; native storage/state reconciliation is required. |
| Branch and compare semantics | Fork with source cursor/snapshot; child thread identities | Branch/worktree/task patterns and stale-name protection | OpenHands adds an explicit active leaf/head, root-to-leaf reconstruction, sibling event branches and navigation without history mutation; Aider/Continue/OpenCode add coding/session evidence | **Adapt** immutable branches and `RunSet` siblings; promotion is explicit | Frontend projection is fail-closed; durable branch editing is incomplete. |
| Frozen input before billable dispatch | Context/model/provider/config snapshots | Resume manifest and explicit state restoration | Provider-neutral systems need this to avoid silent drift | **Adopt** `RunSnapshot` and prepared provider input | Domain contract exists; native prepared-input path is in progress. |
| Typed context ledger | Ordered response-item envelopes, history version, world-state baseline | Startup layers, path rules, skills, memory, MCP metadata, tool results | Notebook/research products emphasize source collections; verify independently | **Adopt + extend** with authority, freshness, supersession, citation, selection/omission reason | Context inspector is preview; compiler/snapshot integration remains partial. |
| Compaction | Checkpoint/replacement history with exact tests | First-class compaction hooks and survival rules | OpenHands condensation appends a marker with forgotten event IDs, summary, insertion offset and response identity while retaining the raw journal | **Adapt** hierarchical raw/event/fact/summary/project layers with hashes, versions, survival rules and validation | No release claim until exact payload tests pass. |
| Lost-in-the-middle prevention | Dependency-group preservation and reference baselines | Lazy loading, path-aware rules, subagent isolation, fact supersession | OpenHands context properties preserve parallel tool batches, action/result matching, observation uniqueness and thinking/tool-loop atomicity | **Adopt** frozen retrieval, dependency groups, recency/supersession, omission disclosure | Retrieval/indexing is planned; benchmark corpus is required. |
| Policy versus execution environment | Approval actions and sandbox policy are separate | Permission modes and OS sandbox are orthogonal | OpenHands separates Agent Canvas, Agent Server, confirmation/security policy and local/remote workspace implementations; its host-mode warning proves backend choice is not permission | **Adopt** policy, capability broker, and environment selector as separate layers | Threat model is normative; native broker is not complete. |
| Environment/backend abstraction | Local/cloud environment and sandbox contracts | Worktrees and runtime constraints are distinct from permission modes | OpenHands pins multi-backend Agent Server selection plus base/local/remote workspace abstractions, but does not prove Omnia's Windows isolation | **Adopt + extend** typed `none`/persistent/isolated/remote environments with lifecycle, mounts, network, health, drift and snapshots | Environment execution remains deferred until supported-Windows containment evidence exists. |
| `Auto` environment mode | No automatic permission implication | Public behavior distinguishes permission mode from runtime constraints | Persistent/isolated/remote is an Omnia extension | **Adopt + extend**: Auto chooses persistent/isolated/remote; it never grants permission | Environment capability is deferred until isolation evidence exists. |
| Exact approvals | Canonical command, cwd, sandbox, permissions, environment and tool hashes | Deny/ask/allow precedence, trust, path rules, permission parsing | OpenHands has risk levels, analyzers and confirmation policies, but the reviewed contract is not Omnia's exact operation-bound single-use receipt | **Adopt** operation-bound, single-use, expiring approval receipts; analyzers are risk signals only | Contract/tests exist; native durable broker and MAC audit are pending. |
| Windows privilege boundary | General approval principles | Explicit warning that elevated operations need user control | No product claim may justify silent SYSTEM/TrustedInstaller | **Reject** silent escalation; **adapt** typed UAC broker with postconditions | Deferred; see `THREAT_MODEL.md` OM-TM-022. |
| Typed tools | Registry, collision rules, lifecycle, cancellation, deferred exposure | Tool effects, MCP, hooks, denied tools and workflow packaging | OpenHands adds typed action/observation models, annotations, executors, cancellation and bounded workflow capability objects; Continue/OpenCode add policy and extension evidence | **Adopt** descriptors, schemas, effects, trust, limits, resource claims and terminal outcomes | Chat phase exposes no write/execute/browser/computer tools. |
| MCP and extension trust | Namespaces, deferred tools, hooks and schemas | MCP servers, plugins, hooks, agents, skills and explicit permissions | MCP is a transport, not trust; apply this across products | **Adapt** install → validate → enable → grant → execute; each step visible | Contract is specified; runtime/install path is deferred. |
| Subagents | Real child threads, persisted edges, limits, status | Agent roles, fresh/fork/team modes, task lists, mailboxes, worktrees | OpenHands provides child tasks/conversations and bounded `run_agent`/`map_agents`/`reduce_agent`/pipeline workflows, while warning that generated in-process workflow code is destructive/open-world | **Adopt + extend** durable agent DAG with budgets, leases, isolated orchestration runtime and merge gates | Native graph not complete; no hidden autonomous agent claim. |
| Conversation and job leases | Persisted task/agent ownership and guarded lifecycle concepts | Durable session/task identity but no reusable public fencing contract | OpenHands pins owner identity, expiry and monotonic lease generation; stale owners cannot renew, write or release after takeover | **Adopt** fencing tokens for conversations, environments, agents, jobs, uploads and transforms | Native database-backed lease/fencing repository is planned. |
| Resource-aware parallelism | Tool/resource limits and sandbox boundaries | Worktrees, tasks and parallel agents require conflict control | OpenHands sorts named resource locks to prevent deadlock, serializes overlapping effects and allows independent work concurrently | **Adopt** typed read/write effect claims and deterministic resource acquisition; locks never substitute approval | Scheduler/resource ledger is planned. |
| Context handoff | Distilled child summaries with evidence IDs | Subagent isolation to avoid main-context pollution | Research/code agents favor summaries over raw logs | **Adopt** structured findings, artifacts, evidence and unresolved questions | Requires agent graph and context snapshot implementation. |
| Memory lifecycle | Leased extraction/consolidation, redaction, citations | Scoped Markdown projection, auto-memory controls, supersession expectations | OpenHands adds human-readable user/project Markdown memory; Hermes remains a conceptual ordered-lifecycle cue | **Adapt** proposals → review → revisions → retrieval → consolidation; Markdown is projection only | Preview/contract; no native memory writes yet. |
| Skills | Versioned identity, roots, trust, hooks | Skills, agents, plugins, progressive disclosure and activation scope | OpenHands pins public/user/org/project sources, triggers, explicit invocation and progressive disclosure; Agent Skills remains portable | **Adopt** immutable content-addressed versions, trust and activation explanations | Preview/contract; no package runtime claim. |
| Provider/BYOK separation | Provider definitions separate from model catalog/health | Model/account/context visible in session UX | Hermes-style provider profiles are a local reference cue | **Adopt + extend** opaque secret handles, capability probes, catalog freshness, conformance | Basic profiles/discovery/streaming implemented; advanced/frozen path partial. |
| Native multimodal input | Normalized modality/provider adapters | File/document workflow patterns, but no clean code transplant | Gemini/OpenAI/Anthropic adapter differences require loss-aware mapping | **Adapt** native attachment capability only; unknown/emulated/unsupported fail closed | Attachment draft/blob/frozen selection contracts exist; live path remains text-only. |
| Authorized browser capture | No direct browser product in Codex source | Browser/tool policy patterns inform authorization | OpenHands pins typed navigation/tabs/screenshots, allowed domains, timeouts, session reset and rrweb recording; this does not justify cookie/password export, challenge evasion or DRM bypass | **Defer + constrain** to explicit Edge Canary attach, rights-bound non-DRM capture, deterministic merge and explicit recording consent | Threat model gate; never read password/cookie vault or evade challenges. |
| IDE/terminal/coding agent | Terminal/tool primitives and approvals | Worktrees, task/agent roles, checkpoints, coding workflow | Pinned Continue/Aider/OpenCode evidence covers plan/build modes, repo maps, edit formats, validators, provider neutrality, sessions, MCP/LSP and permission rules; Cursor/VS Code remain pending | **Defer implementation, adopt contracts** after native journal/policy/environment gates | Commands/capabilities remain physically absent. |
| Computer use | Approval/tool lifecycle patterns | Permission/sandbox/loop guardrails | Product claims require fresh-frame and postcondition evidence | **Defer + separate** visual input from privilege broker | Threat model gate; no raw admin shell. |
| Persistent machine | Environment/policy concepts, not a complete machine product | Worktree/runtime isolation patterns | OpenHands provides local/remote backends and workspace lifecycle evidence and explicitly warns that host mode has host filesystem/shell/network authority; it is not proof of isolation | **Adapt** persistent state with snapshot/reset/drift and scoped mounts/network | Deferred until supported-Windows isolation tests. |
| Remote web/CLI/Android | Protocol/client portability | Session/task identity and status UX | Remote control products require device pairing and E2E | **Defer + extend** one protocol with device keys, granular grants, replay protection | Threat model gate; no unauthenticated listener. |
| Telemetry | Session/request/stream/tool timing and usage | OTel trace hierarchy linking prompts, tools, permissions, subagents | OpenHands pins token/cache/reasoning/cost/latency metrics and an allowlisted analytics contract that rejects prompts, paths, secrets, messages and tracebacks | **Adopt + extend** TTFT/TTFM/TPS, cache/reasoning, cost, provider health, context and quality; keep local trace separate from export | Basic usage exists; authoritative ledger and replay traces remain partial. |
| Automation | Scheduled/background task identity and run lifecycle can reuse the app-server graph | Hooks, tasks and long-running session UX provide workflow signals | Agent Canvas separates its automation backend and exposes automation state in the frontend; automation does not run without the backend | **Adopt** automation as another producer over the same run, policy, environment, provider, budget and audit contracts | Scheduling/runtime remains deferred; no parallel weak execution path. |
| Prompt workshop / side question / suggestions | Steering and thread semantics | Public `/btw`-style side questions, prompt workshop and action suggestions | UI labels vary; contracts must stay distinct | **Adopt** four separate surfaces with separate history, tools, cost, and mutation | Product contract specified; UI/native execution pending. |
| Artifacts and citations | Item/artifact-like lifecycle and source provenance | Structured findings, task outputs, visible activity hierarchy | Notebook/research tools are candidate evidence only | **Adapt** artifact lineage + citation span/hash + safe preview/export | Renderer preview/contracts; native artifacts/citations partial. |
| Quality/evaluation loops | Deterministic compact/resume/fork/tool tests | Explicit completion gates, budgets, repeat detection, independent review | OpenHands adds iteration caps, controller/runner/judge separation, conservative goal outcomes and repeated-action/error/monologue/alternating-loop detection | **Adopt** versioned golden/adversarial corpus, validators, bounded repair/verifier | QA strategy specifies gates; output corpus still to be built. |
| Adaptive/RL routing | Model/provider telemetry and fallback controls | Contextual quality/cost routing with guardrails | Learned routing must not decide security | **Adapt** offline/shadow contextual-bandit policy only outside security path | Planned; threat model OM-TM-040 applies. |
| UI information hierarchy | Protocol-driven activity state; open-source Codex UI is incomplete | Calm status/tool rows, stable session identity, compact long-running task view | Agent Canvas visual evidence adds restrained hierarchy, one primary action, typed metadata and clear active/inactive sections; D-level only | **Adapt** independent Omnia visual language; no copied logos, icons, palette, typography, spacing or brand assets | UI foundation has improved, but complete release visual evidence remains required. |

## 5. Product-specific benchmark register

This register prevents a named product from becoming an accidental requirement
without evidence. A row may be promoted from `U` only after a dedicated source
review records the exact version/date, license, links, and findings.

| Product / family | Candidate benchmark question | Current evidence in Omnia repository | Decision now | Required next research |
|---|---|---|---|---|
| OpenAI Codex | How should a multi-client agent protocol, replayable runs, approvals, tools, agents, models, memory and telemetry be represented? | Pinned official source and manual review, `OPENAI_CODEX_HARNESS_RESEARCH.md` | **Adopt/adapt** the durable invariants; do not copy proprietary UI | Keep protocol/schema parity tests and update only from pinned commits. |
| Claude Code | How should long-lived sessions, branch/clear/compact/steer, hooks, skills, agents, worktrees and prompt workshop behave? | Pinned official-source review plus official documentation, `CLAUDE_CODE_HARNESS_RESEARCH.md` | **Adopt/adapt** lifecycle and workflow invariants; clean-room implementation only | Recheck current docs before a release claim; preserve license boundary. |
| OpenHands | How should client/server/workspace separation, multi-backend environments, event trees, condensation, leases, resource locks, goals, workflows, telemetry and browser surfaces fit the kernel? | Pinned official MIT Agent Canvas `v1.13.0` and Software Agent SDK source review, `OPENHANDS_OFFICIAL_HARNESS_RESEARCH.md` | **Adopt/adapt** the durable runtime, event, concurrency and privacy invariants; never infer Windows isolation or substitute risk analysis for exact approval | Recheck pinned heads before release claims and independently verify supported Windows containment, remote-device security and browser-session privacy. |
| Aider | How should repository mapping, architect/editor separation, typed edit formats, Git review and validator feedback inform coding mode? | Pinned Apache-2.0 source plus official documentation, `CONTINUE_AIDER_OPENCODE_HARNESS_RESEARCH.md` | **Adopt/adapt** repository-map, producer/editor and validation invariants; keep Git and effect rollback distinct | Build freshness/recall, edit-fuzz, dirty-tree and bounded-repair regression corpora before enablement. |
| Continue | How should plan/build modes, model-task roles, rules, context selection, MCP and tool policy map to the kernel? | Pinned Apache-2.0 source plus official documentation, `CONTINUE_AIDER_OPENCODE_HARNESS_RESEARCH.md` | **Adopt/adapt** role resolution, capability-bound modes and typed scoped rules; repository config never grants authority | Implement native frozen context and exact approval receipts before exposing IDE agent tools. |
| OpenCode | How should provider-neutral agents, layered permissions, sessions, client/server APIs, MCP/skills/plugins/LSP and subagents be modeled? | Pinned MIT source plus official documentation, `CONTINUE_AIDER_OPENCODE_HARNESS_RESEARCH.md` | **Adopt/adapt** protocol, configuration provenance, deterministic policy and durable-agent invariants | Require staged extension trust, child-agent ceilings, replayable events and session-operation tests. |
| Cursor | How should codebase indexing, agent loops, review, background work and editor UX connect to one run graph? | User-named target; no pinned primary-source review here | **Pending/defer** | Review official docs; require evidence for indexing freshness, write isolation and remote execution. |
| VS Code Insiders / agent mode | How should editor-native tools, approvals, tasks and extensions be projected over the kernel? | Product direction only; no pinned benchmark here | **Defer** until integrated IDE phase | Benchmark official agent mode/tool contracts and extension trust. |
| Google Gemini / AI Studio | How should model discovery, multimodal inputs, grounding, structured output and tuning controls preserve native capabilities? | Gemini adapter and multimodal design exist; product UX benchmark not pinned here | **Adapt** provider capability schemas; no UI copy | Recheck current official API/AI Studio docs and model capability drift. |
| NotebookLM / Gemini Notebook | How should source notebooks, citations, synthesis and research workflows inform project knowledge? | User requirement and citation/context contracts; no product benchmark here | **Adapt conceptually**, not feature-copy | Benchmark source versioning, citation support, notebook sharing and privacy. |
| Hermes Agent | How should provider profiles, pluggable context engines, memory lifecycle, recovery and tool-loop guardrails be composed? | High-level influence recorded in `HARNESS_ARCHITECTURE.md`; no pinned implementation review here | **Adapt** ordered memory/context/recovery patterns | Pin an official source and perform license/security review before implementation use. |
| Droid / Factory | How should delegated coding tasks, execution environments, review and status be represented? | User-named target; no pinned primary-source review here | **Pending/defer** | Review official docs and verify environment/credential boundaries. |
| Pearl | How should research/coding orchestration and artifact workflows be modeled? | User-named target; no pinned primary-source review here | **Pending** | Identify the exact product/repository first; avoid ambiguous brand matching. |
| Trae | How should agentic IDE workflows, rules, MCP and collaboration be modeled? | User-named target; no pinned primary-source review here | **Pending/defer** | Review official docs and regional/service constraints; do not infer from screenshots. |
| Antigravity / Antigravity IDE | How should multi-surface agent orchestration and computer/browser controls be bounded? | User-named target; no pinned primary-source review here | **Pending/defer** | Identify exact product/version and obtain primary docs; security gates remain mandatory. |

## 6. Omnia decisions that the benchmark locks in

These are implementation directions, not claims that all are already shipped.

### 6.1 One kernel, many projections

Desktop, web, CLI, Android, IDE, browser, remote machine, and future agent
clients consume the same versioned protocol and durable run graph. A renderer
or client may project a subset, but it may not invent task IDs, item events,
context snapshots, environment state, or provenance that native storage did not
provide.

### 6.2 Journal first, projections second

Commands mutate state; committed events report facts. The journal must preserve
ordered, idempotent lifecycle, provider, usage, tool, approval, context,
artifact, citation, memory, and recovery events. SQLite projections can be
rebuilt and optimized for UI queries, but cannot become a second source of
truth.

### 6.3 Freeze before dispatch

The first billable or externally visible provider request must reference one
immutable native `RunSnapshot` / prepared provider input containing:

- provider and model catalog revisions;
- resolved parameters and support state;
- context snapshot hash and selected/omitted items;
- attachment selections and content hashes;
- memory/skill versions;
- policy, capability, environment, workspace and privacy revisions;
- idempotency key and retry/fallback policy.

The renderer must not reconstruct `messages + parameters + attachments` a
second time and send a materially different request under the same attempt.

### 6.4 Auto chooses an environment, not a permission

`Auto` may choose persistent, isolated, or remote execution according to the
task, data sensitivity, cost, continuity requirement, and available evidence.
It never broadens capability grants, bypasses approval, or implies administrator
authority. Environment selection, policy evaluation, approval, execution, and
postcondition verification remain separate events.

### 6.5 Memory and skills are versioned evidence, not invisible prompt text

Memory writes begin as proposals, carry source evidence and sensitivity, pass
secret/PII and contradiction checks, and remain editable, supersedable,
expirable, and deletable. Skills are immutable content-addressed versions with
scope, trust, dependencies, requested capabilities, and progressive disclosure.
Neither can grant a tool, permission, secret, or environment.

### 6.6 Quality loops are bounded and inspectable

Deep research, verifier/revision, multi-model discussion, subagents, and
adaptive routing must have explicit objectives, budgets, completion gates,
repeat/no-progress detection, cancellation, recovery, and final receipts.
“Continue until perfect” is not a harness contract.

## 7. What Omnia must not copy or enable

The benchmark rejects the following even if a product appears to offer them:

1. Code, prompts, algorithms, icons, screenshots, animation, or distinctive
   implementation from the excluded leaked Claude snapshot.
2. Proprietary branding or desktop UI assets from Codex, Claude Code, or any
   other product.
3. Renderer-owned approval, agent topology, context snapshots, provider
   requests, or raw filesystem paths.
4. Silent fallback to another model/provider, especially across privacy scopes.
5. CAPTCHA/anti-bot evasion, stealth automation, DRM bypass, unauthorized
   capture, or challenge circumvention. A challenge pauses for the user.
6. Password-database or general cookie-vault export from Edge Canary. Attach the
   existing session only through an explicit, revocable broker and rely on
   browser autofill/Windows Hello/user interaction for login recovery.
7. Silent SYSTEM/TrustedInstaller escalation or generic privileged shell access.
8. Unbounded subagent spawning, recursive collaboration, autonomous loops,
   downloads, media traversal, parser work, or research without quotas.
9. Learned/RL policy deciding security, scope, approval, or secret handling.
10. Treating a summary as a source-of-truth fact, or merging contradictory
    revisions into one stale memory.
11. Advertising a preview/mock/renderer projection as a verified Windows
    capability.

## 8. Benchmark-to-build backlog

The order below is intentionally dependency-aware. A later feature must not
create a parallel, weaker execution path.

| Priority | Work package | Benchmark lesson converted into an Omnia deliverable | Exit evidence |
|---|---|---|---|
| B0 | Kernel contract reconciliation | Unify ID format, state vocabulary, attempt/iteration semantics, projectless conversations, branch edges, dynamic parent-child agents, and optional task identity | Fresh schema/protocol fixtures, migration tests, no lossy native/TypeScript mapping. |
| B1 | Durable journal and replay | Codex event/projection discipline plus Claude recovery boundaries | Crash/restart/reconnect replays byte-equivalent visible output and never duplicates a billable attempt. |
| B2 | Attachment schema v4 and repository | Native draft ownership, encrypted content store, canonical dedupe, MIME sniffing and atomic binding | Fresh/migration/rollback tests, blob reconciliation, no renderer path/key/bytes. |
| B3 | Prepared provider input | Frozen multimodal/context/parameter/provider snapshot; gateway accepts only opaque prepared input ID | Text and attachment conformance, unsupported modality/parameter fail-closed tests. |
| B4 | Context compiler and compaction | Typed ledger, retrieval provenance, supersession, dependency groups and omission disclosure | Long-context/lost-in-middle corpus, exact payload diff, citation-span validation. |
| B5 | Provider health and usage ledger | Separate provider definitions/catalogs, conformance probes, cost/TTFT/cache/reasoning attribution | Mock provider matrix, stale catalog, retries/fallback and cost provenance tests. |
| B6 | UI foundation gate | Calm hierarchy without generic AI motifs; typed overlays, tokens, targets, typography, drawer and icon family | 800×600, mobile/remote projections, light/dark/200%/forced-colors visual and a11y evidence. |
| B7 | Memory and skills | Ordered lifecycle, versioning, trust, contradiction/supersession, progressive disclosure | Temporary-chat zero read/write, secret canary, deletion/derivative cleanup and retrieval explanation. |
| B8 | Artifacts/citations/evals | Durable artifact lineage, safe previews, citation hashes, validators, replay/evaluation bundles | Grounded QA corpus, hostile HTML/SVG/PDF tests, reproducible evaluation records. |
| B9 | Isolated/persistent/remote environments | Auto selector separated from capability policy; snapshots, mounts, network, drift and recovery | Clean Windows isolation/escape matrix, reset/drift reports, no ambient host secrets. |
| B10 | Permissioned tools and agent DAG | Typed tools, exact approvals, child-thread budgets, worktree/merge gates, effect ledger | Adversarial prompt-injection/tool/MCP corpus, cancellation/recovery/conflict tests. |
| B11 | Browser/capture | Explicit Edge Canary attach, rights-bound request/segment ledger, deterministic non-DRM merge | Challenge handoff, no cookie/password export, manifest/segment limits and provenance receipts. |
| B12 | Computer/admin operations | Separate perception/input from typed UAC broker and postcondition verification | Secure-desktop/UAC/rollback tests; no raw SYSTEM/TrustedInstaller path. |
| B13 | Remote clients and adaptive routing | Device keys, E2E transport, granular grants, replay protection, offline/shadow quality router | External-network penetration, revocation/replay, privacy review and rollback of learned policy. |

## 9. Benchmark scorecard for each future release

Before a capability is labeled `Implemented` or `Verified`, record the following
evidence. A green UI or a single successful provider call is not enough.

| Scorecard dimension | Minimum evidence |
|---|---|
| Identity and lineage | Stable IDs, ownership checks, branch/parent edges, no display-name resolution. |
| Input fidelity | Frozen request hash, exact parameter support map, selected/omitted context and attachment provenance. |
| Durability | Journal event and projection transaction, restart/replay test, migration/recovery fixture. |
| Cancellation | Local abort, upstream cancellation classification, partial output retention, no duplicate terminal event. |
| Error honesty | Stable redacted error code, diagnostic ID, explicit unsupported/unknown/outcome-unknown state. |
| Security | Capability, scope, destination, approval, secret, parser, path and prompt-injection denial tests. |
| Privacy | Local-first telemetry, redaction/canary scan, no raw credentials or private payloads in exports/logs. |
| Resource safety | Byte/token/time/concurrency/subagent/network/CPU/RAM/disk budgets and backpressure. |
| Provider conformance | Fragmented stream, usage, finish/error, retry, cancellation, capability and multimodal fixtures. |
| Context quality | Long-context, supersession, contradiction, retrieval diversity, omission and lost-in-middle benchmarks. |
| Output quality | Deterministic validators, citation support, structured-output validity, blinded quality comparison. |
| Accessibility | Keyboard/focus/ARIA, Narrator/forced-colors, 200% scale, localization expansion and reduced motion. |
| Visual quality | Light/dark, density, 800×600, remote/mobile widths, empty/loading/partial/error/overlay states. |
| Recovery | Fault injection at every durability boundary and an inspectable user-facing recovery explanation. |
| Release provenance | Source/lockfile/build/artifact hashes, environment, test reports, license/SBOM/signature status. |

## 10. Research backlog for unreviewed products

When promoting a `U` row, create a dated note with:

1. exact product name, official repository/docs URL, version/commit/date;
2. license and redistribution boundary;
3. source confidence level and what was actually inspected;
4. behavior matrix for lifecycle, context, tools, permissions, environments,
   agents, memory, skills, providers, telemetry, UI, and recovery;
5. clean-room implementation notes and non-copy decisions;
6. reproducible tests or fixtures that justify any adopted invariant;
7. differences from Omnia's Windows, privacy, provider, and provenance rules;
8. an ADR if the comparison changes the kernel or trust boundary.

Do not use screenshots, marketing copy, or a product's “agent” label as proof
of isolation, durable replay, output quality, or security.

## 11. Source map

Primary Omnia research and contracts:

- [`OPENAI_CODEX_HARNESS_RESEARCH.md`](OPENAI_CODEX_HARNESS_RESEARCH.md)
- [`CLAUDE_CODE_HARNESS_RESEARCH.md`](CLAUDE_CODE_HARNESS_RESEARCH.md)
- [`HARNESS_ARCHITECTURE.md`](../HARNESS_ARCHITECTURE.md)
- [`THREAT_MODEL.md`](../THREAT_MODEL.md)
- [`PRODUCT_SPEC.md`](../PRODUCT_SPEC.md)
- [`QA_STRATEGY.md`](../QA_STRATEGY.md)
- [`IMPLEMENTATION_STATUS.md`](../IMPLEMENTATION_STATUS.md)
- [`PROVIDER_ARCHITECTURE.md`](../PROVIDER_ARCHITECTURE.md)
- [`PROVIDER_MULTIMODAL_DESIGN.md`](../PROVIDER_MULTIMODAL_DESIGN.md)
- [`adr/0001-desktop-runtime-and-core-boundary.md`](../adr/0001-desktop-runtime-and-core-boundary.md)
- [`adr/0002-unified-kernel-execution-and-capabilities.md`](../adr/0002-unified-kernel-execution-and-capabilities.md)
- [`adr/0003-attachment-draft-ownership-and-atomic-bind.md`](../adr/0003-attachment-draft-ownership-and-atomic-bind.md)

External source provenance is intentionally kept in the two dedicated research
notes. This benchmark does not turn unreviewed product names into requirements,
and it does not copy any external code or visual asset.

## 12. Conclusion

Omnia should be judged as one harness with many projections, not as a pile of
provider-specific chats and disconnected future modes. The benchmark therefore
locks five principles:

1. durable identity and replay before breadth;
2. frozen context/provider/attachment input before autonomy;
3. policy, environment, approval, and execution as separate boundaries;
4. memory, skills, agents, artifacts, citations, and telemetry with provenance;
5. quality, accessibility, privacy, and recovery gates before advertising a
   capability.

Codex and Claude Code supply high-confidence complementary invariants. The
remaining ecosystem should broaden Omnia only after each product receives a
proper primary-source review. Until then, the safe and scalable choice is to
finish the shared kernel, storage/attachment vertical slice, provider prepared
input path, context compiler, and UI foundation gate described above.
