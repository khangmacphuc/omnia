# Workflow enforcement implementation — active schema contract

Owner: `/root/workflow_force_impl`. Status: verified implementation slice.
The root integrator owns canonical manifests and documents. Existing malformed
records remain failures; this agent will not rewrite them to make checks green.

## Gate changes being implemented

- `rebuild:check` and `validate.mjs` validate the source registry and current
  `.agents/checkpoints/rebuild-cycle.json` by default. `--structural-only` is an
  explicitly incomplete diagnostic that checks references/schema but skips
  receipt freshness; `--milestone` requires publish eligibility.
- Failed generations carry immutable audit/research/synthesis/plan artifacts
  from their actual completed generation; implementation and later evidence
  must be recreated for the new generation.
- Review declarations point to JSON v1 receipts with matching `author`,
  `reviewer`, `reviewedAt`, `result: passed`, `unresolved: []`, `criteria` IDs,
  current `sourceFiles`, and `testEvidence`. Criterion review must cover the
  criterion's source evidence plus sources bound by its command receipts.
- Every blocker, including Partial criteria, needs nonempty text `cause`,
  text-string `attempts`, `resolution`, `workaround`, and `nextAction`.

## Typed cycle artifacts (JSON)

Stage records use `schemaVersion: 1`, `stage`, `cycleId`, `recordedAt`.

### Plan

`passBudget` integer 0–10 (default 3), `passes: [{index:1,decision:...}]`,
`stopReason: budget-exhausted|no-new-decision|disabled`, `stopDetail` for early
stop, and `tasks: [{id, criteria:[DoD IDs], owner, dependencies:[task IDs],
inputs:[text], outputs:[repository paths], acceptance:[{metric,operator,value}],
verification:[{command,expectedExitCode:0}]}]`. Every selected criterion must be
covered. Acceptance values are finite numbers; operator is eq/lte/gte.

### Synthesis

`observations: [{source,observation,strength,weakness,decision,criteria:[IDs]}]`
and `workbench: {sourceFiles:[hashed references],buildEvidence:{path,sha256,kind:
build}}`. The passing build receipt must bind the same workbench source files.

### Implementation

`changes: [{criteria:[IDs],owner,summary,sourceFiles:[hashed references]}]` and
`limitations:[text]`. All selected IDs must be represented, including explicitly
incomplete changes; this stage does not set DoD status automatically.

### Publish exit (post-publication)

`phase: published`, `commit` (40 hex), `tag`, `version`, `remote` HTTPS URL,
`branch`, `readme` hashed reference, `screenshots` hashed references,
`openCriteria:[IDs]`, `publication:{command,exitCode:0,output:hashed reference,
remoteCommit,tagCommit}`. Commit values must agree; open IDs must match all
incomplete DoD criteria. Local Git commit/tag and remote tag are checked by the
validator. Entering publish means eligibility; exiting publish means proof.

## Boundaries

These checks make inconsistent artifacts rejectable. They do not prove a model
understood prose, that a test is adequate, or that every product requirement is
complete. Current product/native/live evidence remains separately gated.

## Fresh verification

- `npm.cmd run test:rebuild-gates` — exit 0, **32/32 Node gate tests passed**.
- `node --check scripts/rebuild/workflow.mjs` — exit 0.
- `node --check scripts/rebuild/check.mjs` — exit 0.
- `node --check scripts/rebuild/validate.mjs` — exit 0.
- `npm.cmd run rebuild:architecture` — exit 0.
- `git diff --check` — pass for the owned files.
- `npm.cmd run rebuild:check` and `node scripts/rebuild/validate.mjs` — exit 1
  on the current checkout because existing DoD evidence contains a stale
  `src/rebuild/rebuild-app.tsx` hash; this is expected fail-closed behavior and
  remains an integration blocker for the root owner.
