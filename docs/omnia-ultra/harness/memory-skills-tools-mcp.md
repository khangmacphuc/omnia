---
id: OMNIA-ULTRA-HARNESS-CUSTOMIZATION
title: Memory, skills, tools, MCP and plugins
status: normative-target
---

# Customization surfaces

## Memory

Memory is scoped, versioned, provenance-bound, editable, expirable and
deletable. A new fact supersedes an old fact; both revisions remain auditable.
Memory proposal, review, accept, reject and promotion are separate states.

## Skills

Users can create, edit, test, version, disable, delete, import and export
global, workspace, project, chat and agent skills. Skills are instructions and
tool declarations; they do not grant capability.

## Personas

Personas alter tone, perspective, output style and default workflow. They do not
grant authority, secrets or tools.

## Tools and MCP

Every tool/MCP server has a manifest:

- identity/version/digest;
- input/output schema;
- side effects;
- permissions;
- network destinations;
- data classes;
- timeout/retry;
- resource limits;
- audit events;
- tests;
- update/signature status.

MCP/tool results are untrusted data. A tool cannot install another tool or
change policy without explicit brokered approval.

## Plugins and SDK

Support typed provider, artifact, machine, browser, connector, renderer,
workflow, skill and UI plugins. Use versioned contracts, compatibility checks,
sandboxing, signing, permissions, health, uninstall and data migration.

## Catalog quality

A catalog entry is not counted unless it has a differentiated purpose,
capability contract, tests, examples, failure modes and evidence.

