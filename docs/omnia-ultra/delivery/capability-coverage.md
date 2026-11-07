---
id: OMNIA-ULTRA-DELIVERY-COVERAGE
title: Capability coverage matrix
status: operational-ledger
---

# Capability coverage

`capability-ledger.json` is the machine-readable target inventory and is the
canonical row source. It intentionally includes every broad product capability
as `planned`, `designed`, `partial` or another evidence-backed state from the
first day; the category list below is only a routing index. This Markdown file
retains the current evidence summary for humans, while future tooling may
generate its full table from the JSON ledger. A missing row is a coverage bug,
not permission to silently omit a feature.

Maintain one row per capability with:

- capability ID;
- target file;
- implementation modules;
- schema;
- tests;
- evidence;
- status;
- owner;
- dependencies;
- security classification;
- current limitation;
- next action;
- last verified source snapshot.

Required categories:

- project/workspace roots and conversation library;
- chat search/pin/archive/restore/import/export;
- long-answer continuation and restart recovery;
- conversation navigation;
- copy/branch/fork/replay/merge;
- queue/steer/schedule;
- selection/reference/annotation;
- large paste/live render/voice;
- provider/model/effort picker;
- token/cache/RPM/cost/timing;
- retry/fallback/repair;
- memory/skills/personas;
- agents/subagents/teams;
- context compiler/RAG/graph;
- goals/roadmaps/blueprints/plans;
- Project Overview/smart title/material-change refresh;
- Project Twin/atlas/evidence;
- files/artifacts/studio;
- IDE/Git/Docker/CI;
- browser/capture/virtual pointer;
- targeted window/tab/process screen/audio capture;
- machines/headless/remote;
- local model registry/runtime/evaluation;
- learning/research/science;
- integrations/automation;
- security/approval/sandbox/secrets;
- self-update;
- SDK/plugins/MCP;
- accessibility/performance.

A capability is not Verified until its ledger row points to current source,
tests and same-snapshot evidence. `targetStatus` in
`goal/requirements.json` describes the desired end state; it is never current
implementation proof.

## Core delivery map (2026-09-20)

The September 24 renderer continuation adds Project-ID-isolated permission
drafts, stale Settings-context cleanup, shared Chat menu availability and
Handoff preview package v2 with selected visible records. The later renderer
slice also stages a Plan task into an empty same-Project Chat draft, adds
an explicit Project-locked New Chat setup with that draft, adds per-record
Handoff selection (v3), and corrects permission import scope. This
improves the Phase 2/4 preview journey but does **not** change durable native
authority, permission, agent lease, provider dispatch or ledger status. See
`docs/audit/OMNIA_RENDERER_UI_CONTINUATION_2026-09-24.md` and
`docs/audit/OMNIA_PROJECT_PLAN_CHAT_HANDOFF_SELECTION_2026-09-24.md`.

The October 1 Goal/Chat continuation adds Project-scoped session drafts,
distinct preview queue/steer/side-note lanes, and a Tauri-only Saved Goals
consumer of the pre-existing native Goal bridge. The goal and queue ledger
statuses are **unchanged**: native IPC/restart verification, durable queue
ordering, scheduling, and agent execution remain open. The bounded evidence
is in `docs/audit/OMNIA_GOAL_CHAT_INTERACTION_2026-10-01.md`.

The Project Control Deck cache/context continuation now covers the local
inventory display-filter requirement from PD-CTT-01C with explicit `All`,
`Reusable`, `Invalidated`, and `Unknown` states. This remains a renderer-local
preview over redacted inventory rows: local reuse is distinct from provider
cache evidence, and invalidation rehearsal does not claim native deletion,
encryption, billing, or restart recovery. Focused evidence is recorded in
`docs/audit/OMNIA_PHASE_PLAN_PROJECT_DECK_CACHE_TELEMETRY_2026-09-29.md`.

This map is the compact bridge between the dependency-ordered roadmap and the
capability ledger. It describes what a user can inspect in the current browser
preview, what authority exists behind that surface, and what evidence is still
required before a phase can be promoted. A visible card, preview, or contract
does not promote the corresponding native capability.

| Phase | Current visible surface | Current authority/evidence state | Promotion gate | Next dependency-ready slice |
| --- | --- | --- | --- | --- |
| Phase 0 — inventory and contracts | Manifest, requirement/capability registries, schemas, status vocabulary, validators, source-ledger and Project Twin tooling | Operational spec/static checks; generated projections must be from one frozen snapshot | `validate-spec`, source-ledger check, Project Twin check, and same-snapshot receipts all pass together | Freeze writers, regenerate projections, retain one dated evidence bundle |
| Phase 1 — durable kernel | Provider text stream, run journal/usage slice, projects, workspace grants, state-revision and authoritative-root previews | Partial native/source and SQLite foundation; Rust/Tauri runtime is unverified on this host | Supported toolchain, native compile/test, close/reopen, replay, rollback, and concurrency receipts | Verify the existing kernel slices on a supported Windows CI image |
| Phase 2 — interaction foundation | Chat composer, Markdown/LaTeX, navigation, selection references, branches, run-action and move-confirmation previews | Broad renderer preview; durable UI/state transitions and native hydration remain partial or planned | Native IPC hydration plus focused interaction acceptance for each cross-surface action | Complete shared native target/cursor and run-control receipts before enabling durable actions |
| Phase 3 — context and model control | Context preflight/compiler, memory/skills, provider profiles, model router/catalog, observability and cost previews | Renderer-local projections; provider capability/usage/health evidence is bounded or unavailable | Native context-freeze receipt, operation-scoped capability probes, provider-final usage/cost and retry evidence | Bind previews to native context/provider receipts without widening unsupported claims |
| Phase 4 — planning and Project Twin | Goals/tasks, roadmap/DAG/blueprint, Project Overview refresh, Twin edge/evidence views | Renderer-local planning and graph rehearsal; generated Twin is evidence projection, not execution authority | Current graph/atlas, stale/evidence provenance, native project/task persistence and material-change receipts | Reconcile planning state with authoritative roots and regenerate Twin on the frozen snapshot |
| Phase 5 — Ultra harness | Stage Board, Agent Mesh, Harness Contract Panel, fault catalogue, workflow/automation previews | Renderer-local catalogue and rehearsal; no native spawn, lease, mailbox, or tool grant | Stable agent identity, attenuated child authority, durable leases/mailboxes, checkpoint/restart, deterministic judge | Implement the harness kernel only after authority continuity and run-journal prerequisites are verified |
| Phase 6 — file and studio | Artifact/document/media, research notebook, academic/technical workbench previews | Preview-only or synthetic data; no native file mutation, extraction, render receipt, or provider-backed media job | Artifact lineage, render/verify receipts, modality admission, and authorized transform evidence | Keep studio surfaces portable and renderer-local until artifact/native bridge receipts exist |
| Phase 7 — engineering workbench | IDE, Problems, terminal/compiler, Git/CI/CD and release-workbench previews | Synthetic renderer data; no filesystem mutation, process execution, Git commit, CI webhook, or deploy | Sandboxed process broker, workspace handle checks, Git/CI authorization, cancellation and recovery | Keep actions as rehearsal/Planned until the capability broker and native receipts are available |
| Phase 8 — browser/machine runtime | Browser, capture, virtual-pointer and machine-runtime contracts/previews | Planned/deferred; no authenticated remote machine, capture authority, or privileged desktop side effect | Typed privilege broker, target-contained pointer, capture grants, attestation, leases and emergency stop | Implement runtime authority only after security, approval, and recovery gates are verified |
| Phase 9 — research and omnichannel | Research/learning, science/CP, Workspace connectors, messaging and scheduler previews | Renderer-local research/learning projections; no connector OAuth, external action, scheduler, or inbox mutation | Source-cited research receipts, connector scope/OAuth lifecycle, reversible external-action receipts | Bind research claims to source-ledger evidence and keep integrations explicitly unavailable until authorized |
| Phase 10 — adaptive intelligence | Evaluation, data-intake, learning-loop and training-control previews | Renderer-local evaluation/review; no model training, checkpoint write, RLHF, deployment, or automatic self-modification | Consented dataset lineage, independent evaluation, drift protection, rollback and supervisor evidence | Treat every learning surface as review/planning UI until an isolated training/evaluation lane exists |
| Phase 11 — platform release | SDK/MCP/plugins, marketplace, packaging, update and accessibility/security/performance surfaces | Planned/deferred; no signed package, updater, marketplace publication, or release certification | Isolated build, signed/verified artifact, migration, standby health, rollback and certification receipts | Promote only from a named source freeze with artifact hashes and packaged Windows smoke evidence |

### Promotion rules

- `Preview` means an interactive renderer projection or deterministic rehearsal;
  it may be useful to the user but has no native authority or durable side
  effect.
- `Partial` means a bounded source/native slice exists, but one or more
  authority, runtime, recovery, or same-snapshot evidence gates remain open.
- `Implemented` means the path exists and has focused evidence; it is not a
  release or native-runtime claim by itself.
- `Verified` is reserved for a ledger row whose current source, tests,
  acceptance criterion, and same-snapshot evidence all pass. A normative
  `targetStatus` of `verified` never overrides the current ledger status.
- When the host cannot run the native toolchain, record `Native status unknown`
  or `Unverified`; do not convert a renderer/build receipt into native proof.

## Current evidence-backed Phase 1 rows

The following rows are deliberately narrow. They document the current source
snapshot and do not promote an implementation to `Verified` when the native
test executable cannot start on this host.

| Capability ID | Status | Canonical implementation | Evidence | Current limitation | Next dependency-ready action |
| --- | --- | --- | --- | --- | --- |
| OMNIA-CAP-P1-RUN-JOURNAL | Implemented / partial verification | `src-tauri/src/run_journal.rs`, `src-tauri/src/storage.rs`, `src/features/workspace/run-journal-sync.ts` | `docs/audit/NATIVE_RUN_JOURNAL_VERTICAL_SLICE.md`; focused source tests; one hash-identified direct native telemetry-read test pass in `docs/audit/NATIVE_TELEMETRY_READ_TEST_RECEIPT_2026-08-14.md` | Initial text-chat lifecycle/replay only; no full harness/tool/agent event coverage or full native suite receipt | Run the full native matrix on a supported Windows CI image and retain per-test-process receipts |
| OMNIA-CAP-P1-PROVIDER-STREAM-USAGE-LEDGER | Implemented / one bounded native read verified | `Storage::journal_usage` in `src-tauri/src/run_journal.rs`; schema `run_usage_ledger` in `docs/storage-schema.sql` | `cargo fmt --check`, `cargo check --all-targets`, and the direct pass for `storage::tests::run_telemetry_read_is_attempt_scoped_bounded_and_content_free` recorded on August 14, 2026 | Only partial non-authoritative provider-stream counters; no timing rows, final/invoice cost, quota/health or complete native telemetry replay DTO | Add attempt timing capture, broader storage/replay tests and provider-final reconciliation before widening the claim |
| OMNIA-CAP-P1-INSPECTOR-TELEMETRY | Partial native-to-renderer slice | `src/features/workspace/request-inspector-projection.ts`, native telemetry read bridge and run-journal replay sync | Projection tests, bounded direct native telemetry-read receipt and `docs/audit/NATIVE_RUN_JOURNAL_VERTICAL_SLICE.md` | The bounded usage read is available, but timing, final cost, quota/health, fallback/retry lineage and complete end-to-end UI coverage remain absent | Bind the remaining native observations to replay, then add restart, accessibility and integration coverage |
| OMNIA-CAP-JUMP-PROMPT | Partial / local domain + renderer preview | `src/domain/prompt-navigation.ts`, `src/domain/index.ts`, `src/features/workspace/conversation-navigation-model.ts`, `src/features/workspace/conversation-navigation.tsx`, `src/features/workspace/conversation-view.tsx` | `docs/audit/PROMPT_NAVIGATION_DOMAIN_SLICE_2026-09-14.md`; `docs/audit/PROMPT_NAVIGATION_RENDERER_PREVIEW_2026-09-14.md`; `src/domain/prompt-navigation.test.ts` (9 focused tests); `src/features/workspace/conversation-navigation.test.tsx` (7 focused tests) | Local message-backed resolver plus renderer conversation map/keyboard preview only; no native durable target persistence/IPC/startup hydration, global jump palette/indexed search, minimap/history/deep links, full accessibility, non-message target indexes or packaged Windows evidence | Add native durable target records/state-revision cursors and IPC hydration, then complete renderer jump-palette/minimap/history/deep-link/accessibility UX and broaden target adapters |
