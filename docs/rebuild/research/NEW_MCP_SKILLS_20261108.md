# New MCP, skill, workflow and memory research

Cycle: `rebuild-0001`  
Research timestamp: `2026-11-08 04:15:10 Asia/Bangkok` (`2026-11-07 21:15:10 UTC`)  
Owner: `/root/new_research_mcp`  
Scope: open-source MCP, skill discovery, workflow hooks, context and memory systems.  
Exclusion: Zalo and any user credentials, browser profiles or private conversation data.

## Method and freshness boundary

Fresh queries were run through the configured web search service on
2026-11-08, rotating the requested terms `everything`, `super`, `power`, `pro`,
`max` with `MCP`, `skills`, `memory`, `workflow`, `agent`, `context` and `RAG`.
The searches returned candidates including `everything-gemini`,
`SuperClaude_Framework`, `skills-mcp`, `MemVault`, `OpenMemory`,
`remembrance-skills`, `saferskills`, `skillet` and the MCP Skills extension.
The prior source register did not yet exist in this rebuild checkout, so all
eight revisions below are new to the rebuild register. They are not claims that
the repositories are new to the historical Omnia corpus; the exact revision and
path are the deduplication key for future cycles.

GitHub's REST API returned HTTP 403 rate-limit responses during metadata
collection. Repository heads and source were therefore obtained with
`git ls-remote` and shallow `git clone --filter=blob:none --no-checkout`, then
read with `git cat-file` at the pinned commit. Stars, activity and API metadata
were intentionally not inferred. No downloaded code was executed.

Research commands and outcomes:

```text
git ls-remote <canonical-url> HEAD       # exit 0 for all 8 candidates
git clone --filter=blob:none --no-checkout --depth=1 --no-tags <url> <temp>
git cat-file blob HEAD:<path>             # source reads below
```

The temporary clones are outside the repository and are not product dependencies.

## Evidence matrix

| ID | Canonical repository and pinned revision | License evidence | Exact source read (SHA-256) | Observation and Omnia decision |
| --- | --- | --- | --- | --- |
| MCP-SKILLS-01 | [modelcontextprotocol/ext-skills](https://github.com/modelcontextprotocol/ext-skills), `649f7aee87d631ac4d1fdd3b12eef0c6264fdb3a` | `LICENSE`, Apache-2.0; file SHA `176304dd6eca2f20bba3dab7fb69def6e332ee280675a423db2c6abc141bec54` | `specification/beta/skills.mdx`, `6e33a33762783a02dc4c13c889dda5b8d7c525649012cf77da12d80c04ce685`; `docs/decisions.md`, `438b9abf7b52ba378c65087ac212d5c7880f0480435317576ae91c0a9af00e1a` | Skills are transported as MCP Resources with `skills/list`, `skills/get`, optional `resources/directory/read`; manifests include verbatim frontmatter, every file, byte size and SHA-256 digest. The spec requires capability declaration, pagination and explicit activation/approval; nested skills require fresh consent. **Apply:** model Omnia skill catalog as URI + origin + manifest digest + byte size + explicit activation and approval; reject stale/changed content before execution. **Do not copy:** this is a protocol binding, not an installer or policy engine. |
| MCP-SAFER-02 | [OpenLatch/saferskills](https://github.com/OpenLatch/saferskills), `672ff3d3a37b13014e2b4098b0d315ed7786119e` | `LICENSE`, Apache-2.0 (first lines and README badge); README SHA `5451b0ab7253b1bb8cbb6c4f28c2ad68ecf485d33565973b2a7566d26a860d00` | `cli/src/agents/enumerate.rs`, `71f8d192731fe9d3c6952be8744079299978fa602714807e9317ec622ab486`; `cli/src/agents/SCHEMAS.md` (path present; no content claim beyond enumeration source) | Local capability enumeration audits skills, MCP servers, hooks, rules, commands, subagents and plugin caches regardless of installation origin; command/agent files are normalized to a closed capability kind and uploaded as one structured archive. **Apply:** Omnia inventory should distinguish its install ledger from capabilities discovered on disk, normalize source kinds and retain source path/provenance. **Limit/reject:** do not upload local capability archives by default; Omnia needs local-only redaction, consent, hashes and permission scopes. |
| MCP-SKILLET-03 | [joshrotenberg/skillet](https://github.com/joshrotenberg/skillet), `cc7ca07fa929e9479f27f42ad15319f301ac3c17` | `LICENSE-MIT` plus `LICENSE-APACHE`, dual MIT/Apache-2.0; MIT SHA `ddeef4917e96ff9015e81119fcfeee1fa55421928d3daf7b232ed72cf003633b` (license file read) | `README.md`, `5e940f0f6a360aa9be5ecc01c597ca99ffceb13878b2c2503bc9f5df79e539d9`; `src/tools/search_skills.rs`, `f192e0cfd5f7d0afd0f9ad45b755de057fb7dbcd9944125087630441e6273cb9`; `src/index.rs`, `e537ba13ab1200750a46cd3ece068b45e8103ae0f281b2f9eeac973f83e364b3` | An MCP-native Rust service serves skills as prompts with no installation/restart. Search accepts query/category/tag/model verification; indexing walks bounded nested `SKILL.md` trees and gives frontmatter precedence. **Apply:** Omnia can search and preview skills at runtime, with bounded recursive indexing and `verifiedWith` filters; keep active skill content separate from discovery metadata. **Limit/reject:** no automatic activation; MCP approval, integrity and side-effect policy remain Omnia responsibilities. |
| MCP-REMEMBRANCE-04 | [DreamArkInc/remembrance-skills](https://github.com/DreamArkInc/remembrance-skills), `35e37ed13c4133877c645e38e6d0f4e8fdc6e677` | `LICENSE`, Apache-2.0; first lines read; README SHA `e0c108a37f4dde5ffc6e67c193a38ac56175528327c7cca79089ac825a1df573` | `packages/codex-plugin/scripts/query-on-prompt.mjs`, `96567e3be053e349dad657c32e7202c5d2aa944aa20f7e25e9bdf5193f069b57`; `packages/codex-plugin/scripts/hook-core.mjs`, `0f39236174da4641b295fa15a1e755258ee40348b67fc769289651504b0ef9b5` | Reviewed memory is queried before a prompt and contributions are fed back through quality gates; Codex adapters are thin and the shared hook core is Node-builtins-only and fail-open. **Apply:** Omnia lifecycle can query a bounded memory/skill registry at session start and record whether it was used; failures must surface bounded recovery context rather than break a session. **Limit/reject:** hosted contribution/network sync and opaque cryptographic hook behavior require a separate permission/consent design; no silent self-learning. |
| MCP-EVERYTHING-05 | [salmandev/everything-gemini](https://github.com/salmandev/everything-gemini), `903bb8db6f2ee47a1b1a8bb24a48e2961c4cfa4e` | `LICENSE`, Apache-2.0; README SHA `ebe497d65117b692c89cf24f9a2eec7aa000c1f09db5264a95294bffa67d15` | `docs/architecture/memory-and-context.md`, `989b0fb88af46295583951f27954f190858376bd376bc597834ee390b8aa81ea`; `docs/architecture/cortex-loop.md`, `7e8a5737ebfbfba3cd2f9c6592112fd30d6844a0db2e0a0df377c5f4c1efdf41`; `.agents/hooks.json`, `5a92c89448b3c9d802f816964d1d77f26bdce95906f73271e95cecc868d39c19` | Uses knowledge items, compact/full transcripts and brain artifacts; its Cortex loop is event-driven with wakeups instead of busy polling. Hooks can gate command execution. **Apply:** Omnia should separate durable knowledge, bounded compact transcript, full replay and user-facing artifacts, and use event-driven completion/queue wakeups. **Limit/reject:** extracted architecture documentation is not proof of runtime performance; do not claim 2M context or Antigravity parity without packaged measurements. |
| MCP-SKILLS-06 | [gengirish/skills-mcp](https://github.com/gengirish/skills-mcp), `58a2ab994985e94d731caf45280b6de8e8821782` | `LICENSE`, MIT; first lines read; README SHA `5137e82609842409e13894ef1ef2d92af15095e211933185a48cff3c7d8291c8` | `src/index.ts`, `45b95d33d6a19763db30a4abcd2eb30120b2a3a4add405c11481444e3106d9e2`; `src/search.ts`, `71eb344330617d15f00379c2c1690f36656d1716d0d9c90f1980c5bc80ce27a3` | MCP server indexes thousands of GitHub skills, uses Fuse search with weighted name/description/tags/repo fields and a fixed threshold, fetches content and safe install targets. **Apply:** Omnia Skills panel can provide ranked, explainable search and a preview/install plan; hash the fetched files and show target path before activation. **Limit/reject:** a large remote catalog is not a trust decision; never auto-install or run postinstall hooks, and provide offline/local catalog mode. |
| MCP-MEMVAULT-07 | [dreamor/MemVault](https://github.com/dreamor/MemVault), `6997c1265d768c3934da4271e883c523edf38239` | `LICENSE`, MIT; first lines read; README SHA `9c284be823c37266ff5bb08e3c506c704a584232b9366140f385aef1ee3f9eef` | `crates/memvault-core/src/hybrid.rs`, `c4d3d81289945b355f32e5b3b2f590a5bf0dd9f6e710e9b34cea21cbb0f125e9`; `crates/memvault-core/src/dedup.rs`, `7f264c247273e57bb5742cf2544c6fb3f72593a652680549aacd9b93cb9713b9`; `crates/memvault-core/src/evidence.rs`, `5d402d515d594e46550f4c5c54371bab02f95694f8aed722dc67a42d13610a8f` | Hybrid retrieval uses weighted Reciprocal Rank Fusion and records keyword/vector hit sources and ranks; dedup distinguishes Skip/Merge/Conflict with stricter vector identity; evidence relations encode supports/contradicts/sourced_from. **Apply:** Omnia RAG receipt should include per-channel rank, weight, candidate hash, dedup decision and evidence edges; conflict must stay visible. **Limit/reject:** default thresholds and RRF are not validated for Omnia corpora; benchmark and tune against fixtures before changing retrieval policy. |
| MCP-OPENMEMORY-08 | [Raethexn-Technologies/openmemory](https://github.com/Raethexn-Technologies/openmemory), `bfbc3af5fc0291702c037e9d7bb3659bc3b8b720` | `LICENSE`, MIT; first lines read; license SHA `dadcc984fa74615f220d49a9f45045ad3411bef4cb6aead1c324d60105bb265d`; README SHA `c8ff8afd04a0b2d791786135239c05964ed0a1958a71ad9a109a36329d48c4fe` | `agent/src/core/memory.js`, `39f4fd3696212c57bf15272decbf56ee59d74670fbc724e7488f3a2f08a94c25`; `app/app/Services/Context/ContextAudit.php`, `a8697d398db5fcc60ae468856534cb895898fedc84321d6a96cf6add9aeae0ab`; `SCIENCE.md`, `6dfb28a01717f275a983aaab0b0c3e1af79eb5677feb3507c5f3c8384cc24da2` | Agent client separates retrieve/store calls and uses API-key/user headers; context audit records caller, request ID, source status, searched flag, returned count, fragment count and duration. **Apply:** Omnia memory/RAG receipts need owner/session permission, request ID, source status, returned count, duration and sensitivity; use explicit source connectors. **Limit/reject:** external API client and Laravel service require deployment/security review; no remote memory endpoint by default. |

\* The OpenMemory README and license were read in the same source inspection; the README hash above is retained for provenance. The license file itself is MIT; its exact blob digest was not needed for the behavioral decision.

## Synthesis and concrete Omnia decisions

### 1. Skill identity and activation

Use a namespaced identity `(origin, URI, revision, manifest digest)` rather than a
global skill name. Store a complete manifest with `SKILL.md` and supporting-file
byte sizes/digests. Discovery is inert; activation requires explicit user consent,
permission review and a verified digest. Nested skills are not implicitly active.
This combines MCP Skills' integrity rules with Skillet's bounded index and
SaferSkills' capability inventory while avoiding their unsafe failure modes.

### 2. Memory and retrieval receipts

Every retrieval emits a receipt containing query hash, session/owner scope,
candidate IDs, source channel and rank, weighting, evidence edges, dedup action,
returned count, duration and permission result. RRF is a candidate strategy, not
a magic threshold. Contradicting facts remain visible and can block automatic
memory promotion. The receipt is persisted with native storage and is reloadable.

### 3. Event-driven workflow

Use event wakeups for native agent/tool completion, cancellation and scheduled
retry. Do not busy-poll long-running processes. Maintain compact transcript,
full replay and durable plan/evidence artifacts as separate projections. A
bounded fail-open hook may add recovery context, but cannot silently grant OS or
network permissions.

### 4. Source trust and self-improvement

Catalog/registry ingestion is read-only until the user reviews source license,
revision, requested permissions, files and hashes. Install is isolated, rollbackable
and testable. Learning feedback enters a review queue; it never silently mutates
the active skill or memory policy. External sources are reference data, not a new
authority for Omnia.

## Gaps and follow-up tests

- No live provider, MCP server, or remote memory deployment was invoked; these
  findings do not prove network/runtime parity.
- GitHub REST rate limit prevented stars and release metadata; no star count is
  used in the design decision.
- Existing Omnia extraction/source register was not present in the new checkout at
  this cycle start. Root's source-research agent must reconcile these eight IDs
  against `D:/Omnia/repos/omnia/upstream_extractions` before treating them as
  unique across the full project history.
- Add tests for duplicate skill names across origins, manifest digest/size mismatch,
  nested-skill approval, retrieval conflict visibility, RRF determinism, memory
  permission denial, audit receipt reload and event wakeup cancellation.
- Add a security review for install target traversal, hooks, credentials, network
  connectors and postinstall behavior before any activation path is marked Done.

## Claim boundary

This document proves source inspection at the pinned commits and records design
decisions. It does **not** claim that Omnia has implemented the adapters, that
the sources are all production-ready, or that any skill has been installed or
activated. Product criteria remain Planned/Partial until code and runtime/test
receipts exist.

## Cycle 9 fresh research (2026-11-08 16:52:36 Asia/Bangkok)

This cycle searched for additional MCP, skill, workflow, context and memory
projects with the required `everything`, `super`, `power`, `pro` and `max`
terms. Query families included `site:github.com open source MCP skills workflow
memory context agent "everything"`, `site:github.com MCP tool registry skill
workflow "super" "power"`, `site:github.com open source agent memory context
workflow MCP "pro" "max"`, and `site:github.com model context protocol
workflow memory skills Rust TypeScript`.

Search results were checked against `docs/rebuild/SOURCE_REGISTER.json` and prior
research notes. `Monishkumarvr/agent-history-mcp`, `richarvey/OmniMem`, and
dcc-mcp/dcc-mcp-core are distinct repositories and were not present in the
register at this cycle. Repository heads were obtained with
`git clone --filter=blob:none --no-checkout --depth=1 --no-tags`; source was
read with `git cat-file blob` at the pinned head. No downloaded code was
executed and no credentials, profiles or private history were read.

### MCP-CYCLE9-01 — agent-history-mcp

- Canonical repository: <https://github.com/Monishkumarvr/agent-history-mcp>
- Revision: `96e08288f265341a60516254d4435c5fa67f3ed3`
- License: MIT (`LICENSE` SHA-256 `a6e313d42dfe7320709b96d4f7588e0c8498dd2a05a5de1e73b8038352589753`)
- Exact source read: `README.md` SHA-256 `950a80596fc4548b0b05f1bb61110f63969a0acb3803bc7b083ffb08570fada2`; `src/agent_history_mcp/compaction.py` SHA-256 `9c23da0274e46cfa29953d9cb46f134550a58c162e3f311f8157d441287cfea2`; `src/agent_history_mcp/skill_store.py` SHA-256 `83bbec3b09787538c3a7e71e9a62734b53fb1ea3065f5d498ada5de0e34964d2`; `src/agent_history_mcp/server.py` SHA-256 `bd76befbf3f4c81734f67e44fe1e6b6aed4d923ff5af0fce6ef8966c1ef71144`.
- Observation: local MCP indexes multiple agent histories; compaction writes bounded pre-compaction checkpoints and restores them on session start; skill discovery validates frontmatter and records installed hashes. Installation supports dry-run and explicit apply.
- Strength: deterministic local-only context bridge with read-only history and opt-in writes.
- Weakness/gap: adapters and hooks are implementation-specific; source does not prove Omnia native session persistence or cross-device conflict handling.
- Decision: **Apply conceptually**. Add bounded checkpoint/replay projection and a skill usage ledger with content digests. Keep Omnia native permission review and session store authoritative; do not copy hooks or silently write instruction files.

### MCP-CYCLE9-02 — OmniMem

- Canonical repository: <https://github.com/richarvey/OmniMem>
- Revision: `3cadc848833ff0f867903c95f4b70760a1ee6f20`
- License: MIT (`LICENSE` SHA-256 `8ee486b679b7b9c2c873d64427852d69f2f09d014281aa926f9108e04aea2527`)
- Exact source read: `README.md` SHA-256 `854b5d9161868f46996d4b5889aac8b54a463c97231749c741cbcd27757c264f`; `crates/omnimem-engine/src/skill_tools.rs` SHA-256 `c560d1888beeb1f872b075a5aba4f84e3ce21d64b2e800ec84dd2cf42e00fc68`; `crates/omnimem-engine/src/audit.rs` SHA-256 `7d3bc39571ae1c9955239a5266f9f3b58446b2d2e43ed2bb7249f2134ed11823`; `crates/omnimem-engine/src/recall.rs` SHA-256 `ff715ffb1d2b17168d7a0f37dbca19f7eec4308411427d7c8963e582920a0416`.
- Observation: Rust engine exposes active skill discovery with domain/semantic matching and explicit low-confidence warnings; audit APIs bound namespaces and limits; recall and audit remain separate surfaces.
- Strength: typed local-first memory with bounded audits and visible weak-match handling.
- Weakness/gap: thresholds and storage behavior are not validated against Omnia's corpus; source inspection cannot establish Tauri integration or retrieval quality.
- Decision: **Apply conceptually and benchmark first**. Preserve weak-match/no-result states and bounded audit receipts in Omnia RAG. Do not adopt thresholds without fixture measurements.

### MCP-CYCLE9-03 — dcc-mcp-core

- Canonical repository: <https://github.com/dcc-mcp/dcc-mcp-core>
- Revision: `3ea1ca16430a02cbf1bd50fa66a0d871333baa49`
- License: MIT (`LICENSE` SHA-256 `b497f43f3f2affae408c4926dfcef62b5725e231a2976f2f24ee4aa3f2e152a7`)
- Exact source read: `README.md` SHA-256 `dd98ffb324bf2e0aef52d2dec5b5345465dd486cb206721f1ec9af7f9095a3ee`; `docs/guide/agents-reference.md` SHA-256 `3b3855294dfdc879916f15403abfdd46ac62ca718d9d9cc79200c87fefc96fa3`; `AGENTS.md` SHA-256 `f307394255493ae51bebbc4de92ef82b43b2cd476447ab6a81a551d8e032d98a`.
- Observation: async calls return a core job ID and typed status metadata; parent cancellation cascades to core child jobs, while adapter-owned follow-ups require their own typed status/cancel contract. Skill extensions use `metadata.dcc-mcp` pointers to sibling files, preserving standards-compliant `SKILL.md` frontmatter and progressive disclosure. Tool responses require request-ID correlation and fail closed on transport desynchronization.
- Strength: explicit async/cancellation correlation and a concrete sibling-file skill packaging rule.
- Weakness/gap: DCC adapter lifecycle and gateway policy are domain-specific; documentation is not proof of Omnia runtime behavior.
- Decision: **Apply protocol decisions**. Require request IDs, parent/child cancellation semantics, typed follow-up polling and fail-closed desync handling in native tool bridges. Use sibling-file pointers for large skill extensions; reject DCC-specific adapters and UI replication.

### Cycle 9 synthesis and test implications

These sources add three distinct decisions: a bounded local checkpoint projection
that survives compaction, explicit weak-match/audit states for memory and skill
retrieval, and request correlation plus parent cancellation for asynchronous MCP
work. Add negative tests for digest mismatch, weak/no skill matches, stale
checkpoint replay, response-ID mismatch, child cancellation and adapter-owned
job cancellation. This cycle remains source evidence only; no provider, MCP
server or remote memory service was run.
