---
id: OMNIA-ULTRA-RUNTIME-BROWSER
title: Browser workspace, privacy and authorized capture
status: normative-target
---

# Browser and capture

Profiles:

- isolated;
- persistent Omnia;
- user-selected Edge Canary through supported browser broker/extension;
- remote or machine-bound browser.

Prefer official API, DOM, CDP, accessibility tree and authenticated user session.
Use manual takeover for CAPTCHA.

Privacy controls:

- ad/tracker filters;
- per-site permissions/exceptions;
- cookie/referrer policies;
- DNS, proxy, VPN and tunnel profiles selected by the user;
- network diagnostics and visible destinations.

Authorized capture supports request observation, redirect graph, manifests,
HLS/DASH segment maps, byte ranges, lazy resources, quality variants, retry,
resume, deduplication, checksums, timeline/audio synchronization, subtitles,
metadata, PDF page completeness and artifact lineage.

Capture is limited to assets the user owns or is authorized to access. No CAPTCHA
solver, fingerprint spoofing, anti-bot stealth, password/cookie-vault extraction,
DRM key extraction, paywall or entitlement bypass.

