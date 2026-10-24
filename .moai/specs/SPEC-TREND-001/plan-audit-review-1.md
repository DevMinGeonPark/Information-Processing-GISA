# SPEC Review Report: SPEC-TREND-001
Iteration: 1/3
Verdict: FAIL
Overall Score: 0.63 (Tier M threshold 0.80)

Reasoning context ignored per M1 Context Isolation. Cross-model backends (codex/glm) not invoked: `audit_model` is unset and both backends may incur separately billed API usage, which requires explicit user permission. Claude-only audit.

## Must-Pass Results
- [PASS] MP-1 REQ number consistency: spec.md:L119-L146 REQ-TREND-001..016, each exactly once, 3-digit padding, no gaps.
- [PASS] MP-2 GEARS compliance (requirement layer, spec.md §D only): every REQ clause matches Ubiquitous/Event/State/Unwanted. Caveats (non-blocking): REQ-002 uses `where` for a data event ("where a concept is retired", L120) — GEARS `Where` is a capability gate; several REQs (006, 009, 012, 013, 015) chain two patterns mid-sentence. ACs (Given-When-Then) not graded here.
- [PASS] MP-3 YAML frontmatter: spec.md:L2-L13 all 12 canonical fields; `version: "0.1.0"` quoted; `status: draft`; `priority: P1`; `lifecycle: spec-anchored`; `tags` comma string. No rejected aliases.
- [N/A] MP-4 language neutrality: single-stack (TS/Node) project SPEC; C/Java/Python in §C.3 L96 is exam content, not tooling.
- [PASS] MP-5 D7: only self-reference SPEC-TREND-001 found; no BLOCKING.
- [PASS] MP-6 D8: `syscall` count 0.
- [FAIL] MP-7 clarification gate: plan.md:L9, L10, L11 — three unresolved `[NEEDS CLARIFICATION]` markers (seed round count, practical subject mapping, Pages URL/base). Expected open items, correctly tracked (plan.md §C L17, acceptance.md DoD L122) — but must be resolved via AskUserQuestion before Implementation Kickoff Approval.

## Category Scores
| Dimension | Score | Band | Evidence |
|-----------|-------|------|----------|
| Clarity | 0.50 | 0.50 | Round ordering/range undefined (L59-L62, L131-L132); intensity buckets undefined (L138); deprecated-concept aggregation undefined (L120, L126) |
| Completeness | 0.75 | 0.75 | All sections + Out of Scope H3s (L170-L186); failure-mode gaps (D5-D8) |
| Testability | 0.75 | 0.75 | acceptance.md:L86 "취지의 안내" judgement; DoD L121 Pages URL not an AC |
| Traceability | 0.50 | 0.50 | plan.md cites 5 wrong/nonexistent REQ ids (D1); REQ-002 slug uniqueness/immutability and part of REQ-004 have no AC (D2, D3) |

## Defects Found
D1. plan.md:L21,L44,L88,L90 — wrong REQ cross-refs: L21 "원문 금지 (REQ-TREND-004)" should be 003; L44 "참조 무결성(REQ-TREND-011~014)" should be 004~005 (011-014 are UI); L88 "REQ-TREND-060" does not exist (→014); L90 "replaced_by(REQ-TREND-005)" → 002, "경고(REQ-TREND-014)" → 005 — Severity: major — Class: blocking — Fix: correct all five references.
D2. acceptance.md:L14-L17 vs spec.md:L125 — REQ-004 lists 7 failure causes; AC-002 covers 4. Untested: nonexistent round, nonexistent subject, nonexistent type, duplicate taxonomy slug, schema violation in non-question files. Malformed JSON (parse error) not covered at all — the most likely broken contribution PR — Severity: major — Class: blocking — Fix: add fixtures for each cause + a syntactically invalid JSON fixture; add "file is not valid JSON" to REQ-004.
D3. spec.md:L49,L120 — slug immutability ("한 번 공개된 slug는 바꾸지 않음") and "deprecate rather than delete" are not machine-checked; a PR deleting an unreferenced concept passes validation. No AC — Severity: major — Class: blocking — Fix: either add a CI check (every taxonomy slug on the base branch still exists in the PR) with an AC, or explicitly declare it reviewer-enforced in §E/§G.
D4. spec.md:L125 — no cross-field consistency checks: round `id` vs `year`/`session`/`track`; question `id` vs `round`+`number`; question subject's `tracks` must include its round's `track`; per-round file name vs contained `round`. Mismatches silently corrupt grouping — Severity: major — Class: blocking — Fix: add these to REQ-004 and AC-002; give an id regex (e.g. `^\d{4}-[1-9]-(written|practical)$`).
D5. spec.md:L120,L126 — `replaced_by` integrity undefined: may point to a nonexistent or another deprecated concept (chain/cycle) — Severity: major — Class: blocking — Fix: REQ-004 fails when `replaced_by` does not resolve to an existing non-deprecated concept.
D6. spec.md:L59-L62,L131-L132 — chronological order and round-range filter undefined: `date` optional; same year-session written vs practical tie unordered; inclusive range between rounds of different tracks ambiguous — Severity: major — Class: blocking — Fix: define sort key `(year, session, track)` with explicit track order; define range endpoints as `(year, session)` not round ids.
D7. spec.md:L138; acceptance.md:L51-L54 — 5-level intensity mapping only pins 0→0 and max→4; mid buckets, scale domain (filtered matrix max vs global), and all-zero matrix (max=0) unspecified — Severity: major — Class: blocking — Fix: state the formula (e.g. `level = v==0 ? 0 : ceil(4*v/max)`), domain = filtered matrix, and add AC rows for mid values and max=0.
D8. spec.md:L120,L132,L136 — aggregation of deprecated concepts (own row, merged into `replaced_by`, or hidden) and inclusion of zero-count concepts as ranking/heatmap rows undefined; AC-008 "3행" depends on it — Severity: major — Class: blocking — Fix: specify both behaviours in REQ-008/REQ-011.
D9. spec.md:L145; acceptance.md:L90-L93 — no AC guards Vite `base`: AC-016a passes with a wrong base and the deployed site loads no assets. Correctly tracked as open (plan.md:L11) — Severity: major — Class: blocking (after MP-7 resolution) — Fix: add AC that asset URLs in `dist/index.html` start with the configured base.
D10. spec.md:L121; acceptance.md:L24-L27 — `additionalProperties: false` blocks extra fields but not text pasted into `note`/`sources.label`; acceptance.md:L116 overclaims "원문 없음 (AC-004로 기계 검증)". Also additionalProperties must apply to nested `sources` items — Severity: minor — Class: blocking — Fix: add `maxLength` on `note`, nested `additionalProperties: false`, and reword L116 to "extra-field rejection only; text in note is reviewer-checked".
D11. acceptance.md:L86 — "취지의 안내" is not binary — Severity: minor — Class: blocking — Fix: pin exact disclaimer string or a shared component/test id.
D12. acceptance.md:L73-L76 — REQ-010 says every view × 4 filters; AC-013 tests ranking view + track filter only. REQ-012 hover not tested (AC-012 focus only) — Severity: minor — Class: optional — Fix: parametrize over views/filters, or narrow REQ wording.
D13. acceptance.md:L95-L98 — "pull_request 트리거에는 배포 job이 없고" ambiguous for single-file workflow — Severity: minor — Class: optional — Fix: require deploy job `if: github.event_name=='push' && github.ref=='refs/heads/main'` or separate workflow files.
D14. spec.md:L141 — sources "page" on GitHub Pages: BrowserRouter deep links 404 — Severity: minor — Class: optional — Fix: state hash routing or a 404.html fallback.
D15. spec.md:L62 — "필기 2022년 이후는 cbt": UNVERIFIED by this audit; commonly reported that written CBT began mid-2022 (round 3), not 2022-1 — Severity: minor — Class: optional — Fix: verify and state the exact first CBT round.
D16. spec.md:L115; plan.md:L63-L82 — REQs bundled to fit the 16-REQ Tier M cap (L115 says so); proposed structure is roughly 20+ files, above Tier M's 5-15 guidance — Severity: minor — Class: optional — Fix: confirm tier, or keep and accept.
D17. spec.md:L61-L62,L68-L69,L108 — `date`, `format`, `aliases`, `difficulty` used by no REQ/view — Severity: minor — Class: optional — Fix: drop until a view consumes them (YAGNI), or keep as optional schema fields knowingly.

## Recommendation
1. Resolve plan.md §B markers (MP-7) via AskUserQuestion; then add the base-path AC (D9).
2. Fix plan.md REQ references (D1).
3. Extend REQ-004 + AC-002 with the missing causes, malformed JSON, cross-field consistency, and replaced_by integrity (D2, D4, D5).
4. Decide slug-immutability enforcement (D3).
5. Pin round ordering/range, intensity formula, deprecated/zero-count row behaviour (D6-D8).
6. Tighten D10, D11. Optional items D12-D17 at orchestrator discretion.
