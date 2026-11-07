---
id: OMNIA-ULTRA-RUNTIME-MACHINES
title: Machine modes, headless execution and remote clients
status: normative-target
---

# Machine runtime

Modes:

- None: model-only.
- Local Interactive.
- Local Background.
- Isolated.
- Persistent.
- Remote.
- Hybrid.
- Auto.

A machine record includes identity, generation, image/base version, storage,
installed tools, mounts, network policy, secrets bindings, snapshots, health,
resources, lease, expiry, backup and cost.

Auto chooses the least-privileged environment that meets the task. It never
silently escalates privilege, mounts, persistence, secrets or network.

## Headless

Kernel and workflows run without a visible taskbar window. Browser/apps that
need rendering use an offscreen browser, isolated desktop, virtual display or
VM. The UI is a reconnectable viewer, not the owner of task state.

## Remote

Web/Android/tablet clients use device enrollment, authenticated sessions,
revocation, clipboard/file policy, adaptive bitrate, resolution/FPS controls,
audit and resumable task state. Disconnect does not cancel the task unless
policy says so.

