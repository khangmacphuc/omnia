# Provider fault harness

Status: **test infrastructure implemented; production integration partial**

Last reviewed: **August 13, 2026**

This document defines the deterministic provider fault-injection boundary for
Omnia. It describes checked-in test infrastructure, required provider/runtime
assertions, and work that remains before provider execution can be called
restart-safe or billing-safe.

The implementation lives in
`src-tauri/src/provider_fault_harness.rs` and is compiled only under
`cfg(test)`. It is not an IPC command, is not included as a provider feature,
does not access saved credentials, and never contacts a live provider.

## 1. Purpose

Provider failures do not occur only at clean API boundaries. They happen:

- before a request is accepted;
- after bytes may have left the machine but before headers arrive;
- after headers but before the first provider event;
- in the middle of an HTTP body, UTF-8 code point, JSON value, or SSE frame;
- after visible text but before usage or terminal evidence;
- during cancellation, renderer reload, journal append, or projection update.

Tests based on a complete response buffer cannot distinguish those seams.
Tests based on `sleep` are timing-sensitive and cannot prove the exact order of
request, persistence, notification, cancellation, and failure.

The Omnia harness therefore exposes a local TCP server driven by an explicit
scenario:

```text
ProviderFaultScenario
  -> one or more ordered connection scripts
    -> typed response head
    -> exact byte write
    -> named blocking checkpoint
    -> write-half close or immediate close
```

It records:

- exact request line, headers, and body;
- connection and script identity;
- exact step and byte count sent;
- named checkpoint arrival;
- half-close, close, and scenario completion.

Checkpoint release is explicit. A test waits for a named observation and then
releases that same connection/checkpoint; it does not guess readiness with a
delay.

## 2. Security and isolation contract

The harness must remain local-only and test-only.

- Listener binding is fixed to IPv4 loopback on an ephemeral port.
- The module is registered only through `#[cfg(test)]`.
- There is no Tauri command and no renderer-facing API.
- Scenarios and captured requests are bounded by count and byte limits.
- Channels are bounded.
- Waits and joins have deadlines; timeout aborts the server task.
- Scenario names, response status, reason, and headers are validated before
  opening a listener.
- Header CR/LF injection is rejected.
- Ambiguous request framing such as duplicate `Content-Length` or
  `Transfer-Encoding` is rejected by the request-capture boundary.
- Test code must use recognizable synthetic secrets such as
  `OMNIA_SYNTHETIC_SECRET_CANARY`, never a real API key.
- Captured request bytes must never be copied into ordinary logs, snapshots,
  exports, error strings, or release artifacts.
- Fixtures must be authored for Omnia. Do not use captured private provider
  traffic, prompts, credentials, signed URLs, or user documents.

The mock server intentionally accepts arbitrary exact response bytes after a
validated response head. Malformed HTTP framing that cannot be expressed by
the typed head may be sent as raw bytes only in a separate hostile-wire test
extension. That extension must preserve the same loopback, bound, timeout, and
fixture rules.

## 3. Implemented primitives

### 3.1 Scenario and connection script

`ProviderFaultScenario` defines:

- a bounded name;
- a request-capture limit;
- one to sixteen sequential connection scripts.

`ProviderConnectionScript` defines ordered steps:

- `response_head(status, reason, headers)`;
- `bytes(exact_bytes)`;
- `checkpoint(name)`;
- `shutdown_write()`;
- `close()`.

Validation rejects:

- empty or oversized scripts;
- more than one typed response head;
- duplicate checkpoint names in a connection;
- any step after close/shutdown;
- invalid status, reason, or header bytes;
- response scripts above the configured safety bound.

### 3.2 Request capture

The server captures one exact HTTP/1 request for each connection. Capture is
bounded and parses the request boundary before executing response steps.

The captured record exposes:

```text
method
target
HTTP version
ordered headers
body bytes
```

This allows adapter tests to assert:

- exact endpoint and model path;
- canonical native-owned request body;
- presence of the synthetic credential only at the approved destination;
- absence of renderer-authored fields;
- one HTTP dispatch for one provider attempt;
- no automatic second request after an outcome-unknown boundary.

### 3.3 Deterministic observations and checkpoints

The harness emits typed observations:

```text
request captured
bytes sent
checkpoint reached
write half closed
connection closed
scenario completed
```

A checkpoint blocks the server until the test releases the exact
`connection index + checkpoint name`. Releases that arrive early are retained
and consumed only by the matching checkpoint.

### 3.4 Current self-tests

The checked-in self-tests cover:

- exact request and synthetic-secret-canary capture;
- checkpoint stall and release without sleeps;
- arbitrary fragmentation inside a multibyte UTF-8 code point and SSE stream;
- deterministic coalesced, every-byte, fixed-size, seeded, and
  protocol-boundary fragmentation plans;
- exact replay from fixture revision, SHA-256, seed, and split offsets;
- fail-closed replay when fixture bytes, hash, offsets, or bounds do not match;
- generated fragment scripts preserving exact wire bytes and per-write
  observations;
- diagnostics containing only fixture metadata rather than raw fixture bytes;
- truncated final frame followed by clean EOF;
- fail-fast validation of duplicate checkpoints, writes after close, and
  response-header injection.

These tests prove the mock transport itself. They do not yet prove every
provider lifecycle outcome.

## 4. Fault catalogue

Every adapter must run the shared catalogue below. A scenario ID is stable and
should be included in test names and failure reports.

| ID | Injected boundary | Required assertion |
|---|---|---|
| `PF-001` | Before connection/request | No dispatch transition or provider acceptance |
| `PF-002` | Request captured, no response head | Result is not claimed non-billable unless native evidence proves no send |
| `PF-003` | `204 No Content` | Reject as protocol error; never complete |
| `PF-004` | `200` with non-SSE content type | Reject before streaming projection mutation |
| `PF-005` | Empty SSE body and clean EOF | Never complete |
| `PF-006` | Fragment at every byte boundary | Same normalized facts and projection as unfragmented stream |
| `PF-007` | Split inside UTF-8 code point | Reassemble losslessly; no replacement character or duplicate text |
| `PF-008` | Split inside CRLF/LF SSE delimiters | Decode exact frame sequence once |
| `PF-009` | Malformed UTF-8 or JSON | Fail closed with bounded sanitized error |
| `PF-010` | Frame exceeds configured bound | Abort with `provider_frame_too_large` |
| `PF-011` | Stream exceeds configured bound | Abort with `provider_response_too_large` |
| `PF-012` | Valid text then truncated frame | Preserve only committed partial text; never complete |
| `PF-013` | Clean EOF without adapter terminal evidence | `provider_stream_interrupted` or `outcome_unknown`, never implicit `stop` |
| `PF-014` | OpenAI finish reason without `[DONE]` | Complete only when the frozen adapter contract recognizes the non-null finish reason as terminal evidence |
| `PF-015` | Anthropic stop reason without `message_stop` | Never complete |
| `PF-016` | Gemini stream without finish reason | Never complete |
| `PF-017` | Event after terminal marker | Reject/audit; no second terminal fact |
| `PF-018` | Duplicate identical text events | Do not content-deduplicate unless producer identity proves replay |
| `PF-019` | Replay same durable producer event ID | No duplicate projection or usage |
| `PF-020` | Usage before, during, and after text | Durable per-attempt usage matches the accepted monotonic policy |
| `PF-021` | Provider error event mid-stream | Partial projection remains auditable; exact attempt fails/unknown once |
| `PF-022` | Error body/request-ID secret canary | No secret in error, event, journal, UI projection, or log |
| `PF-023` | Renderer notification failure | Provider execution and durable run outcome are unchanged |
| `PF-024` | Journal append fault before projection | Event and projection both roll back |
| `PF-025` | Projection mutation fault after append attempt | Event and projection both roll back |
| `PF-026` | Crash after durable event commit before renderer notify | Replay reconstructs the exact committed projection |
| `PF-027` | Cancel before HTTP poll | No request captured; terminal state proves predispatch cancellation |
| `PF-028` | Cancel after request capture, before headers | Do not claim provider rejection/non-billing without evidence |
| `PF-029` | Cancel after headers, before first event | Persist correct acceptance/ambiguity evidence |
| `PF-030` | Cancel after partial text | Preserve partial text and one interruption terminal fact |
| `PF-031` | Timeout/connection reset after possible send | Mark `outcome_unknown`; do not auto-retry without bound idempotency |
| `PF-032` | Two scripted connections after unknown outcome | Second connection occurs only after explicit permitted retry/new attempt |
| `PF-033` | Late event from old attempt | Cannot mutate new attempt or active projection |
| `PF-034` | Same attempt/input dispatched concurrently | Exactly one request reaches the mock server |
| `PF-035` | Restart during partial run | Fixed-cursor replay has no gap/duplicate and live tail begins after watermark |
| `PF-036` | Restart after terminal commit | Exactly one terminal event and stable final projection |
| `PF-037` | Rate-limit response with bounded retry metadata | Structured retry policy; no unsafe automatic resend |
| `PF-038` | Redirect to another origin | Reject; credential is not sent to redirected destination |
| `PF-039` | Oversized/stalled error body | Bounded termination with no unbounded allocation or hang |
| `PF-040` | Scenario carries prompt/credential canaries | Canary exists only in approved request capture, never durable diagnostics |

## 5. Provider-specific fixture families

Use small synthetic fixtures. Each logical transcript has an unfragmented
canonical variant plus seeded byte-boundary variants.

### OpenAI-compatible

Include:

- text delta;
- reasoning delta where supported;
- usage-only event;
- finish reason;
- `[DONE]`;
- error event;
- empty choice;
- multiple choices if intentionally supported or explicitly rejected.

Success requires terminal evidence recognized by the frozen adapter contract.
For the current OpenAI-compatible adapter, either a non-null finish reason or
`[DONE]` is accepted. Empty EOF with neither is never successful. The
finish-reason rule is adapter-versioned because compatible servers do not all
emit `[DONE]`.

### Anthropic

Include:

- `message_start`;
- content block start/delta/stop;
- thinking/reasoning delta;
- `message_delta` with stop reason and usage;
- `message_stop`;
- error event.

`message_stop` is required for success. Earlier stop/usage facts cannot silently
convert premature EOF into success.

### Gemini

Include:

- candidates with text parts;
- usage metadata;
- finish reason;
- safety/blocking terminal variants;
- empty candidate arrays;
- error body/stream variants.

Success requires the documented terminal candidate/finish evidence accepted by
the adapter version frozen for the attempt.

## 6. Lifecycle assertions

Transport assertions alone are insufficient. Each integrated test must inspect
native authoritative state.

For every scenario, assert as applicable:

1. exact run, attempt, frozen-input, provider, and model binding;
2. number of HTTP connections accepted by the harness;
3. durable event kinds and gap-free per-run sequence;
4. exact provider-event producer identity or explicit absence of one;
5. assistant text/reasoning projection;
6. usage projection and per-attempt ledger;
7. exactly one attempt/run terminal fact;
8. provider acceptance and request-ID evidence;
9. retry eligibility and idempotency evidence;
10. renderer notifications are downstream of durable commit;
11. fixed-watermark replay reproduces live projection;
12. no secret canary in persistent or renderer-facing surfaces.

The desired transaction boundary is:

```text
normalized provider fact
  -> append durable run event
  -> update exact attempt/message/usage projection
     in the same SQLite transaction
  -> commit
  -> best-effort renderer notification
```

The fault harness must be able to pause immediately before and after each
arrow. Storage-level failpoints are a separate layer from transport
checkpoints; both use stable names and deterministic release, never sleeps.

## 7. Failure classification oracle

The classification oracle must use observed evidence, not the error type alone.

```text
No dispatch evidence
  -> predispatch failure/cancelled-before-dispatch

HTTP may have been polled or request captured, no definitive acceptance
  -> outcome_unknown unless stronger evidence exists

Validated response headers/provider acceptance observed
  -> interrupted/failed after acceptance according to protocol evidence

Adapter terminal evidence durably committed
  -> complete/cancelled/failed exactly once
```

An outcome-unknown attempt is never automatically resent unless the exact
provider operation is protected by frozen, verified idempotency semantics.
Retry/fallback normally creates a new attempt and frozen input binding.

## 8. Seeded fragmentation and reduction

The checked-in `FragmentationPlan` takes canonical bytes and emits an immutable,
deterministic split plan. It supports:

- `coalesced`: one network body write;
- `every_byte`: one write per byte for fixtures that fit the bounded script;
- `fixed_size`: exact fixed-size chunks, including one-byte chunks;
- `seeded`: deterministic partitions derived from fixture revision, canonical
  bytes, strategy domain, and seed;
- `protocol_boundaries`: deterministic selection around UTF-8 continuation
  bytes, CR/LF and SSE delimiters, and JSON punctuation/string escapes;
- `replay`: exact recreation from previously recorded non-sensitive metadata.

`ProviderConnectionScript::fragmented_bytes(...)` converts a validated plan to
ordered exact-byte steps. The plan is bound to the canonical fixture through
SHA-256, and replay fails closed if the fixture, hash, offsets, ordering, or
bounded chunk count differs.

The generator is intentionally independent of operating-system randomness. A
seed is a replay identifier, not a source of entropy or a security primitive.
The same fixture revision, canonical bytes, strategy, and seed always produce
the same offsets.

On failure, the runner should report and persist only non-sensitive metadata:

```text
scenario ID
fixture revision/hash
seed
split offsets
provider family/adapter revision
expected and actual stable error/state codes
```

Current implementation stores the replay metadata in memory and exposes a
redacted `Debug` representation that contains no raw fixture body. A future
test-runner artifact writer should persist only the fields above plus adapter
revision and stable expected/actual codes.

The reducer is still planned. It should minimize split offsets and fixture
events while preserving the failure. Raw prompt, credential, private path, or
response body is not a normal diagnostic artifact.

## 9. Integration sequence

1. Keep the transport harness and self-tests green.
2. Replace one-shot TCP helpers in provider tests with shared scripted
   scenarios where useful; do not churn unrelated tests mechanically.
3. Wire adapter parser/stream conformance tests to the harness.
4. Finish exact attempt/input binding and native journal production wiring.
5. Add storage failpoints around event/projection transactions.
6. Add cancellation and possible-send ambiguity assertions.
7. Add restart/replay tests using a clean temporary profile.
8. Wire the implemented fragmentation plans into adapter conformance fixtures,
   then add a nightly expanded matrix and failure reducer.
9. Add secret-canary scanning across SQLite/WAL, events, renderer projections,
   diagnostic artifacts, and exports.
10. Only after the same-snapshot matrix passes may status documentation claim
    restart-safe, replay-safe, or billing-safe provider execution.

## 10. Current limitations

The checked-in harness is deliberately not described as complete provider E2E.

- It is a deterministic HTTP/1 transport mock, not a TLS stack or DNS proxy.
- It currently scripts sequential connections, not concurrent provider
  connections.
- It does not yet inject storage crashes or process termination.
- It does not by itself start a full prepared run through Tauri/AppState.
- Fragmentation generation and exact replay are implemented, but adapter-wide
  fixture matrices, persistent failure artifacts, and automatic reduction are
  not yet wired.
- Production gateway/journal integration is changing concurrently and must be
  verified on one stable snapshot.
- Live provider behavior remains a separate opt-in, budget-capped smoke lane;
  it is never a prerequisite for offline deterministic correctness.

These limits are intentional. The harness first provides a small, auditable,
deterministic boundary; broader network, storage, restart, and desktop E2E
layers compose above it.
