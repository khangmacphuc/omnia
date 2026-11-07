# Local RAG adapter receipt — 2026-11-08

## Scope

- Source revision: `e073557dcb32ab3b63bf3f1f690164a62339e5ae`

Exercise the RAG provider contract end to end inside the supported local
boundary. The adapter consumes only frozen SHA-256 metadata and produces a
lineage-bound receipt. It does not read source text, resolve credentials, call
the network, or claim an external provider accepted a request.

## Implementation

- `src/domain/rag-provider-local-adapter.ts`
  - pins a versioned local provider descriptor;
  - ranks candidates using deterministic hash similarity;
  - preserves request fingerprint and idempotent local request identity;
  - validates the completed receipt against provider/model/adapter lineage;
  - supports query-only embedding completion through response-hash evidence.
- `src/domain/rag-provider-contract.ts`
  - allows a completed query-only embedding with no candidates when a response
    hash is present; rerank/document operations still require scores.
- `src/domain/rag-provider-local-adapter.test.ts`
  - covers deterministic ordering, replay stability and query-only completion.

## Verification

```text
npm.cmd test -- --run src/domain/rag-provider-local-adapter.test.ts src/domain/rag-provider-contract.test.ts --reporter=dot
PASS — 2 files, 9 tests

npm.cmd run typecheck:app -- --pretty false
PASS

git diff --check
PASS
```

## Boundary

This receipt proves local adapter execution and native-compatible, content-free
request/receipt semantics. It does not prove live embedding/reranker network
dispatch, provider authentication, provider billing, or external provider
acceptance. Those remain explicit release ledger boundaries.
