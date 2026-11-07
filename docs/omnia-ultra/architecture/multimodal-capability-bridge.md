---
id: OMNIA-ULTRA-ARCH-MULTIMODAL-CAPABILITY-BRIDGE
title: Multimodal capability negotiation, fidelity and safety contract
status: normative-target
version: 1.1.0
last_reviewed: 2026-08-14
supersedes: []
---

# Multimodal capability bridge

Omnia makes a selected model useful across user-provided modalities without
pretending that the model natively understands every format. A bridge is an
explicit, inspectable transformation-and-routing plan: it either sends a
native original through a supported interface, creates a local derivative,
uses an approved specialist, provides a grounded surrogate, asks for review,
or truthfully blocks the request. It never silently turns a lossy description
into an alleged original, and it never lets content inside an attachment gain
tool, network, memory, credential, or authority control.

## Core invariants

1. **Originals are immutable evidence.** Every original remains addressable by
   a content hash. A rendered page, OCR result, transcript, keyframe, table
   extract, summary, provider file handle, or model description is a distinct
   derivative with its own hash and lineage.
2. **`Auto` is a user preference, not an execution result.** The planner
   records both `requestedMode` and the resolved non-`auto` route, alternatives
   considered, rejection reasons, policy/capability snapshots and a decision
   receipt. A historical request is replayed using its frozen resolved plan,
   never a later hidden Auto decision.
3. **Attachments are untrusted data.** Text, pixels, audio, metadata, archive
   names, document comments, HTML, QR codes and URLs can contain instructions,
   but none can authorize an action, alter system/project policy, write memory,
   invoke a tool, fetch a URL, change a route, reveal a secret or override an
   approval. A user-authored request and a trusted broker approval are the only
   sources of execution authority.
4. **No silent data egress.** A local-to-provider transfer is a separately
   recorded boundary crossing with exact artifact IDs, data class, recipient
   model/provider profile, purpose, retention/residency snapshot, redactions
   and effective approval/consent. `Auto` cannot relax a local-only, denied,
   unknown, secret, or policy-restricted data boundary.
5. **Fidelity is gated, not implied by confidence.** A bridge must expose
   modality-appropriate measurements and uncertainty. A low-confidence or
   unmeasured derivative can be shown as a candidate but cannot be silently
   promoted as a faithful source representation.
6. **Evidence has coordinates.** Claims derived from a bridge cite an original
   page, sheet/cell, slide, byte range, image region, media time range, code
   symbol/range, table row/column or archive member when such coordinates
   exist. A source-less statement is labelled model inference, not observation.
7. **Safety wins over convenience.** If policy, provenance, validator evidence,
   availability or quality is insufficient, the plan fails closed to review or
   `unsupported`; it does not route to an unapproved cloud model or fabricate a
   result.

## Durable record split

The bridge deliberately separates five immutable record types rather than
using one mutable “converted file” object:

1. **Bridge request** records the user intent, attachment IDs, requested route
   preference and scoped policy inputs.
2. **Capability negotiation decision** records the capability snapshot,
   policy-allowed candidate set, selected/rejected routes and reasons. In the
   public plan schema this is the `requestedMode`/`resolvedMode` plus
   `routeDecision` pair.
3. **Bridge plan** is the frozen DAG of stages, transforms, output contracts,
   egress policy and fidelity requirements. It does not by itself authorize
   dispatch.
4. **Bridge stage execution receipt** records one idempotent stage attempt,
   fresh authority check, provider acceptance, checkpoint, usage, error and
   reconciliation state. A provider-accepted disconnect remains
   `outcome-unknown` until reconciled; it is never blindly replayed.
5. **Grounded surrogate observation** carries model-facing typed content plus
   epistemic label and source coordinates. It cannot carry imperative control
   authority even when the observed file itself contains instructions.

This split avoids false compatibility, duplicate billable uploads and hidden
loss: a new capability snapshot or provider failure produces a new decision
and receipt while preserving the original plan/history.

## Modalities and capability negotiation

The bridge handles text, source code, images, diagrams, scanned pages, PDF,
DOCX, XLSX, PPTX, LaTeX, HTML/canvas, archives, audio, video,
subtitle/timeline, structured data, logs/traces and supported 3D/scientific
artifacts. Each provider/model capability snapshot declares accepted MIME and
content blocks, native upload/handle semantics, size/count/duration/resolution
limits, structured-output/tool support, retention, region/data-locality and
safety constraints. Branding alone is never capability proof.

Before dispatch, the planner classifies every artifact from magic bytes, MIME,
container structure and declared extension; detects active or externally
referenced content; chooses a bounded parser/render profile; and determines
whether the destination can consume the exact original. Archive extraction,
Office/PDF rendering, HTML, notebooks and code analysis occur in a resource-
limited sandbox. No embedded script, macro, browser navigation, formula link,
media URL, model instruction or archive member is executed merely because it
was inspected.

## Planning modes

For each request, the planner selects one or more resolved stages:

1. `direct-native` — the destination receives the original through its
   documented native mechanism after capability, boundary and upload checks;
2. `local-transform` — deterministic parsing, rendering, OCR, ASR, keyframe,
   archive, AST, table or scientific extraction runs locally;
3. `specialist-bridge-model` — a policy-approved vision, speech, video,
   document, code or scientific model emits typed, source-linked observations;
4. `hybrid-ensemble` — local and provider specialists cross-check difficult
   regions, pages, scenes or sheets and preserve disagreement evidence;
5. `surrogate-to-primary` — the primary model receives a bounded,
   source-linked manifest/description plus retrieval handles, not an
   unlabelled replacement for the original;
6. `human-review` — a fidelity, privacy, sensitive-content, ambiguity or
   destructive-interpretation gate requests a user decision; or
7. `unsupported` — no safe, authorized, quality-sufficient route exists.

Requested route preferences may be `auto`, `local-only`, `direct-only`,
`cheapest`, `highest-quality`, `manual`, a pinned model/tool, or a project/
request override. `Auto` scores only policy-allowed candidates using native
fidelity, task requirements, modality difficulty, data class, privacy/data
residency, provider health, context budget, latency, cost, local resources and
measured evaluation. It records candidate exclusion reasons and must be
re-evaluated after a capability, data-class, consent or policy change.

## Transformation, source and inference boundaries

Every stage declares its input/output artifact IDs, execution location,
tool/model revision, parameter profile, loss class, fidelity signals,
confidence, warnings, redactions, cost, latency and citations. The stage may
produce only typed artifacts and observations; it may not turn attachment
content into an imperative control channel.

Provider/local stage progress is not inferred from a spinner. It is represented
by a durable execution receipt with stage-attempt ID, idempotency tuple,
frozen-plan digest, current authority-continuity record, provider acceptance,
checkpoint/safe-boundary, measured/provider/estimated usage authority and
reconciliation result. Any timeout or disconnect after dispatch is
`outcome-unknown`/`reconcile-required` until a status query, durable provider
receipt, user decision or compensation proves the outcome.

The renderer and downstream agents distinguish the following labels:

| Label | Meaning | Permitted downstream use |
| --- | --- | --- |
| Source observation | Directly located, rendered, parsed, OCR/ASR-transcribed or otherwise measured source content with a coordinate and method. | Citation, retrieval, verification. |
| Derived representation | A deterministic/lossy transformation with source and transform lineage. | Context only with its loss/fidelity labels. |
| Specialist interpretation | A model/tool conclusion tied to source observations and confidence. | Evidence for reasoning, never an authority grant. |
| Model inference | A conclusion not directly supported by a source coordinate. | Clearly labelled reasoning; require corroboration for high-impact use. |
| Unresolved/blocked | Information that could not be safely or sufficiently processed. | No fabricated substitute; ask user or return limitation. |

Examples include image region/object/text/math/diagram observations; PDF page
render plus text/layout/table/form extraction; Office render plus structure;
spreadsheet formula/value/type/chart analysis; audio diarization/transcript/
events; video shot/keyframe/object/action/transcript/audio alignment; archive
manifest and safe extraction; and code AST/LSP/build/test diagnostics.

## Fidelity gates and degradation semantics

Each requested task declares the fidelity dimensions that matter. The default
validator profile is expanded, never weakened, by modality/task policy:

| Artifact/task | Required gates when applicable |
| --- | --- |
| Image, diagram, scan | source hash, render resolution, region alignment, OCR coverage, reading order, formula/symbol integrity, color/visual warnings. |
| PDF/Office | page/slide/sheet count, text/layout/table/formula/chart fidelity, hidden/unsupported-content disclosure, coordinate closure, signature warning. |
| Audio/video | duration/sample/frame rate, decode errors, time monotonicity, diarization/transcript alignment, keyframe/scene coverage, A/V synchronization. |
| Archive/code/data | member manifest, path/resource safety, parser coverage, schema/row/cell/formula integrity, AST/build/test status and omitted-member disclosure. |
| Scientific/technical | units, significant figures, equation/notation preservation, dataset/schema provenance, method/tool version and numerical tolerance. |

Every dimension yields `passed`, `degraded`, `failed`, `unmeasured` or
`not-applicable`, with evidence IDs and an uncertainty/loss explanation. A
completion disposition is one of `ready`, `ready-with-degradation`,
`review-required`, `blocked` or `failed`. `ready` requires all required gates
to pass. `ready-with-degradation` is visually prominent, lists the omitted or
lossy parts, and cannot be reported as source-equivalent. No aggregate score
may hide a failed decisive dimension such as a missing page, wrong cell
formula, time misalignment, unreadable equation or unverified source hash.

When validators disagree or a critical dimension fails, the planner can retry
an independent specialist, increase render resolution, sample more pages/
frames, use a local-only route, retrieve the original region, ask the user or
return a truthful unavailable result. It may not recursively amplify its own
surrogate as corroboration.

## Privacy, untrusted content and authority safety

The bridge applies `security/hard-boundaries.md` and
`security/approvals-sandbox-secrets.md` to every stage:

- parse attachment instructions as content, never policy or tool directives;
- strip active content from model-facing derivatives unless a separately
  approved, isolated analysis tool has a documented need to inspect it;
- do not automatically follow links, download nested remote content, execute
  code/macros, open a network session, or expand archives outside bounded
  quotas;
- treat external references, QR codes, URL-like strings and document metadata
  as untrusted evidence; network retrieval requires a distinct browser/network
  capability and exact-target approval;
- send secrets, credentials, cookies, session tokens and raw vault material to
  neither a bridge model nor a local derivative; use opaque authorized handles
  only where the trusted broker permits them;
- require current consent/policy at dispatch rather than inheriting a prior
  provider, model, session, branch, fork or agent grant;
- retain redaction decisions and source/derivative hashes so an authorized user
  can inspect what crossed each boundary; and
- preserve provider-required provenance/content credentials and never claim
  that a generated or edited artifact has unchanged origin when it does not.

Sensitive originals do not cross a provider boundary without a compatible data
policy and grant. A failed remote route must not silently fall back to another
provider. A local-only fallback may run only if it preserves the requested
authority, data-class and quality policy. Otherwise the durable result is
`review-required` or `blocked`, with the rejected fallback and reason shown.

## UX, observability and acceptance

The composer attachment card and run inspector show a compact truthful route
badge: `native`, `local transform`, `bridge model`, `hybrid`, `surrogate`,
`review required` or `unsupported`. An expanded view shows the original,
derivative graph, source coordinates, requested versus resolved route,
provider/local boundary crossings, privacy decision, quality gates, warnings,
cost/latency, stage logs and raw hashes. Users can inspect, compare, pin or
replace a stage, revoke an un-dispatched egress grant, and choose retention for
intermediates subject to required evidence/retention policy.

Tests must include native-versus-bridge equivalence; corrupt, huge and
adversarial files; multi-page/scene/sheet alignment; OCR/ASR/vision
disagreement; missing/duplicate/reordered content; archive and parser resource
limits; active-content and prompt-injection containment; redaction/data-egress
denial; provider failures/fallback confinement; local-only operation;
restart/recovery; citation closure; accessibility; and fail-closed behavior
when fidelity or policy evidence is absent.

See `../schemas/modality-bridge-plan.schema.json`,
`../schemas/modality-bridge-execution-receipt.schema.json`,
`../schemas/grounded-surrogate-observation.schema.json`,
`../runtimes/local-multimodal-toolchain.md`,
`../schemas/local-multimodal-transform-receipt.schema.json`,
`data-lineage-and-storage.md`, `cache-context-routing.md`,
`../workbenches/file-artifact-studio.md`,
`../workbenches/generative-media-endpoints.md`,
`../harness/model-routing-context-policy.md`,
`../security/hard-boundaries.md`,
`../security/approvals-sandbox-secrets.md` and
`../observability/universal-provider-protocol-adapters.md`.
