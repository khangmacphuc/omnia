# Native ask-user implementation receipt

Owner: `/root/ask_user_native_impl`. Status: implemented; native unit verified; packaged integration pending.

## Contract and bounded plan

1. Each active native run owns one question broker. Its native run UUID and session
   ID bind every generated request UUID. The reply command validates the current
   session/run and rejects stale or already consumed request IDs.
2. Install a response sender before publishing a request. Persist requested and
   terminal question events in the existing append-only harness event journal
   before publishing or acknowledging delivery. A journal failure cannot silently
   convert to an accepted answer.
3. Keep live reload answerable through `agent_session_read.pendingQuestions` from
   the current broker, while process restart retains audit events without reviving
   senders. Interrupt and run finalization close pending questions exactly once.

The broker keeps its state lock through the request journal commit. That makes
interrupt and answer wait for request publication, so a terminal event cannot
be persisted ahead of its corresponding request.

Session deletion follows the same boundary: it cancels the run, clears approval
senders, closes pending questions with `reason: "session_deleted"`, and only then
deletes the session storage row. A close journal failure aborts deletion rather
than silently losing the terminal receipt; the run remains reachable until the
close succeeds, then is removed from the active-run map.

`pending()` now checks both the cancellation token and broker closed flag while
holding the state lock, preventing a renderer snapshot from exposing a question
after cancellation wins the lifecycle race.

## Interfaces proposed to root

- Agent tool: `ask_user` with `{prompt, options?, recommended?}`.
- Request event: `{type:"ask_user", id, requestId, runId, toolUseId, prompt,
  options, recommended}` inside the normal `{sessionId,event,sequence}` envelope.
- Response command: `agent_user_input({request:{sessionId,requestId,runId?,answer}})`.
  `answer: null` means explicit user cancellation; nonempty string supports a
  selected option or free text. Existing clean-room payload remains compatible.
- Terminal event: `ask_user_resolved` with request/run identity and terminal status.
- Acknowledgement contains identity/status, and does not claim that the model
  already consumed the answer.

## Test-first state

Ten focused broker/tool tests were authored before production implementation in
`src-tauri/crates/omnia-harness/src/user_input/tests.rs`. They cover ordered durable
delivery, free text/cancel, stale/duplicate/wrong-run rejection, close cleanup,
validation bounds and pending limits, request/answer journal failure, context
cancellation and session ownership.

The serialized native test slot has now been exercised by root. The focused
receipt is [ask-user-native-cycle5.txt](ask-user-native-cycle5.txt), with a
machine-readable companion at
[ask-user-native-cycle5.json](ask-user-native-cycle5.json). It records:

```text
cargo test --manifest-path src-tauri/Cargo.toml -p omnia-harness user_input -- --nocapture
exit=0
10 passed; 0 failed; 313 filtered out
```

The receipt hashes the exact source revisions listed below. This proves
provider-neutral broker/tool behavior only; it does not prove packaged Tauri
command dispatch, Windows UI delivery, live provider execution, or browser/
computer runtime behavior.

The native command uses a nested optional answer (`Option<Option<String>>`) so
JSON omission is rejected while explicit `answer: null` remains the user-cancel
acknowledgement. A bridge deserialization test covers omission, null, free text,
`runId`, and unknown-field rejection. A store-backed test also asserts that the
request and resolution rows are replayable in order after reopening the SQLite
store. These tests are covered by the focused native receipt above.

## Static verification receipt

Recorded at `2026-11-08 05:19:51 UTC` in the active publish worktree. The later
cycle5 native receipt is authoritative for the source hashes in this table and
for Cargo execution; this section remains the earlier static-format evidence.

```text
rustfmt --edition 2021 --check \
  src-tauri/crates/omnia-harness/src/user_input.rs \
  src-tauri/crates/omnia-harness/src/user_input/tests.rs \
  src-tauri/src/harness_bridge.rs
exit=0

git diff --check -- \
  src-tauri/crates/omnia-harness/src/user_input.rs \
  src-tauri/crates/omnia-harness/src/user_input/tests.rs \
  src-tauri/crates/omnia-harness/src/lib.rs \
  src-tauri/src/harness_bridge.rs \
  src-tauri/src/lib.rs \
  docs/rebuild/receipts/native-ask-user-implementation-20261108.md
exit=0
```

Current SHA-256 hashes:

| Path | SHA-256 |
| --- | --- |
| `src-tauri/crates/omnia-harness/src/user_input.rs` | `FDA59CF273AB5EEBABB29D23631BC8FFDA47AD9A7C17D12D89175809EA21B6FF` |
| `src-tauri/crates/omnia-harness/src/user_input/tests.rs` | `8AFFA4C7BF72788BB810D9C3200B8EC7CC642C064E696896EF888CCD66161EE1` |
| `src-tauri/src/harness_bridge.rs` | `045BC0B9B8FE590998FCDC772D001E353FAD81A5FA9E553685FE06E6CE58DA3B` |
| `src-tauri/crates/omnia-harness/src/lib.rs` | `83D8D9589962B4C036C29D63ED9418A2A5321B679508806C017080FDBD045C7C` |
| `src-tauri/src/lib.rs` | `7DC1B9ACA25722B4C6F7E936171264137D1C09DEA7F69FFEEE67912028381AF2` |

The receipt intentionally does not include its own hash; the canonical cycle
manifest hashes this document after it is finalized.

## Evidence boundary

Focused provider-neutral broker/tool tests are now green in the cycle5 receipt.
Pending evidence is the actual desktop command integration/loader test,
packaged reload/UI delivery, and provider tool execution. Source files or unit
test presence do not satisfy CHAT-008 by themselves. The canonical DoD and
product completion state remain owned by root.
