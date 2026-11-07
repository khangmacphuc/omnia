---
id: OMNIA-ULTRA-TWIN-OVERVIEW
title: Project Overview and smart title refresh
status: normative-target
schema: schemas/project-overview.schema.json
---

# Project Overview and smart refresh

Every project has a compact, always-reachable Project Overview above or beside
its work surface. It is a versioned projection of canonical project facts, not
an untraceable summary regenerated after every message.

## Overview surface

Show, according to density and permissions:

- title, optional subtitle, icon and status;
- primary goal, non-goals and current phase;
- active conversation/branch, workspace roots and repository branch/worktree;
- current milestone, next dependency-complete task and blocking decisions;
- latest verified build/test/research evidence and freshness;
- Project Twin revision and stale-node count;
- active machine/runtime, provider/model/effort and context profile;
- budget/cost window, background work, approvals and attention items;
- recent material changes with actor, time and source.

The compact header expands into roadmap, blueprint, task graph, artifacts,
sources, decisions, risks, changes, branches and activity. All fields deep-link
to their evidence.

## Material-change detector

Do not update the overview for every token, cursor move, hover, poll or cosmetic
event. Generate an update candidate when one of these changes materially:

- goal, non-goal, scope or success criterion;
- project/workspace root, repository branch or runtime policy;
- accepted decision, milestone, dependency, owner or task state;
- verified build/test/release evidence;
- authoritative source, citation contradiction or staleness propagation;
- new artifact that changes the project state;
- budget, security or approval condition that changes what can run next.

The update pipeline is:

~~~text
committed facts at fixed watermark
-> deterministic diff and affected graph nodes
-> materiality/urgency classification
-> candidate title/overview patch
-> policy or user approval
-> atomic revision with provenance
-> client projection and staleness propagation
~~~

Use debounce, event coalescing and cost budgets. Learned relevance may rank or
summarize candidates, but deterministic facts, pinned text and authority rules
win.

## Title stability

The initial title may be user-entered or suggested from the goal. Automatic
title changes require a material semantic shift and produce a reversible
candidate diff. Prevent title churn with a confidence threshold, minimum
interval, semantic-distance threshold and stable aliases for search/deep links.

Users can lock the full title, lock a prefix, accept once, always ask, allow
safe automatic changes or disable suggestions. A model never overwrites a
locked or manually edited title. Old titles remain searchable as aliases.

## Provenance and recovery

Each overview revision records source event watermark, graph revision, summary
model/tool/profile when used, prompt/template hash, accepted actor, confidence,
created time, superseded revision and exact changed fields. Unknown or stale
facts are labeled; they are not converted into confident prose.

If generation fails, keep the last verified overview and show stale/failure
state. Manual Refresh creates a new candidate; it does not destroy the prior
revision. Users can compare, restore or pin any previous overview revision.

## Acceptance

- Cosmetic activity does not churn the overview or title.
- Material goal/branch/evidence changes create a deterministic candidate.
- Pinned and user-authored fields survive refresh.
- Every displayed fact deep-links to evidence or is labeled unknown.
- Restore and compare preserve full revision history.
- The overview reconnects from committed events after restart.
