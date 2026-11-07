import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { applyAppearance, readStoredAppearance } from "./design-system/appearance";
import { isVisualFixtureLocation } from "./visual-fixtures/visual-scenario";


const root = document.getElementById("root");

if (!root) {
  throw new Error("The Omnia application root element is missing.");
}

const visualFixture = isVisualFixtureLocation();

if (!visualFixture) {
  applyAppearance(document.documentElement, readStoredAppearance());
}

void (async () => {
  // DEV-only browser mock backend (`?mock=long|empty|error`); Vite drops this branch from production builds.
  let afterMount: (() => void) | undefined;
  // Some browser hosts expose a partial Tauri marker without the callback
  // bridge. Treat that as a browser preview too; checking only for `undefined`
  // leaves the shell trying to call an absent transformCallback and renders a
  // misleading "agent unavailable" state.
  const requestedMock = new URLSearchParams(window.location.search).has("mock");
  // A `?mock` URL is an explicit request for the deterministic browser harness.
  // Honor it even when an embedded host pre-injects a partial Tauri marker: some
  // WebViews expose `__TAURI_INTERNALS__` before the callback bridge is ready,
  // which otherwise races the mock install and produces a misleading startup
  // error (`transformCallback` is undefined). A real desktop session never adds
  // this query parameter, so the override is scoped to the preview harness.
  if (import.meta.env.DEV && !visualFixture && requestedMock) {
    const devMock = await import("./agent/dev-mock");
    const scenario = devMock.parseScenario(window.location.search);
    if (scenario) afterMount = devMock.installDevMock(scenario);
  }

  // Keep the deterministic visual fixture independent from the full product
  // graph. Importing App eagerly makes every visual navigation compile and
  // evaluate the whole agent/workspace surface before the fixture can paint;
  // that turns a local visual check into a several-minute page load under
  // constrained CI. Load exactly one entry graph for the requested surface.
  const Component = visualFixture
    ? (await import("./visual-fixtures/visual-fixture-root")).default
    : (await import("./App")).default;

  createRoot(root).render(
    <StrictMode>
      <Component />
    </StrictMode>,
  );
  afterMount?.();
})();
