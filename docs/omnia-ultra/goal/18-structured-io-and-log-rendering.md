---
id: OMNIA-ULTRA-GOAL-STRUCTURED-IO-LOG-RENDERING
title: Structured syntax-highlighted input, output and logs goal
status: normative-target
version: 1.0.0
last_reviewed: 2026-08-14
supersedes: []
requirements_registry_revision: 2026-08-14.6
---

# Structured input, output and log rendering

Omnia must format and syntax-highlight every eligible prompt, answer, tool
result, command, stdout/stderr stream, build/test log, request trace, diff,
stack trace and structured artifact. The original source remains immutable;
highlighting and parsing are derived, reversible views with provenance.

The renderer auto-detects common text/code/data/log formats, supports explicit
language override, nested segments, line numbers, wrap/scroll, search, filter,
fold, copy raw/rendered, export, Jump-to-source and large-stream virtualization.
It preserves incomplete streamed tokens, IME/cursor/selection state, ANSI
safety, redaction, accessible plain-text equivalents and high-contrast themes.

Completion requires a typed block schema, shared renderer for composer/chat/
tool/terminal/inspector/artifact surfaces, incremental parsing, sanitization,
performance/accessibility tests and exact source/transformation hashes.

See `../interaction/structured-io-log-rendering.md` and
`../schemas/structured-block.schema.json`.
