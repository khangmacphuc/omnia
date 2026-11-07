---
id: OMNIA-ULTRA-OBS-RETRY
title: Retry, fallback, repair and outcome-unknown policy
status: normative-target
schema: schemas/retry-policy.schema.json
---

# Retry and fallback

Deterministic safety classification precedes any AI retry advisor.

## Default status policy

- 400 invalid request: validate and repair once if deterministic; do not blind retry.
- 401 authentication: refresh or use an explicitly configured credential profile;
  do not repeat the same invalid key.
- 402 quota: pause, notify and optionally use an approved fallback provider/model.
- 403 permission: do not repeat; check access or choose an allowed route.
- 408 timeout: retry only with safe acceptance/idempotency evidence.
- 409 conflict: provider-specific transient classification.
- 422 validation: repair or ask user, no blind retry.
- 425 too early: retry after delay.
- 429 rate limit: honor Retry-After/reset and backoff with jitter.
- 500/502/503/504: retry with backoff and health-aware fallback.
- DNS/TLS/security/policy failures: ask or stop unless explicitly transient.
- truncated/empty stream: retry only when billing/acceptance safety is known.

## Default schedule

~~~text
1s, 3s, 5s, 10s, 15s, 30s, 60s, 120s, 300s, 600s, 900s
~~~

After the initial schedule, cap individual waits at 15 minutes with jitter. Honor
a provider Retry-After even when longer. Default maximum elapsed retry window is
24 hours and is configurable by provider/project/task.

## AI retry controller

The AI advisor may choose among exact retry, wait, reduce concurrency, switch
route, refresh auth, compress context, split attachment, select a bridge,
repair payload, re-prompt, ask user, stop or mark outcome unknown.

It must:

- explain the decision;
- preserve semantic intent;
- show diff for a repaired prompt/payload;
- create a new attempt for semantic changes;
- never override deterministic auth/permission/security rules;
- never duplicate a paid or external side effect without evidence;
- never silently send data to an unapproved provider.

## Outcome unknown

If a provider may have accepted a request but local terminal evidence is missing:

- append outcome_unknown;
- do not automatically treat it as failed;
- do not blindly resend;
- show billing/duplicate-risk warning;
- allow user-confirmed recovery or provider-supported idempotent retry.

## Inline error

At the failed request show status, normalized error, retry count, countdown,
last attempt, next action, Retry now, Stop, Change model/provider, Repair prompt,
Open logs and billing-safety status. The error remains in the transcript.

