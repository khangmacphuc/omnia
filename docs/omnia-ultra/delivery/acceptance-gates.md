---
id: OMNIA-ULTRA-DELIVERY-GATES
title: Release and capability acceptance gates
status: normative-target
version: 1.1.0
last_reviewed: 2026-08-14
---

# Acceptance gates

## Universal

- Requirement and non-goals exist.
- Typed contract exists.
- Current state is inspected.
- UI has loading/empty/success/error/unavailable states.
- Permissions are explicit.
- Tests and evidence are same-snapshot.
- Docs and Project Twin are updated.
- Known limitations are recorded.

## Interaction

- Project and workspace-root lifecycle survives restart.
- Detaching a workspace root never deletes user files.
- Rename/pin/archive/delete/restore/import/export are idempotent and recoverable.
- Search resolves an exact target or a typed stale result.
- Long-answer continuation resumes without duplicated committed sections.
- Jump target survives revision or reports stale.
- Copy/branch/fork semantics are distinct.
- Fork preserves source immutability.
- Queue ordering is durable and cycle-safe.
- Steer waits for current atomic step.
- Selection reference re-anchors safely.
- Large paste becomes a file without UI freeze.
- Markdown/LaTeX input renders without cursor loss.
- Voice has privacy indicator and transcript recovery.
- Pause/Resume/Continue expose truthful durable receipts and safe-boundary state.
- Retry state bases, immutable edits, active-run variants and compare preserve
  branch, state and attempt lineage.
- Input, output, tool and command logs preserve raw bytes while rendering a
  typed, syntax-highlighted and accessible derived view.
- Current request expands; older requests collapse.
- First-click and overlay dismissal are tested.

## Telemetry

- Exact model/provider/profile/effort captured.
- Input/output/reasoning/cache tokens are separate.
- Missing is unknown.
- Started, first byte, first visible output, last output and terminal times exist.
- Visible and total throughput denominators are explicit.
- RPM/TPM source and freshness are shown.
- Estimate/report/invoice costs remain separate.
- Retry/fallback attribution is exact.
- Outcome unknown is not auto-failure.
- Error appears inline with retry controls.

## Harness

- Agent identity is stable.
- Context transfer manifest exists.
- Child permissions are attenuated.
- Task claims use leases/epochs.
- Mailbox delivery is durable.
- Checkpoint/restart/resume works.
- Completion judge has deterministic evidence.
- Stuck/thrashing detection has tests.
- Background inspector shows live input/output/trace.

## Runtime/security

- Physical mouse is not moved by default.
- Virtual pointer is target-contained.
- Screen/audio capture is scoped to exact source generations.
- Capture grants do not imply input or broader machine authority.
- Capture indicator, privacy pause and emergency stop are tested.
- Minimized rendering limitations are truthful.
- Browser profile authentication uses supported flows.
- Capture is authorized and provenance-bound.
- Privileged actions use typed broker/UAC.
- Remote control is authenticated.
- Secrets never enter ordinary logs/context.

## Artifact/project

- Original/transformed artifacts have lineage.
- Local models retain hash, license, conversion and runtime provenance.
- Local model downloads/imports are resumable and atomic.
- PDF/Office output is rendered and inspected.
- Graph edges have evidence.
- Stale nodes are marked.
- Atlas is offline and accessible.
- Overview updates only on material change.
- User-pinned overview/title fields survive refresh and rollback.

## Update

- Build is isolated.
- Artifact is signed/verified.
- Migration is tested.
- Data snapshot exists.
- Standby slot health check passes.
- Supervisor switches safely.
- UI reconnects.
- Tasks resume.
- Rollback works.

## Atomic requirement acceptance catalog

Each registry acceptance ID resolves here exactly once. An item is eligible for
`Verified` only when its criterion, the universal gates above and its own
same-snapshot evidence all pass. A passing design review alone is not a
verification receipt.

| Acceptance ID | Requirement | Verification criterion |
| --- | --- | --- |
| OMNIA-ACC-UI-FIRST-CLICK | OMNIA-REQ-UI-FIRST-CLICK | Test first mouse/keyboard activation and focus-safe overlay dismissal without requiring a preliminary click. |
| OMNIA-ACC-UI-ACCESSIBILITY-CUSTOMIZATION | OMNIA-REQ-UI-ACCESSIBILITY-CUSTOMIZATION | Test keyboard, screen-reader semantics, scaling, pane resize, layout persistence and reset. |
| OMNIA-ACC-WORKSPACE-LIBRARY | OMNIA-REQ-WORKSPACE-LIBRARY | Test durable project/root lifecycle, recoverable removal and exact/stale search resolution. |
| OMNIA-ACC-JUMP-PROMPT | OMNIA-REQ-JUMP-PROMPT | Test navigation to a prompt, artifact and evidence target across revisions or show a typed stale result. |
| OMNIA-ACC-BRANCH-FORK-LINEAGE | OMNIA-REQ-BRANCH-FORK-LINEAGE | Test distinct copy, duplicate, branch, fork, replay, compare and merge lineage with immutable source history. |
| OMNIA-ACC-QUEUE-STEER-SCHEDULE | OMNIA-REQ-QUEUE-STEER-SCHEDULE | Test durable ordering, reorder/delete/bulk actions, safe-boundary steer, Btw and scheduled execution. |
| OMNIA-ACC-SELECTION-REFERENCE | OMNIA-REQ-SELECTION-REFERENCE | Test hover/selection reply references that re-anchor safely after source revision. |
| OMNIA-ACC-LONG-ANSWER-CONTINUATION | OMNIA-REQ-LONG-ANSWER-CONTINUATION | Test long-answer resume/recovery without duplicating committed sections. |
| OMNIA-ACC-COMPOSER-LARGE-PASTE | OMNIA-REQ-COMPOSER-LARGE-PASTE | Test threshold conversion of a large paste into a lineage-preserving file without UI freeze. |
| OMNIA-ACC-VOICE-CONVERSATION | OMNIA-REQ-VOICE-CONVERSATION | Test visible recording state, consent, transcript recovery, interruption and text fallback. |
| OMNIA-ACC-BYOK-PROVIDERS | OMNIA-REQ-BYOK-PROVIDERS | Test encrypted BYOK/custom provider setup, redaction, capability discovery and safe failure states. |
| OMNIA-ACC-MODEL-PICKER-EFFORT | OMNIA-REQ-MODEL-PICKER-EFFORT | Test live model health, model/profile/effort selection and requested-versus-effective attempt display. |
| OMNIA-ACC-RUN-JOURNAL | OMNIA-REQ-RUN-JOURNAL | Test ordered durable event replay, cursor recovery and idempotent continuation after restart. |
| OMNIA-ACC-REQUEST-TELEMETRY | OMNIA-REQ-REQUEST-TELEMETRY | Test attempt timing, token and quota observation with missing values represented as unknown. |
| OMNIA-ACC-USAGE-COST-LEDGER | OMNIA-REQ-USAGE-COST-LEDGER | Test append-only input/output/reasoning/cache/cost facts and distinct estimate/report/invoice authority. |
| OMNIA-ACC-RETRY-FALLBACK-RECOVERY | OMNIA-REQ-RETRY-FALLBACK-RECOVERY | Test typed retry/fallback/repair, Retry-After handling and non-destructive outcome-unknown recovery. |
| OMNIA-ACC-CONTEXT-COMPILER | OMNIA-REQ-CONTEXT-COMPILER | Test inspectable segment selection, source/citation provenance and loss-in-the-middle mitigation decisions. |
| OMNIA-ACC-MEMORY-SKILLS-PERSONAS | OMNIA-REQ-MEMORY-SKILLS-PERSONAS | Test versioned scopes, provenance, supersession/delete behavior and attenuated tool/MCP grants. |
| OMNIA-ACC-AGENT-SWARM | OMNIA-REQ-AGENT-SWARM | Test durable agent identity, leases, mailboxes, child permission attenuation and background inspection. |
| OMNIA-ACC-PROMPT-INTELLIGENCE | OMNIA-REQ-PROMPT-INTELLIGENCE | Test reversible prompt enhancement, workshop discussion, suggestions and explicit final insertion. |
| OMNIA-ACC-PROJECT-TWIN | OMNIA-REQ-PROJECT-TWIN | Test a generated graph/atlas with source evidence, stale status and accessible multi-format output. |
| OMNIA-ACC-GOAL-ROADMAP-PLAN | OMNIA-REQ-GOAL-ROADMAP-PLAN | Test durable goal-to-task DAG, roadmap/blueprint artifacts and material-change-aware overview refresh. |
| OMNIA-ACC-FILE-ARTIFACT-BRIDGE | OMNIA-REQ-FILE-ARTIFACT-BRIDGE | Test original/derivative lineage, approved transforms, capability bridge provenance and in-app preview states. |
| OMNIA-ACC-IDE-GIT-DEVOPS | OMNIA-REQ-IDE-GIT-DEVOPS | Test previewable IDE/Git/Docker/CI actions, approvals, commit hooks and coverage-aware test evidence. |
| OMNIA-ACC-LOCAL-MODEL-LAB | OMNIA-REQ-LOCAL-MODEL-LAB | Test resumable approved model import/download, license/hash checks, resource planning and benchmark receipts. |
| OMNIA-ACC-BROWSER-CAPTURE | OMNIA-REQ-BROWSER-CAPTURE | Test explicit browser/session grants, redacted authorized capture, provenance and policy-bound network controls. |
| OMNIA-ACC-VIRTUAL-POINTER | OMNIA-REQ-VIRTUAL-POINTER | Test target-contained virtual pointer, visible presence, takeover, non-focus behavior and truthful minimized limitations. |
| OMNIA-ACC-MACHINE-REMOTE | OMNIA-REQ-MACHINE-REMOTE | Test authenticated paired remote control, runtime selection, isolated/persistent recovery and quality/FPS controls. |
| OMNIA-ACC-APPROVAL-SANDBOX | OMNIA-REQ-APPROVAL-SANDBOX | Test typed least-privilege grants, UAC-visible escalation, expiry, sandboxing, secret isolation and audit. |
| OMNIA-ACC-INTEGRATIONS-AUTOMATION | OMNIA-REQ-INTEGRATIONS-AUTOMATION | Test connector scope approval, OAuth lifecycle, scheduler trigger and reversible external-action receipt. |
| OMNIA-ACC-RESEARCH-LEARNING | OMNIA-REQ-RESEARCH-LEARNING | Test source-cited deep research, atomic explanation, exercises, proofs, gaps and study-plan workflows. |
| OMNIA-ACC-ADAPTIVE-INTELLIGENCE | OMNIA-REQ-ADAPTIVE-INTELLIGENCE | Test consented dataset lineage, baseline/shadow/A-B evaluation, drift protection and rollback. |
| OMNIA-ACC-SELF-UPDATE | OMNIA-REQ-SELF-UPDATE | Test isolated build, signed staging, migration, health check, resumable switch and rollback. |
| OMNIA-ACC-DELIVERY-EVIDENCE | OMNIA-REQ-DELIVERY-EVIDENCE | Test modular source, validation gates, same-snapshot receipts and regenerated Project Twin evidence. |
| OMNIA-ACC-CLIENT-PROVIDER-CACHE | OMNIA-REQ-CLIENT-PROVIDER-CACHE | Test encrypted local reuse, invalidation, provider-adapter cache proof and no local-to-provider cache mislabeling. |
| OMNIA-ACC-MAIN-SUBAGENT-MODEL-ROUTING | OMNIA-REQ-MAIN-SUBAGENT-MODEL-ROUTING | Test scoped main/subagent precedence, frozen route decisions, fallback and evaluated Auto audit trail. |
| OMNIA-ACC-CONTEXT-DELIVERY-COMPACTION | OMNIA-REQ-CONTEXT-DELIVERY-COMPACTION | Test full/partial/auto manifests, survival policy, immutable checkpoint and fidelity-gated compaction. |
| OMNIA-ACC-TELEMETRY-TIMESERIES | OMNIA-REQ-TELEMETRY-TIMESERIES | Test exact metric units, preset/custom windows, anchor resolution, coverage/freshness and analytics calculations. |
| OMNIA-ACC-SAFE-ADAPTIVE-OBSERVATION | OMNIA-REQ-SAFE-ADAPTIVE-OBSERVATION | Test opt-in classified events, secret exclusion, retention/export/delete and separated training/deployment consent. |
| OMNIA-ACC-LOCAL-MODEL-PARITY | OMNIA-REQ-LOCAL-MODEL-PARITY | Test hardware-aware role portfolio and evidence-backed parity matrix without unsupported replacement claims. |
| OMNIA-ACC-RUN-CONTROL-EDIT-RETRY-STATE | OMNIA-REQ-RUN-CONTROL-EDIT-RETRY-STATE | Test pause/resume/Continue, immutable edits and state-base-specific retry/fork/compare behavior. |
| OMNIA-ACC-STATE-REVISION-CAS | OMNIA-REQ-STATE-REVISION-CAS | Test fixed-watermark state reconstruction, accepted/candidate separation, stale-head rejection, branch isolation and two-client CAS convergence. |
| OMNIA-ACC-RUN-CHECKPOINT-RESUME | OMNIA-REQ-RUN-CHECKPOINT-RESUME | Test truthful pause dispositions, checkpoint integrity, restart-safe resume, policy/lease drift and unknown-effect reconciliation. |
| OMNIA-ACC-CONTINUE-WITHOUT-PROMPT | OMNIA-REQ-CONTINUE-WITHOUT-PROMPT | Test typed no-text Continue after output, from pause and in an empty chat with preview, authority, budget and no-progress guards. |
| OMNIA-ACC-PROMPT-REVISION-STATE-RETRY | OMNIA-REQ-PROMPT-REVISION-STATE-RETRY | Test immutable edits, all four retry bases, snapshot timing, A-retry to B-current-state visibility and duplicate-billing safety. |
| OMNIA-ACC-ACTIVE-RUN-VARIANTS-COMPARE | OMNIA-REQ-ACTIVE-RUN-VARIANTS-COMPARE | Test active-run source-output choices, copy/duplicate/branch/fork, pinned N-way compare, conflicts, promotion and rollback. |
| OMNIA-ACC-STRUCTURED-IO-LOG-RENDERING | OMNIA-REQ-STRUCTURED-IO-LOG-RENDERING | Test raw-source fidelity, stream-safe detection/highlighting, ANSI sanitization, virtualization, copy/export and accessible fallback. |
| OMNIA-ACC-AUTHORITY-CONTINUITY-REPLAY | OMNIA-REQ-AUTHORITY-CONTINUITY-REPLAY | Test fresh pre-dispatch authority evaluation, expiry/revocation, no secret/grant/session inheritance and no automatic replay after outcome-unknown. |
| OMNIA-ACC-GENERATIVE-MEDIA-ENDPOINTS | OMNIA-REQ-GENERATIVE-MEDIA-ENDPOINTS | Test modality discovery, async image/video jobs, restart/cancel/retry, parameter/cost truth, artifact provenance and authorized image/video/PDF watermark cleanup. |
| OMNIA-ACC-UNIVERSAL-PROVIDER-PROTOCOLS | OMNIA-REQ-UNIVERSAL-PROVIDER-PROTOCOLS | Test operation/model/version-specific capability probes, request translation, effective parameter receipts, streaming/job lifecycle, errors, usage and no false compatibility across OpenAI, Anthropic, Gemini, local and custom adapters. |
| OMNIA-ACC-LOCAL-MODEL-CATALOG-TUNING | OMNIA-REQ-LOCAL-MODEL-CATALOG-TUNING | Test federated search/sort/filter/compare, deterministic pagination, license/gating/hash verification, resumable revision-pinned download, measured hardware fit, runtime translation and requested-versus-effective tuning provenance. |
| OMNIA-ACC-MULTIMODAL-CAPABILITY-BRIDGE | OMNIA-REQ-MULTIMODAL-CAPABILITY-BRIDGE | Test direct-native, local, specialist, hybrid and human-review routes for image/PDF/Office/audio/video/archive/scientific inputs with immutable originals, exact selectors/citations, fidelity gates, privacy controls, prompt-injection isolation, crash recovery and truthful unsupported states. |
| OMNIA-ACC-SPECIALIST-AGENT-PERSONA-CATALOG | OMNIA-REQ-SPECIALIST-AGENT-PERSONA-CATALOG | Test schema-valid non-filler role/persona inventory, deterministic validator output, canonical/differentiation hash integrity, duplicate-content rejection, lifecycle-aware counts and alias/evidence policy; replayable catalog/profile/persona revisions and redacted resolution receipts after disablement/supersession; typed role I/O, budgets, failure/stop/escalation/handoff contracts; persona-without-authority; authority-attenuated team resolution; conflict evidence; role-specific evaluations; and accessible searchable/filterable truthful-availability UI. |
| OMNIA-ACC-LOCAL-MULTIMODAL-TOOLCHAIN | OMNIA-REQ-LOCAL-MULTIMODAL-TOOLCHAIN | Test byte-sniffed admission, archive and decompression-bomb limits, isolated read-only local transforms, canonical coordinate closure, resource admission, fidelity/degradation receipts, restart idempotency, outcome-unknown reconciliation and no credential/network inheritance. |
| OMNIA-ACC-ACADEMIC-SPECIALIST-WORKFLOW | OMNIA-REQ-ACADEMIC-SPECIALIST-WORKFLOW | Test schema-valid typed work units and role assignments for learning, research, competitive programming, mathematics, physics/science, software, AI/data, engineering and defensive cyber education, including source/selector handoff, rubric evidence, accessible UI and replayable workflow lineage. |
