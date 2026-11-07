---
id: OMNIA-RESEARCH-HARNESS-EVIDENCE-REFRESH-2026-09-21
title: Harness evidence refresh for Omnia
status: local-snapshot-refresh
last_reviewed: 2026-09-21
---

# Harness evidence refresh — 2026-09-21

This note records the exact local upstream snapshots used by the renderer-only
Harness capability synthesis preview. It is a provenance register, not a claim
that Omnia implements the compared systems or that these clone heads are the
globally latest upstream releases.

## Evidence register

| Source | Local revision | Revision date | License / terms | Evidence scope | Local snapshot |
|---|---|---:|---|---|---|
| DeepSeek Harness | `c291e7961a515f6d7af9304e7fd1d257929aef26` | 2026-09-10 | MIT | Open-source plugin architecture, session/event surfaces, agent coordination, and extension lifecycle | `research/upstreams/deepseek-harness` |
| OpenAI Codex | `31ffe2bc9adccfe5fd3d29208250f796a13aa7a0` | 2026-09-15 | Apache-2.0 | Open-source CLI/app-server protocol, thread/turn/item lifecycle, tools, approvals, and agent/worktree boundaries | `research/upstreams/openai-codex` |
| Claude Code official artifacts | `f96c3b49c4c8721685206aaab23609b2d399df4e` | 2026-09-15 | Anthropic commercial terms | Official public repository, plugins, changelog, and documentation signals; proprietary runtime/desktop internals are not asserted | `research/upstreams/claude-code-official` |

The revision values above were read from each local clone's `HEAD` on
September 21, 2026. The refresh therefore establishes a reproducible local
baseline. Before a release claim, re-fetch or verify upstream refs and record a
new dated refresh instead of silently calling this baseline “latest”.

## Clean-room and provenance boundary

- The synthesis uses architecture signals and public documentation patterns,
  not copied source code, prompts, CSS, logos, icons, or proprietary UI assets.
- `research/upstreams/claude-code` is a user-provided leaked snapshot and is
  excluded from the evidence register and implementation basis.
- Upstream repositories are research inputs only. They are not installed,
  executed, imported as runtime dependencies, or granted authority by the
  preview.
- The renderer preview cannot mint permissions, call providers, spawn agents,
  acquire leases, execute commands, write the repository, or persist evidence.

## What this refresh changes in the UI preview

The Harness synthesis panel now exposes the source register beside each signal
and includes the refresh date, revision, license, snapshot path, evidence
strength, and scope in JSON/Markdown export previews. These fields make it
possible to distinguish a pinned local source snapshot from a current runtime
fact.

The panel continues to label the result `Preview only`, `Renderer-local`, and
`No durable write`. A source revision is evidence about what was inspected; it
does not prove provider health, feature parity, native replay, agent dispatch,
or durable completion.

## Reproducible refresh procedure

From the Omnia repository root:

```powershell
foreach ($path in @(
  "research/upstreams/deepseek-harness",
  "research/upstreams/openai-codex",
  "research/upstreams/claude-code-official"
)) {
  git -C $path rev-parse HEAD
  git -C $path show -s --format="%H%n%ad%n%s" --date=iso-strict HEAD
}
```

If any clone is fetched or checked out at a newer revision, update this note
and `src/features/workspace/harness-evidence-register.ts` together, then run
the focused Harness suite and the normal source-ledger/Twin refresh after all
concurrent writers have stopped.

