# SPEC-TREND-002 실행 계획

## §A 맥락

SPEC-TREND-001이 만든 데이터 계약과 검증기 위에 커뮤니티 기여 흐름을 얹는다. 이 SPEC은 다음 계약을 재정의하지 않고 참조만 한다.

- 데이터 형식·id·길이 상한: SPEC-TREND-001 spec.md §C.1~§C.4
- 집계 규칙 R1~R7: SPEC-TREND-001 spec.md §C.5 (스니펫 도우미는 집계를 하지 않지만 개념 목록 구성 시 폐기 개념 제외 규칙을 따름)
- 검증 규칙 V1~V9, W1: SPEC-TREND-001 spec.md §C.6
- 검증 스크립트 CLI(기준 taxonomy 인자): SPEC-TREND-001 REQ-TREND-004
- PR CI 기본 동작과 데이터 번들: SPEC-TREND-001 REQ-TREND-013·014

frontmatter의 `depends_on: [SPEC-TREND-001]`에 따라 SPEC-TREND-001이 `completed`가 된 뒤 run-phase를 시작한다. 마일스톤 순서는 우선순위 기준이며 기간 추정은 하지 않는다.

## §B 확정 사항

사용자 확정 (2026-10-25):

- 기여 모델: GitHub PR 기반, 서버 없음
- 라이선스: 데이터 CC BY 4.0(`LICENSE-DATA`, 이 SPEC 산출물), 코드 MIT(`LICENSE`, SPEC-TREND-001 산출물)
- PR 리뷰: 저장소 소유자 1인, CODEOWNERS 없음. CI 기여 관문이 첫 관문
- 기여 링크 대상: `https://github.com/DevMinGeonPark/Information-Processing-GISA/blob/main/CONTRIBUTING.md`

## §C 사전 점검 (run-phase 진입 전)

- SPEC-TREND-001 `status: completed` 확인 (`depends_on`)
- `main` 브랜치 보호 규칙에서 기여 관문 job을 필수 상태 체크로 지정할 권한 확인. 이 설정이 없으면 관문은 실패를 표시만 하고 병합은 막지 못함
- 가정: 저장소 소유자 계정은 `DevMinGeonPark`. Implementation Kickoff에서 최종 확인하고, 다르면 링크·저작권자 문자열만 바꾼다

## §D 제약

- 스키마·검증기를 복사하지 않는다. 브라우저 도우미는 `data/schema/`를 import하고, CI 관문은 base ref 체크아웃본을 쓴다
- PR 워크플로는 `pull_request` 이벤트와 `contents: read` 권한만 쓴다 (REQ-TREND2-005)
- 도우미는 폼 입력을 네트워크로 보내지 않는다 (REQ-TREND2-008)

## §E 자기 검증 항목

- `CONTRIBUTING.md` 9개 제목 순서, `LICENSE-DATA` 문구, 두 템플릿 항목 확인
- 잘못된 기여 fixture에서 관문 명령이 0이 아닌 종료 코드와 V2·V3 줄을 출력
- 워크플로 정의: `pull_request` 전용, 경로 필터 없음, `contents: read`, base 검증기 사용
- 도우미 컴포넌트 테스트 통과, 표식 문자열을 담은 네트워크 호출 0건

## §F 마일스톤

### M1 — 기여 문서와 라이선스 (Priority High, 외부 사용자와의 공개 계약)

- `CONTRIBUTING.md`(한국어, spec.md §C의 9개 제목). 필드 설명은 SPEC-TREND-001 스키마의 `description`을 인용하고, 태깅·유형 판별 규칙은 예시와 함께 적는다. `## 기여하기 전에`에 "데이터 PR은 `data/`만 바꾼다"를 명시
- `LICENSE-DATA`(CC BY 4.0)
- `.github/ISSUE_TEMPLATE/data-submission.yml`, `.github/pull_request_template.md`

### M2 — 기여 관문 강화 (Priority High, 보안 경계)

- SPEC-TREND-001의 PR 워크플로에서 데이터 검증 단계를 base 검증기 방식으로 바꾼다: base ref를 별도 디렉터리로 체크아웃하고 그 안에서 의존성을 설치한 뒤, 그 검증 스크립트에 PR 작업 트리의 `data/` 경로를 데이터 루트 인자로 넘긴다(SPEC-TREND-001 REQ-TREND-004). 스키마는 base 체크아웃의 것이 쓰이고, 기준 taxonomy도 base ref에서 가져온다
- `pull_request` 이벤트 유지, `pull_request`에서 도는 job은 `permissions: contents: read`. push 전용 배포 job만 Pages 배포 권한을 가진다
- 잘못된 기여 fixture로 관문 명령을 테스트(RED → GREEN)

### M3 — 사이트 진입점과 스니펫 도우미 (Priority Medium, TDD)

- SPEC-TREND-001이 남겨 둔 공통 레이아웃 자리에 "데이터 기여하기" 링크 추가
- 스니펫 도우미 화면(`#/contribute`): 회차 선택, 회차 트랙에 맞는 과목만 선택, 그 과목의 개념만 선택, 유형·신뢰도·출처 입력, 브라우저 스키마 검증, 복사 버튼
- 네트워크 감시 컴포넌트 테스트

### M4 — 운영 설정 (Priority Low, 저장소 소유자 수행)

- `main` 브랜치 보호의 필수 상태 체크로 기여 관문 job 지정
- 설정 결과를 `gh api repos/DevMinGeonPark/Information-Processing-GISA/branches/main/protection` 출력으로 기록

## §G 제안 파일 구조

```
CONTRIBUTING.md
LICENSE-DATA
.github/
  ISSUE_TEMPLATE/data-submission.yml
  pull_request_template.md
  workflows/ci.yml       # SPEC-TREND-001 워크플로의 PR 데이터 검증 단계 수정
src/views/
  Contribute.tsx         # 스니펫 도우미
tests/fixtures/contribution/
  questions/2099-1-practical.json
```

## §H 위험

| 위험 | 영향 | 대응 |
|------|------|------|
| PR이 검증기·스키마를 고쳐 관문 통과 | 잘못된 데이터 병합 | base 검증기 사용(REQ-TREND2-004), `scripts/`·`data/schema/` 변경 PR은 소유자 리뷰(spec.md §E) |
| 정당한 스키마 변경 PR이 base 검증기에 막힘 | 소유자 작업 지연 | 스키마 변경은 소유자가 리뷰 후 직접 병합. 데이터 기여 PR과 분리 |
| `pull_request_target` 오용 | 포크 PR 코드가 쓰기 권한·비밀값으로 실행 | REQ-TREND2-005, AC-TREND2-005로 워크플로 정의 검사 |
| 기여 데이터의 품질 편차·잘못된 태깅 | 랭킹 왜곡 | 형식·참조·일관성은 관문이 막고, 태깅 적절성은 소유자 리뷰. 규칙을 예시와 함께 `CONTRIBUTING.md`에 명시 |
| 원문을 `note`·`sources.label`에 붙여 넣음 | 저작권 문제 | SPEC-TREND-001의 길이 상한, PR 템플릿 체크 항목, 리뷰 |
| 같은 회차를 여러 기여자가 동시에 수정 | PR 충돌 | 회차 단위 파일, 충돌 시 나중 PR이 리베이스 |
| 브랜치 보호 미설정 | 관문 실패에도 병합 가능 | §C 사전 점검, M4, DoD 확인 항목 |
| 기여량이 적음 | 데이터 공백 지속 | 이슈 템플릿으로 PR이 어려운 사용자도 제보 가능, 소유자가 이슈를 데이터 PR로 옮김 |

## §I 교차 참조

- 요구사항: `spec.md` §D
- 인수 기준: `acceptance.md`
- 선행 계약: `.moai/specs/SPEC-TREND-001/spec.md` §C.1~§C.6
