---
id: OMNIA-ULTRA-INT-STRUCTURED-IO-LOG-RENDERING
title: Structured input, output, tool and command-log rendering
status: normative-target
version: 1.0.0
last_reviewed: 2026-08-14
supersedes: []
---

# Structured input, output and log rendering

Every prompt, assistant segment, tool result, terminal stream, build/test log,
request trace and artifact preview uses a typed block renderer. Omnia preserves
the original bytes/text as the audit source and layers formatting, parsing and
syntax highlighting as reversible derived views.

## Supported block kinds

The renderer recognizes plain text, Markdown, LaTeX, source code, shell input,
stdout/stderr, ANSI terminal output, JSON, JSONL, YAML, TOML, XML, HTML/CSS,
SQL, CSV/TSV, unified diff, patch, stack trace, test report, compiler diagnostic,
HTTP request/response, SSE/event stream, table, citation list, math result and
binary/unsupported attachment metadata. Detection records confidence and never
silently changes the source language selected by the user.

## Rendering behavior

- language-aware syntax highlighting with theme, contrast and token colors;
- nested/segmented highlighting when one log embeds JSON, code, SQL or a trace;
- line numbers, soft wrap, horizontal scroll, minimap optional, search/filter,
  match navigation, fold/collapse, expand, copy selection/block/raw, download
  raw/normalized view and Jump-to-source;
- stdout/stderr/tool/system channels remain visually and semantically distinct;
- ANSI control sequences are sanitized and rendered without terminal escape
  injection; links require safe protocol handling;
- streaming parsers preserve incomplete trailing tokens and re-highlight only
  affected ranges to avoid flicker or O(n²) work;
- very large blocks use virtualization, incremental parsing and bounded memory;
- current request/tool step expands by default while older blocks collapse to
  a configurable summary with status, duration and line/error counts;
- structured errors link to the originating request, file/line, tool call,
  attempt, retry and redacted trace when available.

## Input and editable views

The composer renders Markdown, LaTeX, code fences, tables and attachments live
without losing selection, IME composition, undo history or cursor mapping.
Users can switch `source`, `split`, `rendered` and `raw` views. Long input may
be converted into a lineage-preserving file while retaining an inline preview,
source ranges and the exact content sent to each provider.

## Truth, security and accessibility

Formatting never becomes the authoritative record. Each derived view stores
source hash, parser/highlighter version, detected/selected language, redaction
policy and transformation warnings. Secrets are redacted before common logs or
exports. HTML/SVG/ANSI and links render in a sandboxed/sanitized path. Screen
readers receive channel, language, line and severity metadata plus a plain-text
fallback; color is never the only error signal.

## Acceptance evidence

Tests cover chunk-boundary streaming, ANSI escape attacks, malformed JSON,
nested logs, Unicode/Vietnamese/IME, huge output virtualization, copy fidelity,
raw-versus-rendered hashes, diff/stack-trace links, light/dark/high-contrast,
keyboard/screen-reader navigation and restart recovery of collapsed state.

See `../schemas/structured-block.schema.json`,
`composer-large-paste-live-render.md`,
`../observability/logs-traces-debug.md` and
`../workbenches/ide-git-docker-devops.md`.
