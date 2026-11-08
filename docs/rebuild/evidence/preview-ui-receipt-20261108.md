# Clean-room renderer verification receipt — 2026-11-08

**Cycle:** rebuild-0002  
**Workspace:** `C:/Users/khang/.codex/worktrees/omnia-ui-rebuild/publish-worktree`  
**Scope:** `src/main.tsx` → `src/rebuild/**` clean-room renderer entry graph

## Commands and results

| Command | Result | Scope / limitation |
| --- | --- | --- |
| `npm.cmd run rebuild:architecture` | pass | Entry graph and forbidden legacy/iframe checks; not native runtime parity. |
| `npm.cmd run test:rebuild-gates` | 14 passed | Workflow engine behavior; not product completion. |
| `node_modules/.bin/tsc -p tsconfig.app.json --noEmit --pretty false` | pass | Renderer TypeScript compilation. |
| Focused Vitest rebuild suites (8 files) | 29 passed | Chat, Browser controller/workspace, IDE model/workspace, Settings, Reference workbench. |
| `npm.cmd run build:renderer` | pass, Vite 1686 modules | Production renderer bundle. |

## Runtime capture

A clean local Vite preview was served at `http://127.0.0.1:1420/` and inspected at
1440×900. The four PNGs below are the exact files copied into `docs/assets/`.

| Capture | SHA-256 | What it proves |
| --- | --- | --- |
| `artifacts/rebuild-preview/chat.png` | `9d8fe3fa599d264b743a05afb8870098cc962db94ed3f81df9ddeb348b1443e1` | Chat default, non-project session, shared session list and composer. |
| `artifacts/rebuild-preview/browser.png` | `209fce74cc297ee57a21685031704e76ec6cc24251a5177b225c2f25e94efd6e` | Browser surface, native-unavailable state is explicit, no fabricated page. |
| `artifacts/rebuild-preview/ide.png` | `b0d6a7947525dafd98e366b57390748d930fe3ef1d0020da938cc4741fe9e95a` | Omnia-owned IDE chrome, explorer/editor empty state and shared sidebar. |
| `artifacts/rebuild-preview/settings.png` | `6ce4967b0d7356431ec9096299a3e3a6fced64131fd1c79799ed2b21d8fe67c2` | Advanced runtime settings, 200k/10k context defaults, retry 5s×1 unlimited and hot-reload label. |

## Claim boundary

These captures are browser-preview evidence. They do not prove packaged Tauri
WebView2, native provider execution, native persistent sessions, live RAG,
computer-use permissions, OS integration, billing, or CI release parity.
Independent review is required before changing any DoD criterion to `done`.
