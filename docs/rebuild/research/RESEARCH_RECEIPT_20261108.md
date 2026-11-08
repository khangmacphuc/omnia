# Research receipt — rebuild-0001

**Cycle:** rebuild-0001 · **Retrieved:** 2026-11-08 Asia/Bangkok · **Scope:**
new open-source sources and extracted corpus freshness. **Operator:**
`/root/rebuild_source_research`.

## Commands and results

| Command / action | Result | Boundary |
| --- | --- | --- |
| `node scripts/rebuild/source-inventory.mjs` | exit 0; 11 categories, 54 modules, 481 safe sample hashes, Zalo excluded | Bounded hash inventory; not semantic review or upstream parity. |
| Read-only `Get-AppxPackage` for `ChatGPT/OpenAI/Codex` | exit 0; `OpenAI.Codex 26.1103.4239.0` at WindowsApps; no ChatGPT package returned | Account/machine-specific freshness gap; no WindowsApps payload scraped. |
| `git clone --depth 1 --filter=blob:none --no-checkout` for 8 new OSS repos | exit 0 for 7; `git ls-remote` + clone corrected `volcengine/OpenViking` canonical main | No install/postinstall scripts executed. |
| `git show HEAD:<path>` + SHA-256 | exact source paths and hashes recorded in `SOURCE_REGISTER.json` | Read content is reference evidence; license and runtime claims remain scoped. |
| Web searches with everything/super/power/pro/max and harness/IDE/MCP/RAG terms | sources selected, deduplicated by canonical repo/revision/path | GitHub REST API returned 403 rate limit; no star count used as proof. |

## Fresh sources recorded

Fourteen sources are in `SOURCE_REGISTER.json`: six workflow/control-plane
sources discovered in parallel plus Microsoft Agent Framework, UI/UX Pro Max,
Vercel agent-desktop, OpenViking, agentic-rag, RagLeap Core, SuperClaude
Framework, and everything-claude-code strategic-compact. The latter eight each
have a pinned commit, exact read path and content hash. Existing baseline sources
`obra/superpowers`, `browser-use/browser-harness`, `browser-use/desktop` and
`badlogic/pi-mono` were deliberately not counted as new in this cycle.

## Extraction status

The corpus includes 25 local reconstruction wrappers. They are useful contracts
and design clues only. A module with a local `.git` revision is not automatically
fresh against upstream. Sensitive names (cookies, master keys, tokens, profiles,
session state) were withheld from hashing. `CORPUS.md` and the JSON inventory list
all limits and the exact next checks.

## Disposition

Apply only bounded, license-compatible design ideas: checkpoint ownership,
approval and untrusted result semantics, tree-first computer actions, summary-
first context navigation, deterministic retrieval spans, and phase-aware
compaction. Do not copy UI, embed external apps, or claim provider/native parity
from these sources. OpenViking's pinned `LICENSE` is AGPL-3.0; only concepts are
eligible pending legal review, never vendored code.
