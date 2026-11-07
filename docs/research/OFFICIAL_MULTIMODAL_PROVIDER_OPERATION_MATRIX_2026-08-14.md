# Official multimodal provider-operation matrix — 2026-08-14

This is a primary-source research baseline for Omnia's multimodal capability
planner. It is not an implementation or availability claim. Provider catalogues,
preview labels, model releases, limits, regions and account entitlements change;
Omnia must create a fresh, versioned capability snapshot and run safe canary
probes before it sends a real user artifact to a selected endpoint.

The baseline deliberately distinguishes an operation contract from a provider
brand. For example, a service advertised as OpenAI-compatible may accept a
Chat Completions-shaped request while still rejecting image blocks, files,
audio, tool calls, caching fields or the selected model. Similarly, a model
that accepts a PDF may receive parsed text, rendered pages, both, or a
provider-specific augmentation rather than a lossless original-document view.

## Decision legend

| Marker | Meaning | Dispatch consequence |
| --- | --- | --- |
| `N` | Native input/output path is documented for the relevant provider operation. | Verify selected model, version, carrier, MIME, limits, policy and health; then direct-dispatch only if all checks pass. |
| `M` | The runtime/model/feature revision determines support. | A model-specific capability probe is mandatory; do not infer support from the endpoint or model-family name. |
| `B` | The baseline has no universal direct route suitable for the source artifact. | Build a provenance-preserving local/specialist bridge, or block with an exact reason. |
| `P` | A proxy/compatibility surface normalizes transport, not semantic capability. | Resolve and probe the downstream endpoint/model; never copy the facade's broadest capability claim. |
| `S` | A distinct provider service, tool or asynchronous job may exist. | Resolve it as a separate operation with its own authorization, model, pricing, lifecycle and output provenance. |
| `U` | No source-backed universal statement is made. | Show “unknown until probed”; do not silently transform or dispatch. |

`N` is never equivalent to “every current and future model supports it.” It
means that a documented operation has a native carrier path subject to the
specific model and request constraints recorded in its capability snapshot.

## Source set and scope

This source set was reviewed on **2026-08-14**. It is intentionally limited to
first-party documentation or the official upstream runtime documentation.

| ID | Primary source | What Omnia takes from it |
| --- | --- | --- |
| `OA-OVERVIEW` | [OpenAI API overview](https://developers.openai.com/api/reference/overview) | Responses is a first-class surface for text, image and audio inputs; Realtime is a distinct low-latency audio surface. |
| `OA-VISION` | [OpenAI Images and vision](https://developers.openai.com/api/docs/guides/images-vision) | Image inputs use typed content blocks and may be URL, base64/data URL or provider file ID; image generation/editing is a separate image capability. |
| `OA-FILES` | [OpenAI File inputs](https://developers.openai.com/api/docs/guides/file-inputs) | PDF treatment differs from non-PDF documents and spreadsheets; the planner must retain that fidelity distinction. |
| `OA-REALTIME` | [OpenAI Realtime API reference](https://developers.openai.com/api/reference/resources/realtime) | Voice/audio sessions have their own transport/session semantics and cannot be collapsed into a generic chat request. |
| `AN-VISION` | [Anthropic vision](https://docs.anthropic.com/en/docs/build-with-claude/vision) | Images are content blocks with documented image handling and model/version constraints. |
| `AN-PDF` | [Anthropic PDF support](https://docs.anthropic.com/en/docs/build-with-claude/pdf-support) | PDF is a specific document route, not merely a text attachment. |
| `AN-FILES` | [Anthropic Files API](https://docs.anthropic.com/en/docs/build-with-claude/files) | File handles and upload lifecycle are provider resources that must be preserved in lineage. |
| `GG-MEDIA` | [Gemini image](https://ai.google.dev/gemini-api/docs/image-understanding), [audio](https://ai.google.dev/gemini-api/docs/audio), [video](https://ai.google.dev/gemini-api/docs/video-understanding), [documents](https://ai.google.dev/gemini-api/docs/document-processing), [files](https://ai.google.dev/gemini-api/docs/files), and [Live API](https://ai.google.dev/gemini-api/docs/live) | Gemini has separate documented media/document and live interaction paths; model/version and inline-vs-file constraints remain material. |
| `GG-VERSION` | [Gemini API versions](https://ai.google.dev/gemini-api/docs/api-versions) | `v1` and `v1beta` must be treated as distinct protocol/version snapshots. |
| `OL-VISION` | [Ollama vision capability](https://docs.ollama.com/capabilities/vision) | Image support is tied to a vision-capable local model; it is not a universal local-runtime feature. |
| `VLLM-MM` | [vLLM multimodal inputs](https://docs.vllm.ai/en/latest/features/multimodal_inputs/) and [OpenAI-compatible server](https://docs.vllm.ai/en/latest/serving/openai_compatible_server/) | Multimodal serving is model/processor/server-configuration dependent even where an OpenAI-shaped endpoint is exposed. |
| `LMSTUDIO-SERVER` | [LM Studio local server](https://lmstudio.ai/docs/developer/core/server) | A local server's API compatibility must be separated from the capabilities of the loaded model/runtime profile. |
| `LLAMACPP` | [llama.cpp upstream repository](https://github.com/ggml-org/llama.cpp) | Local multimodal support is model/project/runtime-profile dependent and needs an explicit adapter test. |
| `TGI` | [Hugging Face Text Generation Inference](https://huggingface.co/docs/text-generation-inference/index) | TGI is a serving runtime; a general text endpoint is not a declaration that arbitrary media inputs are supported. |
| `LITELLM` | [LiteLLM documentation](https://docs.litellm.ai/) | Translation/proxy functionality cannot create a downstream model modality that does not exist. |

The official docs provide evidence for their own provider/runtime. They do not
authorize Omnia to infer the same functionality for a gateway, cloud host,
regional deployment, private model, local model file, or OpenAI/Anthropic
compatibility facade.

## Baseline input/output matrix

The following matrix is deliberately capability-conservative. “Office” means
DOCX/PPTX/XLSX-like artifacts and retains a separate visual/semantic fidelity
decision. “Archive/3D” includes ZIP/RAR/7z, notebooks, CAD and scientific
containers; safe unpacking and semantic extraction are Omnia responsibilities.

| Provider operation family | Text | Image / diagram | PDF | Office / sheets | Audio / voice | Video | Archive / 3D | Image output | Video output | Required planner behavior |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OpenAI Responses | `N` | `N` | `N` | `N` with fidelity qualifier | `N` | `B` | `B` | `S` | `U` | Freeze model + content-block carrier. For files, record whether provider treatment is text-only, page-image-plus-text, or spreadsheet augmentation; do not advertise visual fidelity merely because upload succeeds. |
| OpenAI Chat Completions | `N` | `N` | `M` | `M` | `N` | `B` | `B` | `U` | `U` | Treat chat content blocks and request modalities as a separate adapter from Responses. Probe the exact model/schema rather than translating Responses fields blindly. |
| OpenAI Realtime | `N` | `M` | `B` | `B` | `N` | `M` | `B` | `U` | `U` | Use a dedicated realtime session/transport route. Voice transcription is an observation aid, not proof that the transcript fully represents what the model consumed. |
| Anthropic Messages / Files | `N` | `N` | `N` | `M` | `B` | `B` | `B` | `U` | `U` | Keep Messages content blocks, Files resource IDs and beta/version headers explicit. Route audio/video/archives through a bridge unless a future capability snapshot proves a native path. |
| Google Gemini generate / stream content | `N` | `N` | `N` | `N` / `M` | `N` | `N` | `B` | `M` | `S` / `M` | Resolve `v1` versus `v1beta`, model release and inline/file carrier separately. Generation of images/video is not implied by media understanding and may use distinct model/job resources. |
| Google Gemini Live | `N` | `M` | `B` | `B` | `N` | `M` | `B` | `U` | `U` | Model/version and realtime transport semantics are mandatory inputs to the snapshot; do not carry over batch document assumptions. |
| Ollama native API | `N` | `M` | `B` | `B` | `B` | `B` | `B` | `U` | `U` | Verify the locally loaded model is vision-capable and the request shape matches the exact Ollama release. Otherwise render/extract locally and pass a grounded surrogate. |
| vLLM server | `N` | `M` | `B` | `B` | `M` | `M` | `B` | `U` | `U` | Probe model processor, multimodal limits, server flags and OpenAI-compatible endpoint shape. A successful text call proves only text. |
| LM Studio server | `N` | `M` | `B` | `B` | `M` | `M` | `B` | `U` | `U` | Query the loaded model/runtime profile and run non-sensitive synthetic modality probes. The local server facade alone has no broad modality guarantee. |
| llama.cpp server / CLI runtime | `N` | `M` | `B` | `B` | `M` | `M` | `B` | `U` | `U` | Bind a runtime-profile revision to model file, multimodal projector/processor, build features and server adapter before dispatch. |
| Hugging Face TGI / generic inference runtime | `N` | `M` | `B` | `B` | `M` | `M` | `B` | `M` | `M` | Require model-card, processor, endpoint and task capability evidence; generic generation APIs are not universal artifact parsers. |
| LiteLLM / gateway / OpenAI-compatible facade | `P` | `P` | `P` | `P` | `P` | `P` | `P` | `P` | `P` | Resolve the downstream provider, model and operation. Store both facade and downstream capability snapshots, including field translation and ignored/rejected fields. |
| Anthropic-compatible facade | `P` | `P` | `P` | `P` | `P` | `P` | `P` | `P` | `P` | `P` | Compatibility is per method/content block/version. Probe and version the adapter before enabling native attachment controls. |
| Custom REST/SSE/WebSocket/plugin adapter | `U` | `U` | `U` | `U` | `U` | `U` | `U` | `U` | `U` | Require an approved manifest, explicit conformance fixtures and a versioned capability snapshot before displaying the capability as selectable. |

### Important fidelity qualifications

- OpenAI's file-input guide describes different handling by file type: vision
  capable PDF processing includes text and page images, non-PDF documents are
  text-extracted, and spreadsheets take a spreadsheet-specific augmentation
  path. Omnia therefore records the effective representation—not just the
  file extension—in the attachment card and request lineage.
- A native provider file handle is not an Omnia-owned durable original. Omnia
  keeps the original content-addressed artifact locally, plus its encrypted
  provider handle/reference where a user policy permits it.
- “Native video” means the selected model/operation documents video input and
  the actual request passes the model-specific duration, frame, resolution and
  location constraints. It does not mean that every frame, audio sample,
  subtitle or embedded document was considered.
- “Office / sheets” never grants permission to claim formula, chart, comments,
  animations, layout, track-changes or speaker-note fidelity. The bridge must
  choose and declare the needed semantic and visual extraction stages.

## Capability-snapshot contract

An Omnia capability assertion is valid only when all of the following are
pinned together:

1. `providerProfileRevisionId`: logical provider/account/base-URL profile;
2. `adapterRevision`: serializer/parser/conformance-fixture revision;
3. `protocolFamily` and `apiVersion`: for example, Gemini `v1` vs `v1beta`;
4. exact `operation`: Responses, Messages, generate content, Live, image job,
   files, local runtime endpoint, and so on;
5. exact model snapshot or local runtime profile, not a display label alone;
6. direction: input, output, analysis, generation or bidirectional;
7. modality, MIME family, source carrier and declared limits;
8. documented/observed support level, fidelity description and source evidence;
9. data-retention/residency/policy decision, grant ID and health observation;
10. canary probe receipt or a truthful reason why probing was not allowed.

The existing broad `modalities` array remains a discovery hint. Omnia's
dispatch decision must instead use an `operationCapabilities[]` row that joins
the operation, model scope, carrier, MIME family, fidelity, support level,
constraints, source evidence and probe state.

## Safe probe sequence

Capability discovery must neither leak a real attachment nor confuse a 401,
403, quota or outage with a modality failure.

1. **Discover non-destructively.** Fetch the provider's model/capability
   metadata where an authenticated profile permits it. Store the raw response
   hash, redacted metadata and adapter parsing revision.
2. **Compile a candidate route.** Evaluate operation, model, API version,
   region/data policy, carrier type, MIME, declared size/page/duration limits,
   client-side cache scope and tool requirements.
3. **Use a licensed synthetic canary.** Send a small fixed test fixture for
   the exact candidate modality only after the user has allowed provider
   probing. Tag it as `capability-probe`; never reuse it as normal chat state.
4. **Classify failures correctly.** Authentication, authorization, quota,
   rate limit, transport/TLS, account entitlement, region and server errors
   retain their own outcomes. They do not downgrade a modality to unsupported.
5. **Persist an expiring probe receipt.** It includes requested/effective
   model, endpoint, carrier, MIME, limits observed, request/response hashes,
   opaque provider request ID, duration, normalized outcome and expiry.
6. **Select a bridge only after policy evaluation.** A direct route can lose
   to a local or specialist route because of privacy, quality, latency, cost,
   benchmark evidence or a user pin.
7. **Never silently retry a side-effecting media generation job.** Generation,
   editing and upload operations need idempotency and job reconciliation,
   independent of input-modality probing.

## Bridge recipes when a direct claim is unavailable

| Source artifact | Minimum bridge chain | Fidelity/quality gate before primary-model handoff |
| --- | --- | --- |
| Image, scan or diagram | deterministic decode → orientation/color normalization → OCR/layout/diagram or vision specialist → coordinate-linked observations | original dimensions, crop/rotation, OCR coverage/confidence, region citations, low-confidence text flagged |
| PDF | safe parser → page render at task-dependent resolution → text/layout/table/form extraction → page/region retrieval handles | page count equality, page image/render hash, extractable-text coverage, table/form confidence, signature warning |
| DOCX/PPTX/XLSX | structure parser plus rendered pages/slides/sheets; formula/chart/comment/notes extraction as selected | source part hashes, slide/sheet counts, formula/value distinction, chart/object mapping, visual-vs-semantic limitations |
| Audio | decode → duration/channel/sample metadata → ASR/diarization/event analysis → timestamp-linked transcript | duration agreement, monotonic timestamps, language/diarization confidence, explicit “transcript is surrogate” label |
| Video | container probe → audio/ASR → adaptive shot/keyframe sampling → visual/event specialist → aligned timeline | media duration, sampled-frame manifest, shot/timestamp alignment, audio/video drift and coverage metrics |
| Archive | content-addressed store → policy-bounded safe extraction → manifest/tree → selected parsers | no traversal/symlink escape, file-count/size limits, original member hashes, excluded/blocked member reasons |
| Scientific/3D | format validator → metadata and mesh/volume/signal parser → view/render samples → domain specialist | coordinate system/units, parser warnings, sampled-view mapping, lossiness and calibration limits |

The primary model receives a bounded, source-linked manifest and retrieval
handles rather than one untraceable mega-summary. It can request specific pages,
regions, frames, sheets, archive members or transcript spans through a bridge
tool. Every derivative retains the original source hash and transform lineage.

## UX requirements for truthful multimodality

- The attachment card shows **Native**, **Local transform**, **Bridge model**,
  **Hybrid**, **Review required**, **Unsupported**, or **Unknown until probe**;
  it never shows a generic green “multimodal” badge.
- Expand shows the exact selected operation, provider/model snapshot,
  API version, carrier, input representation, fidelity label, tool/model
  revisions, privacy decision, cost/latency estimate and all source links.
- The model picker filters by operation and attachment set, not a global model
  label. A model can be healthy for text and unavailable for a PDF/video run.
- Users can pin direct-only, local-only, a bridge model, maximum privacy,
  lowest estimated cost, highest verified fidelity, manual selection, and a
  per-project/default capability refresh policy.
- On a fallback, Omnia surfaces the original failure class and the selected
  bridge's expected loss/cost. It does not disguise a bridge result as native
  provider understanding.
- An attachment can be removed, redacted, retained locally only or excluded
  from adaptive-learning datasets by policy. Provider handles/tokens/cookies
  are never treated as reusable artifact data.

## Conformance fixture inventory

Each built-in or plugin adapter needs a versioned fixture family for:

1. minimal text; image by inline data, URL and provider file handle where
   documented; PDF; document; spreadsheet; audio; video; archive rejection;
2. supported/unsupported MIME, page/image/frame/duration/count/size boundaries;
3. model-gated success and model-gated rejection on the same endpoint;
4. `v1`/`v1beta`, Responses/Chat, Messages, generate/stream/Live and local
   runtime variants;
5. streamed deltas, upload/job lifecycle, cancellation, idempotency and
   recovery outcomes;
6. input representation/fidelity assertions, not only HTTP 2xx assertions;
7. privacy/data-policy refusal, secret redaction, region/entitlement error and
   correct non-retry classification; and
8. a deterministic bridge equivalence evaluation with citations, confidence,
   cost, latency and loss budget recorded.

No test may use a user's private file as a capability canary. All public or
synthetic media fixtures must have a recorded license and content hash.

## Integration actions

1. Extend `provider-endpoint-capability.schema.json` with operation-level
   modality rows, source evidence, fidelity and probe state.
2. Add provider adapters that produce these rows from documentation, model
   discovery and safe runtime probes; preserve `requested`, `translated`,
   `effective`, `ignored` and `rejected` fields.
3. Use the rows as a hard prerequisite of the multimodal bridge planner. The
   planner selects direct/native only if an unexpired, policy-compatible row
   accepts the exact artifact/operation.
4. Implement synthetic-fixture conformance tests before enabling a new provider
   or compatibility facade in the production model picker.
5. Feed probe/evaluation results into the adaptive routing plane only after
   consent, redaction, baseline comparison and rollback criteria are met.

Related normative contracts:

- [`../omnia-ultra/architecture/multimodal-capability-bridge.md`](../omnia-ultra/architecture/multimodal-capability-bridge.md)
- [`../omnia-ultra/observability/universal-provider-protocol-adapters.md`](../omnia-ultra/observability/universal-provider-protocol-adapters.md)
- [`../omnia-ultra/schemas/provider-endpoint-capability.schema.json`](../omnia-ultra/schemas/provider-endpoint-capability.schema.json)
- [`../omnia-ultra/schemas/modality-bridge-plan.schema.json`](../omnia-ultra/schemas/modality-bridge-plan.schema.json)
