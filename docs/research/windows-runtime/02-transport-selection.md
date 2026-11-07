# Transport selection and capability tiers

Status: proposed contract.

## 1. Selection algorithm

Transport selection is deterministic and inspectable. It is separate from privilege, approval, and machine selection.

```text
Target discovery
  -> classify target (browser/native/remote)
  -> query semantic capabilities
  -> query visual capabilities
  -> classify side-effect risk
  -> select least-invasive transport
  -> check policy and approval
  -> dispatch and verify
```

The selected transport and the rejected alternatives are recorded as reason codes. `Auto` may choose a transport; it may not widen permissions or silently move work to a different machine.

## 2. Tiered transports

| Tier | Transport | Best use | Physical cursor impact | Main limitation |
|---|---|---|---|---|
| T0 | App/API adapter | Native product APIs, document models, Git, Office APIs | None | Requires a supported integration |
| T1 | Browser DOM/AX/CDP | Chromium/Edge DOM, accessibility tree, screenshots, tab input | None | Web page may be hostile or dynamic; CDP attachment must be explicit |
| T2 | Windows UI Automation | Win32, WPF, WinUI, UWP and accessible third-party controls | None | Poorly instrumented/custom-rendered controls may expose little semantics |
| T3 | Window-local semantic adapter | App-specific protocol, IPC, editor/LSP, native automation | None | Adapter maintenance and version compatibility |
| T4 | Target-local graphical input | Isolated desktop, virtual monitor, VM, remote session | Host pointer unaffected | Requires a rendered target surface and stronger approval |
| T5 | System input injection | `SendInput`, `InputInjector`, VHF/HID | Potentially moves or affects host input | Not target-bound; UIPI/privilege/security limitations; never default |

T5 is a compatibility escape hatch only. It must be disabled by default and cannot be advertised as “non-interfering”.

## 3. Why system-wide injection is not the default

Microsoft documents that `SendInput` serially inserts keyboard/mouse events into the system input stream and is subject to User Interface Privilege Isolation (UIPI); a lower-integrity process cannot inject into a higher-integrity target. It also operates on the system input path, which conflicts with the product requirement that the user's physical pointer remain available.

`InputInjector` and virtual-HID approaches model input at the system/device layer, not as a target-window capability. They add driver/restricted-capability and audit complexity without giving reliable containment to one unfocused window. Omnia should not install a kernel HID driver merely to draw a virtual pointer.

## 4. Browser transport

For Chromium/Edge, prefer:

1. DOM queries and semantic selectors.
2. Accessibility tree.
3. CDP `Input` and `Page` domains.
4. Browser-specific extension/companion adapter.
5. A separate Omnia-managed browser profile in headless/offscreen mode.

`Page.captureScreenshot`, `Page.startScreencast`, DOM/AX snapshots, and `Input.dispatchMouseEvent` are browser-target operations and do not require moving the host cursor. A target tab can be backgrounded; however, throttling, permission prompts, cross-origin frames, or an attached interactive profile can still make visual evidence unavailable. The run must report the actual state.

## 5. Native Windows transport

For native apps, prefer:

1. App API or document model.
2. Windows UI Automation patterns (`Invoke`, `Value`, `Selection`, `Scroll`, `ExpandCollapse`, `Toggle`, `Transform`, etc.).
3. Application-specific automation protocol.
4. Window-local messages only for a narrowly tested adapter.
5. An isolated graphical environment when semantic surfaces are missing.

UI Automation calls may work while a window is unfocused because they target the automation element rather than the physical pointer. This does not guarantee that the app can render pixels while minimized, or that custom GPU surfaces expose automation semantics.

## 6. Isolated graphical transport

When an app requires coordinates, focus, GPU rendering, or a real desktop surface:

- use a dedicated Hyper-V VM or another approved remote/isolated provider;
- bind the pointer to that machine generation;
- render the VM/remote frame in Omnia;
- inject input only inside that machine/session;
- show the cyan pointer in the frame preview;
- keep host cursor and host keyboard unaffected;
- store an attestation, policy hash, frame ID, and action receipt.

Windows Sandbox is disposable and is not a persistent-machine substitute. A persistent workflow should use the project's machine-runtime contract and a verified VM provider.

## 7. Unsupported or high-risk conditions

Pause and show a typed state when:

- the target is elevated and Omnia lacks an approved matching integrity path;
- the UI element is stale or ambiguous;
- the window moved across monitors and transform evidence is stale;
- a protected-content policy prevents capture;
- the app is minimized and no replacement visual surface exists;
- a coordinate-only action would have a destructive side effect;
- the browser session requires a CAPTCHA or manual security challenge;
- a provider/browser/application has no supported automation surface.

Do not silently fall back to global system input.

