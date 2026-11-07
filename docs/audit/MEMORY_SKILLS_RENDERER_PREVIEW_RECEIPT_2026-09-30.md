---
id: OMNIA-AUDIT-MEMORY-SKILLS-RENDERER-PREVIEW-2026-09-30
title: Memory and Skills renderer-preview receipt
status: bounded-renderer-evidence
date: 2026-09-30
---

# Scope

This receipt records current bounded evidence for
`OMNIA-CAP-MEMORY-SKILLS-PERSONAS`. The renderer has substantial Memory and
Skills review/authoring surfaces, including provenance and revision inspection,
scope and mode controls, reversible proposal decisions, skill activation
checklists, project activation matrices, package/version comparisons, catalog
filters, domain coverage and portable manifest previews. These surfaces never
grant capability or inject content into a provider request by themselves.

# Same-snapshot focused check

Command:

```text
npm.cmd exec vitest -- run src/features/workspace/memory-screen.test.tsx src/features/workspace/memory-proposal-inbox.test.tsx src/features/workspace/memory-lifecycle-studio.test.tsx src/features/workspace/memory-draft-studio.test.tsx src/features/workspace/memory-review-workbench.test.tsx src/features/workspace/memory-provenance-revision-inspector.test.tsx src/features/workspace/memory-scope-mode-preview.test.tsx src/features/workspace/skills-screen.test.tsx src/features/workspace/skill-authoring-preview.test.tsx src/features/workspace/skill-registry-preview.test.tsx src/features/workspace/skill-package-review-preview.test.tsx src/features/workspace/skill-activation-matrix.test.tsx src/features/workspace/skills-domain-catalog.test.tsx src/features/workspace/context-memory-skill-receipt.test.tsx --pool=threads --poolOptions.threads.singleThread=true --reporter=verbose
```

Observed result on September 30, 2026:

```text
Test Files  14 passed (14)
Tests       73 passed (73)
```

The run covers Memory Studio lifecycle/proposal/review/draft/provenance/scope
surfaces, reversible import/export decisions, Skills Studio catalog and domain
views, keyboard tabs, activation review, version/package comparison, authoring,
project activation matrices and scoped context receipts.

# Status and limits

The capability remains `partial`. The evidence is renderer-local and does not
prove native durable memory/skill scopes or revisions, package signatures,
tool/MCP manifests, capability attenuation, provider injection, restart
recovery, deletion of derived indexes, or packaged Windows runtime behavior.
Persona/tool/MCP controls must remain explicitly preview/planned until their
authority and provenance contracts are wired.
