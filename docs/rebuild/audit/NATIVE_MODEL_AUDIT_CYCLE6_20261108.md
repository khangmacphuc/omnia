# Native model discovery and routing audit — cycle 6

**Reviewer:** `/root/cycle6_native_model_audit`  
**Scope:** clean-room renderer model discovery, native provider catalog command,
provider adapter effort handling, and the path from a selected model to a chat
run.  
**Checkout:** `C:/Users/khang/.codex/worktrees/omnia-ui-rebuild/publish-worktree`  
**Observed:** 2026-11-08, Asia/Bangkok  
**Revision inspected:** `29d72309d8396e45d5f8369b6c6ea80e2a0fccef`  
**Result:** **changes required; native/live model behavior remains incomplete**

This is an independent source and renderer-contract audit. It does not claim a
packaged Tauri command, a Windows credential-store read, a live provider
account, a provider billing result, or a model accepted by a running provider.
No product or native source was edited. The audit does not change DoD status.

## Evidence boundary and current counts

At the time of this audit the canonical matrix contained **0 Done / 23 Partial /
8 Blocked / 209 Planned (240 total)**. The focused renderer command below passed
23 tests. The native command was not run because the repository contract
serializes Cargo builds and this slice is read-only. Existing Rust parser tests
were inspected as source, not counted as an executed native pass.

```text
npm.cmd test -- --run \
  src/rebuild/settings/model-discovery.test.ts \
  src/rebuild/settings/model-discovery-native-bridge.test.ts \
  src/rebuild/settings/ModelDiscoveryPanel.test.tsx \
  src/rebuild/settings/settings.test.ts --reporter=dot

exit 0
Test Files  4 passed (4)
Tests       23 passed (23)
```

The test run exercises decoder/controller behavior and mocked IPC only. It does
not contact a provider or invoke `provider_models_list` in a desktop process.
The npm run emitted the known Node 27 nightly compatibility warning; it did not
change the exit code.

## Positive native/source evidence

The native boundary has useful safety properties that should be retained:

1. `src/lib/desktop.ts:2825-2829` exposes `listProviderModels(profileId)` only
   through `requireDesktop("Live provider model discovery")` and sends an opaque
   profile ID. The renderer does not send credentials or endpoint URLs.
2. `src-tauri/src/lib.rs:178-179` registers both
   `provider_connection_test` and `provider_models_list`.
3. `src-tauri/src/provider_gateway.rs:592-606` reloads the selected enabled
   native profile, validates its resolved destination and credential through the
   native secret service, discovers through the provider-family adapter, and
   returns a timestamped catalog. `validated_client_for_profile` applies HTTPS,
   local-network grant, DNS scope and blocked-destination checks.
4. `provider_gateway.rs:35-41,844-851,2071-2140` bounds response bytes to 16 MiB,
   model count to 2,000 and model IDs/labels to 512 bytes, drops duplicate or
   control-character IDs, sorts output deterministically and filters Gemini
   entries that do not advertise content generation.
5. `provider_gateway.rs:2894-2929` preserves only explicit live capability
   declarations (`tools`, `vision`, `reasoning`) and marks absent declarations
   `unknown`; it does not infer capability from a model name or provider brand.
   This is the correct safety posture for OpenAI-compatible and local endpoints.
6. `src/rebuild/settings/model-discovery.ts:53-82` validates profile/catalog
   shapes, profile identity, timestamps, duplicate IDs, bounds, control text and
   tri-state capability values. It deliberately retains no credential or endpoint
   field in the renderer snapshot.
7. `model-discovery.ts:90-148` uses a revision epoch to ignore stale success and
   failure responses after provider changes, refreshes or UI cancellation. The
   panel honestly says that “Stop waiting” cancels UI acceptance only because no
   native abort operation exists.

These properties justify keeping the native command as the starting point. They
do not establish that the command is wired to the packaged app or that a
provider returned a catalog in this checkout.

## Findings, ordered by acceptance risk

### High — discovered models do not feed the Chat model route

**Criteria affected:** `ADVSET-003`, `CHAT-011`, `CHAT-012`, `ROUTING-001`,
`ROUTING-010`.

- `src/rebuild/settings/SettingsPanel.tsx:47-50` mounts discovery and writes the
  chosen `providerProfileId` and `defaultModel` to the renderer settings store.
  This is a requested global preference only; no native session update is made
  and no native acknowledgement or effective revision is consumed.
- `src/rebuild/chat/chat-view.tsx:42` still offers hardcoded `auto`, `local` and
  `frontier` options. It does not read the discovered catalog or selected
  provider profile.
- `src/rebuild/chat/chat-controller.ts:339` creates a project session with
  `profileId: "default"` and `model: "default"`; `:364` updates only model and
  effort and has no `profileId` in its update input. A catalog model selected in
  Settings therefore cannot identify the provider profile used by the next
  native run.
- `chat-controller.ts:125,134-135` accepts any renderer effort in its union and
  forwards it to `agent_session_update` without capability negotiation.

**Impact:** The clean-room Settings picker can display a real catalog in a
desktop build, but selecting a model does not make that model available in the
Chat composer or bind the selected provider to a run. A UI selection can look
successful while the native session remains on `default`.

**Required correction:** Use one typed catalog store for Settings and Chat;
include `profileId` in the session update request; resolve a selected
`(profileId, modelId)` against the latest catalog before dispatch; and show
`requested`, `native-confirmed`, `missing`, and `unsupported` states. Keep an
active run bound to its frozen route while future sends use the acknowledged
selection.

### High — `xhigh` and `ultra` are accepted by the renderer but are not native effort values

**Criteria affected:** `CHAT-012`, `SETTINGS-007`, `ADVSET-001`.

- `src/rebuild/settings/settings.ts:161` accepts
  `none/minimal/low/medium/high/xhigh/max/ultra`; `SettingsPanel.tsx:50` presents
  all eight values and says that Ultra resolves to the model's highest supported
  effort.
- `src-tauri/crates/omnia-harness/src/provider/mod.rs:23-32` documents only
  `low/medium/high/max` (with `none` handled as omission by adapters).
- `openai_chat.rs:51-58` and `openai_responses.rs:51-58` map only low, medium,
  high and max. `anthropic.rs:56-64` and `gemini.rs:57-65` likewise map only
  low, medium, high and max. Unknown strings are silently omitted from the
  outbound request instead of rejected.
- The separate prepared native gateway is stricter:
  `src-tauri/src/provider_gateway.rs:2395-2406` rejects anything outside
  `none/minimal/low/medium/high/max` as `invalid_parameter`.

**Impact:** A user can choose `xhigh` or `ultra`, see it persisted, and then
receive a run with no reasoning hint on the harness path or an invalid-parameter
failure on the prepared gateway path. The advertised Ultra resolver and dynamic
workflow policy do not exist at the dispatch boundary.

**Required correction:** Define a single native-owned effort contract. Resolve
`ultra` before dispatch to a model/provider-supported value plus a separately
recorded workflow policy, or reject it with a typed unsupported-capability
state. Never silently drop a requested effort. Bind the resolved effort and
catalog snapshot to the run receipt.

### High — catalog freshness and disappearance are not durable or reviewable

**Criteria affected:** `ADVSET-003`, `SETTINGS-001`, `SETTINGS-002`,
`ROUTING-001`.

- `ModelDiscoveryController` keeps `catalog` only in component/controller
  memory. `settings.ts` persists the selected profile/model string, but not the
  catalog, `discoveredAt`, source, request identity, provider adapter revision,
  snapshot hash or capability revision.
- `ModelDiscoveryPanel.tsx:25-29` marks a selected model only when it appears in
  the current in-memory catalog. There is no “previously selected but now
  disappeared/unsupported” state and no warning when a refresh removes a model.
- The panel displays a timestamp and capability source but does not persist or
  bind those values to a native run. The native lineage types have optional
  `catalog_snapshot_id`/`catalog_snapshot_sha256` fields, yet the discovery
  command returns neither field and the clean-room settings flow does not fill
  them.

**Impact:** After reload, the model picker has no evidence of which catalog made
the choice. A removed model can remain as the requested default and a run can
be prepared without a current capability snapshot. This fails the requirement
to report disappeared/unsupported models and prevents audit-quality routing
lineage.

**Required correction:** Persist a bounded native `ModelCatalogSnapshot` with
profile ID, adapter/profile revision, discovery timestamp, snapshot ID/hash,
model rows and explicit stale/unsupported markers. On refresh, compare the
selected model and expose a visible unavailable state; bind the acknowledged
snapshot ID/hash to future prepared attempts.

### High — renderer cancellation does not cancel the native HTTP request

**Criteria affected:** `ADVSET-003` cancellation/failed-refresh coverage and
the native runtime portion of model discovery.

- `model-discovery.ts:144-148` increments an epoch and discards late results,
  but its own comment states that native IPC has no abort command.
- `provider_gateway.rs:802-854` awaits the provider request directly. The client
  has a ten-minute request timeout, and the command has no request ID, cancel
  token or cancellation registry.

**Impact:** “Stop waiting” frees the UI but a provider call can continue for up
to the native timeout, consume network/credential resources and finish after a
new selection. The stale response is hidden, but work is not stopped.

**Required correction:** Add a request-scoped discovery ID and a native cancel
command backed by a cancellation map, or explicitly classify discovery as
non-cancellable and expose the ongoing request in native diagnostics. Test
cancel-before-response, provider timeout, and late success/failure after a new
profile selection.

### Medium — provider pagination is not implemented

**Criteria affected:** `ADVSET-003`, `ROUTING-001`.

- `provider_gateway.rs:820-835` sends OpenAI `/models`, Anthropic
  `/models?limit=1000`, and Gemini `/models?pageSize=1000` once.
- `parse_model_list` applies a 2,000-row bound but there is no `nextPageToken`,
  cursor, `has_more`, or provider-specific continuation loop.

**Impact:** A provider with more than one page returns an incomplete catalog
while the UI reports a successful model count. The 2,000-row safety bound does
not provide completeness; it only bounds one response.

**Required correction:** Add provider-specific bounded pagination with a maximum
page count/byte budget and a receipt indicating `complete`, `truncated`, or
`continuation-unavailable`. Test Gemini `nextPageToken`, OpenAI cursor/`has_more`,
and malformed continuation values.

### Medium — native errors lose actionable class and retry metadata in the UI

**Criteria affected:** `ADVSET-003`, `SETTINGS-010`, `SETTINGS-002`.

- Native errors retain typed classes/status/retry hints in `provider_gateway.rs`
  (`provider_dns_failed`, `local_network_permission_required`, auth, rate-limit,
  protocol and timeout classes).
- `ModelDiscoveryController.refreshProfiles` and `refreshModels` catch all
  failures and replace them with one generic sentence (`model-discovery.ts:107-118,
  135-141`). The renderer does not receive a code, status, retry-after value,
  diagnostic ID or permission-specific action.

**Impact:** Users cannot distinguish missing credentials, denied local-network
permission, an unavailable provider, rate limiting, malformed catalogs or a
temporary timeout. A retry control exists, but no bounded retry policy or
wait-time reason is visible.

**Required correction:** Map an allowlisted native error projection into
`unavailable`, `permission-required`, `authentication`, `rate-limited` and
`protocol` states, preserving diagnostic ID and retry-after without exposing
credentials or raw response text. Keep retry user initiated until a native
request-level policy exists.

### Medium — capability metadata is deliberately partial, but effort/model compatibility is not surfaced

**Criteria affected:** `ADVSET-001`, `ADVSET-003`, `ROUTING-001`.

The catalog reports streaming and optional tools/vision/reasoning declarations,
but no context window, output limit, supported effort set, endpoint adapter
revision or tool schema level. `ModelDiscoveryPanel.tsx:43` explicitly tells the
user that effort values are not supplied by the catalog. Preserving unknown is
correct; allowing all effort choices without a compatibility check is not.

**Required correction:** Keep unknown capability values, add an optional
provider/model capability contract for context/output/effort/tool support, and
disable or explain unsupported controls before dispatch. Treat an absent claim
as unknown, never as supported.

### Medium — native tests cover parsing, not command delivery or provider acceptance

`provider_gateway.rs:4160-4267` contains parser, bounds, capability and redaction
unit tests. The current checkout has no executed receipt for
`provider_models_list` through Tauri, no local HTTP fixture proving auth/path
selection for every family, no packaged Windows runtime capture, and no live
provider acceptance. The renderer suite's 23 tests are useful contract evidence
but are not native/live proof.

**Required correction:** Add a native integration fixture that exercises the
registered command against a local provider test server for OpenAI-compatible,
Anthropic and Gemini payloads, including auth failure, DNS/local-network denial,
malformed/oversized catalogs, pagination, timeout and cancellation. Then capture
one packaged desktop discovery flow with receipt ID, snapshot hash and the
selected model bound to a subsequent run.

## Smallest implementable next slice

Implement a **catalog-to-chat route adapter** in the clean-room renderer, with no
native schema changes in the first pass:

1. Create one typed catalog store that owns the latest profile/catalog,
   `discoveredAt`, stale epoch and requested/effective selection state. Reuse the
   existing decoder and native bridge; do not duplicate the Settings controller.
2. Make `ChatView` consume that store. Replace hardcoded `auto/local/frontier`
   entries with discovered `(profileId, modelId)` rows plus explicit `Auto route`
   only when no provider is selected. Show a selected-model-missing state after
   refresh/reload.
3. Extend the chat controller's update input with `profileId`; send the opaque
   provider profile ID and model ID to native, and commit the UI only after the
   returned `AgentSessionSummary` acknowledges the new settings revision.
4. Add an effort resolver that maps `ultra` to a supported value or returns an
   unsupported state; do not send `xhigh`/`ultra` through adapters that silently
   omit them.
5. Add renderer tests for catalog sharing, profile/model selection, stale
   catalog, disappeared model, native CAS failure, per-session route isolation,
   and unsupported effort. This closes the renderer contract gap but still does
   not promote native/live criteria until the native integration and packaged
   capture are executed.

## Source identity

Canonical input hashes reread for this audit:

| Input | SHA-256 |
| --- | --- |
| `AGENTS.md` | `4841902FF1830D8BD59531C8CD1DFCCFE7082DEFFDC694263BE038B08AFB70C8` |
| `.agents/skills/omnia-evidence-loop/SKILL.md` | `A03964248BD0D2ED64A672F34E038AD5DCD44438F8B73FC64E08FD2E6F227CE6` |
| `docs/rebuild/GOAL.md` | `C168EA23EB684EA99D4FBE1560D155A1266E03E84220A7F9E7C8D6515D1697BF` |
| `docs/rebuild/WORKFLOW.md` | `7D52F5BEA6A524664E1D7D3E74A07F2A23D926CBA75584A73925F1B78A2B1FB9` |
| `docs/rebuild/SPEC.md` | `5EB4970E9279B3CE361108B19A584D63C92C14C4B4A7C09BF549C0ABCEB66BF0` |
| `docs/rebuild/DOD.json` | `5AAE8BA75D563922C25E0A923B83CEA751D5120498390C21FF541831FD7708AB` |
| `docs/rebuild/SOURCE_REGISTER.json` | `8D021BF042E4BB799580D69E69641615493F404E84C924870333231615AB869A` |
| `docs/rebuild/CHECKPOINT.md` | `D3C1F25F00979D0FDF79CBF183CAFD02650150CA5E41C8653664F775BBF63E2A` |
| `docs/rebuild/ASSIGNMENTS.md` | `FF697992887667F7A61326F9C013A301850385A7F31940D53AA179D308B151DE` |

Relevant source hashes:

| Source | SHA-256 |
| --- | --- |
| `src/rebuild/settings/model-discovery.ts` | `21565624BF1D559CD6C4CD6F8B95F330D864BBAE0E407F5E6355EABEEE885B55` |
| `src/rebuild/settings/ModelDiscoveryPanel.tsx` | `2D2B8FA63EF85EE5B65D6B6D351B20042673D132B5C98F6163A2BFF7093DCECD` |
| `src/rebuild/settings/settings.ts` | `470F1B1AB415457EE349AADEAFD0D796AD1A6CC1F2E1679DBB63862F30235601` |
| `src/rebuild/chat/chat-controller.ts` | `F635A6C2578F1FE1282304E89F087FAF0B8E30B4EE70095E675E1AEAB1DA2633` |
| `src/rebuild/chat/chat-view.tsx` | `6ED807E0F4CE0987C19D33A98523715CD8E6544BC04B831AAE66F654D7B085B7` |
| `src/lib/desktop.ts` | `5F9C5FA575BADAF43D2FEBDFE594190CE11CB714E6545857E316A501D25B5849` |
| `src-tauri/src/provider_gateway.rs` | `F1962A00DC30946D82DE835109D156B6DD36CB032ED1CDFAF0D70A72F1D3172A` |
| `src-tauri/src/harness_bridge.rs` | `045BC0B9B8FE590998FCDC772D001E353FAD81A5FA9E553685FE06E6CE58DA3B` |
| `src-tauri/crates/omnia-harness/src/provider/mod.rs` | `6735477B02EE805C6297C348C30E6351DA69578FD05D8B5523FC5EE04EAE46E7` |
| `src-tauri/crates/omnia-harness/src/provider/openai_chat.rs` | `B35F741823A8EC3C09D0B8A4D3EC9B810E3A0EECEB3672AC347F7E8AF60B1579` |
| `src-tauri/crates/omnia-harness/src/provider/openai_responses.rs` | `DFC0C16E5134962EB70A0BD79C4A018F7DDECD9ECD7AA8A0D1AAB8FEEAD59640` |
| `src-tauri/crates/omnia-harness/src/provider/anthropic.rs` | `2CE2BF5CB37E131FF7271286B75DE5F311D5B6B31EB8E8434572458AE43C8250` |
| `src-tauri/crates/omnia-harness/src/provider/gemini.rs` | `275E84CEC12326572E25F83226813ED2BFF17645CB3B055FDC3BA47965FD732E` |

The assignment file did not contain a `/root/cycle6_native_model_audit` entry
when read. This report is therefore intentionally a standalone audit artifact
for the root integrator; it does not alter ownership, canonical specs, DoD
statuses, source registry, checkpoint, package scripts or release metadata.
