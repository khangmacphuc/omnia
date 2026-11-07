# Universal provider and local-model research — 2026-08-14

This addendum records current primary-source inputs used to shape the Omnia
provider and local-model target. It is research evidence, not implementation
proof.

## Provider protocols

- OpenAI API reference: Responses, Chat Completions and the broader endpoint
  inventory: https://platform.openai.com/docs/api-reference
- Anthropic Messages and token-counting references:
  https://docs.anthropic.com/en/api/messages and
  https://docs.anthropic.com/en/api/messages-count-tokens
- Google Gemini API methods and versioning:
  https://ai.google.dev/api/all-methods and
  https://ai.google.dev/gemini-api/docs/api-versions

## Local model discovery and runtimes

- Hugging Face Hub revision-pinned download/cache guides:
  https://huggingface.co/docs/huggingface_hub/guides/download
- Ollama native API, model listing/pull and compatibility references:
  https://docs.ollama.com/api/introduction
- LM Studio local server, CLI search/download and load configuration:
  https://lmstudio.ai/docs/developer/core/server and
  https://lmstudio.ai/docs/cli/local-models/get

## Decisions

- Capability and method support is probed and revisioned per adapter; no
  provider brand implies universal compatibility.
- Local downloads are revision/hash/license bound and remain separate from
  runtime installation or execution approval.
- Hardware fit is shown as an evidence-bearing estimate until benchmarked on
  the exact machine.
- Quantization is represented as a quality/memory/speed tradeoff, not as a
  universally superior or lossless transformation.
