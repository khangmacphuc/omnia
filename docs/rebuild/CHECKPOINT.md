# Omnia rebuild checkpoint

Updated: 2026-11-08. Cycle: **rebuild-0005**. Stage: **document**. Status:
**active**; the product goal is not complete.

## Current truth

- Branch `codex/omnia-original-rebuild`, base `ca8dfa32`.
- Clean-room renderer entry graph is active from `src/main.tsx`; the architecture
  guard passes with no legacy UI imports, copied renderer components or live
  external editor/application embeds.
- The shell has exactly three top-level surfaces: Chat, Browser and IDE. Chat is
  the default non-project session and the shared session sidebar remains visible
  beside Browser and IDE.
- Preview QA captured Chat, Browser, IDE and Settings at 800×600 and 1440×900 in
  dark/light scope. These are browser-preview receipts, not packaged/native proof.
- Renderer verification: **12 files / 55 tests passed**, app typecheck passed,
  renderer build passed, architecture guard passed, and workflow gates passed
  **32/32**.
- Native ask-user verification: `cargo test --manifest-path src-tauri/Cargo.toml
  -p omnia-harness user_input -- --nocapture` passed **10/10** broker/tool tests.
  This is provider-neutral native crate evidence; packaged Tauri command delivery,
  live provider execution and OS permission evidence remain open.
- Independent cycle-5 review is bound to current source and receipts and passed
  evidence-integrity review. It does not promote incomplete DoD criteria to Done.
- Current DoD counts are **0 Done / 23 Partial / 8 Blocked / 209 Planned
  (240 total; 0/240 mandatory Done)**.
- Historical and dirty checkouts remain preserved. No credentials, cookies,
  browser profiles or private chat history are publishable evidence.

## Current receipts

| Artifact | Result | Boundary |
| --- | --- | --- |
| `docs/rebuild/receipts/cycle5-renderer-tests.json` | 55 tests pass | renderer behavior only |
| `docs/rebuild/receipts/cycle5-typecheck.json` | pass | TypeScript renderer typecheck |
| `docs/rebuild/receipts/cycle5-renderer-build.json` | pass | production renderer bundle |
| `docs/rebuild/receipts/cycle5-workflow-gates.json` | 32 tests pass | workflow/schema behavior |
| `docs/rebuild/receipts/cycle5-architecture.json` | pass | import/copy/embed guard |
| `docs/rebuild/receipts/ui-qa-cycle5-20261108.json` | 12 captures, axe 0 | browser preview only |
| `docs/rebuild/receipts/ask-user-native-cycle5.json` | 10 Rust tests pass | native broker/tool unit behavior |
| `docs/rebuild/audit/REVIEW_CYCLE5_20261108.json` | independent pass | evidence review, not completion |

## Open findings carried forward

- UI QA still records a first reduced-motion Chat context with an 8px body
  margin/overflow race and light-theme Browser/IDE primary-action contrast of
  3.81:1 versus the 4.5:1 WCAG AA target.
- Native project/file pointer persistence, RAG runtime admission/retrieval,
  provider execution, model discovery against live providers, packaged WebView2,
  computer automation, durable compare fan-out and OS permission flows remain
  incomplete or unverified.
- The clean-room IDE and Browser surfaces expose explicit unavailable states when
  native capabilities are absent; preview controls must not be read as live
  WebView2 or editor proof.

## Durable loop resume

On the next cycle, reread `AGENTS.md`, the evidence-loop skill, `GOAL.md`,
`WORKFLOW.md`, `SPEC.md`, `DOD.json`, `SOURCE_REGISTER.json`, this checkpoint and
`ASSIGNMENTS.md`. Start with a new audit and genuinely new OSS research. Keep the
reviewer distinct from the implementer, refresh hashes after every source freeze,
and report done/partial/blocked/planned counts with direct receipts.

The goal remains active until every mandatory DoD criterion is Done with current
source, behavior and native/runtime evidence, followed by a reviewed commit,
version tag, push verification and a final canonical-document reread.
