# Upstream catalog reproducibility receipt — 2026-11-08

## Scope

Make the upstream capability catalog check reproducible from a clean GitHub
checkout. The full audit inventory remains optional local evidence; release
source carries only a compact, renderer-safe metadata projection.

## Implementation

- `src/domain/upstream-capability-catalog.snapshot.json`
  - 55 module descriptors and 11 categories;
  - bounded roots, entry candidates, manifest names and aggregate counts;
  - no raw source files, browser profiles, credentials, cookies or per-file
    hashes.
- `scripts/upstream-preview/generate-upstream-capability-catalog.cjs`
  - uses the full `artifacts/upstream-ui/upstream-inventory-current.json` when
    an audit checkout provides it;
  - falls back to the compact checked-in snapshot for release/CI checkouts.

## Verification

Run from `D:/Omnia/publish-worktree`, where `artifacts/upstream-ui` is absent:

```text
npm.cmd run inventory:catalog
PASS — 55 modules

npm.cmd run check:upstream-catalog
PASS — 55 modules, generated catalog is current

git diff --check
PASS
```

The generated `src/domain/upstream-capability-catalog.ts` remains unchanged by
the fallback generation, so the compact snapshot is equivalent to the audited
catalog projection without expanding the shipped trust boundary.
