---
id: OMNIA-AUDIT-OFFICIAL-MULTIMODAL-MATRIX-2026-08-14
title: Official multimodal provider-operation matrix research receipt
status: audit
last_reviewed: 2026-08-14
---

# Official multimodal provider-operation matrix receipt

## Scope

This receipt records the evidence checks for the research and schema work in:

- [`../research/OFFICIAL_MULTIMODAL_PROVIDER_OPERATION_MATRIX_2026-08-14.md`](../research/OFFICIAL_MULTIMODAL_PROVIDER_OPERATION_MATRIX_2026-08-14.md)
- [`../omnia-ultra/observability/universal-provider-protocol-adapters.md`](../omnia-ultra/observability/universal-provider-protocol-adapters.md)
- [`../omnia-ultra/schemas/provider-endpoint-capability.schema.json`](../omnia-ultra/schemas/provider-endpoint-capability.schema.json)

It verifies documentation links and local artifact integrity only. It does not
verify provider credentials, account entitlements, model availability, a live
capability probe, adapter implementation, media transfer, or end-to-end Omnia
multimodal routing.

## Source-link check

On the current Windows development host, `curl.exe --location` returned HTTP
`200` and process exit `0` for all 21 URLs cited in the research source set:

| Source group | Checked URLs |
| --- | --- |
| OpenAI | API overview, Images and vision, File inputs, Realtime reference |
| Anthropic | Vision, PDF support, Files API |
| Google Gemini | Image, audio, video, document, files, Live and API-version guides |
| Local/runtime | Ollama vision, vLLM multimodal and OpenAI-compatible server, LM Studio local server, llama.cpp upstream, Hugging Face TGI and LiteLLM docs |

The link check establishes reachability of the cited source pages at the
observation time. It does not freeze the content; capability snapshots still
need source hashes, retrieval timestamps, model/version data and scheduled
refresh/probe receipts.

## Local integrity checks

The following checks completed successfully:

```text
JSON_PARSE=PASS
RESEARCH_MATRIX_LINES=228
OPERATION_CAPABILITY_LINK=PASS
RESEARCH_TITLE=# Official multimodal provider-operation matrix — 2026-08-14
RESEARCH_HEADINGS=9
SCHEMA_OPERATION_CAPABILITIES_PRESENT=True
SCHEMA_CAPABILITY_REQUIRED_FIELDS=operation,direction,modality,supportLevel,modelScope,carrierFormats,mimeFamilies,fidelity,probeRequirement,evidence
NORMATIVE_MATRIX_LINK_PRESENT=True
```

The schema extension is backward-compatible at the required-field level:
`operationCapabilities` is an optional richer record, so pre-existing snapshots
using the original required fields still parse. New dispatch logic must not
treat an omitted `operationCapabilities` array as a native modality grant.

## Pack-validator boundary

`docs\omnia-ultra\tools\validate-spec.ps1` was also run against the shared
working snapshot. It failed on pre-existing/in-progress cross-workstream
integration rather than an error attributed to this matrix. The observed
failures included unmanifested academic/local multimodal files and broad goal
`requirements_registry_revision` drift between `.4`/`.5` and `.6`.

This means the focused artifacts above are locally parse/link checked, while
the complete Omnia Ultra specification pack remains **not verified as a
same-snapshot green build** until manifest and registry integration is merged
and the validator is rerun.
