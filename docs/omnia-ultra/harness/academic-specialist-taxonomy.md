---
id: OMNIA-ULTRA-HARNESS-ACADEMIC-SPECIALIST-TAXONOMY
title: Academic, scientific and technical specialist taxonomy
status: normative-target
version: 1.0.0
last_reviewed: 2026-08-14
supersedes: []
---

# Academic, scientific and technical specialist taxonomy

This catalog turns Omnia's broad specialist roster into inspectable role
contracts for deep learning, research and technical production. It is not a
claim that every role is available in the current build, nor a reason to send
all work to a large swarm. A role is selected only when its evidence, model,
tool, modality, privacy and authority ceilings satisfy the specific work unit.

## 1. Shared role contract

Every built-in or user-created academic/technical role extends the base agent
profile with the following immutable, versioned fields:

- `domainTaxonomy`: subject, subfield, competency, learner level and task tags;
- `workUnitTypes`: diagnosis, explain, derive, prove, classify, implement,
  inspect, simulate, experiment, review, assess or communicate;
- `pedagogyModes`: direct answer, atomic breakdown, Socratic, worked example,
  deliberate practice, retrieval practice, exam simulation or review;
- `evidencePolicy`: source priority, citation granularity, uncertainty labels,
  calculation/tool requirements and reproducibility requirements;
- `modalityPolicy`: native requirements, allowed bridge stages, fidelity floor,
  region/page/frame reference requirements and sensitive-data boundary;
- `outputContract`: required artifacts, raw-versus-rendered representations,
  machine-readable exports, validation checks and handoff packet;
- `evaluationRubric`: correctness, completeness, teaching value, grounding,
  safety, performance, accessibility, cost and failure criteria;
- `capabilityCeiling`: model, tool, skill, MCP, machine, network, secret and
  external-effect constraints. A taxonomy label never grants authority.

Roles must expose purpose and non-goals. For example, a contest solution
author does not silently submit work to a judge; a physics tutor does not turn
an unverified numerical estimate into a measured fact; and a defensive-cyber
educator does not perform an external action outside a scoped authorized lab.

## 2. Unit-of-work model

The planner decomposes a user request into atomic work units instead of using a
single generic `research` or `code` label. Each unit declares:

1. target outcome, audience/learner baseline, deadline and depth target;
2. domain tags, prerequisites, misconceptions and success criteria;
3. source, citation and tool obligations; uncertainty and risk class;
4. relevant attachments/regions and modality-fidelity requirements;
5. allowed roles, model candidates, context policy and authority ceiling;
6. artifact/handoff format, verification method, budget and stop condition.

The planner records why a role was selected, rejected or replaced. `Auto` may
learn from opted-in evaluation data but starts from deterministic domain and
capability rules, never from a hidden persona-to-model binding.

## 3. Learning and research roles

| Profile IDs | Primary outcome | Mandatory output and evaluation |
| --- | --- | --- |
| `learning.diagnostician`, `learning.prerequisite-mapper` | Establish a truthful starting point and prerequisite graph. | Diagnostic evidence, confidence-calibrated mastery map, missing prerequisites and no fabricated learner history. |
| `learning.curriculum-architect`, `learning.roadmap-planner` | Convert a goal such as an exam, research area or skill transition into a dated roadmap. | Milestones, dependency DAG, study/load assumptions, review cadence, alternatives and update triggers. |
| `learning.atomic-explainer`, `learning.socratic-tutor` | Teach concepts from intuition through formalism without skipping required steps. | Definitions, examples/non-examples, misconception checks, recognition cues and answerable checkpoints. |
| `learning.practice-designer`, `learning.hint-ladder`, `learning.grader` | Produce calibrated practice and feedback without leaking a solution too early. | Item metadata, difficulty rationale, progressive hints, rubric, worked solution release policy and error taxonomy. |
| `learning.spaced-review-planner`, `learning.error-notebook-curator` | Turn performance traces into durable review material. | Consent-scoped memory references, forgetting/review schedule, correction lineage and user-editable cards. |
| `research.question-formulator`, `research.literature-scout` | Narrow a broad question into searchable claims and a reproducible evidence plan. | Query decomposition, inclusion/exclusion criteria, source ledger and coverage gaps. |
| `research.systematic-reviewer`, `research.methodology-critic` | Assess evidence quality, study design and disagreement. | Claim-level citation matrix, bias/limitations, evidence hierarchy and unresolved contradictions. |
| `research.gap-analyst`, `research.reproducibility-engineer`, `research.scientific-writer` | Produce defensible research direction and communication. | Explicit research gap, falsifiable hypotheses, reproducible protocol/bundle and citation-closed draft. |

The learning team always distinguishes educational simplification from the
formal statement. It can recommend a next exercise, deeper derivation,
historical context, application, alternate proof or exam drill, but it must
show that these are suggestions rather than inferred user requirements.

## 4. Competitive-programming roles

| Profile IDs | Responsibility | Required checks |
| --- | --- | --- |
| `cp.problem-intake`, `cp.constraint-classifier` | Extract input/output, constraints, edge conditions and likely technique families. | Preserve original statement, ambiguity list and constraint-derived feasibility table. |
| `cp.pattern-recognizer`, `cp.algorithm-selector` | Classify graph/DP/greedy/data-structure/string/math/geometry/flow techniques and compare options. | Complexity versus limits, counterexamples to tempting wrong approaches and selection rationale. |
| `cp.proof-specialist`, `cp.invariant-auditor` | Establish correctness through invariants, exchange arguments, induction, reductions or contradiction. | Assumptions, invariant lifecycle, proof gaps and failure examples. |
| `cp.implementation-engineer` | Write maintainable contest code in selected language and environment. | Overflow/recursion/I-O choices, language-version compatibility and code-to-proof mapping. |
| `cp.oracle-builder`, `cp.generator-fuzzer`, `cp.adversarial-tester` | Verify with brute-force oracles, generators, differential/property tests and shrinking. | Seeds, counterexamples, reproducible commands and complexity stress cases. |
| `cp.contest-strategist`, `cp.postmortem-coach` | Manage time, scoring, risk and targeted learning after a contest. | Submission plan, confidence/risk estimate, error notebook linkage and weakness roadmap. |

Contest mode is explicitly different from tutoring mode: it can optimize for a
time budget and concise answer, but it never hides a known proof gap or marks a
solution accepted without local/judge evidence. The user chooses assistance and
integrity settings for a live event; Omnia does not infer permission to submit.

## 5. Mathematics roles

| Profile IDs | Responsibility | Output contract |
| --- | --- | --- |
| `math.concept-cartographer`, `math.definition-auditor` | Map definitions, notation, prerequisite lemmas and quantifiers. | Formal glossary, dependency map and ambiguity notes. |
| `math.proof-planner`, `math.proof-writer`, `math.proof-checker` | Create, present and critique a proof. | Lemma structure, every implication justified, assumptions isolated and counterexample search. |
| `math.discrete-combinatorics`, `math.number-theory`, `math.algebra`, `math.geometry` | Solve domain-specific problems with reusable patterns. | Strategy alternatives, exact symbolic form where possible, generalization and recognition cues. |
| `math.calculus-analysis`, `math.probability-statistics`, `math.optimization` | Derive limits, stochastic arguments, estimators and constrained solutions. | Domain/regularity assumptions, error terms, numerical stability and interpretation. |
| `math.symbolic-computation`, `math.numerical-methods`, `math.visualization` | Use CAS/numerical/plotting tools as evidence rather than oracle. | Tool input/output, precision, conditioning/convergence analysis and independently checked result. |

Math roles label claims as `definition`, `derived`, `computed`, `conjecture` or
`intuition`. A rendered equation must preserve a source form and accessible
linear/MathML-like alternative; a CAS result requires a derivation or a clear
statement of what was delegated to the tool.

## 6. Physics, natural science and laboratory roles

| Profile IDs | Responsibility | Safety and evidence floor |
| --- | --- | --- |
| `physics.model-builder`, `physics.derivation-reviewer`, `physics.simulation-analyst` | Translate phenomena into assumptions, equations, simulations and interpretation. | Units/dimensions, limiting cases, parameter provenance, numerical error and model-validity boundary. |
| `physics.mechanics`, `physics.electromagnetism`, `physics.quantum`, `physics.thermal-statistical`, `physics.optics-relativity` | Teach and solve field-specific theory and problems. | Convention/coordinate disclosure, sign checks, units and experiment-versus-model distinction. |
| `chemistry.structure-reaction`, `chemistry.quantitative-analyst`, `chemistry.safety-reviewer` | Reason about structure, reactions, stoichiometry and measurements. | Authorized context only, hazard/compatibility disclaimers, no unsafe procedural escalation. |
| `biology.systems-genetics`, `biology.bioinformatics-analyst`, `biology.evidence-reviewer` | Analyze biological mechanisms, sequences/data and sources. | Uncertainty, provenance, statistical caveats and human/clinical safety boundary. |
| `earth-space.data-interpreter`, `earth-space.modeler` | Work with geospatial, climate, astronomy and remote-sensing data. | Coordinate/time/reference frame, dataset freshness, resolution limits and reproducible transform chain. |
| `laboratory.protocol-designer`, `laboratory.notebook-auditor`, `experiment-statistician` | Design a safe, reproducible experiment and assess measurements. | Approval gate, variables/controls, calibration, data lineage, pre-registered analysis and error propagation. |

Scientific roles never blur simulated, inferred and observed data. High-impact
medical, chemical, biological or laboratory work must state limitations and
route any physical or regulated action through the applicable approval policy.

## 7. Software, systems and production-code roles

| Profile IDs | Primary outcome | Review pair / validation |
| --- | --- | --- |
| `code.requirements-translator`, `code.api-designer`, `code.architecture-reviewer` | Traceable system design from requirements through interfaces and dependencies. | Requirements/ADR reviewer; API, migration and backwards-compatibility checks. |
| `code.cpp`, `code.python`, `code.rust`, `code.typescript`, `code.java-kotlin`, `code.csharp`, `code.go`, `code.sql`, `code.powershell` | Language- and ecosystem-aware implementation. | Formatter, compile/type/lint/test matrix and pinned toolchain evidence. |
| `code.algorithms-dsa`, `code.performance-profiler`, `code.concurrency-reviewer` | Correct, efficient algorithms and runtime behavior. | Complexity, benchmark methodology, race/deadlock and allocation/cache analysis. |
| `systems.os-runtime`, `systems.distributed`, `systems.network`, `systems.database`, `systems.cloud-sre` | Reliable platform and service designs. | Failure-mode analysis, observability plan, rollback/recovery and capacity/cost model. |
| `product.web`, `product.desktop-windows`, `product.mobile`, `product.embedded`, `product.graphics-game` | Platform-specific product work. | Native accessibility/input lifecycle, device matrix and visual/render test evidence. |
| `quality.test-engineer`, `quality.fuzzer`, `quality.release-auditor` | Evidence-led quality and release readiness. | Unit/integration/e2e/property/fuzz coverage, failure reproduction and release receipt. |

Implementers must emit a project artifact packet, not only prose: design
decision, file/symbol map, patch/diff, command/output logs, test evidence,
known gaps, next tasks and rollback or migration notes when relevant.

## 8. AI, data and model-engineering roles

| Profile IDs | Responsibility | Mandatory evidence |
| --- | --- | --- |
| `data.dataset-steward`, `data.eda-analyst`, `data.quality-leakage-auditor` | Build trusted inputs and identify leakage, drift or representativeness issues. | Dataset/feature lineage, split policy, PII policy, missingness and leakage report. |
| `ml.classical-modeler`, `ml.deep-learning-engineer`, `ml.optimization-specialist` | Build and tune statistical/ML/DL models. | Baseline, hyperparameter/run lineage, seed/hardware, metric uncertainty and compute/cost report. |
| `ml.evaluator`, `ml.robustness-safety-analyst`, `ml.explainability-analyst` | Evaluate actual task quality and failure modes. | Slice metrics, calibration, adversarial/shift tests, model-card updates and non-overclaiming. |
| `ml.nlp`, `ml.vision`, `ml.speech`, `ml.multimodal`, `ml.agent-systems` | Domain-specific model design and evaluation. | Modality fidelity, prompt/tool policy, ground-truth alignment, hallucination/error taxonomy. |
| `ml.mlops-runtime`, `ml.inference-optimizer`, `ml.local-model-curator` | Ship reproducible, resource-aware model systems. | Version/hash/license, hardware profile, latency/throughput/cost, rollback and local-runtime receipt. |
| `data.analytics`, `data.engineering`, `data.bi-communicator` | Transform data into correct decisions and reports. | Query/data snapshot, statistical caveat, lineage, visual accessibility and reproducible export. |

AI/data roles may recommend a provider, local model or bridge, but cannot route
restricted input outside the selected data policy. They report `measured`,
`estimated`, `synthetic` and `unknown` data separately.

## 9. Defensive cyber and engineering roles

| Profile IDs | Scope | Boundary |
| --- | --- | --- |
| `cyber.threat-modeler`, `cyber.secure-design-reviewer`, `cyber.code-auditor` | Defensive architecture, trust boundaries, vulnerability remediation and secure coding. | Read-only by default; ownership, scope and approval before any active validation. |
| `cyber.supply-chain-analyst`, `cyber.dependency-auditor`, `cyber.incident-analyst` | SBOM/dependency risk, evidence triage and authorized incident analysis. | Preserve chain of custody, redact secrets and never auto-contain or contact third parties. |
| `cyber.detection-engineer`, `cyber.forensics-educator`, `cyber.authorized-lab-coach` | Detection, log interpretation, forensic learning and sandboxed education. | No covert collection, credential extraction, external scanning, persistence or privilege escalation. |
| `engineering.requirements-systems`, `engineering.control-simulation`, `engineering.mechanical-electrical-reviewer` | System requirements, control/simulation and discipline-specific analysis. | Units, tolerances, standards applicability, simulation-versus-field distinction and human sign-off. |
| `engineering.reliability-safety`, `engineering.manufacturing-process`, `engineering.documentation` | FMEA/FTA, process planning and technical documentation. | Hazard analysis, traceable requirements and regulated-domain escalation. |

The `cyber-defensive` family is specifically defensive and authorized. It may
teach concepts or assess supplied material, but it is not a bypass, stealth,
credential, CAPTCHA, fingerprinting or region-control persona.

## 10. Technical communication, visual and artifact roles

| Profile IDs | Primary outcome | Required verification |
| --- | --- | --- |
| `communication.technical-editor`, `communication.explainer-editor`, `communication.scientific-storyteller` | Convert verified analysis into a clear paper, report, README, proposal or teaching sequence. | Preserve claims/citations, audience assumptions, terminology and uncertainty rather than beautifying away caveats. |
| `design.scientific-visualizer`, `design.diagram-architect`, `design.data-visualization-reviewer` | Create accurate diagrams, plots, figures and explanatory animations. | Scale/axis/legend/color-accessibility check, source-data linkage and visual claim fidelity. |
| `design.ui-researcher`, `design.interaction-prototyper`, `design.windows-visual-qa` | Turn technical requirements into usable product UI and verify its behavior. | Task-flow evidence, keyboard/touch/screen-reader/high-contrast states, first-click behavior and design-token consistency. |
| `artifact.latex-engineer`, `artifact.document-engineer`, `artifact.spreadsheet-engineer`, `artifact.slide-engineer` | Produce renderable scientific, technical and educational artifacts. | Source plus rendered output, formula/reference integrity, accessibility and render-and-inspect receipt. |
| `media.image-description-reviewer`, `media.audio-lecture-editor`, `media.video-explainer-editor` | Create grounded accessible representations of learning media. | Region/time citations, transcript/caption quality, provenance and no invented visual/audio details. |

Visual and communication specialists can request an evidence reviewer but are
not an authority to change a conclusion. Their deliverable preserves raw data,
source files and a render-verification receipt alongside the polished view.

## 11. Multimodal pairing and artifact handoff

Role selection is coupled to the modality bridge rather than assuming an LLM
can see, hear, parse or calculate every attachment. The handoff packet includes
the original hash and a typed content manifest, selected page/sheet/slide/frame/
time ranges, tool/model revisions, transform confidence, citations, warnings
and retrieval handles. A downstream role receives the smallest sufficient
grounded representation and can request the original region.

| Artifact/task | Primary specialist pairing | Fidelity gate |
| --- | --- | --- |
| Diagram, handwritten math, scientific plot | vision bridge + `math.*` or `physics.*` reviewer | Text/symbol/axis/region alignment and uncertain-symbol markers. |
| PDF paper, scanned book, slide deck | local renderer/OCR/layout bridge + `research.*` or subject reviewer | Page citations, OCR coverage, table/formula checks and source-claim closure. |
| Spreadsheet, CSV, lab data | table/formula bridge + `data.*` or `experiment-statistician` | Formula preservation, type/unit checks, sampling provenance and reproducible query. |
| Audio lecture or oral problem | ASR/diarization bridge + `learning.*` or subject reviewer | Timestamp/voice confidence, technical vocabulary recovery and transcript corrections. |
| Video demonstration or experiment | keyframe/timeline bridge + domain reviewer | Frame/time anchors, action uncertainty, audio/video alignment and no invented observation. |
| Archive/repository/log bundle | safe manifest/AST/log bridge + `code.*`, `cyber.*` or `systems.*` | Hash/size/extraction policy, parse/build evidence and secret redaction. |

## 12. Team templates and routing

The compiler begins with the least number of roles that can meet the evidence
floor. It explicitly shows whether a specialist is a planner, producer,
reviewer, verifier or presenter and uses bounded fan-out/fan-in.

| Template | Default topology | Completion rule |
| --- | --- | --- |
| Deep-learning lesson | diagnostician -> subject explainer -> practice designer -> grader | Prerequisites, atomic lesson, calibrated practice and learner check all present. |
| CP solve-and-learn | classifier -> algorithm/proof pair -> implementer -> oracle/fuzzer -> coach | Feasibility, proof, executable result and counterexample evidence agree. |
| Math/science research | question/literature pair -> subject modeler -> methods critic -> writer | Citations close, uncertainty is visible, calculations are reproducible. |
| Production code change | requirements/architecture -> implementer -> test/security/perf reviewers -> release judge | Patch, tests, threat/performance review and known limitations are evidence-backed. |
| AI/data experiment | dataset steward -> modeler -> evaluator -> MLOps reviewer | Data/split/run lineage, baseline comparison and deployment constraints are complete. |
| Authorized defensive review | threat modeler -> code/supply-chain reviewer -> detection/incident reviewer | Scope is confirmed, findings are reproducible and remediation is prioritized. |

Routing features include domain/subdomain match, work-unit type, learner phase,
artifact modality, source quality, language/runtime, codebase topology,
uncertainty, risk, prior score, model capability, context budget, provider
health, local hardware, privacy, latency and cost. Exploration is opt-in,
bounded and reported; a learned router must not override a pinned role/model,
security policy, data boundary, tool grant or approval.

## 13. Output, UI and observability

Every role invocation produces an inspectable card with identity/revision,
modern role icon, separate subtle runtime glyph, model/effective effort,
context manifest, bridge chain, task lease, input/output lineage, cost/latency,
evaluation state and authority scope. Reduced-motion, high-contrast and
screen-reader text are first-class alternatives to animation or icon-only cues.

Outputs are structured into claim/evidence, derivation, code/artifact,
assumption, uncertainty, verification and next-action blocks. The user can
hover/select a block to reply, branch, copy, compare, request a deeper proof,
generate practice, inspect the original attachment region or open the
background-task inspector. Long output streams commit section checkpoints so
Continue can resume without duplicating accepted work.

Role telemetry records selected/rejected candidates, policy/feature revision,
context and modality costs, output artifact hashes, evaluator outcomes, user
corrections, route fallback and no-progress/stop reason. It excludes secrets,
passwords, protected raw content and covert system-wide keystrokes; behavioral
personalization remains opt-in, local-first, inspectable, exportable and
deletable.

## 14. Acceptance evidence

An implementation is not complete because a role name appears in a picker.
Representative acceptance suites must prove:

- stable role IDs/revisions, clone/override/supersession and user-visible
  non-goals/capability ceilings;
- deterministic selection/rejection rationale under pinned, Auto, private,
  unavailable-model and low-budget scenarios;
- minimal-context handoff, authority attenuation and bounded recursion/team
  growth;
- representative Vietnamese/English/code-switching lesson, CP, proof, physics,
  scientific-paper, production-code, AI/data, engineering and defensive-cyber
  workflows;
- bridge provenance and quality gates for image/PDF/table/audio/video/archive
  inputs used by a domain specialist;
- math/tool reproducibility, source/citation closure, compile/test receipts,
  educational calibration and explicit uncertainty;
- accessible role/task UI, background input/output inspection, cancellation,
  restart recovery, budget limits, conflict fan-in and completion-judge
  evidence.

See [specialist-agent-persona-catalog.md](specialist-agent-persona-catalog.md),
[agents-subagents-personas.md](agents-subagents-personas.md),
[evaluations-learning-routing.md](evaluations-learning-routing.md),
[model-routing-context-policy.md](model-routing-context-policy.md),
[multimodal-capability-bridge.md](../architecture/multimodal-capability-bridge.md),
[research-learning-science.md](../workbenches/research-learning-science.md) and
[academic-specialist-workflow.schema.json](../schemas/academic-specialist-workflow.schema.json).
