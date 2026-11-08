# Narrow preview UI QA

Reviewer: `/root/ui_qa_narrow_accessibility`  
As of: 2026-11-08  
Scope: current original renderer in the active publish worktree, fresh local Vite preview at `http://127.0.0.1:1431/`, Chromium headless, 800 × 600 CSS pixels, reduced motion, disposable browser context. No native API or provider fixture was injected.

## Result

**Passed with findings. No product completion claim.** Five rendered screens were inspected, with 129 control observations across the screens, 45 Tab steps in the main shell and 45 Tab steps while Settings was open. Five full-page captures, accessibility snapshots, bounds, center hit tests, source hashes and axe results are included in the JSON receipt.

| Screen | Control observations | axe violations | Composer visible | Document geometry |
| --- | ---: | ---: | --- | --- |
| Chat / dark | 18 | 0 | yes | 800 × 600 |
| Chat / light | 18 | 0 | yes | 800 × 600 |
| Browser / light shell | 31 | 1 critical | no | 800 × 600 |
| IDE / light shell | 21 | 0 | no | 800 × 600 |
| Settings / light | 41 | 1 serious, six nodes | underlying Chat only | 800 × 600 |

The control count includes controls hidden by the responsive layout or an overlay. The receipt records `shown` and `centerExposed` individually so the count cannot be misread as an accessibility pass.

## Verified behavior

- The page did not overflow the 800 × 600 document bounds on the five inspected screens.
- Chat dark and light passed the selected axe WCAG A/AA tags for their inspected empty state.
- `Alt+3` changed the selected surface to IDE; `Alt+1` returned to Chat.
- Theme switching changed the active shell to light, and the selection persisted after reload in this disposable context.
- No page errors or failed network requests were observed during this flow.
- Browser and IDE retained the session list and the same selected session label.

## Findings requiring changes and a rerun

1. **Browser and IDE lose the companion composer at 800px.** The companion remains in the DOM with `display: none`, and `composerVisible` is false. The media query at `max-width: 1100px` hides `.rb-companion-chat` without a replacement route or reveal control. This does not meet the shared chat behavior at the specified minimum width.
2. **Settings focus escapes its modal.** Opening the `aria-modal` dialog leaves focus on the underlying shell. During the 45-step sample, 23 focus steps were outside Settings. Escape left the dialog open. Add initial focus, containment, focus restoration and Escape behavior, then rerun the same flow.
3. **Settings section tabs are obscured.** Runtime, Workflow, Tools & RAG, Privacy and Appearance have nonzero boxes around y=166–189, but all five center hit tests are false. The capture shows that the body covers the tab strip. Document size alone failed to detect this issue. Fix the grid rows/minimum track sizing and verify both pointer and keyboard section changes.
4. **Light Settings fields fail contrast.** Six nodes use text `#17212b` over fallback background `#0a1118`, producing **1.16:1**, below the normal text requirement of **4.5:1**. Targets: `.settings-search`, `.settings-control`, `.settings-select`, `Compact context tokens`, `Tool output truncation`, and `Initial retry delay (seconds)`. `--rb-bg` is not defined by the root theme, so the dark fallback remains active in light mode.
5. **Browser tablist has an invalid child.** axe reports `aria-required-children` on `.rb-browser__tabs`, because the ordinary Add tab button is inside `role=tablist`. Move the action out of the tablist or give the structure appropriate semantics, then rerun axe and keyboard tab navigation.

Browser and IDE currently retain dark local chrome inside a light shell. This is visible in the captures and should be reviewed for the intended theme contract; it was not counted as an additional axe violation.

## Evidence

- `docs/rebuild/receipts/ui-qa-narrow-accessibility-20261108.json`
- `docs/rebuild/receipts/ui-qa-narrow-accessibility-20261108.sha256`
- `docs/rebuild/receipts/ui-qa-800x600-dark.png`
- `docs/rebuild/receipts/ui-qa-800x600-light.png`
- `docs/rebuild/receipts/ui-qa-800x600-browser-light.png`
- `docs/rebuild/receipts/ui-qa-800x600-ide-light.png`
- `docs/rebuild/receipts/ui-qa-800x600-settings-light.png`

Receipt SHA-256 after the final run: `af1ebabf1dadef83db0287216fb81cba0fc31cb7852a366290e6cbfc0b39b0de`.

## Reproduction and boundaries

Started the preview with `npm.cmd run preview:fast -- --port 1431`. Executed `node .omnia-ui-qa-final-temp.mjs`, exit 0, with assertion results recorded as findings rather than suppressed. The exact executed source is embedded as `scriptSource` in the receipt, with `scriptSha256`; it can be restored to that temporary filename to reproduce the run. Temporary runner files were removed after the evidence was generated.

This is preview evidence. It does not prove packaged Tauri, native Windows accessibility/UIA, native WebView2 capture, provider execution, native persistence, RAG, project pointer storage, OS automation, download lifecycle or plugin mutations. No DoD status was changed by this reviewer. No product source was changed.
