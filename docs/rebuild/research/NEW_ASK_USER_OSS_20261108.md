# Cycle 0007 NEW OSS research — Pydantic AI approval and ask-user harness

- Retrieved: 2026-11-08 (Asia/Bangkok)
- Query: site:github.com pydantic-ai harness approval reviewer ask user human in the loop tool approval everything super power pro max model workflow architecture open source
- Repository: https://github.com/pydantic/pydantic-ai
- Revision: `0f7648a1b0685389ea368ea4f7b754b393cea8c7`
- License: MIT (repository `LICENSE`)
- Novelty: New repository/revision/path tuples for rebuild-0007; no Pydantic AI source is present in `SOURCE_REGISTER.json` or prior cycle research.

## Exact source reviewed

| Upstream path | Snapshot | SHA-256 |
|---|---|---|
| `docs/harness/approval-reviewer.md` | `docs/rebuild/research/snapshots/cycle7/pydantic-ai/docs__harness__approval-reviewer.md.txt` | `39dac7d85bd63ca1f2c6948bdec8bc19f02d3493f4f8038019212ad508755da1` |
| `src/pydantic_ai_harness/pydantic_ai_harness/ask_user/_toolset.py` | `docs/rebuild/research/snapshots/cycle7/pydantic-ai/src__pydantic_ai_harness__pydantic_ai_harness__ask_user___toolset.py.txt` | `b68b59a122ac6904fae3c10b928dacad41656387de95a92269d7db3e1c41e944` |
| `src/pydantic_ai_harness/pydantic_ai_harness/approval_reviewer/_capability.py` | `docs/rebuild/research/snapshots/cycle7/pydantic-ai/src__pydantic_ai_harness__pydantic_ai_harness__approval_reviewer___capability.py.txt` | `b3f944a8d055b76120d003ac00abd9972e2a8af02ea753d8bf15e470dc669dd2` |
| `pydantic_ai_slim/pydantic_ai/toolsets/approval_required.py` | `docs/rebuild/research/snapshots/cycle7/pydantic-ai/pydantic_ai_slim__pydantic_ai__toolsets__approval_required.py.txt` | `cf2606131d95aa9acb79dd7a397835416afcd6b9c00740a60334dec9027d038a` |
| `examples/pydantic_ai_examples/ag_ui/api/tool_approval.py` | `docs/rebuild/research/snapshots/cycle7/pydantic-ai/examples__pydantic_ai_examples__ag_ui__api__tool_approval.py.txt` | `d53ed0053b0a35086013576ef42aa5dcb489e69d5bfea7d78fa20f1bb9a5b992` |
| `LICENSE` | `docs/rebuild/research/snapshots/cycle7/pydantic-ai/LICENSE.txt` | `398f82aee5bd500f39ec1cc84e2b878a34a78be1bc1e6da038f7e73a758bca0a` |

The snapshots are verbatim reference data only; no upstream code is executed, vendored or imported into Omnia.

## Observations

1. `docs/harness/approval-reviewer.md` describes a durable approval-review capability that can suspend a tool call, expose a review payload, resume with an explicit decision, and preserve denied/cancelled outcomes. It separates reviewer identity and policy from the tool implementation.
2. `ask_user/_toolset.py` models user questions as a toolset boundary with structured options/free text and a continuation path, so the UI can receive a typed request instead of parsing a text sentinel.
3. `approval_reviewer/_capability.py` binds approval state to a request/run context and supports explicit approve, reject and edit decisions. The decision remains auditable rather than silently mutating the tool call.
4. `toolsets/approval_required.py` provides a small wrapper that marks selected tools as approval-required, making the policy composable and discoverable.
5. `tool_approval.py` demonstrates a transport-facing interaction where a frontend receives an approval event and returns the user's decision; this is an integration pattern, not proof of Omnia's Tauri delivery.

## Strengths

- Typed suspension/resume semantics prevent a pending user question from being confused with a normal assistant message.
- Approval decisions are explicit and auditable, including denial and edited arguments.
- Policy is composable at the toolset boundary and can be applied selectively.
- The pattern fits Omnia's existing native broker and recommended-option/free-text contract.

## Weaknesses and limits

- This source does not prove Windows packaged Tauri/UIA delivery, native WebView2 behavior, or a live provider account.
- A frontend transport still needs lease/run/session validation, stale decision rejection, bounded option payloads and persistence.
- Approval wrappers can become unsafe if an adapter treats an unknown or timed-out decision as approval; Omnia must fail closed.
- The repository is a Python/AG-UI ecosystem and cannot be copied into the Rust/React clean-room renderer.

## Omnia decision

**apply-as-reference.** Add the concepts to the Omnia-owned ask-user contract: typed request envelope, explicit suspend/resume, decision enum (`approve`, `reject`, `edit`, `cancel`), reviewer/session/run binding, and receipts for stale/duplicate/unknown decisions. Keep `CHAT-008` Partial until packaged Tauri command delivery and live provider interaction are captured. Do not vendor, import or replicate the upstream UI or runtime.

## Evidence boundary

This research establishes source observations and a design decision only. It is not native/runtime/live evidence and cannot mark any DoD criterion Done.
