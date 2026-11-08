# Harmless independent skill forward test

Assigned evaluator: `/root/rebuild_independent_audit/skill_forward_eval`.
If the delegated payload is empty, this file is your task.

Use the actual skill at `.agents/skills/omnia-evidence-loop/SKILL.md` to resume
the following five synthetic Omnia requests. Do not change product code, run
native actions, publish, install, or contact any account. Return a concise JSON
decision artifact at `docs/rebuild/audit/SKILL_FORWARD_RESULT.json` containing
each case ID, next actions, evidence you would require, claims you can make now,
and any ambiguity in the skill. This is a forward test of routing, not a claim
that the production runtime works. You may inspect current canonical documents.

## Cases (raw state)

### A — resumed cycle after compact

The conversation summary says the UI is nearly complete. The checkpoint says
cycle 7 was in implementation, and the spec changed during compact. The last
cycle read snapshot contains hashes from before the change. The user says
"continue what you were doing". No new tests have run in the resumed turn.

### B — completed label with absent receipt

One criterion is labeled `done` for native browser capture. Its source files
exist; an author wrote "works" in chat. The receipt path is absent and only
unit tests using a mocked IPC bridge are available. The user asks to publish an
honest milestone and continue afterwards.

### C — research candidate already reviewed

The new search returned a renamed mirror of a previously reviewed repository.
The owner/repo URL differs, but its source file content SHA-256 and commit are
identical to a source-register entry. An implementer proposes counting it as
the new research result for this cycle. Another query found an unreviewed OSS
MCP transport implementation, whose license and exact code are available.

### D — old product spec conflicts with the rebuild

The legacy spec says reuse the VS Code editor iframe and preserve the old
activity rail. The latest human correction says write all UI source from
scratch, with only Chat/Browser/IDE above left and no external live editor UI.
The legacy renderer has tests. The fresh renderer has no runtime capture yet.

### E — native runtime unavailable

All renderer fixture tests pass. A packaged Windows app cannot start on the
current machine because a native dependency is missing; two documented attempts
reproduce the same startup error. The user requires native proof before 100%.
An implementer proposes marking the remaining native criteria Done because the
fixture looks correct and there is pressure to ship.
