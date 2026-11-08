# Rebuild settings slice receipt

Date: 2026-11-08 (Asia/Bangkok)  
Owner: `/root/rebuild_settings`  
Scope: `src/rebuild/settings`

## Implemented

- Versioned, schema-normalized settings store with safe defaults and bounded
  numeric values. Requested defaults are explicit: context compact 200,000
  tokens, tool output 10,000, retry delay 5 seconds, multiplier 1 and unlimited
  attempts (`0`).
- Advanced settings sections for model/effort, routing, context, bounded
  brainstorm/plan workflow, browser/computer lazy activation, memory/RAG,
  permissions, concurrency, retry, telemetry and dark/light appearance.
- `useSyncExternalStore` subscription, localStorage persistence, BroadcastChannel
  cross-tab updates, import/export/reset and partial/corrupt snapshot recovery.
- Original accessible settings dialog with search, tabs, labelled controls,
  focus-visible treatment, mobile layout and explicit native-permission wording.

## Evidence

| Check | Result |
| --- | --- |
| Source import boundary | No legacy renderer import; module is self-contained under `src/rebuild/settings`. |
| Defaults | Covered by `settings.test.ts`. |
| Corrupt/partial input | Covered by normalization and parse tests. |
| Persistence/subscription | Covered by localStorage and subscription test. |
| Native settings application | **Not claimed**; this slice defines requested renderer state and clearly leaves native application to the root bridge. |

The root integrator must run the focused test and strict typecheck after wiring.
Do not mark native hot reload or OS permission criteria Done from this receipt.
