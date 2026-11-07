# Omnia quality strategy

Status: proposed foundation contract  
Target: Windows 11 chat-first desktop application  
Last updated: August 12, 2026

This document turns Omnia's product, harness, UI, and security requirements into an executable test and release strategy. It does not mark a capability as shipped merely because its future tests are described here. Evidence must come from the current commit and a named environment.

## 1. Quality objective

Omnia's first release is a trustworthy chat workbench, not a demo of many disconnected screens. The test program therefore optimizes in this order:

1. preserve user data, drafts, branches, run provenance, and recoverability;
2. prevent secret disclosure, permission bypass, and cross-project context leakage;
3. prove that the harness sends the intended context and parameters and reports omissions honestly;
4. make core chat interactions correct, accessible, and responsive on Windows 11;
5. prevent output-quality regressions across providers, languages, long context, files, memory, and skills;
6. package and update the native application without changing the promises made by the UI.

Any data loss, secret exposure, cross-project context leak, permission bypass, unrecoverable migration, or silent context/parameter truncation is release-blocking regardless of aggregate score or feature count.

## 2. Evidence levels and status language

Every feature and release checklist item must use one of these evidence levels:

| Level | Meaning | Required evidence |
|---|---|---|
| Specified | Normative behavior exists in documentation. | Requirement ID and source document. |
| Implemented | A user-reachable path exists. | Code reference and local smoke evidence. |
| Automated | Deterministic tests exercise success plus relevant denial/failure paths. | Test name and CI result. |
| Verified | It passes the complete phase gate in a supported Windows environment. | Build identifier, environment, result, and retained artifacts. |

Screenshots and manual demonstrations are evidence for visual behavior only. They do not prove persistence, security, context fidelity, provider conformance, cancellation, or crash recovery.

## 3. Test architecture

### 3.1 Static and supply-chain checks

Run on every pull request:

- TypeScript strict type checking and production renderer build;
- Rust formatting, Clippy with warnings denied, and native unit tests;
- checked-in SQLite schema validation;
- dependency and secret scanning once the corresponding approved tools are selected;
- manifest/capability review whenever Tauri permissions change;
- license and SBOM generation before distributable release candidates.

Static checks are necessary but cannot substitute for behavior tests. A Tauri command must have denial-path tests even if its request types compile.

### 3.2 Domain and state-machine tests

Pure domain tests are the fastest release-defense layer. Use table-driven tests and property-based tests for:

- ULID parsing, sorting, invalid alphabets, timestamps, and collision resistance assumptions;
- immutable conversation trees, edit-as-fork, branch path resolution, retry siblings, and deletion/archive invariants;
- legal and illegal run/attempt transitions, exactly one terminal outcome, monotonic event sequence, and outcome-unknown retry prohibition;
- parameter inheritance, provider capability filtering, unsupported-field rejection, and exact effective-diff generation;
- context budgeting, deterministic ordering, scope isolation, declared omission, citations, and stable hashes;
- memory scope/provenance/expiry/contradiction rules and temporary-chat exclusion;
- skill version pinning, trust state, permission diffs, and inability of content to grant capabilities.

Use generated inputs to explore transition graphs and context boundaries, but retain a small human-readable corpus for every invariant so failures are understandable.

### 3.3 Renderer component and integration tests

Vitest and Testing Library cover behavior below the native window boundary:

- accessible name, role, state, live-region, keyboard order, and focus restoration;
- composer draft, send/newline policy, IME composition, queueing, attachments, model switches, and unsupported controls;
- streaming rendering, stop, continue, retry, branch navigation, scroll anchoring, and jump-to-latest;
- empty/loading/partial/offline/denied/error/recovery states;
- dialogs and destructive confirmations, including exact target and recovery consequence;
- safe Markdown, links, citations, code, table, artifact, and provider-error rendering;
- project, memory, skill, provider, search, command-palette, and settings state transitions.

Prefer assertions on user-visible semantics over component internals or broad snapshots. Use focused snapshots only for stable serialized contracts.

### 3.4 Native service and IPC tests

Rust tests exercise repositories, migrations, path grants, secrets, provider egress, and normalized run events without a WebView. Every command receives tests for:

- valid request and stable typed response;
- malformed, oversized, missing, stale, duplicate, and unauthorized input;
- renderer inability to request an arbitrary path, URL, SQL statement, secret value, or process;
- cancellation and concurrent callers;
- redacted errors with a diagnostic ID and no sensitive payload;
- deterministic protocol serialization consumed by TypeScript contract fixtures.

Use temporary directories and isolated test profiles. Tests must never inspect or mutate the developer's real Omnia profile, Windows Credential Manager entries, provider accounts, or workspace folders.

### 3.5 Contract and provider conformance tests

Maintain a shared adapter suite that every native or custom provider implementation must pass:

- catalog discovery and stale-catalog fallback;
- exact role, multimodal content, tool, response-format, safety, reasoning, and parameter mapping;
- explicit rejection of unsupported parameters and attachment kinds;
- fragmented SSE/JSON frames, UTF-8 boundaries, usage, citations, finish reasons, malformed events, stalls, and response-size limits;
- cancellation before dispatch, after acceptance, before first token, and mid-stream;
- idempotency and retry classification, especially outcome unknown;
- authentication, TLS, redirect, proxy, rate-limit, context-limit, and provider-error normalization;
- credentials absent from requests to redirected or unapproved destinations, fixtures, logs, snapshots, and diagnostics.

CI uses deterministic local mock servers and recorded synthetic protocol fixtures. Fixtures must be authored for the repository and contain no captured credentials or private prompts. Live-provider tests are opt-in, budget-capped, tagged by provider/model/date, and never required for offline development.

### 3.6 End-to-end desktop tests

Browser preview is useful for renderer iteration but is not release evidence for a Windows desktop app. Desktop E2E must launch the packaged or production-mode Tauri application in a clean Windows 11 test profile and cover these P0 journeys:

1. install or launch, finish onboarding, add a BYOK provider, discover/select a model, and send a message;
2. stream, scroll away, stop, retain the partial answer, continue/retry, edit into a branch, and navigate both branches;
3. restart during a saved draft and during a partial run, then verify recovery without duplicate user messages;
4. create a project, add a read-only workspace folder, index a file, inspect injected chunks/citations, revoke access, and prove the source was not changed;
5. compare two to four models from one frozen logical input and verify independent provenance/usage;
6. create/review/enable memory and a skill, inspect exact use, disable/forget them, and prove temporary-chat isolation;
7. search and open an exact message on a non-active branch, export, back up, restore, archive, delete, and recover where promised;
8. exercise keyboard-only onboarding, chat, project, memory, skills, settings, permission prompts, and destructive dialogs.

Run smoke E2E on every merge after the native test harness exists. Run the full matrix nightly and on release candidates.

### 3.7 Fault injection and recovery

For persistent operations and runs, inject failure before and after every durability boundary:

- user-message and draft commit;
- context snapshot freeze;
- provider dispatch and remote acceptance;
- first token, arbitrary partial token/frame, usage, and terminal event;
- attachment/blob write, index commit, artifact commit, memory proposal, and projection update;
- migration backup, each migration transaction, integrity verification, and key rotation.

Fault classes include process kill, renderer reload, app restart, network drop/stall, cancellation race, disk full, locked file, corrupt WAL/blob, revoked folder permission, timeouts, duplicate/reordered events, and concurrent streams. After recovery, assert the durable state and user-visible explanation, not only that the app relaunches.

### 3.8 Security and hostile-input tests

Maintain adversarial suites for:

- secret canaries injected into every credential field, then scanned across database, WAL, logs, diagnostics, exports, clipboard operations created by Omnia, crash records, events, memory, skills, and UI snapshots;
- redirect credential leakage, DNS rebinding, private/metadata addresses, local-network approval, decompression bombs, oversized/stalled responses, and malformed streams;
- Markdown/HTML/script injection, unsafe protocols, artifact isolation, filename spoofing, bidi/control characters, and untrusted model/provider metadata;
- path traversal, UNC and device paths, Windows alternate data streams, reserved names, long paths, case folding, symlink/junction escape, TOCTOU replacement, and revoked grants;
- archive traversal, nested archives, enormous entry counts, document parser bombs, XML entity expansion, malformed databases, and unsafe imports;
- prompt injection in files, retrieved text, memory, skills, web/tool results, and citation metadata; untrusted content must never expand permissions.

Security tests use recognizable synthetic canaries and assert absence as well as redaction. Never use a real key as a test value.

### 3.9 Accessibility, localization, and visual testing

Automated accessibility checks run on the component library and representative complete screens. Manual release-candidate passes cover Narrator, keyboard only, visible focus, high contrast, 200% text scaling, reduced motion/transparency, and system/light/dark themes.

The visual matrix covers 800 x 600 plus logical widths 1,024, 1,440, and 1,920 in light and dark themes. Include empty, loading, populated, streaming, partial, offline, denied, error, long content, and open-overlay states. A baseline update requires human review and a reason; it is never an automatic response to a diff.

Use representative Vietnamese, English, combining marks, emoji, RTL samples, long unbroken text, locale-aware numbers/currency/time, IME composition, dead keys, and 40% string expansion. Status must not depend on color alone.

The renderer now exposes a development-only deterministic fixture at `/__visual`. The fixture accepts typed `screen`, `state`, `theme`, `density`, `motion`, `scale`, `locale`, and `overlay` parameters. Its data is repository-authored and frozen; visual automation must fail if the fixture calls a provider/native command, requests an external origin, emits a console error, overflows the viewport, exposes duplicate IDs, or produces serious/critical WCAG violations.

The Windows Chromium lane is defined by `playwright.visual.config.ts` and `tests/visual`. Run it with:

```powershell
npm run test:visual:install
npm run test:visual:contract
npm run test:visual
```

Screenshot baselines are reviewed source artifacts, not disposable test output. Updating them is an explicit local operation and requires a written reason:

```powershell
npm run test:visual:update -- --reason="Describe the reviewed UI change"
```

The update command is disabled in CI and writes a local evidence receipt with screenshot hashes under `artifacts/visual`. A baseline must never be updated merely to make a failed comparison green. Review the previous image, new image, and diff; retain Playwright traces/screenshots for failures. The browser lane verifies the renderer fixture only. Packaged Tauri/WebView2, Windows DPI, Narrator, IME, native dialogs, high-contrast desktop behavior, and multi-monitor recovery remain separate release-candidate evidence.

### 3.10 Performance and endurance

Performance tests use versioned fixtures and a documented Windows 11 reference machine. Report median, p95, sample count, warm/cold state, build mode, and measurement date. Release targets from the product specification are:

- warm interactive shell p95 <= 1.5 seconds;
- cold launch p95 <= 3 seconds excluding first-install OS/runtime cost;
- local send feedback <= 100 ms and smooth streaming on a 60 Hz-capable display;
- indexed search across 10,000 conversations p95 <= 300 ms;
- responsive composer at 200,000 characters;
- a 5,000-message thread without rendering the full tree.

Add endurance scenarios for multi-hour streaming, 50 concurrent compare candidates through mocks, large imports, repeated restart/recovery, index rebuild, and a storage corpus near configured limits. Track memory, handles, threads, database/WAL size, renderer long tasks, dropped frames, and event backlog.

### 3.11 Output-quality evaluation

Quality evaluation is separate from implementation correctness. Maintain versioned golden and adversarial sets for:

- ordinary instruction following and instruction hierarchy;
- Vietnamese and multilingual prompts;
- long-conversation compaction and exact constraint retention;
- grounded document QA and citation-span accuracy;
- image/document inputs and structured JSON/schema output;
- conflicting memory, skill selection, and prompt injection;
- provider fallback, partial streams, and model-specific capability behavior.

Each case stores dataset version, exact frozen inputs, provider/model snapshot, parameter set, scorer version, and result provenance. Prefer deterministic validators for schemas, citations, required facts, and invariants; calibrate model judges against blinded human review. Never fail a product build solely because a live model changed without first separating harness regression from provider-model drift.

## 4. Test data and fixture policy

- Generate synthetic conversations, documents, folder trees, secrets, provider payloads, and identities.
- Keep fixtures deterministic, versioned, small by default, and capable of expansion through seeded generators.
- Store large/performance corpora outside ordinary unit-test checkout or generate them reproducibly.
- Include Unicode, Windows path, empty, boundary, maximum-size, duplicated, stale-version, and corrupt variants.
- Never commit real credentials, signed URLs, personal prompts, customer documents, absolute developer paths, or captured private traffic.
- Each migrated schema version retains a golden database fixture plus checksums and expected post-migration invariants.

## 5. CI and release lanes

| Lane | Trigger | Blocking evidence |
|---|---|---|
| Pull request | Every PR | Renderer type/tests/build; Rust fmt/Clippy/tests; SQLite schema validation; changed contract fixtures. |
| Main branch | Every merge | PR lane plus native smoke and deterministic mock-provider journey when available. |
| Nightly | Scheduled | Full adapter suite, desktop E2E, fault subsets, accessibility scan, large-corpus and leak checks. |
| Release candidate | Signed candidate | Clean Windows VM install/upgrade/uninstall, migration matrix, recovery, full security/accessibility/performance/visual suite, backup restore, SBOM and signature verification. |
| Live provider | Manual or protected schedule | Opt-in conformance and quality smoke with explicit provider, model, region, budget, and secret broker. |

All blocking jobs fail closed. A flaky test is a defect: quarantine requires an owner, issue, reason, expiry, and non-flaky replacement coverage for release-blocking behavior. Retry may diagnose infrastructure; it must not turn a genuine first-run failure green without recording it.

An unsigned internal/developer preview is a distinct pre-release lane, not a release candidate. It still requires a frozen source revision or immutable source manifest, full local renderer/native/schema gates, successful packaging, artifact hashes, and packaged Windows smoke. It may omit public signing/updater/clean-VM breadth only when the artifact is explicitly labeled internal, unsigned, and non-production. Preserved demo binaries or a browser preview never satisfy this lane.

## 6. Phase gates

### Phase 0 - foundation

- renderer and native compile cleanly with warnings treated as failures;
- unit tests cover protocol serialization, domain state machines, browser-safe bridge behavior, and deterministic mock streaming/cancellation;
- schema validation runs in CI and storage migrations have rollback/recovery fixtures once persistence is active;
- Tauri capability allowlist is reviewed and the renderer cannot access arbitrary native capabilities;
- the development Windows build launches, streams, cancels, and closes without leaked background work;
- specifications clearly distinguish mock/preview behavior from shipped provider functionality.

### Phase 1 - core chat

- native and custom-provider adapters pass the shared conformance suite;
- the chat lifecycle E2E path passes, including restart, offline, cancellation races, partial recovery, retry, branches, queue, and search;
- no draft loss, duplicate visible user message, branch corruption, secret leak, or silent parameter loss occurs in the fault matrix;
- rich renderers pass hostile-content and accessibility suites;
- all applicable sections 1-7, 11, 13, and 14 of `ui/phase-1-acceptance.md` have retained evidence.

### Phase 2 - projects and grounded context

- canonical read-only grants withstand Windows path, symlink/junction, revocation, and TOCTOU tests;
- extraction, indexing, chunking, budgeting, omission disclosure, and citations pass deterministic corpora;
- every injected chunk has exact visible provenance and no cross-project result appears;
- document/archive hostile-input and large-file recovery suites pass.

### Phase 3 - power-user chat

- presets/templates/assistants retain immutable version provenance;
- provider-specific advanced parameters round-trip or reject explicitly;
- compare candidates share a frozen logical input while attempts, usage, and promotion remain independent;
- exports/imports/replay and evaluation bundles reproduce all deterministic inputs.

### Phase 4 - memory and skills

- memory and skill lifecycle, provenance, scopes, versions, review, permission diffs, and temporary-chat isolation pass;
- malicious or retrieved content cannot enable a skill, grant a capability, or cause a memory write outside policy;
- precision/utility and selection benchmarks meet thresholds recorded before release-candidate testing.

### Phase 5 - Chat Complete 1.0

- every P0 user journey is implemented and verified on a clean supported Windows 11 environment;
- the migration matrix covers every supported prior version plus interrupted/corrupt/disk-full cases;
- security, accessibility, performance, visual, endurance, backup/restore, install/update/rollback/uninstall, and deletion-verification gates pass;
- zero open release-blocking defects and no expired test quarantine remain;
- the release evidence manifest points to exact build hashes, environments, test reports, screenshots/traces, and sign-off owners.

IDE, terminal, browser automation, computer use, file mutation, and coding-agent execution remain outside this gate unless separately implemented and tested behind an explicit preview boundary.

## 7. Release evidence manifest

For each release candidate, retain a machine-readable manifest containing:

- commit, source lockfile hashes, application version, installer hash, signature identity, and build timestamp;
- Windows edition/build, architecture, locale, scaling, WebView2 version, CPU, memory, storage type, and GPU;
- test suite and fixture versions, command, result, duration, retry/quarantine status, and artifact locations;
- supported upgrade sources and the observed migration/rollback result for each;
- provider/model/date for opt-in live tests without secret or prompt contents;
- known limitations, accepted non-blocking defects, owners, and expiry dates;
- final security, QA, accessibility, product, and release-engineering sign-off.

The manifest must not include credentials, raw private prompts/documents, machine usernames, personal absolute paths, or unredacted network payloads.

## 8. Defect severity and stop-ship policy

| Severity | Definition | Release rule |
|---|---|---|
| Blocker | Data loss; secret exposure; cross-project leak; permission bypass; arbitrary code/path/network access; unrecoverable migration; silent context/parameter corruption; signed-update compromise. | Stop work on release, preserve evidence, fix root cause, add regression test, rerun affected full matrices. |
| Critical | Core P0 journey unusable; crash loop; inaccessible primary workflow; cancellation/retry can duplicate or misattribute messages; backup/restore promise broken. | No release candidate approval. |
| Major | Important behavior has a safe workaround; provider/model-specific P0 degradation; severe visual or performance regression. | Requires owner and fix before 1.0 unless explicitly removed from supported scope. |
| Minor | Cosmetic or low-impact issue that does not mislead, lose data, weaken security, or block accessibility. | May ship with documented owner and target. |

Closing a blocker or critical issue requires a regression test at the lowest useful layer plus user-level evidence when the defect crossed subsystem boundaries.

## 9. Immediate implementation order

1. Keep the pull-request lane green: typecheck, renderer tests/build, Rust fmt/Clippy/tests, and schema validation.
2. Add domain tests for run/attempt transitions, event ordering, conversation edit/fork, IDs, parameters, and context scope.
3. Build a deterministic mock-provider server with fragmentation, delays, malformed events, cancellation, usage, and typed failures.
4. Add renderer integration tests for the critical composer/stream/stop/recovery path and provider onboarding validation.
5. Add isolated native repository, migration, secret-canary, workspace-grant, IPC, and provider-egress tests.
6. Establish packaged Windows smoke automation and a clean test-profile reset mechanism that never touches real user data.
7. Add nightly fault, accessibility, visual, leak, and large-corpus suites.
8. Establish the versioned output-quality corpus and baseline before enabling auto-routing, memory, or generated skills.

This ordering gives later IDE, browser, computer-use, and coding-agent work a proven security, provenance, recovery, and evaluation substrate instead of a separate QA model.
