---
id: OMNIA-ULTRA-INT-ACTIVE-RUN-VARIANTS-COMPARE
title: Active-run copy, branch, fork, compare and promotion contract
status: normative-target
version: 1.0.0
last_reviewed: 2026-08-14
supersedes: []
---

# Active-run variants and compare

While a run is active, Omnia exposes copy, duplicate, branch, fork, retry,
regenerate, compare, promote, merge, queue, steer and Btw without mutating the
frozen provider input. Every action pins a durable source cursor and records a
chosen in-flight resolution.

## Source-output choices

For a live stream or incomplete tool call, the user chooses `last-durable-
cursor`, `checkpoint-output`, `include-partial-as-interrupted-artifact`,
`wait-for-safe-boundary` or `fork-without-active-output`. Transient text is
never silently treated as committed state. Copy/export labels whether the
source was durable or transient and preserves redaction metadata.

## Action resolution

| Action | Safe in-flight resolution | Durable result |
| --- | --- | --- |
| Pause | safe boundary, cancel/reconcile or pending effect | checkpoint/unknown receipt |
| Stop | cancellation boundary | terminal cancellation receipt |
| Steer | attach to next permitted boundary | steer intent, frozen input unchanged |
| Edit/retry | queue, interrupt-new-attempt or fork | immutable revision and lineage |
| Branch/fork | pin cursor and attenuate authority | isolated branch with fresh policy |
| Copy/duplicate | presentation or new task from pinned snapshot | no provider mutation |
| Compare | pin two/N state cursors | immutable compare session |
| Promote/merge | conflict and authority review | new decision/state revision |

## Compare and merge

Compare records left/right or N-way state cursors, baseline watermark, prompt
revisions, context manifests, branch lineage, provider/model/effort/parameters,
outputs, sources, files, tools/effects, tests, tokens, cache, cost, latency and
evaluation. `live-follow` is a separate subscription and never rewrites the
pinned result. Promotion/merge preserves every parent and blocks instruction,
file, task, source, authority, secret or unknown-effect conflicts until the
user resolves them.

## Shared active-run ribbon

Chat, background drawer, run inspector, branch graph, notification and screen
reader consume the same durable status line:

~~~text
state | phase | branch | model/effort | elapsed | usage/cost authority | next safe boundary
~~~

Expanded details show run/attempt/iteration IDs, atomic unit, cursor,
frozen-input revision, provider acceptance, queue/steer dependencies,
checkpoint, child agents, effect receipts, budget and disabled-control reason.
Animations are supplemental and obey reduced-motion settings.

## Concurrency and acceptance

Every command carries expected state revision, run epoch, idempotency key and
subscription watermark. CAS results are `applied`, `already-applied`,
`stale`, `conflicted`, `blocked`, `reconcile-required` or `denied`; no client
uses last-writer-wins. Tests cover two clients, live compare pinning, partial
output choices, branch isolation, keyboard/touch/screen-reader focus and
promotion rollback.

See `../schemas/comparison-session.schema.json`,
`../schemas/run-control-operation.schema.json`, `branching-copy-fork.md` and
`queue-steer-schedule.md`.
