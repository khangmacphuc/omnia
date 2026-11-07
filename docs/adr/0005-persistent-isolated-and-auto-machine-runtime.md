# ADR 0005: Persistent, isolated, remote, and Auto machine runtime

Status: proposed contract; no shipped machine-capability claim  
Date: 2026-08-13  
Owners: Omnia Kernel, security, storage, Windows runtime, remote runtime

## Context

Omnia needs one execution model for chat tools, coding agents, risky parsers,
long-running research, local services, remote/GPU work, and future desktop/web/
CLI/Android clients. The user-facing default is `Auto`, with explicit
`Persistent`, `Isolated`, and `Remote` choices. A high-quality implementation
cannot reduce those choices to process names or UI labels.

The existing kernel contract already separates environment selection from
capability/approval evaluation and includes mounts, network policy, resource
budgets, persistence policy, and a small lifecycle. This ADR adds the machine
resource below that environment contract: provider evidence, ownership,
generation fencing, leases, attestation, snapshots, drift, recovery, and
deterministic reuse.

This design follows the project's normative threat model and the clean-room
harness research. It does not claim that any Windows sandbox provider is wired,
that escape resistance has been demonstrated, or that remote execution is
available.

## Decision

### 1. Environment, machine, lease, and operation are different identities

```text
ExecutionEnvironment
  policy-facing contract for mode, capabilities, mounts, network, budgets

MachineInstance
  provider-owned compute resource implementing one environment generation

MachineLease
  exclusive, expiring binding of one run to one machine generation

Tool/operation invocation
  separately evaluated capability request and, when needed, exact approval
```

An environment ID is not a reusable OS handle. A machine ID does not authorize
an operation. A lease does not grant a capability. An approval does not make a
machine compatible. Dispatch requires every boundary to agree.

### 2. `Auto` is deterministic, inspectable, and authority-neutral

`Auto` resolves a mode from frozen workload requirements and policy:

| Workload signal | Resolution |
|---|---|
| No tool or machine execution required | No machine |
| Unknown code, mixed/untrusted input, risky parser or package/build script | Isolated |
| Trusted project state, long-running local work or explicit host integration | Persistent |
| Resource exists only at an approved remote destination | Remote |
| Unknown trust or insufficient provider evidence | Isolated if enforceable; otherwise stop |

Selection must emit reason codes and a consideration for every mode/candidate.
It never changes a mount, network route, capability, approval, privilege level,
remote destination, or privacy decision merely to make a task succeed.

Reuse is a second deterministic decision after mode selection. A persistent
candidate is reusable only when all of the following match exactly:

```text
owner scope
machine template
base image
runtime adapter
effective policy
capability set
mount set
network policy
provider attestation
drift status
machine lifecycle
```

Candidate mismatch causes a new machine or a user-visible stop; there is no
best-effort widening. Isolated and remote instances are not pooled in this
contract. Pooling may be introduced only with a separately implemented and
tested zeroization receipt.

### 3. Ownership is never global

Persistent machines are owned by exactly one profile plus project or
conversation. They are not silently shared across projects, profiles, branches,
or unrelated chats. Projectless long-lived work may use conversation ownership.

Isolated machines are run-scoped by default. Data promoted out of an isolated
machine becomes a separately scanned, hashed artifact or an expected-hash patch;
the host never consumes an unreviewed writable machine directory directly.

Remote machines retain the same Omnia owner scope and add an authenticated,
policy-allowed remote destination. The remote transport, device keys, pairing,
and screen/CLI control protocol are specified separately.

### 4. Providers are explicit and evidence-backed

Initial Windows provider targets are:

| Provider | Allowed mode in this contract | Notes |
|---|---|---|
| Windows Sandbox adapter | Isolated | Disposable baseline; no retained state; capabilities depend on supported Windows edition/configuration and verified policy translation |
| Hyper-V VM adapter | Persistent or isolated | Preferred long-lived Windows boundary; uses versioned base images and explicit snapshot/checkpoint semantics |
| Hyper-V-isolated container adapter | Isolated | Optional workload-specific boundary, never assumed equivalent to a general desktop VM |
| Managed remote VM adapter | Remote | Requires mutual authentication, destination/privacy policy, retention and wipe receipts |

WSL distributions and ordinary Windows child processes are not an isolation
boundary for hostile code in this ADR. Job objects, low-privilege tokens,
restricted environment blocks, and process-tree cancellation remain necessary
defense in depth, but do not by themselves justify the label `isolated`.

Provider registration is declarative and content-addressed. The runtime adapter,
base image, template, platform translation, conformance-suite version, and
effective policy are hashed. An unavailable feature or failed translation is a
hard failure, not a warning followed by weaker execution.

### 5. No machine starts with ambient host authority

A passing `MachineAttestation` proves at minimum:

- standard-user execution token and no administrator token;
- no ambient host profile or drive mount;
- no ambient secret handle;
- clipboard, device bridges and inbound listeners disabled;
- mount and network policy successfully translated and applied;
- process/job/resource limits applied;
- provider health and boundary-specific probes passed;
- exact hashes for adapter, base image, effective policy, capabilities, mounts,
  network, and evidence bundle;
- an expiry time.

Administrator, SYSTEM, TrustedInstaller, browser-vault, password-database,
cookie-store, and global-drive authority is never a machine property. A future
Windows administrative operation remains a typed broker operation with exact
arguments, UAC, approval, pre/post state and audit receipt.

### 6. Generation fencing makes stale handles harmless

Every reset, snapshot restore, reimage, remote replacement, or destructive
recovery increments `machineGeneration`. Every lease, approval, tool call,
secret lease, event, effect record, and remote command binds the exact machine
ID and generation.

```text
machine m, generation 7
  -> lease l(m, 7)
  -> reset/restore
machine m, generation 8
  -> every l(m, 7) request is denied
```

Generation rotation requires a new passing attestation. It cannot silently
widen policy, capabilities, mounts, or network scope.

### 7. Leases are exclusive, expiring, and transactional

A machine lease contains:

- machine, generation, environment, and run IDs;
- exact policy, capability, mount, and network hashes;
- acquisition, heartbeat, expiry, and close timestamps;
- active/released/expired/revoked state.

Acquisition is compare-and-swap on `ready + no active lease + generation`.
Lease creation and the durable `machine.lease_acquired` event commit together.
Every operation revalidates the lease and security envelope immediately before
dispatch. A missed heartbeat expires the lease; it does not cause automatic
replay of billable or destructive operations.

Initial concurrency policy:

- one exclusive writer lease per machine;
- read-only parallel work still uses separate run-scoped isolated machines
  unless a later contract proves shared-read safety;
- an agent/subagent does not inherit a lease implicitly;
- a child may receive a new lease inside the intersection of parent capability,
  project policy and environment policy.

### 8. Snapshot does not mean credential or approval persistence

Persistent snapshots may retain user-approved project state such as source,
dependencies, indexes and generated outputs. They explicitly exclude:

```text
raw secrets
secret leases
approvals and approval receipts
temporary grants
administrator/elevation state
live processes and volatile memory
network and browser sessions
device sessions
```

Snapshot records bind machine generation, owner scope, template, base image,
runtime adapter, effective policy, filesystem hash, manifest hash, parent
snapshot and consistency kind. A snapshot is usable only after verification.
Snapshot count, size and age are bounded by retention policy.

Conversation rewind and environment restore are different operations. A UI may
offer them together only when it accurately states which effects are covered.

### 9. Persistent resume is reconstruction, not blind reconnection

The durable resume manifest records:

```text
machine identity and generation
owner scope
template/base-image/runtime hashes
effective policy/capability/mount/network hashes
extension-set hash
snapshot ID and manifest hash
pending-operation classification
journal cursor
explicit non-restored state
```

Resume first catches up the journal, reconciles unfinished operations, checks
ownership and current policy, then chooses exactly one action:

- `resume`: ready, exact manifest, current attestation;
- `reattest`: compatible state but attestation or drift review is stale;
- `restore`: suspended machine with an exact verified snapshot;
- `recreate`: image/runtime/template/extension drift or stopped resource;
- `blocked`: cross-scope, policy/capability/mount/network drift, quarantine,
  active conflicting lease, journal gap, or outcome-unknown side effect.

Temporary approval, privilege, secret material, session cookies, browser state,
live network state, and running processes never return implicitly after resume.

### 10. Drift is a first-class security and quality signal

Persistent machines accumulate dependency drift, poisoned caches and accidental
state. Attestation is repeated:

- before first lease;
- when its TTL expires;
- after reset/restore/reimage;
- after policy, mount, network, adapter, base image or extension change;
- after abnormal termination or provider reconnect;
- periodically while an always-on machine is idle or active.

Drift reports classify image/runtime/policy/capability/mount/network/package/
filesystem/secret/clock findings as info, warning or critical. Warning requires
review or re-attestation. Critical drift quarantines the machine and revokes new
leases. Quarantine preserves evidence by default; it does not silently delete
the resource.

### 11. Network, mounts, secrets, and elevation remain brokers

Mounts use opaque native grant handles and explicit read/write/execute modes.
No environment receives user-profile, drive-root, UNC, network-drive, browser,
vault, clipboard, microphone, camera, display or device access by default.

Network defaults:

- risky isolated worker: offline or explicit outbound allowlist;
- persistent project machine: project policy, still deny inbound by default;
- remote machine: authenticated control plane and separately declared workload
  egress; no unauthenticated listener;
- proxy/DNS/VPN/tunnel profiles are explicit route policy bound by hash and
  audited, never an access-control bypass mechanism.

Secrets are destination- and purpose-bound leases delivered directly by a
broker to the exact process/provider operation. They do not enter snapshots,
environment variables inherited by arbitrary children, prompts, logs, shell
history, remote screen streams, or general filesystem mounts.

### 12. Lifecycle and crash recovery are journaled

Canonical machine lifecycle:

```text
provisioning -> ready -> leased -> ready
                         |        |
                         |        +-> suspending -> suspended
                         |                            |-> snapshotting -> suspended
                         |                            |-> restoring -> ready
                         |                            +-> resetting -> ready
                         +-> quarantined -> resetting | stopping
ready/suspended -> stopping -> stopped
any active state -> failed/quarantined (with typed evidence)
```

Commands mutate state; committed journal events report facts. Minimum events:

```text
machine.provision_requested
machine.provisioned
machine.attested | machine.attestation_failed
machine.lease_acquired | machine.lease_heartbeat | machine.lease_closed
machine.snapshot_started | machine.snapshot_verified | machine.snapshot_failed
machine.restore_started | machine.generation_rotated
machine.drift_observed | machine.quarantined
machine.stop_requested | machine.stopped
machine.recovery_classified
```

After a crash, Omnia replays committed events, queries the provider, validates
generation/lease/snapshot state, and classifies pending work. It never repeats
an outcome-unknown billable or destructive operation automatically.

### 13. Telemetry is local-first and provenance-safe

Machine spans and metrics include:

- selection and candidate reason codes;
- provision/start/resume/snapshot/reset/stop latency;
- queue and lease-wait time;
- active/idle/suspended duration;
- CPU, memory, storage, process, output and network budget use;
- snapshot size/duration/dedupe/retention;
- attestation age/result and drift findings by code;
- provider health and failure category;
- recovery outcome and user-visible downtime;
- run/agent/tool linkage and exact environment generation.

Telemetry does not contain secret values, raw command/file/page bodies, host
paths, screen content, provider credentials, or raw remote addresses when a
classified/redacted identifier is sufficient.

### 14. Storage target

The native schema should use typed tables rather than a generic graph:

```text
machine_templates
machine_instances
machine_attestations
machine_leases
machine_snapshots
machine_snapshot_manifests
machine_drift_reports
machine_drift_findings
machine_events
machine_resource_samples
machine_recovery_actions
```

Required database constraints include:

- exact owner scope and profile lineage;
- one active lease per machine and generation;
- immutable terminal lease/snapshot/attestation rows;
- monotonic generation and event sequence;
- snapshot parent belongs to the same machine and owner scope;
- no lease on quarantined/stopped/failed machines;
- hashes and provider identities immutable after publication;
- event append plus projection transition in one transaction.

Large snapshot manifests, evidence bundles and diagnostic artifacts live in the
encrypted content store under opaque IDs.

## Windows provider implementation slices

### M0 — contract and denial tests

- Domain types, generation fences, leases, snapshots, drift and resume.
- Provider capability matrix and no-claim documentation.
- No renderer command can provision a machine yet.

Exit: contract tests prove cross-scope, stale generation, ambient authority,
snapshot authority retention, drift, and outcome-unknown denial.

### M1 — durable repository and journal

- SQLite migration and repository.
- Transactional state/event updates and replay projection.
- Crash/fault injection at every transition.

Exit: fresh and upgraded schema pass; projection rebuild is deterministic;
single-active-lease holds under concurrency.

### M2 — Windows Sandbox isolated provider

- Versioned `.wsb`/provider policy compiler owned by native code.
- Networking, clipboard, audio/video, printer, protected-client and mapped
  folder settings translated explicitly and inspected after launch.
- No writable host mount by default; bounded import/export staging.
- Process/resource supervision and forced disposal.

Exit: clean supported Windows VMs pass mount/network/clipboard/device/process/
reparse/secret canary tests. Until then the UI says unavailable, not degraded.

### M3 — Hyper-V VM persistent provider

- Signed/versioned base image and differencing disk.
- Standard-user guest identity, authenticated guest agent, no ambient host
  integration services, explicit data plane.
- Production/filesystem-consistent snapshots, reset/reimage and drift scanner.
- Sleep/reboot/host-crash/antivirus/disk-full recovery tests.

Exit: cross-project isolation, snapshot exclusion, generation fencing, secret
canary and restore reproducibility pass on every supported Windows edition.

### M4 — remote provider

- Device/workload keys, mutual authentication, encrypted transport, replay
  protection, revocation and destination pinning.
- Residency/retention disclosure and remote wipe receipt.
- Same machine/lease/generation protocol over a remote adapter.

Exit: external-network penetration, reconnect, revocation, stolen-token, clock
skew, wipe verification, and outcome-unknown tests pass.

### M5 — UI and operations

- Environment picker defaults to `Auto` and always explains the resolution.
- Inspector shows owner, mode, provider, lifecycle, generation, attestation,
  mounts, network, budgets, lease, snapshot, drift and recovery truthfully.
- Actions: suspend, resume, snapshot, reset, quarantine, stop and export a
  redacted diagnostic bundle. Destructive reset/stop has precise confirmation.
- No decorative “healthy” state without current native evidence.

Exit: keyboard/Narrator/forced-colors/200% scale and error/partial/recovery
visual matrix pass; remote/mobile clients project the same durable state.

## Mandatory denial and fault test catalog

```text
auto_no_execution_does_not_provision_machine
auto_unknown_code_requires_isolation_or_stops
auto_never_falls_back_to_remote_or_privileged_host
persistent_machine_has_no_admin_or_ambient_secret_authority
persistent_machine_never_crosses_profile_project_or_conversation_scope
isolated_machine_is_run_scoped_and_not_pooled_without_zeroization
provider_policy_translation_failure_prevents_start
attestation_expiry_prevents_lease
mount_network_or_capability_hash_drift_prevents_reuse
single_active_lease_holds_under_concurrent_acquire
lease_generation_fence_rejects_stale_process_and_secret_handles
reset_restore_and_reimage_rotate_generation
snapshot_excludes_approvals_grants_secrets_processes_and_sessions
snapshot_manifest_or_owner_mismatch_prevents_restore
resume_never_restores_temporary_approval_privilege_or_secret
resume_outcome_unknown_blocks_automatic_replay
critical_drift_quarantines_and_revokes_new_leases
crash_before_and_after_each_journal_commit_reconciles_once
host_sleep_reboot_and_clock_skew_do_not_extend_lease_or_approval
disk_full_locked_file_antivirus_and_provider_timeout_leave_recoverable_state
remote_disconnect_and_duplicate_ack_do_not_duplicate_side_effects
workspace_reparse_unc_ads_and_file-replacement_races_do_not_escape_mount
secret_canary_never_appears_in_snapshot_log_prompt_telemetry_or_child_process
```

## Consequences

Positive:

- `Auto` becomes explainable and testable rather than model intuition.
- Persistent state is useful without becoming global ambient authority.
- Reset/restore/reconnect cannot revive stale leases or approvals.
- Desktop, CLI, web, Android, IDE and agents can share one machine protocol.
- Isolation and health claims are tied to provider evidence and expiry.

Costs:

- Windows edition/feature detection and provider-specific test infrastructure.
- More durable identities, migration work and event volume.
- Persistent machines consume disk and require image/snapshot lifecycle UX.
- Some tasks stop instead of silently running in a weaker boundary.

## Non-goals and stop-ship claims

This ADR does not authorize or implement:

- silent administrator, SYSTEM or TrustedInstaller execution;
- credential/cookie/password-vault export;
- global drive/profile/network-drive mounts;
- anti-bot, CAPTCHA, DRM, region-entitlement or access-control bypass;
- unauthenticated remote listeners;
- treating a child process, WSL distro, job object or UI label as proven
  isolation;
- restoring live browser/network/device sessions or approval state;
- advertising “persistent machine” or “isolated machine” before the applicable
  native provider, threat-model gate and supported-Windows matrix are green.
