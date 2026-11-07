---
id: OMNIA-ULTRA-RUNTIME-POINTER
title: Virtual pointer and target-window automation
status: normative-target
---

# Virtual pointer

Do not move or capture the user's physical cursor by default.

Priority order:

1. app-specific API;
2. DOM/CDP/browser semantics;
3. Windows UI Automation/accessibility;
4. semantic control invocation;
5. target-window-local supported input;
6. isolated desktop/VM virtual input;
7. physical mouse only by explicit opt-in.

## PointerSession

Persist pointer ID, owning agent, target window/tab/process/machine, coordinate
space, position, buttons, state, color, label, containment boundary, permission,
history and timestamps.

## Visual overlay

When viewed, show a refined blue/cyan virtual cursor with a subtle pulsing halo,
click ripple and optional trail. It is a visualization of agent input, not the
physical system cursor. Reduce Motion and high-contrast modes are required.

## Containment

The pointer is clamped to the exact target surface. Resize, DPI, scroll, zoom,
iframe and remote-stream transforms are versioned. A stale transform blocks
input until remapped. Pointer actions outside the target are rejected and logged.

## Unfocused/minimized behavior

Browser tabs use DOM/CDP and tab screencast without focus. Windows UI Automation
can operate many unfocused controls. Some minimized apps stop rendering; Omnia
must not claim universal minimized capture. Use an isolated desktop, offscreen
restored window, virtual monitor or persistent VM when continuous pixels are
required. Report unsupported foreground-only surfaces truthfully.

The user's physical input has priority. Manual takeover, global pause and
emergency stop are always available.

