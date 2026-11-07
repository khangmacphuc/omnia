# Observability, proof receipts, and replay

Status: proposed contract.

## 1. Trace shape

Every pointer/browser/native action must be traceable from user intent to observed outcome:

```text
user_command
  -> goal/plan/task/run
  -> pointer_intent
  -> policy_decision
  -> approval
  -> target_snapshot
  -> pointer_dispatch
  -> target_acknowledgement
  -> screenshot/dom/uia observation
  -> verification predicate
  -> artifact/audit receipt
```

Every record has:

- `trace_id`;
- `parent_span_id`;
- `run_id`;
- `agent_run_id`;
- `target_binding_hash`;
- `machine_id/generation` when applicable;
- start/end timestamps;
- status;
- redacted parameters;
- error/retry state;
- evidence references.

## 2. Pointer action receipt

```json
{
  "receiptVersion": 1,
  "actionId": "opaque",
  "intent": "invoke_save",
  "transport": "NativeUia",
  "target": { "scopeHash": "opaque", "windowGeneration": 4 },
  "anchor": { "role": "button", "name": "Save", "fingerprint": "opaque" },
  "approval": { "decision": "approved", "scope": "task" },
  "dispatch": { "startedAt": "...", "endedAt": "...", "result": "accepted" },
  "observation": { "kind": "uia_snapshot", "capturedAt": "...", "hash": "opaque" },
  "verification": { "predicate": "document_saved", "result": "verified" },
  "overlay": { "pointerId": "opaque", "frameId": "opaque" }
}
```

The example is illustrative; secrets, raw credentials, and unredacted document content never belong in a receipt.

## 3. Visual evidence

For visual actions, capture:

- before frame or DOM/AX snapshot;
- action overlay frame showing intended target;
- after frame or semantic observation;
- frame age and transform;
- redaction mask;
- hash and retention class.

If visual capture is unavailable, store the reason and use semantic evidence where policy allows. Never fabricate screenshots in tests or claim a pixel-level action passed without an actual frame.

## 4. Metrics

Track per action and aggregate:

- intent-to-dispatch latency;
- dispatch-to-ack latency;
- ack-to-verification latency;
- frame capture latency;
- target rebind count;
- stale-anchor rate;
- human-interference rate;
- semantic vs coordinate transport ratio;
- action success/unknown/failure rate;
- isolated-runtime startup time;
- remote frame FPS, bitrate, dropped frames, jitter;
- CPU/GPU/memory overhead of overlays;
- physical-cursor invariant violations (must remain zero).

For browser sessions also track:

- DOM/AX query latency;
- screenshot freshness;
- background throttling incidents;
- navigation/document epoch changes;
- network request correlation.

## 5. Replay and redaction

Replay is a deterministic diagnostic mode, not a side-effect authorization. A replay may:

- show pointer intent and overlay path;
- re-render a captured frame;
- inspect a frozen DOM/UIA snapshot;
- re-run a dry-run verification.

Live redispatch requires a new approval and a fresh target binding. Redaction must apply before remote export, model context inclusion, and ordinary UI projection.

## 6. User-facing inspector

The background-task inspector should show, with collapsed historical rows and an expanded current row:

- target window/tab/process;
- transport and reason code;
- virtual pointer position/anchor;
- current input and output;
- action status;
- frame freshness;
- model/provider/effort for the controlling request;
- tools, tokens, RPM/TPM, cost, and elapsed time;
- approval and policy decisions;
- retries and errors;
- trace/evidence links.

The inspector must distinguish “planned”, “dispatched”, “observed”, and “verified” states visually and to a screen reader.

