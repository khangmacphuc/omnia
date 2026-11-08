# Cycle 7 native capability audit — 2026-11-08

**Scope:** `ADVSET-003` (catalog discovery and route binding) and `ADVSET-001` (per-session generation settings/capability negotiation).

**Result:** changes required. This is a read-only source audit. No Cargo test or packaged desktop run was performed in this slice; the active checkout may have concurrent builds, so source evidence is kept separate from runtime evidence.

## Findings

### 1. Live catalog discovery exists, but catalog snapshots are not durable

`src-tauri/src/provider_gateway.rs:591-608` exposes `provider_models_list`. It loads a saved provider profile, validates a client, discovers a provider response, and returns `{ profileId, models, discoveredAt }`. `ProviderModelList` at lines 137-143 has no snapshot id or content hash. The parser at `2071-2138` bounds catalog size, removes duplicate/control/empty model IDs, filters unsupported Gemini generation methods and sorts display names. Capabilities at `2894-2929` are preserved only when the live provider explicitly declares them; otherwise `source` is `unknown`.

The renderer wrapper at `src/lib/desktop.ts:2825-2830` is correctly marked **live provider model discovery** and requires the initialized desktop core. The rebuild controller currently treats each response as an in-memory catalog. There is no durable catalog record or refresh lineage tying a response to a later session run. The storage lineage schema has nullable `catalog_snapshot_id` and `catalog_snapshot_sha256` (`src-tauri/src/storage.rs:21440-21474`), but the current preparation comment explicitly says missing catalog/routing evidence remains `NULL` (`21686-21693`).

**Impact:** `ADVSET-003` cannot be Done. A route adapter can add renderer-side deterministic lineage and stale/disappeared state, but native persistence and binding still require a follow-up implementation.

### 2. Session settings are CAS-protected and future-run scoped, but effort is not capability-negotiated

`src-tauri/src/harness_bridge.rs:680-704` accepts `profileId`, `model`, `reasoningEffort`, fallback models and a CAS revision. `agent_session_update` at `717-770` validates identifiers and updates the durable summary with `update_summary_cas`; model/provider changes are documented as applying to the next run while permission mode can affect a live run.

The native gateway validator at `src-tauri/src/provider_gateway.rs:2395-2408` accepts only `none`, `minimal`, `low`, `medium`, `high`, and `max`. It rejects `xhigh` and `ultra` as `invalid_parameter`. Installed provider adapters also collapse `max` to provider-specific high budgets (`src-tauri/crates/omnia-harness/src/provider/openai_chat.rs:51-58`, `openai_responses.rs:51-58`, `gemini.rs:57-64`, `anthropic.rs:56-63`); none accepts `xhigh` or `ultra` directly.

**Impact:** `ADVSET-001` needs an explicit requested/effective effort resolver and capability receipt. Renderer settings may persist `xhigh`/`ultra`, but native dispatch must either resolve them to a declared effective level or fail closed. A renderer resolver is useful evidence but does not by itself prove native dispatch.

### 3. Provider identity is available at native boundaries

`AgentSessionSummary` creation stores `profile_id`, `model`, optional `reasoning_effort`, fallback models and a revision (`src-tauri/src/harness_bridge.rs:503-563`). The desktop types mirror profile/model fields (`src/lib/desktop.ts:1837-1855`). This is sufficient as a transport foundation for carrying a stable `(providerProfileId, modelId)` route, provided the renderer sends both values and the native run preparation binds the same identity into the lineage receipt.

### 4. Native/live evidence boundary remains explicit

The native commands are registered in `src-tauri/src/lib.rs:178-202`, but no packaged Windows UI automation or live provider account run was exercised here. The existence of a Tauri command and source tests must not be promoted to packaged/live completion. Existing provider parser tests cover bounded/deduplicated catalogs and explicit capability declarations, but they do not prove persistence, route selection from Chat, or Windows delivery.

## Recommended next implementation

1. Add a native catalog snapshot record containing profile id, discovered timestamp, deterministic content hash, and model IDs/capabilities; bind snapshot id/hash into prepared attempt lineage.
2. Add a typed capability resolver at the renderer/native boundary that returns requested effort, effective effort, supported values, and reason; treat `ultra` as policy that resolves to the highest explicit capability.
3. Carry profile/model route identity in Chat session updates and verify the prepared native input and lineage read back the same identity.
4. Run focused Cargo tests for provider parser, effort rejection and CAS settings, then capture a packaged command/UI receipt before changing DoD status.

## Claim boundary

This report provides source-level native evidence only. It does not prove durable catalog persistence, packaged Tauri/WebView2 UI delivery, Windows UIA behavior, live provider authentication, or live provider execution.
