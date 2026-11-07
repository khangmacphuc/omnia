---
id: OMNIA-AUDIT-ULTRA-GOAL-PACK-GAPS
title: Omnia Ultra goal-pack coverage and drift audit
status: audit-current-tree
last_reviewed: 2026-08-14
---

# Omnia Ultra goal-pack gap audit

## Outcome

The current `docs/omnia-ultra/` pack already captures most of the user's
explicit product intent. Advanced voice, Edge Canary attachment, authorized
segmented-media assembly, remote Android/tablet clients, virtual-pointer
visuals, classical ML and reinforcement-learning candidates, omnichannel
connectors, long-answer continuation and detailed telemetry are present in the
domain bundles even when the short files under `goal/` only summarize them.

The highest-risk gaps are therefore structural rather than cosmetic:

1. two different files claim to be the copy-ready execution prompt;
2. the required-reading lists do not express one canonical exhaustive order;
3. individual requirements have no stable machine-readable IDs or traceability
   to schema, implementation, test and evidence;
4. capability coverage is a category template plus three Phase 1 rows, not a
   complete target ledger;
5. the validator checks file existence and Markdown shape but not goal drift,
   unlisted files, requirement coverage or internal-link integrity; and
6. a mutable implementation continuation anchor lives inside a long-lived
   execution prompt, making that prompt stale after every completed slice.

Until these are corrected, another AI can read a valid-looking subset, miss a
requirement, or follow an obsolete continuation point while still passing the
current spec validator.

## What is already covered

The following user requirements have a canonical home and should not be
duplicated into another giant prose prompt:

| Requirement family | Canonical contract |
| --- | --- |
| First-click activation, overlays, focus, Narrator and deep UI customization | `docs/omnia-ultra/interaction/ui-shell-accessibility.md` |
| Voice input, Vietnamese/English code-switching, math/code dictation, TTS and barge-in | `docs/omnia-ultra/interaction/voice-input-and-conversation.md` |
| Jump Prompt, transcript minimap, stable anchors and artifact-range navigation | `docs/omnia-ultra/interaction/prompt-navigation-and-jump.md` |
| Copy, duplicate, branch, fork, replay, compare and merge lineage | `docs/omnia-ultra/interaction/branching-copy-fork.md` |
| Queue, steer, Btw, bulk actions, dependency-safe reorder and scheduling | `docs/omnia-ultra/interaction/queue-steer-schedule.md` |
| Full request timing, usage, throughput, quota and cost vocabulary | `docs/omnia-ultra/observability/request-usage-telemetry.md`, `cost-usage-analytics.md` |
| Retry horizon, HTTP/transport taxonomy and billing-safe repair | `docs/omnia-ultra/observability/retry-fallback-repair.md` |
| User-selected Edge Canary, privacy filters and authorized network/media capture | `docs/omnia-ultra/runtimes/browser-network-capture.md` |
| Non-physical blue/cyan virtual pointer and target-contained control | `docs/omnia-ultra/runtimes/virtual-pointer-window-control.md` |
| Persistent/isolated/hybrid/auto machines and remote web/Android/tablet viewers | `docs/omnia-ultra/runtimes/machines-headless-remote.md` |
| Telegram, Discord, Slack, Teams, Zalo, Messenger and scheduler integrations | `docs/omnia-ultra/workbenches/integrations-automation.md` |
| KNN, XGBoost, bandits, offline RL, preference learning and training scheduling | `docs/omnia-ultra/architecture/adaptive-intelligence-plane.md`, `harness/evaluations-learning-routing.md` |
| Skills, tools, MCP, plugins, personas and user-defined scopes | `docs/omnia-ultra/harness/memory-skills-tools-mcp.md` |
| Project graphs, exact file/symbol/line links and interactive atlas | `docs/omnia-ultra/project-twin/graph-and-atlas.md` |
| Learning/exam/research roadmaps, blueprints, plans and task DAGs | `docs/omnia-ultra/project-twin/roadmaps-blueprints-plans.md` |

This is a strong base. The repair should improve discoverability and
traceability instead of copying the same requirements into more prose files.

## P0: choose one canonical execution prompt

Three current statements disagree:

- `docs/omnia-ultra/00-START-HERE.md` tells the reader at lines 31-33 to hand
  off `goal/00-copy-ready-prompt.md`;
- the same file says at lines 84-86 that `delivery/99-execution-prompt.md` is
  the execution prompt intended for another AI; and
- `docs/omnia-ultra/manifest.json` sets `executionPrompt` to
  `delivery/99-execution-prompt.md`.

Both prompt files contain substantial overlapping normative prose, but they do
not contain the same details. This is a split-brain contract.

Required correction:

1. Make `goal/00-copy-ready-prompt.md` the single short handoff prompt the user
   can copy, or make `delivery/99-execution-prompt.md` the single canonical
   prompt. Do not keep two independently edited copies.
2. Point `manifest.executionPrompt`, `00-START-HERE.md`, `goal/README.md` and
   `delivery/README.md` to the same file.
3. Convert the non-canonical file into a short redirect with no duplicated
   product requirements, or generate it deterministically from the canonical
   source.
4. Add a validator rule that fails when more than one file declares
   `status: operational-prompt` for the same pack, unless one is explicitly
   marked as an alias.

## P0: move the mutable continuation anchor out of the durable goal

`delivery/99-execution-prompt.md` ends with a dated continuation anchor that
describes the next implementation slice. A completed slice immediately makes
that text stale while the rest of the prompt remains normative.

The current execution state belongs in exactly one mutable location:

- `docs/omnia-ultra/04-CURRENT-STATE-BRIDGE.md` for the pack-level handoff;
- `docs/IMPLEMENTATION_STATUS.md` for evidence-backed capability state; and
- a dated audit/evidence receipt for exact commands and host blockers.

The canonical copy-ready prompt should instruct the worker to read those files,
not embed their current contents. This keeps the goal stable and the
continuation truthful.

## P0: add an atomic requirement registry

The goal documents have document-level IDs, but individual obligations such as
first-click activation, queue cycle detection, retry billing safety or voice
barge-in do not have stable requirement IDs. The current capability matrix
cannot prove that every user requirement has an owner and evidence path.

Add a machine-readable registry, for example:

```text
docs/omnia-ultra/goal/requirements.json
docs/omnia-ultra/schemas/goal-requirements.schema.json
```

Each requirement should include at least:

```json
{
  "requirementId": "OMNIA-REQ-INTERACTION-FIRST-CLICK",
  "title": "Safe first-click activation",
  "category": "interaction",
  "canonicalSpec": "interaction/ui-shell-accessibility.md",
  "dependencies": [],
  "schemas": [],
  "securityClass": "local-ui",
  "acceptanceIds": ["OMNIA-ACC-INTERACTION-FIRST-CLICK"],
  "coverageCapabilityId": "OMNIA-CAP-INTERACTION-FIRST-CLICK",
  "sourceIntent": ["user-goal-focus-and-hover"],
  "targetStatus": "verified"
}
```

The registry must not claim current implementation status. It links target
intent to the operational coverage ledger, whose status is evidence-backed.

Minimum registry checks:

- unique requirement IDs;
- every referenced spec/schema/acceptance/capability exists;
- every normative goal bullet maps to at least one requirement ID;
- every required capability has a coverage row, even when status is `Planned`;
- every security-sensitive requirement links to a hard-boundary or approval
  contract;
- superseded requirements remain traceable instead of being deleted silently;
- requirements can be queried by product mode, runtime mode, dependency,
  security class and project phase.

## P1: make required reading canonical and exhaustive

The authoritative user execution contract requires a more precise order than
`manifest.requiredReading` currently records. The manifest omits, among other
items, the pack README, terminology, the reading protocol, roadmap,
workstreams/dependencies, capability coverage and current implementation truth.

Represent the reading protocol explicitly in the manifest rather than relying
on prose and implied `read the entire folder` behavior. A robust structure is:

```json
{
  "requiredReading": {
    "always": [],
    "beforePlanning": [],
    "beforeSecuritySensitiveWork": [],
    "beforeProviderWork": [],
    "beforeHarnessWork": [],
    "beforeSchemaChange": [],
    "beforeClaimingVerification": []
  }
}
```

The copy-ready prompt should name the required sequence and then route to all
domain bundles touched by the selected vertical slice. Multi-domain work must
read the union, not select one bundle and infer the rest.

## P1: replace the coverage template with a complete ledger

`delivery/capability-coverage.md` says to maintain one row per capability, but
the current evidence-backed table contains only three narrow Phase 1 rows.
The earlier category list is not a capability ledger and cannot expose omitted
requirements.

Create a complete machine-readable coverage file and generate the readable
Markdown table from it. Every target capability should have a row from day one:

- `Planned` with dependencies and next action when no source exists;
- `Designed` when only a contract/schema exists;
- `Implemented`, `Wired`, `Verified`, `Preview`, `Blocked`, `Release Candidate`
  or `Shipped` only under the status rules;
- exact implementation modules, schemas, tests and same-snapshot evidence when
  those exist; and
- current limitation, owner, security classification and last verified source
  snapshot.

This is the main mechanism that turns “càng nhiều tính năng càng tốt” into an
auditable completion graph instead of an unbounded feature list.

## P1: strengthen the copy-ready execution safeguards

If `goal/00-copy-ready-prompt.md` remains the handoff prompt, it should state
these currently implicit or missing execution rules directly:

- preserve all user and agent work;
- do not reset, revert, delete, stage, commit, branch, push or open a PR unless
  explicitly requested;
- continue until the current milestone's acceptance gates pass, not merely
  until one attractive slice renders;
- use independent specialist review when it materially improves quality, with
  bounded concurrency, explicit task ownership and reconciled conflicts;
- operationalize “perfect” as zero known P0/P1 defects, full evidence for the
  selected milestone and no silent data loss or authority expansion;
- do not treat a design target, catalog count or prompt statement as proof of
  implementation; and
- when blocked, leave a precise checkpoint and select another independent,
  dependency-ready slice without broadening authority.

## P1: expose advanced details through requirement links, not summary drift

The short goal summaries deliberately omit many advanced details that are
already correct in the domain bundles. Examples include:

- full 408/409/422/425/503/504 and stream/protocol retry taxonomy;
- 24-hour configurable retry horizon and exact backoff schedule;
- provider acceptance and outcome-unknown reconciliation;
- inter-token latency, stalls, quota reset and subagent/tool/media cost;
- voice TTS, barge-in, wake word and transcript/audio lineage;
- web/CLI/Android/tablet remote clients and stream quality controls;
- Edge Canary supported attachment and user-controlled ad/tracker rules;
- blue/cyan virtual pointer presentation;
- named messaging integrations;
- XGBoost, bandits, offline RL and training scheduler;
- queue dependency-cycle safety and full bulk operations; and
- exact PDF/spreadsheet/slide/media anchors.

Do not copy all of those details into every goal file. Instead, add requirement
IDs beside summary bullets and make the registry point to the canonical domain
contract. This yields detail without creating several subtly different truths.

## P1: expand durable schema coverage

The pack currently registers schemas for conversation navigation, request
telemetry, retry policy, model profiles, Project Twin, conversation library,
Project Overview, capture sessions and local models. The product goal also
requires durable contracts for areas that do not yet have registered schemas,
including:

- agent profiles, agent instances, teams, leases, mailboxes and handoffs;
- memory revisions, skill revisions, personas, tools, MCP and plugins;
- goals, roadmaps, plans, tasks, schedules and automation runs;
- artifact originals, derivatives, transforms and bridge decisions;
- machine/runtime sessions, remote devices and privileged approvals;
- provider definitions, secret references and health observations;
- adaptive datasets, feature revisions, experiments, policies and rollbacks;
- integrations, scopes, external-action receipts and channel identities; and
- self-update checkpoints, slots, migrations, health checks and rollback.

This does not mean creating all schemas at once. The requirement registry and
coverage ledger should mark them as dependency-gated planned contracts, and a
schema becomes mandatory before the corresponding durable implementation.

## P1: harden the spec validator

`tools/validate-spec.ps1` currently validates listed paths, JSON parseability,
frontmatter, unique document IDs and Markdown line count. Add checks for:

1. all discovered pack files are listed in `manifest.allFiles` and no listed
   file is duplicated;
2. one canonical execution prompt exists and every navigation file agrees;
3. relative Markdown links and schema references resolve;
4. requirement registry and coverage ledger validate against their schemas;
5. requirement/capability/acceptance IDs are unique and resolvable;
6. every planned capability has a canonical target document;
7. every security-sensitive capability links to an applicable hard boundary;
8. current-state continuation text is absent from the immutable goal prompt;
9. frontmatter version/review metadata exists on normative goal files; and
10. generated summaries are reproducible and not hand-edited drift copies.

## P2: separate feature quantity from catalog quality

The master charter sets floors of 100 agent profiles, 150 skills/workflows,
250 typed tool operations, 40 persona packs and 25 first-party integrations.
Those targets correctly reject filler, but the goal pack has no catalog
inventory or evaluation ledger.

Add catalog manifests that record purpose, non-goals, input/output schema,
permissions, side effects, model/effort, examples, failure modes, tests,
evaluation metrics, owner, version and evidence. Counts should be derived from
valid manifests; hand-written headline numbers must never count as delivery.

## P2: add explicit goal revision and supersession metadata

Most goal files have a document ID but no version, review date or supersession
relationship. Add frontmatter fields such as:

```yaml
version: 1.0.0
last_reviewed: 2026-08-14
supersedes: []
requirements_registry_revision: 1
```

Material goal edits should create a changelog/decision record and update the
registry revision. This applies the same anti-stale semantics demanded of
memory and Project Twin to the product goal itself.

## Recommended implementation order

1. Select one canonical execution prompt and remove duplicated normative text.
2. Move continuation state into `04-CURRENT-STATE-BRIDGE.md` and current-status
   evidence.
3. Add the goal-requirement schema and registry with stable IDs.
4. Create a complete capability ledger containing planned rows for the entire
   target surface.
5. Link summary bullets, acceptance gates, schemas and capability rows through
   IDs.
6. Harden `validate-spec.ps1` against prompt drift, unlisted files, broken
   links and incomplete traceability.
7. Add goal revision metadata and catalog manifests.
8. Run the validator and Project Twin refresh only after the same source/doc
   snapshot is stable.

## Acceptance criteria for closing this audit

- There is exactly one canonical copy-ready prompt.
- The user can copy that prompt and it unambiguously directs an AI to the full
  pack, current-state bridge, implementation status, security boundaries,
  route-specific bundles and evidence gates.
- Every explicit product requirement has a stable requirement ID and canonical
  contract.
- Every requirement maps to a capability row, including planned work.
- Every implemented/wired/verified row links current source, test and evidence;
  missing evidence cannot be represented as verified.
- The validator fails on prompt disagreement, broken references, unlisted pack
  files, duplicate IDs and uncovered requirements.
- Mutable continuation state is not embedded in the durable product goal.
- The resulting registry and coverage graph are projected into Project Twin so
  humans and future agents can navigate requirement -> design -> schema ->
  implementation -> test -> evidence -> status.

