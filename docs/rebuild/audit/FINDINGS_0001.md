# Independent findings — rebuild-0001

Reviewed: 2026-11-08 04:10 Asia/Bangkok  
Reviewer: `/root/rebuild_independent_audit`  
Status: open pending new renderer integration

## Findings

### F-001 — New renderer graph has not been integrated

`src/main.tsx` currently dynamically imports the historical `./App`, which in
turn imports `@/agent/agent-shell` and legacy token/base CSS. The requested
clean-room renderer is not present yet. This is a blocker for every new UI
criterion, not a failure to be hidden by preview screenshots.

**Resolution:** root replaces the entry graph with `src/rebuild` modules, runs
the architecture audit, and records a packaged/native receipt separately.

### F-002 — Existing historical source contains prohibited live editor iframe

The old tree contains `real-vscode-workbench-iframe` and embedded artifact
iframes. These observations are retained as a boundary test. They cannot be
counted as evidence for the new product and must not be imported by it.

**Resolution:** independent test scans only the new graph and fails if the new
source introduces an iframe or external editor endpoint.

### F-003 — Canonical rebuild DoD and source register are not yet available

`docs/rebuild/GOAL.md`, `SPEC.md`, `DOD.json`, and `SOURCE_REGISTER.json` are
required resume artifacts but were absent during this pass. Without them a
future agent cannot prove requirement coverage after context compaction.

**Resolution:** governance and research owners create these files and rerun the
gate. Do not call the current checkpoint complete.

### F-004 — Non-project and per-session hot settings are unverified

The new chat/settings modules do not exist at this pass. The historical
`CreateSessionInput` requires a `cwd` field, so relaxing the renderer gate
without checking native semantics could create a project by accident.

**Resolution:** inspect and test the native contract; represent non-project as
an explicit scope or supported sentinel, never a random recent folder. Verify
per-session model/effort persistence and native settings revisions.

## Reviewer conclusion

No new UI or harness criterion is Done in this audit pass. The findings are
actionable and will be re-run after the assigned slices and governance files
arrive. A green source-boundary test alone will not prove native persistence,
permissions, browser/IDE runtime behavior, RAG, or live providers.

## Incremental source observation — reference workbench

### F-005 — Closing the observation reselects the first item

The first implementation computes `selected` as the matching observation or the
first observation. The Close handler sets `selectedId` to an empty string, which
immediately takes that fallback, so the detail panel cannot close. This is a
behavioral defect, not a visual preference.

**Proof:** independent RTL test `tests/rebuild-reference-independent.test.tsx`
requires the complementary panel to disappear after Close and reopen on row
selection. At this write, the referenced CSS file has not arrived, so execution
is pending instead of being presented as a passed test.

**Resolution:** represent no selection explicitly. The author was notified;
the auditor has not modified product code.

### F-006 — Historical renderer is still reachable from `src/main.tsx`

The graph audit now resolves local imports transitively and reports the current
`src/main.tsx → App → AgentShell` graph, including legacy styles, `src/agent`,
`src/features/workspace`, and the embedded VS Code surface. This is expected
during the migration but is a hard blocker for the clean-room criterion.

**Proof:** `node --test tests/rebuild-independent-audit.test.mjs` currently
passes the source-only checks but fails the entry-graph check with the legacy
paths listed in the output. The failure is valuable evidence; do not suppress it
by allowing legacy roots in the permitted list.

**Resolution:** root replaces the application entry graph with the original
`src/rebuild` shell and then reruns this audit. Native protocol/domain imports
must be allowlisted narrowly and reviewed separately.

### F-007 — Ask-user controls do not submit an answer

`src/rebuild/chat/chat-view.tsx` renders option buttons and a free-text input for
each question, but the buttons have no click handler and the input has no state
or submit action. `ChatController` exposes no answer/resolve command. The UI can
display an ask-user event but cannot complete the workflow, so this criterion is
not Done.

**Resolution:** add a typed answer action tied to the native request/question ID,
support recommended option ordering and free text, persist/clear pending state,
handle denied/canceled responses, and add positive/negative/reload tests with a
native receipt. A visible control without an observable consequence is not proof.

### F-008 — Project attachment is a text shortcut, not a permissioned picker

The Attach project action seeds the input with the literal `C:/workspace` and
passes arbitrary text to `agent_session_create`. There is no native folder
picker, path validation, workspace trust/permission receipt, multi-root pointer
storage or file-specific attach path in the new slice. This is acceptable as a
clearly labeled scaffold only; it cannot satisfy project/pointer storage.

**Resolution:** use the native dialog/pointer contract, validate and canonicalize
roots, show permission/trust state, persist stable pointer identity and test
rename/update/delete fallback. Keep the shortcut disabled or visibly marked
unavailable until the contract exists.

### F-009 — Settings schema omits the required `ultra` effort

`src/rebuild/settings/settings.ts` defines `ReasoningEffort` as
`none|minimal|low|medium|high|xhigh|max`; `ultra` is absent even though the
product spec defines it as highest supported effort plus dynamic workflow. The
chat view offers `ultra`, so settings and session controls disagree.

**Resolution:** include `ultra` in the canonical settings schema/normalizer,
round-trip/export/import tests and native capability negotiation. `ultra` must
remain a workflow policy rather than an unsupported provider value.

### F-010 — Cross-tab settings hot reload is not durable on the receiver

The BroadcastChannel receiver calls `notify(..., false)`, which updates the
current tab but does not write the normalized incoming snapshot to localStorage.
After a reload, the receiver can revert to the older persisted settings. This
is an observable persistence gap for the stated hot-reload contract.

**Resolution:** define revision/last-writer semantics and persist accepted remote
updates (or explicitly document an ephemeral receiver with a test proving the
chosen behavior). Add two-window reload and conflict tests; do not claim durable
hot reload from a single subscription test.

## Independent follow-up — 2026-11-08 11:30 Asia/Bangkok

The entries above are historical observations. Current source and behavior
supersede several of them. The clean-room entry graph, native absence labels,
reference close behavior, ask-user action path, project path validation, ultra
schema and revisioned receiver persistence are now implemented at renderer level.
These fixes do not establish native/live/packaged acceptance.

`REVIEW_UI_SETTINGS_20261108.json` is the current scoped review. Its previous
UI-007 text claimed the companion ChatView was absent despite hashing the current
source. That was a stale review assertion. Direct source re-reading and the live
1440×900 capture prove the selected session and composer exist in Browser and
IDE, and retain the draft. The corrected finding concerns the compact layout.

### F-011 — Compact Browser and IDE hide the shared composer

**Priority:** P1. **Criteria:** UI-007, UI-015.

At 800×600, `.rb-companion-chat` is `display:none` under the `max-width:1100px`
rule. Both workspaces lose their composer, and there is no toggle or drawer to
restore it in the current shell. The 1440×900 companion works and retains the
same draft across surfaces.

**Resolution:** expose a compact companion toggle/drawer or a layout that keeps
the critical composer reachable at the supported minimum width. Preserve the
same controller and focus restoration. Rerun the 800px interaction audit.

### F-012 — Settings section tabs are clipped and inaccessible at 800px

**Priority:** P1. **Criteria:** UI-014, UI-015, ADVSET-010.

The panel has five children (header, toolbar, tabs, body, footer), but
`grid-template-rows` has four tracks. The tab row measures 3.34px at 1440×900 and
1px at 800×600. The initial screenshots visibly crop the tabs. At 800px all five
unforced Playwright section-tab hit tests time out; the toolbar/tabpanel
intercepts pointer events.

**Resolution:** give header/toolbar/tabs/body/footer explicit tracks with a
bounded `minmax(0,1fr)` scrolling body. Verify the initial tab row is visible and
each section can be opened by pointer and keyboard at both widths.

### F-013 — Light theme has failed contrast

**Priority:** P1. **Criteria:** UI-009, UI-013.

Axe reports a 1.16:1 ratio for settings text `#17212b` on the hardcoded fallback
field background `#0a1118`. The root defines `--rb-canvas`, while Settings uses
undefined `--rb-bg` and therefore falls back to a dark color in light theme.
Enabled primary actions use `#071411` on light accent `#087f73`, ratio 3.84:1.
The required normal-text ratio is at least 4.5:1.

**Resolution:** use theme-aware field and on-accent tokens, then run axe for both
themes and enabled action states. A disabled empty Send button alone does not
exercise the enabled contrast case.

### F-014 — Settings dialog lacks keyboard lifecycle

**Priority:** P1. **Criteria:** UI-013, UI-014.

Opening Settings leaves focus on the background origin. Reverse Tab from Search
passes through Close into background chat controls. Escape leaves the dialog
open. Closing via the button leaves focus on `body`, not the origin. Primary
navigation focus itself passes when keyboard modality is established before the
measurement; an earlier programmatic-focus probe after mouse input was excluded
as a test-harness false positive.

**Resolution:** implement initial focus, contained Tab/Shift+Tab, Escape, and
origin restoration. Keep background controls inert while the modal is open.

### F-015 — Browser tablist has an invalid child

**Priority:** P1. **Criteria:** UI-008, UI-009, UI-014.

`role=tablist` contains the New browser tab action without an allowed tab role.
Axe reports critical `aria-required-children` in both themes and viewport sizes.
The action is a button and should be adjacent to the tablist, or the list should
use a different semantic grouping that preserves tab behavior.

**Resolution:** correct the semantic structure, implement tab keyboard semantics,
then rerun axe. Do not suppress the rule.

### F-016 — Browser tab geometry is 32px rather than 36px

**Priority:** P2. **Criterion:** UI-012.

The live computed geometry proves the 48px header and 240px desktop session
sidebar. Browser tabs measure 32px, while the canonical DoD requires 36px tabs.
Populated session/file-tab geometry remains outside this empty-state audit.

**Resolution:** implement and measure the required tab target, or obtain an
explicit human spec change. Do not silently lower the criterion.

### Evidence and command result

`node tests/rebuild-ui-browser-independent.mjs` collected 16 live browser states,
129 checks, **92 pass / 37 fail**, exit **1**. The report retains control
inventories, computed geometry/fonts, axe findings, focus trails, source hashes
before and after capture, screenshots and screenshot hashes. Source stability
passed. Report: `docs/rebuild/audit/ui-browser-20261108/report.json`.

This evidence is browser-renderer evidence. It does not prove native WebView2,
provider execution, pointer storage, credential protection, packaged desktop or
permissioned OS behavior. The auditor changed only independent tests and audit
artifacts; root/implementers own the fixes and canonical DoD update.

## F-017 — Current renderer typecheck is blocked by tab test narrowing

**Priority:** P1. **Scope:** verification gate.

The focused renderer suites pass (12 files, 54 tests), the independent boundary
audit passes (6/6), and the architecture guard reports no violations. The app
typecheck still exits 1 because `src/rebuild/browser/browser-workspace.test.tsx`
passes `tabs[1]` and `tabs[0]` from `getAllByRole("tab")` directly to
`fireEvent.keyDown` at lines 49 and 52. Under the current TypeScript settings
those values are `HTMLElement | undefined`, while `fireEvent.keyDown` requires a
concrete event target.

**Resolution:** narrow or assert the tab elements in the test, rerun
`node_modules/.bin/tsc -p tsconfig.app.json --noEmit --pretty false`, and record
the exit code and source hashes in a fresh verification receipt. This is an
implementation/test correction owned by the browser slice; the independent
auditor has not edited product source.

## Current follow-up evidence — 2026-11-08

`node tests/rebuild-ui-browser-independent.mjs` was rerun against the current
source snapshot with stable before/after hashes. It collected **141 checks,
116 passed, 25 failed, 16 state captures**; report hash
`c53587ca6d72676b8fb6f86b149851e200fee3a3db2406db1301beb0d881fa6d`.
Settings section-tab pointer interception and light primary-action contrast
remain open. The compact Browser/IDE companion, modal boundary and Browser
tablist semantics pass in this snapshot. See
`docs/rebuild/audit/REVIEW_UI_SETTINGS_CURRENT_20261108.json` for the scoped
review and claim boundary.

### F-017 resolution update — 2026-11-08

The browser test narrowed the tab elements before dispatch. The app typecheck now
passes (`tsc -p tsconfig.app.json --noEmit --pretty false`, exit 0), so the
strict TypeScript blocker is resolved in the current snapshot. The original
failure remains in the earlier receipt as historical evidence.

## F-018 — Light primary action contrast remains below WCAG AA

**Priority:** P1. **Criteria:** UI-009, UI-013.

The follow-up 1440x900 and 800x600 light Browser/IDE captures still report axe
`color-contrast` for `.rb-primary-button`: foreground `#071411` on accent
`#087f6b`, ratio **3.81:1**. Normal text requires at least **4.5:1**. The
settings field fallback issue is no longer present; this finding is specifically
the enabled primary action pairing.

**Resolution:** choose a light-theme accent/on-accent pair that meets 4.5:1,
then rerun the same axe matrix and retain the computed colors in the receipt.

## F-019 — Chat document overflow probe remains open

**Priority:** P2. **Criterion:** UI-012/UI-015 responsive shell.

The follow-up Chromium matrix has one failure at `1440x900-dark-chat/document-overflow`
with reported `{x:8,y:8}` while all other overflow states pass. This may reflect
an application root/body boundary or a stale page margin, but the check must not
be weakened without identifying the element and preserving the 800x600 matrix.

**Resolution:** inspect the overflowing element and computed root bounds at the
1440x900 Chat state, remove the unintended overflow at source, and rerun all 16
states.

### F-019 confirmation — 2026-11-08

Repeated fresh-context runs reproduce the same pattern: the first Playwright
context created with `reducedMotion: reduce` reports `document.body` margin
`8px`, `document.documentElement.scrollWidth - clientWidth = 8`, and the Chat
shell starts at `(8, 8)`. Later contexts settle to margin `0px` with no overflow.
The dynamic `src/main.tsx` import delays the clean-room stylesheet until after
mount, so the first paint can expose the user-agent margin. The acceptance test
correctly retains this failure. Move the global reset to a synchronous entry or
static document rule and rerun the matrix.

### F-018/F-019 latest confirmation — 2026-11-08

The independent matrix was rerun against a stable source snapshot at 05:23 UTC
(12:23 Asia/Bangkok). It still reports **141 checks, 136 passed, 5 failed**
across 16 captured states. Report SHA-256:
`81b2350470150be73a26a80f17dd9ae41d35f472749ee465595c87bf4957a572`.

The four light Browser/IDE contrast failures remain the same computed pairing
(`.rb-primary-button`, `#071411` on `#087f6b`, `3.81:1`, below the normal-text
4.5:1 threshold). The single Chat overflow failure remains the first
reduced-motion context with body margin 8px and shell origin `(8,8)`; later
contexts settle to zero. Settings section-tab pointer checks remain passing
after the five-track grid correction, and the app typecheck remains exit 0.
These findings are still open until source fixes are captured in a fresh matrix.
