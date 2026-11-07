---
id: OMNIA-AUDIT-GOAL-PROMPT-FINAL-REDTEAM-2026-08-14
title: Final red-team receipt for the copy-ready Omnia Ultra goal
status: audit-receipt
version: 1.0.0
last_reviewed: 2026-08-14
supersedes: []
---

# Final copy-ready goal red-team

## Scope and snapshot boundary

This receipt red-teams the portable `/goal` payload in
`../omnia-ultra/goal/00-copy-ready-prompt.md`, its manifest routing, and the
requirement/capability/acceptance traceability needed to make the payload safe
to hand to a fresh worker. It does **not** claim that the planned Omnia Ultra
product capabilities are shipped.

The reviewed pre-merge snapshot is the shared worktree on 2026-08-14 while the
universal provider/local-model and multimodal/persona workstreams are being
integrated. The exact validator result in that snapshot is recorded below so a
later green result is not accidentally attributed to this earlier audit.

## What is already strong

- The payload is delimited by `COPY START` / `COPY END`, begins with `/goal`,
  resolves the repository from `docs/omnia-ultra/manifest.json`, and instructs
  a new worker to read the manifest plus current implementation and evidence
  truth before planning work.
- It explicitly prevents a worker from confusing a target requirement with an
  implementation claim and requires a durable continuation checkpoint when a
  complete product cannot fit into one invocation.
- Its retry language uses the canonical kebab-case state-base IDs:
  `exact-historical`, `current-state`,
  `historical-plus-selected-deltas`, and `fresh-branch`.
- It preserves high-value safety boundaries: no password/cookie/session-vault
  extraction, CAPTCHA/fingerprint bypass, covert system-wide keylogging,
  silent elevation, unauthenticated remote control, or unauthorized watermark
  removal.
- It correctly distinguishes a user-managed cache from provider-native cache
  and requires provider-reported evidence before presenting provider cache or
  billing results as factual.

## Blocking findings before final handoff

### GPF-001 — New goal families are not yet manifest-traceable

At this audit snapshot, the following five files exist but are absent from
`manifest.json` `allFiles`:

```text
architecture/multimodal-capability-bridge.md
goal/21-multimodal-bridge-and-specialist-personas.md
harness/specialist-agent-persona-catalog.md
schemas/agent-role-profile.schema.json
schemas/modality-bridge-plan.schema.json
```

`goal/20-universal-endpoints-and-local-model-catalog.md` and
`goal/21-multimodal-bridge-and-specialist-personas.md` are normative targets
but have no atomic requirement/capability/acceptance mapping. A fresh worker
following only the manifest could therefore omit the central request that a
model missing an input modality must be helped by a visible, provenance-aware
bridge.

**Required remediation.** Register goal 20/21 and their domain contracts and
schemas in the manifest; add four atomic requirement/capability/acceptance
triples; link them from the relevant route-specific reading protocol; and
bump/synchronize the pack, canonical-prompt and registry revisions.

### GPF-002 — Copy-ready summary stops its mandatory matrix range at 18

The payload currently says that atomic goal matrices `08` through `18` are
mandatory when their domain is touched. The product target now has goals 19,
20 and 21. This creates an accidental priority signal: a fresh worker can read
the old range literally and treat generative media, universal endpoint/local
model work, or universal multimodal/persona work as optional.

**Required remediation.** Change the range to `08` through `21`, or replace it
with a stable rule such as “every goal matrix whose domain is touched, including
future numbered matrices.” The latter is safer against the next extension.

### GPF-003 — The payload needs a first-class universal multimodal bridge line

The payload mentions file/media bridges and image/video endpoints, but it does
not yet summarize the core bridge contract: a selected primary model may lack
a given modality while Omnia still needs to process the user artifact through a
policy-controlled capability plan.

**Required remediation.** Add a visible product bullet requiring an
inspectable `auto` planner with `direct-native`, `local-transform`,
`specialist-bridge-model`, `hybrid-ensemble`, `surrogate-to-primary`,
`human-review`, and truthful `unsupported` outcomes. It must require original
and derivative hashes, coordinates/time ranges where relevant, citations,
confidence/fidelity limits, privacy/retention decision, cost/latency, model or
tool revision, and a no-hidden-lossy-transform rule.

### GPF-004 — Revision metadata is temporarily contradictory

At the audit snapshot, `goal/21` declares requirements registry revision
`2026-08-14.6`, goal 20 declares `.5`, the canonical prompt declares `.5`,
and the registry itself still declares `.4`. This is expected during a shared
merge, but it must not survive final handoff because an AI or maintainer cannot
tell which completion set is authoritative.

**Required remediation.** Choose one final registry revision, synchronize every
`goal/*.md` frontmatter value and versioned aliases, then rerun the validator.

## Recheck after the 1.6.0 integration

The first recheck after the 1.6.0 merge confirmed that the original GPF-001 to
GPF-004 integration defects were corrected for the universal provider,
local-model, multimodal bridge and persona workstreams:

- manifest version is `1.6.0` and contains goal 20, goal 21, their contracts
  and all four associated schemas;
- requirements registry revision is `2026-08-14.6` and has one requirement,
  one planned capability and one acceptance ID for each of the four new
  requirement families;
- the portable prompt uses the mandatory range `08` through `21` and contains
  an explicit multimodal fallback/provenance/fidelity bullet;
- its copy delimiter and `/goal` command checks remain one-to-one.

The validator was still intentionally red at this point because two newer
concurrent workstreams had added four more spec files after that merge:

```text
harness/academic-specialist-taxonomy.md
runtimes/local-multimodal-toolchain.md
schemas/academic-specialist-workflow.schema.json
schemas/local-multimodal-transform-receipt.schema.json
```

They need the same manifest/route/registry/acceptance integration before a
final green claim. Do not hide them merely because goals 20 and 21 are now
registered.

One small wording hardening remains advisable in the final payload: call out
the canonical `specialist-bridge-model` mode and the requirement to return a
truthful `unsupported` disposition when no safe quality-sufficient bridge
exists. A prose-only “specialist model” or generic fallback is too easy to
misread as permission to pretend a destination model supports an artifact.

## Required canonical-prompt additions after the integration

The final payload should visibly include all of the following without asking a
fresh worker to infer them from a deep document tree:

1. Universal provider protocol adapters, operation/version capability probes,
   requested/translated/effective parameter provenance and no silent dropped
   field.
2. Hardware-aware local model catalog, verified revision-pinned download,
   licensing/hash/gating checks, resource fit, runtime tuning and truthful
   no-local-portfolio state until measured evidence exists.
3. Universal multimodal bridge/fallback policy for images, audio, video, PDF,
   Office, archive, HTML/canvas, code, structured data, logs and scientific
   artifacts; a bridge must never silently imply native provider support.
4. A specialist persona/agent catalog with role-specific context, model,
   tool, skill/MCP, authority, evaluation, budget, handoff and visual-runtime
   state contracts; include learning, competitive programming, math/science,
   code, AI/ML, defensive cyber, UI/UX/media, provider/runtime and release
   roles.
5. Explicit statement that a provider/model route can be `unavailable` or
   `unsupported`; Auto must be evaluated under capability, privacy, cost,
   latency and quality constraints rather than being an unrestricted fallback.

## Final acceptance sequence

Run this only after all concurrent writers have stopped or after their edits
are known to form one coherent snapshot:

```powershell
Set-Location C:\Users\khang\source\repos\Omnia

docs\omnia-ultra\tools\validate-spec.ps1

$manifest = Get-Content -Raw docs\omnia-ultra\manifest.json | ConvertFrom-Json
$required = @(
  'goal/20-universal-endpoints-and-local-model-catalog.md',
  'goal/21-multimodal-bridge-and-specialist-personas.md',
  'architecture/multimodal-capability-bridge.md',
  'harness/specialist-agent-persona-catalog.md',
  'schemas/provider-endpoint-capability.schema.json',
  'schemas/local-model-catalog-query.schema.json',
  'schemas/modality-bridge-plan.schema.json',
  'schemas/agent-role-profile.schema.json'
)
$missing = $required | Where-Object { $_ -notin $manifest.allFiles }
if ($missing) { throw "Missing manifest entries: $($missing -join ', ')" }

Get-Content -Raw docs\omnia-ultra\goal\00-copy-ready-prompt.md
```

Accept the final handoff only when the validator is green, every required path
is manifest-visible, every goal 20/21 atomic requirement has exactly one
capability and acceptance row, all stated registry revisions agree, and the
copy payload is reread from `COPY START` through `COPY END` as a standalone
instruction. Then run the same-snapshot source/native/UI gates and regenerate
the Project Twin only after the spec snapshot is stable.

## Prohibited final claims

Do not state that Omnia has already replaced ChatGPT, Claude, Gemini,
Perplexity, Codex or Cursor; that an appropriate local-model portfolio is
downloaded/benchmarked; that all provider protocols have live adapter coverage;
or that the universal bridge/persona catalog is end-to-end shipped. These are
normative targets until their actual capability-ledger state, source path,
tests and dated evidence agree.
