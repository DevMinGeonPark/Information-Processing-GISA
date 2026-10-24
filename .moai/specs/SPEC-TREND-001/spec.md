---
id: SPEC-TREND-001
title: "정보처리기사 기출 유형·개념 출제 경향 분석 정적 사이트 v1"
version: "0.5.0"
status: completed
created: 2026-10-25
updated: 2026-10-25
author: min
priority: P1
phase: "v0.1.0 target"
module: "data/, src/, scripts/, .github/workflows/"
lifecycle: spec-anchored
tags: "trend-analysis, static-site, github-pages, data-schema, validation, heatmap, ranking"
tier: M
related_specs: [SPEC-TREND-002]
---

# SPEC-TREND-001 — 정보처리기사 기출 출제 경향 분석 사이트 v1

## HISTORY

| 버전 | 날짜 | 작성자 | 내용 |
|------|------|--------|------|
| 0.1.0 | 2026-10-25 | min (manager-spec) | 최초 작성 (plan-phase draft) |
| 0.2.0 | 2026-10-25 | min (manager-spec) | 커뮤니티 데이터 기여 기능을 v1 범위에 추가 |
| 0.3.0 | 2026-10-25 | min (manager-spec) | plan-audit 1차(FAIL 0.63) 결함 D1-D11 및 선택 항목 반영. 집계 규칙(§C.5)과 검증 규칙(§C.6)을 계약으로 고정. 사용자 확정 사항 반영 |
| 0.4.0 | 2026-10-25 | min (manager-spec) | plan-audit 2차 예비 결과 N1-N8 반영. 커뮤니티 기여 범위를 SPEC-TREND-002로 분리. 다중 집계 방식 없이 요구사항 16개·인수 기준 16개로 정리. V8 같은 과목 조건, V9 기준 taxonomy 부재 시 동작, MIT 라이선스 요구사항 추가 |
| 0.5.0 | 2026-10-25 | min (manager-spec) | plan-audit 2차(PASS 0.88) 차단 항목 반영: 검증기 데이터 루트 인자와 자기 기준 스키마 로드(X1), 실기 과목 안내 문구를 REQ-012로 추적(F1), slug 삭제 검증 범위를 PR로 한정(F2) |

## §A 배경과 목적

정보처리기사 수험생은 "어떤 개념이 얼마나 자주 나왔는가"를 근거로 공부 우선순위를 정하고 싶어 한다. 그러나 공개된 구조화 데이터셋은 없고(요약 저장소, 블로그·커뮤니티의 복원 기출만 존재), 필기는 2022년 3회부터 CBT로 바뀌어 공식 문항이 공개되지 않는다.

이 SPEC은 다음을 만든다.

1. 기출 문항을 **메타데이터 중심**으로 기록하는 정규(canonical) JSON 데이터셋, 통제된 개념 분류 체계(taxonomy), 그리고 그 계약을 지키게 하는 검증 스크립트
2. 그 데이터로 개념 중요도 랭킹, 잔디형(GitHub contribution graph 형태) 히트맵, 회차별 유형 분포를 보여 주는 정적 웹사이트
3. CI와 GitHub Pages 자동 배포 (`https://DevMinGeonPark.github.io/Information-Processing-GISA/`, 공개 저장소)

커뮤니티 기여 흐름(기여 가이드, 템플릿, 데이터 라이선스 고지, 기여 관문 강화, 사이트의 기여 진입점과 스니펫 도우미)은 **SPEC-TREND-002**에서 다룬다. 이 SPEC은 그 흐름이 기대는 데이터 계약(§C)과 검증기(REQ-TREND-004)를 제공한다.

데이터 범위 목표는 2020년 출제기준 개정 이후 시행된 모든 회차(필기·실기)다. 다만 이 SPEC의 완료 조건은 소수 시드 회차로 전체 기능이 동작하는 것이고, 나머지 회차는 데이터 트랙(plan.md §F)에서 채운다.

백엔드와 DB는 두지 않는다. 데이터셋은 빌드 시 번들에 포함하고, 모든 집계는 브라우저에서 순수 함수로 계산한다.

## §B 용어

| 용어 | 정의 |
|------|------|
| 트랙(track) | 시험 구분. `written`(필기) 또는 `practical`(실기) |
| 회차(round) | 한 차례 시행된 시험. 연도 + 회 + 트랙으로 식별 (예: `2024-1-written`) |
| 과목(subject) | 필기 5과목 또는 실기 출제 영역. taxonomy 최상위 노드 |
| 주제(topic) | 과목 아래 중간 분류 |
| 개념(concept) | taxonomy 말단 노드. 출제 빈도 집계의 기본 단위 |
| 문항 메타데이터 | 문항 1개에 대한 회차·과목·개념 태그·유형·출처·신뢰도 기록. 문항 원문은 포함하지 않음 |
| 유형(question type) | 문항이 요구하는 풀이 방식 분류 (§C.3) |
| 신뢰도(confidence) | `official`(공식 공개 문항) 또는 `reconstructed`(수험생 복원) |
| slug | 소문자·숫자·하이픈으로 된 안정적 식별자 (`^[a-z0-9]+(-[a-z0-9]+)*$`). 한 번 `main`에 들어간 slug는 삭제하지 않음. PR에서는 §C.6 V9로 기계 검증하고, 소유자가 `main`에 직접 push하는 변경은 V9가 돌지 않으므로 소유자가 직접 지킨다 |
| 기준 taxonomy | 비교 기준이 되는 이전 taxonomy 파일. CI의 PR 검증에서는 base 브랜치(`main`)의 taxonomy |

## §C 데이터 모델과 규칙 (관찰 가능한 계약)

필드 이름, 식별자 형식, 집계 규칙, 검증 규칙은 구현과 데이터 작성자(SPEC-TREND-002의 기여자 포함)가 함께 따르는 공개 계약이므로 여기서 고정한다. 저장 형식은 JSON이며 JSON Schema(Draft 2020-12)로 검증한다. 모든 객체 스키마는 중첩 객체를 포함해 `additionalProperties: false`이다.

### §C.1 회차(rounds)

- `id`: `^\d{4}-[1-9]-(written|practical)$` (예: `2023-2-practical`), `<year>-<session>-<track>`과 정확히 일치
- `year`: 정수, `session`: 1~9 정수(회), `track`: `written` | `practical`

### §C.2 개념 분류 체계(taxonomy)

- 계층: 과목 → 주제 → 개념, 3단계 고정. 모든 노드는 `id`(slug)와 `name`(한국어 표시명)을 가지며, slug는 세 단계 전체에서 유일하다
- 과목 노드는 적용 트랙 `tracks`(`written`, `practical` 중 하나 이상)를 가진다
- 개념을 폐기할 때는 노드를 남기고 `deprecated: true`와 `replaced_by`(같은 과목의 대체 개념 slug)를 둔다

v1 과목 시드(seed):

| 트랙 | 과목 slug | 표시명 |
|------|-----------|--------|
| written | `software-design` | 소프트웨어 설계 |
| written | `software-development` | 소프트웨어 개발 |
| written | `database` | 데이터베이스 구축 |
| written | `programming-language` | 프로그래밍 언어 활용 |
| written | `information-system` | 정보시스템 구축 관리 |
| practical | `practical-programming` | 프로그래밍(코드 해석) |
| practical | `practical-database` | 데이터베이스·SQL |
| practical | `practical-theory` | 이론(SW공학·네트워크·보안 등) |

실기 3개 과목은 공식 과목이 아니라 분석용 출제 영역 분류이며, 사이트에 그 사실을 표시한다 (REQ-TREND-012).

### §C.3 유형(question type) v1 분류

하나의 축으로, 문항당 정확히 1개를 부여한다.

| slug | 표시명 | 판별 기준 |
|------|--------|-----------|
| `term` | 용어형 | 설명을 주고 용어·약어를 고르거나 쓰게 함 |
| `concept` | 개념이해형 | 특징·장단점·비교·옳고 그름 판단 |
| `calculation` | 계산형 | 수치 계산 필요 (페이지 교체 횟수, 해밍 거리, 서브넷 등) |
| `code` | 코드해석형 | C·Java·Python 코드의 출력·동작 해석 |
| `sql` | SQL형 | SQL 작성·결과 해석·관계대수 |
| `descriptive` | 서술형 | 짧은 서술·약술 답안 (주로 실기) |

### §C.4 문항 메타데이터(questions)

문항은 회차별 파일 `data/questions/<round-id>.json`에 저장한다. 각 항목은 다음을 가진다.

- `id`: `^\d{4}-[1-9]-(written|practical)-q[1-9][0-9]{0,2}$`, `<round>-q<number>`와 정확히 일치
- `round`: 회차 `id`, `number`: 1 이상 정수
- `subject`: 과목 slug, `concepts`: 개념 slug 배열(1개 이상, 중복 없음)
- `type`: §C.3 유형 slug
- `confidence`: `official` | `reconstructed`
- `sources`: 출처 배열(1개 이상). 각 항목은 `label`(1~100자)과 선택적 `url`(URI 형식)만 가진다
- `note`: 선택, 최대 200자. 메모 용도이며 문항 원문을 넣지 않는다

### §C.5 집계 규칙

- **R1 회차 순서**: `(year 오름차순, session 오름차순, track: written → practical)`. "시간순"은 항상 이 키를 뜻한다
- **R2 기간 필터**: 시작·끝을 `(year, session)` 쌍으로 받으며 양 끝을 포함한다. 회차의 `(year, session)`이 사전식으로 시작 이상 끝 이하이면 포함되고, 트랙과 무관하게 적용된다. 시작이 끝보다 늦으면 결과는 비어 있다
- **R3 트랙·과목·신뢰도 필터**: 트랙 필터는 그 트랙의 회차만, 과목 필터는 그 과목의 문항만, 신뢰도 필터는 그 신뢰도의 문항만 남긴다
- **R4 개념 행 집합**: 랭킹과 히트맵의 행은 폐기되지 않은 개념 중 과목 필터를 통과하고, 과목의 `tracks`가 트랙 필터와 겹치는 개념 전체다. 출제가 0회인 개념도 행으로 포함한다 (랭킹 하단, 히트맵 단계 0 행)
- **R5 폐기 개념 병합**: 폐기 개념에 붙은 태그는 그 `replaced_by` 개념의 태그로 계산한다. 한 문항이 폐기 개념과 그 대체 개념을 함께 태그하면 대체 개념에 1번만 센다. 폐기 개념은 행으로 표시하지 않는다
- **R6 개수**: 개념의 문항 수 = R5 적용 후 그 개념을 태그한 서로 다른 문항 수, 등장 회차 수 = 그 문항들이 속한 서로 다른 회차 수
- **R7 히트맵 강도**: 강도 범위는 현재 필터가 적용된 행렬의 최대 셀 값 `max`를 기준으로 한다. 셀 값 `v`의 단계는 `v = 0`이면 0, 그 외에는 `ceil(4 × v / max)`(1~4)이다. `max = 0`이면 모든 셀이 단계 0이다

### §C.6 검증 규칙

검증 스크립트가 실패로 처리하는 규칙(V1~V9)과 경고로만 처리하는 규칙(W1)이다. 각 위반은 파일 경로, 레코드 id(있으면), 규칙 코드, 원인을 한 줄로 출력한다.

| 코드 | 규칙 |
|------|------|
| V1 | 데이터 파일이 올바른 JSON으로 파싱되지 않음 |
| V2 | 파일이 해당 JSON Schema를 위반함 (필수 필드, 형식, 정규식, 길이, 추가 필드 포함) |
| V3 | 존재하지 않는 회차·과목·개념·유형을 참조함 |
| V4 | 회차 id, 문항 id, taxonomy slug가 중복됨 |
| V5 | 문항이 자기 `subject`가 아닌 과목 소속 개념을 태그함 |
| V6 | 문항 과목의 `tracks`에 문항 회차의 `track`이 없음 |
| V7 | id 일관성 위반: 회차 `id` ≠ `<year>-<session>-<track>`, 문항 `id` ≠ `<round>-q<number>`, 파일명 ≠ `<round-id>.json`, 또는 파일 안 문항의 `round`가 파일명과 다름 |
| V8 | `replaced_by`가 존재하지 않는 개념, 폐기된 개념, 또는 다른 과목의 개념을 가리킴 (연쇄·순환·과목 이동 금지) |
| V9 | 기준 taxonomy에 있던 slug가 변경 후 taxonomy에서 사라짐 (폐기 처리는 허용, 삭제·이름 변경은 실패). 기준 taxonomy가 주어지지 않으면(로컬 실행, `main` push) V9는 건너뛰고 그 사실을 알리는 안내 한 줄을 출력하며, 종료 코드에 영향을 주지 않는다 |
| W1 | 문항이 폐기 개념을 참조함 → `replaced_by` slug를 알려 주는 경고, 실패 아님 |

## §D 요구사항 (GEARS)

세부 규칙은 §C에 두고 요구사항은 그것을 참조한다.

### §D.1 데이터와 분류 체계

- **REQ-TREND-001** The dataset shall store rounds, taxonomy, question types, and question metadata as JSON files in the repository, each validated by a JSON Schema checked into the repository, with records carrying exactly the fields, id formats, and length limits defined in §C.1–§C.4.
- **REQ-TREND-002** The taxonomy shall be a fixed three-level hierarchy (subject → topic → concept) whose slugs are unique across all levels, and shall represent a retired concept by keeping its node with `deprecated: true` and a same-subject `replaced_by` slug rather than deleting it.
- **REQ-TREND-003** The dataset shall not carry question text, answer choices, or answer explanations in any dedicated field, and its schemas shall reject any field not defined in §C at every nesting level.

### §D.2 데이터 검증

- **REQ-TREND-004** **When** a data file violates any rule V1–V8 in §C.6, or V9 while a baseline taxonomy is supplied, the validation script shall print the file path, record id, rule code, and cause for every violation and exit with a non-zero status; **when** only W1 applies, it shall print the warning and exit with status 0; **when** no baseline taxonomy is supplied, it shall skip V9 and print a notice that V9 was skipped. The validation script shall accept the path of the data root to validate and shall load its schemas from its own checkout, so that one checkout's validator can validate another checkout's `data/`.

### §D.3 집계 코어

- **REQ-TREND-005** The aggregation core shall be pure functions with no network or DOM access that apply the filters of §C.5 R2–R3 before counting, return identical output for identical input, and **when** the filter matches no questions, return empty counts rather than throw.
- **REQ-TREND-006** The aggregation core shall compute, per §C.5 R1 and R4–R6, per-concept question count and distinct-round count, a concept × round matrix of question counts (zero for absent pairs), and per-round question-type counts.

### §D.4 분석 화면

- **REQ-TREND-007** The ranking view shall list the concept rows of §C.5 R4 ordered by question count descending, then distinct-round count descending, then slug ascending, and **when** the user selects a sort column (question count, distinct rounds, concept name), it shall reorder by that column.
- **REQ-TREND-008** **When** the user changes the track, subject, period, or confidence filter, every analysis view shall recompute and re-render without a page reload.
- **REQ-TREND-009** The heatmap view shall render the concept rows of §C.5 R4 against the filtered rounds in §C.5 R1 order, coloring each cell by the intensity level of §C.5 R7.
- **REQ-TREND-010** **When** the user hovers or keyboard-focuses a heatmap cell, the heatmap view shall show a tooltip with concept name, round id, and count, and every cell shall carry an accessible label with the same three values so that the count is not conveyed by color alone.
- **REQ-TREND-011** The round trend view shall show the question-type distribution for each round in the filter, and **while** the filter includes both tracks, it shall visually separate written and practical rounds.
- **REQ-TREND-012** Every analysis view shall show the disclaimer element `data-testid="data-disclaimer"` with the exact text "이 데이터는 수험생이 복원한 기출을 바탕으로 정리한 것으로, 공식 자료가 아닙니다.", and the site shall provide a sources page listing every distinct `sources.label` in the dataset; the subject filter and the sources page shall both show the exact text "실기 과목은 분석용 분류입니다."

### §D.5 빌드·CI·라이선스

- **REQ-TREND-013** The build shall produce static output under the base path `/Information-Processing-GISA/`, bundle the dataset into the build output rather than fetch it at runtime, and use hash-based routing so that every page loads from GitHub Pages without a server.
- **REQ-TREND-014** **When** a commit is pushed to `main`, the CI workflow shall run validation, tests, and build and deploy to GitHub Pages only if all succeed; **when** any pull request targets `main`, the CI workflow shall run validation, supplying the base-branch taxonomy as the V9 baseline, and tests, without deploying.
- **REQ-TREND-015** The test suite shall reach at least 85% line coverage over the aggregation core and the validation logic.
- **REQ-TREND-016** The repository shall carry an MIT License file `LICENSE` at its root covering the source code, naming DevMinGeonPark as the copyright holder.

## §E 비기능 제약

- 런타임 의존성은 최소화한다. 서버, DB, 인증, 외부 API 호출 없음
- 개발 방식은 TDD (`.moai/config/sections/quality.yaml` `development_mode: tdd`)
- 모든 화면은 키보드로 조작 가능해야 하고 색상만으로 정보를 전달하지 않는다
- 데이터는 사람이 리뷰할 수 있도록 회차 단위 파일로 나눈다
- 스키마는 별도 필드로 들어오는 원문만 막는다. `note`·`sources.label`에 붙여 넣은 원문 조각은 길이 제한으로 줄일 뿐 완전히 막지 못하므로 리뷰가 최종 확인한다
- 데이터 파일(`data/`)의 라이선스는 CC BY 4.0으로 확정되었고, 그 고지 파일(`LICENSE-DATA`)은 SPEC-TREND-002의 산출물이다

## §F 기술 스택 권고 (근거 포함)

| 영역 | 권고 | 근거 |
|------|------|------|
| 빌드 | Vite (`base: "/Information-Processing-GISA/"`), JSON import로 데이터 번들 | 정적 산출물, 설정 최소, 프로젝트 Pages 하위 경로 지원. 데이터 번들로 런타임 요청 없음 |
| 라우팅 | 해시 라우팅 (`#/ranking`, `#/sources` 등) | GitHub Pages는 서버 측 리라이트가 없어 일반 경로 딥링크가 404가 됨. 404.html 우회보다 단순 |
| UI | React + TypeScript | 필터 상태에 따른 재렌더가 화면 3개에 공통. TS로 데이터 계약을 타입으로 고정 |
| 차트 | 히트맵은 CSS grid 직접 렌더, 분포는 단순 막대(SVG/CSS) | 차트 라이브러리 없이 충분 |
| 검증 | JSON Schema + Ajv | 스키마가 곧 문서. SPEC-TREND-002의 브라우저 스니펫 도우미도 같은 스키마·검증기를 재사용 |
| 테스트 | Vitest (+ coverage-v8) | Vite와 설정 공유 |
| 배포 | GitHub Actions + `actions/deploy-pages` | 공식 경로, 별도 토큰 불필요 |

시행일, 출제 형식(paper/cbt), 개념 동의어, 난이도 필드는 v1 화면에서 쓰지 않으므로 넣지 않는다. 필요한 화면이 생기면 그 SPEC에서 스키마에 추가한다.

## §G 제외 범위 (Out of Scope)

### Out of Scope — 학습 기능

- 문제 풀이·퀴즈·오답 노트 UI
- 사용자 계정, 로그인, 학습 진도 저장

### Out of Scope — 문항 원문

- 문항 원문·보기·해설 저장과 표시 (저작권 검토가 끝난 뒤 별도 SPEC에서 다룸)

### Out of Scope — 커뮤니티 기여 흐름 (SPEC-TREND-002로 이관)

- `CONTRIBUTING.md`, 이슈·PR 템플릿, `LICENSE-DATA`
- base 브랜치 검증기를 쓰는 기여 관문 강화와 관련 보안 제약
- 사이트의 "데이터 기여하기" 진입점과 스니펫 도우미

### Out of Scope — 자동 수집과 전체 큐레이션

- 블로그·커뮤니티 자동 크롤링 파이프라인
- 2020년 이후 전체 회차 큐레이션 완료 자체 (데이터 트랙에서 계속 진행하며 이 SPEC의 완료 조건이 아님)

### Out of Scope — 서버와 운영

- 백엔드 서버, 데이터베이스, 검색 API, 데이터 제출 API
- 방문자 분석, 광고, 다국어 UI

## §H 참조

- 실행 계획: `plan.md`
- 인수 기준: `acceptance.md`
- 진행 기록: `progress.md`
- 후속 SPEC: `.moai/specs/SPEC-TREND-002/` (커뮤니티 기여)
- 필기 CBT 전환 시점(2022년 3회): https://ko.wikipedia.org/wiki/정보처리기사
