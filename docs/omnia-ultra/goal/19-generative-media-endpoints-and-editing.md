---
id: OMNIA-ULTRA-GOAL-GENERATIVE-MEDIA-ENDPOINTS
title: Provider-neutral image and video generation and editing goal
status: normative-target
version: 1.0.0
last_reviewed: 2026-08-14
supersedes: []
requirements_registry_revision: 2026-08-14.6
---

# Image and video generation endpoints

Omnia must support BYOK/custom-provider image and video generation/editing
endpoints, including async jobs, upload/poll/webhook/cancel/retry recovery,
modality-aware model picker, advanced parameters, cost/usage telemetry and
original/derivative artifact lineage.

The studio supports text/image-to-image, inpaint/outpaint, background/object
cleanup, upscale, variations, text/image-to-video, extension/interpolation,
storyboard/shot/timeline workflows, comparison and export. Watermark cleanup is
available for user-owned or explicitly authorized image, video and PDF content
with mask/page/frame preview, original preservation, signature warnings and
provenance; Omnia does not strip unauthorized copyright/attribution/forensic/
provider-required marks, document permissions or DRM.

Completion requires typed provider capability snapshots and job contracts,
native secret/network authority, durable restart recovery, truthful
acceptance/idempotency/cost state, media QA, provenance and security tests.

See `../workbenches/generative-media-endpoints.md` and
`../schemas/media-generation-job.schema.json`.
