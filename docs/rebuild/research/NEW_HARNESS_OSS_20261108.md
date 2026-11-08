# New open-source harness research — cycle 0001

Observed: 2026-11-08 04:10–04:18 Asia/Bangkok (2026-11-07 UTC).
Owner: /root/new_research_harness.
Scope: browser/computer harness, agent runtime, skills, context, permissions, MCP, session persistence.

## Method and evidence boundary

Fresh GitHub queries:
- open source "everything" agent harness browser IDE MCP
- open source "super" computer use agent harness desktop browser
- open source "power" agent workflow MCP IDE browser
- open source "max" agent browser computer use harness

Known baseline repos in ASSIGNMENTS.md (obra/superpowers, browser-use/browser-harness, browser-use/desktop, badlogic/pi-mono) are excluded from novelty credit. GitHub API tree lookup returned HTTP 403 rate limit, so candidates were cloned with git clone --filter=blob:none --depth=1 --no-checkout and read with git show. No installer, build, postinstall hook or downloaded program was executed. Search snippets are discovery evidence only. Source evidence below is pinned to commits and file hashes.

## Reviewed source matrix

| Repository and license | Commit | Exact source read | Observed behavior | Omnia decision |
| --- | --- | --- | --- | --- |
| affaan-m/ECC (former everything-claude-code), MIT | d2ef2680594f9a17526a6e1a2e18b3d242c5d17b | .agents/skills/strategic-compact/SKILL.md sha256 bf1429dbc4ece055ba2ff79b9dc3e926cfa1a39101a88ee8467de062d1a0e7f3; .cursor/hooks/pre-compact.js 5583a33dd961298653e194f531d912c794e36470235347e7402e0b73aeecd118; commands/resume-session.md b09bcb22feb10adbba50accd5dd97d09b60897aa94d05c6c12b6e579cb69cbac | Context/tool-call thresholds, durable file-first session resume and explicit warning that task lists may not survive compaction. Hook is advisory/fail-open. | Apply concept, reimplement. Omnia must write cycle/spec/DoD hashes before compaction; advisory hook cannot be the only gate. |
| [SuperClaude-Org/SuperClaude_Framework](https://github.com/SuperClaude-Org/SuperClaude_Framework), MIT | fe68862c8ed9e2afb8120c2d9e27d0c3a7ce73a2 | docs/architecture/CONTEXT_WINDOW_ANALYSIS.md 62a9c3392f50821e4553bf8d01807bbab6ca5eb6bfe5493aea889c892bc92964; docs/memory/WORKFLOW_METRICS_SCHEMA.md 033e578b3d02a52417c1a28cdcaa8dc9a081e5c1d9f27f0d405fd4e24c412123; docs/mcp/mcp-integration-policy.md 59b7b38731e491dfc7cdb96b597052724f512da18191a72e05962343fb1cecab | Progressive context layers, opt-in memory, append-only token/latency/subagent metrics and task based MCP selection. Reported optimization numbers are not Omnia measurements. | Apply schema shape with local evidence; never copy thresholds or claim reported percentages. |
| [lightpanda-io/browser](https://github.com/lightpanda-io/browser), AGPL-3.0 | 6cfc29e1df1b246fb08c11ad181d670d513bc456 | src/ToolSession.zig 56fd90d5efd129f31501352ddf427001fcb2516d5342bd925a68b1cb660977a3; src/browser/Session.zig 7c3680de4beb878aa2ce25a281eeb3de0451b4f91b8e6b868153d49f5be24baa; src/mcp/Queue.zig 34750f1aea980d76b0c21cdefd368c619f5cf0ccf3ed47b7a3df1bdccd78e9da; src/browser/webapi/ModelContext.zig 750f60089f2e4b6c9fddbee6b1a7627ace7dd1279da14f6f6631a4d649d02b26 | Isolated V8 tool sessions, explicit enter/exit lifecycle, mutex/condition FIFO queue with timeout and close-drain semantics, model context API. | Adapter/defer. Mirror lifecycle and bounded queue contracts; do not link/copy AGPL code without legal review. |
| [agent-sh/agent-workspace-linux](https://github.com/agent-sh/agent-workspace-linux), MIT | b22b1be80b0a9bb4f1b293387551c96015ce10d2 | docs/permission-model.md e18944a1e5a9aab2849fa1137790c570767cb9db10e994b07b3af6deac6001e7; src/permissions.rs c17bbec2841c551152a4a1aaeb17931dea60749f268eccfa6498c314b8e8127e; src/approval.rs 4a4278691941b4112d09056e12c163d3dbd276cc7df0e0e249c306dc7c6ee376 | MCP action marks, app allowlist ceiling, read_only/paused modes, preview-first task plans, explicit reactivation confirmation, atomic control-file publication. Shell allowlist caveat is documented. | Apply contract in native Windows boundary with positive/negative permission tests. |
| [imshaikot/browsentic](https://github.com/imshaikot/browsentic), Apache-2.0 | e618498fe18a4be00c1445b67ee3c180943729b2 | src/daemon/guardrails/policy.ts 0eff689346c010514eaaeac2c1eb01129931178be77c79bedb0fd37bdc8f48e8; src/daemon/agent/approvals.ts d1c08e4108f33f7f8207e0cdc656552ff8a7c2a6c43b774ac0a21e2d49cb2459; src/lib/bridge/tab-sessions.ts 16e1d9e50a970cf573fda94a2d44f76a3c547977c1a7485b61c866082c6d4445 | Origin/action grants persist with restrictive file mode; deny is never bypassed by remembered grant; user and agent tabs, current tab and owned-tab cleanup are distinct. | Apply origin/action grants, tab ownership and resource caps; do not embed extension UI. |
| [context-labs/whip](https://github.com/context-labs/whip), Apache-2.0 | f188b79b52aaa6f8e3dd0b5e9b0f76dfc825a498 | internal/agent/compaction_route.go 65565f1fae763ea9a89c1b83a19fc96aedf1bcf0fc13d0448d856d12a0a38f0c; internal/session/inbox_queue.go 2bb74011fcab3fecb791cbf4311f2e2a07cd908850024ae554a5bd059e2bbcb8; packages/app/src/composer-queue.tsx 2afa3fb9d93eaf59d71a4abe8c0acad359b9c09b703c011568850d213a9b339a | Pinned user instruction plus bounded tail, non-shrink fold detection, logged fallback; exact identity is required to cancel or steer queued input. | Apply pinned authorization, tail bounds, non-shrink detection and exact session/branch/turn cancellation. |
| [salmandev/everything-gemini](https://github.com/salmandev/everything-gemini), Apache-2.0 | 903bb8db6f2ee47a1b1a8bb24a48e2961c4cfa4e | hooks/context-compactor/scripts/compact-context.sh 5a02040f499e595017a94f2f12c97fb9cd1833e988afba8ee31df86a8cc506c0; docs/architecture/memory-and-context.md 989b0fb88af46295583951f27954f190858376bd376bc597834ee390b8aa81ea; skills/continuous-learning/SKILL.md 4615bba562069db3bd2312ecba9336d2c16752232d7a941134b74e24d20be48c | Oversized tool payload signal, durable vs ephemeral memory split, user corrections persisted as candidate rules/knowledge items. | Apply with user consent, isolated verification, snapshot/tag and rollback; no silent self-modification. |
| [k4cper-g/agent-ctrl](https://github.com/k4cper-g/agent-ctrl), Apache-2.0 | 7cc6b3d6d25ae6064aa1cf56d32df3af6e24a212 | crates/core/src/snapshot.rs 0a784e360623b40684bcff1e7bcc66a4b7b61eeeaf1ecefbfb42e5c821ed3efc; crates/daemon/src/session_file.rs 7c9bea471da86479b0a3c00aeb6c31423ecfcecd2c8f97178fd8e688e3440d12 | Cached accessibility snapshots pin a window; settle waits for stable tree; inspect/find uses deterministic handles; isolated UIA sessions can run in parallel. | Apply bounded layered observation, settle, stable handles and snapshot generation/hash in receipts. |

## Discovery only, not implementation evidence

Search also returned INTECHNetworks/Dodaios-Dodaios, nomifun/nomifun-desktop, jeet-dhandha/agent-webbridge, ujjwx1/bossconsole, RealZST/HarnessKit, thClaws/thClaws, sidebutton/sidebutton, OthmaneBlial/FreeComputerUse, and similar. These were not source-reviewed in this cycle and must not be called integrated, licensed or functional.

## Synthesis and follow-up criteria

1. Durable cycle envelope: write cycle manifest with goal/spec/DoD/source hashes, assigned criteria, approvals and next stage before compact/delegation; resume verifies drift.
2. Context pressure is observable: estimate tool payload and provider usage, retain pinned authorization and bounded tail, record whether compaction reduced tokens. Recommendation or mock is not a compact receipt.
3. Permission is layered: action marks -> project/session ceiling -> native OS boundary -> user approval. read_only/paused remain available; reactivation requires explicit confirmation; shell entries warn that allowlists are not sandboxes.
4. Browser state is a lease: observation has tab/window generation, settle status, origin, bounded nodes and content hash; stale snapshots reject actions; user and agent tabs are separate.
5. Queue cancellation is identity safe: session/branch/turn/ingress sequence is required; unknown provider acceptance cannot be blindly retried.
6. Learning is a proposal: corrections become provenance/confidence/consent candidates, isolated verification and rollback.

Follow-up DoD IDs for governance: CTX-REBUILD-01 durable cycle hashes; CTX-REBUILD-02 pinned authorization and non-shrink compact; PERM-REBUILD-01 layered permission; BROWSER-REBUILD-01 generation/hash snapshots; CHAT-REBUILD-01 exact queue cancellation; MEM-REBUILD-01 consented memory rollback.

## Non-claims and reproducibility

GitHub API was rate limited; shallow clone source cache was local TEMP only. Source snapshots are as-of 2026-11-08 and may change. No live provider, authenticated web account, Windows WebView2 package or runtime was exercised. AGPL Lightpanda is reference-only pending legal review. Every applied decision needs Omnia code, tests, runtime receipt and independent review.

