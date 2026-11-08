# Cycle 8 packaged ask-user audit

- **Cycle:** `rebuild-0008`
- **Criterion:** `CHAT-008`
- **Auditor:** `/root/cycle8_packaged_ask_user`
- **Audit time:** `2026-11-08T15:37:19+07:00`
- **Checkout:** `C:/Users/khang/.codex/worktrees/omnia-ui-rebuild/publish-worktree`
- **Scope:** static command boundary, renderer behavior, native broker tests, packaged/runtime availability.

## Evidence inspected

| Layer | Evidence | Observation | Claim boundary |
|---|---|---|---|
| Native broker | `src-tauri/crates/omnia-harness/src/user_input.rs` | Typed `QuestionBroker` emits `ask_user`, validates option/free text answers, rejects stale/wrong/duplicate answers, journals resolution and closes on cancellation/run end. | Provider-neutral crate behavior only. |
| Native Tauri command | `src-tauri/src/harness_bridge.rs:1258-1300` | `AgentUserInputRequest` uses `deny_unknown_fields`, distinguishes omitted answer from explicit `null`, validates session/request/run and maps errors; `agent_user_input` is marked `#[tauri::command]`. | Source-level command exists; no packaged invocation proof in this audit. |
| Command registration | `src-tauri/src/lib.rs:214` | `harness_bridge::agent_user_input` appears in `tauri::generate_handler!`. | Registration is static evidence, not Windows runtime delivery. |
| Renderer stream handling | `src/rebuild/chat/chat-controller.ts:247-264` | `ask_user` and resolution events map into per-session question state; event listener is installed before sends through the controller lifecycle. | Renderer controller behavior; native/live boundary still separate. |
| Renderer submission | `src/rebuild/chat/chat-controller.ts:405-423` | Answers invoke `agent_user_input`, reject preview/local-only mode, keep question on command failure, and surface explicit error. | Correct capability-gated behavior in source; no packaged UI capture. |
| Renderer UI | `src/rebuild/chat/chat-view.tsx` | Recommended option buttons, free-text input/submit and explicit Cancel are rendered; no invented answer is submitted when disconnected. | Renderer preview/UI source only. |
| Renderer tests | `src/rebuild/chat/ask-user-envelope.test.ts`, `src/rebuild/chat/chat-view.test.tsx` | Typed envelope and interaction tests cover selection, free text, cancellation, stale/duplicate/expired requests. | Test evidence is not packaged Windows evidence. |
| Native bridge tests | `src-tauri/src/harness_bridge.rs` tests and `docs/rebuild/receipts/ask-user-native-cycle5.json` | Native broker persistence and explicit-null contract were previously exercised (10 native user-input tests in receipt). | Native crate/bridge test evidence; not packaged Tauri command/UI or live provider evidence. |
| Command parity/ACL | `npm.cmd run check:command-parity`; `npm.cmd run check:acl` | Command parity passed: 189 renderer calls, 192 registered commands, 192 production definitions. ACL passed: one main webview and seven reviewed permissions. | Static safety checks only. |
| Focused renderer tests | `npm.cmd exec -- vitest run src/rebuild/chat/ask-user-envelope.test.ts src/rebuild/chat/chat-view.test.tsx --reporter=dot` | 2 files, 16 tests passed. | Browser/renderer test environment, not packaged desktop. |
| Packaged artifacts | `src-tauri/target/release/bundle/msi`, `src-tauri/target/release/bundle/nsis` | No release MSI/NSIS artifact was present at audit time (`Test-Path` false). | Packaged Windows UI could not be exercised from this checkout. |

## Required behavior versus current evidence

| Acceptance item | Status | Reason |
|---|---|---|
| Multiple recommended options and free text produce one validated answer | **Partial evidence** | Renderer and native broker source/tests cover this behavior; no packaged command/UI run. |
| Session/run/request binding and explicit cancellation | **Evidence present at source/test level** | Native request parsing and broker tests cover wrong run, missing answer, explicit null cancel, stale/duplicate lifecycle. |
| Packaged Tauri command delivery | **Blocked** | No MSI/NSIS artifact in this checkout and no Tauri Windows IPC trace proving `agent_user_input`. |
| Windows UI delivery | **Blocked** | No packaged UI screenshot/automation capture showing an ask-user request, selection/free text/cancel and resulting receipt. |
| Live provider ask-user execution | **Blocked** | No configured live provider execution receipt is present; provider-neutral harness evidence cannot establish this. |

## Reproduction commands and fresh results

```text
npm.cmd exec -- vitest run src/rebuild/chat/ask-user-envelope.test.ts src/rebuild/chat/chat-view.test.tsx --reporter=dot
PASS — 2 files, 16 tests

npm.cmd run check:command-parity
PASS — 189 renderer calls, 192 registered commands, 192 production definitions

npm.cmd run check:acl
PASS — one main webview capability, 7 reviewed permissions

Test-Path src-tauri/target/release/bundle/msi
False

Test-Path src-tauri/target/release/bundle/nsis
False
```

## Blocker and actionable resolution

`CHAT-008` remains **Partial**, not Done. The missing evidence is a packaged Tauri run on Windows with a real pending question and a provider-neutral or configured provider execution. The next attempt should:

1. Build the release bundle with the serialized Cargo slot and record exact artifact hashes.
2. Launch the packaged application under the approved Windows UI automation boundary.
3. Start a run using a deterministic provider fixture or configured provider, capture the ask-user event in the packaged app, select a recommended option or submit free text, and capture the native `QuestionReceipt` plus persisted replay event.
4. Repeat explicit Cancel and stale/wrong-run negative cases in the packaged boundary.
5. Keep live-provider status separate; if no provider is configured, record that as an external blocker rather than promoting the provider-neutral result.

No credentials, browser profiles, cookies, private chat history or external live UI were accessed.
