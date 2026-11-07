---
id: OMNIA-ULTRA-PRECEDENCE
title: Precedence, evidence and status rules
status: normative
last_reviewed: 2026-08-14
---

# Precedence and status

## Authority order

1. System, platform and explicit user safety constraints.
2. docs/THREAT_MODEL.md and security/hard-boundaries.md.
3. Accepted architecture decision records in docs/adr/.
4. This specification pack's current normative files.
5. Existing domain contracts in docs/.
6. delivery/roadmap.md.
7. Research notes and external references.
8. Screenshots, ideas and non-binding examples.

If a target feature conflicts with a hard security boundary, preserve the
boundary and redesign the feature into a lawful, consent-based version.

## Current implementation truth

docs/IMPLEMENTATION_STATUS.md, tests, source inspection and same-snapshot
commands decide what exists now. This pack does not turn planned behavior into
an implementation claim.

The current repository is uncommitted and may contain user or agent work.
Never reset, revert, delete, stage, commit, create a branch, push or open a PR
unless the user explicitly requests that action.

## Status vocabulary

- Designed: written design, no implementation evidence.
- Implemented: source exists, but not necessarily wired.
- Wired: end-to-end path exists.
- Verified: same-snapshot tests/evidence pass.
- Preview: visible or partial, intentionally incomplete.
- Planned: not implemented.
- Release Candidate: release gates pass with known limitations recorded.
- Shipped: packaged and released through the chosen channel.

Never use complete, perfect, production-ready, replay-safe, billing-safe,
pixel-perfect, fully accessible or full computer-use without the matching gate.

## Evidence rule

Visual claims require screenshots or rendered artifacts. Office/PDF claims
require actual render and inspection. Restart/replay claims require a test that
restarts the relevant process and verifies durable state. Provider usage claims
must distinguish missing from zero and estimates from provider reports.

