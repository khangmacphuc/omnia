---
id: OMNIA-ULTRA-GOAL-PROJECT-TWIN-LIFECYCLE
title: Project Twin and goal lifecycle contract
status: normative-target
version: 1.0.0
last_reviewed: 2026-08-14
supersedes: []
requirements_registry_revision: 2026-08-14.6
---

# Project Twin and goal lifecycle contract

Every non-trivial Omnia project, research effort, study plan, software build
or engineering task receives a Project Twin. The Twin is a maintained
multi-representation system, not a single Markdown note: it combines readable
Markdown, structured JSON/graph data and an interactive HTML/CSS/TypeScript/
JavaScript atlas. Optional diagrams, screenshots and media previews are linked
as artifacts with source, licensing, render and staleness evidence.

## Goal to delivery graph

The canonical graph contains goal, non-goals, assumptions, constraints,
personas, success metrics, roadmap, architecture/blueprint, plan, milestones,
task DAG, dependencies, owners, agents, approvals, decisions, risks,
experiments, source claims, artifacts, tests, evidence and releases. Nodes have
stable IDs, revision, status, confidence, source/ref links, content hashes and
staleness propagation. Edges have a typed relation, provenance and lifecycle.

Goal, roadmap, blueprint, plan and task are distinct objects:

- A **goal** defines an outcome and acceptance criteria.
- A **roadmap** orders milestones and dependency boundaries.
- A **blueprint** explains architecture, interfaces, data flow and tradeoffs.
- A **plan** selects implementation/test steps for a particular revision.
- A **task** is assignable, observable work with parent/dependency/lease state.

An agent can draft or update any of these at project, conversation or global
scope only with visible proposed diff, provenance, confidence and approval
semantics. User-pinned content is never silently overwritten. A smart project
overview/title refreshes only on material root, goal, branch, decision,
milestone or evidence changes; it records the prior version, candidate diff,
source watermark, actor and rollback action.

## Multi-format output policy

Markdown is the compact narrative and AI reading path. JSON is the canonical
machine graph/query path. The HTML/CSS/TS/JS atlas is the interactive visual
path for graph navigation, dependency timelines, source/evidence drill-down,
accessibility alternatives and rich preview placement. No representation is
allowed to become an untracked duplicate truth source: each must identify its
canonical graph revision and generated/source status.

For code projects, the Twin maps module, file, symbol/function/class, API,
schema, migration, test, test receipt, risk, ADR and source line. For learning
projects, it maps prerequisites, concepts, definitions, derivations, proofs,
patterns, examples, counterexamples, exercises, assessment, historical
motivation, applications, research gaps and spaced-review plan. For research,
it maps claims to cited sources, observed/inferred/unknown classification,
methods, dataset/provenance, experiment and reproducibility artifacts.

## Staleness and evidence

Any source, schema, dependency, test or decision change marks dependent views
as stale through graph edges. The interface identifies the cause, affected
downstream nodes, last verified source hash, confidence impact and refresh
action. A render is not proof of current content; generated atlas, graph and
manifest outputs are revalidated against the source snapshot before release
claims. Exact file/symbol/line references must resolve, and an evidence receipt
must be distinguished from a source file that merely contains a test.

## Workflow agents and task visibility

Background agents create stable agent/task nodes with role, state, parent,
capability ceiling, lease, input/context manifest, tools, output, artifact,
source, telemetry, cost, checkpoint, approval and completion evidence. The
project header summarizes active tasks and material changes without producing
an update for every token. Opening a task exposes current input/output and
latest durable checkpoint; the user can steer, pause, resume, cancel, fork or
promote according to policy.

## Acceptance gate

Every Twin update must preserve source provenance, line/hash validation,
render/accessibility evidence for its atlas, status truthfulness and historical
decision lineage. See `../project-twin/README.md`,
`../project-twin/graph-and-atlas.md`,
`../project-twin/roadmaps-blueprints-plans.md` and
`../project-twin/update-provenance-staleness.md`.
