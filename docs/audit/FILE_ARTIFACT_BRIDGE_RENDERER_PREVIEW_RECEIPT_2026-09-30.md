# File and artifact bridge renderer preview receipt — September 30, 2026

## Scope

This receipt records the existing bounded renderer surfaces mapped to
`OMNIA-CAP-FILE-ARTIFACT-BRIDGE`. The capability remains **partial**. Nothing
here proves native filesystem authority, durable artifact bytes, provider
execution, or packaged Windows behavior.

## Implemented preview surfaces

- `artifact-document-studio-preview.tsx` renders a session-local document
  editor with Markdown shortcuts, code/math/table/media references, outline
  and structure navigation, search/replace, checkpoints, review notes,
  rendered preview, and portable export/import rehearsal.
- `artifact-document-io.ts` validates bounded JSON/Markdown bundles and keeps
  explicit renderer-preview scope/size limits.
- `library-screen.tsx` exposes artifact cards, revisions, preview/studio/diff/
  metadata tabs, and availability-aware open/export controls.
- `workspace-file-browser-preview.tsx` provides a renderer-local file-root
  browsing projection.
- `media-asset-inspector.tsx` preserves modality, metadata, and non-observed
  provider/durable-artifact states without fabricating media bytes.

## Focused evidence

```text
artifact-document-studio-preview + artifact-document-io
workspace-file-browser-preview + media-asset-inspector  PASS (4 files / 26 tests)
```

## Explicit gaps

The preview does not read/write arbitrary native files, perform OCR or content
extraction, upload/download artifacts, persist derivative lineage, execute a
provider/model bridge, or establish durable artifact hashes and restart
recovery. Those boundaries keep this capability at **partial**.

