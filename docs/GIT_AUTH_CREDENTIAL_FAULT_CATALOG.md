# Git authentication and credential fault catalog

Status: **normative design and deterministic-test catalog; not implementation evidence**  
Last reviewed: **August 13, 2026**  
Scope: Omnia native Git broker, HTTPS and SSH transports, credential and secret
brokers, provider integrations, Git LFS, submodules, worktrees, background jobs,
CLI/web/remote clients, recovery UI, and fault-injection infrastructure

This document defines how Omnia must recognize, simulate, report, and recover
from Git authentication and credential failures. It supplements
`THREAT_MODEL.md` and `QA_STRATEGY.md`. A row in this catalog is a required
scenario, not proof that the scenario is already automated or that Git
integration is production-ready.

The catalog deliberately separates authentication from repository
authorization, transport trust, network failure, and post-authentication Git
policy. These failures often share the same human-readable `git` stderr, but
they require different recovery actions. Treating every `401`, `403`,
`Permission denied`, or `Repository not found` as "bad token" causes credential
loops, account lockouts, secret exposure, and misleading UX.

## 1. Safety boundary

Fault tests must never use the developer's real repositories, provider
accounts, browser sessions, SSH agents, keys, Windows Credential Manager
records, Git Credential Manager records, proxy credentials, or saved tokens.

The harness uses only:

- recognizable synthetic secrets such as
  `OMNIA_GIT_SYNTHETIC_SECRET_CANARY_V1`;
- temporary repositories, profiles, homes, configuration stacks, and known-host
  stores;
- loopback HTTP servers and repository-authored smart-HTTP fixtures;
- test-only OAuth/OIDC issuers and deterministic device-flow fixtures;
- fake credential, secret, SSH-agent, askpass, proxy, and secure-interaction
  brokers;
- a test-only SSH transport adapter or repository-owned fake executable that is
  selected explicitly by the harness and cannot reach the network;
- barriers and named checkpoints rather than timing guesses;
- bounded stdout, stderr, headers, bodies, prompts, retries, and test duration.

Real live-provider verification is a separate opt-in lane. It must be
budget-bounded, target an explicitly selected test repository, use a dedicated
least-privilege credential, and never be required for ordinary CI.

Omnia must not recover authentication by reading a browser password database,
exporting cookies, scraping an OS credential vault, disabling host-key checks,
accepting every TLS certificate, bypassing MFA or SSO, solving CAPTCHA, or
silently broadening token scope. Browser autofill, Windows Hello, hardware-key
touch, and official OAuth/SSO flows remain explicit user interactions.

## 2. Terms and failure boundaries

### 2.1 Operation phases

Every Git network operation records a native-owned phase. The phase determines
whether a retry is safe and what can be claimed about remote effects.

```text
resolve configuration
-> canonicalize fetch/push destination
-> bind remote and provider policy revisions
-> select credential profile
-> acquire bounded credential lease
-> establish proxy/tunnel/transport trust
-> respond to an authentication challenge
-> establish authenticated identity
-> authorize repository and operation
-> negotiate Git protocol/capabilities
-> transfer objects
-> request reference update
-> receive authoritative terminal result
-> revoke lease and commit audit projection
```

Authentication usually happens before a push reference update, but Omnia must
not infer that from an error string. If the transport fails after request bytes
or a ref-update command may have reached the server, the operation can be
`outcome_unknown` even when a later retry surfaces an authentication error.

### 2.2 Canonical classes

| Class | Meaning | Default retry disposition |
|---|---|---|
| `configuration_invalid` | No safe, unambiguous remote, account, helper, or credential binding can be constructed. | No automatic retry. |
| `interaction_required` | The user must sign in, unlock, touch, approve, select an identity, or authorize SSO. | Pause; resume only from a new validated interaction receipt. |
| `credential_unavailable` | A configured credential cannot be acquired from its broker. | Retry only for a proven transient broker outage, with a small bound. |
| `credential_rejected` | The remote definitively rejected the presented credential for the bound destination. | No blind retry with the same credential revision. |
| `credential_expired` | Trusted evidence says the credential expired. | Refresh once through the official flow, then create a new operation attempt. |
| `authorization_denied` | Identity is known but lacks repository, organization, operation, or scope authority. | No credential churn; request the exact missing authorization. |
| `proxy_authentication_failed` | An intermediary, not the Git remote, requested or rejected credentials. | Use a separately bound proxy credential; never send the Git credential. |
| `remote_trust_failed` | TLS certificate, SSH host key, hostname, or destination binding is not trusted. | Fail closed; never weaken verification automatically. |
| `transport_failed` | DNS, connection, protocol, or tunnel failed before an authenticated denial was proven. | Policy-based bounded retry only when remote side effects are impossible. |
| `policy_denied` | Omnia or organization policy forbids the credential, destination, helper, scope, or environment. | No retry until policy or operation changes. |
| `broker_internal_failed` | Native broker invariant, IPC, parsing, or durable-state failure. | Fail closed and retain a redacted diagnostic ID. |
| `outcome_unknown` | Remote acceptance or side effect cannot be determined. | Never automatic replay unless exact idempotency/remote evidence proves safety. |

### 2.3 Evidence confidence

Normalization records confidence independently from the user-facing label:

- `authoritative`: structured native state or a cryptographically/transport-
  bound protocol field proves the cause;
- `provider_structured`: a frozen provider adapter recognizes a bounded response
  field or challenge from the exact approved origin;
- `transport_structured`: HTTP status, `WWW-Authenticate`, proxy challenge, SSH
  exit classification, or broker status narrows the cause but may not prove the
  provider-specific reason;
- `heuristic_redacted_text`: sanitized `git`/SSH stderr suggests a cause;
- `unknown`: evidence is insufficient, contradictory, truncated, or unsafe to
  parse.

Heuristic text may improve guidance, but it cannot broaden authority, select a
credential, approve a redirect, mutate a secret, or authorize retry.

## 3. Credential lease and destination-binding contract

Secrets never enter renderer state, model context, argv, command history,
ordinary environment variables, task definitions, Git config projections,
logs, telemetry, exports, screenshots, crash reports, or durable event payloads.
The native broker issues a short-lived opaque lease containing only native
references and policy data:

```text
leaseId
credentialProfileId
credentialRevision
secretHandleRevision
authenticatedIdentityHintId
purpose = fetch | push | ls-remote | lfs | submodule | provider-api
transport = https | ssh
canonicalDestinationId
canonicalOrigin
repositoryIdentity
proxyRouteRevision
providerPolicyRevision
environmentId + environmentPolicyRevision
maximumConsumptions
issuedAt + expiresAt
```

Immediately before use, native code revalidates every binding. A change to the
remote URL, `pushurl`, URL rewrite, proxy, DNS trust decision, credential
revision, provider policy, environment, account, repository identity, or
operation purpose invalidates the lease. The renderer and model can request a
credential profile by opaque ID, but cannot supply secret bytes or mint a lease.

For system Git integration, Omnia must not put an HTTPS token in
`http.extraHeader`, a URL, argv, or a broadly inherited environment variable.
It should use a native transport or a narrow broker process with authenticated,
single-use local IPC. SSH passphrases follow the same rule. Plaintext temporary
key files are prohibited.

## 4. Configuration and destination faults

These cases are evaluated before any secret is released.

| ID | Injected condition | Required classification and recovery assertion |
|---|---|---|
| `GAF-CFG-001` | No credential profile is bound and anonymous access is not explicitly selected. | `configuration_invalid`; offer account/profile selection. No helper or prompt is launched implicitly. |
| `GAF-CFG-002` | Selected profile was deleted, disabled, signed out, or belongs to another Omnia profile. | `configuration_invalid`; invalidate cached selection and preserve the Git operation draft. |
| `GAF-CFG-003` | Fetch URL is malformed, contains prohibited control characters, or cannot be canonicalized. | `configuration_invalid`; show a sanitized literal destination and never acquire a credential. |
| `GAF-CFG-004` | URL contains userinfo, a token-looking value, or embedded password. | `policy_denied`; offer a safe migration into the secret broker without echoing the embedded value. |
| `GAF-CFG-005` | Fetch and push use different origins but only one credential binding exists. | Require separate purpose/destination bindings; never reuse the fetch credential for push by convention. |
| `GAF-CFG-006` | `url.*.insteadOf` or `pushInsteadOf` rewrites to a different origin, scheme, port, or identity. | Resolve before approval and lease issuance. Ambiguous/mutable rewrites fail closed. |
| `GAF-CFG-007` | Multiple equally applicable URL rewrites or provider mappings produce different destinations. | `configuration_invalid`; show a safe conflict list and require an explicit choice or config repair. |
| `GAF-CFG-008` | Remote URL changes after the operation snapshot but before credential consumption. | Reject the stale lease; append a destination-drift fact and require a newly reviewed operation. |
| `GAF-CFG-009` | Unicode/punycode hostname display differs materially or contains suspicious bidi/control text. | Preserve canonical ASCII origin, render both safe forms, and require explicit confirmation for a new trust binding. |
| `GAF-CFG-010` | Scheme changes from HTTPS to HTTP or SSH to an unapproved custom transport. | `policy_denied`; never downgrade or send credentials. |
| `GAF-CFG-011` | Cross-origin HTTP redirect occurs before or after an auth challenge. | Do not forward `Authorization`, cookie, client certificate, or Git credential. Re-resolve as a new destination. |
| `GAF-CFG-012` | Same hostname redirects to a different port, scheme, tenant path, or repository identity. | Treat as a material destination change unless the frozen provider policy explicitly allows the exact redirect. |
| `GAF-CFG-013` | Repository-local `credential.helper` is an executable or shell snippet. | Block as untrusted code by default. Never execute it merely because the repository was opened or a fetch was requested. |
| `GAF-CFG-014` | Global/system helper is unknown, changed since approval, or resolves through a mutable path. | `policy_denied` or explicit helper approval; bind executable digest and capability manifest. |
| `GAF-CFG-015` | `core.askPass`, `GIT_ASKPASS`, `SSH_ASKPASS`, or credential-helper environment is inherited from the launching shell/repository. | Scrub it. Only the native-owned broker selected by policy may prompt. |
| `GAF-CFG-016` | `core.sshCommand`, `GIT_SSH_COMMAND`, `GIT_SSH`, `ProxyCommand`, or `ProxyJump` is repository-authored or mutable. | Treat as executable/tunnel authority, not decoration; block or require exact executable/route approval. |
| `GAF-CFG-017` | `http.extraHeader`, `http.*.extraHeader`, `.netrc`, or environment contains an authentication header outside the broker. | Fail closed before dispatch; never merge an opaque extra header with broker credentials. |
| `GAF-CFG-018` | `http.proxy`, remote proxy, PAC result, or tunnel route changes after approval. | Invalidate credential and route leases; show remote and intermediary separately. |
| `GAF-CFG-019` | `include`/`includeIf` or command-scoped `GIT_CONFIG_*` injects a helper, proxy, rewrite, header, or SSH command. | Resolve through the controlled config view; reject untrusted executable/secret-bearing entries. |
| `GAF-CFG-020` | Two credential profiles match the same origin/path with different accounts. | `interaction_required`; do not guess from recency when a side-effecting push is requested. |
| `GAF-CFG-021` | `credential.useHttpPath` behavior would collapse credentials for different enterprise paths. | Preserve repository/path binding in Omnia regardless of Git's default; require explicit safe sharing. |
| `GAF-CFG-022` | A credential kind is incompatible with transport/provider (SSH key for HTTPS, PAT for SSH, provider token at generic origin). | `configuration_invalid`; offer only compatible profiles without revealing secret metadata. |
| `GAF-CFG-023` | Credential is valid only in host environment but operation selected isolated/remote execution. | `policy_denied` or secure broker bridge approval; never copy the secret/key into the environment automatically. |
| `GAF-CFG-024` | Remote is an IP literal, loopback, local-network, metadata, UNC/device path, or disallowed custom protocol. | Apply destination/network policy before secret access; denial cannot be overridden by model text. |

## 5. Secret broker, vault, helper, and interaction faults

| ID | Injected condition | Required classification and recovery assertion |
|---|---|---|
| `GAF-BRK-001` | Opaque secret handle is missing or its revision does not exist. | `credential_unavailable`; mark binding stale, never create an empty credential request. |
| `GAF-BRK-002` | Windows-protected secret cannot be decrypted under the current user/profile. | `credential_unavailable`; keep ciphertext intact, offer reauthentication/re-entry, do not dump native error text. |
| `GAF-BRK-003` | Vault is locked or Windows Hello is required. | `interaction_required`; foreground a native secure interaction only after explicit user action. |
| `GAF-BRK-004` | User cancels Windows Hello, key unlock, passphrase, account chooser, or secret entry. | Terminal `user_cancelled`, not `credential_rejected`; no retry and no degraded fallback identity. |
| `GAF-BRK-005` | Secure interaction times out, loses foreground, or client session/epoch changes. | Invalidate receipt and lease; background work remains paused with a resumable action. |
| `GAF-BRK-006` | Secret record authentication tag, metadata hash, or key-wrapping version is corrupt. | `broker_internal_failed`; quarantine the record, preserve recovery evidence, never attempt partial plaintext use. |
| `GAF-BRK-007` | Key rotation completed for metadata but not the secret blob, or vice versa. | Transaction/rollback invariant prevents mixed revisions; fault test proves old or new record is recoverable, never half-valid. |
| `GAF-BRK-008` | Credential is deleted/revoked between selection and lease issuance. | Selection becomes stale; no secret is released and no fallback account is selected automatically. |
| `GAF-BRK-009` | Credential rotates between lease issuance and transport consumption. | Revision mismatch invalidates lease; reacquire and create a new dispatch attempt. |
| `GAF-BRK-010` | Lease expires or consumption budget reaches zero. | Fail closed. A consumed single-use lease cannot be replayed by retry, renderer reload, or another agent. |
| `GAF-BRK-011` | Two operations concurrently request refresh/unlock for one credential. | Singleflight one interaction/refresh; fan out only opaque result revisions, never secret bytes. |
| `GAF-BRK-012` | Credential helper hangs, never closes output, or waits for terminal input in headless mode. | Bound time/bytes; terminate the isolated helper; classify `credential_unavailable` with a safe action. |
| `GAF-BRK-013` | Helper crashes, exits nonzero, or returns malformed key/value output. | Do not parse partial secret; no secret-like stderr reaches diagnostics. |
| `GAF-BRK-014` | Helper returns duplicate/conflicting username, password, protocol, host, or path fields. | Reject the response as ambiguous; never use first/last wins for identity or destination. |
| `GAF-BRK-015` | Helper returns oversized fields, NUL, CR/LF injection, ANSI, bidi, or binary data. | Bound and reject; sanitize only for a diagnostic code, not for attempted authentication. |
| `GAF-BRK-016` | Helper returns a credential for a different host/path/account than requested. | Reject by exact binding even if the secret later proves valid elsewhere. |
| `GAF-BRK-017` | Helper, askpass, or fake agent writes the synthetic secret to stderr/stdout beyond its protected channel. | Stop-ship canary failure; scan all retained artifacts and terminate the test fixture. |
| `GAF-BRK-018` | Broker local IPC peer, nonce, session, process identity, or protocol version is invalid. | No secret release; `broker_internal_failed` or `policy_denied` with auditable peer mismatch. |
| `GAF-BRK-019` | Broker IPC disconnects before acknowledgement of secret consumption. | Revoke lease. Do not assume the transport did or did not receive the credential; phase evidence controls retry. |
| `GAF-BRK-020` | Native broker crashes after unwrapping but before dispatch. | Secret is memory-only, lease expires on restart, operation returns to predispatch recovery state. |
| `GAF-BRK-021` | Process/app crashes after credential consumption but before durable `auth_started` fact. | Recovery records an ambiguous dispatch seam; no automatic replay based only on missing journal data. |
| `GAF-BRK-022` | Broker cache returns a known-stale secret after provider sign-out/revocation. | Revocation epoch beats cache; stale cache entry is unusable and securely evicted. |
| `GAF-BRK-023` | User switches Omnia profile/account while a secure prompt is open. | Prompt receipt is bound to old profile/session and cannot complete the new operation. |
| `GAF-BRK-024` | Remote/web client requests that the desktop send or reveal a credential to it. | Deny. Remote client may request a local secure interaction but receives only success/failure and safe identity metadata. |
| `GAF-BRK-025` | Headless/CLI run needs interactive sign-in, passphrase, hardware touch, or account selection. | Emit structured `interaction_required` with safe resume ID; never fall back to terminal echo or plaintext stdin by default. |
| `GAF-BRK-026` | Secret value is accidentally supplied by a model/tool argument or pasted into ordinary chat. | Reject secret-as-argument use; offer explicit secure-import/redaction flow and prevent model/context persistence. |

## 6. HTTPS smart-protocol authentication faults

HTTP status alone is not sufficient. Classification binds status, challenge,
approved origin, provider adapter, operation phase, and sanitized body metadata.

| ID | Injected condition | Required classification and recovery assertion |
|---|---|---|
| `GAF-HTTP-001` | `401` before any credential is offered with a recognized `WWW-Authenticate` challenge. | Acquire only a compatible bound credential; enforce one bounded challenge cycle. |
| `GAF-HTTP-002` | `401` after the exact credential revision was offered. | `credential_rejected`; do not retry the same revision or cycle through all saved accounts. |
| `GAF-HTTP-003` | `401` has no challenge or has a malformed/oversized challenge. | `credential_rejected` with lower confidence; no body-derived secret handling. |
| `GAF-HTTP-004` | Challenge scheme is unsupported, downgraded, or changes mid-operation. | `configuration_invalid`/`policy_denied`; do not fall back from stronger approved auth to Basic automatically. |
| `GAF-HTTP-005` | Bearer challenge reports trusted `invalid_token`. | `credential_rejected` or `credential_expired` only if structured evidence proves expiry; reauth through official flow. |
| `GAF-HTTP-006` | Bearer challenge reports trusted `insufficient_scope`. | `authorization_denied`; show required/current safe scope names when trustworthy, never reveal token. |
| `GAF-HTTP-007` | `403` after identity is accepted. | Default `authorization_denied`, not bad credential; provider adapter may refine organization/policy cause. |
| `GAF-HTTP-008` | `404` for a private repository. | `authorization_denied_or_not_found`; do not claim existence or prompt token rotation without evidence. |
| `GAF-HTTP-009` | `407 Proxy Authentication Required`. | `proxy_authentication_failed`; Git credential must never be sent to proxy challenge. |
| `GAF-HTTP-010` | Proxy accepts auth then remote returns `401`/`403`. | Preserve two-layer evidence and guide proxy vs remote recovery independently. |
| `GAF-HTTP-011` | Proxy/remote challenge loops or alternates identities. | Stop after bounded state transitions; report loop without storing response headers/bodies containing secrets. |
| `GAF-HTTP-012` | Same-origin redirect occurs under an explicitly frozen provider rule. | Revalidate exact path/repository binding; credential use remains bounded to the approved canonical origin. |
| `GAF-HTTP-013` | Cross-origin/scheme/port redirect requests authentication. | Strip secret-bearing material and stop; require a new destination review. |
| `GAF-HTTP-014` | Redirect target includes userinfo or token-looking query parameters. | `policy_denied`; no navigation or credential forwarding from untrusted response text. |
| `GAF-HTTP-015` | TLS client certificate is requested but none/incorrect one is bound. | `interaction_required` or `credential_unavailable`; select certificate by opaque identity and exact origin. |
| `GAF-HTTP-016` | Client certificate is expired, revoked, missing private key, or user cancels hardware-key PIN/touch. | Separate certificate/interaction diagnosis; never fall back to another certificate silently. |
| `GAF-HTTP-017` | Server closes after receiving `Authorization` but before response headers. | Transport `outcome_unknown` for the auth exchange; never mark token invalid or auto-send to a fallback origin. |
| `GAF-HTTP-018` | Auth succeeds for discovery but fails on `git-upload-pack` or `git-receive-pack`. | Bind diagnosis to exact endpoint/purpose; read permission must not imply write permission. |
| `GAF-HTTP-019` | Credentials are requested repeatedly across smart-HTTP subrequests. | Reuse only within lease budget and exact operation/origin; terminal rejection invalidates remaining consumptions. |
| `GAF-HTTP-020` | Server returns HTML login/interstitial with `200`, `30x`, `401`, or `403`. | Do not scrape credentials or execute page content; classify interactive/unknown and open official flow only with user approval. |
| `GAF-HTTP-021` | Error body, header, request ID, realm, or location contains the synthetic secret canary. | Reject/redact at ingress; canary must be absent from journal, UI, telemetry, log, export, and crash artifact. |
| `GAF-HTTP-022` | Response/challenge is oversized, compressed bomb, stalled, malformed UTF-8, or contains control characters. | Bound parsing and fail safely; no hang, unbounded allocation, or terminal-spoofed UI. |
| `GAF-HTTP-023` | Remote returns success then a later auth-like message appears in pack/progress data. | Treat pack/progress as untrusted data; it cannot rewrite the structured auth outcome. |
| `GAF-HTTP-024` | System clock skew makes an otherwise valid token appear not-yet-valid/expired. | Report clock evidence separately; never extend expiry or disable validation automatically. |

