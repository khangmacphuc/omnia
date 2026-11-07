# Windows virtual input, window automation, and offscreen capture

Status: informative research and proposed contracts; this folder does not claim that these capabilities are shipped.

This folder defines the clean-room design for Omnia's browser/computer-use lane when the user must keep using the physical mouse and keyboard. It separates semantic automation from visual capture, models a virtual pointer as an Omnia object rather than an injected system cursor, and specifies honest fallbacks when a target application cannot render while minimized.

## Why this folder exists

The product goal asks for all of the following at once:

- a visible cyan/blue agent pointer and action trail;
- control of one target window, tab, process, or remote session without moving the user's physical cursor;
- operation while the target is unfocused, occluded, or (when technically possible) not present on the physical desktop;
- DOM/accessibility inspection and screenshots for browser and native applications;
- a truthful explanation when an application does not render while minimized;
- durable action logs, screenshots, traces, approvals, and replay evidence.

These requirements cannot be satisfied by one universal Windows API. The implementation must select a transport per target and per action.

## Read in this order

1. [`01-virtual-pointer-contract.md`](01-virtual-pointer-contract.md) — durable pointer/session/action objects and user-visible behavior.
2. [`02-transport-selection.md`](02-transport-selection.md) — semantic, browser, native, isolated, and virtual-display transport tiers.
3. [`03-capture-and-offscreen.md`](03-capture-and-offscreen.md) — Windows Graphics Capture, minimized-window limits, virtual monitors, and VM fallbacks.
4. [`04-browser-cdp.md`](04-browser-cdp.md) — CDP/Edge/Chromium target attachment, DOM/AX inspection, screenshots, and background-tab behavior.
5. [`05-observability-and-proof.md`](05-observability-and-proof.md) — action lifecycle, proof receipts, latency, and privacy-preserving telemetry.
6. [`06-security-and-test-matrix.md`](06-security-and-test-matrix.md) — capability/approval boundaries, denial paths, and the verification matrix.
7. [`07-source-register.md`](07-source-register.md) — official/public sources, interpretation, and freshness.
8. [`08-advanced-design-ideas.md`](08-advanced-design-ideas.md) — Window Twin, semantic hover cards, intent/execution/verification overlays, target leases, shadow mode, and adapter-learning ideas.

## Non-negotiable product rules

1. The physical cursor is never moved by default. `SetCursorPos`, `SendInput`, and system-wide input injection are not the normal path.
2. A virtual pointer is a logical, target-bound Omnia object. Its cyan halo is rendered in Omnia's preview/inspection surface or in an isolated target surface; it is not evidence that the OS cursor moved.
3. Semantic control is preferred over coordinate control: browser DOM/AX, Windows UI Automation, application APIs, then isolated graphical input.
4. A window may be semantically inspectable while its pixels are unavailable. The UI must expose these as separate capabilities (`semantic_available` and `visual_available`).
5. Minimized/occluded capture is never promised without evidence from the target. If a target stops rendering while minimized, Omnia must use a virtual display, isolated machine, or an explicit `visual_unavailable` state.
6. Existing user browser sessions are attached through supported automation/debugging interfaces. Password database, cookie-vault, raw session-store, or credential extraction is prohibited.
7. Every action is approval-checked, durable, correlated, and independently observed. “Mouse moved” is not completion; the target must acknowledge or the run is `outcome_unknown`.
8. A visual overlay is an observability affordance, not a stealth or anti-bot feature. CAPTCHA, DRM, paywall, entitlement, and security-interstitial bypass remain out of scope.

## Maturity vocabulary

Use `Proposed`, `Accepted`, `In progress`, `Implemented`, `Verified`, and `Deferred`. Do not label a path “full computer use” or “minimized capture” until the corresponding test matrix and artifacts pass in the same source snapshot.
