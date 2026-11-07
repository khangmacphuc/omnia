---
id: OMNIA-ULTRA-INT-JUMP
title: Jump prompt and prompt navigation
status: normative-target
schema: schemas/conversation-navigation.schema.json
---

# Jump prompt

Jump Prompt is a typed navigation system, not merely text search.

## Targets

The user can jump to:

- any user prompt;
- any assistant response;
- any message revision;
- first/last message;
- next/previous prompt;
- next/previous error;
- next/previous retry;
- next/previous branch point;
- next/previous tool call;
- next/previous agent;
- next/previous source/citation;
- next/previous artifact;
- active request;
- active provider attempt;
- first visible output;
- latest output;
- unread update;
- selected code line;
- PDF page/region;
- spreadsheet range;
- slide;
- audio/video timestamp;
- goal, plan, task or milestone event;
- a prompt matching model/provider/effort/date/status/tag.

## Navigation UI

- Jump-to command palette.
- Search bar with typed filters.
- Transcript minimap with prompt, branch, error, source and task markers.
- Prompt timeline.
- Breadcrumb from current message to branch/root/run/attempt.
- Previous/next history stack like browser back/forward.
- Bookmarks and named anchors.
- Deep links that encode stable conversation/branch/message/selection IDs.
- Jump to latest button when the user scrolled away.
- Search result labels which branch is hidden or inactive.
- Preserve scroll anchor and briefly highlight the destination.
- Open request inspector at the corresponding attempt and timeline timestamp.

## Keyboard and accessibility

- Next prompt, previous prompt, next error and jump latest shortcuts.
- Search by voice and screen reader.
- Focus returns to the destination message.
- Screen reader announces target type and ancestry.
- Touch uses a timeline/minimap without requiring hover.

## Jump provenance

A JumpTarget records target kind, stable IDs, source revision, selection span,
query/filter, created time, client and whether the target is stale. Deleted or
superseded targets show a recovery state, never an unrelated message.

