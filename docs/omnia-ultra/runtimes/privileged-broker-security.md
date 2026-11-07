---
id: OMNIA-ULTRA-RUNTIME-PRIVILEGED
title: Typed Windows privileged-operation broker
status: normative-target
---

# Privileged broker

Privileged Windows actions are typed operations, not an arbitrary reusable
Administrator, SYSTEM or TrustedInstaller shell.

A request binds:

- exact operation and target;
- canonical arguments hash;
- precondition and expected version;
- profile/run/agent/machine;
- capability and policy revisions;
- privilege required;
- user-visible effect and rollback;
- approval receipt and expiry;
- postcondition verification.

Use UAC/Windows secure desktop where required. Omnia cannot approve a UAC prompt
on behalf of the user. Registry, service, policy, firewall, driver, account and
security-control changes require exact target, explicit approval, audit and
postcondition evidence.

