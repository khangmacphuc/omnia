# Cycle 9 MCP, skills, workflow and memory research

**Cycle:** `rebuild-0009`  
**Owner:** `/root/cycle9_research_mcp`  
**Recorded:** 2026-11-08 16:52:16 Asia/Bangkok (09:52:16 UTC)  
**Scope:** newly reviewed open-source MCP, skill-registry, MCP-client and local-memory source.  
**Safety boundary:** source was read at pinned commits only. No downloaded source was executed, installed, or added as a dependency; no credentials, browser profiles, cookies, or private transcripts were accessed.

## Search and novelty method

Fresh web queries were run on 2026-11-08 using the configured web search service:

1. `GitHub open source MCP skills workflow memory everything super power pro max 2026`
2. `site:github.com open source MCP registry skills context memory agent architecture`
3. `site:github.com everything superpowers MCP server skills repository`
4. `site:github.com power pro max agent memory MCP open source`

Search results were screened against `docs/rebuild/SOURCE_REGISTER.json` and the
cycle-8 research manifest by canonical owner/repository, commit, and exact path.
The four repository/commit/path tuples below were not present in the register at
the time of review. A repository name or search-result description was treated as
a discovery signal only; decisions below are based on the source files actually
read. GitHub stars and activity were not inferred because the API is rate-limited.

Temporary clones were shallow, no-checkout clones under
`C:\Users\khang\AppData\Local\Temp\omnia-mcp9-20261108`; they are not product
inputs and are intentionally not committed.

## Evidence matrix

| ID | Canonical repository, revision and license | Exact source read (SHA-256) | Observed behavior | Omnia decision |
| --- | --- | --- | --- | --- |
| MCP9-01 | [agentic-community/mcp-gateway-registry](https://github.com/agentic-community/mcp-gateway-registry), `3128817e70f62a8589349fc702a124b36e97e7c8`; Apache-2.0 (`LICENSE`, SHA `09e8a9bcec8067104652c168685ab0931e7868f9c8284b66f5ae6edae5f1130b`) | `docs/design/agent-skills-architecture.md`, SHA `c281268b9eab17c9a4e1877ae878d1f4ca45bbedd8ceff8e2fad6962940acad3` | Separates executable MCP servers from document skills; models skills as URL-addressed `SkillCard` records with immutable path, source/registry, version, compatibility requirements, target agents, allowed tools, visibility, health and timestamps. It defines card → summary → full progressive disclosure and translates GitHub/GitLab/Bitbucket blob URLs to raw content. | **Apply with changes:** Omnia's catalog should keep origin, immutable path, revision/digest, compatibility, target model/agent, required tools and visibility in a typed manifest. Use progressive metadata → instructions → resources. **Reject:** URL fetching alone is not integrity or permission proof; Omnia must pin bytes and require activation approval before any remote read or install. |
| MCP9-02 | [StacklokLabs/skills-mcp](https://github.com/StacklokLabs/skills-mcp), `4d7e2309c086f6d61048f125c79daa8b80fca3e8`; repository root has no `LICENSE` file at this revision; README is the available project metadata (SHA `270a8dc4ffb1a469ad0529bb7f07179f392b4c98bbdc4c28c9f3d931ff759522`) | `docs/explanation/architecture.md`, SHA `ff8a72efabe526bbf0cbef198bc14488fbc923ee9e5e9dde3f23fcf1122b41ea` | Implements three token tiers: metadata (~100 tokens), instructions (<5000 tokens), then resources. It keeps per-MCP-connection expanded state, supports resources/tools/prompts for clients with different loading behavior, uses immutable bounded snapshots (regular files, bytes, mtime, size, SHA-256, optional token estimate), rejects symlinks and snapshots above 512 files or 16 MiB, and retains duplicate names at distinct source paths. | **Apply:** model Omnia skill/resource snapshots as immutable bounded records and expose tiered retrieval. Tie expansion state to a session, preserve exact bytes and digests, and notify the client when the visible resource list changes. **Reject/defer:** the documented Python server is not native Tauri/runtime evidence; do not claim protocol parity or copy its implementation. License must be resolved before any redistribution. |
| MCP9-03 | [apify/mcpc](https://github.com/apify/mcpc), `6c30b7ca17d82151e1605d8cb22d67d15602132d`; Apache-2.0 (`LICENSE`, SHA `c71d239df91726fc519c6eb72d318ec65820627232b2f796219e87dcf35d0ab4`) | `README.md`, SHA `483b152063c90ea7f6ccf1115695247831680a3fb7f1cf12d48ec59a2861258f` | Provides a universal CLI over MCP tools, prompts, resources, asynchronous tasks, notifications and skills over stdio and Streamable HTTP. It emphasizes persistent multi-server sessions, progressive tool discovery, JSON/code mode, OAuth 2.1 with OS-keychain credentials, proxy/sandboxing, and shell composition so an agent can use one bounded Bash surface instead of injecting every tool definition. | **Apply selectively:** Omnia's MCP gateway should support lazy capability discovery, persistent connection identity, bounded JSON output, cancellation/task receipts and explicit transport/auth status. A single summarized tool surface can reduce context pressure. **Reject:** do not invoke arbitrary shell commands or silently share OAuth profiles; native permission scopes, redaction, and user approval remain required. No claim of live MCP compatibility is made from this source. |
| MCP9-04 | [richarvey/OmniMem](https://github.com/richarvey/OmniMem), `3cadc848833ff0f867903c95f4b70760a1ee6f20`; MIT (`LICENSE`, SHA `8ee486b679b7b9c2c873d64427852d69f2f09d014281aa926f9108e04aea2527`) | `docs/architecture.md`, SHA `d472a1daee39a31f4159c77a726a7baf9ef71169bd64629e1a7e7660f0237caf`; `docs/atlas-evidence.md`, SHA `ac1e0e7a26025b19a651668394d10c164fe67a8a47f9ae1d8b1173661ad9e403`; `crates/omnimem-mcp/src/approval.rs`, SHA `f331e2e497849319fba649d7869f90f93c21eea82dbddec7405e6520f4954409`; `crates/omnimem-engine/src/skill_tools.rs`, SHA `c560d1888beeb1f872b075a5aba4f84e3ce21d64b2e800ec84dd2cf42e00fc68` | Uses one local process around an MCP server, SQLite store, local ONNX embedder and optional external enrichment. Its evidence ledger distinguishes held/claimed/not-yet marks; memory rows carry trust states and scoped recall; audit writes are transactional and can scrub forgotten text. Human-gated MCP elicitation returns accepted/declined/cancelled/unsupported and leaves pending proposals when a client cannot ask. Skill tools keep active-only filters and high-confidence thresholds. | **Apply:** Omnia should keep evidence state separate from product claims, bind retrieval to session/project scope, persist transactional audit receipts, expose trust/conflict states, and route skill/memory promotion through explicit ask-user approval. **Reject/defer:** the external service, model and performance claims are not Omnia runtime proof; do not enable remote memory or auto-promotion by default. |

## Synthesis for Omnia

### 1. Skill identity and progressive loading

Use `(origin, canonical path, revision, manifest SHA-256)` as the skill identity;
the display name is not unique. Store frontmatter, exact `SKILL.md` bytes, file
size and digest, compatibility requirements, requested tools, and permission
scope. Initial discovery returns metadata only. Expansion retrieves instructions;
resource files are fetched individually within a bounded byte/file budget. A
session-specific expanded set prevents a 200k-token context from being flooded by
unused skills. A changed digest invalidates the activation receipt and requires
re-approval.

### 2. MCP capability and transport receipts

Every connection and task should produce a receipt with server origin, transport,
session ID, capability revision, requested operation, redacted arguments, byte and
tool-output bounds, cancellation state, permission decision, and result hash. Lazy
discovery and a compact JSON mode are useful optimizations, but a compact result
must retain a pointer to the full replay and provenance. OAuth/keychain material
must stay in native protected storage and never enter renderer state or logs.

### 3. Memory and evidence governance

Separate durable knowledge, compact transcript, full replay and user artifacts.
Retrieval receipts should include owner/session/project scope, query hash, candidate
IDs, channel/rank/weight, dedup and conflict actions, returned count and duration.
Trust states (`candidate`, `accepted`, `disputed`, `superseded`, `rejected`) remain
visible; only explicit user approval promotes a candidate or generated skill. A
failed or unsupported ask-user path is a pending state, never implicit consent.

### 4. Security and implementation boundary

The sources support a clean-room Omnia design, not copied UI or runtime code.
Remote URL fetches, shell proxying, skill installation, OAuth, and memory sync all
require origin/license/hash checks, path traversal protection, redaction and an
explicit permission scope. Source inspection proves architecture decisions only;
packaged desktop IPC, live MCP providers, native keychain behavior and performance
remain open criteria for later cycles.

## Follow-up evidence required

- Add renderer/native tests for duplicate skill names across origins, manifest byte
  and digest mismatch, expansion notification, snapshot file/size limits, and
  session isolation.
- Add negative tests for unsupported transport, denied permission, cancelled task,
  stale capability revision, OAuth secret leakage and path traversal.
- Add native retrieval receipts for scope, rank, conflict, dedup and reload; prove
  that a discarded candidate cannot be promoted without a packaged ask-user flow.
- Resolve and record the license for StacklokLabs/skills-mcp before any code or
  documentation redistribution; this research note does not copy its source.
- Capture a real packaged Tauri/MCP connection and live provider only after the
  above tests pass. Until then MCP/skills/memory criteria remain Partial/Blocked.

## Claim boundary

This note records four newly reviewed pinned source revisions and concrete design
decisions. It does not claim that Omnia has implemented any adapter, installed any
skill, connected to an MCP server, or achieved provider/native parity. The source
registry and cycle manifest must bind these exact paths and hashes before the cycle
can claim research evidence.
