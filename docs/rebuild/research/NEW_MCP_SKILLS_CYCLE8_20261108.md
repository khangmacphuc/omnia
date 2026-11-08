# Cycle 8 new MCP, skills, memory and RAG research

- **Cycle:** `rebuild-0008`
- **Retrieved:** `2026-11-08T08:37:16Z`
- **Scope:** genuinely new revisions and source paths for MCP, persistent memory, document indexing and RAG. Repository/revision/path tuples were checked against `docs/rebuild/SOURCE_REGISTER.json`; none of these tuples appear in the prior register.
- **Method:** GitHub API metadata and raw pinned source reads. No downloaded scripts were executed and no credentials, profiles, cookies or private transcripts were accessed. Stars are discovery context only, not a quality claim.

## 1. Official MCP reference servers — Everything, tasks and memory

- **Canonical repository:** <https://github.com/modelcontextprotocol/servers>
- **Revision:** `36380287ed3b15d115b55f546617d723072b1296` (`main` at retrieval)
- **License:** repository metadata reports `NOASSERTION`; repository README states Apache-2.0 for new contributions and existing code under MIT. Omnia must preserve this mixed-license boundary and must not copy source into the product.
- **Discovery:** query `open source everything MCP server tasks memory streamable HTTP capability cache request state 2026`; repository metadata showed about 91k stars at retrieval.
- **Exact source read:**
  - `src/everything/index.ts` — SHA-256 `f77e060a4d91175ffa89b07ce10012c22e7a7ee634b837f2b5352b15a0a12f1d`
  - `src/everything/server/index.ts` — SHA-256 `fbe98e8d19defbece312e34713c140023aaf4649ac3b43e1566f80a5ab56f8e3`
  - `src/everything/server/tasks.ts` — SHA-256 `75a317f15bbe43361d9565f369add64cfc6406a7ea7909f56dd458e87ac7f60f`
  - `src/everything/transports/streamableHttp.ts` — SHA-256 `91eba22b858be688b3a3d348caa37511260decc39f196aa74f1a4363f2a30d74`
  - `src/memory/index.ts` — SHA-256 `79e1ba22ef9fe44184d2e7ba1c1b9799e809b646bc21906efec140101eb90691`
  - `README.md` — fetched at the pinned revision; states the Everything server exposes prompts, resources and tools, while the memory server is a knowledge graph and the server supports stdio and (for Everything) Streamable HTTP.
- **Observed strengths:**
  - The launcher dynamically selects `stdio`, `sse` or `streamableHttp` and guards import-time startup, which keeps inspection/tests from starting a server unexpectedly.
  - The factory centralizes capability advertisement, request-state verification, cache hints, conditional registration and cleanup. `roundStateCodec` signs and expires multi-round state instead of trusting arbitrary client text.
  - The tasks extension models `working`, `input_required`, `completed`, `failed` and `cancelled` as explicit states. A process-wide task store survives request-scoped HTTP server instances and uses a UUID handle plus TTL.
  - The modern Streamable HTTP path is designed around request-scoped instances and in-band input requests; the legacy path keeps sessionful delivery for server-to-client requests. This is a useful boundary for Omnia's packaged/runtime evidence.
  - The memory server persists a graph to JSONL, supports MCP subscriptions and starts only from the process entrypoint.
- **Weaknesses / limits:**
  - The repository labels these as reference implementations, not production-ready deployments; security hardening remains an integrator responsibility.
  - A process-wide task map is not durable across process crashes, and JSONL persistence is weaker than an encrypted/atomic native journal.
  - This source does not prove Omnia's Windows Tauri IPC, provider routing or packaged UI behavior.
- **Decision for Omnia:** **apply conceptually, do not copy code.** Add explicit task/request states, signed or otherwise integrity-bound continuation receipts, capability-gated tool registration, TTL cleanup and separate request/session transport adapters. Preserve fail-closed capability checks and durable native storage as Omnia requirements.

## 2. Mem0 persistent memory

- **Canonical repository:** <https://github.com/mem0ai/mem0>
- **Revision:** `f1791daa86d469249c9b002f62644d58a1eb96a0`
- **License:** Apache-2.0 (`LICENSE` SHA-256 `0bbcbe931c353293a2fafce08326181dfeea0e568c566afd4ce8337a70f5e219`)
- **Discovery:** query `open source everything super power pro max persistent semantic memory agent personalization temporal filters`; repository metadata showed about 68k stars.
- **Exact source read:**
  - `mem0/memory/main.py` — SHA-256 `e37b2775aafbc654113cb643dae2a8a9cf299d2e7eee29904f1ed212f89aa570`
  - `README.md` — SHA-256 `f72db3426438dbdf6879a2b50583fbee8e7e2dde5d01308c6295bcd09fd3db86`
- **Observed strengths:**
  - Memory writes are scoped by `user_id`, `agent_id` or `run_id`; search requires explicit filters, preventing accidental cross-session retrieval.
  - Search supports thresholds, top-k, optional reranking, explanation scores, temporal expiration and structured boolean metadata operators (`AND`, `OR`, `NOT`, comparisons and containment).
  - The implementation explicitly strips identity keys from freeform metadata and rejects unsafe top-level entity arguments on search/get paths. This is a strong tenant/session isolation contract.
  - Configuration separates embedder, vector store, LLM, reranker and SQLite history, enabling provider-specific routing and auditable state transitions.
- **Weaknesses / limits:**
  - The Python service and vector-store adapters cannot establish Windows-native persistence or Omnia's pointer-storage provenance.
  - LLM inference and external vector stores introduce availability, privacy and cost concerns; the repository's telemetry must not be adopted blindly.
  - Memory extraction/update behavior is probabilistic and needs Omnia's explicit evidence receipts and user-consent policy.
- **Decision for Omnia:** **apply the contract, not the implementation.** Require session/project/user scope on every memory and retrieval receipt, validate filters before querying, support temporal validity and explainable score/provenance fields, and keep retention/telemetry settings hot-reloadable. Persist only through the native storage boundary with redaction and consent.

## 3. LlamaIndex document indexing and retrieval

- **Canonical repository:** <https://github.com/run-llama/llama_index>
- **Revision:** `444fdf0684707de62ebb447d658dba137dd9cb99`
- **License:** MIT (`LICENSE` SHA-256 `24f40b5190fdacabc24ddbb5f76364d15e4f030925220ea300d8a2dd4993c8cb`)
- **Discovery:** query `open source everything super power pro max document indexing retrieval persistence refresh reference docs`; repository metadata showed about 53k stars.
- **Exact source read:**
  - `llama-index-core/llama_index/core/indices/base.py` — SHA-256 `23f3d622dcb6981d2d42e550ae7cc2a621fe409bf20944b5b8502e07ad5c5b51` (raw source fetched at pinned revision; hash is recorded for the retrieved artifact)
  - `README.md` — SHA-256 `625c49e7dedf84826b350be28d118e7823e669504689105611e91ff709406d1f`
- **Observed strengths:**
  - `refresh_ref_docs` compares document hashes and only inserts or updates changed references; async variants preserve the same semantics.
  - `delete_ref_doc`/`update_ref_doc` bind nodes to reference-document IDs, giving a useful source lineage for RAG receipts.
  - Storage contexts can persist to disk and reload, while retrievers/query engines remain composable and configurable.
  - The framework explicitly supports heterogeneous connectors and separate LLM, embedding and reranker integrations.
- **Weaknesses / limits:**
  - The Python framework's default in-memory storage and external integrations are not native Omnia evidence.
  - Deprecation paths and integration package sprawl increase compatibility and supply-chain surface.
  - Hash comparison alone cannot prove pointer rename/delete behavior or document authorization.
- **Decision for Omnia:** **apply selectively.** Add source-content hashes, incremental ingestion, reference-document lineage, deterministic stale/deleted handling and persisted index metadata to Omnia's RAG receipts. Keep provider/model resolution and file access behind native permission checks.

## 4. RAGFlow document and agentic retrieval

- **Canonical repository:** <https://github.com/infiniflow/ragflow>
- **Revision:** `3c6d2255af06164f0818d0959af10de0afd8b8fa`
- **License:** Apache-2.0
- **Discovery:** query `open source everything super power pro max agentic RAG knowledge compilation citations multi-step retrieval`; repository metadata showed about 94k stars.
- **Exact source read:**
  - `README.md` — SHA-256 `6b6564c3ff2ea27e1e0184bb591099b59d15ff6c1f0ac2d31fd178b13f228026`
- **Observed strengths:**
  - RAGFlow describes document understanding, template-based chunking, agentic multi-step retrieval and fused reranking with citation traceability.
  - Its knowledge compilation concept produces structured artifacts such as wikis, graphs, trees, page indexes, mind maps, timelines and skills.
  - Retrieval depth has explicit Low/Medium/High/Ultra modes, aligning with Omnia's requested effort ladder while remaining a retrieval policy rather than an unsupported model claim.
  - It documents broad format ingestion and incremental synchronization, useful for Omnia's document and pointer workflows.
- **Weaknesses / limits:**
  - README-level feature descriptions are not proof of local Windows runtime behavior or source-level correctness for every integration.
  - The deployment has substantial infrastructure requirements; copying its architecture would conflict with Omnia's local-first resource constraints.
  - Cloud/model configuration can expose sensitive data and must be separated from Omnia's permission and consent boundary.
- **Decision for Omnia:** **apply the ideas with bounded scope.** Add explicit retrieval-depth policy, multi-round retrieval receipts, reranker/citation provenance and optional knowledge-compilation artifacts. Keep local resource budgets, cancellation and native permissions as hard gates; do not claim unlimited retrieval or live provider parity without runtime evidence.

## Cross-source synthesis and Omnia gap decisions

1. **Transport and task lifecycle:** MCP Everything provides explicit capability, signed continuation and task state contracts. Omnia should represent queued/running/input-required/completed/failed/cancelled/unknown states in native receipts and reject stale or unbound continuation tokens.
2. **Memory isolation:** Mem0's mandatory entity filters map to Omnia's session/project/pointer scope. Retrieval without a verified scope should fail closed and create a diagnostic receipt.
3. **Incremental RAG:** LlamaIndex's reference-document hashes map to pointer snapshots, but Omnia must add rename/delete fallback and native permission checks.
4. **Deep research modes:** RAGFlow's retrieval-depth ladder maps to none/minimal/low/medium/high/xhigh/max/ultra policy resolution; `ultra` must still resolve against declared capabilities and remain unavailable when unsupported.
5. **Evidence boundary:** All four projects provide architectural inspiration only. They do not promote renderer preview to packaged/native/live evidence, and Omnia must retain that distinction.

## Coverage and limits

- New repositories: 4; new pinned revision/path tuples: 9+; all paths are distinct from the prior `SOURCE_REGISTER.json` entries as checked before writing.
- Direct source reads: MCP launcher/factory/tasks/transport/memory, Mem0 memory engine, LlamaIndex index base and README, RAGFlow README.
- No code was imported, copied or executed from these repositories.
- This note intentionally does not modify the source register because its assignment belongs to the cycle root owner; root must add validated entries and hashes before the cycle's research gate.


