# Omnia remote clients architecture

Status: Design contract; no remote listener is shipped  
Date: 2026-08-13  
Scope: Web/PWA, CLI, Android/tablet and direct/relayed access to one Omnia Kernel

## 1. Purpose and current truth

Omnia needs first-class remote access without creating a weaker second product
or a second policy engine. A phone, browser or CLI should be able to continue a
task, observe durable run events, inspect artifacts, view a terminal or screen,
and—when explicitly granted—send input. The same client should work on the same
LAN or across the internet without making the Windows host a public,
unauthenticated service.

This document defines the target architecture and the security/quality gates
that must be met before remote capability is advertised. The current product
does **not** ship:

- a network listener;
- device pairing or remote device credentials;
- a relay service;
- a Web, CLI or Android production client;
- remote screen, terminal, clipboard or file transfer;
- remote approval responses;
- end-to-end encrypted remote sessions.

The pure domain boundary in `src/domain/remote-client.ts` is an invariant and
denial-test slice only. It performs no networking, capture, input injection,
credential storage or privilege operation.

## 2. Non-negotiable distinction: client location is not execution location

Remote control and remote execution are orthogonal:

```text
presentation client                         execution selected by Kernel policy

Windows desktop  ─┐                        none (model-only chat)
Web/PWA           ├─ authenticated ─────── persistent local environment
CLI               ├─ Omnia Protocol ───── isolated disposable environment
Android/tablet    ┘                        explicitly allowed remote executor
```

A remote client does not imply a remote environment. `Auto` resolves
`none|persistent|isolated|remote` from the workload and environment policy as
defined by ADR 0002. It does not inspect whether the requesting client is a
phone, browser or CLI, and it never selects remote merely because a relay is
available.

Conversely, the Windows desktop client may operate a managed remote executor.
`remote-client session ID` and `execution-environment ID` are therefore distinct
identities and must never be overloaded.

## 3. Architecture

```text
┌──────────────────────────────── client surfaces ───────────────────────────────┐
│ Windows desktop │ Web/PWA │ CLI/TUI + JSON/NDJSON │ Android adaptive UI       │
└───────────────────────────────────┬──────────────────────────────────────────────┘
                                    │ versioned Omnia Protocol
                          mutual device authentication
                          command counter + idempotency
                                    │
┌───────────────────────────────────▼──────────────────────────────────────────────┐
│ Remote Access Gateway (untrusted-edge process / isolated service boundary)      │
│ handshake │ pairing │ transport │ admission limits │ frame/terminal fan-out     │
└───────────────────────────────────┬──────────────────────────────────────────────┘
                                    │ authenticated local IPC
┌───────────────────────────────────▼──────────────────────────────────────────────┐
│ Omnia Kernel — the only policy and durable identity authority                   │
│ device grants │ sessions │ commands │ capability/approval │ journal │ audit      │
└──────────────┬───────────────────┬───────────────────────┬───────────────────────┘
               │                   │                       │
       durable projections   environment broker     media/terminal brokers
       + cursor replay       persistent/isolated/   capture/input/clipboard
                             managed remote         file transfer
```

The gateway is not a second kernel. It may terminate transport, enforce cheap
admission limits, multiplex channels and relay encrypted bytes. It cannot grant
permissions, resolve workspace paths, consume approval receipts, choose an
environment, decrypt stored blobs for arbitrary clients, or authorize a
command from route names alone.

The public-facing component should be a separately updatable, least-privilege
process. A parser or codec failure must not compromise the process that owns
profile secrets, workspace handles or administrator brokers.

## 4. Identity hierarchy and pairing

### 4.1 Durable identities

```text
host
  └─ profile
      └─ paired device
          └─ device-grant revision
              └─ session
                  └─ connection epoch
                      └─ command counter
```

- **Host ID** identifies one Omnia installation/host key, not a hostname or IP.
- **Device ID** is derived from or bound to an asymmetric device public key.
- **Grant revision** is immutable. Any scope or permission change creates a new
  revision and invalidates sessions pinned to the prior revision/hash.
- **Session** is short-lived and belongs to exactly one host, profile, device,
  grant revision and protocol generation.
- **Connection epoch** changes after reconnect/rekey. Packets from an old
  transport epoch are rejected even when the session ID appears valid.
- **Command counter** is monotonic and authenticated. A duplicate counter is
  valid only as a byte-equivalent retry of the same durable command receipt.

### 4.2 Pairing flow

Pairing requires local presence or an already authenticated profile
administrator:

1. The host creates a single-use invitation with a random high-entropy secret,
   explicit host fingerprint, intended profile, expiry and attempt budget.
2. A QR/deep link may encode discovery metadata and the invitation secret. The
   short human code is only a comparison/check value; a six-digit code alone is
   not the cryptographic secret.
3. The client creates its device key inside platform-protected storage and
   proves possession during a mutually authenticated key exchange.
4. Both surfaces display a short authentication string derived from the
   transcript. Local confirmation binds the public key, client kind and device
   name to the intended host.
5. The user selects a least-privilege template and can reduce scope before the
   immutable grant revision is committed.
6. The invitation is atomically consumed. Retry returns the existing grant only
   for the identical transcript; all other reuse is rejected and audited.

Recommended defaults:

| Client | Default grant | Explicit opt-in |
|---|---|---|
| Web/PWA | read projections and artifacts for selected projects | start/cancel runs, files, terminal/screen input |
| CLI | read projections; start/cancel runs in selected projects | approvals, environment control, terminal input |
| Android/tablet | read projections, notifications, artifacts | approvals, screen/terminal input, clipboard/files |

No template includes administrator requests, secret access or ambient profile
scope. Pairing a device never creates a persistent execution environment.

### 4.3 Credential storage and recovery

- The Windows host key and pairing records use OS-protected storage. A missing
  host key is a recovery event; Omnia does not generate a new key and silently
  trust old pairings.
- Android device keys use platform keystore-backed non-exportable keys when the
  device supports them. Web uses WebAuthn/passkey-backed user verification for
  high-impact commands when available; a browser local-storage bearer token is
  not a device identity.
- CLI stores a device key in an OS credential/key store or a user-selected
  hardware-backed identity. Plaintext key files are not the default.
- Recovery rotates host identity, explicitly invalidates every pairing/session,
  and explains the impact. Sync providers never receive raw device private keys.

## 5. Device grants, sessions and command authorization

### 5.1 Grants are not capability receipts

A remote device grant answers only:

> May this authenticated device ask the Kernel to perform this class of remote
> action inside this durable scope?

The requested operation must still pass normal Kernel checks:

```text
remote device grant
  + active session/replay verification
  + durable entity ownership/lineage resolution
  + tool/operation schema validation
  + execution-environment capability
  + capability grant and/or exact approval receipt
  + audit/event commit
  = operation may execute
```

Remote permission names intentionally distinguish viewing from injecting input:

```text
terminal.view   ≠ terminal.input
screen.view     ≠ screen.input
approval.read   ≠ approval.respond
artifact.read   ≠ artifact.write
clipboard.read  ≠ clipboard.write
file.download   ≠ file.upload
```

High-impact permissions require a recent user-verification assertion. Device
key possession by itself is insufficient for approval responses, screen or
terminal input, environment control, clipboard reads/writes or file uploads.

### 5.2 Scope is resolved by the Kernel

A client may name a target ID, but it cannot declare the target's project or
profile. The repository resolves the canonical lineage and produces a trusted
scope such as:

```text
run → conversation → optional project → profile
run → optional execution environment → owner project/profile
```

Authorization compares that resolved lineage with the device grant. This
prevents a client from pairing a permitted `projectId` with a `runId` belonging
to another project.

Projectless conversation scope is first-class. A restricted grant may name an
exact projectless conversation; it does not become a profile wildcard.

### 5.3 Command ordering and idempotency

Every mutating command has:

```text
session / host / profile / device
connection epoch
monotonic command counter
command ID
canonical command type + target + body hash
issued and expiry time
```

The host stores acceptance in the same transaction as command idempotency. It
accepts only the next counter. A lost-response retry returns the existing
receipt only if session, epoch, counter, ID, type and canonical hash all match.
Content similarity is never used for deduplication.

An accepted remote command enters the same durable command path as a desktop
command. A disconnect after acceptance does not cause automatic resend. An
ambiguous mutating or billable effect follows the existing `outcome_unknown`
rules.

## 6. Transport and network topology

### 6.1 Topology selection

Connectivity strategy is independent of authorization:

1. **Local/direct**: authenticated encrypted connection to a host address
   discovered by an already paired device. No open trust based on LAN presence.
2. **User-managed tunnel**: a VPN/private network can provide reachability, but
   Omnia still performs device authentication, session expiry and grants.
3. **Managed relay**: outbound host/client connections meet at a relay when
   direct connectivity fails. The relay routes opaque encrypted envelopes and
   stores no offline command queue by default.

DNS, proxy or VPN profiles change routing/privacy only. They do not alter host
identity, region entitlement, access control, device grants or provider policy.

### 6.2 Channel layout

Use logical channels with independent flow control:

| Channel | Semantics | Reliability |
|---|---|---|
| Control | handshake, commands, results, approval state | ordered, reliable, bounded |
| Journal | run events and projection invalidations | ordered by durable cursor |
| Terminal | snapshots, ordered output, resize/input | reliable with byte offsets |
| Media | screen/audio frames and adaptation feedback | low latency; stale frames droppable |
| File | manifest, chunks, acknowledgements, resume | reliable, content-addressed |
| Presence | controller/viewer state, stream indicator | bounded latest-state projection |

Control and journal traffic must never be blocked behind a large file transfer
or media frame. Each channel has byte/message/stream limits, explicit overload
errors and cancellation.

Media may use WebRTC where platform support and the audited implementation make
it appropriate; a reliable HTTP/2 or WebSocket fallback can carry control,
journal and terminal data. The security contract is transport-independent:
mutual device authentication and Omnia command authorization remain mandatory.

### 6.3 End-to-end encryption

Transport security alone is insufficient for a managed relay. The host and
device derive end-to-end session keys from the mutually authenticated pairing
identity and current connection transcript. Bind keys to:

```text
host ID
device ID
profile ID
grant revision hash
protocol version
connection epoch
channel ID and direction
```

Use an audited protocol/library with forward secrecy and authenticated
encryption. Do not invent cryptography. Relays see routing identifiers, bounded
traffic metadata and ciphertext—not command bodies, terminal text, screen
frames, clipboard data, files or approval content. Key rotation changes the
connection epoch and rejects old frames.

## 7. Durable projections, offline behavior and replay

Remote clients consume Kernel projections and the durable run journal from ADR
0004. They never rebuild authoritative state from transient push messages.

```text
initialize/authenticate
  → read snapshot + projection watermark
  → replay finite journal page through fixed through-cursor
  → atomically attach to live tail
  → resume from opaque cursor after reconnect
```

The client caches only a bounded, explicitly selected offline projection:

- titles and task/run state;
- user-approved recent messages/artifact metadata;
- pending local drafts not yet acknowledged;
- opaque replay cursors and command receipts.

Raw secrets, credential handles, protected browser state, decrypted blobs,
screen frames and terminal scrollback are not durable offline cache by default.
Android/Web caches must support logout/revocation wiping and platform backup
exclusion where sensitive.

Remote clients cannot execute commands while the host is unavailable. They may
save a local draft, but the UI must label it `Not sent`. A relay must not accept
an unbounded offline queue of approval responses, shell commands or input
events to be replayed when the host returns.

## 8. Terminal, screen, audio, input, clipboard and files

### 8.1 Terminal

Terminal streaming is a semantic session, not a video capture:

- server allocates ordered byte offsets and periodic screen snapshots;
- client requests replay from an offset and acknowledges resize explicitly;
- terminal escape sequences are parsed/sanitized in an isolated component;
- OSC clipboard, external URI and host-control sequences require separate
  policy and are disabled by default;
- secret masking is defense in depth, not a promise that terminal output is
  safe to share;
- scrollback retention and remote replay are explicit per terminal session.

Terminal input requires `terminal.input`, fresh user verification and a short
exclusive control lease. Read-only viewers can coexist.

### 8.2 Screen and optional audio

Screen sharing starts only after an explicit user action or a visible,
previously configured always-on policy for a named machine. The Windows host
shows a persistent indicator and a global pause/stop affordance.

Before capture, the user chooses:

- one display, app/window set or explicit region;
- whether cursor is visible;
- whether audio is included;
- whether privacy curtain/redaction rules apply;
- maximum resolution, frame rate and bitrate.

The encoder adapts resolution/FPS/bitrate to congestion and device capability.
It drops obsolete delta frames instead of increasing control latency. A keyframe
request repairs decoder loss. Hardware encoding is optional and must have a
software fallback with bounded CPU/memory use.

Screen input is a separate grant and exclusive lease. Every event carries the
current display/layout epoch and normalized coordinates; stale events are
rejected after DPI, rotation, display topology, lock-screen or secure-desktop
changes. Input injection never grants administrator authority. UAC/secure
desktop interactions remain behind the privileged broker and local OS consent.

### 8.3 Clipboard

Clipboard permissions are separate by direction. Defaults:

- no background polling;
- read only on direct user gesture;
- preview MIME/type/size before transfer;
- secret scan and size limit;
- never sync password-manager or protected clipboard formats;
- clear remote transient clipboard buffers on session close.

### 8.4 Files and artifacts

Artifact download uses existing immutable blob identity and a native
authorization check; the remote protocol does not expose storage paths, wrapped
keys or decrypted-at-rest descriptors.

Uploads are staged as native-owned attachment drafts:

```text
manifest → bounded chunks → content hash → isolated scan/sniff
→ encrypted blob store → durable attachment draft → explicit message/run bind
```

Transfers support resume by verified chunk/content hash, quota, cancellation
and deterministic cleanup. They reject traversal names, archive bombs,
unbounded sparse files and MIME/extension mismatch. Remote file transfer does
not create a workspace grant.

## 9. UI contracts by client

### 9.1 Shared product model

All clients share durable identity and state, but not every client must render
every surface. A missing capability is shown as unavailable, not silently
emulated.

Common navigation:

```text
Home / projects / conversations / tasks / runs
Approvals / notifications
Artifacts / sources / files
Environments / terminals / remote screen
Provider and usage health (redacted by grant)
Device/session privacy controls
```

The remote session header always shows host, profile, connection route,
encryption state, active grant scope, stream/controller state and last durable
sync cursor.

### 9.2 Web/PWA

- Responsive shell using the same visual tokens and component semantics as the
  desktop projection.
- Service worker caches application assets and explicitly allowed projections,
  not credentials or screen/terminal bodies.
- WebAuthn user verification for high-impact commands where supported.
- Background notification is opt-in, payload-minimized and contains no prompt,
  file, terminal or approval body.
- Browser tab visibility pauses/reduces media and releases input control after
  a bounded timeout.

### 9.3 CLI/TUI

CLI has a stable scriptable layer and an interactive TUI:

```text
omnia auth pair
omnia hosts list
omnia projects list
omnia chat send --conversation ...
omnia runs watch --cursor ...
omnia approvals show/respond
omnia env list/status
omnia terminal attach --view-only
omnia artifacts download --id ...
```

- Human output and machine output are separate. `--json`/NDJSON emits only
  versioned protocol envelopes to stdout; diagnostics go to stderr.
- Non-interactive approval response, screen input or privilege operation is
  disabled unless an explicit policy and fresh user verification mechanism are
  present.
- Shell completion and config never contain secret bearer tokens.
- Exit codes distinguish transport, authentication, permission, conflict,
  outcome-unknown and terminal run failure.

### 9.4 Android/tablet

- Phone uses bottom navigation and task-first views; tablet can use adaptive
  split panes with conversation, inspector and terminal/screen side by side.
- Foreground service and persistent notification are required while streaming
  screen/audio or holding an input-control lease.
- Biometric/device-credential user verification protects approval responses,
  input control, clipboard and files.
- Connectivity changes resume journal/file/terminal streams by cursor/offset;
  media renegotiates and does not replay stale frames.
- Picture-in-picture is optional for read-only remote screen; entering it drops
  input control unless the user explicitly retains it.
- Android backups exclude private device keys and sensitive offline projection.

## 10. Privacy, observability and audit

Remote telemetry is local-first and content-minimized. Useful metrics include:

- direct vs relay setup time and failure class;
- handshake/rekey latency;
- replay events/bytes and time to live tail;
- command acknowledgement/terminalization latency;
- media encode/decode latency, FPS, bitrate, loss, jitter and dropped frames;
- terminal bytes, replay gaps and resize latency;
- file throughput, dedupe/resume ratio and scan time;
- session expiry/revocation propagation;
- denied permissions, stale epochs/counters and control-lease conflicts.

Telemetry excludes raw commands, prompts, files, screen/audio, terminal output,
clipboard content, device private material and end-to-end session keys. Device
names and network addresses are pseudonymized unless the user requests a local
diagnostic bundle.

Security-relevant events append to the audit chain:

```text
pairing proposed/confirmed/failed
device grant created/revised/revoked
session authenticated/rekeyed/expired/closed
command admitted/denied/idempotently replayed
user verification accepted/expired
screen/terminal stream started/stopped
input lease acquired/released/preempted
clipboard/file grant used
relay route selected/changed
```

Run effects also remain in the normal run journal. Audit is not a content
transcript and the run journal is not the security audit chain.

## 11. Storage and service contracts

Target typed records, coordinated with the canonical schema migration plan:

```text
remote_hosts                 local host identity metadata
remote_devices               device public key + display metadata
remote_device_grants         immutable permission/scope revisions
remote_pairing_invitations   bounded one-time invitation state
remote_sessions              grant-pinned session/epoch/counter state
remote_command_receipts      canonical hash + idempotent result
remote_control_leases        exclusive screen/terminal input ownership
remote_stream_sessions       media/terminal/file metadata, no body
remote_transfer_manifests    content hashes/chunk state/retention
```

Required transaction boundaries:

- consume invitation + create initial device/grant;
- authorize command counter + insert command receipt + enqueue durable command;
- acquire/release control lease + append audit event;
- revoke grant/device + invalidate sessions/leases + append audit event;
- commit upload chunk/manifest state without exposing partial attachment;
- rotate connection epoch and invalidate older channel keys/counters.

Retention:

- pairing invitations: delete shortly after expiry/consumption;
- sessions/control leases: retain redacted audit references, delete secrets;
- command receipts: retain at least through the longest retry/recovery window;
- media frames: memory only by default, never recorded without a separate,
  visible recording contract;
- transfer staging: deterministic expiry and cleanup ledger.

## 12. Failure and recovery behavior

| Failure | Required behavior |
|---|---|
| Relay/direct link loss | keep Kernel run alive; reconnect session and replay by cursor |
| Device sleeps/network switches | close old connection epoch; reauthenticate/rekey; reject late frames |
| Host sleeps/restarts | no offline mutation replay; recover durable runs, sessions require fresh connection |
| Grant revised/revoked | atomically deny new commands, close sessions, release input leases |
| Lost command response | exact command receipt replay only; no content-based retry |
| Screen encoder failure | stop/announce screen stream; preserve control/journal channels |
| Media congestion | reduce FPS/resolution/bitrate; never delay approval or Stop command |
| Terminal parser failure | stop affected terminal projection in isolation; do not crash Kernel |
| Upload interruption | resume verified chunks or expire staging; never bind a partial attachment |
| Audit/journal unavailable | fail closed for high-risk remote commands |

The local user always has priority. Locking Windows, invoking the emergency
pause hotkey, revoking the device or stopping the gateway immediately terminates
input leases. Remote release packets are not required for safety.

## 13. Denial and fault test matrix

### Identity and replay

- pairing code brute force, reuse, transcript mismatch and race;
- device key copied to another platform instance;
- host/profile/device/session/grant revision mismatch;
- stale connection epoch after reconnect/rekey;
- stale, duplicated, skipped, wrapped or oversized command counter;
- same command ID with different body/type/target hash;
- command issued in future or outside bounded lifetime;
- concurrent-session policy race.

### Authorization

- exact projectless conversation vs profile wildcard;
- run/entity moved, deleted or resolved to another project/profile;
- view permission used for input;
- device grant mistaken for Kernel capability or exact approval;
- stale user verification; compromised device tries to approve admin operation;
- approval receipt already consumed or arguments changed;
- remote client tries to select an unauthorized execution destination.

### Streaming and privacy

- media/file flood cannot starve Stop/control/journal;
- frame/input from old display-layout epoch;
- two sessions race for input lease;
- terminal escape-sequence/OSC injection;
- clipboard secret/oversize/unsupported format;
- locked screen, secure desktop, privacy curtain and stream indicator;
- relay sees only ciphertext and cannot substitute host/device identity;
- notification/offline cache/backup secret canaries.

### Reliability

- disconnect before and after durable command commit;
- fixed-watermark replay while new events append;
- sleep/resume, clock change, network roam and relay/direct migration;
- abrupt host/client/relay termination at every transfer phase;
- encoder/decoder reset and missing keyframe;
- terminal replay gap/resize race;
- file chunk corruption, duplicate, reordering and quota exhaustion;
- revocation reaches every session/stream/lease under concurrency.

External-network penetration testing, Android backup/keystore review, browser
storage review, Windows capture/input privacy review and relay metadata review
are release gates—not optional hardening after launch.

## 14. Implementation sequence

### R0 — Protocol-only simulation

- Keep remote capabilities absent from native negotiation.
- Land and fuzz device grant/session/command/lease contracts.
- Use in-memory mock transport and deterministic clocks/faults.
- Prove the same commands enter the local Kernel command path.

Exit: replay, scope, revocation and idempotency denial matrix is green.

### R1 — Localhost and LAN read-only preview

- Isolated gateway process; explicit start/stop and visible status.
- Presence pairing, device key store and encrypted direct transport.
- Read-only projections, durable run replay, artifact metadata.
- No screen, terminal, clipboard, file transfer or approval response.

Exit: unauthenticated/pre-handshake commands are physically unreachable; LAN
hostile-client and revocation tests pass.

### R2 — CLI and Web command path

- Start/steer/cancel within restricted scope.
- Command receipts, concurrency limits, notification minimization.
- WebAuthn/high-impact verification framework, but high-impact permissions stay
  unavailable until their own vertical slices pass.

Exit: desktop/Web/CLI protocol conformance fixtures match and every mutation is
durable/idempotent/audited.

### R3 — Terminal and file/artifact transfer

- View-only terminal first, then verified exclusive input lease.
- Content-addressed resumable downloads and staged attachment uploads.
- Independent channel backpressure and fault tests.

Exit: terminal/file canaries never escape scope; partial upload cannot bind.

### R4 — Screen/audio and Android

- Visible scoped Windows capture and adaptive Android viewer.
- Read-only stream first; input control is a separate milestone.
- Foreground privacy indicators, emergency stop and display-epoch checks.

Exit: lock/UAC/topology/DPI/network-roam/privacy tests pass on supported Windows
11 and Android versions.

### R5 — Relayed internet access

- End-to-end encrypted relay, route migration and metadata controls.
- No offline high-risk command queue.
- Independent infrastructure security assessment and abuse/rate controls.

Exit: relay compromise cannot read/forge application payloads; external
penetration, replay, revocation, isolation and privacy reviews pass.

### R6 — Carefully bounded remote approvals and environment control

- Fresh platform user verification.
- Exact approval receipt and privileged-broker integration.
- Local-host indicator and optional policy requiring local confirmation for
  configured high-risk classes.

Exit: a paired or compromised client cannot expand scope, reuse approval,
silently elevate, access secret values or control secure desktop.

## 15. Stop-ship conditions

Do not advertise remote access if any of these remains true:

- the network gateway runs inside the secret-owning Kernel process;
- a bearer token, IP address, LAN presence or relay account is treated as a
  device identity;
- pairing lacks local presence/transcript confirmation and replay protection;
- mutable commands are not bound to session, grant revision, epoch and counter;
- device grants bypass normal capability/approval evaluation;
- profile/project/conversation/run/environment scope is trusted from the client;
- stream and input permissions are combined;
- multiple devices can inject input without an exclusive bounded lease;
- screen/terminal/clipboard/file content leaks into logs, telemetry or relay;
- run replay cursor and remote command receipt are transient only;
- host lock/revoke/emergency-stop cannot terminate remote input immediately;
- remote route selection changes `Auto` environment or grants network/admin
  authority;
- screen or terminal is described as secure without the supported-platform
  fault/privacy matrix passing.

## 16. Relationship to existing Omnia contracts

- ADR 0001: renderer/client remains untrusted; Tauri is one adapter only.
- ADR 0002: one Kernel, explicit environments, opaque handles, exact approval.
- ADR 0004: durable facts, fixed-watermark replay and opaque cursor binding.
- `docs/THREAT_MODEL.md`: especially OM-TM-001, OM-TM-023 and OM-TM-024.
- `src/domain/execution.ts`: remote client never selects or broadens execution.
- `src/domain/kernel-capability.ts`: remote admission precedes, never replaces,
  capability and approval evaluation.
- `src/domain/run-event-journal.ts`: every client projects the same committed
  run facts and coverage state.
- Attachment draft/blob-store contracts: remote uploads use the same atomic
  native ownership and encryption path.

The result is one product with multiple trustworthy projections—not a desktop
app plus an independently privileged web server.
