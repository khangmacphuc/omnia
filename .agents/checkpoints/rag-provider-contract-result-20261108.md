# RAG provider contract slice — 2026-11-08

## Scope

Added an isolated renderer/native contract for provider-backed embedding and reranking. The module defines a versioned request containing only frozen snapshot/query/candidate hashes and bounded metadata; source text, credentials, URLs and provider wire payloads are absent.

## Changes

- `src/domain/rag-provider-contract.ts`
  - Capability-gated `embed-query`, `embed-documents` and `rerank` operations.
  - Provider/model/adapter lineage descriptor with batch and cancellation limits.
  - Content-free request identity, token budget, candidate hash validation and deterministic SHA-256 request fingerprint.
  - Receipt validation for exact request/provider lineage, bounded score ranks, completed/failed state requirements and response hash.
- `src/domain/rag-provider-contract.test.ts`
  - Six focused contract regressions covering fingerprint privacy, capability denial, duplicate/over-budget denial, lineage matching and terminal receipt requirements.
- `src/domain/index.ts`
  - Exports the new contract.

## Verification

```text
npm.cmd test -- --run src/domain/rag-provider-contract.test.ts --reporter=dot
PASS — 1 file, 6 tests
npm.cmd run typecheck:app
PASS (no diagnostics)
git diff --check -- selected files
PASS
```

## Boundary

This is a contract and validator only. It does not perform embedding/reranker network calls, decrypt source text, select credentials, or claim provider acceptance. Native adapters remain responsible for resolving frozen snapshot content and dispatching under provider policy.
