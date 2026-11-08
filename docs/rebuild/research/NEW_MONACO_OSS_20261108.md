# Cycle 0006 new OSS research: Monaco editor model and worker contracts

**Cycle:** `rebuild-0006`
**Research timestamp (UTC):** `2026-11-08T06:09:01Z`
**Research owner:** `/root/cycle6_research_monaco`
**Decision:** `apply-as-reference` (source is not vendored, copied into the renderer, or executed)

## Discovery and novelty

- **Queries:**
  - `site:github.com microsoft monaco-editor source editor model worker undo stack architecture 2026`
  - `site:github.com open source Monaco editor everything super power pro max agent IDE`
  - `Monaco editor source editor model undo stack worker architecture GitHub`
- **Canonical repository:** <https://github.com/microsoft/monaco-editor>
- **Pinned revision:** `5359a3330383137dfdf8897ba1d93d943fec4027` (`git ls-remote ... HEAD` returned this exact revision).
- **Why this is new:** the cycle baseline and `docs/rebuild/SOURCE_REGISTER.json` contain no `microsoft/monaco-editor` repository/revision/path tuple. Existing IDE notes mention Monaco only as a technology in other projects; they do not review this repository at this revision and path. This source therefore qualifies as a new repository/revision/path for cycle 0006.
- **License:** the selected source is MIT. `LICENSE.txt` at the pinned revision grants use, copy, modification and distribution with the copyright notice and license text retained. The repository README also links the MIT license. This is reference material only; no source is a runtime dependency of Omnia.

## Exact source read and integrity

The files were fetched from the pinned commit with `Invoke-WebRequest` using a descriptive user agent. No downloaded script, package, build hook or installer was executed. Local snapshots preserve the exact text read:

| Source path at pinned revision | Local snapshot | SHA-256 | Observation |
| --- | --- | --- | --- |
| `README.md` | [`snapshots/cycle6/monaco-editor/README.md`](snapshots/cycle6/monaco-editor/README.md) | `333E7215227199C4BA97EC927BB09CFCF69B297BA3BE108E866AED735A312822` | Model/URI/editor/provider/disposable concepts and worker/runtime limits |
| `LICENSE.txt` | [`snapshots/cycle6/monaco-editor/LICENSE.txt`](snapshots/cycle6/monaco-editor/LICENSE.txt) | `33E4FF1A06EF62BA21788EA162564EE8165269A24A9CE6EF301837447EAB0AC6` | MIT terms |
| `src/index.ts` | [`snapshots/cycle6/monaco-editor/src__index.ts`](snapshots/cycle6/monaco-editor/src__index.ts) | `EAD6D33F8E2476F85A50F00ACA1C2BAA435BD77F7B42965D68B06E2B899C2405` | Explicit entry composition: LSP/language exports, feature registration and editor core |
| `src/editor.ts` | [`snapshots/cycle6/monaco-editor/src__editor.ts`](snapshots/cycle6/monaco-editor/src__editor.ts) | `88D06A5841B601A83D99EA07E5AB9167D2A5481C7222F0EEB050F77C7C254F43` | Public API boundary re-exports the editor API |
| `src/internal/common/workers.ts` | [`snapshots/cycle6/monaco-editor/src__internal__common__workers.ts`](snapshots/cycle6/monaco-editor/src__internal__common__workers.ts) | `B114BE059CDB6D8F37AE3D198C702ADAEDB46ABE7A215B21FFF7FDB558935ADC` | Worker factory override, Trusted Types policy, idle model sync and explicit unavailable error |
| `src/internal/common/initialize.ts` | [`snapshots/cycle6/monaco-editor/src__internal__common__initialize.ts`](snapshots/cycle6/monaco-editor/src__internal__common__initialize.ts) | `568577928E4D220EE294E6A50DC169CB2F7918C3CFE6551E44A463A0C4D20A98` | One-time worker initialization and message callback boundary |
| `src/features/register.all.ts` | [`snapshots/cycle6/monaco-editor/src__features__register.all.ts`](snapshots/cycle6/monaco-editor/src__features__register.all.ts) | `10F7DEF79370B9C52A282F2E99AD4EEFE1AA722E5B847F4747B5A29ED9D63A30` | Feature modules are registered through explicit imports |
| `src/languages/register.all.ts` | [`snapshots/cycle6/monaco-editor/src__languages__register.all.ts`](snapshots/cycle6/monaco-editor/src__languages__register.all.ts) | `DE2E073BB967D66E295116512E69E9C6D162F51AE077D63E6E83C1AA17ED89D3` | Language definitions and features have a separate registration boundary |

Verification evidence:

```text
git ls-remote https://github.com/microsoft/monaco-editor.git HEAD
5359a3330383137dfdf8897ba1d93d943fec4027    HEAD
```

`Get-FileHash -Algorithm SHA256` produced the hashes above. The local files are evidence of the source inspected, not an application dependency.

## Observed source behavior

### 1. Models are durable identity boundaries for open files

The README describes a model as the content object for an opened file. It holds text, determines the language and tracks edit history (lines 44–46). Every model has a unique URI; content without a filesystem URI receives an `inmemory://model/N` identity (lines 48–50). This separates document identity from the visible editor and allows an editor view to be detached or recreated without losing the model contract.

### 2. Providers are model-scoped and URI-sensitive

Completion and hover providers operate on models and may use the model URI to resolve imports or JSON schemas (README lines 56–60). The source makes the provider boundary explicit rather than treating syntax intelligence as an implicit property of a view.

### 3. Editors and models have explicit disposal responsibilities

The editor is the user-facing view attached to the DOM, while models can exist independently (README lines 52–54). Disposing a model unregisters it and frees its URI; disposing editors removes model listeners (lines 62–64). This is a concrete lifecycle contract for avoiding stale tabs/listeners.

### 4. Worker execution is host-configurable and fails closed

`src/internal/common/workers.ts` (`getWorker`, lines 55–90 in the snapshot) first accepts a host-provided `MonacoEnvironment.getWorker` or `getWorkerUrl`, then an explicit `createWorker` callback. If none is available it throws `You must define a function MonacoEnvironment.getWorkerUrl or MonacoEnvironment.getWorker` instead of silently simulating language services. The same module uses a Trusted Types policy for worker URLs (lines 21–53), labels workers for debugging, and exposes `keepIdleModels` with a default that stops syncing idle models after a while (lines 92–136).

### 5. Worker initialization and feature registration are explicit

`src/internal/common/initialize.ts` tracks an `initialized` flag and installs one message callback that starts the editor worker (lines 1–16). `src/index.ts` imports the LSP client, language registrations, all feature registrations and `monaco-editor-core` before exporting the public editor API. `src/features/register.all.ts` lists feature modules explicitly, while `src/languages/register.all.ts` keeps language registration separate. This makes activation and bundle ownership reviewable.

### 6. The browser runtime has a real platform constraint

The README states that language services use web workers outside the UI thread (lines 96–98), and that pages loaded with `file://` cannot create workers (lines 100–102). A packaged Omnia surface therefore needs an explicit worker URL/host bridge and a truthful unavailable state when the runtime cannot provide one.

## Strengths relevant to Omnia

1. **Stable document identity:** URI-keyed models give Omnia a clean mapping from native file pointers to editor buffers and make reload/tab recreation auditable.
2. **Separation of view and content:** an editor tab can be disposed while the model remains available for another workspace tab or a preview.
3. **Lifecycle discipline:** disposal and listener cleanup provide a concrete basis for dirty-file/tab close tests.
4. **Explicit capability injection:** worker creation is a host boundary with a fail-closed error, matching Omnia’s requirement to label unavailable native/runtime capabilities.
5. **Bounded resource behavior:** idle model synchronization can stop after a timeout; this is a useful reference for context and editor resource budgets.
6. **Reviewable activation graph:** explicit feature and language registration helps the architecture guard distinguish approved editor capabilities from accidental imports.

## Weaknesses and evidence limits

- Monaco is a browser editor library generated from VS Code sources; it does not prove Windows Tauri/Rust file persistence, native permission prompts, packaged WebView2 behavior or Omnia’s clean-room UI.
- The selected worker and registration files reference `monaco-editor-core` and other uninspected modules. This receipt describes only the exact files listed above.
- No Monaco package was installed, no upstream code was executed, and no live worker or language service was run. All evidence is source inspection plus raw HTTP/hash verification.
- `file://` worker restrictions and host-provided worker URLs are browser deployment constraints; they are not a solution for native file permissions or path traversal.
- The MIT license applies to this repository’s selected files; dependencies and third-party notices retain their own terms. Omnia does not vendor or copy these files.

## Omnia gap and concrete application

This research informs the IDE criteria covering file identity, tab lifecycle, syntax/diagnostic availability, resource limits and truthful runtime states (including `IDE-003`, `IDE-006`, `IDE-008`, `IDE-011`, `IDE-014`, `IDE-017`, `UI-009`, `ADVSET-006` where those IDs remain current). It does not close any criterion by itself.

Apply these concepts in Omnia-owned contracts and tests:

1. Give each opened file a canonical, validated native pointer/URI and keep the editor buffer keyed by that identity. Reject duplicate or traversal-unsafe pointers; preserve a distinct in-memory identity for unsaved content.
2. Separate buffer/controller lifecycle from visible tab lifecycle. Closing or recreating a view must dispose listeners and geometry observers while preserving a dirty buffer until an explicit save/discard decision.
3. Make language intelligence an optional provider capability scoped to the validated file identity. If worker/LSP setup is unavailable, show `unavailable` with the reason and retain editing; do not fabricate diagnostics or completions.
4. Define an explicit worker/resource adapter for any browser-preview language service. Bound idle synchronization and expose applied versus requested resource limits in settings/observability.
5. Keep registration explicit in the clean-room code: feature/provider activation should be auditable and lazy where possible, with cancellation and disposal receipts.
6. Add negative tests for duplicate URI, stale tab revision, worker creation failure, disposal after navigation/reload, and unknown provider acceptance. These tests should exercise Omnia’s own controller/native bridge and must not import Monaco UI code.

The decision is therefore **apply contract ideas, reject runtime/UI transplantation, defer any Monaco dependency until the native worker, licensing and accessibility boundaries are independently reviewed**.

## Scope and ownership confirmation

- Files added by this slice: this research receipt and the eight raw source snapshots under `docs/rebuild/research/snapshots/cycle6/monaco-editor/`.
- No product source, `DOD.json`, `SOURCE_REGISTER.json`, cycle manifest, canonical spec, checkpoint, package script, credentials, browser profile or personal chat history was changed.
- The root integrator owns adding this source to the canonical registry and deciding which DoD criteria can receive evidence. This receipt intentionally does not mark any DoD item Done.
