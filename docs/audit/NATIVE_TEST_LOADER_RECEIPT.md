# Native test loader blocker receipt

Observation date: August 14, 2026  
Host: current Windows development host  
Evidence class: runtime blocker receipt

## Observed result

The Rust test target compiled successfully and Cargo attempted to start this
native test process:

```text
C:\Users\khang\AppData\Local\OmniaGoalResume\target-usage-ledger\debug\deps\omnia_lib-22bb966b078712ac.exe
storage::tests::legacy_run_helpers_materialize_an_ordered_durable_journal
--exact --nocapture
```

The process exited before the Rust test harness discovered or executed the
selected test:

```text
exit code: 0xc0000139, STATUS_ENTRYPOINT_NOT_FOUND
```

The complete local command log was `telemetry-ledger-test.log` with SHA-256:

```text
3164bf02e61c407a2266e0f32cb1a3be1a1c096678175dcfce1bce61a30c9dd8
```

That local `.log` file is intentionally ignored by Git. This compact receipt is
the version-controlled evidence pointer and preserves the exact claim boundary.

## Claim boundary

This receipt proves only that this host had a native executable loader failure
after the test target compiled. It does not prove that the selected historical
journal test passed, and it does not prove the newer run-telemetry read test
passed. Native behavior remains unverified until a test executable starts,
discovers the intended test and reports an actual passing result.

## Recheck: resource-linked run-telemetry read target

Observation date: August 14, 2026  
Evidence class: direct native-executable launch

The current build script emits `cargo:rustc-link-arg-tests` for Tauri's
generated `resource.lib`. Its build-script output therefore shows that the
test-link resource was requested. That is an implementation attempt, not proof
that Windows can load the test executable.

The following exact, content-free telemetry test was then launched directly
from the current target directory:

```text
C:\Users\khang\AppData\Local\OmniaGoalResume\target-run-telemetry-read\debug\deps\omnia_lib-22bb966b078712ac.exe
--exact storage::tests::run_telemetry_read_is_attempt_scoped_bounded_and_content_free
--nocapture
```

The executable had SHA-256:

```text
A573C08F21C942F1F87E8F910D535706ABDF44844424DD9AD4BCE7F88F7C4646
```

It exited before Rust test discovery with signed Windows exit code
`-1073741511`, which is `0xC0000139 (STATUS_ENTRYPOINT_NOT_FOUND)`. The
resource-link argument is therefore **not yet a verified loader fix** on this
host. The selected run-telemetry behavior remains compiled/source-inspected
only, not native-runtime verified.

The exact failure mode still needs a minimal reproducer and loader/dependency
inspection on a supported Windows CI lane. Do not change a capability claim to
native-runtime Verified until the test harness names the selected test and
reports its pass result.
