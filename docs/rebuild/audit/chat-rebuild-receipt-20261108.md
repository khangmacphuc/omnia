# New chat rebuild receipt

Cycle: rebuild-0001 · owner: `/root/rebuild_chat` · date: 2026-11-08

## Source inspected

- `src-tauri/src/harness_bridge.rs`: native session create/read/update/send/steer/interrupt/approval commands and `omnia-agent` event payload.
- `src-tauri/src/harness_store.rs`: durable `AgentSessionSummary`, message and replay snapshots.
- `src-tauri/crates/omnia-harness/src/agent.rs`: stream, approval and terminal event contracts.
- `src-tauri/crates/omnia-harness/src/model.rs`: provider-neutral message/block/stream contracts.
- New open-source research: [Goose session management](https://github.com/block/goose/blob/main/documentation/docs/guides/sessions/session-management.md) and [Goose permissions](https://github.com/aaif-goose/goose/blob/main/documentation/docs/guides/managing-tools/goose-permissions.md), queried 2026-11-08. These were used only for behavioral comparison: multi-session continuity and per-session permission mode. The native Omnia contract remains authoritative.

## Implemented

- `src/rebuild/chat/chat-controller.ts`: independent hook/controller with session list, active selection, durable draft/active pointer, native bootstrap, event subscription before sends, replay load, streaming text/tool summaries, approval requests, steer, interrupt, model/effort/permission updates and explicit disconnected/partial states.
- `src/rebuild/chat/chat-view.tsx`: original technical chat surface with session strip, non-project draft state, suggestions, status, approval card, per-session model/effort popovers, copy action and keyboard send.
- `src/rebuild/chat/chat.css`: scoped new visual system; no legacy UI imports or tokens.
- `src/rebuild/chat/chat-view.test.tsx`: semantic behavior tests for non-project honesty, suggestions and approval routing.

## Verification

| Check | Result | Boundary |
| --- | --- | --- |
| `git diff --check -- src/rebuild/chat` | PASS | whitespace only |
| Chat view tests | pending root gate | test file added; Vitest must run from root |
| Native chat runtime | partial | existing native commands require an existing absolute `cwd` |
| Non-project native send | blocked | no native managed projectless workspace command exists yet; UI refuses to fabricate a response or select a recent folder |

## Remaining work

1. Root must import this controller/view from the new shell and add the new CSS variables.
2. Native owner must add an explicit managed non-project workspace contract, or preserve the honest draft-only state as a documented blocker.
3. A native packaged run with a real provider and permission approval still needs evidence; renderer tests do not prove provider execution.
