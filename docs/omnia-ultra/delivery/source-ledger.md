---
id: OMNIA-ULTRA-DELIVERY-SOURCES
title: Research and source ledger
status: research-ledger
last_reviewed: 2026-09-14
revision: 2026-09-14.1
---

# Research ledger

Use these sources for design input, not as permission to copy product assets or
private implementation.

## Existing Omnia primary-source research

- docs/research/OFFICIAL_HARNESS_REFRESH_2026-08-14.md
- docs/research/OFFICIAL_MULTIMODAL_PROVIDER_OPERATION_MATRIX_2026-08-14.md
- docs/research/PROVIDER_TELEMETRY_REQUEST_PROVENANCE_RESEARCH.md
- docs/research/PROVIDER_CACHE_CONTEXT_OPTIMIZATION_RESEARCH.md
- docs/research/OPENAI_CODEX_HARNESS_RESEARCH.md
- docs/research/OFFICIAL_UI_REFERENCE_REFRESH.md
- docs/research/CLAUDE_CODE_HARNESS_RESEARCH.md
- docs/research/CLAUDE_CODE_HARNESS_REFRESH_2026-10-01.md
- docs/research/OPENHANDS_OFFICIAL_HARNESS_RESEARCH.md
- docs/research/CONTINUE_AIDER_OPENCODE_HARNESS_RESEARCH.md
- docs/research/UNIVERSAL_PROVIDER_LOCAL_MODEL_RESEARCH_2026-08-14.md
- docs/research/OMNIA_HARNESS_BENCHMARKS.md
- docs/research/LEARNING_HARNESS_EVALUATION_PLAN.md
- docs/CONTEXT_COMPILER_ARCHITECTURE.md
- docs/HARNESS_ARCHITECTURE.md
- docs/THREAT_MODEL.md
- docs/adr/0004-durable-run-event-journal-and-cursor-replay.md
- docs/adr/0005-local-first-telemetry-and-usage-ledger.md

## Normative Omnia contract sources (not external research evidence)

The following files define Omnia's product, security, runtime, and delivery
contracts. They are listed here to make the research-to-contract boundary
discoverable; their presence must not be treated as proof that the described
capability is implemented, compiled, packaged, or verified at native runtime.

- docs/IMPLEMENTATION_STATUS.md — current implementation/evidence boundary and
  release status.
- docs/omnia-ultra/04-CURRENT-STATE-BRIDGE.md — dependency-ordered current-state
  bridge and next implementation gates.
- docs/PRODUCT_SPEC.md — product scope, phases, and release boundary.
- docs/HARNESS_ARCHITECTURE.md — durable run, provider, context, memory, skill,
  recovery, replay, and evaluation invariants.
- docs/CONTEXT_COMPILER_ARCHITECTURE.md — proposed context-basis/compiler
  contract and its explicit non-shipped boundary.
- docs/PROVIDER_ARCHITECTURE.md — BYOK/provider adapter, discovery, routing,
  retry, fallback, and parameter contracts.
- docs/PROVIDER_MULTIMODAL_DESIGN.md — attachment admission, carrier, transform,
  and provider-delivery contracts.
- docs/security-storage-architecture.md — trust, secrets, persistence, and
  deletion/recovery contracts.
- docs/THREAT_MODEL.md — capability, approval, privacy, and denial invariants.
- docs/omnia-ultra/delivery/acceptance-gates.md — executable evidence and
  release gates for each capability slice.
- docs/omnia-ultra/delivery/capability-ledger.json — current capability status
  projection; `targetStatus` in requirements remains desired end state only.
- docs/adr/0001-desktop-runtime-and-core-boundary.md
- docs/adr/0002-unified-kernel-execution-and-capabilities.md
- docs/adr/0003-attachment-draft-ownership-and-atomic-bind.md
- docs/adr/0004-durable-run-event-journal-and-cursor-replay.md
- docs/adr/0005-local-first-telemetry-and-usage-ledger.md
- docs/adr/0005-persistent-isolated-and-auto-machine-runtime.md
- docs/adr/0006-native-multimodal-bridge-admission-authority.md
- docs/adr/0007-state-revision-graph-and-branch-head-cas.md
- docs/adr/0008-run-control-multi-stream-cursor-authority.md

The duplicate `0005` prefix is intentional; always reference the full filename
when citing either ADR.

## Related informative source registers

- docs/research/windows-runtime/07-source-register.md — dated Windows/UI
  Automation, Graphics Capture, input, Edge/Chromium CDP and interpretation
  references. This register is design input only; it does not authorize
  credential extraction, CAPTCHA/DRM bypass, stealth automation, or global
  input control, and it is not evidence that those runtime capabilities ship.

## Pinned official repositories already reviewed

- openai/codex at a7b8c074b577f897111c14de3a5e127b91e2a479 for the UI refresh;
- openai/codex at 72fa74fbc9c4b72d513304bfa0eda427d2402ed9 for harness research;
- anthropics/claude-code at be90077c6a353f292fa612d97173865a9ab21b83;
- anthropics/claude-code at 525d3b35312636cf8c001ecb3df2be0324a48b43 — current official refresh captured on 2026-10-01;
- continuedev/continue at 5522c6f44ca0ac3528b37244818fbfa39b5af470;
- Aider-AI/aider at 5dc9490bb35f9729ef2c95d00a19ccd30c26339c;
- anomalyco/opencode at cc4b45612974f735ddec46009ede07729511fba4;
- OpenHands Agent Canvas at 4f465f3ccada5271a3bbe4a0148941b0c40d243b;
- OpenHands SDK at 131b7523554b88135ab66d5c733d26263260f3bf.

## Date-stamped official revisions

- OpenTelemetry GenAI Semantic Conventions repository
  `open-telemetry/semantic-conventions-genai` at
  `30182acd5ed78ab5f619041eaec5e95a4eb83a48`, captured on 2026-08-14.
  The GenAI conventions had moved out of the core semantic-conventions
  repository by this review. The repository and documents are explicitly
  marked as development-stage material, so Omnia treats them as an optional
  interoperability projection rather than its durable internal schema.

## Official public docs

- OpenAI Codex Manual: https://developers.openai.com/codex/codex-manual.md
- OpenAI API error codes: https://developers.openai.com/api/docs/guides/error-codes
- OpenAI API rate limits: https://developers.openai.com/api/docs/guides/rate-limits
- OpenAI API Responses reference: https://developers.openai.com/api/reference/responses
- OpenAI API reference overview and request identifiers: https://developers.openai.com/api/reference/overview/
- OpenAI API prompt caching: https://developers.openai.com/api/docs/guides/prompt-caching
- OpenAI API compaction: https://developers.openai.com/api/docs/guides/compaction
- OpenAI API counting tokens: https://developers.openai.com/api/docs/guides/counting-tokens
- OpenAI Agents SDK tracing: https://openai.github.io/openai-agents-python/tracing/
- OpenAI Agents SDK handoffs: https://openai.github.io/openai-agents-python/handoffs/
- OpenAI Agents SDK guardrails: https://openai.github.io/openai-agents-python/guardrails/
- OpenAI ChatGPT Projects: https://help.openai.com/en/articles/10169521-using-projects-in-chatgpt
- OpenAI ChatGPT branching conversations: https://help.openai.com/en/articles/6825453-chatgpt-release-notes
- Anthropic Claude Projects: https://support.anthropic.com/en/articles/9517075-what-are-projects
- Google Gemini chat pin/rename/delete: https://support.google.com/gemini/answer/13666746
- Anthropic subagents: https://code.claude.com/docs/en/sub-agents
- Anthropic agent view: https://code.claude.com/docs/en/agent-view
- Anthropic teams: https://code.claude.com/docs/en/agent-teams
- OpenHands conversation fork: https://docs.openhands.dev/sdk/guides/convo-fork
- OpenHands pause/resume: https://docs.openhands.dev/sdk/guides/convo-pause-and-resume
- OpenHands ask agent: https://docs.openhands.dev/sdk/guides/convo-ask-agent
- OpenHands critic: https://docs.openhands.dev/sdk/guides/critic
- OpenTelemetry GenAI semantic conventions: https://opentelemetry.io/docs/specs/semconv/gen-ai/
- Microsoft UI Automation overview: https://learn.microsoft.com/en-us/dotnet/framework/ui-automation/ui-automation-overview
- Microsoft Windows Graphics Capture: https://learn.microsoft.com/en-us/windows/apps/develop/media-authoring-processing/screen-capture
- Microsoft Windows Graphics Capture video: https://learn.microsoft.com/en-us/windows/uwp/audio-video-camera/screen-capture-video
- Microsoft application loopback audio sample: https://learn.microsoft.com/en-us/samples/microsoft/windows-classic-samples/applicationloopbackaudio-sample/
- Microsoft Input Injection: https://learn.microsoft.com/en-us/windows/uwp/ui-input/input-injection
- Anthropic API errors: https://docs.anthropic.com/en/api/errors
- Anthropic prompt caching: https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- Anthropic context windows and compaction: https://platform.claude.com/docs/en/build-with-claude/context-windows
- Anthropic context editing: https://platform.claude.com/docs/en/build-with-claude/context-editing
- Anthropic rate limits: https://docs.anthropic.com/en/api/rate-limits
- Anthropic Usage and Cost API: https://platform.claude.com/docs/en/build-with-claude/usage-cost-api
- Anthropic Claude Code monitoring and OpenTelemetry: https://docs.anthropic.com/en/docs/claude-code/monitoring-usage
- Gemini troubleshooting: https://ai.google.dev/gemini-api/docs/troubleshooting
- Gemini GenerateContent usage metadata: https://ai.google.dev/api/generate-content
- Gemini token counting: https://ai.google.dev/gemini-api/docs/tokens
- Gemini rate limits: https://ai.google.dev/gemini-api/docs/rate-limits
- Gemini model discovery: https://ai.google.dev/gemini-api/docs/models
- Gemini context caching: https://ai.google.dev/gemini-api/docs/caching
- DeepSeek error codes: https://api-docs.deepseek.com/quick_start/error_codes
- DeepSeek context-cache usage: https://api-docs.deepseek.com/guides/kv_cache
- DeepSeek model discovery: https://api-docs.deepseek.com/api/list-models
- Moonshot/Kimi chat API: https://platform.moonshot.cn/docs/api/chat
- Alibaba Model Studio OpenAI-compatible Qwen API: https://help.aliyun.com/zh/model-studio/qwen-api-via-openai-chat-completions
- LangGraph persistence: https://docs.langchain.com/oss/python/langgraph/persistence

## Provider-telemetry evidence rules

- A static model catalog proves discoverability, not inference health.
- An OpenAI-compatible transport proves neither parameter compatibility nor
  usage, caching, rate-limit, retry, tool, streaming, or billing semantics.
- Provider usage observations are attempt-scoped and may be incremental,
  partial, corrected, or absent. Missing values remain unknown.
- Local estimates, provider-reported usage, and invoice/admin reconciliation
  remain separate statements with independent provenance and authority.
- Raw provider request identifiers may be retained only in restricted native
  diagnostics. Renderer telemetry uses content-free opaque linkage and never
  exposes prompts, responses, reasoning content, credentials, headers, URLs,
  paths, or arbitrary provider payloads.
- RPM/TPM, quota, latency, TTFT, throughput, cost, and health are displayed
  only when their exact source, scope, formula, time window, and freshness are
  known. A missing denominator or provider field is not replaced with zero.

## Cache and context evidence rules

- Local artifact/context/retrieval reuse and provider-native prompt/context
  cache are different observations with different authority.
- A client cannot manufacture a provider-billed cache hit; only a supported
  provider mechanism and provider-reported usage can establish it.
- Provider cache handles, breakpoints, keys and compacted states are adapter-
  specific and not presumed portable between providers or model families.
- Cache effectiveness includes correctness, quality, privacy, invalidation,
  creation/read cost and unused-write rate—not only a hit percentage.
- Compaction creates a new context revision and checkpoint; raw journal/source
  history, citations, goals, tasks, approvals and unresolved effects remain
  recoverable.

## Evidence boundaries

Official docs drift. Record retrieval date, exact URL, relevant section and
whether a claim was observed, documented or inferred. Do not state that a
feature is current because an old research file mentions it.

When an official specification moves repositories, retain the older pointer
only as historical provenance and update active references to the new official
location. A live `main` branch is not a release pin; release gates must record
the exact reviewed commit or published version.

The companion `source-ledger.json` is the machine-readable projection of this
register. `generate-source-ledger.mjs --check` guarantees stable source IDs,
typed locators, current local-file hashes, and deterministic regeneration from
this register; `validate-source-ledger.mjs --check` rejects unsafe paths,
duplicate IDs, hash drift, malformed revisions, and source-class/locator
mismatches. URL reachability and freshness are intentionally not inferred: the
current 47 URL entries remain `documented-only` until an explicit retrieval
review records a date and result. Requirement, implementation-module, test,
evidence, Project Twin, and status mappings are still a separate crosswalk
workstream; describe coverage as documented/prose-ledger plus machine-validated
provenance, not as complete implementation verification.
