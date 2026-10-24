# SPEC-TREND-001 인수 기준

명령어 이름(`npm run validate` 등)은 run-phase에서 확정되는 스크립트 이름의 권고값이다. 이름이 달라지면 같은 의미의 명령으로 대체한다.

**집계 fixture**: 같은 과목의 폐기되지 않은 개념 A·B·C와 폐기 개념 D(`replaced_by: A`), 회차 4개(필기 2개, 실기 2개, 같은 `(year, session)`을 공유하는 필기·실기 쌍 1개 포함)로 구성한다. C는 출제 0회이고, 문항 하나는 D와 A를 함께 태그한다. 개념별 기대 문항 수·등장 회차 수·행렬 값은 fixture 파일에 함께 적어 둔다.

인수 기준은 16개이며, 하위 번호 없이 하나씩 센다.

## §D 인수 기준 매트릭스

### 데이터와 검증

- **AC-TREND-001** (REQ-TREND-001, 002)
  Given 저장소의 시드 데이터(회차·taxonomy·유형·문항 메타데이터)가 있을 때
  When `npm run validate`를 실행하면
  Then 종료 코드가 0이다.

- **AC-TREND-002** (REQ-TREND-002, 004)
  Given 규칙 V1~V8 각각을 하나씩만 위반하는 오류 fixture가 있고 — V1: 쉼표가 빠진 JSON, V2: 비회차 파일(taxonomy)의 필수 필드 누락, V3: 없는 회차·과목·개념·유형 참조 각 1건, V4: 문항 id 중복과 taxonomy slug 중복 각 1건, V5: 다른 과목 개념 태그, V6: 실기 회차 문항에 필기 전용 과목, V7: 회차 id·문항 id·파일명 불일치 각 1건, V8: 없는 개념·폐기 개념·다른 과목 개념을 가리키는 `replaced_by` 각 1건 — 그리고 W1만 해당하는 fixture가 있을 때
  When 각 fixture에 검증 스크립트를 실행하면
  Then V1~V8 fixture는 모두 종료 코드가 0이 아니고 출력에 해당 파일 경로·레코드 id(있는 경우)·규칙 코드가 담긴 줄이 있으며, W1 fixture는 종료 코드 0에 `replaced_by` slug를 담은 경고 줄이 출력된다.

- **AC-TREND-003** (REQ-TREND-003)
  Given 문항 스키마가 있을 때
  When 최상위에 `text`·`choices`·`answer` 필드를 가진 문항, `sources` 항목에 `quote` 필드를 가진 문항, 201자 `note`를 가진 문항을 각각 검증하면
  Then 세 경우 모두 V2로 실패한다. (이 기준은 추가 필드와 길이 초과만 검증한다. 허용 필드 안에 붙여 넣은 원문 조각은 리뷰로 확인한다.)

- **AC-TREND-004** (REQ-TREND-004)
  Given slug `s`를 가진 기준 taxonomy와, `s`를 삭제한 변경 taxonomy, `s`를 `deprecated: true`로 바꾼 변경 taxonomy가 있을 때
  When 기준 taxonomy를 지정해 두 변경 taxonomy를 각각 검증하고, 기준 taxonomy 없이 삭제한 변경 taxonomy를 검증하면
  Then 기준을 지정한 삭제 경우는 종료 코드가 0이 아니고 `V9`와 `s`가 담긴 줄이 출력되며, 기준을 지정한 폐기 경우는 종료 코드 0이고, 기준 없이 실행한 경우는 종료 코드 0에 V9를 건너뛰었다는 안내 줄이 출력된다. 또한 검증 스크립트가 있는 트리 밖의 임시 디렉터리에 같은 삭제 사례의 `data/`를 두고 데이터 루트 인자로 그 경로를 지정해 실행하면, 스크립트 트리의 스키마로 검증되어 같은 `V9` 줄과 0이 아닌 종료 코드가 나온다.

### 집계 코어

- **AC-TREND-005** (REQ-TREND-006)
  Given 집계 fixture가 있을 때
  When 개념 빈도와 회차별 유형 분포를 계산하면
  Then A·B·C의 문항 수·등장 회차 수가 fixture 기대값과 일치하고(D와 A를 함께 태그한 문항은 A에 1번만 계산), 결과에 D 행이 없으며, 각 회차의 유형별 개수 합이 그 회차 문항 수와 같다.

- **AC-TREND-006** (REQ-TREND-005)
  Given 집계 fixture가 있을 때
  When 트랙·과목·신뢰도 필터와 기간 필터(`(year, session)` 시작·끝, 끝값과 같은 회차 포함 여부, 시작이 끝보다 늦은 경우 포함)를 각각 적용하고, 아무 문항과도 맞지 않는 필터로 모든 집계 함수를 호출하면
  Then 필터에서 벗어난 문항은 집계에 없고, 기간 필터는 같은 `(year, session)`의 필기·실기 회차를 함께 포함하며, 맞는 문항이 없으면 예외 없이 빈 집계(모든 개수 0)를 돌려주고, 같은 입력으로 두 번 호출한 결과는 깊은 비교로 같다.

- **AC-TREND-007** (REQ-TREND-007)
  Given 문항 수가 같고 등장 회차 수가 다른 개념 쌍, 둘 다 같은 개념 쌍, 출제 0회 개념이 있을 때
  When 랭킹을 계산하면
  Then 순서가 문항 수 내림차순 → 등장 회차 수 내림차순 → slug 오름차순이고, 출제 0회 개념이 0 값으로 맨 아래에 포함된다.

- **AC-TREND-008** (REQ-TREND-006, 009)
  Given 집계 fixture와 강도 테스트용 값 목록이 있을 때
  When 개념 × 회차 행렬과 강도 단계를 계산하면
  Then 행렬은 A·B·C 3행 4열이고 열은 `(year, session, track)` 순서(같은 `(year, session)`이면 필기가 먼저)이며 출제가 없는 칸은 0이다. `max = 10`일 때 값 0·1·5·6·8·10은 각각 단계 0·1·2·3·4·4이고, 모든 값이 0인 행렬은 모든 셀이 단계 0이다.

### 분석 화면

- **AC-TREND-009** (REQ-TREND-009, 010)
  Given 집계 fixture로 히트맵 컴포넌트를 렌더할 때
  When 렌더 결과를 조회하고 셀에 마우스를 올리거나 키보드 포커스를 주면
  Then 셀이 12개이고 각 셀의 접근성 라벨에 개념명·회차 id·개수가 있으며, 두 경우 모두 같은 정보의 툴팁이 나타난다.

- **AC-TREND-010** (REQ-TREND-007, 008)
  Given 랭킹·히트맵·회차별 경향 화면이 각각 렌더된 상태에서
  When 트랙·과목·기간·신뢰도 필터를 하나씩 바꾸고, 랭킹 화면에서 정렬 열을 선택하면
  Then 세 화면 × 필터 4종 모든 조합에서 새로고침 없이 표시 값이 집계 코어 결과와 일치하게 바뀌고, 정렬 열 선택 시 행 순서가 그 열 기준으로 바뀐다 (컴포넌트 테스트).

- **AC-TREND-011** (REQ-TREND-011)
  Given 두 트랙이 모두 포함된 필터로 회차별 경향 화면을 렌더할 때
  When 결과를 조회하면
  Then 회차마다 유형 분포가 표시되고 필기·실기 회차가 별도 그룹으로 나뉜다.

- **AC-TREND-012** (REQ-TREND-012)
  Given 렌더된 사이트가 있을 때
  When 랭킹·히트맵·경향 화면과 출처 페이지를 조회하면
  Then 세 분석 화면 모두에 `data-testid="data-disclaimer"` 요소가 있고 그 텍스트가 "이 데이터는 수험생이 복원한 기출을 바탕으로 정리한 것으로, 공식 자료가 아닙니다."와 정확히 같으며, 출처 페이지에 데이터셋의 서로 다른 `sources.label` 전체가 한 번씩 나열되고, 과목 필터와 출처 페이지 모두에 "실기 과목은 분석용 분류입니다." 문구가 정확히 표시된다.

### 빌드·CI·라이선스

- **AC-TREND-013** (REQ-TREND-013)
  Given 의존성이 설치된 저장소에서
  When `npm run build`를 실행하고 `dist/`를 확인하면
  Then 종료 코드 0이고, `dist/index.html`의 `<script src>`·`<link href>` 로컬 자산 URL이 모두 `/Information-Processing-GISA/`로 시작하며, `dist/` 아래 별도 `data/` 디렉터리가 없고 시드 회차 id 문자열이 JS 번들 파일 안에 있으며, 앱의 출처 페이지 링크가 `#/sources` 형태의 해시 경로이다.

- **AC-TREND-014** (REQ-TREND-014)
  Given `.github/workflows/` 아래 CI 워크플로가 있을 때
  When 워크플로 정의를 확인하면
  Then 배포 job은 `if: github.event_name == 'push' && github.ref == 'refs/heads/main'` 조건을 갖고 validate·test·build job에 `needs`로 의존하며, `pull_request` 트리거에는 `paths`·`paths-ignore` 필터가 없고 validate·test job만 실행되며, PR의 validate 단계는 base 브랜치의 taxonomy 파일을 기준 taxonomy로 넘긴다.

- **AC-TREND-015** (REQ-TREND-015)
  Given 테스트 스위트가 있을 때
  When `npm test -- --coverage`를 실행하면
  Then 모든 테스트가 통과하고 `src/core/`와 검증 로직의 라인 커버리지가 85% 이상이다.

- **AC-TREND-016** (REQ-TREND-016)
  Given 저장소 루트가 있을 때
  When `LICENSE` 파일을 확인하면
  Then 파일이 존재하고 첫 줄이 `MIT License`이며 `Copyright (c)`와 `DevMinGeonPark`가 들어 있다.

## §D.1 경계 조건

- 문항이 0개인 회차: 히트맵 열은 존재하고 모든 셀이 0
- 개념이 여러 개 태그된 문항: 각 개념에 1씩 집계 (문항 수 합 ≠ 개념 빈도 합이 정상)
- 같은 연도·회에 필기와 실기가 모두 있음: 회차 id의 트랙으로 구분하고, 정렬은 필기가 먼저 (R1)
- 기간 필터의 시작이 끝보다 늦음: 빈 집계 (R2)
- 필터 결과 행렬이 모두 0: 히트맵 셀 전부 단계 0 (R7)
- 기준 taxonomy 없이 로컬 실행: V9 건너뜀 안내만 출력 (V9)

## §D.2 품질 게이트

- 데이터 검증, 단위·컴포넌트 테스트, 빌드가 모두 CI에서 통과
- 타입 체크 오류 0 (`tsc --noEmit`), 린트 오류 0
- 스키마는 정의되지 않은 필드와 길이 초과를 기계적으로 막는다 (AC-TREND-003). 허용 필드 안의 원문 조각 여부는 리뷰가 확인한다

## §D.3 완료 정의 (Definition of Done)

- AC-TREND-001 ~ AC-TREND-016 전부의 통과 증거가 `progress.md` §E.2에 기록됨
- `https://DevMinGeonPark.github.io/Information-Processing-GISA/`에서 세 분석 화면이 시드 데이터로 동작
- 2020년 이후 전체 회차 큐레이션과 커뮤니티 기여 흐름(SPEC-TREND-002)은 이 SPEC의 완료 조건이 아님
