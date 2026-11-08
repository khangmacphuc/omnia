# Cycle 9 browser packaged audit

- **Cycle:** `rebuild-0009`
- **Auditor:** `/root/cycle9_browser_packaged_audit`
- **Audit time:** 2026-11-08 (Asia/Bangkok)
- **Checkout:** `C:/Users/khang/.codex/worktrees/omnia-ui-rebuild/publish-worktree`
- **Scope:** clean-room Browser workspace, native browser-surface command boundary, and packaged Windows artifact availability.
- **Change policy:** evidence only; no product source, DoD status, or canonical workflow document was changed.

## Verdict

**Source and renderer checks pass; packaged/native browser evidence is blocked.**

The clean-room renderer has an explicit unavailable state and does not pretend that a Vite preview is WebView2. The native source defines a lease-scoped WebView2 surface and registers all six browser commands. This audit could not promote `BROWSER-001` or any packaged/runtime criterion because this checkout has no MSI, NSIS installer, release executable, installed ChatGPT AppX package, or captured Windows WebView2/UI Automation run.

## Fresh commands and results

| Command / observation | Result | Boundary |
|---|---|---|
| `npm.cmd exec -- vitest run src/rebuild/browser/browser-controller.test.ts src/rebuild/browser/browser-workspace.test.tsx --reporter=dot` | **2 files / 9 tests passed** | JSDOM renderer/controller behavior |
| `npm.cmd run typecheck:app` | **exit 0**, no diagnostics | TypeScript source only |
| `npm.cmd run rebuild:architecture` | **passed; 0 violations** | Clean-room import/copy/embed guard |
| `npm.cmd run check:command-parity` | **passed; 189 renderer calls, 192 registered commands, 192 production definitions** | Static command inventory |
| `npm.cmd run check:acl` | **passed; one main-webview capability, 7 reviewed permissions** | Static Tauri ACL policy |
| `npm.cmd run check:bundle` | **failed** on legacy `src/labs`/`src/features/workspace` manifest and dynamic-import entries | Existing bundle gate; not browser-specific |
| `Test-Path src-tauri/target/release/bundle/msi` | `False` | No MSI available |
| `Test-Path src-tauri/target/release/bundle/nsis` | `False` | No NSIS installer available |
| `Test-Path src-tauri/target/release/omnia-desktop.exe` | `False` | No release executable available |
| `Get-AppxPackage -Name '*ChatGPT*'` | `[]` | No installed ChatGPT package visible to this account |

The npm invocations emitted the environment warning that npm 12.2.1 does not officially support the installed Node `27.0.0-nightly...`; the commands above nevertheless returned the stated results. No Cargo build was started, per the assignment's serialized-build constraint.

## Source and contract review

### Renderer

Reviewed `src/rebuild/browser/browser-controller.ts` and `browser-workspace.tsx`:

- `createBrowserNativePort()` reports `available: false` when Tauri internals are absent and rejects native calls with an explicit preview-unavailable error.
- Renderer calls are limited to `browser_surface_attach`, `update`, `navigate`, `action`, `capture`, and `release`.
- URL validation allows only public `http:`/`https:` addresses and rejects credentials, loopback, localhost, control characters, and overlong addresses.
- Tab state does not invent a lease (`leaseId: null`) until native attach succeeds.
- Capture requires an attached, visible lease and validates receipt identity, URL, mode, timestamp, byte count, source, and SHA-256 content hash.
- Dispose/release paths invalidate stale operations and retain cleanup failure notice instead of silently claiming teardown success.
- The Browser preview labels itself `Native WebView2 surface not connected` and exposes `preview`; the capture action reports an unavailable state without fabricating page text.

### Native source

Reviewed `src-tauri/src/browser_surface.rs`, `src-tauri/src/lib.rs`, and `src-tauri/tauri.conf.json`:

- `browser_surface_attach/update/navigate/action/capture/release` are Tauri commands registered in `src-tauri/src/lib.rs`.
- The native layer requires the local main webview caller; child `omnia-browser-*` webviews are denied application IPC by `deny_browser_invokes`.
- `browser_url` applies the same public HTTP(S), credential, loopback, and localhost restrictions at the native boundary.
- Attach creates an externally loaded WebView2 child with a bounded profile directory, navigation policy, denied new-window policy, denied-download policy, and an explicit lease.
- Bounds are finite, clipped to the host window, and rejected when invisible or outside the client region.
- Capture reads bounded DOM text through a closed native script, hashes the returned bytes, and rejects stale navigation/release races.
- Release invalidates ownership before visual/keyboard teardown and preserves cleanup retry state when native close/focus handoff fails.
- `tauri.conf.json` packages `msi` and `nsis` and uses the WebView2 download bootstrapper, but configuration is not runtime evidence.

## Test coverage observed

The focused renderer tests cover:

1. Public URL acceptance and credential/loopback/file URL rejection.
2. Search address resolution.
3. Finite, clamped, scaled geometry.
4. Honest unavailable native port in browser preview.
5. Stable lease-free tab defaults.
6. Preview workspace and explicit WebView2 unavailable status.
7. Tab creation and unsafe navigation rejection.
8. Capture refusal without a native lease.
9. Tablist semantics, arrow navigation, and Delete behavior.

The native file contains unit tests for stale leases, reattach races, failed hide/close cleanup, origin restrictions, URL/capture limits, action allowlisting, bounded 32-tab capacity, geometry clipping, and policy receipts. These tests are source-level native evidence; they were not executed in this audit because starting Cargo builds is prohibited for this assignment.

## Evidence matrix

| Requirement | Current evidence | Status | Missing evidence / next action |
|---|---|---|---|
| `BROWSER-001` Native browser lease is explicit | Renderer lease guards; native command source and unit-test source; command registration | **Partial** | Build a Windows package, launch it, and capture attach/update/navigate/action/capture/release with WebView2 and UIA/runtime receipts. |
| Browser preview is honest | `browser-workspace.test.tsx` and explicit unavailable/preview labels | **Evidence at renderer level** | Re-run real browser axe/keyboard capture after current source hashes; keep scope labeled preview. |
| Browser native caller isolation | `deny_browser_invokes`, local-origin checks, source tests | **Source/test only** | Exercise packaged child WebView navigation and attempted child IPC; record native policy receipt. |
| Native geometry and teardown | `clip_bounds`, epoch/lease guards, cleanup retry source/tests | **Source/test only** | Capture packaged resize, hide/show, tab switch, release, and failure recovery. |
| Page text capture receipt | Renderer hash validation and native bounded capture source | **Source/test only** | Capture a real public page in packaged WebView2, including stale navigation and selection/page modes. |
| `PORTABILITY-008` Preview labels are honest | Source and focused renderer assertions | **Partial** | Add a packaged screenshot/runtime receipt that distinguishes `preview` from `packaged` status. |

## Findings and blockers

1. **Packaged runtime blocker:** no MSI/NSIS/release executable exists in this checkout, so Windows WebView2, geometry, keyboard, accessibility, and native browser lifecycle cannot be observed.
2. **Installed-package blocker:** `Get-AppxPackage -Name '*ChatGPT*'` returned no package, so the required read-only package comparison has no local target in this environment.
3. **Static bundle limitation:** `check:bundle` fails on pre-existing legacy `src/labs` and `src/features/workspace` manifest/dynamic-import entries. This does not demonstrate a browser defect, but it prevents treating the global bundle gate as green.
4. **Runtime-provider boundary:** no live provider or remote page execution was attempted; source and preview tests must not be promoted to live/provider evidence.

## Required next attempt

1. Serialize a supported Windows Cargo/Tauri release build and record artifact hashes and version.
2. Launch the packaged app under approved Windows UI automation and capture Browser in Chat → Browser switching, tab creation, public navigation, back/forward/reload/zoom, resize/obscure, capture, and release.
3. Include negative cases for `file:`, loopback, credentials, invalid geometry, stale lease, denied new window, and denied download; preserve native policy receipts.
4. Capture the Windows accessibility tree and keyboard focus order at 800×600 and 1440×900, with `preview` and `packaged` labels distinguished.
5. Re-run the focused renderer checks and a real-browser axe/keyboard audit after packaging; do not change DoD status until runtime evidence is hashed and independently reviewed.

## Reviewed source hashes

| Path | SHA-256 |
|---|---|
| `src/rebuild/browser/browser-controller.ts` | `E383306303BA857C8247C54B5747A64A1961030956AB7B8B954A42B37C551B39` |
| `src/rebuild/browser/browser-workspace.tsx` | `C0D3A99717881C3ACD5B9451D4301155B353B2659508E9F830719F54DC8691AB` |
| `src/rebuild/browser/browser-workspace.test.tsx` | `C39D06DA3551D9CD1D9D3786ACC3B3026A42A7C861A813F6A07FC6811664DC06` |
| `src/rebuild/browser/browser-controller.test.ts` | `F3AAC136DD871464F8C54431EADDCCF24322A2C4DDD56778526DC9E54F89AB68` |
| `src-tauri/src/browser_surface.rs` | `EED4AD96FC9277B8635CCC6D32D296D913D5B01D532CB734CFD5F678D42E8F2F` |
| `src-tauri/src/lib.rs` | `C9BB1D8C58D953CFF62F9BAE78E4D8DD905A4365D136A60CA659EF88D9265D8A` |
| `src-tauri/tauri.conf.json` | `90A6C3D32028B93BA36E26616EF6E441918706E2BDB6BBCA1CB1E2A09AC1E4C8` |

No DoD status was changed by this audit. The result is intentionally bounded to source, renderer tests, static checks, and artifact availability.
