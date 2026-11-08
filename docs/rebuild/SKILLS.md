# Omnia skill supply and activation receipt

Updated: 2026-11-08, cycle `rebuild-0001`.

## What was installed

The host skill installer was used against pinned Git revisions. The complete
15-skill `obra/superpowers` set is installed in `C:/Users/khang/.codex/skills`
and mirrored under `.agents/skills/upstream/` so the repository can inspect its
exact source without depending on a future host update. The selection includes
`using-superpowers`, `brainstorming`, `writing-plans`, `dispatching-parallel-agents`,
`systematic-debugging`, `test-driven-development`, `verification-before-completion`,
`executing-plans`, review, worktree and skill-writing guidance.

Additional pinned selections are installed and mirrored from:

| Source | Revision | License | Selection | Why Omnia uses it |
| --- | --- | --- | ---: | --- |
| `obra/superpowers` | `22f0b463e7a5e579904dd6211a520321035526f7` | MIT | 15 | bounded brainstorm, plan, delegation, debug, test and verification |
| `affaan-m/ECC` (requested as `affaan-m/everything-claude-code`) | `d2ef2680594f9a17526a6e1a2e18b3d242c5d17b` | MIT | 4 | harness, architecture, evaluation and security review |
| `nextlevelbuilder/ui-ux-pro-max-skill` | `4f2dbb67e64969a9a30ab00742f2d55d66ddec2b` | MIT | 3 | design system, styling and UI review guidance |
| `muratcankoylan/Agent-Skills-for-Context-Engineering` | `9ff0c99108b36d3b886defd825d8ac1f47dba374` | MIT | 18 | context, memory, multi-agent, tool and self-improvement design |
| `K-Dense-AI/scientific-agent-skills` (requested path resolved from `claude-scientific-skills`) | `a25cf9ec00e2745d03f8704acf6f6919694ccd9a` | MIT | 10 | research, literature, citation, mathematical and scientific communication workflows |

**Total: 50 skill snapshots.** Exact paths, byte counts and SHA-256 hashes are
in [`skills.lock.json`](./skills.lock.json). A lock record is provenance, not a
claim that all 50 skills were used in every prompt.

## Activation semantics

The host copies are discoverable for later turns. In this cycle, the root task
explicitly loaded the Omnia skill and read representative Superpowers, ECC,
UI UX, context and scientific instructions before implementation. Project
copies are reference artifacts and are not silently auto-executed. A future
agent must read the relevant skill for its current task; `using-superpowers`
requires checking for a skill before action, while the Omnia loop adds source
freshness, evidence, permission and no-legacy-UI constraints.

## Validation

The standard `skill-creator` validator passed 36/50 snapshots. Fourteen failed
only because the upstream frontmatter intentionally includes additional
`tools`, `compatibility` or `argument-hint` keys that the local validator's
narrow allow-list does not accept. No failed source was silently rewritten.
These are recorded as validation compatibility gaps, not Done product criteria.
The selected skills are read-only guidance; no downloaded postinstall or
arbitrary script was executed. No browser profiles, cookies or credentials were
copied.

## Coverage boundary

This is a curated, pinned activation set, not a claim that every possible skill
or every 177 scientific domain module is installed. Adding a new domain requires
an explicit source-register entry, license check, bounded selection and lock
update. The user-requested continuous research loop must find genuinely new
repo/revision/path evidence each cycle; repeating this lock does not count as
new research.
