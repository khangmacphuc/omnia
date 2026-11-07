import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const checker = fileURLToPath(new URL("./check-bundle-budget.mjs", import.meta.url));
const labs = "_labs-app-fixture.js";
const activities = ["home", "projects", "background-work", "library-activity", "memory", "skills", "settings"]
  .map((name) => `src/features/workspace/activities/${name}-screen.tsx`);
const optional = ["command-palette", "dialogs", "markdown", "citation-timeline", "conversation-actions-dialog"]
  .map((name) => `src/features/workspace/${name}.tsx`);

function fixture() {
  const manifest = {
    "index.html": { file: "assets/index.js", src: "index.html", isEntry: true, dynamicImports: [labs, optional[2]] },
    [labs]: { file: "assets/labs.js", name: "labs-app", isDynamicEntry: true, imports: ["_labs-shell.js"] },
    "_labs-shell.js": { file: "assets/labs-shell.js", dynamicImports: [...activities, ...optional] },
  };
  for (const [i, source] of [...activities, ...optional].entries()) {
    manifest[source] = { file: `assets/surface-${i}.js`, src: source, isDynamicEntry: true };
  }
  return manifest;
}

async function runGate(t, mutate = () => {}, oversized = false) {
  const root = await mkdtemp(path.join(os.tmpdir(), "omnia-bundle-contract-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const manifest = fixture();
  mutate(manifest);
  await mkdir(path.join(root, ".vite"));
  await mkdir(path.join(root, "assets"));
  await writeFile(path.join(root, ".vite", "manifest.json"), JSON.stringify(manifest));
  await writeFile(path.join(root, "index.html"), '<script type="module" src="/assets/index.js"></script>');
  for (const record of Object.values(manifest)) {
    await writeFile(path.join(root, record.file), " ".repeat(oversized && record.name === "labs-app" ? 307201 : 1024));
  }
  const result = spawnSync(process.execPath, [checker], {
    encoding: "utf8",
    env: { ...process.env, OMNIA_BUNDLE_DIST: root },
  });
  assert.ifError(result.error);
  return result;
}

test("accepts Agent -> Labs -> shell dependency -> activities and optional surfaces", async (t) => {
  const result = await runGate(t);
  assert.equal(result.status, 0, result.stderr);
});

test("resolves promoted Labs and activity dynamic entry aliases", async (t) => {
  const result = await runGate(t, (m) => {
    const source = activities[1];
    m["_projects-screen-fixture.js"] = { ...m[source], name: "projects-screen" };
    delete m[source];
    m["_labs-shell.js"].dynamicImports = m["_labs-shell.js"].dynamicImports.map((key) => key === source ? "_projects-screen-fixture.js" : key);
  });
  assert.equal(result.status, 0, result.stderr);
});

test("rejects eager Labs even with a dynamic edge", async (t) => {
  const result = await runGate(t, (m) => { m["index.html"].imports = [labs]; });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /labs-app.*eager startup/);
});

test("rejects moving activity imports to Agent instead of Labs", async (t) => {
  const result = await runGate(t, (m) => {
    m["index.html"].dynamicImports.push(activities[0]);
    m["_labs-shell.js"].dynamicImports = m["_labs-shell.js"].dynamicImports.filter((key) => key !== activities[0]);
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /home-screen.*not a direct dynamic import of the Labs/);
});

test("rejects activity folded into the synchronous Labs graph", async (t) => {
  const result = await runGate(t, (m) => { m[labs].imports.push(activities[1]); });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /projects-screen.*eager Labs shell/);
});

test("rejects composer implementation leaking into Agent startup", async (t) => {
  const result = await runGate(t, (m) => {
    m["_composer.js"] = { file: "assets/composer.js", name: "workspace-composer" };
    m["index.html"].imports = ["_composer.js"];
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /workspace-composer.*eager Agent/);
});

test("rejects project planning leaking into the Labs shell", async (t) => {
  const result = await runGate(t, (m) => {
    m["_planning.js"] = { file: "assets/planning.js", name: "project-planning" };
    m[labs].imports.push("_planning.js");
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /project-planning.*eagerly reachable from Labs/);
});

test("retains strict 300 KiB async budget", async (t) => {
  const result = await runGate(t, undefined, true);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /async chunk assets\/labs.js.*307,201 B.*307,200 B/);
});

test("rejects lazy core conversation view", async (t) => {
  const result = await runGate(t, (m) => {
    m["_labs-shell.js"].dynamicImports.push("src/features/workspace/conversation-view.tsx");
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /core chat conversation view must remain/);
});
