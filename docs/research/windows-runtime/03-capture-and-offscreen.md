# Capture, minimized windows, and offscreen execution

Status: proposed contract; pixel behavior is target-dependent and must be verified per adapter.

## 1. Two independent capabilities

Omnia must expose two independent booleans in every target inspector:

```text
semantic_available: can Omnia query/invoke the target's structure or API?
visual_available: can Omnia obtain a current pixel frame?
```

Permitted combinations include:

| Semantic | Visual | Meaning |
|---|---|---|
| yes | yes | full inspect/act/observe path |
| yes | no | UIA/DOM/API actions may continue; screenshots are unavailable or stale |
| no | yes | vision-only path; actions need stronger confirmation and are fragile |
| no | no | unsupported; ask user to rebind or switch environment |

Never infer `visual_available=true` from a successful click or an old screenshot.

## 2. Windows Graphics Capture

Windows Graphics Capture can create a capture item for a window or monitor and deliver frames through a `Direct3D11CaptureFramePool`. It is the preferred Windows API for an approved target that remains rendered but is obscured by other windows. The capture item is bound to a specific HWND/display identity and must be revalidated when the target is recreated.

Capture metadata to persist:

- target HWND/display ID;
- frame ID and timestamp;
- size and pixel format;
- device scale factor and color space;
- capture consent/indicator state;
- whether the frame is current, delayed, or reused;
- protected-content/black-frame reason;
- redaction policy and hash.

Some windows explicitly opt out of capture using `SetWindowDisplayAffinity`, and protected content or GPU surfaces may produce black/stale frames. The user-facing state must explain the source of unavailability.

## 3. Minimized-window truthfulness

Do not promise that a minimized arbitrary Windows window continues to render. Many applications stop producing compositor frames when minimized; `PrintWindow` is application-cooperative and can return an incomplete or blank result. Windows Graphics Capture may continue for some targets, but this is not a universal guarantee.

When `IsIconic(hwnd)` is true, Omnia should:

1. retain the last frame with a visible `stale` badge;
2. continue semantic/UIA inspection only if the target confirms it is valid;
3. mark visual actions requiring fresh pixels as blocked or `visual_unavailable`;
4. offer a user-approved replacement surface:
   - move a separately launched target into an Omnia virtual display;
   - run the target in a persistent VM/remote desktop;
   - create a headless browser target;
   - restore the user's window only when the user explicitly permits focus/layout changes;
5. never claim that a stale frame is current.

## 4. Offscreen same-host options

### 4.1. Virtual display / indirect display driver

Windows Indirect Display Driver (IDD/IddCx) can expose a software-managed monitor. An Omnia runtime provider may launch a target on that monitor, keep the window non-minimized, and capture the virtual monitor without occupying a physical display. This requires a signed/admin-approved driver package, lifecycle management, DPI/rotation handling, and a separate security review. It is an optional runtime provider, not a renderer shortcut.

### 4.2. Separate desktop object

Win32 window-station/desktop APIs can isolate window namespaces, but GPU/compositor behavior, modern app support, capture, accessibility, and lifecycle semantics vary. Treat a non-interactive desktop provider as experimental until every target family in the test matrix passes. Do not equate a separate desktop with a security boundary.

### 4.3. Persistent VM or remote session

A Hyper-V VM or approved remote desktop is the most reliable route for applications that require a real rendered desktop and pointer/keyboard events but must not touch the user's host session. The pointer is injected inside the guest/session and the host only receives a decoded frame. Machine generation, lease, policy, and screenshot evidence bind every action.

## 5. Browser-specific offscreen capture

Chromium targets can run in a dedicated headless or headful-offscreen browser context. Prefer DOM/AX/CDP control and tab-level screenshots instead of a host window. If a site requires a real GPU/visible page, use a dedicated virtual display or isolated machine rather than disturbing the user's Edge Canary window.

## 6. Frame freshness and transform safety

Every screenshot carries:

```text
frame_id
captured_at
source_target_id
viewport_size
device_scale_factor
scroll_offset
browser_zoom / DPI
window_bounds
transform_revision
content_revision (when available)
```

An action may use a frame only when its age and transform match policy. Otherwise Omnia reacquires a frame/DOM snapshot or pauses for rebind.

## 7. Capture policy and privacy

- Capture only the selected window, process, tab, display, region, or remote session.
- Show a capture indicator and source label.
- Support masks for passwords, secrets, notifications, and selected regions.
- Do not capture the entire desktop as a workaround for one target.
- Store thumbnails and full frames according to retention policy; redact before remote export.
- Respect `WDA_EXCLUDEFROMCAPTURE`, DRM/protected surfaces, and user/application capture policies.

