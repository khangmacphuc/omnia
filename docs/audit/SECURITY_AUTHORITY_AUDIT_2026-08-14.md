---
id: OMNIA-AUDIT-SECURITY-AUTHORITY-2026-08-14
title: Security and authority audit for resilient run control
status: audit
last_reviewed: 2026-08-14
---

# Security and authority audit: resilient run control

## Scope and result

This audit covers the requested Pause, Resume, no-text Continue, immutable
Edit, Retry, Branch, Fork, Clone, Compare, scheduler and agent-continuation
behaviour. The result is **partial implementation with strong reusable
authorization primitives, but without a complete durable run-control product
surface**. The goal pack must not claim that pause/replay preserves authority
or that all requested controls are already shipped.

## Verified reusable protections

- Tool invocation contracts bind an invocation to agent, run, branch,
  environment, immutable tool/version/capability hashes, exact argument hash
  and idempotency-key hash when the tool explicitly supports it. The dispatcher
  revalidates mutable authority immediately before execution and makes
  `outcome-unknown` terminal. See
  [agent-tool-dag.ts](../../src/domain/agent-tool-dag.ts).
- The capability evaluator uses exact approval receipt data including subject,
  operation arguments, tool version, capability/policy hashes, destinations,
  resource handles, expiry and consumption. Model output remains input, not
  authority. See [kernel-capability.ts](../../src/domain/kernel-capability.ts).
- The native exact-approval broker maintains receipt/reservation usage and
  revalidates expiry and binding before dispatch. See
  [exact_approval_broker.rs](../../src-tauri/src/exact_approval_broker.rs).
- Persistent-machine resume requires explicit exclusion of temporary
  approvals/grants, administrator state, raw secrets, browser/network
  sessions and processes. It rejects policy, capability, mount, network,
  owner-scope, machine-generation and outcome-unknown drift. See
  [machine-runtime.ts](../../src/domain/machine-runtime.ts).
- The domain run state and journal already model `paused`, `run.paused`,
  `run.resumed`, checkpoints and `attempt.outcome_unknown`; this is a useful
  foundation, not proof of complete UI/native orchestration. See
  [run.ts](../../src/domain/run.ts) and
  [run-event-journal.ts](../../src/domain/run-event-journal.ts).

## Focused evidence run

On August 14, 2026, the following focused domain suite completed successfully:

```text
npm run test -- src/domain/agent-tool-dag.test.ts src/domain/kernel.test.ts src/domain/machine-runtime.test.ts

3 test files passed
45 tests passed
```

This verifies the cited domain contracts only. It does not prove a packaged
desktop build, native broker integration, remote control, or the requested
end-to-end run-control UI.

## P0 gaps closed in the normative target

The new [authority-continuity-and-replay.md](../omnia-ultra/security/authority-continuity-and-replay.md)
contract closes these design gaps before implementation proceeds:

1. **Intent is not authority.** A journaled control operation, a model,
   agent, queue record, old checkpoint or learned route cannot dispatch an
   effect. The broker performs fresh exact-target evaluation immediately before
   every provider/tool/browser/machine/remote/Git/scheduler/privileged action.
2. **Historical replay does not revive credentials.** Exact-historical retry
   may reproduce permitted content/configuration evidence but cannot resurrect
   expired grants/receipts, raw or opaque secret access, cookies, remote
   sessions, trusted-install state or elevation.
3. **Unknown effect is not failure.** `outcome-unknown` blocks automatic replay
   of non-idempotent or visible effects until an authoritative status check,
   exact local receipt, user decision or documented compensation/reconciliation
   path resolves it.
4. **Lineage does not transfer power.** Branch, fork, clone, compare, merge,
   scheduled work and inter-agent messages transfer selected content/evidence,
   not active approvals, secret bindings, leases, locks, sessions or privileged
   handles.
5. **The user sees the truth.** Historical authority and current effective
   evaluation must be rendered separately, including target, policy result,
   expiry, scope reduction, approval requirement and effect/reconciliation
   state.

## Implementation gate

Before enabling any executable Run-control UI, implement and prove all of the
following in one native transaction and durable journal:

- a typed authority-continuity record referenced by every control receipt;
- compare-and-swap on state/branch/run epoch, plus idempotency for duplicate
  client/automation/recovery delivery;
- fresh broker evaluation at each external dispatch, never at button-click
  alone;
- separate transport retry from semantic retry/fallback/repair, with adapter
  evidence for same-attempt idempotency;
- explicit state/reconciliation lifecycle including `outcome-unknown`;
- redacted receipt/projection/export rules that retain hashes/provenance but
  never expose secret material;
- negative tests for expiry, revocation, policy/environment/target drift,
  remote device revocation, provider ambiguity, duplicate message/push/write,
  branch/fork/agent authority leakage and restart during a side effect.

## Current limitation

The codebase has many domain-level foundations and tests, but it must not be
represented as having a finished persistent Pause/Resume/no-text Continue,
state-base Retry, live Branch/Fork/Compare or authority-continuity UI. Those
features remain planned until the transaction, broker, native commands,
renderer projections, recovery paths and acceptance tests are wired together.

## Related contracts

- [approvals-sandbox-secrets.md](../omnia-ultra/security/approvals-sandbox-secrets.md)
- [hard-boundaries.md](../omnia-ultra/security/hard-boundaries.md)
- [authority-and-event-model.md](../omnia-ultra/architecture/authority-and-event-model.md)
- [run-control-edit-retry.md](../omnia-ultra/interaction/run-control-edit-retry.md)
- [branching-copy-fork.md](../omnia-ultra/interaction/branching-copy-fork.md)
- [queue-steer-schedule.md](../omnia-ultra/interaction/queue-steer-schedule.md)
- [run-control operation schema](../omnia-ultra/schemas/run-control-operation.schema.json)
