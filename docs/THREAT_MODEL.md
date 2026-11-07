# Omnia security threat model

Status: normative security contract; implementation evidence is tracked separately  
Last reviewed: 2026-08-13  
Scope: Windows 11 desktop, Omnia Kernel, chat and research, IDE and terminal,
browser and authorized content capture, computer use, persistent/isolated/remote
execution, web/CLI/Android clients, providers, memory, skills, plugins, and
multi-agent orchestration

This document defines the security properties Omnia must preserve while growing
from a local desktop chat application into a unified workbench. It intentionally
models the complete target architecture. A control described here is not evidence
that the current source implements it. Current implementation deltas are listed
in section 16 and remain release blockers until verified.

The threat model uses STRIDE categories, abuse cases, data-flow boundaries, and
capability-specific release gates. Security decisions are enforced by trusted
native code and operating-system boundaries. Model output, provider responses,
retrieved pages, attachments, repositories, memories, skills, plugins, tool
output, and renderer state are all untrusted input.

## 1. Security objectives

Omnia prioritizes these properties in order:

1. **User authority:** no model, agent, page, document, skill, plugin, remote
   client, or provider can grant itself authority or broaden an existing grant.
2. **Exact intent:** side effects execute only when their canonical operation,
   arguments, environment, subject version, policy version, and approval still
   match what was evaluated.
3. **Compartmentalization:** untrusted code and content cannot silently cross
   project, profile, workspace, execution-environment, browser-session, or
   remote-client boundaries.
4. **Secret confidentiality:** credentials and key material remain behind opaque
   handles and are released only to a narrow, policy-approved native operation.
5. **Content confidentiality:** prompts, source files, media, research, memories,
   embeddings, screenshots, terminal output, and telemetry go only to destinations
   explicitly permitted by the effective privacy policy.
6. **Integrity and provenance:** a user can determine what instructions, context,
   model, tools, source versions, approvals, and outputs produced a result.
7. **Safe availability:** cancellation, quotas, timeouts, crash recovery, and
   bounded parsing prevent one task from exhausting or corrupting the workbench.
8. **Truthful failure:** the product fails closed and reports omissions or denied
   powers; it never pretends an action, citation, deletion, backup, or isolation
   guarantee succeeded without matching evidence.

Any secret disclosure, unauthorized side effect, cross-project context leak,
silent permission expansion, sandbox escape, unrecoverable migration, approval
replay, or unsigned update execution is a stop-ship defect.

## 2. Scope, assumptions, and explicit non-goals

### 2.1 In scope

- Tauri/WebView desktop renderer and typed native IPC.
- Local profile database, encrypted content store, search indexes, caches, logs,
  backups, exports, and purge jobs.
- BYOK and custom provider profiles, local model runtimes, proxies, DNS/VPN
  profiles, model discovery, streaming, and telemetry.
- Workspace grants, indexing, retrieval, editor, terminal, Git, package managers,
  coding agents, subagents, and generated artifacts.
- Edge Canary integration through an explicit browser broker or extension/native
  messaging boundary.
- Authorized file/document/media retrieval, lazy-page traversal, HLS/DASH
  segment capture, deterministic merge, retry, and provenance.
- Computer use and narrowly brokered Windows administrative operations.
- Persistent, isolated, and remote execution environments selected by `Auto` or
  explicitly by the user.
- Authenticated web, CLI, Android, tablet, and remote-control clients.
- Automatic/versioned memory, skills, plugins, MCP/tool servers, adaptive routing,
  evaluations, and future learning-based orchestration.

### 2.2 Assumptions

- Windows, WebView2, cryptographic libraries, and the Windows user account are
  patched and functioning as documented.
- The interactive user is authorized to access the selected accounts, files,
  sites, networks, and machines.
- UAC secure-desktop prompts are trusted operating-system interactions; Omnia
  cannot approve them on the user's behalf.
- A remote client is untrusted until mutually authenticated and explicitly paired.
- Provider and web content can be malicious even when obtained over valid TLS.

### 2.3 Non-goals and hard boundaries

Omnia does not claim to protect secrets from malware already executing as the
same Windows user, an attacker with administrator/kernel access, a compromised
firmware stack, or a user who deliberately reveals a secret. It reduces exposure
and leaves auditable evidence, but it is not an endpoint-detection product or an
enterprise non-repudiation system.

The product must not implement or market:

- reading, exporting, or silently retrieving passwords from Edge's password
  vault; browser autofill, Windows Hello, or explicit user interaction must be
  used instead;
- CAPTCHA solving or anti-bot/stealth evasion; challenges require an interactive
  handoff to the user;
- DRM circumvention, access-control bypass, or capture of content the user is not
  authorized to retrieve;
- covert region/access-restriction evasion; DNS, proxy, VPN, and tunnel profiles
  are explicit network configuration with visible destinations and policy;
- silent escalation to administrator, `SYSTEM`, or `TrustedInstaller`, or hidden
  changes to registry, policy, services, drivers, security controls, or accounts;
- disabling security monitoring, site protections, browser protections, or
  organizational policy to make automation harder to detect;
- a promise that deleting encrypted data produces forensic erasure from SSDs,
  backups, remote providers, or third-party systems.

## 3. Assets and data classification

| Class | Examples | Default handling |
|---|---|---|
| S0 — key material | provider/API credentials, OAuth refresh tokens, cookies, recovery keys, signing keys, database keys, blob DEKs | Never sent to renderer, model, logs, memory, telemetry, exports, or arbitrary tools; opaque handles only |
| S1 — highly sensitive content | private source, unpublished research, personal files, screenshots, terminal output, browser pages, remote screen/audio, document/media bodies | Local-only unless an exact destination is allowed; encrypted blob storage; redacted diagnostics |
| S2 — sensitive derived data | embeddings, code index, knowledge graph, memories, context snapshots, prompts, model outputs, citations, usage/cost ledger | Scope-bound and provenance-bound; remote processing requires disclosure |
| S3 — security metadata | grants, approvals, audit chain, environment policy, device pairings, capability hashes, signed manifests | Integrity protected; minimal content; append-only where applicable |
| S4 — ordinary metadata | titles, model catalog, UI preferences, non-sensitive status | Bounded and validated; still private by default |
| S5 — public data | public documentation intentionally saved as public | Normal integrity and provenance controls |

Classification is monotonic within a run: derived data inherits the highest
sensitivity of its inputs unless an explicit, audited declassification process
proves otherwise. A model cannot declassify data.

## 4. Actors and adversaries

- **Authorized local user:** can make mistakes or approve an ambiguous request;
  UX must show exact targets, consequences, and recovery options.
- **Compromised renderer/webview:** can call any exposed IPC command, replay UI
  state, fabricate IDs, and display deceptive content.
- **Malicious prompt/content author:** uses prompt injection in pages, PDFs,
  images/OCR, repositories, issue text, tool output, memories, or messages.
- **Malicious provider/custom endpoint:** attempts SSRF, credential theft,
  redirects, decompression bombs, malformed streams, or poisoned model metadata.
- **Malicious repository/package/build script:** attempts filesystem escape,
  secret discovery, persistence, lateral movement, or dependency confusion.
- **Malicious skill/plugin/MCP/tool server:** understates capabilities, changes
  after approval, fabricates tool output, or acts as a confused deputy.
- **Remote network attacker:** attacks pairing, remote-control streams, APIs,
  replay protection, TLS termination, discovery, or tunnel configuration.
- **Same-user local malware:** can read much of the user's account and interact
  with windows; Omnia limits additional secret copies and privileged brokers.
- **Supply-chain attacker:** compromises a dependency, build runner, update,
  extension marketplace, model artifact, or signing process.
- **Resource-exhaustion attacker:** supplies huge/deep archives, infinite streams,
  fork bombs, media playlists, terminal escape sequences, or agent loops.

## 5. Trust zones and data flow

```text
Z0  User + Windows secure desktop / UAC / Windows Hello
 |       approval decision, browser sign-in, device pairing
 v
Z1  Desktop/Web/CLI/Android presentation clients       [untrusted clients]
 |       authenticated, typed, versioned commands/events
 v
Z2  Omnia Kernel policy core                           [trusted decision point]
 |-- capability broker + approval verifier
 |-- secret broker + provider/browser/privilege brokers
 |-- run graph + immutable snapshots + audit journal
 |-- environment scheduler (`auto|persistent|isolated|remote`)
 |
 +--> Z3 Local durable services                         [trusted, sensitive]
 |       SQLite metadata, encrypted blobs, indexes, memories, skills
 |
 +--> Z4 Execution environments                        [least trusted compute]
 |       persistent local | isolated disposable | remote
 |
 +--> Z5 Edge Canary/browser broker                    [session-sensitive]
 |
 +--> Z6 Providers, websites, MCP/tool servers         [external/untrusted]
 |
 +--> Z7 Paired remote clients/relay                   [hostile network]
 |
 +<-- Z8 Files, archives, media, repositories, skills  [untrusted content]
```

The kernel is the only policy decision point. Clients may request operations and
display decisions, but they cannot mint grants, resolve approvals, unwrap secrets,
or select a less restrictive execution environment without native validation.
External and execution components never receive a general kernel/database/vault
handle.

## 6. Mandatory security invariants

### 6.1 Authority and capability invariants

1. Content and model output are data, never authority.
2. Every non-pure operation maps to one or more explicit capabilities, including
   read, write, execute, network, browser, computer, secret use, remote control,
   package installation, and privileged Windows actions.
3. Capabilities are deny-by-default and scoped by profile, project, run, subject,
   immutable subject/version hash, environment, target, operation, data class,
   time, and quantitative limits.
4. A broader capability never satisfies a request merely by string prefix or
   hierarchy. Capability implication is an allowlisted native relation.
5. Grants do not travel with prompt text, copied conversations, imported skills,
   artifacts, or remote messages.
6. Revocation prevents new operations immediately and cancels or quarantines
   in-flight work when safe. Derived indexes and cached handles are invalidated.
7. An agent or subagent receives a subset of its parent's effective capabilities;
   it cannot delegate more authority than it holds.
8. `Auto` chooses an environment only inside policy; it never silently changes
   isolation, mounts, network, privilege, persistence, or remote destination to
   make a task succeed.

### 6.2 Approval invariants

An approval receipt is valid only when it binds all of the following:

- profile and authenticated client/user session;
- run, attempt, iteration, tool call, and agent identity;
- tool/skill/plugin executable digest and capability-manifest digest;
- canonical operation type and canonical arguments hash;
- exact paths, destinations, data classes, and side-effect summary;
- execution-environment ID plus environment-policy/version hash;
- grant/policy revision and relevant source/context snapshot IDs;
- issue time, expiry, decision, decision actor, nonce, and audit linkage.

The broker recomputes canonical hashes immediately before dispatch. Any material
change, expiry, environment replacement, subject upgrade, policy change, path
retargeting, redirect, or TOCTOU mismatch invalidates approval. `Allow once` is
single-consumption. `Allow for run` is limited to the same run and a declared
operation template; it is not an unrestricted session grant. High-risk privilege,
credential export, security-setting changes, account changes, persistent remote
access, and destructive bulk actions require per-operation confirmation.

Approval UI must not accept model-authored labels as the source of truth. Native
code renders the operation summary from canonical structured arguments and shows
the real path/destination, privilege, persistence, data exposure, and rollback.

### 6.3 Filesystem and process invariants

- Renderer and models use durable IDs and grant-relative paths, never arbitrary
  raw host paths.
- Every access reopens and revalidates the target beneath the canonical grant at
  use time. Windows reparse points, junctions, symlinks, mount changes, alternate
  data streams where relevant, and hard-link/replace races are handled explicitly.
- Write operations use safe staging, expected-version/content hashes, fsync where
  required, atomic replace, conflict reporting, and rollback/patch provenance.
- Commands are structured executable + argument arrays. Untrusted text is never
  concatenated into a shell command. Shell execution is a separate capability.
- Process trees receive job-object limits, cancellation, bounded output, explicit
  environment variables, a safe working directory, and no inherited secret handles.
- Terminal output is treated as untrusted bytes: control/escape sequences that can
  change UI state, clipboard, links, or terminal configuration are filtered or
  rendered inert unless deliberately supported.

### 6.4 Secret invariants

- There is no general `get_secret`, `export_cookie`, or password-vault IPC.
- Secrets are pinned to a purpose and normalized destination. They are never
  forwarded across redirects or to a different origin/tool/process.
- Tools receive purpose-specific delegated tokens or brokered operations, not raw
  long-lived credentials whenever the protocol permits.
- Secret-bearing memory, context, logs, crash dumps, screen streams, shell history,
  clipboard operations, diagnostics, and exports are blocked by default.
- Vault/key protection failure is a locked state, never a plaintext fallback.

### 6.5 Provenance and context invariants

- A run snapshot is frozen before provider/tool dispatch and records non-secret
  effective instructions, parameters, provider/model identity, context selections
  and omissions, memory/skill versions, capability/policy versions, and hashes.
- Retrieved content is separated from instructions and labeled with source,
  version, scope, trust, sensitivity, and retrieval reason.
- Citations refer only to chunks present in the frozen context/retrieval snapshot.
- A source update creates a new version. It cannot silently mutate old evidence.
- Conflicting or superseded memory is resolved by version/provenance rules, never
  concatenated blindly. Stale data is surfaced and excluded when policy requires.
- Adaptive routing or reinforcement learning may optimize selection, but it cannot
  learn to weaken security policy, suppress approvals, conceal costs, or broaden
  data sharing. Policy remains deterministic, versioned, reviewable, and outside
  the learned component.

## 7. Execution environment policy

All environments start without administrator rights and without implicit access to
the user's profile, browser data, vault, drives, network drives, or local network.

| Task signal | `Auto` default | Required controls |
|---|---|---|
| Trusted long-lived project, user wants retained dependencies/state | Persistent local | Project-scoped mounts; snapshots; drift ledger; outbound network policy; no ambient secrets |
| Unknown repository, downloaded archive, generated code, package install, document parser | Isolated disposable | Read-only source import; copy-on-write output; no host profile; quotas; disposable credentials; egress deny/default allowlist |
| Pure chat/research without tools | No execution environment | Provider and retrieval policies only |
| Browser task using an authenticated Edge Canary session | Browser broker plus isolated parser | Browser session stays in broker; DOM/network observations are sanitized before agent use |
| Remote/GPU workload | Remote environment only after policy allows destination | Mutual authentication; encrypted channel; disclosed data set; residency/retention policy; remote wipe receipt |
| Windows settings or administrative task | Host privilege broker, never an agent shell | Exact typed operation; UAC; per-operation approval; pre/post-state capture; rollback where possible |

Persistent environments are not inherently more trusted than isolated ones. They
accumulate dependencies, credentials, poisoned caches, and persistence mechanisms,
so they require periodic attestation, drift reports, snapshot/restore, and a clear
reset path. An isolated environment cannot be called isolated until its mount,
network, process, device, clipboard, browser, and secret boundaries are tested on
the supported Windows configuration.

## 8. Threat register

Severity reflects worst credible impact before controls: Critical, High, Medium,
or Low. Each required control must have automated denial/failure tests before the
related capability is advertised.

| ID | Threat / abuse case | Severity | Required controls and verification |
|---|---|---:|---|
| OM-TM-001 | Compromised renderer invokes mutable IPC without completing or preserving the negotiated protocol session | High | Native session token/epoch issued after handshake; every mutable command verifies window identity, protocol generation, expiry, and profile; direct pre-handshake IPC test must fail |
| OM-TM-002 | Renderer requests arbitrary path, URL, SQL, process, secret, or generic method | Critical | Narrow typed commands; unknown-field rejection; IDs/grant-relative paths only; no generic primitives; IPC allowlist and fuzz suite |
| OM-TM-003 | Prompt injection causes a side effect or changes policy | Critical | Content/instruction separation; capability broker; exact approval; model cannot resolve approval; adversarial page/PDF/repository/tool-output corpus |
| OM-TM-004 | Approval is replayed, raced, or reused after arguments/tool/environment change | Critical | Canonical hashes, nonce, environment/policy binding, expiry, single consumption, pre-dispatch revalidation, append-only receipt; concurrency/fault tests |
| OM-TM-005 | Workspace access escapes through `..`, case/Unicode ambiguity, junction, symlink, reparse point, ADS, hard link, or replace race | Critical | Canonical grant-relative resolution, Windows handle-based revalidation, reparse rejection/policy, file identity and expected hash, TOCTOU tests |
| OM-TM-006 | Untrusted code escapes an execution environment or reaches host/user data | Critical | Real OS isolation boundary, least-privilege token, mount/network/device policy, job limits, exploit-response plan, independent sandbox test |
| OM-TM-007 | Persistent environment leaks state or poisoned dependencies into another project/run | High | Environment ownership, scoped snapshots, no cross-project reuse by default, drift/secret scan, reset and quarantine workflow |
| OM-TM-008 | Provider/API/browser/remote credential is exposed to renderer, prompt, tool, log, export, child process, or wrong origin | Critical | Purpose/destination-bound opaque broker, no general read API, zeroization, redaction, redirect denial, secret scanning, canary-secret tests |
| OM-TM-009 | Custom provider performs SSRF, DNS rebinding, mixed-scope DNS, metadata access, or credential redirect | Critical | URL parser, origin pinning, resolved-address classification, metadata/link-local deny, mixed-scope deny, no redirects, re-resolution rules, local-network grant tests |
| OM-TM-010 | Provider or tool stream causes memory/disk exhaustion, parser confusion, duplicate events, or indefinite stall | High | Per-frame/stream/decompression limits, incremental parser, timeouts, cancellation, backpressure, monotonic event IDs, fuzzing |
| OM-TM-011 | Browser integration steals cookies/passwords or exports a user profile | Critical | Explicit Edge Canary attachment; extension/native-messaging scopes; cookies stay in browser; no password DB access; no profile copy; audited session detach |
| OM-TM-012 | Browser automation attempts stealth, CAPTCHA bypass, or unsafe challenge handling | High | Interactive challenge handoff; no anti-detection bypass; visible automation state; rate/policy limits; site-specific disable switch |
| OM-TM-013 | Capture manager retrieves unauthorized/DRM-protected content or bypasses access controls | Critical | User authorization assertion, session-bound request provenance, supported non-DRM formats only, policy/rights notice, deny ambiguous protected streams |
| OM-TM-014 | HLS/DASH/lazy media capture is poisoned by hostile manifests, segment redirects, key URIs, huge segment counts, or merge confusion | High | Manifest/URI origin policy, byte/count/duration limits, content hashes, segment ledger, redirect checks, sandboxed parsers/merger, deterministic output manifest |
| OM-TM-015 | Archive/import uses path traversal, junctions, nested bombs, device names, executable activation, or malformed databases | Critical | Isolated staging, byte/count/depth/ratio limits, path sanitation, no live DB open, hash/manifest validation, commit only after full scan |
| OM-TM-016 | PDF/Office/image/media parser exploits native libraries or active content executes | Critical | Sandboxed parsing, patched allowlisted parsers, macros/scripts/network disabled, time/memory limits, normalized safe previews |
| OM-TM-017 | Model or citation emits a malicious external URI/custom protocol/file path | High | HTTP(S)-only URL normalization, native external-link broker and origin confirmation, no raw `href` for untrusted URI, navigation tests |
| OM-TM-018 | Malicious content becomes durable memory and reinjects instructions or secrets | Critical | Candidate state, PII/secret scan, provenance/trust labels, conflict detection, scoped policy/approval, expiry, reason-visible retrieval, deletion of derivatives |
| OM-TM-019 | Skill/plugin/MCP package changes after approval or understates capabilities | Critical | Immutable digest, signed provenance when available, install/enable/grant/execute separation, declared and observed capability diff, upgrade invalidates grant |
| OM-TM-020 | Subagent becomes a confused deputy or exfiltrates context to another agent/provider | Critical | Delegation is capability subset; per-agent context/data budget; destination policy; parent cannot launder denied operations; complete child event lineage |
| OM-TM-021 | Tool output injects commands, fake approvals, terminal control sequences, or forged result metadata | High | Typed result envelopes, separate display text from control fields, tool identity/signature, terminal sanitization, no parsing authority from prose |
| OM-TM-022 | Computer-use agent silently escalates to administrator, `SYSTEM`, or `TrustedInstaller` or disables security policy | Critical | Typed privilege broker, allowlisted operations, UAC secure desktop, per-operation approval, pre/post state, rollback, protected denylist; never raw privileged shell by default |
| OM-TM-023 | Remote client/session is hijacked, replayed, paired without presence, or retains access after revocation | Critical | Device-bound keys, mutual authentication, short-lived sessions, local-presence pairing, replay counters, granular grants, revocation and rotation tests |
| OM-TM-024 | Remote screen/audio/clipboard stream leaks sensitive windows or data | Critical | Explicit streaming indicator, window/region allowlist, redaction/privacy curtain, pause hotkey, separate clipboard/file grants, encrypted low-latency transport |
| OM-TM-025 | Telemetry, request logs, crash dumps, evaluation traces, or RL datasets capture secrets/private content | Critical | Allowlisted schemas, local-first aggregation, preview/export consent, two-pass redaction, content off by default, retention controls, canary scanning |
| OM-TM-026 | Audit events are modified, truncated, reordered, or omit denied/failed actions | High | Append-only MAC/hash chain, monotonic sequence, durable pre/post events, rotation linkage, integrity verification, no chat/secret content |
| OM-TM-027 | Database/blob metadata is tampered, rolled back, partially committed, or keys are lost | High | Transactional migrations, AEAD with bound metadata, verified backup/restore, anti-rollback/version records where feasible, fail-closed key broker, fault injection |
| OM-TM-028 | Unsigned/tampered update, dependency, model, plugin, or build artifact executes | Critical | Signed releases/updates, reproducible provenance, SBOM, dependency/license/vulnerability policy, digest verification, rollback protection, clean builder |
| OM-TM-029 | Agent loop, fork bomb, huge research task, index, archive, media stream, or remote task exhausts resources/cost | High | Hierarchical token/time/cost/CPU/RAM/disk/network/subagent quotas, circuit breakers, user-visible budget, cancellation and recovery |
| OM-TM-030 | Export/backup/deletion leaks data or falsely claims removal/recovery | High | Encrypted portable backups, restore verification, plaintext export confirmation, sanitized archives, purge ledger, provider/backup limitation disclosure |
| OM-TM-031 | Context intended for one provider/project/profile is routed to another | Critical | Frozen destination and privacy policy, scope checks at compilation and dispatch, effective-context preview, cross-scope tests, no silent fallback |
| OM-TM-032 | Poisoned/stale RAG or lost-in-the-middle behavior makes obsolete facts authoritative | High | Source versions, supersession graph, trust/relevance diversity, explicit omissions, contradiction checks, recency policy, citation-span verification |
| OM-TM-033 | Local model/custom adapter receives broad LAN access or executes adapter code in the kernel | High | Declarative bounded adapters, no arbitrary code in trusted core, destination-specific grants, isolated adapter host, conformance tests |
| OM-TM-034 | DNS/proxy/VPN/tunnel configuration leaks traffic, bypasses policy, or changes destination after approval | High | Explicit profile, resolved route/destination disclosure, kill-switch semantics where promised, DNS leak tests, policy hash bound to run/approval |
| OM-TM-035 | Clipboard, drag/drop, file picker, or paste imports hidden/oversized/sensitive data | Medium | Native picker tokens, size/type preview, explicit attachment state, secret scan, clipboard access only on direct user gesture |
| OM-TM-036 | Malicious page or generated HTML abuses WebView navigation, script, mixed content, opener, or asset protocol | Critical | Restrictive CSP, packaged scripts, sanitized sandboxed previews, empty asset scope, no remote navigation, external-link broker, XSS suite |
| OM-TM-037 | Computer-use perception is spoofed by overlays, stale frames, deceptive prompts, or coordinate drift | High | Fresh frame/target identity, accessibility-tree correlation, secure-desktop boundary, action preview for risky targets, postcondition verification |
| OM-TM-038 | Git/package operations exfiltrate credentials through hooks, config, submodules, package scripts, or credential helpers | High | Isolated defaults, hook/script disclosure, scoped credential broker, sanitized environment, network allowlist, dry-run/lockfile diff |
| OM-TM-039 | Artifact/HTML/SVG/Mermaid/LaTeX preview executes active content or reaches local resources | Critical | Separate sandbox origin/process, scripts and network off by default, sanitizer, resource allowlist, export-time revalidation |
| OM-TM-040 | Learned orchestration/reward signals are poisoned to select unsafe providers/tools or hide failures | High | Offline/versioned training data, signed evaluation sets, security constraints outside optimizer, shadow evaluation, rollback, human-reviewed promotion |

## 9. Surface-specific control requirements

### 9.1 Renderer and native IPC

- Treat each desktop window/web client as a distinct authenticated session.
- Bind mutable commands and subscriptions to the negotiated protocol session and
  profile. Window labels alone are not authentication for remote clients.
- Reject unknown request fields, invalid IDs, oversized collections, stale
  revisions, and impossible state transitions in native code.
- Return stable redacted error codes plus a diagnostic ID. Do not return raw SQL,
  stack traces, provider bodies, host paths, command lines containing secrets, or
  OS error details to untrusted clients by default.
- Keep Tauri/plugin ACLs exact and machine-checked. Installing a plugin does not
  authorize its commands. Any permission diff requires security review.
- Release builds disable developer tools unless an explicit, isolated developer
  mode is enabled. Developer mode is visibly persistent and never carries
  production secrets by default.

### 9.2 Provider and BYOK gateway

- Normalize scheme/host/port/path with one URL implementation and persist the
  normalized origin. Reject user-info, control characters, fragments, and
  sensitive query parameters.
- Public providers require HTTPS. Loopback/LAN endpoints require a conspicuous,
  destination-specific local-network grant.
- Resolve and classify every address; deny metadata, link-local, multicast,
  broadcast, unspecified, reserved, and mixed public/private answers. Pin the
  validated connection and define safe re-resolution behavior for long runs.
- Disable redirects for authenticated calls. Bound connect, header, idle, total,
  response, decompression, frame, model-count, and retry budgets.
- Provider-native extension fields cannot overwrite canonical/security fields and
  must be capability-schema validated. Unsupported values fail before dispatch.
- Model catalog, citations, errors, and usage are untrusted and bounded.

### 9.3 Content ingestion, indexing, and retrieval

- Ingestion begins with a native picker token, browser-capture receipt, or an
  existing grant-relative source—not a renderer-supplied absolute path.
- Hash source bytes before parsing; retain source/version/ownership/sensitivity
  provenance and parser version. Extraction attempts are immutable records.
- Run risky parsers in isolated workers. Apply total bytes, expanded bytes, file
  count, nesting, pixel, page, duration, object, XML entity, and CPU/RAM limits.
- Content bodies use authenticated encrypted blobs. SQLite contains metadata and
  opaque blob IDs; plaintext FTS/vector/thumbnail derivatives require an explicit
  at-rest policy and follow source deletion/revocation.
- Retrieval records selected and omitted chunks with scores/reasons. A citation
  cannot point to an unseen current file or silently move when the source changes.

### 9.4 Browser and authorized capture

- Attach to Edge Canary only after explicit user confirmation. Show profile,
  window/tab, origins, enabled observations, and detach control.
- Prefer a minimal extension/native-messaging protocol over reading the browser
  profile directory. Passwords and general cookie export are out of scope.
- Browser requests and pages remain untrusted. The browser broker exposes bounded
  observations and typed actions, not a raw debugging socket to agents/remote
  clients.
- Request capture stores a redacted ledger: URL/origin, method, media metadata,
  range/segment identity, status, byte/hash, timing, and authorization provenance.
  Headers, cookies, signed URLs, and tokens are secret by default.
- Lazy traversal has page/segment/time/byte/rate limits and visible progress.
  CAPTCHA/challenges pause for the user. Capture never disables protections or
  disguises automation.
- Media merge is deterministic and resumable; each output records manifest hash,
  ordered segment hashes, transformations, gaps, and authorization source.

### 9.5 IDE, terminal, Git, and coding agents

- Reading, editing, deleting, executing, installing, network use, Git remote
  writes, and publishing are separate capabilities.
- Every patch targets an expected file revision/hash. Changed files produce a
  conflict instead of silently overwriting user work.
- Destructive/bulk operations enumerate exact targets after canonicalization.
  Repository root, home directory, drive roots, and unresolved variables/globs
  cannot be recursive destructive targets.
- Untrusted project configuration (`tasks`, hooks, build scripts, language-server
  plugins, dev containers, MCP configs) is not auto-executed on folder open.
- Package installation and build scripts default to an isolated environment and
  show network/filesystem/credential implications.
- Git credentials are brokered for the exact remote and operation. Generated
  commits/PRs retain run and patch provenance without embedding private prompts.

### 9.6 Computer use and privileged Windows operations

Screen control and privilege are separate. A visual agent cannot turn a button
click into durable privilege. Administrative operations use typed brokers such as
`registry.set_value`, `service.configure`, or `firewall.rule.create`, with:

- exact normalized target/value/action;
- documented prerequisite and impact;
- current-state snapshot and desired-state diff;
- policy evaluation and per-operation approval;
- UAC through Windows, never password extraction or automated consent;
- postcondition verification and a durable receipt;
- rollback instructions or an explicit irreversible warning.

Direct `SYSTEM`/`TrustedInstaller` execution is not a routine capability. If a
future legitimate maintenance workflow truly requires a protected service, it
needs a separate ADR, signed minimal helper, fixed operation protocol, independent
review, and clean-VM adversarial testing.

### 9.7 Remote web/CLI/Android control

- Pairing requires local presence or an existing authenticated administrator of
  the Omnia profile. Pairing codes are short-lived, single-use, rate-limited, and
  never sufficient alone without a key agreement.
- Each device has a revocable key and granular permissions: view status, chat,
  approve, terminal, files, screen, input, clipboard, and privileged requests.
- Remote approvals show device identity and cannot approve a local secure-desktop
  UAC prompt. High-risk policy can require local confirmation.
- End-to-end transport encryption, replay protection, certificate/key pinning,
  session expiry, lockout, and audit apply whether direct, tunneled, or relayed.
- Relays learn minimal routing metadata and never hold reusable profile secrets.

### 9.8 Memory, skills, plugins, and multi-agent learning

- Automatic memory defaults to propose or low-risk policy. Secrets, authentication
  material, executable instructions, and untrusted claims never become active
  global memory automatically.
- Memory changes are immutable revisions with evidence, confidence, trust,
  conflict/supersession links, scope, expiry, author, and reason for retrieval.
- Skill/plugin packages have normalized paths, an immutable content digest,
  manifest, requested capabilities, provenance, validation result, and optional
  signature. Editing creates a new version and invalidates content-bound grants.
- MCP/tool schemas are untrusted. The kernel maps them to Omnia capabilities and
  rejects vague or dynamically broadened arguments.
- Subagent creation has explicit depth/count/context/cost ceilings. Each child has
  its own identity, event stream, data scope, and capability subset.
- Evaluation and adaptive routing data are local-first and privacy classified.
  A learned policy is promoted only after offline safety/quality gates and has an
  immediate rollback version.

## 10. Approval and privileged-operation lifecycle

```text
proposed
  -> canonicalized
  -> policy_evaluated
     -> denied
     -> auto_allowed_low_risk
     -> awaiting_user_approval
          -> denied | expired | approved
  -> preflight_revalidated
     -> invalidated (arguments/tool/policy/environment/path changed)
     -> dispatching
          -> cancelled | failed | outcome_unknown | applied
  -> postcondition_verified
  -> receipt_finalized
```

`outcome_unknown` is terminal for automatic retry unless the operation is proven
idempotent and a provider/host idempotency key was bound before dispatch. Approval
does not imply success. The receipt records the observed outcome and verification.

## 11. Audit and telemetry contract

Security audit events contain metadata, not prompt/file/secret bodies:

- event ID, monotonic sequence, protocol/schema version, timestamp;
- profile/client/device/run/agent/environment/tool identities;
- category, canonical operation, capability, policy and subject hashes;
- target/destination classifications or redacted hashes;
- approval ID/choice/actor and result (`allowed`, `denied`, `failed`,
  `cancelled`, `outcome_unknown`, `verified`);
- previous MAC/hash and current MAC/hash.

Write a durable pre-dispatch event before an irreversible external action and a
terminal event afterward. If the journal is unavailable, high-risk operations fail
closed. Rotation carries the previous terminal hash. Audit export is explicit and
redacted; audit integrity does not imply the host was uncompromised.

Usage/performance telemetry can include tokens, cached tokens, reasoning tokens,
TTFT, latency, RPM/TPM, retries, cost, provider/model health, context-selection
statistics, and evaluation scores. Raw prompts, outputs, screenshots, files,
headers, cookies, signed URLs, terminal bodies, and credentials are off by default.

## 12. Data lifecycle and recovery

- Backups use a coordinated SQLite snapshot/checkpoint, encrypted blobs, a signed
  manifest, portable user recovery protection, and a test restore before being
  labeled verified.
- Imports parse into a new isolated profile/staging area and commit only after
  complete validation. Never use an imported database as the live database.
- Tombstone first, remove FTS/vector/thumbnail/index derivatives, recompute blob
  reachability, purge encrypted bodies, delete vault entries, and record results.
- Grant revocation invalidates source/index/chunk/retrieval handles immediately;
  maintenance cleanup cannot leave them queryable.
- Migration failure preserves the previous database and evidence. A newer database
  opens read-only with export; downgrade is never silent.
- Recovery never deletes the corrupt original without explicit confirmation.

## 13. Required security test program

### 13.1 Static and supply chain

- Secret scan source, fixtures, build logs, database fixtures, packages, release
  artifacts, and diagnostics.
- Dependency vulnerability/license policy, Rust/TypeScript lint, unsafe-code
  inventory, generated Tauri ACL diff, SBOM, provenance, signature verification.
- Prohibit release scripts from using developer-local credentials or untracked
  binaries.

### 13.2 Property, fuzz, and protocol tests

- Generate arbitrary IPC JSON; unknown, oversized, stale, cross-profile, and
  malformed requests fail without panic or sensitive errors.
- Property-test capability implication, delegation subset, expiry/revocation,
  canonical argument hashing, single-use approval, and state machines.
- Fuzz SSE/JSON, terminal sequences, Markdown/HTML/SVG/Mermaid, URL normalization,
  archive formats, manifests, PDFs, images, media playlists, MCP schemas, and
  import/export manifests.

### 13.3 Windows boundary tests

- Junction/reparse/symlink/hard-link/rename races at every filesystem step.
- Alternate drive, UNC, network drive, case/Unicode, long path, reserved name,
  ADS, locked file, antivirus interference, disk full, and power-loss scenarios.
- Standard user vs administrator, UAC cancel/deny, Windows Hello unavailable,
  Credential Manager locked, multi-session, sleep/resume, and abrupt termination.
- Sandbox escape-oriented tests run on clean supported Windows VMs; unit tests are
  not evidence of isolation.

### 13.4 Adversarial scenario corpus

Include malicious instructions in chat, webpage, PDF text, OCR image, filename,
source comment, README, Git diff, issue, terminal output, tool result, memory, skill,
provider error, model catalog, citation title/URI, and remote-client message. Each
scenario must prove it cannot grant capability, resolve approval, expose a secret,
change environment policy, or cross scope.

### 13.5 Fault and concurrency injection

Crash or cancel before/after approval, audit prewrite, provider acceptance, blob
write, metadata commit, file replace, privilege dispatch, environment snapshot,
remote acknowledgement, and deletion. Verify one authoritative outcome, no replay,
and recoverable state.

## 14. Capability enablement gates

| Capability | Minimum evidence before advertising it |
|---|---|
| `workspace.read` / indexing | Picker/grant-only access, Windows reparse/TOCTOU matrix, revocation invalidates derived rows, bounded parser/indexer, cross-project denial |
| Attachments/artifacts | Encrypted key broker wired fail-closed, transactional metadata, isolated parser, archive/media bomb corpus, immutable provenance/citations |
| `workspace.write` | Capability broker and approval receipts, expected-hash patching, safe atomic replace, rollback/diff, dirty-worktree and race tests |
| `process.execute` / terminal | Supervised isolated worker, structured command API, no ambient secrets, job quotas, safe cancellation/output, escape-sequence tests |
| Browser control | Explicit Edge Canary attach/detach, bounded broker, no password/cookie export, challenge handoff, origin/action policy, navigation audit |
| Authorized capture/merge | Rights/authorization UX, request/segment ledger, sandboxed parsers, origin/redirect limits, resumable deterministic merge, DRM denial |
| Computer control | Fresh perception/action verification, separate input grant, privacy controls, emergency stop, spoofing tests |
| Administrative operation | Typed minimal broker, exact per-operation approval, UAC, pre/post state, rollback/irreversibility, signed helper review |
| Persistent machine | Isolation boundary, scoped mounts/network, snapshot/reset/drift report, no ambient host secrets, cross-project tests |
| Remote control | Device keys, presence pairing, granular grants, E2E encryption, replay/revocation/privacy controls, external-network penetration test |
| Memory write | Secret/PII scan, provenance/conflict/scope lifecycle, user policy, retrieval explanation, deletion of derivatives, injection corpus |
| Skills/plugins/MCP | Immutable package/version, provenance/signature policy, install/enable/grant separation, isolated execution, observed capability enforcement |
| Adaptive/RL routing | Versioned dataset and policy, privacy review, safety constraints outside learner, offline regression/red-team, staged rollout and rollback |

## 15. Stop-ship criteria and incident response

Release is blocked when any of the following is known or unverified for an
advertised capability:

- renderer/model/content can cause an unauthorized side effect;
- approval can be replayed, misbound, ambiguously displayed, or bypassed;
- secret or cross-project/profile data reaches an unintended destination;
- execution isolation, remote authentication, update signature, or privileged
  helper boundary lacks supported-Windows evidence;
- audit can silently omit a high-risk dispatch;
- malformed input can cause unbounded resource use, unsafe parser execution, or
  corruption of the live profile;
- backup, deletion, citation, or security UI makes a claim stronger than evidence.

On a suspected compromise: stop new side effects, preserve audit and affected
environment snapshots, detach browser/remote sessions, revoke delegated tokens and
device/provider grants, rotate exposed credentials, quarantine outputs, verify the
profile/database/blob chain, and present a user-readable incident timeline. Do not
auto-delete evidence.

## 16. Current implementation delta (2026-09-19)

This table is based on the September 19, 2026 working-tree snapshot, not on intended
architecture. It is a security/status crosswalk rather than native compilation,
packaged-app, or runtime evidence; reconcile shipped status with
`docs/IMPLEMENTATION_STATUS.md` and same-snapshot verification receipts.

| Area | Current evidence | Security gap / required next action |
|---|---|---|
| Desktop boundary | Tauri 2; renderer treated as untrusted in ADR 0001; restrictive production CSP; empty asset-protocol scope; native application commands are wrapped by the initialized-session/epoch gate in `src-tauri/src/ipc_session.rs`, with page-load invalidation and denial tests | The session proves one negotiated webview document, not user authentication or capability authority. Protocol/client/capability metadata is retained but not revalidated on every command; expiry/profile binding and native compile/runtime/package evidence remain open |
| Renderer plugin ACL | `capabilities/default.json` grants only reviewed event-listen/unlisten and window controls; script verifies the exact set | Keep installed plugins unauthorized unless explicitly reviewed; test release devtools and external navigation behavior |
| Native request validation | Most request structs use `deny_unknown_fields`; IDs and input sizes are bounded in key paths | Scalar commands and future IPC must follow the same session, ownership, size, cancellation, and redacted-error contract |
| Provider secrets | Windows-native keyring; renderer gets opaque reference/status; no general get-secret IPC | Add recovery/rotation, purpose/destination receipts, secret canary tests, and ensure diagnostics/crash paths cannot copy credentials |
| Provider egress | HTTPS for public endpoints, explicit local grant, DNS address classification/pinning, mixed-scope and metadata denial, redirects disabled, bounded streams | Add proxy/TLS profile policy, DNS/proxy leak tests, retries/idempotency, and destination-specific approval/telemetry |
| Workspace read | Native picker, durable grant, canonical containment, bounded UTF-8 read; indexer prototype rejects Windows reparse points | Indexer is not production-wired; production reads need handle/file-identity TOCTOU tests and revocation cleanup of derived data |
| Content blobs | AES-256-GCM content-addressed store with random DEK/nonce, associated-data binding, size/hash verification, atomic no-overwrite publication, and current `AppState` wiring through `BlobKeyBroker`, `ContentStore`, and `AttachmentRepository` | Native/package/runtime evidence is still unavailable; production attachment ingestion, metadata transaction/recovery coordination, Windows-protected key recovery/rotation, and the complete reparse/junction TOCTOU matrix remain open; no plaintext fallback |
| Attachments/retrieval/citations | Renderer/domain prototypes and bounded indexer exist | No complete native ingestion, extraction, frozen retrieval/context snapshot, immutable citation, or artifact provenance path |
| Approvals/capability grants | TypeScript domain contracts bind skill grant to content hash and approval to tool/argument hashes | No native capability broker, environment/policy/session binding, durable approval state, single-consumption receipt, or production resolver |
| Audit | Schema includes `audit_events` and capability grants | No production append-only MAC-chain writer or fail-closed high-risk dispatch path |
| Local metadata at rest | SQLite durability/integrity pragmas and migrations | Database and message bodies are not presently encrypted; do not claim full local-data encryption |
| Memory and skills | Strong domain validation/provenance contracts | Management UI is preview-only; no native safe candidate/package/runtime lifecycle |
| Markdown/citations | `micromark` emits escaped HTML by default; the renderer admits only normalized absolute HTTP(S) URLs through `src/lib/external-url.ts`, rejects embedded credentials, and projects code actions as renderer-local controls | A native origin-checked external-link broker/confirmation path is still missing; renderer Markdown/citation links remain `target="_blank"` anchors and must not be treated as a native navigation receipt |
| Errors/diagnostics | Native errors expose stable codes, opaque diagnostic IDs, coarse origin, and normalized provider retry/acceptance metadata; provider/keyring copy is bounded and redacted | Audit remaining renderer catch paths so rejected exception text is mapped to local allowlisted recovery copy; keep native diagnostic lookup separate from renderer content |
| IDE/browser/computer/remote | Capabilities are advertised unavailable | Keep commands physically absent until their complete gate in section 14 passes |

Until these gaps close, Omnia must not be described as hardened, fully isolated,
safe for unattended privilege, or ready for public production deployment.

## 17. Review and ownership

- Every new trust boundary, Tauri permission, executable component, privileged
  helper, remote protocol, browser observation, secret purpose, import format, or
  durable capability requires a threat-model update and an ADR when architectural.
- Each threat has an engineering owner, verification owner, target phase, and
  retained evidence link in release tracking.
- Review after security incidents, major dependency/runtime updates, and at least
  before every public release candidate.
- `IMPLEMENTATION_STATUS.md` remains the authority for shipped status; this threat
  model remains the normative security contract.
