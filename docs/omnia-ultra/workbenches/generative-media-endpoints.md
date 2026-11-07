---
id: OMNIA-ULTRA-WORKBENCH-GENERATIVE-MEDIA-ENDPOINTS
title: Image/video generation endpoints and provenance-aware media/document editing
status: normative-target
version: 1.0.0
last_reviewed: 2026-08-14
supersedes: []
---

# Generative media endpoints and editing

Omnia exposes provider-neutral image and video generation/editing through the
same BYOK model catalog, routing, queue, observability, retry and artifact
systems as text models. Provider adapters declare capability snapshots rather
than relying on provider names.

## Endpoint capabilities

Adapters may support text-to-image, image variation, inpainting, outpainting,
background removal/replacement, upscaling, style/color transfer, depth/control
inputs, text-to-video, image-to-video, video extension, interpolation, lip-sync,
storyboard/shot generation, reference-character consistency and audio/video
composition. Each capability advertises exact input types, mask/control rules,
resolution/aspect/duration/FPS limits, seed support, safety policy, concurrency,
pricing and synchronous, polling, stream, webhook or callback lifecycle.

Custom/OpenAI-compatible or declarative providers can map request/response
fields, uploads, job creation, status polling, cancellation, result download,
errors and usage without embedding secrets in renderer code. The model picker
filters by modality and validates requested versus effective parameters.

## Job lifecycle and recovery

~~~text
draft -> validating -> uploading -> queued -> accepted -> generating
      -> post-processing -> downloading -> verified -> completed
      -> retry-wait | cancelled | failed | outcome-unknown | reconcile-required
~~~

Long-running media jobs survive app restart, reconnect and provider polling
limits. Each attempt records provider/model/profile, effective parameters,
prompt and negative-prompt revisions, input/mask/control artifact hashes,
seed, job handle, acceptance state, progress, previews, retry/backoff, cost,
output hashes and cancellation/reconciliation evidence. Duplicate paid jobs are
prevented through provider-specific idempotency and outcome checks.

## Media studio

The in-app studio offers prompt and reference boards, layer/timeline editing,
masks/brushes, crop/resize, keyframes, shot lists, variants, compare, version
history, color/audio controls, export presets and render queue. Every transform
creates a derivative artifact while preserving the immutable original, masks,
parameters, model/provider, tool version and human edits.

## Watermark and overlay cleanup

Omnia includes object/overlay/watermark cleanup for images, video and PDF when
the user owns the content or has explicit permission to modify it. Images use
mask-assisted inpainting; video adds temporal tracking and frame-consistent
reconstruction; PDF uses page-aware annotation/vector/text/raster detection,
selective removal and visual page verification. The UI requires an ownership/
authorization assertion, previews every mask/page/frame, keeps the original
and records the edit in provenance. It warns when a PDF transform invalidates
a digital signature and never claims a signed document remains unchanged.

Omnia does not remove third-party copyright, ownership, attribution, forensic
or provider-required provenance marks without authorization; it does not strip
DRM, break document permissions or falsify provenance. If a provider requires disclosure or a provenance
mark, the adapter preserves it. Exports can attach C2PA/content-credential or
equivalent provenance metadata when supported.

## Quality and acceptance

Tests cover modality discovery, parameter validation, upload and async polling,
webhook replay, 429/5xx retry, cancellation, outcome-unknown reconciliation,
restart recovery, seed/reproducibility claims, image/video preview, color and
audio fidelity, frame-consistent masks, PDF page/vector/annotation handling,
signature invalidation warnings, original/derivative hashes, provenance,
accessibility, cost truth and unauthorized-watermark-removal refusal.

See `../schemas/media-generation-job.schema.json`,
`file-artifact-studio.md`, `../observability/model-picker-health-profiles.md`
and `../observability/request-usage-telemetry.md`.
