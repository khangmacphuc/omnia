---
id: OMNIA-DELIVERY-FAST-PREVIEW
title: Fast Omnia preview workflow
status: informational
---

# Fast Omnia preview workflow

The browser preview is the fastest feedback loop for the current UI-first phase:

```powershell
npm.cmd run preview:fast
```

The launcher checks `http://127.0.0.1:1420/` first. If that URL already serves Omnia, it reuses the running server; otherwise it starts Vite and waits for an HTTP-ready page. Editing a renderer file is picked up by Vite without rebuilding a packaged executable. Use `npm.cmd run preview:fast:open` when you want the operating system to open the URL automatically.

For the lower-level Vite command (which always attempts to bind the fixed port), use:

```powershell
npm.cmd run dev:fast
```

For a quick syntax/type gate without the full project build:

```powershell
npm.cmd run typecheck:app
```

For a one-shot HTTP smoke probe of the already-running preview (no browser
automation and no screenshot):

```powershell
npm.cmd run smoke:preview
```

The probe checks the fixed preview URL, an HTTP-success response, and an
Omnia marker in the HTML. It does not prove native Tauri, Rust, provider, or
filesystem behavior.

For a production renderer bundle (still not evidence of Tauri/Rust runtime):

```powershell
npm.cmd run build:renderer
```

Renderer builds omit source maps by default to keep the UI-first loop light.
When a bundle attribution or debug receipt needs them, opt in for that build:

```powershell
$env:OMNIA_BUILD_SOURCEMAP = "true"
npm.cmd run build:renderer
Remove-Item Env:OMNIA_BUILD_SOURCEMAP
```

`npm.cmd run build` remains the broader TypeScript-plus-Vite check. Native Tauri packaging is a separate step and is not assumed to be available when the Rust toolchain is absent.
