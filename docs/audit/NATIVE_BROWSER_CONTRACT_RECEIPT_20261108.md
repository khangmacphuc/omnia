# Native browser contract receipt — 2026-11-08

This receipt records the browser boundary checks run against the current
Omnia source tree. It documents renderer and native contract evidence only;
it does not promote the packaged WebView2 runtime, GPU/display, Windows DPI,
or external download/history behavior without a packaged run.

## Snapshot

- Repository: `D:/Omnia/repos/omnia`
- Source revision: `55f21dacf5acb2c6f386aff1ece6a5245bad0fc4`
- Verification time: `2026-11-08 00:33 Asia/Bangkok` (2026-11-07 17:33 UTC)
- Working tree: uncommitted integration wave; no source reset or cleanup was performed
- Native test mode: Windows `omnia_native` integration target

## Renderer evidence

Command:

```text
npm.cmd test -- --run src/features/workspace/native-browser-surface.test.tsx src/features/workspace/sovereign-browser-workbench.test.tsx
```

Result: **PASS — 2 test files, 73 tests**.

The focused suite exercises:

- native lease-bound attach/update/release and overlay visibility
- navigation event filtering and stale lease rejection
- typed back/forward/reload/focus/devtools actions
- policy receipt validation for new-window/download events
- persisted native zoom receipt validation and renderer range checks
- bounded native page/selection capture receipts, SHA-256, source, timestamp,
  truncation, and stale-lease rejection
- browser tab history, address bar, target frame messaging, download handoff,
  persistence, bookmarks/userscripts, and sidebar state

## Native evidence

Command:

```text
cargo test --manifest-path src-tauri/Cargo.toml --test omnia_native browser_surface
```

Result: **PASS — 24 browser-surface tests**.

The native unit/integration slice verifies:

- HTTP/HTTPS-only navigation, URL length and local/privileged host rejection
- bounded physical geometry and clipping to the main client region
- distinct lease/controller identity, stale reattach rejection, epoch invalidation,
  bounded tab capacity, and failed-close retry bookkeeping
- typed action whitelist and hidden-page focus/devtools guards
- zoom steps and hard bounds of 25% through 500%, with reset at 100%
- capture projection sanitization, 256 KiB bound, UTF-8 boundary truncation,
  selection/page mode, and SHA-256 readiness
- local-caller origin restriction and renderer tab key isolation
- focus return and asynchronous native keyboard detach ordering

The implementation also wires WebView2 callbacks for:

- `target=_blank`/`window.open` denial with a lease-bound
  `new-window-denied` policy receipt
- native download request/finish policy receipts
- page-load/title/navigation events carrying the current URL and zoom

## Evidence boundary

The following remain **unverified in this receipt** because they require a
packaged Windows WebView2 run with a real page and display:

1. target-blank behavior as observed by the packaged runtime
2. download lifecycle behavior in the packaged runtime, including cancellation
   and destination ownership
3. native history capability/index parity for redirects, SPA transitions,
   repeated URLs, and back-then-new-navigation
4. capture/zoom behavior at packaged WebView2 and non-100% Windows DPI
5. GPU/display cadence and multi-monitor clipping

Accordingly, the browser ledger must remain partial/blocked for those runtime
criteria until that evidence is collected. The renderer persistence criterion
is independently covered by its existing receipt.

