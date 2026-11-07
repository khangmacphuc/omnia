# Omnia upstream integration inventory

Generated: 2026-11-07T07:57:09.394Z
Repository commit: 55f21dacf5acb2c6f386aff1ece6a5245bad0fc4

This report inventories `upstream_extractions` for adapter work. It does not copy upstream code, claim behavioral parity, or turn browser profiles and credentials into source artifacts.

## Coverage

- Categories scanned: **11 / 11**
- Modules scanned: **55**
- Files represented: **191,475**
- Source-like files: **126,930**
- Binary/asset files: **64,545**
- Sensitive/runtime-shaped files withheld from content hashing: **145**
- Modules with a license signal: **16 / 55**

A module is not considered complete because it has a manifest or a successful build. Runtime, provider, authentication and IPC parity remain separate gates.

## Module matrix

| Module | Classification | Files | Source | Bytes | Integration mode | License signal |
| --- | --- | ---: | ---: | ---: | --- | :---: |
| `browser/chrome-canary` | upstream-source-or-buildable-tree | 16 | 16 | 20,270 | adapter-first | unknown |
| `cli/agy-cli` | upstream-source-or-buildable-tree | 10 | 8 | 525,544 | process-adapter | unknown |
| `cli/claude-cli` | upstream-source-or-buildable-tree | 13 | 12 | 335,482,856 | process-adapter | unknown |
| `cli/codex-cli` | upstream-source-or-buildable-tree | 16 | 12 | 476,260,803 | process-adapter | unknown |
| `cli/hermes-cli` | upstream-source-or-buildable-tree | 7 | 7 | 8,218 | process-adapter | unknown |
| `cli/kimi-cli` | runtime-state-or-profile | 19,865 | 10,175 | 278,634,343 | evidence-only | yes |
| `cli/opencode-cli` | upstream-source-or-buildable-tree | 6 | 6 | 4,743 | process-adapter | unknown |
| `cli/orca-cli` | upstream-source-or-buildable-tree | 6 | 6 | 3,384 | process-adapter | unknown |
| `desktop-apps/agy-desktop` | upstream-source-or-buildable-tree | 48 | 45 | 473,205 | isolated-runtime | unknown |
| `desktop-apps/chatgpt-desktop` | upstream-source-or-buildable-tree | 18 | 17 | 20,248 | isolated-runtime | unknown |
| `desktop-apps/cherry-studio` | runtime-state-or-profile | 17,265 | 15,243 | 733,175,797 | evidence-only | yes |
| `desktop-apps/claude-desktop` | upstream-source-or-buildable-tree | 5,938 | 5,327 | 371,758,958 | isolated-runtime | unknown |
| `desktop-apps/codex-desktop` | upstream-source-or-buildable-tree | 2 | 2 | 376 | isolated-runtime | unknown |
| `desktop-apps/gemini-desktop` | upstream-source-or-buildable-tree | 175 | 164 | 4,727,914 | isolated-runtime | yes |
| `desktop-apps/herdr-app` | upstream-source-or-buildable-tree | 8,810 | 1,757 | 154,140,660 | isolated-runtime | yes |
| `desktop-apps/hermes-desktop` | upstream-source-or-buildable-tree | 14 | 12 | 25,164 | isolated-runtime | unknown |
| `desktop-apps/opencode-desktop` | upstream-source-or-buildable-tree | 10 | 9 | 10,986 | isolated-runtime | unknown |
| `desktop-apps/orca-desktop` | upstream-source-or-buildable-tree | 9 | 8 | 4,559 | isolated-runtime | unknown |
| `desktop-apps/zalo-desktop` | upstream-source-or-buildable-tree | 13,170 | 146 | 262,481,327 | isolated-runtime | yes |
| `downloaders/gdrive-downloader` | runtime-state-or-profile | 352 | 193 | 1,080,346,962 | evidence-only | unknown |
| `downloaders/idm-multistream` | upstream-source-or-buildable-tree | 969 | 348 | 12,014,564 | native-adapter | yes |
| `harnesses/agy-harness` | upstream-source-or-buildable-tree | 12 | 12 | 8,987 | process-adapter | unknown |
| `harnesses/chatgpt-desktop` | source-or-extracted-code | 1 | 1 | 1,728 | process-adapter | unknown |
| `harnesses/claude-cli-desktop` | source-or-extracted-code | 1 | 1 | 3,362 | process-adapter | unknown |
| `harnesses/claude-harness` | upstream-source-or-buildable-tree | 14 | 14 | 8,203 | process-adapter | unknown |
| `harnesses/codex-app-unpacked` | runtime-state-or-profile | 21,653 | 17,448 | 664,182,163 | evidence-only | unknown |
| `harnesses/codex-cli` | source-or-extracted-code | 1 | 1 | 5,203 | process-adapter | unknown |
| `harnesses/codex-harness` | upstream-source-or-buildable-tree | 11 | 11 | 9,574 | process-adapter | unknown |
| `harnesses/deepseek-harness` | upstream-source-or-buildable-tree | 12 | 12 | 10,765 | process-adapter | unknown |
| `harnesses/droid-harness` | upstream-source-or-buildable-tree | 12 | 12 | 9,753 | process-adapter | unknown |
| `harnesses/herdr-core` | upstream-source-or-buildable-tree | 7,500 | 953 | 124,214,407 | process-adapter | yes |
| `harnesses/hermes-agent` | runtime-state-or-profile | 23,270 | 20,544 | 298,065,375 | evidence-only | yes |
| `harnesses/hermes-harness` | upstream-source-or-buildable-tree | 5 | 5 | 1,213 | process-adapter | unknown |
| `harnesses/kimi-code` | runtime-state-or-profile | 4,501 | 4,319 | 81,998,707 | evidence-only | yes |
| `harnesses/opencode` | upstream-source-or-buildable-tree | 21,040 | 12,961 | 1,302,148,966 | process-adapter | yes |
| `harnesses/opencode-harness` | upstream-source-or-buildable-tree | 5 | 5 | 1,237 | process-adapter | unknown |
| `harnesses/openhands` | runtime-state-or-profile | 3,719 | 3,391 | 810,058,196 | evidence-only | yes |
| `harnesses/openhands-agent-sdk` | runtime-state-or-profile | 17,371 | 14,682 | 370,712,507 | evidence-only | yes |
| `harnesses/openhands-automation` | runtime-state-or-profile | 15,830 | 11,828 | 266,083,731 | evidence-only | yes |
| `harnesses/orca-harness` | upstream-source-or-buildable-tree | 5 | 5 | 1,189 | process-adapter | unknown |
| `harnesses/pi-harness` | upstream-source-or-buildable-tree | 12 | 12 | 6,212 | process-adapter | unknown |
| `ide/antigravity-core` | upstream-source-or-buildable-tree | 45 | 42 | 472,640 | isolated-runtime | unknown |
| `ide/antigravity-ide` | upstream-source-or-buildable-tree | 232 | 46 | 72,513,288 | isolated-runtime | unknown |
| `ide/cursor` | upstream-source-or-buildable-tree | 32 | 31 | 2,483,292 | isolated-runtime | unknown |
| `ide/vscode-core` | runtime-state-or-profile | 5,252 | 3,121 | 323,013,185 | evidence-only | yes |
| `ide/windsurf` | bundle-or-native-artifact | 1 | 0 | 453 | isolated-runtime | unknown |
| `notebooks/gemini-desktop` | upstream-source-or-buildable-tree | 174 | 163 | 4,727,746 | workflow-adapter | yes |
| `notebooks/gemini-notebook` | upstream-source-or-buildable-tree | 3,357 | 3,255 | 1,399,528,897 | workflow-adapter | yes |
| `proxies/htmustc-proxy` | runtime-state-or-profile | 634 | 492 | 6,318,626 | evidence-only | unknown |
| `research/orca-debate` | upstream-source-or-buildable-tree | 15 | 15 | 14,925 | workflow-adapter | unknown |
| `research/perplexity-synthesis` | upstream-source-or-buildable-tree | 15 | 15 | 17,254 | workflow-adapter | unknown |
| `web-apis/chatgpt-web` | upstream-source-or-buildable-tree | 6 | 5 | 43,506 | network-adapter | unknown |
| `web-apis/claude-web` | upstream-source-or-buildable-tree | 6 | 5 | 48,240 | network-adapter | unknown |
| `web-apis/gemini-notebook-web` | upstream-source-or-buildable-tree | 6 | 5 | 46,043 | network-adapter | unknown |
| `web-apis/gemini-web` | upstream-source-or-buildable-tree | 6 | 5 | 45,091 | network-adapter | unknown |

## Integration rules

- `process-adapter`: invoke the real upstream entrypoint; forward stdout/stderr, exit status, cancellation and resource limits.
- `isolated-runtime`: keep production desktop/IDE assets in a worker or borrowed runtime and bridge only declared IPC. Do not merge Electron chrome into Omnia's shell.
- `adapter-first`: use CDP/WebView2 or the extension/native-host protocol. Browser profiles are evidence and must remain outside the source/runtime package.
- `network-adapter`: keep credentials and provider sessions in the OS credential store or explicit session boundary.
- `evidence-only`: preserve the artifact and provenance but do not load it as executable Omnia source.

## Review before wiring

1. Check the module's `gitHead`, manifest and license evidence against the upstream repository or installed package.
2. Add a capability adapter with a bounded command/IPC contract and an audit harness. A `200` response, process spawn, or static import is not behavioral parity.
3. Keep sensitive files, cookies, local state, crash dumps and caches excluded. The inventory marks these paths so a future sync can preserve them as evidence without shipping them.
4. Record build/runtime output in `artifacts/upstream-ui` and update the module's separate DoD status.

The JSON report contains file pointers and hashes for reproducible review. Hashes are intentionally omitted for sensitive paths and files larger than 2 MiB; path/size evidence remains available.

## Omnia inspection surface

The desktop **Session services** dialog exposes a bounded, read-only catalog
for this inventory through `UpstreamCapabilitiesSection`. It shows the module
count, category filter, integration mode, provenance facts and the generated
adapter plan. It never launches an extracted process, reads browser profile
state, or turns an arbitrary inventory path into a renderer tool. Execution
continues through the native adapter and permission boundary described above.

The projection is generated by `npm run inventory:catalog` and enforced by
`npm run check:upstream-catalog`; a stale projection fails the repository
check instead of silently hiding upstream changes.

