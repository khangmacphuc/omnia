# Workflow and goal enforcement audit

Recorded at: 2026-11-08T04:25:59Z. Reviewer: `/root/workflow_goal_force_audit`.

Result: **changes required**. This is an enforcement audit of the active checkout,
not product, native runtime, live provider, or release acceptance evidence. No DoD
status was changed. No implementation, canonical document, old checkout, commit,
tag, or remote was changed by this reviewer.

## Scope and method

Read `AGENTS.md`, the Omnia evidence-loop skill, goal, workflow, spec, DoD, source
register, checkpoint and assignments. Inspected the actual gate implementation,
CLI and CI wiring. Applied the `harness-engineering`, `systematic-debugging` and
`verification-before-completion` guidance to distinguish a documented rule from
an executed guard. Root owns the parallel research and integration cycle.

Executed the existing gate suite and current-check commands. Ran sixteen
adversarial probes against exported workflow functions using a new temporary
directory containing harmless fixture documents, one synthetic command output
and a source snapshot. The probe command used a PowerShell literal here-string
piped to `node --input-type=module`; it imported the unchanged implementation
from this checkout. The temporary directory was removed only after its resolved
parent and `omnia-workflow-force-audit-` prefix were checked. No native command,
provider, external side effect or downloaded script was executed.

The probes are not application behavior tests. They measure the current
validators' decisions. Ten required guard outcomes were observed; six contract
discrepancies were reproduced. A zero exit from the diagnostic driver means its
observations were collected, not that all sixteen requirements passed.

## Commands and current state

| Command | Exit | Observed result and boundary |
| --- | ---: | --- |
| `npm.cmd run test:rebuild-gates` | 0 | 14 tests passed; current suite covers structural guards, not the six missing contracts below. |
| `npm.cmd run rebuild:check` | 0 | `result=passed`, `complete=false`; 0/240 Done, 17 Partial, 8 Blocked, 215 Planned. |
| `node scripts/rebuild/cycle.mjs --validate` | 1 | `Input documents: stale hash for docs/rebuild/DOD.json`. |
| `node scripts/rebuild/cycle.mjs --validate --milestone` | 1 | Same stale input hash; it fails before assessing publish eligibility. |
| `validateResearchRegistry(currentRegister)` through a Node module command | 0 for diagnostic driver | Returned four registry errors; the default check still passed. |
| Temporary function probe driver | 0 for diagnostic driver | Ten enforced rejection cases and six discrepancies, detailed below. |

At this audit snapshot the persisted cycle was `rebuild-0003`, `stage=resume`,
`generation=1`, with empty `research`, `artifacts`, `checklist` and post-edit
`reads.after`. The goal header still named cycle `rebuild-0001`, checkpoint named
`rebuild-0003`, and resumed assignments named `rebuild-0004`. These are observable
continuity gaps; this audit did not rewrite their history. Implementation evidence
must be reconstructed from actual existing artifacts or explicitly treated as a
new cycle, rather than backdating invented stage events.

The Node runtime reported `v27.0.0-nightly202610263983092f63` with an npm support
warning. The observed commands finished with the exits above. No claim is made
that this environment proves the configured Node 22 CI job.

## Findings

### WF-01 — P1: the default and CI checks do not enforce the active cycle

`scripts/rebuild/check.mjs:12` validates the DoD and `:13` checks only the source
register container shape. It does not load the cycle, invoke `validateCycle`,
validate its reread hashes, or validate all source registry entries. Its imports
of `validateNovelResearch` and `validateReadSnapshot` are unused.

The dedicated rebuild CI runs `rebuild:check` and the architecture guard without
the cycle validator. Thus a green default/CI check is compatible with a stale,
unadvanced manifest. This was reproduced directly by the contrasting command
results above. It is not evidence that any user requirement is complete.

The standalone registry diagnostic returned these errors at the snapshot:

- `oss-get-shit-done-verification-20261108`: invalid SHA-256 for `commands/gsd/verify-work.md`.
- `oss-power-agent-powershell-20261108`: invalid SHA-256 for `README.md`.
- `new-browser-use-terminal-cycle3-20261108`: invalid SHA-256 for `README.md`.
- `new-computer-agent-cycle3-20261108`: invalid SHA-256 for `src-tauri/src/permissions.rs`.

**Concrete fix:** make the normal check validate the current cycle and registry;
separate an explicitly named structural-only command if one is still useful.
Make CI execute the same validator. Add a subprocess regression in which the
architecture and DoD shape are valid but the manifest has a stale hash or empty
research after the research stage; the release check must exit nonzero. Preserve
unresolved source records as incomplete findings instead of fabricating hashes.

### WF-02 — P1: a diagnosed failure creates a generation the validator cannot resume

`advanceCycle` increments the generation and returns from verification to
implementation. It deliberately clears downstream review, checklist and reread
state. `validateCycle` then revalidates every earlier stage using the current
generation (`workflow.mjs:374` through `:376`). `validateArtifact` requires that
generation for every artifact (`:260`).

Reproduction: advance a valid temporary cycle through resume, audit, research,
synthesis, plan and implementation into verify; emit `failure` with a diagnosis;
validate the returned state. Result: `audit: required artifact missing for
generation 2`, although the recovery contract says to resume implementation.
The existing failure test asserts only stage/generation and misses this replay.

**Concrete fix:** bind each completed stage to the generation in which it was
actually completed. A failure at implement or later may retain verified immutable
audit/research/synthesis/plan inputs while invalidating implement and every
downstream stage. Reject stale carried inputs if their hashes change. Add a full
`failure → validate → implement → verify → review → document` recovery test;
never manufacture replacement audit/research events solely to satisfy the guard.

### WF-03 — P1: an independent review need not cover the criterion's source

`validateReview` verifies that its own `sourceFiles` exist and have current hashes,
but does not relate that set to the criterion's source evidence or tested files.
It verifies the review evidence file's hash without parsing its review result.

The probe marked a one-criterion fixture Done with source evidence pointing to
the spec, a synthetic passing test receipt pointing to `source.txt`, and an
independent review also pointing only to `source.txt`. `validateDod(...,
{complete:true})` returned `complete=true` even though the review never bound the
criterion's source artifact. This is a source association gap; the probe does not
claim the gate could determine whether prose or code is semantically correct.

**Concrete fix:** use a review receipt schema with criterion IDs, reviewed source
hashes, tested receipt hashes, findings and result. Parse that receipt and compare
it to the review declaration. Require coverage of the relevant criterion source
and test receipts; reject a passed declaration over a receipt with unresolved
findings. Keep reviewer identity distinct from the implementer.

### WF-04 — P2: plan, synthesis and implementation stages accept any hashed file

`workflow.mjs:278` through `:282` share a generic artifact check. A plan artifact
containing only the fixture spec text was accepted without improvement passes,
an atomic task, owner, dependencies, inputs/outputs, acceptance threshold, test
plan, or stop reason. The same mechanism does not bind synthesis to a runnable
reference workbench.

**Concrete fix:** add typed stage receipts. Planning should validate a configured
0–10 pass budget (default 3), ordered useful decisions and an explicit no-new-
decision stop reason where applicable. Validate atomic task IDs against selected
DoD criteria, ownership, dependencies, observable thresholds and verification
commands. Synthesis should bind observations/decisions and the actual runnable
workbench source/build receipt. A free-form Markdown file can remain an attached
explanation; its presence alone should not advance the stage.

### WF-05 — P2: blocker validation accepts non-attempts and omits required actions

The blocker check at `workflow.mjs:214` through `:217` only requires a cause,
nonempty attempts array and a resolution string for criteria already marked
Blocked. The fixture `{cause:"blocked", attempts:[null], resolution:"resolve"}`
was accepted without a workaround or next action. Blockers on Partial criteria
are not checked by this branch at all.

**Concrete fix:** validate every blocker record regardless of criterion status.
Require each attempt to carry a meaningful action, observed outcome and evidence
reference where one exists. Require `workaround` (which may explicitly be
`none`) and a concrete `nextAction`. Keep a blocked criterion incomplete. Add
negative cases for null/empty attempts, missing workaround/action and stale
evidence, without deleting existing blocker history.

### WF-06 — P2: publication is a generic file, not a checked release receipt

`workflow.mjs:298` through `:300` accepts any hashed file after the document reread.
The fixture publish artifact was accepted without a commit, tag, remote, version,
README/screenshot binding, or list of remaining criteria. This does not prove a
push occurred. `--milestone` names publish eligibility; it should not be reported
as a completed publication receipt.

**Concrete fix:** distinguish pre-publish eligibility from post-publish proof.
Validate a typed release receipt containing the exact commit, annotated/lightweight
tag identity, remote URL, observed pushed ref, version, README/screenshots and
remaining DoD counts. Read Git state and `ls-remote` in the release verification
command and bind its output. Do not mark the overall goal complete for a milestone.

### WF-07 — P2: status is not constrained by stage/history

`validateCycle` checks that status is one of three strings, but a fixture
`status=completed` at `stage=resume` with only its initial history was accepted.
`advanceCycle` also assumes the supplied cycle history is already valid rather
than validating the original state before transition.

**Concrete fix:** enforce `completed` only at `next` after the complete stage
history, `cancelled` only with the final cancellation event, and `active` with no
terminal event. Require chronological timestamps and valid selected criterion
IDs at creation/resume. Validate the original cycle before applying a transition,
with an explicit recovery path for an invalid historical manifest.

## Guard probes that worked

| Probe | Observed decision |
| --- | --- |
| Direct `resume → implement` | Rejected: expected audit. |
| Document exit without post-edit reread | Rejected: missing `AGENTS.md`. |
| Author as their own reviewer | Rejected. |
| Complete request with a Planned mandatory criterion | Rejected: `0/1 mandatory criteria Done`. |
| Fixture receipt labeled native | Rejected: fixture/preview does not prove native runtime. |
| Same repository/revision/path already in baseline | Rejected as duplicate research. |
| Same source content under a different repository URL | Rejected as content already seen. |
| Source fetch dated before cycle creation | Rejected. |
| Advance after cancellation | Rejected. |
| Spec edited after post-edit reread snapshot | Rejected as stale hash. |

These results establish useful mechanisms when those validators are invoked.
They do not establish enforcement through the current default check or prove
that a model read, understood, researched or implemented the recorded content.

## Required follow-up and acceptance

1. Fix WF-01 and WF-02 before claiming the durable loop is enforced. Reconstruct
   the current manifest honestly, preserving the failed validation receipt.
2. Add negative regression tests for each reproduced gap. Keep the gate rules
   independent of the product changes they evaluate.
3. Fix WF-03 so independent review follows the exact source and evidence it
   approves; re-run review after changed implementation hashes.
4. Add typed planning, blocker and release records; preserve prose and prior
   failed attempts as history.
5. Re-run the command pair that currently disagrees, full recovery replay, all
   sixteen probe expectations and release-mode cycle validation. Require their
   outputs to agree with spec/DoD/checkpoint. Review exact diff before publication.

No new permanent test file was added in this audit: the existing gate suite was
left unchanged, and the adversarial cases were run in temporary fixtures. Root
can implement the above negative regressions alongside narrow enforcement fixes.
This report is not an authorization to mark Governance, Research or product
criteria Done; each retains its own evidence and independent review requirements.

## Source snapshot

Hashes below bind this audit to source observed at 2026-11-08T04:25:59Z. Root or
other assigned agents may update those files after the snapshot; re-audit any
changed enforcement source before reusing the findings as current evidence.

| Path | SHA-256 |
| --- | --- |
| `scripts/rebuild/workflow.mjs` | `0d9a19ced5c6f86d8de9f111c89f6ed194bf879cd37e3b7ab893ca53626d7e32` |
| `scripts/rebuild/check.mjs` | `05ba5e83be264c217aa342168d9227e6bba300a06a30bf2b4dcebf8a08175bc7` |
| `scripts/rebuild/cycle.mjs` | `b81f08b1dc00fc99e88bd0d1772c8caaa4042dbadf007d039d062521bf03bc5a` |
| `scripts/rebuild/gate-lib.mjs` | `1f1ba91fbc0ea8e11e726ad0d2414f85ebddac33773834a404628e375c3f9318` |
| `scripts/rebuild/validate.mjs` | `65ed4ec21cc76635d346fea3384eada3f005ffaaa6150062bec5a409a906ef11` |
| `.github/workflows/rebuild.yml` | `74086549b448cbd57efe681137b2b6fd790744aef8762dc72e041d15d44e8013` |
| `.agents/checkpoints/rebuild-cycle.json` | `f3e16a23a70e1d4feebba2434ec9bc4f6bc142ed2147f4e2676f7bdff3d2584c` |
| `docs/rebuild/DOD.json` | `77961433f3dddbacb3780a1b4d99220aac105f305e94acf025cbc224945c5946` |
| `docs/rebuild/GOAL.md` | `c168ea23eb684ea99d4fbe1560d155a1266e03e84220a7f9e7c8d6515d1697bf` |
| `docs/rebuild/WORKFLOW.md` | `7d52f5bea6a524664e1d7d3e74a07f2a23d926cba75584a73925f1b78a2b1fb9` |
| `docs/rebuild/SOURCE_REGISTER.json` | `d3f1e7c38c34fa9aab9f5e1915cb6f635a9b57c455d8605096ec57bc33c467f7` |
