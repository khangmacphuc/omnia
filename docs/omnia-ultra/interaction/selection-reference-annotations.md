---
id: OMNIA-ULTRA-INT-REFERENCE
title: Selection hover, reply and annotation
status: normative-target
---

# Selection reference

Selecting output, input, code, source text, PDF regions, spreadsheet ranges,
slides or media timestamps opens a contextual action surface.

Actions:

- ask about this;
- reply/quote/reference;
- explain, expand, simplify, translate, rewrite;
- verify, fact-check, challenge, find source;
- create exercise, flashcard, task, goal, plan or memory;
- add to skill, note, Project Twin or evidence;
- compare model answers;
- branch from selection;
- copy plain/Markdown/rich/citation;
- share anchored link;
- send to agent;
- report issue.

## Stable anchor

Store message/source/artifact ID, revision, exact span/range/timestamp,
surrounding hash, semantic fingerprint, provenance and stale state.

If content changes, re-anchor only with high confidence. Otherwise show stale
and ask the user to relink. Never silently reference a nearby but different
sentence.

## Composer reference chip

Show preview, origin, author, source, quote mode, open-original, reorder and
remove. Multiple references are allowed. The frozen provider input records the
chosen reference mode.

## Overlay behavior

- Dimmed modal: outside click closes when safe.
- Non-modal sidebar: outside click behavior is configurable.
- Destructive/mandatory dialog: outside click does not commit or silently dismiss.
- Escape closes the top safe layer.
- Focus returns to the invoking control.
- Touch uses long press.
- Screen reader announces action and target.

