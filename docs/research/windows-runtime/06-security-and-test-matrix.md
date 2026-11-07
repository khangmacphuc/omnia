# Security boundaries and verification matrix

Status: proposed contract; align with `docs/THREAT_MODEL.md` and `docs/security-storage-architecture.md`.

## 1. Prohibited implementations

Do not implement or silently enable:

- browser password-database extraction;
- cookie-vault or raw session-store export;
- Windows credential-vault scraping;
- automatic password retrieval/login;
- CAPTCHA solving or anti-bot stealth;
- fingerprint spoofing;
- DRM/paywall/entitlement bypass;
- security-interstitial bypass;
- silent Administrator/SYSTEM/TrustedInstaller escalation;
- arbitrary reusable elevated shell;
- global `SendInput` as the normal computer-use path;
- kernel virtual-HID installation merely to simulate a pointer;
- unauthenticated remote control;
- unredacted screen/audio capture outside the selected source.

## 2. Capability and approval rules

Each action is evaluated against:

- target identity and generation;
- transport capability;
- target scope (window/tab/process/VM);
- read/write/destructive classification;
- network and secret policy;
- machine lease and generation;
- human-interference state;
- exact approval scope and expiry;
- expected postcondition.

Memory, skills, personas, learned routing, and a virtual pointer never grant capabilities.

## 3. Denial paths

Tests must prove that Omnia denies or pauses when:

- the target HWND is reused;
- the browser document epoch changed;
- the UIA element is stale;
- a coordinate transform is older than policy allows;
- the target is elevated and no approved matching integrity path exists;
- the capture is protected/black/stale;
- the user is actively interacting with the same target;
- the machine generation changed;
- approval expired or is for a different target;
- a requested action would require global system input;
- a CAPTCHA/security challenge appears;
- a plugin requests a broader scope than its manifest.

## 4. Test matrix

### 4.1. Native target families

- classic Win32;
- WPF;
- WinUI 3/Windows App SDK;
- UWP;
- Electron/Chromium desktop;
- Qt;
- Java/AWT/Swing where available;
- Office documents;
- custom GPU/canvas controls;
- elevated and standard-integrity processes.

### 4.2. Window state

- focused;
- unfocused;
- occluded;
- moved across monitors;
- resized;
- DPI 100%, 150%, 200%, 300%, 500%;
- light/dark/high contrast;
- minimized;
- suspended/not responding;
- protected content;
- virtual monitor;
- VM/remote session;
- disconnect/reconnect.

### 4.3. Browser state

- active tab;
- background tab;
- navigation/reload during action;
- nested iframe;
- shadow DOM;
- cross-origin frame;
- slow network;
- throttled tab;
- permission prompt;
- download/segmented media;
- CAPTCHA/manual takeover;
- session expiry;
- existing Edge Canary profile;
- dedicated Omnia profile;
- headless target.

### 4.4. Invariants

- Physical cursor position and button state are unchanged by semantic/isolated actions.
- A pointer never dispatches outside its target containment scope.
- A stale element never receives an action.
- A minimized target is never reported as visually current without a fresh frame.
- Every side effect has an approval/evidence record.
- An unknown outcome remains unknown after restart until reconciled.
- UI close/dismissal never silently cancels a background run.
- Screen/audio capture is limited to the declared source.

### 4.5. Performance and accessibility

- overlay p95 render latency;
- pointer action latency;
- frame FPS/dropped-frame budget;
- CPU/GPU/memory overhead;
- Reduce Motion;
- high contrast;
- keyboard navigation;
- Narrator announcements;
- touch/pen target sizes;
- long Vietnamese labels;
- remote-client latency.

## 5. Exit gate

This lane may be called `Verified` only when a same-snapshot package includes:

- unit and integration tests for each transport;
- target-generation and stale-anchor denial tests;
- physical-pointer invariant test;
- minimized/occluded/protected capture evidence;
- browser background-tab evidence;
- VM/virtual-display evidence where those providers are enabled;
- visual screenshots with the cyan overlay;
- accessibility and reduced-motion evidence;
- redacted trace/audit receipts;
- restart, disconnect, and recovery tests;
- explicit known limitations.

