# Prompt-navigation domain-slice receipt — September 14, 2026

## Scope

This receipt covers the local TypeScript/domain foundation for message-backed
prompt navigation. It is an implementation-progress receipt, not a shipped
navigation capability or native-runtime acceptance receipt.

The slice deliberately resolves only targets that can be proven from the
current in-memory conversation projection. It does not fabricate native
evidence for artifacts, sources, citations, tools, agents, runs, attempts,
tasks, PDF regions, spreadsheet ranges, slides, or media timestamps.

## Working-tree implementation observed

- `src/domain/prompt-navigation.ts` defines bounded `JumpTarget`, `JumpAnchor`,
  search-filter and resolution contracts.
- Message-backed targets cover user prompts, assistant responses, message
  revisions, first/last message, first/latest visible output, next/previous
  prompt, and bounded text/filter queries.
- Target creation validates conversation and branch scope, records a bounded
  content-free semantic fingerprint, preserves an optional source revision and
  native event cursor, and never stores full prompt/response content in the
  navigation record.
- Resolution follows the selected branch projection, permits inherited targets
  that are visible on a child branch, rejects unrelated branches, and returns
  typed stale results for explicit stale markers, hidden messages, superseded
  messages, fingerprint drift, and no-match queries/relative targets.
- Search and adjacency are bounded and deterministic. Provider connection,
  model profile, provider model, producing run, role, status and creation-time
  filters are accepted only as local message attribution data.
- `src/domain/index.ts` exports the domain slice for future renderer/native
  adapters.

## Same-snapshot focused verification

Commands were run from `C:\Users\khang\source\repos\omnia` on September 14,
2026:

```text
npm.cmd run typecheck -- --pretty false
PASS

npx.cmd vitest run src/domain/prompt-navigation.test.ts `
  --testTimeout=30000 `
  --maxWorkers=1 `
  --minWorkers=1 `
  --reporter=verbose
PASS — 1 test file, 9 tests

node docs/omnia-ultra/tools/validate-conversation-navigation.mjs --json
PASS — ok=true, operation fixtures=2, batchFixtures=3, errors=[]
```

The conversation-navigation validator result is shared-schema/queue-contract
evidence only; it is not evidence that a durable queue, steer, Btw, scheduler,
lease, recovery or execution path exists.

## Explicit limitations

The current slice does not provide:

- native durable jump-target persistence, state-revision cursor authority,
  native IPC, startup hydration or cross-process replay;
- renderer jump palette, transcript minimap, timeline markers, browser-style
  back/forward history, bookmarks, deep links, scroll anchoring, destination
  highlighting or screen-reader navigation announcements;
- artifact/source/citation/tool/agent/run/attempt/task target indexes;
- PDF page/region, spreadsheet range, slide, audio/video timestamp or other
  non-message target adapters;
- packaged Windows/Tauri or native Rust compilation/runtime evidence.

The `eventCursor` falls back to the local message sequence when a native cursor
is not supplied. Native state-revision hashes and cursors remain the future
authority for durable cross-process replay. The full requirement target remains
`verified` in `goal/requirements.json` because that field describes the desired
end state, not current implementation truth.

## Truthful status

**Partial — tested local/domain resolver only.** The next gate is a native
durable target record/IPC/startup-hydration slice followed by renderer
jump-palette, minimap, history, deep-link, accessibility and non-message target
integration. Do not promote `OMNIA-CAP-JUMP-PROMPT` to `verified` or claim the
full navigation UI from this receipt.
