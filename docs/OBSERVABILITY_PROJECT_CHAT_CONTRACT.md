# Omnia observability contract for Project and Chat

- Status: Proposed delivery contract for the Project/Chat foundation
- Date: 2026-09-16
- Scope: renderer information architecture, native read models, event/receipt
  boundaries, export and retention; this document does not claim that every
  native path is already implemented
- Primary surfaces: `Project` and `Chat`
- Related contracts: [`adr/0004-durable-run-event-journal-and-cursor-replay.md`](adr/0004-durable-run-event-journal-and-cursor-replay.md), [`adr/0005-local-first-telemetry-and-usage-ledger.md`](adr/0005-local-first-telemetry-and-usage-ledger.md), [`HARNESS_ARCHITECTURE.md`](HARNESS_ARCHITECTURE.md), [`THREAT_MODEL.md`](THREAT_MODEL.md)

## 1. Intent and status vocabulary

Omnia's observability should help a person answer four questions without
opening a database or guessing from a green badge:

1. What happened in this Project or Chat?
2. Which provider, model, attempt, agent or tool produced each result?
3. How much time, usage, cost and quality evidence do we actually have?
4. What is live, partial, unknown, stale, planned or unavailable right now?

The two primary work surfaces remain:

```text
Project
  -> aggregate activity, chats, workspace/context, memory, agents, tasks,
     artifacts, provider/model health, usage, cost, quality and exports

Chat
  -> conversation plus exact run/attempt journal, context trace, artifacts,
     usage/cost, approvals and receipts
```

Observability is a contextual capability inside those surfaces. It is not a
third top-level mode competing with Project or Chat.

Every card, row, chart and badge uses one of these states:

| State | Meaning | Allowed claim |
|---|---|---|
| `live` | A current native read or subscribed journal tail is available | “Live” with its read time/cursor |
| `verified` | A native receipt or committed fact passed the relevant gate | State the exact receipt/fact and timestamp |
| `reported` | A provider or runtime reported the value | Label its source; do not imply independent verification |
| `partial` | Some facts exist but coverage is incomplete | Show the missing dimensions and coverage reason |
| `estimated` | Calculated from local input/catalog assumptions | Show formula/version and uncertainty |
| `unknown` | No safe evidence exists | Never render zero, healthy or unlimited |
| `stale` | Last-known evidence is outside its freshness window | Show age and fallback policy |
| `planned` | UI/contract exists but the runtime path is intentionally unavailable | Show `Planned`, never an active control |
| `unavailable` | A required capability, model, provider or native path cannot be used | Show the typed reason and next safe action |

`configured` may be used for a saved setting, but it must not be presented as
`live` or `verified` until the corresponding native operation has produced a
receipt or committed fact.

## 2. Scope and lineage

### OBS-001 — one inherited scope chain

All observability records resolve through the same scope chain as the rest of
the product:

```text
App default
  -> Profile
    -> Project (optional for standalone chats)
      -> Chat / Conversation
        -> Run
          -> Provider attempt
            -> Iteration / item / tool / subagent operation
```

The canonical identifiers are the native IDs already used by the domain and
desktop bridge: `profileId`, `projectId`, `conversationId`, `branchId`,
`runId`, `attemptId`, `iterationId`, `itemId`, provider connection/model IDs,
and operation/receipt IDs. Renderer-generated IDs are intent only and cannot
authorize a read or mutation.

### OBS-002 — standalone Chat is first-class

A Chat may have `projectId = null` and appears in Chat Inbox/Recent. Its run
observability remains complete at Chat scope. Project dashboards exclude it
from Project aggregates until it is moved into a Project.

Moving a Chat does not rewrite history. Each historical event retains its
event-time scope and the current Chat ownership projection records the move.
Project views must offer an explicit attribution choice:

- **Current owner:** include all history now owned by the Project;
- **Event-time owner:** include only facts emitted while the Chat belonged to
  the Project;
- **Both with split attribution:** show the move boundary and avoid double
  counting.

The default view is **current owner**, with a visible move boundary when the
history crosses Projects.

### OBS-003 — traces may be precise; metrics stay bounded

Run/attempt/item IDs, branch IDs and correlation IDs are allowed in local
trace and inspector records. Metrics and daily rollups use bounded dimensions
only: provider family, model bucket, operation kind, outcome, error class,
capability and status. They must not label by prompt, response, raw model ID,
Project, Chat, path, URL, remote request ID, tool arguments or arbitrary
provider fields.

## 3. Four evidence planes

Omnia keeps four related but non-interchangeable evidence planes. A view can
join them by native IDs, but one plane must never pretend to be another.

### 3.1 Product activity

Product activity explains what the user did to a Project or Chat:

```text
project.created / renamed / moved / archived / restored
chat.created / renamed / pinned / unpinned / archived / restored / moved
chat.forked / continued / exported / imported
workspace.grant_added / revoked
memory.proposed / accepted / rejected / deleted
skill.enabled / disabled / imported / rolled_back
view.saved / reset
```

The activity feed is a projection with links to source receipts or run events.
It is not a replacement for the durable run journal or security audit chain.

### 3.2 Run journal and harness trace

`run_journals` and `run_events` remain lifecycle truth for a Chat run. The
minimum timeline is:

```text
run.created
run.dispatching
attempt.created
attempt.dispatch_started
attempt.accepted | attempt.failed | attempt.outcome_unknown
message.text_delta / message.reasoning_summary_delta
usage.updated
attempt.completed | attempt.interrupted
run.completed | run.cancelled | run.failed
post-run: validation / citation / artifact / memory / evaluation / checkpoint
```

Context compilation, retrieval, memory read, skill load, approval wait, tool
call, subagent run, validation, artifact build and checkpoint are represented
by `harness_operation_observations` and linked to the parent run/attempt.

The renderer receives a fixed-watermark replay followed by a live tail. It
must not infer missing history from the final assistant message.

### 3.3 Security audit

Security audit events remain a separate append-only chain. They cover policy,
capability, approval, secret-handle, workspace, export, retention, import and
privileged-operation decisions. They contain redacted metadata and hashes,
not prompt, response, file, secret or tool bodies.

Security audit integrity does not imply that a host was uncompromised, and
telemetry completeness does not imply that a security decision was allowed.

### 3.4 Operational telemetry

Operational telemetry is the content-free measurement layer:

- `run_timing_observations` for monotonic milestones and named waits;
- `run_usage_ledger` for immutable source-specific counters;
- `run_cost_statements` for estimate, provider report, invoice and user
  correction statements;
- `provider_health_observations` and `provider_quota_windows` for typed,
  freshness-bound health/quota evidence;
- `telemetry_daily_rollups` for bounded aggregate charts;
- `telemetry_export_checkpoints` for resumable external export.

These records can point to a run/attempt but cannot contain raw prompt,
response, reasoning, provider payload, auth header, cookie, path or secret.

## 4. Chat observability surface

### OBS-004 — Chat inspector tabs

The default Chat view remains a focused conversation canvas. An inspector can
be collapsed, pinned or opened as a drawer. Its tabs are:

| Tab | Purpose | Source of truth |
|---|---|---|
| `Overview` | Effective model/route, run state, latest result and coverage | Native run snapshot + route receipt |
| `Timeline` | Ordered lifecycle, stream, approval, tool and post-run facts | Run journal replay cursor |
| `Attempts` | Retry/fallback attempts with independent status and usage | Attempt lineage + journal |
| `Context` | Selected/omitted files, memory, skills, parameter layers and budget | Frozen context manifest when available |
| `Usage & cost` | Input/cache/output/reasoning/visible counters and statements | Usage ledger + cost statements |
| `Timing` | Queue, compile, approval, TTFB, visible TTFT, completion and waits | Timing observations |
| `Provider health` | Auth, authorization, billing, transport, protocol, model and rate-limit dimensions | Typed health/quota observations |
| `Agents & tools` | Child operations, wait/queue ratio, verification and promotion | Harness operation observations |
| `Artifacts` | Produced artifacts, citations, validation and checkpoint references | Artifact/validation receipts |
| `Receipts` | Run-control, mutation, export and recovery receipts | Immutable receipt records |

An empty or unsupported tab shows an honest state card with its source and
status. It must not fabricate charts, zero-valued counters or an enabled
button when the native path is absent.

### OBS-005 — exact-run selection

When a Chat has multiple runs, the inspector always states the selected
`runId`, branch, attempt and read time. “Latest” is a convenience selector,
not a hidden replacement of the selected run. Retry/fallback attempts are
shown separately; a logical-run total is a derived sum with the selected
attempts called out.

### OBS-006 — visible output is not hidden reasoning

The inspector distinguishes:

```text
first provider output       = any provider output, including hidden reasoning
first reasoning             = first reasoning/summary fact, if reported
first visible output        = first text/media/tool result visible to the user
visible throughput          = visible output tokens / visible generation time
```

Hidden reasoning never lowers visible TTFT or increases visible throughput.
Missing provider counters remain `Unknown`, not zero.

## 5. Project observability surface

### OBS-007 — Project Overview cards

Project Overview is the default landing screen for a Project. It exposes
compact cards with drill-down links to Chat or source records:

```text
Activity             recent project/chat lifecycle and run milestones
Chats                active, pinned, unread, archived and standalone links
Run health           active, completed, failed, cancelled, outcome-unknown
Provider health      per connection/model dimension with freshness
Usage & cost         time-window totals with source/coverage labels
Latency              p50/p95 only with sample count and window
Context efficiency   selected/omitted items, cache and compaction evidence
Agent/tool efficiency child success, waits, verification and promotion
Artifacts            recent outputs, citations, validation and checkpoints
Data & retention     selected roots, indexing state, retention and export
```

Cards use a consistent header: `scope`, `window`, `read at`, `sample count`,
`coverage`, and a link to exact source runs. If there are fewer than the
minimum sample count for a percentile, the card says `Insufficient samples`.

### OBS-008 — attribution and deduplication

Project totals must deduplicate by immutable usage-entry ID and include each
attempt at most once. A provider-final correction supersedes a provisional
fact without deleting it. Exported or displayed totals identify whether they
represent:

- current Project ownership;
- event-time ownership;
- selected attempts only; or
- all attempts including failed/retried/fallback attempts.

The default Project total includes all attempts for currently owned Chats and
labels retry/fallback waste separately.

## 6. Timing, usage, cost and health rules

### OBS-009 — timing contract

Timing uses monotonic offsets from one `clockDomainId`. Named milestones must
remain ordered and can be absent without being guessed. Derived measures are
shown only when their prerequisites exist:

```text
request upload = requestCommitted - dispatchStarted
TTFB           = firstByte - dispatchStarted
provider TTF   = firstProviderOutput - dispatchStarted
visible TTFT   = firstVisibleOutput - dispatchStarted
first item     = firstCompleteItem - dispatchStarted
visible gen    = lastVisibleOutput - firstVisibleOutput
total attempt  = terminal - dispatchStarted
visible TPS    = visibleOutputTokens / visible gen
```

Clock-domain changes, sleep/resume and crash recovery mark the sample as
partial/recovered; unrelated wall-clock values are never subtracted.

### OBS-010 — usage ledger contract

Every usage observation is immutable, attempt-scoped and source-labelled:

```text
local-estimate | provider-incremental | provider-final
provider-invoice | user-correction
```

Provider-authored observations require a hashed provider event/response
identity. A final correction may be lower than a provisional observation and
records `supersedesEntryId`. Provider-specific counters are numeric and
provider-qualified; arbitrary strings and unbounded keys are rejected.

### OBS-011 — cost contract

Estimate, provider-reported, invoice and user-override statements remain
independently inspectable. Calculated estimates require the frozen price
snapshot ID/hash and formula version. Historical cost cannot change merely
because a later catalog price changed.

### OBS-012 — health and quota contract

Provider health is projected by dimension, not one online/offline boolean:

```text
dns, tls, authentication, authorization, billing, catalog,
transport, protocol, streaming, model, rate-limit
```

`unknown` and `stale` remain distinct from `healthy`. A quota row displays
`limit`, `remaining`, `resetAt`, `window` and `source` together. Inferred quota
is explicitly non-authoritative; missing limits never become “unlimited”.

Project health is a summary of the selected scope, not a new authority. A
single fresh provider check cannot make all Projects healthy.

## 7. Receipts, actions and recovery

### OBS-013 — every material mutation has a receipt link

The UI action history links these operations to their immutable native result:

```text
project/chat create, rename, move, pin, archive and restore
run-control resolve/apply
provider attempt dispatch and terminal result
memory/skill proposal and decision
workspace grant add/revoke
export/import/retention/restore
```

Each receipt should expose, where applicable:

- operation and receipt IDs;
- actor and client/session identity class;
- exact scope and source revision/head;
- idempotency-key hash (never the raw key);
- canonical payload/result hashes;
- precondition and postcondition result;
- outcome (`allowed`, `denied`, `failed`, `cancelled`, `outcome_unknown`,
  `verified`);
- diagnostic code and timestamps;
- source journal cursor or event IDs.

The existing authoritative Goal/Task/Starter Workflow receipt contract remains
the model for future Project/Chat mutation receipts. Receipts are immutable;
exact replay returns the old result and payload drift creates no second
mutation.

### OBS-014 — recovery is visible

After renderer reconnect/restart, the Chat inspector reports:

```text
replayed from cursor <opaque cursor>
watermark <sequence/event>
coverage complete | legacy-partial | recovered-partial
terminal fact seen | not seen
projection rebuilt | pending | failed
```

An `outcome_unknown` attempt is never silently converted to success or retried
unless the operation is proven idempotent and its retry identity is bound.

## 8. Export, retention and privacy

### OBS-015 — explicit export scopes

The export drawer offers:

```text
scope: Chat | Project | Profile
range: selected runs | time window | all retained
planes: activity | journal | telemetry | security audit | artifacts
content: metadata only (default) | user-selected transcript/files
format: JSON manifest + NDJSON facts | CSV rollups | human-readable report
```

The default export is local, metadata-only and redacted. A content export is a
separate explicit choice and requires a preview listing every selected Chat,
file and artifact class. Import always stages into a new isolated profile or
workspace and validates before commit; it never overwrites the live database.

Every export produces an immutable manifest/receipt containing schema versions,
scope, filters, retention snapshot, redaction policy, source cursors and hashes.

### OBS-016 — retention is scope-aware

Recommended defaults remain those in ADR 0005:

```text
local collection = on
remote operational export = off
raw diagnostic retention = 30 days
aggregate rollup retention = 365 days
```

Project policy may shorten retention or disable a plane. It may not cause raw
prompt/response/reasoning/tool payloads, credentials, cookies, auth headers,
signed URLs or secret values to enter ordinary telemetry. Content support
bundles use a separate preview/redaction flow.

Deletion is tombstone-first and receipt-backed. Removing a Project or Chat
does not silently erase immutable security/audit history before the configured
retention boundary; it removes queryable content and derived indexes according
to the lifecycle policy.

### OBS-017 — `Allow all` is scoped, not a telemetry bypass

An `Allow all` preset may approve declared app capabilities for a selected
scope (`session`, `Chat`, `Project` or persistent) with expiry, quota, audit,
revoke, undo and reset. It does not bypass provider refusal, OS/UAC/ACL,
secret boundaries, network policy, or the telemetry content boundary.

## 9. Read models and API shape

The native kernel remains authoritative. Renderer read models are snapshots or
projections and carry their source metadata:

```ts
interface ObservabilityScope {
  profileId: string;
  projectId?: string;
  conversationId?: string;
  branchId?: string;
  runId?: string;
  attemptId?: string;
}

interface ObservabilityReadMeta {
  readAtMs: number;
  source: "native" | "fixture" | "projection";
  coverage: "complete" | "partial" | "estimated" | "unknown";
  freshness: "fresh" | "stale" | "not-applicable";
  cursor?: string;
  warning?: string;
}

interface ChatObservabilitySnapshot {
  scope: ObservabilityScope;
  meta: ObservabilityReadMeta;
  runs: readonly RunSummary[];
  selectedRunId?: string;
  activity: readonly ActivityRef[];
  timeline: readonly JournalEventRef[];
  attempts: readonly AttemptSummary[];
  timing: readonly TimingSummary[];
  usage: readonly UsageSummary[];
  costs: readonly CostSummary[];
  health: readonly HealthSummary[];
  operations: readonly OperationSummary[];
  receipts: readonly ReceiptRef[];
}

interface ProjectObservabilitySnapshot {
  scope: Pick<ObservabilityScope, "profileId" | "projectId">;
  meta: ObservabilityReadMeta;
  ownershipMode: "current-owner" | "event-time-owner" | "split";
  chats: readonly ChatSummary[];
  cards: readonly ProjectMetricCard[];
  recentActivity: readonly ActivityRef[];
  health: readonly HealthSummary[];
  exportOptions: readonly ExportOption[];
}
```

The exact TypeScript names can change with the integration owner, but every
snapshot must carry scope, read time, source and coverage. A renderer must not
merge a fixture with native facts without labelling the result.

Read commands should be bounded and filterable by Project/Chat/run, time
window, event type, attempt, provider/model bucket, outcome and cursor. Large
timelines paginate with the fixed-watermark protocol from ADR 0004.

## 10. UI-first delivery slices

Observability delivery follows the Project/Chat UI plan and keeps the user as
the primary acceptance tester:

### O1 — Preview shell (first visible slice)

- Project Overview cards and Chat inspector tabs with deterministic fixtures.
- Explicit `Preview`, `Planned`, `Unknown`, `Partial` and `Verified` labels.
- Filters for Project, Chat, run, attempt, time range and ownership mode.
- Receipt links and export drawer rendered as UI-only controls where native
  support is not present.
- Vite HMR is the normal feedback loop; no installer rebuild for CSS/React
  adjustments.

### O2 — Native read projection

- Read-only Project/Chat activity projection joined to existing journal,
  telemetry and audit facts.
- Fixed-watermark Chat timeline replay and reconnect status.
- Exact-run selection and attempt/ownership attribution.
- Native storage health and source metadata in every response.

### O3 — Instrumentation and truthfulness

- Complete timing marks, provider-final/invoice cost, typed health/quota and
  harness-operation spans where their producers exist.
- Retry/fallback attribution and project rollups with idempotent deduplication.
- Focused denial tests for scope, lineage, clocks, unknown values and privacy.

### O4 — Export, retention and recovery

- Redacted manifest/NDJSON/CSV export for Chat and Project scopes.
- Durable export checkpoints, cancellation, resume and duplicate prevention.
- Staging import, retention jobs, tombstone/purge receipts and restore evidence.

### O5 — Quality and adaptive learning

- Citation/artifact/structured-output quality evidence and evaluation windows.
- Memory/skill/tool/subagent utility projections with provenance.
- Offline/shadow adaptive routing only after the evidence and permission gates
  are green; observability must never rewrite policy or approval authority.

## 11. Acceptance gates

The first UI slice is accepted when a user can navigate Project and Chat and
understand what is and is not known without opening devtools:

1. Standalone Chat and Project-owned Chat are visibly distinct and can be
   filtered without duplicate totals.
2. A Chat inspector identifies the selected run/attempt and read time.
3. Timeline ordering comes from journal sequence/cursor; missing events are
   labelled partial rather than inferred.
4. Usage, timing, cost and health cards display source and coverage; missing
   values are `Unknown`, not `0`, `Healthy` or `Unlimited`.
5. Retry/fallback attempts remain independently visible.
6. Hidden reasoning is not shown as visible output latency or throughput.
7. Planned/native-unavailable controls are visibly disabled or labelled and do
   not imply runtime support.
8. Export preview shows scope, data planes, retention and redaction before an
   action can be confirmed.
9. Refresh/reconnect preserves a fixed watermark and does not duplicate facts.
10. A minimal smoke check covers boot, Project open, Chat open, inspector open,
    tab switching and fixture filtering. Full native/CI/release suites remain
    separate gates.

## 12. Non-goals and explicit boundaries

This contract does not authorize or claim:

- silent scanning of every drive or ingestion of all user data;
- keylogging, browser-cookie/password extraction, CAPTCHA/security bypass,
  privilege escalation or unrestricted remote control;
- provider/model refusal bypass;
- arbitrary source execution from the release installer;
- raw prompt/response/reasoning/tool payloads in telemetry, metrics or ordinary
  receipts;
- a green dashboard as proof of production readiness, native compilation,
  packaged Windows behavior or Chat Complete status.

The current repository already contains substantial domain contracts and
schema tables for run journals, usage, timing, cost, health and harness
operations. Their native runtime and end-to-end Project/Chat integration must
be re-verified in the current source snapshot before a status changes from
`partial`, `preview` or `planned` to `implemented`.
