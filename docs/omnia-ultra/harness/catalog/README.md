---
id: OMNIA-ULTRA-HARNESS-CATALOG-README
title: Specialist catalog maintenance and lifecycle policy
status: operational
version: 1.0.0
last_reviewed: 2026-09-10
supersedes: []
---

# Specialist catalog maintenance

This directory is the machine-readable source of truth for Omnia's built-in
specialist roles and presentation personas. The catalog is deliberately
versioned and evidence-backed: a milestone target is not counted as an
implemented profile. The checked-in snapshot currently contains 10 enabled
role profiles and 6 enabled persona packs. The roadmap targets 100 roles and
40 personas; until those records exist and pass validation, the validator
reports the shortfall as a warning.

## Files and ownership

| File | Responsibility |
| --- | --- |
| `role-profiles.json` | Operational role contracts: typed I/O, tools, skills, model/context/memory policies, ceilings, budgets, stop/escalation rules and evaluations. |
| `persona-packs.json` | Presentation, language, pedagogy and workflow defaults only. Personas never grant authority. |
| `agent-catalog.json` | Immutable-ish snapshot of registered role/persona revisions, hashes, lifecycle and derived counts. |
| `../../schemas/agent-role-profile-v2.schema.json` | Role contract schema used by the current snapshot. |
| `../../schemas/persona-pack.schema.json` | Persona contract schema and authority boundary. |
| `../../schemas/agent-catalog.schema.json` | Catalog reference, lifecycle and count schema. |
| `../../schemas/agent-profile-resolution-receipt.schema.json` | Redacted replay receipt for a resolved role/persona/team. |
| `../../tools/validate-agent-catalog.mjs` | Dependency-free deterministic validator. |

The catalogs are declarative. They describe what a runtime may resolve; they
do not contain credentials, cookies, sessions, approval handles, live tools,
machine paths or provider payloads. Native authority is still granted by the
runtime security broker and is evaluated at dispatch time.

## Lifecycle and counting policy

Every record has a stable ID, a revision ID and a lifecycle. `enabled` is the
only lifecycle counted as available. A record is counted only when all of the
following are true:

1. the catalog reference and source record agree on ID, revision and lifecycle;
2. evidence status is `current`;
3. the reference is not an alias; and
4. its differentiation hash is valid.

`draft`, `disabled`, `deprecated`, `superseded` and `blocked` records remain
readable for history and migration but are excluded from availability counts.
An alias must name `aliasOf` and is excluded from milestone counts. Duplicate
canonical hashes fail validation even when IDs differ; this prevents filler
records that only rename the same operational contract.

Historical resolution receipts may continue to reference a record after it is
disabled or superseded. Runtime replay must load the recorded revision and
preserve the original hash rather than silently substituting the current
record.

## Role/persona boundary

Roles define operational capability within a bounded ceiling. They may refer
to approved tool classes, data classes, network engagement classes, sandbox
policies and skill IDs, but they never embed the actual grants or secrets.
Child/team resolution can attenuate a parent ceiling only; learned routing,
Auto selection and persona composition cannot widen it.

Personas shape language, explanation density, pedagogy, presentation and
workflow defaults. The validator rejects authority-like keys such as
`toolIds`, `grantIds`, `secretRefs`, `sessionId`, `environmentId`,
`approvalId`, `modelPolicyId`, `contextPolicyId`, `memoryPolicyId`,
`skillIds`, `networkPolicy` and capability/sandbox ceilings. If an operator
needs a different permission, create or revise a role and obtain the normal
broker approval; do not smuggle it through a persona.

## Adding or revising a record

1. Choose a new stable lowercase ID. Do not recycle an old ID for a different
   contract.
2. Copy the closest existing record, then change the purpose, non-goals,
   typed contracts, tool/data policy, budgets, stop conditions, handoff and
   evaluation so the new record is genuinely differentiated.
3. Set a new `revisionId`, evidence IDs/source references and ISO timestamps.
   Keep raw prompts, credentials, cookies and protected file contents out of
   the record.
4. Add the record to the corresponding bundle and add an exact reference to
   `agent-catalog.json`.
5. Recompute the reference `canonicalHash` and `differentiationHash` with the
   validator's canonical key sets. Canonical hashes intentionally omit
   identity, lifecycle, evidence and timestamps.
6. Update `derivedCounts` from the validator output. Do not hand-edit counts
   to claim a milestone that the source records do not support.
7. Add or update a role-specific evaluation fixture and a resolution-receipt
   replay case before marking evidence `current`.

Run these checks from the repository root:

```powershell
node docs\omnia-ultra\tools\validate-agent-catalog.mjs --check
node docs\omnia-ultra\tools\validate-agent-catalog.mjs --json
pwsh -NoProfile -File docs\omnia-ultra\tools\validate-spec.ps1
npx vitest run tests/spec/agent-catalog.test.ts
```

The JSON report is suitable for CI. A non-zero exit means the snapshot is not
safe to publish. Milestone shortfalls are warnings by design; schema, hash,
authority-boundary, reference and duplicate failures are hard errors.

## Runtime integration checklist

The catalog snapshot is only one layer of the feature. A production runtime
still needs to:

- resolve a role/persona against a frozen catalog revision;
- emit a redacted `agent-profile-resolution-receipt` containing route,
  context, memory, model, skills, ceilings, budgets and evaluation IDs;
- attenuate child/team authority and reject widening requests;
- expose lifecycle-aware search/filter/sort and truthful availability in the
  accessible UI;
- keep old receipts replayable after catalog updates;
- run role-specific evaluations and record promotion/rollback evidence.

Until those runtime and UI pieces are wired and verified, this directory must
not be described as end-to-end specialist orchestration.
