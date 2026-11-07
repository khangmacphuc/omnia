# Native test loader current receipt — 2026-11-08

## Scope

This receipt records a fresh Windows run of the supported desktop native test
target on the current Omnia checkout. It is intentionally separate from the
historical `--lib` failure receipt: `omnia-desktop` declares `test = false` for
its library target, so the explicit `omnia_native` integration target is the
authoritative loader path.

## Loader discovery

Command:

```text
cargo test --manifest-path src-tauri/Cargo.toml -p omnia-desktop --test omnia_native --all-features -- --list
```

Result:

```text
exit code: 0
Running src-tauri\\native_test_harness.rs
711 tests, 0 benchmarks
```

The executable launched by Cargo was:

```text
src-tauri\\target\\debug\\deps\\omnia_native-54b571f1fa542bca.exe
```

SHA-256:

```text
7a798734e465fa2241b9ad48495bdfc50794d681e7f3db76ea0155aef51f97f9
```

The run emitted only Rust `dead_code` warnings. It did not emit
`STATUS_ENTRYPOINT_NOT_FOUND` and reached Rust test discovery successfully.

## Focused runtime proof

Command:

```text
cargo test --manifest-path src-tauri/Cargo.toml -p omnia-desktop --test omnia_native --all-features workspace_indexer::tests::skips_sensitive_paths_private_keys_and_builtin_directories -- --exact --nocapture
```

Result:

```text
exit code: 0
1 passed; 0 failed; 710 filtered out
```

## Claim boundary

This receipt proves that the explicit resource-linked native test target
compiled, loaded, discovered 711 tests, and executed the named focused test on
this Windows host. It does not claim that the unsupported
`cargo test -p omnia-desktop --lib` path is valid, nor does it prove a packaged
installer, clean-host WebView2 runtime, provider request, or the full release
workflow. The CI workflow should continue to use `--test omnia_native` for the
loader gate and run the workspace suite separately.
