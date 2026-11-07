# Claude Code harness refresh (2026-10-01)

Status: research-only; clean-room design input for Omnia. This note does not
claim that any native Claude Code capability is shipped by Omnia.

## Provenance

- Source: official public repository `anthropics/claude-code`
- Repository: `https://github.com/anthropics/claude-code`
- Reviewed revision: `525d3b35312636cf8c001ecb3df2be0324a48b43`
- Reviewed branch: `main`
- Commit time: `2026-09-30T12:36:31-07:00`
- Retrieval date: `2026-10-01`
- The npm package page checked on `2026-10-01` reports published version
  `2.1.286`; GitHub's static Releases page was stale during this review, so
  the package page and repository `main` commit/changelog are separate
  package-versus-source evidence.
- Local checkout: `research/upstreams/anthropic-claude-code`
- License boundary: the repository carries Anthropic commercial/all-rights-
  reserved terms. Omnia may use behavior classes and public documentation as
  clean-room research, but must not copy source, prompts, assets, wording,
  geometry, or implementation structure.

The repository is primarily a release, plugin, mod, example, and workflow
surface. Its core agent engine is not exposed as a permissively licensed base.
Claims below are therefore classified as observed repository behavior or
documented product behavior, not as an implementation recipe copied into
Omnia.

## Observed architecture patterns

### Typed hook/mod contracts

`mods/README.md` documents a mod as a plugin with one `register(on, options)`
entry. Mods subscribe to typed engine events and add a named engine noun only
through an explicit contract in `types/index.d.ts`. Tests use a mocked engine,
clock, store, and event bus, so lifecycle behavior can be checked without a
live provider.

Omnia mapping:

- keep event names and payloads versioned, not terminal-text scraped;
- define each cross-cutting noun (telemetry, policy, cache, mailbox, lease) in
  one contract and make consumers import that contract;
- provide deterministic renderer/native adapters for the same event stream;
- test hooks against a fake clock and fake side effects before native wiring.

### Extension packaging

`plugins/README.md` and `.claude-plugin/marketplace.json` show a composable
extension shape: commands, agents, skills, hooks, MCP configuration, metadata,
versioning, and documentation are separate optional surfaces. The current
official tree includes feature development, code review, commit workflows,
plugin development, security guidance, learning/explanatory styles, frontend
design, and iterative-loop plugins.

Omnia mapping:

- make every extension declarative with id/version/digest, schemas, data
  classes, side effects, permissions, network destinations, limits, health,
  tests, and uninstall/migration metadata;
- distinguish discovery, install, trust, enablement, and capability grant;
- keep plugin/MCP results untrusted and route side effects through the native
  capability broker.

### Structured multi-phase workflows

`plugins/feature-dev/commands/feature-dev.md` uses a seven-phase flow:
discovery, codebase exploration, clarification, architecture, implementation,
quality review, and summary. It calls for several specialist agents with
different scopes and an explicit user approval before mutation-heavy work.
`plugins/code-review/commands/code-review.md` adds parallel reviewers,
high-signal filtering, issue validation agents, and a no-comment mode.

Omnia mapping:

- support `Discuss`, `Btw`, and normal chat as distinct execution primitives;
- let the main agent split work into planner/researcher/architect/implementer/
  reviewer/evidence roles dynamically, while recording a context-transfer
  manifest and parent capability ceilings;
- return structured findings and evidence IDs, not raw child transcripts in the
  main context;
- require deterministic gates or user approval before promoting advisory review
  output into a mutation or release claim.

### Iteration and stop interception

The `ralph-wiggum` plugin models iterative work as a bounded loop with a stop
hook and explicit cancel command. This is useful as a workflow primitive, but
its loop must not become an unbounded autonomous permission grant.

Omnia mapping:

- represent each iteration as a durable run/iteration event;
- cap iterations by time, cost, token, repeated-diff signature, and no-progress
  detection;
- expose pause/stop/cancel and the current completion-gate reason;
- keep policy/approval outside the model loop.

### Security and policy separation

`CLAUDE.md`, `examples/settings/settings-strict.json`, and the
`security-guidance` plugin show layered controls: managed policies, permission
rules, sandbox controls, network allow lists, hook restrictions, secret
redaction, and warnings for dangerous code patterns. The latest guidance also
keeps permission mode separate from the OS sandbox and uses explicit provider
allowlists.

Omnia mapping:

- never interpret a permissive model setting as widened filesystem/network
  authority;
- evaluate deny/ask/allow in the native broker and keep approvals exact to
  operation, cwd, environment, grant, binary identity, and data scope;
- redact credentials and raw provider payloads before telemetry/export;
- expose unavailable/unknown states instead of treating missing policy evidence
  as allow.

## Current official documentation cross-check

The official subagent documentation was retrieved on `2026-10-01` from
`https://code.claude.com/docs/en/sub-agents`. It documents automatic
delegation from the user's natural-language request, current context, and
each agent's short description. Subagent model resolution is explicit: a
model named for the invocation, the definition's model (where `inherit` uses
the lead model), `CLAUDE_CODE_SUBAGENT_MODEL` when set, and finally the parent
model; `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1` is a distinct global override.
Subagents have independent context, system prompt, tools, permissions, skills,
optional memory, effort, turn limit, and worktree isolation. Focused
subagents return a summary to the caller; background agents and cross-session
teams are separate execution surfaces. The docs also warn that long agent
descriptions consume startup context.

The official agent-team documentation was retrieved on `2026-10-01` from
`https://code.claude.com/docs/en/agent-teams`. Teams differ from subagents by
sharing a task list and supporting direct teammate communication; each
teammate has an independent context and therefore higher token cost. The
feature is experimental, one team per session, and does not support nested
teams. These are useful Omnia signals: a team must be a distinct primitive
from a low-cost subagent, and concurrency must be budgeted rather than
unlimited.

The official settings documentation was retrieved on `2026-10-01` from
`https://code.claude.com/docs/en/settings`. It makes scope and precedence
visible across managed, command-line, project-local, shared-project, and user
settings. Permission rules merge with exceptions rather than behaving as a
flat last-write-wins object. Omnia should expose the resolution path and
effective value, preserve security-deny precedence, and avoid silently
overwriting a narrower user/project scope.

Anthropic's prompt-caching documentation was retrieved on `2026-10-01` from
`https://platform.claude.com/docs/en/build-with-claude/prompt-caching`. It
documents automatic cache placement or explicit per-block breakpoints, exact
prefix identity, five-minute and optional one-hour TTLs, and
provider-reported cache-read/cache-write usage. Changes to prefix material
such as timestamps, tool schemas, or effort configuration can prevent a hit.
Omnia's local user cache is a separate layer: only the Messages adapter and
provider evidence can establish a provider cache event or billed cache token
count.

## Latest 2.1.286 release signals relevant to Omnia

The latest changelog section records the following production edge cases and
therefore suggests concrete Omnia contracts:

| Upstream signal | Omnia design implication |
| --- | --- |
| Stacked permission prompts show `2 of 5` and remain navigable | Add a durable permission queue with ordinal/total, target operation, focus restoration, and approval receipt. |
| Resume/continue can follow parallel-tool crashes without losing turns | Replay from journal cursor and checkpoint; do not reconstruct from renderer state. |
| Tool/hook outputs may be object/number/boolean | Normalize hook/tool result carriers at the boundary and preserve typed error context. |
| Refused/unavailable model retries once on the previous same-tier model | Record a new attempt and fallback lineage; never mutate the original frozen model choice. |
| Fallback retries use standard speed and announce the change | Surface effective model/effort and fallback reason in the run inspector. |
| MCP auth/discovery caches can become stale after handshake changes | Version discovery cache by server/protocol revision and invalidate on auth or handshake change. |
| Running subagent messages were duplicated or returned with raw IDs | Stable agent identity, deduplication keys, sender display name, and parent/child route are required. |
| Foreground subagents can miss task-management tools | Resolve child tool catalog from the parent capability snapshot, with explicit omission evidence. |
| Worktree-isolated agents could reload project instructions twice | Carry an instruction/context manifest and suppress duplicate source roots. |
| Workflow subagents could restart from their original prompt after a stall | Persist mid-response checkpoint and resume cursor, not only the spawn prompt. |
| `/compact`, `/clear`, `/rewind` could target the wrong transcript | Target-aware commands require selected agent/run identity and confirmation. |
| Background jobs could show done while waiting for approval | Separate scheduler state from terminal outcome; use `waiting-approval` as a first-class state. |
| Slash suggestions need word-prefix matching with many skills | Build a bounded command index with prefix/fuzzy ranking and visible source labels. |
| `--bare` only connects named MCP servers and starts no reminders/background work | Make minimal/headless mode an explicit context and capability profile, not an accidental omission. |
| Plugin installs reject git/folder npm sources and unmanaged dependencies | Validate extension source, digest, dependency provenance, and install scope before enablement. |
| VS Code gained bookmarks, question cards, option previews, and linked output rows | IDE surface should expose durable bookmarks/questions/attachments as linked items, not transcript-only decorations. |

Recent 2.1.285/2.1.284 entries add further implications: managed
`allowedProviders`, fork inheritance of permission/plan mode, dynamic model
changes, typed plugin option forms, repeated compaction on overflow, automatic
mode defaults, separate Ultracode/effort state, and explicit 1M-context/cache
cost behavior. These map to Omnia's provider policy, model-route revision,
context checkpoint, and pricing/usage lineage contracts.

## Provider and endpoint boundary

Omnia must preserve the provider distinction requested by the product spec:

- OpenAI-family models use the Responses adapter when the selected endpoint
  supports it;
- Anthropic Claude and other Messages-shaped providers use the Messages
  adapter;
- adapter translation is frozen per provider attempt with endpoint/profile,
  model, requested/effective effort, cache plan, context manifest, and policy
  revision;
- a local cache hit, a context-compilation reuse, and a provider-reported cache
  read/write are separate observations. The client cannot manufacture a
  provider-billed cache hit.

## Immediate Omnia slices suggested by this refresh

1. Add `waiting-approval`, `queued`, `running`, `background`, `paused`,
   `retrying`, `complete`, `failed`, and `outcome-unknown` to the agent/run
   attention projection, with target-aware controls.
2. Add a dynamic role-to-model resolver receipt (`explicit -> task/workspace ->
   global -> parent`) with parent ceilings and a visible effective route.
3. Add `Discuss`/`Btw` side-question contracts with separate usage/cost trace,
   read-only context manifest, and explicit promotion into the main run.
4. Add permission queue projection with ordinal/total and exact operation
   identity; keep renderer controls wired to preview state until native broker
   exists.
5. Add provider fallback and model-unavailable attempt lineage plus stale MCP
   discovery-cache invalidation reasons.
6. Add extension manifest validation and a clean-room Omnia plugin catalog
   projection; do not copy upstream plugin files.
7. Add IDE-linked bookmarks/question/output rows to the Project/Chat surfaces.

## Source locators checked

- Official repository `CHANGELOG.md`, sections `2.1.286`, `2.1.285`, and
  `2.1.284` at the pinned revision above.
- Official repository `README.md`, `CLAUDE.md`, `plugins/README.md`,
  `.claude-plugin/marketplace.json`, `mods/README.md`,
  `plugins/feature-dev/commands/feature-dev.md`,
  `plugins/code-review/commands/code-review.md`,
  `plugins/ralph-wiggum/commands/ralph-loop.md`,
  `examples/settings/settings-strict.json`, and `examples/settings/README.md`.
- Official live docs: subagents, agent teams, settings, and prompt caching at
  the URLs above, retrieved on `2026-10-01`; these are current docs but not
  commit-pinned and may drift.
- npm registry metadata from `npm view @anthropic-ai/claude-code version
  time --json`, showing package version `2.1.286` published at
  `2026-09-30T17:14:38.859Z`.

## Evidence boundary

This refresh proves only that the official repository at the pinned revision
contains the public files and changelog entries named above. It does not prove
that Omnia currently has a native supervisor, provider dispatch, durable cache,
real permissions, IDE integration, or agent execution. Those remain separate
implementation and evidence gates in `docs/omnia-ultra`.
