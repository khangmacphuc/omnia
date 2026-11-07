# Telemetry, retry and state-lineage audit

Observation date: August 14, 2026  
Audit scope: native telemetry slice, retry/state contracts, durable lineage and
machine-verifiable goal-pack coverage  
Audit status: actionable findings; no native telemetry behavior is promoted to
runtime verified by this document

## Executive result

The goal pack describes the requested behavior at a high level and its
structural validator passes. The current native telemetry slice also has sound
local boundaries: its renderer DTO is bounded, content-free, and exact-run /
exact-attempt scoped. This document preserves the earlier Windows loader
failure as historical evidence; the later focused direct-launch receipt
records a rebuilt telemetry-read test passing on the same development host.
More importantly, the end-state retry and state-revision contract is not yet
represented by one canonical, cross-layer machine model. Several schema enum
spellings also diverge from the native/domain ledger values.

The required implementation sequence is therefore:

1. make the native test process executable and capture an actual harness pass;
2. choose one canonical persisted telemetry wire vocabulary and version any
   external adaptation explicitly;
3. introduce append-only retry decision, run-control, state-revision and
   attempt-lineage receipts;
4. make retry A -> retry B context selection testable as a state graph, not a
   transcript reconstruction heuristic; and
5. only then expose complete retry/lineage analytics in the request inspector.

## Evidence observed

| Area | Evidence | Audit conclusion |
| --- | --- | --- |
| Goal pack integrity | `docs/omnia-ultra/tools/validate-spec.ps1` reported `PASS` with 92 Markdown files, 19 JSON files, 92 unique IDs, 41 requirements and 41 capability rows. | Registry structure is currently sound; this does not prove runtime behavior. |
| Native telemetry read | `Storage::read_run_telemetry` validates run and optional attempt ownership, bounds rows and serializes an allowlisted DTO. | Good privacy and scope design in source; only the named focused read has direct native evidence. |
| Focused native test | The test `storage::tests::run_telemetry_read_is_attempt_scoped_bounded_and_content_free` asserts scope, bounded usage and content exclusion. | A rebuilt direct-launch receipt records 1 passed test and exit code 0; this does not represent a full Rust-suite or packaged-app pass. |
| Direct Windows launch | The earlier resource-linked target exited `-1073741511` / `0xC0000139` before discovery. A later rebuilt target loaded and passed the focused test. | The loader failure is historical for the pre-fix target; see both `NATIVE_TEST_LOADER_RECEIPT.md` and `NATIVE_TELEMETRY_READ_TEST_RECEIPT_2026-08-14.md`. |
| Renderer telemetry tests | Focused renderer contracts exist for sync and inspector projection. | Useful unit coverage, but it cannot verify native SQLite facts, process startup or retry orchestration. |

## Confirmed source boundaries

The current bounded native read is intentionally safe to show in a renderer:

- it validates `runId`, optional `attemptId`, owned-run scope and
  run-to-attempt scope before querying;
- it reads only bounded attempt, timing and usage rows;
- its `RunTelemetryAttemptSnapshot` omits raw prompt/response content,
  reasoning text, credentials, paths, tool payloads and remote identifiers;
- its focused storage test checks that a prompt and response sentinel string
  cannot occur in the serialized DTO; and
- it retains `partial` and `non-authoritative` provider-stream usage instead
  of fabricating final cost, timing, RPM/TPM, quota or throughput values.

These statements are source-inspection claims until the Windows native test
harness can run. They must not be rephrased as a native-runtime verification.

## Findings

### TRLA-001 — Native test process cannot start (historical target)

**Severity:** release blocker for any native telemetry verification

The pre-fix resource-linked test target exited `0xC0000139` before Rust
discovered a test. The later receipt
`NATIVE_TELEMETRY_READ_TEST_RECEIPT_2026-08-14.md` records a rebuilt target
that loaded, discovered the selected test, and passed it. The older failure is
retained as historical evidence and must not be used to claim that the current
focused target is still blocked.

**Remaining close-out:** capture a minimal failing-loader dependency report
for the historical target if root-cause analysis is needed, then test on a
supported Windows CI image and rerun the exact telemetry-read, usage-ledger,
outcome-unknown and fixed-watermark replay tests. Store the test-process
outputs and binary hashes as auditable receipts. The focused receipt alone is
not evidence for the full native matrix, packaged application, or CI parity.

### TRLA-002 — Canonical telemetry enum vocabulary diverges across schema and code

**Severity:** high; export, analytics and provider adapters can reject valid
local facts or silently normalize them inconsistently

The native/domain ledger uses kebab-case persisted values, while
`schemas/request-telemetry.schema.json` defines several incompatible
snake_case or differently named values.

| Concept | Native/domain ledger | Request telemetry schema |
| --- | --- | --- |
| Usage source | `local-estimate`, `provider-incremental`, `provider-final`, `provider-invoice`, `user-correction` | `estimate`, `provider_incremental`, `provider_final`, `provider_invoice`, `user_correction`, `unknown` |
| Cost kind | `calculated-estimate`, `provider-reported`, `invoice`, `user-override` | `estimate`, `provider_reported`, `invoice`, `user_correction` |
| Quota source | `provider-header`, `provider-api`, `configured`, `inferred` | `provider_header`, `provider_api`, `configured`, `inferred`, `unknown` |

This is not safe to paper over in UI code. Adopt one canonical versioned
persisted vocabulary — the current native/domain kebab-case values are the
least disruptive candidate — and define an explicit adapter only if a public
API requires a distinct external representation. Every adapter must preserve
authority, coverage, provenance and original semantic identity.

### TRLA-003 — The request telemetry schema cannot truthfully encode the current partial ledger fact

**Severity:** high; it weakens the product rule that unknown is never zero

The native usage ledger stores source, `authoritative`, `coverage`, observation
time, counters, an optional provider identity hash, supersession and separate
cost statements. The request telemetry schema's `usage` object lacks required
`coverage`, `authoritative`, `observedAt`, `unknownReason`, ledger identity and
supersession fields. Therefore it cannot faithfully encode the current
`provider-incremental`, non-authoritative, partial usage observation visible in
the native slice.

The canonical request telemetry receipt needs at minimum:

- immutable observation and sequence IDs;
- exact run, attempt, iteration, branch and trace correlation IDs;
- source, authority, coverage and unavailable/unknown reason;
- observed, provider-reported, estimated and invoice time distinctions;
- counter classes with `null` plus reason when unavailable;
- cost statement layer, currency, price snapshot hash and formula revision;
- local-use versus provider-native cache evidence separation; and
- supersedes/reconciles links that cannot cross an attempt boundary.

### TRLA-004 — Retry lineage is not included in the safe native telemetry DTO

**Severity:** high for the requested inspector, compare and retry UX

`RunTelemetryAttemptSnapshot` currently exposes attempt identity, ordinal,
provider/model, state, acceptance, error code, time fields and bounded timing /
usage observations. It does not expose a renderer-safe retry operation ID,
parent attempt, retry decision, retry policy revision, backoff/retry-after
decision, state-base mode, source/current/result state revisions, branch fork
boundary or context-manifest identity.

Do not expose raw provider payloads or secrets to solve this. Add a separate
allowlisted `AttemptLineageReceipt` projection that references opaque IDs and
declared policy/coverage fields only. It should be selectable by run, attempt,
operation and branch and should be available to both the Inspector and Compare
views.

### TRLA-005 — Run-control schema is too permissive to prove immutable edit/retry semantics

**Severity:** high for retry A -> retry B correctness

`run-control-operation.schema.json` makes all source fields optional and has
no operation-result object. A `retry` instance can currently validate without
a source attempt, a `pause` without a source run/checkpoint, or an `edit`
without a source message/prompt revision. It also records only a
`currentStateRevisionId`; it cannot record the resulting state revision,
resulting attempt/branch/checkpoint, operation lifecycle, parent operation,
conflict outcome or an immutable state transition receipt.

Split the model into typed receipts with `oneOf` validation by operation kind:

1. `RunControlIntent` — user/agent action, source cursor and immutable request
   intent;
2. `RunControlResolution` — accepted/rejected/deferred/safe-boundary /
   interrupted/queued/forked result plus idempotency result;
3. `StateRevisionReceipt` — parent revision(s), source state, result state,
   context manifest, decision/effect references and supersession;
4. `RetryDecisionReceipt` — normalized error class, acceptance evidence,
   idempotency safety, policy revision, planned/actual delay, route choice,
   repair diff reference, user decision and resulting new attempt; and
5. `AttemptLineageReceipt` — parent/retried/forked/continued/resumed edges and
   the non-secret references required by Inspector/Compare.

No receipt may overwrite an older accepted attempt or state. A later retry is
always a new attempt and new state revision.

### TRLA-006 — Retry policy cannot reconstruct why an automatic action happened

**Severity:** medium-high for auditability and adaptive automation

The retry-policy schema correctly models maximum elapsed time, default schedule
and broad status actions. It does not encode the resolved policy revision,
classification evidence, provider response/Retry-After source, actual jittered
delay, idempotency or provider-acceptance evidence, repair diff, selected
fallback route, cost/billing risk, decision owner, consent/approval or outcome
of each scheduled retry.

Keep policy as configuration and add immutable per-attempt decision receipts.
The deterministic safety classifier must run before any AI retry advisor; the
advisor can only propose a permitted decision and may never turn unknown
acceptance into a blind resend.

### TRLA-007 — Critical lineage tests are still specifications, not executable gates

**Severity:** medium-high

The goal contract asks for A-then-B state awareness, branch isolation,
in-flight mutation prevention, compare accuracy and idempotency. The observed
native focused test proves only bounded content-free telemetry read and exact
attempt scope in source. It does not cover state-aware retry semantics.

Add executable gates for:

- **A -> B current-state:** retry A, accept its result, retry B with
  `current-state`, then assert B's context manifest includes permitted A
  before/after state revisions and excludes superseded/conflicting facts;
- **B exact-historical:** retry B from the original frozen cursor and assert it
  excludes later A retry state and later accepted deltas;
- **selected deltas:** preserve the historical base and include only explicitly
  selected state IDs with recorded inclusion reasons;
- **active stream mutation:** edit/retry/branch while streaming and assert the
  frozen provider input hash is unchanged; each alternative creates a new
  attempt or queues/forks at a durable cursor;
- **unknown acceptance:** transport loss after provider acceptance creates an
  outcome-unknown receipt and forbids an automatic duplicate request without
  idempotency evidence;
- **compare:** verify that prompt, state/context, route, tools/effects,
  token/cache/cost, latency and test results are attributable to the correct
  attempt/branch; and
- **schema fixtures:** validate examples for every permitted source, cost kind,
  quota source and retry state-base mode against the canonical JSON schemas.

## Required lineage model

The following graph is the minimum durable model for the requested behavior:

```text
PromptRevision --creates--> RunControlIntent
RunControlIntent --resolves-to--> RunControlResolution
RunControlResolution --creates--> RetryDecisionReceipt (when retry)
RetryDecisionReceipt --starts--> ProviderAttempt
ProviderAttempt --emits--> TelemetryObservation / UsageLedgerEntry
ProviderAttempt --produces--> StateRevisionReceipt
StateRevisionReceipt --becomes-current-on--> Branch

ProviderAttempt --retried-from--> ProviderAttempt
StateRevisionReceipt --parent-of / supersedes--> StateRevisionReceipt
Branch --forked-from / branched-from--> Branch
```

Every edge needs immutable IDs, timestamps, actor, policy revision,
authority/coverage, source and target IDs, and an explanation suitable for the
Inspector. Event ordering alone is insufficient: retry context selection must
operate over revisions and typed edges.

## Acceptance gates before a "complete" claim

1. The Windows native test process starts and prints the selected test plus a
   passing harness result on a supported host/CI lane.
2. Native integration tests prove durable retry, outcome-unknown, fixed
   watermark recovery and cross-run denial.
3. JSON Schema fixtures prove one canonical wire format, including coverage
   and unknown reasons; any external adapter has round-trip conformance tests.
4. State-graph tests prove retry A -> retry B behavior for every state-base
   mode and branch/fork isolation.
5. The inspector can show, per attempt, exact model/effort/parameters,
   provider acceptance, retries/backoff/fallback, token/cache/cost layers,
   timing/throughput/quota coverage and the state/context base — each with
   source, authority and freshness.
6. Compare and export preserve lineage without including prompt/response
   content, credentials, remote request IDs or unapproved sensitive data.

## Ownership and next implementation units

| Unit | Primary responsibility | Dependency |
| --- | --- | --- |
| Native loader receipt and CI lane | Make the Rust test harness observable and executable. | Windows loader diagnosis |
| Canonical telemetry schema | Resolve wire-value drift and add schema fixtures/adapters. | Product/API naming decision |
| Run-control receipt store | Persist typed intent/resolution/state/retry receipts atomically. | Durable journal transaction boundary |
| Context-state graph compiler | Build exact/current/selected-delta bases with inclusion/exclusion evidence. | State revision and branch graph |
| Retry controller | Enforce deterministic safety, then record/adapt policy decisions. | Retry receipts, provider acceptance, route selector |
| Inspector/Compare projection | Display only allowlisted opaque lineage plus truthful coverage. | All receipts above |

## Claim boundary

This audit records what is present in goal contracts and source code on August
14, 2026. It does not claim that Pause, Continue, immutable edit, state-aware
retry, automatic retry/fallback, complete telemetry analytics or native test
execution are shipped end-to-end. The current implementation remains a bounded
provider-stream and telemetry foundation that requires the gates above before
it can support the requested Omnia Ultra behavior.
