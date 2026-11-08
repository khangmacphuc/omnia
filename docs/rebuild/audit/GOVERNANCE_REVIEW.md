# Governance and release evidence review — cycle 0006

**Recorded at:** 2026-11-08T06:47:30Z  
**Reviewer:** `/root/cycle6_governance_review`  
**Scope:** Independent review of the cycle-0006 evidence loop, publication record,
canonical-document continuity, and claim boundaries. This review covers the
clean-room rebuild checkout. It does not review the dirty original checkout,
credentials, browser profiles, cookies, private chat history, or external
service accounts.  
**Result:** **Changes required.** The cycle-0006 milestone was published, but
the product goal remains incomplete and the final release references are not
yet one immutable snapshot.

This file is the only file written by this reviewer. It is an audit record, not
a completion declaration and not a request to mark any DoD criterion Done.

## Snapshot and authority

The cycle-0006 publication receipt records a clean-room commit and tag. The
checkout then received a documentation-only publication-proof commit and a new
cycle-0007 resume/audit manifest. Consequently, two states must be kept
separate:

| State | Evidence |
| --- | --- |
| Cycle 0006 publication target | Commit `5d0ccddbc1f0dd7c34cd8153a64443531f5b876e`, tag `v0.1.0-rebuild-0006` |
| Current branch after publication proof | `2ea8fd3aa5b5f372b2b89dfd954883744e47a24f`, pushed to `origin/codex/omnia-original-rebuild` |
| Active follow-up manifest at the review freeze | `rebuild-0007`, `status=active`; its working-tree change was not part of the cycle-0006 tag |

The current DoD matrix is authoritative: **0 Done / 24 Partial / 7 Blocked /
209 Planned (240 total; 0/240 mandatory Done)**. A passing cycle receipt or a
publication tag does not change those counts.

The canonical inputs were reread before this review. Their observed SHA-256
bindings are:

| Canonical input | SHA-256 |
| --- | --- |
| `AGENTS.md` | `4841902ff1830d8bd59531c8cd1dfccfe7082deffdc694263be038b08afb70c8` |
| `.agents/skills/omnia-evidence-loop/SKILL.md` | `a03964248bd0d2ed64a672f34e038ad5dcd44438f8b73fc64e08fd2e6f227ce6` |
| `docs/rebuild/GOAL.md` | `c168ea23eb684ea99d4fbe1560d155a1266e03e84220a7f9e7c8d6515d1697bf` |
| `docs/rebuild/WORKFLOW.md` | `7d52f5bea6a524664e1d7d3e74a07f2a23d926cba75584a73925f1b78a2b1fb9` |
| `docs/rebuild/SPEC.md` | `fcacb907aa71f709d79c2e9e35f60134a63f28591c007006e5973eb0f847cfd1` |
| `docs/rebuild/DOD.json` | `2a074c6a701081fdebe22070cdeb1c69c434fb379e4f696c22f163aa835c9764` |
| `docs/rebuild/SOURCE_REGISTER.json` | `6f689f89e7f8b68cf9f7ab0724f68764d9c25c1f856b1245f585ed0c1b45698e` |
| `docs/rebuild/CHECKPOINT.md` | `84ef5ca8624c1fedce2a9d50506286b747290a8e640777d4bab27b1c83e30ebb` |
| `docs/rebuild/ASSIGNMENTS.md` | `ff697992887667f7a61326f9c013a301850385a7f31940d53aa179d308b151de` |

At the same snapshot, `README.md` was
`5fb7de2ad94ae8240cc0e44b028b74874da23078fbb503a2239c5f456e0bd0e4` and the
cycle manifest was `a5728dce1e25d277d6cfbc6be57c7f679ac6c45019a395ed4d27904885f4fd8a`.

## Commands and observed results

These commands were run in the active publish worktree. Exit 0 means the
validator accepted its declared scope; it does not mean the product is Done.

| Command | Exit | Observation and boundary |
| --- | ---: | --- |
| `npm.cmd run test:rebuild-gates` | 0 | **32/32** workflow and schema tests passed. |
| `node scripts/rebuild/check.mjs --structural-only` | 0 | Structural result passed; **23 sources / 42 paths**; DoD remained 0/24/7/209; no architecture violations. |
| `npm.cmd run rebuild:check` | 0 | Current-cycle result passed; `complete=false`; cycle-0006 had reached `next/completed` before cycle-0007 was opened. |
| `npm.cmd run rebuild:check -- --milestone` | 0 | Same incomplete counts. The milestone flag checks stage eligibility and is not a product-completion claim. |
| `node scripts/rebuild/validate.mjs` | 0 | Current-cycle and architecture checks passed; **complete=false**. |
| `node scripts/rebuild/cycle.mjs --validate` | 0 | The cycle manifest validated at the time of invocation. |
| `node scripts/rebuild/cycle.mjs --validate --milestone` | 0 | Publication-stage eligibility was accepted; this does not replace the commit/tag/remote receipt. |
| `npm.cmd run rebuild:architecture` | 0 | Clean-room entry graph passed; `violations=[]`. No legacy UI import/copy or external live editor embed was found. |
| `node_modules/.bin/vitest run src/rebuild --reporter=dot` | 0 | **12 files / 55 tests passed**. Renderer behavior only. |
| `node_modules/.bin/tsc -p tsconfig.app.json --noEmit --pretty false` | 0 | App typecheck passed. |
| `git diff --check` | 0 | No whitespace errors in the reviewed working tree. |

The npm commands emitted the environment's Node 27 nightly compatibility
warning. It did not change the exit codes. The commands above do not prove a
packaged Tauri/WebView2 UI, Windows UI Automation, OS permission grant, live
provider account, billing result, or external browser/computer session.

## Research and source provenance

Cycle 0006 added genuinely new source snapshots and recorded them in the
registry. The registry now contains 23 source records and 42 paths. The two
cycle-specific decisions reviewed here are:

| Source | Pinned path and hash | License | Recorded decision and limit |
| --- | --- | --- | --- |
| Mastra | `packages/core/src/workflows/workflow.ts`, revision `9a85fd4c5c5de81ce7632ea35ba1b79e4357b9c5`, hash `55ff8cc5148bf57aa167a475f0dc75adff75632c47d4b8f674e678d7f61f4da9` | Apache-2.0 | Apply as a reference for journal lineage, nested cancellation, ownership claims and bounded recovery. It is not Omnia native/runtime proof and is not vendored. |
| Monaco Editor | `src/internal/common/workers.ts`, revision `5359a3330383137dfdf8897ba1d93d943fec4027`, hash `b114be059cdb6d8f37ae3d198c702adaedb46abe7a215b21fff7fdb558935adc` | MIT | Apply as a reference for URI/model identity and explicit worker lifecycle. It does not prove Tauri persistence or packaged worker behavior and is not embedded. |

The research snapshots are reference data. The architecture guard confirms that
the clean-room entry graph does not import or copy a legacy renderer and does
not embed a live external editor/application.

## Evidence review by selected criterion

The cycle-0006 UI review receipt
`docs/rebuild/audit/REVIEW_CYCLE6_20261108.json` is an independent
evidence-integrity review. It reports selected criteria as `passed` and has no
unresolved review findings, but its own scope says that preview/native/live
boundaries are preserved. Those results must not be read as DoD completion.

| Criterion | Matrix state | What the evidence establishes | What remains open |
| --- | --- | --- | --- |
| `UI-009` | Partial | Light/dark browser-preview capture, 153 checks, axe 0, and current source bindings. | Packaged Tauri/WebView2 accessibility and native contrast/geometry are not captured. |
| `UI-012` | Partial | Browser-preview measurements for 48px header, 36px browser tabs and 240px desktop sidebar. | Packaged desktop measurement and native DPI/accessibility evidence remain open. |
| `UI-015` | Partial | 800×600 and 1440×900 preview states, overflow/focus checks and axe checks. | Packaged/native behavior at the minimum viewport remains unproven. |
| `ADVSET-003` | Blocked | Renderer model-discovery policy and validation source exist. | No live provider catalog refresh contract, native cancellation, persisted catalog snapshot, or provider/model execution receipt. |
| `CHAT-008` | Partial | Provider-neutral native ask-user broker/tool tests pass **10/10**. | Packaged Tauri command delivery, Windows UI flow and live provider ask-user interaction are unverified. |

The selected criteria are therefore correctly retained as Partial/Blocked in
the matrix. Other open boundaries include native project/file pointers, RAG
runtime admission/retrieval, provider execution and billing, packaged IDE and
browser behavior, computer automation, compare fan-out, OS permissions,
long-running performance, and the remaining planned criteria.

## Publication and continuity findings

### GOV-01 — Publication proof does not cover the final branch head

The typed receipt
`docs/rebuild/receipts/cycle6-publication.json` has SHA-256
`6ad9f266b055a724cc581534aeb105368dfa30fe276e254389f9d189788e5710`. Its
publication output has SHA-256
`14733e2387981022f37c5147c9645856fecc4b73ec2bda810cffa9bf7502177f` and proves
that branch and tag pointed to commit
`5d0ccddbc1f0dd7c34cd8153a64443531f5b876e` when the cycle-0006 publish command
ran. The tag `v0.1.0-rebuild-0006` still points to that commit.

The follow-up documentation commit is `2ea8fd3aa5b5f372b2b89dfd954883744e47a24f`
and is now the remote branch head. The cycle-0007 manifest and the publication
proof are therefore not contained in the tagged commit. The validator accepts

the receipt because it checks that the recorded commit/tag exist and that the
remote branch exists; it does not require the branch head to equal the recorded
commit.

**Required action:** either make the release tag/receipt cover the final branch
head, or record a deliberate, reviewable post-publication documentation update
whose untagged status is explicit. Do not call the branch head and the cycle-6
tag one immutable release until they agree.

### GOV-02 — README counts are stale against the DoD

`README.md` still states **0/240 Done, 23 Partial, 8 Blocked, 209 Planned**,
while `docs/rebuild/DOD.json` and the current checkpoint state
**0/240 Done, 24 Partial, 7 Blocked, 209 Planned**. The README does correctly
describe the preview/native boundaries, but its numeric matrix is not a current
release statement.

**Required action:** update the README count and bind its hash in the next
publication record, then rerun the publication and canonical reread checks.

### GOV-03 — Canonical cycle labels are not fully continuous

`CHECKPOINT.md` now identifies cycle 0006 `next/completed`, while the active
follow-up manifest is cycle 0007. `GOAL.md` still has its historical header
`Cycle: rebuild-0001`; `ASSIGNMENTS.md` still has `rebuild-0001` and a resumed
cycle-0004 section. Those labels are understandable historical notes, but the
canonical headers do not give one unambiguous current-cycle view.

**Required action:** retain historical ownership sections but add an explicit
current-cycle pointer (or update the canonical header) so GOAL, CHECKPOINT,
ASSIGNMENTS and the active manifest agree on the cycle being resumed.

### GOV-04 — Current follow-up manifest is outside the published snapshot

At the cycle-0006 review freeze `.agents/checkpoints/rebuild-cycle.json` was a
cycle-0007 manifest with `status=active` and no post-edit reads or artifacts
for cycle 0007. It is useful work-in-progress state, but it cannot be used as
cycle-0006 publication evidence. Commit it only after its own audit/research/
document gates are satisfied, and keep its state separate from cycle-0006.

## Transient consistency findings observed during review

The first gate attempts in this review exposed three consistency defects that
were corrected before the cycle-0006 publication snapshot:

1. The Monaco `src/editor.ts` registry hash had 65 characters instead of a
   SHA-256; the source register now contains the 64-character snapshot hash and
   structural validation passes.
2. The `cycle6-ui-20261108.sha256` sidecar lagged its JSON capture; it now
   matches the current capture hash.
3. Historical receipt bindings initially caused stale-hash failures. The
   current `rebuild:check`, `validate`, and cycle gates now pass after the
   receipts were refreshed.

These corrections are evidence of useful fail-closed behavior. They do not
reduce the open product or release findings above, and future receipt refreshes
must be followed by a complete canonical reread.

## Required next actions

1. Reconcile the README matrix count with `DOD.json` and keep the preview/native/
live wording intact.
2. Resolve the cycle-6 tag versus branch-head mismatch, or explicitly document
   the follow-up commit as an untagged documentation update.
3. Give cycle 0007 its own committed audit, research, post-edit reads and
   independent review before advancing it.
4. Preserve the selected criterion boundaries: obtain packaged/native/runtime
   evidence for UI geometry/accessibility and ask-user delivery, and implement
   a live provider model-discovery lifecycle before changing `ADVSET-003`.
5. Continue reporting the DoD as **0/24/7/209** until direct mandatory evidence
   moves criteria to Done. A green validator, preview capture, or publication
   receipt is not a product completion claim.

## Independent-review conclusion

Cycle 0006 has a reproducible research trail, original renderer graph, passing
structural/behavior gates, honest preview boundaries, and a remote publication
receipt. The evidence is sufficient to describe a reviewed milestone. It is not
sufficient to claim the Omnia product complete, and the release record needs the
README count and final-reference reconciliation above. Keep the goal active and
continue with cycle 0007.

