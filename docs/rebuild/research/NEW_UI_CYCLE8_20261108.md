# Cycle 8 NEW UI / workspace OSS research

- **Cycle:** `rebuild-0008`
- **Research owner:** `/root/cycle8_research_ui`
- **Retrieved:** 2026-11-08 08:35–08:38 UTC (Asia/Bangkok +07)
- **Scope:** clean-room UI, accessibility, workspace continuity, browser/IDE surfaces, and technical agent workspaces.
- **Method:** fresh web search with requested `everything`, `super`, `power`, `pro`, `max` terms; pinned each repository with `git ls-remote HEAD`; fetched exact raw source blobs read-only; checked `SOURCE_REGISTER.json` and prior UI research for repository/revision/path duplicates. No downloaded scripts were executed, no packages were installed, and no credentials/browser profiles/private chat data were accessed.

## Search log

| UTC time | Query | Result / disposition |
|---|---|---|
| 2026-11-08 08:32 | `site:github.com open source AI workspace UI accessibility tabs browser IDE everything super power pro max` | Found Sundial Desktop, OpenChamber, Altai, Open WebUI Computer, Lilo and others. Selected sources below after registry deduplication. |
| 2026-11-08 08:32 | `site:github.com open source technical UI workspace React accessibility agent desktop editor` | Confirmed source-level candidates with workspace/editor/accessibility material. |
| 2026-11-08 08:32 | `site:github.com AI chat workspace open source UI a11y design system` | Confirmed source-level candidates; repository name and stars were treated only as discovery signals. |
| 2026-11-08 08:33 | `site:github.com everything super power pro max AI workspace UI` | Results overlapped with candidates above; no repeat repository+revision+path was counted as new. |

## Selected sources

### 1. Sundial Desktop — local-first collaborative AI workspace

- **Canonical:** https://github.com/sundial-org/sundial-desktop
- **Revision:** `74ddb42f9430ff8c7bb83e18137b009760bc7d9a` (`git ls-remote HEAD`)
- **License:** Apache-2.0 (`LICENSE`, SHA-256 `CFC7749B96F63BD31C3C42B5C471BF756814053E847C10F3EB003417BC523D30`)
- **Exact source read:**
  - `app/w/[slug]/_components/workspace-chat-pane.tsx` — SHA-256 `47F2D4A01F0ACC9F502A65CB1B1B02D2C5520CB96CB4D3D186A976247C35A2D5`
  - `app/w/[slug]/_components/workspace-file-lifecycle.ts` — SHA-256 `349875DD55A1E46EC6F6A293FFFE7B584B1C73F0FE279A16CF95A46DE6AF61E9`
- **Observed strengths:** The chat pane keeps a stable composer/transcript boundary for primary and side-chat variants, routes dead-space clicks back to the composer without stealing text selection, and exposes explicit stream/reconnect/interrupt/start failure states. File lifecycle code guards project changes, aborts stale requests, persists selected-file identity, batches realtime updates, and cleans up listeners/channels on unmount.
- **Observed weaknesses / limits:** React/Next/Supabase and cloud workspace assumptions; code does not establish Windows/Tauri persistence or native browser/IDE evidence. Its visual source and CSS are reference data only and must not be copied.
- **Novelty:** Repository/revision/path did not occur in `docs/rebuild/SOURCE_REGISTER.json` or previous UI research.
- **Decision:** **Apply conceptually.** Use stable shared chat-pane semantics, explicit transport state, cancellation cleanup, selected-file continuity and batched refresh in Omnia-owned contracts. Reject Supabase/cloud lifecycle and all UI/source copying.

### 2. OpenChamber — agentic development environment with explicit UI guidance

- **Canonical:** https://github.com/openchamber/openchamber
- **Revision:** `651a0564880633fbcdc2ac3f84d08e42c7748a64` (`git ls-remote HEAD`)
- **License:** MIT (`LICENSE`, SHA-256 `1F6E869A3FEFF6B4EB07907AFC89176562B1F4324389F163D9FD94F09864B44E`)
- **Exact source read:** `.agents/skills/openchamber-ui-guidance/SKILL.md` — SHA-256 `49B154949F9547D0A2B46E9EDD073BF2396A05BFB09FF594060B01E4D5A7AACE`
- **Observed strengths:** The guidance defines a restrained elevation model (button/raised/floating), flat tonal layout surfaces, meaningful borders only, state-only color, quiet-at-rest controls, stable geometry during loading/selection, reserved status slots, no-wrap toolbars, content-first vertical space, semantic focus behavior, and mobile touch minimums. It explicitly treats accessibility, keyboard shortcuts, truncation and popup placement as behavior rather than decoration.
- **Observed weaknesses / limits:** This is maintainer guidance for OpenChamber's own token/primitives and is not a native runtime receipt. Exact tuned values are product-specific and cannot be transplanted into Omnia; source does not prove Windows UIA/WebView2 behavior.
- **Novelty:** Repository/revision/path did not occur in the current source registry or earlier UI receipt.
- **Decision:** **Apply with clean-room translation.** Add measurable Omnia UI acceptance checks for reserved geometry, one header row, no-wrap controls, state-only color, keyboard focus and light/dark contrast. Do not import the skill, tokens, CSS or components.

### 3. Altai — local-first Tauri agent development environment

- **Canonical:** https://github.com/altaidevorg/altai-app
- **Revision:** `bf8c963491d98c946c155b490408a20200c08cd9` (`git ls-remote HEAD`)
- **License:** Apache-2.0 (`LICENSE`, SHA-256 `E3838D15EF1C56B492BBDAAA90D55BEC6971837F011F31AFC9C66869365B49EB`)
- **Exact source read:** `README.md` — SHA-256 `6017178B8446D9C5D9721A8056FAD2E7BE963066E367BDFEAC0B05A9121E9C35`
- **Observed strengths:** Describes an original Tauri/React workspace joining editor, terminal, git, browser preview and chat; per-chat model selection; task DAG/kanban, budgets, quality gates, agent profiles, durable event journal, replay, permission modes, checkpoints/rewind, steering/queueing, context compaction meters, skills/MCP/plugins and hot-discovered project configuration. It explicitly calls out screen-reader support, high contrast, rebindable shortcuts and secret-file isolation.
- **Observed weaknesses / limits:** README is product documentation, not source-level proof of each feature; no packaged runtime evidence was taken here. The project has its own architecture and should not be treated as a template. Claims about provider counts or support are not Omnia evidence.
- **Novelty:** Repository/revision/path did not occur in the current source registry or prior cycle UI reports.
- **Decision:** **Apply as a requirements cross-check only.** Use the concepts to audit Omnia's DoD for per-session model choice, permission modes, queue/steer, checkpoints, replay, and accessibility. Do not vendor, embed or replicate Altai source/UI.

### 4. Lilo — native browser workspace with spaces, terminal tabs and MCP agent controls

- **Canonical:** https://github.com/Alexays/Lilo
- **Revision:** `9351204549e839ef9687d866e08862a57453b42f` (`git ls-remote HEAD`)
- **License:** MIT (`LICENSE`, SHA-256 `092D9812A48D2D7E85683A3968358C49A2B06C22D157D06A21A04F1941993FB2`)
- **Exact source read:**
  - `README.md` — SHA-256 `802DBB1B6BCD2F0AA11DFF379CAD582CA6132DDF39280CB047F29EBB85BB869C`
  - `LICENSE` — SHA-256 `092D9812A48D2D7E85683A3968358C49A2B06C22D157D06A21A04F1941993FB2`
- **Observed strengths:** Documents a sidebar-first browser with Spaces/profiles, nested folders, command bar, split views, persisted tabs, per-space tab archival, native screenshots, terminal tabs beside pages, an isolated agent Space, explicit approval before send/pay/delete/publish, accessibility-tree/page-text capture, screenshot/GIF capture, performance/network inspection, and MCP integration.
- **Observed weaknesses / limits:** macOS/WebKit/AppKit/Svelte architecture; no Windows/Tauri evidence and no claim of Omnia parity. README-level observations cannot prove implementation details. Agent access and profile isolation require careful permission contracts.
- **Novelty:** Repository/revision/path did not occur in `SOURCE_REGISTER.json` or previous UI research.
- **Decision:** **Apply conceptually with platform boundary.** Use Spaces/session continuity, isolated agent browser context, explicit approval surfaces, layered accessibility-tree capture and bounded evidence as Omnia acceptance ideas. Reject macOS implementation and any live UI embedding or source copying.

## Synthesis: decisions for Omnia Cycle 8

1. **Continuity contract:** A session, workspace, tab and selected file keep stable IDs across Chat/Browser/IDE and reload. Native snapshot receipts must include revision, source and status; stale updates are rejected.
2. **Quiet, stateful UI:** Use Omnia's own dark graphite/light tokens. Reserve a status line for loading/error/cancelled/needs-input; color indicates state only. Keep one compact header row and move rare actions into a menu.
3. **Accessibility as behavior:** Acceptance must cover semantic labels, roving keyboard focus, focus restoration, popup placement, visible keyboard routes, contrast in both themes and touch/keyboard targets. Visual resemblance is not evidence.
4. **Browser/computer boundary:** Layered DOM/accessibility-tree reads and captures are bounded and labeled untrusted. Agent browser work uses an isolated capability/approval context; no external live UI is embedded.
5. **Agent controls:** Model/effort per session, queue/steer, checkpoints/rewind, subagent lineage, explicit permissions and replay receipts stay first-class and inspectable.
6. **Evidence gate:** README claims, source docs, renderer previews and native/package/live runtime captures remain separate evidence classes. No source here promotes a DoD criterion to Done.

## Limits and follow-up

- This slice did not run downloaded source, install dependencies, or execute external scripts.
- No source was copied into `src/rebuild`; this report is reference synthesis only.
- A future implementation cycle should add targeted UI QA for reserved status slots, focus restoration, keyboard tab movement, light/dark contrast and cross-surface session continuity, then capture packaged Windows evidence separately.

