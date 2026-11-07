---
id: OMNIA-ULTRA-ARCH-LINEAGE
title: Data lineage, artifacts and storage
status: normative-target
---

# Data lineage and storage

Storage layers:

- transactional metadata database;
- append-only durable event journal;
- encrypted content-addressed blob store;
- search index;
- vector index;
- graph projections;
- telemetry/usage ledger;
- evaluation and experiment store;
- backup/export store.

Every input, output or transformation may carry:

- content hash;
- MIME/type;
- source;
- originating message/run/attempt;
- transformation graph;
- tool/model/provider;
- parameters;
- output hash;
- timestamps;
- sensitivity;
- retention;
- verification status.

Large paste, file conversion and model bridge operations must preserve the
original and transformed artifact. The model-facing derivative never replaces
the original in lineage.

Unknown is not zero. Estimated, provider-reported and invoiced cost remain
separate immutable observations linked by supersedes/reconciliation edges.

