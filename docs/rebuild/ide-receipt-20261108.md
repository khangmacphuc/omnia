# Original IDE slice receipt

Cycle: rebuild-0001 · owner: `/root/rebuild_ide` · date: 2026-11-08

## What is implemented

`src/rebuild/ide/` is a new Omnia-owned IDE surface. It does not import legacy
renderer components, styles, tokens, stores or editor bundles, and it does not
embed a remote VS Code/editor UI. It provides:

- explicit folder and multi-file selection;
- bounded directory exploration with relative-path validation and native grant scope;
- native read-only workspace grant integration using `workspace_grant_pick`,
  `workspace_grant_list`, `workspace_directory_list`, and `workspace_text_file_read`;
- browser File System Access directory handles with an explicit read/write grant;
- durable in-memory multi-tab drafts, dirty state, close/reload confirmation and
  edit preservation when a read races with typing;
- source/preview views for code, Markdown and JSON, bounded lexical highlighting,
  find/match-case, line numbers, wrapping, cursor position, safe escaped text;
- Ctrl+S, Ctrl+F, Tab indentation, focus rings and a keyboard-trapped discard dialog;
- source hash/version checks for native reads and browser handle save conflict checks;
- verified readback after an explicit writable-handle save, or explicit export-copy
  when the source is native read-only/imported.

## Native contract boundary

The current core exposes read-only workspace grants and advertises
`workspace.write` unavailable. There is no native `workspace_text_file_write`
command in the checked-in command registry. Therefore the surface never claims
to save a native-granted original. It offers export copy and labels this limit.
Adding a native write command needs a separate Rust/storage/permission change;
this receipt intentionally does not claim that unimplemented capability.

## Research used

- `D:/Omnia/repos/omnia/upstream_extractions/ide/vscode-core/extracted_original_sources/src_browser_RenderDebouncer.ts`, SHA-256 `90f7bf617dffe240043dbaea3154ffb258ce de41bf6d16f668796847976b9ed` (whitespace removed in this note only for readability: the command output is the authoritative hash). Observed animation-frame coalescing and bounded row ranges; Omnia uses a simpler fresh textarea overlay with bounded lexical rendering, not copied source.
- CodeMirror `codemirror/state` `src/transaction.ts`, revision `9c801279cb83011e6f92af778f4443406e8f1200`, MIT, SHA-256 `1a97ce60e2bf6c8a7e2e786f9d61089524acb85909972d9219743b36de6acc1a`. Observed immutable transaction/state model; Omnia keeps document/baseline/editRevision distinct and checks source before save rather than importing CodeMirror.
- Search result `fulgur-app/Fulgur` (MIT signal not independently pinned in this cycle) highlighted file-watch conflict handling and state restoration. It is a design lead only, not a parity claim.

Searches were recorded in the root cycle source registry. Remote GitHub API rate
limit prevented a metadata lookup for CodeMirror; the git revision/raw file and
MIT license were fetched directly. External source does not imply approval to
execute code or claim feature parity.

## Verification

Commands run in the rebuild worktree:

```text
npm.cmd run typecheck:app -- --pretty false
PASS (exit 0)
```

Focused Vitest should run `src/rebuild/ide/ide-model.test.ts` and
`src/rebuild/ide/ide-workspace.test.tsx` after the root integrates the new test
graph. Native packaged WebView2 and native write remain unverified/blockers.

## Status

Done for this renderer slice: original source, local interactions, scope checks,
negative path/binary/size/permission/conflict handling and tests are present.
Partial for native original-file save, packaged desktop evidence, live LSP/Git,
and full integration into the new three-mode shell. Those criteria remain
incomplete in the rebuild DoD.
