import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

// Read-only source acquisition: downloaded files are never imported or executed.
const candidates = [
  { repo: 'github/spec-kit', paths: ['LICENSE', 'templates/commands/analyze.md', 'templates/commands/checklist.md', 'templates/commands/implement.md'] },
  { repo: 'gsd-build/get-shit-done', paths: ['LICENSE', 'get-shit-done/workflows/verify-work.md', 'get-shit-done/workflows/execute-plan.md', 'get-shit-done/templates/phase-prompt.md'] },
  { repo: 'affaan-m/everything-claude-code', paths: ['LICENSE', 'skills/continuous-learning-v2/SKILL.md', 'skills/verification-loop/SKILL.md', 'skills/search-first/SKILL.md'] },
];
const headers = { 'User-Agent': 'Omnia-reference-research', Accept: 'application/vnd.github+json' };
const receipt = { schemaVersion: 1, retrievedAt: new Date().toISOString(), scope: 'new workflow research source acquisition; no upstream code executed', sources: [] };
for (const candidate of candidates) {
  const item = { canonicalRepo: `https://github.com/${candidate.repo}`, revision: null, paths: [], errors: [] };
  try {
    const head = await fetch(`https://api.github.com/repos/${candidate.repo}/commits/HEAD`, { headers, signal: AbortSignal.timeout(20000) });
    if (head.ok) {
      item.revision = (await head.json()).sha;
    } else {
      item.errors.push({ message: `GitHub API revision lookup HTTP ${head.status}; trying read-only git ls-remote` });
      const remote = await execFileAsync('git', ['ls-remote', `https://github.com/${candidate.repo}.git`, 'HEAD'], { timeout: 30000 });
      item.revision = remote.stdout.trim().split(/\s+/)[0];
    }
    if (!/^[a-f0-9]{40}$/.test(item.revision)) throw new Error('invalid upstream revision');
    for (const file of candidate.paths) {
      try {
        const url = `https://raw.githubusercontent.com/${candidate.repo}/${item.revision}/${file}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = Buffer.from(await res.arrayBuffer());
        if (data.length > 400000) throw new Error('source exceeds research size bound');
        const localPath = `research/upstreams/novel/${candidate.repo}/${item.revision}/${file}`;
        await mkdir(resolve(localPath, '..'), { recursive: true });
        await writeFile(localPath, data);
        item.paths.push({ path: file, url, localPath, sha256: createHash('sha256').update(data).digest('hex'), bytes: data.length });
      } catch (e) { item.errors.push({ path: file, message: String(e.message) }); }
    }
  } catch (e) { item.errors.push({ message: String(e.message) }); }
  receipt.sources.push(item);
}
await mkdir('docs/rebuild/research', { recursive: true });
await writeFile('docs/rebuild/research/WORKFLOW_OSS_FETCH.json', JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify(receipt, null, 2));
if (receipt.sources.some(s => s.paths.length < 2)) process.exitCode = 1;
