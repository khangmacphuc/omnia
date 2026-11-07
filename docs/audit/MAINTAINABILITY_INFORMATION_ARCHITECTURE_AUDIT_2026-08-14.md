---
id: OMNIA-AUDIT-MAINTAINABILITY-IA-2026-08-14
title: Omnia Ultra maintainability and information-architecture audit
status: audit-current-tree
last_reviewed: 2026-08-14
scope: documentation-routing, contract-governance, registry-integrity, target-versus-current-status
---

# Omnia Ultra maintainability and information-architecture audit

## Outcome

The Omnia Ultra pack is already much stronger than a single giant goal prompt:
it has a canonical copy-ready prompt, a manifest, requirement/capability
registries, schemas, delivery gates and a current-state bridge. The pack
validator passed when this audit was run. The main remaining maintainability
risk is **authority ambiguity across documentation planes**, not a lack of
feature ideas.

A new human or AI can currently enter through `docs/README.md`, receive the
historical Chat Complete / chat-first product contract, and never learn that
the forward target is the Universal Omnia Ultra charter unless it independently
discovers `docs/omnia-ultra/`. That makes a technically correct implementation
worker capable of optimizing the wrong product boundary.

This audit is a documentation and governance assessment. It does not claim
that any planned Ultra capability is implemented or that a release gate has
passed.

## Audit method and evidence boundary

The audit inspected the current-tree entry points, product/status precedence,
Omnia Ultra manifest and routing rules, goal requirement registry, capability
ledger/schema, Project Twin catalog and the spec validator. It used static
inspection and the following same-tree command:

```powershell
docs\omnia-ultra\tools\validate-spec.ps1
```

The validator passed at the audited snapshot, confirming local pack-file,
Markdown-link, JSON, goal/ledger and ID consistency under the checks it
currently implements. Passing it does not prove that every frontmatter pointer
has a defined resolver, that root-level entry points route to the newest target,
or that every capability has an atomic implementation plan.

## The five documentation planes that must remain distinct

| Plane | Purpose | Correct authority examples | Must never be mistaken for |
| --- | --- | --- | --- |
| **Target** | What Omnia is ultimately intended to become | `../omnia-ultra/01-MASTER-CHARTER.md`, `../omnia-ultra/goal/00-copy-ready-prompt.md`, target requirements | Current implementation evidence |
| **Current state** | What works, is partial, blocked or unverified in this checkout | `../IMPLEMENTATION_STATUS.md`, dated audit receipts, source and tests | A promise that the target is restricted to the current release lane |
| **Constraint** | Security and architecture invariants that constrain every target | `../THREAT_MODEL.md`, accepted ADRs, `../omnia-ultra/security/` | Optional product ideas |
| **Evidence projection** | Generated views of a source snapshot | `../project-twin/`, reports, generated atlas | The canonical target contract or live runtime truth |
| **Research** | Source-backed design input and adoption rationale | `../research/`, source ledger | A final product requirement or implementation claim |

The first three planes need direct, visible routing from every major entry
point. The fourth and fifth need explicit provenance and freshness markers.

## Findings

### P0 — IA-001: a first-entry maintainer can select the obsolete product boundary

**Evidence.** `../README.md` and `../PRODUCT_SPEC.md` state the historical
Chat Complete / chat-first product sequence and defer IDE, browser,
computer-use and autonomous coding. `../README.md` routes a maintainer first
to `../IMPLEMENTATION_STATUS.md` and `../PRODUCT_SPEC.md`, and its
source-of-truth section names `PRODUCT_SPEC.md` as product scope. In contrast,
`../omnia-ultra/01-MASTER-CHARTER.md` defines the forward universal workbench,
while `../omnia-ultra/04-CURRENT-STATE-BRIDGE.md` says the old chat-first
language is historical.

**Why it matters.** The reconciliation exists only *inside* the Ultra pack.
An agent following the root documentation map can safely but incorrectly
conclude that browser, IDE, agents and machine features are out of product
scope rather than future target requirements gated by security and evidence.

**Required remediation.** Add a single, explicit product-target routing
decision. It should state:

1. `docs/omnia-ultra/01-MASTER-CHARTER.md` is the forward product target for
   Ultra work.
2. `docs/PRODUCT_SPEC.md` and the chat-first portions of the root README are
   the current Phase 1 / Chat Complete release-lane contract, not a permanent
   exclusion of the Ultra target.
3. `docs/IMPLEMENTATION_STATUS.md`, source and same-snapshot evidence are the
   only authorities for whether a capability is available now.
4. Security constraints and accepted ADRs remain binding across both tracks.

Put this decision in a small proposed/accepted ADR or in an explicitly
versioned top-level target-routing contract. Then update the root README and
`../README.md` to route a task by **intent**: current-release operation,
forward Ultra product work, security-sensitive work, or evidence verification.
Do not erase historical Phase 1 documentation; relabel it as a release lane.

**Closure test.** A fresh worker who starts at the repository README can
identify, without search, (a) the forward Ultra target, (b) the current
implementation truth, (c) the historical Phase 1 boundary, and (d) the
security constraints that cannot be overridden by the target.

### P0 — IA-002: Project Twin has a current release target but no explicit Ultra target plane

**Evidence.** `../project-twin/catalog.json` models `goal.chat-complete` and
`non-goal.autonomous-coding`, whereas the forward target charter explicitly
includes IDE, browser, computer use and agent work. The current-tree Twin
README correctly says the catalog is a generated evidence projection, but the
catalog has no clearly labeled `goal.omnia-ultra` node, no lineage to the Ultra
charter, and no distinction between “deferred in the current release lane” and
“not part of the forward target.”

**Why it matters.** A graph is highly persuasive. If the only visible target
node says later capabilities are non-goals, the atlas can silently reintroduce
the old product decision into planning, search and agent context selection.

**Required remediation.** Give the graph two explicit planes, not two
competing truths:

- `target.omnia-ultra` — planned forward charter, linked to the Ultra
  requirement registry and its version;
- `release.phase1-provider-preview` / `milestone.chat-complete` — scoped
  current release objectives, linked to current evidence;
- a typed relation such as `deferred_from_release_lane`, not a global
  `non-goal`, for later IDE/browser/machine capabilities.

The generated atlas must display the plane, scope and snapshot revision for
each target node. A node may be planned in the target plane and deferred in the
current release plane at the same time without contradiction.

**Closure test.** Filtering a generated Twin by target versus current state
shows both charts, their source revisions, and no query can collapse a
release-lane deferment into a global product rejection.

### P1 — IA-003: nested contract frontmatter contains unresolved schema-looking paths

**Evidence.** Twelve nested Ultra documents declare frontmatter such as
`schema: schemas/conversation-navigation.schema.json`. From a document such as
`../omnia-ultra/interaction/branching-copy-fork.md`, ordinary document-relative
resolution targets a nonexistent `interaction/schemas/` directory. The same
pattern occurs in interaction, observability, Project Twin, runtime and
workbench contracts. `validate-spec.ps1` validates JSON `$schema` values and
Markdown links, but it does not validate Markdown frontmatter `schema:` fields
or define their base directory.

**Why it matters.** Different tools can resolve the same value differently:
one as pack-relative, another as document-relative, and a third not at all.
That defeats the stated goal of letting another AI or maintainer locate the
durable schema safely.

**Required remediation.** Choose one convention and make it executable:

1. Prefer `schema_ref: schemas/<name>.schema.json` with a documented
   **pack-root-relative** resolver; or use document-relative `../schemas/...`
   values consistently.
2. Give the field a stable name (`schema_ref`) so it cannot be confused with a
   JSON Schema URI.
3. Extend the spec validator to resolve every `schema_ref`, require a matching
   manifest schema entry and verify a compatible `$id` where applicable.
4. Add a negative validator fixture for a dangling frontmatter schema pointer.

**Closure test.** Deliberately changing one `schema_ref` to a missing file
fails `validate-spec.ps1`; every current schema-bearing Markdown contract
resolves by the documented algorithm.

### P1 — IA-004: the "atomic" requirement registry is still at feature-family granularity

**Evidence.** `../omnia-ultra/goal/requirements.json` has 41 requirements.
That is a useful coverage floor, but several rows combine independently
implementable and independently testable capabilities, for example memory,
skills, personas, tools and MCP; IDE, Git, Docker, CI/CD and code intelligence;
or agents, subagents, teams and background workflow. One broad acceptance row
cannot give a future worker a safe smallest-change boundary, reliable owner or
meaningful partial rollout state.

**Why it matters.** A single large row lets a ledger say “partial” while hiding
which operation, permission, persistence model, UI flow, model route or
recovery path is missing. It also makes dependency planning and evaluation
signals too coarse for the adaptive harness.

**Required remediation.** Preserve the 41 rows as **capability-family**
requirements, then add child requirements only where an item has an independent
user outcome, durable object, permission boundary, provider translation,
security class, migration, test gate or rollout toggle. Add fields such as:

```json
{
  "requirementId": "OMNIA-REQ-AGENT-LEASE-RECOVERY",
  "parentRequirementId": "OMNIA-REQ-AGENT-SWARM",
  "level": "atomic",
  "readSet": ["OMNIA-ULTRA-AGENT-LIFECYCLE", "OMNIA-ULTRA-HARD-BOUNDARIES"],
  "acceptanceRefs": ["OMNIA-ACC-AGENT-LEASE-RECOVERY"],
  "rolloutDependencies": ["OMNIA-REQ-RUN-JOURNAL"],
  "stateModel": ["agent", "lease", "checkpoint", "receipt"]
}
```

This is not a request to create filler IDs. “Atomic” means a worker can
implement, test, roll back and observe the item without falsely claiming its
sibling capability is complete.

**Closure test.** Every broad family can be expanded into child rows, the
family status is mechanically derived from its children, and every atomic row
has one primary acceptance owner and a typed test/evidence route.

### P1 — IA-005: the human coverage contract requires fields the canonical JSON ledger forbids

**Evidence.** `../omnia-ultra/delivery/capability-coverage.md` says every row
must carry an owner and last verified source snapshot. It also names
`capability-ledger.json` as the canonical row source. However,
`../omnia-ultra/schemas/capability-ledger.schema.json` has
`additionalProperties: false` and does not allow `owner`, `owners`,
`lastVerified`, source snapshot, review or staleness fields. Thus a ledger row
cannot satisfy the Markdown contract without failing the JSON schema.

**Why it matters.** Ownership, evidence freshness and current limitations are
the fields that prevent a large vision from becoming an unmaintained catalog.
When the schema rejects them, maintainers will either omit them, keep a second
unvalidated spreadsheet, or add informal prose that drifts.

**Required remediation.** Extend the canonical ledger schema and all rows with
typed, non-secret governance fields. A minimal shape is:

```json
{
  "owners": ["team-or-persona-id"],
  "lastVerified": {
    "at": "RFC-3339 timestamp or null",
    "sourceSnapshot": "immutable revision/hash or null",
    "evidenceIds": ["stable evidence IDs"],
    "result": "not-run | passed | failed | blocked | partial"
  },
  "reviewCadence": "on-change | scheduled | release-gate",
  "staleness": "fresh | stale | unknown"
}
```

Use `unassigned` only with an explicit reason and deadline. The validator
should require that a `verified` capability has an immutable source snapshot,
at least one evidence ID and a passing result; a `planned` capability may
legitimately have empty implementation modules/tests/evidence.

**Closure test.** No required column in the human coverage contract is absent
from the canonical JSON schema, and a stale verified row is automatically
reported rather than silently retained.

### P1 — IA-006: the target requirements, implementation inventory and Project Twin lack one typed crosswalk

**Evidence.** The repository has all of the right artifacts—goal requirement
registry, capability ledger, source ledger, architecture contracts, status
matrix and Project Twin catalog—but no single machine-readable route from a
stable requirement ID to its canonical document IDs, implementation modules,
tests, evidence IDs, generated Twin nodes and current status row. The existing
registries reference paths but do not completely define document authority,
task read sets or generated-node provenance.

**Why it matters.** A future agent may update one representation and forget
the others. The current maintenance protocol says to update them together, but
it relies on human memory instead of a validator-checked dependency graph.

**Required remediation.** Extend the existing `manifest.json`; do not create a
competing unbounded inventory. Give each documentation file a stable document
ID record with at least:

```json
{
  "documentId": "OMNIA-ULTRA-RUN-CONTROL",
  "path": "interaction/run-control-edit-retry.md",
  "role": "canonical-contract",
  "authorityPlane": "target",
  "version": "1.0.0",
  "supersedes": [],
  "requires": ["OMNIA-ULTRA-AUTHORITY-EVENT"],
  "refreshTriggers": ["durable-state-change", "schema-change"],
  "requirementIds": ["OMNIA-REQ-RUN-CONTROL-EDIT-RETRY-STATE"]
}
```

Use document IDs, requirement IDs, capability IDs, test IDs and evidence IDs
as graph keys. Paths should be locators only. Generate the human routing tables
and Project Twin target edges from this crosswalk, while the current-tree Twin
continues to be generated from source/evidence.

**Closure test.** Renaming a contract path succeeds only when the manifest,
goal registry, ledger, Twin catalog and links are updated or generated; orphan
or multiply-authoritative requirement mappings fail validation.

### P2 — IA-007: normative-document lifecycle metadata is inconsistent outside goal files

**Evidence.** Goal files have version, review date, supersession and registry
revision metadata, and the validator enforces that subset. A large majority of
other `normative` or `normative-target` Ultra documents have only an ID/title/
status, or a partial subset. Some newer contracts carry a `schema` pointer but
no version; some indexes are normative targets without a review date. The
validator currently requires lifecycle metadata only for normative goal files.

**Why it matters.** A semantic change to a schema-bound runtime or security
contract has more migration impact than a copy-ready goal paragraph. Without a
uniform lifecycle policy, a maintainer cannot know whether an old contract was
superseded, whether a link refers to compatible semantics, or which documents
need review after an architectural change.

**Required remediation.** Define metadata tiers rather than blindly applying
the goal template everywhere:

| Document role | Minimum metadata | Additional rule |
| --- | --- | --- |
| Canonical contract | ID, title, status, semantic version, reviewed date, supersedes, owner/review group | Validate version bump on a declared breaking change |
| Navigation/index | ID, title, status, reviewed date, generated-from/source | No requirement-registry revision needed |
| Schema | `$id`, schema version, compatibility/migration note | Referenced contracts name the schema version they depend on |
| ADR | number, status, decision date, supersedes/amends | Immutable decision body; new ADR for reversal |
| Audit/evidence receipt | ID, scope, observed-at, source snapshot, status | Never silently upgraded after source changes |
| Generated projection | generator version, input snapshot hash, generated-at | Never treated as authoritative target text |

Then extend validation by role. Do not require
`requirements_registry_revision` on every index; require it only for goal
documents that intentionally summarize requirement records.

**Closure test.** The validator can report a complete lifecycle inventory and
fails a missing required field for the document role, without forcing irrelevant
metadata on research or generated artifacts.

### P2 — IA-008: “always read” is necessary for safety but too expensive as a primary task-routing mechanism

**Evidence.** The manifest has a substantial `readingProtocol.always` list and
domain-specific arrays, while the entry-point table routes requests manually.
The requirement registry contains canonical specs and dependencies but does not
yet carry a validated minimal read set or an explicit “why this is required”
reason per task.

**Why it matters.** Reading everything minimizes omission but increases context
cost and lost-in-the-middle risk—the exact failure mode Omnia is designed to
solve. Reading only a guessed domain minimises cost but can skip security,
state or evidence invariants.

**Required remediation.** Make deterministic, inspectable task recipes part of
the expanded manifest crosswalk:

- **always:** status/evidence and constraint documents necessary for every
  code change;
- **hard triggers:** security/runtime documents for a matching capability
  class;
- **primary:** canonical contracts for selected requirement IDs;
- **dependency closure:** only the referenced requirement/document IDs;
- **optional research:** cited only when a decision remains unresolved.

For every compiled read set, save a small context manifest containing selected
documents, versions, inclusion reason, omitted candidates and token estimate.
This applies the same inspectable context discipline to maintainers that the
product demands for end-user prompts.

**Closure test.** Given a requirement ID, tooling returns the minimal required
document set, its dependency closure and every security/evidence addition;
changing a hard-trigger classification changes the result in a test fixture.

## Recommended implementation order

1. **Resolve IA-001 first.** Accept and publish target/current/release-lane
   routing; update every primary entry point.
2. **Resolve IA-003 and IA-005 next.** They are concrete schema/validator
   inconsistencies that can cause silent documentation drift.
3. **Add the manifest crosswalk from IA-006.** Make the existing registries and
   Twin relationships machine-checkable before multiplying requirement IDs.
4. **Resolve IA-002.** Generate separate target and current-state Twin planes
   from the crosswalk and current evidence.
5. **Expand IA-004 incrementally by workstream.** Start with active run
   control, provider/telemetry and security-sensitive runtime requirements;
   avoid a giant mechanical rewrite.
6. **Adopt IA-007 and IA-008 as governance gates.** Enforce metadata by
   document role and implement small task recipes before broad parallel work.

## Non-regression acceptance checklist

- [ ] There is one visible entry-point answer to “what is Omnia ultimately
  building?” and a separate answer to “what works in this checkout?”
- [ ] A release-lane deferment cannot be interpreted as a global product
  non-goal.
- [ ] Every frontmatter schema reference has a documented, validator-tested
  resolver.
- [ ] The canonical capability ledger can represent all fields the human
  coverage policy mandates.
- [ ] Every requirement has exactly one family/root position, an unambiguous
  canonical contract and a non-empty acceptance route.
- [ ] An atomic child requirement has a smallest safe implementation/test
  boundary; broad parent statuses are derived rather than hand-waved.
- [ ] Manifest/document/requirement/capability/test/evidence/Twin references
  form a validator-checked graph with stable IDs.
- [ ] Canonical contracts, navigation files, audits and generated projections
  follow distinct metadata and freshness rules.
- [ ] A task recipe returns the minimal safe reading set plus its reason and
  dependency closure.
- [ ] No audit, ledger, graph, goal prompt or UI wording promotes planned or
  blocked work into an implementation claim.

## Deliberate non-actions

This audit does not bulk-rename files, mutate the current-release Phase 1
documentation, or mechanically generate hundreds of requirement rows. Those
actions would be high-churn without an accepted target-routing decision and a
typed crosswalk. It also does not replace current source/test evidence with
goal-pack text.

## Snapshot note

After the audit snapshot, concurrent work added
`architecture/state-revision-graph.md` and
`schemas/state-revision-graph.schema.json` under the Ultra pack. A subsequent
validator run correctly reported both as absent from `manifest.allFiles`.
Manifest registration and the final same-snapshot validator rerun belong to
the state-graph/registry workstream; this audit intentionally does not edit
those shared files.
