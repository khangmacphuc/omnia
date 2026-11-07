# Frontend modularization plan

Status: Proposed migration plan  
Date: August 13, 2026  
Scope: React renderer, frontend application layer, desktop IPC client, frontend state, styles, tests, and build boundaries  
Non-goal: this document does not claim that the target architecture or the future IDE, browser, agent, remote-machine, memory, or skill surfaces are implemented.

## 1. Why this refactor is a product dependency

The current renderer is a strong Phase 1 prototype, but its ownership boundaries will not safely support the intended Omnia surface area. `src/features/workspace` currently owns shell navigation, chat, projects, providers, settings, library, citations, run projection, dialogs, context compilation, mock data, view models, responsive behavior, persisted preferences, native command orchestration, and optimistic run state.

The problem is not merely file length. Several distinct sources of truth and effect boundaries are collapsed together:

- `src/features/workspace/store.ts` is 737 lines and mixes persisted preferences, transient shell state, normalized and denormalized server projections, native I/O, optimistic run mutations, mock-preview state, responsive media queries, and IDs.
- `src/App.tsx` performs core initialization, workspace hydration, provider probing, theme projection, shortcut registration, responsive reconciliation, and shell composition.
- `src/features/workspace/composer.tsx` subscribes to native run events, prepares runs, performs provider preflight and dispatch, persists failure, cancels runs, mutates optimistic message state, handles attachment gating, and renders the composer.
- Native provider management is duplicated between `App.tsx`, `screens.tsx`, and `dialogs.tsx`.
- `src/lib/desktop.ts` is 658 lines and exposes records, requests, browser-preview behavior, Tauri invocation, errors, and every subsystem through one object.
- `screens.tsx`, `dialogs.tsx`, `inspector.tsx`, and `library-screen.tsx` each contain several independently evolving capabilities.
- The frontend imports React Router and TanStack Query as dependencies, but the current source does not use either. This leaves navigation and server-state ownership implicit instead of deliberate.
- Global feature styles exceed six thousand lines. `chat.css` and `screens.css` are both over two thousand lines, and responsive feature rules are separated from the components they modify.
- The production build currently emits one main JavaScript chunk around 559 kB minified and reports the Vite 500 kB warning.

Adding IDE, browser, agent DAG, persistent-machine, telemetry, memory, skill, artifact, scientific-learning, and remote-control screens directly to this shape would multiply coupling and make security-sensitive state difficult to audit. Modularization is therefore a prerequisite for product expansion, not cosmetic cleanup.

## 2. Architectural invariants

The migration must preserve the following invariants at every intermediate step.

1. The native core, durable journal, repositories, and immutable native records remain authoritative for durable state. The renderer never becomes the source of truth for runs, messages, attachments, approvals, secrets, environment selection, or capability policy.
2. Renderer-visible native data stays projection-safe. No module may expose raw filesystem paths, blob descriptors, wrapped keys, nonces, decrypted bytes, password-vault data, or arbitrary native error text.
3. Components do not invoke Tauri directly. They use typed frontend use cases whose dependencies are explicit and substitutable in tests.
4. Native commands change state; durable native events and query snapshots report facts. Frontend stores may project those facts but must not invent missing lineage or provenance.
5. Server/native state and local UI state have different owners. They must not be persisted together in one catch-all Zustand store.
6. No learned or UI routing layer may decide permissions, approval validity, secret handling, environment isolation, or access-control policy.
7. Projectless conversations remain first-class. A frontend feature must not require a project merely because the current folder hierarchy is named `workspace`.
8. A migration step may reorganize ownership without changing visible behavior. When behavior must change, it requires a separate contract and tests.
9. Existing tests continue to run through compatibility facades until their feature has migrated. Do not execute a repository-wide big-bang rename.
10. A module can depend only inward or sideways through a declared public API. Deep imports into another feature's internals are forbidden after that feature migrates.

## 3. Target dependency graph

The target is a modular monolith with explicit ports. It is intentionally not a micro-frontend system and does not require a separate package for every component.

```text
main.tsx
  -> app/
       composition/
       bootstrap/
       routing/
       providers/
  -> features/*/public API

features/*
  -> application/use-cases and queries
  -> ui/primitives and ui/patterns
  -> domain contracts

application/
  -> domain contracts
  -> ports only

infrastructure/desktop/
  -> implements application ports
  -> owns Tauri invoke/listen and browser-preview adapters

domain/
  -> no React, Zustand, Tauri, browser globals, or infrastructure imports
```

Allowed dependency direction:

```text
app -> features -> application -> domain
app -> ui
features -> ui
infrastructure -> application ports + domain
app composition -> infrastructure implementations
```

Forbidden direction:

```text
domain -> application/features/ui/infrastructure
application -> features/ui/infrastructure
ui primitives -> features
feature A internals -> feature B internals
component -> Tauri invoke or global desktop singleton
```

## 4. Target source layout

This is a capability-oriented target. It is a map of ownership, not a requirement to create every directory immediately.

```text
src/
  app/
    AppRoot.tsx
    composition/
      create-app-services.ts
      AppServicesProvider.tsx
    bootstrap/
      use-app-bootstrap.ts
      bootstrap-state.ts
    routing/
      activity-registry.tsx
      route-state.ts
      shortcuts.ts
    shell/
      WorkspaceShell.tsx
      theme-projection.ts

  domain/
    ...existing pure contracts...

  application/
    ports/
      core-port.ts
      conversation-port.ts
      run-port.ts
      attachment-port.ts
      project-port.ts
      provider-port.ts
      workspace-port.ts
      window-port.ts
    conversations/
      create-conversation.ts
      hydrate-conversations.ts
    runs/
      submit-chat-run.ts
      cancel-run.ts
      project-run-event.ts
    providers/
      refresh-provider-profile.ts
      test-provider.ts
    projects/
      create-project.ts
      grant-workspace-folder.ts
    attachments/
      pick-attachment-draft.ts

  infrastructure/
    desktop/
      tauri-client.ts
      native-error.ts
      core-client.ts
      conversation-client.ts
      run-client.ts
      attachment-client.ts
      project-client.ts
      provider-client.ts
      workspace-client.ts
      window-client.ts
    browser-preview/
      preview-services.ts

  ui/
    primitives/
      button/
      field/
      modal/
      drawer/
      tabs/
      segmented-control/
      status/
    patterns/
      ScreenHeader.tsx
      EmptyState.tsx
      PropertyGrid.tsx
      Timeline.tsx
      SplitView.tsx
    icons/
      product-icons.tsx
      omnia-logo.tsx

  features/
    shell/
      model/shell-store.ts
      components/ActivityRail.tsx
      components/ObjectSidebar.tsx
      components/TitleBar.tsx
      overlays/overlay-store.ts
      command-palette/
      index.ts
    conversations/
      model/conversation-projection-store.ts
      model/conversation-view-model.ts
      application/use-submit-chat-run.ts
      application/use-conversation-list.ts
      components/ConversationScreen.tsx
      components/MessageList.tsx
      components/ChatComposer.tsx
      components/ComposerAttachmentTray.tsx
      markdown/
      index.ts
    inspector/
      components/InspectorPanel.tsx
      context/
      run/
      parameters/
      index.ts
    citations/
      model/citation-selection-store.ts
      components/CitationStrip.tsx
      components/SourcesInspector.tsx
      components/RunTimeline.tsx
      index.ts
    projects/
      model/project-view-model.ts
      application/use-project-commands.ts
      components/ProjectsScreen.tsx
      components/CreateProjectDialog.tsx
      components/GrantFolderDialog.tsx
      index.ts
    providers/
      model/provider-view-model.ts
      application/use-provider-catalog.ts
      application/use-provider-commands.ts
      components/ProviderSettings.tsx
      components/ConnectProviderDialog.tsx
      index.ts
    library/
      model/library-query.ts
      components/LibraryScreen.tsx
      components/AttachmentDetail.tsx
      components/ArtifactDetail.tsx
      index.ts
    settings/
      components/SettingsScreen.tsx
      appearance/
      diagnostics/
      index.ts
    memory/
    skills/
    home/

  styles/
    foundations/
    primitives/
    patterns/
    shell/
    features/
```

Future IDE, browser, agents, environments, telemetry, remote, learning, documents, and evaluations become peer features. They do not go back into a general `workspace` directory.

## 5. State ownership model

### 5.1 Local persisted preferences

Own only durable renderer preferences:

- theme;
- density;
- motion;
- panel sizes and last open/closed preference;
- preferred activity and inspector tab when safe;
- command-palette preferences;
- non-sensitive UI zoom or typography preferences when implemented.

These belong in a small versioned preferences store. Do not persist provider records, conversations, attachments, native runtime status, run state, approvals, secrets, or capability results to browser storage.

### 5.2 Transient shell state

Own ephemeral interaction state:

- active activity;
- drawer visibility;
- active overlay with typed payload;
- command palette visibility;
- local focus-return metadata;
- temporary selection that has no durable meaning.

This can remain Zustand because it is local, synchronous UI state. Responsive decisions should be injected as viewport state or handled by shell hooks; store actions must not call `window.matchMedia` themselves.

### 5.3 Native query projections

Conversations, projects, providers, attachments, citations, run history, memory, skills, artifacts, and environment status are native/server state. The near-term design should use a query cache or repository-backed resource store with stable query keys and invalidation. TanStack Query is already installed and is suitable if adopted deliberately.

Rules:

- Query functions call application ports, never components.
- Mutation success invalidates or updates the precise query keys.
- Native events update a projection by durable ID and sequence, not by appending blindly.
- Browser preview uses a separate in-memory port implementation; it must never masquerade as durable native persistence.
- Query cache is not persisted by default. Any future offline persistence requires a separate privacy and migration design.

Suggested key families:

```text
["runtime"]
["projects", profileId]
["workspace-grants", profileId]
["conversations", profileId, projectId?]
["conversation", conversationId]
["attachment-drafts", conversationId, branchId]
["providers", profileId]
["provider-models", providerProfileId, catalogVersion]
["run-events", runId, afterSequence]
["citations", messageId, runId]
```

### 5.4 Optimistic and streaming projections

Streaming output needs a bounded projection separate from durable records. It may temporarily hold:

- subscription epoch;
- run ID and assistant projection ID;
- last durable sequence/cursor;
- uncommitted visible text chunks;
- connection status;
- cancellation request state;
- recovery diagnostic.

It must not create a second writable copy of every conversation. When a durable snapshot arrives, reconcile by ID and cursor. Duplicate events are ignored; gaps trigger replay; stale subscription epochs cannot mutate the active projection.

### 5.5 Form state

Provider, project, workspace grant, and composer forms own their draft fields locally or in feature-specific form hooks. They should not write partial values into the global app store.

## 6. Ports and use cases

The current `desktop` singleton should be decomposed behind interfaces. A use case receives the minimum ports required, making capability and error behavior explicit.

Example port shape:

```ts
export interface RunPort {
  prepare(request: PrepareConversationRunRequest): Promise<ConversationSnapshot>;
  startPrepared(request: StartPreparedAttemptRequest): Promise<void>;
  cancel(runId: string): Promise<void>;
  subscribe(runId: string, afterSequence: number | null, listener: RunEventListener): Unsubscribe;
}
```

Example use case shape:

```ts
export interface SubmitChatRunDependencies {
  conversations: ConversationPort;
  runs: RunPort;
  attachments: AttachmentPort;
  clock: Clock;
}

export function createSubmitChatRun(dependencies: SubmitChatRunDependencies) {
  return async function submit(input: SubmitChatRunInput): Promise<PreparedRunReceipt> {
    // Validate UI input, invoke one native prepare transaction, then start by opaque prepared ID.
  };
}
```

Use cases must return stable application errors. Tauri invoke errors and raw OS/provider messages are translated at the infrastructure boundary to an allowlisted code, user-safe message, retryability, and diagnostic ID.

Do not build a second business-domain layer in React. Application services sequence ports; durable invariants remain in native/domain code.

## 7. Public feature APIs

Each migrated feature gets an `index.ts` that exports only its supported surface. Other modules may import:

- route/screen component;
- feature command hook;
- stable view-model type when genuinely shared;
- explicitly shared selectors or registry entry.

They may not import:

- internal stores;
- mapper implementation details;
- feature-local fixtures;
- private components;
- feature CSS by deep path;
- another feature's native client.

Add an import-boundary gate after the first feature migrations. ESLint `no-restricted-imports`, dependency-cruiser, or a small repository script are acceptable. The gate should enforce layer direction and reject new imports from `@/features/workspace/*` once the compatibility layer is frozen.

## 8. Activity and navigation registry

Activity metadata is currently repeated in the activity rail, screen switch, object sidebar, and command palette. Replace it with one typed registry.

```ts
export interface ActivityDefinition {
  id: ActivityId;
  label: string;
  icon: ProductIconName;
  loadScreen: () => Promise<{ default: React.ComponentType }>;
  sidebar: "conversations" | "projects" | "none" | SidebarDefinition;
  command: { label: string; keywords: readonly string[]; shortcut?: string };
  availability: (capabilities: ClientCapabilities) => ActivityAvailability;
}
```

The registry drives rail, screen resolution, sidebar mode, palette commands, lazy chunk boundaries, deep-link metadata, badges, and capability-aware visibility. An unavailable capability must render a truthful unavailable state, not silently substitute mock functionality.

React Router is optional in the first migration. If the product needs durable deep links, back/forward navigation, secondary windows, or remote-client URL parity, adopt it at the app routing layer only after route identity and branch/run semantics are stable.

## 9. CSS and design-system modularization

The CSS migration should follow component ownership, not precede it with a risky global rewrite.

Introduce cascade layers in this order:

```css
@layer reset, tokens, base, primitives, patterns, shell, features, utilities;
```

Rules:

- Generated tokens remain the executable source; generated files are never edited manually.
- Primitive styles own focus, disabled, target size, density, tone, and forced-color behavior.
- Feature CSS is scoped under a feature root or uses CSS Modules. A feature must not target another feature's DOM structure.
- Responsive behavior should live with its component/feature unless it changes the whole shell grid.
- Replace structural selectors such as `nth-child` for interactive behavior with semantic classes or `data-*` state.
- Do not introduce a CSS-in-JS runtime solely for this refactor.
- Keep meaningful text at or above the typography gate and make interactive targets consume density tokens.

Suggested stylesheet ownership:

```text
tokens.generated.css -> foundations
tokens.css           -> themes/density policy until fully generated
base.css             -> reset + base, then primitives
shell.css            -> feature shell styles
chat.css             -> conversations, citations, inspector and composer styles
screens.css          -> projects, library, providers, settings, memory and skills
overlays.css         -> modal/command palette primitives plus feature dialog styles
responsive.css       -> shell-wide rules only after feature rules move home
```

Move CSS only when the owning component or feature moves, keeping visual diffs narrow.

## 10. Code splitting and runtime loading

The target split is by activity and expensive optional dependency, not by arbitrary file size.

Initial shell chunk:

- app composition;
- title bar, activity rail, sidebar shell, status strip;
- conversation list and currently active chat surface;
- modal/drawer primitives;
- minimal native clients needed for bootstrap.

Lazy activity chunks:

- projects;
- library/artifacts;
- memory;
- skills;
- settings/providers;
- future IDE;
- future browser;
- future agent graph;
- future telemetry/evaluations;
- future remote-machine screens.

Candidate dependency splits:

- Markdown renderer and syntax-heavy extensions should load with the message surface.
- Visualization, Monaco/editor, terminal, PDF, Office, graph, and media tooling must never enter the startup chunk before their surface opens.
- Provider adapters remain native; only provider configuration UI is in the renderer.

Acceptance target for the modularization phase:

- no Vite `>500 kB` warning for the largest initial JavaScript chunk;
- initial shell plus active chat chunk is measured and recorded;
- changing activity loads the expected chunk once;
- lazy-load failure has an accessible retry/fallback surface;
- no loading spinner loops forever without a terminal error state.

Exact byte budgets should be set from a measured post-split baseline rather than invented here.

## 11. Migration phases

### Phase F0 — Freeze boundaries and evidence

Deliverables:

- Record the current import graph, main file sizes, native call sites, store consumers, CSS ownership, and bundle report.
- Add architecture tests that describe allowed layer direction before moving code.
- Mark `src/features/workspace` as a compatibility namespace: no new capabilities may be added there without an explicit migration exception.
- Establish a move manifest mapping every current production file to an owner.
- Keep the full gate green before the first move.

Exit gates:

- no behavioral change;
- current frontend tests, typecheck, build, token, typography, and ACL gates pass;
- baseline chunk sizes are archived;
- active concurrent changes to shared UI files are complete before structural edits begin.

### Phase F1 — Split desktop infrastructure without changing callers

Deliverables:

- Split `src/lib/desktop.ts` into subsystem clients and safe shared IPC types.
- Keep `src/lib/desktop.ts` as a temporary facade that delegates to new clients, so existing call sites and tests remain stable.
- Centralize invoke error translation and event subscription cleanup.
- Create separate native and browser-preview service composition.

Exit gates:

- facade contract tests prove parity for every existing method;
- browser preview still fails closed for native-only attachment/storage operations;
- no renderer-facing raw native errors or sensitive fields;
- no circular dependency between application ports and infrastructure clients.

### Phase F2 — App composition and bootstrap

Deliverables:

- Move initialization/hydration from `App.tsx` into `app/bootstrap` and application queries.
- Introduce an app-services provider or explicit service composition object.
- Consolidate provider refresh so startup and Settings use the same query/use case.
- Move theme projection, shortcuts, and shell layout into focused hooks/components.

Exit gates:

- `AppRoot` contains composition and terminal boot/error states, not data workflows;
- startup has explicit idle/loading/ready/degraded/error states;
- cancellation/unmount prevents stale hydration from mutating state;
- provider query behavior is defined once;
- browser preview and Tauri bootstrap tests cover both paths.

### Phase F3 — Separate shell and preference state

Deliverables:

- Extract versioned preference store.
- Extract transient shell/navigation store.
- Move typed overlay and citation selection to their owning feature boundaries.
- Remove media-query calls from store actions; viewport state is supplied by shell hooks.
- Add one activity registry that drives rail, screen, sidebar, and command palette.

Exit gates:

- persisted state contains only allowlisted non-sensitive preferences;
- migrations from `omnia-workspace-preview-v1` preserve user preferences;
- switching activities and narrow drawer behavior retain accessibility/focus tests;
- no duplicate activity metadata remains;
- command palette does not depend on a global feature store.

### Phase F4 — Native query ownership and normalized projections

Deliverables:

- Adopt explicit native query ownership for projects, providers, conversations, attachments, and citations.
- Normalize attachment records by ID and keep message-to-attachment relationships as IDs or immutable snapshots with a distinct type.
- Separate mock preview repositories from production native repositories.
- Replace broad store replacement actions with query invalidation and feature projection functions.

Exit gates:

- one writable attachment projection;
- one provider query path;
- projectless chat works;
- query key and invalidation tests cover create/delete/refresh flows;
- no native/server entity is persisted to localStorage;
- list and detail projections cannot silently disagree after a mutation.

### Phase F5 — Extract chat/run orchestration

Prerequisite: prepared provider input and durable run-event contract must be stable enough that the renderer does not reconstruct provider payloads.

Deliverables:

- Move prepare/start/cancel/event-replay logic from `ChatComposer` into `submitChatRun` and run-projection services.
- Subscribe by run ID and durable cursor/sequence.
- Keep local composer and validation state inside the conversation feature.
- Replace the singleton `activeRun` with run projections keyed by run ID or query state that can represent background work.
- Treat provider capability `unknown`, `emulated`, and `unsupported` as fail-closed.

Exit gates:

- `ChatComposer` renders form state and invokes one submit command;
- duplicate, out-of-order, stale-epoch, gap, reconnect, cancel, and terminal event tests pass;
- a background run cannot overwrite the active conversation merely because the user navigated;
- attachments stay blocked until atomic native bind/frozen input succeeds;
- no component calls `desktop.prepareConversationRun`, `desktop.startProviderRun`, `desktop.failConversationRun`, or `desktop.onRunEvent` directly.

### Phase F6 — Move vertical features

Move one feature at a time, in this order:

1. shell;
2. providers and Settings provider section;
3. projects and workspace grants;
4. conversations/chat;
5. citations and inspector;
6. library/artifacts;
7. appearance/settings;
8. memory and skills preview surfaces;
9. home.

For each feature:

- create public API;
- co-locate view model, components, use cases, tests, and styles;
- update app registry;
- remove old deep imports;
- run focused and full tests;
- delete compatibility exports only after all callers move.

Exit gates:

- `src/features/workspace` contains only a temporary facade, then becomes empty and is deleted;
- `types.ts`, `screens.tsx`, `dialogs.tsx`, and `inspector.tsx` no longer aggregate unrelated features;
- no cross-feature deep imports;
- every feature has a truthful empty/loading/error/denied/unavailable state.

### Phase F7 — UI primitives and feature CSS

Deliverables:

- Promote the existing modal/drawer work into the shared primitive layer.
- Extract only repeated, behavior-bearing primitives: Button, IconButton, Field, Tabs, SegmentedControl, Status/Badge, EmptyState, ScreenHeader, and Callout.
- Move feature styles with feature components and add cascade layers.
- Add a development-only design-system/specimen surface.

Exit gates:

- keyboard/focus/ARIA behavior is tested once at primitive level and at least once in integration;
- no meaningful typography below the gate;
- density target rules pass for compact, comfortable, and touch;
- forced colors and reduced motion remain functional;
- feature CSS cannot target other feature roots.

### Phase F8 — Lazy activities and bundle gate

Deliverables:

- Lazy-load activity screens through the activity registry.
- Add Suspense/error boundaries with accessible copy and retry.
- Produce a bundle manifest and define measured budgets.
- Remove dependencies that remain unused after the refactor.

Exit gates:

- no main-chunk Vite warning above 500 kB;
- route/activity chunks are stable and named;
- startup, first chat render, and activity-switch timing are recorded;
- lazy failure and offline/degraded cases have deterministic tests;
- no future-heavy editor/browser/visualization dependency enters the initial chunk.

### Phase F9 — Delete compatibility layer and enforce architecture

Deliverables:

- Delete `features/workspace` and the monolithic desktop facade after all consumers migrate.
- Enable import-boundary checks in `npm run check`.
- Update root README, implementation status, UI docs, and ADRs with the final layout.
- Add ownership rules for future features.

Exit gates:

- forbidden-import scan passes;
- circular dependency scan passes;
- full frontend/native gate passes;
- visual matrix passes at supported themes, densities, viewports, scale, reduced motion/transparency, forced colors, and keyboard-only use;
- no shipped-capability claim exceeds automated and visual evidence.

## 12. Current-file move manifest

| Current file | Target owner | Notes |
|---|---|---|
| `src/App.tsx` | `app/AppRoot.tsx`, `app/bootstrap`, `app/shell` | Split effects; retain a compatibility export during migration. |
| `features/workspace/store.ts` | shell preferences/store, native queries, conversation run projection, attachment projection | Do not mechanically divide one Zustand store into several equally broad stores. Change ownership first. |
| `features/workspace/types.ts` | co-located feature view models | Preserve native/domain mapping boundaries and use distinct snapshot vs mutable projection types. |
| `features/workspace/screens.tsx` | home, projects, memory, skills, settings/providers | Move one screen at a time through activity registry. |
| `features/workspace/dialogs.tsx` | projects and providers feature dialogs; shared modal primitive | `GlobalDialogs` becomes shell overlay host; feature forms own their fields. |
| `features/workspace/composer.tsx` | conversations components + runs application use case | Native orchestration moves before presentation. |
| `features/workspace/conversation-view.tsx` | conversations components | Split message list, user/assistant message, toolbar, empty state. |
| `features/workspace/inspector.tsx` | inspector context/run/parameters subfeatures | Citations remain a peer feature with explicit input. |
| `features/workspace/citation-*` | citations feature | Maintain exact `messageId + runId` evidence scope and HTTP(S)-only link policy. |
| `features/workspace/library-screen.tsx` | library feature | Pure query/filter functions separate from view; attachment/artifact detail components split. |
| `features/workspace/provider-*` | providers feature/application mapper | Built-in mock model dependency must be isolated to preview adapter, not production catalog. |
| `features/workspace/project-*` | projects feature/application mapper | Projectless conversations stay valid. |
| `features/workspace/attachment-*` | attachments/content feature | Renderer receives opaque IDs and safe metadata only. |
| `features/workspace/context-harness.ts` | application context compiler or domain adapter | Reconcile with the native context-compiler contract; avoid a second authoritative compiler. |
| `features/workspace/run-graph-projection.ts` | runs/inspector projection | Preserve fail-closed partial/invalid semantics; do not invent graph nodes. |
| `features/workspace/panel-layout.ts` | shell viewport service/hook | Use generated breakpoints; no `matchMedia` inside state mutations. |
| `features/workspace/mock-data.ts` | browser-preview infrastructure and feature fixtures | Production imports must not depend on preview fixtures. |
| `src/lib/desktop.ts` | `application/ports` + `infrastructure/desktop` facade/client split | Keep renderer-safe request/record types near port contracts or generated protocol. |
| `styles/chat.css` | conversations, composer, citations, inspector | Move alongside owners in small verified steps. |
| `styles/screens.css` | projects, library, settings, providers, memory, skills | Split by vertical feature. |
| `styles/shell.css` | shell feature and primitives | Keep only shell-wide styles. |
| `styles/overlays.css` | modal/palette primitives plus feature dialogs | Separate primitive behavior from dialog-specific layouts. |
| `styles/responsive.css` | shell-wide responsive policy; feature rules co-located | Retain sub-800 remote projection and 800–920 native drawer contracts. |

## 13. Testing strategy for the refactor

### Static architecture tests

- allowed dependency direction;
- no deep cross-feature imports;
- no Tauri APIs outside `infrastructure/desktop` and explicitly approved native window adapter;
- no `desktop.*` use inside presentation components;
- no production import from browser-preview fixtures;
- no localStorage use outside preference infrastructure;
- no raw `window.matchMedia` outside viewport/theme services;
- no feature additions under frozen compatibility namespace.

### Unit and contract tests

- port adapter parity with the old facade;
- safe native-error translation;
- preference migration and allowlist;
- activity registry completeness and unique IDs/shortcuts;
- query key/invalidation behavior;
- normalized attachment identity;
- run event deduplication, gap detection, cursor replay, stale epoch, cancellation, and terminalization;
- feature public API boundaries;
- dynamic import failure and retry.

### Component and accessibility tests

- every feature screen: loading, empty, content, partial, unavailable, denied, error, recovery;
- keyboard navigation and focus restoration;
- overlay stack behavior;
- drawer behavior at native minimum and remote/mobile projection;
- 200% scaling and 40% string expansion on representative screens;
- forced colors, reduced motion, and reduced transparency.

### Visual tests

Run after each feature CSS move and at final gate:

```text
800 x 600
1024 x 720
1440 x 900
1920 x 1080

light / dark
compact / comfortable / touch
100% / 200% scale
reduced motion / transparency
forced colors
keyboard-only focus path
```

Live visual claims require an actual browser/WebView or rendered screenshot inspection. DOM tests and build success alone are not visual verification.

### Performance tests

- production bundle report;
- initial module/chunk bytes;
- startup and first usable chat surface;
- activity lazy-load latency;
- render count for streaming deltas;
- large conversation virtualization behavior;
- memory growth during long streaming/replay;
- query cache bounds and cleanup.

## 14. Risks and rollback strategy

### Risk: structural refactor collides with active schema/provider/UI work

Mitigation: wait until the writer of each shared file has completed, then move one ownership slice. Do not bulk-move `App.tsx`, `store.ts`, `desktop.ts`, dialogs, and provider gateway callers in one patch.

### Risk: replacing a god store with several coupled god stores

Mitigation: classify every field as preference, transient UI, native query projection, streaming projection, or form state before moving it. A store is selected because of state semantics, not because files need somewhere to go.

### Risk: TanStack Query adoption hides event-journal semantics

Mitigation: use it for resource ownership and invalidation only. Durable ordering, cursor replay, dedupe, and state transitions remain explicit run-projection logic backed by native events.

### Risk: URL/router architecture is chosen before durable identities stabilize

Mitigation: centralize activity metadata first. Defer deep-link schema until projectless conversations, branch IDs, run IDs, and task semantics are canonical.

### Risk: feature CSS moves create large visual diffs

Mitigation: move styles with one component tree at a time, retain selectors temporarily, run focused screenshots, and avoid simultaneous visual redesign.

### Risk: compatibility facades become permanent

Mitigation: every facade has an owner, a consumer count, a deletion phase, and a forbidden-new-import gate.

### Rollback

Each phase must be independently revertible without schema/data rollback. Keep facade delegation until the replacement passes its gates. Avoid changing persisted preference keys and component ownership in the same patch unless migration tests exist.

## 15. Definition of done

Frontend modularization is complete only when all of the following are true:

- `src/features/workspace` and the monolithic desktop facade are deleted.
- App root performs composition, not provider/workspace/run workflows.
- Presentation components do not invoke desktop/Tauri operations.
- Local preference, transient shell, native query, streaming projection, and form state have distinct owners.
- Durable entities are not persisted in browser storage.
- Attachments have one writable projection and preserve opaque native ownership.
- Provider synchronization has one query/use-case path.
- Chat submission uses prepared native input and durable event cursor semantics.
- A typed activity registry drives navigation, screen loading, sidebar, command palette, and availability.
- Feature public APIs and dependency directions are automatically enforced.
- CSS is layered and feature-owned; responsive rules no longer depend on unrelated global DOM structure.
- Initial bundle is split below the current warning threshold, with measured budgets.
- Full automated gates and the visual matrix pass.
- Documentation and implementation-status claims match the evidence.

This definition establishes a safe foundation for the next product surfaces. It does not itself mean IDE, browser, agent, persistent machine, remote client, memory, skills, or every planned capability is complete.
