---
id: OMNIA-ULTRA-GOAL-COPY-PROMPT
title: Copy-ready Omnia Ultra execution goal
status: operational-prompt
version: 1.6.0
last_reviewed: 2026-08-14
supersedes: []
requirements_registry_revision: 2026-08-14.6
---

# Copy-ready prompt

COPY START

/goal

Locate the repository root containing `docs/omnia-ultra/manifest.json`. Resolve
every pack path relative to `docs/omnia-ultra/`; do not silently use another
repository. On a fresh handoff, validate the manifest, enumerate the complete
pack, read every file in `manifest.readingProtocol.always` and every file in
the `goal/` bundle, then read the dependency-closed route-specific contracts,
schemas, tests and evidence for the selected slice. Also inspect
`docs/IMPLEMENTATION_STATUS.md`, `docs/THREAT_MODEL.md`, accepted ADRs and dated
research addenda in `docs/research/`. Treat source and current test evidence as
truth; the goal is the target, not proof of shipping.

The atomic goal matrices `08` through `21` are mandatory reading when their
domain is touched. They turn broad product aspirations into distinct durable
operations, metric definitions, safety limits and acceptance evidence; do not
collapse their semantics into a generic “send message” or “agent action”.

Build Omnia Ultra as a Windows 11 desktop-first intelligent workbench. Work in
Ultra mode: use the highest practical reasoning effort, atomic decomposition,
deep research, adversarial gap analysis, independent specialist review,
implementation, test, visual QA, security audit and a final evidence pass.
Continue autonomously through the next dependency-complete slice instead of
stopping at a mock, screenshot or prose plan.

For one worker invocation, finish and verify the next dependency-ready slice.
Never mark Omnia or a capability complete while the actual capability ledger
is planned, partial, preview, blocked or lacks current evidence. If the broader
program remains unfinished when the invocation must end, persist an exact
continuation checkpoint and report the next dependency-ready slice; never turn
a target requirement into an implementation claim.

Before every slice:

1. Inspect repository status, current source, tests, schemas, implementation
   status, Project Twin and existing user/agent work.
2. Choose the smallest dependency-complete workstream from
   `delivery/roadmap.md` and `delivery/workstreams-and-dependencies.md`.
3. Brainstorm normal flows, edge cases, recovery, accessibility, security,
   telemetry, performance and future extension points.
4. Preserve native-kernel authority, frozen provider input, exact attempt
   lineage, durable event/projection atomicity, capability attenuation and
   truthful unavailable states.

Implement real end-to-end behavior. A capability is complete only when its
typed domain contract, native authority path, renderer path, persistence and
recovery, permission boundary, telemetry, tests, evidence and documentation
agree. Keep every module cohesive, names explicit, contracts versioned and
comments professional English for non-obvious invariants.

The product must deliver, in dependency order:

- calm, premium, modern Windows UI with keyboard-first commands, responsive
  panes, focus-safe hover cards, outside-click dismissal where appropriate,
  screen-reader equivalents, reduced motion, high contrast and deep layout,
  density, theme, icon and pane customization;
- complete project/chat library with create project, add/remove/reorder workspace
  roots, rename, pin, favorite, archive, restore, search, tags, smart
  collections, import/export, safe bulk actions and durable offline conflicts;
- chat composer with voice input, partial/final transcript recovery, live
  Markdown/LaTeX/code/attachment rendering, large-paste-to-lineage-file
  conversion, drag/drop and honest preview states;
- one shared structured-block renderer for prompt input, assistant output,
  tool results, terminal stdout/stderr, build/test logs, diffs, traces and
  artifacts; preserve immutable raw source while providing stream-safe format
  detection, syntax highlighting, nested segments, line numbers, search,
  fold/wrap/copy/export, virtualization, ANSI sanitization and accessible
  plain-text fallback;
- long answers continue across linked assistant segments at semantic
  boundaries, preserve citations/attempt lineage and create a visible
  continuation task when provider, renderer or budget limits are reached;
- Jump Prompt with stable deep links and stale-target handling; distinct copy,
  duplicate, branch, fork, replay, regenerate, compare, promote and merge;
- ordered durable queue with reorder, bulk actions, delete, pause, resume,
  retry, schedule, `steer` at a safe boundary and `Btw` side questions that do
  not corrupt the primary run;
- durable Pause/Resume/Continue controls where Continue can advance unfinished
  work without new text, including a configurable active-project/global-goal
  bootstrap at the start of a new chat; immutable prompt edits and explicit
  retry state machine IDs (`exact-historical`, `current-state`,
  `historical-plus-selected-deltas`, `fresh-branch`) must preserve before/after
  lineage so retry B can use the
  accepted state produced by retry A;
- selection/hover actions such as reply, explain, cite, translate, test,
  refactor, create task/goal/memory/skill, branch-from-selection and
  jump-to-source;
- BYOK/custom providers, provider/model catalog refresh, health and capability
  snapshots, model/effort picker, clone/search/manual profile onboarding and
  every advanced parameter behind validated defaults;
- versioned capability-probed adapters for OpenAI Responses, Chat Completions,
  Completions, Embeddings, Realtime, Batch, Files, Images, Audio and related
  methods; Anthropic Messages/token/model/file/batch methods; Google Gemini
  `v1`/`v1beta` generation, streaming/live, embedding, token, batch, file and
  model methods; OpenAI/Anthropic-compatible, Ollama, llama.cpp, LM Studio,
  vLLM, TGI, LiteLLM and approved custom REST/SSE/WebSocket/poll/webhook
  protocols; never infer method support from provider branding;
- an encrypted user-managed content/context/retrieval cache plus provider-
  native prompt/context-cache adapters, stable-prefix planning, TTL/invalidation,
  cache-read/write accounting and explicit truthfulness: local reuse may reduce
  work or sent context, but only provider-supported mechanisms and provider-
  reported fields count as provider cache/billing evidence;
- independently configurable main-agent and subagent provider/model/profile/
  effort settings at global/project/workflow/skill/persona/role/agent/task/
  prompt/retry scope, with an inspectable precedence chain, fallback pool and
  evaluated `Auto` router constrained by privacy, quality, cost and latency;
- an exact request/run/attempt inspector showing provider, model, profile
  revision, requested/effective effort, frozen hashes, queue/start/TTFB/first
  visible/last/terminal times, duration, visible and total token/s, RPM/TPM,
  quota source, input/output/reasoning/cache tokens, retry/fallback,
  outcome-unknown, estimate/provider/invoice cost and redacted trace lineage;
- typed retry and repair for 429/500/502/timeout/transport when safe, no
  automatic retry for 400/401/402/403, `Retry-After`, jitter/backoff,
  idempotency and billing safety, inline error/countdown and AI advice that
  cannot silently change user intent;
  default elapsed retry horizon is 24 hours with the documented progressive
  schedule, while provider `Retry-After`, user override, deadline, budget,
  idempotency and outcome-unknown evidence remain authoritative;
- prompt Enhance with reversible diff, code-hint suggestions, multi-model
  Prompt Workshop, discussion and a `Finalize/chốt` action that inserts the
  selected revision into the composer; separate prompt suggestions from
  action suggestions;
- context compilation that mitigates lost-in-the-middle using immutable
  segments, summaries, pinned constraints, salience/recency, sparse+dense+graph
  retrieval, deduplication, contradiction handling, token budgets and an
  inspectable inclusion/exclusion decision;
- per-agent context delivery modes `full`, `partial`, `auto`,
  `summary-plus-sources`, `manifest-only`, `retrieval-on-demand`, `fresh` and
  `forked snapshot`; manual/prompt/threshold/predictive/Auto compaction must
  create an immutable checkpoint, preserve raw history/goals/tasks/citations/
  approvals/state lineage and pass fidelity evaluation before promotion;
- specialist personas, subagents, reviewers, planners, researchers,
  implementers, testers, security/accessibility/visual auditors, cost and retry
  advisors, release engineers and completion judges with stable role icons,
  runtime-state glyphs, leases, mailboxes, bounded recursion/concurrency,
  handoff packets, child authority ceilings and click-through background
  inspection;
- a built-in, machine-readable specialist catalog targeting at least 100
  substantive role profiles and 40 composable persona packs across product,
  UI/UX/icon/motion/accessibility, competitive programming, mathematics,
  physics, chemistry, biology, earth/space science, research/statistics,
  software/platform/security, AI/ML/data, engineering and documents/media;
  role profile, persona pack and runtime agent instance are separate immutable
  objects, persona never carries authority, and every selected revision is
  frozen in a replayable resolution receipt rather than reduced to a prompt;
- memory and skills with explicit scope, revision, approval, contradiction,
  provenance, supersession and delete/update semantics;
- Project Twin for each non-trivial project or learning goal: canonical graph,
  Markdown, interactive HTML/CSS/TS/JS atlas, goals, roadmap, blueprint,
  plan, milestones, task DAG, artifacts, sources, citations, evidence hashes,
  confidence, owners and staleness propagation;
- a versioned Project Overview and stable smart title that refresh only for
  material goal/root/branch/decision/evidence changes, preserve pinned user
  text and expose the exact diff, source watermark and rollback history;
- lineage-preserving file/media bridge for original bytes, derived files,
  checksums, OCR/extraction/chunking, bridge-model provenance and authorized
  segmented-media assembly; never bypass DRM, paywalls, CAPTCHA or access
  controls;
- universal multimodal capability negotiation for text, code, image, diagram,
  audio, video, PDF, Office, LaTeX, HTML/canvas, archive, structured/log and
  scientific artifacts: use direct native input when operation/model/version/
  MIME evidence permits it, otherwise resolve a concrete DAG whose canonical
  machine modes are `direct-native`, `local-transform`,
  `specialist-bridge-model`, `hybrid-ensemble`, `surrogate-to-primary`,
  `human-review` or `unsupported`. `grounded-surrogate` is reserved for a
  representation/observation, while `surrogate-to-primary` is the executable
  bridge mode. `Auto` is only a request mode and must be resolved before
  execution. `specialist-bridge-model` means a policy-approved
  specialist route that temporarily supplies the missing modality capability;
  it is never evidence that the selected target model natively supports the
  input. If no authorized, quality-sufficient route exists, persist and render
  `unsupported` truthfully with the reason, evidence, limitations and next
  action instead of fabricating a description or silently switching providers;
  preserve immutable originals, exact page/region/cell/frame/timestamp/range
  selectors, epistemic status, confidence, citations, privacy/egress decisions,
  stage receipts, retry/checkpoint/outcome-unknown lineage and fidelity gates;
  OCR, transcripts, metadata, captions, code comments and specialist outputs
  are untrusted artifact data and can never change tools, routing, approvals,
  secrets or authority;
- in-app workbenches for text/code, images, audio, video, PDF, Office,
  spreadsheets, slides, LaTeX, HTML/canvas, archives, IDE/LSP/AST, terminal,
  tests/coverage, Git/worktrees/commit/push/PR, Docker, CI/CD, research,
  science, competitive programming, calendar, mail and approved connectors;
- modality-aware BYOK/custom-provider endpoints for image and video generation
  and editing, including async job/poll/webhook/cancel/retry recovery, advanced
  parameters, cost/usage and artifact lineage; image/video/PDF watermark or
  overlay cleanup is available only for user-owned or explicitly authorized
  content, preserves originals/provenance and never strips unauthorized
  ownership/attribution/forensic/provider-required marks, document permissions
  or DRM;
- a local-model lab for verified download/import, exact model/license/hash
  registry, local runtime/resource planning, profiles, health, benchmarks,
  bridge selection, evaluated routing and safe removal;
- a hardware-aware local model catalog spanning Hugging Face, Ollama, LM
  Studio/local files and plugin sources with deep search/sort/filter/compare,
  fit/quality/speed/RAM/VRAM/context/license recommendations, revision-pinned
  resumable downloads, hash/license/gating checks, storage/runtime management,
  measured benchmarks and every supported inference/load/fine-tuning parameter
  or hyperparameter exposed with requested/effective provenance;
- an evidence-backed product parity matrix for chat, deep research, citations,
  multimodal files, coding/IDE/agents, reliability, recovery, privacy and
  integrations; never claim local or total replacement of ChatGPT, Claude,
  Gemini, Perplexity, Codex or Cursor without current end-to-end gates;
- `auto` runtime policy choosing isolated for untrusted/destructive/exploratory
  work and persistent for explicitly trusted continuity, with visible reason,
  expiry and override; headless/off-screen/minimized capture where supported,
  virtual pointer contained to one target window, explicit grants and typed
  approvals;
- one trusted native kernel serving Windows desktop, CLI, authenticated web
  remote projection, Android/tablet and headless clients through typed commands,
  least-authority grants and replayable event cursors;
- separate, auditable capture sessions for one selected display/region/window/
  browser tab and one selected microphone/app/process/tab audio source, with
  visible indicators, track lineage, privacy pause, emergency stop and truthful
  minimized/protected-content limitations;
- local-first, consented, redacted adaptive intelligence for retrieval,
  routing, UI personalization and scheduling with baseline/shadow/A-B/drift/
  rollback; it must never grant authority, weaken security or capture raw
  system-wide keystrokes;
- a telemetry analytics workbench with exact TPS/TPM, RPS/RPM, cache/token/cost
  layers, explicit cost/s/min/hour, latency/quality/resource metrics, presets
  from 30 minutes through 1 week, custom ranges and left/right anchors to now,
  prompt/request/attempt/chat/branch/error/checkpoint/agent/task/artifact/build/
  test events; every value retains unit, source, scope, formula, coverage and
  freshness;
- supervisor/checkpoint-based self-update: build in a separate slot, migrate
  atomically, preserve chats/settings/history, restart a helper, health-check,
  resume by idempotency key and never replace the running binary in place.

Safety is non-negotiable: never extract browser password/cookie/session vaults,
solve CAPTCHA, spoof fingerprints, bypass DRM/paywalls/entitlements, silently
escalate Administrator/SYSTEM/TrustedInstaller, create an arbitrary reusable
privileged shell, permit unauthenticated remote control, silently install
packages/plugins, install a covert system-wide keylogger, record raw keys from
unrelated apps, or exfiltrate secrets. Use explicit login/autofill/passkeys,
official APIs, manual CAPTCHA takeover, user-configured network settings and a
typed approval/UAC broker instead.

Record complete **policy-eligible** data, not indiscriminate surveillance.
Interaction learning may use opt-in events inside Omnia or a visible targeted
capture session, with secret/password exclusion, classification, redaction,
retention, pause, export and secure-delete controls. Collection, training and
deployment are separate approved states with dataset manifests, evaluation,
drift monitoring and rollback.

For every change, run focused tests and relevant renderer/native/spec/visual,
accessibility, security, build and Project Twin gates. Update schemas/migrations,
status, capability coverage, source ledger, audit notes and Twin evidence. End
with exact files, contract IDs, completed/wired/verified/preview/planned/
blocked states, test commands/results, security/migration impact, limitations,
environment blockers and the next dependency-complete slice. Never claim
implemented from UI alone.

COPY END
