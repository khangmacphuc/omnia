---
id: OMNIA-ULTRA-HARNESS-EVAL
title: Evaluation, adaptive learning and routing
status: normative-target
---

# Evaluation and adaptive routing

## Evaluation dimensions

- correctness;
- instruction adherence;
- groundedness;
- citation support;
- completeness;
- usefulness;
- code compile/test;
- security;
- accessibility;
- visual quality;
- latency;
- cost;
- retry recovery;
- context efficiency;
- agent contribution;
- user correction rate.

## Evaluation modes

- deterministic tests;
- golden tasks;
- property/fuzz;
- human review;
- rubric judge;
- pairwise comparison;
- offline replay;
- shadow route;
- A/B/canary;
- production opt-in feedback.

An LLM judge is evidence, not the only completion gate.

## Learning loop

~~~text
committed events
-> privacy classification/redaction
-> feature extraction
-> baseline comparison
-> candidate policy/model
-> offline evaluation
-> shadow/canary
-> drift/cost/safety monitor
-> promote or rollback
~~~

Candidate methods include embeddings, sparse/dense retrieval, reranking, KNN,
classification, clustering, XGBoost, bandits, offline RL, preference learning,
active learning, anomaly detection, graph features and Bayesian optimization.

User behavior learning must be opt-in, local-first, inspectable and deleteable.
Do not collect system-wide raw keystrokes by default. Sensitive fields, secrets,
passwords and credentials are excluded.

## Router

The router chooses model, provider, effort, context strategy, bridge, agent,
tool, machine and workflow. It can explore in bounded shadow/A-B mode but cannot
choose security policy, bypass approval or send data to an unapproved destination.

