# Omnia learning and research harness evaluation plan

- Status: normative evaluation design; not a shipped-capability claim
- Date: 2026-08-13
- Scope: learning, deep research, tutoring, mathematical and scientific reasoning, competitive programming, code learning, citation grounding, memory revision, and long-context behavior
- Depends on: `HARNESS_ARCHITECTURE.md`, `THREAT_MODEL.md`, `PRODUCT_SPEC.md`, `IMPLEMENTATION_STATUS.md`, and `research/OMNIA_HARNESS_BENCHMARKS.md`

This document defines how Omnia must prove that its learning and research
harness is useful, faithful, inspectable, and robust. It converts broad product
goals such as "teach from first principles", "research deeply", "do not lose
facts in the middle", and "update old knowledge when new evidence arrives" into
versioned fixtures, deterministic assertions, calibrated graders, replayable
traces, and release gates.

An attractive answer is not sufficient evidence. The evaluation system must be
able to tell whether the harness selected the right evidence, preserved the
user's intent, used an appropriate pedagogical strategy, cited each material
claim, revised stale memory, handled contradictions, and produced an answer the
learner can use.

## 1. Evaluation principles

1. **Evaluate the harness, not only the model.** Record provider, model,
   parameters, prompt/compiler versions, context snapshot, retrieval results,
   memory and skill revisions, tools, environment, budgets, and every grader.

2. **Prefer deterministic checks where a fact has an exact answer.** Schema,
   provenance, citation span, executable code, mathematical equality, state
   transitions, supersession, source-policy, and budget compliance must not be
   delegated solely to an LLM judge.

3. **Separate answer quality from system integrity.** A fluent answer cannot
   compensate for a broken citation, stale memory, hidden provider fallback,
   incorrect scope, lost attachment, or unauthorized tool action.

4. **Use multiple views of quality.** Automated graders, executable validators,
   blinded human review, learner outcomes, longitudinal retention, and
   production telemetry answer different questions and must remain distinct.

5. **Make comparisons paired and replayable.** Candidate and baseline consume
   the same frozen fixture and provider input. Record uncertainty, judge order,
   and seeds. Do not compare two runs whose sources or context silently differ.

6. **Do not optimize the security boundary.** Learned routing may select among
   already-authorized quality strategies. It must never grant capabilities,
   weaken approval, expose secrets, change isolation, or bypass source policy.

7. **Treat "Auto" as a reasoned default, not an opaque decision.** The run
   receipt must state why Omnia searched, asked a question, used a calculator,
   selected a tutor style, widened the research scope, spawned a review pass, or
   stopped.

8. **Measure abstention and escalation.** A good harness notices insufficient
   evidence, ambiguous intent, unsafe requests, and tasks requiring the user's
   own work. Confident fabrication is a stop-ship failure.

9. **Protect private evaluation data.** Sensitive user sessions may create
   local regression fixtures only with explicit consent and redaction. Default
   benchmark corpora contain synthetic or properly licensed data.

10. **No single aggregate score can release Omnia.** Critical invariants use
    hard gates. Weighted scores help rank acceptable candidates only after all
    stop-ship gates pass.

## 2. Evaluation object and frozen manifest

Every evaluation case produces one immutable manifest. A rerun may create a new
manifest but must not mutate the old one.

```ts
interface LearningEvalManifest {
  schemaVersion: 1;
  suiteId: string;
  suiteRevision: string;
  caseId: string;
  caseRevision: string;
  corpusLicense: string;
  taskKind: LearningTaskKind;
  locale: string;
  learnerProfileId?: string;
  userIntent: FrozenUserIntent;
  providerSnapshot: FrozenProviderSnapshot;
  harnessSnapshot: FrozenHarnessSnapshot;
  contextSnapshotId: string;
  sourceSnapshotIds: readonly string[];
  memoryRevisionIds: readonly string[];
  skillRevisionIds: readonly string[];
  allowedToolIds: readonly string[];
  forbiddenEffects: readonly string[];
  budgets: EvalBudgets;
  expected: ExpectedOutcomeContract;
  seed?: number;
  createdAt: string;
}
```

`FrozenHarnessSnapshot` includes at least:

- context compiler, retrieval, reranker, memory, skill, planner, answer compiler,
  citation linker, verifier, and postprocessor versions;
- every system/developer instruction hash and its authority class;
- resolved quality profile and all advanced parameters;
- provider/model resolution and fallback policy;
- token allocation by context class;
- enabled tools, capability decisions, and environment mode;
- adaptive-routing policy version, feature vector hash, and explanation;
- experiment arm, if any.

The manifest must be sufficient to distinguish model drift from harness drift.
If a provider does not support deterministic replay, Omnia labels the run
`stochastic-replay` and requires repeated trials with confidence intervals.

## 3. Fixture format

Each fixture is a directory, not a monolithic prompt file:

```text
case-id/
  case.yaml
  prompt.md
  learner.json
  sources/
  attachments/
  memory-before.jsonl
  skills/
  expected/
    claims.jsonl
    citations.jsonl
    concepts.json
    state-transitions.jsonl
    tests/
  graders.yaml
  licenses.json
```

`case.yaml` specifies:

- exact objective, non-goals, audience, prerequisites, and desired depth;
- required concepts and permissible solution families;
- facts that must not appear, including later knowledge not present in the
  source snapshot;
- source allowlist/denylist and freshness requirements;
- whether clarification, abstention, search, tools, proof, code execution,
  exercises, or follow-up assessment is expected;
- semantic anchors for long-context placement tests;
- expected memory proposals, supersession edges, and deletions;
- hard assertions, scored rubrics, and grader independence requirements.

Fixture validation rejects duplicate IDs, missing licenses, mutable URLs without
a captured snapshot, dangling citation targets, grader prompts that reveal the
candidate identity, and expected outputs that require forbidden effects.

## 4. Benchmark suite taxonomy

### LH-01 — Intent, scope, and clarification

Tests whether the harness understands what the learner needs before optimizing
the answer. Cases include under-specified questions, contradictory constraints,
mixed-language prompts, malformed notation, hidden prerequisites, requests for
both intuition and formalism, and a user changing the requested depth mid-run.

Required measurements:

- intent slot accuracy;
- unnecessary-question rate;
- missed-critical-clarification rate;
- constraint preservation after plan, search, and answer compilation;
- correct distinction among answer-now, clarify, research, tutor, and abstain.

### LH-02 — First-principles tutoring and atomic breakdown

Domains include mathematics, physics, algorithms, data structures, machine
learning, C++, and Python. Each case defines a prerequisite graph and concept
dependency graph. The answer should start at the learner's actual frontier,
build the minimal prerequisites, connect intuition to formal definitions, show
worked examples, identify common misconceptions, and provide a transfer task.

Measure:

- prerequisite coverage without irrelevant detours;
- concept-order violations;
- definition/example/proof consistency;
- misconception detection and correction;
- explanation compression ratio at beginner, intermediate, and expert levels;
- learner post-test gain and delayed retention where user studies permit it.

Length is not a proxy for depth. Repetition, decorative taxonomy, and exhaustive
lists without a dependency structure reduce the score.

### LH-03 — Socratic and adaptive tutoring

Use scripted learner turns containing partial understanding, productive errors,
guessing, copied answers, frustration, and changing confidence. Evaluate whether
Omnia chooses hints of appropriate strength, checks understanding, avoids giving
away the whole solution prematurely, and adapts after evidence of mastery.

Measure hint leakage, next-question information gain, calibration to the
learner's demonstrated state, recovery from a wrong learner model, and whether
the system distinguishes a preference from observed mastery.

### LH-04 — Mathematical and scientific reasoning

Cases cover derivation, proof, dimensional analysis, limiting cases, estimation,
simulation, symbolic and numerical calculation, interpretation of data, and
scientific uncertainty. Gold artifacts include machine-checkable equations,
unit constraints, counterexamples, and tests where possible.

Hard checks include:

- equation equivalence and numeric tolerances;
- unit and dimension consistency;
- code/notebook reproducibility;
- stated assumptions and boundary conditions;
- no fabricated experimental result;
- separation of observation, inference, model, and speculation.

An LLM grader may judge exposition only after the executable checks complete.

### LH-05 — Competitive programming and code learning

Suites span pattern recognition, constraint analysis, brute-force baselines,
invariant discovery, proof of correctness, complexity, implementation, edge
cases, and debugging for representative Codeforces/AtCoder/ICPC/IOI-style
problems. Problem statements and tests must be licensed or authored for Omnia.

The harness is evaluated in at least four modes:

1. teach the technique without solving the target problem;
2. give progressive hints;
3. produce and verify a complete solution;
4. review a learner submission and localize the misconception.

Run generated programs in an isolated evaluator with hidden tests, sanitizer or
language-appropriate checks, time/memory limits, mutation tests, and adversarial
cases. Score correctness, proof-code alignment, complexity truthfulness, hint
leakage, and pedagogical usefulness separately.

### LH-06 — Deep research and source synthesis

Cases require discovery, source selection, claim extraction, contradiction
resolution, synthesis, and a traceable final report. Include topics with stable
consensus, evolving facts, contested interpretations, missing evidence, and
source-quality traps.

Measure:

- query plan recall and unnecessary-search cost;
- source diversity by ownership and evidence type, not merely domain count;
- primary-source and freshness selection where required;
- claim coverage and claim-to-source entailment;
- contradiction visibility and viewpoint balance;
- distinction among quoted fact, paraphrase, inference, and recommendation;
- citation completeness at the material-claim level;
- source reuse, duplicate-page, and citation laundering rate;
- answer usefulness under a fixed time/token/search budget.

Search success is not page-count maximization. The stop policy should explain
which information need is satisfied, unresolved, or blocked.

### LH-07 — Citation integrity and artifact provenance

Generate adversarial sources with similar titles, stale revisions, changing
anchors, conflicting passages, prompt injection, unsupported summaries, and
citations that support a neighboring claim but not the cited claim.

Every material claim receives one of:

```text
supported | partially-supported | contradicted | uncited | non-verifiable
```

Hard-fail conditions:

- a citation points outside its frozen source snapshot;
- the cited span cannot be resolved;
- a source instruction is promoted above `untrusted_data`;
- a quote differs materially from the captured source;
- the final answer hides a known contradiction;
- a local/private source leaks into an unauthorized export.

### LH-08 — Long context and lost-in-the-middle resistance

Construct the same task with a decisive fact or instruction at the beginning,
middle, end, repeated consistently, repeated with a later superseding revision,
and surrounded by semantically similar distractors. Vary document count, token
distance, chunk boundaries, query wording, and source authority.

Required variants:

- **position permutation:** content is identical except anchor position;
- **distractor scaling:** 0, 1, 4, 16, and 64 near-duplicate distractors;
- **cross-artifact join:** answer requires facts from distant documents;
- **branch update:** a later conversation turn replaces an earlier fact;
- **compaction survival:** the decisive fact must survive one or more compactions;
- **omission honesty:** insufficient budget must create an inspectable omission,
  not silent loss;
- **needle plus decoy:** an exact old fact conflicts with a newer authoritative
  fact using similar wording.

Primary metrics:

- anchor retrieval recall and final-answer utilization;
- position sensitivity gap: `max(score_by_position) - min(score_by_position)`;
- stale-fact reuse rate;
- supersession compliance;
- context attribution precision;
- omission-reason accuracy;
- evidence survival after compaction;
- answer stability under document order permutation.

Release comparison must publish the whole position curve, not its average.

### LH-09 — Memory lifecycle, correction, and scope

Fixtures begin with a versioned memory ledger and simulate proposal, acceptance,
retrieval, revision, contradiction, expiration, deletion, and export. Test
global, profile, project, conversation, and branch scopes separately.

Required cases:

- a preference should be remembered only after explicit or policy-valid consent;
- an ephemeral task fact must not become global memory;
- a corrected fact supersedes the old revision;
- both revisions remain auditable, but only the active revision enters context;
- two conflicting projects do not contaminate each other;
- deleted memory disappears from retrieval, indexes, projections, and exports;
- prompt-injected content cannot write memory;
- sensitive data is redacted or rejected according to policy;
- confidence decay or expiry changes retrieval eligibility deterministically;
- rollback restores the prior active revision without fabricating history.

Measure memory-write precision/recall, inappropriate-write rate, scope leakage,
stale-revision injection, supersession latency, deletion completeness, retrieval
utility, and memory-caused answer regressions.

### LH-10 — Skills, tools, artifacts, and multi-agent collaboration

Test correct skill discovery, version pinning, progressive disclosure, tool
schema adherence, artifact handoff, reviewer independence, subagent ownership,
budgeting, and deterministic merge. Include conflicting subagent findings,
duplicate work, a late correction, an unavailable tool, and an agent returning
an answer without evidence.

Score decomposition quality, coverage gain over a single-agent baseline,
duplicate-work ratio, merge conflict resolution, parent attribution, critical
finding survival, and cost-adjusted quality. More agents must not automatically
increase the score.

### LH-11 — Prompt workshop, `btw`, and model discussion

Prompt enhancement, a side question, and a multi-model discussion are separate
contracts. Tests verify that:

- one-click enhancement preserves intent and constraints;
- workshop mode shows revisions and lets the user discuss before committing;
- `btw` does not mutate the main run, context, or memory unless explicitly
  promoted;
- a finalized workshop prompt is inserted once into the composer;
- multi-model discussion records each model's independent answer before debate;
- consensus does not erase a well-supported minority finding;
- judge/model identities and provider costs are visible.

### LH-12 — Personalization without echo-chamber behavior

Evaluate preferred language, notation, detail, pacing, accessibility, prior
knowledge, and recurring goals. The harness must adapt presentation while
preserving factual standards and presenting relevant counterevidence.

Compare personalized and non-personalized arms for learner benefit, factual
quality, verbosity, source diversity, and user control. A personalization change
must be inspectable and reversible.

### LH-13 — Adversarial robustness and graceful failure

Include malicious documents, tool-result injection, citation spoofing, poisoned
memory proposals, conflicting system/user instructions, corrupted attachments,
unavailable providers, truncated streams, rate limits, stale caches, and crash
recovery. Security results link to the threat-model scenario ID.

The expected behavior may be a partial answer, explicit limitation, retry,
provider switch allowed by policy, request for interaction, or refusal. It is
never silent evidence invention or permission expansion.

### LH-14 — Efficiency, latency, and budget-aware quality

Evaluate quality profiles under fixed budgets. Record time to first meaningful
token, time to usable answer, time to verified answer, total wall time, model and
tool latency, input/output/reasoning/cache tokens, source bytes, retrieval and
reranker work, subagent work, cost, and energy/resource proxies where available.

Generate Pareto frontiers for quality versus latency and cost. A candidate is
not better merely because it spends more. Quality-profile defaults must remain
within their declared budgets or explain the overrun before continuing.

## 5. Evaluation matrix

Every release candidate runs a stratified matrix across:

| Dimension | Minimum strata |
|---|---|
| Domain | general knowledge, mathematics, physics, algorithms/DSA, C++/Python, ML/DS, scientific literature |
| Task shape | direct answer, tutorial, hints, proof/derivation, code, debugging, research synthesis, study plan, artifact generation |
| Depth | overview, standard, deep, exhaustive bounded series |
| Learner state | novice, intermediate, advanced, misconception, missing prerequisite, uncertain/unknown |
| Language | Vietnamese, English, mixed Vietnamese-English technical vocabulary |
| Evidence | no search needed, provided sources, web search, conflicting sources, insufficient evidence |
| Context | short, long, multi-document, position permutation, compacted, branched, updated |
| Memory | empty, helpful, irrelevant, stale, conflicting, sensitive, deleted |
| Provider | deterministic mock, supported live provider, local model where configured, failure/fallback simulation |
| Accessibility | keyboard flow, screen-reader semantics, 200% text, reduced motion where UI is evaluated |

Report per-stratum results. Never hide a weak Vietnamese, novice, long-context,
or low-budget slice inside a strong global average.

## 6. Grader architecture

### 6.1 Grader classes

Use a typed grader registry:

```text
contract       schema, lifecycle, scope, provenance, budget, permissions
deterministic  exact claims, citations, equations, units, AST, tests, hashes
retrieval      relevance, recall, redundancy, authority, freshness, diversity
pedagogy       prerequisite order, misconceptions, hints, transfer, adaptation
research       synthesis, contradiction handling, uncertainty, source coverage
style          clarity, structure, notation, localization, unnecessary repetition
llm-judge      semantic qualities unavailable to deterministic graders
human          expert review, learner review, accessibility and usefulness
longitudinal   post-test gain, retention, transfer, correction persistence
```

### 6.2 Rules for LLM judges

- Use a frozen rubric and judge prompt hash.
- Hide candidate/provider identity where possible.
- Randomize pairwise answer order and run a swap test.
- Require evidence spans and short reason codes, not hidden chain of thought.
- Evaluate independent dimensions before an overall preference.
- Include reference-free and reference-aware judges only where appropriate.
- Use at least two judge families for release-critical subjective dimensions.
- Calibrate against blinded human labels and publish agreement statistics.
- Detect self-preference when a provider judges its own output.
- Treat judge refusal, invalid JSON, or missing evidence as `unscored`, never as
  a zero silently included in the mean.

### 6.3 Human evaluation

Human panels use role-specific rubrics:

- domain expert: correctness, rigor, source interpretation;
- educator: pedagogy, misconception handling, transfer design;
- learner: clarity, cognitive load, usefulness, confidence calibration;
- accessibility reviewer: keyboard, screen reader, scaling and presentation;
- safety/privacy reviewer: data handling and boundary behavior.

Review is blinded and paired where practical. Record disagreement and adjudicate
rubric ambiguity rather than forcing artificial consensus.

## 7. Metrics and scoring

### 7.1 Metric record

Every metric is stored with provenance:

```ts
interface EvalMetricRecord {
  manifestId: string;
  metricId: string;
  metricVersion: string;
  value?: number;
  unit?: string;
  pass?: boolean;
  confidenceInterval?: readonly [number, number];
  graderId: string;
  graderVersion: string;
  evidenceRefs: readonly string[];
  reasonCodes: readonly string[];
  status: "scored" | "unscored" | "invalid";
}
```

### 7.2 Required top-level dashboards

Maintain separate dashboards for:

1. system integrity and security;
2. factual and executable correctness;
3. citation and research quality;
4. pedagogy and learning outcomes;
5. context and memory fidelity;
6. robustness and recovery;
7. latency, cost, and resource efficiency;
8. UX, accessibility, and user control.

The UI may show an optional summary, but it must allow drill-down to case,
claim, citation, context item, memory revision, tool call, subagent, and grader.

### 7.3 Candidate comparison

For paired candidate `C` and baseline `B`:

- publish win/tie/loss and paired effect size;
- bootstrap confidence intervals over cases, not individual judge messages;
- group repeated stochastic trials under the same case;
- apply multiplicity control to large exploratory metric sets;
- report regressions by slice and severity;
- use non-inferiority margins for critical stable capabilities;
- require practical significance, not only statistical significance.

Adaptive routing is evaluated with counterfactual replay or randomized traffic
only inside authorized quality choices. Online rollout starts at shadow mode,
then a small canary, and has a kill switch and version rollback.

## 8. Offline, shadow, canary, and production loops

```text
fixture validation
  -> deterministic mock-provider tests
  -> frozen offline benchmark
  -> ablation and metamorphic tests
  -> blinded human calibration
  -> shadow production evaluation
  -> opt-in canary
  -> guarded rollout
  -> drift monitoring and rollback
```

Offline runs are the release authority for deterministic contracts. Production
signals detect distribution drift and usefulness issues; they do not silently
rewrite prompts, memories, skills, graders, or routing policy.

Production feedback categories remain separate:

- explicit user rating and reason;
- edit/copy/retry/follow-up behavior;
- task completion evidence;
- citation opening and source inspection;
- quiz/transfer outcome when the user opted into a learning session;
- error, abandonment, latency, and cost;
- privacy-safe aggregate diagnostics.

Behavioral signals are ambiguous. For example, a follow-up may indicate either
engagement or failure. They require causal experiments or triangulation and must
not become direct reinforcement labels by default.

## 9. Metamorphic and ablation testing

Metamorphic tests hold semantics constant while changing presentation:

- reorder documents and context items;
- move the decisive fact across positions;
- paraphrase the question;
- change irrelevant names and numbers;
- add harmless distractors;
- switch between equivalent units or notation;
- translate Vietnamese to English and back with a frozen glossary;
- replace a source URL while preserving captured content and provenance;
- split or merge chunks without changing source text.

Expected invariants include factual answer, selected evidence, citation target,
security decision, memory scope, and required concepts. Style may change only
within declared preferences.

Ablations isolate component value:

```text
no retrieval / lexical only / dense only / hybrid / hybrid plus reranker
no query decomposition / decomposition
no context ledger / typed context ledger
no compaction checkpoint / checkpoint
no memory / active memory / stale memory / supersession-aware memory
no verifier / deterministic verifier / model critic / independent critic
single agent / planner-reviewer / parallel specialists
fixed routing / heuristic routing / learned routing
```

An added component is accepted only if it improves its target slice without
violating hard gates or causing an unacceptable cost, latency, privacy, or
cross-slice regression.

## 10. Stop-ship gates

Any one of the following blocks a release claim for the affected capability:

1. citation resolves to the wrong frozen source or cannot resolve;
2. unsupported material claim rate exceeds the approved threshold;
3. prompt injection from a source changes instruction authority or permissions;
4. stale superseded memory is injected as active knowledge;
5. memory or retrieval crosses profile/project/conversation/branch scope;
6. deletion leaves a retrievable or exportable memory/index projection;
7. lost-in-the-middle position gap exceeds the declared threshold on a critical
   suite or a decisive anchor is silently omitted;
8. generated code fails mandatory hidden tests while the answer claims success;
9. a mathematical/scientific result fails exact, unit, or reproducibility checks
   while being presented as verified;
10. provider, model, parameter, context, source, memory, skill, or tool provenance
    is missing from a release-critical run;
11. hidden provider fallback or budget overrun occurs;
12. evaluator detects identity/order bias above its calibration limit;
13. crash/reconnect replay duplicates, loses, or reorders durable answer facts;
14. `btw`, a reviewer, or a subagent mutates the main run without an explicit
    typed merge;
15. learned routing influences policy, approval, secret handling, or isolation;
16. private evaluation data is uploaded or retained outside declared consent;
17. a severe regression is concealed by an aggregate score;
18. a fixture, grader, or corpus lacks version or license provenance.

Numeric thresholds belong in a versioned release policy file and are tightened
as the corpus grows. They must not be embedded only in dashboard code.

## 11. Minimum release scorecard

Before calling the learning/research harness verified, the release evidence must
include:

- fixture validator pass and corpus/license manifest;
- deterministic contract suite pass;
- per-suite and per-stratum results for LH-01 through the currently supported
  subset of LH-14;
- citation claim audit and source-resolution audit;
- long-context position curves and compaction survival results;
- memory scope, supersession, deletion, and poisoning denial tests;
- executable math/science/code results;
- blinded judge calibration and human agreement report;
- baseline comparison with confidence intervals and regression list;
- latency/cost Pareto chart by quality profile;
- crash, cancellation, replay, provider-failure, and recovery results;
- Windows UI evidence for the evaluator/trace surfaces that are claimed;
- signed manifest tying binaries, schemas, prompt/compiler revisions, fixtures,
  graders, and reports to the release.

Passing only generic chat benchmarks cannot satisfy this scorecard.

## 12. Implementation slices

### E0 — Evaluation protocol and local runner

Implement manifest/fixture schemas, fixture validation, deterministic mock
provider, append-only evaluation journal, metric records, and redacted export.

Exit gate: the same frozen fixture replays to the same deterministic trace and
all invalid fixture variants fail closed.

### E1 — Citation, retrieval, and context fidelity

Implement claim segmentation, citation resolution, retrieval relevance and
authority metrics, source snapshotting, position permutations, omission ledger,
and context-use attribution.

Exit gate: LH-06 through LH-08 have deterministic fixtures and the UI can trace
an answer claim back to the selected context item and frozen source span.

### E2 — Memory and compaction

Implement revision/supersession fixtures, scope matrix, deletion verification,
poisoning tests, and compaction checkpoints that retain evaluation anchors.

Exit gate: LH-08 and LH-09 pass fresh, compacted, restarted, and branched runs
without stale revision reuse or scope leakage.

### E3 — Learning-domain validators

Add concept graphs, prerequisite ordering, equation/unit validators, isolated
code execution, hidden tests, hint-level contracts, and learner simulations.

Exit gate: LH-02 through LH-05 report correctness and pedagogy independently;
verified claims are backed by executable evidence where applicable.

### E4 — Research and multi-agent quality

Add query-plan evaluation, source diversity/contradiction metrics, independent
reviewer runs, subagent merge metrics, prompt workshop, and `btw` isolation.

Exit gate: LH-06, LH-10, and LH-11 demonstrate measurable value over their
single-pass baselines without critical provenance or cost regressions.

### E5 — Calibration, production shadowing, and adaptive routing

Build blinded human-review tooling, judge calibration, shadow evaluation,
canary policies, counterfactual logs, drift detection, and rollback.

Exit gate: routing has a measured quality/latency/cost benefit, remains outside
security decisions, and can be disabled without invalidating run replay.

## 13. Suggested initial corpus

Start small enough to inspect every failure manually, then grow deliberately:

| Suite | Initial authored cases | Required variants |
|---|---:|---:|
| LH-01 intent | 30 | 3 |
| LH-02 first-principles | 40 | 3 learner levels |
| LH-03 adaptive tutor | 24 | 4 scripted trajectories |
| LH-04 math/science | 50 | exact plus exposition |
| LH-05 programming | 50 | teach, hints, solve, review |
| LH-06 deep research | 30 | source/freshness variants |
| LH-07 citations | 40 | adversarial source variants |
| LH-08 long context | 24 | at least 8 position/distractor variants |
| LH-09 memory | 40 | scope/lifecycle variants |
| LH-10 agents/tools | 24 | single/multi-agent ablations |
| LH-11 workshop/`btw` | 24 | isolation and commit variants |
| LH-12 personalization | 20 | personalized/control pair |
| LH-13 robustness | 40 | failure and denial paths |
| LH-14 efficiency | derived | all supported quality profiles |

The initial corpus is a coverage target, not evidence that the cases already
exist. Every case must be reviewed for ambiguity, leakage, difficulty, licensing,
and grader validity before entering a release suite.

## 14. Reporting and failure triage

Every failed case is assigned one primary owner class:

```text
intent | planning | retrieval | reranking | context-allocation | compaction
memory | skill | provider-adapter | tool | subagent | synthesis | citation
verification | pedagogy | localization | UI | evaluator | fixture | infrastructure
```

Reports preserve the original failure, minimized reproduction, component blame
evidence, fix revision, affected slices, and new regression case. Do not patch a
grader merely to make a candidate pass; grader changes require independent
review and rerunning both baseline and candidate.

The evaluator UI should show:

- candidate versus baseline answer and trace;
- claim/citation matrix;
- context inclusion, omission, and supersession graph;
- memory and skill revisions used;
- tool and subagent timeline;
- grader evidence and disagreement;
- latency/token/cache/cost breakdown;
- suggested failure owner and minimization status.

This plan deliberately makes evaluation a product subsystem. Omnia cannot
improve its harness safely if it cannot reproduce what it knew, why it selected
it, how it transformed it, which evidence supported the answer, and whether the
learner actually benefited.
