# Omnia compact UI continuation — October 1, 2026

Status: **Preview**. This receipt covers a moving uncommitted renderer tree,
not a packaged/native release.

## Changed surface

- Chat starter prompts are disclosed on demand and focus the composer when
  selected. The orientation row is absent after messages appear.
- Project Deck Snapshot prioritizes Next actions. Its advanced policy, cache
  planning, and readonly source ledger are behind a named, stateful toggle;
  Project-specific policy changes and undo history survive hiding and tab
  switching.
- Goal Studio has bounded Previous/Next buttons and a visible `n / total`
  indicator. Sequential navigation clears filters inherited from the prior
  goal; the existing cross-goal queue remains a read-only projection.
- Settings workspace-snapshot options are disclosed on demand while label,
  scope, and Generate preview remain available on the primary surface.

No schema, migration, permission, provider dispatch, cache accounting, or
durable native behavior changed in this slice.

## Same-snapshot bounded checks

| Check | Observation |
| --- | --- |
| Chat canvas, scope, Goal Studio, goal rail | 4 focused suites, 23/23 passed |
| Project Deck, Policy Summary, workspace snapshot | 3 focused suites, 46/46 passed |
| Final Project Deck toggle-history regression | 28/28 passed after test assertion edit |
| App TypeScript (`tsc -p tsconfig.app.json --noEmit`) | Exit 0 |
| Renderer build (`npm.cmd run build`) | Exit 0, 2,103 modules, 1m 14s |
| Live preview (`npm.cmd run smoke:preview`) | `OMNIA_SMOKE_OK`, HTTP 200, Omnia/HMR markers, port 1420 listener retained |

The build reports the pre-existing mixed static/dynamic import warning for
`agent-mesh-supervisor-preview.tsx`. The browser-control tool failed while
initializing its runtime assets, so no current DOM walkthrough or screenshot
receipt exists. Existing user-provided screenshots informed the target but
are not current-render evidence. Native Rust/Tauri compilation was unavailable
because `cargo`, `rustc`, and `rustfmt` were not found on this host.

## Next dependency-ready work

Continue compacting the Chat/Settings interaction hierarchy with the user's
direct preview feedback, and connect goal/queue/steer controls to authoritative
native receipts before labeling them durable or wired. Keep absent telemetry
unknown, and keep local reuse distinct from provider cache evidence.
