---
id: OMNIA-AUDIT-LOCAL-MODEL-READINESS-2026-08-14
title: Local model readiness probe
status: audit-current-tree
last_reviewed: 2026-08-14
---

# Local model readiness probe

## Outcome

No verified local-model runtime or model payload was found in the common Ollama,
Hugging Face or LM Studio locations on this host. Omnia therefore cannot claim
that local models are downloaded, benchmarked or able to replace cloud chat,
research and coding products.

## Read-only host observation

- Device: Acer Nitro AN515-55.
- CPU: Intel Core i5-10300H, 4 cores / 8 logical processors.
- System memory: approximately 15.8 GiB.
- GPU: NVIDIA GeForce GTX 1650 Ti with approximately 4 GiB VRAM, plus Intel UHD.
- Known Ollama/Hugging Face/LM Studio model stores: no files observed.
- No `ollama`, `llama-server` or `lmstudio` executable resolved on `PATH`.
- Free storage observed: approximately 23.2 GiB on `C:` and 953.5 GiB on `D:`.

Commands used:

```powershell
Get-CimInstance Win32_ComputerSystem
Get-CimInstance Win32_Processor
Get-CimInstance Win32_VideoController
Get-Command ollama,llama-server,lmstudio -ErrorAction SilentlyContinue
Get-ChildItem <known-model-store> -Recurse -File
Get-PSDrive -PSProvider FileSystem
```

## Planning inference

This hardware may be useful for small quantized language models, embedding,
reranking, OCR, speech, classifiers and other specialist local components, but
that is only a planning inference. Exact candidates require a current model/
license review and measured quality, latency, RAM/VRAM, thermals and stability
benchmarks. A 4 GiB GPU and 16 GiB-class system must not be advertised as a
complete local substitute for frontier cloud reasoning, large-context,
multimodal research and production coding systems without current evidence.

## Required next gate

Before downloading a model, Omnia needs a user-approved storage/runtime plan,
license and source record, exact hashes, resumable download, malware/supply-
chain checks, resource prediction and rollback/removal plan. Downloads should
prefer the spacious configured data volume rather than silently filling the
system drive. Candidate promotion requires role-specific benchmarks and a
hybrid fallback policy.
