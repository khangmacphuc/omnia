# Omnia documentation

This directory contains the normative product and engineering contracts for Omnia. The project is in its foundation stage, so these documents intentionally describe both the current contract and the acceptance gates for work that has not shipped yet.

For the implemented-feature inventory, the current unsigned internal-preview lane, developer setup, test commands, and explicit limitations as of September 14, 2026, start with the repository-level [`README.md`](../README.md) and [`IMPLEMENTATION_STATUS.md`](IMPLEMENTATION_STATUS.md). Exact release provenance and packaged-smoke evidence is recorded under `artifacts/`; this directory focuses on normative contracts rather than claiming that every specified capability has shipped.

## Start here

1. Read [`IMPLEMENTATION_STATUS.md`](IMPLEMENTATION_STATUS.md) to see what is implemented, partial, preview-only, planned, or deferred in the current tree.
2. Read [`PRODUCT_SPEC.md`](PRODUCT_SPEC.md) for product scope, the Chat Complete boundary, feature priorities, domain concepts, quality gates, and phased delivery.
3. Read [`HARNESS_ARCHITECTURE.md`](HARNESS_ARCHITECTURE.md) before implementing the run pipeline, desktop protocol, provider adapters, context compilation, memory, skills, recovery, or evaluation.
4. Open [`project-twin/README.md`](project-twin/README.md) for the current evidence-linked graph, source hashes, and offline atlas. The generated projection is a snapshot of the tree, not a replacement for the normative contracts under [`omnia-ultra/project-twin/`](omnia-ultra/project-twin/).
5. Read [`omnia-ultra/architecture/runtime-composition-and-lifecycle.md`](omnia-ultra/architecture/runtime-composition-and-lifecycle.md) before changing the renderer/native lifecycle, app-state snapshots, transfer bundles, settings persistence, downloads/content, isolated input, workspace indexing, scheduler/automation, plugins, or feature flags. It is the current implementation boundary and does not promote source scaffolding to packaged-runtime evidence.
6. Read [`CONTEXT_COMPILER_ARCHITECTURE.md`](CONTEXT_COMPILER_ARCHITECTURE.md) before implementing native context basis capture, branch-history selection, retrieval/memory/skill injection, compaction, lost-in-the-middle mitigation, context snapshots, or prepared-input binding. This is a proposed implementation plan, not evidence that the production compiler has shipped.
7. Read [`research/OMNIA_HARNESS_BENCHMARKS.md`](research/OMNIA_HARNESS_BENCHMARKS.md) for the cross-product comparison, clean-room adoption decisions, evidence levels, and dependency-ordered harness backlog; use [`research/HARNESS_EVIDENCE_REFRESH_2026-09-24.md`](research/HARNESS_EVIDENCE_REFRESH_2026-09-24.md) for the latest local upstream revision register and delta notes; use [`research/OFFICIAL_UI_REFERENCE_REFRESH.md`](research/OFFICIAL_UI_REFERENCE_REFRESH.md) for the official Codex/Claude Code UI hierarchy, agent-attention, composer, prompt-suggestion, side-question, icon, and visual-gate refresh; use [`research/OPENHANDS_OFFICIAL_HARNESS_RESEARCH.md`](research/OPENHANDS_OFFICIAL_HARNESS_RESEARCH.md) for the pinned Agent Canvas and Software Agent SDK review, and [`research/CONTINUE_AIDER_OPENCODE_HARNESS_RESEARCH.md`](research/CONTINUE_AIDER_OPENCODE_HARNESS_RESEARCH.md) for the pinned coding-harness review. These are informative research, not a shipped-capability inventory.
8. Read [`research/LEARNING_HARNESS_EVALUATION_PLAN.md`](research/LEARNING_HARNESS_EVALUATION_PLAN.md) before implementing learning, tutoring, deep research, citation, long-context, memory-quality, or adaptive-routing evaluations. It defines fixtures, graders, benchmark suites, replay/ablation methods, and stop-ship gates; it does not claim those suites are implemented.
9. Read [`PROVIDER_ARCHITECTURE.md`](PROVIDER_ARCHITECTURE.md) before implementing BYOK onboarding, model discovery, capability/parameter schemas, native or compatible adapters, provider streaming, retries, routing, or fallback.
10. Read [`PROVIDER_MULTIMODAL_DESIGN.md`](PROVIDER_MULTIMODAL_DESIGN.md) before implementing attachment-to-provider dispatch, provider uploads, image/audio/document translation, or transformed attachment input.
11. Read [`PROVIDER_FAULT_HARNESS.md`](PROVIDER_FAULT_HARNESS.md) before adding provider-stream fault fixtures, transport checkpoints, cancellation/ambiguity scenarios, seeded fragmentation, or journal/projection fault assertions. It describes test infrastructure and required gates, not complete provider E2E evidence.
12. Read [`ui/product-ui-spec.md`](ui/product-ui-spec.md) for the Windows desktop information architecture and interaction model.
13. Read [`security-storage-architecture.md`](security-storage-architecture.md) before implementing credentials, persistence, filesystem access, imports/exports, memory, skills, provider networking, or later agent capabilities.
14. Read [`THREAT_MODEL.md`](THREAT_MODEL.md) before adding any IPC, capability, approval, execution environment, browser/capture path, remote client, privileged operation, skill/plugin runtime, or learned orchestration policy.
15. Read [`research/windows-runtime/README.md`](research/windows-runtime/README.md) before implementing virtual pointers, unfocused/minimized window automation, browser CDP attachment, Windows Graphics Capture, virtual-display providers, or offscreen computer use. This folder is informative research and proposed contracts; it does not claim those capabilities have shipped.
16. Use [`ui/component-contracts.md`](ui/component-contracts.md) and [`ui/phase-1-acceptance.md`](ui/phase-1-acceptance.md) when building or reviewing UI behavior.
17. Treat [`storage-schema.sql`](storage-schema.sql) as the executable starter persistence contract and run [`validate_storage_schema.py`](validate_storage_schema.py) after schema changes.
18. Read [`QA_STRATEGY.md`](QA_STRATEGY.md) for test layers, CI lanes, hostile-input and fault matrices, release evidence, and phase exit gates.
19. Read [`adr/0001-desktop-runtime-and-core-boundary.md`](adr/0001-desktop-runtime-and-core-boundary.md) for the accepted Tauri/runtime trust boundary and required future sidecar transition.
20. Read [`adr/0005-local-first-telemetry-and-usage-ledger.md`](adr/0005-local-first-telemetry-and-usage-ledger.md) before adding usage/cost persistence, provider-health dashboards, RPM/TPM projections, OpenTelemetry export, or tool/subagent efficiency metrics. The ADR is an accepted contract; native persistence and production UI remain incomplete.
21. Read [`OBSERVABILITY_PROJECT_CHAT_CONTRACT.md`](OBSERVABILITY_PROJECT_CHAT_CONTRACT.md) for the proposed Project/Chat observability contract: scope lineage, status truthfulness, run/attempt inspection, usage/cost/timing/provider-health projections, receipts, export/retention, and the UI-first O1-O5 delivery slices. It is a delivery contract and does not claim that native observability is complete.
22. Read [`FRONTEND_MODULARIZATION_PLAN.md`](FRONTEND_MODULARIZATION_PLAN.md) before adding or reorganizing renderer features, frontend state, native-client call sites, activity navigation, feature CSS, or code splitting. This is a proposed migration plan, not evidence that the target module layout has shipped.
23. Read the complete [`adr/`](adr/) index before changing the trust boundary, execution capabilities, attachment ownership, run journal, machine runtime, multimodal admission, state revisions, or run-control authority. ADRs are numbered by decision lineage; note that two distinct decisions currently use the `0005` prefix and must be referenced by their full filename.
24. Use [`qa/DEFINITION_OF_DONE.md`](qa/DEFINITION_OF_DONE.md) for the minimum scope, state coverage, provenance, accessibility, same-snapshot evidence, and documentation checklist before promoting a feature slice to `Implemented` or `Verified`.

## Document map

| Document | Audience | Covers |
|---|---|---|
| [`PRODUCT_SPEC.md`](PRODUCT_SPEC.md) | Product, design, engineering, QA | Product thesis, P0/P1/P2 requirements, provider/BYOK behavior, projects, attachments, memory, skills, harness, phases, SLOs, and release gates |
| [`IMPLEMENTATION_STATUS.md`](IMPLEMENTATION_STATUS.md) | Everyone | Current capability/evidence matrix and explicit limits separating working desktop paths from previews and plans |
| [`HARNESS_ARCHITECTURE.md`](HARNESS_ARCHITECTURE.md) | Harness, provider, storage, and desktop engineering | Commands/events, state machines, immutable snapshots, streaming, provider SPI, context budgeting, tool policy, memory, skills, recovery, replay, and evaluation invariants |
| [`OBSERVABILITY_PROJECT_CHAT_CONTRACT.md`](OBSERVABILITY_PROJECT_CHAT_CONTRACT.md) | Product, frontend, native, telemetry, security, and QA engineering | Proposed Project/Chat observability surfaces, truthful status vocabulary, run/attempt lineage, timing, usage/cost, provider health, receipts, exports, and UI-first delivery slices |
| [`CONTEXT_COMPILER_ARCHITECTURE.md`](CONTEXT_COMPILER_ARCHITECTURE.md) | Kernel, storage, retrieval, memory, skills, provider, UI, and QA engineering | Current compiler audit, native basis/freeze pipeline, authority and supersession, branch history, retrieval funnel, budgeting, compaction, lost-in-the-middle strategy, provider serialization, storage target, telemetry, and deterministic gates |
| [`research/OMNIA_HARNESS_BENCHMARKS.md`](research/OMNIA_HARNESS_BENCHMARKS.md) | Product architecture, harness, security, UI, and QA engineering | Codex/Claude Code/OpenHands comparison, provenance boundaries, adopt/adapt/defer/reject matrix, ecosystem research register, build backlog, and release scorecard |
| [`research/OFFICIAL_UI_REFERENCE_REFRESH.md`](research/OFFICIAL_UI_REFERENCE_REFRESH.md) | Product design, frontend, harness, agent-runtime, accessibility, and visual QA engineering | Current official Codex and Claude Code UI evidence; clean-room visual hierarchy, agent-attention lists, plans/tools, composer-adjacent controls, prompt suggestions, side questions, Omnia component mapping, icon direction, and deterministic gates |
| [`research/OPENHANDS_OFFICIAL_HARNESS_RESEARCH.md`](research/OPENHANDS_OFFICIAL_HARNESS_RESEARCH.md) | Kernel, runtime, environment, context, tools, agents, browser, telemetry, security, UI, and QA engineering | Pinned official Agent Canvas and Software Agent SDK review; frontend/backend/workspace boundaries, event trees, condensation, context atomicity, crash recovery, leases, resource locks, goals, workflows, memory/skills, telemetry privacy, browser policy, UI observations, implementation slices, and deterministic regression contracts |
| [`research/CONTINUE_AIDER_OPENCODE_HARNESS_RESEARCH.md`](research/CONTINUE_AIDER_OPENCODE_HARNESS_RESEARCH.md) | Coding harness, IDE, retrieval, policy, extensions, provider, and QA engineering | Pinned Continue/Aider/OpenCode source review; model-task roles, plan/build profiles, repository maps, typed edits, validators, permissions, agents, MCP/skills/plugins/LSP, sessions, implementation slices, and denial tests |
| [`research/LEARNING_HARNESS_EVALUATION_PLAN.md`](research/LEARNING_HARNESS_EVALUATION_PLAN.md) | Learning, research, harness, evaluation, telemetry, and QA engineering | Frozen evaluation manifests, fixture format, learning/research benchmark suites, citation and long-context tests, memory lifecycle, graders, replay, ablations, adaptive-routing evaluation, and stop-ship gates |
| [`PROVIDER_ARCHITECTURE.md`](PROVIDER_ARCHITECTURE.md) | Provider, harness, native-core, security, and QA engineering | BYOK profiles, adapter families/SPI, canonical wire-neutral input/events, capability discovery, advanced parameters, tool translation, routing/retry/fallback, custom manifests, and conformance |
| [`PROVIDER_MULTIMODAL_DESIGN.md`](PROVIDER_MULTIMODAL_DESIGN.md) | Provider, content, storage, harness, security, and QA engineering | Native-owned attachment selection, frozen multimodal input, capability/size checks, adapter translation, provider-upload lifecycle, telemetry, and conformance gates |
| [`PROVIDER_FAULT_HARNESS.md`](PROVIDER_FAULT_HARNESS.md) | Provider, harness, native-core, storage, security, and QA engineering | Deterministic local mock-provider transport, scripted byte/checkpoint faults, stable fault catalogue, lifecycle/journal assertions, seeded fragmentation, canary policy, and integration gates |
| [`ui/README.md`](ui/README.md) | Everyone working on the desktop experience | UI document index and experience thesis |
| [`ui/product-ui-spec.md`](ui/product-ui-spec.md) | Product design and frontend engineering | Navigation, screen anatomy, workflows, states, responsive behavior, accessibility, and future-compatible shell behavior |
| [`ui/component-contracts.md`](ui/component-contracts.md) | Frontend and domain engineering | Implementation-facing component inputs, states, events, and invariants |
| [`ui/design-tokens.json`](ui/design-tokens.json) | Design and frontend engineering | Semantic light/dark/system colors, typography, sizing, elevation, motion, and layout values |
| [`ui/phase-1-acceptance.md`](ui/phase-1-acceptance.md) | Engineering and QA | Testable UI acceptance checklist, including keyboard, scaling, failure, empty, and recovery states |
| [`security-storage-architecture.md`](security-storage-architecture.md) | Native/core, provider, storage, and security engineering | Trust boundaries, IPC, secrets, SQLite, encrypted blobs, provider egress, memory/skill safety, backup, deletion, migration, and recovery |
| [`THREAT_MODEL.md`](THREAT_MODEL.md) | Kernel, security, desktop, execution, browser, remote, provider, storage, and QA engineering | Complete-system assets, adversaries, trust zones, abuse cases, capability/approval invariants, environment policy, threat register, and enablement gates |
| [`research/windows-runtime/README.md`](research/windows-runtime/README.md) | Windows runtime, browser, computer-use, security, and QA engineering | Virtual pointer contract, semantic/native/browser transport selection, minimized/offscreen capture limits, virtual-display/VM fallback, CDP attachment, proof receipts, and denial/test matrix |
| [`storage-schema.sql`](storage-schema.sql) | Storage engineering | Phase 1 SQLite tables, relationships, indexes, triggers, and invariants |
| [`validate_storage_schema.py`](validate_storage_schema.py) | Storage engineering and CI | Fast in-memory validation of the checked-in schema |
| [`QA_STRATEGY.md`](QA_STRATEGY.md) | Engineering, QA, security, accessibility, and release owners | Executable test architecture, evidence levels, phase gates, release lanes, and stop-ship policy |
| [`qa/DEFINITION_OF_DONE.md`](qa/DEFINITION_OF_DONE.md) | All feature owners and reviewers | Repository-specific completion checklist for scope, state coverage, provenance, accessibility, same-snapshot evidence, and documentation updates |
| [`FRONTEND_MODULARIZATION_PLAN.md`](FRONTEND_MODULARIZATION_PLAN.md) | Frontend, application, desktop-client, design-system, performance, and QA engineering | Current coupling audit, target dependency graph, state ownership, application ports, feature boundaries, file move manifest, phased migration, bundle strategy, and refactor exit gates |
| [`adr/0001-desktop-runtime-and-core-boundary.md`](adr/0001-desktop-runtime-and-core-boundary.md) | Desktop, harness, native-core, and security engineering | Accepted Tauri runtime, renderer trust boundary, versioned core handshake, chat-only capability gate, and future sidecar requirement |
| [`adr/0002-unified-kernel-execution-and-capabilities.md`](adr/0002-unified-kernel-execution-and-capabilities.md) | Kernel, policy, execution, security, and future agent engineering | Unified capability broker, approvals, audit, and one execution model across chat, research, coding, browser, computer use, and later machine surfaces |
| [`adr/0003-attachment-draft-ownership-and-atomic-bind.md`](adr/0003-attachment-draft-ownership-and-atomic-bind.md) | Storage, desktop, harness, provider, and security engineering | Durable attachment drafts, native ownership, atomic message binding, and restart-safe selection semantics |
| [`adr/0004-durable-run-event-journal-and-cursor-replay.md`](adr/0004-durable-run-event-journal-and-cursor-replay.md) | Kernel, storage, desktop protocol, provider, and observability engineering | Append-only run facts, cursor replay, reconnect/restart recovery, and terminal-event invariants |
| [`adr/0005-local-first-telemetry-and-usage-ledger.md`](adr/0005-local-first-telemetry-and-usage-ledger.md) | Kernel, provider, storage, observability, privacy, UI, and QA engineering | Local-first redacted telemetry, append-only usage/cost provenance, attempt timing, provider health/quota windows, harness operation spans, bounded metric cardinality, and migration/fault gates |
| [`adr/0005-persistent-isolated-and-auto-machine-runtime.md`](adr/0005-persistent-isolated-and-auto-machine-runtime.md) | Kernel, security, storage, Windows runtime, and remote-runtime engineering | Proposed `Auto`, `Persistent`, `Isolated`, and `Remote` machine modes, capability attenuation, lifecycle, reconnect, and explicit non-bypass boundaries; no shipped machine-capability claim |
| [`adr/0006-native-multimodal-bridge-admission-authority.md`](adr/0006-native-multimodal-bridge-admission-authority.md) | Storage, attachment, bridge, provider, security, and desktop engineering | Native attachment admission, frozen multimodal input, carrier planning, transform provenance, and provider-delivery gates; provider delivery remains partial |
| [`adr/0007-state-revision-graph-and-branch-head-cas.md`](adr/0007-state-revision-graph-and-branch-head-cas.md) | Kernel, storage, run-control, recovery, security, and desktop engineering | Immutable state-revision facts, fixed-watermark state bases, accepted-head CAS, idempotency, conflict outcomes, and recovery/replay gates; the dated v11/v12 ADR snapshot and later v13/v14 source evidence remain partial and unverified at the native-runtime boundary |
| [`adr/0008-run-control-multi-stream-cursor-authority.md`](adr/0008-run-control-multi-stream-cursor-authority.md) | Kernel, storage, desktop protocol, recovery, and harness engineering | Typed authority for branch/run cursors, journal provenance, fixed-watermark validation, replay lineage, and explicit unsupported-stream outcomes; source contract is present but ADR acceptance/runtime evidence remain separate gates |

Additional architecture decisions should be added under `docs/adr/` using stable numeric filenames once the runtime and subsystem choices are accepted. Research notes are informative; accepted ADRs and the contracts above are normative.

## Source-of-truth rules

Documents have different responsibilities rather than competing authority:

1. **Current implemented/partial/planned status:** `IMPLEMENTATION_STATUS.md`, derived from the current source and evidence.
2. **Product scope and release boundary:** `PRODUCT_SPEC.md`.
3. **User-visible behavior and accessibility:** UI specification and acceptance criteria.
4. **Security, privacy, storage, and trust-boundary behavior:** `security-storage-architecture.md`.
5. **Cross-surface threats, security invariants, and capability enablement gates:** `THREAT_MODEL.md`, constrained by accepted ADRs and expanding the security/storage architecture.
6. **Run lifecycle, desktop protocol, provider, context, memory, skill, and evaluation semantics:** `HARNESS_ARCHITECTURE.md`.
7. **Provider/BYOK specialization:** `PROVIDER_ARCHITECTURE.md`, constrained by the harness and security/storage architectures.
8. **Provider multimodal specialization:** `PROVIDER_MULTIMODAL_DESIGN.md`, constrained by the provider, harness, security/storage, and threat-model contracts.
9. **Persisted relational shape:** `storage-schema.sql`, constrained by the security/storage and harness architectures.
10. **Accepted technical implementation choices:** ADRs.
11. **Implementation details:** source code and tests, which must conform to the documents above.

If two normative documents genuinely conflict, do not choose whichever is easiest to implement. Record the conflict, resolve it with the owners of both concerns, update every affected document, and add an ADR when the decision changes architecture.

## Status language

Use these labels consistently so requirements are not mistaken for shipped features:

- **Proposed:** a design awaiting an accepted architecture decision or implementation validation.
- **Accepted:** a normative contract approved for implementation.
- **In progress:** implementation exists but has not passed the documented gate.
- **Implemented:** the path works in the current tree and has automated coverage.
- **Verified:** it has passed the applicable acceptance, reliability, security, and packaging evidence.
- **Deferred:** intentionally outside the current product boundary.

Feature lists in a specification mean “required by the named phase,” not “already available.”

## Updating documentation

Every material feature change should update the smallest authoritative set of artifacts:

- product behavior or scope change → product specification and phase gate;
- user-visible state or workflow change → UI spec, component contract, and acceptance checklist;
- new persisted concept → domain contract, schema, migration/recovery tests, and security architecture when sensitive;
- provider capability or run-pipeline change → provider/harness contract and conformance tests;
- trust-boundary or permission change → threat model/security architecture and denial-path tests;
- accepted runtime, library, protocol, or subsystem choice → ADR;
- changed developer command or repository layout → root `README.md`.

Keep examples secret-free and provider-neutral. Never paste real API keys, personal workspace paths, full private prompts, signed URLs, or unredacted provider payloads into documentation or fixtures.

## Storage schema check

From the repository root:

```powershell
python .\docs\validate_storage_schema.py
```

The command uses an in-memory SQLite database and does not modify the workspace.

## Definition of documented

A capability is adequately documented when a contributor can determine:

- what the user can do and what is explicitly unavailable;
- success, loading, streaming, empty, cancellation, offline, denied, partial, and recovery behavior;
- the persisted objects and provenance required to reproduce it;
- the provider capability and unsupported-state behavior;
- its trust boundary, permissions, secret treatment, and deletion consequences;
- accessibility and keyboard behavior;
- automated and manual evidence required for its phase exit gate.\n