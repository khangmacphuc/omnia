# Performance evidence plan — September 9, 2026

Status: **instrumentation slice only; runtime performance is not verified**  
Scope: renderer startup/bundle shape, chat-first interaction, long-content
responsiveness, and Windows desktop endurance  
Source snapshot: current Omnia working tree on September 9, 2026

## Executive result

The static bundle gate is green for this snapshot:

```text
entry JavaScript: 486,822 B / 500,000 B
total JavaScript: 597,448 B / 921,600 B
required dynamic entries: 8/8
largest async chunk: 34,196 B
legacy screens monolith: absent
chat conversation view: eager
```

The entry chunk has only about 13 KB of headroom before the current 500,000 B
raw-byte limit. The eager chat path still includes the Markdown parser family
(`micromark`, `micromark-core-commonmark`, and GFM modules).
This is not a violation: Markdown rendering is part of the chat-first path.
However, future Mermaid, graph, Office, PDF, media, and editor features must
remain behind intentional lazy boundaries and must not be pulled into startup.

No runtime performance target has a same-snapshot receipt yet. In particular,
this audit does **not** prove cold launch, warm interactive shell, first usable
chat, 200,000-character composer responsiveness, 5,000-message virtualization,
streaming frame cadence, memory/endurance, or packaged Tauri/WebView2 behavior.

## What is now available

`npm run perf:evidence` invokes `scripts/perf-evidence.mjs`. The script is an
evidence formatter and gate, not a benchmark generator:

- a platform-specific runner supplies measured samples;
- the script validates finite non-negative millisecond samples;
- p50 and nearest-rank p95 are computed deterministically;
- missing metrics stay `not-measured`;
- threshold failures are reported as `fail`;
- `--require-complete` turns missing target metrics/metadata into a failing
  incomplete receipt;
- an optional `--output` writes a JSON receipt for review and archival.

Example fixture shape:

```json
{
  "metadata": {
    "fixtureVersion": "perf-fixture-2026-09-09.v1",
    "measurementDate": "2026-09-09",
    "buildMode": "production",
    "gitRevision": "<immutable-source-revision>",
    "host": {
      "os": "Windows 11",
      "cpu": "<record-exact-cpu>",
      "ramGiB": 32,
      "displayHz": 60
    },
    "warmupIterationsDiscarded": 3
  },
  "metrics": {
    "warmInteractiveShellMs": [1200, 1320, 1410],
    "coldLaunchMs": [2400, 2510, 2740],
    "localSendFeedbackMs": [38, 44, 52],
    "indexedSearch10kMs": [180, 195, 210]
  }
}
```

The numbers above are fixture-shape examples only. They are not Omnia
measurements and must never be copied into a release receipt.

Run it with:

```powershell
npm run perf:evidence -- `
  --input artifacts/performance/windows-11-samples.json `
  --output artifacts/performance/perf-evidence.json `
  --require-complete
```

The generated receipt is valid evidence only when the fixture was collected
from the named source snapshot, build mode, host, and measurement procedure.

## Normative target metrics

These targets come from `docs/PRODUCT_SPEC.md` and `docs/QA_STRATEGY.md`:

| Metric | Target | Required procedure |
|---|---:|---|
| Warm interactive shell | p95 ≤ 1,500 ms | Warm Windows desktop launch with cached app/runtime state; record first usable shell, not process creation alone. |
| Cold launch | p95 ≤ 3,000 ms | Clean app profile or defined cold condition; exclude OS/runtime first-install cost and state the exclusion. |
| Local send feedback | p95 ≤ 100 ms | Measure from accepted local send action to visible local feedback; separate UI acknowledgement from provider TTFT. |
| Indexed search over 10,000 conversations | p95 ≤ 300 ms | Fixed seeded corpus, warmed index, exact query manifest, and explicit index version. |

The product also requires qualitative/perceptual evidence for:

- composer responsiveness at 200,000 characters;
- a 5,000-message thread without rendering the full tree;
- smooth streaming on a 60 Hz-capable display;
- syntax highlighting/artifact rendering not stalling typing or streaming;
- activity switching and lazy-boundary behavior;
- no renderer long-task or event-backlog regression.

Those claims need additional probes and must not be inferred from the four
timing metrics above.

## Required collection matrix

Every retained receipt should identify:

1. immutable source revision or source-manifest hash;
2. Node/npm/Vite/Tauri/WebView2 versions as applicable;
3. build mode and whether the run is browser preview, dev server, unpacked
   production renderer, or packaged Tauri;
4. Windows version, CPU, RAM, display refresh rate, power mode, and background
   load where permitted;
5. fixture version, corpus hash, index version, and warmup/discard policy;
6. sample count, p50, p95, min, max, and raw-sample retention location;
7. memory working set, handles, threads, long tasks, dropped frames, event
   backlog, SQLite/WAL size, and renderer crash/restart counts for endurance
   scenarios;
8. explicit unknowns and unavailable probes.

The browser visual fixture is useful for deterministic rendering checks, but it
is not packaged Windows desktop evidence. Packaged WebView2, native dialogs,
Windows DPI, Narrator, high contrast, IME, multi-monitor recovery, and update
paths remain separate release-candidate lanes.

## Recommended measurement slices

### Startup and first usable chat

- cold and warm process launch;
- app shell ready;
- first activity rail/sidebar usable;
- first conversation surface usable;
- provider initialization completing in the background without blocking shell;
- first local send acknowledgement;
- first visible streamed output and terminal output (provider latency is
  reported separately from renderer latency).

### Long-content stress

- composer input at 10k, 50k, 100k, and 200k characters;
- Markdown, LaTeX, code, ANSI log, and citation-heavy payloads;
- 5,000-message thread with scroll-to-target and jump-to-latest;
- long streaming deltas with render cadence, long-task duration, and dropped
  frame samples;
- huge tool/log output with virtualization and copy/export.

### Endurance and recovery

- multi-hour mock streaming;
- 50 concurrent compare candidates through deterministic local mocks;
- repeated restart/replay and reconnect;
- index rebuild and large import;
- near-limit storage corpus with WAL growth and cleanup;
- renderer reload while a stream is active.

## Claim rules

- A static bundle pass is not a runtime performance pass.
- A browser preview timing is not packaged Tauri/WebView2 timing.
- A median pass does not satisfy a p95 target.
- A sample set without source/build/host metadata is incomplete evidence.
- Missing or failed probes remain explicit; they are not converted to zero or
  success by the harness.
- Synthetic samples may validate the receipt formatter but cannot upgrade
  `docs/IMPLEMENTATION_STATUS.md` or a release verdict.

## Next implementation slice

1. Add a Windows packaged-app runner that emits the fixture format without
   changing product behavior.
2. Add fixed seeded conversation/search/composer corpora and hashes.
3. Add browser `PerformanceObserver` probes for long tasks and event timing.
4. Add Windows process counters for working set, handles, threads, and restart
   recovery.
5. Add a nightly artifact retention policy for raw samples plus the normalized
   receipt.
6. Add this receipt to the release evidence chain only after all four target
   metrics and required qualitative probes are measured on the same snapshot.
