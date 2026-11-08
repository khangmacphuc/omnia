# Cycle 9 pointer and RAG audit

**Observed:** 2026-11-08, Asia/Bangkok  
**Auditor:** `/root/cycle9_pointer_rag_audit`  
**Checkout:** `C:/Users/khang/.codex/worktrees/omnia-ui-rebuild/publish-worktree`  
**Revision inspected:** `5479ef236bc35616f70234fad6f25eb31c4e1e80`  
**Cycle:** `rebuild-0009` (`resume`, active, generation 1)  

## Scope and claim boundary

This is an independent source and contract audit for `STORAGE-001` through
`STORAGE-010` and `RAG-001` through `RAG-010`. It does not modify product
implementation, `DOD.json`, canonical specifications, or either preserved
checkout. A source implementation, unit test, or desktop wrapper is not
packaged Windows evidence and does not prove that the clean-room renderer uses
the feature.

At this revision all twenty criteria remain `planned` in `docs/rebuild/DOD.json`.
The audit found substantial native implementations, but **0/20 has complete
end-to-end rebuild evidence**. This is an evidence classification, not a claim
that native code is absent.

## Direct findings

### Native file pointers are durable, identity-bound snapshots

`src-tauri/src/project_file_pointers.rs` owns a SQLite pointer catalog and an
encrypted `ContentStore`. The catalog enforces unique `(project_id, identity)`
rows and immutable pointer receipts. `import_files`, `list`, `refresh`,
`read_body`, and `receipts` are registered through native commands in
`src-tauri/src/lib.rs` and exposed by typed wrappers in `src/lib/desktop.ts`.

The implementation records a platform file identity (Windows volume serial plus
file index where available), source path/display name, source/content hashes,
revision, timestamps and `source_exists`. Refresh rechecks identity before and
after reading, keeps the encrypted latest body when an origin disappears, and
records rename/content-change/missing outcomes. Existing module tests cover
rename plus content change plus deletion plus restart, replacement without
identity adoption, scope/revision/immutable receipts, and duplicate identity
imports.

The design is intentionally bounded: discovery scans at most 10,000 entries and
depth 8 below the original parent. Parent-folder moves, an exhausted scan, and
cross-root moves therefore remain incomplete or missing rather than silently
adopting another file. The separate `project_file_watch.rs` is not wired as a
production command in this checkout; no OS watcher claim is valid.

### Folder grants are path-bound

Workspace grants in `storage.rs` canonicalize and hash paths and enforce grant,
project, and revision scope. They do not provide a stable folder identity that
follows a directory rename. This is separate from the file-pointer identity
catalog and needs an explicit policy before being counted as folder-pointer
parity.

### Native indexer provides bounded provenance, but not a durable incremental index

`src-tauri/src/workspace_indexer.rs` performs a canonical-root scan with
reparse/sensitive-path/binary/private-key/permission/size/depth/count and
changed-during-read guards. `WorkspaceIndexSnapshot` includes snapshot ID/hash,
timestamps, indexer version, source hashes/version IDs, media type, extractor
version, chunk hashes and byte/line spans, plus explicit skip reasons.

UTF-8 text, Markdown, code and common text data are classified directly. PDF,
Office and image inputs return an explicit extractor-required status. Each call
builds a fresh bounded index; this path has no persistent incremental document
cache and no pointer tombstone that links a deleted pointer to an index revision.
The source identity is grant plus relative path, so it is not the file-pointer
identity and a rename creates a new indexed source lineage.

### Native retrieval and run admission are separate paths

`retrieve_workspace_chunks` is deterministic lexical/MMR retrieval with query
hash, scorer version, rank, score, provenance, source limits, token/result
bounds, deduplication and explicit omission reasons. Defaults are 8,000
estimated tokens and 12 results; hard retrieval budget is 256,000 estimated
tokens. The estimator is `utf8-bytes-div-3-v1`, not a provider tokenizer.

`workspace_index_retrieve_for_run` and `run_retrieval.rs` bind the request to an
opaque grant, project, run and attempt, reject revoked/cross-scope/terminal
requests, and append a content-free retrieval receipt. The native
`compile_context_admission` path can freeze selected retrieval material into
provider input and journal a redacted pointer. That is distinct from the
renderer-facing stateless retrieval wrapper and from the run retrieval receipt
whose result explicitly reports `provider_input_admission: "not_admitted"`.

One remaining trust-boundary concern is that
`storage.rs::append_context_admission_messages` currently prefixes raw chunks as
`developer` messages. The source/path/chunk metadata is preserved, but the
format does not visibly add an untrusted-data envelope or prompt-injection
instruction. A provider-facing adversarial fixture is required before this can
be treated as safe context admission.

## Clean-room renderer integration

An exact symbol search over `src/rebuild/**/*.{ts,tsx}` for
`pickProjectFiles`, `listProjectFilePointers`, `refreshProjectFilePointer`,
`readProjectFilePointer`, `listProjectFilePointerReceipts`,
`buildWorkspaceIndex`, `retrieveWorkspaceChunks`, `retrieveWorkspaceForRun`,
`project_file_pointer_`, and `workspace_index_` returned **0 matches**.

The rebuild IDE currently uses workspace grants/text reads and its selected-file
map is in-memory; it is not the durable native pointer catalog. The rebuild Chat
controller sends `agent_send` sessions and does not bind a native project ID,
admit retrieved chunks, or display retrieval receipts. Settings toggles for RAG
and receipt persistence are requested renderer settings only; they are not proof
that native indexing or provider routing applies them.

## Criterion trace and next evidence

| Criteria | Native evidence observed | Missing direct evidence / next action |
| --- | --- | --- |
| STORAGE-001 | Read-grant storage and canonical path hash | Folder identity, rename behavior, packaged mutation run |
| STORAGE-002 | Native picker, file identity, encrypted snapshot | Clean-room project caller and picker/readback receipt |
| STORAGE-003 | Identity-based bounded rename discovery | Renderer refresh scheduler, parent/out-of-scope policy, packaged test |
| STORAGE-004 | Hash change persists a new encrypted body and receipt | UI update path, reload capture, watcher scheduling |
| STORAGE-005 | Missing source retains latest body | UI missing state and packaged deletion/reload proof |
| STORAGE-006 | SQLite identity uniqueness and duplicate-import tests | Current native execution plus UI concurrent/repeated import test |
| STORAGE-007 | Reparse/path/scope checks | Registered IPC denial and packaged traversal evidence |
| STORAGE-008 | SQLite catalog and encrypted bodies reopen in source tests | Current native run, packaged restart and protected-key evidence |
| STORAGE-009 | Pointer receipts carry identity/hash/revision/time | Durable export/lineage API and UI round-trip |
| STORAGE-010 | Typed native errors exist | Pointer-specific renderer denial/retry states and QA |
| RAG-001 | Snapshot/source hashes and extractor version | Durable per-document ingestion receipt through current UI/runtime |
| RAG-002 | Text/code support; extractor-required status for PDF/Office/image | Format matrix runtime and user-visible unsupported status |
| RAG-003 | Chunk source/version/hash and byte/line spans | Current native receipt and citation projection, page provenance |
| RAG-004 | Rank/score/chunk path output | UI citations linked to pointer revision and live native run |
| RAG-005 | Stable lexical ordering and hash tests in source | Re-run native executable and reload at frozen revision |
| RAG-006 | Content hashes/version IDs | Incremental persisted index and changed-document-only test |
| RAG-007 | Fresh scans omit deleted files | Pointer tombstone/index integration and retained-snapshot test |
| RAG-008 | Sensitive-path, key-content and reparse filters | Current native run plus packaged grant/index audit |
| RAG-009 | Bounded retrieval options and omission totals | Settings-to-native budget binding, compaction receipt, provider tokenizer accounting |
| RAG-010 | Explicit invalid query/scope/permission/index errors | Renderer unavailable/error states and negative runtime evidence |

## Verification run in this audit

The following renderer/domain tests were run against the current checkout:

```text
npm.cmd test -- --run \
  src/domain/rag-provider-local-adapter.test.ts \
  src/domain/rag-provider-contract.test.ts \
  src/domain/virtual-pointer.test.ts \
  src/domain/retrieval-request-receipt.test.ts --reporter=dot

exit 0 — 4 files, 16 tests passed
```

These tests prove local contract validation and deterministic adapter behavior;
they do not execute the Tauri command, Windows picker, encrypted native store,
packaged renderer, or a provider network. Cargo was not started in this audit so
the repository's serialized native build slot remains available to the root
integrator. Existing source tests were inspected, not counted as a current
native executable receipt.

## Recommended atomic implementation slice

Build one original `src/rebuild` project-pointer projection before exposing broad
RAG controls:

1. Bind an explicit native `projectId` to the selected unified Chat session; a
   `cwd` alone is not pointer authority.
2. Add a fresh pointer controller/view that calls the typed desktop methods,
   handles cancel/denied/disconnected/missing/stale/conflict states, and renders
   identity, revision, hash, source status and immutable receipt history.
3. Refresh only a selected project with one bounded in-flight operation; discard
   stale replies on project/session changes and never claim OS watching from
   polling.
4. Run a disposable fixture through import → rename → content update → delete →
   restart/readback, including replacement, denied, reparse and stale-revision
   negatives; capture packaged UI and native receipt.
5. Connect RAG only after project scope exists. Start with native run-scoped
   lexical admission and inspectable selected/omitted receipts. Keep the
   `not_admitted` receipt path visibly separate from provider context.

Minimum evidence for the first promotion is one pointer completed through that
mutation/reload flow with matching native identity/hash/revision in the new UI;
the full twenty criteria require the remaining native/runtime/provider evidence.

## Source hashes at audit time

| Path | SHA-256 |
| --- | --- |
| `src-tauri/src/project_file_pointers.rs` | `40073eb6fa4514b2996aca6c534c3f6a5b3aae1d0f13709a0875b6d87f77dd3d` |
| `src-tauri/src/workspace_indexer.rs` | `4289e151271203a5ada518205b62cf71b186a0bb930068033342001a707fb251` |
| `src-tauri/src/run_retrieval.rs` | `c6bba74eab73dd375e04d9cb2fcf2900b02267d9e6b2c5a0d68ed8451a79927f` |
| `src-tauri/src/native_commands.rs` | `ee5c3fb5d7344575a2a1ac0659d1ffe67213746ed0f5334669f0e824e41f1cd1` |
| `src-tauri/src/storage.rs` | `3b58e2183dc99352d4176d81b44ee692885590998698ea527015991811e59583` |
| `src-tauri/src/lib.rs` | `c9bb1d8c58d953cff62f9bae78e4d8dd905a4365d136a60ca659ef88d9265d8a` |
| `src/lib/desktop.ts` | `5f9c5fa575badaf43d2febdfe594190ce11cb714e6545857e316a501d25b5849` |
| `src/rebuild/chat/chat-controller.ts` | `4e7df585c834ec22bccab5a3b2bd53937b5c65d23df1795b57b2dee79ebae24c` |
| `src/rebuild/ide/ide-access.ts` | `0f1aaef60e1e2ebb4d25ac73bad419075307db4b37691907ff010adff5869389` |
| `docs/storage-schema.sql` | `93ef8d1f22cafdf9ea3f476559248a256010b97325edc050a3cce5fab279367c` |

The root integrator must rehash these files after any edits before attaching this
audit to a Done claim.

