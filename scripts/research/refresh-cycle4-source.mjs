import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";

const root = process.cwd();
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const register = JSON.parse(await readFile(`${root}/docs/rebuild/SOURCE_REGISTER.json`, "utf8"));
const findings = [];
await mkdir(`${root}/docs/rebuild/research/snapshots/cycle4`, { recursive: true });

for (const source of register.sources) {
  for (const entry of source.paths ?? []) {
    if (/^[a-f\d]{64}$/i.test(entry.sha256 ?? "")) continue;
    // Keep source metadata for licenses that forbid vendoring the fetched file.
    // The pinned hash remains useful evidence; the raw body must not be written
    // into the publish checkout or recreated by a future refresh.
    const metadataOnly = /additional derivative/i.test(source.license ?? "") ||
      source.id === "new-computer-agent-cycle3-20261108";
    const url = `${source.canonicalRepo.replace("https://github.com/", "https://raw.githubusercontent.com/")}/${source.revision}/${entry.path}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    const record = { sourceId: source.id, path: entry.path, previousDeclaredSha256: entry.sha256, url, status: response.status, retrievedAt: new Date().toISOString() };
    if (response.ok) {
      const bytes = Buffer.from(await response.arrayBuffer());
      entry.sha256 = sha(bytes);
      if (!metadataOnly) {
        const snapshot = `docs/rebuild/research/snapshots/cycle4/${source.id}-${entry.path.replaceAll("/", "_")}.txt`;
        await writeFile(`${root}/${snapshot}`, bytes);
        entry.sourceEvidence = { path: snapshot, sha256: entry.sha256 };
        record.snapshot = snapshot;
      } else {
        entry.sourceEvidenceOmitted = "Snapshot omitted due to additional derivative license provisions; retained pinned hash and metadata only.";
        record.snapshotOmitted = entry.sourceEvidenceOmitted;
      }
      entry.hashCorrection = { previousDeclaredSha256: record.previousDeclaredSha256, retrievedAt: record.retrievedAt };
      Object.assign(record, { sha256: entry.sha256 });
    } else {
      record.reason = `Pinned raw source returned HTTP ${response.status}; observation remains unverified.`;
    }
    findings.push(record);
  }
}

const repo = "deepseek-ai/deepseek-harness";
const revision = "fcc0ad462172522aaf5c93a7b2e01f6b9f0b0159";
const response = await fetch(`https://api.github.com/repos/${repo}/git/trees/${revision}?recursive=1`, { signal: AbortSignal.timeout(20000) });
if (!response.ok) throw new Error(`GitHub tree: HTTP ${response.status}`);
const tree = await response.json();
const candidates = tree.tree.filter((entry) => entry.type === "blob" && /packages\/goal\/goal\/src\/.*\.ts$/.test(entry.path)).map((entry) => entry.path);
const path = candidates.find((candidate) => /index\.ts$/.test(candidate)) ?? candidates[0];
if (!path) throw new Error("No goal implementation source discovered");
const url = `https://raw.githubusercontent.com/${repo}/${revision}/${path}`;
const sourceResponse = await fetch(url, { signal: AbortSignal.timeout(20000) });
if (!sourceResponse.ok) throw new Error(`Goal source: HTTP ${sourceResponse.status}`);
const bytes = Buffer.from(await sourceResponse.arrayBuffer());
const snapshot = `docs/rebuild/research/snapshots/cycle4/deepseek-goal-${path.split("/").at(-1)}.txt`;
await writeFile(`${root}/${snapshot}`, bytes);
findings.push({ canonicalRepo: `https://github.com/${repo}`, revision, path, url, status: sourceResponse.status, retrievedAt: new Date().toISOString(), sha256: sha(bytes), sourceEvidence: { path: snapshot, sha256: sha(bytes) }, license: "MIT" });
await writeFile(`${root}/docs/rebuild/research/CYCLE4_FETCH_RECEIPT.json`, `${JSON.stringify({ schemaVersion: 1, recordedAt: new Date().toISOString(), findings }, null, 2)}\n`);
await writeFile(`${root}/docs/rebuild/SOURCE_REGISTER.json`, `${JSON.stringify(register, null, 2)}\n`);
console.log(JSON.stringify(findings, null, 2));
