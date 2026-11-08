# Cycle 8 IDE OSS research (2026-11-08)

## Scope and query log

- Retrieved: 2026-11-08T08:31:00+07:00 (Asia/Bangkok).
- Queries: open source everything super power pro max IDE workspace project worktree persistence Rust; GitHub Zed project worktree snapshot agent IDE; GitHub Lapce Rust IDE workspace tabs; GitHub Theia plugin RPC frontend contributions IDE architecture.
- Repositories were checked with git ls-remote and source was fetched from the pinned HEAD revisions below. No downloaded scripts were executed and no credentials, profiles or private data were accessed.
- Deduplication: none of the repository/revision/path tuples below occur in docs/rebuild/SOURCE_REGISTER.json or prior cycle research notes. This is discovery evidence, not a claim that Omnia has integrated these projects.

## Sources and exact paths

| Repository | Revision | License | Exact source path | SHA-256 | Canonical source |
|---|---|---|---|---|---|
| zed-industries/zed | b5cd310b3b54dfc659fcc06453e6358843dfe216 | Apache-2.0 | LICENSE-APACHE | 752daf2fb234ca4a1fa372c073fe127f44b7b90fd2529ae44273a64f9d53da7a | https://raw.githubusercontent.com/zed-industries/zed/b5cd310b3b54dfc659fcc06453e6358843dfe216/LICENSE-APACHE |
| zed-industries/zed | b5cd310b3b54dfc659fcc06453e6358843dfe216 | Apache-2.0 | crates/project/src/project.rs | 33cba75d2cd81a45c0a8f2ec4057d21feadc7d786a31e002c5ac41ed76db8933 | https://raw.githubusercontent.com/zed-industries/zed/b5cd310b3b54dfc659fcc06453e6358843dfe216/crates/project/src/project.rs |
| zed-industries/zed | b5cd310b3b54dfc659fcc06453e6358843dfe216 | Apache-2.0 | crates/worktree/src/worktree.rs | bbc2c6682bcba2e026c791b7a848be949c927533a20ae5e4b32baa483b8d6601 | https://raw.githubusercontent.com/zed-industries/zed/b5cd310b3b54dfc659fcc06453e6358843dfe216/crates/worktree/src/worktree.rs |
| lapce/lapce | f66ffaa95387794205c35864517de70958b9ea8d | Apache-2.0 | LICENSE | c71d239df91726fc519c6eb72d318ec65820627232b2f796219e87dcf35d0ab4 | https://raw.githubusercontent.com/lapce/lapce/f66ffaa95387794205c35864517de70958b9ea8d/LICENSE |
| lapce/lapce | f66ffaa95387794205c35864517de70958b9ea8d | Apache-2.0 | lapce-app/src/app.rs | 2238decdd36a7ffd63ebd08c49b4056f1e216d943e54dc1bfcd7a46f327bbf93 | https://raw.githubusercontent.com/lapce/lapce/f66ffaa95387794205c35864517de70958b9ea8d/lapce-app/src/app.rs |
| lapce/lapce | f66ffaa95387794205c35864517de70958b9ea8d | Apache-2.0 | lapce-core/src/directory.rs | 6bc9fd793c033ef1e0f9d4c26c4db029d90229279d7b9d894d004d2418f47ac4 | https://raw.githubusercontent.com/lapce/lapce/f66ffaa95387794205c35864517de70958b9ea8d/lapce-core/src/directory.rs |
| eclipse-theia/theia | 8179891fc92c56cc10a6ff0f61d2a139dfeb8b41 | EPL-2.0 OR GPL-2.0-only WITH Classpath-exception-2.0 | LICENSE-MIT.txt | cfca8e97a3cb58c3a8004c4642dfec191b09d3e76a322c232d0b7edf3d66aa7c | https://raw.githubusercontent.com/eclipse-theia/theia/8179891fc92c56cc10a6ff0f61d2a139dfeb8b41/LICENSE-MIT.txt |
| eclipse-theia/theia | 8179891fc92c56cc10a6ff0f61d2a139dfeb8b41 | EPL-2.0 OR GPL-2.0-only WITH Classpath-exception-2.0 | packages/core/src/browser/frontend-application.ts | ae753450c0118b8481513e74e37055e7f9bb27432859c24e72a7fb4ba7c8d6a9 | https://raw.githubusercontent.com/eclipse-theia/theia/8179891fc92c56cc10a6ff0f61d2a139dfeb8b41/packages/core/src/browser/frontend-application.ts |
| eclipse-theia/theia | 8179891fc92c56cc10a6ff0f61d2a139dfeb8b41 | EPL-2.0 OR GPL-2.0-only WITH Classpath-exception-2.0 | packages/plugin-ext/src/common/plugin-api-rpc.ts | 7238a10ab964d14fa2868832b017bb8408168d5dff0d2feb80ebd57c93d22c91 | https://raw.githubusercontent.com/eclipse-theia/theia/8179891fc92c56cc10a6ff0f61d2a139dfeb8b41/packages/plugin-ext/src/common/plugin-api-rpc.ts |

## Source observations

### Zed

crates/project/src/project.rs models a project as a semantic entity over one or more worktrees, with stores for buffers, tasks, breakpoints, DAP, users and agent servers. crates/worktree/src/worktree.rs maintains path-indexed and ID-indexed snapshots, filesystem watching and path changes, including explicit scan/watch latency and invalidation semantics. This gives Omnia two useful boundaries: project identity remains separate from worktree roots, and file pointer updates can be represented by stable entry identity plus refreshed snapshots. It does not prove Omnia's pointer storage or Tauri runtime.

**Strength:** durable project/worktree separation, stable entry identity, snapshot and watcher lifecycle.

**Weakness:** large Rust editor internals and Zed-specific entity/runtime assumptions; no Omnia UI/native proof.

### Lapce

lapce-app/src/app.rs separates app/window/window-tab state, command routing, focus and workspace selection, while lapce-core/src/directory.rs handles directory identity and path selection. This is useful for Omnia's top-level IDE workspace tabs and session continuity: app-level window state should not own file buffers, and directory selection should pass through a typed workspace command. It does not prove native persistence or model integration.

**Strength:** explicit window/tab/workspace command boundaries and typed directory selection.

**Weakness:** editor-specific reactive runtime; source is not a drop-in Omnia contract and does not cover project pointer rename recovery.

### Eclipse Theia

packages/core/src/browser/frontend-application.ts treats startup as ordered contribution stages and records timing around each stage. packages/plugin-ext/src/common/plugin-api-rpc.ts defines typed plugin lifecycle, activation and RPC boundaries, including active/running states and Promise-based activation. This supports Omnia's plugin/MCP architecture: plugin activation should be explicit, cancellable and measured, while UI startup should reveal only after required contributions settle. Theia's license is mixed; Omnia must not copy code or assets and must keep only the contract-level decision.

**Strength:** lifecycle contributions and typed activation/RPC boundaries with explicit status.

**Weakness:** Theia's browser workbench and mixed licensing are not suitable for embedding or direct reuse; startup metrics are not proof of Omnia performance.

## Synthesis: original Omnia decisions

1. **Pointer/worktree identity:** maintain a stable internal project/worktree ID and file pointer ID, while storing latest path/name/content snapshot separately. A rename updates the pointer target; a deleted source retains the latest Omnia snapshot.
2. **Workspace tabs:** keep Chat, Browser and IDE top surfaces separate from app/window/workspace/file tab state; selecting a folder is a typed action that updates the IDE workspace, not a hidden global.
3. **Lifecycle gate:** model plugin/MCP/skill activation as an ordered contribution graph with explicit requested → activating → active | unavailable | failed | stopped states, cancellation and per-contribution timing receipts.
4. **Clean-room boundary:** these are design observations only. Do not vendor, import, embed or replicate Zed/Lapce/Theia UI or source.

## Evidence limits and decision

- **Decision:** apply-as-reference for contracts; reject direct code/UI reuse and live embedding.
- Repository popularity, current HEAD and source hashes establish only that the pinned source was inspected. They do not establish feature parity, correctness, security or Omnia runtime behavior.

