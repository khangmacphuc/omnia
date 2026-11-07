---
id: OMNIA-ULTRA-TWIN-GRAPH
title: Graph model and interactive atlas
status: normative-target
schema: schemas/project-twin.schema.json
---

# Graph and atlas

Required graph families:

- product and requirements;
- architecture and dependencies;
- files, symbols, calls and data flow;
- state machines, API and database;
- UI navigation and interaction;
- goals, roadmaps, plans, tasks and milestones;
- agents, workflows and tool calls;
- sources, claims and citations;
- knowledge and prerequisites;
- tests, coverage and evidence;
- artifacts and transformations;
- risks, decisions and releases;
- conversation, prompt, branch, fork and attempt lineage.

Every edge has type, source, target, provenance, evidence class, created time,
confidence only for inference, and stale state.

The atlas is offline-capable, accessible and Git-friendly. It links project
concepts to files, symbols and exact lines. It supports filtering by scope,
time, branch, status, evidence, owner and confidence.

Do not create decorative AI-inferred edges without evidence.

