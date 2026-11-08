# Omnia rebuild product and architecture specification

Version: 1.0-rebuild-0001. Status: ACTIVE. This document supersedes legacy Done
claims for the renderer; historical specs remain references only.

## 1. Identity and boundaries

Omnia is a sovereign desktop workspace, not an Electron wrapper, iframe collection,
or copied ChatGPT/Claude/Codex/IDE/browser shell. It owns its navigation, chat
transcript, file editor, browser controls and evidence surfaces. Native Tauri/Rust
commands are authoritative for persistence, permissions, leases, and side effects.
React is a projection of validated state; disconnected or unsupported capabilities
must be labeled instead of simulated.

### Top-level navigation

The upper-left header has exactly three buttons in order: Chat, Browser, IDE. Chat
is selected on first launch and accepts either no project or an explicit project.
Browser and IDE preserve the selected session and expose a compact chat sidebar.
Settings, schedule, command palette and evidence inspector are secondary controls,
not additional top modes.

### Visual system

- Dark: graphite `#101419` shell, panel `#171D24`, elevated `#202933`, text `#F3F6F8`, muted `#9EABB5`, line `#2C3742`, mint accent `#66E0C2`.
- Light: paper `#F4F7F8`, panel `#FFFFFF`, elevated `#E8EFF0`, text `#152027`, muted `#5C6A73`, line `#C9D5D9`, mint accent `#087F6B`.
- Fonts: Segoe UI Variable for interface; Cascadia Code for code, IDs and metrics.
- Scale: 4/8/12/16/24 spacing; radii 6px controls and 10px panels; header 48px;
  sidebar 240px baseline; workspace tabs 36px; minimum window 800×600.
- Focus rings are 2px mint with 2px offset. Motion respects reduced-motion.
- Body text target contrast is ≥7:1; nontext focus target ≥3:1. Controls expose
  accessible names, keyboard behavior and disabled reasons.

## 2. State and persistence

IDs are opaque and stable. A session has `scope: projectless | project`, optional
project pointer, model, effort, permission mode, transcript, tabs, draft, goal
and settings revision. Native storage journals mutations and returns revision and
receipt IDs. Renderer snapshots are caches, never authoritative.

Project storage records folder/file origin identity, normalized path, content hash,
last snapshot and source status. A rename updates labels by identity; content changes
append a snapshot; deletion retains the latest snapshot and marks origin missing.
Traversal, duplicate identity and denied permissions are rejected. Sensitive
profiles, cookies, keys and private transcripts are never indexed or published.

## 3. Agent and workflow contracts

Agent sends are event-streamed and correlated by opaque request/session/run IDs.
Queue, steer, ask-user, approval, cancellation and unknown-outcome states are
explicit. Ask-user supports recommended option cards and free text. Model and effort
are per-session and hot-changeable only for future work when native supports it.
Effort values are `none|minimal|low|medium|high|xhigh|max`; `ultra` means the
selected model's maximum supported effort plus dynamic workflow, not a fake enum.

Goals contain a plan, atomic tasks, evidence and status. Subagent records include
role, model, effort, ownership, parent and terminal evidence. Parallel tasks use
non-overlapping assignments. A plan revision retains reason and previous hash.

## 4. Research, memory and tools

RAG ingests supported files with parser/version/hash receipts. Chunks retain source
and page/byte provenance; retrieval returns scores and citations. Index revisions,
changed/deleted sources and sensitive-path exclusions are visible. Memory and
personalization are explicit, editable and consented. Skills, tools, MCP servers and
plugins have provenance, schema validation, permissions and bounded output.
Web research records query, engine, retrieved time, source URL, update time when
available and citation. External data is untrusted and cannot override policy.

Browser uses a native WebView2/lease surface with validated URLs, tab lifecycle,
bounded layered DOM/capture and page receipts. Computer use activates only when a
workflow requires it. IDE is a local editor/explorer owned by Omnia; it may use
native file APIs but never a hosted editor iframe.

## 5. Runtime settings and resource policy

Versioned settings support import/export, validation, safe migration, cross-tab
hot reload and explicit requested/applied status. Defaults: compact context 200,000
tokens, tool output 10,000 tokens, retry delay 5 seconds, multiplier 1, unlimited
attempts for safe retryable work. Browser/computer/GPU and expensive capture are
lazy flags. Retry never blindly repeats denied, canceled or outcome-unknown side
 effects; permission and acceptance are preserved.

## 6. Observability and evidence

Every request/run/goal has correlation IDs. Token/cache/cost/latency/queue and
provider observations keep source and timestamp; invoice data never becomes an
estimate. Logs redact user data by default. Evidence records command, exit code,
revision, scope, artifact path/hash and limitations. Dashboards filter by session,
model and goal. Unknown remains unknown.

## 7. Delivery and validation

A reference workbench precedes product UI. New source imports are checked by the
architecture gate. Tests cover happy, invalid, cancel, race, reload and permission
paths. Native/package/live evidence is labeled separately from browser preview or
fixtures. CI enforces document hashes, ordered workflow transitions, research
novelty, no legacy UI imports/live embeds, and version/tag agreement. README only
claims features backed by current receipts.

## 8. Cycle 0005 evidence update

Cycle `rebuild-0005` verified the current clean-room renderer and workflow
contracts without changing the product completion rule. The renderer suite passed
55 tests across 12 files, TypeScript typecheck and the renderer build passed, the
architecture guard passed, and the workflow gate suite passed 32 tests. UI QA
captured Chat, Browser, IDE and Settings at 800×600 and 1440×900; those captures
remain browser-preview evidence. The native ask-user broker passed 10 focused Rust
tests covering durable request publication, options/free text/cancel, stale and
duplicate answers, bounds, cleanup and cancellation.

The cycle keeps native/package/live claims separate. The first reduced-motion Chat
paint still has an 8px body-margin/overflow race, and the light Browser/IDE primary
action measures 3.81:1 against the 4.5:1 WCAG AA target. Native pointer/RAG
runtime, live provider refresh/execution, packaged WebView2/computer use, and
full packaged keyboard/accessibility evidence remain incomplete. The DoD is
therefore still **0/240 Done** and the goal remains active.
