// SPEC-TREND-002 기여 문서·템플릿·관문 계약 검사.
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, readdirSync, mkdtempSync, cpSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
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

// CI 기여 관문이 실행하는 명령. base/ 는 base 브랜치 체크아웃, pr/ 는 PR 작업 트리다.
const GATE = "node base/scripts/validate.ts pr --baseline base/data/taxonomy.json";

describe("AC-TREND2-004 contribution gate rejects a bad fixture", () => {
  it("the gate command exits non-zero with V2 and V3 lines for 2099-1-practical-q1", () => {
    // 이 체크아웃을 base 로, 저장소 data/ + 잘못된 기여 파일을 PR 작업 트리로 놓고 같은 명령을 돌린다.
    const pr = mkdtempSync(join(tmpdir(), "gisa-gate-"));
    cpSync(join(ROOT, "data"), join(pr, "data"), { recursive: true });
    cpSync(join(ROOT, "tests/fixtures/contribution/questions"), join(pr, "data/questions"), { recursive: true });
    const [, script, , flag, baseline] = GATE.split(" ");
    const r = spawnSync(process.execPath, [join(ROOT, script.replace(/^base\//, "")), pr, flag, join(ROOT, baseline.replace(/^base\//, ""))], { encoding: "utf8" });
    const lines = (r.stdout + r.stderr).split("\n");
    expect(r.status).not.toBe(0);
    expect(lines.some((l) => l.includes("2099-1-practical-q1") && l.includes("V2"))).toBe(true);
    expect(lines.some((l) => l.includes("2099-1-practical-q1") && l.includes("V3") && l.includes("no-such-concept"))).toBe(true);
  });
});

// 들여쓰기 2칸 YAML 을 job 단위로 자른다 (파서 의존성 없이 워크플로 계약만 본다).
function jobBlocks(yml: string): Record<string, string> {
  const out: Record<string, string> = {};
  let name: string | undefined;
  for (const line of yml.slice(yml.indexOf("\njobs:\n") + 7).split("\n")) {
    const m = /^ {2}([\w-]+):\s*$/.exec(line);
    if (m) out[(name = m[1])] = "";
    else if (name) out[name] += line + "\n";
  }
  return out;
}
function permissions(text: string, indent: number): string[] {
  const lines = text.split("\n");
  const i = lines.findIndex((l) => l === `${" ".repeat(indent)}permissions:`);
  if (i < 0) return [];
  const out: string[] = [];
  for (const l of lines.slice(i + 1)) {
    if (!l.startsWith(" ".repeat(indent + 2)) || l.trim() === "") break;
    out.push(l.trim());
  }
  return out;
}

describe("AC-TREND2-005 workflow definitions", () => {
  const dir = join(ROOT, ".github/workflows");
  const all = readdirSync(dir).map((f) => readFileSync(join(dir, f), "utf8"));
  const ci = read(".github/workflows/ci.yml");
  const head = ci.slice(0, ci.indexOf("\njobs:\n"));
  const jobs = jobBlocks(ci);
  const onPush = (block: string) => /^ {4}if: .*github\.event_name == 'push'/m.test(block);

  it("no workflow uses pull_request_target", () => {
    for (const w of all) expect(w).not.toContain("pull_request_target");
  });

  it("ci.yml triggers on pull_request without path filters and grants only contents: read at the top", () => {
    expect(head).toMatch(/^ {2}pull_request:/m);
    expect(head).not.toMatch(/paths(-ignore)?:/);
    expect(permissions(head, 0)).toEqual(["contents: read"]);
  });

  it("every job that runs on pull_request holds contents: read only", () => {
    const prJobs = Object.entries(jobs).filter(([, b]) => !onPush(b));
    expect(prJobs.map(([n]) => n)).toEqual(expect.arrayContaining(["validate", "test"]));
    for (const [n, b] of prJobs) expect(permissions(b, 4), n).toEqual(["contents: read"]);
  });

  it("only push-on-main jobs may hold Pages permissions", () => {
    for (const [n, b] of Object.entries(jobs)) {
      const p = permissions(b, 4);
      if (p.some((x) => !x.startsWith("contents:"))) {
        expect(b, n).toMatch(/^ {4}if: .*github\.event_name == 'push'.*refs\/heads\/main/m);
      }
    }
  });

  it("the PR data check runs the base-branch validator and schema against the PR tree with the base taxonomy", () => {
    const v = jobs.validate;
    expect(v).toContain("ref: ${{ github.base_ref }}");
    expect(v).toMatch(/path: base\n/);
    expect(v).toMatch(/path: pr\n/);
    expect(v).toMatch(/working-directory: base\n\s+run: npm ci/);
    expect(v).toContain(GATE);
  });
});
