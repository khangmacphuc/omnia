---
id: OMNIA-ULTRA-TWIN-UPDATE
title: Incremental update, provenance and staleness
status: normative-target
---

# Project Twin updates

Use source hashes and dependency maps to update only affected nodes, edges,
documents and atlas data.

Evidence classes:

- source fact;
- static-analysis result;
- runtime evidence;
- deterministic test;
- user annotation;
- AI interpretation;
- unverified inference.

When a source changes:

1. mark dependent facts stale;
2. preserve prior revision;
3. re-run bounded analysis;
4. update affected projections;
5. show diff and reason;
6. refresh evidence/coverage;
7. do not rewrite unaffected user-authored content.

Every release candidate freezes a Twin revision tied to source commit/tree hash,
schema versions, tests, screenshots, build artifacts and source ledger.

