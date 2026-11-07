# Omnia Desktop — Chat Complete UI acceptance backlog

The filename is retained for compatibility, but this checklist defines the target Chat Complete desktop experience, not the much narrower Phase 1 Provider Preview. It is intentionally stricter than a visual mockup: items cover interaction, failure, accessibility, and state integrity. Unchecked items are requirements, never evidence that the preview already supports them; consult [`../IMPLEMENTATION_STATUS.md`](../IMPLEMENTATION_STATUS.md) for current capability truth.

## 1. Native desktop shell

- [ ] Installs and launches as a Windows 11 desktop application without requiring a browser tab.
- [ ] Native minimize, maximize/restore, close, snap layouts, system menu, resizing, and multi-window behavior work.
- [ ] Window position, size, theme, density, and panel widths restore safely after restart and after monitor topology changes.
- [ ] UI remains usable at 800 × 600 logical pixels and 200% text/UI scaling.
- [ ] Activity rail, object sidebar, main canvas, composer, and inspector expose distinct accessibility landmarks.
- [ ] Keyboard focus order follows visual order and never enters hidden panels.
- [ ] Light, dark, system, high contrast, reduced motion, and reduced transparency modes have been visually tested.

## 2. Provider onboarding and BYOK

- [ ] A first-time user can add an OpenAI-compatible provider, securely save a key, discover or manually add a model, and send a message.
- [ ] API keys are never redisplayed in full and are never present in normal diagnostics, logs, or UI source/state snapshots.
- [ ] Connection tests distinguish invalid credentials, unreachable host, TLS problem, rate limit, unsupported API, and missing model when detectable.
- [ ] The provider form supports base URL, authentication type, custom non-secret headers, secret headers, timeout, and model discovery/manual entry.
- [ ] Provider and model capability differences drive the UI; unsupported parameters and attachment types are not silently sent.
- [ ] A no-provider state remains navigable and clearly routes to provider setup.

## 3. Chat lifecycle

- [ ] New chat, rename, pin, move to project, duplicate, archive, restore, export, and delete work with appropriate undo/confirmation.
- [ ] Draft text and selected context survive navigation, restart, and recoverable send failure.
- [ ] A single send gesture creates one persisted user message and at most one model run.
- [ ] Streaming Markdown, code fences, lists, tables, and citations remain stable and readable while incomplete.
- [ ] Stop preserves partial output and enables Continue/Retry.
- [ ] Scrolling away during generation disables auto-follow and reveals a keyboard-accessible Jump to latest control.
- [ ] Editing a previous message creates a branch by default and does not destroy the original path.
- [ ] Regeneration creates an alternate answer with visible sibling navigation.
- [ ] Copy actions copy complete underlying content and announce success accessibly.
- [ ] Long conversations preserve scroll position and load older history without visible anchor jumps.
- [ ] Search opens the exact matching message and labels matches located on a non-active branch.
- [ ] Sending during an active run creates a visible, editable, reorderable queue item with its own context snapshot.
- [ ] Temporary chat is visibly distinct and writes neither durable history, search index, sync data, nor memory unless a one-run exception is explicitly approved.
- [ ] Compare mode runs two to four independently attributed candidates from one frozen logical input and preserves all candidates after promotion.

## 4. Rich messages and artifacts

- [ ] Markdown, GFM tables, syntax-highlighted code, math, images, common file attachments, citations, and provider errors have distinct safe renderers.
- [ ] Code blocks support copy, wrap, download, language/filename label, and open-as-artifact.
- [ ] Tables can be copied as CSV and remain usable at minimum window width.
- [ ] Untrusted HTML never executes in the application context; HTML preview is isolated.
- [ ] Artifacts have stable identity and versions, and can open in inspector or split canvas without losing chat position.
- [ ] Unsupported artifact types show metadata and safe open/download options rather than a blank pane.

## 5. Composer and context

- [ ] Composer supports configurable send/newline keys, multiline growth, paste, drag/drop, attachment browse, mentions, commands, model selection, and stop.
- [ ] Attachment chips communicate processing, ready, warning, and failure states.
- [ ] Folder drops require an explicit access/scope decision before indexing or attaching content.
- [ ] Context chips identify project instructions, files/folders, memories, skills, artifacts, and prior conversations by icon plus text.
- [ ] Context token estimate labels exact versus estimated values.
- [ ] Over-budget context offers actionable trim, summarize, model-change, and manual review choices without losing the draft.
- [ ] Switching to an incompatible model warns about affected attachments/parameters and never silently discards them.
- [ ] Sending while uploads/parsing are incomplete has one clear, tested policy reflected in UI copy.

## 6. Advanced generation controls

- [ ] Supported parameters are generated from provider/model capability metadata and validate before send.
- [ ] Temperature, Top P/Top K, max output, penalties, seed, stop sequences, reasoning control, response format, tool choice, and streaming are available when supported.
- [ ] Every override shows its inheritance source and can be reset.
- [ ] Conversation and per-message overrides do not mutate global/model defaults.
- [ ] Expert raw parameters validate, preview their effective diff, redact secrets, and obey a documented precedence rule.
- [ ] The completed message exposes effective parameters and actual resolved provider/model in Run details.

## 7. Run transparency and recovery

- [ ] Run stages are backed by real harness events and do not invent progress percentages or reasoning content.
- [ ] Run details show resolved route, timing, tokens, reported/estimated cost, context composition, retries/fallbacks, and tool/capability events when data exists.
- [ ] Missing usage values display Not reported rather than zero.
- [ ] Retrying a run cannot accidentally duplicate the visible user message.
- [ ] Fallback to a provider with different cost/privacy does not occur silently unless an explicit routing policy already authorized it.
- [ ] Rate limit, context overflow, authentication, network, cancellation, malformed response, storage, and unknown errors each retain a recovery path and diagnostics ID.
- [ ] A failed send never clears the user's draft or recoverable attachment selection.

## 8. Projects and workspace folders

- [ ] Users can create, edit, archive, restore, export, and delete a project.
- [ ] Project instructions, model policy, conversations, knowledge files, workspace folders, project memory, and enabled skills are independently manageable.
- [ ] Native folder picker adds multiple workspace folders and records canonical paths.
- [ ] Folder states cover referenced, indexing, ready, partial, permission lost, offline, and error.
- [ ] Folder removal explicitly says source files will not be deleted and verifies that behavior.
- [ ] Index scope and ignore rules are reviewable and changeable.
- [ ] Project context health reflects indexing, permission, and token-budget issues.

## 9. Memory

- [ ] Memory can be Off, approval-based, or automatic with a review log.
- [ ] Users can create, approve, edit, scope, pause, archive, expire, and forget a memory.
- [ ] Inferred memory shows provenance and confidence; explicit memory is not given artificial confidence.
- [ ] Every run that uses memory records the exact memory IDs and makes them inspectable.
- [ ] Sensitive inferred categories can require approval even in automatic mode.
- [ ] Forgetting memory explains whether the source conversation remains and whether synced copies are affected.
- [ ] Memory search and bulk review remain keyboard and screen-reader usable.

## 10. Skills

- [ ] Users can import, create from a guided AI draft, review, validate, install, disable, update, export, and remove a skill.
- [ ] Skill detail exposes instructions, resources, permissions, tests, source, trust, versions, and scope.
- [ ] Generated or imported skills are not enabled without an explicit review.
- [ ] Permission increases on update require a permission diff and confirmation.
- [ ] Skills can be globally installed but enabled/disabled per project.
- [ ] Skill invocation from `/` and the composer capability picker resolves to the exact installed version.

## 11. Search, commands, and shortcuts

- [ ] Global search covers commands, conversations/messages, projects/files/artifacts, providers/models, memories, and skills.
- [ ] Search results include clear breadcrumbs and open the exact object.
- [ ] The command palette supports complete keyboard operation and restores prior focus on dismissal.
- [ ] Core shortcuts are implemented, discoverable in menus/tooltips, and customizable with conflict detection.
- [ ] Text editing, IME composition, dead keys, and international keyboard input are not intercepted by global shortcuts.

## 12. Assistants, prompts, presets, and evaluations

- [ ] Users can create, clone, version, archive, import, and export assistant profiles with instructions, model/preset, files, memory policy, and skills.
- [ ] A conversation/run records the exact assistant version used; editing an assistant never retroactively changes prior provenance.
- [ ] Prompt templates support typed variables, validation, resolution preview, examples, and version history.
- [ ] Runs retain both template version and exact resolved prompt.
- [ ] Parameter presets expose inheritance and compatibility and cannot be silently mutated through a conversation-level override.
- [ ] Evaluation sets support reproducible cases, candidate configurations, deterministic/model-judged/human score provenance, progress, cancellation, and export.
- [ ] Blind pairwise review does not reveal model/provider identity before rating submission.
- [ ] Live evaluation setup shows a spending estimate when verifiable and an explicit unknown state otherwise.

## 13. Accessibility and localization

- [ ] Automated accessibility checks pass for the component library and representative full screens.
- [ ] A manual keyboard-only pass covers onboarding, chat, projects, memory, skills, settings, and destructive confirmations.
- [ ] A manual screen-reader pass covers conversation navigation, streaming completion, code blocks, citations, errors, and permission prompts.
- [ ] Status is never encoded only by color.
- [ ] Pointer targets meet 32 × 32 logical pixels in compact density and 40 × 40 in comfortable/touch density.
- [ ] All strings are externalized and representative 40% expansion does not clip controls.
- [ ] Locale-aware date, time, number, currency, and plural formatting is used.
- [ ] Reduced motion prevents non-essential transitions and streaming caret animation.

## 14. Performance and visual quality gates

- [ ] Cached app shell and navigation become usable without waiting for provider initialization.
- [ ] Conversation list and long message timelines stay responsive with representative large datasets.
- [ ] Syntax highlighting and artifact rendering do not stall typing or streaming.
- [ ] The composer maintains responsive input under simultaneous streaming/indexing activity.
- [ ] No primary screen contains horizontal page scrolling at supported widths.
- [ ] No overlay clips at 800 × 600 or with 200% scaling.
- [ ] Every screen has reviewed empty, loading, populated, partial, offline, permission-denied, and error states where applicable.
- [ ] Screenshot regression covers light/dark themes at 800, 1,024, 1,440, and 1,920 logical-pixel widths.
- [ ] Animations remain smooth on the defined minimum hardware profile and all functionality works with animation disabled.

## 15. Product boundary

- [ ] Chat Complete does not imply that code execution, terminal, browser automation, IDE editing, autonomous agents, or computer-use are available unless implemented behind an explicit preview flag.
- [ ] The shell, tab model, inspector routes, run event model, folder trust state, and permission system can accept those later capabilities without a navigation rewrite.
