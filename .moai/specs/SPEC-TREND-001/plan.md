# SPEC-TREND-001 실행 계획

## §A 맥락

빈 저장소에서 시작하는 신규 프로젝트다. 데이터 계약(스키마·taxonomy·집계 규칙·검증 규칙, spec.md §C)이 나머지 모든 것의 기반이고, 후속 SPEC-TREND-002(커뮤니티 기여)가 그대로 재사용하는 공개 계약이기도 하다. 그래서 바뀔 가능성이 큰 결정을 먼저 확정하고 기계적인 작업(CI, 배포)은 뒤로 미룬다. 마일스톤 순서는 우선순위 기준이며 기간 추정은 하지 않는다.

개발과 데이터 큐레이션은 두 갈래로 나눈다. 개발 트랙(M1~M5)은 시드 2~3개 회차만으로 끝까지 진행하고, 2020년 이후 전체 회차를 채우는 일은 데이터 트랙(§F 끝)에서 병행한다. 개발은 전체 큐레이션을 기다리지 않는다.

## §B 확정 사항

사용자 확정 (2026-10-25):

- 시드 데이터 범위: 목표는 2020년 개정 이후 모든 회차(필기·실기). 개발은 시드 2~3개 회차로 진행하고 나머지는 데이터 트랙에서 채운다
- 실기 분류: 실기 전용 3개 영역(프로그래밍 / DB·SQL / 이론)을 유지하고, 사이트에 "분석용 분류"로 표시한다 (spec.md §C.2)
- 배포 URL: 프로젝트 Pages `https://DevMinGeonPark.github.io/Information-Processing-GISA/`, Vite `base: "/Information-Processing-GISA/"`, 공개 저장소
- 라이선스: 코드는 MIT(루트 `LICENSE`, 이 SPEC의 산출물), 데이터는 CC BY 4.0(`LICENSE-DATA`, SPEC-TREND-002의 산출물)
- PR 리뷰: v1은 저장소 소유자 1인 리뷰, CODEOWNERS 없음
- 범위 분리: 커뮤니티 기여 흐름은 SPEC-TREND-002로 분리 (plan-audit N1)

## §C 사전 점검 (run-phase 진입 전)

- Node.js LTS 설치 확인 (`node --version`)
- 공개 저장소 `Information-Processing-GISA` 생성, GitHub 원격 연결, Pages 소스를 "GitHub Actions"로 설정할 권한 확인
- 가정: 저장소 소유자 계정은 `DevMinGeonPark`(설정된 git 사용자). Implementation Kickoff에서 최종 확인하고, 다르면 URL·저작권자 문자열만 바꾼다

## §D 제약

- 문항 원문 필드 금지와 중첩 객체까지 추가 필드 차단 (REQ-TREND-003). `note` 200자, `sources.label` 100자 상한
- 집계 코어는 React·DOM에 의존하지 않는 별도 모듈로 둔다 (테스트와 커버리지 대상 분리)
- 스키마는 `data/schema/` 한 곳에만 두고 사본을 만들지 않는다 (SPEC-TREND-002의 브라우저 검증도 같은 파일을 import)
- 데이터셋은 빌드 시 번들에 포함하고 런타임 요청을 하지 않는다 (REQ-TREND-013)
- 라우팅은 해시 방식만 쓴다 (REQ-TREND-013)
- 새 런타임 의존성은 spec.md §F 권고 외에는 run-phase에서 근거를 남기고 추가

## §E 자기 검증 항목

- `npm run validate` 종료 코드 0 (시드 데이터), V1~V9 오류 fixture에서는 0이 아님, 기준 taxonomy 없이 V9 건너뜀 안내
- `npm test -- --coverage` 통과, 집계·검증 모듈 라인 커버리지 85% 이상
- `npm run build` 후 자산 URL이 `/Information-Processing-GISA/`로 시작, 데이터가 번들에 포함
- CI 워크플로가 모든 PR에서 검증(기준 taxonomy 포함)·테스트만 하고, `main` push에서만 배포
- 루트 `LICENSE`(MIT) 존재

## §F 마일스톤

### 개발 트랙

#### M1 — 데이터 계약과 시드 (Priority High, 가장 바뀌기 쉬운 결정)

- 회차·taxonomy·유형·문항 JSON Schema 작성 (spec.md §C.1~§C.4). id 정규식, 길이 상한, 중첩 `additionalProperties: false` 포함. 각 필드에 `description`을 단다 (SPEC-TREND-002의 기여 가이드가 이를 인용)
- taxonomy 시드: 8개 과목 + 과목별 주요 주제·개념 초안
- 유형 6종 정의 파일
- 시드 회차 2~3개(필기 1, 실기 1 이상) 메타데이터
- 루트 `LICENSE`(MIT, 저작권자 DevMinGeonPark)
- 이 마일스톤이 끝나면 스키마를 고정하고 데이터 트랙을 연다

#### M2 — 검증 스크립트 (Priority High, TDD)

- spec.md §C.6 V1~V9, W1 구현. 위반마다 `파일 경로 · 레코드 id · 규칙 코드 · 원인`을 한 줄로 출력
- V9는 기준 taxonomy 경로를 선택 인자로 받고, 없으면 건너뛰며 안내를 출력
- 검증할 데이터 루트 경로를 인자로 받고, 스키마는 스크립트 자신의 체크아웃 기준 경로에서 읽는다. SPEC-TREND-002의 base 검증기 관문이 이 인자에 기대므로 v1 첫 버전부터 포함한다
- 규칙별 오류 fixture를 먼저 만들고(RED) 검증 로직 구현(GREEN)

#### M3 — 집계 코어 (Priority High, TDD)

- spec.md §C.5 R1~R7: 회차 정렬 → 필터 → 개념 행 집합(0회 개념 포함, 폐기 개념 제외) → 폐기 개념 병합 → 개수 → 행렬 → 유형 분포 → 강도 단계
- 모두 순수 함수, 집계 fixture(acceptance.md 머리말)로 단위 테스트

#### M4 — UI 화면 (Priority Medium)

- 해시 라우팅, 공통 필터 바(트랙·과목·기간·신뢰도)
- 랭킹 표, 잔디 히트맵(CSS grid, hover·focus 툴팁, 접근성 라벨), 회차별 유형 분포
- 안내 문구 공통 컴포넌트(`data-testid="data-disclaimer"`), 출처 목록 페이지
- 공통 레이아웃에 SPEC-TREND-002의 기여 링크가 들어갈 자리만 남긴다 (링크 자체는 그 SPEC에서 추가)

#### M5 — CI와 GitHub Pages 배포 (Priority Medium, 기계적 작업)

- GitHub Actions: 모든 PR = validate(base 브랜치 taxonomy를 V9 기준으로 전달) + test, `main` push = validate + test + build + deploy (배포 job에 `if` 조건). `pull_request` 트리거에 경로 필터를 두지 않는다
- Vite `base: "/Information-Processing-GISA/"` 설정

### 데이터 트랙 (M1 이후 병행, 이 SPEC의 완료 조건 아님)

- 2020년 개정 이후 모든 회차(필기·실기)를 회차 파일 단위 PR로 추가한다
- SPEC-TREND-002가 끝나기 전에는 저장소 소유자의 큐레이션 PR만 받고, 그 뒤로는 커뮤니티 기여가 같은 PR 흐름을 탄다
- M2 이전에 올라온 데이터는 로컬에서 스키마만 확인하고, M5 이후에는 CI 검증을 통과해야 병합한다
- 진척은 회차 파일 수로 추적하며, 개발 트랙 마일스톤을 막지 않는다

## §G 제안 파일 구조

```
LICENSE                # 코드 MIT
data/
  schema/              # rounds / taxonomy / question-type / question JSON Schema (CI·브라우저 공용)
  taxonomy.json        # 과목 → 주제 → 개념
  question-types.json
  rounds.json
  questions/           # 회차별 파일 <round-id>.json (예: 2024-1-practical.json)
scripts/
  validate.ts          # 데이터 검증 (V1~V9, W1)
src/
  core/                # 순수 집계 함수 (order, filter, rows, frequency, ranking, matrix, distribution, intensity)
  views/               # Ranking, Heatmap, RoundTrend, Sources
  App.tsx              # 해시 라우터
tests/
  fixtures/            # 집계·규칙별 오류 fixture
.github/workflows/
  ci.yml
```

## §H 위험

| 위험 | 영향 | 대응 |
|------|------|------|
| 필기 CBT 전환(2022년 3회) 이후 공식 문항 비공개 | 필기 최근 회차는 복원 데이터에만 의존, 빈도가 실제보다 낮게 보일 수 있음 | `confidence` 필터, 안내 문구(REQ-TREND-012), 데이터 트랙에서 보강 |
| 복원 기출의 회차 간 문항 중복·오기 | 빈도 과대 집계 | 문항 id 중복 검증(V4), 출처 다중 기록, PR 리뷰 |
| 원문 조각이 `note`·`sources.label`에 들어감 | 저작권 문제 | 길이 상한(200자·100자), 리뷰 |
| taxonomy 변경(개념 분할·병합) | 과거 태그와 불일치 | slug 삭제를 V9로 차단, 폐기는 `deprecated` + 같은 과목 `replaced_by`(REQ-TREND-002), 대상 무결성(V8), 경고(W1), 집계 병합(R5) |
| 데이터 트랙 진행이 느림 | 공개 직후 데이터가 적음 | 시드 회차로 기능을 먼저 공개하고, SPEC-TREND-002의 기여 흐름으로 보강 |
| 회차 수 증가에 따른 히트맵 가로 길이 | 화면 가독성 저하 | 기간 필터로 범위 제한, 가로 스크롤 |

## §I 교차 참조

- 요구사항: `spec.md` §D, 규칙: `spec.md` §C.5·§C.6
- 인수 기준: `acceptance.md`
- 후속 SPEC: `.moai/specs/SPEC-TREND-002/`
