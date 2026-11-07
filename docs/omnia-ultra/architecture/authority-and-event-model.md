---
id: OMNIA-ULTRA-ARCH-AUTHORITY
title: Authority, event journal and projections
status: normative-target
depends_on: [docs/adr/0002-unified-kernel-execution-and-capabilities.md, docs/adr/0004-durable-run-event-journal-and-cursor-replay.md]
---

# Authority and event model

## Commit flow

~~~text
validate typed command
-> append durable fact
-> mutate exact projection in the same transaction
-> commit
-> publish committed cursor
-> notify clients best effort
~~~

## Invariants

- Renderer commands contain IDs and user intent, not authoritative provider
  payloads or privileges.
- Each command has idempotency and expected-version protection.
- Every mutation has a durable receipt.
- Client notification failure cannot fail a committed operation.
- Replay uses a fixed watermark/cursor.
- Projections can be rebuilt from facts.
- Recovery facts are separate from logical user intent.
- Outcome unknown is distinct from failed.
- Provider acceptance evidence is monotonic.

## Provider dispatch

prepareConversationRun produces a native-owned FrozenProviderInput bound to:

- conversation/branch/run/attempt;
- provider-definition revision;
- model profile revision;
- parameter profile revision;
- context snapshot;
- attachment binding;
- capability and approval policy;
- idempotency evidence.

The renderer sends only attemptId and frozenProviderInputId. Native reconstructs,
verifies and dispatches.

## One dispatch rule

One provider HTTP dispatch equals one provider attempt. A retry, fallback,
repair or changed model creates a new attempt unless exact same-attempt
idempotency evidence proves a safe transport retry.

