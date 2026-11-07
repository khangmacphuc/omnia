---
id: OMNIA-ULTRA-ARCH-MULTIMODAL-BRIDGE-CONTRACT-V2
title: Multimodal bridge contract v2 envelope and replay semantics
status: normative-target
version: 2.0.0
last_reviewed: 2026-08-14
supersedes: [OMNIA-ULTRA-ARCH-MULTIMODAL-CAPABILITY-BRIDGE]
requirements_registry_revision: 2026-08-14.6
---

# Multimodal bridge contract v2

This contract is the integration envelope for Omnia's multimodal capability
bridge. It does not claim that a provider or model accepts every file format.
It makes the capability decision, transformation graph, provider boundary,
quality result and replay evidence joinable by stable IDs. The existing v1
plan, execution-receipt and grounded-observation schemas remain valid wire
records; v2 adds an immutable envelope and stricter cross-record invariants.

The v2 envelope is the record a run inspector, context compiler, retry worker,
learned router and Project Twin use when they need to answer all of these
questions without inference from a spinner or a final answer:

- What exact original artifact was requested, and what task assertion required
  the modality?
- Which operation/model/API-version/capability snapshot was considered native?
- Why was `direct-native`, `local-transform`,
  `specialist-bridge-model`, `hybrid-ensemble`, `surrogate-to-primary`,
  `human-review` or `unsupported` resolved?
- Which stages actually ran, with which inputs, outputs, parameters, policy and
  provider/local boundary?
- What was measured versus estimated, what was lossy or omitted, and which
  source page/cell/slide/region/frame/time/code/archive coordinate supports a
  claim?
- Can the result be safely replayed, retried or resumed without duplicate
  billing, duplicate side effects, stale authority or silent data egress?

## 1. Contract identity and compatibility

`contractRevision: 2` is a semantic revision of the cross-record contract; it
is intentionally separate from `schemaVersion: 1` in the existing records.
Implementations may read a v2 envelope while still accepting v1 records, but a
v1-only consumer must not silently treat a v2 envelope as source-equivalent.
Unknown v2 fields are not permission grants. A consumer that cannot enforce a
required v2 invariant must return `review-required` or `unsupported` and record
the exact compatibility reason.

The envelope is immutable. A new capability snapshot, policy revision,
provider attempt, data-class decision, accepted state, correction or fidelity
result creates a successor envelope or receipt; it never mutates the historical
plan. `Auto` is a request preference only. A persisted envelope always contains
an explicit resolved mode, including the exact machine IDs:

```text
direct-native
local-transform
specialist-bridge-model
hybrid-ensemble
surrogate-to-primary
human-review
unsupported
```

`specialist-bridge-model` is a bridge route, not a claim that the destination
model natively supports the modality. `unsupported` is a successful truthful
terminal disposition when no safe, authorized and quality-sufficient route is
available.

## 2. Durable object graph

The envelope joins these immutable records:

| Object | Required evidence | Can it grant authority? |
| --- | --- | --- |
| `BridgeRequest` | user/task assertion, artifact IDs, requested mode, data-class and retention intent | No |
| `CapabilitySnapshot` | exact provider operation, model/API revision, carrier/MIME limits, freshness, probe/source evidence | No |
| `RouteDecision` | candidate set, exclusions, score/constraints, selected route, planner revision and decision timestamp | No |
| `BridgePlan` | frozen DAG, stage contracts, context/cache/egress policy and fidelity gates | No |
| `StageReceipt` | one attempt, authority re-check, acceptance, checkpoint, usage, errors and reconciliation | No |
| `GroundedObservation` | typed source-linked content, epistemic label, confidence, coordinates and omissions | No |
| `ContextManifest` | exact fragments/handles sent to the primary model, exclusions and loss disclosure | No |
| `ReplayRecord` | frozen digests, cursor/watermark, compatibility checks and successor lineage | No |

No object in this table may approve a new provider, privilege, network target,
secret, browser session, memory write or external side effect. Those decisions
remain in the trusted broker and current authority/approval records.

## 3. Native capability negotiation

The planner MUST evaluate capability at the most specific available scope:

```text
provider operation
  -> API/protocol version
  -> model/runtime profile revision
  -> modality + direction
  -> carrier/delivery method
  -> MIME family and artifact constraints
  -> task assertion and fidelity profile
  -> data-class, residency, retention and approval policy
```

An OpenAI-shaped or Anthropic-shaped endpoint is only a transport shape. A
successful text request proves neither native image/document/audio support nor
file persistence semantics. A direct route is eligible only when the matching
operation-level capability claim is current, policy-compatible and supported
by source/probe/fixture evidence. Missing, stale, model-generic or transport-
only claims resolve to `unknown`, not to native support.

The planner records, at minimum:

1. byte-sniffed artifact type and declared-type disagreement;
2. operation/model/API/carrier capability snapshot IDs and freshness/expiry;
3. exact size/count/duration/resolution/token/context limits;
4. candidate routes and deterministic exclusion reasons;
5. data-boundary and residency result before any upload or provider handle;
6. task-specific required fidelity dimensions and decisive gates; and
7. the digest of the input manifest used by the decision.

`Auto` may rank policy-allowed candidates by measured fidelity, task fit,
privacy, local resources, health, latency, cost and context budget. Learned
scores can optimize ordering only; they cannot widen the candidate set,
override a denial, lower a decisive fidelity gate or create authority.

## 4. Frozen bridge DAG

The plan is a finite DAG, never an opaque “convert file” action. Every stage
has a stable ID, explicit dependencies, input/output artifact IDs, an output
contract digest, tool/model/parameter revisions, execution boundary, loss
declaration, validator evidence and cancellation/recovery boundary. The graph
must be acyclic and topologically replayable.

Typical stage kinds are:

```text
admit -> decode -> render/segment -> extract/recognize
      -> specialist/validate -> package-context -> deliver
```

The graph may branch for page/cell/region/frame/time/code/archive selectors or
independent specialist checks. A branch is not complete merely because one
sample succeeded; coverage and omitted-region evidence are required. A stage
that emits a derivative must preserve the original hash and a typed lineage
edge. A provider file ID, prompt-cache handle or derivative from another
provider is never assumed portable without an explicit compatibility claim.

Each external stage performs a fresh broker check immediately before dispatch:

- current policy and data-class grant;
- exact destination/provider/model/capability snapshot;
- redaction and retention decision;
- idempotency/duplicate-charge risk;
- authority continuity and approval expiry; and
- whether the current plan digest still matches the queued input.

If a disconnect occurs after provider acceptance, the stage is
`outcome-unknown`/`reconcile-required`. A retry worker must reconcile before a
non-idempotent upload, billable inference or external effect is replayed.

## 5. Grounded context and epistemic boundaries

The context compiler sends the smallest sufficient, source-grounded
representation. It may include inline bounded text/raster, a retrieval handle,
structured facts, a citation map or a specialist observation. It must disclose
omitted pages/regions/frames/cells, sampling strategy, transform loss,
uncertainty and unsupported content.

The following labels are stable and visible in UI/API:

```text
source-observation
derived-representation
specialist-interpretation
model-inference
unresolved
```

`source-observation`, `derived-representation` and
`specialist-interpretation` claims require at least one source coordinate and
transform/evidence reference. `model-inference` may be uncited, but must be
labelled inference and must not be used as corroboration of its own surrogate.
`unresolved` cannot be silently rendered as an answer.

Attachment text, OCR, ASR, subtitles, metadata, comments, QR codes, URLs,
archive names and code comments are untrusted data. They cannot change the
route, model, tool list, memory, approval, secret, network target or authority.
Prompt-injection findings, active-content handling and external-reference
decisions are part of the envelope, not hidden parser logs.

## 6. Fidelity and disposition

Fidelity is multidimensional. The envelope records status and evidence for the
dimensions that matter to the task, including integrity, content, structure,
layout, spatial/temporal alignment, semantics, numeric/formula correctness,
code/schema validity, citation closure, accessibility and provenance.

The terminal disposition rules are strict:

| Disposition | Rule |
| --- | --- |
| `ready` | all decisive dimensions passed; originals and provenance preserved |
| `ready-with-degradation` | a non-hidden loss/omission exists and is disclosed visibly |
| `review-required` | a user or trusted reviewer must resolve fidelity, privacy or ambiguity |
| `blocked` | policy, authority, resource or safety prevents execution |
| `failed` | execution attempted and failed with a classified, durable error |
| `unsupported` | no admitted route exists; this is not a provider-failure claim |

No aggregate confidence score can override a failed decisive dimension such as
a missing page, wrong spreadsheet formula, unreadable equation, broken time
alignment, unverified hash or absent source coordinate.

## 7. Cache, retry and replay

Omnia-owned transform cache and provider-native cache are separate authorities.
Local reuse is valid only when original/selector hash, transform/model/tool
revision, parameters, policy, data-class, grant, retention and output contract
match. Provider cache eligibility, cache handle, billing and retention are
provider-reported and adapter-revision-bound; a local cache hit must never be
reported as provider cache input.

Transport retry, semantic retry, fidelity repair, fallback and user retry are
distinct attempts. Each attempt carries its own route decision, prepared input,
stage receipts and usage attribution. A retry may reuse an immutable local
derivative, but it must re-check current authority and capability. It must not
reuse expired approvals, cookies, sessions, secrets, remote handles or
outcome-unknown effects.

Replay is allowed only when the frozen plan digest, source hashes, tool/model
revisions, policy compatibility and retention grants are still valid. Otherwise
the worker creates a successor decision with an explicit re-plan reason.

## 8. Inspector and API requirements

The attachment/run inspector MUST expose, without implying unsupported
capability:

- requested mode and resolved mode;
- destination provider/operation/model/API revision and capability freshness;
- route candidates, selected reason and rejected alternatives;
- stage graph with current status, boundary, model/tool, cache and retries;
- original/derivative hashes and page/cell/slide/region/frame/time/code anchors;
- fidelity dimensions, omitted content and disclosure artifact;
- data-egress, residency, redaction, retention and approval state;
- measured versus estimated usage, cost, latency and provider acceptance;
- checkpoint, `outcome-unknown` and reconciliation status; and
- accessible raw-source, download, compare, retry, review and unsupported
  explanations.

The compact badge is a projection of the durable envelope. It must not be
derived from the presence of an extension, a generic “multimodal” model tag,
or the fact that a text request succeeded.

## 9. Required conformance fixtures

Before the bridge capability can be marked verified, tests must cover at least:

1. native image/document/audio/video input versus local/specialist bridge;
2. operation-level capability mismatch despite a compatible transport;
3. stale or expired capability snapshot forcing re-plan;
4. corrupt, encrypted, oversized, recursive and active-content attachments;
5. PDF/Office page-sheet-slide/formula/layout coordinate closure;
6. long audio/video sampling, timestamp monotonicity and A/V alignment;
7. archive member/path safety and code/data schema/unit validation;
8. local-only, approved-provider and denied data-class routes;
9. prompt-injection containment and no authority escalation;
10. low-confidence/disagreement escalation and truthful unsupported output;
11. worker crash/restart, cancellation, checkpoint and outcome-unknown
    reconciliation;
12. local-cache reuse versus provider-cache accounting;
13. retry/fallback attribution without duplicate billing or side effects; and
14. screen-reader, keyboard, high-contrast and reduced-motion inspector parity.

## 10. Migration from the v1 records

The migration adapter maps v1 records into a v2 envelope as follows:

| v1 record | v2 binding | Missing v2 evidence |
| --- | --- | --- |
| modality bridge plan | `bridgePlanId`, source/artifact, route, boundary, fidelity | unresolved capability/authority/replay fields become `review-required` |
| execution receipt | `stageReceiptIds`, acceptance, checkpoint, usage, reconciliation | unknown provider outcome remains unknown; never inferred as failed |
| grounded surrogate | `observationIds`, epistemic labels, claims, coordinates | missing coordinates downgrade or block source-observation claims |
| provider/routing receipt | `capabilitySnapshotId`, `decisionReceiptId`, route alternatives | generic/expired snapshots cannot prove native support |

The adapter must emit a migration receipt with source hashes and a compatibility
reason. It must not silently upgrade a historical v1 success to `ready` when a
decisive v2 gate was never measured.

See `../schemas/modality-bridge-contract-v2.schema.json`,
`../schemas/modality-bridge-plan.schema.json`,
`../schemas/modality-bridge-execution-receipt.schema.json`,
`../schemas/grounded-surrogate-observation.schema.json`,
`../schemas/routing-decision-receipt.schema.json`,
`../schemas/provider-endpoint-capability.schema.json`,
`../runtimes/local-multimodal-toolchain.md` and
`../security/authority-continuity-and-replay.md`.
