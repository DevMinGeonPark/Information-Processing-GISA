# SPEC-TREND-001 진행 기록

## §E.1 Plan-phase Audit-Ready Signal

- plan_status: audit-ready
- plan_complete_at: 2026-10-25
- artifacts: spec.md, plan.md, acceptance.md (Tier M)
- current_revision: 0.5.0
- counts: 16 REQ / 16 AC (no sub-numbered ACs)
- open_clarifications: 0 (plan.md §B)
- revision log:
  - 0.2.0 — community contribution scope added
  - 0.3.0 — plan-audit iter 1 (FAIL 0.63) defects D1-D11, D13-D15, D17 addressed; user clarifications resolved
  - 0.4.0 — plan-audit iter 2 preliminary findings N1-N8 addressed; community contribution scope split into SPEC-TREND-002
  - 0.5.0 — plan-audit iter 2 (PASS 0.88) blocking fixes X1, F1, F2 applied
- related: SPEC-TREND-002 (depends on this SPEC's §C contracts and validator)

## §E.2 Run-phase Evidence

Run date 2026-10-25, cycle_type=tdd, Node v24.14.1, TypeScript 7.0.2, Vite 8.3.5, Vitest 5.0.5.
Raw outputs (RED/GREEN per milestone, coverage, build): `.moai/state/verify/72cd3100/` (local, gitignored).

### Commits

| SHA | Subject |
|-----|---------|
| 0fca241 | chore: baseline — SPEC-TREND-001/002 plan artifacts and project docs |
| 1f7cb2d | feat(data): M1 data contract — JSON Schemas, taxonomy/type/round seed, MIT LICENSE |
| e10bf77 | feat(validate): M2 data validator — rules V1-V9 and W1 with data-root argument |
| 361f29b | feat(core): M3 pure aggregation core — round order, filters, frequency, ranking, matrix, type distribution, intensity |
| e65554e | feat(ui): M4 analysis views — ranking, heatmap, round trend, sources with hash routing |
| 075a9d2 | ci: M5 GitHub Actions — PR validate+test, main push builds and deploys to Pages |

### TDD RED evidence

| Milestone | RED command | RED output (verbatim excerpt) |
|-----------|-------------|-------------------------------|
| M2 | `npx vitest run tests/validate.test.ts` | `Test Files  1 failed (1)` / `Tests  no tests` (validate-lib.ts absent) |
| M3 | `npx vitest run tests/core.test.ts` | `Error: Failed to resolve import "../src/core/aggregate" from "tests/core.test.ts". Does the file exist?` |
| M4 | `npx vitest run tests/views.test.tsx` | `Error: Failed to resolve import "../src/views/Heatmap" from "tests/views.test.tsx". Does the file exist?` |

M1 is data/schema authoring (no code under test); its schemas are exercised by the M2 tests.

### Acceptance criteria

| AC | Evidence (command → observed) | Status |
|----|-------------------------------|--------|
| AC-TREND-001 | `npm run validate` → `0 error(s), 0 warning(s)`, exit 0 | PASS |
| AC-TREND-002 | `tests/validate.test.ts` "rule fixtures" — 16 single-rule fixtures (V1, V2, V3×4, V4×2, V5, V6, V7×3, V8×3) each spawn the CLI: exit ≠ 0 and a line with path · id · code; W1 fixture exit 0 with `replaced_by` slug in the warning line | PASS |
| AC-TREND-003 | `tests/validate.test.ts` — text/choices/answer, sources[].quote, 201-char note → only V2; 200-char note accepted | PASS |
| AC-TREND-004 | tests (lib + CLI) plus manual out-of-tree run: `node scripts/validate.ts $TMP --baseline data/taxonomy.json` → `ERROR data/taxonomy.json · requirements-engineering · V9 · ...`, exit=1; same tree without baseline → `NOTE  V9 skipped: ...`, exit=0; deprecation with baseline → exit 0 | PASS |
| AC-TREND-005 | `tests/core.test.ts` — A 4/3, B 3/3, C 0/0, no D row; per-round type sums equal round question counts | PASS |
| AC-TREND-006 | `tests/core.test.ts` — track/subject/confidence/period (inclusive, shared (2023,2) pair), reversed period and no-match filters return zero counts, deep-equal determinism | PASS |
| AC-TREND-007 | `tests/core.test.ts` — order v,w,x,y,zero (count → rounds → slug), zero row last; rounds/name sorts | PASS |
| AC-TREND-008 | `tests/core.test.ts` — 3×4 matrix in R1 order, max=2; levels for 0,1,5,6,8,10 @ max 10 = 0,1,2,3,4,4; max 0 → 0 | PASS |
| AC-TREND-009 | `tests/views.test.tsx` — 12 cells, aria-label has name/round/count, tooltip on mouseEnter and on focus | PASS |
| AC-TREND-010 | `tests/views.test.tsx` — 3 views × 4 filters (12 cases) match core output; sort buttons reorder; filter persists across hashchange | PASS |
| AC-TREND-011 | `tests/views.test.tsx` — trend-group-written [2023-1-written, 2023-2-written], trend-group-practical [2023-2-practical, 2024-1-practical] | PASS |
| AC-TREND-012 | `tests/views.test.tsx` — exact disclaimer text in 3 views; sources lists 3 distinct labels once; analysis note on filter bar and sources page | PASS |
| AC-TREND-013 | `npm run build` exit 0; `dist/index.html` → `src="/Information-Processing-GISA/assets/index-C5XSvvMs.js"`, `href="/Information-Processing-GISA/assets/index-BHlIaxAg.css"`; `ls dist/data` → No such file; all 3 seed round ids found in `dist/assets/index-C5XSvvMs.js`; nav link `#/sources` (test). Headless Chrome on `vite preview` rendered 147 heatmap cells | PASS |
| AC-TREND-014 | `.github/workflows/ci.yml`: deploy `if: github.event_name == 'push' && github.ref == 'refs/heads/main'`, `needs: [validate, test, build]`; no `paths`/`paths-ignore`; build also push-only so PRs run validate+test; PR validate passes `--baseline` from `git show origin/$BASE_REF:data/taxonomy.json` (simulated locally with `HEAD:` → exit 0). Not executed on GitHub yet (no remote) | PASS (definition) |
| AC-TREND-015 | `npm test -- --coverage` → `Tests  69 passed (69)`; lines: aggregate.ts 100%, validate-lib.ts 100% (threshold 85 enforced in vite.config.ts) | PASS |
| AC-TREND-016 | `head -3 LICENSE` → `MIT License` / blank / `Copyright (c) 2026 DevMinGeonPark` | PASS |

### Quality gates

| Gate | Observed | Status |
|------|----------|--------|
| `tsc --noEmit` | exit 0 | PASS |
| Lint | no ESLint configured; `tsc` strict + noUnused* is the only static check | GAP |

### Gaps and review items

- Seed data accuracy needs the user's review: 3 rounds (2022-1-written, 2024-1-practical, 2024-2-practical), 6 questions each, all `confidence: reconstructed`. Question numbers and concept mappings are placeholders that were not checked against the real exams; each record carries a note saying so.
- Taxonomy topics/concepts are a first draft. Practical-track slugs use a `p-` prefix to keep slugs unique across subjects.
- CI has never run on GitHub (no remote). Pages source must be set to "GitHub Actions" before the first deploy.
- The live URL check in DoD §D.3 is pending until the repository is pushed.
- SPEC status moved draft → in-progress after M5 rather than on the M1 commit.

## §E.3 Run-phase Audit-Ready Signal

```yaml
run_complete_at: 2026-10-25
run_commit_sha: <this commit; see git log>
run_status: complete-with-gaps
ac_pass_count: 16
ac_fail_count: 0
new_warnings_or_lints_introduced: 0
cross_platform_build:
  macos_local: pass
  ubuntu_ci: not-run
total_run_phase_files: 37
m1_to_mN_commit_strategy: one commit per milestone (M1-M5) + evidence commit
```

## §E.4 Sync-phase Audit-Ready Signal

```yaml
sync_complete_at: 2026-10-25
sync_commit_sha: pending-backfill-sync
sync_status: complete-with-gaps
b12_self_test_a: "grep -c SPEC-TREND-001 CHANGELOG.md before emission → 0 (CHANGELOG.md absent)"
b12_self_test_b: "distinct AC ids in acceptance.md → 16; CHANGELOG v0.1.0 entry states 16"
b12_self_test_c: "ls of every path named in the CHANGELOG entry → all exist"
changelog_entry_position: "## [0.1.0] - 2026-10-25 (below empty [Unreleased])"
frontmatter_status_transitions:
  spec_md: "in-progress → implemented → completed (single sync commit)"
  plan_md: "no frontmatter block — not modified"
  acceptance_md: "no frontmatter block — not modified"
  progress_md: "no frontmatter block — not modified"
docs: [README.md (new), CHANGELOG.md (new)]
pre_sync_checks:
  npm_test: "Tests  69 passed (69)"
  npm_run_validate: "0 error(s), 0 warning(s)"
deploy_evidence_from_orchestrator:
  live_site: "https://devmingeonpark.github.io/Information-Processing-GISA/ → HTTP 200"
  ci_run: "40140409521 success (validate/test/build/deploy)"
  branch_protection: "main requires [validate, test]"
open_gaps:
  - seed data (3 rounds × 6 questions, reconstructed) awaits user content review
  - no ESLint; tsc strict is the only static check
  - SPEC-TREND-002 (contribution guide, CONTRIBUTING.md, data license) not started
```
