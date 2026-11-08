# Source research receipt — rebuild-0001

## Commands and outcomes

```text
git ls-remote https://github.com/github/spec-kit.git HEAD
  c43849408ac0de2ca6a52f14eaae71449776057b  HEAD
git ls-remote https://github.com/gsd-build/get-shit-done.git HEAD
  bdcaab2c752d9a33a1a1ca9acf3a3c81fb991815  HEAD
git ls-remote https://github.com/SuperClaude-Org/SuperClaude_Framework.git HEAD
  fe68862c8ed9e2afb8120c2d9e27d0c3a7ce73a2  HEAD
git ls-remote https://github.com/kirodotdev/powers.git HEAD
  91d8b241dea7107a119c78aeb49dd2d3fab48da8  HEAD
git ls-remote https://github.com/nakasyou/power-agent.git HEAD
  a258539983e3ffbcb04f7762d73f98b67940e5b8  HEAD
git ls-remote https://github.com/microsoft/azure-agents-control-plane.git HEAD
  efc3f85e2f1786e7b415ff6e66138a7dbdb316c0  HEAD
```

All six commands exited 0. Raw source/license fetches returned HTTP 200 except
the Kiro Powers license paths (HTTP 404), which is recorded as unknown license.
The GitHub metadata API was rate-limited (HTTP 403), so no stars, popularity or
API metadata are claimed.

```text
node scripts/rebuild/source-inventory.mjs
  exit 0
  {"categories":10,"modules":54,"readableModules":54,
   "substantialModules":21,"truncatedModules":14}
```

`Get-AppxPackage '*ChatGPT*'` returned no package; read-only `Get-AppxPackage`
and `Get-StartApps` observed the installed `OpenAI.Codex` Store package
`26.1103.4239.0` and two ChatGPT display entries. See
`CHATGPT_STORE_FRESHNESS_20261108.md`; current ChatGPT extraction freshness is
not claimed.

## Limitations

This receipt covers source discovery and bounded extraction observation only. It
does not prove that any upstream runtime is safe, licensed for redistribution,
feature-complete, authenticated, or behaviorally equivalent. No downloaded
source was executed; no browser profile, cookie, credential or personal chat
data was read. The six new sources are recorded in `../SOURCE_REGISTER.json`
with exact paths, revision and content hashes.
