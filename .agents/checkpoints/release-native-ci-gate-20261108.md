# Release native CI gate — 2026-11-08

## Snapshot

- Worktree: `D:/Omnia/publish-worktree`
- Native integration target: `src-tauri/tests/omnia_native`
- Full audit inventory is not present in this release checkout; the catalog
  fallback gate is covered by `upstream-catalog-reproducibility-20261108.md`.

## Verification

```text
cargo check --manifest-path src-tauri/Cargo.toml --offline
PASS

cargo test --manifest-path src-tauri/Cargo.toml -p omnia-desktop \
  --test omnia_native --all-features --offline -- --list
PASS — 713 tests discovered, 0 benchmarks

npm.cmd run check:command-parity
PASS — 188 renderer calls, 191 registered commands, 191 production definitions

npm.cmd run check:upstream-catalog
PASS — 55 modules from compact release snapshot
```

The legacy `cargo test -p omnia-desktop --lib` target remains excluded by the
manifest (`test = false`) and is tracked as a separate environment blocker; it
does not replace the supported integration target above.
