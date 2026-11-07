# Native integration audit — 2026-11-07

Read-only audit of the current checkout. Native capability is present in the
following seams and should be extended instead of replaced:

## Existing seams

- `src-tauri/src/harness_bridge.rs` owns agent session create/read/send,
  permission modes, model/fallback settings, compaction and event delivery.
- `src-tauri/crates/omnia-harness/src/memory.rs`, `skills.rs`, `plugins.rs`,
  `subagent.rs`, `mcp/` and `tools/` implement durable memory indexes, skills,
  plugins, subagent execution, MCP and bounded tools.
- `src-tauri/src/workspace_indexer.rs` plus `native_commands.rs` implement
  bounded lexical indexing and retrieval. Renderer wrappers live in
  `src/lib/desktop.ts` (`workspace_index_build` and
  `workspace_index_retrieve`).
- `src-tauri/crates/omnia-browser` and `omnia-computer` expose controlled
  browser/desktop tools with approval and emergency-stop paths. The shell
  enumerates the tool names in `src/agent/agent-shell.tsx`.
- `src-tauri/src/data_portability.rs`, `app_state_persistence.rs` and the
  agent data export/import commands provide the durable portability boundary.

## Gaps to close in priority order

1. Add a native `runtime_settings` snapshot row or extend the app-state
   snapshot, then emit a settings-changed event so renderer changes survive
   restart without weakening the core session header.
2. Add pointer records keyed by project plus normalized source identity. Update
   content/hash on watcher events; mark `source_exists=false` on deletion while
   retaining the latest stored blob.
3. Add a run context receipt containing RAG matches, omissions, token budget and
   scorer/index versions. Reuse the existing run journal rather than a second
   event bus.
4. Add a compare request that fans out through existing provider adapters and
   persists each attempt's model, usage and completion independently before a
   merge step.
5. Add browser/computer capability receipts to every approval and record whether
   the action used DOM, screenshot, OCR or headless mode.

## Verification commands

```powershell
npm.cmd run typecheck:app -- --pretty false
npx vitest run src/agent/intelligence-contracts.test.ts src/agent/session-tabs.test.tsx
cargo test --manifest-path src-tauri/Cargo.toml -p omnia-harness
```

The first two commands are renderer evidence. Cargo/native checks must be run
on a Windows toolchain with the repository's locked dependencies before a
packaged release claim.
