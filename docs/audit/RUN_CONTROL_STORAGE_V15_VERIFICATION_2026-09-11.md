# Run-control storage v15 verification receipt

Date: 2026-09-11  
Scope: executable SQLite DDL and persistence guards for the v15 run-control
storage suffix in `docs/storage-schema.sql`.  This receipt is content-free:
it records schema and lifecycle facts without prompts, responses, provider
payloads, credentials, cookies, attachment bytes, or unrestricted local paths.

## Verdict

The independent SQLite storage probe passes against the checked-in schema:

```text
RUN_CONTROL_STORAGE_VERIFY: PASS
```

The probe applies the pre-v15 prefix and v15 suffix incrementally, exercises a
file-backed database, closes and reopens it, and verifies that the receipt rows
remain durable.  It is complementary to the JSON contract verifiers and does
not claim Rust compilation, Tauri IPC behavior, or packaged Windows runtime
evidence.

## Coverage

The probe verifies the five v15 tables:

- `run_control_operations`
- `run_control_operation_events`
- `run_checkpoints`
- `continuation_intents`
- `message_revisions`

It also verifies the expected scope/idempotency/lookup indexes and immutable
or scope-guard triggers.  A minimal valid profile, conversation, branch, run,
attempt and message graph is seeded before inserting one valid row in each
receipt family.

The deterministic assertions include:

1. incremental DDL application succeeds;
2. all five tables and expected indexes/triggers exist;
3. valid operation, checkpoint, continuation-intent and message-revision rows
   can be inserted;
4. duplicate idempotency keys are rejected;
5. immutable receipt updates and deletes are rejected;
6. cross-profile, cross-conversation and cross-branch inserts are rejected;
7. a failed transaction rolls back without leaking a partial receipt;
8. close/reopen preserves all receipt rows;
9. executable v15 SQL does not persist forbidden raw/secret field names.

## Reproduction

Run from the repository root:

```powershell
python scripts/verify-run-control-storage.py
npm.cmd run verify:run-control-storage
```

The second command is the package-level alias used by the CI
`storage-contract` job.  The verifier reports `nativeRuntime:
not-tested-by-this-probe` intentionally.

## Boundary and remaining evidence

This receipt proves SQLite DDL behavior only.  The current host does not have
`cargo`, `rustc`, `rustfmt`, or `rustup`, so the following remain
`UNAVAILABLE / UNVERIFIED` here:

- Rust migration execution through `apply_v15`;
- native storage persistence/reopen/replay;
- Tauri command registration and IPC hydration;
- renderer run-control projections;
- packaged Windows restart recovery and concurrency;
- durable user queue, steer, Btw and scheduler behavior.

The durable user queue must remain a separate model from
`generations.state = queued|running`; the latter is the prepared provider-run
lifecycle and is converted to failed on app restart by recovery logic.

## Related gates

```text
python scripts/verify-run-control-schema.py
python scripts/verify-run-control-contract.py
python scripts/verify-provider-attempt-lineage-schema.py
python scripts/verify-state-revision-schema.py
python scripts/verify-run-control-storage.py
```

All five commands pass at the 2026-09-11 source snapshot.  Their output is
static/schema or SQLite evidence and must not be upgraded to a native-runtime
claim until the Rust and packaged-Windows gates have run on a supported host.
