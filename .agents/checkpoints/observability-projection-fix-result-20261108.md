# Observability projection repair receipt — 2026-11-08

## Scope

This bounded renderer repair closes two projection errors found during the
observability usage audit. It does not add provider connectors or claim live
billing evidence.

## Changes

- `src/features/workspace/inspector.tsx`
  - `latestUsageObservation` now selects from the latest attempt using
    sequence order with source precedence, while preferring observations that
    contain at least one finite usage counter.
  - A cost-only invoice therefore cannot hide the latest counter-bearing
    provider-final observation. If no counter-bearing row exists, the latest
    ledger row remains visible so billing authority is not discarded.
- `src/features/workspace/project-runtime-posture.tsx`
  - Provider cache posture uses the newest provider observation with counters
    when available; cost-only invoice rows remain available for billing but do
    not erase provider-final cache read/write counters.
- `src/features/workspace/inspector.telemetry.test.tsx`
  - Added regression coverage for provider-final counters followed by a
    cost-only invoice.
- `src/features/workspace/project-runtime-posture.test.tsx`
  - Existing regression coverage verifies cache counters survive a later
    cost-only invoice.

## Verification

```text
npm.cmd test -- --run src/features/workspace/inspector.telemetry.test.tsx src/features/workspace/project-runtime-posture.test.tsx --reporter=dot
PASS — 2 files, 8 tests passed
```

The npm runtime emitted the repository's known Node 27 nightly compatibility
advisory. No provider request, account lookup, invoice download, credential,
or native storage mutation was performed.

## Evidence boundary

This receipt proves deterministic renderer projection behavior against local
fixtures only. Live provider billing/account reconciliation, authenticated
invoice provenance, packaged WebView2 behavior, and native end-to-end cost
writers remain outside this slice.
