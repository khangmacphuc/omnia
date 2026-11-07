---
id: OMNIA-ULTRA-OBS-LIFECYCLE
title: Request lifecycle and timeline
status: normative-target
schema: schemas/request-telemetry.schema.json
---

# Request lifecycle

One logical user request may contain iterations, provider attempts, tool calls,
subagent runs and artifacts. Never compress them into one mutable row.

## Lifecycle

~~~text
draft
-> queued
-> validating
-> preparing
-> frozen
-> dispatching
-> provider_accepted | outcome_unknown
-> streaming
-> tool_wait | approval_wait | agent_wait
-> stalled
-> retry_scheduled | fallback | repair
-> completed | failed | cancelled | outcome_unknown
~~~

## Timeline milestones

Persist wall-clock anchors for display and monotonic offsets for durations:

- created;
- queued;
- preparation started/completed;
- context compiled;
- approval requested/resolved;
- dispatch started;
- request committed;
- first byte;
- first provider item;
- first reasoning item;
- first visible output;
- first complete item;
- last visible output;
- tool/subagent start/end;
- retry scheduled/started;
- terminal.

Derived durations:

- queue time;
- context preparation time;
- approval wait;
- request upload;
- TTFB;
- time to first provider output;
- TTFT/first visible output;
- time to first complete item;
- visible generation time;
- tool wait;
- retry wait;
- total wall time.

If a clock domain changes during sleep/resume or recovery, mark the sample as
partial instead of subtracting unrelated clocks.

## UI behavior

The current request is expanded by default. Older requests show a compact row
with status, model, effort, duration, attempts, tokens and cost. Clicking any
row opens the exact attempt timeline and request inspector.

