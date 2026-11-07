---
id: OMNIA-RESEARCH-HARNESS-EVIDENCE-REFRESH-2026-09-24
title: Harness evidence refresh for Omnia
status: local-snapshot-refresh
last_reviewed: 2026-09-24
---

# Harness evidence refresh — 2026-09-24

This dated addendum refreshes the local clean-room evidence register for the
three upstream harnesses used by Omnia's renderer-only capability synthesis.
The repository heads were fetched from their configured public remotes and the
local snapshots were detached at the revisions listed below. This is a
reproducible research baseline, not a claim that Omnia implements these
systems, that their private surfaces are available, or that a future upstream
head cannot move again.

## Evidence register

| Source | Repository | Local revision | Revision date | License / terms | Evidence scope |
|---|---|---|---:|---|---|
| DeepSeek Harness | `deepseek-ai/deepseek-harness` | `477b4f420553e8a52c2fbccc464d7561b239c443` | 2026-09-24 | MIT | Plugin/profile lifecycle, session and event projections, agent coordination, approvals, user-question waits, model selection, and Windows/atomic-write fixes. |
| OpenAI Codex | `openai/codex` | `339e981ba71b131eae3e2086a22b143f455a8cb8` | 2026-09-24 | Apache-2.0 | CLI/app-server protocol, thread/turn/item lifecycle, tools, approvals, agent/worktree boundaries, MCP and Code Mode budgets, prompt suggestions, diagnostics, and executor capability discovery. |
| Claude Code official artifacts | `anthropics/claude-code` | `684ffc4da0eaaddcafa61842dc719c6a8febc5c2` | 2026-09-24 | Anthropic commercial terms | Public repository, plugins, changelog, AGENTS.md instruction loading, diff-pane lifecycle, hooks, and telemetry signals; proprietary runtime/desktop internals are not asserted. |

The checked-out paths are:

- `research/upstreams/deepseek-harness`
- `research/upstreams/openai-codex`
- `research/upstreams/claude-code-official`

## Notable deltas since the 2026-09-21 baseline

The delta review is intentionally signal-level. It records patterns worth
checking against Omnia contracts; it does not promote them to shipped
capabilities.

### DeepSeek Harness

- The snapshot advances to the `0.1.7-rc.2` release line.
- User-question flows now include timed waits and late replies, which is a
  useful signal for explicit `waiting-for-user` state, timeout policy, and
  late-answer correlation in a durable run journal.
- Approval and auto-review changes make denial/fallback wording and review
  failures more explicit; Omnia should keep policy outcome, user response, and
  retry decision as separate events.
- Model-selection pending state, background preference saves, profile-bundle
  reporting, and atomic writer-lock takeover receive fixes. These reinforce
  the need for pending/failed/recovered states rather than optimistic UI state.
- The shipped Schedule/time-context surface is being constrained or disabled
  in the reviewed web composition. Omnia should not infer that a catalog entry
  is enabled merely because a source tree contains the feature.

### OpenAI Codex

- MCP and Code Mode input-schema budgets are now configurable, reinforcing
  bounded tool-schema admission and per-route budget receipts.
- Cached catalogs may satisfy MCP startup readiness, while diagnostic reasons
  for attribution errors remain explicit. Catalog visibility and live
  endpoint/provider health must remain separate facts in Omnia.
- TUI prompt suggestions, paginated local history, pending inter-agent mailbox
  persistence, executor capability discovery v2, extension hooks around model
  requests/response streams, and tool-dispatch timing observations are visible
  in the delta range.
- Windows full-access setup, large sandbox launch payload transport, and
  network-policy/Guardian changes reinforce that environment policy and
  executor authority belong to the host boundary, not the renderer.

### Claude Code official repository

- AGENTS.md instruction loading received fixes for truncated reads and nested
  instruction retention; context assembly should expose omission/truncation
  reasons rather than silently treating a partial read as complete.
- Diff-pane behavior now distinguishes resumed edits, checkpointing, first-edit
  opening, and read-only command handling. A future Omnia inspector should
  model pane visibility and checkpoint state independently from the transcript.
- Hook and telemetry changes expose command identity, engine/version metadata,
  session rows, and built-in-plugin boundaries. Omnia should preserve source,
  scope, and redaction provenance for telemetry projections.

## Clean-room and authority boundary

- The synthesis uses architectural signals and public documentation patterns,
  not copied source code, prompts, CSS, logos, icons, or proprietary UI assets.
- The user-provided leaked `tanbiralam/claude-code` snapshot remains excluded
  from the evidence register and implementation basis.
- Upstream repositories are research inputs only. They are not installed,
  imported as Omnia runtime dependencies, executed by the preview, or granted
  authority to spawn agents, call providers, mutate files, or change policy.
- A pinned revision proves only what was inspected at that revision. It does
  not prove current provider health, feature parity, native replay,
  persistence, concurrency, or release readiness.

## Omnia preview impact

The Harness synthesis source register now points at the 2026-09-24 local heads
and exports the new revision/date/scope metadata. The panel remains labelled
`Preview only`, `Renderer-local`, and `No durable write`; its export payload
must not be read as a native capability receipt.

## Reproducible refresh procedure

From the Omnia repository root:

```powershell
foreach ($path in @(
  "research/upstreams/deepseek-harness",
  "research/upstreams/openai-codex",
  "research/upstreams/claude-code-official"
)) {
  git -C $path fetch --no-tags origin
  git -C $path rev-parse HEAD
  git -C $path show -s --format="%H%n%ad%n%s" --date=iso-strict HEAD
}
```

When a later release review changes any head, update this dated addendum and
`src/features/workspace/harness-evidence-register.ts` together, then rerun the
focused Harness suite and the source-ledger/Project Twin refresh after all
concurrent writers have stopped.
