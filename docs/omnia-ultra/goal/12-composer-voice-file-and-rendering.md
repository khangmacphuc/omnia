---
id: OMNIA-ULTRA-GOAL-COMPOSER-VOICE-FILE-RENDERING
title: Composer, voice, file bridge and live rendering contract
status: normative-target
version: 1.0.0
last_reviewed: 2026-08-14
supersedes: []
requirements_registry_revision: 2026-08-14.6
---

# Composer, voice, file bridge and live rendering contract

The composer is a durable, multimodal work surface. Text, speech, selection
references, files, transformed derivatives, model/effort choice, advanced
parameters, queue mode, scheduling and permissions are inspectable draft
elements before dispatch. It must not freeze when parsing, previewing or
indexing a large input.

## Large paste and attachment lineage

When a configured character, byte, line or estimated-token threshold is
crossed, Omnia proposes or automatically creates a lineage-preserving file
according to the selected policy. It retains exact original bytes; detects an
extension/content type with confidence; records the threshold/policy decision;
creates previews/extractions/chunks as derived artifacts; and lets the user
choose ranges to include in context. The original and every derivative show
hash, source, transform version, parameters, failure state and deletion/
retention policy.

An auto-conversion must be reversible before dispatch and must never discard
the original paste. The task continues with progress/cancellation in the
background. Huge content can be summarized or chunked for context only through
an explicit, inspectable context manifest; a transformed summary is never
presented as the original file.

## Live source and preview rendering

The input surface supports source, preview and split modes for Markdown,
LaTeX, code, tables and approved diagrams. Rendering preserves cursor/source
mapping, handles errors without losing source, sanitizes untrusted HTML/SVG and
never runs arbitrary pasted JavaScript. Attachments use capability-specific
previewers for image, audio, video, PDF, Office, archive, HTML/canvas and code;
the UI states whether the preview is native, extracted, bridged, unavailable or
still processing.

When a selected provider cannot consume a file type, Omnia evaluates an
approved bridge: deterministic transform, OCR/extraction, local model or a
user-selected vision/text bridge. The dispatched manifest records why the
bridge was selected, source/derived artifact IDs, bridge model/profile, prompt
template version, parameters, cost and result confidence. No bridge may expose
content beyond its data classification or silently upload a local file to a
remote provider.

## Voice input and conversation

Voice is a first-class but separately permissioned input path. It supports
push-to-talk and configurable continuous conversation; partial and final
transcripts; local/cloud speech-to-text selection; language/dialect selection;
Vietnamese, English and code-switching; code/math/LaTeX dictation; confidence
and alternative hypotheses; editable review before send; transcript recovery
after interruption; and explicit microphone/streaming indicators.

Voice commands are parsed separately from prompt content. A user can say
commands such as queue, steer, stop, jump, read selection or change mode only
after a visible command-mode/confirmation policy determines that it is a
command. The app never sends captured microphone audio, transcript or a
speaker-derived identifier to an unapproved provider, and a failed STT path
preserves the raw local draft/recording according to retention settings rather
than fabricating text.

## Accessibility and dispatch gate

All composer state has keyboard, pointer, touch and screen-reader paths:
attachments identify type/progress/error, live preview announces changes
without excessive chatter, dictation has an accessible transcript editor and
every model/parameter/queue decision remains visible in the final frozen input
review. Dispatch freezes an immutable prompt/context/attachment/parameter
manifest and emits a durable draft-to-run transition. See
`../interaction/composer-large-paste-live-render.md`,
`../interaction/voice-input-and-conversation.md`,
`../workbenches/file-artifact-studio.md` and
`../security/approvals-sandbox-secrets.md`.
