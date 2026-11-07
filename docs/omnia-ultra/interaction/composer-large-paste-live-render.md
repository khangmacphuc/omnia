---
id: OMNIA-ULTRA-INT-COMPOSER
title: Large paste, file conversion and live Markdown/LaTeX input
status: normative-target
---

# Composer and large paste

## Automatic paste-to-file

In Auto mode, convert a paste into a file when it exceeds the configured
character, byte, line or estimated-token threshold, or when inline rendering
would degrade responsiveness. Recommended defaults are 32768 characters,
8192 estimated tokens, 256 KiB or 2000 lines, whichever comes first.

Preserve:

- exact clipboard bytes and encoding;
- rich/HTML clipboard content when available;
- normalized derivative;
- detected MIME/type and guessed extension;
- content hash;
- created time;
- transformation lineage.

Show a file chip with preview, size, lines, tokens, index status, open, remove,
replace, send-full-file, send-selected-range and summarize-before-send.

## Live input renderer

Provide source, preview, split and WYSIWYM modes for:

- Markdown/GFM;
- LaTeX inline/block;
- code fences;
- tables;
- task lists;
- citations;
- Mermaid/diagram preview when enabled.

Use a worker or incremental renderer, debounce updates, preserve cursor mapping,
virtualize large content and sanitize HTML. Never execute pasted JavaScript in
the composer. Render errors remain visible without destroying source.

## Context controls

Show estimated input tokens, reserved output budget, cache eligibility,
attachments, selected ranges and context exclusions before send.

