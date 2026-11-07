# Upstream harness reuse ledger — 2026-11-07

Omnia keeps the extracted upstream implementations under
`upstream_extractions/` as evidence and reference material. This ledger records
which compatible ideas are already connected to Omnia's native harness and
which remain separate adapters. Extracted code is not blindly copied into the
renderer: each integration must preserve Omnia's permission, trust, bounded
output and audit boundaries.

## Connected capability families

| Extracted family | Useful contract reused | Omnia integration | Evidence |
|---|---|---|---|
| Claude harness | Artifact lifecycle, thinking blocks and prompt caching boundaries | Existing artifact store/preview, transcript thinking blocks and bounded prompt/runtime contracts | `src-tauri/src/artifact_commands.rs`, `src/agent/transcript.ts`, `src/agent/runtime-settings.ts` |
| Codex harness | Unified exec sessions, worktree lifecycle and patch-oriented edits | Existing shell/git/worktree tools, approvals and checkpoint/review paths | `src-tauri/crates/omnia-harness/src/tools/`, `src-tauri/src/review.rs`, `src-tauri/crates/omnia-harness/src/checkpoint.rs` |
| OpenHands/agent plugins | Plugin component layout and conformance cases for skills/MCP/agents | Omnia plugin manifest, install, enable/disable, trust-gated MCP and plugin-contributed skills/agents/commands | `src-tauri/crates/omnia-harness/src/plugins.rs`, `src-tauri/src/plugin_bridge.rs` |
| Claude/OpenAI style skills | `SKILL.md` frontmatter, precedence, on-demand loading | Project/user/plugin discovery, compact prompt index and `skill` tool | `src-tauri/crates/omnia-harness/src/skills.rs` |
| Agent role/subagent harnesses | Role definitions, tool allowlists, read-only roles and bounded recursion | Built-in/project/user/plugin agent discovery and `task` delegation | `src-tauri/crates/omnia-harness/src/subagent.rs` |
| MCP implementations | JSON-RPC over stdio/streamable HTTP, pagination, cancellation and tool sanitization | Trust-gated MCP manager, status/reload commands and MCP tools in the same registry | `src-tauri/crates/omnia-harness/src/mcp/`, `src/agent/mcp-status.tsx` |
| DeepSeek/Claude reasoning patterns | Incremental thinking/usage accounting and high-effort routing | Native streaming events, usage accounting and renderer effort routing including `ultra` downgrade | `src-tauri/crates/omnia-harness/src/agent/`, `src/agent/model-routing.ts` |
| OpenHands plugin fixtures | Broken-entry isolation, unsupported transport rejection and version boundaries | Existing plugin/MCP validation rejects malformed or unsafe entries without taking down siblings | `src-tauri/crates/omnia-harness/src/plugins.rs`, `src-tauri/crates/omnia-harness/src/mcp/` |
| Perplexity synthesis + Orca debate references | Query fan-out intents, citation graph shape and explicit debate/evaluation stages | `upstream-research-adapter` requires an approved gateway, bounded concurrent search/capture, source hashes, exact quote spans and content-free execution/citation receipts; confidence and hostname heuristics are not treated as truth | `src/domain/upstream-research-adapter.ts`, `src/agent/research-workflow.ts`, `.agents/checkpoints/upstream-research-adapter-result-20261107.md` |
| Upstream CLI/process entrypoints (Codex, Claude, OpenCode, Hermes) | Explicit argv, stream lifecycle, cancellation and exit attribution | The exported `upstream-process-adapter` contract is the trusted-host boundary for catalog entries marked `process-adapter`; it requires absolute host-selected paths, an authority receipt, bounded output/time, and emits content-free hashes. No renderer process spawn or ambient environment inheritance is allowed. | `src/domain/upstream-process-adapter.ts`, `src/domain/index.ts`, `src/domain/upstream-process-adapter.test.ts` |

## Renderer-facing capability catalog

The agent bridge now exposes the resolved session catalog with the same
precedence as an actual run:

- `agent_skills_list`: project, user and enabled-plugin skills, without sending
  full instruction bodies to the renderer.
- `agent_agents_list`: built-in, project, user and enabled-plugin roles, with
  tool/model/read-only metadata while keeping role prompts private to child
  contexts.

These commands are intentionally session-scoped so trust and plugin filtering
cannot drift from the run path. The TypeScript wrappers and contract tests live
in `src/agent/agent-api.ts` and `src/agent/agent-api.test.ts`.

## Deliberate boundaries

- Extracted packages with separate runtimes (for example full OpenHands server,
  Antigravity ConnectRPC, or proprietary desktop binaries) remain adapter
  references until a native bridge and permission model exist.
- Upstream network/provider code is not allowed to bypass Omnia's secret store,
  endpoint policy, workspace trust or approval broker.
- A repository being present under `upstream_extractions/` is not counted as a
  shipped feature. It only becomes Done after an Omnia command/adapter, test and
  receipt are present.
