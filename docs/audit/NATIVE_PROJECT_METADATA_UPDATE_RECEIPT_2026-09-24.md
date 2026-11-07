# Native Project metadata update slice

Observation date: September 24, 2026  
Evidence class: source/static contract plus renderer bridge test  
Scope: complete editable Project metadata snapshot (`name`, `description`,
`instructions`)

## Implemented boundary

- `Storage::update_project_metadata` updates one live Project in an SQLite
  `IMMEDIATE` transaction.
- The request is restricted to `profile_default`, rejects deleted/missing
  Projects, normalizes bounded text, and uses `expectedUpdatedAtMs` as an
  optimistic-concurrency precondition.
- The SQL `UPDATE` repeats the timestamp predicate, so a concurrent writer
  cannot be silently overwritten.
- Unchanged metadata is a no-op and returns the existing snapshot. Changed
  metadata receives a monotonic `updatedAtMs`.
- `project_update` is registered in the guarded Tauri command handler and the
  TypeScript bridge sends it through the established `x-omnia-session` path.

## Focused evidence

```text
npm.cmd run test -- src/lib/desktop.native-session.test.ts --reporter=dot
Test Files  1 passed (1)
Tests       16 passed (16)

npm.cmd run check:command-parity
Tauri command parity OK: 61 renderer calls, 61 registered commands,
61 production command definitions.
```

Native storage regression tests were added for trimming/CAS, unchanged no-op,
invalid precondition, and missing Project handling. They were not compiled or
executed in this environment because `cargo`, `rustc`, and `rustfmt` are not
available on `PATH`.

## Claim boundary

This slice does not create a Project Twin revision, mutation receipt, archive
state, icon/color/default-provider fields, workspace-grant mutation, or
renderer UI save flow. Browser preview remains separate from native persistence;
the native runtime and packaged desktop remain `not-tested-by-this-probe`.
