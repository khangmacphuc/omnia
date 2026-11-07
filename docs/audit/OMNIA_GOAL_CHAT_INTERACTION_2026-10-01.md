# Omnia Goal/Chat interaction continuation — October 1, 2026

Status: **Partial / renderer preview**. This receipt is for an uncommitted
working tree, not a packaged desktop release.

## Scope and observable result

- The Goal prompt rail now has separate queued, active-preview, and Btw/Discuss
  side-note lanes. Steer removes an item from the queue; replacing an active
  preview returns the previous item to the front. A side note enters the queue
  only after explicit promotion. All three lanes remain renderer-only; there
  is no execution, model call, native queue write, or scheduler handoff.
- Goal Studio drafts are scoped to a Project ID in browser `sessionStorage`,
  including unsaved field edits and selection. The Project Deck passes its
  Project ID through the lazy Plan surface, so tab remounts restore the right
  draft. Session storage is not native durable persistence.
- A separate Saved project goals panel uses the existing typed native Goal
  API only in Tauri: list exact-Project goals, explicitly save a draft with an
  idempotency key, and refresh the native list. Browser preview reports native
  storage unavailable and does not fabricate records. Native creation does
  not schedule or execute work, and the Goal Studio preview does not mutate
  these saved records.
- Closing/reopening Chat's advanced controls no longer discards Create,
  Research, and Discuss mode options or their local Undo history.

No schema, migration, permission, provider dispatch, or training behavior was
changed. The native Goal bridge already existed; this slice adds a consumer.

## Bounded verification

| Check | Observation |
| --- | --- |
| Project Control Deck | 29/29 passed, including a Project-scoped Plan remount |
| Goal Studio | 15/15 passed after updating its boundary-copy assertion |
| Goal orchestration rail | 4/4 passed |
| Native Goals panel (mocked native bridge) | 3/3 passed |
| Composer mode selector | 6/6 passed |
| App TypeScript | `npm.cmd run typecheck:app`, exit 0 |
| Renderer build | `npm.cmd run build:renderer`, exit 0, 2,104 modules |
| Preview smoke | `OMNIA_SMOKE_OK`, HTTP 200 on port 1420 with HMR marker |
| Hit-target/import contracts | 30 density-bound controls / 3 wrappers; 394 production modules / 805 local imports, exit 0 |
| Spec-pack validator | 122 Markdown, 52 JSON, 55 requirements/capabilities, exit 0 |
| Visual artifacts | `artifacts/ui-goal-chat-2026-10-01.png`, `artifacts/ui-goal-plan-2026-10-01.png`, and `artifacts/ui-goal-plan-content-2026-10-01.png` from an isolated 1280×800 browser |

The focused suites total 57 tests. An earlier combined run reported 56/57
because it still expected the old Goal Studio wording; after that sole test
assertion was updated, its 15-test suite passed. The Project Deck test file
was transiently emptied by a failed patch write during this phase. Its 28
existing cases were reconstructed from prior session patch records, the three
affected tests were rerun, and then the new Project-scope case brought the
file to 29/29 passing. This incident is not evidence of a native data change.

The browser-control connection failed while initializing its runtime assets.
These screenshots were captured from a separate headless Playwright browser,
not the user's browser tab or the native Tauri window. The Plan capture shows
the beginning of the Plan tab and its scrolled Saved Goals/Goal Studio boundary
at 1280×800; this is only a spot inspection, not a responsive or whole-tab
visual gate. The upper Project overview pushes Plan content below the fold,
and the six large Goal Studio metrics still make the Plan surface dense. No
comprehensive click audit, screen-reader audit, native Rust compile, packaged
EXE, restart, or native Goal IPC success is claimed. The renderer build retains a mixed static/dynamic
import warning for the Agent Mesh supervisor preview; it is not a build error.

Next: connect Goal preview edits to authoritative native revisions with an
explicit promotion/compare flow; keep queue and side-note behavior preview-only
until a durable queue receipt and safe-boundary execution exist. Visually
inspect the Plan tab in an available browser/native runtime before promoting
the layout claim.

## Continuation — Plan entry and Goal Studio density

The next renderer slice keeps the selected Project workbench in view when a
user intentionally changes the Project Deck tab. The tab row uses the nearest
scroll context, honors reduced-motion preferences, and does not scroll on the
initial render or unrelated Project rerenders. Overview-map and keyboard
activation preserve focus with `preventScroll` after the explicit scroll.

Goal Studio now keeps only Goals, Total tasks, and Selected progress in the
primary metric strip. Active tasks, High priority, and Due soon are inside a
named, keyboard-accessible `More planning metrics` disclosure. The browser
preview Saved project goals panel is also compact: it no longer shows a
disabled Refresh control or a redundant project subtitle when native storage
is unavailable.

Bounded continuation evidence: Project Deck 30/30, Goal Studio 16/16, native
Goals preview 3/3; app typecheck passed; renderer build passed with 2,104
modules; preview smoke returned `OMNIA_SMOKE_OK`; hit-target and import-boundary
checks passed. Isolated headless Playwright spot checks at 1280×800 and 960×720
showed the Plan start and Goal Studio metrics without visible clipping or
document-level horizontal overflow. These remain renderer/browser-preview
observations, not native Tauri, packaged EXE, provider, or durable-storage
proof. Updated artifacts:

- `artifacts/ui-goal-plan-after-2026-10-01.png`
- `artifacts/ui-goal-studio-after-2026-10-01.png`
- `artifacts/ui-goal-plan-960-2026-10-01.png`

The inner Plan tabs (Roadmap, Task DAG, Blueprint, Acceptance) now scroll the
selected view into sight only after intentional navigation, keep roving focus
from keyboard input without a second browser scroll, and distinguish hover
from selection. The three planning insight cards also stack at desktop widths
instead of truncating their labels beside the critical-path panel. A focused
Project Planning Preview suite passed 17/17 and the app typecheck and preview
smoke passed after these additions. An isolated Acceptance-view spot check
confirmed exactly one selected inner tab, its tab row near the viewport top,
and no document-level horizontal overflow at 1280px. Updated artifact:
`artifacts/ui-goal-plan-acceptance-2026-10-01.png`.

An adjacent small accessibility improvement also added roving keyboard
navigation and explicit focus order to the Advanced Model workbench tabs in
the Project Deck; its focused test passed. These controls remain previews,
not proof that a provider route or agent orchestration ran.

## Continuation — compact Plan workspace entry

The Project Deck Plan tab now opens on a compact two-surface switcher instead
of placing the long planning preview before Goals. `Goals & tasks` is the
default surface and contains the native-authority Goals row plus the
renderer-session Goal and Task Studio. `Roadmap & planning` contains the
existing Roadmap/Task DAG/Blueprint/Acceptance preview and only mounts on its
first intentional visit. After that first visit, both surfaces remain mounted
and are toggled with `hidden`, so local Goal Studio fields and planning undo
history are not discarded when the user switches between them. The switcher
has explicit tab/tabpanel relationships, roving keyboard focus, Home/End and
Arrow navigation, titles, and reduced-motion-aware scrolling.

Bounded continuation evidence:

| Check | Observation |
| --- | --- |
| Project Control Deck | 31/31 focused tests passed, including default Goals entry, keyboard switching, and draft preservation |
| App TypeScript | `npm.cmd run typecheck:app`, exit 0 |
| Renderer build | `npm.cmd run build:renderer`, exit 0, 2,104 modules transformed |
| Preview smoke | `OMNIA_SMOKE_OK`, HTTP 200 on port 1420 with HMR marker |
| Isolated visual spot check | 1280×800 Goals and Roadmap captures; 960×720 Goals capture; no document-level horizontal overflow or page errors observed |

Updated artifacts:

- `artifacts/ui-project-plan-goals-1280-2026-10-01.png`
- `artifacts/ui-project-plan-roadmap-1280-2026-10-01.png`
- `artifacts/ui-project-plan-goals-960-2026-10-01.png`

The browser-control runtime could not initialize its kernel assets in this
environment, so the visual spot checks used a separate headless Playwright
browser and did not touch the user's browser tab. This remains
renderer/browser-preview evidence only: it does not verify native Tauri
packaging, native Goal IPC, provider dispatch, durable persistence, scheduler
leases, or Project Twin promotion.

## Continuation — compact Chat entry and mode controls

The empty Chat entry surface now keeps the primary action obvious without
repeating a large starter rail: `Start a message` focuses the composer,
`Prompts` reveals the three starter actions on demand, `Tools` exposes the
inspector, and the `Alt+Enter` shortcut remains visible. Starter prompt buttons
write into the current renderer-local draft and return focus to the composer;
the starter row disappears once the conversation has messages. The composer
mode selector exposes Ask, Create, Research, and Discuss as explicit options;
mode controls stay openable and preserve their local selections/undo history,
while non-Ask modes are honestly marked preview-only and keep Send disabled.

Bounded continuation evidence:

| Check | Observation |
| --- | --- |
| Chat starter + composer mode suites | 29/29 focused tests passed (`chat-first-canvas`, `conversation-navigation`, `composer-mode-selector`) |
| App TypeScript | `npm.cmd run typecheck:app`, exit 0 |
| Preview smoke | `OMNIA_SMOKE_OK`, HTTP 200 on port 1420 with HMR marker |
| Isolated visual/interaction spot check | 1280×800 empty Chat capture; prompt disclosure showed 3 actions, no document overflow; Ask/Create/Research/Discuss menu opened, Discuss controls opened, and Send remained disabled |

Updated artifact: `artifacts/ui-chat-entry-1280-2026-10-01.png`.
This is renderer/browser-preview evidence only; it does not claim provider
dispatch, native orchestration, research retrieval, creation execution, or
durable prompt persistence.
