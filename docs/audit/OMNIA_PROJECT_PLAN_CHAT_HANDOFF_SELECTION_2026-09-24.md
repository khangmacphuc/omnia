# Omnia Project Plan → Chat and Handoff selection — September 24, 2026

Status: bounded renderer preview, not a native/release receipt. Working tree:
`C:\Users\khang\source\repos\omnia`; the `master` repository has no commit.

## Delivered in this continuation

- Selected Project Plan tasks can be prepared as editable drafts in an existing
  empty Chat owned by that Project. Occupied, archived, running, missing and
  wrong-Project destinations are rejected immediately before staging. The
  active Chat switches only after staging succeeds. Drafts are not included in
  persisted preferences and are not sent to a provider by this action.
- Alternatively, Plan opens the normal New Chat dialog with the selected task
  prefilled and its source Project locked. Cancelling creates nothing. On
  desktop, confirming may create a native Chat record; title and task draft
  remain renderer-local. The dialog rejects stale/mismatched Projects before
  creation and never sends the draft automatically.
- Handoff preview v3 selects individual Chat and workspace-grant metadata
  records, shows selection counts and IDs, and exports the same selected set in
  JSON/Markdown. Deselected Chats cannot contribute attention signals. Folder
  paths and full transcripts are not exported by this preview.
- Project Permission JSON import checks and applies to its declared target
  scope rather than comparing against whichever scope was previously active.
  It remains a renderer-only draft, not an effective native policy change.
- The bundle checker recognizes a Vite/Rollup direct dynamic entry that has
  been emitted as a uniquely named shared chunk. This did not loosen byte
  budgets; the aggregate gate still fails.

## Same-snapshot checks

- Focused Vitest, single worker: **7 files / 78 tests passed**.
- App TypeScript check: **pass**. Renderer build: **pass**, 1,978 modules.
- Typography and hit-target checks: **pass**.
- Source ledger: **pass**, 94 sources (38 hashed local, 47 documented-only URLs).
- Browser preview smoke: **pass**, HTTP 200 with HMR at
  `http://127.0.0.1:1420/`.
- Bundle: **fail/watch**, total JavaScript **2,608,917 B** against the
  unchanged **2,150,400 B** budget (over by **458,517 B**). Its route-level
  dynamic import check now reports no false missing Projects route.
- Specification validator: **pass**, 122 Markdown files, 52 JSON files,
  55 requirements and 55 capability rows. Project Twin: **pass** after
  refreshing the final frozen source/documentation snapshot.

SHA-256 of the inspected source:

| File | SHA-256 |
| --- | --- |
| `src/features/workspace/store.ts` | `0706C58AED1B52B2551EB86E79B63CD478655DB68E92060D0A3BEDD943C3E477` |
| `src/features/workspace/project-control-deck.tsx` | `9A05CD1819494E2D740BCB876FF47E79E4DC8AFE17A31F2B5847B6D6B8084BA1` |
| `src/features/workspace/project-planning-preview.tsx` | `F9BF0C9CD0A8EF5FAFB414247720240EEAB2A8DB44C77E1D281C6D6A12D61FD9` |
| `src/features/workspace/conversation-start-dialog.tsx` | `89C64459460A1093EC6A5E900480C0A08DD9E9B74CFDE8779C26DA973BB4DC1B` |
| `src/features/workspace/overlay-store.ts` | `327DA0EF15E30BF893693EED499D33A7661CAB1BFA1B827FCF472C5A1F9E3FB8` |
| `src/features/workspace/project-handoff-workbench.tsx` | `FE98E5AEA838C5AD9E52F1D73BF9210FD9193D3DF9466C2649A4272918399FD3` |
| `src/features/workspace/permission-control-center.tsx` | `BB9F562B38317354AD97EDB8FBA15C3BA01500689136C1D3C1D5A2F9519E3DAB` |
| `scripts/check-bundle-budget.mjs` | `F3DA4D949C22FE8481BFE50A30054EE1180841F55DD0201391E65E6538B3B925` |

No computer-use session, screenshot, manual UI interaction, Git staging/commit,
push or PR occurred. `nativeRuntime: not-tested-by-this-probe`. Renderer tests
and browser HMR do not establish a packaged Tauri executable, native provider
dispatch, effective permission, agent handoff, restart durability, or native
  filesystem mutation. Next work should add a native-backed, restart-durable
  draft receipt and bind Plan/Handoff selections to typed authority before
  claiming persistence. Aggregate bundle reduction remains a separate measured
  performance task.
