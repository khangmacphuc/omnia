---
id: OMNIA-ULTRA-RUNTIME-TARGETED-CAPTURE
title: Targeted screen, window, tab and audio capture
status: normative-target
schema: schemas/capture-session.schema.json
---

# Targeted capture and presence

Omnia can observe an explicitly selected screen, region, window, browser tab,
app/process audio source, microphone or approved system mix without taking over
the user's physical mouse. Capture and input are separate capabilities with
separate grants.

## Capture session

Persist a versioned CaptureSession with:

- session, actor and owning task IDs;
- exact source handle and source type;
- process/window/tab/display identity and generation;
- screen region, DPI, transform and content scale;
- video resolution, frame rate, color space and encoder;
- audio endpoint/process/tab identity, channels, rate and codec;
- foreground, minimized, occluded and render-availability state;
- consent/approval receipt, privacy indicator and emergency stop;
- start/stop times, dropped frames, gaps, clock drift and health;
- artifact/stream destination, retention and lineage.

Stale source generations, window recreation, PID reuse, navigation to a new
origin or device change suspend the session until revalidated.

## Source selection

Expose a preview picker for one window, one tab, one app/process, one display or
one bounded region. Show exactly which visual and audio sources are included.
Remembering a choice requires explicit policy and expiry; selecting one app must
not silently expand to the desktop or every audio endpoint.

Prefer supported semantic access before pixels: app API, DOM/CDP/accessibility
tree and structured logs. Pixel/audio capture is used when it materially helps
debugging, demonstration, remote viewing or media work.

## Video behavior

Use supported per-window/display capture where available. Browser tabs may use
tab screencast or browser-mediated capture. Occlusion should not force physical
foregrounding when a supported capture path remains valid.

Some minimized or hardware-protected surfaces stop producing pixels. Report this
as paused/unavailable, or use an explicitly authorized offscreen window, virtual
monitor, isolated desktop or VM. Never claim universal minimized capture and
never disable platform content-protection controls.

## Audio behavior

Support microphone, selected app/process loopback where the platform exposes it,
browser-tab audio through the browser broker and approved endpoint/system
loopback. Keep each source on a separate track when possible so the user can
mute, solo, inspect, edit or discard it later.

Synchronize tracks on a monotonic clock and record drift, resampling, silence,
dropouts and source changes. Voice-input audio, debugging capture and media
recording use distinct sessions and retention policies.

## Virtual pointer and background control

The target-contained virtual pointer references the same source generation and
coordinate transform as capture. The overlay may be projected into the Omnia
viewer without drawing into the target application. User physical input always
has priority, and pause/takeover/stop are immediate.

An unfocused target may be controlled only through supported semantic or isolated
input paths. Capture permission does not imply input, clipboard, filesystem,
network, credential or privileged authority.

## Presence and privacy

Show a persistent capture indicator in the app, remote client and system-level
surface when supported. Provide per-source mute/stop, temporary privacy pause,
automatic expiry and a complete capture history. Sensitive-window and
secure-desktop transitions stop or redact capture according to policy.

Never record raw system-wide keystrokes, password fields, hidden windows or
ambient microphone/audio without explicit scope. Apply redaction before model,
telemetry, memory, export or remote transmission.

## Performance and recovery

Use bounded frame/audio queues, backpressure, adaptive frame rate/bitrate,
hardware encoding when safe, keyframe recovery and independent local/remote
quality settings. A slow remote viewer must not block the capture producer or
kernel task.

After disconnect/restart, expose whether the session resumed, created a new
generation or has a gap. Never splice gaps invisibly.

## Acceptance

- Selecting one window/process never captures an unrelated source.
- Physical cursor remains unchanged during virtual-pointer operation.
- Resize/DPI/source-generation changes remap or safely block input.
- Audio tracks identify the exact source and preserve synchronization/gaps.
- Minimized/secure/protected limitations are truthful.
- Capture indicators, mute, privacy pause and emergency stop work locally and
  remotely.
- Permission, retention, redaction and artifact lineage survive restart.
