---
id: OMNIA-ULTRA-ARCH-CONTEXT
title: Context compiler, memory and retrieval
status: normative-target
---

# Context compiler, memory and retrieval

The context compiler transforms raw conversation and project data into
typed semantic units:

- current user instruction;
- latest correction;
- superseded instruction;
- project convention;
- source-backed fact;
- preference;
- retrieved evidence;
- tool result;
- artifact reference;
- unverified inference.

Rules:

- current user request and latest correction have final semantic authority;
- new facts supersede old facts;
- assistant history cannot inherit user-instruction authority;
- restricted observations do not automatically enter context, memory, export or UI;
- every selected unit has provenance and a selection reason;
- missing/stale context is explicit;
- context budget and cache composition are visible.

Retrieval stack:

- exact/pinned selection;
- file and symbol lookup;
- sparse search;
- dense embedding search;
- graph traversal;
- temporal freshness;
- hybrid reranking;
- conditional search;
- query decomposition;
- contradiction detection;
- lost-in-the-middle ordering;
- context compression with reversible source links.

Memory scopes:

- global;
- workspace;
- project;
- conversation;
- goal/task;
- agent;
- device;
- ephemeral run.

Memory writes are proposals with source, confidence, sensitivity, supersession,
expiry and projection policy. Memory, skills, personas and learned routing never
grant capabilities.

