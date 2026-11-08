# Cycle 9 IDE and agent-workspace OSS research (2026-11-08)

## Scope, novelty and query ledger

- Retrieved: 2026-11-08 (Asia/Bangkok), cycle `rebuild-0007` follow-up.
- Queries issued: `open source everything super power pro max AI IDE editor workspace 2026`; `GitHub open source agent IDE workspace session persistence retrieval`; `GitHub Void Continue CodeEdit OpenHands architecture workspace files agent`; `open source local IDE file watcher dirty tabs permission-safe editor`.
- Discovery used GitHub `git ls-remote` and pinned raw source reads. No downloaded scripts, installers or postinstall hooks were executed; no credentials, browser profiles or private data were accessed.
- Deduplication: the repository/revision/path tuples below were checked against `docs/rebuild/SOURCE_REGISTER.json`, `NEW_IDE_CYCLE8_20261108.md`, and the earlier `NEW_IDE_OSS_20261108.md`. These exact tuples are new for this cycle. Existing Omnia extraction modules and prior Zed/Lapce/Theia/Proliferate/Volt/CodeEdit-related paths were not counted again.
- A repository name or README is discovery evidence only. Decisions below are based on the exact pinned files and retain their runtime/license limits.

## Reviewed sources

| Repository / revision | License evidence | Exact source path (SHA-256) | Observed contract | Omnia decision |
|---|---|---|---|---|
| [voideditor/void](https://github.com/voideditor/void) `b3166e7ef2aefbdfeb139445fdf248a561b85d4d` | Apache-2.0, `LICENSE.txt` (`955973b68db7484ca639f6797b5f6ebf01c2b693f87fa93dd6ccf2b0aec333a7`) | `src/vs/workbench/contrib/void/browser/void.contribution.ts` (`f03636cae7fc3f7d0ac1f1fb0555d1ea1d53e3b0d38428157c21f968bff71fbc`); `README.md` (`2c777505f607e418aa3744aa6544a1670338db5a851e3e1a6f2f099d1812feb9`) | The contribution entrypoint registers inline edit diffs, sidebar actions/pane, quick edit, autocomplete and settings as separate workbench contributions. README states the project is deprecated and no longer accepts contributions. | **Apply contract only:** keep IDE features split into independently registered capability modules and expose unavailable/deprecated provider state. **Reject** VS Code source/UI reuse and any claim that deprecation implies a supported provider. Add an Omnia test that a missing native capability yields an explicit unavailable state rather than a dead control. |
| [continuedev/continue](https://github.com/continuedev/continue) `5522c6f44ca0ac3528b37244818fbfa39b5af470` | Apache-2.0, `LICENSE` (`b14a17598cb08c4c7c82c070731126304e0a75d001ed59fb9ea3955a0b561802`) | `core/context/retrieval/retrieval.ts` (`bda6b3fee1698163de63040f2f7af20bd932086eb1c008178980553f078af399`); `core/core.ts` (`e073a7f5bc20d5920e5472b6d434118418deb7207336ff74800ce64b79c8e934`) | Retrieval receives workspace directories and configuration, supports optional embeddings/reranking and a bounded default final count (`DEFAULT_N_FINAL = 25`). The core composes indexing, context, history, compaction, tools and model configuration as separate services. | **Apply bounded retrieval and provenance:** IDE file context should record workspace scope, provider/configuration, selected count, truncation and unavailable embedding state; keep a hard top-k limit and cancellation. **Reject** Continue's service/UI code and provider assumptions. Add a negative test for a missing embeddings provider and a receipt showing the selected workspace roots. |
| [CodeEditApp/CodeEdit](https://github.com/CodeEditApp/CodeEdit) `fa2aebd86373211c78626074b53ab75010767575` | MIT, `LICENSE.md` (`a1c7f7ef3f326384c8edb428c9698654a4df4a4339149b4eccdac532f832678e`) | `CodeEdit/Features/CEWorkspace/Models/CEWorkspaceFileManager.swift` (`ea3e86053b12f47f278ef46107ba50222a59f3bb93a3da4610d473358d2dedfd`); `CodeEdit/Features/Documents/WorkspaceDocument/WorkspaceDocument.swift` (`d0c7f2f60290f60e40f6fde8a150569b342a1b751d8029ef0e23a52aa3833d9c`) | The file manager documents lazy tree caching, navigation/modification/listening to filesystem updates; only requested entries are materialized to avoid loading an entire large tree. The workspace document persists per-file URL state and exposes navigator/source-control filters. | **Apply behavior:** lazy directory expansion, explicit filesystem event refresh, stable workspace-scoped UI state and dirty/reload conflict handling. Add an acceptance check that opening a root does not enumerate all descendants, and that an external rename/delete produces a visible stale/missing pointer. **Reject** Swift/AppKit implementation and macOS-specific UI. |
| [All-Hands-AI/OpenHands](https://github.com/All-Hands-AI/OpenHands) `b8e87db15c5e204ad66a372970cbf25b2e486d31` | MIT, `LICENSE` (`e1d1fa9f3a8d7bef24449d488fcd8f00f8f272cac297bb9bed161eb6175b876`) | `src/api/event-service/event-service.api.ts` (`ca15c3a5180405ea21bbcf52901b64aa355f02cccbd82541562c205203065650`); `src/api/conversation-workspace.ts` (`7e6a640651cc571d7497c0bc82fd3b94ad24875ff44b12c7f1a98e0f2e918f36`) | Event history and live runtime endpoints are intentionally split across hosts; comments distinguish persisted event search from runtime event count/confirmation. Workspace helpers detect isolated Docker runtimes and resolve conversation working directories under a workspace root. | **Apply boundary and receipt ideas:** keep persisted replay/history separate from live native runtime events; include host/runtime and workspace-root identifiers on event receipts, and mark isolated/non-isolated workspace mode. Require confirmation for path-sensitive actions and distinguish unavailable runtime from empty history. **Reject** cloud API/client code and Docker assumptions; this is not Tauri or Windows proof. |

## Source notes and limitations

### Void
The exact contribution file is a registration surface, not the implementation of each editor feature. Its modular imports support a capability registry, but do not prove activation order, native permissions or runtime correctness. The README's deprecation notice is a product-lifecycle warning, not a reason to depend on Void. Omnia will use the modular boundary only.

### Continue
The retrieval function shows bounded selection and workspace-aware context inputs; the core import graph shows separation of indexing, context, history, compaction and tools. These TypeScript files do not prove retrieval quality, security of provider credentials, native file permissions or Tauri behavior. Omnia must capture actual local file reads and explicit unavailable/error receipts.

### CodeEdit
The lazy file-manager contract is useful for large trees and the workspace document stores state by workspace URL. Swift/AppKit observation does not establish Windows filesystem semantics, watcher reliability or conflict resolution. Omnia needs native path validation, traversal tests, external-change detection and reload evidence.

### OpenHands
The event service comments and workspace helper establish a useful persisted/live split and isolated workspace decision, but they are cloud/runtime contracts. They do not prove local-first storage, Windows permissions, lease teardown or event ordering. Omnia must test replay gaps, cancellation, confirmation denial and missing workspace roots in its own native bridge.

## Cross-source synthesis: original Omnia decisions

1. **Capability registration:** IDE actions (picker, explorer, editor, find, preview, save) are independently registered capabilities with requested → active | unavailable | failed | stopped state and a reason receipt. A disabled native capability never renders as a successful action.
2. **Bounded context receipts:** every file-context or retrieval request records root IDs, provider/configuration, selection limit, truncation and cancellation/error outcome. Default limits remain bounded; no hidden “all files” expansion.
3. **Lazy explorer and pointer safety:** expand directories on demand, retain stable pointer IDs plus the latest path/snapshot, and surface rename/delete conflicts. Root selection never silently changes to another user folder.
4. **Persisted vs live events:** persisted replay/history and live native events are separate channels with cursors and explicit replay-gap/runtime-unavailable states. Each event includes session, workspace and runtime identity where known.
5. **Clean-room boundary:** these are source observations and contract decisions only. Do not vendor, import, copy, or iframe upstream editors, VS Code workbench code, Swift/AppKit code, cloud clients or visual assets.

## Evidence and follow-up

- This note is the owned artifact for `/root/new_research_ide`; no product source files were changed.
- Follow-up implementation evidence: `src/rebuild/ide/*` should add tests for lazy tree expansion, traversal rejection, dirty save conflict, missing workspace, retrieval truncation/unavailable provider, and persisted/live event replay gap. Native Windows captures remain required before any live/runtime claim.
- Registry integration is owned by `/root/rebuild_source_research`; this note intentionally records the exact source evidence so it can add entries without guessing hashes.

---

---

# Preserved prior IDE research (pre-cycle-9)

# New OSS IDE and agent-workspace research

Cycle: `rebuild-0001`  
Retrieved: 2026-11-07 21:11 UTC (2026-11-08, Asia/Bangkok)  
Scope: IDE/editor workspace architecture and agent integration.  
Researcher: `/root/new_research_ide`  
Corpus exclusion: Zalo.  

This note records source that was newly reviewed for the rebuild cycle. The
repository/revision/path tuples below were not present in the initial Omnia
rebuild registry (the registry did not exist yet in this checkout). A GitHub
search result or star count is only a discovery signal; decisions below use
the pinned source files. No upstream code was copied into Omnia and no
upstream install or postinstall script was executed.

## Search ledger

| Query | Result / novelty decision |
| --- | --- |
| `site:github.com open source IDE agent framework super power everything max editor 2026` | Found Proliferate and Polypore; source reviewed below. New repository/revision/path. |
| `site:github.com open source AI IDE architecture agent workspace editor TypeScript Rust MCP 2025 2026` | Found Volt and NanoAgent; source reviewed below. New repository/revision/path. |
| `GitHub open source coding agent IDE workspace power max` | Confirmed discovery of Superagent Desktop and related agent workspaces; README was reviewed, but no additional source path was counted without a pinned file tree. |

Known baseline sources (obra/superpowers, browser-use/browser-harness,
browser-use/desktop and badlogic/pi-mono) were intentionally not counted as
new in this note. They remain candidates for separate research receipts.

## Proliferate — parallel agent IDE control plane

- Canonical repository: <https://github.com/proliferate-ai/proliferate>
- Pinned revision: `74e1178cf3ecfbfc3ffeb8321f82c4a9bfce620f`
- License evidence: `LICENSE` fetched at the pinned repository head, SHA-256
  `d2f847967e2933ed608d773ffcf5b1ddcd2e814f2327abde1a9e86581fa21460`
  (AGPL-3.0 header).
- Reviewed files and hashes:

  - `anyharness/crates/anyharness-contract/src/v1/workspaces.rs` —
    `ee251cd2a53b4bcb31bcdaf405552eb25ab8faa46ec31c960486e19cf052ae2c`
  - `anyharness/crates/anyharness-contract/src/v1/subagents.rs` —
    `05edc805611f531a15b340291f4049dc4606f2fec251023b57dee2c9f02efad3`
  - `anyharness/crates/anyharness-contract/src/v1/mcp.rs` —
    `7ebcbed92e37b1a436db82cd6c292afa5059ce5c5aaf0b119a51d2eb5c6d823`
  - `AGENTS.md` —
    `42c24952d53192689d4800cec143221a1cfc4a2f243fb1b0109221f45f27ce17`

### Observations

`workspaces.rs` defines an explicit execution summary and availability state,
including a missing-workspace condition computed when a workspace is read.
`subagents.rs` separates presentation state (running/available/closed) from
execution state (starting/running/awaiting interaction/idle/errored/closed)
and carries runtime/session or workspace identity. `mcp.rs` makes connection
records typed and redacts header/env values from `Debug`. The repository's
`AGENTS.md` routes contributors to one authoritative architecture document
instead of duplicating instructions.

### Omnia decision

**Apply the contract ideas.** Add a typed session/workspace state model with
`awaitingInteraction`, `workspaceMissing`, and opaque session/workspace IDs;
keep renderer presentation state separate from native execution state. Add
redaction tests for MCP secrets and a missing-root reload test. Use a single
authoritative rebuild spec with routing links, not duplicated policy prose.

**Do not copy** the Rust contract or its AGPL implementation. The license is
strong copyleft and Omnia's implementation must be independently authored.

### Limits / gap

The reviewed contract files do not prove UI behavior, native Windows
permissions, provider billing, or durable replay. Omnia still needs runtime
receipts for those criteria.

## Polypore — dockable agent-first IDE panels

- Canonical repository: <https://github.com/evanklem/polypore>
- Pinned revision: `b8b113544892b8f3d90b27fc20a6681b7a03a4e8`
- License: MIT, from `LICENSE`; observed header SHA-256
  `b1308c3416fa078ef3bad7e875cfa5d7f772020f13f1ff7e5ebf4cfc610fa9ea`.
- Reviewed files and hashes:

  - `docs/manual/the-ide/workspaces-and-panels.md` —
    `57770f61f5452a36303dad0a192675bb8eec5fad3fcd0364201b1ef08bd54031`
  - `plugins/agent/formation.ts` —
    `5fbf15cc39120c8fb9b3548cfedca9e859796fb3ac70d0bf99e850b1a02116a3`
  - `packages/host/src/handlers/mcp.ts` —
    `10146fb30993cc73236feda97aa6ca9acc673dc8200e789eba1dd93ab3d9a40e`

### Observations

The manual describes a workspace as a saved panel arrangement with center,
right and bottom areas; panels can split or stack as tabs and each panel keeps
scoped settings/capability data. `formation.ts` is UI-free domain logic: node
templates carry role/model/skills/tools and a graph has bounded zoom/layout
constants. The MCP handler registers list/upsert/discover/test/install operations
against a host registry rather than treating MCP as untyped UI text.

### Omnia decision

**Apply selectively.** The new IDE should persist a small workspace layout
model (chat/file/terminal/review/browser slots) and expose inspectable panel
settings. The agent graph should be a pure data model with node IDs, role,
model, skills, tools, status and edges; the UI can render it later. MCP
connections need typed scope, test state and redacted secrets. Keep Omnia's
three-mode top navigation and avoid copying Polypore's panel geometry or
visual design.

### Limits / gap

The manual is descriptive and does not establish Windows native editor
integration, crash recovery, or performance. `formation.ts` contains no
execution proof. The MCP handler source needs additional host/permission tests
before any parity claim.

## Volt — persistent session workspace and event protocol

- Canonical repository: <https://github.com/LeulAria/volt>
- Pinned revision: `9624142054a74b5253a3be4ed85f5b5cb92cab90`
- License: MIT from `LICENSE.txt`, SHA-256
  `74ab4dca13fe3cac9829d57519b36e6ac8eeda02ba6e443780aef4d880acc206`.
- Reviewed files and hashes:

  - `VOLT-ARCHITECTURE-REVIEW.md` — `c0a90b48cce08b0b94754d1be4dd0348deee5eb9f6b6d04a7046c8468aef3f11`
  - `VOLT-MULTI-PROJECT-AGENT-WORKSPACE-PLAN.md` —
    `7b0ca67b03bb079c16d278a494a6fca42f822c7dfe9ff2a8cec203a080db7a83`
  - `apps/client-core/README.md` —
    `18edfd32950aefb8d6680082b2d4029a85b70d232e5d2e792d90b1fa9fa9b8a5`
  - `apps/docs/src/lib/agentMarkdown.ts` —
    `04915d2797224d1eeb988530a001cd5711781e9ae261ad2fefb82ba65156a50`

### Observations

The plan makes the agent session the ownership unit for conversation, drafts,
approvals, run state and workspace layout; projects own repository identity,
trust and shared search/Git resources. The client protocol describes a WebSocket
hello/welcome, sequence-based resume, hole detection, heartbeat and jittered
backoff. Its action surface includes send, steer, stop, approve, answer, pin,
archive, edit, rewind, retry, checkpoint restore, file operations, diff and Git
operations. The docs module gives agents a Markdown endpoint with bounded 404
responses.

### Omnia decision

**Apply the ownership and resume contracts.** Keep project identity separate
from session tabs and workspace surface state. Every streamed event in Omnia
should have a monotonic cursor and an explicit replay gap/error state; reload
must request a cursor rather than silently rebuilding from stale UI state.
Expose edit/rewind/retry only with lineage and persistence receipts. A bounded
Markdown export endpoint is useful for artifact/search workflows.

**Do not copy** Volt's VS Code-core shell or its code. The license is MIT, but
Omnia's renderer must remain independently designed and authored.

### Limits / gap

The two architecture files state proposed targets and explicitly say no live
latency/memory measurements were taken. Client protocol behavior needs native
integration tests, storage corruption tests and permission checks in Omnia.

## NanoAgent — shared backend with ACP and bounded requests

- Canonical repository: <https://github.com/getnanoai/NanoAgent>
- Pinned revision: `6d12c0d8415c05f4fce280687e1e5902fc9bad83`
- License: Apache-2.0 from `LICENSE.txt`, SHA-256
  `c71d239df91726fc519c6eb72d318ec65820627232b2f796219e87dcf35d0ab4`.
- Reviewed files and hashes:

  - `.nanoagent/memory/architecture.md` —
    `53580028b48f75480fe67e3cdac56d14ed5a40a86590378e0cb3248d08a54e6e`
  - `.nanoagent/memory/decisions.md` —
    `97c7101bc7ff3688b8aea622b6d47b966c2b1dfebcf4e9415986d41e84dfa678`
  - `NanoAgent.CLI/Acp/AcpSession.cs` —
    `37a24313a31b4496a4b9b1824d7083d230801f7f4c99246a9035bf7d84ce2be3`
  - `NanoAgent.CLI/Acp/SlidingWindowRequestLimiter.cs` —
    `72dd60c31bb767574dcad1ca20f9d9381e4e5876da71abfbfece49043039f861`

### Observations

NanoAgent records one shared application backend behind CLI, desktop and IDE
surfaces, and exposes ACP JSON-RPC for integrations. `AcpSession` has a
per-session cancellation source and `SemaphoreSlim` turn lock, which prevents
overlapping turns in one session while allowing separate sessions. The sliding
window limiter rejects requests once the configured count is reached and
prunes expired timestamps under a lock. Its checked-in `.nanoagent/memory`
files make architecture/decisions versionable rather than only conversational.

### Omnia decision

**Apply.** The rebuild controller should use a per-session turn lock,
cancellation handle and request budget; add tests for concurrent send/steer,
cancel during tool execution and rate-window reset. Keep architecture decisions
and user-approved memory in versioned `.omnia` receipts. ACP-like protocol
versioning is a candidate adapter, not a requirement for a renderer mock.

### Limits / gap

The reviewed C# files do not prove provider correctness or cross-platform UI
behavior. Apache licensing permits reference but does not transfer third-party
dependencies. Omnia still needs a native Windows permission boundary and
provider outcome-unknown handling.

## Superagent Desktop — additional discovery, not a parity claim

- Canonical repository: <https://github.com/pungme/superagent-desktop>
- Pinned revision: `53c30034db248dc3018315997d5be081348c8794`
- License: MIT, `LICENSE` (SHA-256 `a43de6a598214596e5a8d9865727feac2342444af2756b398333c2676e17f070`), fetched at this revision (header verified).
- Reviewed source: `README.md`, SHA-256
  `92858a06155e6c1251f20251abeea1403195ba7c895f24a61f576883d7a43d90`.

The README describes a desktop workspace running several signed-in agents beside
a real browser and an iOS simulator, with one Git branch per agent and teardown
of started processes on quit. This is a useful discovery for lifecycle and
cleanup requirements, but README-only evidence is insufficient for source
architecture or behavior. **Decision: defer** until a pinned source tree and
platform permission contract can be read; do not claim it as an implementation
reference yet.

## Cross-source synthesis for Omnia

| Gap | Source-derived design decision | Verification needed |
| --- | --- | --- |
| Project/session confusion | Separate project identity, session execution, and visible surface state (Proliferate, Volt). | Reload a project with two sessions; verify tabs/drafts/runs remain attached to stable IDs. |
| Stale or missing workspaces | Read-time availability and explicit `workspaceMissing` state (Proliferate). | Delete/rename root during an active session; show recovery without silently switching roots. |
| Agent status ambiguity | Separate presentation and execution states (Proliferate). | State-machine tests for running, awaiting user, idle, error, closed. |
| Parallel agent safety | Per-session lock/cancel and bounded request windows (NanoAgent). | Race tests for send/steer/cancel and rate reset; no duplicate terminal rows. |
| Reconnect loss | Monotonic event cursor, heartbeat, gap detection (Volt). | Kill/restart native bridge; replay from cursor and surface a gap instead of dropping events. |
| Dock overload | Persist a small layout model with explicit panel settings (Polypore). | Reload layout, keyboard focus order and narrow viewport checks. |
| MCP secret leakage | Typed scope plus redacted debug/inspector output (Polypore, Proliferate). | Snapshot logs and UI tree; assert secret values never appear. |
| Self-improvement memory | Versioned decisions/lessons (NanoAgent). | Consent gate, snapshot, isolated test and rollback receipt. |

All decisions are design references only. They do not establish that Omnia has
implemented the behavior. Product criteria remain planned until the root
integrator supplies code and direct runtime/test evidence.

## Evidence caveats

- GitHub API tree inspection was rate-limited for later repositories; exact
  pinned raw files were used where available, and the limitation is recorded.
- License hashes for two files were observed from live raw fetches and should
  be regenerated by `scripts/rebuild/source-inventory.mjs` before registration.
- No upstream process was run, no credentials/profile data was read, and no
  UI screenshot is evidence here.
