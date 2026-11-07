# ADR 0001 — Tauri desktop runtime and versioned core boundary

- Status: Accepted for the foundation scaffold
- Date: 2026-08-12
- Owners: desktop, harness, native-core, security

## Context

Omnia is a Windows 11 desktop product whose first release is a complete chat
workbench. Later phases add an editor, terminal, browser, computer control and
coding agents. The desktop renderer must remain replaceable and untrusted while
the run harness, provider gateway, policy, storage and secrets remain reusable
across future surfaces.

The repository already has a Tauri 2 and Rust vertical scaffold. Replacing it
with Electron during the foundation phase would invalidate working packaging,
native storage, provider and permission work without improving the chat slice.
The useful architectural property is not a particular webview vendor; it is a
stable boundary between presentation and the trusted core.

## Decision

1. Keep Tauri 2 as the Windows desktop host and React as the renderer.
2. Treat the renderer/webview as untrusted presentation. It receives no stored
   secret, raw database handle, arbitrary path access, unrestricted URL fetch or
   process primitive.
3. All mutable native operations pass through allowlisted, typed Tauri commands
   and are revalidated by Rust.
4. Negotiate a versioned renderer/core protocol during application startup.
   A protocol or required-capability mismatch fails closed before the workspace
   is shown.
5. The foundation protocol advertises only chat-phase capabilities. Workspace
   write, process execution, browser control and computer control are explicitly
   unavailable until their sandbox, policy, approval, audit and recovery paths
   are implemented together.
6. Provider and run events will converge on a stable event envelope containing
   protocol version, durable cursor, event ID, timestamp, scope IDs, type and
   payload. Consumers must be idempotent and able to resume from a cursor.
7. The harness remains a domain service, not UI state. It may run in-process in
   early vertical slices; before executable tools or long-running background
   agents ship, move it behind a supervised Rust sidecar/child-process boundary
   while retaining the same protocol semantics.
8. Future IDE, terminal, browser and computer-use surfaces consume the same
   Project → Conversation/Thread → Run/Turn → Item/Event primitives instead of
   inventing parallel session models.

## Capability gates

The chat phase may eventually expose project metadata, BYOK/provider
negotiation, run streaming and cancellation, opaque secret references,
prompt-only skills and read-only workspace access. The handshake advertises a
capability only after its complete native and renderer path exists.

The following are unavailable, not merely hidden in the UI:

- `workspace.write`;
- `process.execute`;
- `browser.control`;
- `computer.control`.

Adding one requires a new ADR or an update to this ADR plus a deny-by-default
capability broker, exact-scope approval, durable audit trail, cancellation,
timeout, crash recovery and adversarial tests.

## Protocol invariants

- One successful initialization handshake precedes native mutation.
- Stable and experimental capability generations are distinguishable.
- Unknown fields on native command requests are rejected.
- Stream items follow a deterministic lifecycle and have one authoritative
  terminal event.
- Event cursors are monotonic within their durable stream; event IDs deduplicate
  replay.
- Backpressure is bounded and overload is retryable with jitter, not an
  unbounded memory queue.
- Settings, provider capabilities, parameters, context, memory and skill
  versions are frozen into a run snapshot before provider dispatch.
- Approval is a server-initiated request bound to the exact action arguments;
  changing the action invalidates approval.

## Consequences

The current application can advance quickly without a runtime rewrite, while
its security and harness boundaries remain compatible with richer future
surfaces. The Rust host carries more responsibility and needs contract tests.
WebView2 behavior must be tested on supported Windows versions. Long-running or
high-risk agent work cannot remain an unsupervised task inside the UI process.

## Rejected alternatives

### Electron immediately

Electron has a strong Chromium/Node ecosystem for browser views, terminals and
IDE-style extensions, but switching now would discard the implemented Tauri
slice. Revisit only if a measured product requirement cannot be met safely by
Tauri plus isolated sidecars or child windows.

### Put provider and harness logic in the renderer

Rejected because it exposes secrets and powerful operations to untrusted web
content, couples provider semantics to UI releases and prevents safe reuse by
future surfaces.

### Expose future powers early behind feature flags

Rejected. A hidden command remains attack surface. Future write/execute/control
capabilities are absent until their complete enforcement path ships.

## Implementation status

Implemented in the foundation scaffold:

- native `core_initialize` handshake;
- protocol and capability validation in Rust;
- mirrored TypeScript contract and compatibility checks;
- startup handshake before the main workspace renders;
- tests for compatible initialization and fail-closed drift.

Still required by later harness milestones:

- durable event journal and cursor replay;
- generated Rust/TypeScript schema artifacts from one source;
- bounded transport queues and overload signaling;
- supervised sidecar lifecycle;
- server-request approval resolution;
- prompt-only skill loading and memory lifecycle services;
- crash-resume and projection rebuilding.
