# Reference workbench receipt

- Cycle: `rebuild-0001`
- Scope: `src/rebuild/reference/reference-data.ts`,
  `reference-workbench.tsx`, `reference-workbench.css`,
  `reference-workbench.test.tsx`, `docs/rebuild/research/SYNTHESIS.md`
- Source revision: working tree `codex/omnia-original-rebuild` at capture time
- Implementer: `/root/rebuild_reference_workbench`

## Evidence

| Command | Result |
| --- | --- |
| `npx.cmd vitest run src/rebuild/reference/reference-workbench.test.tsx --reporter=dot` | **PASS**, 1 file / 4 tests |
| `git diff --check -- src/rebuild/reference docs/rebuild/research/SYNTHESIS.md` | **PASS** (scoped) |
| `npx.cmd tsc -p tsconfig.app.json --noEmit --pretty false` | **BLOCKED by other rebuild slices**: browser workspace TS2532/TS1345, chat exact-optional and unused state, IDE bridge type error. No reference-workbench diagnostic was reported. |

## Coverage

- Eight source observations across agent, IDE, browser, research and workflow
  are represented with exact source paths, revision/freshness text, strengths,
  weaknesses, disposition and acceptance checks.
- Two new open-source sources were actually read this cycle at pinned HEADs:
  `ag-ui-protocol/ag-ui` commit `dbfbddb7b3b898dc120b90610c941173b982757f`
  (events documentation path); `assistant-ui/assistant-ui` commit
  `f9dbafab250c8ac315bfc010a30dfff62320a423`
  (`apps/docs/content/docs/(reference)/api-reference/primitives/thread.mdx`).
  A raw AG-UI TypeScript path returned 404 and is recorded as a failed lookup;
  no metadata or license claim is made for that failed request.
- The workbench is original Omnia source. It does not import old renderer
  components/CSS/tokens and does not embed a live editor or browser application.
- Filters, search, keyboard focus, held-out source filtering, empty state and
  provenance/detail disclosure are covered by the focused test.

## Limits and next work

- The workbench is a research/decision surface, not proof of native persistence,
  provider execution, browser capture, or UI parity. Those remain separate DoD
  criteria and require runtime receipts.
- The full application typecheck is currently blocked by diagnostics in other
  concurrently written slices; root must rerun after those owners repair them.
- Upstream licenses remain `unknown in extraction` unless independently verified;
  this receipt intentionally does not infer a license from source appearance.
