# Native telemetry-read focused test receipt

Observation date: August 14, 2026  
Host: current Windows development host  
Evidence class: direct native-executable launch  
Scope: one bounded, content-free telemetry-read storage test

## Command and binary

The test target was rebuilt from the current checkout with the Windows
resource library emitted by `tauri-build` linked into the explicit Cargo test
target by `src-tauri/build.rs`:

```text
cargo test --manifest-path src-tauri\Cargo.toml \
  storage::tests::run_telemetry_read_is_attempt_scoped_bounded_and_content_free \
  -- --exact --nocapture
```

The resulting test executable was launched directly so that the operating
system loader and the Rust test harness were both exercised without relying on
a truncated Cargo transcript:

```text
C:\Users\khang\AppData\Local\OmniaGoalResume\target-run-telemetry-read\debug\deps\omnia_native-c2480af780b6ed15.exe \
  --exact storage::tests::run_telemetry_read_is_attempt_scoped_bounded_and_content_free \
  --nocapture
```

Executable SHA-256:

```text
33834AD8738ADD72514B1D3E2E86F04661C0EE4A0490FFC5B053E01E0F10F583
```

## Observed result

```text
running 1 test
test storage::tests::run_telemetry_read_is_attempt_scoped_bounded_and_content_free ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 190 filtered out; finished in 0.09s

NATIVE_FOCUSED_DIRECT_EXIT=0
```

The executable loaded successfully, discovered the selected test, executed
its assertions, and returned process exit code `0`. This is direct native
runtime evidence that the Common Controls v6 loader failure is resolved for
this rebuilt `omnia_native` test target.

## Claim boundary

This receipt verifies only the named focused test on this host and binary. It
does not verify the entire Rust test suite, the packaged application, a clean
CI image, or the broader telemetry/retry/fallback product capability. The test
proves the bounded, attempt-scoped, content-free telemetry read behavior and
its loader path; native timing, final/invoice cost, quota/health, retry/fallback
orchestration, and full harness event coverage remain separate gates.

The earlier `0xc0000139 (STATUS_ENTRYPOINT_NOT_FOUND)` observation in
`NATIVE_TEST_LOADER_RECEIPT.md` remains valid as historical evidence for the
pre-fix target. It must not be used to claim that this current focused target
is still blocked, while the older receipt must not be rewritten as if the
historical failure had not occurred.
