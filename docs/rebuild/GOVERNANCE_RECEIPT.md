# Governance workstream receipt — rebuild-0001

Author: `/root/rebuild_governance`. Date: 2026-11-08. Scope: documents and ledger
review only. No product build, native run, UI capture, commit or push was claimed.

## Files and current state

Canonical GOAL, SPEC, PLAN, REQUIREMENTS and DOD are present. PRODUCT_SPEC now
explicitly marks historical Done claims as non-authoritative for the rebuild.
The initial 120-criterion draft was replaced concurrently by a more detailed
170-criterion ledger. Current ledger has **170 planned, 0 Done**. This receipt
does not upgrade governance or UI criteria without independent review.

The root's concurrent document revisions are retained; no historical requirement
or already-published artifact was reset. A later root integration must review the
latest document hashes because the files changed while this workstream ran.

## Novel source research executed

Fresh queries: `github everything claude code continuous learning hooks verification skill source`;
`github spec kit tasks analyze checklist specification open source`.
GitHub REST metadata requests returned 403 rate-limit errors. `git ls-remote`
and raw pinned source were used successfully as read-only alternatives.

| Repository / pinned revision | Exact source read / SHA-256 | Observation and decision |
|---|---|---|
| `github/spec-kit` / `c43849408ac0de2ca6a52f14eaae71449776057b` | `templates/checklist-template.md`; `c65b7f10aa9a965ea9c7f4e879d4ab0240665473731c5e9e638c4acb3ca9afc4` | Reviewer owns checklist markers; requirements-quality review is distinct from implementation completion. Apply this separation to spec-reread and DoD evidence. A Markdown checkbox cannot itself prove runtime behavior. |
| `affaan-m/everything-claude-code` / `d2ef2680594f9a17526a6e1a2e18b3d242c5d17b` | `skills/verification-loop/SKILL.md`; `9ee288d426660b0c785f534a003a4960fb4d8083a21302d8a4fd9b035b2edbb1` | Build/types/lint/tests/security/diff have separate results; target acceptance must be reported separately from local checks. Apply environment/version/scope labeling. Do not copy its grep-only security checks as proof of a full security review. |

Canonical URLs:

- https://github.com/github/spec-kit/tree/c43849408ac0de2ca6a52f14eaae71449776057b
- https://github.com/affaan-m/everything-claude-code/tree/d2ef2680594f9a17526a6e1a2e18b3d242c5d17b

These paths/revisions are newly inspected in this workstream. Registry owner must
deduplicate against other agents before counting them as cycle novelty. They were
read as reference data; no upstream scripts/hooks/installers were executed.

## Validation and limitations

- JSON parse succeeded and IDs/statuses were inspected.
- `git diff --check -- docs/rebuild` returned exit 0 when run.
- Read-after-write completed for canonical goal/spec/plan/requirements and all 170
  acceptance rows; later concurrent edits require a new hash snapshot.
- No criterion was set Done, and no old UI evidence was carried forward.
- Atomicity/coverage gaps are recorded in `GOVERNANCE_GAPS.md` for root review.
- `node scripts/rebuild/check.mjs` currently exits 1 because the architecture
  guard correctly sees the old renderer entry graph (`src/agent`,
  `src/styles`, `src/visual-fixtures`) before the clean-room `src/rebuild` entry
  is integrated. This is an expected rebuild blocker, not a successful product
  gate. The criterion remains planned until the new entry graph and guard pass.

## Next integration

Review all current hashes, reconcile concurrent document ownership, expand the
remaining user-requested capability criteria, and keep strict Done counts honest.
Do not present this receipt as proof that the app itself is complete.
