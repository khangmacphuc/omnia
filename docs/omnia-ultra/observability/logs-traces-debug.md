---
id: OMNIA-ULTRA-OBS-DEBUG
title: Request logs, traces and debug replay
status: normative-target
---

# Logs and traces

Every important action has a correlation ID and structured event:

- UI command;
- native command;
- state transition;
- context compile;
- retrieval;
- memory/skill read;
- provider attempt;
- stream item;
- tool call;
- agent transition;
- file transformation;
- browser/pointer action;
- retry/fallback;
- artifact;
- evaluation;
- update/restart.

The request inspector can navigate from a visible UI error to the exact event,
attempt, input snapshot, context manifest, provider response metadata, tool
trace and artifact lineage.

## Redaction

Default operational telemetry must not contain raw prompts, responses,
reasoning, credentials, cookies, headers, raw tool payloads, paths or URLs as
metric labels. A separate user-reviewed support bundle may include selected
content after preview and redaction.

## Replay

Replay is a new run using a frozen source snapshot and explicit environment.
It must display what changed from the original. Replay is not a silent mutation
of history.

## Debug bundles

A debug bundle may include:

- source versions;
- schema versions;
- redacted request metadata;
- event cursors;
- test output;
- provider error classes;
- usage/cost observations;
- selected artifact hashes;
- UI action IDs;
- screenshots;
- environment diagnostics.

Never include secret plaintext or opaque vault contents.

