# Cycle 0006 new OSS research: Mastra workflow durability

**Cycle:** `rebuild-0006`  
**Research timestamp (UTC):** `2026-11-08T05:59:16.0111051Z` (discovery query); source verification completed `2026-11-08T06:02:41.6322474Z`  
**Research owner:** `/root/cycle6_new_research`  
**Decision:** `apply-as-reference` (source is not vendored, copied, linked into the renderer, or executed)

## Discovery and novelty

- **Query:** `everything super power pro max agent workflow architecture open source Mastra`
- **Canonical repository:** <https://github.com/mastra-ai/mastra>
- **Pinned revision:** `9a85fd4c5c5de81ce7632ea35ba1b79e4357b9c5` (the repository `HEAD` returned this exact revision at verification time).
- **Why this is new:** `rg` over `docs/rebuild/SOURCE_REGISTER.json` and prior research found no Mastra repository/revision/path entry before this artifact. The only matching paths after the check are the cycle-0006 snapshots created for this receipt. This therefore counts as a new repository/revision/path for the cycle; it is not a repeat of the known Superpowers, browser-use, browser-harness, desktop, or pi-mono sources.
- **License:** root `LICENSE.md` states that content outside directories named `ee/` is available under the Apache License 2.0. Both selected paths are outside `ee/`, so this receipt treats them as Apache-2.0 reference material. Third-party components and `ee/` content retain their own licenses and were not used.

## Exact source read and integrity

The raw files were fetched from the pinned commit with `curl.exe -L --fail --silent --show-error`. No downloaded script or package was executed.

| Source path at pinned revision | Local snapshot | SHA-256 | Fetch evidence |
| --- | --- | --- | --- |
| `LICENSE.md` | [`snapshots/cycle6/mastra-workflow/LICENSE.md.txt`](snapshots/cycle6/mastra-workflow/LICENSE.md.txt) | `F0351B469D1548E547882F01D2486A90F6BD0FF3C89DEFEC841BBF5641265776` | raw URL returned `HTTP/1.1 200 OK`, `Content-Length: 1258` |
| `packages/core/src/workflows/workflow.ts` | [`snapshots/cycle6/mastra-workflow/workflow.ts.txt`](snapshots/cycle6/mastra-workflow/workflow.ts.txt) | `55FF8CC5148BF57AA167A475F0DC75ADFF75632C47D4B8F674E678D7F61F4DA9` | raw URL returned `HTTP/1.1 200 OK`, `Content-Length: 247964` |

Verification command results:

```text
git ls-remote https://github.com/mastra-ai/mastra.git HEAD
9a85fd4c5c5de81ce7632ea35ba1b79e4357b9c5    HEAD
```

`Get-FileHash -Algorithm SHA256` produced the two hashes in the table above. The local snapshots are evidence of the exact text read, not a runtime dependency.

## Observed source behavior

The observations below are tied to the pinned `workflow.ts` snapshot and line ranges. They describe implementation behavior visible in source; they are not claims that Omnia already implements it.

### 1. Journal-aware persisted run representation and version negotiation

- Imports at lines 25 and 74, 99–102 bring in bounded concurrency, `WorkflowRunHeader`, journal result helpers, and ownership-claim helpers.
- `loadRunForCancel` (lines 370–403) prefers a storage-v2 run journal when `supportsRunJournal()` is true. It loads only the header and the suspended nested-workflow step IDs, while falling back to a v1 full snapshot when a journal is unavailable. This keeps cancellation reads bounded instead of loading every step result.
- Run creation (lines 3180–3348) checks whether the configured store supports journals, rejects an explicitly requested unsupported v2 store, auto-selects v2 for the default engine when available, probes the alternate v1/v2 table for caller-supplied IDs, and persists a pending initial snapshot with graph, state, context, active paths, suspension paths, result/error and timestamp.

### 2. Cancellation is persisted and cascades through suspended nested work

- `cancelSuspendedNestedRuns` (lines 411–451) scans suspended step results, extracts nested run IDs (including `foreach` iterations), recursively cancels descendants before parents, and writes a compare-by-expected-status transition. The comment records why child-first ordering is retry-safe when a write fails part-way through.
- `Run.cancel` (lines 4389–4460) aborts live work, marks in-memory status `canceled`, closes the whole observability span tree with `caller_cancelled`, persists the canceled header, tolerates a storage-write failure after the local abort, and then cascades to suspended descendants. Re-canceling a terminal canceled run still performs the descendant cleanup.

### 3. Recovery sweep has explicit parent semantics and bounded concurrency

- Recovery (lines 3780–3853) examines each active run's nested parent. Depending on the parent status it restarts the child, cancels it, or skips it for the parent to drive. A failure inspecting one run is logged and does not stop unrelated recovery.
- Restart fan-out is passed through `runWithConcurrency` with `workflowConcurrency ?? DEFAULT_RESTART_CONCURRENCY` (lines 3826–3849). A live ownership error is treated as a skip; other restart errors are logged with workflow and run IDs. This is a concrete resource bound for boot-time repair rather than unbounded parallel replay.

### 4. Ownership leases and compare-and-set resume claims

- `#claimOwnership` (lines 5399–5425) acquires a persisted lease only for recoverable top-level runs that persist their running state; nested runs are covered by the parent's lease.
- `#claimRun` (lines 5428–5505) uses a persisted expected-status transition (`suspended` for resume, the loaded status for time travel). If running-state persistence or concurrent updates are unavailable, it warns that duplicate downstream steps are possible instead of pretending to fence callers. A failed compare-and-set re-reads the current header so the error reports the actual owner/status.
- `restart` (lines 5920–6115) reloads the persisted snapshot, reconstructs terminal results from storage, refuses to restart a run still owned by another process, creates a workflow span with trace/resource/run metadata, and releases the ownership lease in `finally` after execution.

### 5. Retry and observability metadata are first-class run data

- The workflow object exposes `retryConfig` (`attempts` and `delay`) at lines 2066 and 2121–2147; the config is propagated into the execution engine at lines 3293–3307 and 4690–4699.
- Processor phases carry `retryCount` through input, step, output and tool-result span payloads (around lines 930–1175), so retries remain visible in the trace rather than being indistinguishable from first attempts.
- Restart execution attaches trace IDs and spans (lines 6030–6115), preserving run lineage across recovery and making a persisted run auditable after a process restart.

## Strengths relevant to Omnia

1. **Durable lineage:** a header plus append/readable step journal gives a compact, replayable record instead of requiring a full in-memory transcript.
2. **Safe nested cancellation:** child-first recursive cancellation handles suspended subagents and remains retry-safe after partial storage failure.
3. **Fencing and ownership:** explicit leases and compare-and-set claims prevent two workers from resuming the same run when the adapter supports atomic updates; unsupported adapters are surfaced honestly.
4. **Recovery discipline:** parent-aware restart/cancel/skip decisions isolate per-run failures and bound concurrency.
5. **Observable retries:** retry attempts, delays, trace IDs and span metadata are carried through execution and restart paths.
6. **Compatibility path:** v1 snapshot fallback plus v2 journal negotiation shows how a local-first product can migrate storage without silently changing the meaning of an existing run ID.

## Weaknesses and evidence limits

- This is a TypeScript framework source file, not Windows Tauri/Rust code. It does not prove that Omnia's native persistence, WebView2 lifecycle, or packaged desktop build works.
- The selected file references many other Mastra modules; this receipt intentionally read only the exact source paths above and did not claim behavior of uninspected adapters.
- No live provider, database adapter, multi-process lease test, or crash-recovery run was executed. The evidence is source inspection plus raw HTTP/hash verification.
- Storage v2 is conditional on adapter capabilities; an adapter without atomic updates can still duplicate downstream work. Omnia must retain an explicit `unknown/unsupported` state rather than report exactly-once behavior.
- The repository has separate `ee/` licensing boundaries and third-party licenses. No `ee/` code is part of this reference decision.

## Omnia gap and concrete application

Cycle 0006 targets `UI-009`, `UI-012`, `UI-015`, `ADVSET-003`, and `CHAT-008`. The current clean-room UI/native source still needs direct evidence for durable workflow/run receipts, nested subagent cancellation, restart/retry semantics, and hot settings behavior. Mastra's source does not close those gaps by itself; it supplies design evidence to translate into Omnia-owned contracts.

Apply the following concepts in Omnia's own Rust/TypeScript implementation and receipts:

1. Add a **run header + step receipt journal** keyed by session/workflow/run ID. Store status, parent run, graph/source hashes, active/suspended paths, retry count, timestamps and evidence links. Page step results for cancellation/retrieval so the renderer does not receive an unbounded transcript.
2. Add **lease/claim fencing** for resume/recovery. Use compare-and-set only when native storage exposes an atomic update; otherwise emit an explicit `unfenced` warning and route duplicate-execution risk to the workflow approval/unknown state.
3. Implement **child-first cancellation** for suspended subagents and record each transition. A retry of cancellation should discover any descendants left suspended after a partial write.
4. Encode **retry policy** as retryable, terminal, permission-denied and outcome-unknown classes. Keep the user's requested 5-second ×1 default only for known retryable work; never blindly replay a dispatch whose acceptance is unknown. Persist `retryCount`, `nextAttemptAt` and the decision receipt.
5. Bound **recovery concurrency** with a configured maximum and per-run failure isolation. Expose the bound and observed queue/latency in observability rather than claiming unlimited safe parallelism.
6. Carry **trace/session/run IDs** into evidence receipts and UI tool summaries so a user can audit which model/agent/subagent produced each result after reload or compaction.

These are independent Omnia design translations. Do not vendor Mastra, copy its workflow source, embed its UI, or treat its license as an Omnia dependency.

## Scope and ownership confirmation

- Files added/updated by this slice: this research receipt and the two raw source snapshots under `docs/rebuild/research/snapshots/cycle6/mastra-workflow/`.
- No product code, `DOD.json`, `SOURCE_REGISTER.json`, cycle manifest, spec, checkpoint, package script, credentials, browser profile, or personal chat history was changed.
- The root integrator owns adding this source to the canonical registry and deciding which Omnia criteria can receive evidence. This receipt intentionally does not mark any DoD item Done.
