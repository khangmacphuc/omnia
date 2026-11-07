---
id: OMNIA-PHASE-PLAN-PROJECT-DECK-CACHE-TELEMETRY-2026-09-29
title: Atomic phase plan — Project Deck, context, cache, routing and telemetry
status: operational-plan
snapshot_date: 2026-09-29
---

# Atomic phase plan: Project Deck policy summary

This plan decomposes the next small, dependency-ready UI-first slice. It is
deliberately narrower than the complete Omnia Ultra goal. Each item is atomic
enough to implement, review, test and report without turning a renderer preview
into a native/runtime claim.

## 1. Objective and success boundary

Create one compact Project Control Deck policy surface that lets a user see and
rehearse, in one place:

- main-agent and subagent model choices with their inheritance source;
- `Auto` route strategy and deterministic illustrative reason;
- context delivery mode and token-budget summary;
- local reuse/cache state versus provider-reported cache evidence;
- telemetry coverage, freshness and unknown/partial reasons;
- reversible renderer-session controls and a portable inspection preview.

Success means the browser renderer is coherent, accessible, responsive and
truthful. Success does **not** mean provider dispatch, native persistence,
encrypted cache storage, billing evidence, agent orchestration, model training
or packaged desktop readiness.

## 2. Phase map

| Phase | ID | Status now | Dependency | Deliverable |
| --- | --- | --- | --- | --- |
| 0 | PD-CTT-00 | Designed / documented | current source and normative pack | this plan, checkpoint and audit boundary |
| 1 | PD-CTT-01A | Implemented for bounded renderer draft | existing Project Deck + route/context/telemetry types | typed policy draft with main/subagent route separation, context/cache/compaction fields and explicit provenance boundaries |
| 1 | PD-CTT-01B | Implemented — Snapshot policy summary mounted | PD-CTT-01A | compact Snapshot composition with posture cards plus reversible policy controls |
| 1 | PD-CTT-01C | Implemented for renderer controls | PD-CTT-01B | model/context/compaction/cache selectors, four-state local inventory filter (`All`, `Reusable`, `Invalidated`, `Unknown`), details disclosure, undo/redo/reset |
| 1 | PD-CTT-01D | Implemented for JSON inspection | PD-CTT-01B | inspect/copy/download renderer-session policy JSON with redaction boundary |
| 1 | PD-CTT-01E | Implemented for bounded slice; app typecheck unverified | PD-CTT-01A..01D | focused tests, renderer build and live browser evidence |
| 2 | PD-CTT-02 | Planned / blocked on native proof | PD-CTT-01 plus native receipt contracts | replace fixture values with hydrated native receipts, preserving unknowns |
| 3 | PD-CTT-03 | Planned / separate track | PD-CTT-02 plus cache/provider contracts | provider-native cache plan and route receipt integration |
| 4 | PD-CTT-04 | Planned / separate track | PD-CTT-02 plus run journal/replay | durable telemetry, timing, quota, cost and recovery integration |

Phase 1 is the only implementation scope for the next turn. Phases 2–4 are
dependency notes, not permission to fake native state in the browser.

## 2A. Implementation evidence — September 30, 2026

The bounded policy-summary slice is now mounted in the selected Project's
Snapshot surface at `src/features/workspace/project-policy-summary.tsx` and
composed by `src/features/workspace/project-control-deck.tsx`. It remains a
renderer-session draft: no provider request, native route write, context
compile, agent spawn, cache handle or durable setting is created.

Same-snapshot checks:

| Check | Result | Boundary |
| --- | --- | --- |
| `project-policy-summary.test.tsx` | 5/5 passed | Renderer component interaction only |
| `project-control-deck.test.tsx` | 23/23 passed | Existing Project Deck renderer contract |
| `npm.cmd run build:renderer` | Passed; 2,085 modules | Unsigned browser renderer build; one pre-existing chunking warning |
| In-app Browser preview | Snapshot rendered; mode/compaction/evidence/JSON interactions exercised | Browser renderer only; no native/runtime claim |
| Browser console errors/warnings after smoke | None observed | Devtools observation for this preview tab |
| `npm.cmd run typecheck:app -- --pretty false` | Unverified / timed out after roughly 90 seconds; stopped | No typecheck pass claim |

The summary uses the normative `summary-plus-sources` context mode, includes a
`Disabled` compaction option, labels model provenance as preview/demo/native
catalog metadata, and distinguishes local reuse from provider cache evidence.
When project context is blocked by missing access or an over-budget state, the
heuristic token estimate is withheld rather than presented as authoritative.

## 2B. Same-day continuation evidence — September 30, 2026

The next bounded continuation completed two renderer-only follow-ups:

- Policy inspection now has a real `JSON` / `Markdown` format selector. Both
  copy and browser download follow the selected format (`.json` or `.md`), and
  the boundary wording says explicitly that the preview does not collect or
  export credentials, prompts, responses, cookies, file bytes or local paths.
- `ProjectDeckLazySurface` accepts a semantic loading projection. The Signals
  tab now shows its project heading and renderer-only boundary immediately
  while the optional signal-center module loads, instead of presenting an
  anonymous spinner-only block.

Same-snapshot checks for this continuation:

| Check | Result | Boundary |
| --- | --- | --- |
| `project-policy-summary.test.tsx` | 6/6 passed | Renderer component/export interaction only |
| `project-control-deck.test.tsx` | 23/23 passed | Existing Project Deck renderer contract; isolated full-file run |
| `npm.cmd run build:renderer` (default C: outDir) | Blocked by `ENOSPC` | Host storage condition, not a source diagnostic |
| `npm.cmd run build:renderer -- --outDir D:\\omnia-renderer-build-20260930` | Passed; 2,085 modules | Unsigned renderer build written to the alternate volume; one pre-existing chunking warning |
| In-app Browser preview | Markdown format/inspect payload verified; Signals loading projection and eventual signal center verified | Browser renderer only; no native/runtime claim |
| Browser console errors/warnings after smoke | None observed | Devtools observation for this preview tab |

The full app typecheck remains unverified from the earlier timeout; the focused
tests and alternate-volume renderer build do not promote this slice to native,
provider, compiler, persistence, agent-coordination or model-training evidence.

## 2C. Local cache inventory filter continuation — October 1, 2026

The cache/context preview now exposes the remaining PD-CTT-01C inventory
control as an explicit four-state display filter: `All`, `Reusable`,
`Invalidated`, and `Unknown`. The filter is display-only and operates on the
redacted renderer inventory; it does not delete native objects, change provider
cache state, or imply provider billing evidence.

The mappings are intentionally narrow:

- `All` keeps every valid redacted inventory row visible.
- `Reusable` keeps only rows currently eligible under the local reuse policy.
- `Invalidated` keeps only rows explicitly marked `invalidated`.
- `Unknown` keeps only rows whose state is explicitly `unknown`.

Stale and expired rows remain visible in `All` until the user rehearses
invalidation. That rehearsal marks unpinned stale/expired rows as
`invalidated`; pinned rows are preserved. The inventory export still contains
the complete redacted inventory and records the selected display filter in its
inventory payload, without claiming native deletion or provider-cache billing.

Same-snapshot focused evidence from `D:\\Omnia\\repos\\omnia`:

| Check | Result | Boundary |
| --- | --- | --- |
| `cache-context-routing-contract.test.ts` | 14/14 passed | Pure contract/builders; no native storage |
| `cache-context-routing-preview.test.tsx` | 6/6 passed | Renderer filter, invalidation rehearsal and export interaction |
| Combined cache-focused tests | 20/20 passed | Renderer/source slice only |
| `npm.cmd run check:imports` | Passed; 394 production modules / 806 local imports | Import-boundary contract |
| App typecheck | Unverified after the bounded run did not produce output | No typecheck pass claim |

The native cache boundary remains planned. Missing provider telemetry and cache
evidence remain `unknown`; local reuse is never presented as provider cache
evidence.

## 3. Atomic requirements

### PD-CTT-01A — typed policy-summary model

**Inputs:** selected `ProjectView`, available model profiles/providers, existing
context compiler projection, telemetry inspector record shape.

**Output:** a pure, deterministic view model with explicit fields for:

- `mainRoute` and `subagentRoute` (mode, profile label, source, effort,
  fallback disposition);
- `autoPolicy` (strategy, objective weights, illustrative reason);
- `contextDelivery` (mode, selected/omitted counts, estimated input tokens,
  maximum input tokens, compaction label and source);
- `localCache` (status, object kinds, reuse reason, freshness, invalidation);
- `providerCache` (status, evidence source, read/write tokens or unknown);
- `telemetryCoverage` (status, observed fields, unavailable fields, freshness);
- `boundary` (renderer-local, no durable write, no provider request).

**Rules:**

- Missing is represented as `unknown`, never numeric zero.
- Local reuse never becomes provider cache evidence.
- An illustrative score never becomes a provider latency, cost or quality
  measurement.
- Main and subagent route fields remain separate even when both resolve to
  `Auto`.

**Acceptance:** pure builders are deterministic for the same input, preserve
unknowns and do not import native/credential modules.

### PD-CTT-01B — Project Deck composition

Mount one compact section in the existing Project Control Deck. Reuse current
tab/section conventions; do not create a second global routing or telemetry
mode.

Required visible groups:

1. `Effective route` — main model, subagent model, `Auto` explanation and
   inheritance source.
2. `Context delivery` — mode, budget, selected/omitted source count and
   compaction state.
3. `Cache evidence` — two explicit rows: `Local reuse` and
   `Provider-reported cache`.
4. `Telemetry coverage` — observed/partial/unknown/planned chips and one
   content-free freshness line.

Each group needs an accessible heading and a boundary note where evidence is
   synthetic, session-only or unavailable.

**Acceptance:** no text clips at the supported desktop/mobile breakpoints;
section remains usable with zero projects, zero chats, absent provider data and
long model/profile labels.

### PD-CTT-01C — reversible renderer controls

Controls may change only the session preview:

- main route picker (`Auto` plus available profiles);
- subagent route picker (`Auto` plus available profiles);
- context mode picker;
- compact/expanded evidence detail;
- local cache display filter (`All`, `Reusable`, `Invalidated`, `Unknown`);
- `Undo`, `Redo`, `Reset`.

Every enabled button must change visible state and expose an accessible name;
unsupported native actions are disabled or labelled `Planned`/`Unavailable`.

**Acceptance:** undo/redo restores exact prior preview state; project switch
resets project-local draft state; no Zustand/native project mutation occurs.

### PD-CTT-01D — inspection export

Provide JSON and Markdown export using existing browser download helpers where
available. Include schema ID, generated time, selected project, effective
preview state and a boundary section. Exclude credentials, raw prompts,
responses, cookies, file bytes, arbitrary URLs and local paths.

**Acceptance:** export is deterministic apart from generated timestamp and
contains `scope: renderer-session`, `providerCacheEvidence` and `unknown`
values where evidence is absent.

### PD-CTT-01E — focused evidence

Add focused tests for:

- model builder preserves main/subagent separation;
- local cache and provider cache remain distinct;
- unknown fields render as unknown rather than zero/healthy/unlimited;
- controls transition, undo, redo and reset;
- project switching clears stale draft state;
- export includes boundary and excludes sensitive fields;
- accessibility names and responsive no-overflow contract.

Run the smallest changed-slice command first, then the standard gates listed in
Section 6. If a gate cannot finish, record `unverified` rather than retrying
indefinitely or declaring success.

## 4. Source/schema/evidence crosswalk

| Concern | Existing source/contract | Target reuse | New evidence needed |
| --- | --- | --- | --- |
| Project ownership | `interaction/project-chat-foundation.md`; `project-control-deck.tsx` | selected Project remains the owner; no duplicate Chat history | focused component test |
| Context modes | `context-harness.ts`; `schemas/context-delivery-policy.schema.json` | map mode/budget/selection counts to display-only fields | builder + render tests |
| Cache semantics | `architecture/cache-context-routing.md`; `schemas/cache-policy.schema.json` | two evidence rows and explicit invalidation/unknown | contract test proving separation |
| Main/subagent route | `model-router-preview.tsx`; `routing-workbench.tsx`; `schemas/model-routing-policy.schema.json` | reuse existing route labels and inheritance language | route-summary unit/component tests |
| Telemetry | `telemetry-inspector-preview.tsx`; `request-inspector-projection.ts`; `schemas/request-telemetry.schema.json` | use status/coverage vocabulary; preserve unknown | export and unknown-value tests |
| Project Twin | `project-twin-edge-evidence-preview.tsx`; `schemas/project-twin.schema.json` | optional evidence link only, never authority | no new Twin claim until implementation slice |

## 5. Security and privacy constraints

- Collect only policy-eligible Omnia interaction events; never install a covert
  system-wide keylogger or read raw keys from unrelated apps.
- Keep prompt bodies, responses, credentials, cookies, file bytes and raw tool
  payloads out of the summary and export by default.
- A user-selected route cannot amplify native authority, provider access,
  filesystem grants, agent permissions or telemetry retention.
- Local cache controls are preview controls until the native storage boundary
  proves encryption, scope, revocation, secure deletion and replay behavior.
- A route fallback choice is not a dispatch; provider authorization and
  outcome-unknown handling remain native contracts.

## 6. Verification plan for the implementation turn

Run in this order, scoped to the changed slice:

1. focused Vitest files for the new builder/composition;
2. `npm.cmd run typecheck:app`;
3. `npm.cmd run check:typography`;
4. `npm.cmd run check:hit-targets`;
5. `npm.cmd run build:renderer`;
6. `npm.cmd run smoke:preview` while reusing the existing port-1420 listener;
7. relevant import/ACL/cursor/authoritative-root/spec/Project Twin checks if
   source contracts or manifest-visible files change.

These checks prove renderer/source behavior only. They do not prove Tauri,
Rust, provider HTTP, native persistence, billing, model training or packaged
EXE behavior.

## 7. Exact continuation prompt

```text
/goal

Continue Omnia in C:\Users\khang\source\repos\omnia using the current
uncommitted tree. Read docs/omnia-ultra/02-PRECEDENCE-AND-STATUS.md,
docs/omnia-ultra/04-CURRENT-STATE-BRIDGE.md, the relevant interaction,
architecture, observability, harness and schema files, plus:

- docs/audit/OMNIA_CONTINUATION_CHECKPOINT_2026-09-29.md
- docs/audit/OMNIA_PHASE_PLAN_PROJECT_DECK_CACHE_TELEMETRY_2026-09-29.md

Implement only Phase 1 / PD-CTT-01A..01E: a compact Project Control Deck
policy summary that visibly separates main-agent and subagent routing, context
delivery, local reuse/cache evidence, provider-reported cache evidence and
telemetry coverage. Reuse existing contracts and surfaces; do not create a
parallel kernel or global mode. Keep the entire slice renderer-session only.

Every button must have a real visible state transition or be disabled with a
truthful Planned/Unavailable label. Preserve unknown as unknown, keep local
reuse separate from provider cache, and never imply provider billing, native
dispatch, durable persistence, agent leases, compiler authority or training.
Add focused tests for deterministic view-model behavior, route separation,
cache evidence separation, unknown/partial rendering, undo/redo/reset,
project-switch reset, export redaction and accessibility/no-overflow. Run the
focused tests, app typecheck, typography, hit-target, renderer build and
preview smoke; reuse the existing port-1420 listener. Update the dated audit
receipt and implementation-status/capability evidence only after same-snapshot
checks. Do not stage, commit, push or create a PR.
```

## 8. Stop/report conditions

Stop the slice and report a blocker if a required native authority, schema
revision, user choice or safe data boundary is missing. Do not hide blocked
work behind a polished mock. If only a renderer projection is possible, keep
the `Preview only`, `Renderer-local`, `Unknown`, `Partial`, `Planned` or
`Unavailable` label visible and report the next dependency explicitly.
