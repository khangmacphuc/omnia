# New open-source harness research — cycle 0009

Observed: 2026-11-08 16:00–16:18 Asia/Bangkok (2026-11-08 UTC).
Owner: `/root/cycle9_research_harness`.
Scope: browser/computer harness, agent sessions, context compaction, RAG/MCP adapters and evidence boundaries.

## Method and evidence boundary

Fresh discovery queries (GitHub search/API and canonical repository refs):

- `everything agent harness browser open source`
- `superpowers agent workflow open source`
- `power max computer use harness open source`
- `headless browser agent session manager open source`
- `RAG MCP context compaction technical agent UI open source`

The first three special-term queries returned mostly low-signal or zero-result repositories; the findings below were selected by inspecting source, not by star count. The exact repository/revision/path tuples were absent from `docs/rebuild/SOURCE_REGISTER.json` and prior cycle research at the time of review. Repositories were shallow-cloned with `--filter=blob:none --depth=1 --no-checkout`, then read with `git show`; no install, build, post-install hook or downloaded program was executed. Temporary clones were outside the checkout and are not product dependencies.

A GitHub API search attempt also returned a rate-limit response for broad queries. That failure is recorded as a limitation rather than treated as a finding. Search snippets and README claims are discovery evidence only; the source files and pinned revisions below are the research evidence.

## Reviewed source matrix

| Repository and license | Commit | Exact source read (SHA-256) | Observation | Omnia decision |
| --- | --- | --- | --- | --- |
| [browserbase/stagehand](https://github.com/browserbase/stagehand), MIT (`LICENSE` hash `e053e6d5251ea56b24adec128be6c0c9af30733ee64812de26f9b8ed196cc3eb`) | `310957518a931c1a84c5968b13282cc30acd1be9` | `packages/cli/src/lib/driver/session-manager.ts`, `f96928de5af6aa97eedd375dd2678c0e39592ee853f1fb7f5f7d2d64c254f445`, 455 lines; `packages/cli/src/lib/agent.ts`, `c858a63f150604e48119fb0f94db36840f50172a29f11ef5be45bc234b692d5b`, 17 lines | A driver manager owns a session identity, browser lifecycle and network sidecar; close clears live handles and closes sidecars. Initialization failures use bounded exponential backoff and reset after a successful or changed configuration. Agent detection is best-effort and fails closed to `null`. | **Apply as a clean-room contract.** Give Browser/Computer leases an explicit session owner, teardown receipt and bounded retry state; reset retry after configuration changes. Do not import Stagehand UI or runtime code. |
| [gptme/gptme](https://github.com/gptme/gptme), MIT (`LICENSE` hash `92a6af05375cf187465b2c2ca88d8ceeece5d2c86bd13ffe42e781bdd7bd2dc5`) | `e555ceb2cc95879b05de5f53227fa2ff9d6b93a3` | `gptme/context/adaptive_compressor.py`, `cca0efcb46c832f6e2b75ede69a305aee9295647337c6d967e8aecc41f0de59a`, 438 lines; `gptme/context/compress.py`, `f87fb49c835f3b7006c4ff856c6d9b118d53933b14d35c71c0210edc0526a9dd`, 270 lines; `gptme/commands/rag.py`, `cfde785f622ab7b1d3d8301cac137688b8242435c4ec11c5e0fca5957492ef51`, 61 lines | Compression returns original/compressed content, achieved ratio, classification, rationale and token savings; the adaptive path preserves code blocks and scores sentences. The `/rag` command validates an input, checks provider availability, then injects retrieved results as a message with explicit unavailable errors. | **Apply the evidence shape, reimplement in TypeScript/Rust.** Every Omnia compaction receipt should record before/after token estimates, preserved pinned sections, ratio, rationale and fallback. RAG should produce a bounded retrieval receipt and explicit unavailable/empty states. These source semantics do not prove Omnia's 200k/10k limits or native runtime. |
| [Cinnamon/kotaemon](https://github.com/Cinnamon/kotaemon), Apache-2.0 (`LICENSE.txt` hash `43070e2d4e532684de521b885f385d0841030efa2b1a20bafb76133a5e1379c1`) | `9ad3e4e49aa35b8acddd235918a5d9753c1cfdf9` | `libs/kotaemon/kotaemon/agents/tools/mcp.py`, `0781ed3026639955f17baa200055032dc86dc36e7a9f64e708b4e602e4f4b7ef`, 380 lines; `libs/kotaemon/kotaemon/indices/qa/format_context.py`, `b5d3f462502999574d4686985d35c2d702c04ac5e28650cac165f4d34d53c489`, 114 lines; `libs/kotaemon/kotaemon/indices/retrievers/jina_web_search.py`, `84e8d88b7e4fb32de9a64b19e26da3ecadd0613549726ce649527222639a28c9`, 60 lines; `libs/kotaemon/kotaemon/storages/vectorstores/base.py`, `ffe2c7f0edc533744f4ff1715626aa7bef2e0683e62ed44a837d4b7edb8ad70`, 186 lines | MCP JSON Schema is converted into typed argument models before invocation. Evidence preparation uses a token splitter, source/page metadata and content modes (text/table/chat/figure). Web retrieval returns document objects with URL/title/description/content metadata. Vector storage is an explicit abstraction rather than a hidden global index. | **Apply as a clean-room adapter contract.** Normalize MCP schemas before exposing tools; preserve source URL/page/content type and token bounds in RAG receipts; keep vector/index backend behind a capability interface. Do not copy Python implementation or assume a web API key/provider is available. |

## Synthesis: concrete Omnia gaps and acceptance targets

1. **Browser/computer lifecycle:** add session/lease ownership, active-tab generation and deterministic teardown. A retry receipt must distinguish initialization failure, permission denial and outcome-unknown; no blind replay after unknown acceptance. Add positive, stale-lease, close-race and configuration-reset tests.
2. **Context compaction:** persist a receipt with input token estimate, output estimate, pinned content hash, tool-output truncation, ratio, rationale and fallback. The receipt must be append-only and reject a non-shrinking result when the budget is exceeded. Source examples are policy references, not proof of Omnia's target budgets.
3. **RAG/MCP evidence:** introduce a typed normalized schema for tool arguments and retrieval results. Every served document carries URL/path, source hash, page/content type, rank, query scope, filter, timestamp and truncation reason. Empty index, unavailable provider, invalid schema and timeout are explicit terminal states.
4. **Source/backend boundary:** preserve backend independence (local lexical/vector/remote web) and expose capability/permission status. A successful adapter unit test cannot be promoted to live WebView2 or provider evidence.
5. **Research governance:** register each tuple with repository, revision, license, query/time, exact path/hash, novelty, strength, weakness, decision and source snapshot. The GitHub API rate-limit result is a blocked search attempt with a next query, not a source.

## Non-claims and reproducibility

- This note contains source/repository evidence only. It does not prove packaged Tauri IPC, WebView2, Windows UI Automation, authenticated web search, provider model refresh, or live RAG execution.
- MIT and Apache-2.0 sources are references; no source code was copied into Omnia. Any future implementation must use Omnia-owned contracts and preserve provenance.
- Stagehand's network/session behavior may depend on external Browserbase/Chrome services; its README is not used as runtime proof.
- gptme's token estimates and Kotaemon's web retrieval depend on Python libraries/providers not present in Omnia's native runtime.
- Re-read `SOURCE_REGISTER.json`, `SPEC.md`, `DOD.json` and `CHECKPOINT.md` after this note is integrated; register these tuples only with their exact snapshot bindings and keep all criteria Partial/Blocked until direct Omnia evidence exists.
