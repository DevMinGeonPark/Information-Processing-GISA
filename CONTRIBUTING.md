# 기여 가이드

정보처리기사 기출 **메타데이터**(회차·과목·개념 태그·유형·출처)를 함께 채워 주셔서 고맙습니다. 이 문서는 GitHub Pull Request(PR)로 데이터를 추가하거나 고치는 방법을 설명합니다. PR이 어렵다면 [데이터 제보 이슈](https://github.com/DevMinGeonPark/Information-Processing-GISA/issues/new?template=data-submission.yml)로 알려 주셔도 됩니다. 저장소 소유자가 내용을 확인해 데이터 PR로 옮깁니다.

## 기여하기 전에

- **문항 원문은 넣지 않습니다.** 문제 지문, 보기, 정답, 해설은 저작권 문제가 있으므로 어떤 필드에도 옮겨 적지 않습니다. 이 저장소는 "어느 회차에 어떤 개념이 어떤 유형으로 나왔는가"만 기록합니다.
- **데이터 기여 PR은 `data/` 아래 파일만 바꿉니다.** 데이터와 코드를 한 PR에 섞지 말아 주세요.
- `scripts/`(검증 스크립트)나 `data/schema/`(JSON Schema)를 바꾸는 PR은 데이터 기여와 따로 올립니다. 이런 PR에서도 자동 검증(기여 관문)은 돌지만, 관문은 `main` 브랜치에 있는 검증기와 스키마로 판정하므로 바뀐 검증기·스키마 자체가 타당한지는 판단하지 못합니다. 그래서 관문을 통과해도 병합 조건을 채우지 못하며, **저장소 소유자 리뷰를 반드시 거칩니다.**
- 새 개념이 필요하면 `data/taxonomy.json`에 개념을 추가하는 변경을 같은 PR에 담습니다. 이미 `main`에 있는 slug는 지우거나 이름을 바꿀 수 없습니다(검증 규칙 V9). 더 쓰지 않을 개념은 `deprecated: true`와 `replaced_by`로 폐기 처리합니다.
- 리뷰는 저장소 소유자 1인이 맡습니다. 태깅이 적절한지는 사람이 보고 판단합니다.

## 1. 저장소 포크하기

1. GitHub에서 [DevMinGeonPark/Information-Processing-GISA](https://github.com/DevMinGeonPark/Information-Processing-GISA)의 **Fork** 버튼을 눌러 내 계정으로 복사합니다.
2. 포크한 저장소를 내려받고 작업 브랜치를 만듭니다.

   ```bash
   git clone https://github.com/<내 계정>/Information-Processing-GISA.git
   cd Information-Processing-GISA
   git switch -c data/2024-3-practical
   ```

3. Node.js 22.18 이상을 설치한 뒤 의존성을 설치합니다.

   ```bash
   npm ci
   ```

## 2. 데이터 파일 위치

| 파일 | 내용 |
|------|------|
| `data/rounds.json` | 회차 목록. 새 회차의 문항을 넣으려면 먼저 여기에 회차를 추가합니다 |
| `data/questions/<회차 id>.json` | 회차별 문항 메타데이터 배열. 파일 이름은 회차 id와 같아야 합니다 (예: `2024-1-practical.json`) |
| `data/taxonomy.json` | 과목 → 주제 → 개념 분류 체계. 개념 태그는 여기 있는 slug만 쓸 수 있습니다 |
| `data/question-types.json` | 문항 유형 목록 |
| `data/schema/` | 위 파일들의 JSON Schema. 데이터 기여 PR에서는 고치지 않습니다 |

회차 id는 `<연도>-<회>-<트랙>` 형식입니다. 트랙은 `written`(필기) 또는 `practical`(실기)입니다.

```json
{ "id": "2024-3-practical", "year": 2024, "session": 3, "track": "practical" }
```

## 3. 필드 설명

문항 하나는 `data/questions/<회차 id>.json` 배열의 원소 하나입니다. 아래 설명은 `data/schema/questions.schema.json`의 `description`을 옮긴 것입니다.

| 필드 | 필수 | 설명 |
|------|------|------|
| `id` | 예 | 문항 식별자. `<round>-q<number>`와 정확히 일치해야 한다 (예: `2024-1-practical-q3`). |
| `round` | 예 | 회차 id. 파일명과 같아야 한다. |
| `number` | 예 | 회차 안의 문항 번호 (1 이상). |
| `subject` | 예 | 과목 slug. 과목의 `tracks`에 회차 트랙이 들어 있어야 한다. |
| `concepts` | 예 | 이 문항이 다루는 개념 slug 목록 (1개 이상, 중복 없음, 문항 과목 소속). |
| `type` | 예 | 문항 유형 slug (`data/question-types.json`). |
| `confidence` | 예 | `official`(공식 공개 문항) 또는 `reconstructed`(수험생 복원). |
| `sources` | 예 | 출처 목록 (1개 이상). 각 항목은 `label`(출처 이름, 1~100자)과 선택 항목 `url`(`http://` 또는 `https://`로 시작하는 주소)만 가진다. |
| `note` | 아니오 | 메모 (선택, 최대 200자). 문항 원문을 넣지 않는다. |

전체 예시는 다음과 같습니다.

```json
{
  "id": "2024-1-practical-q3",
  "round": "2024-1-practical",
  "number": 3,
  "subject": "practical-programming",
  "concepts": ["p-java-oop"],
  "type": "code",
  "confidence": "reconstructed",
  "sources": [{ "label": "수험생 복원 기출 모음", "url": "https://example.com/2024-1" }],
  "note": "상속과 오버라이딩 출력 문제"
}
```

사이트의 **기여 도우미** 화면(`#/contribute`)에서 값을 고르면 이 형식의 JSON을 만들어 주고, 스키마에 맞는지도 바로 확인해 줍니다. 입력값은 브라우저 밖으로 전송되지 않습니다.

## 4. 개념 태깅과 유형 판별 규칙

### 개념 태깅

- 문항이 **실제로 묻는 개념**을 태그합니다. 지문에 잠깐 등장할 뿐 풀이에 필요 없는 개념은 넣지 않습니다.
- 개념은 문항 `subject`에 속한 것만 고를 수 있습니다(검증 규칙 V5). 예를 들어 실기 `practical-database` 문항에 필기 과목의 `normalization`을 붙일 수 없고, 같은 과목의 `p-normalization`을 씁니다.
- 한 문항이 두 개념을 함께 묻는다면 둘 다 태그합니다. 예: SQL 조인 결과를 묻는데 조건에 서브쿼리가 핵심이라면 `["p-sql-join", "p-sql-select"]`.
- 폐기된 개념(`deprecated: true`)은 새로 쓰지 않습니다. 쓰면 검증기가 `replaced_by` 개념을 알려 주는 경고(W1)를 냅니다.
- 알맞은 개념이 없으면 `data/taxonomy.json`에 개념을 추가하고, PR 설명에 추가 이유를 적습니다.

### 유형 판별

유형은 문항당 정확히 하나입니다. 문항이 **답을 내려면 무엇을 해야 하는가**로 고릅니다.

| slug | 표시명 | 판별 기준 | 예 |
|------|--------|-----------|----|
| `term` | 용어형 | 설명을 주고 용어·약어를 고르거나 쓰게 함 | "다음 설명에 해당하는 디자인 패턴을 쓰시오" |
| `concept` | 개념이해형 | 특징·장단점·비교·옳고 그름 판단 | "응집도가 높은 순서로 나열하시오" |
| `calculation` | 계산형 | 수치 계산 필요 (페이지 교체 횟수, 해밍 거리, 서브넷 등) | "LRU 방식의 페이지 부재 횟수를 구하시오" |
| `code` | 코드해석형 | C·Java·Python 코드의 출력·동작 해석 | "다음 Java 코드의 출력 결과를 쓰시오" |
| `sql` | SQL형 | SQL 작성·결과 해석·관계대수 | "조건에 맞는 SELECT 문을 완성하시오" |
| `descriptive` | 서술형 | 짧은 서술·약술 답안 (주로 실기) | "블랙박스 테스트의 개념을 약술하시오" |

여러 유형에 걸쳐 보이면 더 구체적인 쪽을 고릅니다. 코드를 읽고 계산까지 해야 하면 `code`, SQL을 읽고 결과 행 수를 세면 `sql`입니다.

### 신뢰도

- `official`: 한국산업인력공단 등이 공식 공개한 문항
- `reconstructed`: 수험생이 시험 뒤 기억으로 복원한 문항. 필기는 2022년 3회부터 CBT로 바뀌어 대부분 이 값입니다

## 5. 출처 표기

- 모든 문항에 출처를 하나 이상 적습니다. 출처가 없는 기록은 받지 않습니다.
- `label`에는 출처를 알아볼 수 있는 이름을 적습니다 (예: "○○ 카페 2024년 1회 실기 복원본"). 원문 문장을 붙여 넣지 않습니다.
- `url`은 선택이며 `http://` 또는 `https://`로 시작해야 합니다. 그 밖의 주소(`javascript:` 등)는 검증에서 실패합니다.
- 여러 복원본을 대조했다면 출처를 모두 적습니다.

## 6. 로컬에서 검증하기

PR을 올리기 전에 검증기를 돌려 오류가 없는지 확인합니다.

```bash
node scripts/validate.ts
```

`0 error(s)`가 나오면 통과입니다. 오류는 한 줄에 하나씩 `파일 · 레코드 id · 규칙 코드 · 원인` 형식으로 나옵니다.

```text
ERROR data/questions/2024-3-practical.json · 2024-3-practical-q2 · V3 · unknown concept 'p-sql-jion'
```

규칙 코드의 뜻은 다음과 같습니다.

| 코드 | 의미 |
|------|------|
| V1 | JSON 파싱 실패 |
| V2 | 스키마 위반 (필수 필드 누락, 형식, 길이, 추가 필드) |
| V3 | 없는 회차·과목·개념·유형 참조 |
| V4 | id 중복 |
| V5 | 다른 과목의 개념을 태그함 |
| V6 | 과목이 회차 트랙에서 출제되지 않음 |
| V7 | id·파일명 규칙 위반 |
| V8 | 폐기 개념의 `replaced_by` 오류 |
| V9 | `main`에 있던 taxonomy slug를 지움 (PR에서만 검사) |
| W1 | 폐기 개념 사용 (경고, 실패 아님) |

로컬 실행에서는 V9를 건너뛴다는 안내가 한 줄 나옵니다. V9는 PR의 자동 검증에서 확인합니다.

## 7. Pull Request 열기

1. 변경을 커밋하고 포크에 올립니다.

   ```bash
   git add data/
   git commit -m "data: add 2024-3 practical round"
   git push origin data/2024-3-practical
   ```

2. GitHub에서 `DevMinGeonPark/Information-Processing-GISA`의 `main`을 대상으로 PR을 엽니다. PR 템플릿의 항목과 체크리스트를 채웁니다.
3. 자동 검증(기여 관문)이 돌아갑니다. 관문은 PR이 바꾼 검증기가 아니라 **`main` 브랜치의 검증기와 스키마**로 PR의 `data/`를 검사합니다. 실패하면 CI 로그의 `ERROR` 줄을 보고 고친 뒤 같은 브랜치에 다시 push합니다.
4. 관문을 통과하면 저장소 소유자가 태깅과 출처를 검토하고 병합합니다. 같은 회차 파일을 다른 PR이 먼저 바꿨다면 `main`을 기준으로 리베이스해 주세요.

## 라이선스

- `data/` 아래에 기여한 데이터는 [CC BY 4.0](LICENSE-DATA)(Creative Commons Attribution 4.0 International)으로 배포됩니다. PR이나 이슈로 데이터를 제공하면 그 데이터를 CC BY 4.0으로 제공하는 데 동의한 것으로 봅니다.
- 소스 코드(`src/`, `scripts/` 등)는 [MIT 라이선스](LICENSE)를 따릅니다.
