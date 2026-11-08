# New OSS research — Cycle 4

Status: reference research only. Owner: `/root/new_research_cycle4`.
Recorded: 2026-11-08 UTC. Active checkout: `publish-worktree`.
Only this document is authored by this research slice; root owns the registry,
DoD, spec, checkpoint and product integration. No upstream code was executed or
installed. Public source was fetched to a temporary cache and read as reference
material. No extracted/private profile, credential or unrelated chat data was read.

## Outcome and evidence boundary

Eight newly reviewed canonical repositories, sixteen substantive exact paths and
eight license files are proposed for root review. All eight repositories are absent
from the 20-source Cycle 3 registry. These observations establish source research,
not runtime functionality, native persistence, Windows behavior or product parity.
The source register has not been changed by this agent. Root should merge only
entries it independently accepts; the JSON below is a proposed registry payload.

## Search ledger

Discovery used the connected web-search tool, followed by GitHub repository metadata,
branch-ref/tree API and pinned raw-file requests. Search results, names and star counts
were treated only as discovery signals. No star-count ranking is used as evidence.
Initial discovery and source reads occurred between 04:18 and 04:26 UTC. A final
explicitly timed query batch ran from **2026-11-08 04:27:31 UTC** to the tool's
immediately following clock result (the batch completed within several seconds).
The initial query launch second was not independently captured; source retrieval
timestamps below come from downloaded-byte timestamps.

Queries actually issued:

1. `site:github.com open source everything AI agent harness workflow repository`
2. `site:github.com superpowers agent harness MCP workflow open source`
3. `site:github.com power pro max browser computer use agent open source`
4. `site:github.com IDE agent memory RAG MCP workflow open source`
5. `site:github.com "everything" "agent" "session" "adapter"`
6. `site:github.com "super" "agent" "workflow" "checkpoint"`
7. `site:github.com "power" "browser" "MCP"`
8. `site:github.com "pro" "max" "IDE" "agent" open source`
9. `site:github.com everything super power pro max agent harness MCP workflow architecture open source`
10. `site:github.com Superpowers IDE browser agent skills memory RAG open source`
11. `site:github.com "everything-openai-codex" "session"`
12. `site:github.com "deepseek-harness" "session" "checkpoint"`

Known Superpowers, Backboard and Microsoft Agent Framework results remain baseline
references; their repeat appearance is **not** counted as new research. Additional
metadata-only discoveries—[MAX](https://github.com/unimaginative-artist/MAX),
[Phosphor](https://github.com/agustinsacco/phosphor),
[faster-browser-agent](https://github.com/MikaStiebitz/faster-browser-agent) and
[agent-handoff-memory](https://github.com/JusticeUA/agent-handoff-memory)—are deferred
for a later exact-source read and are **not** included in the eight-source result.

## Deduplication and provenance corrections

- Compared canonical repository/revision/path against `SOURCE_REGISTER.json` and
  Cycle 2/3 documents. An `rg` check across prior research found no matching new
  repository names; the older extraction named `harnesses/deepseek-harness`
  contains different reference paths and is not used to claim a new extraction.
- The first DeepSeek hit was `OpenAgentDev/deepseek-harness` at
  `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`. A later search located the
  `deepseek-ai` repository, which was fetched at its own pinned revision.
  Only the canonical `deepseek-ai` entry is proposed. The checkpoint file has the
  same content hash across both repositories and is counted once; canonical
  runtime-context and Win32 files differ and were re-read.
- One EOC adapter raw request initially returned 404 because the requested revision
  string was accidentally truncated. A corrected full-revision request succeeded.
  This was a request construction error, not evidence that the upstream file was absent.
- A downloaded OpenLIT README was used for discovery only. Its full content was not
  audited and is excluded from the inspected-path count.

## Useful synthesis decisions — three bounded passes

| Pass | Decision added | Concrete Omnia application / acceptance probe |
| --- | --- | --- |
| 1: durability | Checkpoint at side-effect admission, not only at turn end. | Native storage flush failure must produce zero downstream model/tool dispatches; cancellation after a successful flush still prevents a not-yet-started tool. |
| 2: scope and context | Keep adapter-neutral worker/session receipts and separately attributed context snapshots. | Unknown adapter state degrades visibly; unchanged snapshot adds no event; replacement/compact invalidates stale selection; child receipt names included and omitted sources. |
| 3: measurement | Context occupancy, cumulative usage, budget enforcement and integrity are different measurements. | Gauge may exceed its displayed cap honestly; enforced budget blocks admission; cost/invoice unknown stays unknown; signed manifest cannot mark runtime Done. |

These are design inputs. They do not authorize importing source, templates or UI,
and do not change current DoD status. The first implementation candidates are
`PORTABILITY-001`, `WORKFLOW-001/004/005/006`, `MEMORY-003/006`,
`TOOLS-002/004/009`, `SETTINGS-006` and `OBSERVABILITY-001/005/010`.

## Source observations and decisions

### 1. mturac/everything-openai-codex

[Repository](https://github.com/mturac/everything-openai-codex) · revision `b5057da5f42ed6b12cd3a59e89af0ccd12cff7c2` · MIT.

**Observed strengths:** Versioned adapter-neutral session snapshot separates worker intent, runtime, outputs, health and provenance. Snapshot polling avoids duplicate history records when unchanged.

**Observed limits:** Document contract was inspected; its implementation and runtime were not executed. Fixed coverage threshold and simple grep examples in the verification skill do not prove native integration or secret-scan completeness.

**Decision:** `apply-as-reference`. WORKFLOW-004..006, MEMORY-006 and OBSERVABILITY-001: define a fresh Omnia worker snapshot with bounded evidence and unfamiliar-state fallback; keep evidence gates independent of skill prose.

### 2. deepseek-ai/deepseek-harness

[Repository](https://github.com/deepseek-ai/deepseek-harness) · revision `fcc0ad462172522aaf5c93a7b2e01f6b9f0b0159` · MIT.

**Observed strengths:** Semantic flush gates precede downstream model and top-level tool dispatch. Context projection deduplicates unchanged snapshots and reconciles system prompt changes with route capability and request-series state. Windows helper uses lazy native bindings, write-through same-volume publication and a canonical-path-derived semaphore lock.

**Observed limits:** Checkpoint policy only protects sessions with persistence configured; missing session and nested calls follow explicit bypass paths. Source inspection does not prove crash recovery, semaphore behavior, or provider acceptance in Omnia.

**Decision:** `apply-as-reference`. PORTABILITY-001, WORKFLOW-001, SETTINGS-006 and MEMORY-006: design durable admission receipts and no-dispatch-on-flush-failure tests; preserve source-attributed context and route capabilities.

### 3. nazsam/open-harness

[Repository](https://github.com/nazsam/open-harness) · revision `0a892be6484ffcf44552ef774a94a1c7c3a36c47` · MIT.

**Observed strengths:** Transport, tool discovery, cache invalidation and close lifecycle are separated behind a common server interface. Stdio requests are correlated and timeout cancellation is explicit; unsupported input_required is surfaced as an error.

**Observed limits:** Wrapper flattens image/audio output to text markers and cannot preserve full multimodal results. Stdio inherits process environment; protocol-version comments are upstream claims, not an independently checked MCP compatibility result. Session guide explicitly lacks built-in TypeScript SQLite and uses lexical BM25 memory by default.

**Decision:** `apply-as-reference`. TOOLS-002/004/009 and MEMORY-001: build typed connection/capability states with filtered environment and caller cancellation; preserve rich content blocks and explicit unsupported states.

### 4. tinyhumansai/openhuman

[Repository](https://github.com/tinyhumansai/openhuman) · revision `f3bc6b96024a513ac4499e92d14da20aeb1fed25` · GPL-3.0.

**Observed strengths:** Tool-boundary policy checks inner packed-tool existence and session permissions rather than trusting the outer skill name. Host budget controls wrap primary, summarizer and routed model dispatch beneath retries/fallback.

**Observed limits:** GPL-3.0 requires a separate licensing decision before source reuse; no source is vendored here. Allow-all and approval-disable branches exist; effective host configuration needs runtime inspection before claiming strict enforcement. Depth ceiling is a product constant, not proof of optimal resource use.

**Decision:** `defer-code-reuse-license-review`. TOOLS-003/004 and WORKFLOW-004: independently implement nested-tool scope checks and inherited budget accounting; keep policy at native dispatch rather than only prompt/UI.

### 5. ipiton/agent-memory-mcp

[Repository](https://github.com/ipiton/agent-memory-mcp) · revision `11aede1bb0177cd0380738b2b7442754c9d327af` · MIT.

**Observed strengths:** Drift separates changed, missing, stale and unreachable references instead of silently rewriting facts. Credential checks and document/prose redaction have distinct write-boundary behavior.

**Observed limits:** Observed drift check uses mtime, lexical root prefix and slash-oriented regex, not a content identity or Windows rename pointer. This file alone does not establish symlink-safe containment; fixed confidence values are not measured calibration. Pattern-based redaction has finite coverage and cannot justify claiming all secrets removed.

**Decision:** `apply-as-reference`. MEMORY-003/008, OBSERVABILITY-005 and pointer storage: use file identity plus content hash and validated final-path scope, retain unreachable state, and test redaction before embeddings/logs.

### 6. openlit/openlit

[Repository](https://github.com/openlit/openlit) · revision `1b8a274d3b0d3ac85e00ebb07cde880ac95b4385` · Apache-2.0.

**Observed strengths:** Session/vendor derivation joins separate hook-process spans while separating nested vendors sharing a session ID. Root IDs are deterministic; child span IDs remain random.

**Observed limits:** Missing environment salt falls back to an empty key, weakening pseudonymization. Trace hierarchy proves neither usage accounting nor billing reconciliation.

**Decision:** `apply-as-reference`. OBSERVABILITY-001/005/010: persist opaque native trace/session lineage with protected installation salt and versioned correlation; retain account proof as unknown.

### 7. ruvnet/metaharness

[Repository](https://github.com/ruvnet/metaharness) · revision `574ce3b881e902d23472a541f9f9e2fdccfa63db` · MIT.

**Observed strengths:** Witness-signature integrity is explicitly narrower than release-readiness validation. UI displays per-check severity and preserves an unverified initial state.

**Observed limits:** Embedded public-key signature alone does not authenticate a trusted publisher or prove behavior. Inspected ZIP importer has no visible entry-count/decompressed-byte quota; generator verifier internals and runtime were not inspected.

**Decision:** `apply-conceptually`. GOVERNANCE-008/010 and portable exports: distinguish integrity, trusted signer and runtime acceptance receipts; add archive quotas without copying UI.

### 8. ComputerUseAgent/AutoCua

[Repository](https://github.com/ComputerUseAgent/AutoCua) · revision `0f6732ef27dcdaccf39f9d37b387883bf7f6e9c8` · MIT.

**Observed strengths:** Memory gauge overwrites with latest prompt occupancy instead of summing cumulative usage; cache tokens remain context occupancy. Read-only worker workflow distinguishes observed connections from inferred ones and requires file/line anchors.

**Observed limits:** Gauge is explicitly cosmetic and fixed at 300k by default; it does not enforce compaction or admission. Only main-agent usage reaches that gauge; subagent budget coverage is absent from this implementation. Workflow prose alone cannot enforce evidence correctness.

**Decision:** `apply-conceptually-reject-cosmetic-budget`. RAG-009, PERFORMANCE-005 and MEMORY-006: separate context occupancy, cumulative spend and real admission limit; use 200k default constrained by model capability and attach parent/child receipts.

## Proposed source-register payload

Hashes are SHA-256 of the raw downloaded bytes at the pinned revision. Source
links are reconstructed as `canonicalRepo/blob/revision/path`. License text was
fetched separately; license-file presence alone does not settle every transitive
license or trademark question. Reviewed behavior files were read in full; no
repository test, installer, binary or postinstall script was executed.

```json
{
  "schemaVersion": 1,
  "cycle": "rebuild-0004",
  "sources": [
    {
      "id": "new-everything-openai-codex-cycle4-20261108",
      "canonicalRepo": "https://github.com/mturac/everything-openai-codex",
      "revision": "b5057da5f42ed6b12cd3a59e89af0ccd12cff7c2",
      "license": "MIT",
      "query": "site:github.com \"everything\" \"agent\" \"session\" \"adapter\"",
      "retrievedAt": "2026-11-08T04:22:43.5031547Z",
      "paths": [
        {
          "path": "docs/SESSION-ADAPTER-CONTRACT.md",
          "sha256": "724b7e97df6ad45d9df1032e8f15f32784520d57d044b213f9d2dd0aa0fcd8d9"
        },
        {
          "path": "skills/verification-loop/SKILL.md",
          "sha256": "157df0f2c58fe539928677717fb5f059b7302c92e2246b7e745e2b1eb29b72cb"
        },
        {
          "path": "LICENSE",
          "sha256": "0fc5a7d21622c2b6885a43fad1d23aa2dec510ca760ab7c64dec0feddad51fa0"
        }
      ],
      "novelty": "Canonical repo/revision/path tuples absent from Cycle 3 register. Session adapter contract is the substantive new observation; license and repeated methodology names do not establish novelty.",
      "strengths": [
        "Versioned adapter-neutral session snapshot separates worker intent, runtime, outputs, health and provenance.",
        "Snapshot polling avoids duplicate history records when unchanged."
      ],
      "weaknesses": [
        "Document contract was inspected; its implementation and runtime were not executed.",
        "Fixed coverage threshold and simple grep examples in the verification skill do not prove native integration or secret-scan completeness."
      ],
      "decision": "apply-as-reference",
      "omniaApplication": "WORKFLOW-004..006, MEMORY-006 and OBSERVABILITY-001: define a fresh Omnia worker snapshot with bounded evidence and unfamiliar-state fallback; keep evidence gates independent of skill prose.",
      "evidence": [
        "docs/rebuild/research/NEW_OSS_CYCLE4_20261108.md"
      ]
    },
    {
      "id": "new-deepseek-durable-context-cycle4-20261108",
      "canonicalRepo": "https://github.com/deepseek-ai/deepseek-harness",
      "revision": "fcc0ad462172522aaf5c93a7b2e01f6b9f0b0159",
      "license": "MIT",
      "query": "site:github.com \"deepseek-harness\" \"session\" \"checkpoint\"",
      "retrievedAt": "2026-11-08T04:28:38.5548358Z",
      "paths": [
        {
          "path": "packages/session/session-checkpoint-policy/src/index.ts",
          "sha256": "2b93aae29cfb0b5757656f4e2e54c21d2ab5c11c1bccaed014735ecb9685fe35"
        },
        {
          "path": "packages/core/agent-loop/src/runtime-context.ts",
          "sha256": "7da577d2f50da7059e1fd830a393681c15b0810b6506c36b3f6e58cb3f73383c"
        },
        {
          "path": "packages/session/session-persistence-jsonl/src/win32.ts",
          "sha256": "410402b1b28047db87bea4c7c60794d0f1f7338c7b736e06fa43e476f479f579"
        },
        {
          "path": "LICENSE",
          "sha256": "ebb4f09972aee8608be255debaf78451a68e95c290f55c240dec2ecfa16ea6be"
        }
      ],
      "novelty": "Canonical deepseek-ai source is absent from registry. OpenAgentDev mirror was discovered first; its identical checkpoint file is counted only once. Canonical context and Win32 files have distinct observed hashes.",
      "strengths": [
        "Semantic flush gates precede downstream model and top-level tool dispatch.",
        "Context projection deduplicates unchanged snapshots and reconciles system prompt changes with route capability and request-series state.",
        "Windows helper uses lazy native bindings, write-through same-volume publication and a canonical-path-derived semaphore lock."
      ],
      "weaknesses": [
        "Checkpoint policy only protects sessions with persistence configured; missing session and nested calls follow explicit bypass paths.",
        "Source inspection does not prove crash recovery, semaphore behavior, or provider acceptance in Omnia."
      ],
      "decision": "apply-as-reference",
      "omniaApplication": "PORTABILITY-001, WORKFLOW-001, SETTINGS-006 and MEMORY-006: design durable admission receipts and no-dispatch-on-flush-failure tests; preserve source-attributed context and route capabilities.",
      "evidence": [
        "docs/rebuild/research/NEW_OSS_CYCLE4_20261108.md"
      ]
    },
    {
      "id": "new-openharness-mcp-contract-cycle4-20261108",
      "canonicalRepo": "https://github.com/nazsam/open-harness",
      "revision": "0a892be6484ffcf44552ef774a94a1c7c3a36c47",
      "license": "MIT",
      "query": "site:github.com IDE agent memory RAG MCP workflow open source",
      "retrievedAt": "2026-11-08T04:20:57.3091102Z",
      "paths": [
        {
          "path": "typescript/src/mcp.ts",
          "sha256": "8e4c88c771f96b1d96e2356d95a9008d5ccfa2fc876b01e62470f955dc5b9dd6"
        },
        {
          "path": "docs/guides/sessions-and-memory.md",
          "sha256": "f4d3269eaa42cde12fbac4dcb5a53ff7dc0189223df9d3b1cb3eed6d4c576ff1"
        },
        {
          "path": "LICENSE",
          "sha256": "8c26483b2dea090f852be45b12254b6876e052a53cbce2c4c7541960638b8309"
        }
      ],
      "novelty": "New canonical repo/revision/paths absent from register and prior-cycle research.",
      "strengths": [
        "Transport, tool discovery, cache invalidation and close lifecycle are separated behind a common server interface.",
        "Stdio requests are correlated and timeout cancellation is explicit; unsupported input_required is surfaced as an error."
      ],
      "weaknesses": [
        "Wrapper flattens image/audio output to text markers and cannot preserve full multimodal results.",
        "Stdio inherits process environment; protocol-version comments are upstream claims, not an independently checked MCP compatibility result.",
        "Session guide explicitly lacks built-in TypeScript SQLite and uses lexical BM25 memory by default."
      ],
      "decision": "apply-as-reference",
      "omniaApplication": "TOOLS-002/004/009 and MEMORY-001: build typed connection/capability states with filtered environment and caller cancellation; preserve rich content blocks and explicit unsupported states.",
      "evidence": [
        "docs/rebuild/research/NEW_OSS_CYCLE4_20261108.md"
      ]
    },
    {
      "id": "new-openhuman-budget-policy-cycle4-20261108",
      "canonicalRepo": "https://github.com/tinyhumansai/openhuman",
      "revision": "f3bc6b96024a513ac4499e92d14da20aeb1fed25",
      "license": "GPL-3.0",
      "query": "site:github.com open source everything AI agent harness workflow repository",
      "retrievedAt": "2026-11-08T04:20:55.5781333Z",
      "paths": [
        {
          "path": "crates/openhuman-core/src/agent/tinyagents/middleware/tool_policy.rs",
          "sha256": "a8321ebe230af646200cf11177dfbfb0bbe4dde5b4b8d4e28de1af08c5007c6f"
        },
        {
          "path": "crates/openhuman-core/src/agent/tinyagents/budget.rs",
          "sha256": "2d6ef3b9bfed2cc10debcb53496b94d8a245af41529f168bb7e77dace2119c40"
        },
        {
          "path": "LICENSE",
          "sha256": "f80cba4854c07fdc7e39a44088e80c368bad7d430b1f1e634100351ea67aa7b2"
        }
      ],
      "novelty": "New canonical repository and exact source paths absent from register. No performance or agent-count marketing is accepted as measured evidence.",
      "strengths": [
        "Tool-boundary policy checks inner packed-tool existence and session permissions rather than trusting the outer skill name.",
        "Host budget controls wrap primary, summarizer and routed model dispatch beneath retries/fallback."
      ],
      "weaknesses": [
        "GPL-3.0 requires a separate licensing decision before source reuse; no source is vendored here.",
        "Allow-all and approval-disable branches exist; effective host configuration needs runtime inspection before claiming strict enforcement.",
        "Depth ceiling is a product constant, not proof of optimal resource use."
      ],
      "decision": "defer-code-reuse-license-review",
      "omniaApplication": "TOOLS-003/004 and WORKFLOW-004: independently implement nested-tool scope checks and inherited budget accounting; keep policy at native dispatch rather than only prompt/UI.",
      "evidence": [
        "docs/rebuild/research/NEW_OSS_CYCLE4_20261108.md"
      ]
    },
    {
      "id": "new-memory-drift-secrets-cycle4-20261108",
      "canonicalRepo": "https://github.com/ipiton/agent-memory-mcp",
      "revision": "11aede1bb0177cd0380738b2b7442754c9d327af",
      "license": "MIT",
      "query": "site:github.com IDE agent memory RAG MCP workflow open source",
      "retrievedAt": "2026-11-08T04:21:02.8398667Z",
      "paths": [
        {
          "path": "internal/steward/drift.go",
          "sha256": "b45f17f401fe8a19e53e1df50442dfadc8c8513a5f81ee665556c09fbc8d893a"
        },
        {
          "path": "internal/secrets/secrets.go",
          "sha256": "f55e284b4f5513bf21d2ba87ee84c27d7236f1fa368820363ddb2e30c04901ad"
        },
        {
          "path": "LICENSE",
          "sha256": "495f413154da10ad6ff2f0833e3bf5389f62a64a5b61af69e27c6c9bbd2fdd4a"
        }
      ],
      "novelty": "New canonical repo/revision/paths absent from source register.",
      "strengths": [
        "Drift separates changed, missing, stale and unreachable references instead of silently rewriting facts.",
        "Credential checks and document/prose redaction have distinct write-boundary behavior."
      ],
      "weaknesses": [
        "Observed drift check uses mtime, lexical root prefix and slash-oriented regex, not a content identity or Windows rename pointer.",
        "This file alone does not establish symlink-safe containment; fixed confidence values are not measured calibration.",
        "Pattern-based redaction has finite coverage and cannot justify claiming all secrets removed."
      ],
      "decision": "apply-as-reference",
      "omniaApplication": "MEMORY-003/008, OBSERVABILITY-005 and pointer storage: use file identity plus content hash and validated final-path scope, retain unreachable state, and test redaction before embeddings/logs.",
      "evidence": [
        "docs/rebuild/research/NEW_OSS_CYCLE4_20261108.md"
      ]
    },
    {
      "id": "new-openlit-session-correlation-cycle4-20261108",
      "canonicalRepo": "https://github.com/openlit/openlit",
      "revision": "1b8a274d3b0d3ac85e00ebb07cde880ac95b4385",
      "license": "Apache-2.0",
      "query": "site:github.com open source everything AI agent harness workflow repository",
      "retrievedAt": "2026-11-08T04:21:00.0308437Z",
      "paths": [
        {
          "path": "cli/internal/otlp/tracecontext.go",
          "sha256": "fecdd7f0dd18039ec558bc989cbdb06aa96e594579e698cf637b7850da002a96"
        },
        {
          "path": "LICENSE",
          "sha256": "ff5c9af5dcef9934ca533c0581fe26af59f024f7bc3995fccaa1dac3f5bb7e65"
        }
      ],
      "novelty": "New exact trace-context implementation in a new registry repository. Downloaded README is not counted as an inspected implementation.",
      "strengths": [
        "Session/vendor derivation joins separate hook-process spans while separating nested vendors sharing a session ID.",
        "Root IDs are deterministic; child span IDs remain random."
      ],
      "weaknesses": [
        "Missing environment salt falls back to an empty key, weakening pseudonymization.",
        "Trace hierarchy proves neither usage accounting nor billing reconciliation."
      ],
      "decision": "apply-as-reference",
      "omniaApplication": "OBSERVABILITY-001/005/010: persist opaque native trace/session lineage with protected installation salt and versioned correlation; retain account proof as unknown.",
      "evidence": [
        "docs/rebuild/research/NEW_OSS_CYCLE4_20261108.md"
      ]
    },
    {
      "id": "new-metaharness-witness-boundary-cycle4-20261108",
      "canonicalRepo": "https://github.com/ruvnet/metaharness",
      "revision": "574ce3b881e902d23472a541f9f9e2fdccfa63db",
      "license": "MIT",
      "query": "site:github.com superpowers agent harness MCP workflow open source",
      "retrievedAt": "2026-11-08T04:21:01.4360994Z",
      "paths": [
        {
          "path": ".claude-plugin/skills/verify-witness/SKILL.md",
          "sha256": "807527b6526c6851beeeb2ed362ff997020e452243e4beb236aad07451e43542"
        },
        {
          "path": "apps/web-ui/src/components/VerifyPanel.tsx",
          "sha256": "cb5f939fadc326f8903525eab7fd792cd86d94e2fb3db86720baa08101d75c42"
        },
        {
          "path": "LICENSE",
          "sha256": "09ed6717912f408da29e15b55170cd56c9658218a540b7c72e70909b9101274c"
        }
      ],
      "novelty": "New repository/revision/paths absent from register. No UI source is copied.",
      "strengths": [
        "Witness-signature integrity is explicitly narrower than release-readiness validation.",
        "UI displays per-check severity and preserves an unverified initial state."
      ],
      "weaknesses": [
        "Embedded public-key signature alone does not authenticate a trusted publisher or prove behavior.",
        "Inspected ZIP importer has no visible entry-count/decompressed-byte quota; generator verifier internals and runtime were not inspected."
      ],
      "decision": "apply-conceptually",
      "omniaApplication": "GOVERNANCE-008/010 and portable exports: distinguish integrity, trusted signer and runtime acceptance receipts; add archive quotas without copying UI.",
      "evidence": [
        "docs/rebuild/research/NEW_OSS_CYCLE4_20261108.md"
      ]
    },
    {
      "id": "new-autocua-context-display-cycle4-20261108",
      "canonicalRepo": "https://github.com/ComputerUseAgent/AutoCua",
      "revision": "0f6732ef27dcdaccf39f9d37b387883bf7f6e9c8",
      "license": "MIT",
      "query": "site:github.com power pro max browser computer use agent open source",
      "retrievedAt": "2026-11-08T04:21:04.6665619Z",
      "paths": [
        {
          "path": "AutoCua/memory_compression/memory_tracker.py",
          "sha256": "a54942d4b28cd4838080cd2d9e684c81e8bf0880de782d83a5a307cdaba53d1b"
        },
        {
          "path": "AutoCua/coder/subagent/workflow/workflow.md",
          "sha256": "31c5c26d6548a5a6d2d504f4cefd5c0097de47d0aca6ca8576d5afaef4c0b094"
        },
        {
          "path": "LICENSE",
          "sha256": "2c242c26a929f2c047dc163ff4cdeeb9f0a44d881e6c2462ecbff248486cc84a"
        }
      ],
      "novelty": "New repository/revision/paths absent from source register.",
      "strengths": [
        "Memory gauge overwrites with latest prompt occupancy instead of summing cumulative usage; cache tokens remain context occupancy.",
        "Read-only worker workflow distinguishes observed connections from inferred ones and requires file/line anchors."
      ],
      "weaknesses": [
        "Gauge is explicitly cosmetic and fixed at 300k by default; it does not enforce compaction or admission.",
        "Only main-agent usage reaches that gauge; subagent budget coverage is absent from this implementation.",
        "Workflow prose alone cannot enforce evidence correctness."
      ],
      "decision": "apply-conceptually-reject-cosmetic-budget",
      "omniaApplication": "RAG-009, PERFORMANCE-005 and MEMORY-006: separate context occupancy, cumulative spend and real admission limit; use 200k default constrained by model capability and attach parent/child receipts.",
      "evidence": [
        "docs/rebuild/research/NEW_OSS_CYCLE4_20261108.md"
      ]
    }
  ]
}
```

## Resume-input fingerprints

These fingerprints record the task's observed canonical inputs, captured before
this document was authored. Other owners can update those files afterward; root
must capture final post-edit hashes in the cycle manifest rather than treating
these historical input hashes as final proof.

| Input | SHA-256 |
| --- | --- |
| `AGENTS.md` | `4841902ff1830d8bd59531c8cd1dfccfe7082deffdc694263be038b08afb70c8` |
| `.agents/skills/omnia-evidence-loop/SKILL.md` | `a03964248bd0d2ed64a672f34e038ad5dcd44438f8b73fc64e08fd2e6f227ce6` |
| `docs/rebuild/GOAL.md` | `c168ea23eb684ea99d4fbe1560d155a1266e03e84220a7f9e7c8d6515d1697bf` |
| `docs/rebuild/WORKFLOW.md` | `7d52f5bea6a524664e1d7d3e74a07f2a23d926cba75584a73925f1b78a2b1fb9` |
| `docs/rebuild/SPEC.md` | `39ed159f6a428f7a447c42357dc942b418c6ba3d071c761b719b075ed0b99ae0` |
| `docs/rebuild/DOD.json` | `77961433f3dddbacb3780a1b4d99220aac105f305e94acf025cbc224945c5946` |
| `docs/rebuild/SOURCE_REGISTER.json` | `d3f1e7c38c34fa9aab9f5e1915cb6f635a9b57c455d8605096ec57bc33c467f7` |
| `docs/rebuild/CHECKPOINT.md` | `6f34f537d614b1e9902caa655583aa0684c3533810821c1eb09285e461e66601` |
| `docs/rebuild/ASSIGNMENTS.md` | `dab390e80664b25cab95bea36d743aa710a185328e86ec3b71170d90922adeff` |

## Verification and remaining work

- GitHub metadata and branch-ref requests completed successfully for all proposed
  repositories. Pinned raw source and LICENSE fetches returned successfully.
- No product source, registry, spec, DoD state, dependency lock or release file was
  changed by this research assignment.
- Root still needs independent source review, registry integration, a product
  acceptance plan and implementation/runtime evidence for any adopted decision.
- Future research should inspect the deferred MAX/Phosphor/browser/handoff sources,
  rotate the gap, and compare content hashes before claiming another novel result.
- No screenshot, source presence, README claim or passed structural validator here
  is evidence that a native Omnia criterion is Done.

