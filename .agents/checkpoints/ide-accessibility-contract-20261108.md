# IDE accessibility contract — 2026-11-08

## Scope

This receipt covers renderer accessibility wiring for the project IDE preview
and the native editor shell's More panels disclosure. It does not claim that
the embedded VS Code/WebView2 surface has been verified on a packaged desktop
runtime.

## Changes

- The project preview's open-file tab now owns a stable id and points to a
  focusable `tabpanel` with reciprocal `aria-labelledby`/`aria-controls`.
- Opening editor preview settings moves focus to the first checkbox, while
  Escape still closes the dialog and restores focus to its trigger.
- Decorative file icons and unsaved markers are kept out of the primary name
  while the marker retains an accessible change label.
- The native editor shell's More panels trigger now exposes a stable
  `aria-controls` reference to the disclosure group.

## Verification

```text
npm.cmd exec vitest -- run src/features/workspace/project-ide-preview.test.tsx \
  --pool=threads --poolOptions.threads.singleThread=true --reporter=dot
PASS — 1 file, 6 tests

npm.cmd exec vitest -- run src/features/workspace/sovereign-ide-remote-workbench.test.tsx \
  -t "starts with only the file tree" \
  --pool=threads --poolOptions.threads.singleThread=true --reporter=dot
PASS — 1 test (38 skipped by name filter)

git diff --check
PASS
```

The receipt is renderer evidence only. Screen reader behavior, native child
editor focus bridging, WebView2 zoom/DPI behavior, and packaged runtime
resize coverage remain outside this run.
