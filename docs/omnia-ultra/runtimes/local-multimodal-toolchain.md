---
id: OMNIA-ULTRA-RUNTIME-LOCAL-MULTIMODAL-TOOLCHAIN
title: Local multimodal transform, bridge-runtime and fidelity toolchain
status: normative-target
version: 1.0.0
last_reviewed: 2026-08-14
supersedes: []
---

# Local multimodal toolchain

The multimodal bridge makes a selected primary model useful when it cannot
directly accept a user-authorized artifact. This document specifies the
execution plane behind that decision: deterministic local transforms,
resource-admitted local specialist models, isolated workers, canonical
intermediate representations, quality gates and durable receipts. It does not
claim that every conversion is lossless or that every model can understand any
modality.

## Design outcomes

For every attachment, Omnia must determine the exact native capability of the
destination model before preparing provider input. If native upload is not
available or would not satisfy the task, it must select an inspectable route:

1. retain the immutable original under its content hash;
2. identify the artifact by byte sniffing and safe structural inspection, not
   only by filename or user-supplied MIME type;
3. generate the smallest authorized, task-appropriate derived evidence;
4. deliver originals, lossless handles, structured facts, rendered regions or
   grounded summaries only through an approved capability path;
5. validate the derivative before it influences an answer or an external
   action; and
6. expose source, transform, local/provider boundary, uncertainty, cost and
   quality limits to the user and to downstream agents.

The fallback order is not hard-coded. `Auto` chooses only candidates admitted
by capability, data-class, hardware, budget, health and authority policies.
The user may pin a local-only, direct-native, named bridge, quality-first,
cost-first or manual route at global, project, task, attachment or request
scope.

## Artifact admission and threat boundary

An attachment enters through an immutable artifact gate. The gate records
source, declared and detected media type, byte count, hash, user/project grant,
retention class, scanner result and supported coordinate system before a parser
or model sees its contents. It must reject or quarantine malformed containers,
path traversal, archive recursion, decompression bombs, encrypted content that
cannot be safely handled, unsupported codecs and size/duration/resource-limit
violations with a truthful repair path.

Transform workers treat documents, media, model weights, browser/network data
and plugin output as untrusted. They receive a read-only materialized input and
a narrow output directory; no ambient credential, password store, cookie,
browser profile, SSH agent, shared clipboard, unrestricted network or unrelated
workspace is inherited. Network access is disabled by default and must be an
explicit, policy-approved stage requirement. A failed, cancelled or killed
worker cannot atomically promote a partial derivative.

This toolchain may process files the user supplied or is authorized to access.
It does not extract browser sessions or passwords, bypass CAPTCHA, DRM,
paywalls, entitlement checks or region/access controls, nor manufacture a
download route for content the authorized source does not expose.

## Canonical intermediate representations

Every stage may produce one or more content-addressed Canonical Intermediate
Representations (CIRs). A CIR is typed, versioned and source-addressable; it is
not a free-form hidden prompt. The minimum supported CIR families are:

| Family | Required source anchors | Typical use |
| --- | --- | --- |
| text and layout | byte range; page; glyph/span; reading order | text search, citations, OCR review |
| visual raster/vector | page/artboard/tile/pixel box; layer when available | vision, diagrams, formulas, UI critique |
| table and sheet | workbook/sheet/table/cell/range/formula/chart IDs | spreadsheet reasoning and verification |
| temporal audio | stream/channel/time range/speaker segment | ASR, diarization, sound-event analysis |
| temporal video | stream/frame/time range/shot/track | keyframe, subtitle, action and timeline review |
| document structure | page/object/bookmark/form/annotation IDs | PDF and Office analysis or editing plans |
| code and data | file/revision/span; AST/symbol/query/schema IDs | code, logs, datasets and scientific computation |
| archive and compound object | container/member/path/hash nesting | safe inventory and selective extraction |
| scientific/spatial | dataset coordinate, unit, transform and calibration IDs | plots, microscopy, GIS, CAD or instrument data |

Each CIR preserves coordinate transforms back to the original. A description
such as “the graph increases” is explicitly marked as an observation or
inference, never substituted for pixels, vector paths, values, page locations
or measurement units. Derived representations have their own hash, generator
revision and lifecycle; deleting a derivative never mutates the source.

## Local transform and specialist stages

The planner composes a Directed Acyclic Graph rather than a single opaque
“convert file” call. Stages are independently cacheable only when their input
hash, converter/model revision, parameters, policy/grant scope and output
contract match. Standard stage classes include:

- **decode and normalize:** safe image/audio/video/document decoding, metadata
  extraction, orientation/timebase normalization and deterministic previews;
- **render and segment:** PDF/Office page rendering, sheet/chart extraction,
  page/slide/scene/shot/track segmentation, waveform and subtitle alignment;
- **extract:** text, layout, tables, formulas, forms, annotations, archive
  inventory, code AST/LSP facts, structured-data schemas and logs/traces;
- **recognize:** OCR, handwriting/math recognition, ASR, language detection,
  speaker diarization and subtitle generation with alternatives/confidence;
- **understand:** local or approved specialist vision/audio/video/document/code
  models that produce typed observations tied to CIR anchors;
- **validate:** deterministic parsers, hash/coverage/alignment checks, schema
  validation, cross-model disagreement checks and human-review escalation;
- **package and retrieve:** a bounded context manifest, requested raw handles,
  source snippets and citation map for the primary model.

The planner can sample more pages, cells, tiles, time windows or keyframes only
when that strategy is declared, budgeted and attached to evidence. It must not
claim a whole long document/video was inspected merely because it analysed a
preview or a small sampled subset.

## Resource-admitted local specialist runtime

Local specialist models are managed through the same runtime lease system as
chat models, but a bridge stage additionally declares modality, expected input
shape, accelerator/memory need, model asset revision, output contract and
quality floor. Admission considers available CPU/GPU/NPU memory, context/KV
allocation, device contention, thermal/power policy, queue deadline, privacy,
candidate health, expected transfer time and user budget.

The runtime manager may choose CPU, GPU, NPU, a named device pool or a sandboxed
remote provider only after policy admits it. It records cold/warm start,
download/load/prefill/decode/transform time, peak memory, device temperature
when observable, model/tool version, error class and eviction reason. Resource
pressure results in a visible choice: wait, downshift quality, sample less,
route to an approved alternative, ask permission, or stop. It must never evict
an unrelated user process or silently install a model/runtime.

Local bridge models can generate observations or candidate routes; they cannot
unilaterally approve provider sharing, increase quotas, promote an unverified
answer, write global memory or perform an external effect.

## Fidelity, ambiguity and escalation

Every completed stage emits a transform receipt. Before a surrogate may become
primary-model context, validators must calculate modality-relevant evidence:

- detected-versus-declared type, parser coverage and unparsed regions;
- page/slide/sheet/frame/time alignment and coordinate closure;
- OCR/ASR alternatives, language, confidence and timestamp monotonicity;
- table-cell/formula/chart consistency and document layout/form preservation;
- image/video sampling coverage, duplicate/blank frame detection and scene
  discontinuities;
- code/structured-data parse status, schema/type/unit validation and test or
  query result where applicable;
- source-citation closure, redaction status, disagreement and uncertainty.

Quality is not a single model score. A route can be `sufficient`,
`degraded`, `insufficient`, `ambiguous`, `blocked` or `not-applicable` per
required task assertion. For a low-confidence result, Omnia must retry a
declared alternative, increase resolution/coverage, use a different admitted
specialist, request a source region from the user or provide an explicitly
limited answer. It must not silently replace an original with a lossy summary.

## Context construction and caching

The context compiler selects grounded CIR fragments rather than dumping every
derivative into the primary model. It includes the task assertion, exact source
anchors, units, extraction confidence, material omissions and retrieval
handles. The primary model may request additional source slices through a
capability-limited tool call; it does not gain unrestricted access to the
artifact store merely because an attachment was present.

Local transform reuse is an Omnia-owned content cache and is reported separately
from any provider cache hit. Cache identity includes original hash, byte range
or coordinate range, transform/model revision, parameters, data class, grant,
retention, policy and source-tool compatibility. A provider file ID, prompt
cache handle or uploaded derivative has separate provider-specific provenance
and cannot be reused across providers without explicit compatibility evidence.

## User experience and agent handoffs

The attachment card always exposes the currently selected route with a clear
state glyph: `native`, `preparing locally`, `local specialist`, `approved
provider bridge`, `hybrid verification`, `review required`, `degraded` or
`unsupported`. Expanding it shows a readable stage graph, source coordinates,
quality warnings, per-stage model/tool, data boundary, cost/latency, cache
state, cancellation point and the raw/derived artifact lifecycle.

Specialist agents receive the smallest sufficient role-scoped context. A visual
designer receives rendered assets and visual anchors; a mathematician receives
equations/tables with page/cell anchors; a code agent receives AST/symbol/test
facts; a researcher receives claims plus citations. Every handoff includes the
transform receipt IDs, accepted quality status and limitations. Agents may ask
for a richer representation, but cannot silently upgrade their data access or
authority.

## Failure, recovery and evidence

Bridge stage operations are idempotent by `(plan, stage, input hash, execution
profile, policy revision)`. Durable receipts distinguish `queued`, `running`,
`completed`, `failed`, `cancelled`, `blocked`, `outcome-unknown` and
`superseded`. A restart can resume an eligible local computation only after
revalidating the source, grant, tool/model revision, resource and lease. A
provider-side upload or specialist call with unknown outcome is reconciled
before any duplicate-billing or duplicate-side-effect retry.

The receipt schema is `../schemas/local-multimodal-transform-receipt.schema.json`.
It joins the broader bridge plan, context manifest, model-routing decision,
cache entry, provider request attempt and final response citations. No UI,
telemetry, learned router or evaluation dashboard may report a modality as
native, a transform as lossless or a model as “supports all files” without the
corresponding capability and receipt evidence.

## Acceptance matrix

Completion requires fixtures and end-to-end receipts for at least:

1. a capability-mismatched primary model receiving a grounded image, audio,
   video, PDF, Office, archive, code/data and scientific-artifact fallback;
2. native direct input versus bridge input, including visible data-boundary and
   provider capability evidence;
3. corrupt, encrypted, oversized, recursive and adversarial attachments;
4. multipage/slide/sheet, long-audio/video and coordinate/citation closure;
5. local-only, provider-allowed and provider-denied data classes;
6. GPU/CPU memory pressure, cancellation, worker crash, restart and artifact
   cache invalidation;
7. low-confidence/disagreement escalation and truthful degraded output;
8. screen reader, keyboard, high-contrast and raw-source access to every stage;
9. no credential/session inheritance, no automatic installation and no
   unapproved network egress from a local worker; and
10. reproducible replay from recorded source hash, plan, receipt, tool/model
    revision, parameters, policy and evaluation fixtures.

See `../architecture/multimodal-capability-bridge.md`,
`../architecture/data-lineage-and-storage.md`,
`../architecture/cache-context-routing.md`,
`../harness/model-routing-context-policy.md`,
`../workbenches/local-model-lab.md` and
`../security/hard-boundaries.md`.
