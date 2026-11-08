# Cycle 8 NEW RAG and memory OSS research

- **Cycle:** `rebuild-0008`
- **Research time:** 2026-11-08 15:41 Asia/Bangkok
- **Owner:** `/root/cycle8_research_rag_memory`
- **Scope:** RAG retrieval, durable memory, context budgeting/compaction, session provenance and resumable agent execution.
- **Novelty check:** `rg` over `docs/rebuild/SOURCE_REGISTER.json` and `docs/rebuild/research` found no prior entries for Graphiti, Mem0, Cognee, LlamaIndex or Haystack at the reviewed repository/revision/path identities. Existing Omnia references to context, goal projections, LiteLLM and PydanticAI are different repositories or paths and were not counted as these sources.
- **Safety:** Source was fetched read-only from canonical GitHub raw URLs. No downloaded script was executed; no credentials, profiles, cookies or private data were accessed.

## Search record

| Query | Canonical URL | Revision | License | Discovery signal |
|---|---|---|---|---|
| `open source graph memory RAG provenance temporal episodes everything super power pro max` | https://github.com/getzep/graphiti | `024b83679e48e41d59a7d1714ac0870aff2e4676` (`main`) | Apache-2.0 | 32,639 stars observed from GitHub metadata |
| `open source long term memory scoped user agent run_id RAG everything super power pro max` | https://github.com/mem0ai/mem0 | `f1791daa86d469249c9b002f62644d58a1eb96a0` (`main`) | Apache-2.0 | 68,602 stars observed from GitHub metadata |
| `open source agent memory session context permissions RAG skills everything super power pro max` | https://github.com/topoteretes/cognee | `8853378eae5366addb064e758e560a456146ae1a` (`main`) | Apache-2.0 | 33,129 stars observed from GitHub metadata |
| `open source token bounded chat memory compaction multimodal context RAG everything super power pro max` | https://github.com/run-llama/llama_index | `444fdf0684707de62ebb447d658dba137dd9cb99` (`main`) | MIT (repository README/license source) | High-visibility RAG framework; revision pinned with `git ls-remote` |
| `open source resumable RAG pipeline snapshots cancellation streaming retrieval everything super power pro max` | https://github.com/deepset-ai/haystack | `0ad74747ffd7d9f9b092db97ba2e222080992c2e` (`main`) | Apache-2.0 (repository README SPDX headers) | High-visibility pipeline framework; revision pinned with `git ls-remote` |

## Evidence read and hashes

All paths below are saved under `docs/rebuild/research/snapshots/cycle8/rag-memory/` and were hashed with SHA-256 after retrieval.

### Graphiti

- `README.md` — `831ab734e5b6713741dbfc15712f01f78fff7e0d6b5be86c5c20acd17c4249e4`
- `graphiti_core/driver/neo4j_driver.py` — `44101e499c0c0764741736da4a91c2cf7fd0917adc22e1db7b9a316cbfb7e6d2`
- `graphiti_core/utils/maintenance/node_operations.py` — `1bcfb52cee7115075409834f6a1692767bd8fecd7f8dc9fc9ca46f9402ce2973`

Observed source behavior: the driver exposes explicit async transaction boundaries with commit/rollback and a search operation interface. Node maintenance separates extraction, exact duplicate collapsing, candidate lookup and semantic search; duplicate attribution indices are merged into the canonical node. This is useful evidence for provenance-preserving graph memory and deterministic duplicate handling.

**Strengths:** transactional persistence; explicit operation interfaces; exact duplicate collapse keeps attribution indices; semantic candidate search is distinct from identity lookup.

**Weaknesses:** Neo4j and provider-specific extraction are not native Omnia evidence; graph writes and LLM extraction can be expensive; no direct Windows packaged proof.

**Decision:** **apply with boundary**. Model Omnia memory receipts as immutable events with transaction outcome, source identity and attribution; perform deterministic exact-identity dedupe before semantic retrieval. Keep provider/graph backends behind a native capability boundary and do not copy Graphiti UI or runtime.

### Mem0

- `README.md` — `f72db3426438dbdf6879a2b50583fbee8e7e2dde5d01308c6295bcd09fd3db86`
- `mem0/memory/main.py` — `e37b2775aafbc654113cb643dae2a8a9cf299d2e7eee29904f1ed212f89aa570`
- `mem0/memory/base.py` — `bb093eacbeb409b12b043b7df9b3152b895a00bb5ce30776a1e56c915cf17777`

Observed source behavior: memory operations validate query, threshold and `top_k`; identity scope is explicit (`user_id`, `agent_id`, `run_id`) and metadata cannot silently override those identity fields. Add/search/update/delete paths preserve scope and link entities to memory records. Sensitive fields are filtered from metadata paths.

**Strengths:** explicit multi-dimensional scope; validation and non-negative retrieval bounds; metadata cannot forge identity scope; entity links support update/delete cleanup; sensitive-field filtering is a useful privacy baseline.

**Weaknesses:** vector-store and model behavior remain external; identity semantics are application policy rather than proof of Omnia pointer storage; no evidence of the Omnia native event journal or packaged UI.

**Decision:** **apply**. Require every Omnia RAG/memory receipt to carry session/project/run scope, forbid caller metadata from changing scope, validate threshold/top-k and preserve tombstoned deletion receipts. Bind pointer identity and source revision to retrieval provenance; keep encrypted/private data out of telemetry.

### Cognee

- `LICENSE` — `a471e34908f50c3f120e9a56f3c30cb34e133e4ede01a9cbd5ce718fc358ecd4`
- `README.md` — `371945db13ce593ecb6298ad1188c57bfb1a6e89a8435f4bc421abfa427c09f2`
- `cognee/infrastructure/session/session_context_builder.py` — `006e775ed7a5b303e91dca28c7b5ccfb365fd804cb2aedb852f9faca3d2fdba0`
- `cognee/modules/agent_memory/runtime.py` — `25682d6b7635679c1f79ce16bbba87d5487814a37892c65500206690905143ac`
- `cognee-mcp/src/retrieval_utils.py` — `b0031300ef60b959e18c7af788313bcd6e0b70a195d98cbefdccb9f1d91848c3`

Observed source behavior: the session context builder validates active entries, ranks by profile/priority/query overlap/recency, applies a budget and renders a compact block; it stamps entries actually served. Agent-memory runtime validates session-backed options, requires cache for session memory/trace persistence, resolves read/write dataset permissions and bounds serialized context. Retrieval utilities normalize graph nodes, recover parent documents/chunks, cap neighbor count and mark truncation.

**Strengths:** deterministic ranking and budget caps; served-entry receipts; permission-aware dataset scope; session trace persistence controls; bounded document/chunk retrieval and explicit `is_truncated` state.

**Weaknesses:** Python/cache/graph implementation is not native Omnia evidence; permission and cache configuration need a native equivalent; source path availability varies across revisions.

**Decision:** **apply with boundary**. Implement Omnia retrieval receipts with selected IDs, rank inputs, budget, truncation and served timestamp. Require permission checks before memory retrieval and separate durable user memory from per-session traces. Preserve explicit unavailable/partial states when native cache or provider capability is absent.

### LlamaIndex

- `LICENSE` — `24f40b5190fdacabc24ddbb5f76364d15e4f030925220ea300d8a2dd4993c8cb`
- `README.md` — `625c49e7dedf84826b350be28d118e7823e669504689105611e91ff709406d1f`
- `llama-index-core/llama_index/core/memory/memory.py` — `2f96a1aef6f6608af18672c29587a53dd307d94111346eed7e03d2b9bf694b2f`

Observed source behavior: memory has a configurable token limit and flush size, a chat-history ratio, tokenizer hook and estimates for image/audio/video/document blocks. The memory block interface can truncate content by token budget; the FIFO implementation ejects oldest messages when pressure exceeds its budget and persists chat store state by session ID.

**Strengths:** explicit token budgeting; modality-aware estimates; injectable tokenizer; session keyed persistence; truncation is a typed operation rather than a string heuristic.

**Weaknesses:** eviction policy and token estimates are framework-specific; no proof of Omnia's 200k context or 10k tool truncation; persistence backend is not native Windows evidence.

**Decision:** **apply**. Use a versioned compaction receipt with pre/post token estimate, pinned messages, evicted IDs, modality estimates and selected tokenizer. Keep defaults at 200,000 context tokens and 10,000 tool-output tokens, but expose effective model capability and fail closed when unsupported.

### Haystack

- `README.md` — `e016e944fa840265e85e73520522c6152798330720d53d3d64fdffcc448554e6`
- `haystack/core/pipeline/pipeline.py` — `5260957fbf291dd43337a534a8daba2c8005579ed778924f3b043c8bfa72d7ac`
- `haystack/components/retrievers/in_memory/bm25_retriever.py` — `79c830b6405863e863bcf9786b7611af5984d19188f8653048ddd1bedbd7e465`

Observed source behavior: pipeline runs sync/async, supports bounded concurrency, breakpoints, serialized pipeline snapshots, resume validation against the current graph, streaming handles with cancellation on abandoned iteration, and component-level tracing. BM25 retrieval validates positive `top_k`, supports runtime filters and score scaling.

**Strengths:** resumable snapshot with graph validation; cancellation is explicit and bounded; concurrency limit is visible; retriever filter policy and top-k validation are deterministic; tracing has component input/output boundaries.

**Weaknesses:** Python pipeline semantics do not prove Rust/Tauri runtime; snapshot serialization requires a trust boundary; BM25 is lexical and should not be treated as semantic quality evidence.

**Decision:** **apply**. Add RAG/agent checkpoints that record graph/version, input hash, component visits, cancellation state and resume validation. Bound concurrency and require retrieval filters/top-k validation. Preserve an explicit receipt when resume is rejected because the graph or source revision changed.

## Synthesis for Omnia

1. **Receipt-first retrieval:** every retrieval returns scope, query hash, candidate IDs, ranking inputs, budget, truncation, timestamp and source revision. This combines Cognee served-entry stamping with Mem0 scope validation and Haystack component boundaries.
2. **Deterministic identity before semantics:** exact pointer/source identity and normalized-name dedupe precede vector/graph search, following Graphiti and Mem0. A semantic hit cannot overwrite a newer pointer snapshot without an explicit merge receipt.
3. **Bounded context:** use LlamaIndex-style token and modality accounting plus Cognee profile ranking. Context compaction writes pre/post token counts, pinned IDs, evicted IDs, model capability and reason.
4. **Resumable workflows:** use Haystack-style snapshot graph/version validation and cancellation. A resumed run must reject stale graph/source revisions and preserve an outcome-unknown receipt instead of blind replay.
5. **Privacy and permissions:** scope by session/project/run, authorize readable datasets, strip sensitive metadata and keep private content outside observability. Native implementations must provide equivalent evidence; upstream Python behavior remains design research only.

## Omnia application backlog (Cycle 8 follow-up)

- Add a native retrieval receipt schema with scope, source pointer, candidate hashes, ranker version, budget, truncation and served timestamp.
- Add a compaction receipt for 200k context / 10k tool output defaults with modality estimates and pinned-message invariants.
- Add native checkpoint resume validation: graph/route/source revision mismatch must fail closed with a stale receipt.
- Add negative tests for forged scope metadata, top-k=0/negative, stale pointer revision, budget overflow, canceled retrieval and abandoned streaming.
- Keep all items Partial/Planned until source, tests and suitable native/runtime evidence exist.

## Limits

- This is source research, not a product implementation or runtime proof.
- Stars are discovery signals only; source behavior and evidence hashes above are the basis for decisions.
- No upstream UI or code was imported into Omnia.



