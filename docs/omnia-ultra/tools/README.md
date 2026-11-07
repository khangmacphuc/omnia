---
id: OMNIA-ULTRA-TOOLS-INDEX
title: Specification validation tools
status: operational
---

# Tools

Run validate-spec.ps1 from PowerShell to check:

- required files;
- manifest paths;
- JSON parseability;
- Markdown frontmatter;
- unique document IDs;
- recommended file size;
- empty files.

It also checks that the canonical operational prompt is singular and linked by
navigation, that normative goal documents map to atomic requirements, and that
the requirement registry/capability ledger are mutually consistent. Registry
checks include canonical contract/schema paths, goal-document revision
alignment, unique acceptance ownership and one catalog row per acceptance ID.
Ledger checks include requirement backreferences, canonical-spec/security/schema
alignment, resolvable capability dependencies and acyclic requirement and
capability dependency graphs.

This validation checks pack structure, not product implementation.

## Conversation navigation contract check

Run `node docs/omnia-ultra/tools/validate-conversation-navigation.mjs --check`
to verify the envelope and cross-field invariants for the
conversation-navigation schema:

- operation envelopes use schema version `1`, supported operation kinds,
  bounded IDs, strict ISO date-time values, required source anchors and
  fail-closed unknown-field rejection;
- source/target anchors contain non-empty conversation/branch IDs and a
  non-negative event cursor, with bounded optional cursor metadata;
- queue-like operation kinds (`queue`, `steer`, `btw`, `parallel`, `scheduled`)
  require a queue payload with matching `queue.mode`;
- queue items reject unknown fields, unsupported modes/efforts/machine modes,
  malformed priorities, dependency lists, or timestamps;
- scheduled queue items require a valid `scheduledAt` timestamp, and a deadline
  cannot precede a scheduled start;
- dependency IDs are unique, cannot self-cycle, and must reference an item in
  the same validated batch;
- batch fixtures reject duplicate item IDs, unknown dependencies and dependency
  cycles across otherwise-valid queue items;
- the deterministic fixture set covers all five queue-like operation kinds plus
  negative operation-envelope and queue-payload cases.

This is a schema/contract gate only. It does not persist, schedule or execute
queue work and therefore does not promote the queue capability from `planned`.
