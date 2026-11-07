# Native test loader verification — 2026-11-07

## Finding

The desktop unit tests have an explicit, resource-linked Cargo target named
`omnia_native`. This is the supported Windows test entry point. The library
target declares `test = false` in `src-tauri/Cargo.toml`, and
`src-tauri/src/native_test_harness.rs` includes `lib.rs` so it executes the same
native unit-test modules.

`src-tauri/build.rs` passes Tauri's generated `resource.lib` to test targets
through `cargo:rustc-link-arg-tests`. That resource embeds the side-by-side
Common Controls v6 manifest required by the desktop dependency graph.

Forcing Cargo to build the disabled library test with `--lib` produces a
different executable without that resource. Its loader failure does not mean
that the supported native test target is unavailable on this host.

## Direct evidence

### Forced library test

```text
cargo test -p omnia-desktop --lib --offline -- --nocapture
```

Compilation completed, then this process exited before Rust test discovery:

```text
target/debug/deps/omnia_lib-232c7a917caebd4e.exe
exit code: 0xc0000139, STATUS_ENTRYPOINT_NOT_FOUND
SHA-256: 03c818782d045e02cb407350e5d37381984e4ef6f61300169d766af36eb098ec
```

Microsoft Manifest Tool reported that the executable did not contain a
resource section (`c101008c`). `dumpbin /dependents` confirmed a dependency on
`comctl32.dll`. This is a reproducible unsupported test-target path; it is
preserved as failure evidence and is not counted as a test pass.

### Explicit native test

The resource-linked executable produced by the earlier 2026-11-07 native
verification run was inspected directly:

```text
target/debug/deps/omnia_native-54b571f1fa542bca.exe
SHA-256: 1e294344e88e5994b3376b02d1bc20fffb9856ca26c77309290e832d66c74c8a
```

Microsoft Manifest Tool extracted this dependency from the executable:

```xml
<assemblyIdentity type="win32" name="Microsoft.Windows.Common-Controls"
  version="6.0.0.0" processorArchitecture="*"
  publicKeyToken="6595b64144ccf1df" language="*" />
```

Direct launch with `--list` exited successfully and discovered:

```text
672 tests, 0 benchmarks
```

A direct focused launch executed the Rust assertions and returned exit `0`:

```text
--exact workspace_indexer::tests::skips_sensitive_paths_private_keys_and_builtin_directories --nocapture

running 1 test
test workspace_indexer::tests::skips_sensitive_paths_private_keys_and_builtin_directories ... ok
test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 671 filtered out
```

## CI changes

Both `.github/workflows/ci.yml` and `.github/workflows/release.yml` now run an
explicit loader-discovery step before the full native suite:

```text
cargo test --manifest-path src-tauri/Cargo.toml -p omnia-desktop --test omnia_native --all-features -- --list
cargo test --manifest-path src-tauri/Cargo.toml --workspace --all-features
```

The workspace flag ensures the browser, computer, downloader and harness
crate suites run alongside desktop tests. The release workflow runs formatting,
Clippy, loader discovery and tests in separate steps so each native command's
exit code is a gate. YAML parsing and `git diff --check` passed for both edited
workflows.

## Claim boundary and follow-up

This receipt verifies the loader and one named native test for the exact
resource-linked executable above. It does not make a packaged WebView2,
provider, clean-host CI or whole-current-tree test claim.

A fresh `cargo test --test omnia_native --offline` attempted during parallel
implementation on the same working tree encountered incomplete concurrent
LSP and settings edits at compile time. Those failures were reported to the
owners, not changed by this loader audit. Re-run the canonical commands after
the current implementation wave settles before promoting broad native or
current-snapshot completion criteria.

Historical receipts remain unchanged. The correct conclusion is that the
canonical target's Common Controls loader route is implemented and has direct
runtime evidence; forced `--lib` remains a failing diagnostic path.
