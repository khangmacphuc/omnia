---
id: OMNIA-ULTRA-HARNESS-LIFECYCLE
title: Agent lifecycle, lineage and communication
status: normative-target
---

# Agent lifecycle

Stable agent identity uses an immutable agentInstanceId, profile revision,
parent/team, thread/run, machine/worktree, capability grant, context snapshot,
heartbeat, lease epoch and lifecycle timestamps. Display names are labels only.

## Lifecycle

~~~text
created
-> context_prepared
-> permission_checked
-> queued
-> claimed
-> running
-> waiting | paused | blocked | retrying
-> review
-> completed | failed | cancelled | expired
~~~

## Lineage edges

Use typed edges:

- spawned_from;
- forked_from;
- branched_from;
- continued_from;
- resumed_from_checkpoint;
- handed_off_from;
- reports_to;
- reviewed_by;
- verified_by;
- depends_on;
- blocked_by;
- shares_artifact_with;
- messages_to;
- supersedes;
- merged_from;
- rebased_from;
- retried_from;
- compacted_from.

Each edge has source, target, actor, timestamp, reason, context revision,
policy revision, provenance and optional expiry.

## Communication

Inter-agent messages are durable events with sender/receiver IDs, sequence,
delivery/read/applied state, correlation ID and context references. A message
cannot grant capability. Direct messages, task comments, approvals, blockers,
artifact-ready notifications and review requests use distinct message kinds.

## Task claims

Use transactional claim with owner, lease epoch, expiry and heartbeat. Stale
workers cannot complete a task using an old epoch. Duplicate completion is
idempotent and requires evidence.

