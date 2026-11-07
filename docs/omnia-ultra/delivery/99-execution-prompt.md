---
id: OMNIA-ULTRA-EXECUTION-PROMPT
title: Execution prompt compatibility alias
status: operational-alias
canonical_prompt: ../goal/00-copy-ready-prompt.md
version: 1.6.0
last_reviewed: 2026-08-14
---

# Execution prompt compatibility alias

The single canonical copy-ready Omnia Ultra execution prompt is
[`../goal/00-copy-ready-prompt.md`](../goal/00-copy-ready-prompt.md).

Use that file when handing Omnia to another AI. This compatibility alias exists
only because earlier documentation and research referenced the delivery path.
It deliberately contains no independently maintained product requirements and
no mutable continuation anchor.

Before acting, the worker must also read the current-state bridge,
implementation status, the manifest reading protocol, the task's domain
bundles, relevant schemas, threat model, accepted ADRs and current source/test
evidence. The current continuation is mutable operational state and belongs in
`../04-CURRENT-STATE-BRIDGE.md`, `../../IMPLEMENTATION_STATUS.md` and dated
audit/evidence receipts.
