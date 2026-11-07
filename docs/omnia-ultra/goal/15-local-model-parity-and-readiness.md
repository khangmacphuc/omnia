---
id: OMNIA-ULTRA-GOAL-LOCAL-MODEL-PARITY
title: Local model readiness and product parity goal
status: normative-target
version: 1.0.0
last_reviewed: 2026-08-14
supersedes: []
requirements_registry_revision: 2026-08-14.6
---

# Local model readiness and product parity

Omnia must provide a first-class local-model stack for offline/private chat,
coding, embeddings, reranking, OCR, vision, speech, classifiers and adaptive
components. Downloads/imports require exact source, license, hash, format,
quantization, runtime, hardware prediction, storage plan, resumability,
integrity check, benchmark, rollback and safe removal.

The local-model planner inspects CPU, RAM, GPU/VRAM, drivers, disk, thermals and
desired roles. It recommends a portfolio rather than assuming one model can do
everything: general assistant, code, reasoning, vision/OCR, embedding,
reranker, speech-to-text/text-to-speech and lightweight routing/classification.
Users choose storage/runtime and approve substantial downloads.

Every candidate is benchmarked on quality, groundedness, coding/tests,
research/citation behavior, context length, prompt-cache behavior, prefill/
decode throughput, TTFT, memory/VRAM, thermals, stability, tool/structured
output support and privacy. The router can select local, cloud or hybrid based
on policy and measured evidence.

“Replace ChatGPT/Claude/Gemini/Perplexity/Codex/Cursor” is a parity program, not
a marketing claim. Maintain an evidence matrix for chat UX, deep research,
sources, multimodal files, coding/IDE/agent work, reliability, latency, cost,
offline/privacy, integrations and recovery. A surface is equivalent only after
current end-to-end gates; a local model is not called a full substitute merely
because it can answer a chat prompt.

The current host readiness is recorded in
`../../audit/LOCAL_MODEL_READINESS_2026-08-14.md`: no verified local runtime or
model payload is currently installed in the inspected locations. Therefore
local parity remains planned until download, runtime and benchmark evidence
exists.

See `../workbenches/local-model-lab.md`,
`../harness/model-routing-context-policy.md` and
`../delivery/capability-coverage.md`.
