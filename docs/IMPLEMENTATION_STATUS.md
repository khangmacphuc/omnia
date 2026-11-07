# Omnia implementation status

Snapshot date: November 2, 2026
Source label: Omnia 0.1.0 — Phase 1 Provider Preview  
Artifact class: Unsigned internal/developer preview  
Target: Windows 11 desktop application

This is the authoritative inventory of what the current tree implements at the
latest frozen working-tree snapshot. Product and architecture documents describe
required end states; this file separates working paths from partial integration
and planned work. Historical verification observations retain their original
dates and are not current-snapshot or full-suite proof. Update this file when a
capability crosses an evidence level defined in [`QA_STRATEGY.md`](QA_STRATEGY.md).

## November 3, 2026 Omnia Sovereign Ecosystem, DOM Optimization & AST Code Graph

- **Authoritative Base Commit:** 7857772 (`feat(browser): optimize DOM token consumption with viewport boundary pruning, scoped CSS selector target, and inline visual screenshot`).
- **Working Tree Health:** Git status clean, zero compiler warnings or errors, 100% test pass rate.
- **DOM Token Consumption Optimization:**
  - Implemented `isInViewport` bounding-rect pruning in `snapshot.js`, eliminating off-screen and clipped DOM nodes from serialization.
  - Added CSS selector targeting (`selector: Option<String>`) and node traversal limits (`max_nodes: Option<usize>`).
  - Added inline visual screenshot capture (`capture_screenshot: bool`) returning `Block::Image` alongside the compact accessibility tree for multimodal grounding.
  - Regression verified with `snapshot_options_serde_and_defaults` unit test.
- **Test Pass Matrix (474 Passing Tests):**
  - `omnia-browser`: **56 unit/integration tests passed**, 0 failed.
  - `omnia-download`: **47 unit/integration tests passed**, 0 failed (16-stream TCP chunking).
  - `omnia-harness`: **309 unit tests passed**, **3 concurrent budget tests passed**, **2 sibling approval isolation tests passed** (1 unit test ignored).
  - `omnia-computer`: **55 unit tests passed**, 0 failed (1 ignored).
- **AST Code Graph (.omnia/cache/code_graph.sqlite):**
  - Relational schema deployed covering `files`, `symbols`, `symbol_references`, `call_graph`, and `file_dependencies`.
  - Initialized and indexed **964 files** and **11,421 symbols** (functions, structs, traits, enums, interfaces, type aliases) across Rust crates and TypeScript components.
- **Upstream Extraction & REA Taxonomy Catalog (14 Systems):**
  - VS Code Core, Cursor, Claude (Desktop + CLI + Web), ChatGPT (Desktop + Web), Google Antigravity (IDE + CLI), Gemini (Desktop + Web + NotebookLM), OpenCode, Hermes, DeepSeek-V3/R1, Factory Droid, Inflection Pi, Perplexity, Chrome Canary, IDM.
  - All Web APIs (Claude, ChatGPT, Gemini, NotebookLM) formalized as native Rust SSE/RPC streaming adapters without iframe embedding.
- **Desktop Single-Shell App Verified:**
  - Running live on Windows 11 (PID `14868`, HWND `121642070`, 1200x800).
  - Dark Slate Pro-Tech color scheme (#090d16 canvas, #111625 surface, #1f293d border, #e6edf3 text) with WCAG AAA >= 7:1 contrast.

## November 2, 2026 Omnia Sovereign Ecosystem and Upstream Logic Extraction

 - **Authoritative Base Commit:** 1b908d1 (docs(specs): formalize Sovereign Single-Shell IDE layout, AST Code Graph, and Multi-Agent DAG IPC specs).
- **Working Tree Health:** git status clean, zero compile errors, TypeScript strict pass (tsc -p tsconfig.app.json exits 0).
- **Test Pass Matrix:**
  - omnia-harness: 309 unit tests passed, 3 concurrent budget tests passed, 2 sibling approval tests passed (1 unit test ignored).
  - omnia-browser: 55 unit/integration tests passed, 0 failed.
  - omnia-computer: 56 unit/integration tests passed, 0 failed (1 ignored).
  - omnia-download: 47 unit/integration tests passed, 0 failed.
  - Total Rust Test Suite: 472 unit/integration tests passing cleanly across all 4 crates.
- **Hierarchical Memory Engine (.omnia/):** Fully implemented in `crates/omnia-harness/src/memory.rs` with multi-category indexing (`memory/`, `specs/`, `plans/`, `skills/`, `artifacts/`) and verified via 10 unit tests.
- **Recursive Subagent Hierarchy:** Fully implemented in `crates/omnia-harness/src/subagent.rs` with configurable depth (`DEFAULT_MAX_SUBAGENT_DEPTH = 5`), propagated event sinks, isolated child approver namespaces, and shared atomic token ledgers.
- **Chrome Canary SxS Auto-Detection:** Registered in `crates/omnia-browser/src/launch.rs` for Windows 11.
- **Repository Hygiene and Quarantine:** All loose ad-hoc automation scripts and screenshots in D:/Omnia quarantined to D:/Omnia/quarantine/legacy_automation_scripts/.
- **Upstream Extraction Library (upstream_extractions/):**
  - proxies/htmustc-proxy: Complete HTTP proxy, routing table, auto-cooldown on 429/5xx, kiropool token rotation, model aliasing.
  - notebooks/gemini-notebook: Document ingestion engine, citation grounding, Chrome Canary AES-GCM DPAPI cookie decryption vault.
  - downloaders/gdrive-downloader: hyperDownloader, driveScanner, queue manager.
  - downloaders/idm-multistream: Mathematical specifications for dynamic range partitioning, work-stealing, and sparse zero-copy file allocation (`ARCHITECTURE_AND_ALGORITHMS.md`).
  - ide/: Sovereign single-shell contract (eliminating double sidebars via injected CSS/flags) and Tree-sitter AST Code Graph relational schema (`CORE_LOGIC_SPEC.md`).
  - harnesses/: Decentralized multi-agent DAG topology, real-time JSON graph telemetry schema, and named-pipe IPC wire protocol (`DAG_AND_IPC_SPEC.md`).

## November 2, 2026 native workspace continuation

This dated receipt supersedes older statements below that Rust/Tauri could not
be exercised on the development host. The tree remains an uncommitted developer
snapshot, with further native integration and release verification outstanding.

- Root's combined renderer run passed **190/190** tests across browser workbench,
  local IDE workbench, embedded/native editor surfaces, shortcut resolver and
  proxy bridge. This covers persisted browser selection/sidebar layout, tab-menu
  keyboard/focus behavior, repeat suppression, reserved native IDE resize gutters,
  local tablist navigation, and editor connection recovery. These are automated
  renderer checks; mocked native readiness is not actual editor typing evidence.
- The latest completed `omnia-harness` suite passed **305 unit tests**, **2 eval tests**,
  **3 concurrent-budget tests**, and **2 sibling-approval isolation tests**;
  **1 unit test remains ignored**. Changes include shared parent/child budgets,
  checkpoint manifest failure recovery, final-turn cancellation status, scoped
  child approval identities, same-path file mutation serialization, stable
  checkpoint boundaries across compaction, observed stream/summary usage, and owned
  hook process cleanup. Windows hook cancellation/timeout tests verified their
  owned descendant listener exits. One initial integration assertion expected
  the old raw child tool ID; it was updated to the qualified outward ID before
  the successful full rerun. Repeated-compaction, later-write rewind and
  checkpoint-note completion regressions passed in the final integration rerun.
- Final genuine embedded-assets Tauri debug/no-bundle build **80023 exited 0**.
  The executable `src-tauri/target/debug/omnia-desktop.exe` has timestamp
  **November 2, 2026 15:27:44**, size **55,434,240 bytes**. Root launched that
  executable through supported Computer Use and observed the installed origin
  `http://tauri.localhost/`. This is distinct from the earlier Cargo-test side
  artifact and renderer-only builds.
- On that final executable, the native editor loaded the real VS Code Welcome
  screen at `127.0.0.1:1430`. Root created `Untitled-1` and typed
  `Omnia native editor smoke 2026-11-02`; a screenshot visibly confirmed the
  text and `Ln 1, Col 37`. No file was saved and no workspace trust was changed.
  Switching to Browser hid the editor and displayed the real
  `https://example.org/` document in the native browser child. Followup smoke
  verified URL selection/Escape, new/close tab and adjacent-tab Ctrl+L focus,
  browser pointer resizing, IDE gutter resizing, buffer retention across views,
  Quick Open filtering and local-buffer selection, and native editor restoration.
  Quick Open hid the native editor while its modal was open.
- Native smoke found a browser gutter focus defect: pointerdown prevented its
  default focus, so subsequent Home acted on the previous control. A regression
  failed before adding explicit gutter focus; **59/59** focused browser tests
  then passed. Renderer build **11138** and genuine Tauri build **44308** exited
  zero. The replacement EXE is dated **November 2, 2026 15:49:39**, size
  **55,434,240 bytes**. Supported Computer Use verified persisted browser state,
  pointer-to-Home resizing from **396 to 260 px**, then Left to **280 px**.
  Shift+F10 opened the tab menu and hid the native page;
  and Escape closed it and restored the native page. This closes the bounded
  IDE/browser smoke for this integration batch, not the broader release matrix.
- Earlier genuine native browser smoke verified URL selection/Escape, sidebar
  pointer/keyboard resizing, adjacent-tab focus, and bounded minimum-window UI.
  Those interaction receipts predate the final changes above and are retained as
  historical evidence until repeated on the named final executable.
- Fresh native editor server/surface tests passed **48/48**, including the
  generation-key change, and native keyboard tests passed **15/15**. The first
  generation regression needed its simulated-failure startup deadline corrected.
  Native rewind fixtures were migrated to stable keys after two old fixtures
  failed; **5/5** now pass, including legacy/crash archive continuation. Native
  browser cleanup passed **21/21** and the
  observed-usage filter passed **6/6** (five collector/storage tests plus an
  unrelated storage test matched by the filter). Subsequent Desktop review
  found a production child-usage forwarding gap outside the earlier collector seam,
  stale renderer rewind indices after compaction, and blocked legacy-session
  continuation. Child Usage now passes through the production NestedSink; a real
  TaskTool child regression covers success/error/cancel into durable session spend.
  SQLite fault tests verify transcript-write failure retains spend and retries do
  not double charge. Executed tool results and steer/Stop feedback survive failed
  boundary saves. Ambiguous checkpoint records are archived with original bytes
  and retained blobs; safe chat continuation and conversation-only rewind use
  durable confirmation, while unsafe historical file restore stays blocked.
  UI compaction invalidates old rewind indices and rehydrates authoritative detail;
  failed reload blocks stale actions with recovery guidance. The worker's final
  focused UI batch passed **122 tests**; root's additional recovery-notice/store
  check passed **25/25**. A strict test assertion type error found by root was
  repaired. Final TypeScript check **75870 exited 0**; renderer build **70754
  exited 0** with `tsc -b` and Vite transforming **2,055 modules**. Claude Desktop
  legitimately moved its preview configuration to1420 and stopped the1430
  listener, allowing the real editor ready/typing observation above. Preview
  restart was denied by Claude's permission classifier.
- Claude command collaboration runs with the user-requested bypass permission
  mode. The new Desktop peer received and replied through official messaging;
  a separate Claude CLI worker completed **3/3** real readonly subagents. Their
  source reviews informed the integrated lifecycle and harness fixes. No
  Computer Use message entry or duplicate Desktop transcript resume was used.
- Main renderer capability now selects only webview `main`, retaining the seven
  reviewed permissions; release framing excludes the editor origin. The ACL
  gate and **20/20** focused gate tests pass after native schema regeneration.
  Browser IPC deadline/late-lease recovery passed **35/35** focused renderer
  checks and TypeScript. Final gates passed: entry **158,920 bytes**, total JS
  **4,043,258 bytes** after the focus repair, **116 chunks**, **12 dynamic entries**, largest async
  **214,528 bytes**; command parity **174/176/176**, main-webview ACL **7
  permissions**, imports **529 modules / 1,200 local imports**. Existing Vite
  circular/manual-chunk and mixed static/dynamic warnings remain. Bundle and
  import gates passed again after the focus repair.

Remaining harness limits are material: request-boundary token admission can
overshoot for already admitted concurrent requests. Observed normalized usage
is now charged as consumed, including compaction and usage preceding errors or
cancellation; unknown remote billing remains unavailable. Gemini late cache
metadata uses conservative category maxima, and duplicate OpenAI usage snapshots
remain a provider robustness gap. Stable checkpoint keys and visible-index
timelines now rebase using the exact compaction split; steer/Stop boundaries,
child isolation and Windows path aliases are implemented. Checkpoint manifest
and SQLite publication remain separate stores: mismatched history is preserved
in recovery archives; ambiguous legacy file restoration requires explicit
recovery. Conversation-only rewind uses an exact persisted-history confirmation
guard before lowering archive barriers. This is not a general atomic cross-store
transaction. Shared file locks cover the harness file tools and contexts;
external programs and unrelated mutation tools remain outside them.

Evidence reports are stored in the development workspace under
`D:/Omnia/.agents/checkpoints`, including `claude-delegation-result.md`,
`harness-shared-budget-result.md`, `harness-hook-cleanup.md`,
`approval-namespace-fix.md`, `fs-mutation-serialization.md`,
`checkpoint-rebase-result.md`, `harness-observed-usage-result.md`,
`claude-command-continuation.md`, and `integration-verification-2026-11-02.md`.
This receipt establishes neither a signed release nor complete same-snapshot
packaged end-to-end behavior. Native tests above are selected filters, not a full
native-suite run.

## Moving-tree UI inventory

The current working tree contains a substantially broader renderer/UI preview
than the original Phase 1 provider slice. This is an **uncommitted development
snapshot**, not a packaged release. The list below is an inventory of source
surfaces; focused checks do not establish native-runtime or release readiness.

Visible preview/workbench areas currently present include:

- Appearance: 12 logo directions, 12 palettes, role-color overrides, style
  presets, undo/redo/reset, and import/export rehearsal (default preview:
  Logo 1 + Palette 3).
- Settings and policy: provider/model lab, prompt-template lab, workspace and
  permission preset previews, per-Project permission drafts, security-policy
  profiles/diff/export, and diagnostics-session/export review.
- Memory and skills: proposal inbox with decision/risk/provenance signals,
  typed memory scope/mode controls, and a Global × Project skill-activation
  matrix with review/permission-diff previews.
- Project and Chat: Project-versus-Chat conversation setup, Project Plan to
  Chat draft staging, searchable/filtered Handoff records, per-record
  selection, JSON/Markdown export previews, and shared Project/Chat action
  availability.
- Composer, context, and journal: Markdown plus inline-LaTeX preview,
  context/run evidence projections, and run-journal coverage labels that
  distinguish complete, partial, recovered, and unknown replay.
- Media, toolchains, and learning: image/video/audio capability and artifact
  gallery previews, a 13-ecosystem toolchain catalog with command-template
  rehearsal, and a renderer-only training/RLAIF control center with dataset,
  holdout, agreement, schedule, checkpoint, and export controls.
- Background work: Agent Mesh, supervisor, reconciliation, worktree,
  harness, and provider-fault workbenches with mailbox/lease/export and
  coordination projections.

These surfaces are intentionally classified as preview, partial, or planned
according to the evidence rules below. They do **not** prove Tauri startup or
Rust compilation, provider HTTP dispatch, durable settings/memory/skill
persistence, filesystem/compiler authority, model training/checkpointing, or
real multi-agent leases/mailboxes. The browser preview remains available at
`http://127.0.0.1:1420/`; no screenshot or Computer Use receipt is required
for this inventory.

Per-slice checks recorded while files are changing are development evidence,
not a combined same-snapshot release receipt. See the current continuation
below for the latest bounded renderer/source checks and their exclusions.

Status meanings:

- **Implemented:** the path exists in the current tree and is exercised by automated tests or direct native verification.
- **Partial:** meaningful code or UI exists, but the user journey is not yet complete, durable, or verified end to end.
- **Preview:** an interactive renderer projection or deterministic browser/mock path; it is not a native product claim.
- **Planned:** specified but deliberately unavailable or not connected.
- **Deferred:** outside the Chat Complete boundary and unavailable by design.

## Current renderer continuation snapshot

### October 1, 2026 Goal/Chat interaction continuation

The Project Plan tab now passes its selected Project ID to Goal Studio. Its
preview drafts survive tab remounts inside that Project's browser session but
remain separate from native Goal records. The new Saved project goals panel
only calls the existing native Goal bridge in Tauri; browser preview explicitly
reports that native storage is unavailable instead of showing simulated saved
Goals. Native Goal draft creation is an explicit, idempotency-keyed user action
and does not schedule or execute work. The Goal prompt rail now separates its
queue, active preview slot, and Btw/Discuss side notes, with explicit side-note
promotion; this remains a local rehearsal without durable queue authority.
Chat mode settings and Undo history survive collapsing the advanced controls.

Focused evidence: Project Deck **29/29**, Goal Studio **15/15**, prompt rail
**4/4**, native panel with mocked bridge **3/3**, and Chat mode selector
**6/6** passed. App TypeScript and renderer build passed (2,104 modules);
preview smoke returned `OMNIA_SMOKE_OK` on port 1420. A separate headless
browser captured default Chat and a selected/scrolled Plan tab at 1280×800
under `artifacts/ui-goal-*-2026-10-01.png`; this is a spot inspection, not a
native or complete responsive visual gate. The in-app browser-control connection did not initialize,
and Rust/Tauri runtime verification is still unavailable. See
[`audit/OMNIA_GOAL_CHAT_INTERACTION_2026-10-01.md`](audit/OMNIA_GOAL_CHAT_INTERACTION_2026-10-01.md)
for the bounded receipt, test-file recovery incident, and limitations.

### October 1, 2026 compact Project/Chat UI continuation

The Chat starter now occupies a compact single row in an empty Chat. Its three
suggested prompts are behind a named **Prompts** disclosure; selecting one
inserts its text into the composer and focuses the input. The disclosure resets
when a different Chat is selected. An active Chat with messages does not show
the starter. The Project scope menu remains named and keyboard navigable; the
old ambiguous Project-to-Chat chevron is absent from the current source.

Project Control Deck Snapshot now shows **Next actions** before advanced
configuration. **Advanced policy & data** is closed by default and opens the
existing Project Policy Summary, cache/context planning, and readonly source
ledger on demand. Its named toggle exposes expanded state, and the Project-
scoped policy draft plus undo history survives closing it and switching tabs.
The Settings workspace-snapshot preview similarly exposes its label, scope,
and Generate preview immediately while the inclusion/history/metric options
sit behind **Customize snapshot**. Goal Studio now displays a `1 / n` goal
position with Previous/Next controls; switching sequentially clears stale task
filters so the new goal cannot appear empty merely because of the old search.

Focused same-snapshot component evidence: Chat entry/scope/Goal Studio/goal
rail suites **23/23**, Project Deck/Policy Summary/Settings workspace snapshot
suites **46/46**, and a subsequent Project Deck rerun after the final
disclosure-history assertion **28/28**. App TypeScript typecheck passed. The
renderer build passed (**2,103 modules**, 1m 14s) with the existing mixed
static/dynamic Agent Mesh import warning. Preview smoke returned
`OMNIA_SMOKE_OK http://127.0.0.1:1420/ status=200 omnia=true hmr=true`.
See [`audit/OMNIA_COMPACT_UI_CONTINUATION_2026-10-01.md`](audit/OMNIA_COMPACT_UI_CONTINUATION_2026-10-01.md)
for scoped receipts and exclusions. These are
renderer-session UX behaviors, not durable goal queue/steer execution, native
snapshot backup, native policy persistence, provider dispatch, or packaged
desktop evidence. No new screenshot/visual-inspection receipt exists for this
snapshot; the user will inspect the already-running preview directly.

### October 1, 2026 provider protocol and Settings navigation cleanup

The current moving snapshot separates first-party OpenAI Responses streaming
from OpenAI-compatible/local Chat Completions routing in the native gateway
contract and renderer parameter routing. First-party Responses previews use
`/responses`, `input`, `max_output_tokens`, `reasoning`, typed Responses SSE
events, and Responses usage fields; compatible/local profiles retain the
Chat Completions family. The renderer also rejects first-party fields that the
Responses route cannot represent instead of silently dropping them.

Settings navigation now keeps the optional navigation map inside the left
category rail instead of adding a full-width banner. Its compact Quick jump
select exposes every Settings section, the Customize map editor remains
available behind an explicit disclosure, and Diagnostics jump links reset the
Settings scroll host rather than the app shell. Dense provider/model/health
cards wrap their evidence and identifiers instead of creating a page-wide
horizontal scrollbar.

Bounded same-snapshot evidence for this continuation: the focused Settings,
navigation-transfer, control-center, provider-settings, Chat canvas, and scope
header suites passed (**32 tests**); the app typecheck passed; the renderer
build transformed **2,103 modules**; and preview smoke returned
`OMNIA_SMOKE_OK` with HTTP 200, Omnia, and HMR markers. The build retains one
known Vite dynamic/static import warning for the Agent Mesh supervisor.
These checks remain renderer/build evidence only: Rust/Tauri compilation,
packaged EXE behavior, native provider HTTP, durable settings, and native
recovery/concurrency remain unverified because the host has no Rust toolchain.

### September 30, 2026 Phase 3 routing, context, observability, and local-model wave

The moving renderer snapshot now exposes a Discuss composer mode with reversible
round, perspective, synthesis, and disagreement controls; schema-aligned
compaction thresholds for context percentage, tokens, cost microunits, and
latency; explicit observability metric namespaces and throughput/cost-rate
window presets; fail-closed provider-cache evidence normalization; bounded
per-role model routing with precedence, explicit/pool/auto choices, effort
tiers, and copyable JSON; and a Local Model Readiness planning surface with
historical hardware/runtime gates, storage and fallback choices, and export
controls. The new routing and readiness surfaces are renderer-local previews:
they do not spawn agents, dispatch providers, inspect the filesystem, download
models, run benchmarks, create cache receipts, or persist native policy.

Focused development evidence for this wave includes Discuss/composer,
project-policy/compaction, cache/context, observability, role-routing, and
local-model readiness suites. TypeScript and renderer-build evidence must be
read from the latest same-snapshot command output; this section does not
promote any of these surfaces to native or release status. The browser preview
remains available at `http://127.0.0.1:1420/`.

### September 26, 2026 Project/Chat/Settings UI wave

The frozen renderer snapshot adds a Project Control Deck next-action queue,
source-aware Project Activity Timeline filters and sorting, a renderer-local
Jump-to-message path from Command Palette, a Memory Review Cockpit, Settings
navigation/portability profiles, Citation Ledger quality triage, provider route
comparison controls, and a Skills activation review surface. Project switching
now resets deck-local tab/metadata state instead of leaking the previous
Project's view. These additions are reversible session previews: they do not
create native tasks, leases, provider requests, filesystem writes, durable
memory/skill activation, or native settings policy.

Same-snapshot evidence for this wave: focused suites cover **10 test files / 89
tests**; `typecheck:app`, full `typecheck`, renderer build (**2,047 modules**),
source-ledger (**94 sources**), Project Twin generation/check, spec validation,
import boundaries, typography, hit-targets, ACL, cursor-authority,
authoritative-root, and preview smoke all pass. The aggregate bundle check is
still a watch/fail at **3,488,440 B** versus the fixed **2,150,400 B** budget;
the budget was not relaxed. Native Rust/Tauri, packaged Windows, provider HTTP,
durable persistence, and visual screenshot gates remain unavailable/unverified.

### September 26, 2026 broad renderer workbench wave

The next frozen renderer snapshot expands the same UI-first surface with Agent
Mesh Inbox triage, Conversation Library search/smart collections, Global Search
saved views, Media Gallery collections, Media Generation storyboard editing,
Science Notebook table modes, Evaluation Studio candidate comparison, Research
Notebook source sorting, Permission Control review queues, Skill Authoring
evaluation cases, Terminal/Toolchain profile import, Structured Document
structure navigation, and a modern palette-harmony preview. The Chat composer
also preserves indentation when Enter is pressed inside fenced code. All of
these changes remain reversible renderer-session previews; they do not send
mail, spawn agents, acquire leases, call providers, execute compilers, train
models, write media/files, or persist native settings.

Same-snapshot evidence for this wave: **20 focused test files / 146 tests
passed**; `typecheck:app`, full `typecheck`, renderer build (**2,052 modules**),
import boundaries, typography, hit targets, `git diff --check`, source-ledger,
Project Twin bootstrap/check, spec validation, and preview smoke all pass. The
aggregate bundle check remains a deliberate watch/fail at **3,578,227 B** versus
the fixed **2,150,400 B** budget. Native Rust/Tauri, packaged Windows, provider
HTTP, durable persistence, filesystem/compiler authority, model training, and
visual screenshot gates remain unavailable or unverified.

### September 26, 2026 evidence, compare, and release-control micro-wave

The latest frozen renderer snapshot adds a Data Lineage Evidence Ledger,
Prompt Experiment Compare, a Git/CI Release Evidence Matrix, Notification
Triage Center lanes, Citation Graph neighborhood focus, Run Timeline stage/source
filters, and Prompt Library favorites plus session saved views. These surfaces
make evidence, comparison, triage, and handoff state easier to inspect without
claiming the underlying native operation. They remain `Preview only`,
`Renderer-local`, and `No durable write`.

The combined receipt is **28 focused test files / 194 tests passed** across the
previous broad wave and this micro-wave. On the current frozen tree,
`typecheck:app`, full `typecheck`, renderer build (**2,053 modules**), import
boundaries, typography, hit targets, ACL, cursor/authority checks,
source-ledger, Project Twin, spec validation, `git diff --check`, and preview
smoke remain passing. The current Project Twin is
`twin-3f05af0e0ae0b1ebfbdb045b6eda14bf82b3ff08345dc75d71d46bbb3afecb7a`.
The aggregate bundle check remains a deliberate watch/fail at **3,603,084 B**
versus the fixed **2,150,400 B** budget; the budget was not relaxed. Native
Rust/Tauri, packaged Windows, provider HTTP, durable persistence,
filesystem/compiler authority, model training, and visual screenshot gates
remain unavailable or unverified.

### September 27, 2026 continuous UI workbench wave

The next frozen renderer snapshot continues the UI-first pass with Citation
Graph shortest-path and connected-cluster focus, Data Lineage export presets
and session history, custom Git/CI release gates, Notification export history,
Prompt Library folders and tags, Run Timeline event detail, Provider Fallback
Rehearsal scenarios and history, Automation Workflow Builder staging,
Diagnostics history, Workspace Export profiles, Project Handoff metadata-only
exports, Learning Loop review scheduling, Composer Draft Versions comparison,
and Skills Catalog side-by-side comparison. Every addition remains
`Preview only`, `Renderer-local`, or `No durable write`; no provider, scheduler,
Git/CI, mailbox, compiler, model-training, or native persistence operation is
claimed.

The latest bounded focused command set covers **17 test files / 115 tests
passed** (15 files / 101 tests for the workbench reconciliation command, plus
2 files / 14 tests for Skills Catalog comparison). `typecheck:app` passes;
the renderer build transforms **2,059 modules**. Import boundaries,
typography, hit targets, ACL, cursor authority, authoritative-root, and
preview smoke pass. Source-ledger verification and Project Twin also pass on
the final frozen snapshot. The aggregate bundle gate remains a deliberate
watch/fail at **3,678,100 B** versus the unchanged **2,150,400 B** budget; the
budget was not relaxed. The build reports one known Vite warning about
`agent-mesh-supervisor-preview.tsx` being both statically and dynamically
imported. Native Rust/Tauri, packaged Windows, provider HTTP, durable
persistence, filesystem/compiler authority, model training, and visual
screenshot gates remain unavailable or unverified.

### September 27, 2026 portability / notification / activity closure

The newest renderer wave extends the visible workbenches with toolchain and
compiler profile comparison/import/export rehearsal, Project Activity Timeline
bookmarks and evidence inspection, Workspace Export profile comparison,
notification channel preference controls, and explicit channel filtering. The
new controls remain `Preview only`, `Renderer-local`, and `Session-only`: they
do not execute commands, alter notification subscriptions, write workspace
profiles, or create durable activity receipts.

The focused receipt for this frozen tree is **12 test files / 88 tests passed**.
`typecheck:app` passes; the renderer build transforms **2,067 modules**. Import
boundaries report **356 production modules / 719 local imports**. Typography,
hit-target, ACL, cursor-authority, authoritative-root, `git diff --check`, and
preview smoke pass. The preview is live at `http://127.0.0.1:1420/` with HTTP
200 and Omnia/HMR markers. Aggregate JavaScript is a deliberate watch/fail at
**3,766,587 B** against the fixed **2,150,400 B** budget; the budget was not
relaxed. Native Rust/Tauri, packaged Windows, provider HTTP, durable
persistence, compiler execution, notification subscriptions, and screenshot
gates remain unavailable or unverified.

### September 27, 2026 Project Deck / media / policy / theme / telemetry closure

The latest frozen renderer snapshot closes the current UI workbench batch with
saved Project Deck layouts, an Overview Action Center, Mission Control signal
refinements, a mixed-media Gallery comparison/collection surface, Permission
Matrix Studio presets and scope copying, Theme Preset Studio catalog/import /
export/undo controls, and a bounded Telemetry Inspector. These surfaces are
interactive renderer projections only: they remain `Preview only`,
`Renderer-local`, `Session-only`, or `No durable write` as applicable. They do
not claim native permission enforcement, telemetry collection, media generation
bytes, provider dispatch, durable layout storage, or Tauri/EXE behavior.

The bounded focused receipt for this snapshot is **9 test files / 59 tests
passed**. `typecheck:app` and the renderer build pass; Vite transformed
**2,067 modules**. Import boundaries report **355 production modules / 717
local imports**. Typography, hit-target, ACL, cursor-authority,
authoritative-root, source-ledger, Project Twin, and preview smoke checks pass.
The preview is available at `http://127.0.0.1:1420/` and returned HTTP 200 with
Omnia/HMR markers. Aggregate JavaScript remains a deliberate watch/fail at
**3,751,614 B** versus the fixed **2,150,400 B** budget; the budget was not
relaxed. Native Rust/Tauri, packaged Windows, provider HTTP, durable
persistence, filesystem/compiler authority, model training, and visual
screenshot gates remain unavailable or unverified.

### September 24, 2026 UI-first feature wave

The current browser preview now exposes a broader, still renderer-local set of
configuration and workbench surfaces for rapid product review. Appearance adds
12 logo directions and 12 palettes with role-color customization, undo/redo,
reset, and import/export rehearsal; the default preview remains Logo 1 +
Palette 3. Provider settings add a model lab with capability/fallback and
parameter previews, while the Prompt Template Lab is lazy-mounted beside it
for typed variables, example cases, validation, duplication, and reset.

The new workspace setup surfaces include an explicit Project-versus-Chat mode
choice in the new-conversation dialog, a workspace file-roots catalog with
include/exclude/indexing choices and export/import preview, and a 13-ecosystem
toolchain catalog with command templates and planned-runtime labels. Training
now includes a renderer-only RLAIF preference-review lab with holdout and
agreement controls. Media generation has an artifact gallery and a
capability-aware image/video/audio preview; the composer preview supports
inline LaTeX forms without changing stored Markdown source.

Memory proposals and per-project skill activation are now visible as separate
review workbenches. Project Handoff supports searchable/filterable large record
sets, per-record selection, and JSON/Markdown preview export. Project/Chat
action availability is shared across sidebar and Project Control Deck, and the
run journal/citation timeline distinguishes complete receipts from partial or
unknown replay coverage. Background Work keeps Agent Mesh, supervisor, and
reconciliation projections lazy and explicitly preview-only.

Same-snapshot renderer receipt for this wave: **15 focused test files / 68
tests passed**, `typecheck:app` passed, the renderer build transformed 1,989
modules, preview smoke returned HTTP 200 with Omnia/HMR markers, typography and
hit-target checks passed, and Project Twin fingerprint is
`twin-8eb9e94d6365f733`. Aggregate JavaScript is still over the fixed watch
budget at **2,744,325 B** versus **2,150,400 B**; the gate measures all emitted
chunks, so this is a known bundle watch/fail rather than a native/runtime
failure.

These additions are not evidence of Tauri startup, Rust compilation, provider
HTTP dispatch, durable settings/memory/skill persistence, filesystem/compiler
authority, model training, or real multi-agent leases/mailboxes. The browser
preview remains an unsigned internal renderer preview and keeps explicit
`Preview only`, `No durable write`, `Planned`, and `Not observed` boundaries.

### September 24, 2026 continuation wave 2 (moving renderer snapshot)

The next UI-first wave adds several focused workbenches and typed preview
contracts while concurrent writers are still being reconciled. The visible
surfaces now include:

- Plan → Chat operation preflight with operation identity, Project/task/draft
  fingerprints, destination and empty-draft checks, idempotency-key rehearsal,
  and explicit sequential/partial-outcome language. Native atomicity remains
  `Planned`.
- Composer block-insert studio with searchable Structure, Code, Data, Math,
  and Layout templates, editable snippets, reset/clear controls, checklist and
  numbered-list starters, fenced code/JSON/Mermaid, tables, and LaTeX blocks.
  Insertions are draft-text changes only and flow through composer history.
- Provider model compatibility preview covering tools, structured JSON,
  reasoning, vision, and audio capability rows with Strict/Advisory behavior,
  endpoint/model notes, and exportable review state. It does not probe a live
  provider or infer support from provider branding.
- Extensions/MCP permission review with deterministic low/medium/high/critical
  risk heuristics, Allow/Ask/Deny decisions, operation/conversation/project/
  workspace scopes, expiry and rationale fields, bulk review, undo, and
  JSON/Markdown export. No native grant or extension activation is performed.
- Project skill-activation diff showing inherited, explicit project, manual,
  and explicit-Off states with added/removed/changed/unchanged rows. The
  comparison and import/review state remain renderer-session only.
- Science Notebook Lab with protocol steps, editable observations, review
  state, a deterministic simple-pendulum calculation, residual/RMSE checks,
  assumptions/limits, and JSON/Markdown handoff export. Only the physics
  template is active; chemistry, mathematics, and biology templates remain
  planned.
- Evaluation Rubric Workbench and Model Evaluation Studio previews with
  balanced/coding/research/safety presets, custom criteria, score scales,
  adjudication paths, deterministic largest-remainder weight normalization,
  and evidence/boundary guidance. No evaluator, benchmark, label, training,
  or provider job is invoked.
- Universal Search and Command Center previews with scoped targets for
  commands, Chats, Messages, Projects, Files, Memory, Skills, Library,
  Providers, and Models; prefix filters, breadcrumbs, and renderer-local
  navigation targets are visible without claiming a native index.
- Artifact Document Studio checkpoints, Workspace Export Center profiles, and
  Git/CI Workbench history/release-handoff previews now expose reversible
  session-local snapshots, bounded import/export profiles, activity filters,
  a release evidence matrix with Ready/Watch/Planned states, and delivery
  rehearsal. They do not write files, mutate Git, or run CI.
- Context/Memory/Skills receipt projections now show candidate scope, origin,
  confidence, version, permission, and frozen/not-frozen labels for the
  selected Answer/Run/Project surface. These are evidence projections only.
- Agent Mesh and reconciliation workbenches add visible search/filter and
  bulk Hold/Resolve/Reset rehearsal over agents, mailbox messages, leases, and
  conflicts; no scheduler, lease, mailbox, or worktree mutation is performed.
- Harness evidence register refresh pinned to the inspected September 24
  DeepSeek, OpenAI Codex, and official Claude Code revisions. This is a
  research input and clean-room signal register, not feature-parity or
  runtime-authority evidence.

Development checks at that earlier moving checkpoint included focused passes for the
Plan → Chat preflight (14/14), composer block editor (25 tests across three
files), Extensions/MCP review (9/9), skill activation diff (6/6), provider
compatibility (4/4), Science Notebook (6/6), rubric (4/4), and Model
Evaluation Studio (5/5). One combined composer rich-preview run was transiently
slow in that moving tree; a later isolated composer run passed. The per-slice
figures above are not a combined release receipt. The bundle watch budget
remains a measured performance issue, not a reason to remove these previews.

### September 25, 2026 UI-first continuation

The Library now has a separate **Citation Ledger** workbench: illustrative
claims and source records, editable claim status/statement type/confidence,
source linking, search/filter, coverage review, undo/redo/reset, and JSON or
Markdown export. A fixture record or a `Supported` label is not independently
verified evidence; no retrieval, source validation, native write, or provider
call occurs. Filtered-out records do not leave stale detail panels visible.

The Workspace Export schedule draft now has undo/redo/reset and bounded JSON
import/export for its cadence, profile, destination note, and retention options.
This is a local schedule calculation, not a running timer, background job, or
automatic file export. The keyboard-shortcut dialog also has undo/redo/reset
and import/export of preview overrides; those overrides **do not rebind active
keyboard commands** or register global/native shortcuts. The browser preview
remains the fastest way to inspect these surfaces. Focused results are
development checks, not native or release-readiness proof.

The Citation Ledger now accepts a bounded JSON import through paste or file
selection, previews linked claim/source records and ID conflicts, and lets the
user explicitly merge or replace the renderer ledger with Undo available.
Imported quality/status labels remain reviewer annotations, never proof that
a source was retrieved or verified. In browser preview, Chat Composer now
accepts multiple file selections or a drop into a **separate renderer-session
tray**. Image/video thumbnails use revocable local object URLs; removing a
file, changing Chat, or closing Composer discards them. While browser files
remain in the tray, sending is blocked rather than silently omitting them.
No bytes are uploaded, sent to a provider, ingested by native storage, or
attached to a durable message from this browser-only path.

### Current continuation — native branch-selection source and renderer UI

The Chat branch map now distinguishes two operations. In browser preview,
Previous/Next and Inspect only scroll among visible message markers and never
change the active branch. In a hydrated native Chat, the map lists branch
records supplied by the native conversation snapshot and offers Switch to
branch. The renderer rejects an unsent draft or active run, sends the observed
active branch ID to `conversation_branch_activate`, and hydrates only the
returned native snapshot. The Chat excerpt and run state follow the selected
branch path rather than an unrelated sibling. The native storage path checks branch ownership,
uses an immediate SQLite transaction and compare-and-swap, and rejects an
active queued/running generation. Branch naming, promotion, and merge remain
planned. The browser does not expose a durable-switch claim.

The bounded source/renderer receipt for this continuation: branch catalog,
view and store tests **3 files / 10 passed**; Plan → Chat contract **9 passed**;
Algorithm Lab's Merge Sort, Topological Sort and Union-Find selected tests
**3 passed**. App typecheck, renderer build (**2,009 modules**), preview
HTTP/HMR smoke, import boundary, typography, hit-target, command parity
(**59** renderer calls / registered commands / definitions), and Tauri ACL
checks passed. Native Rust compilation, Rust tests, packaged desktop startup,
and end-to-end branch activation remain **not observed** because `cargo` and
`rustfmt` are absent on this host. This source/renderer receipt does not claim
provider dispatch or native durability was exercised. Aggregate JavaScript is
**3,046,836 B** against the fixed **2,150,400 B** gate; the bundle check fails.

### September 25, 2026 current UI continuation

The current renderer snapshot adds two bounded UI surfaces. Chat Composer now
shows an **Attachment compatibility preview** for each selected attachment,
mapping image/video/audio/document inputs against the selected provider/model
catalog and distinguishing `Catalog compatible`, `Review`, `Blocked`, and
`Preview only`. This is a catalog signal only: browser files stay local, and
provider upload/carrier planning/dispatch remain gated.

Project Settings now includes a **Project metadata provenance** panel with
field-level delta, bounded preview digests, native `updatedAt` cursor status,
observation metadata, and JSON/Markdown export. It deliberately excludes
metadata contents and marks the projection `authoritative: false` and
`durable: false`; it does not create a Project Twin revision or native mutation
receipt.

On this frozen renderer snapshot, the focused continuation suites pass
**24/24 tests**; `typecheck:app`, typography, hit-target, import-boundary,
renderer build (**2,034 modules**), source-ledger (**94 sources**), Project
Twin (`twin-5ac21ece35904662`) and HTTP/HMR smoke all pass. The bundle watch
gate remains intentionally unresolved at **3,313,910 B** versus **2,150,400 B**;
the UI was not cut to chase that aggregate budget. Native Rust/Tauri compile,
packaged desktop startup, provider upload/dispatch, and durable persistence are
still **not observed**.

### September 24, 2026 bounded Project/Chat continuation

The live browser preview now keeps the Settings Project context scoped to an
existing Project during native list replacement, clears it before desktop
hydration, and refuses to rehydrate that one-shot context from preferences.
The Permission Control Center maintains independent `project:<id>` renderer
drafts with per-Project undo/redo/reset; Project Context reads the selected
Project's matching draft. These controls never alter native policy or grant
execution authority. The sidebar projects its Chat archive/move/planned action
states from the shared Project Chat action contract rather than a separate
streaming rule. The Project Handoff preview package v2 includes selected Plan
seed, visible Chat metadata/excerpts, path-free workspace-grant metadata and
renderer-visible signal/overview records, subject to the include toggles; no
agent handoff or native artifact is created.

The focused same-snapshot renderer receipt is 10 test files / 87 tests, app
typecheck, a 1,978-module renderer build, typography/hit-target checks and
preview HTTP/HMR smoke. The aggregate JavaScript bundle remains over budget:
2,601,791 B against 2,150,400 B. These are renderer/source checks only;
visual screenshots, packaged Tauri/native runtime, provider dispatch and
restart durability were not tested. Details and hashes are in
[`OMNIA_RENDERER_UI_CONTINUATION_2026-09-24.md`](audit/OMNIA_RENDERER_UI_CONTINUATION_2026-09-24.md).

The later September 24 renderer continuation also stages a selected Plan task
as an editable draft in an empty, same-Project Chat without overwriting another
draft or sending a provider request. It can also open a Project-locked New Chat
dialog with the task prefilled; only explicit confirmation creates the Chat
(which can be a native record on desktop), while its task draft stays local to
the renderer session. Handoff v3 adds individual Chat/grant
selection with selection-aware JSON/Markdown exports; Project Permission JSON
import applies to the bundle's declared scope. These remain renderer-session
behaviors, not native policy, durable plan/task mutation, or agent handoff.
The focused receipt is 7 files / 78 tests, app typecheck, renderer build and
HTTP/HMR smoke. Aggregate JavaScript still exceeds budget at 2,608,917 B versus
2,150,400 B; see
[`OMNIA_PROJECT_PLAN_CHAT_HANDOFF_SELECTION_2026-09-24.md`](audit/OMNIA_PROJECT_PLAN_CHAT_HANDOFF_SELECTION_2026-09-24.md).

The September 21, 2026 renderer continuation includes a Workspace Preset Lab
and Permission Preset Lab under Settings, nested lazy boundaries for
Appearance, Providers, Storage, and Diagnostics workbenches, and on-demand
loading for the heavy Home, Project, Skills, and Memory workbenches. Home now
also has a six-action Operations Deck with live renderer-session metrics and
five optional focused previews. Background Work optional surfaces now have a
focused keyboard/reopen contract receipt. Workspace Preset Lab also records a
bounded renderer-session lifecycle timeline for catalog changes, review,
undo/redo, and export activity. These
surfaces are intentionally classified as `Preview`/`Partial`: they provide
rich session-local controls, import/export previews, undo/redo/reset rehearsal,
history/diff review, lazy loading, and truthful boundary copy, but do not
persist settings, grant capabilities, call providers, or create native policy
receipts. The browser preview remains available at
`http://127.0.0.1:1420/`; the current renderer build passes and the aggregate
JavaScript bundle is 2,571,478 B against the unchanged
2,150,400 B watch budget.

Chat now also has a visible `Project continuity` bridge between the Chat
Workbench and Chat Signals. A Project-scoped Chat exposes its safe context
availability projection, active Project-Chat count, visible read-only folder
references, and direct renderer navigation to the Project overview or a new
Project Chat. A standalone Chat instead exposes the missing/empty scope and
routes to browsing or creating a Project. These controls do not attach a Chat,
compile context, read/write files, call a provider, dispatch an agent, or
persist Project/Chat routing state.

The prior cross-slice continuation receipt is 17 test files and 93 tests. The
latest bounded Home/Settings add-on receipt covers 6 files and 34 tests,
including Home lazy resolution/retry/dismiss, the Operations Deck callbacks
and attention state, updated Home command-center coverage, Workspace Preset
Lab lifecycle history, Permission Preset Lab import staging, and Settings
Control Center import/undo coverage. App typecheck, renderer build,
typography/hit-target checks, and preview smoke pass for this add-on snapshot;
the source-ledger/Twin/specification refresh belongs to the final same-snapshot
handoff. The aggregate bundle gate remains an honest watch/fail because all
emitted chunks are counted: total payload is 421,078 B over the fixed budget,
while the entry and largest async-chunk limits remain within their individual
budgets. The route-level split makes the main Home, Projects, Skills, and
Memory chunks substantially smaller, but does not claim that aggregate
JavaScript has been reduced. Workspace Preset Lab import review detects
matching IDs/name-category pairs and previews Keep both, Skip duplicates, or
Replace matching session copy policies; built-ins remain immutable and all
decisions stay renderer-session only. Permission Preset Lab imports stage a
lifecycle diff before an explicit apply, so an imported policy preview cannot
silently replace the current draft.

The latest Chat/Project bridge receipt covers 3 focused files and 10 tests
(bridge, Chat scope header, and ConversationView integration), plus app
typecheck, typography, hit-target, whitespace, renderer build, and preview
smoke. The aggregate bundle remains unchanged at 2,571,478 B and still fails
only its fixed aggregate watch budget.

## October 17, 2026 runtime-foundation documentation boundary

The moving tree now contains a broader renderer/native runtime foundation than
the earlier Phase 1 status sections describe. `OmniaAppState` composes chat,
permissions, providers, plugins, feature flags, projects, editor, media,
agents, automation, and the event log. `OmniaRuntimeController` provides
renderer-side transactions, revisions, history, undo/redo, JSON hydration, and
detached transfer envelopes. `OmniaRuntimeBridge` negotiates browser versus
desktop mode, core capabilities, lifecycle epochs, and run-event subscriptions.

Native `AppState` now owns separate app-state and settings/permissions JSON
stores, SQLite, secret/blob-key brokers, encrypted content storage, the bounded
download queue, attachment ownership, isolated-input leases, and the provider
gateway. These are meaningful implementation surfaces and are documented in
[`omnia-ultra/architecture/runtime-composition-and-lifecycle.md`](omnia-ultra/architecture/runtime-composition-and-lifecycle.md).

The evidence boundary is unchanged: TypeScript contracts, focused tests, Rust
source inspection, and `cargo check` do not by themselves prove packaged Tauri
startup, provider HTTP, restart recovery, durable download resumption,
filesystem-index persistence, active OS input/capture, native worker leases, or
end-to-end settings UI wiring. The capability matrix below therefore keeps
these surfaces `Partial`, `Preview`, or `Planned` until the applicable native,
security, recovery, and packaging gates are observed on the same snapshot.

## Capability matrix

| Area | Status | Current evidence | Important boundary |
|---|---|---|---|
| Windows desktop shell | Implemented | Tauri 2 host, custom title bar, responsive activity rail/sidebar/workspace/inspector, themes, density, reduced motion, command palette | Not yet a signed or updater-enabled release |
| Renderer/core negotiation | Implemented | Versioned startup handshake and fail-closed required capability check; the desktop client requires `run.stream.v1`, while the native core advertises the bounded chat-phase capabilities listed in `src-tauri/src/core_protocol.rs` | Replay cursors, approvals, memory, skills, workspace writes, process execution, browser control, and computer control remain unavailable |
| Browser development surface | Preview | Safe runtime fallback and deterministic local streaming | Does not contact providers, persist credentials, or emulate native storage/filesystem powers |
| Domain contracts | Implemented | Typed immutable contracts and tests for conversations, runs, attempts, providers, parameters, context, projects, memory, skills, content, citations, and grants | Most contracts intentionally lead their native/UI integration |
| Runtime composition and lifecycle | Implemented / partial native boundary | `OmniaRuntimeBridge` negotiates browser/Tauri mode, core capabilities, single-flight initialization, stale lifecycle epochs, run-event cleanup, and fail-closed disposal; `OmniaRuntimeController` owns renderer transactions, revisions, history, undo/redo, JSON hydration, transfer envelopes, and domain mutations | Native startup, reconnect/replay, packaged lifecycle, and durable commit ordering still require same-snapshot desktop evidence |
| App-state snapshots and transfer | Partial | Versioned `OmniaAppState` envelope/migrations, bounded native JSON snapshot store, atomic replacement, top-level revision CAS, detached export/import validation, and receipt-scoped native commands | Transfer is not durable synchronization; secrets/redaction policy, crash recovery, close/reopen, and packaged IPC evidence remain incomplete |
| Settings and permissions persistence | Partial | Separate bounded JSON store with atomic replacement, revision CAS, malformed/oversized rejection, and browser in-memory versus Tauri-native adapter split | Existing Settings UI is not fully wired to durable hydration/save; restart and packaged policy evidence remain open |
| Download and encrypted content foundation | Partial | Native opaque-source download lifecycle, bounded chunks/size, pause/resume/cancel/complete transitions, encrypted content-store commit, and blob descriptors | Queue metadata is not restart-durable; broker integration, resume recovery, deletion/GC, attachment UX, and packaged evidence remain open |
| Isolated input/capture boundary | Partial / fail-closed | Native target-scoped request validation, explicit authorization receipts, bounded leases, session/channel lifecycle, finite event validation, and unavailable capability receipts | Current backend is `none`; no active OS input/capture, global hooks, credential capture, or stealth automation is enabled or verified |
| Workspace index and retrieval foundation | Partial | Native bounded index-build/retrieve commands, read-only grant scope, sensitive/reparse filtering, and lexical/MMR retrieval contract | Current command returns an ephemeral snapshot; durable SQL index tables, watchers, invalidation, and packaged filesystem evidence are not established |
| Agent scheduler and automation contracts | Preview / renderer contract | Deterministic dependency/lifecycle/retry/cancel scheduler state, automation definitions/runs, controller transactions, and focused domain coverage | No native worker spawn, durable lease/mailbox, provider dispatch, worktree mutation, or concurrency receipt is available |
| Plugins and feature flags | Implemented domain contract / preview integration | Renderer/native-neutral registry, lifecycle/trust/settings state, prerequisite/cycle inspection, rollout/evaluation helpers, and controller history/events | Manifests and flags do not grant capabilities; native activation policy, isolation, persistence, and denial-path evidence remain open |
| SQLite profile initialization | Implemented | Checked-in schema, native initialization, WAL/full-synchronous pragmas, integrity health command, migration definitions through schema v20, immutable provider-definition revision guards, and executable SQLite validation | Native migration execution on this host, encrypted database distribution, backup/restore, purge/GC, and broad fault-injection recovery are not complete |
| Projects | Implemented | Native create/list/update commands, SQLite persistence, startup renderer hydration, and Project Settings metadata editor with browser-preview and native optimistic-concurrency paths | Project metadata does not imply memory/skill injection or a compiled context; archive/export/default-policy/icon/color workflows remain partial or planned; metadata save does not create a Project Twin revision or mutation receipt |
| Plan → Chat operation preflight | Preview / renderer contract | `plan-chat-operation.ts` models operation identity, Project/task/draft fingerprints, idempotency rehearsal, destination checks, empty-target checks, and explicit partial outcomes; focused preflight tests pass | The browser path remains sequential and renderer-local; no native atomic transaction, durable idempotency receipt, provider request, Chat persistence, or draft write is proven |
| Workspace folder grants | Implemented | Native folder picker, durable grant metadata, revoke, canonical containment checks, scoped directory listing and bounded text read | Read-only only; no indexing, watching, symlink following, write, execute, or project retrieval |
| Provider credentials | Implemented | Renderer submits a credential once; native code stores an opaque reference with the Windows-native credential backend | Recovery/rotation UX and broader vault failure testing remain incomplete |
| Provider profiles | Implemented | Native save/list/delete, endpoint/auth allowlists, provider settings UI and startup hydration | Azure OpenAI and declarative custom adapters cannot be saved |
| Provider discovery/health | Implemented | Native connection test and model discovery for supported adapters | Capability metadata remains an early schema rather than the final rich provenance model |
| Live provider text streaming | Implemented (durable journal slice) | Native adapters for first-party OpenAI Responses, OpenAI Chat Completions-compatible/local runtimes, Anthropic Messages, and Gemini `streamGenerateContent`; OpenAI Responses uses a typed `input` payload and `response.output_text.delta` / `response.completed` event path, while compatibility runtimes retain `messages` + `[DONE]` semantics. Provider-accepted start, text/reasoning/usage facts, terminal state and acceptance evidence are journaled atomically with projections. Provider-stream token snapshots also append a non-authoritative, partial, attempt-scoped usage-ledger row in the same transaction; split lifecycle snapshots are carried forward before emission so a later output-only event cannot erase earlier input/cache facts. Anthropic cache-read and cache-creation/write counters remain separate, including the nested `cache_creation` breakdown emitted by newer Messages responses. Renderer startup/reconnect replay follows a fixed watermark and preserves baseline text. The v14 immutable provider-attempt lineage fact and v20 immutable provider-definition revision are persisted with the frozen input, and prepared dispatch builds transport from the historical definition while retaining a live enabled/ownership check | Text chat only; no complete files, images/audio, tools, provider-final/invoice cost reconciliation, quota/health persistence, or fallback routing; Rust compile/runtime evidence for the provider path remains unavailable on this host |
| Request inspector telemetry projection | Partial (renderer contract plus bounded native usage slice) | `src/features/workspace/request-inspector-projection.ts` projects route, effort, timing, usage, throughput, quota, retry, cost and lineage with explicit unknown/coverage semantics; the native journal writes initial provider-stream token/counter observations to `run_usage_ledger` atomically with the compatibility projection and `usage.updated` event. The named content-free telemetry-read storage test was rebuilt and passed by direct native executable launch on this host; see `docs/audit/NATIVE_TELEMETRY_READ_TEST_RECEIPT_2026-08-14.md`. | The native proof is one focused bounded-read test, not a full Rust suite, packaged-app, clean-CI or end-to-end inspector verdict. Native timing observations, provider-final/invoice cost statements, quota/health persistence, complete replayed telemetry DTOs and broader live-inspector wiring remain incomplete. |
| Provider network policy | Partial | URL/auth validation, explicit local-network grant, resolved-address checks, redirect restrictions, limits, cancellation, redacted errors | Full proxy/TLS configuration, retry policy, DNS-rebinding matrix, provider conformance suite, and live smoke evidence are outstanding |
| Advanced model parameters | Partial | UI plus provider-aware preflight for the live gateway subset; unsupported explicit values block dispatch. Anthropic thinking now selects the legacy `budget_tokens` or newer adaptive `output_config.effort` shape by model family, preserves explicit max-token intent, and rejects legacy caps that cannot fit the requested thinking budget | JSON Schema, reasoning budget, penalties, logprobs, prompt caching, tools, service tier, per-run timeout/retry, and provider extensions are not connected |
| Provider model compatibility | Preview | Renderer matrix for Tools, Structured JSON, Reasoning, Vision, and Audio with Strict/Advisory modes, model notes, endpoint notes, and JSON/Markdown export; focused contract/UI tests pass | Capability rows are rehearsal data; no live model probe, provider dispatch, endpoint health correlation, or durable compatibility snapshot is performed |
| Conversation UI | Partial | Streaming timeline, session composer draft, stop, Markdown, copy, local search/filter, native desktop conversation hydration, empty/error states, a tested local message-backed prompt-navigation resolver (`src/domain/prompt-navigation.ts`), a tested renderer-local conversation map with prompt/output/issue keyboard jumps (`src/features/workspace/conversation-navigation.tsx`), and a searchable Composer Block Insert Studio for Markdown/code/data/math/layout starters | Unsent drafts do not survive restart; block templates and rendered Markdown/LaTeX remain renderer-local drafting aids. Native target persistence/IPC/startup hydration, global jump palette/indexed search, minimap/history/deep links/full accessibility, edit/fork/retry/tree, compare, queue, search index, import/export, and many message actions are not implemented |
| Voice input | Preview / browser capability | Composer microphone action now performs an explicit, visible browser `SpeechRecognition`/`webkitSpeechRecognition` gesture when the runtime exposes it; transcript results merge into the draft, listening can be stopped, and permission/capture/service errors remain visible with typed-input fallback. Covered by `voice-input.test.ts` and `voice-input.component.test.tsx` | This is not native Tauri microphone capture, durable audio storage, provider audio upload, transcription-provider routing, transcript correction history, wake-word/barge-in, playback/TTS, or packaged Windows evidence. Unsupported browsers remain typed-input only |
| Durable conversations and runs | Partial (journal slice implemented) | Native create/list hydration, atomic user/assistant/run preparation, exact attempt/frozen-input lineage, append-only normalized run journal, atomic dispatch/start/delta/reasoning/usage/terminal projection updates, renderer fixed-watermark replay with idempotent event/cursor state, outcome-unknown distinction, reconnect-safe event delivery, and interrupted assistant-message recovery are covered by the native storage/provider path and focused tests | Durable composer drafts, replay coverage UI, frozen context/parameter/capability snapshots beyond provider input, authoritative cost ledger, provider retry/fallback orchestration, and branch editing/retry/compare are not complete |
| Provider-attempt lineage and prepared dispatch proof | Partial / source-level and SQL verified | Schema v14 lineage plus schema v20 immutable provider-definition revisions, immutable/scope/hash guards, renderer-safe lineage receipt, and independent JSON/SQLite verifiers pass. Native preparation persists the lineage fact and content-addressed definition revision in the same transaction as frozen provider input. `Storage::load_prepared_provider_dispatch_proof` reads the input, lineage, active profile, and historical definition from one SQLite read snapshot; the gateway builds transport from that historical definition, resolves the opaque credential handle natively, and retains `mark_prepared_attempt_dispatching` as the final transaction-linearized barrier immediately before HTTP work. A read-only `provider_attempt_lineage_read` command and Run Inspector projection expose the exact historical content-free receipt by conversation/branch/run/attempt scope; historical reads continue after soft profile deletion, while dispatch fails closed for disabled/deleted profiles or missing/tampered revisions. See [`PROVIDER_ATTEMPT_LINEAGE_RECEIPT_READ_2026-09-24.md`](audit/PROVIDER_ATTEMPT_LINEAGE_RECEIPT_READ_2026-09-24.md) and [`PROVIDER_DEFINITION_REVISION_V20_RECEIPT_2026-09-25.md`](audit/PROVIDER_DEFINITION_REVISION_V20_RECEIPT_2026-09-25.md) | The source/static and SQL evidence does not prove Rust compilation, native runtime behavior, packaged Windows dispatch, concurrency, or end-to-end request-inspector hydration in a Tauri window. Secret bytes, credentials, cookies, raw URLs, prompts, response bodies, attachment bytes, and local paths remain outside durable lineage facts and renderer receipts |
| State revisions and branch-head CAS | Partial / unverified (native foundation) | Schema v11/v12/v13 migrations (`0011_state_revision_graph_cas`, `0012_state_revision_journal`, `0013_state_revision_operation_facts`), immutable/scope/head/idempotency guards, fixed-watermark indexes, append-only journal and operation-fact coverage, native `Storage::append_state_revision` and `Storage::read_state_revision_graph`, Tauri commands `state_revision_append`/`state_revision_graph_read`, fail-closed TypeScript bridge, source-level fixed-watermark and candidate-root tests, canonical child→parent edge direction documented and independently checked by the SQLite verifier. The current storage source also includes v15 durable run-control, v16 authoritative Goal/Task/Starter Workflow roots, v17 state-anchor guards, v18 immutable root-mutation receipts, v19 terminal Task-dependency insertion guards, and a source-level atomic Branch/Fork apply path with deterministic child IDs and terminal receipts; root revision paths have expected-head CAS, stale-head rejection, receipt-scoped replay, and payload-drift handling. | Rust toolchain/runtime evidence is unavailable on this host; matching run-journal fact, original-receipt replay, implicit-parent canonicalization, native runtime exercise of the edge contract, full native CAS/rollback/branch-integrity matrix, recovery/reconciliation, close/reopen and two-client concurrency evidence remain outstanding. Pause/resume, Continue, immutable edit/retry and active-run compare stay planned |
| Authoritative Goal / Task / Starter Workflow roots | Partial / source-static and SQLite verified | Checked-in schema v16–v19 tables, state-anchor and immutable-receipt guards, terminal Task-dependency guards, and source-present native/renderer commands for Goal and Task create/read/list/revision/lifecycle (plus Task dependencies) and Starter Workflow create/read/list/revision/lifecycle/enabled updates. `verify-authoritative-root-contract.py --require-api` and the run-control storage probe pass against the current tree. | This is source/static and executable SQLite evidence, not proof of Rust compilation, native Tauri IPC, packaged Windows behavior, or multi-client concurrency; workflow snapshots remain `executionDisposition = "preview-only"` and do not authorize execution |
| Context inspector | Preview | Context/run/control panels communicate intended provenance and parameter behavior; Answer/Run surfaces now show renderer-local citation, memory, and skill receipt candidates with scope, origin, confidence, version, and frozen/not-frozen labels | Not yet backed by the final compiler, persisted snapshot, exact tokenizer accounting, retrieval decisions, native memory/skill selection, or authoritative replay |
| Attachments and extraction | Partial (native admission foundation) | Native draft/blob ownership, immutable binding receipts, deterministic source-manifest construction, planning-only bridge plan/stage receipt persistence, text-only dispatch fail-closed guards, exact-set replay protection, v9→v10 provenance/provider-stage migration hardening, and file-backed close/reopen reconstruction tests | No provider carrier/upload, local transform executor, OCR/PDF/DOCX extraction, chunking, citation path, renderer IPC hydration or enabled attachment send UI; unknown canonical MIME is rejected atomically; native Rust verification remains unavailable on this host |
| Project indexing and grounded retrieval | Planned | Product/security/harness contracts and honest read-only grant state | No FTS/vector indexer, watcher, retrieval, context compiler integration, or grounded file/page citations |
| Artifacts / Library | Preview | Renderer screens, cards, Markdown rendering, domain contracts, and Artifact Document Studio checkpoints with local save/restore/clear and word/sequence summaries | No native artifact persistence or revision receipt, sandboxed HTML/SVG/Mermaid preview, filesystem write, or durable export flow |
| Memory | Preview / renderer workbenches | Memory Proposal Inbox and typed scope/mode controls are lazy-mounted in the Memory screen; proposal decisions, risk/provenance/revision signals, undo/redo/reset, and boundary copy are covered by focused renderer tests | No native proposal/approval receipt, durable memory storage/retrieval, contradiction resolver, exact run-level “used in this answer” record, or provider context injection |
| Skills | Preview / renderer workbench | Skills screen includes a Global × Project activation matrix with inherited/manual states, explicit project overrides including explicit Off, review gating, project-to-project added/removed/changed/unchanged diffs, permission-diff preview, undo, reset, and JSON/Markdown rehearsal | No native package store, `SKILL.md` import/editor, install/update/remove lifecycle, activation loading, generation-from-run, permission grant, or runtime injection |
| Extensions / MCP permission review | Preview | Renderer-local risk heuristics classify extension capabilities, effects, and trust signals; reviewers can choose Allow/Ask every time/Deny, scope and expiry, rationale, bulk review, undo, and JSON/Markdown export | No native grant, approval receipt, extension install/activation, provider request, process start, or durable policy write |
| Diagnostics/export/backup | Preview / partial | Diagnostics Session Workbench exposes redacted session/event export previews with visible/all scopes, JSON/JSONL manifests, exclusions, validation checks, and download-only retention labels | Native log collection, encrypted backup/verified restore, durable import, deletion workflow, provider upload, and filesystem-backed bundle assembly remain unavailable |
| Security policy preview | Preview | Renderer-local Balanced/Developer/Lockdown/Explore-all profiles, fine-grained policy controls, diff review, import/export, undo/redo/reset, and Project-scoped draft labeling | Does not calculate effective native policy, change OS permissions, grant execution authority, or persist a policy receipt |
| Media generation | Preview | Image/video/audio capability catalog, endpoint/model routing rehearsal, artifact gallery, and “use as next direction” draft handoff | No provider capability probe, upload, generation request, artifact persistence, download provenance, or native media capability snapshot |
| Toolchains / compiler catalog | Preview / planned runtime | 13-ecosystem catalog, search/filter/detail panels, and bounded command-template rehearsal for selected entries | Compiler discovery, PATH resolution, process launch, artifact writes, installation, and execution authority remain Planned |
| Universal search / Command Center | Preview | Scoped renderer search across command, Chat, Message, Project, File, Memory, Skill, Library, Provider, and Model records; `> @ # ? ~ % & : ^ !` prefixes, breadcrumbs, and local activation previews have focused coverage | No native full-text/indexed search, filesystem enumeration, provider discovery request, durable search index, or command execution is performed |
| Workspace export profiles | Preview | Bounded session-only export/import profiles with scope, redaction, format, selection validation, bulk category controls, duplicate review, apply/undo, and JSON download rehearsal | No durable profile store, workspace file mutation, native import, or filesystem-backed bundle assembly |
| Git / CI workbench | Preview | Renderer-local staging/commit/branch/CI/release rehearsal with searchable activity history, Ready/Watch/Planned release-evidence matrix, and JSON/Markdown handoff preview | No Git mutation, commit, push, PR, CI dispatch, release artifact, or durable audit journal is performed |
| Science Notebook Lab | Preview | Protocol/observation/model/export workbench with editable review state, deterministic simple-pendulum prediction, residual/RMSE checks, assumptions/limits, and JSON/Markdown handoff; focused tests pass | Chemistry, mathematics, and biology templates are planned; no instrument, hardware, retrieval, solver, provider, filesystem, or durable notebook operation is run |
| Training / learning control | Preview | Renderer-only training control center and RLAIF lab expose dataset admission, holdout/agreement controls, schedule/checkpoint previews, export, and reset; the Evaluation Rubric Workbench adds preset/custom criteria, score scales, adjudication paths, and deterministic weight normalization | No evaluator/provider request, model evaluation job, training label, model training, weight update, checkpoint write, durable dataset mutation, or cloud job is performed |
| Harness evidence register | Preview / research input | Dated clean-room register and capability synthesis use pinned DeepSeek Harness, OpenAI Codex, and official Claude Code revisions from September 24, 2026; revision/date/scope metadata is exportable for review | Upstream source inspection does not prove Omnia feature parity, runtime behavior, provider health, persistence, concurrency, authority, or license transfer; upstream code is not imported or executed by the preview |
| Accessibility and visual quality | Partial | Semantic feed/dialog behavior, keyboard command palette, theme/density/motion controls, responsive CSS | Full Windows screen-reader, high-contrast, IME, 200% scaling, visual regression, and desktop E2E gates remain outstanding |
| Background work / Agent Mesh | Preview | Agent Mesh, supervisor, reconciliation, worktree, harness, and provider-fault workbenches expose renderer-local queue, mailbox, lease, policy, signal, export, search/filter, and bulk Hold/Resolve/Reset projections | No worker spawn/reassignment, durable lease/mailbox, worktree mutation, native scheduler, provider dispatch, or concurrency receipt is available |
| IDE, terminal, Git, browser and computer-use | Deferred | Contracts reserve compatible extension points | Commands/capabilities are absent until their sandbox, permission, audit, cancellation, and recovery systems ship |
| Autonomous coding and multi-agent execution | Deferred | Post-Chat Complete roadmap only | No hidden write/execute/browser/computer capability is advertised |

## Historical September 15, 2026 verification notes

The current working tree is the authoritative source path
`C:\Users\khang\source\repos\omnia`; it has no Git commits and is not an
immutable release snapshot. Fresh source/static and SQLite evidence on that
September 15, 2026 snapshot was:

```text
python -m compileall -q docs scripts tests                                                                         PASS
python -m unittest discover -s tests -p 'test_*.py' -q                                                            PASS (69 tests)
python scripts\verify-rust-helper-definitions.py                                                                  PASS (85 helpers)
python scripts\verify-authoritative-root-contract.py --require-api                                                PASS (schema v19; root API detected)
python scripts\verify-run-control-storage.py                                                                       PASS (nativeRuntime: not-tested-by-this-probe)
python scripts\verify-run-control-schema.py                                                                        PASS
python scripts\verify-run-control-contract.py                                                                      PASS
python scripts\verify-cursor-authority-contract.py                                                                 PASS
python scripts\verify-state-revision-schema.py                                                                      PASS
python scripts\verify-provider-attempt-lineage-schema.py                                                          PASS (lineage verifier scoped to v14)
python docs\validate_attachment_schema.py                                                                            PASS (SQLite 3.50.4; 8 invariant groups)
```

The global storage source declares `SCHEMA_VERSION = 19`. The run-control
storage probe verifies the v15–v19 suffixes, file-backed close/reopen
persistence, rollback, idempotency, immutable/scope guards, authoritative-root
receipts, dependency-cycle protection and terminal-dependency guards. The
authoritative-root verifier reports seven root tables, 65 authoritative
columns, 36 immutable/scope triggers, three root-receipt triggers and two v19
terminal-dependency guards; it also detects all required native Goal, Task and
Starter Workflow capabilities. The provider-lineage verifier intentionally
reports its scoped v14 migration receipt because that verifier covers the
lineage suffix, not the global storage version.

These are independent Python, SQL/schema and source-contract results; they are
not equivalent to native Rust runtime evidence. The host has no `cargo`,
`rustc`, `rustfmt` or `rustup`, so Rust compilation, native Tauri runtime,
packaged Windows smoke, native close/reopen and concurrency behavior, and
provider HTTP behavior remain **unavailable/unverified**. State revisions,
run-control and authoritative roots therefore remain partial at the native
runtime boundary.

The v14 prepared-dispatch proof is source-reviewed as a two-stage defense:
`load_prepared_provider_dispatch_proof` reads all proof components from one
SQLite read transaction, then
`mark_prepared_attempt_dispatching` revalidates scope, lineage and definition
integrity in a final write transaction immediately before the provider HTTP
future can be polled. This closes the mutable-profile/credential TOCTOU seam in
the prepared path without persisting or rendering secret material. The review
is recorded in [`PROVIDER_ATTEMPT_LINEAGE_BOUNDARY_CONTRACT_AUDIT_2026-09-11.md`](audit/PROVIDER_ATTEMPT_LINEAGE_BOUNDARY_CONTRACT_AUDIT_2026-09-11.md).

At that September 15 checkpoint, no fresh npm/typecheck/build or packaged-app
receipt was claimed. The Project Twin generated projection was stale against
the working tree (`npm.cmd run twin:check` requests regeneration of
`docs/project-twin/manifest.json`, `graph.json` and `atlas.html`), so it is not
current-snapshot evidence. These source/projection boundaries do not provide
native compile, packaged Windows smoke or release-signing evidence.

The preserved Phase 1 source manifest remains historical provenance. Its current
verification reports 163 manifest entries versus 668 source files, with 1
missing, 506 extra, 70 mismatched and 1 structural-order finding. This is a
stale frozen release-manifest failure, not a failure of the current
source/schema gates; the release lane remains blocked until a new candidate
source snapshot is intentionally frozen and rebuilt.

## September 19, 2026 continuation evidence (historical)

The header and capability matrix above describe the current working tree. The
following checks were reproduced on September 19, 2026 at this working-tree
checkpoint during the UI-first continuation. They are source/static, renderer, schema, and
SQLite checks; they do not promote the product beyond an unsigned internal /
developer preview:

```text
python -m compileall -q docs scripts tests                                               PASS
python -m unittest discover -s tests -p 'test_*.py' -q                                   PASS (70 tests)
python scripts\verify-rust-helper-definitions.py                                         PASS (85 helpers)
python scripts\verify-authoritative-root-contract.py --require-api                       PASS (schema v19; all root APIs detected)
python scripts\verify-run-control-storage.py                                             PASS (nativeRuntime: not-tested-by-this-probe)
python scripts\verify-state-revision-schema.py                                           PASS
python scripts\verify-provider-attempt-lineage-schema.py                                 PASS (lineage verifier scoped to v14)
npm.cmd run typecheck:app                                                                 PASS
npm.cmd run build:renderer                                                                PASS (2056 modules transformed)
npm.cmd run check:source-ledger                                                           PASS (94 sources)
```

The browser development surface remains available at
`http://127.0.0.1:1420/`. At this checkpoint, the source ledger and Project
Twin were regenerated on the same snapshot:

```text
npm.cmd run check:source-ledger                                                           PASS (94 sources)
npm.cmd run twin:bootstrap                                                                PASS (same frozen working-tree snapshot)
npm.cmd run twin:check                                                                    PASS (same frozen working-tree snapshot; staleItems=0)
```

These generated projections are current for that frozen working-tree snapshot,
but they remain evidence projections rather than native compile, packaged-app,
or release-signing proof.

The native boundary is unchanged: this host has no `cargo`, `rustc`,
`rustfmt`, or `rustup`, so Rust compilation, native Tauri IPC execution,
packaged Windows smoke, native close/reopen and concurrency behavior, and
provider HTTP behavior remain unavailable/unverified. Renderer previews,
source verifiers, and SQLite probes must not be described as native runtime
proof.

## Supported provider surface

| Provider family | Save/test | Model discovery | Live text stream | Notes |
|---|---:|---:|---:|---|
| OpenAI | Yes | Yes | Yes | First-party `openai` profiles now compile to the Responses adapter; OpenAI-compatible/local profiles remain on Chat Completions. Native Rust/runtime evidence is still unavailable on this host |
| Anthropic | Yes | Yes | Yes | Messages API with normalized text/reasoning-summary events and explicit cache-read/cache-write usage; nested `cache_creation.ephemeral_*_input_tokens` is recovered when the top-level cache-creation counter is absent or zero |
| Google Gemini | Yes | Yes | Yes | `streamGenerateContent`; fixed Google API-key header path in this preview |
| OpenAI-compatible | Yes | Yes | Yes | `/models` plus `/chat/completions`; actual compatibility depends on the endpoint |
| Local compatible runtime | Yes, with explicit local-network grant | Yes | Yes | Loopback/LAN compatible endpoint; no authentication or allowlisted supported auth schemes |
| Azure OpenAI | No | No | No | Shown as Planned; deployment and API-version routing are not implemented |
| Declarative custom adapter | No | No | No | Shown as Planned; manifests and custom-header policy are not implemented |

Provider “Yes” means the transport path exists; it does not mean every native feature of that provider is supported. Capability and parameter support must come from the selected model/adapter and current preflight, never from provider branding alone.

## Historical verification snapshots

The observations below are date-qualified historical records. Run the commands
yourself against the exact source manifest or checkout you intend to use before
making a current-snapshot or release claim. The preserved Phase 0 executables
predate the current source and are not evidence for the Phase 1 preview.

| Check | August 12, 2026 observation |
|---|---|
| Markdown local links | Pass for the root and documentation indexes |
| SQLite schema validator | Pass at this snapshot: 24 tables, 13 indexes, 2 triggers |
| Source revision / provenance | A release candidate must be frozen by `docs/releases/omnia-0.1.0-phase1-preview-source.sha256`; the candidate-specific release-evidence file records the manifest hash and build environment actually used |
| Combined renderer/native gates | Latest source verification passes 60/60 renderer tests, production renderer build, Rust format, strict Clippy, 38/38 native tests, schema validation, ACL validation, and direct source-manifest hygiene checks; only the candidate-specific release evidence may claim that these gates, a manifest, and packaged artifacts belong to one immutable chain |
| Windows packaging | Tauri is configured to produce distinctly named Phase 1 portable and NSIS artifacts. Treat files in `artifacts/` as diagnostic until the candidate-specific evidence proves they were built after the referenced source freeze |
| Packaged Windows smoke | Required before a candidate verdict: native handshake, effective-profile hydration, discovery, streaming, cancellation/restart, durable hydration, shortcuts, project truthfulness, and window controls. Folder-grant acceptance may remain partial, and exact 800 × 600 behavior must remain unverified unless directly observed |
| Public-release infrastructure | **Not ready:** Authenticode signing, updater/rollback, SBOM, clean-VM install/upgrade/uninstall, and release workflow evidence remain outstanding |

The CI workflow is the intended clean-run gate. It runs renderer checks, Rust formatting/Clippy/tests, and the SQLite schema validator on Windows. A phase/release claim requires the additional evidence listed in [`QA_STRATEGY.md`](QA_STRATEGY.md), not merely a green unit-test lane.

Current August 14, 2026 working-tree evidence also includes 50 renderer test
files with 313 passing tests, the Omnia Ultra spec validator, Rust format/check,
and native journal integration tests in source. A rebuilt `omnia_native`
executable directly ran and passed the one named bounded, attempt-scoped,
content-free telemetry-read test on this host; its exact receipt is
`docs/audit/NATIVE_TELEMETRY_READ_TEST_RECEIPT_2026-08-14.md`. The earlier
`0xc0000139 (STATUS_ENTRYPOINT_NOT_FOUND)` result remains historical evidence
for a pre-fix target in `docs/audit/NATIVE_TEST_LOADER_RECEIPT.md`; it no
longer blocks that named current target, but it also does not prove the full
native suite, packaged app or CI lane.

The August 15, 2026 specification-integration snapshot is recorded in
`docs/audit/OMNIA_ULTRA_SPEC_INTEGRATION_RECEIPT_2026-08-15.md`. It verifies
the 55-requirement/55-capability Ultra registry, 52 renderer test files with
318 passing tests, TypeScript typecheck, production build, bundle budget, Rust
format and `cargo check --all-targets`, plus a regenerated/checking Project
Twin. The full `cargo test --all-targets` process still exits before Rust test
discovery with `0xc0000139 (STATUS_ENTRYPOINT_NOT_FOUND)` on this host; this is
not a full native-suite pass and does not supersede the narrower focused native
telemetry receipt.

## Release verdict and freeze gate

Current tree classification: **eligible only for the Omnia 0.1.0 Phase 1 Provider Preview lane as an unsigned internal/developer preview after its release gate closes.** The matching release-evidence file becomes authoritative only when it records one coherent source-freeze, build, packaged-smoke, profile-restore, and artifact-hash chain:

1. stop all writers and record an immutable source revision or source-manifest hash;
2. run `npm run check`, Rust format/Clippy/tests, the SQLite schema validator, and `git diff --check` from that exact snapshot;
3. build an NSIS candidate without overwriting the preserved Phase 0 artifacts;
4. record the source revision, Node/npm/Rust versions, `package-lock.json` hash, artifact sizes/timestamps/SHA-256 values, Authenticode status, and gate results;
5. run packaged Windows smoke against the explicitly named Phase 1 executable, including the real native handshake, empty native catalog, no-provider path, project creation, read-only workspace-grant boundary, local-compatible streaming/cancellation, restart hydration, window controls, and keyboard path; record exact 800 × 600 behavior as unverified unless directly observed;
6. label the result only **Omnia 0.1.0 — Phase 1 Provider Preview** and **unsigned internal/developer preview**.

Do not label this candidate Chat Complete, production, public beta, secure/hardened, signed, updater-enabled, or externally-provider-verified. Public distribution remains blocked by the additional Phase 5 and release-candidate gates in [`QA_STRATEGY.md`](QA_STRATEGY.md).

## Updating this file

When a capability moves forward:

1. verify the normal Windows desktop path, not only browser preview;
2. cite the source/tests or release evidence that justify the new status;
3. keep the limitation column—do not collapse “some support” into an unqualified Yes;
4. update the root README when setup, artifact names, major boundaries, or user-visible supported providers change;
5. update normative specs only when the intended contract changes, not merely because implementation catches up;
6. never mark a UI screen Implemented when its native persistence, permission, failure, deletion, and recovery paths are still placeholders.

## September 27, 2026 UI-first continuation receipt

The current renderer wave extends the visible preview surface with richer
composer Markdown/LaTeX structure views, task-aware model-route fit rehearsal,
media endpoint profile editing/export, workflow canvas rehearsal, citation
graph exploration, Agent Mesh supervision projections, observability evidence
triage, and skill-package field diffs. These surfaces are intentionally
renderer-local and session-only: they do not call a provider, execute a
compiler/toolchain, spawn agents, acquire leases, write telemetry, persist
settings, or mutate files.

The wave-specific focused suite passed 6 test files / 35 tests after fixing
the lazy Markdown first-paint fallback and the skill resource/tag baseline
classification. The same frozen snapshot also produced:

```text
npm.cmd run typecheck:app -- --pretty false       PASS
npm.cmd run build:renderer                       PASS (2,072 modules transformed)
npm.cmd run check:imports                         PASS (362 production modules; 727 local imports)
npm.cmd run check:typography                      PASS (106 stylesheets)
npm.cmd run check:hit-targets                      PASS
npm.cmd run check:acl                             PASS
npm.cmd run verify:cursor-authority               PASS
npm.cmd run verify:authoritative-root              PASS
git diff --check                                  PASS
npm.cmd run smoke:preview                         PASS (HTTP 200, Omnia content, HMR)
npm.cmd run source-ledger:generate                PASS (94 sources)
npm.cmd run twin:bootstrap                         PASS (twin-a4cd416bb5c59985)
```

The aggregate JavaScript budget remains an explicit watch/fail and was not
relaxed: `3,807,492 B` versus the unchanged `2,150,400 B` budget. Vite still
reports that `agent-mesh-supervisor-preview.tsx` is both dynamically and
statically imported. The browser preview remains available at
`http://127.0.0.1:1420/`; native Tauri/EXE launch, provider HTTP, durable
persistence, compiler execution, model training/checkpoints, and real agent
coordination remain unverified.

## September 27, 2026 Omnia Labs visible hub

Home Operations Deck now contains a lazy `Omnia Labs` gallery so the UI-first
surfaces are reachable without navigating through implementation-only paths.
The gallery currently exposes rich Composer, Media Endpoint Profiles,
Observability Evidence, Citation Graph, Workflow Plan, Memory Lifecycle,
Finance Planning, Science Notebook, and Dataset Pipeline previews. This is a
renderer gallery, not a native capability grant: the surfaces remain
session-local and do not imply provider calls, file access, tool execution,
agent leasing, durable settings, financial account synchronization, or model
training/checkpoint writes.

## September 30, 2026 bounded Project Deck continuation

The Project Deck policy summary now exposes a renderer-session JSON/Markdown
format selector for inspection, copy, and browser download. Its boundary text
explicitly says that the preview does not collect or export credentials,
prompts, responses, cookies, file bytes, or local paths. The Signals tab also
shows a semantic project heading and renderer-only boundary while its optional
module loads, avoiding an anonymous loading state.

Focused evidence for this moving tree is 6/6 policy tests and 23/23 Project
Deck tests. The standard renderer build hit host `ENOSPC` on the C: output
volume; the same renderer build passed to an alternate D: output directory
(2,085 modules, with the existing Vite chunking warning). The browser smoke
verified the Markdown payload and Signals fallback/loaded state with no console
warning/error entries. This remains preview/browser evidence; full app
typecheck is still unverified from the earlier timeout, and native/provider,
compiler, durable persistence, agent-coordination, and model-training behavior
remain outside the evidence boundary.

## September 30, 2026 Settings navigation and overflow repair

The Settings renderer received a focused usability repair for the compact
navigation map and category rail:

- The compact pinned-section rail is now a single non-wrapping row with an
  internal horizontal scroll surface. It no longer expands into a second tall
  banner at narrow widths.
- The unexplained trailing chevron was removed from the Settings category
  buttons; the button itself remains the tab affordance and keeps its keyboard,
  selected-state, and title semantics.
- `Customize` now opens the renderer-local map editor and brings its body into
  the visible Settings scroll region; `Hide map` closes it again.
- Diagnostics descriptions that were being clipped with `ellipsis/nowrap` now
  wrap within Settings so evidence and export explanations remain readable.

Focused evidence from the moving tree:

```text
src/features/workspace/settings-navigation-transfer.test.tsx  PASS (3 tests)
src/features/workspace/settings-screen.test.tsx                PASS (8 tests)
npm.cmd run check:typography                                   PASS
npm.cmd run check:hit-targets                                  PASS
npm.cmd run smoke:preview                                      PASS (HTTP 200, Omnia, HMR)
```

Live browser preview evidence at `http://127.0.0.1:1420/` used a 319 × 644
viewport. The compact map measured 111px tall with a 34px pinned rail;
the rail's content scroll width was 418px inside a 253px viewport, so chips no
longer widen or overlap the Settings layout. All eight Settings categories
loaded without a lazy-surface error; the browser-only renderer scan found no
remaining non-scrollable text clipping after the targeted wrap repair (the
remaining 8px lifecycle-stage overflow is the intentional connector arrow
outside its horizontally scrollable track).

This is renderer/browser-preview evidence only. It does not verify native
Settings persistence, packaged Tauri layout, provider behavior, or durable
navigation profiles.

## September 30, 2026 Project policy evidence hardening

The Project Deck policy summary now makes evidence gaps explicit instead of
collapsing them into a generic unavailable label:

- context token estimates carry an explicit `unknown`/`heuristic` status and a
  reason; blocked context (missing access or over-budget) withholds the estimate
  rather than presenting a misleading number;
- provider-reported cache is exported as `unknown` with a reason that this draft
  did not inspect provider counters, keeping local reuse separate from provider
  cache billing evidence;
- policy exports describe their exact metadata boundary (credential bytes, raw
  prompt/response bodies, cookies, file bytes, and local paths are excluded)
  without claiming that the whole renderer never held such data;
- the compaction threshold control is disabled when compaction itself is
  disabled, while retaining its renderer-local draft value for undo/reset.

Focused evidence from the moving tree:

```text
src/features/workspace/project-policy-summary.test.tsx  PASS (7 tests)
```

This remains renderer-session/browser-preview evidence. It does not persist a
project policy, inspect provider cache usage, compile context, dispatch a
provider request, or establish native/Tauri behavior.

## September 30, 2026 Project runtime posture evidence boundary

The Project Deck runtime posture strip now keeps cache authority explicit when
it aggregates multiple provider usage observations:

- `authoritative` is exposed only when every included provider observation is
  authoritative;
- a mixture of authoritative and non-authoritative observations is labeled
  `mixed`, and an all-non-authoritative set is labeled `not-authoritative`;
- an empty observation set remains `not-observed`, while local renderer reuse
  continues to be kept separate from provider-reported cache counters.

Focused moving-tree evidence:

```text
src/features/workspace/project-runtime-posture.test.tsx  PASS (4 tests)
src/features/workspace/project-policy-summary.test.tsx    PASS (7 tests)
src/features/workspace/project-control-deck.test.tsx     PASS (23 tests)
Combined focused suite                                     PASS (34 tests)
```

The policy history updater also keeps range-coalescing state immutable and
React-pure. Its history is now lifted into a Project Deck host-owned,
project-keyed renderer-session store, so switching Snapshot ↔ another tab
restores the draft and its undo/redo history without mounting hidden duplicate
content. No durable project policy is claimed.

## September 30, 2026 Context evidence convergence

The context preview surfaces now consume one shared, fail-closed availability
contract instead of independently reducing a Project to `contextHealth`:

- `nativeContextEvidenceFromOverview` maps an Overview with a context revision,
  source-event watermark, and explicit status to `native-current`,
  `native-stale`, or `native-failed` evidence. Candidate/unknown projections
  remain renderer-only.
- `buildProjectContextAvailabilityForProject` is used by Project Deck,
  Context Workbench, Chat Workbench, project activity/handoff surfaces,
  Projects/Home summaries, conversation scope/bridge, search, and Inspector.
  A current native revision can therefore remain visible as current evidence
  across those surfaces instead of being downgraded to “not indexed”.
- `ContextRunEvidenceCard` receives the same availability object in Context and
  Run Inspector views. A revision ID without a watermark is only preview
  evidence; stale/failed revisions and access/over-budget conflicts are shown
  as historical or blocked. Provider dispatch remains unavailable.
- Context estimates now distinguish `heuristic`, `unknown`, and `withheld`.
  Both missing-access and over-budget project health withhold aggregate token
  admission until native selection/compaction evidence exists. Manifest meter
  wording explicitly says `estimated tokens · renderer heuristic`.

Focused moving-tree evidence:

```text
Context/availability/manifest/compiler/preflight/workbench suite  PASS (33 tests)
Project Overview + Chat + Activity + Handoff + Control Deck suite PASS (84 tests)
npm.cmd run smoke:preview                                      PASS (HTTP 200, Omnia, HMR)
git diff --check                                               PASS
```

This is renderer and browser-preview evidence only. It does not prove Tauri or
packaged EXE behavior, provider tokenizer/cache output, native file reads,
context compilation, provider dispatch, durable context revisions, durable
policy/settings persistence, agent leasing, or model training/checkpoints.

## September 30, 2026 policy fail-closed regression closure

The Project Policy Summary now derives its exported `estimatedInputTokens` and
human-readable context detail through the shared `buildContextEstimate`
contract. A stale numeric estimate supplied alongside `missing-access` or
`over-budget` health is therefore emitted as `withheld` with a null aggregate,
not as current admission evidence. The Context Compiler accepts an explicit
`undefined` health projection under the repository's exact-optional TypeScript
settings, and the native-evidence contract test preserves literal Overview
status typing.

Focused evidence on the moving tree: **5 test files / 50 tests passed** across
Project Policy, Project Deck, Context estimate, Context availability, and Run
evidence; `typecheck:app`, import boundaries, typography, hit targets,
`git diff --check`, spec validation, and preview smoke all pass. The browser
preview was restarted on `http://127.0.0.1:1420/` and returned HTTP 200 with
Omnia and HMR markers. This remains renderer/browser evidence only; native
Tauri, provider dispatch, durable persistence, and packaged EXE behavior are
not claimed.

## September 30, 2026 Project route-evidence preview

Project Policy Summary now exposes a compact route-evidence strip for the main
agent, subagent, and automatic candidate. Each card shows the visible model,
provider/catalog source, reported context label, declared capabilities, and a
truthful state of `candidate`, `preview`, `unknown`, or `unavailable`.

The route receipt is also included in the renderer-local JSON and Markdown
policy previews. A connected native catalog is still described as a candidate;
the surface never treats metadata as a dispatch receipt, provider billing
result, permission grant, or durable route write. Adaptive and learned Auto
routing remain explicitly planned until evaluated native policy data exists.

Focused evidence on the moving tree: `project-policy-summary.test.tsx` **9/9
tests passed**, `npm.cmd run typecheck:app -- --pretty false` passed,
`npm.cmd run build:renderer` passed (2,086 modules transformed),
`git diff --check` passed, and `npm.cmd run smoke:preview` returned
`OMNIA_SMOKE_OK` with HTTP 200, Omnia, and HMR markers on port `1420`.

The policy slice now also keeps main-agent and subagent context delivery modes
independent (`mainMode` and `subagentMode`) while sharing the same reversible
renderer history. The UI exposes both selectors and the portable policy export
preserves both choices. The subagent default is `Partial`; this is a planning
receipt only and does not spawn a subagent or perform selective native context
delivery.

Updated focused evidence: `project-policy-summary.test.tsx` **10/10 tests
passed** after covering independent context changes, undo/redo, and JSON
export. This remains browser/renderer evidence; native context compilation,
agent spawn, provider dispatch, and adaptive routing are not claimed.

The same policy card now includes a user-side cache handoff rehearsal and key
strategy selector. `Local only`, `Provider hint when supported`, and `Hybrid`
are explicit planning choices; `Content hash`, `Source revision`, and `Request
scoped` make the intended reuse key visible. The export records these choices
under `cache.localReuse`, while `cache.providerReported` remains `unknown`.
The UI explicitly says that a rehearsal does not send a provider hint or prove
provider billing/cache accounting.

Updated focused evidence: `project-policy-summary.test.tsx` **11/11 tests
passed**, including cache handoff/key strategy export and the provider-cache
unknown boundary.

## September 30, 2026 Settings navigation and Chat context-preflight slice

The compact Settings navigation now uses a bounded `Quick jump` select instead
of a pinned-chip rail. The control is keyboard/ARIA-labelled, updates the
active section immediately, disables safely when no sections are available,
and keeps the full pin-map editor behind `Customize`. The supporting layout
rules allow labels and descriptions to wrap without introducing a secondary
horizontal rail or clipping the compact surface.

The Chat composer context-preflight rehearsal now exposes a renderer-local
delivery mode selector: `Auto`, `Full context`, `Summary + sources`,
`Manifest only`, and `Retrieve on demand`. Mode descriptions and the
source-selection lock state are included in the JSON/Markdown preview. The
current draft remains required in every mode, and the selected mode survives
closing and reopening the preflight panel while resetting when the Chat
changes. This is a planning surface only; it does not freeze native context,
perform retrieval, dispatch a provider request, or create durable cache
evidence.

Focused moving-tree evidence:

```text
Settings navigation + Settings screen + Project Policy     PASS (23 tests)
Chat context-preflight + composer integration               PASS (15 tests)
npm.cmd run typecheck:app -- --pretty false                 PASS
npm.cmd run build:renderer                                  PASS (2,086 modules transformed)
npm.cmd run smoke:preview                                   PASS (HTTP 200, Omnia, HMR)
```

The build still reports the known mixed static/dynamic import warning for
`agent-mesh-supervisor-preview.tsx`; no bundle-budget claim is changed. All
results above are renderer/browser-preview evidence only.

## September 30, 2026 cache/context route planning slice

The Project Control Deck now keeps cache/context route planning as a lazy,
renderer-local surface. Its contract distinguishes local object reuse from
provider-native cache planning and from provider-reported evidence. Stable
instruction, project, and tool-schema segments can be previewed as a planned
prefix while dynamic input remains in the request tail. The preview preserves
an explicit `unknown` provider-evidence state until a provider or verified
adapter receipt is actually supplied.

The stable-prefix token meter now fails closed: if any included segment lacks a
finite estimate, or if the aggregate would overflow, the result is `unknown`
rather than a misleading partial sum. Local reuse, provider hints, cache
billing, credentials, prompt bodies, and durable policy writes remain separate
boundaries.

Focused evidence on the moving tree:

```text
cache-context-routing-contract.test.ts     PASS (8 tests)
cache-context-routing-preview.test.tsx     PASS (2 tests)
Combined cache/context route suite          PASS (10 tests)
```

This slice has not been promoted to native cache/provider behavior; it is a
renderer planning receipt only.

## September 30, 2026 Run Journal replay-to-live handoff slice

The renderer now has one advisory run-event broker and a bounded event buffer
for notifications that arrive while a fixed-watermark journal replay is being
hydrated. Live records can update the inspector timeline immediately, but the
store keeps their handoff state separate from authoritative replay coverage.
After replay and bounded tail reads, the handoff is marked `covered`; epoch
conflicts, overflow, or an unavailable native replay fail closed as `degraded`
and retain an explicit explanation. The broker is process-wide to avoid a
second listener race between Composer and Inspector.

The handoff projection is renderer-side coordination only. It does not change
the native SQLite journal contract, add authenticated cursors, create provider
receipts, or promote a browser notification to durable evidence. Native Run
Journal remains `partial` until producer identity, idempotent continuation,
broader event vocabulary, post-terminal facts, and current Rust/runtime
receipts are wired and verified.

Focused evidence on the moving tree:

```text
Run Journal handoff/live/projection/IPC/telemetry/control suite  PASS (22 tests)
Run Journal timeline/store integration checks                     PASS (30 tests)
npm.cmd run typecheck:app -- --pretty false                         PASS
npm.cmd run smoke:preview                                           PASS (HTTP 200, Omnia, HMR)
```

The new handoff test fixture uses the complete renderer-facing journal record
shape, preventing typecheck from accepting a partial `{ id }` pseudo-event.
The browser preview and typecheck still do not prove native Cargo compilation
or packaged Tauri behavior.

## September 30, 2026 Context Preflight responsive polish

Context Preflight now co-sizes to its parent container. Long source labels,
gate details, omission reasons, and boundary text wrap instead of being
silently ellipsized; delivery-mode and exclusion-reason controls shrink with
the panel; and the mode selector exposes its description through
`aria-describedby`. Container queries collapse source cards and gates at the
panel width rather than relying only on viewport width. The duplicate toolbar
status region was removed.

Focused evidence remains **15/15 tests passed** across the Context Preflight
and Chat Composer integration surfaces. This is a renderer accessibility and
layout improvement only; no native context read or compile is claimed.

## September 30, 2026 Project Context route-load and provider catalog cleanup

The Project Control Deck Context tab now uses a stable loader around the
already-imported `ProjectContextWorkbench`. It keeps the lazy-surface boundary
and loading shell while avoiding the Vitest/dynamic-import stall that could
leave the Context panel blank after switching away from Snapshot. Temporary
deck/context load markers were removed from the renderer.

The provider catalog projection also distinguishes native configuration
metadata from a live connection receipt. Native profiles hydrate as
`configuration-validated` (or `not-configured`/`degraded`) until an explicit
connection/model-discovery path reports `connected`; model capability badges
are emitted only for capabilities confirmed by the catalog payload. Provider
kind normalization covers OpenAI-compatible, Anthropic, Gemini, Azure, custom,
and loopback/local endpoints.

Focused evidence on the moving tree:

```text
Project Control Deck suite                         PASS (26 tests)
Provider catalog contract suite                    PASS (6 tests)
Provider route comparison preview                  PASS (6 tests)
Model route presets preview                       PASS (3 tests)
npm.cmd run typecheck:app -- --pretty false        PASS
npm.cmd run build:renderer                         PASS (2,089 modules transformed)
```

The build retains the known mixed static/dynamic import warning for
`agent-mesh-supervisor-preview.tsx`; it is unrelated to the Context loader.
Provider connection and route surfaces remain renderer previews and do not
perform provider calls or claim durable routing authority.

## September 30, 2026 BYOK/provider route readiness surface

Settings Provider now exposes a compact `Provider route readiness` card in the
selected connection detail. It distinguishes `Ready for chat`, `Checking
route`, `Configuration validated`, `Credential review required`, and `Route
needs attention`; the model dropdown keeps `Automatic route` visibly separate
from discovered model choices and updates the shared renderer `modelProfileId`
when changed. The card is responsive so route status and model controls stack
without clipping on narrow panels.

Native profile hydration now treats enabled profiles with a present credential
as `configuration-validated` until an explicit live connection/model-discovery
receipt reports `connected`; missing or locked credentials remain
`not-configured`, and disabled profiles remain `degraded`. This avoids
presenting configuration metadata as a provider health success.

Focused evidence on the moving tree:

```text
Provider catalog + Settings provider route UI + dialogs + Settings screen  PASS (21 tests)
npm.cmd run typecheck:app -- --pretty false                              PASS
npm.cmd run smoke:preview                                                  PASS (HTTP 200, Omnia, HMR)
```

The route selector is renderer/settings UX only. It does not send a provider
request, expose credential bytes, persist native settings, or prove packaged
Tauri behavior.

## September 30, 2026 first-click/focus coverage ledger correction

The capability-ledger row for `OMNIA-CAP-UI-FIRST-CLICK` now points to the
actual renderer overlay primitives (`ModalSurface`, `PanelScrim`, and the
temporary panel-drawer focus contract) instead of unrelated multimodal storage
modules. A same-snapshot focused run passed **2 test files / 9 tests**, covering
initial focus, keyboard wrapping, Escape, focus restoration, scrim-only
dismissal, topmost-modal ownership, and narrow drawer behavior. The visual
fixture contract remains a separate browser-level check for a representative
command-palette overlay.

The capability stays **Partial**: this evidence does not cover every shell
control's first activation, Windows Narrator, screenshot/visual-regression
inspection, native persistence, or packaged Tauri runtime. Receipt:
`docs/audit/UI_FIRST_CLICK_FOCUS_RECEIPT_2026-09-30.md`.

## September 30, 2026 Library workbench picker and native boundary evidence

The Library activity now opens its thirteen optional workbenches through one
keyboard-native picker grouped into Research & writing, Prompt & evaluation,
Technical labs, and Media & assets. The previous multi-row tab rail was a
large fixed-height surface; the grouped select keeps the same lazy one-at-a-
time behavior while making the active workbench and renderer-only boundary
visible in a compact layout. The selected workbench still replaces the
previous surface rather than mounting all optional modules at once.

Native Boundary status now fails closed on protocol mismatch and treats a
session as accepted only when the protocol, session token, session epoch, and
required `run.stream.v1` capability are all present. Advertised and unavailable
capabilities have separate disclosures, and browser preview remains explicitly
separate from native evidence. A small copy regression was also fixed so the
capability count reads `capability`/`capabilities` correctly.

The context admission surfaces now keep aggregate estimates withheld for both
`over-budget` and `missing-access` project states. The composer does not pass a
misleading total estimate into the preflight surface, and the reference
compiler does not emit a decision ledger or provider-message projection while
admission is blocked.

Focused evidence on the moving tree:

```text
LibraryActivityScreen + NativeBoundaryStatus suites             PASS (10 tests)
Context estimate/preflight/compiler blocked-state suite         PASS (26 tests)
npm.cmd run typecheck:app -- --pretty false                     PASS for native-boundary slice
git diff --check                                                 PASS
```

These changes remain renderer/UI evidence. They do not claim a packaged Tauri
handshake, provider dispatch, durable context admission, OS sandbox, or native
permission authority.

## September 30, 2026 Approval Request Preview surface

Settings → Permissions now includes an `Approval Request Preview` after the
permission matrix, control center, preset lifecycle lab, and security policy
preview. It gives the user a compact exact-request rehearsal for operation,
target, rationale, approval scope, expiry, sandbox/network boundaries, and
secret handling. Four starting presets cover safe inspection, patch review,
research routing, and command review. The lifecycle can move through draft,
needs review, staged, revoked, and restored states with undo/redo/reset plus
JSON/Markdown copy, download, and import-preview actions.

Validation rejects empty or unsafe targets, missing rationale, invalid custom
expiry, secret-policy mismatches, and network/sandbox contradictions before a
request can be staged in the renderer. The boundary copy stays explicit: this
surface does not create a native grant, approval receipt, sandbox launch,
secret lookup, provider request, or execution authority. The native exact
approval broker remains a separate, not-yet-wired capability.

Focused evidence on the moving tree:

```text
Approval Request Preview contract + UI suite                    PASS (9 tests)
Security/Permission Matrix/Control/Settings suite                PASS (29 tests)
Combined renderer slice suite                                   PASS (77 tests)
npm.cmd run typecheck:app -- --pretty false                      PASS
npm.cmd run build:renderer                                       PASS (2,091 modules transformed)
npm.cmd run check:hit-targets                                    PASS
npm.cmd run check:imports                                        PASS
npm.cmd run smoke:preview                                        PASS (HTTP 200, Omnia, HMR)
```

The aggregate suite above is intentionally bounded to the touched surfaces.
It is not a native Cargo, packaged EXE, OS sandbox, provider-dispatch, or
durable permission receipt verification.

## September 30, 2026 accessibility/customization coverage ledger correction

The capability-ledger row for `OMNIA-CAP-UI-ACCESSIBILITY-CUSTOMIZATION` now
points to the actual appearance bootstrap and renderer preview surfaces rather
than remaining empty. A same-snapshot focused run passed **8 test files / 28
tests**, covering allowlisted theme/density/motion normalization, keyboard and
ARIA contracts, accessibility profiles, contrast/focus/reduced-motion preview
controls, palette/logo/style customization, reversible history, malformed-input
rejection, and portable preview import/export.

The capability is now **Partial**, not Verified: Windows Narrator, OS
high-contrast integration, screenshot/visual-regression inspection, durable
native settings, restart persistence, and packaged Tauri behavior remain open.
Receipt: `docs/audit/UI_ACCESSIBILITY_CUSTOMIZATION_RECEIPT_2026-09-30.md`.

## September 30, 2026 Prompt Intelligence coverage ledger correction

The `OMNIA-CAP-PROMPT-INTELLIGENCE` row now maps the existing Prompt Experiment
Studio and bounded Discuss controls instead of remaining empty/planned. The
same-snapshot focused run passed **3 test files / 20 tests**, covering reversible
prompt/persona editing, deterministic pair rehearsal and export, Enhance diffs,
explicit suggestion insertion, line comparison, reviewer lanes, bounded
next-action staging, Discuss mode selection, and truthful renderer boundaries.

The capability remains **Partial**: no multi-model/agent discussion, durable
prompt-revision lineage, canonical composer finalization, queue/provider
execution, or native persistence is proven. Receipt:
`docs/audit/PROMPT_INTELLIGENCE_RENDERER_PREVIEW_RECEIPT_2026-09-30.md`.

## September 30, 2026 Memory and Skills coverage ledger correction

The `OMNIA-CAP-MEMORY-SKILLS-PERSONAS` row now reflects the substantial
renderer-local Memory and Skills work already present instead of remaining
empty/planned. A same-snapshot focused run passed **14 test files / 73 tests**,
covering proposal/lifecycle/review/draft/provenance/scope surfaces, reversible
import/export decisions, activation review, project matrices, package/version
comparison, authoring, catalog/domain views, keyboard tabs, and scoped context
receipts.

The capability remains **Partial**: native durable scopes/revisions, signed
package/tool/MCP manifests, capability attenuation, provider injection,
restart recovery, deletion of derived indexes, and packaged runtime evidence
are not established. Receipt:
`docs/audit/MEMORY_SKILLS_RENDERER_PREVIEW_RECEIPT_2026-09-30.md`.

## September 30, 2026 Workspace Library coverage ledger correction

The `OMNIA-CAP-WORKSPACE-LIBRARY` ledger row no longer reports the current
renderer implementation as wholly planned. The Library preview and grouped
workbench picker now map to their source and focused tests. The same-snapshot
check passed **2 test files / 11 tests**, covering renderer-local conversation
organization and lifecycle rehearsal, scoped search, move keyboard/focus
behavior, and lazy workbench selection.

The status is **Partial** only: no native durable project/conversation/root
lifecycle, restart recovery, idempotent receipts, canonical import/export, or
cross-client conflict proof is established. Receipt:
`docs/audit/WORKSPACE_LIBRARY_RENDERER_PREVIEW_RECEIPT_2026-09-30.md`.

## September 30, 2026 Structured I/O and goal/roadmap preview continuation

The moving renderer snapshot now records two additional bounded UI slices.
Structured I/O provides typed source-kind/channel/stream metadata, bounded
format detection, raw-versus-normalized source inspection, line search,
deterministic preview hashes, JSON Schema rehearsal, visual schema editing,
portable export, and responsive narrow-panel behavior. Goal and roadmap
surfaces provide reversible goal/task editing, dependency health, list/board
views, roadmap/DAG/blueprint/acceptance tabs, critical-path rehearsal,
validated import/export, and Chat/Handoff preparation. Primary controls now
carry hover descriptions and container-query fallbacks to reduce clipping in
sidebar-sized panels.

Focused evidence on the moving tree:

```text
Structured I/O workbench + schema builder                 PASS (2 files / 15 tests)
Goal task studio                                           PASS (11 tests)
Project planning preview                                   PASS (16 tests)
npm.cmd run typecheck:app -- --pretty false                PASS
npm.cmd run build:renderer                                 PASS (2,094 modules transformed)
Capability ledger/path audit                               PASS
git diff --check                                           PASS
```

These surfaces remain renderer-session previews. Structured I/O still lacks
real syntax highlighting, ANSI/link sanitization, nested/incremental streaming
parsing, virtualization, and live Chat/tool-log integration. Goal/roadmap still
lacks durable Project Twin revisions, scheduler/queue leases, native agent
dispatch, restart recovery, conflict/idempotency receipts, and study-path
execution. Receipts:
`docs/audit/STRUCTURED_IO_RENDERER_PREVIEW_RECEIPT_2026-09-30.md` and
`docs/audit/GOAL_ROADMAP_PLAN_RENDERER_PREVIEW_RECEIPT_2026-09-30.md`.

## September 30, 2026 Chat-first composer, scope, and Settings navigation polish

The primary Chat surface now makes the previously ambiguous controls explicit.
The Project/Chat scope trigger is a labelled switcher with a visible `Switch`
affordance, a keyboard-navigable menu for current-scope Chats and Projects,
outside-click/Escape dismissal, and renderer-local selection feedback. The
header model/route control is actionable and opens the Parameters inspector;
Chat navigation and Chat actions are exposed as separately labelled toolbar
groups so the primary Chat workflow is discoverable instead of looking like an
unexplained chevron rail.

The composer keeps writing as the compact default. Advanced Markdown controls
now expose `More` and `Blocks` labels on wide surfaces, retain titles and ARIA
states, wrap into a bounded formatter rail instead of an unbounded horizontal
strip, and keep formatting/block popovers viewport-contained on narrow screens.
The existing Markdown, list, indent, code, and LaTeX actions remain
renderer-local previews with no provider dispatch implied.

Settings navigation was reorganized so the `Navigation map` lives beside the
category filter and tabs in the sidebar instead of occupying a full-width band.
The compact map uses a labelled `Quick jump` select; `Customize map` reveals the
portable pin/import/export editor without calling `scrollIntoView`, and changing
a Settings category still resets the selected panel and marked inner scroll
regions to their top. This removes the long horizontal strip that obscured the
main settings content.

Focused evidence on the moving tree:

```text
Composer editor + formatting suite                              PASS (38 tests)
Composer/mode/block/context + Chat/Settings combined slice       PASS (65 tests)
Conversation view + scope/header integration                      PASS (12 tests)
Settings navigation + category scroll suite                      PASS (12 tests)
npm.cmd run typecheck:app -- --pretty false                      PASS
npm.cmd run build:renderer                                       PASS (2,094 modules transformed)
npm.cmd run check:hit-targets                                    PASS
npm.cmd run check:imports                                        PASS
git diff --check                                                 PASS
npm.cmd run smoke:preview                                        PASS (HTTP 200, Omnia, HMR)
```

The evidence is renderer/browser and bounded interaction coverage. It does not
prove packaged Tauri behavior, native scope persistence, provider execution,
durable Settings writes, or native approval/sandbox authority. The build still
emits the existing warning that `agent-mesh-supervisor-preview.tsx` is both
statically and dynamically imported. The formatter rail and scope controls are
now less ambiguous, but broad visual regression and every optional workbench
remain outside this focused wave.

The same moving snapshot also maps the existing file/artifact workbench to a
partial capability: artifact cards and revision tabs, Markdown/code/math/table/
media document editing and rendering, session checkpoints and review notes,
bounded JSON/Markdown bundle import/export, file-root browsing projection, and
media metadata inspection. Focused evidence for these four surfaces is **26
tests passed**. Native file authority, OCR/extraction, upload/download policy,
durable derivative lineage, provider/model bridge execution, and artifact-byte
restart recovery remain unavailable. Receipt:
`docs/audit/FILE_ARTIFACT_BRIDGE_RENDERER_PREVIEW_RECEIPT_2026-09-30.md`.

## September 30, 2026 routing, cache, local-model, orchestration, and goal continuation

The Project Control Deck now exposes the next UI-first capability wave behind
the existing lazy workbench boundary. The Model tab includes user-managed
cache/context routing, per-role routing, local-model readiness and catalog
surfaces, adaptive Auto-routing/learning controls, and an Agent DAG
orchestration view. The Plan tab now includes the reversible Goal and Task
Studio alongside the existing planning preview. The DAG view includes the
prompt-driven orchestration planner, so a user can type one request and inspect
the proposed roles, context delivery mode, effort, model policy, agent cap,
signals, fan-out/fan-in gates, and critical path before any future dispatch.

The wave also corrected four integration errors found by a clean application
typecheck: adaptive candidate state is now narrowed to its contract union,
nullable cache counters are summed fail-closed, an unused local-model icon
import was removed, and the observability absolute-range availability flag is
used in the visible resolution status. No raw keylogging, secret capture, or
covert surveillance was added; learning remains an explicit renderer preview
with bounded/redacted boundaries.

Focused/current evidence:

```text
Clean app typecheck after integration fixes                         PASS
Renderer build                                                     PASS (2,099 modules transformed)
Cache/routing/observability/local-model/orchestration/goal suites   PASS (7 files / 44 tests, one worker)
Project Control Deck lazy workbench tests                           PASS (Context/Model/Plan/Chat paths)
Project Control Deck full focused file                             27/27 passed
```

The lazy workbench boundary was repaired so Context, Model, Plan, and Chat
surfaces resolve through an effect-based loader instead of creating a fresh
`React.lazy` resource during render. The export-only Conversation Actions
dialog now uses the same deterministic eager renderer path, so a fresh
single-worker run passes all 27 Project Control Deck tests.
The Model tab now keeps the five optional routing/local-model/learning/
orchestration workbenches collapsed by default. The user opens one disclosure
and chooses an inner workbench tab; only the selected surface mounts on demand,
with Role routing selected first. This keeps the core route-inheritance surface
visible without turning the tab into an uncontrolled wall of advanced cards or
starting five dynamic imports at once. The disclosure and inner selector are
renderer-local and do not change the native boundary.

This is renderer loading evidence only, not evidence that the newly mounted
surfaces dispatch or persist anything. The new surfaces are still
renderer/browser previews: no provider request, native cache billing/cache
handle, learned model policy, local-model download/runtime launch,
scheduler/agent spawn, durable goal write, approval, secret lookup, or native
execution authority is connected.

## September 30, 2026 overflow hardening and capability-ledger receipt

The Project Control Deck and Projects surface now use container-aware reflow in
addition to viewport media queries. Deck controls, tab groups, overview cards,
model options, chat rows, menus, saved-view controls, and grant rows collapse
against their actual parent width, with `min-width: 0`, bounded action menus,
and wrapped long text. This addresses the compact inspector/sidebar case where
the browser viewport is wide but the mounted surface is narrow. The Settings
navigation fix remains in place: the former full-width strip is replaced by a
sidebar `Quick jump` control.

The capability ledger receipt now records seven UI/domain capabilities as
`partial` (not `verified`): agent swarm, adaptive intelligence, provider cache,
main/subagent routing, context delivery/compaction, telemetry timeseries, and
local-model catalog/tuning. Each row links implementation modules, focused
tests, receipt evidence, current limitations, and a native/provider/runtime
next action. The ledger snapshot is `partial = 25`, `planned = 30`,
`verified = 0`.

Bounded evidence for this continuation:

```text
Renderer build                                      PASS (2,099 modules transformed)
Preview smoke                                       PASS (HTTP 200, Omnia, HMR)
Spec validator                                      PASS (122 Markdown, 52 JSON, 55 requirements/capabilities)
Source-ledger verification                          PASS (94 sources)
Hit-target contract                                 PASS (30 controls / 3 wrappers)
Import-boundary contract                             PASS (388 production modules / 792 local imports)
Capability-ledger UI-wave receipt                   PASS (7 rows promoted to partial, 0 verified)
```

The build still reports the pre-existing mixed static/dynamic import warning
for `agent-mesh-supervisor-preview.tsx`, and the JavaScript payload remains
over the fixed budget. These checks cover renderer/source contracts and the
browser preview only; they do not prove packaged Tauri behavior, native
provider dispatch, durable cache/telemetry persistence, OS sandboxing,
training, or real agent leases/mailboxes.

## October 1, 2026 compact Chat entry and mode controls

The empty Chat surface now makes the basic interaction discoverable in one
compact row: `Start a message` focuses the composer, `Prompts` reveals starter
actions only on demand, `Tools` opens the inspector, and the visible
+`Alt+Enter` affordance focuses the composer. Starter actions insert a
+renderer-local draft and restore composer focus; they are hidden after a Chat
+has messages. The composer mode selector visibly separates Ask, Create,
+Research, and Discuss. Create/Research/Discuss remain preview-only with Send
+disabled and a truthful status; their mode-control selections and local undo
+history survive closing and reopening the control popover.
+
+This slice changes no provider, native, permission, schema, or durable state
+contract. It is a renderer preview/partial interaction slice, not evidence that
+research, creation, discussion orchestration, or provider execution is wired.
+
+Bounded evidence:
+
+```text
+Chat starter/navigation/mode focused suites              PASS (29/29)
+App TypeScript                                             PASS (`npm.cmd run typecheck:app`)
+Preview smoke                                              PASS (HTTP 200, Omnia, HMR)
+Isolated Chat spot check                                   PASS (1280x800; prompts and mode controls functional; no document overflow)
+```
+
+Artifact: `artifacts/ui-chat-entry-1280-2026-10-01.png`. Browser-control
+runtime initialization was unavailable in this environment, so the image and
+interaction spot check used a separate headless browser and did not touch the
+user's browser tab. Native Tauri, packaged EXE, provider, and durable-storage
+behavior remain unverified.

## October 1, 2026 local cache inventory display filter

The Project Control Deck cache/context preview now exposes the remaining
PD-CTT-01C local inventory control as a four-state selector: `All`, `Reusable`,
`Invalidated`, and `Unknown`. The selector is renderer-session display state
over a redacted inventory; it does not delete native cache objects, modify
provider cache state, or claim provider billing evidence.

`Reusable` shows only rows currently eligible under the local reuse policy.
`Invalidated` shows only explicit invalidation markers, while `Unknown` shows
only explicit unknown-state rows. Stale and expired rows stay visible in `All`
until invalidation is rehearsed; that rehearsal marks only unpinned stale/expired
rows as invalidated and preserves pinned rows. The inventory export continues to
include the full redacted inventory and records the selected filter in that
inventory payload.

Bounded evidence on the canonical D: checkout:

```text
cache-context-routing-contract.test.ts                 PASS (14/14)
cache-context-routing-preview.test.tsx                 PASS (6/6)
Combined cache-focused suites                         PASS (20/20)
npm.cmd run check:imports                              PASS (394 modules / 806 imports)
App TypeScript                                          UNVERIFIED (bounded run produced no output)
```

This remains a renderer preview/partial slice. Native cache persistence,
provider-native cache evidence, billing, deletion, encryption, and restart
recovery remain unverified or planned.

## October 1, 2026 compact Plan workspace entry

The Project Control Deck Plan surface now starts with a clear two-way switch:
`Goals & tasks` (default) and `Roadmap & planning`. This makes the basic Goal
and Task workflow visible immediately while keeping the advanced Roadmap,
Task DAG, Blueprint, and Acceptance views available behind an intentional
+choice. The Goals surface keeps the native-authority Goals boundary and the
+renderer-session Goal and Task Studio together. The Roadmap surface mounts on
+first visit and remains mounted while hidden after that visit, preserving its
+renderer-local edits and undo/redo history during inner-surface switching.

The new switch uses explicit tab/tabpanel relationships, roving keyboard
+navigation, Home/End support, button titles, and reduced-motion-aware scroll
+behavior. No schema, permission, provider, native, or durable state contract
+changed. The capability remains a renderer preview/partial slice; browser
+native storage is still reported as unavailable and the Roadmap preview still
+labels Project Twin, scheduler, provider, and durable execution boundaries as
+planned.

Bounded evidence for this continuation:

```text
Project Control Deck focused suite                         PASS (31/31)
App TypeScript                                             PASS (`npm.cmd run typecheck:app`)
Renderer build                                             PASS (2,104 modules transformed)
Preview smoke                                              PASS (HTTP 200, Omnia, HMR)
+Isolated visual spot checks                                 PASS (1280x800, 960x720; no document overflow observed)
+```

Artifacts: `artifacts/ui-project-plan-goals-1280-2026-10-01.png`,
+`artifacts/ui-project-plan-roadmap-1280-2026-10-01.png`, and
+`artifacts/ui-project-plan-goals-960-2026-10-01.png`. The in-app browser
+runtime failed to initialize its kernel assets, so these images came from a
+separate headless browser and do not prove native Tauri, packaged EXE,
+provider dispatch, or durable storage.
