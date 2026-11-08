# Cycle 8 workflow gate audit — 2026-11-08

## Scope

This independent read-only audit covers the active `rebuild-0008` workflow gate in
`C:/Users/khang/.codex/worktrees/omnia-ui-rebuild/publish-worktree`. It inspects
stage ordering, canonical-document hash rereads, new research novelty, typed
plan/implementation/verification/review/publication receipts, blocker schema and
status consistency. No product source, canonical DoD, spec, checkpoint, or gate
implementation was changed by this audit.

## Inputs inspected

- `AGENTS.md`
- `.agents/skills/omnia-evidence-loop/SKILL.md`
- `docs/rebuild/WORKFLOW.md`
- `docs/rebuild/GOAL.md`
- `docs/rebuild/SPEC.md`
- `docs/rebuild/DOD.json`
- `docs/rebuild/SOURCE_REGISTER.json`
- `docs/rebuild/CHECKPOINT.md`
- `docs/rebuild/ASSIGNMENTS.md`
- `.agents/checkpoints/rebuild-cycle.json` (`rebuild-0008`)
- `scripts/rebuild/workflow.mjs`
- `scripts/rebuild/check.mjs`
- `scripts/rebuild/cycle.mjs`
- `scripts/rebuild/workflow.test.mjs`

## Fresh command evidence

| Command | Exit | Observed result |
|---|---:|---|
| `npm.cmd run test:rebuild-gates` | 0 | 32 Node gate tests passed, 0 failed. Includes stale-hash, duplicate research, skipped stage, cancellation, failure generation, review binding, blocker schema, typed plan, synthesis workbench and publication guards. |
| `npm.cmd run rebuild:check` | 0 | Current-cycle scope passed; active cycle `rebuild-0008`, stage `research`, status `active`; no completion claim. |
| `node scripts/rebuild/cycle.mjs --validate` | 0 | Active cycle validated successfully at stage `research`. |
| `npm.cmd run rebuild:architecture` | 0 | Clean-room graph passed with no architecture violations; entry `src/main.tsx`. |
| `node scripts/rebuild/cycle.mjs --validate --milestone` | 1 | Correct fail-closed result: `Cycle has not reached a publishable milestone` because the cycle is still in research. |

The Node/npm runtime printed an environment warning that npm 12.2.1 does not
officially support the installed Node 27 nightly. The commands nevertheless
returned the exit codes above; this warning is an environment limitation, not
workflow evidence.

## Gate behavior checked from source

### Stage order and resume integrity — PASS

`STAGES` defines the only valid sequence:

`resume → audit → research → synthesize → plan → implement → verify → review → document → publish → next`.

`advanceCycle` requires the requested destination to be the immediate next
stage, validates the current stage before advancing, and rejects skips. Cycle
history is replayed by `validateCycle`; generation, timestamps, terminal status,
and previous stage are checked against the manifest. The active Cycle 8 history
currently contains `resume → audit → research` with generation 1.

### Canonical hash reread — PASS

Cycle creation records all ten canonical document hashes in `reads.before`.
`validateCycle` checks the input snapshot while the cycle is before
implementation and revalidates completed stages. Later document stages require
`reads.after`; stale hashes are rejected by `verifyReference`. The gate tests
include a changed canonical document and confirm that default `rebuild:check`
fails while explicit `--structural-only` remains a diagnostic mode.

### Novel OSS research — PASS, currently pending cycle artifact

`validateNovelResearch` requires at least one research entry after the cycle
creation time, a non-repeat `(canonicalRepo, revision, path)` identity, a
non-repeat content hash, resolved license, query/timestamp, disposition,
observation/strength/weakness/impact, and a verified source snapshot with the
same hash. Cycle 8 is correctly not allowed to leave `research` until those
entries and a typed research artifact are present. At audit time its
`research` list is empty because the research agents are still working; this is
an expected incomplete stage, not a gate defect.

### Typed synthesis, plan and implementation receipts — PASS

Source inspection confirms the gate requires JSON artifacts with `schemaVersion`,
stage, cycle ID and timestamp. Plan receipts require bounded useful passes
(0–10), explicit stop reasoning, atomic tasks with owners/dependencies,
measurable acceptance metrics and zero-exit verification commands; dependency
cycles and uncovered selected criteria are rejected. Synthesis binds observations
to reviewed research and requires a runnable workbench plus passing build
receipt. Implementation binds each selected criterion to changed source files
and explicit limitations.

### Verification and review binding — PASS

Verification receipts require `result: passed`, a recognized evidence kind,
command/exit 0 for machine evidence, source-file bindings and fresh hashes.
Native and live evidence are scope-checked so fixture/preview cannot prove
packaged/native/live claims. Cycle review must have a reviewer distinct from the
author, a passed JSON receipt with no unresolved findings, matching identity and
time, selected criterion coverage, and source/test evidence that covers the
implementation and verification bindings.

### Blocker and DoD status integrity — PASS

`validateDod` accepts only the defined statuses, checks IDs/dependencies and
requires every blocked/partial blocker to include a real attempts list,
resolution, workaround and next action. A Done criterion cannot retain
blockers, must contain every required evidence kind, and must pass independent
review. Mandatory completion is computed from the DoD rather than inferred from
a green structural gate.

### Publication guard — PASS

Publication requires a typed post-publication receipt with commit/tag/version,
current README and screenshot hashes, an explicit list of all open criteria,
remote branch/tag proof, package-version agreement, and local/remote Git refs.
`--milestone` is correctly rejected before `publish`/`next`.

## Findings and limits

1. **No gate defect found in the inspected cycle and source.** The active-cycle
   validator is fail-closed and the adversarial gate suite is green.
2. **Cycle 8 is not publishable yet.** Research is still incomplete, and no
   synthesis/plan/implementation/verification/review/document/publication
   artifacts exist for this generation. This is an expected work-in-progress
   state, not evidence of product completion.
3. **A green gate does not prove native or live behavior.** Runtime and packaged
   evidence remain criterion-specific and must be supplied by the implementers.
4. **The Node 27 nightly/npm compatibility warning should be recorded in CI
   environment metadata.** It did not cause a failure in this run, but a stable
   supported Node version would reduce release noise.
5. **Untracked `.tmp-pydantic-ai-20261108064931/` remains outside this audit.**
   It is intentionally not staged or included in evidence.

## Verdict

`passed — workflow gate controls are present and current-cycle checks are green`.
Cycle 8 remains `active/research`; the gate correctly prevents milestone claims
until all later stage artifacts, independent review, document reread and
publication proof are present. DoD counts remain **0 Done / 24 Partial / 7
Blocked / 209 Planned / 240 total** at the time of this audit.

## Reproduction

```powershell
npm.cmd run test:rebuild-gates
npm.cmd run rebuild:check
node scripts/rebuild/cycle.mjs --validate
npm.cmd run rebuild:architecture
node scripts/rebuild/cycle.mjs --validate --milestone
```
