# Extraction corpus audit — rebuild-0001

**Generated:** 2026-11-08 04:20 Asia/Bangkok  
**Scanner:** `scripts/rebuild/source-inventory.mjs`  
**Root:** `D:/Omnia/repos/omnia/upstream_extractions`

The scanner observed every top-level category and module except
`desktop-apps/zalo-desktop`, as the user requested. It skips generated/binary
asset trees and credential/profile-shaped paths, caps each module at 2,000 files
and depth six, and records those limits in the machine-readable inventory.

## Observed result

| Measure | Observation |
| --- | ---: |
| Categories | 10 |
| Modules | 54 |
| Modules with readable source-like files | 54 |
| Modules with 20+ observed source-like files | 21 |
| Modules truncated by safety bound | 14 |
| Excluded | `desktop-apps/zalo-desktop` |

The result is a **bounded observation**, not an assertion that all extracted
files were read or that a module has runtime/feature parity. Truncated modules
remain an audit gap. `upstream_extractions` contains large runtime bundles and
state-like trees; those are evidence only and are not added to Omnia's source
or executed by this workflow.

The scanner now hashes up to 12 source-like samples per module (393 hashes in
this run) while never reading credential/profile-shaped paths. A content hash
proves the sampled bytes, not semantic review or upstream freshness. Local Git
revisions and remote source revisions are tracked separately in
`SOURCE_REGISTER.json`.

Representative files inspected directly in this cycle include:

- `desktop-apps/chatgpt-desktop/package.json`
- `desktop-apps/chatgpt-desktop/SPEC_AND_ARCHITECTURE.md`
- `harnesses/chatgpt-desktop/CHATGPT_DESKTOP_SPEC.md`
- `browser/chrome-canary/ARCHITECTURE_AND_CDP_SPEC.md`
- `browser/chrome-canary/src/cdp-client.ts`
- `research/perplexity-synthesis/src/query-fanout.ts`
- `research/perplexity-synthesis/src/citation-graph.ts`
- `research/orca-debate/src/debate-protocol.ts`
- `web-apis/chatgpt-web/src/client.rs`
- `web-apis/claude-web/src/client.rs`
- `cli/opencode-cli/SPEC_AND_PROTOCOL.md`

Their presence informs adapter and research criteria; it does not establish
that every contract is implemented or safe to run. The full bounded record is
[`CORPUS_INVENTORY.json`](CORPUS_INVENTORY.json).

## Microsoft Store freshness boundary

Read-only `Get-AppxPackage` on this machine returned `OpenAI.Codex
26.1103.4239.0` at `C:\Program Files\WindowsApps\OpenAI.Codex_26.1103.4239.0_x64__2p2nqsd0c76g0`.
No ChatGPT/OpenAI.ChatGPT MSIX was returned. This is an account/machine-specific
freshness gap, not proof that a Store ChatGPT update does not exist elsewhere.
The extracted `desktop-apps/chatgpt-desktop` is a small `@omnia-upstream`
reconstruction shell and cannot prove current Microsoft Store behavior.

## Source observations and limits

`harnesses/openai-codex/AGENTS.md` records bounded context and MCP ownership
rules; `harnesses/deepseek-harness/HARNESS_SPEC.md` describes reasoning and
prefix-cache ideas; `research/perplexity-synthesis/RESEARCH_SYNTHESIS_SPEC.md`
describes a citation graph and structured synthesis; `tools/rea/README.md`
documents a local MCP reverse-engineering workflow. These are source-adjacent
contracts or reconstructions, not native/live provider evidence. Sensitive
notebook cookie/key material was withheld. Promote any module to a production
adapter only after permission, negative-test, cancellation and native runtime
receipts exist.
