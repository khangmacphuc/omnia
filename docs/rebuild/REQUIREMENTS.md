# Requirement traceability

This file is the human-readable map for the atomic authority in `DOD.json`.
Each user correction is represented by one or more stable criterion IDs; criteria
are never removed to improve status. The machine matrix is the final authority.

| Requirement family | Criterion ranges | Observable boundary |
| --- | --- | --- |
| New UI from scratch, no legacy reuse | UI-001..015 | New entry import graph and source scan; no old UI evidence reused |
| Chat/project/non-project/session tabs | CHAT-001..015 | Native state, reload, event, race and interaction receipts |
| Pointer storage and project files | STORAGE-001..010 | Stable identity, snapshots, rename/delete/traversal tests |
| RAG, citations, context compaction | RAG-001..010 | Ingestion/retrieval receipts and budget tests |
| Model/effort/compare/routing | ROUTING-001..010 | Frozen lineage, safe cancel/replay and hot settings |
| Goal/plan/DoD/subagents | WORKFLOW-001..010 | Durable state, role/ownership and evidence reports |
| Observability and cost | OBSERVABILITY-001..010 | Correlated metrics, redaction, source precedence |
| IDE | IDE-001..010 | Local editor/file permissions and conflict behavior |
| Browser/computer harness | BROWSER-001..010 | Native lease, capture, layered DOM, lazy computer use |
| Skills/tools/MCP/plugins/research | TOOLS-001..010 | Provenance, permissions, schema, web citations |
| Advanced runtime settings/retry | SETTINGS-001..010 | Versioned validation, hot reload, requested/applied status |
| Accessibility | ACCESSIBILITY-001..010 | Semantic keyboard/contrast/zoom/reduced-motion evidence |
| Performance | PERFORMANCE-001..010 | Environment-stamped startup/input/memory/scale receipts |
| Portability/native persistence/CI | PORTABILITY-001..010 | Restart/export/migration/secrets/version gates |
| Governance and continuous research | GOVERNANCE-001..010, RESEARCH-001..010 | Workflow stage/evidence/novel OSS/spec reread gates |

Historical `docs/PRODUCT_SPEC.md` claims were not copied into Done status. The
rebuild matrix starts all criteria planned and requires current receipts. Any
criterion without direct evidence is reported partial, blocked or planned.
