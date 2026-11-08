# New open-source browser/computer harness research — cycle 0009

**Owner:** `/root/new_research_cycle9_harness`
**Observed:** 2026-11-08 23:45–00:20 Asia/Bangkok (web discovery and local read-only clones).
**Scope:** browser/computer harnesses, durable sessions, MCP boundaries, permission and cancellation contracts, and agent workflow runtime.

## Method, novelty and evidence boundary

Fresh discovery queries (2026-11-08):

- `site:github.com open source browser computer agent harness everything super power pro max 2026`
- `site:github.com open source desktop agent harness browser MCP trajectory permission session lease`
- `site:github.com AI agent runtime harness browser computer use workflow open source Rust TypeScript`

The existing registry and prior harness notes were checked first. `vercel-labs/agent-browser`, `haarness/haarness`, and `Tencent/BrowserSkill` were absent from `docs/rebuild/SOURCE_REGISTER.json` and prior `NEW_HARNESS*` notes, so these repository/revision/path tuples are new for this cycle. Repositories were shallow cloned to a temporary directory solely for read-only inspection. No install, build, postinstall hook, browser profile, credential, or downloaded script was executed. GitHub search summaries are discovery evidence only; claims below come from pinned source files.

## Source A — Vercel agent-browser

- **Canonical repository:** <https://github.com/vercel-labs/agent-browser>
- **Revision:** `4b0e9f01fa8d214d39bbfe5391257640634fb9a0`
- **License:** Apache-2.0 (`LICENSE`; SHA-256 `B93A9AB54E653B0640F7CC6D69B419334ADD5E3E1DE83D08D79E4115ABDC8358` as cloned; license text is the Apache 2.0 grant)
- **Discovery query:** first query above.
- **Exact source read (SHA-256):**

| Path | SHA-256 | Observation |
| --- | --- | --- |
| `cli/src/session_files.rs` | `0889509886C63FCEC6CCED56D887EF9650F1F719F1B87CF117F92142091E27D3` | Enumerates socket, pid, version, config, stream, provider, target, settings and log files as one session-file contract; security settings survive daemon restart until close. |
| `cli/src/browser_security.rs` | `12C07F5D809763B5DCE88A272690659B700DBBD2B4B03C7F8C42506359E7DA69` | HTTPS-only bounded feed fetch with a three-second timeout and explicit Chrome-version/CVE warning; tests cover current, stale and malformed feed cases. |
| `cli/src/native/snapshot.rs` | `36CD1A5773CA9C4D61BFB8E54DE437741EF44D73406109F7003E64B33165C8FE` | Snapshot tests track document identity/loader changes and resolve accessibility references against the current target. |
| `cli/src/mcp.rs` | `589DDF15BA91CDAD6ADAC45F7E00F5CAD93625D44EC6D759DE9B9D87932D4580` | Stdio MCP server keeps stdout JSON-RPC only and delegates tool calls to the same JSON CLI surface, avoiding separate command semantics. |
| `docs/content/docs/sessions.mdx` | `4A63672D80D1A01158D8C58EBB95E5ED94699EBB5BD7EAC2E986A60E3AEA6406` | Session/tab pinning rejects a closed bound tab with `tab_gone`; another session cannot steal a pinned tab (`tab_locked`); profile copy/read-only snapshot and persistent profile modes are explicit. |
| `docs/content/docs/snapshots.mdx` | `161099DE7A074F94104A6363D7EDC6BA0A35D740DE039D3986290FFB280936C9` | Snapshot refs are compact, action-targeted accessibility output that must be refreshed after page changes. |

**Strengths.** A single session-file inventory makes restart/recovery observable; tab pinning prevents silently acting on another session; snapshot refs provide compact action targets; MCP and CLI share one dispatch path; network safety checks are bounded and tested.

**Weaknesses and limits.** This is a Chrome/CDP CLI, not a Windows WebView2/Tauri proof. Profile reuse can expose authenticated state and must remain explicit in Omnia. Security feed parsing is advisory and cannot replace native permission checks. Apache licensing does not make copying UI or implementation appropriate.

**Omnia decision: apply as contract reference.** Add session/tab/document generation to every browser receipt, reject stale or stolen targets (`tab_gone`/`tab_locked` equivalent), make profile borrowing read-only or explicit, and route MCP through the same typed native command boundary as UI actions. Do not vendor or copy the implementation.

## Source B — Haarness

- **Canonical repository:** <https://github.com/haarness/haarness>
- **Revision:** `c68a8ece3f909d4aae1f53724059f37ab1bc4b1c`
- **License:** Apache-2.0 (`LICENSE`; SHA-256 `CFC7749B96F63BD31C3C42B5C471BF756814053E847C10F3EB003417BC523D30`)
- **Discovery query:** second and third queries above.
- **Exact source read (SHA-256):**

| Path | SHA-256 | Observation |
| --- | --- | --- |
| `crates/haarness-core/src/lib.rs` | `454240B1F79E739BEBBD1B39A12A7B3B28FD9858B3BFFBE494D841DDBF7FB78A` | Provider/storage/transport-independent core exports permission engine, runtime, stream limits, unfinished-call recovery and session markers; private environment names exclude credentials/telemetry/session IDs from child processes. |
| `crates/haarness-core/src/approval_mode.rs` | `109D2E7C139985D832C963820E3626F374C7E0B08CC5FF6DCF6C6D04B1CC93D1` | Approval mode is represented as a typed runtime decision rather than a UI-only prompt. |
| `crates/haarness-server/src/browser_policy.rs` | `5183181544374EF3DF740C3627AA361527A34303F7FDE4E2C952991DC81D309C` | Browser policy independently gates browsing/download/upload, validates at most 200 canonical HTTP(S) origin rules, supports exact and leading-subdomain wildcard precedence, and returns a no-retry disabled error. |
| `crates/haarness-workflows/src/coordinator.rs` | `358EA60AEE26030E6E8E84E40648ADEABF0377EFF732BE2A56A125731CC227FC` | Workflow runs acquire filesystem leases, carry cancellation tokens, persist child-agent defaults/warnings, and dispose run-scoped continuations after settlement. |
| `crates/haarness-mcp/src/process.rs` | `E7F65D91B8DE26257A47E2EDFCAA85E0BA65526BF755B79A338A8980C86D0866` | MCP process lifecycle is isolated from the core runtime and has explicit process/credential handling. |

**Strengths.** Core/adapter separation is enforceable in Rust; browser permissions are separate from ordinary tool permissions and normalized by origin; leases prevent duplicate workflow runs; cancellation and terminal delivery are first-class; secret-bearing environment variables are filtered at process boundaries.

**Weaknesses and limits.** Haarness targets its own desktop/CLI stack and is not evidence that Omnia's Tauri commands or packaged UI work. Origin rules and lease files do not provide Windows OS sandboxing. The project is broad; a single source file cannot prove end-to-end behavior.

**Omnia decision: apply with bounds.** Mirror a transport-independent native harness contract: browser access, uploads and downloads each receive separate decisions; canonical origin matching is deterministic; workflow leases and cancellation IDs are persisted; child MCP processes receive a redacted environment. Add positive/negative tests for disabled browser, exact-vs-wildcard origins, duplicate leases and cancellation cleanup.

## Source C — Tencent BrowserSkill

- **Canonical repository:** <https://github.com/Tencent/BrowserSkill>
- **Revision:** `7e862a44d19d0c1e492901fe29562cc7d79af590`
- **License:** MIT (`LICENSE`; SHA-256 `FF0A5776420D71E02C7E46960E74F7C272B2D3FC0DEACBE1F528EC0EB3272FFD`)
- **Discovery query:** first and second queries above.
- **Exact source read (SHA-256):**

| Path | SHA-256 | Observation |
| --- | --- | --- |
| `README.md` | `2A0E20922A4D4EC2D63E729E99EAFE061215538D94D9DD3B15B33B312D88B615` | Describes a visible separate Agent Window, explicit borrowing/returning of existing tabs, shared takeover, structured extraction with coverage metadata, opt-in task video and operation audit. |
| `apps/extension/src/browser-driver/frame-graph.ts` | `75E0CA4EA0FA4820160E4AB6ED08E73691758C0A247E1D5E10C52DDED277FC52` | Builds a frame graph with target/session keys and preserves unavailable frame subtrees as explicit gaps instead of routing through them. |
| `apps/extension/src/browser-driver/command-deadline.ts` | `9E27A36FDAC8280B70F1983F908D2ADABFE0C506A4A75D357193E685E56B8861` | A timed-out CDP read blocks subsequent guarded reads until the original command settles; abort stops waiting but does not pretend the browser command was cancelled. |
| `apps/extension/src/content/cooperation-capture.ts` | `F4A6B26D1A53FAAA9BEE608AC91D97070FD5B8B1610BB3759D1AE4FE91BC6131` | Captures frame/document revisions, human-versus-agent input attribution and excludes password/file/hidden fields from state. |

**Strengths.** Human takeover and agent control are explicit; frame routing keeps unavailable subtrees visible as gaps; command deadlines distinguish caller timeout from native command settlement; sensitive form values are filtered before publication; evidence exports and operation audit are product concepts rather than incidental logs.

**Weaknesses and limits.** It is a Chrome/Edge extension plus local services, not native WebView2 or UIA proof. Shared logged-in browser state and video capture are privacy-sensitive. README feature lists are not sufficient runtime evidence; the extension source does not prove Omnia's permissions or persistence.

**Omnia decision: apply with bounds.** Preserve unavailable-frame gaps in browser receipts, treat native timeout as `unknown` until settlement, capture human/agent attribution without secrets, and require explicit borrow/release ownership. Keep video and operation audit opt-in, bounded, and consent-gated; do not embed the extension or copy its UI.

## Cross-source synthesis and Omnia gap decisions

1. **Browser state is a typed lease.** Combine agent-browser pinning, Haarness leases and BrowserSkill frame targets into an Omnia envelope containing session, tab, frame, document revision, origin, owner and generation. Actions against a stale generation fail before provider dispatch.
2. **Timeout is not cancellation.** A caller abort records `cancel-requested`; native CDP/UIA commands remain `unknown` until settlement or detach. Retry is allowed only for an explicitly retryable, unaccepted operation.
3. **Permission is layered.** Browser origin, upload and download decisions remain separate from tool approval; project/session ceilings and native Windows permission are evaluated before user approval. Disabled browser returns an explicit no-retry state.
4. **Observation is bounded and privacy aware.** Use compact A11y/snapshot refs and frame gaps; cap nodes/bytes/tokens; exclude password, file and hidden values; attach content/document hashes to receipts.
5. **MCP and UI share contracts.** The UI and stdio MCP adapter call one typed native command surface, so permission, lease, cancellation and receipts cannot diverge by transport.

These decisions directly support `BROWSER-REBUILD-01`, `CHAT-REBUILD-01`, `PERM-REBUILD-01`, `CTX-REBUILD-01`, and `ADVSET-001/003`. They do not close packaged WebView2/UIA, live provider, or Windows-native acceptance blockers.

## Reproducibility and non-claims

Source revisions and bytes are as-of 2026-11-08 and may change. Clones were temporary and are not product dependencies. No live provider, authenticated account, Windows WebView2 package, browser profile, video capture, or native runtime was exercised. Search results for Haarness, BrowserSkill and agent-browser were used only to discover repositories; all implementation observations above come from the listed files. Every applied decision still requires Omnia code, positive/negative/cancel/race/reload tests, native/runtime receipts, and independent review.

