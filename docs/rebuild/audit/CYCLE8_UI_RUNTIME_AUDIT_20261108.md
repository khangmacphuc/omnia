# Cycle 8 UI/runtime audit

Reviewer: `/root/cycle8_ui_runtime_qa`
Date: 2026-11-08 (Asia/Bangkok)
Scope: clean-room renderer under `src/rebuild`, current test/runtime boundaries, and previously captured narrow preview evidence. This audit does not modify product code or promote any DoD status.

## Verdict

**Changes required; renderer contracts are well-covered by focused tests, but preview evidence still has four known UI findings and no packaged/native UI proof.**

### Fresh focused evidence

| Check | Result | Boundary |
|---|---:|---|
| `npm.cmd test -- --run src/rebuild/rebuild-app.test.tsx src/rebuild/chat/chat-view.test.tsx src/rebuild/browser/browser-workspace.test.tsx src/rebuild/ide/ide-workspace.test.tsx --reporter=dot` | **4 files / 16 tests passed** | JSDOM renderer behavior only |
| `npm.cmd run rebuild:architecture` | **passed; 0 violations** | import graph and clean-room guard, not runtime |
| `git diff --check` | **passed** | whitespace only |
| Typecheck invocation | terminated after no diagnostic output under current Node 27 nightly | no claim made; rerun in the supported project Node runtime before release |

Source hashes reviewed:

- `src/rebuild/rebuild-app.tsx` — `6d51a84ca557d699616b34e4a4c521e42d793aee0bb4b01717f6b472f500d1da`
- `src/rebuild/rebuild-app.css` — `67de3614fea65a95175855b5582d08acb56ce96be6904f67c3719819237b4bb6`
- `src/rebuild/rebuild-app.test.tsx` — `658e64339732594f876d5a8f721076232e42018a97ac5ab1ac10fefae2af3f40`
- `src/rebuild/chat/chat-view.test.tsx` — `9029b5b387bbf8687989a457e81d2e392beac72cf6e4207a4901ffd846ab68f3`
- `src/rebuild/browser/browser-workspace.test.tsx` — `c39d06da3551d9cd1d9d3786acc3b3026a42a7c861a813f6a07fc6811664dc06`
- `src/rebuild/ide/ide-workspace.test.tsx` — `c707eea731ed11412165ed007c107f8ab59bab302473647725de8367c16927f3`

## Verified renderer behavior

1. The shell starts in Chat and exposes exactly three primary surface buttons.
2. Browser and IDE retain the same `SessionList` and active controller; the companion Chat view exposes the same draft and session continuity.
3. Chat tests cover non-project default state, send dispatch, approval allow, ask-user recommended option, free-text answer and explicit cancellation.
4. Browser tests cover explicit native-unavailable preview, tab creation, unsafe `file:` navigation rejection, capture without a native lease, tab keyboard navigation and delete.
5. IDE tests cover folder listing, file read/edit/save, read-only native draft export and search without markup injection.
6. Theme toggle is wired to `document.documentElement.dataset.rebuildTheme`, with distinct dark/light token blocks and reduced-motion handling.
7. The architecture guard found no legacy UI import/copy or external live editor/application embed.

## Preview findings requiring a rerun

The latest narrow preview audit remains the authoritative visual/accessibility evidence:
`docs/rebuild/audit/UI_QA_NARROW_20261108.md` and
`docs/rebuild/receipts/ui-qa-narrow-accessibility-20261108.json`.

- **Shared companion Chat at narrow width:** CSS hides `.rb-companion-chat` at `max-width:1100px` while the shell only exposes a reveal toggle. At 800px the companion composer is not visible unless the user opens the replacement control; the audit recorded this as a gap against always-available shared Chat continuity. Add or explicitly document the narrow-width interaction and rerun.
- **Settings modal focus:** the prior 800px run recorded focus escaping the `aria-modal` dialog and Escape failing to close in that preview. The source now includes `useModalBoundary` and focused JSDOM coverage, but a fresh visual/browser run is required to prove the fix at 800px.
- **Settings section geometry:** prior run found the five section tabs geometrically obscured by the body at 800px, so center hit tests failed. A fresh capture must verify pointer and keyboard section changes after the current CSS/source hashes.
- **Light Settings contrast:** prior run found six nodes at 1.16:1 because `--rb-bg` was undefined in the root theme. The CSS now defines `--rb-bg`; this is a source-level correction, not current contrast proof. Rerun axe/contrast before any UI criterion is Done.
- **Browser tablist semantics:** prior run found an Add button inside `role=tablist` (`aria-required-children`). Current Browser tests assert the action is outside the tablist; rerun axe in a real browser to confirm.

## Native/package boundary

No packaged Tauri UIA/WebView2 run, Windows accessibility tree, live provider, native persistence, or OS-permission evidence was observed in this audit. The existing screenshots and JSON receipts are browser-preview evidence. They cannot establish packaged/native/live criteria.

## Required next actions

1. Run the same Playwright/axe narrow audit at 800×600 in a supported Node runtime and capture dark/light Chat, Browser and IDE plus Settings.
2. Verify companion Chat interaction at narrow width, modal focus/Escape, Settings tab hit targets/keyboard, light-theme contrast, and Browser tablist semantics.
3. Rerun typecheck under the project-supported Node version; record exit/output in a receipt.
4. Keep UI/runtime criteria Partial/Planned until browser and packaged evidence match their required evidence types.

## Files inspected

- `src/rebuild/rebuild-app.tsx`
- `src/rebuild/rebuild-app.css`
- `src/rebuild/rebuild-app.test.tsx`
- `src/rebuild/chat/chat-view.test.tsx`
- `src/rebuild/browser/browser-workspace.test.tsx`
- `src/rebuild/ide/ide-workspace.test.tsx`
- `docs/rebuild/audit/UI_QA_NARROW_20261108.md`
- `docs/rebuild/receipts/ui-qa-narrow-accessibility-20261108.json`

No DoD status was changed by this audit.
