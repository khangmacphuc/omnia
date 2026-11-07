---
id: OMNIA-ULTRA-HARNESS-SPECIALIST-PERSONA-CATALOG
title: Built-in specialist agent and persona catalog
status: normative-target
version: 1.0.0
last_reviewed: 2026-08-14
supersedes: []
---

# Specialist agent and persona catalog

Omnia ships a broad built-in catalog so common work does not wait for the user
to invent an agent, skill or rubric. Catalog entries are versioned role
contracts, not cosmetic system prompts. Users can inspect, clone, compose,
override, disable or create new roles at global/project/chat/task scope.

## Core orchestration and assurance roles

- goal architect, product strategist, planner, task-graph compiler;
- context librarian, memory curator, retrieval/knowledge-graph engineer;
- main implementer, parallel worker, integrator, completion judge;
- requirements, architecture, code, test, performance, reliability, security,
  privacy, accessibility, visual, cost and evidence auditors;
- provider/protocol engineer, local-model/runtime engineer, routing/cache/
  telemetry analyst, release/CI/CD/migration/rollback engineer;
- adversarial critic, contradiction detector, fact checker, citation verifier,
  regression hunter and incident/recovery coordinator.

## Design and content roles

- product/UI/UX designer, interaction architect, information architect;
- icon-system, typography, color, layout, motion/microinteraction and Windows
  native design specialists;
- design-system maintainer, accessibility/Narrator/high-contrast specialist,
  responsive/touch/remote-client designer and visual QA reviewer;
- image, video, audio, document, spreadsheet, slide, LaTeX, web/canvas and
  artifact designers/editors with render-and-verify reviewers.

## Learning, research and scientific roles

- learning diagnostician, curriculum/roadmap planner, Socratic tutor, deep-
  explanation author, exercise/problem generator, grader and spaced-review
  planner;
- competitive-programming coach, problem classifier, proof/complexity analyst,
  solution author, stress-test/generator and contest reviewer for IOI/ICPC/
  Codeforces/AtCoder/LeetCode-style work;
- pure/applied mathematics, proof, numerical methods and symbolic-computation
  specialists;
- physics, chemistry, biology, earth/space science, engineering and laboratory/
  simulation specialists;
- literature search, systematic review, methodology/statistics, research-gap,
  reproducibility, experiment design, data analysis and scientific-writing
  specialists.

## Software, AI and cyber roles

- language/framework specialists for C/C++, Python, Rust, TypeScript/JavaScript,
  Java/Kotlin, C#, Go, SQL, shell/PowerShell and extensible additions;
- algorithms/DSA, systems, distributed, database, networking, cloud, mobile,
  desktop, web, embedded, graphics, game and DevOps/SRE engineers;
- AI/ML/DL, data science/analytics, data engineering, MLOps, evaluation,
  optimization, classical ML, NLP, vision, speech, multimodal and agentic-
  system specialists;
- defensive cybersecurity, secure architecture, threat modeling, code audit,
  dependency/supply-chain, detection/response, forensics and authorized
  lab/pentest education specialists. Offensive or privileged actions remain
  approval- and scope-bound by the security broker.

## Role contract

Each persona records role ID/revision, purpose/non-goals, expertise taxonomy,
default model/effort and Auto candidates, tools/skills/MCP, context mode and
mandatory sources, capability ceiling, sandbox/machine policy, input/output
contract, checklist, evaluation rubric, stop/escalation conditions, cost/time
budget, handoff packet, role icon and runtime-state glyph. Icons are modern,
subtle and non-stereotypical; activity animation is separate from role identity
and respects reduced motion.

## Dynamic team composition

The workflow compiler selects a minimal dependency-complete team, then may
fan out specialists and fan in through an integrator, critic and completion
judge. Selection uses task taxonomy, modality, risk, uncertainty, expected
value, cost/latency and prior evaluation. A learned selector remains bounded by
the approved catalog and cannot grant tools or secrets. The user can pin roles,
models and collaboration topology or choose `Auto`, `single`, `review-pair`,
`panel`, `swarm`, `debate`, `research-team` or custom DAG.

## Acceptance evidence

Tests cover catalog schema/versioning, role cloning/override, deterministic
tool/context/authority ceilings, model fallback, handoff completeness, fan-in
conflict resolution, evaluation rubrics, icon/state accessibility, budget and
recursion limits, and representative design/CP/math/science/code/cyber/AI/
engineering workflows without hidden privilege.

The current machine-readable snapshot is maintained under
`harness/catalog/README.md`. It contains 10 enabled role profiles and 6 enabled
persona packs; the roadmap targets 100 roles and 40 personas, and the shortfall
must remain visible until evidence-backed records exist. The snapshot, source
bundles and validator are:

- `harness/catalog/agent-catalog.json`;
- `harness/catalog/role-profiles.json`;
- `harness/catalog/persona-packs.json`;
- `harness/catalog/README.md`;
- `../tools/validate-agent-catalog.mjs`.

Operational role records use `../schemas/agent-role-profile-v2.schema.json`;
the v1 `../schemas/agent-role-profile.schema.json` remains a compatibility
contract for existing workflow references until the schema-authority migration
is complete. Presentation personas use `../schemas/persona-pack.schema.json`,
catalog references use `../schemas/agent-catalog.schema.json`, and frozen
runtime selection is recorded by
`../schemas/agent-profile-resolution-receipt.schema.json`.

See `academic-specialist-taxonomy.md`,
`../schemas/academic-specialist-workflow.schema.json`,
`agents-subagents-personas.md`, `agent-lifecycle-and-lineage.md` and
`evaluations-learning-routing.md` for the broader target design. This document
describes the target orchestration contract; a validated catalog snapshot does
not by itself claim end-to-end runtime resolution or UI integration.
