---
id: OMNIA-ULTRA-WORKBENCH-LOCAL-MODEL-CATALOG-TUNING
title: Hardware-aware local model catalog, download and advanced tuning
status: normative-target
version: 1.0.0
last_reviewed: 2026-08-14
supersedes: []
---

# Local model catalog, download and tuning

Omnia provides a local-model discovery experience comparable to a dedicated
model manager while remaining runtime-neutral. It indexes approved sources such
as Hugging Face Hub, Ollama manifests/library, LM Studio/local directories and
plugin registries, then reconciles remote metadata with exact local files.

## Search, sort and filter

Users can search and combine filters for source, author, task, modality,
architecture/family, parameter count, active parameters/MoE, context length,
format (`GGUF`, safetensors and runtime-supported formats), quantization,
precision, tensor type, file/repository size, estimated RAM/VRAM/disk, CPU/GPU
backend, license, gated/private access, language, tool/vision/audio/embedding/
reranking support, benchmark/evaluation, downloads/likes, update time, trust,
model-card completeness and verified publisher/hash status.

Sort supports relevance, personalized compatibility, quality, speed, memory,
size, context, cost, popularity, freshness and benchmark dimensions. Saved
views and compare tables show multiple files/quantizations of one model without
collapsing them into a misleading single entry.

## Hardware-aware recommendations

The native probe records CPU/ISA/cores, RAM, GPU/backend/VRAM, driver/runtime,
storage and power/thermal policy. A deterministic estimator and measured local
benchmarks classify candidates as `recommended`, `fits-with-tradeoffs`,
`borderline`, `cpu-only`, `unsupported` or `unknown`, with reasons and expected
load RAM/VRAM, context/KV-cache growth, prefill/decode speed range and quality
tradeoffs. Learned ranking may personalize suggestions only after offline/
shadow evaluation and can never override license, security or resource limits.

## Download, import and storage

Downloads are revision-pinned, resumable, range-aware, bandwidth/schedule
controlled and verified by expected size/hash when available. Omnia shows
license/model card/gating before download, supports authenticated private/gated
repositories, deduplicates content-addressed blobs, preserves source revision,
supports pause/resume/cancel, quarantines incomplete files and atomically
promotes verified artifacts. Users select storage roots and can move, export,
import, repair, garbage-collect or securely remove models without breaking
active runtime leases.

Runtime installation/download is a separate explicit action. Omnia can manage
approved Ollama, llama.cpp, LM Studio-compatible, vLLM, TGI or other runtime
profiles, but it never silently installs or executes software.

## Load, inference and tuning parameters

Per-runtime/model profiles expose every supported load and inference control,
including context length, batch/microbatch, threads, CPU affinity, GPU offload,
tensor split, device map, mmap/mlock, NUMA, KV-cache type/quantization, flash
attention, RoPE scaling, speculative decoding/draft model, parallel sequences,
continuous batching, TTL/keep-alive, grammar/JSON schema, prompt template,
system prompt, adapters/LoRA, seed, temperature, top-k/top-p/min-p/typical-p,
repetition/frequency/presence penalties, mirostat, stop sequences and runtime
extensions. Training/fine-tuning profiles separately expose dataset, optimizer,
learning-rate schedule, epochs/steps, batch/accumulation, precision, LoRA/QLoRA,
rank/alpha/dropout, checkpoint/evaluation cadence and reproducibility seeds.

Unsupported controls are disabled with a reason; requested/effective values and
runtime translations are journaled. Profiles support presets, inheritance,
diff, clone, A/B benchmark, rollback and safe Auto tuning within resource,
temperature and quality limits.

## Acceptance evidence

Tests cover catalog pagination/search/filter/sort, private/gated auth, revision
pinning, interrupted downloads, hash/license failure, storage moves, runtime
compatibility, memory estimator accuracy, OOM fallback, parameter translation,
benchmark reproducibility, model unload/remove and no unsupported “fits” claim.

See `../schemas/local-model-catalog-query.schema.json`, `local-model-lab.md`,
`../schemas/local-model.schema.json` and
`../harness/model-routing-context-policy.md`.
