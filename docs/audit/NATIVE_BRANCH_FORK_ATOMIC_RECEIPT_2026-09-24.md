# Native branch/fork atomic receipt slice

Status: source-level implementation, native runtime not observed.

This slice closes one narrow run-control gap: a resolved `branch` or `fork`
operation now has a native apply path that creates the child conversation
branch and appends the terminal run-control receipt in one SQLite writer
transaction.

The apply path:

- requires a completed source message visible from the selected source branch;
- resolves and re-checks the immutable source branch cursor against the native
  state-revision journal;
- derives a deterministic child branch ID from the immutable operation ID;
- inserts the child branch with `ON CONFLICT DO NOTHING`, then verifies its
  conversation, parent branch and fork-message binding;
- records the destination branch ID and source cursor in the immutable applied
  operation envelope;
- replays the same destination branch/receipt when a concurrent or retried
  apply reaches the same operation ID.

The source branch remains unchanged and is not auto-activated. No messages,
provider input, credentials, cookies, grants or active execution handles are
copied. The child branch has no destination cursor until it receives its own
native state-revision fact.

Changed surfaces:

- `src-tauri/src/storage.rs`
- `src-tauri/src/run_control.rs`
- `src/lib/desktop.ts`
- `docs/omnia-ultra/schemas/run-control-operation.schema.json`

The Rust unit coverage includes the result-contract check for a destination
branch plus source cursor. `cargo check`, `cargo test`, Tauri launch and
packaged desktop behavior remain unverified because the host currently has no
Rust toolchain on `PATH`.
