---
id: OMNIA-ULTRA-SECURITY-CAPABILITIES
title: Approvals, sandbox and secret handling
status: normative
---

# Approvals and sandbox

Capabilities are deny-by-default and exact-target scoped:

- model-only;
- workspace read/write;
- command execute;
- network read/write;
- browser control;
- external message;
- Git commit/push/PR;
- install dependency;
- Docker;
- remote machine;
- screen/audio capture;
- secret use;
- privileged operation;
- destructive action.

Approvals may allow once, task, session, project, exact target or signed workflow,
with expiry and revocation. The native broker recomputes canonical arguments,
policy, tool digest, target and environment immediately before execution.

Sandbox modes include no-machine, read-only, workspace-write, isolated
filesystem, container, VM, persistent sandbox, network-off and allowlisted
network, with resource, mount and secret-injection policies.

Secrets use Windows Credential Manager, DPAPI, Windows Hello, passkeys,
hardware-backed keys or an encrypted vault through opaque references. Never
expose raw vault contents to renderer, model, logs, memory or arbitrary tools.

