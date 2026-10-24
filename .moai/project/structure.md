# 프로젝트 구조

아직 코드가 없는 신규 프로젝트다. 아래는 SPEC-TREND-001·002의 plan.md §G에 정의한 계획 구조이며, run-phase에서 실제로 만들어진다.

## 계획 디렉터리 구조

```
LICENSE                     # 코드 라이선스 MIT (SPEC-TREND-001)
LICENSE-DATA                # data/ 라이선스 CC BY 4.0 (SPEC-TREND-002)
CONTRIBUTING.md             # 한국어 기여 가이드 (SPEC-TREND-002)
data/
  schema/                   # rounds·taxonomy·question-type·question JSON Schema. CI와 브라우저가 함께 쓰는 유일한 원본
  taxonomy.json             # 과목 → 주제 → 개념 3단계 분류
  question-types.json       # 유형 6종
  rounds.json               # 회차 목록
  questions/                # 회차별 문항 메타데이터 <round-id>.json (예: 2024-1-practical.json)
scripts/
  validate.ts               # 데이터 검증 V1~V9, W1. 데이터 루트·기준 taxonomy 경로를 인자로 받음
src/
  core/                     # 순수 집계 함수 (회차 정렬, 필터, 개념 행, 빈도, 랭킹, 행렬, 유형 분포, 강도)
  views/                    # Ranking, Heatmap, RoundTrend, Sources, Contribute(스니펫 도우미)
  App.tsx                   # 해시 라우터
tests/
  fixtures/                 # 집계 fixture, 규칙별 검증 오류 fixture
    contribution/           # 잘못된 기여 fixture (기여 관문 테스트)
.github/
  workflows/ci.yml          # PR: 검증·테스트 / main push: 검증·테스트·빌드·배포
  ISSUE_TEMPLATE/data-submission.yml
  pull_request_template.md
```

## 모듈 경계

- `data/`: 공개 데이터 계약. 기여 PR은 이 디렉터리만 바꾼다
- `data/schema/`: 스키마 사본을 만들지 않는다. 검증 스크립트와 브라우저 스니펫 도우미가 같은 파일을 import한다
- `src/core/`: React·DOM·네트워크에 의존하지 않는 순수 함수. 테스트·커버리지 대상
- `src/views/`: 화면 렌더링만 담당하고 집계는 `src/core/`에 맡긴다
- `scripts/`, `data/schema/`를 바꾸는 PR은 기여 관문 통과와 별개로 저장소 소유자 리뷰가 필요하다

## SPEC 기반 작업 흐름

모든 변경은 `.moai/specs/SPEC-*/` 문서를 기준으로 plan → run → sync 순서로 진행한다.

| 단계 | 산출물 |
|------|--------|
| plan | `spec.md`(요구사항), `plan.md`(마일스톤·파일 구조), `acceptance.md`(인수 기준) |
| run | TDD로 구현한 코드와 테스트, `progress.md` 실행 기록 |
| sync | 문서 동기화, CHANGELOG, SPEC 상태를 `completed`로 전환 |

데이터 계약(필드, id 형식, 집계 규칙 R1~R7, 검증 규칙 V1~V9)의 기준 문서는 `SPEC-TREND-001` spec.md §C다.
