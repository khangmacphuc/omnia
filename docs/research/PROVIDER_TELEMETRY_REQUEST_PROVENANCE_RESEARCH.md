# Provider Telemetry, Request Provenance, and Model-Run Observability

Status: research and architecture input; not implementation evidence  
Last reviewed: 2026-08-14  
Audience: provider gateway, durable kernel, storage, observability, routing, UI, evaluation, and Project Twin  
Related contracts: `PROVIDER_ARCHITECTURE.md`, `CONVERSATION_BRANCH_ARCHITECTURE.md`, ADR 0004, ADR 0005, `src/domain/telemetry.ts`

## 1. Research conclusion

Omnia should expose enough information for a user to answer all of these
questions for any prompt, branch, run, iteration, provider attempt, tool call,
or subagent:

- What exactly did I ask, and which immutable prompt revision was used?
- Which branch, fork point, context snapshot, memory revision, skill revision,
  provider connection, model, model profile, effort preset, and resolved
  parameter set produced this result?
- When was the request queued, prepared, dispatched, first acknowledged,
  first visible, last visible, and terminal?
- How much time was spent in queueing, context compilation, approvals,
  uploading, provider startup, visible generation, tools, retry backoff,
  renderer backpressure, and recovery?
- How many input, cache-read, cache-write, output, reasoning, visible-output,
  audio, image, search, tool, and provider-specific billing units were used?
- What was the visible token throughput, effective end-to-end throughput,
  stream cadence, and time to first visible output?
- What did the request cost according to a local estimate, provider report,
  and later invoice reconciliation?
- How much of the cost was caused by retries, fallbacks, abandoned branches,
  tools, subagents, media transformations, or cache misses?
- Which rate-limit window applied, what were its scope, remaining headroom and
  reset time, and whether the values were provider-reported, configured, or
  inferred?
- Did an error occur, was provider acceptance known, why did Omnia retry,
  repair, wait, fallback, ask the user, or stop, and what happened on every
  attempt?
- Which answer was copied, promoted, branched, forked, compared, edited, or
  selected, without erasing the alternatives or double-counting shared
  ancestry?

The existing ADR 0005 and `src/domain/telemetry.ts` already establish a strong
local-first, append-only foundation. The main remaining specification gaps are
the per-message inspector contract, frozen model/effort/parameter provenance,
explicit logical-run-versus-provider-dispatch rate metrics, richer cost
components, navigation action provenance, adaptive retry decision receipts,
and a provider normalization matrix backed by current official documentation.

## 2. Official-source findings

### 2.1 OpenAI

OpenAI documents a server-generated `x-request-id`, an optional
client-generated `X-Client-Request-Id`, and request/token rate-limit headers
containing limits, remaining values, and reset durations. OpenAI also recommends
logging request IDs for troubleshooting. A connector must preserve a restricted
diagnostic request identifier while using an opaque or hashed identifier in
ordinary telemetry and metric dimensions.

OpenAI usage objects distinguish input and output accounting, and current model
families may expose detailed cached-input and reasoning-output token counters.
Omnia must normalize only counters whose semantics are known and retain all
other numeric counters under an OpenAI-qualified namespace. It must not infer
that unreported cache or reasoning usage is zero.

Source:

- <https://developers.openai.com/api/reference/overview/>

### 2.2 Anthropic

Anthropic returns a `request-id` header, documents typed HTTP failures, and
uses `retry-after` for overload and rate-limit cases. Its rate-limit headers can
represent requests, input tokens, output tokens, acceleration limits, and
unified limits; header semantics have changed over time and therefore require
adapter and schema versioning.

Anthropic usage accounting includes input and output tokens and can include
prompt-cache creation and cache-read counters. Current administrative usage and
cost APIs support server-side aggregation and may be used for reconciliation,
but a per-attempt local ledger remains necessary because aggregation APIs do not
replace the exact interactive run lineage.

Claude Code documents OpenTelemetry metrics for session count, lines changed,
pull requests, commits, cost, token usage, code-edit decisions, and active time.
This is useful evidence that Omnia should measure both provider economics and
harness outcomes; however, Omnia must use its own privacy, cardinality, and
semantic contracts rather than copying another product's event schema.

Sources:

- <https://platform.claude.com/docs/en/api/errors>
- <https://platform.claude.com/docs/en/api/rate-limits>
- <https://platform.claude.com/docs/en/build-with-claude/usage-cost-api>
- <https://docs.anthropic.com/en/docs/claude-code/monitoring-usage>

### 2.3 Gemini

Gemini exposes a token-counting endpoint and response `usage_metadata`.
Current fields can distinguish prompt, candidate/output, cached-content,
thinking, tool-use-prompt, total, and per-modality token counts. Streaming
responses can surface usage metadata in chunks, so Omnia needs provisional and
final usage observations rather than one mutable total.

Gemini rate limits are quota- and tier-dependent and are evaluated across more
than one dimension, including requests and tokens. A `429` should be classified
as quota or rate-limit evidence rather than as proof that a model is dead.
Gemini's models API supplies discovery metadata, but health must still separate
catalog reachability, authentication, quota, model availability, and actual
inference success.

Sources:

- <https://ai.google.dev/gemini-api/docs/tokens>
- <https://ai.google.dev/gemini-api/docs/thinking>
- <https://ai.google.dev/gemini-api/docs/rate-limits>
- <https://ai.google.dev/gemini-api/docs/models>

### 2.4 DeepSeek, Kimi, Qwen, GLM, and compatible endpoints

DeepSeek documents standard prompt/completion/total usage plus prompt-cache hit
and miss counters, a models endpoint, and typed HTTP errors. Its published
errors distinguish rate limiting from service overload, reinforcing the need
for typed retry policy rather than one generic `api_error` bucket.

Moonshot/Kimi and Alibaba Model Studio expose OpenAI-compatible APIs, but
compatibility does not guarantee identical supported parameters, usage details,
request identifiers, rate-limit semantics, tool behavior, streaming terminals,
or model discovery. Zhipu/GLM and other compatible endpoints must be treated the
same way: compatibility is a transport template, not a capability claim.

Each adapter therefore needs an evidence-backed mapping version, capability
probe results, namespaced counters, and golden conformance fixtures. Unknown
fields remain unknown; a generic OpenAI-compatible adapter must never invent
cached tokens, thinking tokens, price, context limits, or rate-limit headroom.

Sources:

- <https://api-docs.deepseek.com/quick_start/error_codes>
- <https://api-docs.deepseek.com/guides/kv_cache>
- <https://api-docs.deepseek.com/api/list-models>
- <https://platform.moonshot.cn/docs/api/chat>
- <https://help.aliyun.com/zh/model-studio/qwen-api-via-openai-chat-completions>

### 2.5 OpenTelemetry

OpenTelemetry's generative-AI semantic conventions include client operation
duration and token-usage metrics, with model/provider attributes. The
conventions remain versioned and may evolve, so Omnia's durable native schema
must remain its source of truth and export through a versioned projection.
Run, conversation, branch, prompt text, file paths, URLs, raw request IDs, and
arbitrary provider strings must not become unbounded metric labels.

Sources reviewed on 2026-08-14:

- <https://github.com/open-telemetry/semantic-conventions-genai>
- <https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-metrics.md>

The GenAI conventions moved from the core semantic-conventions repository to
the dedicated `open-telemetry/semantic-conventions-genai` repository. The
reviewed repository HEAD was
`30182acd5ed78ab5f619041eaec5e95a4eb83a48`. The documents identify the
conventions as development-stage, so Omnia must pin the reviewed revision for
any release decision and must not silently inherit future `main` changes.

## 3. Canonical lineage

The inspector and usage ledger should use this hierarchy:

```text
profile
  -> project? / projectless conversation
    -> conversation
      -> branch
        -> immutable message revision
          -> logical run
            -> iteration
              -> provider attempt (exactly one HTTP inference dispatch)
                -> stream event / item / tool intent
                  -> tool or subagent child spans
```

Required immutable identities and revisions include:

- conversation ID and branch ID;
- source branch, source cursor, and fork boundary;
- user message ID and message revision ID;
- prompt-template revision and prompt-workshop revision;
- context snapshot and context-compiler version;
- memory, skill, persona, tool, policy, and project-instruction revisions;
- logical run, iteration, attempt, and item IDs;
- provider connection revision and adapter version;
- provider model ID, model profile revision, model-catalog snapshot, and
  capability-snapshot hash;
- requested effort and resolved provider-native effort/thinking parameters;
- full resolved parameter snapshot with origin layer for every value;
- route-plan revision, retry-policy revision, price snapshot, formula version,
  and evaluation-policy revision;
- machine/environment/sandbox identity when execution is involved.

The renderer may display friendly aliases, but aliases are not stable lineage.

## 4. Message-level metadata strip

Every user request and assistant result should have a compact metadata strip.
The default collapsed form should show only high-value facts:

```text
Claude Opus · Anthropic · Ultra · TTFT 1.8 s · 38.6 tok/s · 14.2 s · $0.021 · 2 attempts
```

The strip must adapt when facts are unavailable:

```text
Local model · Deep · 9.6 s · usage estimated · price unknown
```

Required quick facts:

- requested and resolved model alias;
- provider connection alias;
- effort/preset;
- status;
- start time and total duration;
- first-visible latency;
- visible token throughput;
- input/output/reasoning/cache token summary;
- estimated/reported cost and currency;
- attempt/retry/fallback count;
- warning when data is partial, estimated, stale, or unknown.

The current request remains expanded. Older requests collapse to this strip,
with user-configurable density and pinning.

## 5. Full request inspector

The expanded inspector should use separately addressable tabs so each surface
can be deep-linked, copied, exported, or opened from an error:

### 5.1 Identity

- prompt title and semantic task class;
- all canonical IDs and revisions;
- branch ancestry, fork reason, source message, and source cursor;
- actor, client surface, device, and creation route;
- correlation, trace, and durable journal cursors;
- copy/fork/branch/regenerate derivation edges.

### 5.2 Route

- requested versus resolved provider and model;
- provider connection/configuration revision;
- adapter and transport version;
- endpoint alias, region, service tier, and data-class policy;
- requested effort and resolved native reasoning/thinking settings;
- requested, resolved, translated, emulated, ignored, and rejected parameters;
- fallback candidates, compatibility losses, and route-decision explanation;
- model health/capability snapshot freshness.

### 5.3 Timing

- user committed input;
- queue entered and left;
- context compilation start/end;
- approval wait start/end;
- frozen provider input prepared;
- dispatch started;
- request body committed;
- first response byte;
- first provider output of any kind;
- first reasoning event if observable;
- first user-visible output;
- first complete semantic item;
- last visible output;
- provider terminal;
- durable terminal commit;
- renderer finished;
- retry/backoff, tool wait, subagent wait, and recovery intervals;
- wall-clock timestamps for display and monotonic durations for calculation.

### 5.4 Usage

- input tokens;
- uncached input tokens when derivable;
- cache-read input tokens;
- cache-write/creation input tokens;
- output tokens;
- reasoning/thinking tokens;
- visible-output tokens;
- audio, image, search, embedding, tool, storage, and other billable units;
- provider-qualified counters;
- estimate, incremental, final, invoice, and user-correction facts;
- tokenizer/model confidence;
- supersession lineage for corrections.

### 5.5 Throughput

Use explicit, versioned formulas rather than one ambiguous `tokens/s` value:

```text
TTFB = firstByte - dispatchStarted
TTFT-visible = firstVisibleOutput - dispatchStarted
visibleGeneration = lastVisibleOutput - firstVisibleOutput
visibleTPS = visibleOutputTokens / visibleGeneration
endToEndTPS = visibleOutputTokens / (terminal - queueEntered)
```

Additional optional measures:

- provider-output TPS when provider token events permit it;
- reasoning TPS only when reasoning-token timing is truly observable;
- stream delta cadence p50/p95/max;
- stall count and longest stall;
- bytes per second for audio/image/file transport;
- effective throughput excluding queue/approval/tool waits;
- rolling or exponential-moving-average TPS for live display.

The UI must label the formula and coverage. Hidden reasoning cannot be counted
as visible output, and a provider's token total cannot be divided by an
unrelated renderer duration.

### 5.6 Rate limits and quota

Display logical product demand separately from provider dispatch demand:

- logical runs per minute;
- HTTP inference attempts per minute;
- input, output, and total tokens per minute;
- active and peak concurrency;
- queued work caused by quota;
- retries and fallbacks per minute;
- provider-reported limit, remaining, reset, and retry-after;
- quota scope: organization, workspace/project, API key, provider connection,
  endpoint, region, model, tier, or unknown;
- source: provider header, provider API, configured, inferred;
- freshness and authority.

An absent limit is `unknown`, never `unlimited`. An inferred value is never
authoritative. A single `429` degrades the relevant route/window but does not
mark every model from the provider dead.

### 5.7 Cost

Keep parallel statements rather than one mutable cost:

- local calculated estimate;
- provider-reported cost when available;
- invoice/admin-API reconciliation;
- user correction;
- pending or unknown.

Itemize at least:

- uncached input;
- cache read;
- cache write/creation;
- visible and reasoning output where the provider prices them differently;
- audio/image/video;
- embeddings and reranking;
- web search, file search, computer-use, code interpreter, and other tools;
- storage or long-running/background charges;
- subagent and nested-model calls;
- retry/fallback waste;
- abandoned or non-promoted branch cost;
- local electricity/hardware estimate as an optional separate category.

Every estimate freezes currency, unit prices, pricing dimensions, catalog
revision, effective date, formula version, rounding policy, and provider/model
route. Later pricing changes must not rewrite historical estimates.

### 5.8 Reliability and retry

- HTTP status and typed normalized error;
- bounded raw provider code;
- provider request identity in restricted diagnostics;
- hashed request identity in ordinary telemetry;
- provider-acceptance evidence and `outcome_unknown` state;
- idempotency support: enforced, best-effort, unsupported, unknown;
- attempt sequence, retry reason, decision policy/version, delay, and countdown;
- deterministic rules evaluated;
- AI retry-controller recommendation, confidence, evidence features, and
  whether the recommendation was accepted or overridden;
- payload repair or auto-reprompt semantic diff;
- provider/model fallback and every compatibility/privacy/cost change;
- stop condition, retry budget, elapsed retry window, and final terminal reason.

### 5.9 Context

- context capacity and reserved output budget;
- system, developer, user, latest correction, and superseded instruction units;
- files, selections, sources, memories, skills, personas, and code symbols;
- retrieved, reranked, compressed, truncated, omitted, restricted, and stale
  items;
- token allocation by category;
- cache key/result without revealing provider secrets;
- compiler version, policy version, and coverage evaluation.

### 5.10 Quality and learning

- user rating and explicit correction;
- copy, share, export, branch, fork, promote, regenerate, abandon, and delete
  signals;
- citation coverage and source-quality checks;
- verifier, test, visual, accessibility, security, and performance outcomes;
- whether an answer became canonical or was promoted into an artifact;
- offline evaluation scores and evaluator versions;
- eligibility for personalization/training under user policy.

These signals are evidence for later routing evaluation. They never grant
permissions or prove semantic quality by themselves.

## 5A. Canonical inspector projection for implementation

The UI should consume one typed, read-only projection instead of reading
provider-specific tables directly. This keeps the renderer simple and makes
the native kernel the authority for every value shown in the inspector.

```ts
interface RequestInspectorProjection {
  schemaVersion: 1;
  scope: {
    profileId: string;
    projectId?: string;
    conversationId: string;
    branchId: string;
    runId: string;
    iterationId?: string;
    attemptId?: string;
    itemId?: string;
  };
  message: {
    userMessageId: string;
    userMessageRevisionId: string;
    assistantMessageId?: string;
    promptRevisionId: string;
    sourceCursor: number;
  };
  route: {
    requestedProvider?: string;
    resolvedProvider?: string;
    providerConnectionRevision?: string;
    adapterId?: string;
    adapterVersion?: string;
    requestedModel?: string;
    resolvedModel?: string;
    modelProfileRevision?: string;
    catalogSnapshotId?: string;
    capabilitySnapshotHash?: string;
    requestedEffort?: string;
    resolvedEffort?: string;
    parameterSnapshotHash?: string;
    routePlanRevision?: string;
    serviceTier?: string;
    endpointAlias?: string;
    compatibilityWarnings: readonly string[];
  };
  status: {
    logicalRun: "draft" | "queued" | "preparing" | "dispatching" | "streaming" |
      "retry-scheduled" | "waiting-user" | "completed" | "failed" |
      "cancelled" | "outcome-unknown";
    attempt?: "prepared" | "dispatching" | "accepted" | "streaming" |
      "stalled" | "retrying" | "terminal" | "outcome-unknown";
    terminalReason?: string;
    dataQuality: "reported" | "estimated" | "partial" | "unknown" | "stale";
  };
  timing: {
    startedAt?: string;
    queueMs?: number;
    contextCompileMs?: number;
    approvalWaitMs?: number;
    requestUploadMs?: number;
    timeToFirstByteMs?: number;
    timeToFirstProviderOutputMs?: number;
    timeToFirstVisibleOutputMs?: number;
    timeToFirstCompleteItemMs?: number;
    visibleGenerationMs?: number;
    totalAttemptMs?: number;
    totalLogicalRunMs?: number;
    retryBackoffMs?: number;
    toolWaitMs?: number;
    rendererBackpressureMs?: number;
    terminalAt?: string;
  };
  usage: {
    inputTokens?: number;
    uncachedInputTokens?: number;
    cacheReadInputTokens?: number;
    cacheWriteInputTokens?: number;
    outputTokens?: number;
    reasoningTokens?: number;
    visibleOutputTokens?: number;
    totalTokens?: number;
    providerCounters: Readonly<Record<string, number>>;
    source: "local-estimate" | "provider-incremental" | "provider-final" |
      "provider-invoice" | "user-correction" | "unknown";
    authoritative: boolean;
  };
  throughput: {
    visibleTokensPerSecond?: number;
    endToEndTokensPerSecond?: number;
    providerTokensPerSecond?: number;
    reasoningTokensPerSecond?: number;
    streamDeltaP50Ms?: number;
    streamDeltaP95Ms?: number;
    formulaVersion: string;
  };
  quota: {
    windows: readonly {
      kind: "requests" | "input-tokens" | "output-tokens" | "total-tokens" | "concurrency";
      scope?: string;
      limit?: number;
      remaining?: number;
      resetAt?: string;
      windowSeconds?: number;
      retryAfterMs?: number;
      source: "provider-header" | "provider-api" | "configured" | "inferred";
      authoritative: boolean;
      observedAt: string;
    }[];
  };
  cost: {
    statements: readonly {
      kind: "calculated-estimate" | "provider-reported" | "invoice" | "user-override";
      component: string;
      amountMicrounits: number;
      currency: string;
      priceSnapshotId?: string;
      formulaVersion?: string;
    }[];
    totalEstimatedMicrounits?: number;
    totalReportedMicrounits?: number;
    totalInvoiceMicrounits?: number;
    retryWasteMicrounits?: number;
    branchIncrementMicrounits?: number;
  };
  retry: {
    attempts: readonly {
      attemptId: string;
      status: string;
      httpStatus?: number;
      normalizedError?: string;
      acceptance: "not-sent" | "rejected" | "accepted" | "unknown";
      startedAt?: string;
      terminalAt?: string;
      selectedDelayMs?: number;
      decisionId?: string;
    }[];
    nextRetryAt?: string;
    retryWindowEndsAt?: string;
    fallbackSelected?: boolean;
  };
  context: {
    snapshotId?: string;
    compilerVersion?: string;
    inputBudget?: number;
    reservedOutputBudget?: number;
    includedItems: number;
    omittedItems: number;
    staleItems: number;
    restrictedItems: number;
    cacheHit?: boolean;
  };
  lineage: {
    parentRunId?: string;
    parentAttemptId?: string;
    sourceBranchId?: string;
    forkBoundary?: string;
    derivedFromRunId?: string;
    operation: "original" | "copy" | "jump" | "branch" | "fork" |
      "retry" | "regenerate" | "compare" | "promote";
  };
}
```

Every optional numeric field is absent/unknown when the provider or local
runtime did not produce valid evidence. The renderer must never render `0` as
a replacement for missing data.

## 5B. Normalized provider event vocabulary

Adapters should emit a small, provider-neutral event vocabulary and retain the
raw provider event only in a restricted, bounded diagnostic envelope:

```text
attempt.prepared
attempt.dispatch_started
attempt.request_committed
attempt.first_byte
attempt.provider_output_started
attempt.reasoning_started
attempt.visible_output_started
attempt.complete_item
attempt.text_delta
attempt.reasoning_summary_delta
attempt.tool_intent
attempt.citation
attempt.artifact
attempt.usage_observed
attempt.rate_limit_observed
attempt.warning
attempt.stalled
attempt.cancel_requested
attempt.cancelled
attempt.provider_terminal
attempt.outcome_unknown
attempt.retry_classified
attempt.retry_scheduled
attempt.retry_started
attempt.fallback_proposed
attempt.fallback_selected
attempt.repair_proposed
attempt.repair_selected
attempt.terminalized
```

Each event includes schema version, event ID, run/iteration/attempt/item
lineage, monotonic sequence, wall-clock anchor, correlation ID, source
adapter/version, and a canonical payload hash. Event-specific data is bounded,
typed, and content-free by default. Stream deltas need not be stored forever;
milestones, usage, terminal evidence, and a replay cursor are durable.

## 5C. Adapter conformance contract

Every provider adapter must implement or explicitly mark unsupported:

```text
discover_models()
describe_capabilities(model)
health_probe(scope)
prepare_request(frozen_input)
dispatch(prepared_request)
normalize_stream_event(raw_event)
parse_usage(raw_event_or_response)
parse_rate_limits(headers_or_response)
parse_error(status_headers_body)
request_identity(headers_or_response)
acceptance_evidence(headers_or_response)
idempotency_support()
cancel(attempt)
reconcile_usage_or_cost(report)
```

The conformance result records `native`, `translated`, `emulated`,
`unsupported`, or `unknown` for each capability. A provider-compatible adapter
must not show a control unless the selected model's capability snapshot proves
that the control is supported or the UI explicitly labels it as emulated.

Golden fixtures must cover:

- non-streaming JSON;
- fragmented SSE/JSONL;
- usage arriving only in a terminal event;
- provisional then final usage;
- duplicate event IDs;
- missing event IDs;
- request-ID and rate-limit headers;
- `Retry-After` in seconds and HTTP-date forms;
- malformed JSON, invalid Unicode, empty stream, truncated stream, and wrong
  content type;
- tool calls, citations, artifacts, safety/refusal terminals, cancellation,
  and provider acceptance uncertainty.

## 5D. Branch-aware accounting rules

The following rules prevent a sophisticated UI from producing misleading totals:

- `copy`, `jump`, `pin`, `bookmark`, `annotate`, `collapse`, `expand`, and
  `share-link` are zero-usage navigation/projection actions;
- `copy-as-new-prompt` creates a new draft revision with `derivedFrom`, but no
  usage until sent;
- `branch` and `fork` create lineage edges and inherit a prefix without copying
  provider attempts or costs;
- `retry` inside one safe logical run contributes its attempt usage to the
  logical total, but remains independently visible;
- user `Try again`, regenerate, model comparison, and changed-context replay
  create new logical runs;
- active-branch cost is the sum of unique attempts on its resolved path;
- conversation total is the sum of unique attempts across all branches;
- shared ancestors are counted once in conversation/project totals;
- comparison and experiment views show both gross cost and incremental cost
  after subtracting shared prefix work;
- promotion of an answer changes canonical-result metadata, not historical
  usage or cost;
- deleting or archiving a branch is not a billing deletion.

## 5E. Data-quality badges

Every inspector number should carry a machine-readable quality badge:

```text
reported       provider supplied a semantically mapped value
estimated      Omnia calculated it from a frozen tokenizer/price formula
partial        some stream/clock/usage coverage is missing
unknown        no defensible value exists
stale          value exists but exceeded freshness policy
reconciled     provider report or invoice matched a local ledger
corrected      later authoritative observation superseded an earlier value
```

The badge is part of the value, not a tooltip-only decoration. Exported JSON,
CSV, Project Twin graphs, and screenshots must preserve it.

## 6. Jump, copy, branch, fork, and regenerate semantics

### 6.1 Jump

`Jump to prompt`, `Jump to answer`, `Jump to source`, `Jump to tool`, `Jump to
branch point`, and `Jump to latest activity` are navigation commands only. They
must not mutate branch state, rerun a model, or change output routing. A jump
target is an immutable object ID plus optional revision, item, source region,
or stream-event cursor.

The UI should support:

- next/previous user prompt;
- next/previous assistant answer;
- next/previous error, retry, source, tool, artifact, task, or agent event;
- breadcrumb navigation across parent branch and child forks;
- keyboard shortcuts and command-palette commands;
- mini-map/timeline markers;
- back/forward history independent from active branch selection;
- shared anchored links that report stale or inaccessible targets honestly.

### 6.2 Copy

Copying text, Markdown, code, citation, request metadata, or a run bundle is a
local projection action and creates no provider usage. When copied content is
later inserted as a new prompt, Omnia may preserve a `derivedFrom` provenance
edge if the user has not stripped metadata.

Copy variants should include:

- plain text;
- Markdown;
- rich text;
- code only;
- quote with anchored reference;
- answer with citations;
- prompt with context manifest;
- reproducible run recipe without secrets;
- redacted diagnostic bundle;
- deep link.

### 6.3 Branch and fork

A branch inherits an immutable parent prefix through an explicit fork boundary
and source cursor. It does not duplicate or rewrite shared history. A new model
answer on the child branch is a new logical run with independent attempt,
usage, timing, cost, and route provenance.

Required fork options include:

- fork before a user prompt;
- fork after a user prompt but before its answer;
- fork after an assistant answer;
- fork from a selected answer fragment or artifact revision;
- fork as projectless chat or into an authorized project;
- inherit or explicitly exclude memory, skill, files, sources, machine, model,
  effort, and advanced parameters;
- preserve completed-only output, interrupt-then-fork, or explicitly inherit a
  durable interrupted partial result.

### 6.4 Regenerate and retry

User-visible `Try again` or `Regenerate` creates a sibling outcome and retains
the original. A transport retry may remain under the same logical run only when
the native dispatch/idempotency contract proves it safe. Any model, provider,
parameter, prompt, context, memory, skill, policy, or machine change requires a
new frozen input and explicit comparison provenance.

### 6.5 Cost aggregation across branches

Conversation and project totals must not double-count shared ancestor runs.
Useful views include:

- actual incurred cost across all unique attempts;
- active-branch path cost;
- incremental cost since fork;
- comparison experiment cost;
- abandoned/non-promoted branch cost;
- retry and fallback overhead;
- canonical-result cost.

Deleting or archiving a branch does not erase incurred usage facts unless the
user invokes a separate retention/deletion policy.

## 7. Model picker health and observability

Opening the picker should use cached catalog data immediately and refresh in
the background. Each row should expose:

- provider and connection;
- exact model ID and friendly family;
- configured profile/effort presets;
- capability confidence and source;
- last catalog refresh;
- last passive success;
- last inference success and failure;
- recent p50/p95 TTFT and total latency;
- recent visible TPS;
- success, rate-limit, and timeout rates;
- quota headroom and reset when known;
- current price-snapshot freshness;
- compatibility with the current prompt, files, tools, context, privacy class,
  and output requirements;
- health state with exact failing dimension.

Recommended states:

- healthy;
- degraded latency;
- rate limited;
- quota exhausted;
- authentication failed;
- authorization denied;
- billing unavailable;
- catalog unavailable;
- model unavailable/deprecated;
- protocol incompatible;
- local model unloaded/loading;
- stale;
- unknown;
- not yet tested.

Active probes must be conservative, visible, rate/cost budgeted, and disabled by
default when a passive or provider-supported health/catalog endpoint suffices.

## 8. Adaptive retry decision hierarchy

Retry intelligence should follow a hard safety hierarchy:

```text
security and permission policy
  -> provider acceptance / idempotency evidence
  -> deterministic error classification
  -> explicit Retry-After or reset headers
  -> configured attempt, time, and cost budgets
  -> provider/model health and route eligibility
  -> learned or AI recommendation
  -> user override
```

The AI controller may recommend waiting, retrying, reducing concurrency,
repairing parameters, splitting context, changing a file/vision bridge,
switching a model/provider, re-prompting, scheduling later, asking the user, or
stopping. It cannot override authorization, privacy routing, idempotency safety,
secret policy, or a hard budget.

Every decision must store a compact receipt:

```ts
interface RetryDecisionReceipt {
  decisionId: RetryDecisionId;
  runId: RunId;
  sourceAttemptId: AttemptId;
  normalizedError: ProviderErrorClass;
  httpStatus?: number;
  providerCode?: string;
  acceptance: "not-sent" | "rejected" | "accepted" | "unknown";
  idempotency: "enforced" | "best-effort" | "unsupported" | "unknown";
  deterministicRuleId: string;
  providerRetryAfterMs?: number;
  selectedDelayMs?: number;
  action:
    | "retry-new-attempt"
    | "wait"
    | "repair-payload"
    | "reprompt"
    | "fallback"
    | "ask-user"
    | "stop"
    | "mark-outcome-unknown";
  learnedRecommendation?: {
    policyRevision: string;
    action: string;
    confidence: number;
    featureSnapshotHash: string;
  };
  overriddenBy?: "deterministic-policy" | "user" | "budget";
  createdAt: IsoTimestamp;
}
```

## 9. Privacy and retention

The user asked for extensive data collection for learning and debugging. The
correct architecture is layered, not unrestricted raw capture:

1. **Operational telemetry**: content-free, local by default, suitable for
   metrics and long-term aggregation.
2. **Restricted request diagnostics**: encrypted and access-controlled; may
   contain bounded provider/request details but never raw credentials.
3. **User-approved content trace**: explicit per-run/session capture with a
   preview, retention limit, redaction, and deletion controls.
4. **Training/evaluation dataset**: separately consented, versioned, redacted,
   and reversible; no automatic projection from restricted observations.
5. **Export/support bundle**: user-reviewed manifest and redaction before any
   external transfer.

Never include these in metric dimensions or default remote export:

- prompt/response/reasoning text;
- raw tool payloads;
- file paths and URLs;
- project, conversation, branch, run, or user IDs;
- raw model IDs from arbitrary endpoints;
- request IDs;
- error text;
- API keys, cookies, auth headers, signed URLs, or credentials.

## 10. Recommended small-file documentation pack

To keep the master goal readable by humans and models, this topic should be
split into small, dependency-addressable files:

```text
docs/omnia-ultra/
  00-manifest/
    README.md
    reading-order.yaml
    capability-index.yaml
    terminology.md
  05-conversation/
    05-jump-and-navigation.md
    06-copy-share-and-export.md
    07-branch-fork-edit-and-regenerate.md
    08-compare-promote-and-canonical-results.md
  11-provider-observability/
    README.md
    01-run-attempt-and-route-lineage.md
    02-model-picker-catalog-and-health.md
    03-request-lifecycle-and-timing.md
    04-token-cache-and-throughput-accounting.md
    05-cost-pricing-and-invoice-ledger.md
    06-rpm-tpm-concurrency-and-quota.md
    07-errors-retry-backoff-repair-and-fallback.md
    08-request-inspector-and-inline-error-ui.md
    09-provider-normalization-matrix.md
    10-telemetry-privacy-retention-and-export.md
    11-routing-evaluation-and-learning-signals.md
    12-denial-fault-and-acceptance-tests.md
    SOURCES.md
```

Each specification file should contain:

- purpose and user outcomes;
- non-goals;
- dependencies;
- canonical terminology;
- invariants;
- typed objects/events;
- native authority boundary;
- UI states and interaction contract;
- persistence and migration requirements;
- privacy/security rules;
- accessibility and performance requirements;
- failure, unavailable, partial, stale, and recovery states;
- deterministic tests and evidence gates;
- implementation status using only Designed, Implemented, Wired, Verified,
  Preview, Planned, Release Candidate, or Shipped;
- links to source documents and related Project Twin nodes.

## 11. Acceptance and denial gates

At minimum, verify:

1. every assistant result identifies the exact model, provider, effort, frozen
   parameter revision, run, and attempt;
2. start time, TTFT, generation duration, total duration, and token throughput
   use monotonic marks and explicit formulas;
3. visible TPS excludes hidden reasoning unless the UI explicitly displays a
   separately supported reasoning metric;
4. logical RPM and dispatch RPM remain distinct;
5. provider limits, remaining values, reset times, scope, authority, and
   freshness are never conflated;
6. missing usage, price, cache, reasoning, or quota data stays unknown;
7. provisional/final/invoice usage and cost remain independently auditable;
8. price changes cannot rewrite historical estimates;
9. retries and fallbacks retain independent attempt usage and cost;
10. provider acceptance marked true cannot be downgraded;
11. outcome-unknown attempts are not blindly replayed;
12. a branch creates new run lineage without duplicating shared ancestor cost;
13. copying or jumping creates no provider usage;
14. regenerate never overwrites the previous answer;
15. an AI retry recommendation cannot override permission, privacy,
    idempotency, or budget policy;
16. model-picker health distinguishes auth, authorization, billing, quota,
    catalog, transport, protocol, streaming, and model failures;
17. current request panels expand while old panels collapse without destroying
    detailed history;
18. inline request errors survive restart and show the next retry countdown;
19. raw prompts, responses, reasoning, credentials, paths, URLs, request IDs,
    and tool payloads cannot cross the default telemetry/export boundary;
20. journal facts, ledger entries, and projections commit or roll back in one
    transaction;
21. renderer failure never makes a provider run fail;
22. restart/reconnect replays the same observations without duplication;
23. OpenTelemetry export failure never blocks local execution;
24. every aggregate can drill into retained source runs without fabricated
    charts or fake samples;
25. same-snapshot tests, migration checks, visual evidence, accessibility, and
    packaged Windows smoke exist before the feature is called Verified.

## 12. Recommended next implementation slices

1. Reconcile this research with ADR 0005 and freeze any missing domain types.
2. Add frozen model profile, effort, parameter-origin, route-plan, and retry
   decision revisions to exact run/attempt provenance.
3. Persist timing, usage, cost, quota, health, and harness observations in the
   native store transactionally with journal events.
4. Instrument provider adapters with versioned OpenAI, Anthropic, Gemini, and
   compatible-provider conformance fixtures.
5. Implement the compact message metadata strip and full request inspector.
6. Implement inline durable error/retry state and countdowns.
7. Add model-picker passive health, bounded refresh, and typed degraded states.
8. Add branch-aware aggregation and comparison without ancestor double count.
9. Add local rollups, retention, export projection, and invoice reconciliation.
10. Enable adaptive routing/retry learning only after offline evaluation,
    shadow mode, privacy controls, and rollback are proven.
