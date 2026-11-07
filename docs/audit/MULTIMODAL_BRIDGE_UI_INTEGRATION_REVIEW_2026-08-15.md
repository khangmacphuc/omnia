---
id: OMNIA-AUDIT-MULTIMODAL-BRIDGE-UI-INTEGRATION-2026-08-15
title: Multimodal bridge UI integration review
status: evidence
version: 1.0.0
last_reviewed: 2026-08-15
---

# Multimodal bridge UI integration review

## Scope and evidence boundary

This review compares the current renderer/native boundary with the v2
multimodal bridge contract. It is a review receipt, not a claim that native
multimodal dispatch is shipped. The review was performed against the working
tree at `C:\Users\khang\source\repos\Omnia` on August 15, 2026.

Focused verification completed during this review:

```text
npm run test -- src/domain/multimodal-bridge.test.ts src/features/workspace/composer-attachment-boundary.test.tsx src/features/workspace/composer-attachments.test.tsx --reporter=dot
3 test files passed
14 tests passed
```

The passing tests prove the byte-free planner fixtures and current
fail-closed attachment composer behavior. They do not prove end-to-end bridge
execution, native persistence, provider delivery, or restart recovery.

## Current implementation facts

The current UI has useful safety primitives:

1. `src/features/workspace/composer.tsx` refuses to dispatch selected
   attachments because the native run preparation request does not yet bind a
   frozen attachment/bridge envelope. This avoids a silent text-only downgrade.
2. `src/features/workspace/composer-attachments.tsx` presents local ingestion
   states (`queued`, `extracting`, `ready`, `warning`, `failed`) and blocks
   submission until the selected files are locally prepared.
3. `src/features/workspace/inspector.tsx` presents context, run and parameter
   projections, including content-free native timing/usage observations.
4. `src/lib/desktop.ts` exposes attachment draft/list/remove commands and
   `conversation_run_prepare`, but the renderer-safe preparation DTO has no
   multimodal bridge plan, capability snapshot, stage receipt list or bridge
   disposition.
5. `src/features/workspace/types.ts` has no renderer projection for a bridge
   envelope, route candidate set, fidelity disposition, source/derivative
   lineage or reconciliation state.

This is the correct honest boundary: attachment ingestion is visible, while
provider dispatch remains blocked until native admission and bridge planning
are durable.

## Contract-to-UI gap matrix

| v2 contract fact | Required UI projection | Current state | Priority |
| --- | --- | --- | --- |
| requested and resolved mode | Composer badge plus inspector detail (`Auto` must never be shown as resolved) | Not represented | P0 |
| destination provider/operation/model/API revision and capability freshness | Inspector route card with freshness and evidence IDs | Provider/model is shown only for ordinary run telemetry | P0 |
| route candidates, selected reason and rejected alternatives | Expandable route decision section with deterministic reason labels | Not represented | P0 |
| stage graph, boundary, model/tool, cache and retry state | Compact stage rail plus detailed inspector graph | Not represented | P0 |
| original/derivative hashes and source anchors | Lineage drawer with page/cell/slide/frame/time selectors; no raw paths | Only attachment name/hash-like metadata is shown | P0 |
| fidelity dimensions, omissions and disclosure | Visible `ready-with-degradation`, `review-required` or `unsupported` explanation | Current attachment warning is extraction-only | P0 |
| egress, residency, redaction, retention and approval | Policy/authority section before provider dispatch | Not represented | P0 |
| measured versus estimated usage/cost/latency | Bridge-stage telemetry rows, keeping missing values `unknown` | Run telemetry exists but is not bridge-stage scoped | P1 |
| checkpoint, `outcome-unknown` and reconciliation | Recovery banner and action-specific disabled reasons | Not represented | P0 |
| accessible raw-source/download/compare/retry/review actions | Keyboard/focus-equivalent controls with screen-reader announcements | No bridge actions | P1 |

## P0 blockers before enabling attachment dispatch

### 1. Native preparation must bind bridge state

`PrepareConversationRunRequest` currently carries prompt and provider
parameters but no attachment draft ID, immutable source manifest digest,
capability snapshot ID, policy revision or bridge plan ID. The renderer must
never construct provider bytes or infer a route from a model's generic
`vision`/`multimodal` label. Native preparation should therefore return a
renderer-safe projection such as:

```ts
interface BridgePlanProjection {
  envelopeId: string;
  planDigest: string;
  requestedMode: MultimodalBridgeRequestMode;
  resolvedMode: MultimodalBridgeMode;
  disposition: BridgeDisposition;
  capabilitySnapshotId: string;
  capabilityFreshness: BridgeCapabilityFreshness;
  stageIds: readonly string[];
  selectedReasonCodes: readonly BridgeReasonCode[];
  rejectedAlternatives: readonly {
    mode: MultimodalBridgeMode;
    reasonCodes: readonly BridgeReasonCode[];
  }[];
  fidelityProfile: BridgeFidelityProfile;
  sourceArtifactIds: readonly string[];
  egressDecision: BridgeEgressDecision;
  approvalReceiptId: string | null;
  reconciliationRequired: boolean;
}
```

This projection is metadata only. It must not include file paths, cookies,
secrets, provider file handles, decrypted bytes or base64. The native kernel
must revalidate authority and capability immediately before every provider
stage even when the renderer holds a previously displayed plan.

### 2. `surrogate-to-primary` must not report a provider boundary without a
primary-delivery stage

The current planner marks `surrogate-to-primary` as a provider route, but its
stage list currently ends with a local `surrogate-package` stage. Until a
primary delivery/acceptance stage is persisted, the UI must not display
provider destination, approved egress or provider cost for this route. Either:

- add an explicit primary-delivery stage with provider boundary,
  acceptance/idempotency and reconciliation semantics; or
- keep the route local-only and rename the mode/projection until the primary
  handoff exists.

The inspector must derive boundary/cost labels from stage receipts, never from
the mode string alone.

### 3. Plan state and execution state must be separate

The planner output is a decision artifact. It is not proof that a transform or
provider stage ran. The UI needs two layers:

- **plan projection:** requested/resolved route, candidates, policy and
  expected stages;
- **execution projection:** stage receipts, current status, observed usage,
  retries, cancellation boundary, checkpoint and reconciliation.

Rendering `ready` from a plan before the admission stage succeeds would be a
false completion claim. The composer should use labels such as `Preparing
locally`, `Bridge ready`, `Review required`, `Unsupported` and `Dispatching`
based on durable state, not optimistic local state.

### 4. Unsupported is a truthful terminal disposition, not an error toast

When no authorized route exists, the composer should keep the attachment
selected and show:

- the exact reason(s) and evidence freshness;
- what was not attempted;
- whether a local-only transform, specialist bridge or human review is an
  available next action;
- a `Remove`, `Choose another route`, `Review policy` or `Retry capability
  probe` action only when that action is actually implemented.

It must not silently remove the file, send extracted text as if it were the
original, or label the selected model as natively multimodal.

## Recommended renderer contract

Add one shared projection module, for example
`src/features/workspace/multimodal-bridge-projection.ts`, with pure functions:

```text
bridgeBadgeFromPlan(plan)
bridgeStatusCopy(projection)
bridgeActionAvailability(projection, authority)
bridgeInspectorSections(projection, stageReceipts)
bridgeAnnouncement(projection)
```

The module should be presentation-only and preserve domain IDs/reason codes.
It should not create routes, retry providers, read attachment bytes or infer
capability. Every surface should consume the same projection:

```text
composer attachment tray
message attachment chip
run inspector
background-task drawer
notification/toast
accessibility live region
Project Twin/UI snapshot
```

### Suggested status mapping

| Durable state | Compact label | Tone | Allowed controls |
| --- | --- | --- | --- |
| admitted/preparing | `Preparing locally` | neutral/progress | cancel, inspect |
| plan ready, no stage started | `Bridge ready` | info | inspect, send/continue if native gate allows |
| running local stage | `Transforming locally` | progress | pause/cancel at declared boundary |
| running provider stage | `Sending through approved bridge` | progress | stop/reconcile; no duplicate retry |
| degraded | `Ready with disclosed limits` | warning | inspect disclosure, review, continue |
| review-required | `Review required` | warning | review/approve or choose another route |
| blocked | `Blocked by policy or authority` | danger | inspect policy, request approval |
| unsupported | `Unsupported for this route` | neutral/danger | remove, change route, review evidence |
| outcome-unknown | `Outcome unknown — reconciling` | warning | reconcile only; suppress blind retry |
| failed | `Bridge failed` | danger | classified retry/repair if eligible |

`ready` must not be used as a synonym for “provider accepted.” Provider
acceptance is an execution receipt field and may remain `unknown`.

## Composer integration rules

1. Keep current fail-closed behavior until a native attachment draft is bound
   to the run preparation receipt.
2. Once bound, show a compact route badge per attachment or grouped selection;
   a mixed selection must show the least-safe/most restrictive aggregate and
   allow drill-down.
3. Do not disable the entire composer for a non-blocking `review-required`
   plan if the user can explicitly choose `human-review` or `local-only`;
   disable only the dispatch action that lacks authority.
4. A plan refresh must create a successor plan/revision. Never mutate the
   plan that a prior attempt used.
5. Removing an attachment from the draft must abandon the native draft or
   create a new frozen selection; it must not leave a provider stage holding a
   dangling renderer ID.
6. If the user edits/retries the prompt, bind the attachment manifest to the
   selected retry state base and show it in the request inspector.
7. Retry after `outcome-unknown` must first reconcile provider acceptance and
   stage receipts; the retry button must be unavailable while reconciliation
   is pending.

## Inspector integration rules

Add a `Bridge` section within the existing Run/Context inspector rather than a
second competing inspector. The section should be collapsed for completed
requests and expanded for the active request, matching existing telemetry
behavior. It should expose:

- route mode and requested mode;
- capability snapshot, operation/model/API revision, freshness and evidence;
- selected/rejected candidates and deterministic reason codes;
- stage DAG, current boundary, cancellation point and retry ordinal;
- original/derived hashes and safe source anchors;
- fidelity dimensions and disclosed omissions;
- data class, egress, residency/redaction/retention and approval references;
- local-cache versus provider-cache authority and usage source;
- execution receipts, checkpoint, `outcome-unknown` and reconciliation;
- raw JSON/graph view only after redaction and with a copy-safe projection.

Unknown values must render as `Unknown`, `Not observed` or `Not applicable`,
never zero, empty success or inferred provider support.

## Accessibility and interaction requirements

- Every route/status icon needs a text label; icons are not the state.
- `aria-live="polite"` announces route/disposition changes, not every token or
  stage heartbeat.
- The expanded bridge section must be keyboard reachable, have stable heading
  IDs and preserve focus when a stage receipt arrives.
- A compact badge opens on first click without requiring the app to have focus;
  outside-click closes only transient popovers, not durable inspector state.
- Reduced-motion mode removes spinner animation but retains text/status change.
- High-contrast mode must preserve `unsupported`, `blocked`, `review-required`
  and `outcome-unknown` distinction without relying on color.
- Screen-reader copy must state the source/derivative distinction and whether
  provider egress was approved, denied or not required.

## Required focused tests before renderer enablement

1. Plan-to-projection tests for all seven canonical modes and all six
   dispositions.
2. No false native support when `supportLevel` is `unsupported`, `bridge-required`
   or capability freshness is stale.
3. Local-only policy never renders provider destination or provider cost.
4. Mixed artifacts render per-artifact reasons and deterministic aggregate
   status.
5. Original hashes/selectors survive projection; paths, cookies, secrets and
   base64 never appear in accessible text or serialized UI state.
6. `outcome-unknown` disables blind retry and exposes reconciliation state.
7. Stage receipt updates do not change a frozen plan digest.
8. Composer removal/refresh/retry preserves draft binding and does not dispatch
   a stale attachment selection.
9. Inspector route/bridge section is keyboard navigable and screen-reader
   equivalent in reduced motion/high contrast.
10. Restart/replay reconstructs the same projection from native durable facts.

## Review conclusion

The current fail-closed composer and focused planner tests are a sound safety
checkpoint. The next UI slice should be a read-only bridge projection backed by
native durable metadata, not an optimistic “multimodal enabled” toggle. Do not
enable attachment dispatch until the preparation DTO, stage receipts,
reconciliation state, and the `surrogate-to-primary` boundary semantics are
consistent. After those facts exist, one shared projection can make the route
truthful across composer, inspector, background tasks and accessibility without
duplicating routing logic in the renderer.

