# Advanced design ideas for Omnia's window and pointer plane

Status: exploratory backlog. Ideas become requirements only after a threat review, measurable acceptance criteria, and an accepted ADR.

## 1. Window Twin

Create a per-target “Window Twin” alongside the Project Twin:

- target identity and generation;
- semantic tree snapshot;
- visual frame history;
- supported action patterns;
- focus/foreground/minimized history;
- DPI/coordinate transforms;
- capture restrictions;
- known flaky controls;
- successful and failed adapters;
- human-interference events;
- last verified state.

The Window Twin lets the planner answer “can this target be operated safely without the physical mouse?” before dispatching an action.

## 2. Intent versus execution overlay

Render two layers:

- `intent`: where the planner expects to act;
- `execution`: where the transport actually dispatched;
- `verification`: whether the expected postcondition was observed.

When the three differ, show a small explanation instead of silently moving the pointer. This makes coordinate drift, browser reflow, and stale UIA anchors easy to debug.

## 3. Semantic hover cards

Hovering the cyan pointer or an outlined element can open a compact inspector containing:

- accessible role/name;
- DOM selector or UIA automation ID;
- bounding box and coordinate space;
- current value/state;
- target app/process/tab;
- action affordances;
- confidence and freshness;
- “ask Omnia about this element”;
- “copy selector/automation path”;
- “create task from this element”.

Hover cards must be keyboard accessible, dismissible by outside click when safe, and suppressed when they would obstruct a high-risk action.

## 4. Semantic pointer snapping

For visual previews only, snap the pointer halo to the nearest eligible semantic element and show the actual bounding box. Never alter a target-local coordinate dispatch merely to make the overlay look cleaner. If snapping confidence is low, use a neutral crosshair and request a rebind.

## 5. Target-specific input lease

Use a short, expiring lease per target surface:

- one active writer action at a time;
- read-only DOM/UIA observations may run in parallel;
- human activity revokes or pauses the lease according to policy;
- lease is bound to target generation and machine generation;
- lease expiration never replays an unverified side effect.

This is narrower and safer than a global “computer-use lock”.

## 6. Safe-coordinate fallback

If semantic control is unavailable, a coordinate action must include:

- a fresh frame;
- an element region and visual fingerprint;
- a target-local coordinate transform;
- a bounded click region;
- a predicted postcondition;
- a risk classification;
- exact approval.

If the visual fingerprint changes or the click region contains multiple plausible controls, pause instead of guessing.

## 7. Frame freshness budget

Every workflow sets a maximum acceptable frame age per action class:

- hover/scroll: short but tolerant;
- text entry: semantic snapshot preferred;
- destructive click: near-current frame plus semantic confirmation;
- drag/drop: continuous frame stream;
- visual QA: deterministic frame ID and screenshot artifact.

The UI should show a freshness ring or age label rather than a binary “connected” badge.

## 8. Pointer replay and “why did it click?”

For every action, provide a replay view:

1. source frame/DOM/UIA snapshot;
2. candidate elements and rejected candidates;
3. selected anchor and confidence;
4. pointer path/overlay;
5. dispatch call;
6. observed state;
7. verification predicate.

This is especially useful for research, debugging, and user corrections. Replays are dry-run by default and require a new approval to redispatch.

## 9. Multi-agent pointer lanes

When multiple agents inspect one screen:

- each pointer has a role icon and color/pattern;
- read-only observation lanes can run in parallel;
- writer lanes serialize through a target lease;
- conflicts appear as a graph, not as overlapping animations;
- the user can mute, pin, or follow one lane;
- offscreen agents use a compact activity list instead of rendering hundreds of cursors.

## 10. Window health and adapter learning

Track a target-specific health profile:

- UIA coverage;
- DOM/AX availability;
- capture FPS;
- stale-anchor rate;
- action verification rate;
- minimized behavior;
- focus side effects;
- latency;
- protected-surface frequency.

The router can learn which adapter works best for this application version, but learned routing cannot widen policy or bypass an approval.

## 11. User takeover choreography

When user takeover is needed:

- pause at a safe boundary;
- show the exact reason;
- highlight the target region;
- give a single Resume button/voice command;
- keep the transcript, frame, and pending plan visible;
- revalidate the target after the user acts;
- mark any changed state as a new revision.

The user should never need to guess whether Omnia is waiting for a login, CAPTCHA, permission dialog, or a stale element.

## 12. Capture-source recipes

Treat screen/audio capture as a typed recipe:

```text
CaptureRecipe
  source_kind: window | process | tab | display | region | vm | audio_session
  source_identity
  include_video
  include_audio
  frame_rate
  bitrate
  codec
  masks
  retention
  remote_stream_policy
```

Recipes can be saved as skills/templates but remain subject to per-session approval and source availability.

## 13. Action quality feedback

After a task, the user can mark:

- correct target;
- wrong target;
- too slow;
- too many confirmations;
- visual evidence insufficient;
- should have used a different adapter;
- should have yielded to the user;
- should have requested a screenshot;
- should have used a virtual machine.

These labels feed adapter evaluation and routing experiments without recording raw system-wide keystrokes.

## 14. Debugging without stealing the desktop

Offer a “shadow mode” that performs all planning, target resolution, transforms, and verification preparation, but never dispatches an input event. The user sees the cyan pointer, expected click, and predicted outcome while continuing normal work. Shadow mode is useful for onboarding a new app adapter and for reproducing a bug safely.

## 15. Release-minded implementation order

1. Pointer/session schema and physical-pointer invariant.
2. Browser CDP semantic path.
3. Native UIA read/invoke path.
4. Target-local overlay and inspector.
5. Freshness/transform/evidence receipts.
6. Human takeover and emergency stop.
7. Isolated VM graphical path.
8. Virtual-display provider only after driver/security review.
9. Optional compatibility transports behind explicit feature flags.

