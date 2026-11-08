# Omnia clean-room reference synthesis

Cycle: `rebuild-0001` · reviewed 2026-11-08 · source workbench:
`src/rebuild/reference/reference-data.ts` and `reference-workbench.tsx`.

This is a bounded synthesis of source that was actually read. It is not a copy
of any upstream UI and it does not claim feature parity. Exact observations,
source paths, revision freshness, limits and acceptance checks are visible in
the workbench. Zalo and credential/profile artifacts are excluded.

## Decisions

| Contract | Strength retained | Weakness corrected | Omnia decision |
| --- | --- | --- | --- |
| Session/event separation | Session identity survives a run boundary. | A parser or transcript cannot establish replay or provider acceptance. | Durable session + run ledger, typed events, cursor recovery and explicit disconnected state. |
| Stream deltas | Partial lines and text/thinking/tool categories are distinguishable. | Duplicate, stale and out-of-order events remain unsafe. | Add run/sequence IDs, replay snapshots and idempotent terminalization. |
| Content-addressed edits | File snapshots make rollback inspectable. | Path-only identity breaks on rename/delete and extraction is not runtime proof. | Stable pointers plus immutable snapshots, permission receipts and explicit restore. |
| Draft workspace | Review can precede apply. | Conflicts and filesystem permissions need real checks. | Omnia-owned editor with draft/apply/rollback/conflict states; no embedded editor. |
| Browser target leases | Tab-scoped protocol reduces cross-tab leakage. | Connection alone does not prove fresh DOM or native capture. | Native lease/document guards and lazy capture with timestamp/hash receipt. |
| Research fan-out | Query decomposition and citation graph preserve lineage. | Static citation objects cannot prove freshness or corroboration. | Receipt-backed retrieval and visible stale/conflict state. |
| Protocol primitives | Lifecycle/state events and progressive disclosure compose well. | Libraries can replicate visual language and do not solve native trust. | Use interaction contracts only; write Omnia components and native boundaries. |

## Three bounded design passes

1. **Continuity pass:** unify chat, browser and IDE around a selected session,
   while keeping workbench context and session/run identity separate. This
   prevents the usual split-sidebar and transcript/runtime drift.
2. **Evidence pass:** attach source paths, content hashes, timestamps and
   acceptance checks to research, file changes, browser capture and agent runs.
   A visual result without evidence stays Partial.
3. **Resource pass:** lazy-enable browser/computer capture, page context, model
   routing and advanced inspection. Keep default context/tool limits bounded and
   expose applied-vs-requested settings when native support is unavailable.

## Claim limits and next tests

- Extracted specs and source samples are evidence of design intent, not proof of
  an upstream runtime or license unless the registry verifies it.
- Web protocol research is current for this cycle but GitHub API rate limiting
  prevented a fresh metadata response for two candidates; no commit/license
  claim is made for that failed request.
- Product acceptance still requires native persistence, permissions, browser
  lifecycle, editor conflict handling, live provider receipts and UI QA.
- `ReferenceWorkbench` tests its own filtering, keyboard selection, decision
  disclosure and empty state. They do not prove the product shell.
