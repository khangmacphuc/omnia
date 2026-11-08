# New OSS research receipt — rebuild cycle 0003

**Retrieved:** 2026-11-08 11:00–11:20 Asia/Bangkok (2026-11-08 04:00–04:20 UTC)  
**Researcher:** `/root/new_research_cycle3`  
**Scope:** fresh agent/browser/computer harness and evidence-gated local workspace sources.  
**Boundary:** read-only source inspection; no upstream installer, build, postinstall hook, account, credential, browser profile, or downloaded program was executed.

## Search ledger and novelty

Fresh web queries used the required rotating terms:

- `site:github.com open source agent workspace MCP permission architecture 2026 super power max`
- `site:github.com open source browser computer harness Rust Tauri agent 2025`
- `site:github.com open source AI IDE agent workspace accessibility React 2026`

Known baseline repositories in `ASSIGNMENTS.md` (obra/superpowers,
browser-use/browser-harness, browser-use/desktop and badlogic/pi-mono) were not
counted again. Every source below is a new canonical repository + pinned
revision + exact path tuple absent from the current `SOURCE_REGISTER.json`.
Revisions came from `git ls-remote <repo> HEAD`; source blobs were read from a
shallow blobless checkout and hashed with SHA-256.

## Reviewed source matrix

### Browser Use Terminal — browser-use/terminal

- Canonical URL: <https://github.com/browser-use/terminal>
- Revision: `16cdd3ac47261292d88f410abb1f0234577850ce` (`HEAD`)
- License evidence: `LICENSE`, MIT, SHA-256
  `F77BF226B54339F5A8891F9EDCFADF231C9CD9017A9AA3D9F566D4D6264B541D`.
- Exact source read and hashes:
  - `README.md` — `51B335DF27E00813D45B3898424ADFFD8EDF0843EACCF46A7072CB9DC8D77690`
  - `crates/browser-use-agent/src/execpolicy/policy.rs` —
    `D0A6BC393553872FF3687752A89DBEEC551F1F2B5083E8F2AFA62A3083484310`
  - `crates/browser-use-agent/src/goals/steering.rs` —
    `A4D0BBAD6767203E9F52FF9DCDF8D5F04C50EAC5832DE8BC41B0AA096520383B`
  - `crates/browser-use-agent/src/infra/persistence.rs` —
    `8707A61472027E67F23338EF93D10805B0F63823FF22738D3C7B54628B499F01`
- Observation: the README describes a Rust-owned agent loop, SQLite event log,
  CDP browser runtime, local history/screenshots/artifacts and watch/steer/stop/
  retry/resume controls. `execpolicy/policy.rs` implements a dependency-light
  `Allow | Prompt | Forbidden` decision and takes the most restrictive matched
  rule. `goals/steering.rs` emits crossing-only goal/budget steering events.
  `persistence.rs` records tool output/image/artifact events and bounds oversized
  output through an artifact spill/truncation path.
- Strength: concrete source for bounded tool output, explicit approval mapping,
  durable event/artifact receipts and exactly-once budget steering.
- Weakness: browser terminal and CDP assumptions are not Windows WebView2 proof;
  the README's cost/speed statements are upstream claims, not Omnia measurements.
- Omnia gap and decision: **apply-as-reference** for restrictive policy ordering,
  crossing-only steering and bounded artifact receipts. Reimplement in Omnia's
  native contract layer; do not copy its TUI, browser lifecycle or UI.

### Taskhomie computer-agent — suitedaces/computer-agent

- Canonical URL: <https://github.com/suitedaces/computer-agent>
- Revision: `92795e717b5bd254d1894d46d180eb29b690525b` (`HEAD`)
- License evidence: `LICENSE`, Apache License 2.0 text with additional derivative
  provisions, SHA-256
  `8144A8674186BC46FB10A4A404F378448F7633BDF6626C372F12E5B4C0867DAA`.
  The added provisions require legal review; this is not treated as a plain
  vendorable Apache dependency.
- Exact source read and hashes:
  - `README.md` — `E6F3C696E6735C7C2F2BFFA745AA901073EFE9CB54C31C7DCB835DDE740DF266`
  - `src-tauri/src/permissions.rs` —
    `DEAA3232828485AB5F523C072FF1E4CB398A589CE19C1BF97392EFC96A736EC`
  - `src-tauri/src/storage.rs` —
    `C02EDADFB1AE72037D3569BE37742C04E67AE07A7C2DBD689B12F32FF042DC29`
- Observation: the README distinguishes foreground computer-use mode from a
  background CDP/terminal mode and lists explicit stop/help shortcuts. The Rust
  permission contract models `Granted`, `Denied`, `NotAsked` and `NotNeeded`
  for accessibility, screen recording and microphone. Storage models conversation
  metadata separately from full messages and stores per-turn model/token usage,
  including prompt-cache counts, for replay and accounting.
- Strength: useful explicit unavailable/permission states and durable usage
  metadata shape for a local Tauri app.
- Weakness: the checked permission implementation is primarily macOS-specific;
  README/demo claims do not establish Windows native security or cancellation.
  Custom license terms make source reuse legally nontrivial.
- Omnia gap and decision: **apply conceptually only** for permission status and
  per-turn usage receipts. Keep Omnia's Windows native permission and storage
  implementations independent; do not copy code or UI.

### Atlas — wede-wx/atlas-agent

- Canonical URL: <https://github.com/wede-wx/atlas-agent>
- Revision: `8ccacf2d828bb245c3d687576485dea603d14f64` (`HEAD`)
- License evidence: `LICENSE`, Apache-2.0, SHA-256
  `3BF78F27F29C0D3DA500DA10A8519014E32C1D521F369D3B7E772F99DEC745C`.
- Exact source read and hashes:
  - `README.md` — `D2E053606B0105AB27CE44D47E6A98E7D9BC78F522A24030FCAD5875EF38C94A`
  - `src-tauri/src/agent/atlas_harness/goal_contract.rs` —
    `020DFA05B2EC8FB687F313B6E5E990B454FCC54B87C29C308B4FA4FB8F5FA66C`
  - `src-tauri/src/agent/atlas_harness/completion_gate.rs` —
    `7150ACBD354718E204AE3246E895070530A1054F36D9D97199853783F2ADE5D5`
- Observation: `GoalContract` persists must-do, must-not-do, preserve, scope and
  verification fields, with hard/soft items and source quotes. The completion
  gate blocks hard-contract tasks unless evidence is `verified` and at least one
  real `verification_id` is attached; failed/blocked evidence also blocks done.
  The README explicitly reports that verifier/completion integration and contract
  storage are not fully wired, which is a useful non-claim boundary.
- Strength: a concrete schema for freezing user intent and refusing self-assessed
  completion, with an honest distinction between present code and runtime wiring.
- Weakness: the source is an architecture-focused Tauri prototype; several gates
  are present but not wired, so it is not native/live evidence for Omnia.
- Omnia gap and decision: **apply-as-reference** for contract-backed DoD checks,
  source-quote anchors and evidence IDs. Keep Omnia's own DoD schema, reviewer
  identity and stage gate; require runtime receipts before any Done claim.

## Synthesis and next concrete action

The three sources converge on a useful boundary: policy decisions, goal identity,
and evidence status belong in durable native contracts, while the UI only projects
validated state. Omnia should add a focused acceptance slice for (1) restrictive
permission ordering, (2) exactly-once budget/goal steering, (3) bounded artifact
spill receipts, and (4) completion refusal without a real verification ID. These
are design references only until Omnia native tests and runtime captures exist.

No source here upgrades a native, provider, WebView2, or packaged criterion to
Done. Browser-preview, README, and prototype claims remain labeled as reference
evidence.
