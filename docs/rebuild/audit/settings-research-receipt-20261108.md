# Settings research receipt — fresh source slice

Retrieved: 2026-11-08 04:16 Asia/Bangkok  
Owner: `/root/rebuild_settings`  
Query: `github zed settings_store settings file watch invalid JSON last valid settings`; `github super config settings hot reload local first desktop`

## Newly reviewed source

| Source | Revision/freshness | Exact material observed | Decision |
| --- | --- | --- | --- |
| [zed-industries/zed `assets/settings/default.json`](https://github.com/zed-industries/zed/blob/main/assets/settings/default.json) | GitHub page crawled today; page revision not exposed in search result | A large typed/default settings surface with explicit nested sections and documented defaults | Apply the nested section model and bounded normalization; do not copy Zed UI or source. |
| [zed-industries/zed `crates/project/src/project_settings.rs`](https://github.com/zed-industries/zed/blob/main/crates/project/src/project_settings.rs) | GitHub page crawled last week | `SettingsObserver` and project/global settings file change observation | Apply the observable update boundary; our renderer uses `useSyncExternalStore` plus BroadcastChannel while native file watching remains a separate criterion. |
| [zed issue #49076](https://github.com/zed-industries/zed/issues/49076) | Published 8 months ago; crawled last month | Symlinked settings file watcher can fail to hot reload | Record as a weakness: hot reload requires explicit failure status and last-known-good state, not a silent success claim. |

## Boundary

This research is a settings design input, not evidence that Omnia has native
file-watch or OS persistence. The implementation receipt explicitly leaves
native application and permission behavior for the root integration slice.
