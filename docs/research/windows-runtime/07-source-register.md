# Source register

Status: informative research; verify URLs and behavior again before implementation if an API is still preview/experimental.

## Microsoft Windows and Windows App SDK

- [WinApp CLI UI Automation](https://learn.microsoft.com/en-us/windows/apps/dev-tools/winapp-cli/ui-automation) — Microsoft documents UI Automation as a semantic interaction surface and describes a CLI path intended to be useful for headless/locked-session scenarios. Treat this as a reference for capability shape, not as an assumption that the preview CLI is Omnia's runtime dependency.
- [Windows Graphics Capture](https://learn.microsoft.com/en-us/windows/apps/develop/media-authoring-processing/screen-capture) — official screen/window capture API and frame-pool model. Use it for approved current frames; test target-specific minimized/protected behavior.
- [SendInput](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-sendinput) — official system input-injection semantics and UIPI limitation. This is why global injection is not Omnia's default.
- [UI Automation control patterns](https://learn.microsoft.com/en-us/dotnet/framework/ui-automation/ui-automation-control-patterns-overview) — semantic patterns such as Invoke, Value, Selection, Scroll, Toggle, and Transform.
- [SetWindowDisplayAffinity](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-setwindowdisplayaffinity) — window-level capture exclusion/protection; Omnia must expose black/protected capture states honestly.
- [Indirect Display Driver model (IddCx)](https://learn.microsoft.com/en-us/windows-hardware/drivers/display/indirect-display-driver-model-overview) — official virtual-display driver architecture. A virtual monitor provider requires its own signing, installation, lifecycle, and security gate.
- [Windows Sandbox](https://learn.microsoft.com/en-us/windows/security/application-security/application-isolation/windows-sandbox/) — disposable isolation reference; not a persistent-machine substitute.

## Chromium/Edge

- [Chrome DevTools Protocol — Input](https://chromedevtools.github.io/devtools-protocol/tot/Input/) — target-local mouse/keyboard/touch dispatch and related events.
- [Chrome DevTools Protocol — Page](https://chromedevtools.github.io/devtools-protocol/tot/Page/) — screenshots, screencast, lifecycle, navigation, and frame APIs.
- [Chrome DevTools Protocol — DOM](https://chromedevtools.github.io/devtools-protocol/tot/DOM/) — document/node inspection and node identity.
- [Chrome DevTools Protocol — Accessibility](https://chromedevtools.github.io/devtools-protocol/tot/Accessibility/) — accessibility-tree inspection.
- [Microsoft Edge WebView2 — Chromium DevTools Protocol](https://learn.microsoft.com/en-us/microsoft-edge/webview2/how-to/chromium-devtools-protocol) — official Microsoft guidance for using CDP with Edge/WebView2.
- [Microsoft Edge DevTools Protocol](https://learn.microsoft.com/en-us/microsoft-edge/devtools/protocol/) — supported DevTools server and per-target WebSocket attachment for an explicitly launched/attached Edge instance.
- [WebView2 DevToolsProtocolExtension deprecation](https://github.com/MicrosoftEdge/WebView2Announcements/issues/135) — as of July 2026, use the built-in `CoreWebView2.CallDevToolsProtocolMethodAsync`, `CallDevToolsProtocolMethodForSessionAsync`, and event receiver APIs instead of the deprecated wrapper package.
- [Chrome extension debugger API](https://developer.chrome.com/docs/extensions/reference/api/debugger) — supported but high-power companion-extension route for explicit tab debugging/attachment; apply Edge compatibility, exact-tab permission, and security review before adoption.

## Interpretation rules

1. An official API page proves API shape, not that every third-party application behaves identically.
2. Preview tools and samples are research references; they require Omnia conformance tests before becoming runtime dependencies.
3. “Unfocused” is not equivalent to “minimized”. Semantic UIA/CDP access and fresh pixels are separate capabilities.
4. A successful dispatch response is not a postcondition. Omnia must observe and verify the target state.
5. No source in this register authorizes credential extraction, CAPTCHA bypass, stealth automation, DRM bypass, or global input control.
6. The current WinApp CLI documentation explicitly separates UIA-pattern verbs (headless/locked-session friendly) from input-injecting verbs such as click/hover/drag/send-keys (foreground interactive-desktop requirements). Omnia should preserve that distinction in its own transport registry and UI labels.
