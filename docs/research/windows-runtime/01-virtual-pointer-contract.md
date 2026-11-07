# Virtual pointer contract

Status: proposed contract.

## 1. Design intent

`PointerSession` is a durable Omnia object that describes an agent's logical pointer and action stream. It is not a Windows HID device, not the user's physical cursor, and not a permission grant.

The pointer exists so that a user can answer, at a glance, “which agent is acting, on which target, and where does it intend to act?” The pointer also gives Omnia a stable place to attach hover, click, drag, selection, and replay evidence.

## 2. Canonical object model

```text
PointerSession
  pointer_id: opaque UUID
  owner_run_id: UUID
  owner_agent_id: UUID | null
  target_binding: TargetBinding
  transport: Semantic | BrowserCdp | NativeUia | IsolatedDesktop | Vm | Remote
  coordinate_space: Screen | WindowClient | BrowserViewport | Document | UiaElement | RemoteFrame
  position: { x, y } | null
  target_element: ElementAnchor | null
  containment: ContainmentPolicy
  overlay: OverlayPolicy
  status: Created | Ready | Acting | WaitingObservation | Paused | Yielded | Lost | Closed
  human_priority: YieldOnConflict
  created_at: timestamp
  updated_at: timestamp
  revision: integer
```

`TargetBinding` must include enough identity to reject stale actions:

```text
TargetBinding
  process_id / process_start_time (native targets)
  window_handle / window_generation (native targets)
  browser_browser_context_id
  browser_target_id / session_id
  frame_id / document_epoch
  uia_runtime_id / automation_id (when available)
  remote_device_id / machine_id / machine_generation (remote targets)
  target_scope_hash
```

The binding is revalidated immediately before dispatch. A reused HWND, browser tab, DOM node, or remote machine generation must not receive an action intended for an older target.

## 3. Action lifecycle

Every action is a durable command and an observed fact, not an unlogged imperative:

```text
planned
  -> policy_checked
  -> approval_required | approved | denied
  -> target_bound
  -> dispatched
  -> acknowledged | rejected | timed_out | interrupted
  -> observed
  -> verified | outcome_unknown | failed
```

The following are separate records:

- `PointerIntent`: semantic goal, for example “invoke Save” or “hover the third result”.
- `PointerDispatch`: concrete transport call and target binding.
- `PointerObservation`: UIA state, DOM snapshot, browser event, screenshot, or app response after dispatch.
- `PointerVerification`: deterministic predicate that says whether the intended state was reached.

An action that dispatched successfully but cannot be observed is `outcome_unknown`, not `verified`.

## 4. Action types

Support these typed actions:

- `move_to_element` — semantic target preferred; coordinate fallback only when explicitly permitted.
- `hover_element` — no side effect expectation beyond hover state.
- `click_element` — semantic invoke preferred.
- `click_coordinate` — high-risk fallback; requires target-local coordinate space and stronger evidence.
- `double_click`, `right_click`, `middle_click`.
- `drag_element` and `drag_path`.
- `scroll_element`, `scroll_viewport`.
- `type_text`, `key_chord`, `press_key`.
- `select_text`, `select_range`.
- `focus_element` — semantic focus only; it must not steal the user's physical input focus unless approved.
- `invoke`, `toggle`, `expand`, `collapse`, `select_option`, `set_value`.
- `screenshot`, `snapshot_dom`, `snapshot_accessibility_tree`.
- `yield_to_human`, `pause`, `resume`, `stop`.

## 5. Coordinate and anchor rules

Coordinate transforms must be explicit and versioned:

```text
semantic element
  -> document coordinates
  -> browser viewport coordinates
  -> target client coordinates
  -> isolated/remote frame coordinates
```

Each transform records:

- source coordinate space;
- destination coordinate space;
- viewport size and device scale factor;
- scroll offsets;
- browser zoom;
- window bounds and DPI;
- capture frame ID and timestamp;
- transform revision.

Never replay a screen coordinate from an old frame without revalidation. Prefer an element anchor containing role, accessible name, selector/automation ID, bounding box, and a semantic fingerprint. If the anchor no longer resolves, pause and request rebind rather than clicking a nearby element.

## 6. Physical-user precedence

The user owns the physical pointer and keyboard at all times:

- Omnia does not call `SetCursorPos` or system-wide `SendInput` for ordinary computer-use actions.
- A global emergency stop pauses every active pointer session.
- Activity in the same target window, browser tab, or remote surface causes a `human_interference` event and a configurable yield policy (`pause`, `queue`, `ask`, or `continue_semantic_only`).
- A user action never silently gets overwritten by an agent action.
- Destructive actions remain approval-gated even when the target is isolated.

## 7. Overlay and icon behavior

The pointer overlay is rendered by Omnia, not injected into arbitrary target processes by default:

- cyan/blue ring with a low-frequency pulse;
- optional label such as `Agent: BrowserResearch`;
- optional motion trail and click ripple;
- target-local bounding box and semantic-name tooltip;
- different hue/pattern per concurrently visible agent;
- monochrome/high-contrast fallback;
- `prefers-reduced-motion` equivalent for Windows accessibility settings;
- no animation when offscreen or when the user hides activity overlays.

The overlay must state its provenance (`planned`, `dispatching`, `observed`, `verified`) so the user cannot confuse intention with a completed click.

## 8. Dry-run and rehearsal

Every transport supports a dry-run where Omnia renders the pointer path, target element, expected side effect, and verification predicate without dispatching the action. Ultra workflows should rehearse risky multi-step sequences before requesting approval.

## 9. UI acceptance examples

- Opening a background-task inspector shows the current pointer, target window, action, frame timestamp, and verification status.
- Closing the inspector removes the overlay from the Omnia preview but does not cancel the action unless the user presses Stop.
- Clicking outside a modal pointer inspector dismisses it when safe; a destructive approval dialog stays open.
- The physical cursor position before and after a semantic or isolated action is identical in a host-session invariant test.

