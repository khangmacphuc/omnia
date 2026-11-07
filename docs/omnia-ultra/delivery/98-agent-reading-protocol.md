---
id: OMNIA-ULTRA-DELIVERY-READING
title: Protocol for AI and human maintainers
status: normative
---

# Reading and maintenance protocol

Before changing code:

1. Read 00-START-HERE.md and the route-specific files.
2. Read current implementation status and relevant ADRs.
3. Inspect source/tests; do not trust screenshots or old claims.
4. Identify the smallest domain contract being changed.
5. Read the linked schema and tests.
6. Update one source of truth, not duplicate prose.
7. Update manifest/coverage when adding a file or capability.
8. Add migration/compatibility notes for durable changes.
9. Run focused tests and same-snapshot gates.
10. Record evidence and status.

When fixing or scaling:

- first locate the canonical contract by ID;
- trace dependencies and consumers;
- preserve existing invariants;
- add tests before broad refactoring when the bug is ambiguous;
- prefer additive, versioned changes;
- avoid deleting user/agent work;
- inspect event/projection/replay implications;
- inspect permission and redaction implications;
- inspect cost/telemetry implications;
- update Project Twin and source links;
- report exact files, tests, evidence and known limits.

When a feature is partially implemented, make the UI truthful rather than hiding
the gap. A fix is not finished until it is wired, tested and represented in
the coverage matrix.

