# Changelog

이 프로젝트의 주요 변경 사항을 기록합니다. 형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를 따르고, 버전은 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [Unreleased]

## [0.1.0] - 2026-10-25

첫 공개 버전입니다(SPEC-TREND-001, 인수 기준 16개).

### Added

- 데이터 계약: 회차·분류(taxonomy)·문항 유형·문항 메타데이터 JSON Schema(`data/schema/`)와 시드 데이터 3개 회차(`data/questions/`)
- 데이터 검증기(`scripts/validate.ts`, `scripts/validate-lib.ts`): 규칙 V1~V9와 경고 W1, 원문 저장 차단, `--baseline`으로 기존 분류 삭제 감지
- 순수 집계 모듈(`src/core/aggregate.ts`): 회차 정렬, 필터, 개념 빈도, 랭킹, 개념×회차 행렬, 유형 분포, 출제 강도 단계
- 분석 화면(`src/views/`): 개념 빈도 랭킹, 잔디 히트맵, 회차별 추이, 출처 목록, 해시 라우팅과 필터 유지
- GitHub Actions(`.github/workflows/ci.yml`): Pull Request에서 검증·테스트, `main` 푸시 시 빌드 후 GitHub Pages 배포
- 코드 MIT 라이선스(`LICENSE`)
