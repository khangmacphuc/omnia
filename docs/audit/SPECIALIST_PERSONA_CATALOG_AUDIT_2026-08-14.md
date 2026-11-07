---
id: OMNIA-AUDIT-SPECIALIST-PERSONA-CATALOG-2026-08-14
title: Specialist agent and persona catalog audit
status: audit-current-tree
last_reviewed: 2026-08-14
scope:
  - specialist-agent-profiles
  - persona-packs
  - team-composition
  - runtime-resolution
  - catalog-traceability
---

# Specialist agent and persona catalog audit

## Outcome

The current target has a strong *taxonomy* for the requested specialists:
copy/content, product and visual design, competitive programming, mathematics,
physics/science, code, defensive cyber, AI/ML/data, engineering, documents and
media. It also has useful safety foundations: authority attenuation, frozen
model/context policy, bounded budgets and an explicit statement that a persona
does not grant tools or secrets.

It is not yet a countable, durable catalog. The new specialist catalog document
and role-profile schema describe an intended system, but they cannot currently
prove the charter floor of 100 differentiated agent profiles and 40 persona
packs, resolve a selected role into an execution-safe run, or reproduce that
selection after a restart. The native/domain model presently uses eight broad
agent roles rather than a versioned specialist profile/persona reference.

This audit is a design and current-tree assessment. It does **not** claim that
the specialist catalog, multimodal bridge, team planner, profile editor or
related UI has shipped.

## Evidence observed on Friday, August 14, 2026

| Observation | Evidence | Interpretation |
| --- | --- | --- |
| Rich target taxonomy exists | [`specialist-agent-persona-catalog.md`](../omnia-ultra/harness/specialist-agent-persona-catalog.md), [`agents-subagents-personas.md`](../omnia-ultra/harness/agents-subagents-personas.md) | Good coverage of role families, but prose headings are not catalog entries. |
| Persona authority boundary is stated | [`memory-skills-tools-mcp.md`](../omnia-ultra/harness/memory-skills-tools-mcp.md) | Preserve the rule that personas affect style/workflow rather than authority. |
| Current domain agent role is intentionally generic | [`agent-graph.ts`](../../src/domain/agent-graph.ts) | Static inspection found only `orchestrator`, `planner`, `explorer`, `builder`, `reviewer`, `verifier`, `researcher` and `specialist`; there is no profile/persona revision field. |
| Bounded child authority/budget primitives exist | [`agent-graph.ts`](../../src/domain/agent-graph.ts), [`agent-lifecycle-and-lineage.md`](../omnia-ultra/harness/agent-lifecycle-and-lineage.md) | A profile resolution must bind to these primitives, never replace them. |
| Existing focused domain test remains green | `npm run test -- src/domain/agent-tool-dag.test.ts` | 1 test file and 11 tests passed. This only covers current generic agent-tool DAG primitives. |
| New specialist/multimodal target is not fully integrated at this snapshot | `docs\\omnia-ultra\\tools\\validate-spec.ps1` | The validator reported new bridge/catalog/schema files absent from `manifest.allFiles`, plus no atomic mapping for goals 20 and 21. This is an integration finding during concurrent work, not a parser failure in the new files. |

## Existing coverage worth preserving

- [`agents-subagents-personas.md`](../omnia-ultra/harness/agents-subagents-personas.md)
  correctly distinguishes execution primitives such as fresh subagents,
  context forks, reviewers and monitors instead of treating every worker as one
  generic `Agent`.
- [`agent-lifecycle-and-lineage.md`](../omnia-ultra/harness/agent-lifecycle-and-lineage.md)
  provides durable identity, lease, mailbox and typed-lineage requirements.
- [`model-routing-context-policy.md`](../omnia-ultra/harness/model-routing-context-policy.md)
  has explicit scope precedence for role/persona policy and requires a frozen
  route/context decision before dispatch.
- [`specialist-agent-persona-catalog.md`](../omnia-ultra/harness/specialist-agent-persona-catalog.md)
  includes the specialist families the user requested and requires a role
  contract, not only a decorative prompt.
- [`hard-boundaries.md`](../omnia-ultra/security/hard-boundaries.md) already
  keeps cyber and machine roles within explicit, lawful boundaries.

## P0 findings

### SPC-001 — There is no machine-readable inventory from which catalog floors can be derived

The charter requires at least 100 differentiated agent profiles and 40 persona
packs. The specialist document is a grouped bullet list; it has no one-record-
per-profile inventory, no persona-pack records and no generated count. The
individual [`agent-role-profile.schema.json`](../omnia-ultra/schemas/agent-role-profile.schema.json)
does not define a catalog container, lifecycle state, count policy or entry
evidence. A hand-written sentence saying “100 profiles” could therefore pass
review without any usable profiles.

**Required remediation.** Introduce a versioned `agent-catalog` registry whose
counts are generated from valid, enabled and differentiated entries. A catalog
entry must be excluded from milestone counts when it lacks a purpose,
non-goals, input/output contract, capability ceiling, evaluation, examples,
failure modes or current evidence. A profile with a different display name but
the same contract/content hash must be flagged as potential filler, not counted
twice.

### SPC-002 — Role profile, persona pack and executed agent instance are conflated or disconnected

The target says a persona changes tone, perspective, output style and default
workflow without granting authority. The proposed role schema instead contains
an opaque capability-ceiling ID, while the runtime `AgentInstance` only stores a
generic role plus hashes. It cannot tell which catalog profile, persona pack,
skill revision, model policy or evaluation rubric was resolved for the actual
worker.

This leaves two opposite implementation risks:

1. treating a cosmetic persona as an executable role and accidentally giving it
   tools or broader data access; or
2. reducing all specialist selection to a prompt string that cannot be replayed,
   evaluated or audited.

**Required remediation.** Maintain three separate immutable objects:

| Object | Owns | Must never own |
| --- | --- | --- |
| **Role profile** | operational purpose, typed I/O, required evidence, context/memory/skill defaults, allowed tool *classes*, evaluation and stop/escalation rules | a live grant, a secret, a session/cookie, or power to widen authority |
| **Persona pack** | voice, language, explanation density, pedagogy, presentation preferences and selected default workflow | tool IDs, capability grants, secret references, live machine/browser handles |
| **Agent-instance resolution receipt** | exact profile/persona revisions, frozen policy hashes, requested/effective route, derived child ceiling, context manifest and budget | mutable catalog state or inherited live authority |

### SPC-003 — The current role-profile schema cannot express the promised role contract

The schema currently requires a category, purpose, model/context policy IDs,
tool/skill IDs, capability-ceiling ID, rubric and icon. It lacks fields the
catalog contract explicitly promises: stable display metadata and lifecycle,
input/output schemas, non-empty non-goals, mandatory context sources, memory
policy, per-tool side-effect/data-class constraints, sandbox/machine policy,
budget defaults, failure modes, escalation/stop conditions, checklists,
handoff shape, examples, evaluation suite version, evidence, availability and
deprecation/supersession data.

The schema therefore accepts a technically valid but unsafe or unusable
specialist profile. For example, a `cyber-defensive` role can currently name a
tool but cannot declare the authorised engagement scope, required approval or
prohibited result types.

**Required remediation.** Evolve the schema only with a migration path, and
make the operational fields required for shipped built-ins. The minimum
contract is listed in the atomic remediation plan below.

### SPC-004 — Specialist selection cannot currently be reproduced in the native run lineage

`AgentInstance` stores `templateVersionHash` and `providerPolicyHash`, which
are useful integrity anchors, but lacks `agentProfileId`,
`agentProfileRevisionId`, `personaPackRevisionId`, `catalogRevisionId`, route
resolution receipt and evaluation-plan reference. The execution graph thus
cannot answer “which math proof reviewer performed this work?” or reconstruct
the exact role contract after a catalog update.

**Required remediation.** Keep generic `AgentRole` as a scheduling primitive if
useful, but add a required catalog-resolution receipt at creation time. Persist
only immutable IDs/hashes and attenuated grants; resolve current catalog text
again only for new runs. Historical runs must remain readable after an entry is
disabled or superseded.

### SPC-005 — New goal/catalog/schema artifacts have not yet been connected to traceability gates

The current validator output shows five new artifacts absent from the manifest,
and the two new normative goals have no atomic requirement mappings. Until the
catalog has a requirement, capability row, acceptance row, manifest entry and
same-snapshot validation, it cannot be treated as a completed Ultra feature.

**Required remediation.** Finish the shared integration in a single stable
snapshot: manifest routes, requirement/capability/acceptance mapping, schema
registration, goal registry revision alignment and Project Twin regeneration.
Do not modify unrelated validation rules merely to make the catalog appear
complete.

## P1 findings

### SPC-006 — Taxonomy needs explicit, non-filler coverage criteria

The current prose covers the requested fields broadly, but common requests
need exact profiles that users can find and route to. Examples are a
copywriter, a competitive-programming solver versus reviewer, a proof checker
versus numerical-methods analyst, a physicist versus a lab/simulation analyst,
a visual designer versus accessibility reviewer, and a defensive security
architect versus an authorised training-lab tutor. Those distinctions affect
sources, tools, rubrics and safety gates, not just labels.

The target catalog should make these distinctions inspectable through tags,
aliases, input modalities, supported languages/frameworks, data sensitivity,
expected output artifact and handoff contract. Custom roles should start as
user-owned drafts and cannot claim built-in evaluation evidence merely because
they reuse a built-in category.

### SPC-007 — Team topology needs an expected-value and conflict contract

The catalog permits `single`, `review-pair`, `panel`, `swarm`, `debate`,
`research-team` and custom DAGs. It should additionally specify when not to
fan out, how a team budget is split, which agents are independent, which
evidence is shared, who resolves contradictions and when a completion judge is
allowed to accept results. A panel of similar model/persona choices is not
independent validation.

The planner should require a documented expected benefit over one qualified
worker, use diversity only where it is meaningful (method, source, model or
tool), and terminate fan-out on duplicate work, no-progress, budget, authority
or dependency conditions.

### SPC-008 — Model routing must bind catalog IDs rather than free-form map keys

[`model-routing-policy.schema.json`](../omnia-ultra/schemas/model-routing-policy.schema.json)
allows arbitrary keys in `roleOverrides` and has `persona` in precedence. It
does not prove that an override references a registered role/profile revision
or a compatible modality, provider, data class and tool policy. Add a semantic
validator that joins route policy to the catalog snapshot, capability snapshot
and data/locality policy before dispatch.

### SPC-009 — Defensive cyber and privileged specialties need policy data, not only prose

The hard boundaries are sound, but a role profile must carry a machine-readable
engagement class: `defensive-analysis`, `authorised-lab-training`,
`incident-response`, `forensics-read-only`, or other approved bounded mode.
It must require target/scope evidence and fresh broker review for any external
or privileged action. “Cyber specialist” must never be a shorthand for stealth,
credential extraction, unauthorised exploitation or remote control.

### SPC-010 — The future catalog UI needs truthful availability and remediation

The selection surface needs search, category/task/modality/framework filters,
sort by fit/evaluation freshness/cost/latency/locality, profile and persona
comparison, dependency warnings, provenance and a clear `planned`, `available`,
`degraded`, `disabled`, `deprecated` or `blocked` state. Users must see why a
role cannot be selected: missing model, unsupported modality, unavailable
local resource, policy/data-class denial, stale evaluation or missing approval.
It must not present a large inventory of target profiles as working agents in
the current preview.

## Dependency model to preserve

```text
Agent catalog snapshot
  -> role-profile revision + optional persona-pack revision
  -> profile-resolution receipt (policy/context/route/budget/ceiling)
  -> immutable agent instance
  -> task lease, mailbox, artifacts and result envelope
  -> evaluation evidence and catalog freshness status
```

The only direction that may affect authority is the trusted broker's fresh
evaluation of an already-approved task and the derived *attenuated* ceiling.
No catalog entry, persona, model recommendation, result envelope or learned
selector can add a tool, provider, secret, session, machine grant or approval.

## Atomic remediation plan

| Order | Atomic deliverable | Completion evidence | Depends on |
| --- | --- | --- | --- |
| 1 | Define canonical IDs for `agent-role-profile`, `persona-pack`, `agent-catalog` and `agent-profile-resolution-receipt`. | Naming/ownership/lifecycle rules are written and schema fixtures parse. | Existing canonical domain/authority contracts. |
| 2 | Split role profile from persona pack in schemas and docs. | A persona fixture with tools/grants is rejected; a role fixture without operational policy is rejected. | 1 |
| 3 | Add catalog registry schema plus generator/validator. | Generated counts, duplicate-content detection, disabled/deprecated exclusion and ID/revision uniqueness checks pass. | 1–2 |
| 4 | Upgrade role-profile schema with typed I/O, context/memory policy, tool/side-effect constraints, capability ceiling, budget, failure/stop/escalation, handoff, examples, evaluation and evidence fields. | Positive/negative JSON schema fixtures and migration fixture pass. | 1–2 |
| 5 | Add persona-pack schema restricted to presentation/workflow defaults. | Schema cannot represent a grant, secret, live session, raw tool permission or privileged operation. | 1–2 |
| 6 | Materialize the built-in catalog inventory and derive the charter counts. | 100 valid differentiated role-profile revisions and 40 valid persona-pack revisions exist; each has category, contract, test plan and evidence status. | 3–5 |
| 7 | Add a frozen profile-resolution receipt to agent creation/lineage. | A historical run resolves profile/persona/catalog/model/context/skill/evaluation revisions after catalog update or restart. | 1–5, run journal. |
| 8 | Bind the resolver to route/context/authority policy. | Tests prove a persona cannot add authority; unavailable/unsafe route falls back only through an allowed, visible policy. | 7, routing, authority broker. |
| 9 | Implement minimal-team planner and fan-in conflict contract. | Single/pair/panel/DAG tests show budgets, leases, diversity, deduplication, contradiction resolution and stop conditions. | 6–8, agent lifecycle. |
| 10 | Implement catalog workbench/search/compare/clone UI. | Keyboard, screen-reader, filter/sort, state/limitation, provenance and first-click tests pass. | 6–8, UI shell. |
| 11 | Add role-specific evaluation suites and promotion gate. | Catalog entries are promoted only from current evidence; stale/failed evidence visibly demotes availability. | 6–10, evaluation harness. |
| 12 | Register the capability atomically in manifest, requirement registry, capability ledger, acceptance catalog and Project Twin. | `validate-spec.ps1`, catalog fixtures, focused domain tests and `npm run twin:check` all pass on one snapshot. | 1–11 |

## Catalog coverage plan for the charter floor

The following is a **target inventory allocation**, not a claim that the
profiles already exist. Each number must be backed by distinct valid manifests
and role-specific tests before it counts.

| Family | Target profiles | Example non-interchangeable roles |
| --- | ---: | --- |
| Orchestration, requirements, product and assurance | 14 | goal architect, planner, task-DAG compiler, integrator, completion judge, evidence auditor |
| UX, visual design, content and accessibility | 13 | UX researcher, interaction architect, visual designer, design-system maintainer, copywriter, Narrator/high-contrast reviewer |
| Learning, research and competitive programming | 10 | Socratic tutor, curriculum planner, source auditor, CP solver, CP proof reviewer, stress-test engineer |
| Mathematics, science, physics and engineering | 14 | proof checker, symbolic/numerical analyst, physics modeller, lab-method reviewer, chemistry/biology analyst, systems engineer |
| Software, platform and data engineering | 18 | Rust/TypeScript/Python/C++ engineer, database, distributed systems, frontend, native Windows, SRE, test/fuzz engineer |
| AI, ML, data and multimodal systems | 11 | ML scientist, MLOps engineer, data scientist, evaluator, NLP, vision, speech, multimodal and agent-systems specialist |
| Defensive cyber, privacy, reliability and supply chain | 10 | threat modeller, secure-code auditor, dependency auditor, detection/response analyst, incident coordinator, authorised-lab tutor |
| Documents, media and artifact production | 6 | DOCX/PDF, spreadsheet, slides, LaTeX, image/video/audio, render-and-verify reviewer |
| Provider, local model, runtime and integration engineering | 4 | provider-protocol engineer, local-model/runtime engineer, routing/telemetry analyst, connector/automation engineer |
| **Total** | **100** | All profiles remain individually versioned and evidence-gated. |

The corresponding 40 persona packs should be concrete presentation/workflow
defaults across four sets: 10 writing/design/learning packs, 8
research/science packs, 10 build/code packs and 12 AI/data/security/operate
packs. Examples include `concise-copy-editor`, `socratic-tutor`,
`proof-first-mathematician`, `experiment-rigorous-scientist`,
`contest-coach`, `production-rust-engineer`, `defensive-security-reviewer`,
`evidence-first-researcher` and `accessible-product-designer`. These are
personality/workflow selections; the role profile and trusted resolver remain
the operational and authority source of truth.

## Required acceptance cases

1. A catalog count is derived only from valid enabled profiles/personas and
   cannot be inflated by aliases, duplicate content, drafts or deprecated rows.
2. A role profile with no non-goals, typed input/output, failure modes,
   escalation rule, evaluation or evidence is rejected for built-in release.
3. A persona pack attempting to specify a tool, grant, secret, browser session,
   environment or approval is rejected.
4. A selected agent run retains exact profile/persona/catalog/model/context/
   skill/evaluation revisions and survives catalog update, disablement and
   restart.
5. A child profile cannot widen the parent tool, model/provider, data or
   machine ceiling; a role change re-runs the trusted broker before dispatch.
6. A missing local model, unsupported modality, stale evaluation or privacy
   denial produces a specific visible unavailable reason, not a silent generic
   fallback.
7. A CP/math/science/code/cyber/AI/engineering workflow produces its declared
   artifact and is checked by a relevant deterministic or independent rubric.
8. Multi-agent fan-out shows task ownership, duplicate-work prevention,
   mailbox/lease recovery, conflict evidence, budget consumption and a
   completion-judge receipt.
9. Cyber roles are limited to the declared authorised engagement and cannot
   bypass the product hard boundaries through profile text or tool selection.
10. The catalog workbench is searchable, filterable, sortable, keyboard and
    screen-reader usable, and truthful about planned versus available entries.

## Recommended next slice

Treat the specialist catalog as a dependency-gated planned capability. The
smallest implementation slice with durable value is: create the three distinct
schemas, one catalog registry with a handful of real profiles/personas, a
profile-resolution receipt stored on `AgentInstance`, and schema/domain tests
that prove authority attenuation. Expand toward the 100/40 target only after
that vertical slice is versioned, inspectable and replayable.
