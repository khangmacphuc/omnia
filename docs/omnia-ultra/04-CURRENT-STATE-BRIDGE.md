---
id: OMNIA-ULTRA-CURRENT-STATE
title: Bridge between target pack and current source
status: operational
last_reviewed: 2026-09-25
---

# Current-state bridge

Before every implementation task, inspect:

- git status --short --branch;
- docs/IMPLEMENTATION_STATUS.md;
- relevant ADRs;
- relevant source modules;
- relevant tests;
- recent build/test logs only as hints, not current evidence.

The existing repository already contains substantial foundations for:

- native kernel and Tauri desktop shell;
- provider gateway and provider catalog health;
- conversation branches and run lineage;
- immutable provider-attempt lineage and prepared dispatch proof;
- attachment storage and read-only workspace grants;
- local-first telemetry/usage ledger contracts;
- context compiler research;
- UI design tokens, typography and hit-target gates;
- visual fixtures and frontend tests;
- machine runtime research;
- threat model and security boundaries.

The native provider/run vertical slice now also has a durable journal path:
`docs/audit/NATIVE_RUN_JOURNAL_VERTICAL_SLICE.md`. It is still a bounded
implementation slice rather than a claim that the complete Ultra charter is
finished. The remaining limitations in `docs/IMPLEMENTATION_STATUS.md` remain
authoritative.

## Current continuation checkpoint

The September 24, 2026 Project/Chat renderer continuation keeps permission
drafts separate per Project, clears stale Settings Project navigation context
when native records are replaced, shares Chat action availability with the
sidebar, and exports a richer renderer-only Handoff v2 package. The precise
same-snapshot renderer checks and remaining native/bundle gaps are recorded in
`docs/audit/OMNIA_RENDERER_UI_CONTINUATION_2026-09-24.md`. This does not
promote any native policy, agent handoff, project persistence, or packaged
Windows capability.

The October 1, 2026 compact UI continuation keeps the Project Deck's next
actions visible before an explicit advanced policy/data disclosure, preserves
the Project-scoped policy draft when that disclosure is closed or tabs change,
and gives Goal Studio bounded Previous/Next navigation with stale filters
cleared. The Chat starter exposes prompt suggestions on demand; Settings
workspace snapshot metadata options are also folded behind a named control.
The current source/typecheck/focused/build/smoke receipt is
`docs/audit/OMNIA_COMPACT_UI_CONTINUATION_2026-10-01.md`. These are renderer
preview interactions; native goal scheduling, provider routing, durable
snapshot backup, and visual screenshot gates remain unverified.

The subsequent October 1 Goal/Chat interaction slice keeps Goal Studio drafts
separate per Project across Plan tab remounts, adds a Tauri-only consumer of
the existing native Goal create/list bridge, and keeps browser preview honest
about unavailable native storage. Queue, active steer preview, and Btw/Discuss
side notes are distinct but still renderer-only; Chat advanced mode settings
survive hiding their controls. The scoped test/build/smoke evidence and the
isolated default-Chat screenshot (not a Plan/native visual gate) are recorded in
`docs/audit/OMNIA_GOAL_CHAT_INTERACTION_2026-10-01.md`. Native IPC execution,
durable queue/steer, and Project Plan visual inspection remain unverified.

Project Settings now also exposes a typed metadata editor for `name`,
`description`, and `instructions`. Browser mode applies a renderer-session
preview only; a hydrated native desktop session can call the guarded
optimistic-concurrency `project_update` bridge. This editor does not create a
Project Twin revision or mutation receipt.

The later September 24 continuation stages a selected Plan task only in an
empty Chat of the same Project or opens a Project-locked New Chat dialog with
the task prefilled. Only explicit confirmation creates a Chat record; its
draft stays renderer-local. Handoff v3 selects individual Chat/grant records,
and permission import targets the declared scope. These remain partial paths;
the separate evidence and
unchanged failing aggregate bundle gate are in
`docs/audit/OMNIA_PROJECT_PLAN_CHAT_HANDOFF_SELECTION_2026-09-24.md`.

The current dependency-complete documentation work is the integrated Omnia
Ultra multimodal/routing/specialist specification snapshot. The manifest,
requirements registry, capability ledger and acceptance catalog now agree on
55 atomic requirements and 55 capability rows. The v2 multimodal envelope,
execution receipts, grounded observations, local transform toolchain,
adaptive-policy releases, routing-decision receipts and academic specialist
workflows are registered. The historical Project Twin snapshot was regenerated
from the 2026-09-11 source snapshot after the v14 static review. Exact
specification evidence is
recorded in
`docs/audit/OMNIA_ULTRA_SPEC_INTEGRATION_RECEIPT_2026-08-15.md`; the current
lineage/dispatch review is recorded in
`docs/audit/PROVIDER_ATTEMPT_LINEAGE_BOUNDARY_CONTRACT_AUDIT_2026-09-11.md`.

The native provider/run vertical slice includes schema-v14 immutable
provider-attempt lineage facts plus the schema-v20 immutable provider-definition
revision. Frozen provider input, its lineage fact, and the content-addressed
definition revision are persisted atomically. The loader reads the frozen
input, lineage, active renderer-safe profile and historical provider definition
from one SQLite read snapshot, validates scope/hash/effort provenance and
definition continuity, and returns the opaque credential-store handle only
inside native memory. The gateway builds transport from the historical
revision, still checks that the live profile is enabled and owned, and executes
a final transaction-linearized `mark_prepared_attempt_dispatching` barrier
immediately before provider HTTP work. No credential bytes, cookies, raw URLs,
prompts, response bodies, attachment bytes or local paths enter the durable
fact or renderer receipt.

The global storage source now declares schema v20. Its checked-in suffixes
cover v15 durable run-control, v16 authoritative Goal/Task/Starter Workflow
roots, v17 state-anchor guards, v18 immutable authoritative-root mutation
receipts, v19 terminal Task-dependency insertion guards, and v20 immutable
provider-definition revisions. On 2026-09-15 the
independent run-control storage and authoritative-root verifiers pass, including
file-backed reopen, rollback, idempotency, immutable/scope guards, root
receipts, dependency-cycle protection and terminal-dependency guards. The
provider-lineage verifier still reports `currentSchemaVersion: 14` because its
scope is the v14 lineage suffix; that is not the global storage version.

This is independent Python/SQL/source-contract evidence only. Because the host
does not provide `cargo`, `rustc`, `rustfmt` or `rustup`, native compile,
runtime dispatch, close/reopen, concurrency and packaged Windows evidence stay
**unavailable/unverified**; the product must remain labelled a partial,
unsigned internal/developer preview.

The current native slice is **Partial — native pre-bridge foundation**. The
trusted storage path now admits opaque attachment drafts atomically, creates
immutable binding receipts, rebuilds a deterministic source manifest, persists
a planning-only v2 bridge plan/admit-stage receipt, writes a compact journal
pointer, and blocks the text-only provider gateway when bound attachments are
present. Unknown canonical MIME values fail closed and roll back the entire
admission transaction; no durable `unclassified` artifact is created.

Provider carrier/upload, isolated local workers, specialist routing, current
capability re-evaluation, outcome-unknown reconciliation, native-to-renderer
hydration and enabled attachment send UI remain open. Source-level migration,
replay and file-backed SQLite regressions exist, but a supported Rust native
test run is still unavailable on this host, so restart evidence remains
unverified. The authoritative-root Goal, Task and Starter-Workflow paths are
source/static-complete for expected-head CAS: matching heads advance atomically,
stale heads return `stale_revision_head` without writes, exact replay preserves
the newer authoritative pointer, and a changed expected head under the same
idempotency key returns `payload_drift`. The source-present native/renderer API
also covers root create/read/list, revision reads/creates, lifecycle updates
and Task dependency create/list operations. A source-level Branch/Fork apply
path now creates a deterministic child branch and its terminal run-control
receipt inside one SQLite writer transaction, while preserving the pinned
source cursor and leaving the source branch inactive. Cargo/Rust, native IPC,
close/reopen and true multi-client concurrency remain unverified. The next
dependency-ready implementation slice is native runtime verification and
completion of run-control/state-base resolution (pause/resume/Continue,
immutable edit/retry, copy/duplicate and active-run compare), while the
multimodal provider-carrier contract remains a separate blocked track. This
checkpoint must not be read as full multimodal delivery or Chat Complete.

The prior telemetry checkpoint remains valid bounded evidence. Provider-stream
usage observations are replayed as partial and non-authoritative, and the named
content-free telemetry-read test has direct native-runtime evidence. Full
timing, quota/health, retry/fallback, final/invoice cost and the full native test
suite remain incomplete; see
`docs/audit/NATIVE_RUN_JOURNAL_VERTICAL_SLICE.md`,
`docs/audit/NATIVE_TELEMETRY_READ_TEST_RECEIPT_2026-08-14.md` and
`docs/IMPLEMENTATION_STATUS.md`.

Do not copy this checkpoint into `goal/00-copy-ready-prompt.md`. After a slice
changes, update this bridge, the implementation-status row, capability
coverage, dated evidence and Project Twin together. The next slice is chosen
from the dependency graph after verifying the current checkpoint rather than
being hard-coded into a durable product goal.

Those foundations must be reused and reconciled, not replaced by a parallel
mini-framework. When this pack proposes a richer future contract, implement it
through the existing native authority flow and update the appropriate ADR,
schema, tests and implementation-status entry.

The README's old chat-first delivery language is historical product direction.
This pack is the forward Omnia Ultra charter, while the current implementation
status remains the truth about what is actually available.
