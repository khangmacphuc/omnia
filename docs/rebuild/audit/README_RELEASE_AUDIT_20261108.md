# README and release evidence audit — 2026-11-08

**Reviewer:** `/root/readme_release_evidence_audit`  
**Reviewed at:** 2026-11-08 04:24:52 UTC  
**Checkout:** `C:/Users/khang/.codex/worktrees/omnia-ui-rebuild/publish-worktree`  
**Revision:** `ca8dfa32a8221761383553780d13e61be053667d` plus the current uncommitted rebuild  
**Result:** `changes_required`; this is an audit of publish readiness, not a product completion claim.

## Scope and method

Read the current README, entrypoint/shell, rebuild DoD/checkpoint, screenshot and
verification receipts, manifest versions, release workflows, local status and
remote refs. Inspected the hero, clean-room Chat, Browser and IDE PNGs directly.
Checked all README local links and image paths for existence. Recomputed media
and source hashes referenced by `preview-ui-current-20261108.json`.

No product source, canonical spec/DoD, release metadata, commit, tag or remote was
changed by this audit. Fresh commands are separated below from historical test
outputs that were only read. No native tests or packaged app were run.

## Findings and exact root actions

| Priority | Finding | Direct evidence | Root action before publication |
| --- | --- | --- | --- |
| P1 | README presents the historical UI as the primary app image. | `README.md:5` uses `omnia-app-overview.png`, identical in SHA-256 to `omnia-shell-chat-nav-final.png`. It depicts the old renderer and a populated transcript rather than the active `src/rebuild` shell. | Replace the hero with a newly captured, sanitized current clean-room image. Label every preview as preview. Do not use the populated historical transcript as proof of current behavior. |
| P1 | README mixes the old implementation and completion ledger with the active rebuild. | `README.md:11` calls the 24-row historical ledger authoritative. `README.md:36`–`47` describes durable tabs, pointer/RAG, IDE/LSP, plugins and native workflows as working in this snapshot, while `src/main.tsx:11` loads the clean-room renderer and `DOD.json` has `0 done / 17 partial / 8 blocked / 215 planned`. | Make `docs/rebuild/DOD.json` the active rebuild authority. Separate current clean-room behavior, reusable native contracts and historical evidence. Retain the historical ledger as background only. Rewrite the working list to match actual clean-room links and receipts. |
| P1 | Browser/IDE images do not show the current companion ChatView/composer. | Direct inspection of `omnia-rebuild-browser.png` shows an empty right pane. `omnia-rebuild-ide.png` shows no companion chat. Current `rebuild-app.tsx:46`–`47` renders `ChatView compact` beside both workspaces. | Recapture Browser and IDE after restarting or verifying the current preview server, with a visible selected session and composer. A source hash added to a receipt does not establish that an older PNG was rendered from that source. Regenerate receipt hashes after capture. |
| P1 | Version and tag policy are inconsistent. | README says 0.1.18, HEAD is historical tag `v0.1.19-preview`; package/Tauri/Cargo package versions are all `0.1.0`. Release workflow only accepts `^v[0-9]+\.[0-9]+\.[0-9]+$`. Fresh regex check rejects `v0.1.19-preview`, `v0.1.20-preview` and `v1.2.3-rc.1`. | Choose the milestone version, synchronize package/Tauri/Cargo and lockfile metadata, update README, and make release validation accept the selected prerelease policy while comparing its numeric core with installer manifests. Add or run positive and negative tag validation checks before tagging. |
| P1 | The rebuild is not yet published. | Fresh `git ls-remote` reports only `main` at `ca8dfa32…`, no `codex/omnia-original-rebuild` ref and no `v0.1.20-preview` tag. Local HEAD is the same base with zero commits ahead. The four rebuild PNGs and rebuild docs/source are untracked. | After evidence/review gates, stage the intended files, inspect the staged diff and paths, commit, push the intended branch/ref and verified tag, then record exact commit/tag/remote refs. Do not report publication before remote verification. |
| P1 | Full release validation currently fails. | Fresh `npm.cmd run check` exited 1 at `tokens:check`: `src/styles/tokens.generated.css has drifted`. Later checks did not execute. | Diagnose the historical token drift without importing old tokens into the clean-room renderer. Fix/reconcile it or create an explicit bounded milestone pipeline with an honest failed full-release gate; rerun the exact release gate before claiming release CI readiness. |
| P2 | README walkthrough and shortcuts describe controls absent from the current shell. | `README.md:114` asks the user to open Projects, `:117` Services; `:34` says Work/Library/Memory/Skills remain Chat routes. Current shell exposes the three surfaces, shared session list, settings, theme and reference workbench; its current source does not expose those named routes. | Replace walkthrough with controls users can invoke now, such as new conversation, Attach project, current Browser/IDE and settings. Audit listed keyboard shortcuts against clean-room handlers. Move unlinked workflows to the remaining-work section. |
| P2 | README verification counts are stale for the active renderer. | `README.md:107` says 2,099 modules and historical 73/24 browser/native and 713 native counts. Current hashed clean-room outputs record 1,686 modules, 9 focused files/35 tests and a separate 6-test source-boundary audit. | Present clean-room counts with explicit command/date/scope. Keep native historical numbers only with a dated source-revision link and a statement that they do not prove clean-room runtime integration. Do not replace native numbers with unexecuted guesses. |
| P2 | The textual capture receipt is older than the current focused test receipt. | `docs/rebuild/evidence/preview-ui-receipt-20261108.md` still says cycle 0002, 8 files/29 tests; current focused JSON/output says 9 files/35 tests. Checkpoint table also retains 29/29 while its narrative says 35. | Refresh the textual receipt/checkpoint after the new captures and verification, then recompute referencing hashes. Keep one command/result/snapshot per receipt. |

## Verified facts in this audit

| Check | Result | Boundary |
| --- | --- | --- |
| README local links and image paths | Every inspected path exists locally. | Existence does not prove current claims or remote inclusion. |
| Rebuild PNG dimensions | Four PNGs are 1440×900. | Preview screenshots only. |
| Rebuild PNG hashes | 4/4 match the current preview receipt. | Does not prove screenshot/source temporal correspondence. |
| Preview receipt source hashes | 8/8 checked paths match local files. | Source consistency only, not packaged/live behavior. |
| Manifest numeric versions | package/Tauri/Cargo package all `0.1.0`. | Consistent with each other, inconsistent with current release labels. |
| Fresh `npm.cmd run rebuild:check --silent` | exit 0, `complete=false`, 0/240 mandatory Done. | Structural/evidence consistency; not full completion. |
| Fresh `npm.cmd run check` | exit 1 at token drift. | No later full-check stage ran. |
| Fresh remote ref queries | main at `ca8dfa32…`; `v0.1.19-preview` annotated ref exists; rebuild branch / next preview tag absent. | Read-only Git remote evidence. |

## Current clean-room evidence that can be stated carefully

The existing hashed command outputs record a successful renderer typecheck,
1,686-module renderer build, 35 focused tests across 9 files, 6 independent
source-boundary tests and 14 rebuild gate tests. This audit read those outputs;
it did not rerun those suites. Root must run current-cycle verification after
source edits and captures before the milestone commit.

The current renderer visibly has three top surfaces, a non-project empty Chat,
native-unavailable Browser status and original IDE chrome. These observations do
not prove native project pointers, RAG dispatch, provider execution, native durable
tabs, OS permission flows, WebView2 lifecycle, computer use or packaged endurance.

## Publication checklist for root

- [ ] Rewrite README around active clean-room scope and `docs/rebuild/DOD.json`.
- [ ] Replace hero and refresh Browser/IDE captures from current source.
- [ ] Verify image contents are suitable for publication and track the intended PNGs.
- [ ] Refresh capture/test receipts and resolve stale review wording.
- [ ] Synchronize version metadata and prerelease tag validation.
- [ ] Resolve the failed full-check gate or state the exact bounded milestone boundary.
- [ ] Run current source tests/typecheck/build/architecture/rebuild gates and inspect outputs.
- [ ] Reread spec/DoD/checkpoint/source register, review the exact staged diff, commit.
- [ ] Push only the reviewed milestone and tag; verify remote commit/tag refs.
- [ ] Keep the goal Active and report open criteria separately.

## Useful next decisions

**Fix:** conflicting README scope, stale screenshots and release metadata.  
**Add:** a publish receipt containing the exact commit/tag/ref and per-image scope.  
**Optimize:** one current renderer verification table generated from receipts, with historical native evidence in a separate section.  
**Remove from current claims:** unlinked legacy routes, stale renderer counts and the historical hero image.
