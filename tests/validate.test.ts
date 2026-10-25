import { describe, it, expect } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { validateDataRoot, formatIssue } from "../scripts/validate-lib.ts";

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "../scripts/validate.ts");

type Json = any;
interface Dataset {
  rounds: Json;
  taxonomy: Json;
  types: Json;
  questions: Record<string, Json>;
}

const src = [{ label: "fixture" }];
function base(): Dataset {
  return {
    rounds: [
      { id: "2024-1-written", year: 2024, session: 1, track: "written" },
      { id: "2024-1-practical", year: 2024, session: 1, track: "practical" },
    ],
    taxonomy: [
      {
        id: "subj-w", name: "필기 과목", tracks: ["written"],
        topics: [{ id: "tw", name: "주제", concepts: [
          { id: "a", name: "개념 A" },
          { id: "b", name: "개념 B" },
          { id: "d", name: "개념 D", deprecated: true, replaced_by: "a" },
        ] }],
      },
      {
        id: "subj-p", name: "실기 과목", tracks: ["practical"],
        topics: [{ id: "tp", name: "주제", concepts: [{ id: "p1", name: "개념 P1" }] }],
      },
    ],
    types: [
      { id: "term", name: "용어형", criteria: "c" },
      { id: "code", name: "코드해석형", criteria: "c" },
    ],
    questions: {
      "2024-1-written.json": [
        { id: "2024-1-written-q1", round: "2024-1-written", number: 1, subject: "subj-w", concepts: ["a"], type: "term", confidence: "reconstructed", sources: src },
      ],
      "2024-1-practical.json": [
        { id: "2024-1-practical-q1", round: "2024-1-practical", number: 1, subject: "subj-p", concepts: ["p1"], type: "code", confidence: "official", sources: src },
      ],
    },
  };
}

function write(ds: Dataset, raw: Record<string, string> = {}): string {
  const root = mkdtempSync(join(tmpdir(), "gisa-validate-"));
  mkdirSync(join(root, "data/questions"), { recursive: true });
  const put = (p: string, v: Json) => writeFileSync(join(root, "data", p), JSON.stringify(v, null, 2));
  put("rounds.json", ds.rounds);
  put("taxonomy.json", ds.taxonomy);
  put("question-types.json", ds.types);
  for (const [f, v] of Object.entries(ds.questions)) put(`questions/${f}`, v);
  for (const [p, text] of Object.entries(raw)) writeFileSync(join(root, "data", p), text);
  return root;
}

function writeBaseline(taxonomy: Json): string {
  const p = join(mkdtempSync(join(tmpdir(), "gisa-baseline-")), "taxonomy.json");
  writeFileSync(p, JSON.stringify(taxonomy));
  return p;
}

function cli(root: string, baseline?: string) {
  const args = [SCRIPT, root, ...(baseline ? ["--baseline", baseline] : [])];
  const r = spawnSync(process.execPath, args, { encoding: "utf8" });
  return { status: r.status, out: r.stdout + r.stderr };
}

const wq = (ds: Dataset) => ds.questions["2024-1-written.json"][0];
const concepts = (ds: Dataset) => ds.taxonomy[0].topics[0].concepts;

interface Case {
  name: string;
  code: string;
  file: string;
  id?: string;
  mutate: (ds: Dataset) => Record<string, string> | void;
}

// AC-TREND-002: each fixture violates exactly one rule.
const cases: Case[] = [
  { name: "V1 missing comma", code: "V1", file: "data/questions/2024-1-written.json",
    mutate: () => ({ "questions/2024-1-written.json": '[{"id": "2024-1-written-q1" "round": "2024-1-written"}]' }) },
  { name: "V2 taxonomy missing required field", code: "V2", file: "data/taxonomy.json", id: "subj-p",
    mutate: (ds) => { delete ds.taxonomy[1].name; } },
  { name: "V2 non-http source url (javascript:)", code: "V2", file: "data/questions/2024-1-written.json", id: "2024-1-written-q1",
    mutate: (ds) => { wq(ds).sources = [{ label: "x", url: "javascript:alert(1)" }]; } },
  { name: "V3 unknown round", code: "V3", file: "data/questions/2024-1-written.json", id: "2024-1-written-q2",
    mutate: (ds) => { ds.questions["2024-1-written.json"].push({ ...wq(ds), id: "2024-1-written-q2", number: 2 }); ds.rounds.splice(0, 1); ds.questions["2024-1-written.json"].shift(); } },
  { name: "V3 unknown subject", code: "V3", file: "data/questions/2024-1-written.json", id: "2024-1-written-q1",
    mutate: (ds) => { wq(ds).subject = "nope"; } },
  { name: "V3 unknown concept", code: "V3", file: "data/questions/2024-1-written.json", id: "2024-1-written-q1",
    mutate: (ds) => { wq(ds).concepts = ["nope"]; } },
  { name: "V3 unknown type", code: "V3", file: "data/questions/2024-1-written.json", id: "2024-1-written-q1",
    mutate: (ds) => { wq(ds).type = "nope"; } },
  { name: "V4 duplicate question id", code: "V4", file: "data/questions/2024-1-written.json", id: "2024-1-written-q1",
    mutate: (ds) => { ds.questions["2024-1-written.json"].push({ ...wq(ds) }); } },
  { name: "V4 duplicate taxonomy slug", code: "V4", file: "data/taxonomy.json", id: "tw",
    mutate: (ds) => { ds.taxonomy[1].topics[0].concepts.push({ id: "tw", name: "중복" }); } },
  { name: "V5 concept of another subject", code: "V5", file: "data/questions/2024-1-written.json", id: "2024-1-written-q1",
    mutate: (ds) => { wq(ds).concepts = ["p1"]; } },
  { name: "V6 written-only subject in practical round", code: "V6", file: "data/questions/2024-1-practical.json", id: "2024-1-practical-q1",
    mutate: (ds) => { Object.assign(ds.questions["2024-1-practical.json"][0], { subject: "subj-w", concepts: ["a"] }); } },
  { name: "V7 round id mismatch", code: "V7", file: "data/rounds.json", id: "2023-1-written",
    mutate: (ds) => { ds.rounds.push({ id: "2023-1-written", year: 2023, session: 2, track: "written" }); } },
  { name: "V7 question id mismatch", code: "V7", file: "data/questions/2024-1-written.json", id: "2024-1-written-q2",
    mutate: (ds) => { wq(ds).id = "2024-1-written-q2"; } },
  { name: "V7 file name mismatch", code: "V7", file: "data/questions/2024-9-practical.json", id: "2024-1-practical-q1",
    mutate: (ds) => { ds.questions["2024-9-practical.json"] = ds.questions["2024-1-practical.json"]; delete ds.questions["2024-1-practical.json"]; } },
  { name: "V8 replaced_by unknown concept", code: "V8", file: "data/taxonomy.json", id: "d",
    mutate: (ds) => { concepts(ds)[2].replaced_by = "nope"; } },
  { name: "V8 replaced_by deprecated concept", code: "V8", file: "data/taxonomy.json", id: "d",
    mutate: (ds) => { concepts(ds)[1] = { id: "b", name: "개념 B", deprecated: true, replaced_by: "a" }; concepts(ds)[2].replaced_by = "b"; } },
  { name: "V8 replaced_by other-subject concept", code: "V8", file: "data/taxonomy.json", id: "d",
    mutate: (ds) => { concepts(ds)[2].replaced_by = "p1"; } },
];

describe("validator — clean dataset", () => {
  it("passes with no errors (exit 0) and a V9-skipped notice", () => {
    const root = write(base());
    const res = validateDataRoot(root);
    expect(res.errors).toEqual([]);
    expect(res.warnings).toEqual([]);
    const r = cli(root);
    expect(r.status).toBe(0);
    expect(r.out).toMatch(/V9.*skipped/i);
  });

  it("accepts the data/ directory itself as the data root", () => {
    expect(validateDataRoot(join(write(base()), "data")).errors).toEqual([]);
  });
});

describe("validator — rule fixtures (AC-TREND-002)", () => {
  it.each(cases)("$name", (c) => {
    const ds = base();
    const raw = c.mutate(ds) ?? {};
    const root = write(ds, raw);
    const res = validateDataRoot(root);
    expect(res.errors.map((e) => e.code)).toEqual(expect.arrayContaining([c.code]));
    expect(new Set(res.errors.map((e) => e.code))).toEqual(new Set([c.code]));
    const hit = res.errors.find((e) => e.code === c.code)!;
    expect(hit.file).toBe(c.file);
    if (c.id) expect(res.errors.some((e) => e.id === c.id)).toBe(true);

    const r = cli(root);
    expect(r.status).not.toBe(0);
    const line = r.out.split("\n").find((l) => l.includes(c.code) && l.includes(c.file) && (!c.id || l.includes(c.id)));
    expect(line).toBeDefined();
  });

  it("W1: deprecated concept reference warns with replaced_by and exits 0", () => {
    const ds = base();
    wq(ds).concepts = ["d"];
    const root = write(ds);
    const res = validateDataRoot(root);
    expect(res.errors).toEqual([]);
    expect(res.warnings.map((w) => w.code)).toEqual(["W1"]);
    const r = cli(root);
    expect(r.status).toBe(0);
    expect(r.out.split("\n").some((l) => l.includes("W1") && l.includes("2024-1-written-q1") && /\ba\b/.test(l))).toBe(true);
  });

  it("V3 also flags a question file whose round is missing from rounds.json", () => {
    const ds = base();
    ds.rounds.splice(1, 1);
    expect(validateDataRoot(write(ds)).errors.map((e) => e.code)).toEqual(["V3"]);
  });

  it("a schema-invalid question file still gets reference checks (V2 and V3 together)", () => {
    const ds = base();
    Object.assign(wq(ds), { sources: [], concepts: ["nope"] });
    const res = validateDataRoot(write(ds));
    const f = "data/questions/2024-1-written.json";
    expect(res.errors.some((e) => e.code === "V2" && e.file === f && e.id === "2024-1-written-q1")).toBe(true);
    expect(res.errors.some((e) => e.code === "V3" && e.file === f && e.cause.includes("nope"))).toBe(true);
  });

  it("malformed question items do not crash the reference checks", () => {
    const res = validateDataRoot(write(base(), { "questions/2024-1-written.json": '[1, {"id": 5, "concepts": "x"}]' }));
    expect(new Set(res.errors.map((e) => e.code))).toEqual(new Set(["V2"]));
  });

  it("V4 duplicate round id", () => {
    const ds = base();
    ds.rounds.push({ ...ds.rounds[0] });
    expect(validateDataRoot(write(ds)).errors.map((e) => e.code)).toEqual(["V4"]);
  });

  it("reports V1 when a top-level file is missing", () => {
    const root = write(base(), {});
    const res = validateDataRoot(join(root, "nonexistent"));
    expect(res.errors.length).toBeGreaterThan(0);
    expect(res.errors.every((e) => e.code === "V1")).toBe(true);
  });
});

describe("schema rejects question text fields (AC-TREND-003)", () => {
  const variants: [string, (q: Json) => void][] = [
    ["top-level text/choices/answer", (q) => Object.assign(q, { text: "t", choices: ["1"], answer: "1" })],
    ["sources[].quote", (q) => { q.sources = [{ label: "x", quote: "원문" }]; }],
    ["201-char note", (q) => { q.note = "가".repeat(201); }],
  ];
  it.each(variants)("%s → V2", (_n, mut) => {
    const ds = base();
    mut(wq(ds));
    const res = validateDataRoot(write(ds));
    expect(res.errors.length).toBeGreaterThan(0);
    expect(new Set(res.errors.map((e) => e.code))).toEqual(new Set(["V2"]));
  });
  it("http and https source urls are accepted", () => {
    const ds = base();
    wq(ds).sources = [{ label: "a", url: "https://example.com/x" }, { label: "b", url: "http://example.com" }];
    expect(validateDataRoot(write(ds)).errors).toEqual([]);
  });
  it("200-char note is accepted", () => {
    const ds = base();
    wq(ds).note = "가".repeat(200);
    expect(validateDataRoot(write(ds)).errors).toEqual([]);
  });
});

describe("V9 baseline taxonomy (AC-TREND-004)", () => {
  const baseline = () => writeBaseline(base().taxonomy);
  const deleted = () => { const ds = base(); concepts(ds).splice(1, 1); return ds; };

  it("deleting slug with baseline → V9 naming the slug, non-zero exit", () => {
    const root = write(deleted());
    const res = validateDataRoot(root, { baselinePath: baseline() });
    expect(res.errors.map((e) => e.code)).toEqual(["V9"]);
    expect(res.errors[0].id).toBe("b");
    const r = cli(root, baseline());
    expect(r.status).not.toBe(0);
    expect(r.out.split("\n").some((l) => l.includes("V9") && l.includes("b"))).toBe(true);
  });

  it("deprecating slug with baseline → exit 0", () => {
    const ds = base();
    concepts(ds)[1] = { id: "b", name: "개념 B", deprecated: true, replaced_by: "a" };
    const root = write(ds);
    expect(validateDataRoot(root, { baselinePath: baseline() }).errors).toEqual([]);
    expect(cli(root, baseline()).status).toBe(0);
  });

  it("deleting slug without baseline → exit 0 with skipped notice", () => {
    const root = write(deleted());
    const res = validateDataRoot(root);
    expect(res.errors).toEqual([]);
    expect(res.notices.join("\n")).toMatch(/V9.*skipped/i);
    const r = cli(root);
    expect(r.status).toBe(0);
    expect(r.out).toMatch(/V9.*skipped/i);
  });

  it("unreadable baseline is reported as V1", () => {
    const res = validateDataRoot(write(base()), { baselinePath: "/nonexistent/taxonomy.json" });
    expect(res.errors.map((e) => e.code)).toEqual(["V1"]);
  });
});

describe("formatIssue", () => {
  it("renders path · id · code · cause on one line", () => {
    expect(formatIssue({ file: "data/x.json", id: "r1", code: "V3", cause: "boom" })).toBe("data/x.json · r1 · V3 · boom");
    expect(formatIssue({ file: "data/x.json", code: "V1", cause: "bad" })).toBe("data/x.json · - · V1 · bad");
  });
});
