---
id: SPEC-TREND-002
title: "정보처리기사 기출 데이터 커뮤니티 기여 흐름 (GitHub PR 기반)"
version: "0.2.0"
status: completed
created: 2026-10-25
updated: 2026-10-26
author: min
priority: P2
phase: "v0.1.0 target"
module: "CONTRIBUTING.md, LICENSE-DATA, .github/, src/views/"
lifecycle: spec-anchored
tags: "community-contribution, github-pr, ci-gate, license, snippet-helper"
tier: M
depends_on: [SPEC-TREND-001]
related_specs: [SPEC-TREND-001]
---

# SPEC-TREND-002 — 기출 데이터 커뮤니티 기여 흐름

## HISTORY

| 버전 | 날짜 | 작성자 | 내용 |
|------|------|--------|------|
| 0.1.0 | 2026-10-25 | min (manager-spec) | SPEC-TREND-001 v0.3.0의 커뮤니티 기여 범위(REQ-014~016과 관련 계획)를 분리해 신설 (plan-audit N1). base 브랜치 검증기 사용(N2), 라이선스 명시(N4), 네트워크 조건 표현 수정(N5) 반영 |
| 0.2.0 | 2026-10-25 | min (manager-spec) | plan-audit 2차(PASS 0.81) 차단 항목 반영: 검증기·스키마 변경 PR에서 관문 역할 명확화(S1), 읽기 권한 규칙을 `pull_request` job으로 한정(S2). 선택 항목 O2(트랙별 과목·과목별 개념 목록 제한) 반영 |

## §A 배경과 목적

SPEC-TREND-001은 데이터 계약(스키마, 집계 규칙, 검증 규칙 V1~V9)과 검증 스크립트, CI를 만든다. 2020년 이후 전체 회차를 채우려면 저장소 소유자 혼자서는 부족하므로, 누구나 GitHub Pull Request로 기출 메타데이터를 추가·수정할 수 있는 흐름을 만든다.

이 SPEC은 다음을 만든다.

1. 한국어 기여 가이드 `CONTRIBUTING.md`, 데이터 라이선스 고지 `LICENSE-DATA`(CC BY 4.0), 이슈·PR 템플릿
2. 기여 PR이 검증기 자체를 고쳐 관문을 통과하지 못하도록, **base 브랜치의 검증기와 스키마**로 PR 데이터를 검증하는 기여 관문
3. 사이트의 "데이터 기여하기" 진입점과, 입력값으로 문항 메타데이터 JSON 조각을 만들어 주는 스니펫 도우미

데이터 계약은 SPEC-TREND-001 §C를 그대로 참조하며 이 문서에 다시 적지 않는다.

## §B 용어

| 용어 | 정의 |
|------|------|
| 기여자(contributor) | GitHub 계정으로 데이터 추가·수정 PR을 올리는 외부 사용자 |
| 기여 관문(contribution gate) | PR에서 자동 실행되어, base 브랜치의 검증기·스키마로 PR의 `data/`를 검증하는 CI 체크 |
| base 검증기 | PR 대상 브랜치(`main`)에 있는 `scripts/` 검증 스크립트와 `data/schema/` 스키마. PR이 바꾼 검증기·스키마가 아님 |
| 스니펫 도우미 | 사이트 안에서 입력값으로 문항 메타데이터 JSON 조각을 만들어 복사하게 해 주는 화면 |

## §C 계약 참조

- 데이터 형식, id 규칙, 길이 상한: SPEC-TREND-001 spec.md §C.1~§C.4
- 검증 규칙 V1~V9, W1과 출력 형식: SPEC-TREND-001 spec.md §C.6
- 검증 스크립트 동작(데이터 루트 인자, 자기 체크아웃 기준 스키마 로드, 기준 taxonomy 인자, V9 건너뜀 안내): SPEC-TREND-001 REQ-TREND-004
- PR CI 기본 동작(모든 PR에서 검증·테스트, 배포 없음): SPEC-TREND-001 REQ-TREND-014. 이 SPEC은 그중 데이터 검증 단계를 base 검증기로 바꾸는 방식으로 강화한다

`CONTRIBUTING.md`의 필수 제목(아래 REQ-TREND2-001이 참조):

1. `## 기여하기 전에`
2. `## 1. 저장소 포크하기`
3. `## 2. 데이터 파일 위치`
4. `## 3. 필드 설명`
5. `## 4. 개념 태깅과 유형 판별 규칙`
6. `## 5. 출처 표기`
7. `## 6. 로컬에서 검증하기`
8. `## 7. Pull Request 열기`
9. `## 라이선스`

## §D 요구사항 (GEARS)

### §D.1 문서와 라이선스

- **REQ-TREND2-001** The repository shall provide a Korean `CONTRIBUTING.md` containing every heading listed in §C in that order, whose `## 라이선스` section states that contributed data under `data/` is licensed under CC BY 4.0 and that source code is licensed under MIT.
- **REQ-TREND2-002** The repository shall provide a `LICENSE-DATA` file at its root carrying the CC BY 4.0 license notice for the contents of `data/`, naming DevMinGeonPark and contributors as attribution holders.
- **REQ-TREND2-003** The repository shall provide a GitHub issue template for data submissions and a pull request template, where both ask for round, track, subject, concept tags, question type, confidence, and source attribution, and include checklist items confirming that no question text is included and that the contribution is provided under CC BY 4.0.

### §D.2 기여 관문

- **REQ-TREND2-004** **When** any pull request targets `main`, the CI workflow shall validate the pull request's `data/` files using the validation script and schemas taken from the base branch, supplying the base-branch taxonomy as the V9 baseline, and **when** validation fails, it shall report a failing check whose log carries the violation lines of SPEC-TREND-001 §C.6.
- **REQ-TREND2-005** The CI workflows shall not use the `pull_request_target` event, and every job that runs on the `pull_request` event shall hold no permission beyond read access to repository contents; a deploy job restricted to `push` on `main` may hold the Pages deployment permissions.

### §D.3 사이트 진입점과 도우미

- **REQ-TREND2-006** The site shall show a visible "데이터 기여하기" entry point on every page linking to `https://github.com/DevMinGeonPark/Information-Processing-GISA/blob/main/CONTRIBUTING.md`.
- **REQ-TREND2-007** The snippet helper page shall build a question-metadata JSON snippet from form input, offer only subjects whose `tracks` include the chosen round's track and only non-deprecated concepts of the chosen subject from the bundled taxonomy, validate the snippet in the browser against the SPEC-TREND-001 question schema, and offer it for copying only **when** it is valid.
- **REQ-TREND2-008** The snippet helper shall not issue any network request carrying form input, relying only on the dataset and schemas bundled at build time (SPEC-TREND-001 REQ-TREND-013).

## §E 비기능 제약

- [HARD] `scripts/` 또는 `data/schema/`를 바꾸는 PR에서도 기여 관문은 그대로 실행되지만, 관문 통과만으로는 병합 조건을 채우지 못한다. base 검증기는 바뀐 검증기·스키마의 타당성을 판단할 수 없으므로, 이런 PR은 저장소 소유자 리뷰를 반드시 거친다. `CONTRIBUTING.md`의 `## 기여하기 전에`에 데이터 기여 PR은 `data/` 아래 파일만 바꾸라고 안내한다
- 기여 관문이 실제로 병합을 막으려면 `main` 브랜치 보호에서 관문 job을 필수 상태 체크로 지정해야 한다 (저장소 설정, plan.md §C)
- v1 리뷰는 저장소 소유자 1인이 맡고 CODEOWNERS는 두지 않는다
- 서버, 제출 API, 외부 서비스 호출 없음

## §F 기술 접근 권고

| 영역 | 권고 | 근거 |
|------|------|------|
| 이슈 템플릿 | GitHub issue form(YAML) | GitHub 기본 기능, 필수 입력 항목 지정 가능 |
| PR 템플릿 | `.github/pull_request_template.md` | GitHub 기본 기능 |
| base 검증기 | 같은 워크플로에서 base ref를 별도 디렉터리로 체크아웃하고 그 안의 검증기·스키마로 PR 작업 트리의 `data/`를 검증 | PR이 바꾼 검증기가 자기 데이터를 판정하는 우회를 막음. `pull_request` 이벤트라 포크 PR에도 쓰기 권한·비밀값이 노출되지 않음 |
| 브라우저 검증 | SPEC-TREND-001과 같은 Ajv + `data/schema/` import | 스키마 사본 없음 |

## §G 제외 범위 (Out of Scope)

### Out of Scope — 서버 측 기여 처리

- 사이트에서 서버로 데이터를 제출하는 기능, 제출 API, GitHub API를 대신 호출하는 PR 자동 생성
- 이슈 템플릿 제출 내용을 데이터 파일로 자동 변환하는 봇

### Out of Scope — 운영 자동화

- 기여 PR 자동 병합, 기여자 랭킹·배지 등 보상 기능
- CODEOWNERS, 다수 리뷰어 체계 (v1은 소유자 1인 리뷰)

### Out of Scope — 데이터 계약 변경

- 스키마·검증 규칙·집계 규칙 자체의 변경 (SPEC-TREND-001 소관)

## §H 참조

- 실행 계획: `plan.md`
- 인수 기준: `acceptance.md`
- 진행 기록: `progress.md`
- 선행 SPEC: `.moai/specs/SPEC-TREND-001/`
