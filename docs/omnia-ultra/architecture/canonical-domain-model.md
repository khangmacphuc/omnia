---
id: OMNIA-ULTRA-ARCH-DOMAIN
title: Canonical domain object model
status: normative-target
---

# Canonical domain model

Core objects:

- profile, project, workspace, conversation, branch;
- message, message revision, selection reference, annotation;
- goal, roadmap, blueprint, plan, task, milestone, dependency;
- run, iteration, attempt, item, tool call, agent run, process;
- provider, model, model profile, provider configuration revision;
- memory, skill, persona, workflow, template;
- source, source snapshot, claim, citation;
- artifact, artifact revision, transformation, evidence;
- machine, environment, browser session, pointer session;
- approval, capability grant, policy revision;
- schedule, trigger, integration, notification;
- usage observation, cost statement, health observation, evaluation;
- project twin revision, graph node, graph edge, audit receipt.

Every durable object has:

- stable ID;
- revision or version;
- owner/profile scope;
- provenance;
- created/updated timestamps;
- status;
- deletion/archive semantics;
- sensitivity classification when content-bearing.

Do not use null values to infer scope, authority, unknown usage or lifecycle
state. Use tagged unions and explicit states.

