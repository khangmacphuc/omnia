---
id: OMNIA-TWIN-CURRENT-README
title: Current-tree Project Twin
status: generated-evidence-projection
---

# Current-tree Project Twin

This directory is the generated, evidence-linked projection of the Omnia
repository at the source snapshot used to generate it. It is intentionally
separate from the normative Project Twin contract under
[`docs/omnia-ultra/project-twin/`](../omnia-ultra/project-twin/).

`catalog.json` is the human-owned input and `catalog.schema.json` is its strict
editor/schema contract. `npm run twin:bootstrap` validates both and produces
these deterministic outputs:

- `manifest.json` — schema-compatible snapshot manifest with source and evidence hashes;
- `graph.json` — canonical nodes and edges with source line references;
- `atlas.html`, `atlas.css`, `atlas.js` — offline, keyboard-accessible atlas;
- `graph.schema.json` — local validation contract for the graph projection.

The projection reports the current tree honestly. `implemented` and `verified`
are evidence labels for the named slice, while `partial`, `preview`, `planned`,
`deferred`, and `blocked` remain visible in the atlas. Presence in the graph is
not proof that a normative requirement is complete.

This current-tree catalog is a human-maintained, evidence-linked architecture
projection; it is intentionally not an automatically generated mirror of every
row in the Omnia Ultra requirements registry or capability ledger. The
requirements registry, capability ledger, acceptance catalog and
`docs/IMPLEMENTATION_STATUS.md` remain authoritative for ledger-wide coverage
and implementation truth. A capability absent from this catalog must therefore
not be interpreted as implemented, verified, or otherwise covered by the
Project Twin.

## Refresh and check

From the repository root:

```powershell
npm run twin:bootstrap
npm run twin:check
```

The generator excludes its own generated outputs, build directories, package
dependencies, transient `test-results/` receipts, ignored local command logs
and `.out` pointers, and preserved release binaries from the source snapshot.
Every
source reference and evidence record receives a SHA-256 content hash. If a
source file changes, rerun the generator; the new revision hash makes the old
projection distinguishable and downstream consumers can mark stale views.

Generation fails closed when a catalog source path is missing, a line range is
invalid or extends beyond the current file, an ID/evidence link is malformed,
or a catalog field falls outside the declared input contract. This prevents the
atlas from presenting broken “exact line” links as evidence.

Open `atlas.html` directly in a browser or serve the repository over a static
file server. It makes no network requests and does not claim native runtime
behavior that is not represented by an evidence record.
