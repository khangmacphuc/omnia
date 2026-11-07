---
id: OMNIA-ULTRA-DELIVERY-TESTS
title: Verification matrix
status: normative-target
---

# Test matrix

## Native

- schema fresh and every supported migration path;
- event append/projection atomicity;
- fixed-watermark replay;
- session/epoch rejection;
- cancellation and outcome unknown;
- provider attempt uniqueness;
- usage ledger reconciliation;
- attachment binding;
- retry state machine;
- scheduler persistence;
- task lease/reclaim;
- checkpoint/recovery;
- update/rollback.

## Provider

- 400/401/402/403/408/409/422/425/429/500/502/503/504;
- Retry-After;
- truncated stream;
- empty stream;
- invalid JSON/SSE;
- auth refresh;
- quota fallback;
- model health TTL;
- model profile clone;
- endpoint capability/version conformance for OpenAI Responses/Chat/Embeddings,
  Anthropic Messages, Gemini v1/v1beta and local/custom protocols;
- capability mismatch;
- duplicate billing safety.

## Interaction

- create project/add-detach-reorder workspace roots;
- rename/pin/archive/delete/restore and bulk undo;
- lexical/semantic search and typed stale result;
- import/export and offline conflict;
- long-answer continuation, deduplication and restart resume;
- jump/search/bookmark/back-forward;
- copy/branch/fork/compare/merge;
- selection and stale anchor;
- queue reorder/bulk/dependency cycle;
- steer versus queue;
- large paste thresholds;
- live Markdown/LaTeX;
- voice partial/final/error/retry;
- pause dispositions and checkpoint hash;
- resume after restart, lease/policy drift and unknown-effect reconciliation;
- no-text Continue planner receipt, empty-chat bootstrap and loop guards;
- immutable edit/retry modes, snapshot timing and A-retry to B-current-state;
- active-run partial-output source choice, compare pinning and two-client CAS;
- structured block detection, ANSI safety, syntax highlighting, raw/rendered
  fidelity, huge-log virtualization and screen-reader fallback;
- overlay dismissal;
- first-click activation;
- keyboard/screen reader/touch.

## Harness

- fresh subagent context;
- context fork;
- background session;
- peer mailbox;
- task lease;
- handoff;
- capability attenuation;
- critic/refinement;
- stuck detector;
- fan-out/fan-in workflow;
- schema-valid specialist catalog inventory and deterministic enabled counts;
- dependency-free catalog validator (`node docs/omnia-ultra/tools/validate-agent-catalog.mjs --check`);
- canonical/differentiation hash integrity and duplicate-content rejection;
- lifecycle-aware count policy, current-evidence gating and alias exclusion;
- persona authority-field rejection and role/persona schema validation;
- immutable role/profile/persona/catalog revision replay after restart/update;
- typed role input/output, budget, failure modes, stop/escalation, handoff and evaluation;
- persona cannot carry grants, secrets, tools, sessions or authority;
- replayable redacted profile-resolution receipt after disablement or supersession;
- CP/math/science/physics/code/cyber/AI/engineering/design role-specific rubrics;
- catalog search/filter/sort, truthful lifecycle availability, fallback and remediation;
- snapshot fixture consistency with role/persona source bundles and manifest;
- restart/resume.

## Runtime

- pointer containment;
- user physical cursor unchanged;
- exact window/tab/process capture source isolation;
- per-process/tab/microphone audio track identity and synchronization;
- capture indicator/privacy pause/emergency stop;
- browser unfocused DOM;
- offscreen screenshot;
- minimized limitation;
- isolated desktop;
- capture source selection;
- manual CAPTCHA handoff;
- remote disconnect/reconnect;
- privileged approval.

## Artifact

- local model checksum/license/import/download/remove;
- local model load/prefill/decode/resource telemetry;
- local model evaluation reproducibility and routing rollback;
- local model catalog search/sort/filter, hardware fit, gated/revision-pinned
  download, hash/license verification, runtime translation and advanced tuning;
- DOCX/PDF/XLSX/PPTX render;
- Markdown/LaTeX preview;
- archive limits;
- OCR/transcription;
- operation/model/version/MIME-specific native capability negotiation;
- multimodal direct/local/specialist/hybrid/human-review route resolution;
- source selectors for page/region/cell/timestamp/frame/range and citation closure;
- untrusted OCR/transcript/metadata prompt-injection isolation;
- corrupt archive, traversal, symlink and decompression-bomb rejection;
- bridge privacy/egress, consent, retention and local-only enforcement;
- fidelity thresholds, disagreement escalation and human-review receipts;
- crash/restart recovery without duplicate billable upload or transform;
- media segment merge;
- image/video generation capability discovery, async jobs, cancellation,
  restart recovery, parameter/cost truth and authorized image/video/PDF
  watermark cleanup with provenance and signature warnings;
- original/transformed hashes;
- Project Twin graph and stale update;
- export/import.

## Quality

- unit;
- integration;
- E2E;
- property;
- fuzz;
- security;
- accessibility;
- visual screenshot;
- performance;
- packaging;
- upgrade/downgrade;
- offline.
