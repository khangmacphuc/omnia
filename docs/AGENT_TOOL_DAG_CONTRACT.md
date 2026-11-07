# Omnia Agent, Tool, Task DAG, and Mailbox Contract

Status: **domain contract implemented and focused-test verified** on August 13, 2026. Native persistence, scheduling, execution, replay, recovery, IPC, and UI
projection are **not implemented by this slice**.

This contract turns the agent/tool findings in the official Codex, Claude Code,
Continue, Aider, and OpenCode research into an independent Omnia domain layer.
It does not copy prompts, private internals, source code, assets, or visual
designs from any external product.

## Implementation module boundary

The public compatibility import remains `agent-tool-dag.ts`, but the
implementation is split by responsibility:

- `agent-tool-contract-shared.ts` owns branded contract IDs and shared
  validation helpers;
- `tool-registry.ts` owns immutable tool-version registration and resolution;
- `agent-graph.ts` owns agent identity, authority, budget, lifecycle, and
  output routing;
- `agent-task-dag.ts` owns durable task dependencies, assignment, and resource
  conflicts;
- `tool-runtime.ts` owns exact invocation, authorization, revalidation, and
  terminal outcome semantics;
- `agent-mailbox.ts` owns transactional delivery and structured handoff.

The modules use type-only imports where possible so the domain dependency
direction does not turn into a runtime cycle.

## 1. Why these graphs remain separate

Omnia must not collapse a goal, task, agent process, provider run, tool call,
and operating-system process into one generic node type.

```text
Goal / plan projection
  -> durable task DAG
       -> assignment to an agent instance
            -> model/provider run
                 -> proposed tool invocation
                      -> capability decision and exact approval
                           -> executor process or brokered operation
                                -> evidence, effects, and artifacts
```

The separation is deliberate:

- A task can survive agent failure, context compaction, model replacement, or
  environment restart.
- An agent instance can be orphaned and recovered without marking its durable
  task complete or failed automatically.
- One task may be reassigned to a different agent.
- One agent may execute multiple tasks without making the task graph identical
  to the process registry.
- One tool invocation has one exact authorization and one terminal outcome;
  retry or fallback creates a new invocation unless a versioned idempotency
  contract proves exact replay safety.

## 2. Tool registry invariants

`ToolVersionManifest` represents one immutable implementation/configuration
version. It includes:

- namespace-qualified canonical name;
- stable version and immutable manifest/implementation/schema hashes;
- explicit model exposure policy;
- declared effects;
- matching kernel capabilities;
- supported execution modes;
- input, output, and timeout limits;
- cancellation and idempotency semantics;
- registration and disable timestamps.

Registration fails closed when:

- a name is not namespace-qualified;
- an extension attempts to occupy `kernel.*`, `omnia.*`, or `system.*`;
- two records share the same ID or exact name/version;
- an effect lacks its matching kernel capability;
- a supposedly pure-compute tool carries side-effect authority;
- supported environments or resource limits are empty/invalid.

`harness-only` tools are never exposed to model-authored calls. Disabling a
tool version does not mutate historical invocations; it only prevents new
resolution/dispatch after the disable boundary.

## 3. Exact tool invocation lifecycle

```text
proposed
  -> awaiting-approval
       -> ready
            -> running
                 -> completed
                 -> failed
                 -> cancelled
                 -> outcome-unknown

proposed / awaiting-approval / ready
  -> cancelled

proposed / awaiting-approval
  -> denied
```

An invocation freezes:

- exact agent, task, run, and captured branch;
- exact environment;
- exact tool version and manifest hash;
- exact normalized operation-arguments hash;
- exact tool capability-set hash and required-capability list;
- optional idempotency-key hash, only when the manifest declares support.

The authorization binding repeats and must match the same:

- invocation ID;
- tool version ID and hash;
- arguments hash;
- capability-set hash;
- environment ID;
- policy version;
- evaluation and expiry window;
- exact approval-receipt identities when approval was required.

Immediately before execution, `assertToolInvocationDispatchable()` rechecks:

- invocation is still `ready`;
- parent agent is still running in the captured run/branch;
- environment/tool/capabilities still fit the agent ceiling;
- tool is not disabled;
- immutable manifest and capability declaration still match;
- execution mode is still supported;
- authorization is still exact and unexpired.

This pre-execution revalidation prevents a proposal from surviving a material
permission, environment, tool-version, parent-state, or policy change.

`outcome-unknown` is terminal for that invocation. It is not silently retried
and it does not, by itself, prove that the logical run or durable task failed.

## 4. Durable agent graph

An `AgentInstance` is a process/execution identity, not a display name. The
graph records:

- immutable agent ID and optional parent ID;
- sibling spawn ordinal and derived depth;
- role, objective, and completion-contract hash;
- template and provider-policy revisions;
- context mode and frozen context snapshot;
- exact run and optional execution environment/mode;
- authority ceiling and resource budget;
- output routing contract;
- lifecycle state and terminal reason.

Agent display labels are never used for addressing or authorization.

Child authority is set inclusion, not convention:

```text
child capabilities       subset of parent capabilities
child tool versions      subset of parent tool versions
child workspace grants   subset of parent workspace grants
child environments       subset of parent environments
```

Every child budget dimension is less than or equal to its parent's ceiling:

- input/output tokens;
- cost;
- wall-clock time;
- tool calls;
- child count;
- mutation count;
- mailbox bytes.

A skill, memory, retrieved page, model output, agent message, plugin, hook, or
learned router cannot widen these sets. A wider child requires a new explicit
kernel grant outside this contract.

The graph also enforces:

- one root agent;
- bounded total agent count;
- bounded spawn depth;
- unique sibling ordinals;
- only running/waiting parents can spawn;
- child execution environment is inside its authority ceiling;
- parent completion is rejected while child processes remain active.

## 5. Output routing and branch correctness

The safe default is a fixed output route:

```text
agent spawn
  -> captured branch ID
  -> optional expected parent item
  -> structured result/mailbox delivery
```

Changing the currently active UI branch never retargets background output.

`follow-active` exists only as an explicit, hash-bound authorization case. It
is never inferred from navigation state. `inbox-only` keeps output outside the
conversation until the parent or user deliberately incorporates it.

## 6. Durable task DAG and conflict-aware scheduling

Tasks have stable IDs, dependency IDs, required capabilities/tools, resource
claims, assignment, lifecycle, and structured result identity.

A task becomes ready only after every dependency is durably completed. It may
be assigned only to a schedulable agent whose authority covers all declared
requirements.

A blocked task has two explicit paths. `startAgentTask()` resumes it with the
same exact assignment after authority is revalidated. Sending it back through
`markAgentTaskReady()` clears the old assignment, so a later scheduler decision
must bind a new exact agent rather than inheriting stale process identity.

Resource claims use opaque handles. Raw filesystem paths are not accepted.

Parallel scheduling is conservative:

- non-overlapping claims may run together;
- shared read/read claims may run together;
- any shared resource where at least one claim is write must be serialized or
  placed into an independently isolated copy-on-write boundary.

This is only an eligibility predicate. Native scheduling must still combine it
with environment leases, worktree ownership, capability decisions, resource
budgets, cancellation, and durable journal state.

## 7. Transactional mailbox

The mailbox is the authoritative agent-to-agent protocol; shared files are not.
Every message records:

- immutable sender and recipient agent IDs;
- optional durable task ID;
- typed message kind;
- fixed authority `agent`;
- content hash and delivery-key hash;
- sensitivity classification;
- bounded JSON payload;
- creation, expiry, and acknowledgement timestamps.

The mailbox enforces:

- sender and recipient are distinct members of the same graph;
- an agent message cannot claim `user` authority;
- exact lost-response retries return the existing canonical message;
- reusing a delivery key with changed content conflicts;
- only the exact recipient can acknowledge;
- expired messages are not falsely acknowledged;
- message-count and serialized-byte budgets are bounded.

Native persistence should quarantine malformed messages individually so one bad
entry does not block unrelated recipients or the entire mailbox.

## 8. Structured child result

`AgentResultEnvelope` is the bounded handoff eligible for parent-context
selection. It contains:

- summary;
- claims/findings;
- evidence IDs and confidence;
- artifact IDs;
- inspected opaque resource handles;
- risks;
- unresolved questions;
- immutable content hash.

Raw child transcripts do not enter this envelope. They remain inspectable in a
separate trace projection and enter parent model context only through a later,
explicit Context Compiler selection decision with provenance.

## 9. Native integration target

This TypeScript domain module is not the authority for execution. The future
native implementation needs durable typed tables/repositories for at least:

```text
tool_versions
agent_instances
agent_edges or parent columns
agent_tasks
agent_task_dependencies
agent_task_resource_claims
tool_invocations
tool_authorization_bindings
agent_mailbox_messages
agent_results
```

Every state mutation must follow the existing Omnia authority flow:

```text
native command or normalized executor fact
  -> validate exact scope and expected state
  -> append durable event
  -> update projection in the same transaction
  -> commit
  -> best-effort notify renderer/CLI/web/Android clients
```

Native integration must not begin until the durable run journal, session
enforcement, provider-input freeze, capability broker, exact approval receipt,
and environment lease boundaries required by the affected operation are green.

## 10. Required native gates

Before this feature can be called implemented end-to-end, tests must prove:

- migration preserves valid existing data and rolls back on conflict;
- child capability/budget widening is rejected at persistence and command
  boundaries;
- agent identity never resolves by display name;
- spawn count/depth/child budgets survive restart;
- fixed branch output never follows UI navigation;
- task dependencies survive agent failure and reassignment;
- overlapping write claims never run concurrently without isolation;
- tool invocation and authorization commit atomically;
- argument, version, environment, capability, or policy drift invalidates an
  approval before execution;
- every started tool has exactly one terminal outcome after recovery;
- outcome-unknown is not automatically replayed;
- cancellation is durable and phase-aware;
- exact mailbox retry deduplicates while changed content conflicts;
- mailbox corruption is isolated per message;
- no parent terminal transition can orphan an active child silently;
- child result selection does not copy raw transcript into parent context;
- renderer notification failure cannot change native tool/agent/task outcome;
- replay from cursor reconstructs the same graph, task, mailbox, and tool
  projections;
- secrets, raw paths, headers, cookies, and credential material never enter
  ordinary events, mailbox payloads, results, or UI projections.

## 11. Verified scope of this slice

The focused test suite verifies eleven domain scenarios:

1. tool namespace/effect/capability validation;
2. model exposure and disablement;
3. exact tool authorization and terminal outcome-unknown;
4. child authority/budget narrowing;
5. fixed branch output routing;
6. every parent terminal transition blocked by an active child;
7. task dependency, assignment-authority, blocked-task requeue, and
   write-conflict behavior;
8. task-bound tool calls require the exact active assignment;
9. mailbox exact replay, monotonic delivery sequence, and delivery-key conflict;
10. mailbox authority and acknowledgement scope;
11. bounded structured handoff without a transcript field.

The appropriate product status is therefore:

> Agent/tool/task/mailbox domain contract implemented and focused-test
> verified; native durable orchestration, execution, recovery, IPC, telemetry,
> inspector UI, and multi-client projection remain planned.
