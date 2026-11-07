---
id: OMNIA-AUDIT-PROJECT-DECK-CACHE-TELEMETRY-2026-09-29
title: Documentation audit receipt — Project Deck cache/context/routing/telemetry phase
status: evidence-note
snapshot_date: 2026-09-29
---

# Documentation audit receipt

## Scope

This receipt covers documentation and source inspection only. It establishes
the proposed next slice and its evidence boundaries; it is not a test receipt
for code, the native runtime or a provider.

## Inputs inspected

- `docs/omnia-ultra/02-PRECEDENCE-AND-STATUS.md`
- `docs/omnia-ultra/04-CURRENT-STATE-BRIDGE.md`
- `docs/omnia-ultra/delivery/roadmap.md`
- `docs/omnia-ultra/delivery/workstreams-and-dependencies.md`
- `docs/omnia-ultra/interaction/project-chat-foundation.md`
- `docs/omnia-ultra/project-twin/roadmaps-blueprints-plans.md`
- `docs/omnia-ultra/project-twin/graph-and-atlas.md`
- `docs/omnia-ultra/observability/request-usage-telemetry.md`
- `docs/omnia-ultra/observability/cost-usage-analytics.md`
- `docs/omnia-ultra/harness/agents-subagents-personas.md`
- `docs/omnia-ultra/harness/ultra-workflow.md`
- `docs/omnia-ultra/architecture/context-memory-search.md`
- `docs/omnia-ultra/architecture/cache-context-routing.md`
- `docs/omnia-ultra/goal/13-cache-context-routing-compaction.md`
- `docs/omnia-ultra/goal/14-telemetry-data-and-safe-learning.md`
- `docs/omnia-ultra/schemas/cache-policy.schema.json`
- `docs/omnia-ultra/schemas/context-delivery-policy.schema.json`
- `docs/omnia-ultra/schemas/model-routing-policy.schema.json`
- `docs/omnia-ultra/schemas/request-telemetry.schema.json`
- `docs/IMPLEMENTATION_STATUS.md`
- `src/features/workspace/project-control-deck.tsx`
- `src/features/workspace/project-control-deck.test.tsx`
- `src/features/workspace/context-harness.ts`
- `src/features/workspace/context-compiler-preview.tsx`
- `src/features/workspace/model-router-preview.tsx`
- `src/features/workspace/routing-workbench.tsx`
- `src/features/workspace/telemetry-inspector-preview.tsx`
- `src/features/workspace/request-inspector-projection.ts`

## Observed findings

1. Project Control Deck already owns the correct Project-scoped composition
   point and exposes the tabs needed for a compact policy summary.
2. Context, route and telemetry previews already have separate contracts and
   explicit preview/unknown language; a new slice should compose them rather
   than create another state store.
3. The cache architecture explicitly distinguishes local object/context/
   retrieval reuse from provider-native cache and provider-reported billing
   fields. The UI must show those as separate rows.
4. Main-agent and subagent route settings are separate normative concerns even
   when both are currently `Auto`; the UI must preserve that distinction.
5. Current implementation status calls the relevant surfaces renderer-local,
   partial or preview. No source inspected here proves native persistence,
   provider HTTP, complete timing/quota/cost telemetry, agent leases/mailboxes,
   compiler execution or training.

## Decision

Choose PD-CTT-01 (Project Deck policy summary) as the next small vertical
slice. Keep it renderer-session only, add deterministic view-model and
component tests, and update implementation evidence only after same-snapshot
gates. The detailed atomic tasks and exact continuation prompt are in
`OMNIA_PHASE_PLAN_PROJECT_DECK_CACHE_TELEMETRY_2026-09-29.md`.

## Evidence classification

| Claim | Classification |
| --- | --- |
| Existing Project Deck and related preview modules are present | Source inspection; current-tree fact |
| Cache/context/routing/telemetry requirements and schemas exist | Normative documentation fact |
| PD-CTT-01 can be implemented without a new native authority path | Design judgment; re-check during implementation |
| Browser preview will show the new summary after implementation | Planned; requires code/build/preview evidence |
| Native cache/telemetry/provider/model behavior | Not observed / out of scope |

## Implementation follow-up — 2026-09-29

The first bounded renderer slice was implemented after this documentation
receipt was written:

- `src/features/workspace/project-runtime-posture.tsx` adds a typed, pure
  posture projection for context availability, cache evidence and telemetry
  coverage.
- `src/features/workspace/project-control-deck.tsx` mounts the posture strip in
  the existing Snapshot surface and derives telemetry only from the already
  hydrated project run IDs.
- `src/styles/project-control-deck.css` adds responsive, overflow-safe cards;
  the cards navigate to the existing Context and Signals tabs.
- `src/features/workspace/project-runtime-posture.test.tsx` covers unknown
  cache/telemetry, provider-reported counters and navigation transitions.

Observed gates for this follow-up:

| Check | Result | Boundary |
| --- | --- | --- |
| Focused posture Vitest | 3/3 passed | Renderer component/projection only |
| Project Control Deck Vitest | 23/23 passed | Existing renderer contract only |
| `npm.cmd run typecheck:app` | Passed | Type/source check only |
| `npm.cmd run check:typography` | Passed | Stylesheet contract only |
| `npm.cmd run check:hit-targets` | Passed | Renderer hit-target contract only |
| `npm.cmd run build:renderer` | Passed, 2,084 modules | Unsigned browser renderer build |
| `npm.cmd run smoke:preview` | `OMNIA_SMOKE_OK`, port 1420 | HTTP/HMR preview smoke only |
| In-app Browser preview | Posture rendered; Context and Signals cards navigated | Browser renderer, not native Tauri |

The strip intentionally reports `No provider cache evidence` when no
provider-reported counters are hydrated. It does not turn local reuse into a
provider cache hit and does not add a native write, provider request, compiler
authority, durable telemetry journal, or training path. The broader PD-CTT-01
route/context policy editor and export redaction work remain partial/planned.

## Same-day continuation — September 30, 2026

The policy summary was continued without changing its authority boundary:

- `ProjectPolicyExportFormat` now supports JSON and Markdown inspection, copy,
  and browser download. The export boundary explicitly states that this
  preview does not collect or export credentials, prompts, responses, cookies,
  file bytes or local paths.
- The Project Deck lazy-surface loader now accepts a semantic loading projection;
  Signals immediately exposes its project heading and renderer-only boundary
  while the optional signal module is loading.

Focused evidence:

| Check | Result | Boundary |
| --- | --- | --- |
| Policy summary focused suite | 6/6 passed | Renderer-local interaction only |
| Project Control Deck focused suite | 23/23 passed | Renderer-local contract only |
| Default renderer build | `ENOSPC` on the C: output volume | Host storage limitation; no source error inferred |
| Alternate-volume renderer build | Passed; 2,085 modules | Unsigned browser build; one pre-existing Vite chunking warning |
| Browser smoke | Markdown export and Signals fallback/loaded state observed | Browser preview only |
| Browser console | No warning/error entries observed after smoke | Devtools observation only |
