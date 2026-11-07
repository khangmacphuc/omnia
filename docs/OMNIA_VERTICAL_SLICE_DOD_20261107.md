# Omnia vertical slice DoD — 2026-11-07

This receipt records the smallest honest, reviewable slice that can be shown in
a GitHub portfolio. It does not claim that every future IDE, browser, provider,
or autonomous workflow is complete.

## Status matrix

| Area | Current evidence | Coverage | Remaining boundary |
|---|---|---:|---|
| Agent chat | Tauri session lifecycle, streaming journal, approvals, fork/rewind, artifacts and split panes already exist in `src/agent` and native harness | 8/10 | Full multi-model compare and durable renderer tab state |
| Session tabs | Browser-like tab strip with active state, keyboard navigation, close-view semantics and New action | 6/6 | Persist open-tab order to native storage |
| Projects/files | Native workspace grants/index/retrieval contracts plus pointer-backed latest snapshot contract | 7/9 | Native file watcher and persisted pointer rows |
| RAG | `desktop.buildWorkspaceIndex`/`retrieveWorkspaceChunks` types and a bounded renderer policy receipt | 5/7 | Embeddings/reranker and citation UI on every agent turn |
| IDE/browser | `code` and `browser` workspace surfaces are lazy and permissioned; browser/computer tools are enumerated in the shell | 5/7 | Full native live surface matrix and recording evidence |
| Settings/runtime | Hot-reloadable normalized context/tool limits, plan passes, web policy, model effort, browser/computer toggles and telemetry controls | 7/7 | Native persistence and per-session overrides |
| Workflow/DoD | Atomic task, criteria, coverage and Markdown export contract | 6/6 | Native scheduler/lease integration |
| Observability | Token, throughput, request-rate, cost and chart-ready aggregation contract | 5/6 | Provider billing reconciliation |
| Portability | Redacted JSON/Markdown session export contract and existing native data export/import | 6/6 | Cross-version conflict receipts |

## Minimum acceptance checks

1. `npm.cmd run typecheck:app -- --pretty false` passes with no diagnostics.
2. Focused contract tests cover normalization, ultra effort downgrade,
   workflow coverage, metrics, secret redaction, pointer deletion fallback and
   tab interactions.
3. A renderer preview opens with Chat/Home as the first surface; Code and
   Browser remain reachable through the rail and lazy boundary.
4. Settings exposes 200k context, 10k tool output, three plan passes, effort
   levels, research policy and on-demand browser/computer switches.
5. No new UI control claims native/provider behavior when its implementation is
   renderer-local; the harness status card labels Preview vs Native.

## Verification receipt — 2026-11-07

The following checks were run against the current working tree after the session
tab and runtime contract changes:

| Check | Result | Evidence |
|---|---|---|
| App typecheck | **PASS** | `npm.cmd run typecheck:app -- --pretty false` completed with exit code 0 |
| Agent shell + Home tests | **PASS** | 2 files, 39 tests; includes narrow drawer scrim, Escape/click close, rail navigation, panels, settings and emergency stop |
| Intelligence/session contract tests | **PASS** | 2 files, 8 tests; runtime normalization, ultra routing, workflow coverage, metrics, redaction and session tabs |
| Renderer production build | **PASS** | `npm.cmd run build:renderer`; 2,060 modules transformed |
| Runtime UI | **PASS (preview)** | Runtime tab visibly showed 200,000 context, 10,000 tool cap, three plan iterations, auto-plan/research, effort through `ultra`, and on-demand browser/computer toggles |
| Code surface | **PASS (preview)** | Embedded VS Code surface opened the Omnia workspace and showed the restricted-mode boundary |
| Browser surface | **PASS (preview)** | Browser workspace opened mock tabs, controls, downloads/media panel, developer-tools toggle and deep DOM inspection of a Hacker News table/link tree |
| Native harness | **BOUNDARY** | Production preview reports the expected Tauri bridge fallback (`transformCallback` unavailable); no native capability is claimed from this preview evidence |

The focused test set is **47/47 passing** (100% for the exercised slice). The
matrix above remains intentionally partial for native persistence, live provider
routing, embeddings/reranking, recording, and multi-model comparison.

## UI/interaction DoD evidence

- The home route is the default entry and keeps the chat composer visible.
- The rail exposes Home, Projects, Work, Library, Code, Browser and Settings.
- Session tabs are browser-like: active `aria-selected`, running marker, folder
  context, keyboard arrows/Home/End, Delete/Ctrl+W close-view behavior, and a
  New session action.
- On narrow viewports, the sidebar is a drawer with an explicit scrim. The
  active tab bootstrap does not close the drawer during mount; only an explicit
  user session selection does.
- Runtime settings are hot-reloaded through the renderer controller and are
  labeled as preview/native where the boundary matters.

## Build warnings and limits

The renderer build is successful. Vite reports one existing circular chunk
warning (`omnia-runtime-controller -> omnia-domain -> omnia-runtime-controller`)
and a static/dynamic import advisory for the workspace surface. These are bundle
optimization follow-ups, not build failures. Native pointer persistence, RAG
receipts attached to every request, multi-model compare, provider billing
reconciliation, and the full deep UI matrix remain planned work.

## Planned next wave

- Persist runtime settings and open tabs through the existing Tauri app-state
  snapshot path.
- Connect the RAG policy receipt to the agent request inspector so every run
  shows selected chunks, omissions and token budget.
- Add native pointer rows and a folder watcher that updates source aliases while
  preserving the last snapshot after deletion.
- Add a multi-model compare run with independent usage/provenance receipts.
- Run the full deep UI matrix at 1280×800, 960×720 and keyboard-only, then
  attach screenshots and accessibility output to the release evidence.
