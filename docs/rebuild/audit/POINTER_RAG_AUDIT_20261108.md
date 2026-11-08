# Pointer storage and RAG vertical-slice audit

Observed at: 2026-11-08 11:26 Asia/Bangkok. Auditor: `/root/pointer_rag_slice_audit`.
Checkout: `C:/Users/khang/.codex/worktrees/omnia-ui-rebuild/publish-worktree`.
Base revision: `ca8dfa32a8221761383553780d13e61be053667d`, with uncommitted rebuild work.

## Result and evidence boundary

The checkout contains substantial native file-pointer and lexical retrieval
implementations. The current clean-room renderer does not call those native
pointer or RAG paths. This audit therefore proves source/contract observations
and the focused domain tests listed below. It does not prove a complete new-UI
vertical slice, packaged Windows pointer watching, native retrieval execution in
this audit, provider embedding/reranking, or live provider acceptance.

No product source, DoD status, legacy renderer, or original/release checkout was
changed. The 20 `STORAGE-*`/`RAG-*` criteria remain for the root integrator to
classify against their required native/runtime evidence. **0/20 has complete
end-to-end rebuild evidence from this audit.** This is an evidence coverage
statement, not a claim that all 20 lack implementation.

## Audit decisions

1. Separate native contracts from their renderer projection. Existing native
   code is usable evidence for a contract but cannot establish that the new
   application exposes or uses it.
2. Trace each criterion to the exact producer of identities, hashes, scope,
   snapshots and receipts. Keep stateless scoring, durable retrieval evidence,
   provider-input admission and provider execution as separate claims.
3. Prefer the existing native file-pointer path as the next narrow integration.
   It already has native authority and mutation tests; bridging it avoids
   inventing a second path-based pointer store in the renderer.

## Source findings

### 1. File pointers have native identity and encrypted latest snapshots

`src-tauri/src/project_file_pointers.rs` owns a SQLite catalog under
`project-files/pointers.sqlite3` and uses `ContentStore` for encrypted bodies.
The schema has `UNIQUE(project_id, identity)`, revisioned records, a blob
descriptor table, and immutable receipt update/delete triggers (lines 115–160).

The picker command accepts native dialog selections, not renderer file paths
(`src-tauri/src/native_commands.rs:1156`). It validates that the project exists
before and after selection, then calls the repository with the native blob-key
provider. AppState opens the repository (`src-tauri/src/state.rs:68`), and all
five commands are registered (`src-tauri/src/lib.rs:169`).

The Windows identity is volume serial plus file index, rather than path alone
(`project_file_pointers.rs:623`). Unix uses device/inode; unsupported platforms
return `pointer_identity_unavailable`. Reads reject reparse components, verify
identity before/after reading, enforce 64 MiB import and 8 MiB read bounds, and
return explicit changed/unsafe errors (lines 548–692). Importing the same
identity deduplicates within a project (lines 163–238).

Refresh uses project/revision guards, changes labels/content when the selected
identity is found, and appends a receipt. Missing origins set `source_exists`
false while retaining the last blob/hash (lines 262–338). Receipts preserve
identity hash, content hash, outcome, revision, timestamp and watcher version.
The API reads only the current pointer revision; a user-facing historical
snapshot/lineage export path was not found in this audited path.

**Limit:** discovery is a metadata scan beneath the original parent, bounded to
10,000 entries and depth 8 (`project_file_pointers.rs:28`, lines 475–546).
Moving the file outside that scope, renaming its parent, or exhausting a scan
does not establish full pointer continuity. An incomplete scan keeps the
snapshot and returns `pointer_discovery_incomplete`; a missing discovery root
marks the source missing. The separate `project_file_watch.rs` handle-based
tracker is not declared by `lib.rs` and has no caller outside its own file in
the inspected tree, so it cannot be credited as the production watcher.

### 2. Folder grants are native, but currently path-bound

`Storage::add_workspace_grant` canonicalizes a folder, hashes normalized path
bytes, stores a read-only grant, and deduplicates by
`(profile_id, canonical_path_hash)` (`storage.rs:8380`).
`workspace_root_for_read` reopens the recorded path and checks the path hash
(`storage.rs:8484`). This proves native read-grant storage and path validation.
It does not establish an OS folder identity that follows a rename. Reusing the
same canonical folder in another project updates the existing grant's
`project_id` through the upsert; multi-project sharing semantics need an
explicit design/test before calling this project folder-pointer parity.

### 3. The new renderer does not yet connect pointer or RAG commands

The desktop wrapper already exposes `pickProjectFiles`,
`listProjectFilePointers`, `refreshProjectFilePointer`,
`readProjectFilePointer`, `listProjectFilePointerReceipts`,
`buildWorkspaceIndex`, `retrieveWorkspaceChunks` and
`retrieveWorkspaceForRun` (`src/lib/desktop.ts:2693` onward).

An exact source-symbol audit across `src/rebuild/**/*.ts(x)` returned **zero
matches** for those pointer/index/retrieval operations or the context-admission
fields. The rebuild IDE uses native workspace grants and text reads, while
explicitly imported browser files live in an in-memory `Map` and use export-copy
semantics (`src/rebuild/ide/ide-access.ts:83`, lines 154–171). These imports are
not durable project pointers.

The rebuild Chat controller creates agent sessions from an optional `cwd` and
sends through `agent_send` (`src/rebuild/chat/chat-controller.ts:328`, line 382).
It does not currently bind a native project ID/file-pointer catalog, compile
retrieved context, display retrieval receipts, or use the native
`conversation_run_prepare` context-admission path. RAG controls in settings are
requested renderer settings, not proof that the indexer/provider uses them.

### 4. Native text indexing preserves source and chunk provenance

`workspace_indexer.rs` implements a bounded directory scan with canonical-root,
reparse, permission, size, depth, count and changed-during-read checks.
`WorkspaceIndexSnapshot` contains timestamps, indexer version, snapshot ID/hash,
stats, sources, chunks and explicit skips (lines 132–209). Each source contains
a content hash, extractor version, media type and version ID. Each chunk has
source/version IDs, content hashes, byte/line spans and token-estimator version
(lines 155–178, 817–936).

Source identity is derived from grant plus lowercased relative path, and its
version is derived from source ID plus content hash. It is not the file-pointer
identity. A rename therefore creates a different indexed source lineage. The
live pointer repository is not an ingestion source for this indexer.

The classifier supports UTF-8 text, Markdown, code and common text data.
PDF/Office/image formats are explicitly `ExtractorRequired` (lines 1535–1614).
This is an honest supported-format boundary, not an implemented PDF/Office/OCR
parser. Per-source parser metadata is present in the returned snapshot, but no
durable per-document ingestion receipt store was found in this audited live
indexing path.

### 5. Native retrieval is deterministic lexical/MMR with bounded selection

`retrieve_workspace_chunks` validates query/options and uses stable candidate
ordering, lexical/path/exact-phrase reasons, content deduplication, source limits,
MMR diversity and token/result bounds (`workspace_indexer.rs:940`). It returns
rank, score, full chunk provenance, query hash, scorer version, consumed budget
and explicit omissions. The default retrieval budget is 8,000 estimated tokens,
with a hard maximum of 256,000; token estimation is UTF-8 bytes divided by 3,
not a provider tokenizer.

Each live call builds a fresh directory index. This audit found no incremental
document reindex/cache or pointer-deletion tombstone mechanism in the live path.
The stateless `workspace_index_retrieve` deliberately accepts supplied chunk
projections; it cannot prove that supplied chunks are still current or remain
granted. It must not be used as authoritative deletion/revocation evidence.

### 6. Durable retrieval evidence and provider-input admission are distinct

`run_retrieval.rs:65` validates an exact run/attempt/frozen-input identity and a
live read grant in that run's project. It builds the index natively and rechecks
scope inside the immediate transaction before appending the content-free
`context.retrieval_receipt`. Revoked grants, cross-project/run scope and terminal
runs are rejected. Its result explicitly says `provider_input_admission:
"not_admitted"`; it does not mutate an already frozen request.

The pre-dispatch path `compile_context_admission`
(`native_commands.rs:905`) obtains the grant/query, builds and selects natively,
then passes context to run preparation. Storage validates item hashes, ranks,
uniqueness and consumed-token totals (`storage.rs:21716`), persists a context
snapshot, and journals a redacted pointer. Existing test
`live_context_admission_populates_frozen_provider_input_and_journal_pointer`
checks that admission reaches a frozen provider input.

**Trust-boundary observation:** `append_context_admission_messages`
(`storage.rs:21698`) currently inserts each raw retrieved chunk as a `developer`
message prefixed with source/path/chunk metadata. The inspected format does not
include an explicit untrusted-data instruction or a robust data envelope. This
is a concrete source design gap to review before exposing arbitrary document
content to providers; this audit did not run a prompt-injection exploit test.

The local RAG adapter scores matching SHA-256 nibbles. Its own source describes
this as an offline rehearsal of request/receipt/replay behavior, and returns
`executionBoundary: "local-deterministic"`. Passing its tests is not semantic
embedding quality or provider execution evidence.

## Acceptance trace

The assessment below is advisory only; `DOD.json` was not modified.

| Criterion | Existing source/contract evidence | Missing direct rebuild evidence / next action |
| --- | --- | --- |
| STORAGE-001 | Native folder read grant with canonical path hash | OS folder identity; rename/replacement handling; project binding; packaged mutation test |
| STORAGE-002 | Native picker, OS file identity, encrypted snapshot/hash | New project UI caller, native picker run, stored body/readback receipt |
| STORAGE-003 | File identity scan updates display/path; mutation test exists | Clean-room refresh scheduler; parent/out-of-scope rename policy; packaged test |
| STORAGE-004 | Hash change persists latest body and receipt | New UI update path, reload/capture evidence; watcher scheduling |
| STORAGE-005 | Missing source retains latest blob; restart test exists | New UI missing state and packaged deletion/reload evidence |
| STORAGE-006 | SQL identity uniqueness plus duplicate import test | Current native test run; new UI repeated import/concurrent import cases |
| STORAGE-007 | Native picker, reparse checks, exact grant/revision scope | Current traversal/reparse/race tests through registered IPC and visible denial |
| STORAGE-008 | SQLite catalog and encrypted bodies, reopen test source | Current native run; packaged restart/reload and protected-key evidence |
| STORAGE-009 | Pointer/receipt metadata carries hash, identity and time | Durable export/lineage API and UI; export round-trip test |
| STORAGE-010 | Explicit native error codes and IDE access errors | Pointer-specific actionable renderer error/retry states and denial QA |
| RAG-001 | Returned source hash/extractor version plus snapshot time; durable run receipt | Durable per-document ingestion receipt and current native/runtime/UI path |
| RAG-002 | Text/code supported; PDF/Office/images explicitly need extractors | Native format matrix tests and new UI supported/unsupported result; actual extractors remain future work |
| RAG-003 | Chunk source/version/hash and byte/line spans | Current native provenance run, receipt persistence, citation UI; page provenance for parsed formats |
| RAG-004 | Retrieval ranks/scores and chunk relative paths | User-visible citation links bound to project/pointer revision and current native retrieval run |
| RAG-005 | Stable native scorer ordering/hash tests exist | Current native repeat/reload run at frozen index revision |
| RAG-006 | Content hashes/version IDs identify changes | Incremental persisted index and test proving only changed documents are reindexed |
| RAG-007 | Live folder rebuild naturally omits deleted files | Pointer/tombstone integration, stale index exclusion, retained snapshot policy and native test |
| RAG-008 | Sensitive-path/key-content filters and reparse exclusion tests exist | Current native test run plus packaged grant/index audit; no profiles/cookies/keys ingested |
| RAG-009 | Retrieval token/result limits, omissions and admission totals | New settings-to-native budget binding, complete prompt budget/compaction receipt and provider tokenizer accounting |
| RAG-010 | Missing/revoked scope, invalid query/options, skips/errors are explicit | New renderer error states and negative runtime tests; no fabricated context when unavailable |

## Tests and commands executed in this audit

```text
npm.cmd test -- --run src/domain/rag-provider-local-adapter.test.ts \
  src/domain/rag-provider-contract.test.ts --reporter=dot
exit 0 — 2 files, 9 tests passed — 2026-11-08 11:23:43 Asia/Bangkok

npm.cmd test -- --run src/domain/virtual-pointer.test.ts \
  src/domain/retrieval-request-receipt.test.ts --reporter=dot
exit 0 — 2 files, 7 tests passed — 2026-11-08 11:26:01 Asia/Bangkok
```

These **16/16** tests are domain/contract and local deterministic evidence.
They do not run the native repository, Windows picker, packaged app, new
renderer integration or a provider network adapter. Npm emitted a Node-nightly
support warning; the test commands completed successfully.

The exact-symbol Python audit of all rebuild TypeScript/TSX returned:

```json
{"scope":"src/rebuild/**/*.ts(x)","nativePointerRagCallerMatches":[],"count":0}
```

Native tests were inspected, not rerun here. No `omnia_native*.exe` was found by
the direct `Get-ChildItem src-tauri/target/debug/deps` query. Cargo builds are
serialized by repository contract; the root was informed that this agent did
not start one. Existing `.agents/checkpoints/rag-native-admission-result-20261108.md`
records a prior native admission run, but has no current executable/source hash
receipt adequate to replace a current rebuild-native run.

Relevant existing native tests to run in the root's serialized slot:

```text
cargo test --manifest-path src-tauri/Cargo.toml -p omnia-desktop \
  --test omnia_native --offline project_file_pointers::tests -- --nocapture
cargo test --manifest-path src-tauri/Cargo.toml -p omnia-desktop \
  --test omnia_native --offline workspace_indexer::tests -- --nocapture
cargo test --manifest-path src-tauri/Cargo.toml -p omnia-desktop \
  --test omnia_native --offline run_retrieval::tests -- --nocapture
cargo test --manifest-path src-tauri/Cargo.toml -p omnia-desktop \
  --test omnia_native --offline \
  live_context_admission_populates_frozen_provider_input_and_journal_pointer \
  -- --nocapture
```

Use the explicit resource-linked `omnia_native` target; `[lib] test = false`
is intentional. A listed test or green old receipt does not prove the current
native executable ran.

## Recommended next atomic implementation

**Native file-pointer projection in the clean-room project/session context.**

1. Bind an explicit native project ID to the selected session; a `cwd` alone
   is not the pointer repository's project authority.
2. Create a fresh renderer module that lists/imports pointers through native
   picker commands, refreshes with expected revision, reads the verified latest
   body and shows receipt outcome/hash/time. Keep disconnected/canceled/denied/
   missing/stale/conflict states explicit. Do not import the historical pointer UI.
3. Schedule one bounded refresh only for selected/watched projects. Cancel or
   discard stale replies on session/project changes and avoid concurrent CAS
   refreshes for the same pointer. Do not claim OS watching from polling.
4. Verify import → rename → content change → deletion → native restart → latest
   body/readback with a temporary non-sensitive fixture. Add replacement, denied,
   reparse, race and stale-revision cases; capture the packaged UI and receipt.
5. Connect RAG only after project scope exists. Begin with native pre-dispatch
   lexical admission and inspectable selected/omitted receipts. Preserve the
   separate `not_admitted` retrieval path; never treat it as provider context.

Minimum acceptance: one durable native project/file pointer completes the above
mutation/restart flow and the new UI displays its exact identity/hash/revision.
Advanced work remains folder identity, incremental index, document extractors,
pointer-to-index lineage, provider embeddings/reranking and complete budget
binding. No criterion should be weakened to match this smaller first slice.

## Source hashes observed during audit

Hashes describe this audit snapshot. The root must rehash sources after further
edits before attaching evidence to a Done claim.

| Path | SHA-256 |
| --- | --- |
| `src-tauri/src/project_file_pointers.rs` | `40073eb6fa4514b2996aca6c534c3f6a5b3aae1d0f13709a0875b6d87f77dd3d` |
| `src-tauri/src/project_file_watch.rs` | `536a1755ab1591476af80f57e337faeff8e2796248b698ac511eac3382009eec` |
| `src-tauri/src/workspace_indexer.rs` | `4289e151271203a5ada518205b62cf71b186a0bb930068033342001a707fb251` |
| `src-tauri/src/run_retrieval.rs` | `c6bba74eab73dd375e04d9cb2fcf2900b02267d9e6b2c5a0d68ed8451a79927f` |
| `src-tauri/src/native_commands.rs` | `ee5c3fb5d7344575a2a1ac0659d1ffe67213746ed0f5334669f0e824e41f1cd1` |
| `src-tauri/src/storage.rs` | `29053c1b27907f2b35e58d99c58f95681ce99bc410b8fdee1d60b59f80c6de23` |
| `src-tauri/src/state.rs` | `d1bdb4a8619474b819f58ac27a4f5834fe10bbd73955f39f31963a62fe67ea1f` |
| `src-tauri/src/lib.rs` | `aa9989e8a1ca4e2bad45ee8194e573d2e5761b6df1a3a364f3712f56acaece3e` |
| `src/lib/desktop.ts` | `5f9c5fa575badaf43d2febdfe594190ce11cb714e6545857e316a501d25b5849` |
| `src/rebuild/chat/chat-controller.ts` | `f635a6c2578f1fe1282304e89f087faf0b8e30b4ee70095e675e1aeab1da2633` |
| `src/rebuild/ide/ide-access.ts` | `0f1aaef60e1e2ebb4d25ac73bad419075307db4b37691907ff010adff5869389` |
| `src/domain/rag-provider-local-adapter.ts` | `4671d4cdae66f6fffc5455dea8f0adc2a0eb9f4c4463ee90fa475f7d73b84a57` |
| `src/domain/rag-provider-local-adapter.test.ts` | `9a8bdedf65c19bf6dc54865afb06903d57fccbf61745148dd791e35572d80966` |
| `src/domain/rag-provider-contract.ts` | `21f22e1416f86562d30d40a009942f458b88addf88220f343c643b6029228bbe` |
| `src/domain/rag-provider-contract.test.ts` | `3f94669f990d7cec4ecc44cff2474dc59ac5e6bddb20ef7fac17b2c8d07fd1b6` |
| `src/domain/virtual-pointer.ts` | `0975bb91b20276e4341f54a9c838d81da526f9d6e1a952335bae36be36ed968d` |
| `src/domain/virtual-pointer.test.ts` | `f8f26c0b90acd48cc24dc319f25634c4c9e78656881b5147af493aab20c22e5e` |
| `src/domain/retrieval-request-receipt.ts` | `8377c76ddb3d7614715ccf1ee27e8ae1eed098e883b8fc603c2da97d9401498e` |
| `src/domain/retrieval-request-receipt.test.ts` | `00ce1efaab5eaf8fefbfbf47275e75d105d2ad9f479c34d9025b634c0b9f5dbe` |

Canonical-input hashes read at audit start:

| Path | SHA-256 |
| --- | --- |
| `AGENTS.md` | `4841902ff1830d8bd59531c8cd1dfccfe7082deffdc694263be038b08afb70c8` |
| `.agents/skills/omnia-evidence-loop/SKILL.md` | `a03964248bd0d2ed64a672f34e038ad5dcd44438f8b73fc64e08fd2e6f227ce6` |
| `docs/rebuild/GOAL.md` | `c168ea23eb684ea99d4fbe1560d155a1266e03e84220a7f9e7c8d6515d1697bf` |
| `docs/rebuild/WORKFLOW.md` | `7d52f5bea6a524664e1d7d3e74a07f2a23d926cba75584a73925f1b78a2b1fb9` |
| `docs/rebuild/SPEC.md` | `39ed159f6a428f7a447c42357dc942b418c6ba3d071c761b719b075ed0b99ae0` |
| `docs/rebuild/DOD.json` | `77961433f3dddbacb3780a1b4d99220aac105f305e94acf025cbc224945c5946` |
| `docs/rebuild/SOURCE_REGISTER.json` | `d3f1e7c38c34fa9aab9f5e1915cb6f635a9b57c455d8605096ec57bc33c467f7` |
| `docs/rebuild/CHECKPOINT.md` | `6f34f537d614b1e9902caa655583aa0684c3533810821c1eb09285e461e66601` |
| `docs/rebuild/ASSIGNMENTS.md` | `a4bb75428b08b5b9598ea28a86da4e30352b144739aeefe014a3fb8f32ff8e19` |

