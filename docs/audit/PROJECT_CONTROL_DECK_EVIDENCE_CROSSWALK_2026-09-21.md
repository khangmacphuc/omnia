---
id: OMNIA-AUDIT-PROJECT-CONTROL-DECK-EVIDENCE-CROSSWALK-2026-09-21
title: Project Control Deck and canonical Overview tab evidence crosswalk
status: evidence-backed-preview
snapshotDate: 2026-09-21
---

# Project Control Deck evidence crosswalk

This receipt records the relationship between the six canonical Project
Overview tabs in the UI contract and the richer renderer-local Project Control
Deck. It is a crosswalk, not a promotion of the browser preview to native,
durable, provider-backed, or Project Twin authority.

## Scope and authority

The normative target names exactly six Project Overview tabs:

- Conversations
- Context
- Files
- Memory
- Skills
- Settings

The current deck intentionally exposes additional preview tabs (Snapshot,
Signals, Chats, Plan, Context, IDE, Model, Access, Twin and Handoff). The
additional tabs are workbench accelerators; they are not a replacement for the
canonical six-tab information architecture.

Normative references used for this crosswalk:

- `docs/ui/product-ui-spec.md:359-370` — canonical tab names and current
  Provider Preview context boundary.
- `docs/omnia-ultra/interaction/project-chat-foundation.md:117-145` — Project
  Overview landing order and actionable-card rule.
- `docs/omnia-ultra/project-twin/project-overview-smart-refresh.md` — material
  change, provenance, stale-state and revision requirements.
- `docs/omnia-ultra/project-twin/project-chat-twin-contract.md:151-205` —
  Project Overview deep-link/evidence and no-overclaim invariants.
- `docs/omnia-ultra/02-PRECEDENCE-AND-STATUS.md` — current status vocabulary
  and same-snapshot evidence rule.

Current implementation anchors:

- `src/features/workspace/project-control-deck.tsx` — `ProjectControlDeck`,
  `overviewTabMappings`, tab renderer and renderer-only boundary copy.
- `src/features/workspace/project-deck-lazy-surface.tsx` — independent lazy
  loading/retry/dismiss boundary for optional Project Deck workbenches. The
  boundary keeps loading and chunk-failure copy renderer-local and does not
  promote a Project, provider, filesystem, or Project Twin capability.
- `src/features/workspace/project-overview.tsx` — Project identity/overview
  projection, direct six-card canonical tab map, and context availability
  summary.
- `src/features/workspace/project-overview-tabs-contract.ts` — typed six-tab
  order, renderer target, coverage, status, and native-gap vocabulary shared by
  the Overview cards and the Control Deck mapping.
- `src/features/workspace/project-context-availability-contract.ts` — shared
  truthful context labels and capability states.
- `src/features/workspace/project-control-deck.test.tsx` — focused deck and
  mapping regression tests.
- `src/features/workspace/project-overview-tabs-contract.test.ts` — canonical
  order, partial Context/Files coverage, and Settings fail-closed tests.
- `src/features/workspace/project-overview-context.test.tsx` and
  `src/features/workspace/project-context-availability-contract.test.ts` —
  context truthfulness tests.

## Canonical six-tab crosswalk

| Canonical tab | Current renderer target | Current status | Evidence in this snapshot | Boundary / non-claim |
| --- | --- | --- | --- | --- |
| Conversations | `ProjectOverview` renders the canonical card and `overviewTabMappings[conversations]` opens the `Chats` deck tab. `ProjectChatRow` provides local search/filter/sort/group/saved-view rehearsal and row actions. | Preview | `project-overview-tabs-contract.test.ts` checks canonical order; `project-control-deck.test.tsx` covers tab switching, mapping focus, chat sorting/grouping/saved views, unread-clear and local row actions. | Project membership, indexed search, durable acknowledgement, move/fork/export persistence and native deep-link hydration are not proven. |
| Context | `ProjectOverview` renders the canonical card and `overviewTabMappings[context]` opens the `Context` deck tab backed by `ProjectContextWorkbench`. | Partial | `project-overview-tabs-contract.test.ts` asserts the canonical status; `project-context-availability-contract.test.ts`, `project-context-workbench.accessibility.test.tsx`, `project-overview-context.test.tsx`, plus deck context assertions cover the supporting projection. | Renderer `ready` is deliberately rendered as `Referenced · not indexed`; no native compiler, frozen context snapshot, retrieval, provider dispatch or durable revision is claimed. |
| Files | `ProjectOverview` renders the canonical card and `overviewTabMappings[files]` opens the `Access` deck tab backed by `ProjectWorkspaceGrantPreview`. | Partial | `project-overview-tabs-contract.test.ts` asserts the canonical status; `project-workspace-grant-preview.test.tsx` and deck mapping assertions cover the supporting projection. | This is a read-only grant/access rehearsal. It does not index, watch, upload, execute, mutate files or expose raw paths through export. The dedicated canonical Files tab is not yet a separate surface. |
| Memory | `overviewTabMappings[memory]` points to Snapshot's `Visible input candidates` metric. | Preview | Deck snapshot assertions for candidate counts and renderer-only boundary. | Counts are renderer-visible candidates only. No project retrieval, approval, memory write, context injection or durable memory provenance is hydrated. |
| Skills | `overviewTabMappings[skills]` points to Snapshot's `Visible input candidates` metric. | Preview | Deck snapshot assertions for candidate counts and renderer-only boundary. | Counts are renderer-visible candidates only. No install, trust update, activation, provider injection or durable project skill state is hydrated. |
| Settings | `overviewTabMappings[settings]` invokes the host settings callback when supplied; otherwise the mapping is disabled. | Preview when the callback is supplied; Unavailable when it is absent | `project-overview-tabs-contract.test.ts` asserts both callback states; the deck mapping test covers enabled callback and disabled absent-callback state. | The callback is a renderer routing affordance, not a native promotion state. Native project settings persistence, revision receipts and policy enforcement remain Planned. |

The table uses the typed UI vocabulary from
`project-overview-tabs-contract.ts`: `Preview`, `Partial`, `Planned`, and
`Unavailable`. An available Settings callback is described as `Preview` with
`renderer-plus-host-callback` coverage; it is not promoted to `Linked`,
`Wired`, or `Verified`. Promotion still requires current source, focused tests,
and same-snapshot authority evidence.

## Rich deck tab status map

The ten current deck tabs are useful preview surfaces but are not canonical
Overview tabs:

| Deck tab | Current status | What it demonstrates |
| --- | --- | --- |
| Snapshot | Preview | Project metrics, activity timeline, reversible pin/accent sandbox and metadata disclosure. |
| Signals | Preview | Bounded unified renderer-session signal projection for the selected project. |
| Chats | Preview | Project-scoped local conversation browsing and row actions. |
| Context | Preview | Context availability and preflight projection. |
| Plan | Preview | Goal/task/roadmap rehearsal, including import/history where exposed. |
| IDE | Preview | IDE/problems/terminal rehearsal; no process or filesystem authority. |
| Model | Preview | Model/profile/style/inheritance rehearsal; no provider dispatch or native profile write. |
| Access | Preview | Workspace grant and read-only scope rehearsal. |
| Twin | Preview | Synthetic edge/evidence view; not the canonical Project Twin graph store. |
| Handoff | Preview | Portable handoff package rehearsal; no agent lease, mailbox or durable export receipt. |

## Evidence and acceptance interpretation

The focused same-snapshot receipt for this crosswalk was:

```text
npm.cmd exec vitest -- run \
  src/features/workspace/project-control-deck.test.tsx \
  src/features/workspace/project-overview-tabs-contract.test.ts \
  --reporter=dot

22 tests passed
```

The later optional-workbench boundary has its own focused receipt:

```text
npm.cmd exec vitest -- run \
  src/features/workspace/project-deck-lazy-surface.test.tsx \
  --reporter=dot

3 tests passed
```

That receipt covers renderer-local loading, successful resolution, retry after
a rejected chunk, redacted loader diagnostics, and dismiss/close recovery while
the surrounding Project shell remains intact. It is additive evidence for the
lazy boundary and does not replace the historical two-file crosswalk receipt
above. The existing `project-control-deck.test.tsx` Signals assertion still
requires a current lazy-surface recheck before any combined Project receipt is
described as all-green.

This receipt verifies renderer contracts only. It does not verify Rust/Tauri
compilation, packaged Windows launch, native IPC hydration, provider HTTP,
filesystem mutation, agent orchestration, Project Twin mutation, restart
recovery, or durable revision persistence.

The deck keeps the following boundary facts visible in the UI and tests:

- `Renderer preview` and `No native mutation has been sent` remain present at
  the deck boundary.
- Context health cannot be promoted from a renderer `ready` hint to compiled or
  indexed native readiness.
- Overview mapping cards route to the nearest truthful surface; they do not
  manufacture missing dedicated tabs or authority.
- Settings without a host callback are explicitly `Unavailable` rather than a
  disabled success-shaped no-op.
- Export, handoff, Twin and chat-view operations remain renderer-local unless a
  later native receipt proves otherwise.

## Open promotion gates

Do not promote any canonical tab beyond the typed renderer states
(`Preview`, `Partial`, or `Unavailable`) until the relevant gate has current
evidence:

1. Conversations: native project ownership, search/index cursor, durable row
   metadata acknowledgement and stable deep-link hydration.
2. Context: native source manifest, context revision/watermark, compiler
   result, stale/error handling and provider capability revalidation.
3. Files: native grant receipt, containment/revoke/reopen evidence and a
   separately authorized indexing/extraction path.
4. Memory: durable proposal/approval/provenance/retrieval receipts and scope
   enforcement.
5. Skills: package/trust/version/permission receipts and project activation
   hydration.
6. Settings: durable project settings revision, undo/reset semantics, scope
   enforcement and restart hydration.
7. Overview/Twin: material-change detector, source watermark, evidence links,
   stale propagation, compare/restore and atomic revision persistence.

Until these gates are met, the browser surface remains a useful UI-first
preview for manual testing and design feedback, not a claim that Project
Overview is native-complete.
