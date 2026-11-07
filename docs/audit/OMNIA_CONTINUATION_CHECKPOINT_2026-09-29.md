---
id: OMNIA-CONTINUATION-CHECKPOINT-2026-09-29
title: Omnia Ultra continuation checkpoint — Project Deck, context, cache and telemetry
status: informational
snapshot_date: 2026-09-29
authority: docs/omnia-ultra/02-PRECEDENCE-AND-STATUS.md
---

# Omnia Ultra continuation checkpoint

This checkpoint records the next dependency-ready documentation slice for the
shared, uncommitted working tree at `C:\Users\khang\source\repos\omnia`.
It does not promote a target requirement into an implementation claim. The
browser renderer at `http://127.0.0.1:1420/` remains an unsigned internal
preview; native Tauri/Rust, packaged execution, provider HTTP, durable
persistence, compiler authority, real agent leases/mailboxes and model
training are outside this checkpoint's evidence.

## 1. Authority and working-tree boundary

The authority order is unchanged:

1. system/platform constraints and the user request;
2. `docs/THREAT_MODEL.md` and `docs/omnia-ultra/security/hard-boundaries.md`;
3. accepted ADRs;
4. the current Omnia Ultra normative pack;
5. current source, tests and dated evidence;
6. delivery roadmap and research notes.

The repository has no commits yet and contains a large, user/agent-owned
working tree. This checkpoint therefore does not stage, commit, branch, push,
revert, reset or delete anything. The two files added by this documentation
slice live under `docs/audit/`, outside the manifest-closed Omnia Ultra pack,
so the pack manifest and source ledger do not need a speculative update.

## 2. Current source truth relevant to this slice

The following renderer surfaces already exist and are suitable for a small
vertical slice, subject to their existing preview boundaries:

| Surface | Current source | Current truth | Relevant gap |
| --- | --- | --- | --- |
| Project Control Deck | `src/features/workspace/project-control-deck.tsx` and `project-control-deck.test.tsx` | Interactive renderer surface with Snapshot, Signals, Chats, Context, Plan, IDE, Model, Access, Twin and Handoff tabs | No single policy summary joins model route, context delivery, cache evidence and telemetry coverage |
| Project context | `src/features/workspace/project-context-workbench.tsx`, `context-compiler-preview.tsx`, `context-harness.ts` | Renderer-local compiler/preflight projections with selected/omitted decisions and budgets | No native frozen context receipt or durable provider-input binding |
| Model routing | `src/features/workspace/model-router-preview.tsx`, `routing-workbench.tsx`, `routing-inheritance-preview.tsx` | Reversible session previews for strategy, constraints, candidate ranking and profile import/export | Scores are illustrative; no native route decision, fallback dispatch or learned policy promotion |
| Telemetry | `src/features/workspace/telemetry-inspector-preview.tsx`, `request-inspector-projection.ts` | Bounded content-free renderer telemetry inspection plus a partial native usage-read foundation | No complete timing/quota/final-cost/replay hydration or end-to-end inspector verdict |
| Project Twin | `src/features/workspace/project-twin-edge-evidence-preview.tsx` and related contracts | Renderer evidence/edge projection | No claim that graph projection is an execution authority or durable native revision |

The existing Project Deck tests cover tab state, truthful availability,
renderer-local customization, project switching reset, handoff staging and
accessibility semantics. They do not yet cover a unified cache/context/route/
telemetry summary because that composition does not exist.

### Same-snapshot implementation follow-up

The first narrow composition now exists as
`src/features/workspace/project-runtime-posture.tsx`. It is mounted in the
Snapshot tab and shows three truthful, navigable cards:

- Context delivery — reuses `ProjectContextAvailability` and keeps native
  revision gaps visible.
- Cache evidence — reports provider read/write counters only when hydrated;
  otherwise says that local reuse is not instrumented and must not be called
  provider cache.
- Telemetry coverage — distinguishes hydrated run telemetry, timeline-only
  evidence and no observed telemetry.

The focused posture tests, Project Deck tests, app typecheck, typography gate,
hit-target gate, renderer build and port-1420 smoke all passed in the same
working-tree snapshot. This is still a renderer-only implementation; the
larger route/context policy editor, export additions and native integrations
remain partial/planned.

## 3. Dependency-ready selection

The next slice is **PD-CTT-01 — Project Deck policy summary**. It is selected
because it can reuse existing contracts without inventing a parallel kernel:

```text
Project Control Deck
  ├─ effective model route (main + subagent + Auto explanation)
  ├─ context delivery mode and budget summary
  ├─ local reuse vs provider-reported cache evidence
  └─ telemetry coverage / unknown / partial summary
```

This is a composition and inspection slice, not a provider or native runtime
slice. It gives the user an immediately visible control surface while keeping
all unavailable operations explicit and reversible.

Dependencies already present in the normative pack:

- `interaction/project-chat-foundation.md` — Project owns reusable scope;
- `architecture/context-memory-search.md` — context units need provenance and
  explicit omissions;
- `architecture/cache-context-routing.md` — local reuse and provider cache
  evidence are different authorities;
- `goal/13-cache-context-routing-compaction.md` — route/context/cache policy
  requirements;
- `observability/request-usage-telemetry.md` and
  `observability/cost-usage-analytics.md` — unknown is not zero and estimates
  must remain separate from provider/invoice statements;
- `harness/model-routing-context-policy.md` and
  `harness/agents-subagents-personas.md` — main/subagent route separation and
  child authority attenuation;
- `schemas/cache-policy.schema.json`,
  `schemas/context-delivery-policy.schema.json`,
  `schemas/model-routing-policy.schema.json` and
  `schemas/request-telemetry.schema.json` — machine-readable target shape.

## 4. Truth matrix for the visible summary

| Panel | Renderer-preview state allowed | State not allowed without new evidence |
| --- | --- | --- |
| Main model | selected profile, inherited source, requested effort, `Auto` explanation | provider acceptance, live health, dispatch authorization |
| Subagent model | independent preview selection, context/budget note, inherited source | real child spawn, lease, mailbox or provider call |
| Context | `Auto`, `Partial`, `Full`, `Summary + sources`, `Manifest only`, `Retrieval on demand`, `Fresh`, `Forked snapshot` preview; selected/omitted counts and budget estimate | claim of frozen provider input, indexed workspace or durable compaction checkpoint |
| Local cache | local reuse hit/miss/unknown, object class, TTL/size placeholders and invalidation reason | provider billing/cache hit, cost savings or encrypted native cache persistence |
| Provider cache | `Not observed`, `Provider-reported`, `Partial`, `Unknown` with source | relabeling local reuse as provider cache |
| Telemetry | observed/partial/unknown/planned coverage, content-free counters and freshness | complete timing/quota/final/invoice cost or durable export receipt |
| Auto routing | deterministic illustrative ranking and policy weights | learned routing, A/B promotion, fallback execution or changed authority |

## 5. Required handoff order

1. Implement the smallest typed view-model/contract for PD-CTT-01, reusing
   existing domain types where possible.
2. Mount it in one Project Control Deck location (prefer Snapshot or a compact
   `Policy` section), with no duplicate top-level mode.
3. Give every interactive control a real renderer-session state transition:
   select, undo, redo, reset and inspect/export where already supported.
4. Mark unavailable native operations as `Preview`, `Planned`, `Unknown` or
   `Unavailable` with an accessible explanation; never ship a clickable no-op.
5. Add focused component/contract tests and run only the changed-slice gates
   plus the standard type/build/preview checks.
6. After the browser preview is inspected, update the dated audit receipt,
   `docs/IMPLEMENTATION_STATUS.md`, capability coverage and Project Twin in one
   same-snapshot documentation pass. Do not claim native or provider evidence
   from renderer tests.

## 6. Explicit non-goals for this checkpoint

- no raw prompt/output/file/screenshot/credential/keystroke collection;
- no system-wide keylogger or covert capture;
- no native cache encryption, secure delete or provider cache handle;
- no provider request, provider health probe or billing assertion;
- no native compaction, durable context revision or model-route receipt;
- no agent spawn, mailbox, lease, tool grant or compiler execution;
- no Git staging/commit/push/PR operation;
- no claim that Omnia replaces Codex, Cursor, Claude, Gemini or Perplexity.

## 7. Continuation command

Use the atomic plan in
`docs/audit/OMNIA_PHASE_PLAN_PROJECT_DECK_CACHE_TELEMETRY_2026-09-29.md` for
the next implementation turn. The exact copy-ready prompt is intentionally
kept in that audit artifact rather than creating a second canonical product
prompt beside `docs/omnia-ultra/goal/00-copy-ready-prompt.md`.

## September 30, 2026 continuation note

The bounded renderer slice continued with two small changes: the Project
policy preview now supports JSON/Markdown inspection, copy, and browser
download with an explicit non-collection/non-export boundary; and the Project
Deck Signals lazy surface now renders a semantic project heading and boundary
while its optional module loads. The policy suite is 6/6 and the isolated
Project Deck suite is 23/23. The default C: renderer build was blocked by host
`ENOSPC`; the same build passed to an alternate D: output directory. These are
renderer/browser observations only. Full app typecheck remains unverified from
the earlier timeout, and no native/provider/agent/compiler/training claim is
promoted by this note.
