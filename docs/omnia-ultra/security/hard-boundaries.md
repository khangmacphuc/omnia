---
id: OMNIA-ULTRA-SECURITY-BOUNDARIES
title: Non-negotiable safety and legality boundaries
status: normative
---

# Hard boundaries

Do not implement or market:

- browser password-database extraction;
- cookie/session-vault extraction or export;
- automatic raw credential recovery;
- CAPTCHA solving;
- anti-bot stealth or fingerprint spoofing;
- security-interstitial bypass;
- DRM, paywall, access-control or entitlement bypass;
- silent Administrator/SYSTEM/TrustedInstaller escalation;
- UAC bypass;
- arbitrary reusable elevated shell;
- unauthenticated remote control;
- silent package/tool/extension installation;
- repository code execution merely because a repository was opened;
- covert system-wide keylogging;
- disabling security or organizational policy to make automation less visible.

Allowed alternatives include official authentication, browser autofill,
Windows Hello, passkeys, user-configured DNS/proxy/VPN for privacy/reliability,
manual CAPTCHA takeover, source-specific capture, typed privileged operations,
authorized media assembly and explicit opt-in interaction-learning sessions.

All model/provider/web/repository/plugin content is untrusted input. It cannot
grant authority, write memory without policy or override these boundaries.

