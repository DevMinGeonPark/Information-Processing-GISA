# SPEC-TREND-002 인수 기준

명령어 이름은 SPEC-TREND-001 acceptance.md의 권고값을 따른다. 인수 기준은 8개이며, 하위 번호 없이 하나씩 센다.

## §D 인수 기준 매트릭스

### 문서와 라이선스

- **AC-TREND2-001** (REQ-TREND2-001)
  Given 저장소 루트가 있을 때
  When `CONTRIBUTING.md`의 `##` 제목 목록과 `## 라이선스` 섹션 본문을 확인하면
  Then spec.md §C에 나열한 9개 제목이 같은 순서로 모두 있고, `## 라이선스` 섹션에 `CC BY 4.0`과 `MIT`가 모두 들어 있다.

- **AC-TREND2-002** (REQ-TREND2-002)
  Given 저장소 루트가 있을 때
  When `LICENSE-DATA` 파일을 확인하면
  Then 파일이 존재하고 `Creative Commons Attribution 4.0 International`, `data/`, `DevMinGeonPark`가 모두 들어 있다.

- **AC-TREND2-003** (REQ-TREND2-003)
  Given `.github/` 디렉터리가 있을 때
  When 데이터 제출용 이슈 템플릿(`.github/ISSUE_TEMPLATE/` 아래)과 `.github/pull_request_template.md`를 확인하면
  Then 두 파일 모두 회차·트랙·과목·개념 태그·유형·신뢰도·출처 항목과, "문항 원문 미포함" 체크 항목, "CC BY 4.0으로 제공하는 데 동의" 체크 항목을 포함한다.

### 기여 관문

- **AC-TREND2-004** (REQ-TREND2-004)
  Given 잘못된 기여 fixture `tests/fixtures/contribution/questions/2099-1-practical.json`(파일명 규칙 V7은 지키고, 문항 `2099-1-practical-q1`의 `sources`가 빈 배열이며 개념 `no-such-concept`을 참조)이 있을 때
  When CI의 기여 관문 단계와 같은 명령으로 그 fixture를 검증하면
  Then 종료 코드가 0이 아니고 출력에 `2099-1-practical-q1`과 `V2`가 담긴 줄, `2099-1-practical-q1`과 `V3`·`no-such-concept`가 담긴 줄이 모두 있다.

- **AC-TREND2-005** (REQ-TREND2-004, 005)
  Given `.github/workflows/` 아래 PR 워크플로가 있을 때
  When 워크플로 정의를 확인하면
  Then 트리거는 `pull_request`이고 `pull_request_target`은 없으며 `paths`·`paths-ignore` 필터가 없고, `pull_request`에서 실행되는 모든 job의 `permissions`가 `contents: read`만 허용하고(배포 job은 `push`와 `main` 조건이 걸린 경우에만 Pages 배포 권한을 가질 수 있음), 데이터 검증 단계는 base ref를 체크아웃한 디렉터리 안의 검증 스크립트와 `data/schema/`를 사용해 PR 작업 트리의 `data/`를 검증하고 base 브랜치 taxonomy를 기준 taxonomy로 넘긴다.

### 사이트 진입점과 도우미

- **AC-TREND2-006** (REQ-TREND2-006)
  Given 렌더된 사이트가 있을 때
  When 랭킹·히트맵·경향·출처·스니펫 도우미 페이지를 각각 조회하면
  Then 모든 페이지에 "데이터 기여하기" 링크가 있고 `https://github.com/DevMinGeonPark/Information-Processing-GISA/blob/main/CONTRIBUTING.md`를 가리킨다.

- **AC-TREND2-007** (REQ-TREND2-007)
  Given 스니펫 도우미 화면이 렌더된 상태에서
  When 유효한 값을 입력하고, 이어서 출처를 비우면
  Then 유효한 입력에서는 문항 스키마 검증을 통과하는 JSON이 표시되고 복사 버튼이 활성화되며, 출처를 비우면 오류가 표시되고 복사 버튼이 비활성화된다. 과목 목록에는 선택한 회차의 트랙을 `tracks`에 포함한 과목만 나타나고, 개념 목록에는 선택한 과목의 폐기되지 않은 개념만 나타난다 (컴포넌트 테스트).

- **AC-TREND2-008** (REQ-TREND2-008)
  Given 스니펫 도우미 컴포넌트 테스트에서 `fetch`·`XMLHttpRequest`·`navigator.sendBeacon`을 감시하는 상태일 때
  When 고유한 표식 문자열을 출처 이름에 넣고 폼을 채운 뒤 JSON을 생성·복사하면
  Then 감시한 호출 가운데 URL이나 본문에 그 표식 문자열을 담은 호출이 0건이다.

## §D.1 경계 조건

- 데이터와 코드를 함께 바꾼 PR: 기여 관문(base 검증기)과 SPEC-TREND-001의 테스트 job이 모두 실행됨
- `scripts/` 또는 `data/schema/`를 바꾼 PR: 관문 결과와 무관하게 소유자 리뷰 대상 (spec.md §E)
- 새 개념이 필요한 기여: taxonomy 변경을 함께 담은 PR로 받으며, V9로 기존 slug 삭제는 막힘
- 스니펫 도우미에서 taxonomy에 없는 개념, 다른 과목의 개념, 회차 트랙에 맞지 않는 과목: 선택 목록에 나타나지 않음

## §D.2 품질 게이트

- SPEC-TREND-001의 품질 게이트를 그대로 따른다 (검증·테스트·빌드 CI 통과, 타입·린트 오류 0)

## §D.3 완료 정의 (Definition of Done)

- AC-TREND2-001 ~ AC-TREND2-008 전부의 통과 증거가 `progress.md` §E.2에 기록됨
- 배포된 사이트에서 기여 진입점과 스니펫 도우미가 동작
- `main` 브랜치 보호에 기여 관문 job이 필수 상태 체크로 지정되었음을 저장소 설정 화면 또는 `gh api` 출력으로 확인
