---
id: OMNIA-ULTRA-GOAL-RUNTIME-SECURITY
title: Runtime, privacy and adaptive intelligence goal
status: normative-target
version: 1.0.0
last_reviewed: 2026-08-14
supersedes: []
requirements_registry_revision: 2026-08-14.6
---

# Runtime, security and adaptive intelligence

`auto` is the default runtime policy. It chooses isolated for untrusted,
destructive or exploratory work and persistent for an explicitly trusted
workspace where continuity matters. The UI shows the reason, scope, expiry and
override. Headless/off-screen/minimized capture is used only where supported;
the virtual pointer is visibly contained to one target window so the user can
continue working elsewhere.

Screen/audio capture is a separate typed grant. A capture session names one
display/region/window/tab and one microphone/app/process/tab audio source,
records track/gap/clock provenance and shows persistent indicator, privacy
pause, per-source stop and emergency stop. Capture never implies input,
filesystem, clipboard, credential, network or privileged authority.

Browser and machine actions require explicit grants, typed approvals,
cancellation, audit and recoverable state. Use supported APIs and user-
configured DNS/proxy/VPN settings; do not implement bot stealth, fingerprint
spoofing, CAPTCHA solving, password/cookie/session-vault extraction, silent
Administrator/SYSTEM/TrustedInstaller escalation, arbitrary reusable elevated
shells or unauthenticated remote control.

Adaptive intelligence is local, consented and redacted by default. It can learn
retrieval, routing, UI personalization, retry choices and scheduling through
offline evaluation, baseline/shadow/A-B slots, drift detection and rollback.
It cannot grant authority, weaken sandbox/security policy, exfiltrate secrets or
capture raw system-wide keystrokes.

See `../runtimes/machines-headless-remote.md`,
`../runtimes/virtual-pointer-window-control.md`,
`../runtimes/targeted-capture-and-presence.md`,
`../runtimes/browser-network-capture.md`,
`../security/hard-boundaries.md` and
`../architecture/adaptive-intelligence-plane.md`.
