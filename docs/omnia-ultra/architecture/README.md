---
id: OMNIA-ULTRA-ARCH-INDEX
title: Architecture bundle
status: normative-target
---

# Architecture bundle

Read this bundle before changing native state, IPC, storage, provider dispatch,
context, memory, telemetry, clients or update behavior.

Files:

- authority-and-event-model.md
- authoritative-root-api-contract.md
- state-revision-graph.md
- canonical-domain-model.md
- client-runtime-topology.md
- runtime-composition-and-lifecycle.md
- context-memory-search.md
- cache-context-routing.md
- data-lineage-and-storage.md
- adaptive-intelligence-plane.md
- self-update-and-continuation.md
- multimodal-capability-bridge.md
- multimodal-bridge-contract-v2.md
- run-control-native-mapping.md

The native kernel remains the authority. Renderer notifications are consequences
of committed facts, never the source of truth.

For the moving implementation boundary, read
[`runtime-composition-and-lifecycle.md`](runtime-composition-and-lifecycle.md)
alongside the target topology and storage documents. It explains the current
browser/desktop bridge, renderer composition root, native state ownership,
snapshot/transfer semantics, and the evidence required before a foundation
module is described as a verified packaged capability.
