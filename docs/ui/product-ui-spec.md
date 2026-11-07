# Omnia Desktop — Chat Complete product UI specification

This document specifies the target chat product. It is not a statement that every screen or workflow is available in the current Phase 1 Provider Preview. For current implementation truth and release evidence, use [`../IMPLEMENTATION_STATUS.md`](../IMPLEMENTATION_STATUS.md) and the Phase 1 release-evidence record.

## 1. Experience goals

The interface is optimized in this order:

1. **Answer quality and control** — model, context, tools, memory, and parameters are visible and inspectable.
2. **Conversation flow** — reading and composing remain calm even when the underlying harness is sophisticated.
3. **Trust** — state, cost, privacy, sources, errors, retries, and local/cloud boundaries are explicit.
4. **Desktop productivity** — keyboard-first navigation, native window behavior, multi-window support, drag/drop, and dense layouts.
5. **Extensibility** — future IDE, browser, terminal, agent, and computer-use views fit the same shell without redesigning navigation.

Avoid a dashboard full of decorative metrics. The default landing state should invite a useful action immediately.

## 2. Visual direction

Omnia uses a restrained Windows 11-inspired visual language:

- Neutral surfaces with subtle depth, thin separators, layered translucency only in top-level chrome, and opaque content surfaces for readability.
- A single indigo-violet brand accent. Provider colors appear only in provider marks and never become the page theme.
- Rounded rectangles with nested-radius discipline: larger radii on windows and dialogs, smaller radii on controls and message tools.
- Typography based on Segoe UI Variable with system fallbacks. Code uses Cascadia Code when available.
- Motion communicates continuity: panel resize, message streaming, branch changes, and artifact opening. No looping decoration.
- Light, dark, and system modes are equal citizens. High contrast and reduced motion are supported.

The product should not clone ChatGPT, Claude, Gemini, or any IDE. It combines familiar interaction patterns into a coherent desktop workspace.

## 3. Information architecture

### 3.1 Global activity rail

The leftmost rail remains stable across all phases.

| Destination | Target chat product | Purpose |
| --- | --- | --- |
| Home | Yes | Resume recent work, quick actions, pinned projects |
| Chats | Yes | All conversations, search, filters, bulk actions |
| Projects | Yes | Project context, workspace folders, instructions, knowledge |
| Library | Yes | Files, generated artifacts, exports, reusable prompts |
| Models | Yes | Provider connections, model catalog, presets, capability matrix, routing |
| Evaluations | Yes | Saved comparisons, benchmark sets, ratings, and reproducible results |
| Memory | Yes | User-approved and inferred memory management |
| Skills | Yes | Installed, generated, imported, and project-scoped skills |
| Agents | Later | Long-running and delegated agent activity |
| Workbench | Later | IDE/editor/terminal/browser/computer-use composite |
| Settings | Yes | Providers, models, privacy, data, appearance, shortcuts |

On narrow windows, the rail remains icon-only. On wider windows, the secondary sidebar supplies labels and object lists.

### 3.2 Object model visible in the UI

- **Conversation** — ordered message tree plus model runs, artifacts, attachments, citations, summaries, and local UI state.
- **Branch** — alternate continuation from any editable message.
- **Project** — instructions, preferred models, workspace folders, knowledge files, project memories, skills, and conversations.
- **Workspace folder** — a user-approved local folder reference with permission state. The current Phase 1 Provider Preview supports scoped read-only grants only; target Chat Complete phases add extraction, indexing, retrieval, and attachment workflows without code execution.
- **Provider connection** — provider type, authentication method, endpoint, capabilities, limits, and health.
- **Model profile** — provider model plus aliases, capability flags, parameter defaults, routing rules, and presentation name.
- **Memory** — scoped, editable fact with provenance, confidence, status, timestamps, and expiration option.
- **Skill** — reusable instruction/tool bundle with scope, version, permissions, and test status.
- **Assistant profile** — reusable instructions, preferred models/presets, files, memory policy, and enabled skills.
- **Prompt template** — versioned prompt with typed variables, examples, tags, and a preserved resolved value.
- **Evaluation** — one or more reproducible candidate runs plus rubric, ratings, assertions, and provenance.
- **Artifact** — generated document, code block, previewable file, image, table, or structured output.

## 4. Desktop shell

### 4.1 Window frame

Use a custom title bar that preserves Windows 11 snap layouts, system menu, resize behavior, and caption button hit targets.

Title bar contents, left to right:

- Omnia product mark and current profile.
- Back/forward history.
- Global command/search trigger (`Ctrl+K`).
- Optional centered breadcrumb: project / conversation.
- Sync/privacy status.
- Window controls owned by the native host.

The title bar is a drag region only where no interactive control exists. Never interfere with native Alt+Space or window snapping.

### 4.2 Four-region layout

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ Native title bar / command search / sync status                         │
├──────┬───────────────────┬───────────────────────────┬───────────────────┤
│      │                   │ Conversation toolbar      │ Context inspector │
│ Rail │ Object sidebar    ├───────────────────────────┤ (optional)        │
│      │ chats/projects    │                           │                   │
│      │                   │ Conversation canvas       │ sources           │
│      │                   │                           │ run details        │
│      │                   │                           │ parameters         │
│      │                   │                           │ memory             │
│      │                   ├───────────────────────────┤ artifacts          │
│      │                   │ Composer                  │                   │
├──────┴───────────────────┴───────────────────────────┴───────────────────┤
│ Optional transient status strip: download / indexing / queued operation │
└──────────────────────────────────────────────────────────────────────────┘
```

Default region behavior:

- Activity rail: 48 logical pixels, fixed.
- Object sidebar: resizable, approximately 264 logical pixels initially; collapsible with `Ctrl+Shift+B`.
- Main canvas: flexible, minimum readable width 480.
- Inspector: resizable overlay below 1,200 logical pixels and docked above that width; toggled with `Ctrl+Shift+I`.
- Persist panel sizes per window and activity.
- Double-clicking a resize divider resets that region to its default width.

### 4.3 Multi-window and tabs

- Conversations open in the current tab by default.
- `Ctrl+Click` or context menu can open a conversation in a background tab.
- A tab can be moved to a new native window.
- Unsaved composer text is preserved per tab.
- Opening the same conversation in multiple windows is allowed; edits reconcile visibly.

Tabs are only shown after a second tab is opened, avoiding permanent chrome for simple use.

## 5. Core screens

### 5.1 First run and provider onboarding

The first-run sequence is a compact native wizard, not a marketing carousel.

1. Choose data defaults: local history, diagnostics consent, and optional cloud sync if available.
2. Add a provider: recommended presets plus `OpenAI-compatible` custom provider.
3. Authenticate: API key, OAuth, or local runtime depending on provider.
4. Verify connection and fetch model catalog.
5. Choose a default model or accept `Auto` routing.
6. Enter the empty chat screen with three functional starter actions.

Provider credentials are entered in a secure field with reveal-on-hold, paste support, explicit storage location, and a connection test. Never echo a full secret after saving. On failure, show actionable diagnostics: DNS/TLS/auth/rate-limit/model-not-found rather than a generic error.

The wizard is skippable. A user with no provider can still explore local UI and open Settings, but the composer clearly explains why sending is unavailable.

### 5.2 Home

Home answers “what can I continue or start?”

- Primary `New chat` action.
- Recent conversations grouped by Today / Previous 7 days / Older.
- Pinned projects with their most recent conversation.
- Quiet status rows for active downloads or indexing only when present.
- Quick actions: create project, add provider, import conversation.

No fabricated usage graphs or news feed.

### 5.3 Chats collection

Sidebar controls:

- New chat button.
- Search field with local instant results and advanced filters.
- Filter chips: all, pinned, archived, local-only, has files, provider/model.
- Sort: recent activity, created date, title.

Conversation row:

- Title and one-line excerpt.
- Time or date.
- Project marker when applicable.
- Pinned, shared/synced, or error state only when applicable.
- Context menu: rename, pin, move to project, duplicate, export, archive, delete.

Bulk selection is entered explicitly; selection checkboxes should not permanently consume space.

Search results highlight the matching message snippet and open directly to that message.

### 5.4 Empty conversation

The empty state contains:

- Product wordmark or quiet animated glyph that stops under reduced motion.
- Greeting based on local time without pretending to know personal context.
- Four adaptable starter cards at most, generated locally from enabled capabilities and project state.
- Full composer in its normal final position.
- If inside a project, a compact context line identifying active instructions, folders, and skills.

### 5.5 Conversation canvas

The conversation column targets 760–880 logical pixels for prose while wide artifacts may expand into the available canvas.

#### User message

- Group attachments above text.
- Render text in a subtle user surface, right-offset but not a narrow chat bubble.
- On hover/focus: edit, copy, branch from here, more.
- Editing happens inline and sending creates a branch by default; replacing downstream history requires an explicit destructive action.

#### Assistant message

- Minimal chrome around prose; visually prioritize the answer.
- Header appears when useful: model alias, routing badge, and run status.
- Rich rendering: CommonMark/GFM, syntax-highlighted code, math, tables, callouts, citations, footnotes, diagrams, images, audio, files, and safe HTML fallback.
- Long code blocks have sticky language/file header, copy, wrap toggle, download, and open-as-artifact actions.
- Tables support copy CSV and open-as-artifact; they scroll inside their own region only when necessary.
- Citations use stable numbered markers and open the Sources inspector without losing scroll position.
- Message footer: copy, helpful/not helpful, regenerate, continue, branch, read aloud when supported, and more.

#### Streaming state

- Stream text without shifting the entire viewport.
- Keep the user at the bottom only while they have not scrolled away; show `Jump to latest` otherwise.
- Display a compact run status line for meaningful stages: routing, waiting, reasoning (if provider exposes it), tool request, retrieving sources, writing.
- Reasoning content is never fabricated. Provider-hidden reasoning is represented as status metadata, not synthetic chain-of-thought.
- `Stop` replaces the send button while active. A stopped answer remains and can be continued or retried.
- Partial Markdown/code remains readable during streaming.

#### Run details

Each assistant message can open an inspector view with:

- Resolved provider/model and endpoint profile.
- Start/end time, latency to first token, total duration.
- Input/output/cached/reasoning token counts when supplied.
- Estimated or reported cost with provenance.
- Generation parameters and omitted/default values.
- Context composition summary: system, project instructions, memory, messages, files, skills, retrieved chunks.
- Tool/capability events and retry/fallback route.
- Raw provider request/response available only in explicit developer mode with secret redaction.

#### Active-run queue

When a conversation is already generating, a new send is added to a visible queue rather than discarded or ambiguously merged into the active run.

- The composer labels the primary action `Queue` while a run is active, unless the user chooses a setting that always stops and sends.
- Queued prompts appear immediately above the composer, collapsed to one line each.
- Each queue item can be edited, reordered, sent next, or removed before execution.
- Attachments and context selections are snapshotted per queue item.
- The next item does not start while an approval, provider reconnection, or unresolved attachment failure blocks it.
- Clearing a queue never deletes completed messages or the active partial response.

#### Temporary chat

Temporary chat is a distinct, persistent-in-the-window state rather than a private-looking icon.

- The header and composer carry a `Temporary` label and concise data-policy explanation.
- Conversation content is not added to durable history, full-text search, indexing, sync, or memory extraction.
- Memory is neither read nor written unless the user explicitly enables it for this single run.
- Attachments and extraction caches are removed according to a clearly displayed temporary retention policy.
- Export remains available before closing. Closing warns only when meaningful unsaved artifacts exist.

### 5.6 Composer

The composer is the highest-value interaction surface and must remain approachable.

Collapsed/default anatomy:

```text
┌──────────────────────────────────────────────────────────────┐
│ attachment chips / active context chips                      │
│ Ask anything…                                                │
│                                                              │
│ [+] [mode] [skills/tools]      [model ▾] [voice] [send/stop] │
└──────────────────────────────────────────────────────────────┘
```

Behavior:

- `Enter` sends and `Shift+Enter` inserts a newline by default; user can invert this.
- Input grows to a bounded height and then scrolls internally.
- Draft is saved locally after a short debounce and restored per conversation/branch.
- Drag/drop and paste support files, folders where permitted, images, and rich text.
- `@` opens context mention search across project files, conversations, artifacts, memories, and skills.
- `/` opens prompt commands and skill invocation.
- `#` may filter project context only after the symbol has been explicitly adopted; do not overload syntax initially.
- Context chips show source, scope, token estimate, and remove action.
- An over-budget context meter offers `Auto trim`, `Summarize`, `Change model`, and manual review.

Primary composer controls:

- Add: files, folder reference, image/screenshot, audio, previous conversation, paste-as-text.
- Mode: Ask, Create, Research; modes are capability presets, not separate products.
- Skills/tools: enabled capability set and permission status.
- Model: profile picker with `Auto` at top.
- Voice: optional, hidden when unavailable.
- Send/stop.

The model picker shows favorites and recent profiles first, then groups by provider. Each row displays capability icons, context length, availability, and relative price/latency only when data is trustworthy. Searching matches both aliases and provider IDs.

### 5.7 Advanced generation controls

Advanced controls open in the inspector or a popover from the model picker. Complexity is progressive:

- Preset: Balanced, Precise, Creative, Custom.
- Temperature.
- Top P and Top K where supported.
- Max output tokens.
- Frequency and presence penalties.
- Seed.
- Stop sequences with multiple entries.
- Reasoning effort/budget where supported.
- Response format: text, JSON object, JSON schema.
- Tool choice: auto, required, none, named tool.
- Parallel tool calls.
- Streaming toggle.
- Provider-specific parameters in an `Expert` disclosure.

Unsupported controls are hidden by default, not disabled clutter. `Show unsupported parameters` is available in developer mode for debugging. Every changed value shows inheritance source: app default, model profile, project, conversation, or this message. A `Reset overrides` action restores inherited values.

Raw parameter JSON can be edited in developer mode with schema validation, diff preview, secret filtering, and an explicit precedence rule: validated raw keys override form values for that request.

### 5.8 Branch navigation

- Editing a prior user message or regenerating an answer creates a sibling branch.
- A branch navigator appears beside the affected message as `2 / 3` with previous/next buttons.
- The conversation header can open a branch map for complex trees.
- Branch names default from the divergent prompt but are editable.
- Users can duplicate a branch into a separate conversation or promote it as the visible main path.
- Search indexes all branches and labels hidden-branch matches.

### 5.9 Multi-model compare

Compare is an explicit composer/run mode for two to four candidates. It does not turn every normal answer into a grid.

- The compare setup selects model profiles and optionally a shared preset; incompatibilities are resolved before dispatch.
- The prompt, context snapshot, attachments, and evaluation rubric are frozen once, then translated independently for each provider.
- While running, candidate views show their own status, stop, retry, and provider attribution.
- At compact widths, candidates become a keyboard-accessible tab set; at wide widths, two candidates can be read side by side. Four candidates use a focused reading view plus compact candidate switcher instead of four unreadable columns.
- Synchronized scrolling is optional and off by default.
- Users can rate dimensions, add notes, reveal usage/cost/latency, and promote one answer as the conversation continuation.
- Promotion never deletes the non-selected candidates; they remain attached to the comparison run and export provenance.
- A blind-review option hides provider/model labels until scoring is complete.

### 5.10 Artifact workspace

An artifact opens in the right inspector for quick review or in a split canvas for sustained work.

Target Chat Complete views:

- Text/Markdown preview and source.
- Code with syntax highlighting and line numbers.
- Mermaid/diagram safe preview.
- HTML preview in an isolated sandbox.
- Image preview.
- Structured JSON/tree and table.
- Download-only fallback for unsupported types.

Artifact toolbar: version history, preview/source, copy, save as, export, open externally, close. Target Chat Complete editing can be local text editing with explicit save/version creation; do not imply code execution. The current Provider Preview has no native artifact persistence or version editor.

### 5.11 Projects

Project collection shows pinned/recent projects as a compact list or grid, user-selectable.

Create-project dialog:

- Name and optional icon/accent.
- Local-only or synced data boundary.
- Default model profile or Auto.
- Instructions.
- Add one or more workspace folders.
- Add knowledge files.
- Enable existing skills.

Project overview tabs:

- Conversations.
- Context.
- Files.
- Memory.
- Skills.
- Settings.

At the target Chat Complete boundary, the project header exposes active model and evidence-backed context health. Adding a folder uses the native Windows folder picker, then presents scope and permission choices before any later indexing step. The current Provider Preview stops at a read-only, `Referenced` / not-indexed grant and must show context compilation as unavailable or not compiled; it must not report `Ready`, file/chunk counts, memory, or enabled skills without native evidence. Later phases add `Indexing`, `Ready`, `Partially available`, `Permission lost`, and `Offline` states.

In the current Provider Preview, workspace rows show the canonical path, read-only privacy boundary, `Referenced` / not-indexed state, and revoke/remove behavior. Later indexed-workspace phases add indexing scope, ignore rules, last-indexed time, file/chunk counts, and rescan actions. Removing a folder does not delete disk content and the confirmation says so explicitly.

### 5.12 Assistants, prompts, and presets

Reusable configuration is split into understandable objects rather than one overloaded “bot” editor.

#### Assistants

The assistant collection supports create, clone, import, export, archive, and version review. An assistant editor includes:

- Name, icon, short purpose, and starter prompts.
- Instructions with a rendered precedence preview.
- Preferred routing/model profile and parameter preset.
- Attached knowledge files.
- Memory policy and scope.
- Enabled skills/capabilities with permission review.
- Test conversation that is clearly isolated from real history until saved.

Changing assistant version inside an existing conversation affects future runs only and is recorded in provenance.

#### Prompt templates

- Templates have a name, description, tags, version history, test examples, and typed variables.
- Variable types include short text, long text, number, choice, boolean, date, and file/context reference.
- Invoking a template opens a compact generated form, then previews the resolved prompt when requested.
- The exact template version and resolved value are retained with the run.
- A successful user message can be saved as a template without modifying the original conversation.

#### Parameter presets

Preset detail displays inheritance, supported-model coverage, compatibility warnings, and the effective parameter diff. Saving a conversation override as a preset requires a new name/scope rather than silently mutating the inherited preset.

### 5.13 Memory center

Memory must be useful without becoming invisible surveillance.

Views:

- Inbox: newly inferred memories awaiting approval if approval mode is enabled.
- Active: memories eligible for retrieval.
- Paused.
- Archived.

Memory row fields:

- Human-readable fact/instruction.
- Scope: global, profile, project, or conversation.
- Type: preference, identity, workflow, project fact, constraint.
- Provenance link to source message or explicit user entry.
- Confidence when inferred.
- Last used and created time.
- Optional expiration.

Actions: edit, move scope, pause, forget, pin, inspect usage. Bulk forget requires confirmation. A conversation-level memory indicator shows when memories influenced context and opens the exact list used.

Memory settings provide three modes: Off, Suggestions require approval, Automatic with review log. Sensitive-category detection can force approval regardless of mode.

### 5.14 Skill Studio

Skill Studio supports installed and AI-generated reusable skills while keeping permissions inspectable.

Skill list row:

- Name, description, source, version.
- Scope and enabled projects.
- Required capabilities/permissions.
- Last run/test status.
- Update available marker.

Skill detail tabs:

- Overview.
- Instructions.
- Resources.
- Permissions.
- Tests.
- Versions.

Create skill flow:

1. Describe intended outcome and examples.
2. Generate a draft manifest/instruction set.
3. Review requested permissions and editable files.
4. Run static validation and safe tests.
5. Install globally or into a project.

Generated skills are never silently enabled. Imported skills show source/trust status and a clear permission diff on updates.

### 5.15 Provider and model settings

Settings > Providers uses a master-detail layout.

Provider connection form supports:

- Presets for first-party APIs and local runtimes.
- Generic OpenAI-compatible endpoint.
- Display name and icon.
- Base URL and optional organization/project headers.
- Authentication type: API key, bearer token, OAuth, none/local, custom headers.
- Secret fields stored through the OS credential store.
- Proxy, custom CA, timeout, retry policy.
- Model discovery endpoint with manual model fallback.
- Capability overrides for non-standard providers.
- Connection test and diagnostic result.

Model profile editor supports alias, provider model ID, modality/capabilities, context/output limits, pricing metadata, defaults, custom headers, routing weight, availability, favorite status, and project visibility.

Routing profiles expose a readable policy builder first and validated JSON/YAML only in expert mode. The UI must explain which model actually handled each run.

### 5.16 Evaluations

Evaluations turn comparison and quality checks into reproducible product objects without intruding on ordinary chat.

- Evaluation sets contain cases, input variables, optional attachments/context fixtures, expected constraints, and a rubric.
- A run setup chooses model profiles/presets, concurrency, repeat count, budget ceiling, and whether live provider calls are allowed.
- The run view uses a compact matrix: cases as rows, candidates as columns, status/score in each cell. Selecting a cell opens input, output, assertions, ratings, usage, and trace in the inspector.
- Automated assertions are clearly distinguished from model-judged and human ratings.
- Pairwise blind review hides identity and randomized order until submission.
- Abort stops unsent work and attempts cancellation without deleting completed results.
- Export includes evaluation definition, immutable run references, scoring provenance, and environment metadata.
- Estimated spend is shown before live execution when pricing is known; unknown prices are labeled, never inferred.

### 5.17 Global search and command palette

`Ctrl+K` opens one unified surface with scoped modes:

- Commands.
- Conversations/messages.
- Projects/files/artifacts.
- Models/providers.
- Memories/skills.

Typing searches all; prefixes narrow scope only for power users. Results are keyboard navigable, show location breadcrumbs, and preserve the previous screen when dismissed.

`Ctrl+Shift+P` can open directly in command mode for users coming from IDE workflows.

### 5.18 Settings map

- General: startup, close behavior, language, update channel.
- Appearance: theme, density, font scaling, code font, motion.
- Chat: send key, drafts, rendering, link behavior, default mode.
- Providers: connections, model profiles, routing.
- Personalization: custom instructions, profile, memory.
- Data & privacy: retention, local storage, sync, export, clear data, diagnostics.
- Files & indexing: parsers, limits, ignore patterns, cache.
- Skills: defaults, trust policy, update behavior.
- Notifications: completions, failures, background indexing.
- Shortcuts: searchable and editable with conflict detection.
- Accessibility: reduced motion, high contrast, sound cues, screen reader verbosity.
- Developer: raw request logs, feature flags, diagnostics bundle.
- About: version, licenses, updates.

## 6. Interaction patterns

### 6.1 Context inspector

The inspector is one container with route-like tabs rather than many competing side panels:

- Context.
- Sources.
- Run.
- Parameters.
- Artifact.
- Details.

Opening an artifact selects Artifact; clicking a citation selects Sources. Back/forward within the inspector preserves the conversation scroll position.

### 6.2 Notifications

- Use inline validation near the cause.
- Use toast notifications only for completed background or cross-screen actions.
- Use a status strip for long-running operations such as indexing or model download.
- Use modal dialogs only for focused creation flows, permission grants, unrecoverable choices, and destructive confirmations.
- Toasts are keyboard dismissible, pause while hovered/focused, and persist longer for errors.

### 6.3 Permissions

Permission prompts identify:

- Requesting feature/skill.
- Resource and exact scope.
- Why it is needed.
- Duration: once, this conversation, this project, always.
- Consequence of denial.

Never bundle unrelated permissions. A persistent activity indicator shows when any future tool has file, browser, microphone, screen, or automation access.

### 6.4 Destructive actions and recovery

- Archive is preferred to delete for conversations and projects.
- Delete offers Undo when technically safe.
- Permanent deletion states scope and sync consequences.
- Removing a workspace folder never deletes source files.
- Forgetting a memory states whether it remains in conversation history.
- Replacing a branch or clearing local data requires stronger confirmation.

## 7. Keyboard model

Minimum shortcuts:

| Action | Shortcut |
| --- | --- |
| New chat | `Ctrl+N` |
| New window | `Ctrl+Shift+N` |
| Global search | `Ctrl+K` |
| Command palette | `Ctrl+Shift+P` |
| Open project | `Ctrl+O` |
| Toggle sidebar | `Ctrl+Shift+B` |
| Toggle inspector | `Ctrl+Shift+I` |
| Focus composer | `Ctrl+L` or configurable |
| Send | `Enter` |
| New line | `Shift+Enter` |
| Stop generation | `Esc`, only while composer/run owns focus context |
| Model picker | `Ctrl+M` |
| Attach file | `Ctrl+U` |
| Find in conversation | `Ctrl+F` |
| Next/previous tab | `Ctrl+Tab` / `Ctrl+Shift+Tab` |
| Close tab | `Ctrl+W` |
| Settings | `Ctrl+,` |
| Zoom text/UI | `Ctrl++`, `Ctrl+-`, `Ctrl+0` |

Shortcuts must not override text-editing conventions. All shortcut-only actions remain available in menus.

## 8. Responsive desktop behavior

The supported minimum window is 800 × 600 logical pixels; recommend 1,024 × 720 or larger.

- At 1,440+ width: sidebar and docked inspector can coexist.
- At 1,200–1,439: inspector overlays or replaces part of the canvas, user-selectable.
- At 900–1,199: object sidebar may auto-collapse after navigation; inspector overlays.
- At 800–899: icon rail plus one main surface; sidebars become temporary drawers.
- Full-screen and tablet/touch layouts enlarge hit targets without inflating typography.
- Web and remote-client projections below 800 logical pixels use a single-column canvas with bottom activity navigation. The native Windows window still enforces the 800 × 600 minimum.

Content never relies on hover. Hover reveals convenience actions, but focus and context menus expose the same functions.

## 9. Accessibility and internationalization

- Target WCAG 2.2 AA for custom content and controls.
- Minimum pointer target 32 × 32 logical pixels in compact density and 40 × 40 in comfortable/touch density.
- Visible keyboard focus with strong contrast on every interactive element.
- Screen reader landmarks for rail, sidebar, conversation, composer, and inspector.
- Streaming updates use restrained live regions: announce stage transitions and completion, not every token.
- Messages expose semantic author labels, timestamp, attachments, and action menu.
- Color never carries meaning alone.
- Support Windows high-contrast themes without background-image dependencies.
- Respect system text scaling through at least 200% without blocking core actions.
- Respect reduced motion and reduced transparency.
- Localize all UI strings; do not concatenate translated fragments.
- Design for 30–40% text expansion. Support left-to-right first but keep layout direction-aware for future RTL.
- Date, time, number, currency, token counts, and shortcuts follow locale conventions.

## 10. Performance perception

- Native shell renders immediately with cached navigation data.
- Conversation list uses virtualization but keeps native-feeling keyboard navigation and accessibility.
- Opening a cached conversation should show content before provider/network initialization completes.
- Skeletons match final geometry and appear only after a short delay to avoid flicker.
- Streaming should batch visual updates enough to remain smooth while preserving low perceived latency.
- Heavy artifacts and syntax highlighting render incrementally or off the main UI thread.
- Large histories preserve scroll anchor when older messages load.

## 11. Empty, loading, offline, and error states

Every primary view defines:

- Initial empty state with one obvious next action.
- Loading state that preserves structure.
- Offline state with locally available capabilities.
- Permission-denied state with a route to fix access.
- Recoverable error with retry.
- Non-recoverable error with diagnostics/export route.

Chat send errors stay attached to the attempted message and preserve the draft/attachments. Provider fallback requires prior policy or explicit confirmation; never silently charge a different provider.

Rate-limit errors display retry timing when known. Context-limit errors identify the overage and offer trimming choices. Safety/policy refusals are rendered as provider output with provider attribution, not as app crashes.

## 12. Copy and tone

- Direct, calm, specific, and non-anthropomorphic in system UI.
- Buttons use verbs: `Add provider`, `Create project`, `Retry with…`.
- Avoid “Oops”, “magic”, and vague “Something went wrong” without a diagnostic detail.
- Distinguish app behavior from model output: “Omnia could not reach the provider” versus “The model declined the request.”
- Always clarify whether data stays local, is sent to a provider, is synced, or will be deleted.

## 13. Future extension contracts

The chat-first shell reserves these concepts without showing inactive clutter:

- A tab content type can be conversation, artifact, editor, terminal, browser, diff, agent run, or settings.
- The inspector accepts context, sources, run details, parameters, outline, diagnostics, and permissions routes.
- The status strip can host indexing, downloads, sync, long runs, and background agents.
- Composer capability chips can later add terminal, browser, file-write, and computer-use permissions.
- Project folders already carry trust and permission state compatible with future code execution.
- Run events use a generic timeline capable of model, retrieval, tool, agent, browser, terminal, and approval events.

Do not render disabled IDE/browser/agent buttons in chat phases unless a feature flag enables an honest preview.
