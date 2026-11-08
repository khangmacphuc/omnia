# Chat slice evidence — Cycle 9

- Scope: clean-room renderer chat controller/view only.
- Native ask-user wire remains capability-gated; this receipt does not claim packaged Tauri or live provider completion.

## Implementation

- Added monotonic `ChatEventGate` keyed by durable per-session sequence.
- Dropped duplicate/out-of-order events and late events from a prior run ID.
- Captured native ask-user `runId`, `revision`, and `allowFreeText` metadata.
- Sent `runId` back with `agent_user_input` when the native event supplies it.
- Cleared pending questions on terminal run events to avoid stale prompts.
- Preserved explicit disconnected/non-project behavior and no fabricated assistant reply.

## Verification

```text
npm.cmd test -- --run src/rebuild/chat/chat-controller.test.ts src/rebuild/chat/ask-user-envelope.test.ts src/rebuild/chat/chat-view.test.tsx --reporter=dot
PASS — 3 files, 20 tests

npm.cmd run typecheck:app -- --pretty false
PASS — exit 0

git diff --check -- src/rebuild/chat/chat-controller.ts src/rebuild/chat/chat-controller.test.ts
PASS — no content errors (PowerShell only reports LF/CRLF normalization warning)
```

## Source hashes
- `src/rebuild/chat/chat-controller.ts` — `c8492e3bc61fca68fe94e8c962e17256534288a369adf048934cc6b8be3a4744`
- `src/rebuild/chat/chat-controller.test.ts` — `842488610c99fe08e42881915940a4529c3474d94def727d8d610ddf994a3bfa`
- `src/rebuild/chat/ask-user-envelope.ts` — `f2e3788d732d8e03590f932a84e35b5a7f9b22159c06fbf650ec05d09779cad0`
- `src/rebuild/chat/ask-user-envelope.test.ts` — `8e57e88aa28ffb5a7be42842505e2f75941bccecccecdff98ac926fce9846e8a`
- `src/rebuild/chat/chat-view.tsx` — `6ed807e0f4ce0987c19d33a98523715cd8e6544bc04b831aae66f654d7b085b7`
- `src/rebuild/chat/chat-view.test.tsx` — `9029b5b387bbf8687989a457e81d2e392beac72cf6e4207a4901ffd846ab68f3`

## Claim boundary

- Source and renderer behavior are verified.
- Native broker unit behavior is covered by existing native receipts, but packaged IPC invocation, Windows UI automation and live provider ask-user execution remain open.
- No legacy renderer import or external live editor/embed was added.
