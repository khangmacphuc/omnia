# Browser CDP and Edge Canary attachment

Status: proposed contract; use supported browser/debugging surfaces and explicit user consent.

## 1. Browser target identity

Every browser action binds:

```text
browser_instance_id
browser_context_id
target_id
frame_id
loader_id / document_epoch
origin
url_hash (redacted when sensitive)
navigation_revision
viewport_size
device_scale_factor
```

A DOM node, frame, or tab may be recreated without changing its visible URL. The target binding must reject stale handles after navigation or reload.

## 2. CDP domains to use

Use the minimum domain needed for the action:

- `Target` — discover/attach/detach tabs and frames.
- `Page` — navigation, lifecycle, screenshot, screencast, frame tree.
- `DOM` / `DOMSnapshot` — structured document inspection.
- `Accessibility` — accessibility tree and semantic names/roles.
- `Runtime` — carefully scoped evaluation, never arbitrary page code by default.
- `Input` — target-local mouse/keyboard/touch dispatch; does not move the host OS cursor.
- `Network` — request/response metadata and approved download provenance.
- `Fetch` — only with explicit network policy and bounded interception.
- `Console` — diagnostics.

CDP commands and events are logged by method name, target, redacted parameters, response status, and correlation ID. Raw page content is subject to source/secret policy.

## 3. Background and unfocused tabs

CDP can inspect DOM/accessibility state and dispatch target-local input while the tab is not the active host tab. A background or throttled tab may provide delayed lifecycle events or incomplete pixels. Omnia must report:

- `semantic_available`;
- `visual_available`;
- `frame_age`;
- `background_throttled`;
- `manual_intervention_required`.

Do not infer visual freshness from a successful CDP method response.

## 4. Existing Edge Canary profile

The user's Edge Canary profile is an explicit user-owned session, not a credential source. Omnia may attach through:

- a user-enabled DevTools/remote-debugging endpoint;
- a user-installed Omnia companion extension using supported debugging permissions, treated as a high-power per-tab capability and never granted globally by default;
- an explicit OAuth/API connector;
- a separately launched Omnia-managed profile.

Omnia must not read the Edge password database, decrypt cookie vaults, export raw session stores, or scrape credentials. When a session expires, pause for browser autofill, Windows Hello, passkey, OAuth, or explicit user login.

Do not concurrently launch a second browser process with the same profile directory unless the browser explicitly supports it. Prefer a dedicated Omnia profile for headless/offscreen execution.

For an Omnia-owned WebView2 surface, use the built-in `CoreWebView2` CDP methods. Do not add the deprecated `Microsoft.Web.WebView2.DevToolsProtocolExtension` wrapper to new code. For an external Edge/Edge Canary instance, use the documented DevTools server and exact target WebSocket after explicit user setup; bind the attachment to loopback/device policy and do not expose the debugging endpoint to an untrusted network.

## 5. Semantic pointer behavior

The browser adapter resolves an element anchor first:

```text
role + accessible_name + stable selector + frame_id + semantic fingerprint
```

The virtual pointer UI displays the resolved element's bounding box and the intended action. `Input.dispatchMouseEvent` is used only after target/frame/viewport validation. If the element moved, re-query; do not click its old coordinate.

## 6. Screenshot and screencast

Use `Page.captureScreenshot` for discrete evidence and `Page.startScreencast` for live target previews where supported. Persist frame ID, timestamp, viewport, device scale, and target identity. Do not use a screenshot of the host desktop when a tab-level capture is available.

## 7. Anti-bot and challenge handling

Omnia's browser lane is a privacy/automation tool for content the user is authorized to access. It must:

- prefer official APIs;
- respect rate limits and robots/service policy where applicable;
- use authenticated user sessions without extracting credentials;
- pause for CAPTCHA/security challenges and request manual takeover;
- keep a source/request ledger.

It must not implement CAPTCHA solving, fingerprint spoofing, anti-bot stealth, DRM/paywall/entitlement bypass, or security-interstitial bypass.
