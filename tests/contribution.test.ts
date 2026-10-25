// SPEC-TREND-002 기여 문서·템플릿·관문 계약 검사.
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

const HEADINGS = [
  "## 기여하기 전에",
  "## 1. 저장소 포크하기",
  "## 2. 데이터 파일 위치",
  "## 3. 필드 설명",
  "## 4. 개념 태깅과 유형 판별 규칙",
  "## 5. 출처 표기",
  "## 6. 로컬에서 검증하기",
  "## 7. Pull Request 열기",
  "## 라이선스",
];

describe("AC-TREND2-001 CONTRIBUTING.md", () => {
  it("has the nine headings in order and a license section naming CC BY 4.0 and MIT", () => {
    const doc = read("CONTRIBUTING.md");
    const h2 = doc.split("\n").filter((l) => l.startsWith("## "));
    expect(h2).toEqual(HEADINGS);
    const license = doc.slice(doc.indexOf("## 라이선스"));
    expect(license).toContain("CC BY 4.0");
    expect(license).toContain("MIT");
  });

  it("tells data contributors to touch only data/ and that scripts/ or schema changes need owner review", () => {
    const doc = read("CONTRIBUTING.md");
    const before = doc.slice(doc.indexOf("## 기여하기 전에"), doc.indexOf("## 1."));
    expect(before).toContain("`data/`");
    expect(before).toContain("`scripts/`");
    expect(before).toContain("`data/schema/`");
    expect(before).toContain("소유자 리뷰");
  });
});

describe("AC-TREND2-002 LICENSE-DATA", () => {
  it("carries the CC BY 4.0 notice for data/ naming DevMinGeonPark", () => {
    const text = read("LICENSE-DATA");
    expect(text).toContain("Creative Commons Attribution 4.0 International");
    expect(text).toContain("data/");
    expect(text).toContain("DevMinGeonPark");
  });
});

describe("AC-TREND2-003 issue and PR templates", () => {
  const FIELDS = ["회차", "트랙", "과목", "개념 태그", "유형", "신뢰도", "출처"];
  const issueDir = join(ROOT, ".github/ISSUE_TEMPLATE");
  const issueFiles = existsSync(issueDir) ? readdirSync(issueDir).filter((f) => /\.ya?ml$/.test(f) && f !== "config.yml") : [];

  it("provides a data-submission issue form", () => {
    expect(issueFiles).toContain("data-submission.yml");
  });

  for (const path of [".github/ISSUE_TEMPLATE/data-submission.yml", ".github/pull_request_template.md"]) {
    it(`${path} asks for every field and both confirmations`, () => {
      const text = read(path);
      for (const f of FIELDS) expect(text, f).toContain(f);
      expect(text).toContain("문항 원문");
      expect(text).toContain("CC BY 4.0");
      expect(text).toMatch(/동의/);
    });
  }
});
