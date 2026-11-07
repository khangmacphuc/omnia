---
id: OMNIA-ULTRA-OBS-COST
title: Usage, cost, quota and quality analytics
status: normative-target
---

# Cost and usage analytics

Dashboards are projections over an append-only ledger.

Views:

- per request;
- per attempt;
- per run;
- per branch/fork;
- per agent/subagent;
- per task/goal/project;
- per provider/model;
- per day/week/month;
- per experiment;
- per local model;
- per workflow.

Show:

- input/output/reasoning/cache;
- visible throughput;
- latency percentiles;
- retry/fallback overhead;
- queue/tool/approval wait;
- cost estimate/report/invoice;
- quota headroom;
- quality/evaluation score;
- failure and recovery rate;
- forecast;
- budget alerts.

Do not overwrite an estimate with a provider report. Preserve both and show a
reconciliation edge. Historical cost uses the frozen price snapshot that was
active at the time; later catalog changes do not rewrite history.

Metrics labels must be bounded and content-free. User/project/conversation IDs,
raw prompt text, URLs, file paths and request IDs belong in restricted local
diagnostics, not exported metric dimensions.

