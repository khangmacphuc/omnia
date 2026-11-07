# Omnia Harness Architecture: Decentralized Multi-Agent DAG & Sovereign Kernel

- Status: [IN_PROGRESS]
- Target Crates: src-tauri/crates/omnia-harness & src-tauri/crates/omnia-ipc
- Key Dependency: Tokio multi-thread async runtime, Rusqlite, Reqwest

## 1. Executive Summary

The Omnia Harness is the central execution kernel that translates user intent into coordinated, deterministic, multi-agent workflows. It bridges the desktop UI, local storage, proxy engines, and frontier/local LLM providers.

Instead of a rigid, single-threaded agent loop or a shallow 1-level subagent hierarchy, Omnia implements a **Decentralized Multi-Agent DAG (Directed Acyclic Graph)**:
1. **Recursive Subagent Spawning:** Any agent node can spawn specialized child agents, forming a dynamic tree or DAG.
2. **Co-Primary Agents:** Multiple peer agents can run simultaneously without a single bottleneck root (e.g. Lead Architect, Lead Implementer, Lead QA Challenger).
3. **High Concurrency:** Full utilization of 100+ concurrent slots backed by Tokio tasks and shared budget ledgers.
4. **Live Graph Observability:** Real-time state inspection of agent roles, active tools, dependencies, and token expenditures.
5. **Cross-Session Named Pipe IPC:** Bi-directional event bridges allowing chat sessions to read each other's live output and communicate with external CLI tools (Claude Code, Codex CLI, Antigravity).

---

## 2. Multi-Agent Topological Engine

### 2.1 Agent State Machine
Each agent node in the DAG transitions through strict, observable states:
`	ext
[INIT] -> [ADMITTED] -> [RUNNING] <-> [TOOL_EXECUTION]
                            |                |
                     [WAITING_ON_CHILD]  [APPROVAL_REQUIRED]
                            |                |
                     [COMPLETED] / [FAILED] / [CANCELLED]
`

### 2.2 Shared Token Budget Ledger
- All agents in a run share a central SharedBudgetLedger.
- Tokens are deducted atomically using saturating arithmetic.
- When remaining tokens cross the warning threshold, a single warning event is emitted across the DAG.
- If tokens are exhausted, pending requests are rejected with HarnessError::BudgetExhausted, while in-flight tool completions are preserved in checkpoints.

### 2.3 Sibling Isolation & Scoped Namespaces
- Each child agent receives a qualified outward namespace: {session_id}:{agent_id}:{call_id}.
- Approvals requested by Sibling A cannot be approved, rejected, or cancelled by Sibling B.
- File mutations on shared workspaces are serialized via a shared path arbiter to eliminate race conditions between parallel editing agents.

---

## 3. Cross-Session & Cross-App IPC Protocol

Omnia exposes a local named pipe server:
- Windows: \\.\pipe\omnia-session-bridge
- Unix: /tmp/omnia-session-bridge.sock

This architecture allows Omnia sessions to conduct **Orca-style multi-agent debates**:
- Agent 1 (e.g., Anthropic Claude 3.7 Sonnet) drafts an implementation plan.
- Agent 2 (e.g., OpenAI GPT-6.1 Terra) critiques security and boundary edge cases.
- Agent 3 (e.g., Local Uncensored Model) provides unconstrained verification.
- Consensus is reached deterministically before writing to disk.

---

## 4. Quantitative DoD for Harness
- **Spawn Latency:** < 25 ms per subagent node.
- **IPC Message Roundtrip:** < 5 ms via Named Pipe.
- **Budget Integrity:** Zero token leaks across 50 concurrent subagent branches.
