# Skill supply receipt — rebuild-0001

Generated: 2026-11-08 (Asia/Bangkok)  
Owner: `/root/rebuild_skill_supply`  
Workspace: `C:/Users/khang/.codex/worktrees/omnia-ui-rebuild/publish-worktree`

## Commands and results

1. Official helper:
   `python C:/Users/khang/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py`
   installed 15 pinned `obra/superpowers` skills at revision
   `22f0b463e7a5e579904dd6211a520321035526f7` (exit 0).
2. The same helper installed 4 ECC skills at
   `d2ef2680594f9a17526a6e1a2e18b3d242c5d17b`, 3 UI UX Pro Max skills at
   `4f2dbb67e64969a9a30ab00742f2d55d66ddec2b`, 18 context engineering skills at
   `9ff0c99108b36d3b886defd825d8ac1f47dba374`, and 10 scientific skills at
   `a25cf9ec00e2745d03f8704acf6f6919694ccd9a` (all exit 0).
3. `python scripts/rebuild/install-reference-skills.py` → exit 0,
   `lockedSkillCount=50`, `mirrorDirectoryCount=50`, no hash or extra errors.
4. `git diff --check -- docs/rebuild/SKILLS.md docs/rebuild/skills.lock.json
   scripts/rebuild/install-reference-skills.py` → exit 0.
5. `skill-creator/scripts/quick_validate.py` over 50 project mirrors → 36 pass,
   14 source-compatible frontmatter failures. Failures are only upstream keys
   `tools`, `compatibility` or `argument-hint`; source was not rewritten.

## Evidence and boundaries

- Host skill directories exist under `C:/Users/khang/.codex/skills` and project
  mirrors under `.agents/skills/upstream`; every mirrored `SKILL.md` is SHA-256
  locked in `docs/rebuild/skills.lock.json`.
- Representative guidance was read for Superpowers process skills, ECC agent
  harness construction, UI UX Pro Max, context compression/memory/self-improvement,
  and scientific brainstorming. The lock does not claim every skill is loaded
  for every prompt; future tasks must select and read the relevant one.
- Requested `affaan-m/everything-claude-code` resolves at GitHub to
  `affaan-m/ECC`; requested scientific path resolves to
  `K-Dense-AI/scientific-agent-skills`. This resolution is recorded rather than
  pretending the old repository name is still canonical.
- No downloaded postinstall or arbitrary upstream script was executed. No
  credentials, browser profile, cookie, personal chat or runtime state was copied.

## Remaining gaps

- This is a curated 50-skill set, not every skill available in every upstream
  repository. Scientific domain breadth remains available by explicit pinned
  addition; no domain coverage is claimed from the 10 selected entries.
- Local frontmatter validation must be extended if Omnia wants to accept the
  upstream optional keys; changing external files would falsify provenance.
- Host discovery on the next Codex turn and real use in product workflows remain
  separate evidence from installation and lock consistency.
