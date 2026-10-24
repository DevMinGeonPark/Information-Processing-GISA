# 기술 스택

서버와 DB 없이 GitHub Pages에서 동작하는 정적 사이트다. 데이터셋은 빌드 시 번들에 포함하고, 모든 집계는 브라우저에서 순수 함수로 계산한다. 아래 스택은 SPEC-TREND-001 spec.md §F의 권고이며, 정확한 버전은 run-phase에서 `package.json`에 고정한다.

## 스택과 선택 근거

| 영역 | 선택 | 근거 |
|------|------|------|
| 언어·UI | TypeScript + React | 필터 상태에 따른 재렌더가 세 화면에 공통이다. 데이터 계약을 타입으로 고정한다 |
| 빌드 | Vite (`base: "/Information-Processing-GISA/"`) | 정적 산출물, 최소 설정, 프로젝트 Pages 하위 경로 지원. JSON import로 데이터를 번들에 넣어 런타임 요청이 없다 |
| 라우팅 | 해시 라우팅 (`#/ranking`, `#/sources`, `#/contribute`) | GitHub Pages는 서버 측 리라이트가 없어 일반 경로 딥링크가 404가 된다. 404.html 우회보다 단순하다 |
| 차트 | CSS grid 히트맵, SVG/CSS 막대 | 차트 라이브러리 없이 충분하다 |
| 데이터 검증 | JSON Schema (Draft 2020-12) + Ajv | 스키마가 곧 문서다. CI 검증기와 브라우저 스니펫 도우미가 같은 `data/schema/`를 쓴다 |
| 테스트 | Vitest + coverage-v8 | Vite와 설정을 공유한다 |
| CI·배포 | GitHub Actions + `actions/deploy-pages` | 공식 경로이며 별도 토큰이 필요 없다 |

런타임 의존성은 최소로 유지한다. 위 권고 외의 의존성은 run-phase에서 근거를 남기고 추가한다.

## 품질 기준

- 개발 방식: TDD (`.moai/config/sections/quality.yaml` `development_mode: tdd`). 규칙별 오류 fixture를 먼저 만들고 구현한다
- 커버리지: 집계 코어(`src/core/`)와 검증 로직 라인 커버리지 85% 이상
- 데이터 검증: `npm run validate`가 V1~V9 위반 시 0이 아닌 종료 코드로 실패하고, W1은 경고만 낸다. 위반마다 파일 경로·레코드 id·규칙 코드·원인을 한 줄로 출력한다
- 린트·포맷: run-phase에서 TypeScript 기본 도구 체인으로 정한다
- 접근성: 모든 화면은 키보드로 조작할 수 있고, 히트맵 셀은 색상 외에 접근성 라벨로 값을 전달한다

## 배포 파이프라인

| 이벤트 | 실행 단계 |
|--------|-----------|
| `main` 대상 모든 PR | base 브랜치의 검증기·스키마로 PR의 `data/` 검증(V9 기준 taxonomy는 base 브랜치 것) → 테스트. 배포 없음, 경로 필터 없음 |
| `main` push | 검증 → 테스트 → 빌드 → GitHub Pages 배포. 앞 단계가 모두 성공해야 배포한다 |

보안 제약:

- `pull_request_target` 이벤트를 쓰지 않는다
- `pull_request`에서 도는 job은 `contents: read` 권한만 가진다. Pages 배포 권한은 `main` push 전용 배포 job에만 준다
- 기여 관문이 병합을 막으려면 `main` 브랜치 보호에서 관문 job을 필수 상태 체크로 지정해야 한다

## 라이선스

| 대상 | 라이선스 | 파일 | 담당 SPEC |
|------|----------|------|-----------|
| 소스 코드 | MIT (저작권자 DevMinGeonPark) | `LICENSE` | SPEC-TREND-001 |
| `data/` 데이터 | CC BY 4.0 (DevMinGeonPark 및 기여자) | `LICENSE-DATA` | SPEC-TREND-002 |
