# Native run-journal vertical slice

Status: implemented in the current source tree. The rebuilt `omnia_native`
test executable directly passed the named bounded telemetry-read test on this
Windows host. The full native suite, packaged application and CI lane remain
separate unverified gates.

## Scope

The provider stream now follows one durable path:

```text
prepared provider input
  -> atomic dispatch transition + journal facts
  -> provider response accepted + run.started facts
  -> text/reasoning/usage fact + projection transaction
  -> terminal fact + finalized message/run/attempt transaction
  -> best-effort renderer notification
```

The SQLite journal and materialized projections are authoritative. Renderer
notifications are advisory and can be dropped; the renderer can replay the
durable journal after reconnect or restart.

## Renderer replay wiring (August 14, 2026)

The renderer now consumes the native journal through a fixed-watermark replay
path instead of reading only the first page:

- `src/features/workspace/run-journal-projection.ts` provides a pure event,
  text/reasoning, terminal and coverage projection plus monotonic cursor guards;
- `src/features/workspace/run-journal-sync.ts` follows `nextCursor` until the
  native watermark is complete and applies the page idempotently;
- `src/features/workspace/store.ts` keeps event IDs, cursors and replay coverage
  separate from the materialized conversation projection;
- `src/App.tsx` rehydrates recent runs with `baseline: true`, so journal text
  deltas are not appended a second time to already-hydrated SQLite messages;
- `src/features/workspace/composer.tsx` replays a run after reconnect-like
  provider events, preserving the native journal as the recovery source.

Outcome-unknown and recovery facts remain warning states in the inspector;
definitive provider/run failures remain failed. Partial or recovered journal
coverage is retained in the renderer store for a later explicit coverage
indicator and must not be presented as complete telemetry.

## Renderer telemetry projection contract (August 14, 2026)

`src/features/workspace/request-inspector-projection.ts` now contains a pure,
display-safe projection for an already-normalized provider-attempt telemetry
record. It covers route identity, requested/effective effort, timing marks,
visible/total throughput, usage coverage, quota windows, retry lineage, cost
statement layers and fork/branch lineage. Missing values remain absent and are
classified by coverage; the projection does not read prompt/response content,
credentials or arbitrary provider payloads. This is a renderer contract and
focused test fixture, not evidence that the native persistence ledger or live
inspector is complete.

Focused renderer evidence from this continuation:

```text
npm run typecheck                                      PASS
npm run test -- src/features/workspace/run-journal-projection.test.ts  3/3 PASS
npm run test -- src/features/workspace/conversation-catalog.test.ts    3/3 PASS
npm run test -- src/features/workspace/store.test.ts                    10/10 PASS
npm run test -- src/features/workspace/request-inspector-projection.test.ts 5/5 PASS
```

These are renderer/unit results only; they do not replace the native Windows
test-process evidence below.

## Provider-stream usage-ledger connection (August 14, 2026)

The initial provider-stream token accounting path is now bound to the native
append-only usage ledger rather than being only a mutable message projection.
`Storage::journal_usage` performs all of the following in one SQLite
transaction:

- preserves the legacy assistant-message token columns as a compatibility
  projection;
- creates one immutable `run_usage_ledger` observation scoped to the exact
  run, attempt and profile;
- records provider-reported input, cache-read input, output and reasoning
  counters without fabricating cache-write or visible-output counters;
- labels the early stream snapshot `provider-incremental`, non-authoritative
  and `partial`, because it is not a final billing reconciliation;
- creates a content-free opaque stream-identity hash from the frozen attempt,
  monotonic attempt observation number, timing and counters; and
- emits the same-transaction `usage.updated` journal fact with the stable
  `usageEntryId` so replay can retain an exact ledger-to-event link.

The focused native test extends the existing journal vertical slice to assert
message compatibility fields, ledger lineage/sequence/counter semantics and
the `usage.updated.payload.usageEntryId` linkage. `cargo check --all-targets`
compiled the updated native code and test target on August 14, 2026. The
rebuilt `omnia_native` executable then directly discovered and passed the named
test. The exact binary hash, command and result are retained in
`docs/audit/NATIVE_TELEMETRY_READ_TEST_RECEIPT_2026-08-14.md`. This is native
runtime verification for that single bounded test only; it does not turn the
full ledger, telemetry or retry product surface into a verified claim.

Deliberate limits of this bounded slice:

- no native timing observation is yet captured from dispatch through terminal;
- no provider-final, invoice, price-snapshot or cost-statement path is wired;
- no provider quota/health observation is appended from live response headers;
- the renderer inspector still consumes a display-safe contract/fixture rather
  than replayed native telemetry rows; and
- the opaque identity is a local normalized stream-observation identity, not a
  claim that every provider exposes a remote event ID.

## Native implementation

- `src-tauri/src/provider_gateway.rs`
  - binds the stream to `run_id`, `attempt_id`, and the immutable frozen input
    receipt;
  - records provider acceptance evidence (`false`, `true`, or `unknown`);
  - routes accepted responses through `journal_provider_started`;
  - persists text, reasoning summaries, and usage through journal methods;
  - treats renderer event delivery as best effort;
  - records cancellation, transport interruption, protocol errors, and
    outcome-unknown failures without rewriting an unrelated run.
- `src-tauri/src/run_journal.rs`
  - enforces contiguous lifecycle vocabulary and terminal uniqueness;
  - atomically updates projections and appends facts;
  - supports pre-dispatch failure, accepted/unknown provider evidence, and
    cursor replay with a fixed watermark.
- `src-tauri/src/storage.rs`
  - keeps legacy helper signatures for compatibility while routing them through
    the journal transaction boundary;
  - preserves restart recovery and explicit outcome-unknown semantics.

## Focused test coverage in source

The storage test module includes assertions for:

- ordered lifecycle facts from preparation through completion;
- atomic assistant delta and usage projection updates;
- outcome-unknown terminalization distinct from definitive failure;
- fixed-watermark cursor replay and resume;
- restart recovery facts and exact attempt lineage.

Recommended commands from the repository root:

```powershell
$env:CARGO_TARGET_DIR = Join-Path $env:LOCALAPPDATA 'OmniaGoalResume\target'
cargo fmt --manifest-path src-tauri\Cargo.toml --all --check
cargo check --manifest-path src-tauri\Cargo.toml --all-targets
cargo test --manifest-path src-tauri\Cargo.toml storage::tests::legacy_run_helpers_materialize_an_ordered_durable_journal -- --exact --nocapture
cargo test --manifest-path src-tauri\Cargo.toml storage::tests::outcome_unknown_failure_is_distinct_and_terminal_in_the_journal -- --exact --nocapture
cargo test --manifest-path src-tauri\Cargo.toml storage::tests::journal_replay_uses_a_fixed_watermark_and_resumes_from_cursors -- --exact --nocapture
```

If a Tauri test executable fails before the harness starts with
`STATUS_ENTRYPOINT_NOT_FOUND`, record the exact binary and result as a
host/runtime blocker and retain successful format/check evidence. Do not mark
a behavioral test as passed without a test-process result; conversely, do not
let an older target's failure erase a newer, hash-identified direct pass.

## Follow-up work

1. Add a platform CI lane that runs the native test binary on a supported
   Windows image and stores the exact test-process receipt.
2. Add native timing, provider-final/invoice cost, quota and health facts, then
   wire the renderer projection to replayed native observations rather than
   fixture-only records.
3. Add provider retry/fallback orchestration without changing the frozen
   request or acceptance evidence.
