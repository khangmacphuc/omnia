---
id: OMNIA-ULTRA-WORKBENCH-LOCAL-MODELS
title: Local model registry, runtime and evaluation lab
status: normative-target
schema: schemas/local-model.schema.json
---

# Local model lab

Local models are first-class provider targets, file/vision/audio bridges,
embedders, rerankers, classifiers and adaptive-intelligence components. They
use the same request, usage, health, profile, lineage and evaluation contracts
as cloud models, with local resource telemetry added.

## Model registry

Record exact identity and provenance:

- model ID, family, revision and content hashes;
- source, license, usage restrictions and acceptance receipt;
- architecture, task/modality and supported formats;
- tokenizer/template, context and maximum output;
- precision/quantization and conversion lineage;
- disk size, RAM/VRAM estimate and accelerator requirements;
- runtime/adapter and version;
- tool, structured-output, streaming, cache and batching support;
- benchmark/evaluation revision and known limitations.

Do not infer compatibility from a filename alone. Imported or converted models
remain provisional until integrity, license metadata and a focused smoke test
are complete.

## Acquire, import and remove

Support registry search, approved download, user-selected local import and
adoption of an already running compatible endpoint. Downloads need size/license
preview, disk quota, checksum/signature when available, resumable chunks,
bandwidth limits, pause/resume and atomic finalize.

Removal previews dependent profiles, indexes, experiments and projects. Delete
derived caches separately from original model artifacts; use recoverable cleanup
when practical and never remove a user-owned external model silently.

## Runtime and resource planner

Adapters may target supported local engines or custom OpenAI-compatible/native
endpoints. The runtime manager exposes loading, warming, ready, degraded,
evicting, stopped and failed states plus:

- CPU/GPU/NPU selection;
- RAM/VRAM/disk use and headroom;
- context/KV-cache allocation;
- batch/concurrency limits;
- prompt and generation throughput;
- queue, load, prefill and decode times;
- power/thermal policy where observable;
- process logs, crash/restart and health history.

The scheduler can warm, pin, unload or route away from a model according to
priority and resource budgets. It cannot kill unrelated processes or exceed
resource policy silently.

## Profiles and routing

Create model-aware Fast, Balanced, Deep, Ultra and Custom profiles using only
supported parameters. Keep requested/effective effort distinct. A local model
can be selected directly, used offline, chosen as a modality bridge or included
in an evaluated router.

Routing considers quality, task/modality, privacy, latency, energy, load,
context, availability and marginal cost. Shadow/A-B/bandit decisions must be
consented, budgeted and reproducible; safety and authority remain deterministic.

## Evaluation lab

Provide curated and user-defined suites for chat, code, reasoning, math,
science, retrieval, extraction, vision, audio, latency, memory and robustness.
Store dataset revision, prompt/template, seed, runtime settings, hardware,
outputs, judge/evaluator identity, deterministic checks, human feedback and
cost/resource evidence.

Never treat a single benchmark or model-graded score as universal quality.
Compare confidence intervals, failure classes, regressions and project-specific
performance before changing the default router.

## UI and safety

The model picker shows local status, load progress, resource estimate, health,
license, benchmark freshness and compatible inputs. The lab provides details,
files, profiles, processes, resource charts, evaluations, comparisons, logs and
uninstall impact.

Treat model files, templates and endpoints as untrusted. Scan archives, enforce
size/path limits, sandbox converters, redact prompts/logs, bind endpoints
explicitly and never expose a local inference service to the network without
authenticated policy.

## Acceptance

- Download/import is resumable, integrity checked and atomic.
- Model identity includes exact revision/hash and license metadata.
- Unsupported parameters are blocked rather than ignored silently.
- Load, prefill, decode, throughput and resource telemetry are inspectable.
- Resource pressure triggers a policy decision, not an uncontrolled crash.
- Evaluation results are reproducible from recorded inputs and environment.
- Removal reports dependencies and preserves user-owned external artifacts.
