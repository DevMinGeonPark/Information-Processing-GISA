# SPEC-TREND-002 진행 기록

## §E.1 Plan-phase Audit-Ready Signal

- plan_status: audit-ready
- plan_complete_at: 2026-10-25
- artifacts: spec.md, plan.md, acceptance.md (Tier M)
- current_revision: 0.2.0
- counts: 8 REQ / 8 AC (no sub-numbered ACs)
- open_clarifications: 0 (plan.md §B)
- origin: split from SPEC-TREND-001 v0.3.0 (REQ-TREND-014..016) per plan-audit iter 2 finding N1
- revision log:
  - 0.1.0 — split from SPEC-TREND-001 (N1); N2, N4, N5 applied
  - 0.2.0 — plan-audit iter 2 (PASS 0.81) blocking fixes S1, S2 applied; optional O2 applied
- depends_on: SPEC-TREND-001 (run-phase starts after it reaches completed)

## §E.2 Run-phase Evidence

- cycle_type: tdd (RED → GREEN per milestone; RED outputs captured before implementation)
- baseline (pre-run, HEAD `aaa2903`): `npm test` 69 passed; `npx tsc --noEmit` exit 0; `node scripts/validate.ts` 0 error(s); `git rev-list --count --left-right origin/main...HEAD` → `0 0`
- evidence directory (local, gitignored): `.moai/state/verify/trend-002/`
  - RED: `m1-red.txt` (6 failed, ENOENT on new files), `m2-red.txt` (5 failed), `m3-red.txt` (2 files failed: modules missing)
  - GREEN/final: `final-test.txt`, `final-tsc.txt`, `final-build.txt`, `final-validate.txt`, `ac004-gate.txt`

### AC matrix (measured at HEAD `8481934`)

| AC | Status | Verification command | Actual output |
|----|--------|----------------------|---------------|
| AC-TREND2-001 | PASS | `npx vitest run tests/contribution.test.ts` | `✓ has the nine headings in order and a license section naming CC BY 4.0 and MIT`; `✓ tells data contributors to touch only data/ ...` |
| AC-TREND2-002 | PASS | same | `✓ carries the CC BY 4.0 notice for data/ naming DevMinGeonPark` (legal code from creativecommons.org/licenses/by/4.0/legalcode.txt) |
| AC-TREND2-003 | PASS | same | `✓ provides a data-submission issue form`; `✓ .github/ISSUE_TEMPLATE/data-submission.yml asks for every field and both confirmations`; `✓ .github/pull_request_template.md asks for every field and both confirmations` |
| AC-TREND2-004 | PASS | `node scripts/validate.ts <tmp: repo data/ + fixture> --baseline data/taxonomy.json` (gate command with this checkout as base) | `ERROR data/questions/2099-1-practical.json · 2099-1-practical-q1 · V2 · /0/sources must NOT have fewer than 1 items` / `... · V3 · unknown round '2099-1-practical'` / `... · V3 · unknown concept 'no-such-concept'` / `3 error(s)`, `gate exit=1`; test `✓ the gate command exits non-zero with V2 and V3 lines for 2099-1-practical-q1` |
| AC-TREND2-005 | PASS | `npx vitest run tests/contribution.test.ts` + `grep -rn pull_request_target .github/` (exit 1, no match) + `grep -nE "paths(-ignore)?:" ci.yml` (exit 1) | `✓ no workflow uses pull_request_target`; `✓ ci.yml triggers on pull_request without path filters ...`; `✓ every job that runs on pull_request holds contents: read only`; `✓ only push-on-main jobs may hold Pages permissions`; `✓ the PR data check runs the base-branch validator and schema ...` |
| AC-TREND2-006 | PASS | `npx vitest run tests/contribute.test.tsx` | `✓ #/ranking`, `#/heatmap`, `#/trend`, `#/sources`, `#/contribute` `links to CONTRIBUTING.md` |
| AC-TREND2-007 | PASS | same + `tests/snippet.test.ts` | `✓ valid input shows schema-valid JSON and enables copy; clearing the source disables it`; `✓ subject options follow the round's track and concept options exclude deprecated ones`; `✓ switching to a round whose track drops the subject resets subject and concepts` |
| AC-TREND2-008 | PASS | same | `✓ fetch / XMLHttpRequest / sendBeacon never see the marker` (0 spied calls; `grep -rnE "fetch\(\|XMLHttpRequest\|sendBeacon" src/` exit 1) |
| F1 (sync-audit SPEC-TREND-001) | PASS | `npx vitest run tests/validate.test.ts` | `✓ V2 non-http source url (javascript:)`; `✓ http and https source urls are accepted` |

### Quality gates (HEAD `8481934`)

- `npm test -- --coverage` → `Test Files 6 passed (6)`, `Tests 104 passed (104)`; lines: `validate-lib.ts 100`, `aggregate.ts 100`, `snippet.ts 100` (All files lines 100, stmts 99.2, branches 92.1)
- `npx tsc --noEmit` → exit 0
- `npm run build` → exit 0 (`dist/assets/index-*.js 391.18 kB │ gzip: 118.27 kB`)
- `node scripts/validate.ts` → `0 error(s), 0 warning(s)`

### Decisions

- Validator now keeps running reference checks (V3–V7) on a schema-invalid question file, with type guards, so a single bad record reports V2 and V3 together (required by AC-TREND2-004). Non-question files are still excluded from cross-checks after V2.
- CI gate layout: base branch checked out into `base/`, PR tree into `pr/` (separate dirs so PR content cannot overlay the base validator); command `node base/scripts/validate.ts pr --baseline base/data/taxonomy.json`; `persist-credentials: false` on all validate checkouts.
- CONTRIBUTING.md also names `.github/` changes as owner-review (PR runs use the PR's own workflow file).

### Not done in run-phase

- M4 (owner action): mark the `validate` job as a required status check on `main` branch protection and record `gh api repos/DevMinGeonPark/Information-Processing-GISA/branches/main/protection`. Not performed — repository settings change outside this agent's scope.
- README "기여" / "라이선스" sections still say the guide is in preparation — README is manager-docs (sync-phase) territory.

## §E.3 Run-phase Audit-Ready Signal

```yaml
run_complete_at: 2026-10-26
run_commit_sha: 8481934
run_status: complete-with-owner-action-pending   # M4 branch protection
ac_pass_count: 8
ac_fail_count: 0
preserve_list_post_run_count: n/a
l44_pre_commit_fetch: "0 0 (origin/main...HEAD before M1)"
l44_post_push_fetch: not-pushed (orchestrator pushes)
new_warnings_or_lints_introduced: 0 (tsc exit 0; no linter configured)
cross_platform_build:
  npm_run_build: exit 0 (darwin)
total_run_phase_files: 18
m1_to_mN_commit_strategy: per-milestone commits on main (a2e2596, 62fb463, 6026866, 8481934, + this evidence commit)
```

## §E.4 Sync-phase Audit-Ready Signal

```yaml
sync_complete_at: 2026-10-26
sync_commit_sha: pending-backfill-sync
sync_status: complete-with-gaps
b12_self_test_a: "grep -c SPEC-TREND-002 CHANGELOG.md before emission → 0"
b12_self_test_b: "distinct AC ids in acceptance.md → 8 (AC-TREND2-001..008); CHANGELOG v0.2.0 entry states 8"
b12_self_test_c: "ls of every path named in the CHANGELOG entry → all exist"
changelog_entry_position: "## [0.2.0] - 2026-10-26 (below empty [Unreleased], above [0.1.0])"
frontmatter_status_transitions:
  spec_md: "in-progress → implemented → completed (single sync commit); updated 2026-10-26"
  plan_md: "no frontmatter block — not modified"
  acceptance_md: "no frontmatter block — not modified"
  progress_md: "no frontmatter block — not modified"
docs: [README.md (기여 / 라이선스 sections), CHANGELOG.md ([0.2.0])]
pre_sync_checks:
  npm_test: "Tests  104 passed (104)"
  validate: "0 error(s), 0 warning(s)"
url_scheme_note: "schema pattern is ^https?:// (http and https accepted, other schemes rejected) — CHANGELOG states this, not https-only"
m4_branch_protection: "gh api repos/DevMinGeonPark/Information-Processing-GISA/branches/main/protection --jq '.required_status_checks.contexts' → [\"validate\",\"test\"] (2026-10-26)"
open_gaps:
  - seed data still reconstructed placeholders awaiting content review
```
