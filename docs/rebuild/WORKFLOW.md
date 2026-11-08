# Enforced rebuild workflow

Version: 3. Active date: 2026-11-08. Owner: root integrator.

The human requested a durable workflow, new UI source, continuous NEW open
source research and full acceptance evidence. This is the operational contract.
No single instruction or CI job can force every future model to obey; the
repository makes omissions observable and rejects inconsistent release claims.

## State machine

`resume → audit → research → synthesize → plan → implement → verify → review → document → publish → next`

Stages do not skip. Failed verification returns to diagnosis/implementation and
invalidates downstream review. A blocker keeps its criterion incomplete and
records a resolution path. Completion requires all mandatory criteria Done.

| Stage | Required artifact / exit condition |
| --- | --- |
| resume | Read AGENTS, skill, goal, spec, DoD, source register, checkpoint and diff; hash each canonical input. |
| audit | Requirement-to-source-to-runtime gap, criteria selected, owners and baseline evidence. |
| research | Fresh web queries and newly reviewed OSS source with canonical URL, revision, license, source paths, novelty and disposition. Record missing/stale extraction. |
| synthesize | Strength/weakness/gap matrix; distinct Omnia decision; runnable reference workbench precedes product UI. |
| plan | Atomic inputs/outputs/tests/thresholds/dependencies/DoD, useful improvement passes (default 3, configurable 0–10). |
| implement | Original complete modules, ownership, no legacy UI imports/copies/live editor embeds. |
| verify | Commands/exit/output/revision; positive/negative/cancel/race/reload checks and real captures as applicable. |
| review | Independent source/behavior review, findings resolved or explicitly incomplete; no author-only completion. |
| document | Update and RE-READ spec/DoD/source register/checkpoint; all checklist items signed with current hashes. |
| publish | Gates pass, exact diff reviewed, honest README/screenshots, commit/push/version tag receipts. |
| next | Re-audit remaining criteria and NEW source discovery. No empty research ritual or infinite cosmetic brainstorming. |

## Research novelty protocol

Each cycle executes fresh searches across relevant areas. Rotate the gap and
keywords: `everything`, `super`, `power`, `pro`, `max`, IDE, browser, harness,
chat, agent, tool, MCP, skills, workflow, architecture, RAG, memory, UI, academic.
At least one newly reviewed source/revision/path is required to claim a new
research result. Known repos are useful baseline references but do not qualify
again unless the exact revision/path is newly reviewed. Canonicalize redirects,
case and `.git` before deduplication. An unchanged file under a new URL is not new.

For each candidate record: query and timestamp; canonical owner/repo; upstream
commit and license; source path plus hash; actual content observation; strength;
weakness/limitation; Omnia gap; apply/reject/defer decision; exact implementation
or test impacted. Fetch failures and no-novelty findings are incomplete research,
with a next query. No fabricated stars or repo claims. Download source into the
reference cache; do not run install/postinstall scripts just to read it.

## Extraction and synthesis

Inventory all extraction modules except Zalo and distinguish reference stubs,
runtime bundles, installed app version, refresh status and readable source.
Validate ChatGPT Store package version/update date against extracted metadata.
Preserve old extraction snapshots; produce a new hashed receipt and list gaps.
No inventory count can establish complete feature parity or complete source.

The reference workbench owns original source and shows traceable design
alternatives and a strength/weakness synthesis. Omnia uses its decisions while
remaining a distinct product. Old UI v1/v2 may be discussed, never copied.

## Spec reread checklist (every implementation cycle)

- [ ] User corrections and all inherited requirements traced to criterion IDs.
- [ ] Input spec hashes captured before implementation; updates explicitly reviewed.
- [ ] Architecture/contracts, permission/data ownership and resource implications updated.
- [ ] UI tokens/spacing/typography/states/keyboard behaviors match the current spec.
- [ ] Tests and runtime receipts match the changed source, platform and build.
- [ ] Done claims use direct evidence; fixtures, mocks and preview are labeled.
- [ ] Negative/race/cancel/reload and missing/stale sources remain visible.
- [ ] Reviewer identity, findings and resolutions recorded.
- [ ] Spec, DoD, source register and checkpoint read again after their updates.
- [ ] README, screenshots, version/tag and remaining work agree with actual state.

The executable gate validates this checklist, hashes, evidence and architecture.
It cannot infer unrecorded behavior or guarantee that a source was understood.
Independent review and runtime checks remain necessary.

## Retry, resources and halt conditions

Default session policy requested: delay 5 s, multiplier 1, unlimited attempts.
Canceled, permission-denied and outcome-unknown side effects cannot be blindly
resent. Preserve idempotency, surface authentication/configuration blockers and
allow user cancellation. Serialization protects storage and native surfaces.
Parallel agents work in separate file sets; only one heavy Cargo build runs.
Use incremental DOM/context queries, bounded output (default 10k), tool paging
and context checkpointing (default 200k, model capability bounded).

Publishing a milestone is not goal completion. Report strict Done count only,
with Partial/Blocked/Planned separated. Requirements cannot be removed or weakened
to improve percentages. Meaningful new scope is proposed and recorded with an ID.
