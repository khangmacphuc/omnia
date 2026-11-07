import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const workspace = process.cwd();
const configuredDistDirectory = process.env.OMNIA_BUNDLE_DIST ?? "dist";
const distDirectory = path.resolve(workspace, configuredDistDirectory);
const manifestPath = path.join(distDirectory, ".vite", "manifest.json");
const indexPath = path.join(distDirectory, "index.html");

const kib = 1024;
const budgets = Object.freeze({
  // Keep this aligned with Vite's warning boundary and the product startup gate.
  entryJavaScriptBytes: 500_000,
  asyncChunkBytes: 300 * kib,
  // Recalibrated on October 18, 2026 after adding the Sovereign Super-Suite
  // (Browser + F12, Ultra IDM+ Downloader, Built-in Calculator & Verifier,
  // Session DFS Tree, and LTST Knowledge Tree) lazy workbenches while keeping
  // the strict startup-entry (<500 KB) and largest-async-chunk (<300 KiB) gates.
  totalJavaScriptBytes: 5_000 * kib,
});

const expectedActivityEntries = Object.freeze([
  "src/features/workspace/activities/home-screen.tsx",
  "src/features/workspace/activities/projects-screen.tsx",
  // Background Work is a heavyweight agent/harness surface and must stay
  // behind its activity-level dynamic import just like the other screens.
  "src/features/workspace/activities/background-work-screen.tsx",
  "src/features/workspace/activities/library-activity-screen.tsx",
  "src/features/workspace/activities/memory-screen.tsx",
  "src/features/workspace/activities/skills-screen.tsx",
  "src/features/workspace/activities/settings-screen.tsx",
]);

const expectedDynamicEntries = Object.freeze([
  ...expectedActivityEntries,
  "src/features/workspace/command-palette.tsx",
  "src/features/workspace/dialogs.tsx",
  // Markdown/GFM is intentionally fetched when a rendered message or draft
  // preview is opened. Keeping it out of the startup graph protects the
  // shell/chat entry from parser-family regressions.
  "src/features/workspace/markdown.tsx",
  // Citations and conversation actions are optional chat surfaces. They are
  // fetched only when an answer has citations or the user opens actions.
  "src/features/workspace/citation-timeline.tsx",
  "src/features/workspace/conversation-actions-dialog.tsx",
]);

function formatBytes(value) {
  return `${value.toLocaleString("en-US")} B (${(value / kib).toFixed(2)} KiB)`;
}

function normalizeAssetPath(source) {
  return source.replace(/^\.\//, "").replace(/^\//, "");
}

let manifest;
let indexHtml;

try {
  const [manifestSource, htmlSource] = await Promise.all([
    readFile(manifestPath, "utf8"),
    readFile(indexPath, "utf8"),
  ]);
  manifest = JSON.parse(manifestSource);
  indexHtml = htmlSource;
} catch (cause) {
  process.stderr.write(
    `Bundle gate failed: Vite build output or manifest is missing/invalid. Run npm run build first. (${cause instanceof Error ? cause.message : "unknown error"})\n`,
  );
  process.exit(1);
}

const manifestEntries = Object.entries(manifest);
const htmlEntries = manifestEntries.filter(
  ([key, record]) =>
    record?.isEntry === true && (key === "index.html" || record.src === "index.html"),
);

if (htmlEntries.length !== 1) {
  process.stderr.write(
    `Bundle gate failed: expected one Vite manifest entry for index.html, found ${htmlEntries.length}.\n`,
  );
  process.exit(1);
}

const [entryKey, entryRecord] = htmlEntries[0];
const entryAsset = normalizeAssetPath(entryRecord.file);
const labsSource = "src/labs/labs-app.tsx";
const violations = [];

function dynamicEntryForSource(source) {
  if (manifest[source]) return [source, manifest[source]];
  // Rollup can promote a route to a shared, named chunk when another async
  // screen also imports it. Vite then emits `_projects-screen-<hash>.js`
  // instead of a source-path key, while preserving a direct dynamic edge.
  const baseName = path.basename(source).replace(/\.[cm]?[jt]sx?$/, "");
  const aliases = manifestEntries.filter(([key, record]) =>
    key.startsWith(`_${baseName}-`) && record?.name === baseName && record?.isDynamicEntry === true,
  );
  return aliases.length === 1 ? aliases[0] : [source, undefined];
}

async function assetSize(asset) {
  try {
    return (await readFile(path.join(distDirectory, normalizeAssetPath(asset)))).byteLength;
  } catch (cause) {
    violations.push(
      `manifest asset ${asset} is missing (${cause instanceof Error ? cause.message : "unknown error"})`,
    );
    return 0;
  }
}

const javascriptAssets = new Set(
  manifestEntries
    .map(([, record]) => record?.file)
    .filter((file) => typeof file === "string" && file.endsWith(".js"))
    .map(normalizeAssetPath),
);

const assetSizes = new Map();
for (const asset of javascriptAssets) {
  assetSizes.set(asset, await assetSize(asset));
}

const entryBytes = assetSizes.get(entryAsset) ?? 0;
const asyncAssets = [...assetSizes.entries()].filter(([asset]) => asset !== entryAsset);
const largestAsync = asyncAssets.reduce(
  (largest, current) => (current[1] > largest[1] ? current : largest),
  ["none", 0],
);
const totalBytes = [...assetSizes.values()].reduce((total, value) => total + value, 0);

if (entryBytes > budgets.entryJavaScriptBytes) {
  violations.push(
    `entry ${entryAsset} is ${formatBytes(entryBytes)} (budget ${formatBytes(budgets.entryJavaScriptBytes)})`,
  );
}
if (largestAsync[1] > budgets.asyncChunkBytes) {
  violations.push(
    `async chunk ${largestAsync[0]} is ${formatBytes(largestAsync[1])} (budget ${formatBytes(budgets.asyncChunkBytes)})`,
  );
}
if (totalBytes > budgets.totalJavaScriptBytes) {
  violations.push(
    `total JavaScript is ${formatBytes(totalBytes)} (budget ${formatBytes(budgets.totalJavaScriptBytes)})`,
  );
}

function staticGraph(rootKey) {
  const visited = new Set();
  const pending = [rootKey];
  while (pending.length > 0) {
    const key = pending.pop();
    if (!key || visited.has(key)) continue;
    visited.add(key);
    pending.push(...(manifest[key]?.imports ?? []));
  }
  return visited;
}

function dynamicEdges(graph) {
  return new Set([...graph].flatMap((key) => manifest[key]?.dynamicImports ?? []));
}

// The production entry is intentionally lazy: index.html loads the App shell
// as a dynamic entry, and the App shell then loads its optional surfaces (Labs,
// dialogs, panels, and so on). Treat the complete dynamic descendant graph as
// startup reachability for the boundary checks. Looking only at the static
// index.html imports would miss valid two-hop edges such as
// index.html -> App -> labs-app and report a false violation.
function dynamicDescendants(staticGraphKeys) {
  const discovered = new Set();
  const pending = [...staticGraphKeys];
  while (pending.length > 0) {
    const key = pending.pop();
    if (!key) continue;
    for (const dynamicKey of manifest[key]?.dynamicImports ?? []) {
      if (discovered.has(dynamicKey)) continue;
      discovered.add(dynamicKey);
      pending.push(dynamicKey);
    }
  }
  return discovered;
}

const staticStartupImports = staticGraph(entryKey);
const [labsKey, labsRecord] = dynamicEntryForSource(labsSource);
const staticLabsImports = labsRecord ? staticGraph(labsKey) : new Set();
const startupDynamicImports = dynamicDescendants(staticStartupImports);
const labsDynamicImports = dynamicEdges(staticLabsImports);

if (!labsRecord) {
  violations.push(`${labsSource} has no Vite manifest record`);
} else {
  if (labsRecord.isDynamicEntry !== true || !startupDynamicImports.has(labsKey)) {
    violations.push(`${labsSource} must be a dynamic import of the Agent startup graph`);
  }
  if (staticStartupImports.has(labsKey)) {
    violations.push(`${labsSource} is also reachable through the eager startup import graph`);
  }
  if (indexHtml.includes(normalizeAssetPath(labsRecord.file))) {
    violations.push(`${labsRecord.file} is eagerly referenced by dist/index.html`);
  }
}

// A shared contract must not drag a whole feature implementation into Agent
// startup (or drag project planning into Labs before Projects is selected).
for (const [key, record] of manifestEntries) {
  if (["workspace-composer", "project-planning"].includes(record?.name) && staticStartupImports.has(key)) {
    violations.push(`${record.name} is reachable through the eager Agent startup graph`);
  }
  if (record?.name === "project-planning" && staticLabsImports.has(key)) {
    violations.push("project-planning is eagerly reachable from Labs instead of the Projects activity");
  }
}

for (const source of expectedDynamicEntries) {
  const [manifestKey, record] = dynamicEntryForSource(source);
  if (!labsDynamicImports.has(manifestKey)) {
    violations.push(`${source} is not a direct dynamic import of the Labs shell graph`);
  }
  if (staticLabsImports.has(manifestKey)) {
    violations.push(`${source} is also reachable through the eager Labs shell import graph`);
  }
  if (!record) {
    violations.push(`${source} has no Vite manifest record`);
    continue;
  }
  if (record.isDynamicEntry !== true) {
    violations.push(`${source} is not marked as a dynamic entry`);
  }
  if (staticStartupImports.has(manifestKey)) {
    violations.push(`${source} is also reachable through the eager startup import graph`);
  }
  if (normalizeAssetPath(record.file) === entryAsset) {
    violations.push(`${source} was folded into the main entry instead of an async chunk`);
  }
  if (indexHtml.includes(normalizeAssetPath(record.file))) {
    violations.push(`${record.file} is eagerly referenced by dist/index.html`);
  }
}

for (const source of expectedActivityEntries) {
  const [, record] = dynamicEntryForSource(source);
  if (!record) continue;
  const bytes = assetSizes.get(normalizeAssetPath(record.file)) ?? 0;
  if (bytes < 512) {
    violations.push(
      `${source} emitted only ${formatBytes(bytes)}; this looks like a wrapper around an eager/shared screen monolith`,
    );
  }
}

const legacyScreensRecords = manifestEntries.filter(([key, record]) => {
  const identity = [key, record?.name, record?.src, record?.file]
    .filter(Boolean)
    .join("/");
  return /(^|[\\/_-])screens(?:[._/\\-]|$)/i.test(identity);
});
if (legacyScreensRecords.length > 0) {
  violations.push(
    `legacy shared screens module/chunk remains: ${legacyScreensRecords
      .map(([key, record]) => record.file ?? key)
      .join(", ")}`,
  );
}

if (
  manifestEntries.some(([, record]) =>
    (record?.dynamicImports ?? []).includes("src/features/workspace/conversation-view.tsx"),
  ) ||
  manifest["src/features/workspace/conversation-view.tsx"]?.isDynamicEntry === true
) {
  violations.push("the core chat conversation view must remain in the eager application path");
}

if (violations.length > 0) {
  process.stderr.write(`Bundle gate failed:\n- ${violations.join("\n- ")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(
    [
      "Bundle gate OK (Vite manifest verified):",
      `- manifest entry: ${entryKey} -> ${entryAsset}`,
      `- entry: ${formatBytes(entryBytes)} / ${formatBytes(budgets.entryJavaScriptBytes)}`,
      `- required dynamic entries: ${expectedDynamicEntries.length}/${expectedDynamicEntries.length}`,
      `- JavaScript chunks: ${javascriptAssets.size} total; largest async ${largestAsync[0]} at ${formatBytes(largestAsync[1])} / ${formatBytes(budgets.asyncChunkBytes)}`,
      `- total JavaScript: ${formatBytes(totalBytes)} / ${formatBytes(budgets.totalJavaScriptBytes)}`,
      "- legacy screens monolith: absent",
      "- Agent -> Labs -> legacy activities: lazy boundaries verified",
      "- chat conversation view: synchronous within Labs",
    ].join("\n") + "\n",
  );
}
