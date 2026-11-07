# ADR 0002: Unified kernel execution, capabilities, approvals, and audit

Status: Accepted for incremental implementation  
Date: 2026-08-13

## Context

Omnia is expanding from a chat desktop preview into one workbench for chat,
research, coding, browser operations, computer use, persistent machines, remote
clients, and future agents. Building a separate runtime for each surface would
duplicate policy and make permission behavior inconsistent. In particular, a
model must never be able to turn a broad intent such as "fix my machine" into
an unreviewed administrator operation.

The kernel therefore needs one transport-neutral contract before native IPC,
storage, browser brokers, or VM providers are wired. The same contract must be
usable from desktop, web, CLI, and Android clients.

## Decision

### 1. One unified kernel

Every action is represented by the same typed hierarchy:

```text
profile or project
  -> conversation
    -> branch
      -> optional task
        -> run
          -> provider attempt
            -> iteration
              -> item
```

Ordinary chat may attach a run directly to a branch; user-visible tasks are
created only for explicit goals, plans, or background work. Retries create
provider attempts and tool loops create iterations. Streaming messages, tool
calls, approvals, artifacts, and results create items. Clients project this
graph; they do not invent independent run semantics. Projectless chat is
profile scoped, and branch is a durable output-routing boundary rather than
UI-only metadata.

The current transport-neutral implementation represents
`run -> attempt -> iteration -> item`. A dedicated lifecycle ADR must still
define whether an attempt is one provider dispatch or one provider session
spanning multiple tool iterations. Until then, native schema/IPC must retain
the current meaning and must not perform an unreviewed migration between those
two interpretations.

### 2. Execution environments are explicit resources

An execution environment has:

- a requested mode: `auto`, `persistent`, `isolated`, or `remote`;
- one resolved concrete mode;
- a lifecycle (`preparing`, `ready`, `suspended`, `snapshotting`, `stopped`,
  or `failed`);
- a trust boundary;
- opaque mounts created from native grants;
- network, resource, and persistence policies;
- enabled capabilities and the policy-version hash that selected them.

Model-only chat or research has no execution environment. `Auto` creates an
environment lazily only after an approved tool plan establishes that execution
is required; a harmless prompt does not activate a host, sandbox, or remote
trust boundary merely because one is available.

`Auto` is a deterministic policy decision, not a model preference:

| Workload | Default resolution |
|---|---|
| Model-only chat/research without tools | None |
| Untrusted input or unknown code | Isolated |
| Stateful, long-running, host-integrated work | Persistent local |
| Privileged Windows operation | Persistent local, followed by exact approval |
| Explicit remote-only resource | Remote, but only on a destination allowlist |
| Ordinary trusted interactive task | Configured local default |

Auto never falls back to remote merely because it is available. Unknown code
and privileged host access must be split into separate stages.

### 3. Renderers pass opaque handles, never arbitrary paths

Workspace, network-drive, app-data, secret, DNS, and proxy resources cross the
client/kernel boundary as opaque native handles. Trusted host code resolves and
revalidates them at use time. A renderer-provided `C:\...` or UNC path is not a
capability.

### 4. The capability broker is fail-closed

The canonical capabilities are:

```text
pure_compute
read_app_data
read_workspace
write_workspace
execute_process
use_network
external_side_effect
control_browser
control_computer
request_admin
access_secret_handle
```

Each request binds the operation type, canonical-arguments hash, immutable tool
version hash, full capability-set hash, environment ID, resource handles,
destinations, executable hash, data classes, elevation flag, and subject
version. Grants are also bounded by these values and by a policy-version hash.

Only `pure_compute` is intrinsically safe. Other operations require an active,
constraint-matching grant. External side effects, computer control,
administrator requests, secret-handle access, and any elevated operation always
require a current exact approval even when a broader grant exists.

### 5. Approvals produce immutable receipts

An approval receipt is bound to:

- approval and capability request IDs;
- run and environment IDs;
- operation type and canonical-arguments hash;
- tool-version and capability-set hashes;
- policy-version hash;
- decision, expiry, and the corresponding audit event.

Changing any material operation, tool, capability set, environment, or policy
invalidates the approval. Passwords remain behind OS/browser secret boundaries;
receipts authorize using an opaque handle, never reading or exporting the
secret value. An `allow-once` receipt must be reserved atomically before an
operation begins, so concurrent workers cannot reuse it. Grant invocation
limits are checked and incremented in that same policy transaction.

### 6. Security-relevant facts use an append-only audit journal

Audit events are monotonically sequenced and hash-linked. The durable storage
implementation will compute hashes over a canonical envelope and commit the
event and state mutation in one transaction. Details are structured and
redacted before persistence. Audit records never contain prompts, credentials,
cookies, authentication headers, or raw secret values by default.

## Domain implementation

The first transport-neutral slice is implemented in:

- `src/domain/execution.ts`;
- `src/domain/kernel-capability.ts`;
- `src/domain/run-graph.ts`;
- `src/domain/kernel.test.ts`.

It deliberately performs no privileged operation and exposes no native IPC.
It is the invariant layer that future Rust services and clients must satisfy.

## Native follow-up gates

Native wiring is not complete until all of the following exist:

1. Transactional persistence for environments, capability requests, approvals,
   receipts, and audit events.
2. A Windows environment provider and at least one genuinely isolated provider;
   process naming alone is not isolation.
3. Host-side revalidation of handles immediately before each operation.
4. Windows UAC consent for administrator operations. SYSTEM or TrustedInstaller
   cannot be silently selected as a convenience mode.
5. Per-operation time, resource, process, network, and cancellation enforcement.
6. Crash recovery that never replays an ambiguous mutating operation.
7. Renderer-safe IPC DTOs that omit native paths and secrets.
8. Security, migration, property, and desktop E2E tests before advertising a
   capability through core protocol negotiation.

## Consequences

- Browser, IDE, computer-use, and machine work share one permission language.
- Auto selections and denials remain inspectable and reproducible.
- Approvals cannot be reused after material argument drift.
- Remote execution is an explicit privacy decision.
- More records are required, but policy and audit behavior do not fragment as
  new clients and executors are added.
