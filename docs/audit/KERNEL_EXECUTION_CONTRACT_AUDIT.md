# Omnia Kernel execution contract audit

Status: Architecture review; no execution capability is enabled by this document  
Reviewed: 2026-08-13  
Primary implementation reviewed: `src/domain/execution.ts`  
Related contracts reviewed: `src/domain/kernel-capability.ts`,
`src/domain/resource-handle.ts`, `docs/adr/0002-unified-kernel-execution-and-capabilities.md`,
and `docs/THREAT_MODEL.md`

## 1. Executive conclusion

The current TypeScript domain slice is a useful fail-closed prototype. It has
several strong decisions worth preserving:

- `Auto` does not silently fall back to a remote machine.
- Untrusted or unknown code cannot be combined with privileged host access in
  one stage.
- Renderer-originated raw paths are rejected in favor of opaque handles.
- Environment lifecycle transitions, resource budgets, destination lists, and
  capability lists receive basic validation.
- Administrator access remains a capability and approval concern, not a model
  preference.

It is not yet a safe kernel authority contract. The largest problem is not a
missing provider implementation; it is that placement, isolation, retention,
host trust, and user-facing mode are represented as one enum. Several other
authority-bearing values are not bound into an immutable environment revision,
and capability evaluation is not tied to the live environment state, mounts,
or network policy.

The contract must be revised before native IPC, persistent storage, remote
workers, terminals, browser control, or computer use advertise these
capabilities. Otherwise later implementations may be internally consistent
while enforcing different meanings for the same `environmentId`.

## 2. Stop-ship findings

### EXE-001 — Mode conflates placement, isolation, retention, and trust

Severity: P0 architecture and security boundary

The requested and concrete modes are currently:

```text
auto | persistent | isolated | remote
```

The concrete mode is then mapped to exactly one trust boundary:

```text
persistent -> trusted-local-host
isolated   -> isolated-sandbox
remote     -> managed-remote
```

This makes `persistent` mean both retained state and trusted local-host
execution. It also makes `remote` a trust boundary even though remoteness alone
does not prove isolation. The model can encode an isolated environment with a
resumable persistence policy, but it must call that environment `isolated`, not
`persistent`; the requested-mode language therefore remains ambiguous to UI,
policy, approvals, and telemetry.

This conflicts with the threat-model rule that persistent environments are not
inherently more trusted than isolated environments. It also prevents the
contract from naming common combinations directly:

- persistent local sandbox;
- persistent remote sandbox;
- disposable remote sandbox;
- host privilege broker without an agent shell;
- no execution environment for a model-only chat or research run.

Required change:

Separate the resolved plan into independent dimensions:

```text
placement: local | remote
boundary: none | host-broker | os-sandbox | vm-sandbox | managed-sandbox
retention: ephemeral | resumable | snapshot-backed
privilege: unprivileged | broker-only
```

`Auto`, `Persistent`, `Isolated`, and `Remote` may remain user-facing presets,
but the kernel must authorize and persist the resolved dimensions, not the
preset label.

### EXE-002 — Environment authority has no immutable configuration hash

Severity: P0 approval integrity

`ExecutionEnvironment` stores the selection-policy hash, but no immutable hash
covering the actual environment authority:

- owner profile, project, task, or run;
- provider and provider version;
- environment generation or revision;
- concrete boundary and attestation;
- mount handles, grant revisions, and permissions;
- network mode, destinations, proxy, DNS, and inbound policy;
- resource limits;
- retention and snapshot policy;
- enabled capabilities.

An approval currently binds an `environmentId` and policy/capability hashes,
but the same environment ID has no contract-level proof that its mounts,
network route, sandbox provider, or persistence policy are unchanged. This is
insufficient for exact approval and for cross-project isolation.

Required change:

Create an immutable `ResolvedExecutionPlan` or `EnvironmentRevision` with a
canonical `environmentConfigHash`. Every capability request, approval request,
approval receipt, run snapshot, audit event, and executor dispatch must bind
that hash and revision. Reconfiguration creates a new revision and invalidates
older authority.

### EXE-003 — Mount and network authority were ambient relative to capabilities

Severity: P0 capability-boundary violation — partially mitigated in the current
TypeScript contract

The original `createExecutionEnvironment` contract independently accepted:

- `enabledCapabilities`;
- mount permissions;
- network policy;
- resource budget.

It did not verify their relationships. A reproduced environment with only
`pure_compute` was accepted with:

- a workspace mount granting read, write, and execute;
- an outbound allowlist;
- inbound network enabled.

The constructor also does not require:

- `read_workspace` for a readable workspace mount;
- `write_workspace` for a writable workspace mount;
- `execute_process` for an executable mount;
- `use_network` for outbound network;
- a separate inbound/listener capability and endpoint scope;
- `read_app_data` for an app-data mount;
- host-only placement for a host app-data or network-drive grant.

Implemented mitigation:

- readable workspace/network-drive mounts now require `read_workspace`;
- app-data reads require `read_app_data`;
- writable mounts require `write_workspace`;
- executable mounts require `execute_process`;
- outbound network requires `use_network`;
- inbound listeners are rejected until a dedicated typed capability exists;
- app-data and network-drive mounts are restricted to the trusted persistent
  host boundary.

Remaining required change:

Mounts and routes must be host-resolved manifests, not renderer-authored
authority descriptions. The environment builder must derive or cross-check the
capability set, reject authority not represented by a capability, and clamp
resource limits against policy maxima. The broker must still revalidate each
handle and route immediately before use.

### EXE-004 — Capability evaluation is detached from live environment state

Severity: P0 dispatch authorization

`evaluateKernelCapability` receives an arbitrary array of environment
capabilities. It does not receive or resolve the authoritative environment
revision. Consequently, the policy function cannot prove that the environment:

- is `ready` rather than preparing, suspended, stopped, failed, or lost;
- still has the expected configuration hash;
- owns the requested resource handles;
- permits the requested destination;
- remains within its lease and resource budgets;
- has a current sandbox attestation;
- belongs to the correct profile, project, run, agent, or client session.

An active grant for `use_network` can therefore match a destination even when
the environment's own network allowlist does not contain that destination, if
the caller passes a matching capability array.

Required change:

The broker must evaluate against an authoritative, revisioned environment
record loaded in the same policy transaction. Dispatch requires a `ready`,
healthy, unexpired environment revision, matching configuration and capability
hashes, live handle revalidation, route revalidation, budget reservation, and
an audit pre-event before the effect begins.

### EXE-005 — Destination normalization is not a security URL policy

Severity: P0 network and remote-execution boundary

The current destination normalizer trims, lowercases the entire string, rejects
`*`, and removes one trailing slash. This is unsuitable for security decisions:

- URL paths and queries can be case-sensitive but are lowercased.
- Scheme, host, port, origin, path, and query are not represented separately.
- Non-URL strings are accepted.
- IDNA, IPv4/IPv6 normalization, default ports, user-info, fragments, and
  encoded delimiters are not handled.
- DNS resolution, rebinding, mixed public/private answers, link-local and cloud
  metadata ranges, redirects, and origin changes are not represented.
- Exact string comparison makes policy behavior depend on incidental query or
  trailing-slash formatting.
- `brokered` mode is not semantically distinct in
  `environmentAllowsDestination`; it still performs the same allowlist lookup.

Required change:

Use a typed endpoint policy. At minimum it should identify scheme, canonical
host, explicit/effective port, allowed path policy, redirect policy, resolved
address class, DNS resolution epoch, proxy/DNS route, and credential-binding
origin. Normalize only the components whose standards make normalization safe.
The network broker must re-resolve and revalidate at connection and redirect
boundaries.

### EXE-006 — Mode selection is a forgeable hint rather than an authority receipt

Severity: P0 environment creation integrity

`createExecutionEnvironment` accepts a public `ExecutionModeSelection` value.
It does not receive the original requirements or policy and cannot revalidate
that the selection was actually produced by `resolveExecutionMode`.

The selection also omits the remote destination, requirements hash, provider,
mount plan, network plan, budget plan, and persistence plan. A caller can use a
valid remote selection and create a different route policy, or use a selection
for durable work with an ephemeral environment.

Required change:

Mode resolution should produce a host-owned, immutable resolved-plan receipt
with a requirements hash and every authority-bearing sub-plan hash. Native
creation must consume the exact plan or re-run resolution inside the trusted
boundary. Renderer DTOs may request preferences; they must not construct
resolved authority.

### EXE-007 — Unknown code can select a remote environment without an isolation proof

Severity: P0 sandbox boundary

In `Auto`, `requiresRemoteEnvironment` is evaluated before unknown or untrusted
code. Remote validation rejects host integration, but it does not require a
sandbox level or provider attestation. `managed-remote` therefore means only
placement/management, not a tested isolation boundary.

Required change:

Remote providers must advertise independently verified isolation capabilities.
Unknown code requires a provider satisfying the sandbox policy whether its
placement is local or remote. If no qualifying provider is available, selection
fails closed.

## 3. High-priority correctness findings

### EXE-008 — `mixed` trust defaulted to the trusted host

Severity: P1 unsafe default — mitigated in the current TypeScript contract

`ExecutionRequirements.inputTrust` supports `mixed`. The initial contract only
treated literal `untrusted` as unsafe, so mixed-trust work could land on the
trusted host.

Implemented mitigation:

`Auto` now resolves mixed-trust work to isolation, and an explicit persistent
request for mixed-trust input is rejected. A future staged plan may import only
explicitly trusted outputs into a separately approved host-integrated phase.

### EXE-009 — Snapshot-on-suspend can be bypassed

Severity: P1 recovery and data loss

The lifecycle allows `ready -> suspended` directly even when
`snapshotOnSuspend` is true. It also allows a suspended environment to stop
without a snapshot receipt. Persistence policy contains no snapshot ID,
revision, digest, completion receipt, retention ledger, or restore provenance.

Additional inconsistencies include:

- a resumable environment can request snapshot-on-suspend with a maximum
  snapshot count of zero;
- a persistent-mode environment is forced to `resume` and cannot choose the
  explicit `snapshot` policy;
- maximum snapshot count is validated only at construction and does not
  participate in transitions.

Required change:

When policy requires a snapshot, suspension must follow a durable sequence such
as `ready -> snapshotting -> suspended`, and the final transition must carry a
verified snapshot receipt. Stop/reset/restore must have similarly explicit
receipts and retention enforcement.

### EXE-010 — Lifecycle transitions have no optimistic concurrency control

Severity: P1 race and recovery

Environment records have no state revision, event sequence, expected revision,
operation correlation ID, or idempotency key. Two actors can transition the
same `ready` snapshot to different states and let storage last-write win.

Required change:

Every mutation must use compare-and-swap on the environment revision and append
the transition event transactionally. Creation, suspend, snapshot, resume,
stop, failure, and restore operations need idempotency and correlation IDs.

### EXE-011 — Failed environments cannot reach a cleanup receipt

Severity: P1 resource leakage and audit completeness

`failed` is terminal. The contract cannot represent quarantining, terminating,
or confirming cleanup after a provisioning, snapshot, or runtime failure. A
remote provider can therefore fail while the local projection has no lifecycle
state for pending wipe, lease expiry, or lost contact.

Required change:

Separate health from lifecycle, or add states and operations such as
`degraded`, `lost`, `quarantined`, `restoring`, `terminating`, and `stopped` with
typed cleanup/wipe receipts. A failure may stop work, but it must not make
cleanup unrepresentable.

### EXE-012 — No-execution selection is now represented; native authority remains open

Severity: P1 least authority

The renderer/domain selection contract now returns an explicit `selectedMode:
"none"` result when a tool-free run does not require an execution environment.
This keeps pure chat or research outside an unnecessary execution trust
boundary. The behavior is covered by `src/domain/kernel.test.ts` and is still a
selection contract, not native execution authority.

Remaining change:

Keep environment creation lazy and tied to the first approved tool plan, then
carry the `none`/concrete distinction through native planning, receipts,
telemetry, and packaged runtime evidence before treating this item as fully
verified.

### EXE-013 — Consideration records describe availability, not eligibility

Severity: P1 inspectability

The selection result reports all available providers as `eligible`, even when
the workload constraints would cause explicit validation to reject that mode.
For example, persistent can be reported eligible for unknown code solely
because its provider is available.

Required change:

Each candidate must record requirement-level eligibility, policy decision,
provider evidence, and exact rejection reasons. The selected plan and the UI
inspector must be projections of the same decision record.

### EXE-014 — Generic opaque handles are kind-confusable

Severity: P1 authority typing

The syntactic opaque-handle validator prevents raw paths, which is valuable,
but a handle's prefix is not checked against the expected resource kind. A DNS
profile field can accept a workspace-grant handle, and a mount's declared
`source` is not matched to its handle kind.

Required change:

Use branded handles or structured references containing at least `kind`, `id`,
and `revision`. The native broker must resolve a handle with an expected kind
and owner scope; a syntactically valid handle of the wrong kind must fail.

### EXE-015 — Validator results are checked but raw values are persisted

Severity: P1 canonical hash and signature drift

Several validators return canonical values, but the execution contract ignores
those return values. Reproductions confirmed:

- an uppercase SHA-256 policy hash is accepted but stored uppercase;
- a padded proxy handle is accepted after validation but stored with spaces;
- a syntactically valid handle of the wrong kind is stored unchanged.

This can produce byte-level mismatch between approval hashes, audit signatures,
storage uniqueness, and client projections.

Required change:

Persist validator return values, not original inputs. Canonicalization must be
defined once and used before hashing, comparison, storage, signing, and display.

### EXE-016 — Inbound network authority is a Boolean

Severity: P1 remote access boundary

`allowInbound` does not identify a bind interface, protocol, port, peer,
authentication method, exposure duration, tunnel, revocation condition, or
remote-client grant. An environment can enable it without a dedicated
capability or approval.

Required change:

Inbound access must be a separate, typed listener/tunnel capability with exact
endpoint and peer scope, authentication, expiry, activity indicator, revocation,
and audit linkage. It must not be inferred from ordinary `use_network`.

### EXE-017 — Resource budgets are declarations, not enforceable reservations

Severity: P1 denial of service and cost control

Budgets are checked only for integer shape. They have no policy maxima,
parent/child hierarchy, reservation/consumption ledger, renewal semantics,
currency/provider cost budget, or executor enforcement proof. Network-enabled
environments can also declare zero network bytes, while offline environments
can declare a positive network budget.

Required change:

Resolve budgets against policy and parent run/agent budgets. Reserve them
transactionally, expose consumption events, enforce them in the executor, and
carry a terminal reason when a limit is reached.

## 4. Shared primitive and integration findings

### EXE-018 — Timestamp validation was not strict ISO-8601 validation

Severity: P1 ordering and expiry correctness — mitigated in the shared TypeScript
domain validator

The original shared validator relied on `Date.parse`, which accepts non-ISO
strings such as `0`, `August 13, 2026`, and `2026-08-13 00:00:00` depending on
runtime behavior.

Implemented mitigation:

The shared validator now requires an ISO-8601 date-time with an explicit `Z` or
numeric offset and rejects locale/numeric dates. Durable ordering still needs a
monotonic sequence; wall-clock time alone is not a concurrency primitive.

### EXE-019 — Runtime enum validation is incomplete

Severity: P1 IPC boundary hardening

TypeScript unions do not validate deserialized data. Several constructors rely
on static types. A forged `ExecutionModeSelection` with an unknown mode can
reach the fallback branch of `expectedTrustBoundary`, and capability values are
deduplicated without a runtime allowlist check in the environment constructor.

Required change:

Validate every enum, discriminant, Boolean, and numeric field at the trusted
boundary with unknown-field rejection. Native DTO schemas and generated client
types should derive from the same versioned protocol definition.

### EXE-020 — Capability requests do not bind the full execution lineage

Severity: P1 delegation and replay scope

The kernel capability request binds a run and environment, but not the attempt,
iteration, tool-call item, agent/subagent identity, profile, authenticated
client session, or environment configuration revision. These omissions matter
for parallel attempts, child agents, steering, and remote clients.

Required change:

Bind the exact execution lineage and authenticated decision actor required by
the threat model. Child-agent delegation must be a subset of parent authority,
and the receipt must not become reusable merely because two operations share a
run and environment ID.

### EXE-021 — No durable kernel repository exists yet

Severity: P0 implementation gate

The current SQLite schema and Rust repository do not yet persist the new kernel
environment records, environment revisions, leases, snapshots, capability
requests/evaluations, immutable approval receipts, single-consumption ledger,
or corresponding transactional audit mutations.

Required change:

Do not advertise these capabilities through core negotiation until native
storage can atomically:

1. load and compare the current environment revision;
2. reserve budget and an allow-once receipt or grant invocation;
3. append the pre-dispatch audit event;
4. commit the authorization decision;
5. dispatch through a supervised executor;
6. append terminal effect and cleanup facts without guessing ambiguous remote
   outcomes.

## 5. Recommended target contract

The exact names can change, but the authority shape should resemble:

```ts
interface ResolvedExecutionPlan {
  readonly id: ResolvedExecutionPlanId;
  readonly requirementsHash: Sha256;
  readonly policyVersionHash: Sha256;
  readonly owner: {
    readonly profileId: ProfileId;
    readonly projectId?: ProjectId;
    readonly taskId?: TaskId;
    readonly runId: RunId;
  };
  readonly placement: {
    readonly kind: "local" | "remote";
    readonly providerId: EnvironmentProviderId;
    readonly providerVersionHash: Sha256;
    readonly remoteEndpoint?: CanonicalEndpoint;
  };
  readonly boundary: {
    readonly kind: "none" | "host-broker" | "os-sandbox" | "vm-sandbox";
    readonly attestationRef?: AttestationHandle;
  };
  readonly retention: {
    readonly kind: "ephemeral" | "resumable" | "snapshot-backed";
    readonly snapshotPolicy?: SnapshotPolicy;
  };
  readonly privilege: "unprivileged" | "broker-only";
  readonly mounts: readonly ResolvedMount[];
  readonly network: ResolvedNetworkPolicy;
  readonly budgets: ResolvedHierarchicalBudget;
  readonly enabledCapabilities: readonly KernelCapability[];
  readonly environmentConfigHash: Sha256;
}

interface EnvironmentRevision {
  readonly environmentId: ExecutionEnvironmentId;
  readonly revision: number;
  readonly planId: ResolvedExecutionPlanId;
  readonly environmentConfigHash: Sha256;
  readonly lifecycle: ExecutionLifecycle;
  readonly health: ExecutionHealth;
  readonly leaseExpiresAt: IsoUtcTimestamp;
  readonly snapshotRevision?: number;
  readonly lastEventSequence: number;
}

interface CapabilityDispatchContext {
  readonly request: KernelCapabilityRequest;
  readonly environmentId: ExecutionEnvironmentId;
  readonly expectedEnvironmentRevision: number;
  readonly environmentConfigHash: Sha256;
  readonly attemptId: AttemptId;
  readonly iterationId?: IterationId;
  readonly toolCallItemId: RunItemId;
  readonly agentId: AgentId;
  readonly authenticatedClientSessionId: ClientSessionId;
}
```

Important properties of this shape:

- a UI preset is not an authority token;
- remote placement does not imply a sandbox;
- persistence does not imply trusted-host access;
- configuration changes create new hashes and revisions;
- every dispatch is checked against live environment state;
- no-effect chat can use no environment;
- privilege remains a narrow broker operation rather than a shell mode.

## 6. Required deterministic regression gates

At minimum, add tests with the following intent:

```text
auto_toolless_run_returns_no_environment
persistent_local_sandbox_is_representable
persistent_remote_sandbox_is_representable
mixed_trust_defaults_to_isolation_or_staged_plan
unknown_remote_code_requires_sandbox_attestation
selection_receipt_rejects_changed_network_or_retention_plan
environment_config_hash_changes_for_every_authority_field
environment_owner_scope_prevents_cross_project_reuse
pure_compute_rejects_workspace_mount_and_network_authority
read_only_capability_rejects_writable_or_executable_mount
network_route_requires_use_network_capability
inbound_listener_requires_separate_exact_capability
handle_kind_mismatch_is_rejected
destination_parser_preserves_case_sensitive_path
destination_parser_rejects_userinfo_invalid_scheme_and_metadata_ip
dns_rebind_or_redirect_origin_change_invalidates_authority
brokered_destination_requires_broker_receipt
snapshot_on_suspend_requires_verified_snapshot_receipt
snapshot_count_zero_rejects_snapshot_on_suspend
stale_environment_revision_transition_conflicts
failed_environment_can_reach_audited_cleanup
capability_dispatch_rejects_non_ready_environment
capability_dispatch_rejects_changed_environment_config_hash
capability_dispatch_rejects_destination_outside_environment_policy
capability_dispatch_revalidates_handle_kind_owner_and_revision
child_agent_cannot_exceed_parent_environment_or_budget_scope
strict_timestamp_rejects_locale_and_non_utc_forms
canonical_validator_outputs_are_the_persisted_values
crash_between_authorization_and_dispatch_has_unambiguous_recovery
remote_outcome_unknown_is_never_replayed_automatically
```

Property and fault-injection suites should additionally cover concurrent
suspend/stop/snapshot operations, receipt reservation races, environment lease
expiry, provider loss, snapshot corruption, DNS changes, redirect changes,
budget exhaustion, cancellation, and native process crashes at each transaction
boundary.

## 7. Verification performed for this audit

Focused runtime reproducers confirmed that the current constructor accepts a
`pure_compute` environment with read/write/execute mount authority and inbound
or outbound network policy, and that canonical validator return values are not
always stored.

The current shared-tree verification after the contract hardening passes:

```text
npm run typecheck
  passed

npx vitest run src/domain/kernel.test.ts src/domain/domain.test.ts
  34 passed

npx vitest run src/features/workspace/run-graph-projection.test.ts
  6 passed

npx vitest run
  23 test files passed, 144 tests passed

cargo check --manifest-path src-tauri\\Cargo.toml --all-targets
  passed; existing dead-code/deprecation warnings remain while Phase 2 native
  modules are not yet wired into production IPC

cargo fmt --manifest-path src-tauri\\Cargo.toml --all --check
  passed

npm run build
  passed; Vite reports the existing large-bundle advisory
```

`git diff --check` passed for the reviewed source and audit files. The remaining
architecture findings above are intentionally not claimed as solved by these
focused domain gates.

This audit intentionally does not add native IPC, process execution, browser
control, remote access, administrator operations, or persistence. Those remain
blocked by the architecture, storage, policy, security, and E2E gates above.
