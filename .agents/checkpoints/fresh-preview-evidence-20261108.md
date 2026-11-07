# Fresh preview UI evidence — 2026-11-08

## Scope

Deterministic renderer preview evidence for the unified Omnia shell. The capture uses the local browser mock fixture so the screenshot is reproducible without provider credentials or a packaged Tauri runtime.

## Command and endpoint

```powershell
npm.cmd run build:renderer
node_modules\\.bin\\vite.cmd preview --host 127.0.0.1 --port 4175 --strictPort
```

Open:

```text
http://127.0.0.1:4175/?mock=long
```

For this capture only, the renderer build was produced from a temporary local guard relaxation that allows the explicit `?mock` fixture in a production preview. `src/main.tsx` was restored immediately after capture; normal source behavior remains DEV-only mock installation.

## Observed result

- Build: **pass**, 2099 modules, 46.63 s.
- Browser mock: **active**, scenario `long`.
- Playwright page errors: **0**.
- Rendered UI: populated sessions, transcript, approval card and the three primary modes `Chat`, `Browser`, `IDE` with Settings.
- Screenshot: [`artifacts/ui/omnia-shell-chat-nav-final.png`](../../artifacts/ui/omnia-shell-chat-nav-final.png)
- Viewport: `1440x900`.
- PNG size: `142792` bytes.
- SHA-256: `ABAD9BF5D89A5E0BA0DC9EE1F4325BAA0B528DE7B9E89E2A0D513A1B82FA3935`.

## Boundary

This receipt proves renderer visual behavior against the deterministic mock only. It does not prove packaged Tauri/WebView2 startup, live provider access, native browser/IDE integration, or external network behavior.
