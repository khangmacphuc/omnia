# New IDE, editor, and agent-workspace research — cycle 9

**Cycle:** `rebuild-0009`  
**Retrieved:** 2026-11-08 09:51 UTC (2026-11-08, Asia/Bangkok)  
**Researcher:** `/root/cycle9_research_ide`  
**Scope:** open-source IDE/editor/agent workspace architecture, session ownership,
context budgets, approvals, project/file navigation, and workspace chrome.  
**Corpus exclusion:** Zalo.  
**Clean-room rule:** no source, CSS, tokens, layout, fixture, or live editor was
copied or embedded into Omnia. The observations below are design evidence only.

## Search and novelty ledger

The following searches were run against GitHub's public repository search API and
then followed to pinned source revisions. A repository/revision/path tuple was
counted only after checking `docs/rebuild/SOURCE_REGISTER.json`; none of the
three repositories below was present in the cycle-8 registry. Stars were used
only to discover candidates and were not treated as quality evidence.

| Query | Candidate | Novelty decision |
| --- | --- | --- |
| `AI IDE open source stars:>1000` | `onlook-dev/onlook` | **new** repository/revision/path tuples; Apache-2.0 source inspected |
| `AI IDE open source stars:>1000` | `PawanOsman/OpenCursor` | **new** repository/revision/path tuples; MIT source inspected |
| `AI IDE open source stars:>1000` | `codestoryai/aide` | **new** repository/revision/path tuples; AGPL source inspected; archived project is a limitation |
| `everything agent IDE`, `super power coding agent IDE` | several small forks and wrappers | discovery only; rejected as non-novel or README-only until a pinned source path could be inspected |
| `open source developer workspace editor agent` | `silo-code/silo` | deferred; repository was discoverable but no source path was read in this slice, so it is not counted as evidence |

The special `everything/super/power/pro/max` terms were deliberately included in
the query rotation. A name or star count does not establish an Omnia contract.

## Source records

### Onlook — project editor with canvas, file tree, terminal, and chat state

- **Canonical repository:** <https://github.com/onlook-dev/onlook>
- **Pinned revision:** `423e2e924366419e418ee049093872d535eea41a`
- **License:** Apache-2.0, `LICENSE.md`, SHA-256
  `ebac09c6f0854bc48cb843bcab00d57310028defb124e9bc7f2f39203b705ea8`.
- **Reviewed source paths and SHA-256:**
  - `AGENTS.md` — `acaeb4d88d193c805120875017895ec40be33635b4832a7e352d33598148f2f5`
  - `apps/web/client/src/app/project/[id]/page.tsx` — `d416b3355156241f7584a26addef4099e91431623350241726d5aa8c93dc9160`
  - `apps/web/client/src/app/project/[id]/_components/canvas/index.tsx` — `3d38400172586fa0504c4fe3d468f67ea844961a01ca4e1c63847d39e27432a9`
  - `apps/web/client/src/app/project/[id]/_components/left-panel/code-panel/code-tab/sidebar/file-tree.tsx` — `3e31ccf88aa832bdada47892d8bf47221a87c5c9fd3db7124c9a3c241dfd2e65`
  - `apps/web/client/src/components/store/editor/chat/conversation.ts` — `95e53f08706ee23bc4e2053fc223f4258cff756895dd94100716ac42d9d939e7`
  - `apps/web/client/src/app/project/[id]/_components/bottom-bar/terminal-area.tsx` — `63a8667a6f682485a07d0669d0085b9b7e36237ab2bbafda7bdf3f6799fe606e`
- **Exact source URLs:** each path was read from
  `https://raw.githubusercontent.com/onlook-dev/onlook/423e2e924366419e418ee049093872d535eea41a/<path>`.

**Observed strengths.** The project route fetches project and branch data before
constructing providers, making a failed or missing project explicit. The
conversation manager treats conversation identity as durable state, sorts by
update time, starts an empty conversation only when needed, and keeps deletion
and selection transitions together. The canvas has bounded pan/zoom constants,
drag-selection state, and keyboard/mouse mode transitions. The file tree keeps
a flat path index while rendering a hierarchical tree, which makes lookup and
rename operations independent of visible depth. Terminal sessions are collected
across branches and retain branch/session identity while the panel is toggled.

**Weaknesses and limits.** These files do not prove Windows-native permissions,
durable pointer storage after an external rename/delete, packaged IPC, provider
execution, or crash recovery. The source is a web editor architecture rather
than evidence that Omnia can embed or reuse its UI.

**Distinct Omnia decision — apply as contract, not implementation.** Keep one
stable session identity across Chat, Browser, and IDE, with project and branch
metadata attached to the session. Add a path-indexed IDE model for O(1) lookup
while preserving a tree projection. Persist workspace panel intent separately
from native availability, and expose `workspaceMissing` / `permissionDenied`
states rather than selecting a different root silently. Bound pan/zoom and
terminal/session counts in the renderer, but enforce limits again in native
commands. Verify with rename, deletion, reload, stale-root, and permission
negative cases.

### OpenCursor — context economy, approval policy, background work, and collaboration

- **Canonical repository:** <https://github.com/PawanOsman/OpenCursor>
- **Pinned revision:** `33c7058620bd775817c386cfdd5776f33ad41526`
- **License:** MIT, `LICENSE`, SHA-256
  `930c1f7ff5f76907c2ac91729105208f1ff635357fce626553928d4af610d9bb`.
- **Reviewed source paths and SHA-256:**
  - `README.md` — `10146e1a708d4b4b4472517de2434eed181b14c975a9eb290a41c3d058ecea92`
  - `src/agent/contextBudget.test.ts` — `48a088f4a13398c5d3c216b3b668399dced9049e0d59c23468d8154d370940cf`
  - `src/agent/contextEconomy.ts` — `8819ced72149d8fdc64cc6a687184119112cfe5e5e8d70e189812003cdb82c9b`
  - `src/agent/contextState.ts` — `01b2cc8413d3f29a7196b5658412c3baf8d98b14de8e20d497aeb212d3c82dc0`
  - `src/agent/approvalPolicy.ts` — `1fd59f968093126f639399490b26616ad01aee9f7c21d9fdab26a5d92c8dd393`
  - `src/agent/backgroundTasks.ts` — `ada03cc19beb7b9b5778e6a9367bd14b21fbfa4961f9ac7029385c9d2db0e619`
  - `src/agent/collaborationState.ts` — `346292a597bdf6e4fcb3c334fd59f8f7797f955af6807a35a794d00a5e6d7ffa`
- **Exact source URLs:** each path was read from
  `https://raw.githubusercontent.com/PawanOsman/OpenCursor/33c7058620bd775817c386cfdd5776f33ad41526/<path>`.

**Observed strengths.** Context budgeting counts tool calls and provider replay
content once, prices images explicitly, and separates the lossless transcript
from fitted model context. The context checkpoint stores a prefix digest and
uses an incremental hash so every-step persistence does not reserialize the
entire transcript. Approval policy is typed by action (`shell`, `edits`,
`delete`, `mcp`, `web`, `outside`) with deny/allow precedence over modes. The
background task registry has bounded concurrency, run-owned cancellation and
completion draining. Collaborator records carry model, status, mailbox and
history instead of reducing subagents to display-only names.

**Weaknesses and limits.** Token estimates are heuristics and do not prove
provider tokenization, cost, or native persistence. The reviewed code does not
prove Windows ACLs, packaged Tauri delivery, or cross-session conflict recovery.
Approval semantics still require a native permission boundary and an explicit
outcome-unknown state in Omnia.

**Distinct Omnia decision — apply.** Make context compaction an auditable
operation: retain a lossless transcript, store a bounded model view, and attach
`prefixDigest`, truncation reason, tool-output budget, and model/effort identity
to every retrieval/compaction receipt. Use a typed approval policy for every
privileged action and fail closed on permission denial or unknown acceptance.
Represent subagents as run-owned records with cancellation, mailbox, status,
model, role, and lineage. Add deterministic tests for duplicate tool events,
image cost, compaction digest mismatch, denial, cancel, and concurrent session
isolation.

### Aide — combined chat/edit flow and workspace-derived context (archived)

- **Canonical repository:** <https://github.com/codestoryai/aide>
- **Pinned revision:** `93c820fbc9d14b42047b658518677df66f1ef644`
- **License:** AGPL-3.0, `LICENSE.md`, SHA-256
  `8486a10c4393cee1c25392769ddd3b2d6c242d6ec7928e1414efff7dfb2f07ef`.
- **Reviewed source paths and SHA-256:**
  - `README.md` — `a5f4a56f1055e56425b8fab8871c6e3717cf737b03455fd45cf3961eb4f4c1d5`
  - `extensions/codestory/src/chatState/state.ts` — `44216d7cbf3e84b7f3e64a8840082c278c5c56fd0e10b279bd0fa1bd81e08337`
  - `extensions/codestory/src/chatState/convertStreamToMessage.ts` — `0084d51215aa43e64d7e41134307d902adfb5559ad580fd767a74dd3fe2c5482`
  - `extensions/codestory/src/utilities/workspaceContext.ts` — `581109293086f551a4929062128a14804dbde38e0c939d603dfa68bb61f42577`
  - `extensions/codestory/src/utilities/agentConfiguration.ts` — `c38fe542ab64dc1eecce1a865a8fe16b2a5a3d41204c89db5faadffb912614c2`
- **Exact source URLs:** each path was read from
  `https://raw.githubusercontent.com/codestoryai/aide/93c820fbc9d14b42047b658518677df66f1ef644/<path>`.

**Observed strengths.** Aide's README describes a combined chat/edit workflow,
proactive context gathering from language-server navigation, inline prompting,
and AST-oriented navigation. The workspace context helper derives project
labels from marker files and content. Stream formatting turns valid repository
paths into useful links only after checking that the path exists. Agent
configuration keeps reasoning as a workspace setting rather than hard-coding it
into every prompt.

**Weaknesses and limits.** The repository README says the project is no longer
maintained and the pinned source is a VS Code fork. The large stream adapter is
coupled to VS Code APIs; the reviewed files provide no current runtime, Windows
permission, packaged/live provider, or recovery evidence. AGPL-3.0 is a license
boundary that prevents treating the implementation as a drop-in Omnia module.

**Decision — defer implementation, retain contract lessons.** Use only the
general ideas of combining chat with precise file references, deriving context
from the actual workspace, and making reasoning a visible setting. Reimplement
these contracts independently under Omnia's own renderer/native boundaries;
do not copy Aide source, VS Code UI, or its license-bearing code. A future
source cycle may revisit Aide only if a maintained revision and a concrete
native contract are found.

## Cross-source synthesis and acceptance impact

| Omnia gap | Synthesized decision | Evidence required before Done |
| --- | --- | --- |
| Project/session identity is easy to confuse | Project, session execution, branch/pointer metadata, and visible surface state are separate records | Reload two sessions, rename/delete a root, and prove stable IDs plus explicit missing/permission states |
| Context compaction can hide provenance | Lossless transcript plus bounded model view with digest, budget, and truncation receipts | Positive, overflow, digest mismatch, replay, and reload tests with native receipt hashes |
| Privileged actions are ambiguous | Typed approval policy with action scope, deny precedence, native ACL, cancel and outcome-unknown states | Packaged Windows approval/denial/cancel capture for shell, file, MCP, web, and computer actions |
| Subagents become cosmetic UI rows | Run-owned subagent records with model/role/skills/tools, mailbox, cancellation, and lineage | Parallel session and subagent tests; durable persistence; independent reviewer receipt |
| IDE file navigation becomes stale | Path index plus tree projection, pointer identity and snapshot fallback | Native rename/update/delete/reload race tests and actual packaged IDE capture |
| Combined chat/edit flow can overreach permissions | Chat can propose an edit and open a file, but apply/save remains explicit and reviewable | UI + native source/save conflict tests; no external editor iframe; exact diff receipt |

## Explicit non-claims

This note is research evidence only. It does **not** prove that Omnia has a
packaged IDE, WebView2, live provider, native Windows ACL, RAG/pointer runtime,
or complete compare/subagent workflow. It does not add a DoD `Done` status.
