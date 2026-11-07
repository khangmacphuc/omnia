# Omnia renderer Project/Chat continuation — September 24, 2026

Status: bounded renderer preview; not a native or release receipt. Repository:
`C:\Users\khang\source\repos\omnia`. No Git commit exists on `master`, so
the source hashes below identify the checked code rather than a commit.

## Scope delivered

- Project Settings navigation drops stale `settingsProjectId` on native record
  replacement, desktop-preview preparation and persisted-preference merge.
- Permission Control Center keeps independent renderer-only drafts/history by
  `project:<id>`, and Project Context reads the matching draft. Undo, redo and
  reset have no native policy effect.
- Sidebar action availability for archive, move, export and new-window states
  follows the shared Project Chat contract. Planned actions remain disabled.
- Plan-to-Handoff preview v2 includes selected task, visible Chat
  metadata/excerpts, path-free workspace-grant metadata and optional
  renderer-visible signal records. The include toggles remove Chat/Signal
  records; no agent dispatch, durable revision or native file write occurs.

Primary source: `src/features/workspace/store.ts`, `sidebar.tsx`,
`session-permission-contract.ts`, `permission-control-center.tsx`,
`settings-permission-surface.tsx`, `activities/settings-screen.tsx`,
`project-scope-inheritance-preview.tsx`, `project-handoff-workbench.tsx`.
Focused tests: `store.test.ts`, `sidebar-navigation.test.tsx`,
`project-chat-navigation.test.ts`, `session-permission-contract.test.ts`,
`permission-control-center.test.tsx`, `settings-screen.test.tsx`,
`project-scope-inheritance-preview.test.tsx`, `project-handoff-seed.test.ts`,
`project-handoff-workbench.test.tsx`, `project-control-deck.test.tsx` in
`src/features/workspace/`.

## Same-snapshot checks

- Focused Vitest with `--pool=threads --maxWorkers=1`: **10 files / 87 tests
  passed**.
- `npm.cmd run typecheck:app`: **pass**.
- `npm.cmd run build:renderer`: **pass**, 1,978 modules transformed.
- `npm.cmd run check:typography`, `npm.cmd run check:hit-targets`,
  `git diff --check`: **pass** (Git diff cannot enumerate untracked source).
- `npm.cmd run smoke:preview`: **pass**, HTTP 200, Omnia page and Vite HMR at
  `http://127.0.0.1:1420/`.
- `npm.cmd run check:bundle`: **fail/watch**, aggregate JavaScript 2,601,791 B
  against 2,150,400 B (over by 451,391 B). Budget was not relaxed.
- `npm.cmd run source-ledger:generate` and `check:source-ledger`: **pass**,
  94 sources (38 hashed local files; 47 documented-only URLs).
- `npm.cmd run twin:bootstrap` and `twin:check`: **pass** after the final
  documentation update; the generated manifest stores its own filesystem
  snapshot ID, avoiding a self-referential hash in this receipt.
- `docs/omnia-ultra/tools/validate-spec.ps1`: **pass** after keeping the
  continuous-phase status within the pack's 400-line limit (122 Markdown,
  52 JSON, 55 requirements and 55 capability rows).

Source SHA-256 for the code checked:

| File | SHA-256 |
| --- | --- |
| `src/features/workspace/store.ts` | `3FA81255A744DDD9B06D1AA9B65D8A154C89A18C7F6AC4BE4E0F3806E4C6E7EA` |
| `src/features/workspace/sidebar.tsx` | `88209779709A87B42A03FB822AD097DC5497F5F6BAB2E7B633200D7386ACBDFD` |
| `src/features/workspace/project-handoff-workbench.tsx` | `AB5488787E8CC205DAE47660F5B9D8CE8740EDD3D7D333E8D76D2C2498997C68` |
| `src/features/workspace/session-permission-contract.ts` | `BD6E8A2EE62DCBFE392F9C4FA4477F6A34C584869444F840AA5994CAEF9E9370` |
| `src/features/workspace/permission-control-center.tsx` | `863967C473382CC959F5033A93451670427CDF1428026DC0C7552508FE20F303` |

No visual screenshots or computer-use inspection were performed, per user
preference. `nativeRuntime: not-tested-by-this-probe`: the renderer build and
HTTP preview do not establish Rust/Tauri compilation, packaged desktop,
provider dispatch, restart persistence, policy enforcement or agent handoff.
The next dependency-ready work is to bind preview contracts to native
authority/receipts on a supported toolchain; bundle aggregate reduction is a
separate measured performance task.
