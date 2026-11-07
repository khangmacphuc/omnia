---
id: OMNIA-ULTRA-GOAL-DELIVERY-MAINTAINABILITY
title: Delivery, maintainability and evidence goal
status: normative-target
version: 1.0.0
last_reviewed: 2026-08-14
supersedes: []
requirements_registry_revision: 2026-08-14.6
---

# Delivery and maintainability

Keep native kernel authority separate from renderer presentation. Use typed
commands, durable facts, exact projections, immutable snapshots, capability
grants and migration-safe storage. Organize source into small cohesive modules
with clear names, versioned schemas, ADRs, dependency graphs, runbooks and
professional English comments for non-obvious invariants.

Each slice must include focused unit/integration tests, renderer type/test
checks, native format/check/test checks, visual/accessibility/security gates,
schema validation, bundle/build validation and Project Twin refresh. Record
exact commands, outputs, source hashes, evidence links, current limitations and
host blockers. Keep `implemented`, `wired`, `verified`, `preview`, `planned`,
`deferred` and `blocked` distinct.

Self-update is supervisor/checkpoint based: build a separate slot, validate and
migrate atomically, preserve history/settings, restart a helper, health-check,
resume by idempotency key and roll back on failure. Never replace a running
binary in place, silently install packages or claim a clean release from stale
artifacts.

See `../architecture/authority-and-event-model.md`,
`../architecture/self-update-and-continuation.md`,
`../delivery/acceptance-gates.md`, `../delivery/test-matrix.md`,
`../delivery/roadmap.md` and `../02-PRECEDENCE-AND-STATUS.md`.
