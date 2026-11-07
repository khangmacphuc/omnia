# Continue, Aider, and OpenCode harness research for Omnia

- Status: primary-source research and implementation guidance; not a shipped-capability claim
- Research date: 2026-08-13
- Scope: coding workbench, repository context, edit application, tool policy, agents, providers, extension trust, verification, session recovery, and protocol boundaries
- Normative authority: accepted Omnia ADRs, `docs/HARNESS_ARCHITECTURE.md`, `docs/THREAT_MODEL.md`, `docs/PRODUCT_SPEC.md`, and `docs/IMPLEMENTATION_STATUS.md`

This note reviews three official open-source coding-agent projects that are
especially relevant to Omnia's later IDE and coding-agent surfaces. It extracts
contracts and failure modes rather than copying user interfaces, prompts, or
project-specific implementation structure.

The conclusions below do not mean that Omnia currently ships an IDE, terminal,
repository index, coding agent, MCP runtime, LSP runtime, or autonomous edit
loop. Those capabilities remain behind the native protocol, journal, policy,
environment, provider-input, attachment, and UI-foundation gates recorded in
the implementation status and threat model.

## 1. Provenance and evidence boundary

### 1.1 Pinned repositories

| Project | Official repository | Reviewed commit | Commit time | License |
|---|---|---|---|---|
| Continue | `continuedev/continue` | `5522c6f44ca0ac3528b37244818fbfa39b5af470` | 2026-07-20T21:00:09-07:00 | Apache-2.0 |
| Aider | `Aider-AI/aider` | `5dc9490bb35f9729ef2c95d00a19ccd30c26339c` | 2026-05-22T07:02:20-07:00 | Apache-2.0 |
| OpenCode | `anomalyco/opencode` | `cc4b45612974f735ddec46009ede07729511fba4` | 2026-08-13T01:15:01Z | MIT |

The source trees were reviewed only from the official repositories. Current
official documentation was also consulted on 2026-08-13. Documentation that is
not commit-pinned is evidence of public behavior at that date, not a permanent
compatibility promise. Recheck it before making a release claim.

### 1.2 Clean-room rule

All Omnia implementation must use Omnia-owned contracts, types, tests, visual
language, copy, and code. Apache-2.0 and MIT permit reuse under their terms, but
the architectural target is still an independent implementation because Omnia
has different persistence, Windows security, privacy, multi-client, provider,
and environment requirements.

Do not copy:

- product branding, icons, screenshots, animations, copy, or distinctive UI;
- hidden prompts or prompt text merely because it exists in a source tree;
- provider-specific assumptions into the kernel;
- plaintext or file-based secret-storage behavior into Omnia's Windows secret
  broker;
- implicit permission expansion, silent package installation, or automatic Git
  mutation without an Omnia effect contract.

### 1.3 Research method

Findings are separated into three categories:

- **Observed**: present in the pinned official tree or current official docs.
- **Omnia decision**: an independently designed contract that adopts, adapts,
  defers, or rejects the observed pattern.
- **Required evidence**: deterministic tests and runtime receipts that must
  exist before Omnia exposes the feature.

## 2. Executive result

The three projects are complementary references:

- Continue is strongest as evidence for configurable model roles, IDE-aware
  context, plan/agent modes, rules, MCP integration, and explicit tool-policy
  configuration across IDE and CLI surfaces.
- Aider is strongest as evidence for token-budgeted repository maps,
  architect/editor separation, model-specific edit formats, Git-aware editing,
  and lint/test-driven repair loops.
- OpenCode is strongest as evidence for a client/server coding-agent surface,
  provider-neutral configuration, layered permission rules, primary/subagent
  roles, skills/MCP/LSP integration, session operations, and a generated SDK.

No single one supplies Omnia's full target. Omnia needs one durable kernel that
combines their useful invariants with stronger provenance, crash recovery,
frozen input, exact approvals, Windows secret handling, environment isolation,
multi-client replay, and explicit effect ownership.

The resulting coding pipeline should be:

```text
user intent
  -> plan/read-only exploration
  -> frozen repository/context snapshot
  -> typed edit proposal
  -> policy + environment decision
  -> transactional edit application
  -> formatter/LSP/lint/test validators
  -> bounded repair loop
  -> Git/effect review and promotion
  -> durable artifacts, citations, usage, and audit receipts
```

## 3. Continue findings

### 3.1 Multiple product surfaces over shared configuration

**Observed.** Continue exposes IDE-extension and CLI surfaces from one project,
with configuration for models, rules, prompts, tools, MCP servers, and related
agent behavior. The exact UI differs by surface, but the important harness
lesson is that provider and workflow configuration should not be owned by one
React component or one editor extension.

**Omnia decision — adopt and extend.** Desktop, CLI, web, Android, and future IDE
clients must project the same versioned kernel records. Client-local settings
may control presentation, keybindings, layout, and local accessibility only.
Provider profiles, policy, tool descriptors, rule versions, environment
selection, context snapshots, and run state must be native durable entities.

**Required evidence.** A run prepared from desktop and inspected from CLI must
resolve the same immutable provider/model, rule, skill, context, policy, and
environment revisions. A client may not silently rebuild the prompt.

### 3.2 Role-specific model configuration

**Observed.** Continue distinguishes model roles instead of assuming one model
is optimal for chat, editing, applying changes, autocomplete, embeddings, and
reranking. Official configuration and model-role documentation expose these as
separate concerns.

**Omnia decision — adopt, but use capability tasks rather than fixed product
roles.** Omnia should represent a versioned `ModelTaskProfile`, for example:

```text
conversation
research-planning
research-synthesis
code-planning
code-generation
patch-application
completion
embedding
reranking
vision
audio
verification
compaction
memory-extraction
memory-consolidation
```

Each profile resolves to a provider/model revision plus parameters, capability
evidence, cost policy, latency policy, privacy class, and fallback graph. A
profile is not a security principal and cannot grant tools or egress.

**Required evidence.** Resolution must be frozen before dispatch. Fallback must
preserve modality, structured-output, tool, context-window, privacy, and data-
residency requirements; otherwise it fails closed.

### 3.3 Plan mode versus mutation-capable agent mode

**Observed.** Continue documents a plan mode intended for exploring a codebase
and producing an implementation plan before moving to an agent mode that can
make changes. The modes differ in tool access and workflow, not just in the
placeholder text shown to the user.

**Omnia decision — adopt as a capability profile, not a cosmetic mode.** The
kernel should define at least:

```text
Inspect  -> read/search/index only
Plan     -> Inspect + durable plan artifacts, no workspace mutation
Build    -> bounded edit/execute operations after policy evaluation
Review   -> read diffs, diagnostics, tests, provenance; no mutation by default
Operate  -> explicit non-code system/browser/computer capabilities
```

Changing from Plan to Build creates a new policy evaluation and a new frozen
run snapshot. It must not reinterpret already-generated plan text as an
approval. Plan artifacts are untrusted model output until the user or an
authorized parent workflow promotes them.

**Required evidence.** Denial tests must prove that Plan cannot edit through a
shell alias, MCP tool, formatter, LSP code action, package script, nested agent,
or generated task. Mode changes produce durable events and invalidate stale
approval receipts.

### 3.4 Tool permissions and terminal command classification

**Observed.** Continue's CLI documentation and `terminal-security` package
separate command-security evaluation from command execution and provide tool
permission controls. This is useful evidence that a coding agent needs more
than a single global yes/no switch.

**Omnia decision — adapt into exact operation-bound policy.** Omnia should not
depend on textual command allowlists alone. A tool request must be normalized
into an operation descriptor containing:

```text
tool identity and version hash
canonical arguments hash
command AST or parse-failure state
cwd and workspace grant
environment identity
filesystem read/write targets
network destinations
process, registry, package, Git, secret, and privilege effects
data classes leaving the machine
policy and capability-set revisions
```

Rules may produce `allow`, `ask`, or `deny`, but only an operation-bound,
single-use, expiring approval receipt authorizes execution. Parse ambiguity,
indirection that cannot be bounded, or a changed tool version fails closed.

**Required evidence.** Tests must cover PowerShell scripts, encoded commands,
aliases, pipelines, redirection, subshells, response files, package scripts,
symlinks/junctions, nested MCP calls, and approval replay.

### 3.5 Rules and scoped instructions

**Observed.** Continue supports user- and workspace-level rules, including
path-aware rules. This is a practical way to keep project conventions near the
codebase and load only relevant instructions.

**Omnia decision — adopt with typed authority and trust.** A rule record must
carry:

```text
rule ID and immutable revision
origin and canonical path
profile/project/workspace scope
path/language/task selectors
authority class
trust state and signer/package origin
content hash
created/observed/superseded timestamps
activation and omission reason
```

Repository rules are project instructions, never security policy. An untrusted
repository can request a style or test command, but cannot grant network,
secrets, elevated privilege, external filesystem access, or plugin execution.
Conflicting rules require deterministic precedence and visible provenance.

**Required evidence.** Rename, symlink, branch, workspace-root, nested-rule,
conflict, supersession, and malicious-instruction tests must be deterministic.

### 3.6 Context selection and codebase retrieval

**Observed.** Continue provides IDE-aware context selection and codebase-aware
workflows. Users can deliberately add relevant sources while the agent can use
search and repository tools during a task.

**Omnia decision — adopt explicit plus conditional context as two separately
auditable channels.** The context compiler should distinguish:

- explicit user attachments and selections;
- current editor state and selected ranges;
- repository search/index results;
- dependency and symbol neighbors;
- Git diff and branch state;
- diagnostics, terminal, test, and task output;
- rules, memories, skills, plans, and prior findings;
- omissions caused by token, privacy, freshness, or authority constraints.

Every selected context item needs a content hash, source revision, byte/token
cost, authority, freshness, selection reason, and citation handle. Retrieval
results must be frozen for the attempt; an index update after dispatch cannot
silently change the prompt.

**Required evidence.** Benchmarks must measure symbol recall, stale-index
rejection, dependency preservation, lost-in-the-middle resistance, prompt
budget use, and citation correctness—not only whether a plausible answer was
generated.

### 3.7 MCP and extension configuration

**Observed.** Continue can expose MCP-provided tools and supports custom model
providers/configuration. This makes extension discovery easy but also expands
the trust surface.

**Omnia decision — adapt through a staged extension lifecycle.** Installation,
validation, enablement, capability grant, and execution are separate durable
operations. A descriptor must declare schemas, executable/package identity,
network, filesystem, process, secret, UI, storage, update, and child-tool
effects. Updating a server or plugin invalidates prior trust when its manifest,
binary, dependency lock, tool schema, or effect declaration changes.

**Required evidence.** Tool-name collision, schema drift, update expansion,
malicious description, hidden child process, oversized output, cancellation,
timeout, and unavailable-server tests are release gates.

### 3.8 Development data and telemetry

**Observed.** Continue documents development-data behavior and configurable
product data handling. The precise product policy can change, but the harness
lesson is that generated prompts, code, tool arguments, and errors can contain
sensitive repository data.

**Omnia decision — local-first and field-classified.** Telemetry schemas must
mark each field as safe aggregate, local-sensitive, secret, user-content, code,
path, endpoint, or diagnostic. Default dashboards should derive from local
structured events. Remote export is opt-in per destination and redacts before
queueing. Raw prompts, code, keys, cookies, paths, and tool outputs are never
included merely to improve product analytics.

## 4. Aider findings

### 4.1 Token-budgeted repository map

**Observed.** Aider's repository map extracts code symbols, uses repository
structure and graph ranking to select important definitions, and renders a
compact map under a token budget. The map gives the model useful awareness of
files not directly loaded into the chat and is updated as repository state
changes.

**Omnia decision — adopt and extend into a versioned code-intelligence
snapshot.** A repository map is one retrieval view, not the source of truth.
Omnia's `CodeIndexSnapshot` should include:

```text
workspace grant and repository identity
Git commit, branch, dirty-state digest, and filesystem observation time
file identity, content hash, language, parser version, and parse diagnostics
symbol definitions, references, imports, calls, inheritance, and ownership
dependency/code graph edges with confidence and provenance
sparse terms, dense embeddings, structural ranks, and retrieval scores
generated/binary/vendor/ignored classification
index coverage, omissions, stale regions, and schema version
```

The context compiler can create a token-budgeted `RepositoryMapProjection`
from this snapshot for a specific task. The projection must preserve symbol-to-
source citations and record why each item was selected or omitted.

**Required evidence.** Test monorepos, generated code, duplicate symbols,
partial parses, renamed files, dirty buffers, submodules, symlinks/junctions,
large vendor trees, branch changes, and multiple workspaces. Measure recall and
freshness against a labelled corpus.

### 4.2 Architect/editor separation

**Observed.** Aider's architect mode separates a model that reasons about the
solution from an editor model that translates the proposal into concrete code
changes. This can improve results when a strong reasoning model is not itself
reliable at a particular edit format.

**Omnia decision — adopt as typed producer/verifier roles, not free-form prompt
chaining.** A planning attempt should produce a `CodeChangePlan` with:

```text
objective and acceptance criteria
assumptions and unresolved questions
files/symbols expected to change
invariants and forbidden effects
migration and compatibility notes
validation plan
evidence citations
plan hash and producing attempt
```

An editor consumes the frozen plan plus a fresh verified workspace snapshot and
produces typed `EditProposal` operations. If repository state no longer matches
the plan's preconditions, the editor stops for rebase/replan instead of applying
the proposal opportunistically.

An independent verifier should review the resulting diff and validator output.
The planner, editor, and verifier may use different models, but their identities,
parameters, context, cost, and outputs remain linked in one run graph.

**Required evidence.** Tests cover stale plans, hallucinated files, overlapping
edits, divergent branches, plan/editor disagreement, verifier disagreement,
partial application, cancellation, and retry idempotency.

### 4.3 Model-specific edit formats

**Observed.** Aider supports multiple edit formats and model-specific settings.
This recognizes that models differ in their ability to emit whole files,
search/replace blocks, patches, or other structured edits.

**Omnia decision — adopt a negotiated edit protocol with strict validation.** A
model capability snapshot should state which edit protocols were verified for
that exact provider/model revision. Candidate protocols include:

```text
whole-file replacement
range edit with preimage hash
search/replace with uniqueness requirement
unified diff
structured AST/symbol edit
editor/LSP workspace edit
```

Every edit carries a preimage hash or equivalent version condition. Omnia
normalizes a provider response into typed operations, validates syntax and
scope, computes the complete diff, and only then asks policy/environment layers
to apply it. A model claiming an unsupported edit format fails closed rather
than falling back silently.

**Required evidence.** Fuzz ambiguous search/replace, path traversal, newline
and encoding changes, case sensitivity, binary files, duplicate matches,
deleted/renamed files, line-ending preservation, and partial patch failure.

### 4.4 Git-aware editing and undo

**Observed.** Aider integrates closely with Git, can commit AI-authored changes,
and exposes diff/undo-oriented workflows. This makes AI effects inspectable and
recoverable in the common case.

**Omnia decision — adapt; never equate a Git commit with the complete effect
ledger.** A code operation may also modify generated files, package caches,
databases, terminals, processes, services, remote resources, browser state, or
files outside a repository. Omnia therefore records typed effects before
execution and postconditions after execution. Git remains an excellent code-
review and promotion mechanism, but:

- existing user changes are never silently committed;
- an Omnia change set has explicit ownership of paths and hunks;
- unrelated dirty work is preserved;
- commit creation is a distinct authorized operation;
- undo describes exact coverage and cannot claim to reverse external effects;
- worktree/branch deletion refuses untracked or unowned content;
- commit message generation cannot conceal co-authorship or validation state.

**Required evidence.** Test mixed dirty trees, staged changes, submodules,
worktrees, rebases, rename conflicts, case-only renames on Windows, hooks,
attributes, filters, LFS, ignored files, and failed commits.

### 4.5 Lint and test feedback loops

**Observed.** Aider supports linting after changes, can feed lint errors back
for repair, and can run configured test commands. This is a concrete quality
loop rather than relying on the model's confidence.

**Omnia decision — adopt a typed validator DAG.** Validators should declare:

```text
identity/version/config hash
command or native implementation
read/write/network/process effects
applicable paths/languages
environment and workspace grant
timeout/resource budget
output parser and diagnostic schema
cache inputs
required/optional/advisory severity
```

Format, parse, typecheck, lint, unit, integration, security, accessibility,
performance, packaging, and visual validators may run in dependency order and
parallel where safe. Model repair consumes structured diagnostics and the
current diff, not an unbounded terminal transcript.

The repair loop terminates on acceptance, budget exhaustion, repeated diff,
repeated diagnostic signature, no progress, user interruption, policy denial,
or environment failure. It never loops until a vague notion of perfection.

**Required evidence.** Deterministic tests cover flaky tests, nonzero exit with
no parser output, enormous logs, timeout, cancellation, changed source during
validation, cache poisoning, validator mutation, and false-green partial runs.

### 4.6 Explicit file-set control and token accounting

**Observed.** Aider lets users add/drop files, distinguish repository-map
awareness from full file context, inspect token use, and issue explicit commands
for repository and task operations.

**Omnia decision — adopt visible context ownership.** The coding composer and
context inspector should show:

- explicitly pinned files/ranges and their token cost;
- read-only versus editable grants;
- automatically retrieved items and why they were selected;
- repository-map budget;
- rules, memories, skills, diagnostics, and plans;
- current prompt estimate versus provider limit;
- omitted or summarized items;
- stale or changed files since snapshot freeze.

Adding a file to context does not grant write permission. Adding a workspace
does not grant network, execution, secrets, Git commit, or admin capability.

### 4.7 Model/edit benchmarks

**Observed.** Aider publishes coding benchmarks and evaluates model/edit-format
combinations. Whatever one thinks of a particular benchmark, the useful pattern
is to test the complete model-plus-harness path rather than rank models only by
generic chat quality.

**Omnia decision — adopt a versioned local evaluation corpus.** Scores must be
attributed to:

```text
provider/model/catalog revision
parameters and reasoning settings
edit protocol
context/index/compiler version
tool/policy/environment versions
validator set
prompt/template hashes
cost and latency
number of repair attempts
final diff and test evidence
```

Public benchmarks can seed tasks but cannot replace user-specific private
corpora for competitive programming, C++, Python, ML/data science, research,
documents, and production repositories.

## 5. OpenCode findings

### 5.1 Client/server and generated SDK boundary

**Observed.** OpenCode exposes a server surface and an SDK in addition to its
terminal UI. This is strong evidence that a coding agent benefits from a
protocol boundary rather than embedding all behavior in one UI process.

**Omnia decision — adopt and make the protocol transport-neutral.** Tauri IPC,
local named pipes, authenticated loopback HTTP, CLI stdio, remote WebSocket, and
future Android clients should adapt one versioned Omnia protocol. The protocol
requires:

```text
initialization handshake and session epoch
client/server version and capability negotiation
stable/experimental method sets
idempotency keys for mutation commands
durable event cursor and replay
bounded queues and overload outcomes
cancellation and interruption receipts
typed errors safe for renderer/remote clients
schema generation and compatibility tests
```

Running a local server does not mean listening on all interfaces. Remote access
requires device pairing, explicit grants, encryption, replay protection, and a
visible revocation path.

### 5.2 Provider-neutral model catalog

**Observed.** OpenCode supports many providers and custom provider/model
configuration. Provider choice is separated from agent identity and tools.

**Omnia decision — adopt and extend.** A provider definition, secret handle,
model catalog, model task profile, live health probe, conformance result,
pricing revision, and per-run frozen resolution are separate records. A model
ID string alone never proves context length, modalities, tool calling, reasoning
tokens, structured output, caching, upload support, or data handling.

Secrets remain behind opaque Windows broker handles. Renderer, logs, exported
projects, plugins, tools, and remote clients do not receive raw keys. Custom
endpoints pass URL policy, TLS, redirect, DNS-rebinding, network-zone, and data-
classification checks before egress.

### 5.3 Layered permissions with pattern rules

**Observed.** OpenCode documents `allow`, `ask`, and `deny` permissions, pattern-
specific rules, per-agent overrides, and a deterministic matching order. It
also distinguishes tool families such as shell, edit, external directory, and
loop-related behavior.

**Omnia decision — adopt deterministic precedence, but strengthen the subject
and receipt model.** Omnia rules are evaluated over canonical typed effects,
not solely tool names and glob strings. Precedence must be explainable in the
inspector, with every matched rule and the final reason recorded.

Agent-local policy can only narrow inherited authority unless the user performs
a new explicit grant. A child agent cannot select a more permissive profile,
tool alias, MCP server, environment, or remote client to escape its parent
budget and capability ceiling.

`always allow` is a new bounded grant with visible scope and expiry—not a
timeless approval inferred from a button click. `allow once` is single-use and
bound to the exact normalized operation.

**Required evidence.** Test wildcard precedence, nested agent overrides,
renamed tools, equivalent shell syntax, new MCP tools, config reload, expired
grants, external directories, repeated calls, and policy-version change.

### 5.4 Primary agents and subagents

**Observed.** OpenCode distinguishes primary agents from subagents and provides
built-in roles oriented around building, planning, exploration, and general
delegated work. Custom agents can select prompts, models, tools, permissions,
and related behavior.

**Omnia decision — adopt a durable agent DAG.** Agent mode is part of an
immutable versioned descriptor containing:

```text
agent identity/version/trust
parent edge and creation reason
fresh/fork/persistent/team context mode
task objective and completion contract
provider/model task profile
tool and capability ceiling
environment and workspace grants
token/cost/time/tool/child/depth budgets
mailbox and artifact channels
context handoff schema
merge/review gate
terminal state and reason
```

Subagent output returns as structured findings, edits, artifacts, evidence IDs,
risks, and unresolved questions. Raw hidden transcripts are inspectable but are
not blindly appended to the parent prompt.

### 5.5 Configuration layering and repository trust

**Observed.** OpenCode supports configuration from multiple locations, including
global, project, directory, environment-selected, and remotely obtained
sources. Its configuration is merged with deterministic precedence.

**Omnia decision — adapt with an explicit trust boundary.** Configuration
merging must never turn opening a repository into code execution or permission
grant. Each fragment has origin, content hash, trust, signature/package state,
schema version, observation time, scope, and precedence. The merged projection
records where every effective value came from.

Repository configuration may propose tools, MCP servers, plugins, formatters,
LSP servers, commands, and environment requirements. Proposals remain disabled
until installation, binary/package verification, capability review, and an
explicit grant are complete. Remote configuration is treated as network data,
not trusted policy.

**Required evidence.** Test config shadowing, merge arrays/maps, deletion,
unknown fields, schema upgrades, symlinked config, branch changes, remote
redirects, compromised package sources, and trust invalidation after updates.

### 5.6 Tools, MCP, skills, plugins, and LSP

**Observed.** OpenCode exposes built-in tools, MCP integration, discoverable
skills, plugins, and LSP-based code intelligence. Official documentation notes
that extension/tool selection also affects context size and agent behavior.

**Omnia decision — adopt a common typed extension registry while preserving
different lifecycle semantics.** Tools, MCP servers, skills, plugins, formatters,
and LSP servers share identity, provenance, trust, enablement, version, and
capability descriptors, but they are not interchangeable:

- a skill contributes versioned instructions/resources and grants no authority;
- a tool performs a typed operation;
- an MCP server is a transport endpoint exposing tools/resources/prompts;
- a plugin executes host code and is a high-trust package;
- an LSP server is a long-lived process over a workspace with potentially
  sensitive code and filesystem/network/process effects;
- a formatter can mutate files even if presented as a quality helper.

Automatic LSP or formatter discovery may create a proposal, but installation or
execution requires policy. Language-server output is untrusted data and cannot
be promoted into system instructions.

**Required evidence.** Test binary replacement, server crash/restart,
diagnostic staleness, workspace leakage, malicious code actions, install races,
tool schema drift, prompt injection in descriptions, oversized output, and
extension update capability expansion.

### 5.7 Session operations, snapshots, compaction, and sharing

**Observed.** OpenCode exposes session-oriented commands including navigation,
undo/redo-style workflows, compaction, export/import, and optional sharing.
These make session lifecycle visible rather than treating all history as an
unstructured chat string.

**Omnia decision — adopt separate commands and receipts.** The kernel must keep
these concepts distinct:

```text
conversation rewind       changes visible conversational projection
workspace effect rollback attempts to reverse a declared effect set
retry                      new provider attempt for the same frozen intent
regenerate                 new run with an explicit changed-input relation
fork                       new branch at an immutable event boundary
compact                    new context projection with provenance
export/import              signed/versioned portable archive operation
share                      explicit publication/grant operation
```

Compaction never deletes source events. It produces a checkpoint that lists
included event ranges, facts, summaries, citations, supersession edges,
unresolved tasks, omitted data, tool/effect state, and compiler version. Sharing
is off by default and never uploads raw secrets, hidden policy, local paths, or
private artifacts implicitly.

**Required evidence.** Replay after crash, compact/resume equivalence, stale
checkpoint, fork during streaming, undo after external effects, import schema
migration, revoked share, and redaction tests are mandatory.

### 5.8 Loop guards and task state

**Observed.** OpenCode includes permission concepts for repeated-loop behavior
and task/todo-oriented tools. This is evidence that an autonomous coding harness
needs explicit progress state and loop detection.

**Omnia decision — adopt bounded objective state.** A run or subagent has a
typed objective, acceptance gates, todos with stable IDs, dependencies,
budgets, checkpoints, progress evidence, and terminal reason. Loop guards use
more than identical tool text: they compare normalized operations, diffs,
diagnostic signatures, context revisions, and validator outcomes.

Learned routing may recommend another model or validator, but deterministic
policy decides whether an operation is authorized. No reinforcement-learning
component can grant security capability or suppress an approval.

## 6. Comparative adoption matrix

| Concern | Continue signal | Aider signal | OpenCode signal | Omnia decision |
|---|---|---|---|---|
| Product boundary | IDE + CLI configuration | Terminal-centric coding loop | Client/server + SDK | One versioned kernel protocol and multiple projections |
| Model selection | Explicit role-specific models | Main/editor/weak model and edit-format settings | Provider-neutral model and agent config | Versioned task profiles, frozen per run; never tied to security |
| Planning | Plan versus agent mode | Architect model | Plan primary agent | Capability-bound Inspect/Plan/Build/Review profiles |
| Repository awareness | IDE context and codebase tools | Token-budgeted repository map | Read/grep/glob/LSP/tools | Frozen hybrid code index with citations and freshness |
| Edit application | Agent tools and IDE edits | Multiple model-specific edit formats | Edit/write/patch tools | Negotiated typed edit protocol with preimage conditions |
| Permissions | Tool policy and terminal security | Primarily interactive/command workflow | Layered allow/ask/deny pattern rules | Exact typed effects, deterministic rules, single-use receipts |
| Rules/instructions | User/workspace/path rules | Conventions via context/config | Layered config, agents, instructions | Versioned authority-aware rule graph; no capability grants |
| Subagents | Agent workflows, CLI/IDE modes | Architect/editor composition | Primary and subagents | Durable agent DAG with ceilings, budgets, handoff, merge gates |
| Verification | Tool-driven workflow | Lint and test repair | Tools, LSP, formatter, tasks | Typed validator DAG and bounded repair/verifier loop |
| Git/recovery | IDE workflow dependent | Auto-commit/diff/undo integration | Snapshot/session undo/redo workflows | Effect ledger plus Git promotion; exact rollback coverage |
| Extensions | MCP and custom providers | Model/edit configuration | Tools, MCP, skills, plugins, LSP | Staged install/validate/enable/grant/execute lifecycle |
| Session lifecycle | CLI/IDE session behavior | Chat/command history | Sessions, compaction, import/export/share | Journal-first replay, explicit fork/compact/rewind/share commands |
| Telemetry/evals | Development-data controls | Coding benchmark corpus | Provider/session observability surfaces | Local-first typed telemetry and versioned user-specific evals |

## 7. Unified Omnia coding-harness contracts

### 7.1 `CodeTaskSnapshot`

Before any billable dispatch or mutation-capable tool call, native storage must
freeze:

```text
task/run/branch/user-intent identities
provider/model/task-profile revisions and resolved parameters
repository/workspace grants and code-index snapshot
explicit context, retrieval projection, rules, memories, skills, and plan
policy/capability/environment/tool/extension revisions
edit protocol and validator plan
privacy/data-egress classification
token/cost/time/resource budgets
all selected and omitted context with hashes and reasons
```

The renderer sends only the prepared attempt identity. It does not reconstruct
messages, repository context, parameters, tools, or attachments.

### 7.2 `EditProposal` and `ChangeSet`

The model-produced proposal is separate from applied state:

```text
EditProposal
  -> normalized typed operations
  -> precondition and scope validation
  -> complete diff preview
  -> policy/environment decision
  -> transactional or checkpointed application
  -> ChangeSet with effect receipts
```

Each operation has a stable ID, target identity, expected preimage, producing
attempt, source evidence, and validation result. Partial application is a
terminal recoverable state, not success.

### 7.3 Repository context tiers

Use ordered tiers instead of indiscriminately placing the entire repository in
the prompt:

1. User-pinned exact files/ranges and requirements.
2. Current change set, plan, diagnostics, and acceptance criteria.
3. Direct symbol definitions and references.
4. Dependency and caller/callee neighborhood.
5. Token-budgeted repository map.
6. Sparse and dense retrieval results.
7. Project rules, memories, skills, docs, and prior verified findings.
8. Summaries/checkpoints with source-event citations.

The compiler preserves dependency groups, favors current superseding facts,
avoids duplicate revisions, and exposes omissions. It must explicitly counter
lost-in-the-middle behavior with ordering tests and reference anchors.

### 7.4 Validator and repair lifecycle

```text
proposal
  -> static edit validation
  -> apply in selected environment
  -> format/parse/type/lint
  -> focused tests
  -> broader tests/security/a11y/performance as policy requires
  -> independent diff review
  -> accept, repair, request input, or terminate
```

Every validator result is an immutable artifact linked to exact input hashes.
Changing a file invalidates affected cached results. A final response must state
which gates ran, which did not, why, and whether results are authoritative for
the target Windows/environment configuration.

### 7.5 Permission invariants

- Planning, context selection, rules, skills, models, and agent roles never
  grant capability.
- Child agents inherit a ceiling and can only narrow it.
- `Auto` selects a suitable persistent, isolated, or remote environment; it
  does not auto-approve the operation.
- Shell parsing, path resolution, executable/package identity, workspace grant,
  network, data class, and secret handles are part of the operation hash.
- Admin/UAC operations use a separate privileged broker with exact postconditions.
- SYSTEM or TrustedInstaller is never silently acquired.
- Learned policies never make security decisions.

### 7.6 Extension invariants

- Discovery is not installation.
- Installation is not trust.
- Trust is not enablement.
- Enablement is not a capability grant.
- A capability grant is not an approval for an arbitrary future operation.
- Updates invalidate trust when identity, code, schema, dependencies, effects,
  or destinations change.
- Repository and remote config may propose, but never silently activate,
  executable integrations.

## 8. Patterns deliberately rejected or constrained

Omnia must not adopt the following merely because another coding tool supports
or normalizes them:

- a permissive global `auto-approve everything` mode;
- matching security only on a displayed tool name or raw command substring;
- treating a plan, rule, skill, repository file, LSP message, MCP description,
  or model response as trusted policy;
- silently installing language servers, formatters, packages, plugins, or MCP
  servers when a repository is opened;
- storing provider keys in renderer-visible state, plain configuration, exported
  archives, or diagnostic logs;
- auto-committing unrelated user changes;
- claiming Git undo reverses processes, services, network, database, browser,
  remote, or privileged effects;
- sharing or uploading a session by default;
- compaction that discards raw event history or citations;
- unbounded plan/edit/test/repair loops;
- using model quality scores to widen security permissions;
- advertising IDE, agent, LSP, MCP, or autonomous coding support before the
  native path and denial tests exist.

## 9. Dependency-ordered implementation slices

### Slice CAO-0 — Protocol and journal prerequisites

- Reconcile canonical IDs and run/attempt/iteration semantics.
- Implement durable run events, cursors, replay, cancellation, recovery, and
  immutable prepared input.
- Finish exact capability/policy/environment contracts.

Exit gate: desktop restart and a second client can reconstruct an interrupted
text-only run without renderer-authored state.

### Slice CAO-1 — Read-only repository grants and index

- Add repository/workspace identity, bounded no-follow file access, dirty-buffer
  overlays, Git snapshot, language/parser registry, symbols, sparse index, and
  token-budgeted repository-map projection.
- Expose Inspect and Plan only.

Exit gate: benchmarked retrieval freshness and citations; no write, process,
network, package, LSP-install, or Git mutation capability exists.

### Slice CAO-2 — Plan artifacts and task-profile routing

- Add typed code-plan artifacts, model task profiles, plan verification, and
  inspectable context budgets.
- Freeze exact plans and repository state before editor dispatch.

Exit gate: plan cannot mutate via any native, shell, MCP, LSP, child-agent, or
formatter path.

### Slice CAO-3 — Typed edits and transactional change sets

- Implement negotiated edit protocols, preimage validation, complete diff
  preview, owned path/hunk sets, checkpointed application, and effect receipts.
- Start with isolated or dedicated worktree execution.

Exit gate: fuzzed patch tests and crash recovery show no silent partial success
or overwrite of unrelated work.

### Slice CAO-4 — Validator DAG and bounded repair

- Add formatter, parser, typecheck, lint, test, security, accessibility, and
  packaging validator descriptors.
- Add repeated-diff/diagnostic/no-progress guards and independent verifier role.

Exit gate: deterministic corpus demonstrates terminal reasons, cancellation,
resource limits, cache invalidation, and truthful final gate reports.

### Slice CAO-5 — Git review and promotion

- Add worktree/branch ownership, stage/commit as separate operations, merge
  review, conflict handling, and exact undo coverage.

Exit gate: mixed dirty-tree and Windows-specific Git regression matrix passes
without touching unowned changes.

### Slice CAO-6 — Trusted extensions and code intelligence

- Add staged MCP, skill, plugin, formatter, and LSP registries.
- Add package/binary provenance, capability diffs on update, process lifecycle,
  workspace/data boundaries, and output limits.

Exit gate: malicious extension corpus and update-expansion tests pass.

### Slice CAO-7 — Durable agent DAG

- Add planner/editor/verifier/explorer roles, task DAG, mailboxes, budgets,
  structured handoff, worktree ownership, and merge gates.

Exit gate: crash/restart, branch changes, cancellation, orphan recovery,
  duplicate delivery, and stale-result tests pass.

### Slice CAO-8 — Multi-client and remote projection

- Project the same coding run to CLI, web, Android, and IDE clients.
- Add pairing, end-to-end encrypted remote transport, granular grants, and
  high-quality screen/terminal streaming only after the core protocol is stable.

Exit gate: no client can widen grants or invent run state; replay is consistent
across reconnect and device revocation.

## 10. Deterministic regression catalogue

### Repository/index

- Parser crash leaves explicit partial coverage.
- Dirty editor buffer supersedes disk without losing disk provenance.
- Branch switch invalidates stale symbol/retrieval projections.
- Same symbol name in multiple languages resolves with citations.
- Rename, delete, generated file, ignored file, submodule, junction, and
  symlink cases do not escape the workspace grant.
- Token-budgeted map preserves the task's labelled dependency set.

### Plan/editor

- Plan run has no mutation-capable command exposed.
- Editor refuses a stale plan or mismatched preimage.
- Planner hallucination cannot create a path outside the grant.
- Editor and verifier disagreement remains visible and terminal.
- Retry does not apply the same change twice.

### Edit application

- Ambiguous search/replace refuses instead of choosing arbitrarily.
- Partial patch rolls back or records a recoverable partial state.
- CRLF, UTF-8/UTF-16, BOM, executable bit, and case-only rename are preserved
  according to repository policy.
- Tool cancellation cannot report success before durable postconditions.
- Workspace mutation between preview and approval invalidates the proposal.

### Permission/config

- Last-match or precedence rules are deterministic and explainable.
- Child agent cannot widen parent authority.
- Repository rule/config cannot install or activate executable code.
- Tool or plugin update invalidates stale trust and approvals.
- Equivalent PowerShell encodings resolve to the same bounded effect or fail
  closed.
- External-directory and network requests require exact new grants.

### Validators

- Flaky test is labelled, not silently retried until green.
- Timeout, cancellation, enormous output, malformed diagnostics, and nonzero
  exit without output produce typed terminal results.
- Changed inputs invalidate cached validator success.
- Formatter or code action mutation appears in the change set.
- Repeated diff/diagnostic signatures stop repair with a reason.

### Git/effects

- User staged/unstaged/untracked changes remain unowned and untouched.
- Commit failure does not lose applied-change provenance.
- Undo discloses non-Git effects it cannot reverse.
- Worktree cleanup refuses untracked or unowned files.
- Hook, filter, LFS, submodule, rebase, merge, and case sensitivity behaviors are
  captured in receipts.

### Session/protocol

- Event sequence is durable, monotonic, idempotent, and replayable.
- Crash between effect and projection is reconciled without duplicate execution.
- Fork during streaming records an interruption boundary.
- Compaction/resume preserves facts, citations, tasks, policy, environment, and
  effect state.
- Export/import preserves IDs or records an explicit remap.
- Share is opt-in, redacted, revocable, and never contains secret handles.

## 11. Source register

### Continue

- Pinned repository: <https://github.com/continuedev/continue/tree/5522c6f44ca0ac3528b37244818fbfa39b5af470>
- Pinned license: <https://github.com/continuedev/continue/blob/5522c6f44ca0ac3528b37244818fbfa39b5af470/LICENSE>
- Model roles: <https://docs.continue.dev/customize/model-roles>
- Models and providers: <https://docs.continue.dev/customize/models>
- Tool permissions: <https://docs.continue.dev/cli/tool-permissions>
- Plan mode guide: <https://docs.continue.dev/guides/plan-mode-guide>
- Agent context selection: <https://docs.continue.dev/ide-extensions/agent/context-selection>
- Rules: <https://docs.continue.dev/customize/rules>
- MCP tools: <https://docs.continue.dev/customize/mcp-tools>
- Development data: <https://docs.continue.dev/customize/deep-dives/development-data>
- Pinned terminal-security package: <https://github.com/continuedev/continue/tree/5522c6f44ca0ac3528b37244818fbfa39b5af470/packages/terminal-security>

### Aider

- Pinned repository: <https://github.com/Aider-AI/aider/tree/5dc9490bb35f9729ef2c95d00a19ccd30c26339c>
- Pinned license: <https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/LICENSE.txt>
- Repository map: <https://aider.chat/docs/repomap.html>
- Pinned repository-map implementation: <https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/repomap.py>
- Architect mode: <https://aider.chat/2024/09/26/architect.html>
- Pinned architect/editor implementation: <https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/coders/architect_coder.py>
- Linting and testing: <https://aider.chat/docs/usage/lint-test.html>
- In-chat commands: <https://aider.chat/docs/usage/commands.html>
- Git integration: <https://aider.chat/docs/git.html>
- Advanced model settings/edit formats: <https://aider.chat/docs/config/adv-model-settings.html>

### OpenCode

- Pinned repository: <https://github.com/anomalyco/opencode/tree/cc4b45612974f735ddec46009ede07729511fba4>
- Pinned license: <https://github.com/anomalyco/opencode/blob/cc4b45612974f735ddec46009ede07729511fba4/LICENSE>
- Configuration: <https://opencode.ai/docs/config/>
- Providers: <https://opencode.ai/docs/providers/>
- Permissions: <https://opencode.ai/docs/permissions/>
- Agents: <https://opencode.ai/docs/agents/>
- Tools: <https://opencode.ai/docs/tools/>
- MCP servers: <https://opencode.ai/docs/mcp-servers/>
- Skills: <https://opencode.ai/docs/skills/>
- Plugins: <https://opencode.ai/docs/plugins/>
- LSP servers: <https://opencode.ai/docs/lsp/>
- Server: <https://opencode.ai/docs/server/>
- SDK: <https://opencode.ai/docs/sdk/>
- TUI and session commands: <https://opencode.ai/docs/tui/>
- Sharing: <https://opencode.ai/docs/share/>

## 12. Final implementation stance

The most valuable lesson is not to add three new compatibility modes named
Continue, Aider, and OpenCode. Omnia should instead implement the durable
contracts those projects make useful:

- explicit plan/read versus build/write authority;
- task-specific model resolution;
- fresh, token-budgeted, cited repository context;
- typed edit proposals and preconditions;
- validator-driven bounded repair;
- exact tool permissions and child-agent ceilings;
- versioned extension/config trust;
- journal-first sessions and replay;
- effect-aware Git review and truthful undo;
- a transport-neutral kernel for desktop, IDE, CLI, web, Android, and remote
  clients.

Until these paths are native, durable, denial-tested, and verified on supported
Windows configurations, Omnia's current UI must keep them labelled planned or
preview and must not imply that a mock projection is an active coding agent.

This research is indexed by `docs/research/OMNIA_HARNESS_BENCHMARKS.md`; it is
informative architecture evidence rather than the implementation-status source
of truth.
