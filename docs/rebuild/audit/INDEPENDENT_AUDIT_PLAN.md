# Independent audit plan — rebuild-0001

Reviewer: `/root/rebuild_independent_audit`  
Timestamp: 2026-11-08 Asia/Bangkok  
Scope: governance, original renderer boundary, non-project session contract,
per-session settings, and evidence claims. This is an independent review; a
source author cannot mark its own criterion Done.

## Initial baseline

At the first audit pass the new `src/rebuild` graph is empty and the canonical
rebuild files `GOAL.md`, `SPEC.md`, `DOD.json`, and `SOURCE_REGISTER.json` have
not yet been created by their owners. Therefore no new UI criterion is eligible
for Done. The old renderer and its visual fixtures are historical evidence only.

The following observations are intentionally recorded before implementation so
later review can detect drift:

| Check | Initial result | Required follow-up |
| --- | --- | --- |
| New entry imports only `src/rebuild` UI | Blocked: `src/main.tsx` still loads old `App` | Root must replace entry graph, then run `tests/rebuild-independent-audit.test.mjs`. |
| New source duplicates old UI files | Not applicable: no new source | Hash new files against old UI tree after each slice. |
| External live editor/browser iframe | Legacy tree contains `real-vscode-workbench-iframe` | New tree must contain no iframe/live editor endpoint; legacy result cannot transfer. |
| Non-project chat defaults without arbitrary `cwd` | Unverified: no new chat controller | Exercise create/reload/send with no project and inspect native request. |
| Model/effort hot update is per session | Unverified: no new settings/chat source | Switch two sessions independently, reload, verify revisions and native receipt. |
| Done evidence is direct and fresh | Blocked: new DoD absent | Governance owner creates atomic matrix; gate rejects missing/stale hashes. |
| Research is novel and source based | Partial: workflow specifies it, registry absent | Source owner records new OSS revisions and exact files, with deduplication. |

## Forward tests

The independent test file checks architecture boundaries and evidence shape. It
must run after the new entry and modules exist, and must remain separate from
author unit tests. A failed test is a finding, not a reason to weaken the rule.

Required runtime review once the product is wired:

1. Start with no project selected. Create a session; verify the native payload
   has an explicit non-project scope and does not silently select a recent folder.
2. Create a project session and a non-project session. Change model and effort
   in one; verify the other remains unchanged after switching, reload and native
   persistence.
3. Disconnect native core. Verify a visible unavailable state and no fabricated
   assistant/tool output; reconnect and replay from a cursor without duplicates.
4. Exercise cancel, ask-user, approval and a queued follow-up. Verify terminal
   records and that retry does not resend an outcome-unknown side effect.
5. Use Browser and IDE modes with the same selected chat. Verify continuity,
   focus order and no external live editor/web-app frame.
6. Capture keyboard, narrow, light/dark, reduced-motion and permission-denied
   states. Record screenshot paths, viewport, build, and limitations.

## Review rule

`tests/rebuild-independent-audit.test.mjs` is intentionally strict. It does not
claim native/live parity; it catches source-boundary and evidence mistakes early.
Native, packaged and live-provider claims need their own receipts. Findings are
listed in `FINDINGS_0001.md` and resolved with a new reviewer receipt.
