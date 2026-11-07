---
id: OMNIA-ULTRA-ARCH-UPDATE
title: Self-build, self-update and durable continuation
status: normative-target
---

# Self-update and durable continuation

The running UI cannot be its own only updater. Use a stable supervisor/updater,
a durable kernel journal, a reconnectable UI and A/B installation slots.

Update sequence:

1. isolated worktree and scoped plan;
2. source change and review;
3. format/lint/typecheck/tests/security scan;
4. package and signed artifact;
5. data snapshot and migration preflight;
6. standby-slot installation;
7. health/smoke test;
8. task checkpoint;
9. supervisor slot switch;
10. UI reconnect;
11. postcondition verification;
12. rollback on failure;
13. resume task from durable checkpoint.

User data lives outside the replaceable install slot. IPC and database schema
are versioned. A failed update must not erase chat, settings, memory, skills,
queue, task, artifact or Project Twin state.

Self-modification requires:

- explicit scope;
- reviewable diff;
- approval policy;
- test evidence;
- source provenance;
- rollback;
- no silent privilege or security-policy changes.

