# Native vertical slice audit — 2026-11-08

Reviewer: `/root/native_vertical_slice_audit`  
Scope: active clean-room rebuild and its native contracts  
Checkout: `C:/Users/khang/.codex/worktrees/omnia-ui-rebuild/publish-worktree`  
Base revision: `ca8dfa32a8221761383553780d13e61be053667d`  
Observed through: 2026-11-08 11:31, Asia/Bangkok  
Result: **incomplete; source integration gaps remain**

This is a source/contract audit with a small current renderer regression run. It
does not establish packaged Tauri, Windows Credential Manager, WebView2, a live
provider, native storage restart, or complete product behavior. Product source and
DoD statuses were not changed by this audit. Existing native test functions were
read; their presence is not counted as a current executed pass.

## 1. Findings in priority order

### High — default non-project chat cannot execute a native agent

- Criteria: `CHAT-001`, `CHAT-003`, `CHAT-004`, `UI-002`, `UI-003`.
- `src/rebuild/chat/chat-controller.ts:328` creates a local-only synthetic session
  whenever `cwd` is absent. `:369` appends the user's text locally and reports that
  a project folder is required instead of dispatching an agent.
- `src-tauri/src/harness_bridge.rs:495` requires a string `cwd` in
  `AgentSessionCreateRequest`; `create_session` validates an existing absolute
  directory. That is a real backend requirement, not a hidden default folder that
  the renderer may invent.
- The local persistence envelope stores `activeId` and drafts but no session
  records, tab order, or authoritative native receipt. A local-only session's new
  generated ID is not restored on startup. Native session list reload is present;
  the complete unified project/non-project lifecycle is absent.
- Fix: define an explicit native managed projectless context with no implicit
  grant to an arbitrary user directory, then bind sends and restart/replay to its
  authoritative identity. Until then the draft-only boundary must stay visible.

### High — advanced retry and context controls are requested policy, not applied runtime settings

- Criteria: `SETTINGS-002`, `SETTINGS-004`, `SETTINGS-005`, `SETTINGS-006`,
  `ADVSET-009`.
- `src/rebuild/settings/settings.ts` stores the requested defaults: context
  200,000, tool output 10,000, retry 5 seconds ×1 with `maxAttempts: 0`.
- No reference from `src/rebuild` to the native settings snapshot load/save
  commands or a native policy-apply command was found in the audited source.
- `src-tauri/src/harness_bridge.rs:1012` constructs `AgentConfig` from a few
  session values and `..AgentConfig::default()`. It does not read the clean-room
  renderer retry/context settings.
- `src-tauri/crates/omnia-harness/src/agent.rs:64` defaults to `max_retries: 3`;
  `:706` stops after the configured count or after streamed/usage evidence;
  `:727` computes `1_000 << (attempt - 1).min(5)`, giving an exponential schedule
  instead of 5 seconds ×1. The cancel-aware wait at `:733` is useful existing
  behavior and must be retained.
- Fix: version a native requested/applied policy contract, bind its revision to
  each run, and test the schedule with a clock. Preserve the guards against
  replay after output, usage, cancellation, denied permissions, and unknown
  acceptance. Unlimited safe retries must remain user-cancelable.
- UI claim risk: `SettingsPanel.tsx` currently says “hot applied across Omnia
  surfaces” and “Settings imported and applied”. This overstates what the source
  proves for native subsystems. Use per-subsystem requested/applied status until
  the relevant native acknowledgement exists.

### High — ultra has no dispatch resolver and model choices are not the native catalog

- Criteria: `CHAT-011`, `CHAT-012`, `ROUTING-010`, `SETTINGS-007`, `ADVSET-001`,
  `ADVSET-003`, `ADVSET-006`.
- `src/rebuild/chat/chat-view.tsx:42` exposes hardcoded model choices
  `auto`, `local`, and `frontier`. These labels are not a verified provider model
  catalog. The controller creates project sessions with `profileId: "default"`
  and `model: "default"`.
- `chat-controller.ts:360` forwards the selected effort, including literal
  `ultra`, as `reasoningEffort` to `agent_session_update`. The renderer has no
  maximum-supported-effort resolver or dynamic workflow execution implementation.
- Native provider helpers accept only their known effort values:
  `openai_chat.rs:55` and `openai_responses.rs:55` map `high|max` to `high`;
  the Anthropic/Gemini budget helpers handle `max` but not `ultra`. Unknown
  values return no effort/budget. Thus selecting ultra does not prove maximum
  effort and can omit the hint instead.
- `updateSettings` optimistically changes local values and increments its
  revision before native success, ignores the returned native summary, and
  has no rollback/reload path on CAS rejection. The UI can appear to have
  applied a rejected setting.
- Native `provider_models_list` is registered and performs a real bounded model
  discovery request. `provider_gateway.rs:802` supports the native provider
  families, authenticated with credentials kept in native services. Catalog
  parsing is bounded, deduplicated, and preserves declared capabilities without
  inferring them from names. This is existing source to connect, not a reason
  to fabricate model support.
- Fix: read explicit provider profiles and the discovered catalog, retain unknown
  capabilities, resolve ultra to an actual supported effort plus a separate
  workflow policy, and display applied values from the returned native revision.
  Add stale-revision, provider-error, unsupported-effort, and no-restart tests.

### High — ask-user has a renderer action but no native operation or tool lifecycle

- Criterion: `CHAT-008`.
- `chat-controller.ts:247` parses ask-user-shaped events and `:415` invokes
  `agent_user_input`. `src-tauri/src/lib.rs` does not register that command.
  Searches of `src-tauri/src` and `src-tauri/crates/omnia-harness` found no
  `agent_user_input`, `ask_user`, or `request_user_input` implementation.
- The current catch path retains the question and surfaces failure. That is an
  honest unsupported state; it does not submit an answer to a running agent.
- Fix: add a native correlated request broker and an actual harness tool. Its
  request ID must be bound to session/run, persist or explicitly terminalize
  across restart, accept exactly one answer, distinguish cancel from empty text,
  and reject cross-session, stale, and duplicate replies. Only then connect the
  renderer and capture a packaged pause → answer → resume flow.

### Medium — pointer storage exists but is not connected to the new project UI

- Criteria: `STORAGE-001` through `STORAGE-010`.
- Registered native commands exist for file pick, list, refresh, read, and
  receipts (`native_commands.rs:1156–1238`, registered in `lib.rs:169–173`).
- `project_file_pointers.rs` stores native Windows volume/file identity, an
  encrypted snapshot body, revisioned immutable receipts, and deduplicates by
  `(project_id, identity)`. Refresh handles content change, rename, deletion,
  replacement-at-the-same-path, scope/revision rejection, and persisted reopen
  in source/test code. The picker supplies the file authority; renderer path text
  is not accepted as ingest authority.
- Limits: at most 64 selected files per import, 1,000 pointers per project,
  64 MiB source bodies and 8 MiB reads. Rename discovery is bounded to the
  original parent, depth 8 and 10,000 entries. Moving an origin outside that
  discovery root cannot be claimed as arbitrary pointer-following support.
  A folder identity/snapshot lifecycle is separate from these file records.
- `project_file_watch.rs` contains another handle/identity abstraction, but the
  repository commands use `ProjectFilePointerRepository`, not that abstraction.
  The two should not be described as one fully integrated watcher.
- No clean-room renderer caller to the pointer commands was found. The project
  attach form currently creates a cwd-bound harness session, not a native project
  record plus pointer catalog. Do not mark native pointer UI/reload/export Done
  from the backend file alone.
- Fix: connect explicit native project identity, picker-granted files and a
  bounded refresh controller. Show last snapshot and origin-missing state, retain
  CAS conflicts, and add native restart and permission-denial evidence.

### Medium — native lexical retrieval receipts exist; broad RAG and incremental indexes do not

- Criteria: `RAG-001` through `RAG-010`.
- `workspace_indexer.rs` emits source hashes, extractor version, source-version
  and chunk IDs, byte/line spans, token estimates, skip/error/truncation reports,
  and lexical ranks/scores. Sensitive-path exclusions and deterministic retrieval
  have source test coverage. This is a bounded local text index, not a web engine.
- `workspace_index_retrieve_for_run` is registered. `run_retrieval.rs:65` builds
  an index from a native-owned grant, validates exact prepared run/attempt/input
  scope, revalidates grant state before journaling, and appends
  `context.retrieval_receipt` with native hashes/ranks/scores/omissions.
- The native retrieval receipt explicitly does not mutate a frozen prepared
  input. Provider context admission has a separate native compilation path in
  `native_commands.rs:906`. A receipt alone does not prove that retrieved text
  was sent to a provider.
- PDF/Office/image extensions are classified as `ExtractorRequired`
  (`workspace_indexer.rs:1609`), not parsed in this indexer. Text/code/Markdown
  ingestion must not be advertised as all-format document RAG. Each retrieval
  currently rebuilds a snapshot; a durable incremental vector/rerank index is
  not established by these functions.
- No clean-room renderer caller to the retrieval/index/grant admission path was
  found. Provider-delivery, changed/deleted-source indexing, per-format receipts,
  and configured 200k context application remain unverified.
- Fix: begin with a native-granted text retrieval inspector and context-admission
  receipt; then implement/version explicit format extractors and incremental
  index lifecycle with changed/deleted-source fixtures and native runtime proof.

### Medium — durable native session navigation is available but unused

- Criteria: `CHAT-003`, `CHAT-004`, `SESSION-009`, `SESSION-010`.
- `session_navigation.rs:187` loads ordered IDs and the active ID;
  `:196` saves with an immediate transaction, expected revision, known-session
  checks and an immutable receipt. It rejects duplicate/unbound/unknown IDs and
  prunes deleted sessions on read. Commands are registered at `lib.rs:198–199`.
- Existing test functions cover ordered restart, CAS conflict, invalid IDs,
  and deletion pruning. This audit did not execute those native functions.
- The new renderer stores only localStorage active/draft data and does not call
  these commands. Browser tabs are controller memory as well; no native browser
  tab-order persistence was observed in the clean-room controller.
- Fix: the small session-navigation adapter defined in section 3 can reuse this
  contract without copying legacy renderer source.

### Medium — native compare is not a complete cancellable multi-model workflow

- Criteria: `ROUTING-003` through `ROUTING-009`, `AUTOMATION-007`.
- Registered `native_compare_execute_prepared` validates prepared input
  identities, claims attempts before dispatch, and uses `join_all` for provider
  fan-out. The source has explicit result persistence and evidence-bearing
  native merge receipts; this is a substantial existing backend contract.
- The public command calls `execute_compare(..., None)` at
  `native_compare.rs:369`. The helper has cancellation-token support, but the
  command does not bind it to the main run-cancellation registry. Helper
  cancellation test source does not establish IPC cancellation.
- The native merge attester refuses Consensus/Weighted without a synthesis
  execution receipt (`model_compare_receipt.rs:196–200`). That refusal must be
  kept; selecting multiple answers is not proof that a separate synthesis ran.
- No clean-room caller to this compare operation was found. Atomic multi-route
  preparation over one logical input, cancellation through the actual command,
  synthesis, persisted replay, and provider-delivery proof need an integrated
  test path before Done.
- Fix: preserve frozen-input/attempt lineage, add one atomic prepare transaction,
  connect command cancellation, and keep best-of selection distinct from an
  independently executed, hash-bound synthesis attempt.

### Medium — packaged browser/computer evidence is still missing and overlay capture is not merged

- Criteria: `BROWSER-001` through `BROWSER-010`.
- The clean-room controller invokes native attach/update/navigate/action/
  capture/release and validates capture ownership, URL, time, byte count and
  SHA-256. Native absence is explicit. This source is useful integration work.
- Active `browser-controller.ts:290` refuses capture while `obscured`, and the
  update contract contains `visible` but no independent `captureEligible` value.
  Active `browser_surface.rs` likewise has no `captureEligible` field. Therefore
  the newer overlay-capture work reported in other preserved checkouts is not
  evidence that `BROWSER-008` is integrated here.
- `agent_services.rs` registers browser/computer tools lazily. Status reports
  computer default-disabled; explicit capture/control grants and an emergency
  stop exist in native source. It uses dedicated browser profiles and avoids
  starting a browser merely to list captures. No clean-room renderer settings/
  permission/status caller was found.
- Existing `docs/audit/NATIVE_BROWSER_CONTRACT_RECEIPT_20261108.md` names another
  checkout, older source revision, 73 renderer tests and 24 native tests. Its own
  boundary explicitly excludes packaged WebView2/DPI/history/download behavior.
  It must not be relabeled as current packaged clean-room proof.
- Fix: merge only verified native contract behavior, retain original renderer
  implementation, separate visibility from capture eligibility, add ownership/
  navigation/overlay race tests, and collect packaged WebView2 evidence. Full
  computer UI permission/cancellation workflows require separate proof.

### Medium — native settings storage is not yet a crash-safe runtime policy authority

- Criteria: `SETTINGS-001`, `SETTINGS-002`, `SETTINGS-010`, `ADVSET-002`.
- `settings_permissions_persistence.rs` owns bounded JSON bytes and optional
  top-level revision CAS; its comments explicitly leave policy semantics to the
  renderer. It is registered but not called by the clean-room settings module.
- Its Windows replacement fallback removes the current snapshot before renaming
  the temporary file (`:132–145`). A crash or second rename failure in that gap
  can lose the previous snapshot. The successful round-trip unit test is not a
  crash/rollback proof. Before adopting it for durable policy, preserve a last
  good snapshot and use a Windows replacement/transaction strategy with
  fault-injection and restart verification.
- `secret_store.rs` uses Windows-native keyring with opaque credential handles
  and bounded `Zeroizing` values. Current source shows a protected-storage design,
  not successful OS vault integration in this audit. Do not place secrets in the
  renderer settings envelope to fill the gap.

## 2. Current verification

Command executed from this checkout:

```text
npm.cmd test -- --run src/rebuild/chat/chat-view.test.tsx src/rebuild/settings/settings.test.ts src/rebuild/browser/browser-controller.test.ts --reporter=dot
```

Observed: exit **0**; **3 test files, 17 tests passed**, 2.16 seconds. These tests
cover renderer/normalization/native-port fixtures only. They do not prove any
native command, provider acceptance or packaged browser. The Node/npm environment
reported a Node 27 nightly compatibility warning; the command still completed.

Native discovery was attempted:

```text
cargo test --manifest-path src-tauri/Cargo.toml -p omnia-desktop --test omnia_native --all-features -- --list
```

It began compiling this worktree's new target. The audit canceled only its own
verified Cargo processes before discovery/test execution to free the serialized
native build slot. **No native pass or native test count is asserted.** Root was
informed. No second Cargo build was started.

At audit start the canonical matrix had **0 Done / 17 Partial / 8 Blocked /
215 Planned / 240 total**. This audit does not alter those statuses or count
blockers as completion. Across the eight audited native integration areas, none
has current complete packaged/runtime evidence in this audit.

## 3. Smallest implementable next slice: native session-navigation adapter

This slice avoids a new native storage schema and has a narrow observable
contract. It improves `CHAT-003`, `CHAT-004`, `SESSION-009` and `SESSION-010` while
leaving the projectless native execution gap explicit.

1. Write an original typed adapter under `src/rebuild/chat` for
   `agent_session_navigation_load/save`; validate snapshot/receipt shape.
2. After native bootstrap, load the authoritative session list and navigation
   before applying the active selection. Restore native tab order and select the
   exact loaded active ID when valid.
3. Serialize navigation saves using the last acknowledged native revision. A
   conflict reloads/rebases once with visible status; no blind infinite replay.
4. Keep synthetic local-only drafts in a separate validated cache namespace;
   never submit those IDs to the native navigation table or claim native
   persistence for them. Replacing this temporary draft contract with native
   projectless sessions remains mandatory.
5. Expose `saving`, `saved(receipt/revision)`, `conflict`, and `unavailable`
   states. Commit local tab mutations only after acknowledgement or retain a
   clearly labeled pending state. Reject stale async responses by epoch.
6. Add renderer tests for ordered restore, active restore, stale reply, duplicate/
   unknown ID rejection, CAS conflict, native failure, local-draft exclusion, and
   unmount with a pending save. Minimum **8 named cases**, all current and passing.
7. Run existing native `session_navigation` tests in the supported
   `omnia_native` target, then a packaged create/select/reorder/restart/delete
   flow. Record native receipt IDs and revision at each mutation.
8. Independently review source and receipts; only promote criteria whose full
   native acceptance is directly shown. Other session actions and browser tab
   durability remain separate incomplete criteria.

## 4. Evidence identity

SHA-256 values from the inspected source snapshot (uppercase hex):

| Path | SHA-256 |
| --- | --- |
| `src-tauri/src/project_file_pointers.rs` | `40073EB6FA4514B2996ACA6C534C3F6A5B3AAE1D0F13709A0875B6D87F77DD3D` |
| `src-tauri/src/workspace_indexer.rs` | `4289E151271203A5ADA518205B62CF71B186A0BB930068033342001A707FB251` |
| `src-tauri/src/run_retrieval.rs` | `C6BBA74EAB73DD375E04D9CB2FCF2900B02267D9E6B2C5A0D68ED8451A79927F` |
| `src-tauri/src/session_navigation.rs` | `791B519BDCEC9EA3AA04893E7C5520DF6A41F7B195B94697E32D4FACD7040CD3` |
| `src-tauri/src/settings_permissions_persistence.rs` | `F5DE31AD460B0F379CFB841D9864BB01727747B558A499D4470077AE647756F6` |
| `src-tauri/src/provider_gateway.rs` | `F1962A00DC30946D82DE835109D156B6DD36CB032ED1CDFAF0D70A72F1D3172A` |
| `src-tauri/src/harness_bridge.rs` | `853A8D7FF3D2B5658B4950FFE7B1A6B98FBC71C51623234F62A22E74CAE668A7` |
| `src-tauri/crates/omnia-harness/src/agent.rs` | `B40DF67E42F1422FA240191B64AE14C8A32FEFB56D2D4988D6CA1AD62C5163E3` |
| `src-tauri/src/agent_services.rs` | `438F01332100AC5260BCE103349096C36CB180591F64AC545E9CF080AA0637BB` |
| `src-tauri/src/browser_surface.rs` | `EED4AD96FC9277B8635CCC6D32D296D913D5B01D532CB734CFD5F678D42E8F2F` |
| `src/rebuild/chat/chat-controller.ts` | `F635A6C2578F1FE1282304E89F087FAF0B8E30B4EE70095E675E1AEAB1DA2633` |
| `src/rebuild/settings/settings.ts` | `44DC89623F6A700D6046ACDD26D78237701A207055FB157DE355851B6ABDE9E6` |
| `src/rebuild/browser/browser-controller.ts` | `E383306303BA857C8247C54B5747A64A1961030956AB7B8B954A42B37C551B39` |

Canonical documents were reread for this audit. Concurrent root/agent integration
can invalidate these source hashes; refresh the affected findings and receipts
before using this audit in a release claim. The clean-room no-legacy-UI rule was
preserved. No credentials, browser profiles, cookies, or private chat history were
read or included.
