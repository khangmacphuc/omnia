# Cycle 8 — new browser/computer harness research (2026-11-08)

## Scope and novelty gate

This note records genuinely new open-source harness sources for Cycle 8. The
existing `docs/rebuild/SOURCE_REGISTER.json` and prior `NEW_*` notes already
cover Superpowers, browser-use/browser-harness, browser-use/desktop,
computer-agent, OpenBrowse, and other Omnia
references. The two repositories below were absent from the register at this
cycle's start, and their exact pinned repository/revision/path tuples are new.
No downloaded code was executed; only read-only GitHub raw/tree metadata was
used.

Search queries used:

1. `open source everything super power pro max browser computer agent harness MCP DOM screenshot trajectory`
2. `site:github.com browser agent harness headless DOM accessibility tree MCP evaluation`
3. `site:github.com microsoft computer use agent Windows browser trajectory state`

Retrieved at: `2026-11-08T08:31:00+07:00` (Asia/Bangkok). GitHub `HEAD`
revisions were pinned with `git ls-remote`; source bytes were fetched from
`raw.githubusercontent.com` and SHA-256 hashed locally.

## Source A — Microsoft UFO

- Canonical repository: <https://github.com/microsoft/UFO>
- Revision: `eae3c0a8d168c47cb10df0652e293e092eda1078`
- License: MIT (`LICENSE`, SHA-256
  `fd532481d828e13a0b13ccb598e02338a3617740675a862ee6bdc1541b68e93d`)
- Search query: `site:github.com microsoft UFO Windows computer agent harness state trajectory MCP`
- Exact files read and hashes:

| Path | SHA-256 | Observation |
|---|---|---|
| `README.md` | `40d9a4010ab122ab50242a0cd7a5320e2fd16b3e53494d988eecdbd94fd8e6e8` | Project scope, Windows GUI agent and Galaxy multi-agent architecture |
| `documents/docs/infrastructure/agents/design/blackboard.md` | `40eb0b0f9ecc4a54db3b5ead96743fba3e37425d350c21eb83f0e7ace8c31e53` | Blackboard coordination contract and shared state boundaries |
| `documents/docs/infrastructure/agents/design/state.md` | `bf8e4a168901a544b446b8caca702c0fa86d05d74e93f4ab5d7b1757b32da715` | Explicit agent state, transitions and lifecycle semantics |
| `documents/docs/client/computer_manager.md` | `c12c63df2a8206af3196c0ca7ff0db0f23701905aed16e5dfa449b69230d79686` | Computer resource/session manager and ownership model |
| `dataflow/execution/agent/execute_agent.py` | `5749f31b05de6aee6ace2517a67601a3403bea49ef283c43a85e6645bd53801a` | Agent execution/dataflow boundary |
| `dataflow/execution/workflow/execute_flow.py` | `1bd2d31c3c4194c5bbc34bd2921dddcadecd0065057d66d30a71332fe7acdf3c` | Workflow execution orchestration |

**Strengths.** UFO treats Windows computer-use resources as managed leases,
separates agent state from coordination blackboards, and makes execution a
workflow/dataflow concern rather than an unbounded prompt loop. The source
also contains trajectory-report and observer concepts that are useful for
replaying and auditing desktop actions.

**Weaknesses and limits.** The Python/Windows implementation is not Omnia's
Rust/Tauri runtime proof. It depends on external Windows automation and its
multi-agent policy is not a security boundary by itself. No Omnia credentials,
profiles, or private desktop state were accessed.

**Omnia decision: apply as a contract reference.** Adopt a typed computer
resource lease, explicit owner/session state, append-only action receipts, and
workflow-level cancellation/unknown-outcome states. Keep the implementation
native to Omnia; do not vendor UFO, copy its UI, or embed its application.
This directly informs browser/computer harness criteria around lazy activation,
lease teardown, capture provenance and subagent coordination.

## Source B — ServiceNow BrowserGym

- Canonical repository: <https://github.com/ServiceNow/BrowserGym>
- Revision: `27a90ce815098f43414e93491e06907af468e45b`
- License: Apache-2.0 (`LICENSE`, SHA-256
  `b192c58991e8ff585cc574615d40e74185404d4b96c1109d423071ab1367344b`)
- Search query: `site:github.com ServiceNow BrowserGym headless DOM observation MCP browser agent evaluation`
- Exact files read and hashes:

| Path | SHA-256 | Observation |
|---|---|---|
| `README.md` | `7b685115ef822989fac9093518d16c46f0202736d005eed56e7f9fc36b43f3ee` | Browser-agent benchmark/runtime scope and task environment |
| `browsergym/core/src/browsergym/core/env.py` | `867cc6efdfead356839fef8a26b492502b8b5e3d165d1b3c17d24aaeec268d63` | Headless defaults, viewport/timeouts, action mapping, video capture and observation lifecycle |
| `browsergym/core/src/browsergym/core/task.py` | `d88602de809c3b808c8adc5ca17d6d0d13a065109673e37326a0a75c5ab78e17` | Typed task entrypoint and task lifecycle contract |
| `browsergym/core/src/browsergym/core/observation.py` | `c3e273ddc222cfd3eaaa2346acfa991df4d77285befee40bc17ee142203a557c` | Layered DOM marking, accessibility-tree merge, screenshots and bounded extraction helpers |
| `browsergym/core/src/browsergym/utils/mcp_server.py` | `5ace8db4ff8639ed79517c7d62ce522144cd7ee3ad23d0779e145cf7526fb3aa` | MCP server boundary, headless config, timeout, action subset and optional video recording |

**Strengths.** BrowserGym explicitly separates task, action and observation
spaces. Its observation pipeline marks DOM elements recursively (including
frames), merges accessibility information, extracts focused element identity,
and can capture screenshots/video. The MCP server exposes a bounded action
subset, timeout and headless policy. This is a concrete precedent for Omnia's
requested layered DOM traversal: inspect outer structure, page incrementally,
and only expand deeper nodes when required.

**Weaknesses and limits.** BrowserGym is a Gymnasium/Playwright benchmark and
not a native WebView2 runtime. Its element marking and Python action executor
must not be copied as-is, and benchmark success does not establish production
permissions, persistence or provider safety. Video recording can be resource
heavy and must remain opt-in in Omnia.

**Omnia decision: apply with bounded adaptation.** Implement an Omnia-owned
observation envelope with lease/tab/document revision, DOM depth/page limits,
A11y and screenshot receipts, byte/token bounds, and explicit untrusted page
data labels. Use an MCP adapter only at the tool boundary and preserve native
permission/cancellation guards. Keep headless/lazy capture off by default
unless the current workflow requests it; record capture/video cost in
observability receipts.

## Cross-source synthesis and gap decisions

1. **Observation should be layered and resumable.** BrowserGym's mark →
   extract → screenshot flow and UFO's state/observer separation imply that
   Omnia should never dump an entire DOM or desktop tree into context. Store a
   cursor keyed by tab/document revision and request outer nodes before child
   nodes; compact only after writing a receipt.
2. **Resource ownership must be explicit.** UFO's computer manager and
   BrowserGym's task environment both expose lifecycle parameters. Omnia should
   bind lease, session, tab, geometry and permission scope to every browser or
   computer action and reject stale receipts.
3. **Evaluation is not runtime proof.** BrowserGym benchmarks and UFO
   trajectories are reference evidence only. Omnia still needs packaged
   WebView2/UIA tests, native permission receipts, cancellation/race coverage,
   and live-provider boundaries before any DoD criterion becomes Done.
4. **Research gap closed for Cycle 8.** These sources add Windows computer
   lease/blackboard state and a layered DOM+A11y+MCP observation model that were
   not represented by the existing Omnia registry. They do not remove any
   blockers in ADVSET-003, ADVSET-001 or CHAT-008.

## Disposition

- `microsoft/UFO@eae3c0a...`: **apply-as-reference**, MIT; exact source read and
  limits recorded above.
- `ServiceNow/BrowserGym@27a90ce...`: **apply-with-bounds**, Apache-2.0; exact
  source read and limits recorded above.
- No source was vendored, executed, or used as a live UI/editor embed.


