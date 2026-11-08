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
