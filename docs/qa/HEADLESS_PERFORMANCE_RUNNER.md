# Headless renderer performance runner

The bounded Playwright runner records renderer measurements from Omnia's local
visual fixtures. It supplies the missing collection side of the existing
`perf:evidence` workflow without treating synthetic values as desktop evidence.

## Run

Start a production renderer preview in one terminal:

```powershell
npm.cmd run build:renderer
npm.cmd run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

Then collect four concurrent page samples in another terminal:

```powershell
npm.cmd run perf:headless -- --base-url http://127.0.0.1:4173/ --pages 4 --duration-ms 5000 --interval-ms 250 --scenarios chat:populated,home:populated,projects:populated,settings:populated --output artifacts/performance/headless-receipt.json
```

The runner uses one isolated browser context per page and closes every context
and the browser on completion. It accepts only credential-free loopback HTTP
URLs. Requests outside the supplied origin are blocked and recorded as failures.
The runner does not use the user's browser profile or provider credentials.

`--pages` is clamped to 1–8, `--duration-ms` to 500–60,000, and `--interval-ms`
to 50–5,000. These limits bound CI resource consumption. Requested scenarios are
assigned to the concurrent pages in order; `metadata.measuredScenarios` records
the scenarios that actually produced samples.

## Receipt

The `omnia.performance-headless.v1` receipt includes raw samples, per-page heap
observations, runtime errors, blocked external requests, and nearest-rank
p50/p95/min/max summaries for:

- Visual fixture page readiness, once per page.
- JavaScript heap used, from Chromium DevTools Protocol.
- DOM nodes.
- Long task count and cumulative duration, where PerformanceObserver supports it.
- The p95 animation-frame gap within the bounded observation window.
- Resource transfer bytes.
- CDP main-thread task, script and layout duration counters.

Only page readiness has a 3,000 ms threshold. The other counters are observations
with `observed` status until a hardware- and workload-specific target is defined.
Missing measurements have `not-measured` status. Runtime errors, blocked external
requests, or readiness threshold failures cause a nonzero exit code.

Heap deltas include ordinary garbage collection; they do not prove or disprove a
memory leak. Task duration counters are renderer work measurements, not OS CPU
percentages. Frame cadence in headless Chromium is not display/GPU performance.

This receipt does not prove Tauri/WebView2, native working set, GPU, provider,
Windows clean-VM, cold/warm desktop launch, or long-term endurance performance.
Those remain separate measurements in the completion ledger.

## Deterministic contract tests

```powershell
npm.cmd run test:perf-headless
```

The tests cover nearest-rank statistics, bounded options, origin and credential
rejection, scenario validation, missing metrics, external-request failure,
threshold failure, raw-sample retention, and per-page heap observations.
