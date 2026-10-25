# Changelog

이 프로젝트의 주요 변경 사항을 기록합니다. 형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를 따르고, 버전은 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [Unreleased]

## [0.2.0] - 2026-10-26

커뮤니티 데이터 기여 흐름을 추가했습니다(SPEC-TREND-002, 인수 기준 8개).

### Added

- 기여 가이드(`CONTRIBUTING.md`): 포크부터 PR까지의 절차, 필드 설명, 개념 태깅·유형 판별 규칙, 로컬 검증 방법
- 데이터 라이선스(`LICENSE-DATA`): `data/` 아래 데이터에 CC BY 4.0 적용
- 데이터 제보 이슈 양식(`.github/ISSUE_TEMPLATE/data-submission.yml`)과 PR 템플릿(`.github/pull_request_template.md`)
- 기여 관문(`.github/workflows/ci.yml`): PR의 `data/`를 PR 쪽 코드가 아니라 `main` 브랜치의 검증기와 스키마로 검사
- 기여 도우미 화면(`src/views/Contribute.tsx`, `#/contribute`)과 브라우저 안에서만 동작하는 JSON 조각 도우미(`src/core/snippet.ts`)

### Changed

- 검증기가 스키마 오류가 있는 문항 파일에도 참조 검사(V3~V7)를 계속 실행해, 한 레코드의 V2·V3 오류를 함께 보고합니다.

### Fixed

- 문항 출처 `sources.url`은 이제 `http://` 또는 `https://`로 시작해야 합니다. `javascript:` 같은 다른 스킴은 스키마에서 거부합니다.

## [0.1.0] - 2026-10-25

첫 공개 버전입니다(SPEC-TREND-001, 인수 기준 16개).

### Added

- 데이터 계약: 회차·분류(taxonomy)·문항 유형·문항 메타데이터 JSON Schema(`data/schema/`)와 시드 데이터 3개 회차(`data/questions/`)
- 데이터 검증기(`scripts/validate.ts`, `scripts/validate-lib.ts`): 규칙 V1~V9와 경고 W1, 원문 저장 차단, `--baseline`으로 기존 분류 삭제 감지
- 순수 집계 모듈(`src/core/aggregate.ts`): 회차 정렬, 필터, 개념 빈도, 랭킹, 개념×회차 행렬, 유형 분포, 출제 강도 단계
- 분석 화면(`src/views/`): 개념 빈도 랭킹, 잔디 히트맵, 회차별 추이, 출처 목록, 해시 라우팅과 필터 유지
- GitHub Actions(`.github/workflows/ci.yml`): Pull Request에서 검증·테스트, `main` 푸시 시 빌드 후 GitHub Pages 배포
- 코드 MIT 라이선스(`LICENSE`)
