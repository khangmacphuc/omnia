# New OSS research receipt — rebuild cycle 0002

**Retrieved:** 2026-11-08 10:28:01 Asia/Bangkok (2026-11-08 03:28:01 UTC)
**Queries:**

- `site:github.com everything super power pro max agent harness IDE browser open source 2026`
- `site:github.com "everything" "super" agent workflow MCP open source`
- `site:github.com power max AI IDE browser agent open source`

The search was read-only. Repository names and star counts were treated as
discovery signals only. Source observations below were read at a pinned commit;
no downloaded installer or arbitrary repository script was executed.

## `salmandev/everything-gemini`

- Canonical URL: <https://github.com/salmandev/everything-gemini>
- Revision: `903bb8db6f2ee47a1b1a8bb24a48e2961c4cfa4e` (`main`)
- License observed in repository page: Apache-2.0
- Exact source read: `README.md`, SHA-256
  `ebe497d65117b692c89cfbf24f9a2eec7aa000c1f09db5264a95294bffa67d15`.
- Observation: the harness describes progressive disclosure skills, lifecycle
  hooks, hierarchical rules, MCP blueprints, memory bridges and formal
  subagent handoffs. The README also states that installation profiles vary
  coverage and that the project targets Antigravity surfaces.
- Strength: a concrete model for loading metadata first and procedural skill
  bodies only when selected, which aligns with Omnia's 200k context and 10k
  tool-output budgets.
- Weakness: the reviewed evidence is a README contract; it does not prove
  runtime behavior, the current star count is small, and the installer paths
  were not executed.
- Omnia decision: **apply-as-reference** for progressive disclosure metadata,
  hook receipts and profile-scoped capability discovery; do not copy its UI,
  installer or claims of runtime coverage.

## `openbrowse-ai/openbrowse`

- Canonical URL: <https://github.com/openbrowse-ai/openbrowse>
- Revision: `9c1bec9d9278969c1fc15f244711fa7e0a415b7a` (`main`)
- License observed in repository page: MIT
- Exact source read: `README.md`, SHA-256
  `85bc0c607fbb78c2cfc651d09ad8a39cdf6febcb97c5ea4c123efbd01f3017a`, and
  `apps/extension/src/lib/agent/compaction.ts`, SHA-256
  `836371b6ca65c6ee8419a3c620ca5fe4fd1396d6d002fc7a61146fc2529040d2`.
- Observation: the project places an agent transport/tool/memory/compaction
  layer beside a per-conversation virtual file system and connector registry.
  The compaction source is an implementation artifact, so it is stronger than
  a feature list for identifying where long-session policy belongs.
- Strength: explicit separation of compaction, tool transport and per-chat
  workspace state; this supports Omnia's session-scoped context receipts.
- Weakness: a browser extension's OPFS and provider assumptions cannot be
  treated as native Windows persistence evidence; the reviewed source does not
  establish WebView2 lease or permission semantics.
- Omnia decision: **apply-as-reference** for compaction boundaries and
  conversation-local artifact ownership; retain Omnia's native lease, path and
  receipt guards.

## `Backboard-io/Backboard-Desktop`

- Canonical URL: <https://github.com/Backboard-io/Backboard-Desktop>
- Revision: `af5489c6cb81d23ed6675756a9dadbe370434678` (`stable`/`HEAD`)
- License observed in repository page and README: MIT (with Code-OSS notices)
- Exact source read: `README.md`, SHA-256
  `60b276f7bbe0791fe36b9ff4d28655de3f3a3522063c5bc48cbf4782b898b8b0`, and
  `backboard/package.json`, SHA-256
  `035a0c3bc29565804c312491828bab350088fbd7b49e1c4384d00fff2f04901e`.
- Observation: the README groups parallel agents, browser/computer use,
  multimodal generation, skills/MCP/memory and editor workflows in one desktop
  product, while explicitly disclosing provider credentials and upstream
  Code-OSS licensing.
- Strength: useful capability matrix for checking Omnia coverage across agent,
  IDE, browser and multimodal verticals.
- Weakness: it is a Code-OSS/Electron product, so importing its editor or shell
  would violate the clean-room rebuild boundary and would not prove Tauri
  native permissions.
- Omnia decision: **defer/compare** only. Keep the capability checklist and
  license disclosure as research input; implement Omnia-owned editor/browser
  surfaces and native contracts independently.

## Novelty and next action

All three repository+revision+path identities are absent from the prior
`SOURCE_REGISTER.json` entries. The next implementation loop should add a
bounded progressive-disclosure receipt to the reference workbench and audit
compaction against the session-scoped context budget. This research does not
upgrade any native/live criterion to Done by itself.
