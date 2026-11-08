# Ask-user envelope recovery receipt

- **Cycle:** `rebuild-0007`
- **Recorded:** 2026-11-08 (Asia/Bangkok)
- **Owner:** renderer/native ask-user slice reviewer
- **Scope:** recover and re-verify the clean-room renderer ask-user envelope after a transient workspace write race was observed during concurrent agent/typecheck activity.

## Incident and investigation

Two ask-user renderer files were observed at zero bytes while another agent was
finishing and the application typecheck was running. The symptom was a shared
workspace write race, not a provider or native runtime result. I did not infer a
source-level broker race from that symptom. The files were restored from the
reviewed cycle-7 contract, then read twice with a 1.5 second interval and
hashed after each read. Both reads remained identical. The writer should be
serialized before the root integrator stages these files; this receipt does not
claim that an external concurrent-writer race has been eliminated.

## Restored source evidence

| Path | Bytes | SHA-256 |
| --- | ---: | --- |
| `src/rebuild/chat/ask-user-envelope.ts` | 15,008 | `f2e3788d732d8e03590f932a84e35b5a7f9b22159c06fbf650ec05d09779cad0` |
| `src/rebuild/chat/ask-user-envelope.test.ts` | 5,487 | `8e57e88aa28ffb5a7be42842505e2f75941bccecccecdff98ac926fce9846e8a` |

The hashes match the cycle-7 implementation and test receipts. The module is
Omnia-owned source: bounded typed request/decision parsing, session/run/revision
binding, stale/duplicate/unknown rejection, expiry/cancellation tombstones and
defensive snapshots. It is not an import or copy of the Pydantic AI reference.

## Fresh verification

| Command | Exit | Evidence |
| --- | ---: | --- |
| `npm.cmd exec -- vitest run src/rebuild/chat/ask-user-envelope.test.ts --reporter=verbose` | 0 | 11/11 tests passed |
| `npm.cmd exec -- vitest run src/rebuild/chat/chat-view.test.tsx src/rebuild/chat/ask-user-envelope.test.ts --reporter=dot` | 0 | 16/16 tests passed |
| `npm.cmd exec -- vitest run src/rebuild/settings src/rebuild/chat --reporter=dot` | 0 | 9 files, 63/63 tests passed; negative/race cases included by the existing suites |
| `npm.cmd run typecheck:app -- --pretty false` | 0 | application TypeScript check completed without diagnostics |
| `git diff --check` | 0 | no whitespace errors; only normal CRLF conversion warnings |

The two hash reads were performed 1.5 seconds apart and returned the same
values and byte counts. This checks stability after restoration; it does not
prove that another concurrent writer cannot truncate an uncommitted file.

## Claim boundary

This receipt proves clean-room renderer source integrity and unit/typecheck
behavior only. It does **not** prove packaged Tauri command delivery, Windows
UI interaction, provider authentication, or a live ask-user continuation. The
native ask-user criterion remains partial until those runtime receipts exist.

Root integration must stage these files atomically, re-run the hash and focused
tests after staging, and retain the native/live limitation in the DoD report.
