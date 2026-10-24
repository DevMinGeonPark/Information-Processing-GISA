# SPEC Review Report: SPEC-TREND-001 + SPEC-TREND-002 (seam)
Iteration: 2/3
Reasoning context ignored per M1 Context Isolation. Claude-only audit (codex/glm not invoked: separately billed backends need explicit user permission).

Audited snapshot (shasum):
- TREND-001 spec.md 6b848d29, plan.md 6784a877, acceptance.md a721f922, progress.md b416490a
- TREND-002 spec.md 976837ac, plan.md 26089b7f, acceptance.md 823a14f1, progress.md 81312a7a

| SPEC | Verdict | Score | Threshold |
|------|---------|-------|-----------|
| SPEC-TREND-001 v0.4.0 | PASS | 0.88 | 0.80 (Tier M) |
| SPEC-TREND-002 v0.1.0 | PASS | 0.81 | 0.80 (Tier M) |

Both PASS on the must-pass firewall and rubric score. The blocking findings below (X1, F2, F1, S1, S2) are cheap but must land before Implementation Kickoff; recommend an iteration-3 delta check scoped to them.

## Must-Pass Results

### SPEC-TREND-001
- [PASS] MP-1: REQ-TREND-001..016 once each, spec.md:L148-L175.
- [PASS] MP-2 (requirement layer): all 16 match Ubiquitous/Event/State/Unwanted; compounds (REQ-004 L154, REQ-014 L173) chain conforming clauses.
- [PASS] MP-3: L2-L13 all 12 fields; `version: "0.4.0"`. Extra `related_specs` (L15) is not in the schema SSOT optional list — harmless, see O1.
- [N/A] MP-4: single-stack TS project.
- [PASS] MP-5 D7: references SPEC-TREND-002 (status draft, not retired/superseded).
- [PASS] MP-6 D8: `syscall` count 0.
- [PASS] MP-7: `grep '\[NEEDS CLARIFICATION'` on both plan.md → no match (exit 1); plan.md §B L9-L18 now "확정 사항". No research.md (Tier M).

### SPEC-TREND-002
- [PASS] MP-1: REQ-TREND2-001..008 once each, spec.md:L71-L84.
- [PASS] MP-2: 001-003, 006, 007 ubiquitous; 004 event; 005, 008 unwanted (`shall not`).
- [PASS] MP-3: 12 fields L2-L13; `depends_on: [SPEC-TREND-001]` (schema optional field, L15).
- [N/A] MP-4. [PASS] MP-5 (TREND-001 draft). [PASS] MP-6 (0). [PASS] MP-7 (no markers).

## Category Scores

| SPEC | Clarity | Completeness | Testability | Traceability | Mean |
|------|---------|--------------|-------------|--------------|------|
| TREND-001 | 1.0 | 0.75 (X1 seam: validator CLI) | 1.0 | 0.75 (F1 untraced obligation) | 0.88 |
| TREND-002 | 0.75 (S1-adjacent §E wording L88; S2) | 0.75 (X1 bootstrap) | 0.75 (S2: AC2-005 permissions) | 1.0 (8/8 REQ↔AC) | 0.81 |

Evidence: TREND-001 ACs all binary — e.g. AC-008 L53 pins R7 values (checked: ceil(4·6/10)=3, ceil(4·8/10)=4), AC-013 L82 checks base prefix + no `dist/data/` + seed ids in bundle, AC-016 L97 LICENSE strings. TREND-002 AC2-008 L49-L51 marker-string network spy is a strong binary test.

## Defects Found

X1. seam — TREND-001 spec.md:L154 (REQ-004), plan.md:L56-L60; TREND-002 plan.md:L53 — The base-validator gate runs base-branch `scripts/validate.ts` against the PR's `data/` in another directory. TREND-001's validator contract only defines a baseline-taxonomy argument, not a data-root argument, nor that schemas load from the script's own tree. Bootstrap failure: if TREND-002 adds the flag, the TREND-002 PR's own gate runs the base (flag-less) validator and fails. — Severity: major — Class: blocking — Fix: add to TREND-001 REQ-004/plan M2 "the validator accepts a data-root path and loads schemas from its own checkout", with one AC-002/AC-004 case run against a data dir outside the script's tree.
F1. TREND-001 spec.md:L88 — "사이트의 과목 필터와 출처 페이지에 '실기 과목은 분석용 분류'라고 표시한다" is a behavioural obligation with no REQ/AC — Severity: minor — Class: blocking — Fix: fold into REQ-012 + AC-012 (exact text), or drop the sentence.
F2. TREND-001 spec.md:L57 vs L139 — glossary says slug deletion is "V9로 기계 검증", but V9 is skipped on `main` push. Under this project's main-direct route (owner commits straight to `main`), V9 never runs on owner changes — Severity: minor — Class: blocking — Fix: reword L57 to "PR에서 V9로 기계 검증", or on `main` push supply the pre-push taxonomy (`github.event.before`) as baseline.
S1. TREND-002 spec.md:L88 — "[HARD] … 기여 관문이 판정하지 않는다" can be read as "the gate skips such PRs" or "the gate still runs but is not authoritative". The two give different workflows — Severity: minor — Class: blocking — Fix: state "the gate still runs; a pass is not sufficient for merge; owner review is required".
S2. TREND-002 spec.md:L78, acceptance.md:L34 — TREND-001 uses one `ci.yml` (plan §G L105) whose push-only deploy job needs `pages: write`/`id-token: write`. "워크플로 또는 job의 permissions가 contents: read만 허용" is ambiguous for that file, so AC2-005 can fail a correct workflow — Severity: minor — Class: blocking — Fix: "every job that runs on `pull_request` has only `contents: read`; the deploy job (push-only `if`) may hold Pages permissions".
O1. both spec.md:L15-L16 — `related_specs` is not a schema-recognised field — minor, optional — keep only `depends_on` (TREND-002) or add the field to the schema SSOT.
O2. TREND-002 REQ2-007 — browser check is schema-only, so the helper can emit snippets that pass schema but fail CI V5/V6 (concept from another subject, subject off-track) — minor, optional — filter the concept list by chosen subject and the subject list by round track.
O3. TREND-002 acceptance.md:L17 — REQ2-002 names "DevMinGeonPark and contributors"; AC2-002 checks only DevMinGeonPark — minor, optional.
O4. TREND-001 plan.md:L86-L106 — proposed tree still exceeds Tier M's 5-15 file guidance (REQ/AC budget now fine) — minor, optional, orchestrator call.
O5. TREND-001 spec.md:L107 — id regex caps question number at 999 while `number` is unbounded — trivial, optional.

## Cross-SPEC Seam Check
- Dependency direction: TREND-002 `depends_on: [SPEC-TREND-001]`; plan.md:L13, L26 gate run-phase on TREND-001 `completed`. Correct.
- Contract duplication/drift: none found. TREND-002 §C L48-L53 and plan §A L5-L11 reference TREND-001 §C.1-§C.6 / REQ-004 / REQ-013-014 by pointer. No field, regex, or rule is restated. The new CONTRIBUTING heading list is TREND-002-owned.
- Compatibility: TREND-002 rewires TREND-001's PR validate step; TREND-001 AC-014 (base taxonomy, no paths filter) still holds after the change. Interim window covered: data track accepts owner-only PRs until TREND-002 completes (TREND-001 plan L82); layout slot reserved (L72).
- Nothing dropped from v0.3.0. Every v0.3.0 contribution item maps to a home:

| v0.3.0 item | Now in |
|-------------|--------|
| REQ-014 (CONTRIBUTING, templates, no-text check) | REQ2-001, REQ2-003 |
| REQ-015 (data PR gate, V9 baseline, failing log) | REQ2-004 + TREND-001 REQ-014 |
| REQ-016 (entry link, helper, valid-only copy, no network) | REQ2-006, REQ2-007, REQ2-008 |
| AC-014 / AC-015 / AC-016 | AC2-001+003 / AC2-004 / AC2-006-008 |
| §E branch-protection note | TREND-002 §E L89, plan §C, DoD |
| Boundaries (data+code PR, unknown concept) | TREND-002 acceptance §D.1 |
| Out of Scope (server submit, rewards, bot) | TREND-002 §G |
| Terms (contributor, gate, helper) | TREND-002 §B |
| Risks (quality, paste, concurrent edits, protection) | TREND-002 §H |

## Regression Check
Iteration-1 defects D1-D17 and iteration-2 preliminary findings N1-N8:
- D1 RESOLVED (plan refs L28 REQ-003, L31-32 REQ-013, L112 REQ-012, L115 REQ-002). D2 RESOLVED (AC-002 V1-V8+W1). D3 RESOLVED (V9, AC-004; see F2 for wording). D4 RESOLVED (V6, V7, regexes). D5 RESOLVED (V8 incl. same-subject). D6 RESOLVED (R1, R2; AC-006, AC-008). D7 RESOLVED (R7; AC-008). D8 RESOLVED (R4, R5; AC-005, AC-007). D9 RESOLVED (AC-013). D10 RESOLVED (AC-003, §E L183). D11 RESOLVED (AC-012 exact text). D12 RESOLVED (AC-009 hover, AC-010 3×4). D13 RESOLVED (AC-014 `if`). D14 RESOLVED (REQ-013 hash routing). D15 RESOLVED (2022-3회; cited URL not fetched by this audit). D16 PARTIAL: REQ/AC budget fixed, file-count guidance still exceeded (O4). D17 RESOLVED (§F L198).
- N1 RESOLVED (split; 16/16 and 8/8). N2 RESOLVED (REQ2-004/005, §E). N3 RESOLVED. N4 RESOLVED (REQ-016 MIT, REQ2-002 CC BY). N5 RESOLVED (REQ-013 bundle, REQ2-008, AC2-008). N6 RESOLVED (owner pinned, assumption logged plan §C L24). N7 RESOLVED (REQ-004, AC-004). N8 RESOLVED.
- Score trend TREND-001: 0.63 → (prelim 0.75) → 0.88. No regression STOP.

## Recommendation
1. X1: add the data-root argument and self-relative schema loading to TREND-001 REQ-004 / plan M2, with one AC case.
2. F1: trace or drop the practical-subject label sentence (TREND-001 L88).
3. F2: fix the V9 "기계 검증" wording, or add a push-time baseline.
4. S1, S2: reword TREND-002 §E L88 and REQ2-005/AC2-005 as above.
5. Then run an iteration-3 delta check on these five items only. O1-O5 are at orchestrator discretion.

---

# Iteration 3/3 — Delta Check (X1, F1, F2, S1, S2, O2)

Scope: the six enumerated fixes plus cross-ref/count/seam regression only (no full re-audit).
Snapshot (shasum): TREND-001 spec a89c0fc9, plan a139b657, acceptance dea89d69, progress 07709f97; TREND-002 spec 9e393b1e, plan 3bce3ed1, acceptance afc92976, progress c98aef51.

| Fix | Status | Evidence |
|-----|--------|----------|
| X1 | RESOLVED | TREND-001 spec.md:L155 REQ-004 adds the data-root argument and schemas loaded from the validator's own checkout; plan.md:L60 adds it to M2 for the first version; acceptance.md:L31 AC-004 adds an out-of-tree data-root case expecting the V9 line and non-zero exit. TREND-002 spec.md:L53 and plan.md:L53 point at it (no restatement). Bootstrap issue removed: the base validator carries the flag before TREND-002 starts. |
| F1 | RESOLVED | TREND-001 spec.md:L169 REQ-012 pins "실기 과목은 분석용 분류입니다." for the subject filter and the sources page; acceptance.md:L75 AC-012 checks the exact text. |
| F2 | RESOLVED | TREND-001 spec.md:L58: V9 machine check limited to PRs, owner main-direct push explicitly manual. Consistent with V9 (spec §C.6, skip on main push). |
| S1 | RESOLVED | TREND-002 spec.md:L89: gate still runs, a pass is not sufficient, owner review is mandatory. |
| S2 | RESOLVED | TREND-002 spec.md:L79 REQ2-005 and acceptance.md:L34 AC2-005 scope `contents: read` to `pull_request` jobs; a push-on-main deploy job may hold Pages permissions. |
| O2 | RESOLVED | TREND-002 spec.md:L84 REQ2-007 adds the track-filtered subject list and subject-filtered concept list; acceptance.md:L46 AC2-007 and §D.1 L58 updated to match. |

Regression:
- Counts unchanged: TREND-001 16 REQ / 16 AC, TREND-002 8 / 8.
- No [NEEDS CLARIFICATION] markers (grep exit 1).
- Versions match: TREND-001 0.5.0 and TREND-002 0.2.0 in HISTORY and progress.md.
- REQ↔AC mappings intact (AC-004→REQ-004, AC-012→REQ-012, AC2-005→REQ2-004/005, AC2-007→REQ2-007).
- Seam: TREND-002 references TREND-001 REQ-004 by pointer, so nothing is duplicated. `depends_on` unchanged.
- No new defects.

Remaining optional items (not routed): O1 `related_specs` non-schema field, O3 AC2-002 "contributors", O4 file-count tier guidance, O5 question-number regex cap.

| SPEC | Final verdict | Score |
|------|---------------|-------|
| SPEC-TREND-001 v0.5.0 | PASS | 1.00 (Clarity 1.0, Completeness 1.0, Testability 1.0, Traceability 1.0) |
| SPEC-TREND-002 v0.2.0 | PASS | 1.00 (Clarity 1.0, Completeness 1.0, Testability 1.0, Traceability 1.0) |

Implementation Kickoff Approval remains a separate human gate; this verdict does not authorize run-phase entry.
