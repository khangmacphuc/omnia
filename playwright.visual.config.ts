import { defineConfig, devices } from "@playwright/test";

const visualPort = Number.parseInt(process.env.OMNIA_VISUAL_PORT ?? "4173", 10);
const visualBaseUrl = process.env.OMNIA_VISUAL_BASE_URL ?? `http://127.0.0.1:${visualPort}`;
const updateSnapshots = process.env.OMNIA_VISUAL_UPDATE === "1" ? "all" : "missing";

export default defineConfig({
  testDir: "./tests/visual",
  outputDir: "artifacts/visual/test-results",
  snapshotDir: "./tests/visual/__screenshots__",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  // Fixture-contract specs intentionally traverse every screen/state/overlay.
  // Keep enough budget for cold Vite startup and deterministic font/layout
  // settling on slower Windows CI hosts; assertions retain their 10s budget.
  timeout: 120_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      scale: "css",
      maxDiffPixelRatio: 0.003,
      threshold: 0.2,
    },
  },
  reporter: process.env.CI
    ? [
        ["line"],
        ["html", { outputFolder: "artifacts/visual/report", open: "never" }],
        ["junit", { outputFile: "artifacts/visual/junit.xml" }],
      ]
    : [
        ["list"],
        ["html", { outputFolder: "artifacts/visual/report", open: "never" }],
      ],
  quiet: false,
  updateSnapshots,
  use: {
    baseURL: visualBaseUrl,
    ...devices["Desktop Chrome"],
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    locale: "en-US",
    timezoneId: "Asia/Ho_Chi_Minh",
    serviceWorkers: "block",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  webServer: process.env.OMNIA_VISUAL_BASE_URL
    ? undefined
    : {
        // Build once and serve immutable assets. The visual fixture imports the
        // workspace graph; running it against Vite's transform-on-demand dev
        // server can spend minutes compiling the same graph per worker on
        // Windows. Preview keeps page.goto deterministic and bounded.
        command: `npm run build:renderer && npm run preview -- --host 127.0.0.1 --port ${visualPort} --strictPort`,
        url: `${visualBaseUrl}/__visual`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        stdout: "pipe",
        stderr: "pipe",
      },
  snapshotPathTemplate: "{snapshotDir}/{testFilePath}/{arg}-{projectName}-{platform}{ext}",
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
