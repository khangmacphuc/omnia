# Official UI Reference Refresh for Omnia

- Status: Informative research; not a shipped-capability inventory
- Research date: 2026-08-13
- Scope: Public UI hierarchy, interaction semantics, icon/state language, and
  implementation gates from official Codex and Claude Code sources
- Clean-room rule: Adopt interaction principles and state contracts only;
  never copy vendor code, prompts, assets, wording, branding, spacing, palette,
  typography, animation, or distinctive illustration

## 1. Purpose

Omnia needs a visual system that can represent chat, long-running work,
subagents, plans, tools, approvals, environments, citations, artifacts, and
future IDE/browser/computer-use surfaces without turning the product into a
dense dashboard or a collection of colorful AI cards.

This refresh answers four concrete questions:

1. What do current official Codex and Claude Code surfaces make visible while
   work is running?
2. How do those surfaces compress agent and tool activity without hiding
   important state?
3. Which patterns should Omnia adopt, adapt, or reject?
4. What typed components and deterministic gates should implementation use?

This document does not replace Omnia's normative UI specification,
component contracts, icon system, or implementation-status inventory. It is a
source-backed decision aid for those documents and for future implementation.

## 2. Provenance and freshness

### 2.1 OpenAI Codex

Official repository inspected:

```text
Repository: openai/codex
Current HEAD verified: a7b8c074b577f897111c14de3a5e127b91e2a479
Commit timestamp: 2026-08-13T12:30:54Z
Commit title: Add the Guardian V2 Luna sampler (#38368)
License: Apache-2.0
```

The visual artifact inspected was the official repository splash image:

```text
Path: .github/codex-cli-splash.png
Dimensions: 1898 x 1190
SHA-256: 15B86FA9C0790A779ECDD84F1E7DEE029AB79BFB093BD3C4876998696925B013
```

The splash image at the current HEAD is byte-identical to the image at the
previous pinned research commit
`72fa74fbc9c4b72d513304bfa0eda427d2402ed9`. The new HEAD therefore changes
the freshness pin but does not add new visual evidence.

The current Codex Manual was refreshed through the official OpenAI manual
helper on 2026-08-13. Relevant documented surfaces include:

- background subagents above the composer;
- inspectable subagent threads;
- read-only Active and Done subagent lists;
- approval overlays that identify the source thread;
- goal progress and queued-message rows above the composer;
- model, reasoning, environment, and permission controls near the composer;
- integrated terminal and review surfaces;
- plan, branch, resume, and steering workflows.

The open-source Codex repository does not contain the complete proprietary
Codex desktop React UI or its full icon system. The splash image and public
manual therefore support structural and interaction conclusions only. They do
not justify cloning a desktop layout or reconstructing unavailable assets.

### 2.2 Anthropic Claude Code

Official repository inspected:

```text
Repository: anthropics/claude-code
Current HEAD verified: be90077c6a353f292fa612d97173865a9ab21b83
Commit timestamp: 2026-08-13T08:38:44Z
License: Anthropic commercial terms / all rights reserved
```

Official visual artifacts inspected:

```text
Artifact: demo.gif
Dimensions: 1552 x 992
Frames: 414
Duration: 42.4 seconds
SHA-256: 461CF109F52648929ACD9959A87E5673541F8249497512B8E4F1D32D10F0FD57

Artifact: official Agent View light screenshot
Dimensions: 1772 x 780
SHA-256: 2FD4A7501B721C3AA98A326BE9B663E03524ACD3B46EB53FAC85F6F188F4C509

Artifact: official Agent View dark screenshot
Dimensions: 1772 x 780
SHA-256: D47494BBFBDBA14A880845C7877C3726B3F4E1263124ADBE64A7E11280A67F29
```

Official documentation inspected on 2026-08-13:

- Agent View;
- Interactive mode;
- Subagents;
- Sessions.

The Agent View documentation labels that interface a research preview. Omnia
should adopt the durable interaction principles, not assume the exact grouping,
shortcuts, or visuals are stable product standards.

### 2.3 Excluded source

The user-provided snapshot below remains completely excluded from
implementation and visual research:

```text
tanbiralam/claude-code@6f6f12b37f529488b10e53928dd5508bb93535c7
```

No code, prompt, dependency bundle, algorithm, icon, screenshot, animation,
asset, wording, or distinctive internal structure from that snapshot was read
or used for this refresh.

### 2.4 Evidence labels used here

| Label | Meaning | Allowed use |
| --- | --- | --- |
| A | Pinned official source or official product documentation | Architecture and interaction contract evidence |
| B | Current official manual or documentation without a pinned source file | Current public behavior, with future drift expected |
| D | Direct observation of an official screenshot or animation | Visual hierarchy and interaction inspiration only |
| O | Omnia source observed in the current workspace | Current implementation comparison only |

An image never proves durability, permissions, replay, security, or hidden
behavior. A public description never proves Omnia has implemented the feature.

## 3. High-confidence shared findings

Codex and Claude Code differ visually, but their strongest interaction patterns
converge.

### 3.1 Identity and execution context stay visible

The official Codex splash puts product identity, model, and directory in a
compact header. Claude Code's demo and Agent View show product/version, model,
working directory, and aggregate activity near the top.

Omnia translation:

- keep conversation/task identity and project or workspace scope visible;
- show the effective provider/model and environment without dominating the
  reading surface;
- display permission mode close to the composer or operation boundary;
- do not expose a raw local path by default when a friendly workspace label is
  sufficient;
- make every displayed value a projection of an authoritative native record.

### 3.2 Plans, tasks, processes, and agents are different objects

The Codex splash separates an Updated Plan from exploration activity. Claude
Code explicitly separates its task-list checklist from the background-task
view. Agent View lists durable sessions; the interactive transcript lists tool
activity.

Omnia translation:

```text
Plan
  structured intended steps

Task
  user-visible unit of work with completion gates

Agent
  durable actor/thread that owns work

Process / tool execution
  runtime operation owned by a run or agent

Event
  append-only fact about what occurred
```

The UI must not label shell processes, plan steps, and subagents with one
generic `Task` collection. Their lifecycles, controls, and recovery semantics
are different.

### 3.3 One active item receives emphasis

The Codex plan gives one current step strong emphasis and keeps later steps
muted. Claude Code gives the current activity one concise active row and makes
completed tool rows quieter.

Omnia translation:

- emphasize the current high-level operation, not every low-level delta;
- keep pending plan steps visible but visually subordinate;
- collapse completed detail into outcome-oriented groups;
- never use multiple simultaneous accent colors to make every object look
  equally important.

### 3.4 Tool activity is compressed by outcome

Claude Code's official demo presents tool work as:

```text
Verb(target)
  one-line result
```

Examples include reading a file, searching a pattern, or running a command.
The user can expand detail, while the default transcript stays readable.

Omnia translation:

- a tool group header shows semantic verb, target display name, state, elapsed
  time, and one-line outcome;
- exact arguments, stdout/stderr, hashes, environment, approvals, and effects
  live one expansion or inspector selection away;
- repeated low-level events may be grouped only when the durable journal
  preserves every original fact and the projection discloses the grouping;
- errors remain visible inline but do not replace the entire chat with a
  generic failure page.

### 3.5 The input stays available during work

The Claude Code demo keeps the prompt input visible while work runs and shows
an interrupt affordance. Current Codex documentation exposes goal progress,
queued follow-ups, and background agents above the composer, while allowing
the user to steer work.

Omnia translation:

- keep the composer available during long runs;
- distinguish steer-now, queue-next, side-question, and new-task semantics;
- show queued messages above the composer with edit, reorder, send, and remove
  controls only when the native queue exists;
- stop/cancel controls must target the exact run or attempt;
- never relabel an in-memory optimistic action as durable completion.

### 3.6 Progressive disclosure beats transcript flooding

Codex exposes inspectable agent threads. Claude Agent View offers a compact row,
a peek panel for recent output or the blocking question, and full attach for
the complete conversation.

Omnia translation:

```text
row summary
  -> peek / inspector projection
    -> full agent thread, artifact, terminal, or run trace
```

The main chat should receive a bounded result summary, not raw subagent logs,
unless the user explicitly opens them.

### 3.7 Attention state is more useful than decorative categorization

The official Agent View groups sessions by what the user needs to do:

- Needs input;
- Working;
- Completed;
- with documented support for pinned, ready-for-review, idle, failed, and
  stopped states.

Each row primarily contains:

- state glyph;
- stable name;
- one-line current activity, blocking question, or result;
- age or duration;
- an optional linked pull request.

This is a better model for Omnia than one large colorful card per subagent.

Omnia translation:

- order attention-required work first;
- group by actionable state rather than model vendor or decorative persona;
- keep rows dense and scannable;
- use the inspector or peek surface for model, token budget, worktree,
  environment, context, permissions, and event details;
- allow pinning without changing agent context or authority.

### 3.8 State uses shape, text, and color together

Claude Agent View documents both color/state and shape/process distinctions.
Codex documents source-thread labels for approvals.

Omnia translation:

- state must never depend on color alone;
- role icon and state glyph are separate semantic layers;
- `needs input` must include the exact reason and source agent/thread;
- `working` requires current durable activity evidence;
- `complete` requires a terminal fact, not an animation timeout;
- `failed`, `stopped`, `outcome unknown`, and `needs resolution` remain
  distinct.

### 3.9 Summaries are derived projections, not authoritative events

Claude Agent View uses one-line row summaries that update from recent work and
may be model-generated at turn boundaries. That is useful compression, but the
summary is not the session history.

Omnia translation:

```ts
interface ActivitySummaryProjection {
  text: string;
  source: "event" | "tool-output" | "derived-summary";
  throughCursor: string;
  generatedAt: string;
  stale: boolean;
}
```

The UI must be able to disclose that a summary is derived, which journal cursor
it covers, and whether newer events make it stale. A summary may never grant a
permission, satisfy a completion gate, or replace the original journal.

## 4. Codex-specific interaction lessons

### 4.1 Plan hierarchy

The official splash demonstrates a compact plan with:

- a clear plan heading;
- one active step;
- muted pending steps;
- commentary and exploration outside the plan list.

Omnia should render the plan as a structured projection, not Markdown text that
happens to contain checkboxes. Each item needs a stable ID, state, owner,
dependencies, completion gate, and journal cursor.

### 4.2 Background agents above the composer

Current official Codex documentation says active subagents can appear above the
composer, with an expandable panel for status, opening individual threads, and
stopping active agents.

Omnia should use two complementary surfaces:

1. a compact background-work strip above the composer when work is active or
   needs attention;
2. a dedicated Agents activity for the complete list, filters, comparisons,
   budgets, environments, and results.

The strip should disappear when empty. It must not permanently consume
conversation space.

### 4.3 Active and Done are projections, not the whole state machine

Codex exposes simple Active and Done lists for quick inspection, while its
runtime has richer state. Omnia can offer simple high-level filters, but its
underlying typed states must retain queued, resolving, awaiting approval,
running, paused, stopping, completed, failed, stopped, and outcome-unknown
semantics.

### 4.4 Approval provenance

Codex approval UI identifies which inactive agent thread produced a request
and lets the user open that thread before deciding.

Omnia must include, at minimum:

- requesting agent/thread;
- exact tool and canonical operation summary;
- target environment and workspace grant;
- changed-argument warning;
- approval scope and expiry;
- open-source-thread action;
- deny as an always-available choice.

### 4.5 Composer-adjacent controls

Codex places model/reasoning, permission, environment, goal progress, and
queued-message controls near the composer because they affect the next action.

Omnia should preserve that proximity but avoid one undifferentiated toolbar.
Use small typed groups:

```text
Input sources
Model and reasoning
Mode / harness preset
Environment
Permissions
Send / steer / queue / stop
```

Advanced provider parameters belong in a popover or inspector with inheritance
and support provenance, not as dozens of permanently visible fields.

## 5. Claude Code-specific interaction lessons

### 5.1 Agent View is an attention queue

The official light and dark screenshots use a full-width list rather than a
card grid. The selected row receives a quiet background highlight. Section
headings carry most of the hierarchy. The dispatch input stays at the bottom,
followed by terse keyboard hints.

Omnia should translate this into a Windows-native list with:

- stable column alignment without forcing a spreadsheet aesthetic;
- state/role icon;
- task or agent name;
- one-line summary;
- age/duration;
- optional branch, PR, artifact, or environment badges;
- one selected row with a subtle neutral/brand-tinted surface;
- no glow, rainbow border, mascot avatar, or unique tinted card per agent.

### 5.2 Peek and attach are separate depth levels

Agent View's peek panel exposes the newest output or blocking question without
leaving the list. Attach opens the full conversation.

Omnia mapping:

- single click selects a row and updates the inspector;
- Space or a dedicated Peek action opens a non-modal detail surface;
- Enter or Open thread navigates to the full agent thread;
- Escape returns focus to the originating row;
- opening a thread does not silently stop, resume, or reprioritize it.

### 5.3 Role and state must not be conflated

Claude's screenshot primarily visualizes runtime state. The user also wants
beautiful, recognizable subagent icons. Omnia should add a semantic role-icon
layer while keeping state separate.

Recommended role vocabulary:

| Role | Geometry cue | Meaning |
| --- | --- | --- |
| Explorer | compass / branching path | read-heavy codebase or source exploration |
| Researcher | lens over source lines | external or corpus research with citations |
| Architect | blueprint / connected blocks | system design and dependency planning |
| Implementer | brackets with edit stroke | bounded code or artifact implementation |
| Tester | beaker / check matrix | tests, benchmarks, reproducibility |
| Reviewer | document with inspection mark | correctness and maintainability review |
| Security | shield with bounded keyhole | security analysis and policy verification |
| Operator | terminal prompt / control surface | environment or deployment operations |

Rules:

- use one 24 px grid and the same optical weight as `ProductIcon`;
- use a small state badge or adjacent state glyph, not a recolored role glyph;
- use one icon per semantic role, not random generated avatars;
- accessible text always names both role and current state;
- user-defined agents may choose a role icon from the allowlist but cannot
  inject arbitrary SVG into trusted product chrome.

### 5.4 Prompt suggestions are ghost proposals

Official interactive-mode documentation describes a gray suggestion in the
input that the user explicitly accepts before sending. Suggestions are skipped
when the value/caching conditions do not justify the extra request and can be
disabled by policy.

Omnia decision:

- prompt suggestions are visually distinct from user-authored text;
- Tab or an explicit action inserts the suggestion into the editable composer;
- accepting never auto-sends;
- suggestions record reason, source snapshot, expected value, cost estimate,
  and policy state;
- suggestion generation is cancellable, optional, and skipped when predicted
  value is low;
- prompt suggestions and executable action suggestions use different types and
  controls.

### 5.5 Side questions are a separate contract

Claude Code's `/btw` sees existing conversation context, has no tools, does not
enter main history by default, remains available during work, and can be
explicitly promoted by forking.

Omnia decision:

```text
Side question
  context: selected frozen conversation projection
  tools: none by default
  memory writes: none
  main-history mutation: none
  provider request: separate attempt and usage
  promotion: explicit branch or prompt-workshop action
```

The Omnia surface should be a compact non-modal drawer or overlay that can hold
a short threaded discussion. The user may finalize the result into the main
composer without copying and without automatic submission.

### 5.6 Task list stays separate from background work

Claude Code displays only a bounded subset of plan tasks by default and keeps
background processes/subagents elsewhere.

Omnia decision:

- show the current plan's active item and a small number of adjacent items near
  the run header;
- expose the full plan in the inspector or Plan artifact;
- show background agents and processes in their own activity projection;
- preserve plan tasks across compaction by identity, not by rendered text.

## 6. Omnia current-snapshot comparison

The following is a bounded source observation, not a release certification.

### 6.1 Foundations already present

- `OmniaLogo` uses an independent aperture mark rather than a robot, sparkle,
  or vendor mark.
- `ProductIcon` defines a consistent 24 px entity family for agent, task, plan,
  run, environment, memory, skill, artifact, citation, model, browser, and
  terminal concepts.
- The activity registry is typed and centralizes labels, placement, icons,
  sidebars, commands, and lazy screen loading.
- The conversation view keeps the composer available and has an optional
  inspector.
- Planned controls are visibly disabled and labeled instead of being simulated
  as working features.
- Token, typography, modal, drawer, lazy-loading, and hit-target work is being
  handled by dedicated implementation and QA slices.

### 6.2 Important missing UI/runtime dependencies

- No production Agents activity or attention-grouped background-work list.
- No durable native event projection that can power a truthful tool/run
  timeline across restart.
- No production task/plan projection tied to a durable task graph.
- No `btw` side-question runtime or prompt-workshop promotion flow.
- No production prompt-suggestion engine with cache/value/policy receipts.
- No role-specific entity icon vocabulary beyond the generic `agent` icon.
- No complete agent peek/open/steer/stop workflow.
- No same-snapshot live visual evidence for these future surfaces.

The durable run journal, exact attempt/input binding, agent DAG, task graph,
capability broker, and context compiler are prerequisites. UI should remain
unavailable or honestly preview-only until those sources exist.

## 7. Recommended Omnia component model

### 7.1 Background-work strip

```ts
interface BackgroundWorkStripView {
  needsInputCount: number;
  activeCount: number;
  completedSinceViewedCount: number;
  rows: readonly BackgroundWorkRowView[];
  expanded: boolean;
}

interface BackgroundWorkRowView {
  id: string;
  kind: "agent" | "run" | "tool-process" | "goal";
  role?: AgentRole;
  name: string;
  state:
    | "queued"
    | "working"
    | "needs-input"
    | "ready-for-review"
    | "completed"
    | "failed"
    | "stopped"
    | "outcome-unknown";
  summary: ActivitySummaryProjection;
  createdAt: string;
  terminalAt?: string;
  sourceThreadId?: string;
  environmentLabel?: string;
  branchLabel?: string;
  approvalId?: string;
  resultArtifactId?: string;
}
```

Rules:

- hidden when all counts are zero and no recent completion needs acknowledgement;
- needs-input rows sort before working rows;
- completed rows do not remain expanded indefinitely;
- counts are backed by stable IDs and cannot double-count a row;
- opening/closing the strip never changes runtime state;
- stop-all requires exact eligible targets and a confirmation when effects may
  be ambiguous.

### 7.2 Agents activity

Primary sections:

```text
Pinned
Needs input
Working
Ready for review
Completed
Stopped / failed / needs resolution
```

Sections with zero rows are normally omitted. Users can enable an `All states`
view for audit/recovery.

Each row should expose only:

- role/state icon stack;
- stable name;
- one-line summary;
- age or frozen duration;
- small typed badges when material.

The inspector exposes:

- objective and parent task;
- parent/child agents;
- model/provider and reasoning;
- context snapshot and memory/skill revisions;
- environment, branch, workspace/worktree, and permissions;
- token/cost/latency budgets;
- current plan and latest events;
- artifacts, citations, tests, and terminal reason;
- steer, pause, stop, open thread, compare, and export actions when supported.

### 7.3 Run activity projection

```ts
interface RunActivityGroupView {
  id: string;
  runId: string;
  state: "active" | "complete" | "failed" | "stopped";
  title: string;
  summary: string;
  startedAt: string;
  completedAt?: string;
  eventCount: number;
  firstSequence: number;
  lastSequence: number;
  expandable: boolean;
}
```

Grouping is a projection over durable events. Expanding a group reveals exact
ordered events. The group must never omit a failure, approval, effect, or
outcome-unknown boundary.

### 7.4 Plan projection

```ts
interface PlanItemView {
  id: string;
  title: string;
  state: "pending" | "in-progress" | "blocked" | "complete" | "skipped";
  ownerId?: string;
  dependencyIds: readonly string[];
  completionGate?: string;
}
```

The compact surface shows the current item plus a bounded amount of context.
The full Plan artifact shows every item, dependency, owner, gate, decision, and
revision.

### 7.5 Side-question and prompt-workshop surfaces

Use separate contracts:

```text
Prompt suggestion
  one proposal inserted into the composer only after acceptance

Action suggestion
  typed executable proposal requiring its normal policy checks

Side question
  auxiliary context-only conversation, no tools by default

Prompt workshop
  multi-turn prompt refinement with explicit Finalize to composer

Multi-model discussion
  comparison artifact with separate attempts and promotion decision
```

Combining these into one generic `AI suggestion` popover would hide important
differences in cost, context, permissions, and history mutation.

## 8. Visual and icon direction

### 8.1 Adopt

- quiet neutral surfaces;
- one primary accent;
- section headings and whitespace as hierarchy;
- compact rows for many agents;
- one selected row using a subtle surface change;
- state shown by glyph, label, and tone;
- exact detail in an inspector or peek surface;
- persistent composer for dispatch and steering;
- role-specific Omnia icons on a coherent grid;
- animation only for real, current activity.

### 8.2 Adapt

- terminal lists become Windows-native list rows with density-aware hit targets;
- keyboard hints become discoverable shortcuts/tooltips and command-palette
  entries;
- active/complete filters retain Omnia's richer hidden state machine;
- model-generated row summaries gain cursor, freshness, and provenance;
- Claude's role-neutral session glyphs gain a separate Omnia role-icon layer;
- Codex plan text becomes a typed plan projection and artifact.

### 8.3 Reject

- vendor mascots or wordmarks;
- Claude's pixel-art robot;
- Codex or Claude palettes, fonts, exact spacing, terminal framing, or wording;
- random per-agent avatars;
- sparkle, robot head, magic wand, neural node, or rainbow-gradient defaults;
- every agent as a large tinted card;
- color-only status;
- looping decorative animation;
- a permanently open metrics dashboard around ordinary chat;
- a flat transcript where every event has equal visual weight;
- hiding permission, environment, or outcome ambiguity behind a friendly
  one-line status.

## 9. Truthfulness and harness requirements

The premium UI depends on a trustworthy harness. Visual polish cannot repair
missing authority.

### 9.1 State projection rules

- UI state is derived from committed native events and projections.
- Renderer notification failure does not change provider or agent outcome.
- Every live row binds exact run, attempt, agent, branch, and environment IDs.
- Completed requires a terminal fact.
- Needs input requires a live typed question or approval request.
- Stopped, failed, and outcome unknown are never merged.
- A stale derived summary is visibly refreshable and never used as policy.
- A branch switch does not retarget background output.
- A compacted conversation does not delete raw agent/tool events.

### 9.2 Security rules

- Role icons, names, summaries, skills, and model output cannot grant
  capabilities.
- Approval surfaces identify the requesting thread and exact operation.
- Arbitrary extension SVG or HTML cannot enter trusted icon/chrome surfaces.
- Raw secrets, headers, cookies, credential handles, and unrestricted paths do
  not appear in ordinary rows or tool summaries.
- Remote and privileged state use explicit badges and typed receipts; they are
  never inferred from agent prose.

### 9.3 Performance rules

- Agent lists virtualize only after preserving keyboard and screen-reader
  semantics.
- Summaries update at bounded intervals and do not trigger unbounded model
  calls.
- Detail panels lazy-load heavy traces and artifacts.
- The compact strip subscribes only to counts and its bounded visible rows.
- Animations do not run for offscreen completed work.

## 10. Deterministic acceptance catalogue

### 10.1 Agent attention surface

- `needs_input_agents_sort_before_working_agents`
- `empty_agent_sections_are_omitted`
- `agent_row_summary_is_one_bounded_projection_not_raw_transcript`
- `agent_row_discloses_stale_summary_cursor`
- `agent_duration_freezes_at_terminal_fact`
- `agent_role_and_runtime_state_have_separate_semantics`
- `agent_state_remains_understandable_without_color`
- `selected_agent_row_uses_one_subtle_highlight`
- `open_agent_thread_does_not_mutate_or_resume_it`
- `peek_returns_focus_to_originating_agent_row`
- `needs_input_row_opens_exact_question_or_approval`
- `approval_names_source_thread_before_decision`
- `outcome_unknown_never_renders_as_failed_or_complete`

### 10.2 Plan, tools, and activity

- `plan_projection_has_at_most_one_in_progress_item`
- `compact_plan_keeps_pending_items_muted_but_inspectable`
- `task_list_and_background_process_list_are_distinct`
- `tool_group_default_is_verb_target_and_one_line_outcome`
- `expanded_tool_group_replays_exact_ordered_events`
- `tool_group_never_hides_failure_approval_or_effect_boundary`
- `current_activity_emphasis_follows_durable_cursor`
- `completed_activity_animation_stops_immediately`

### 10.3 Composer and auxiliary conversations

- `composer_remains_available_during_background_work`
- `steer_queue_side_question_and_new_task_are_distinct_commands`
- `queued_prompt_can_be_edited_reordered_or_removed_without_touching_active_run`
- `prompt_suggestion_accept_inserts_but_never_auto_sends`
- `prompt_suggestion_is_not_confused_with_user_authored_text`
- `prompt_suggestion_generation_respects_disable_and_value_policy`
- `side_question_has_no_tools_or_memory_writes_by_default`
- `side_question_does_not_enter_main_history_by_default`
- `side_question_finalize_places_result_in_composer_without_send`
- `side_question_promotion_creates_explicit_branch_provenance`

### 10.4 Accessibility and responsive behavior

- `agent_sections_use_named_list_or_tree_semantics`
- `agent_state_change_announcements_are_bounded_and_actionable`
- `keyboard_can_select_peek_open_and_return_without_pointer`
- `role_icon_is_decorative_when_row_text_already_names_role`
- `status_icon_has_text_equivalent`
- `background_strip_does_not_trap_focus`
- `modal_approval_traps_and_restores_focus`
- `agent_list_reflows_without_horizontal_document_scroll_at_800x600`
- `agent_list_supports_200_percent_text_scaling`
- `forced_colors_preserves_selection_focus_and_state`
- `reduced_motion_disables_state_flash_and_nonessential_animation`

### 10.5 Visual regression matrix

At minimum:

```text
Surfaces:
  chat with compact background strip
  expanded background strip
  Agents activity
  agent peek
  full agent inspector
  plan projection
  tool group collapsed and expanded
  approval sourced from inactive agent
  prompt suggestion
  side-question overlay

States:
  empty
  working
  needs input
  ready for review
  completed
  failed
  stopped
  outcome unknown
  stale summary
  offline/recovering

Appearance:
  light / dark
  compact / comfortable / touch
  800x600 / 1024x720 / 1440x900 / 1920x1080
  100% / 200% text scale
  reduced motion
  forced colors
  Vietnamese long labels
```

## 11. Dependency-ordered implementation slices

### UI-R0 — Contracts and truthful unavailable states

- define agent, task, process, plan, event, and summary view contracts;
- define canonical state vocabulary;
- define role-icon vocabulary and safe extension rules;
- add deterministic fixtures without enabling runtime controls.

Exit gate: no planned surface fabricates agent, plan, process, approval, or
journal state.

### UI-R1 — Durable run activity

- wait for native run journal v7 and exact provider mutation binding;
- project tool, reasoning, usage, and terminal facts into grouped activity;
- make renderer notification best effort;
- implement fixed-cursor inspector replay.

Exit gate: restart/reconnect renders byte-equivalent visible activity without
duplicating text or provider attempts.

### UI-R2 — Agent DAG and attention surfaces

- implement durable agent/thread/task identities and parent-child edges;
- add compact background strip;
- add Agents activity with attention grouping;
- add peek, full thread, approval provenance, steer, and stop controls;
- add role icons and state badges.

Exit gate: multiple agents can run, request input, finish, fail, and recover
without identity confusion or context pollution.

### UI-R3 — Prompt workshop and side questions

- implement prompt suggestions with explicit insertion;
- implement tool-free side questions;
- implement multi-turn prompt workshop;
- implement explicit promotion/fork provenance;
- keep action suggestions typed and policy-gated.

Exit gate: auxiliary flows never mutate the main run, use tools, write memory,
or auto-send without the contract allowing it.

### UI-R4 — Visual and accessibility certification

- extend the deterministic visual fixture surface;
- add Playwright screenshot and accessibility lanes;
- run Windows packaged Tauri smoke tests;
- validate role icons at 16/20/24 px;
- validate light/dark/density/scaling/forced-colors/reduced-motion matrices.

Exit gate: current-source screenshots and accessibility evidence exist for
every state in Section 10.5.

## 12. Public source map

### OpenAI

- Codex repository at refreshed HEAD:
  <https://github.com/openai/codex/tree/a7b8c074b577f897111c14de3a5e127b91e2a479>
- Official Codex CLI splash:
  <https://github.com/openai/codex/blob/a7b8c074b577f897111c14de3a5e127b91e2a479/.github/codex-cli-splash.png>
- Official Codex documentation: <https://developers.openai.com/codex>
- Codex manual: <https://developers.openai.com/codex/codex-manual.md>

### Anthropic

- Claude Code repository:
  <https://github.com/anthropics/claude-code/tree/be90077c6a353f292fa612d97173865a9ab21b83>
- Official demo animation:
  <https://github.com/anthropics/claude-code/blob/be90077c6a353f292fa612d97173865a9ab21b83/demo.gif>
- Agent View documentation and official screenshots:
  <https://code.claude.com/docs/en/agent-view>
- Interactive mode, prompt suggestions, side questions, and task list:
  <https://code.claude.com/docs/en/interactive-mode>
- Subagents: <https://code.claude.com/docs/en/sub-agents>
- Sessions: <https://code.claude.com/docs/en/sessions>

### Excluded record

- Excluded user-provided snapshot:
  <https://github.com/tanbiralam/claude-code/tree/6f6f12b37f529488b10e53928dd5508bb93535c7>

## 13. Conclusion

The strongest official UI lesson is not a color palette or icon pack. It is a
discipline of information hierarchy:

- identity and effective execution context remain visible;
- one current operation receives emphasis;
- plans, tasks, agents, and processes stay distinct;
- tool events compress into outcome-oriented rows;
- background work is grouped by attention state;
- the composer remains available;
- detail is one deliberate action away;
- state is expressed by shape, text, and color;
- every friendly summary remains traceable to durable facts.

Omnia should preserve that discipline while using its own aperture mark,
Windows-native shell, semantic entity icons, neutral surfaces, richer
inspectors, durable kernel, and explicit security provenance. That produces a
premium multi-agent workbench without cloning either vendor and without
letting visual polish outrun implementation truth.
