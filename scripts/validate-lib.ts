// 데이터 검증 로직 (SPEC-TREND-001 §C.6 V1~V9, W1).
// 스키마는 이 파일이 있는 체크아웃의 data/schema 에서 읽고, 검증 대상 데이터 루트는 인자로 받는다.
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import type { ValidateFunction } from "ajv";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

export interface Issue {
  file: string;
  id?: string;
  code: string;
  cause: string;
}
export interface Result {
  errors: Issue[];
  warnings: Issue[];
  notices: string[];
}

const SCHEMA_DIR = join(dirname(fileURLToPath(import.meta.url)), "../data/schema");
const ROUND_FILE_RE = /^\d{4}-[1-9]-(written|practical)$/;

let compiled: Record<string, ValidateFunction> | undefined;
function schemas(): Record<string, ValidateFunction> {
  if (compiled) return compiled;
  // if/then 안의 required 는 상위 properties 에 정의돼 있으므로 strictRequired 만 끈다.
  const ajv = new Ajv2020({ allErrors: true, strictRequired: false });
  addFormats(ajv);
  const load = (n: string) => ajv.compile(JSON.parse(readFileSync(join(SCHEMA_DIR, `${n}.schema.json`), "utf8")));
  compiled = {
    rounds: load("rounds"),
    taxonomy: load("taxonomy"),
    types: load("question-types"),
    questions: load("questions"),
  };
  return compiled;
}

export function formatIssue(i: Issue): string {
  return `${i.file} · ${i.id ?? "-"} · ${i.code} · ${i.cause}`;
}

type Node = { id: string; [k: string]: any };

// JSON pointer 경로를 따라가며 마지막으로 만난 id 를 레코드 id 로 쓴다.
function recordIdAt(data: unknown, pointer: string): string | undefined {
  let cur: any = data;
  let id: string | undefined;
  for (const seg of pointer.split("/").slice(1)) {
    if (cur == null || typeof cur !== "object") break;
    cur = cur[seg];
    if (cur && typeof cur === "object" && typeof cur.id === "string") id = cur.id;
  }
  return id;
}

function allSlugs(taxonomy: any): string[] {
  const out: string[] = [];
  for (const s of Array.isArray(taxonomy) ? taxonomy : []) {
    out.push(s?.id);
    for (const t of s?.topics ?? []) {
      out.push(t?.id);
      for (const c of t?.concepts ?? []) out.push(c?.id);
    }
  }
  return out.filter((x): x is string => typeof x === "string");
}

export function validateDataRoot(root: string, opts: { baselinePath?: string } = {}): Result {
  const dataDir = existsSync(join(root, "data")) ? join(root, "data") : root;
  const display = (p: string) => relative(dirname(dataDir), p);
  const errors: Issue[] = [];
  const warnings: Issue[] = [];
  const notices: string[] = [];
  const err = (file: string, code: string, cause: string, id?: string) => errors.push({ file, id, code, cause });

  // V1(파싱) + V2(스키마). 통과하지 못한 파일은 교차 검증에서 제외한다.
  // 단 문항 파일(keepInvalid)은 배열이면 계속 교차 검증해 V2 와 V3 등을 함께 알린다.
  const load = (path: string, schema: string, keepInvalid = false): any[] | undefined => {
    const file = display(path);
    let data: unknown;
    try {
      data = JSON.parse(readFileSync(path, "utf8"));
    } catch (e) {
      err(file, "V1", `cannot read or parse JSON: ${(e as Error).message}`);
      return undefined;
    }
    const v = schemas()[schema];
    if (!v(data)) {
      for (const e of v.errors ?? []) {
        const extra = e.keyword === "additionalProperties" ? ` '${(e.params as any).additionalProperty}'` : "";
        err(file, "V2", `${e.instancePath || "/"} ${e.message}${extra}`, recordIdAt(data, e.instancePath));
      }
      return keepInvalid && Array.isArray(data) ? data : undefined;
    }
    return data as any[];
  };

  const roundsFile = join(dataDir, "rounds.json");
  const taxonomyFile = join(dataDir, "taxonomy.json");
  const typesFile = join(dataDir, "question-types.json");
  const rounds = load(roundsFile, "rounds");
  const taxonomy = load(taxonomyFile, "taxonomy");
  const types = load(typesFile, "types");

  const dupCheck = (file: string, ids: string[], what: string) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) err(display(file), "V4", `duplicate ${what} '${id}'`, id);
      seen.add(id);
    }
  };

  // 회차
  const roundById = new Map<string, Node>();
  if (rounds) {
    dupCheck(roundsFile, rounds.map((r) => r.id), "round id");
    for (const r of rounds) {
      roundById.set(r.id, r);
      const expected = `${r.year}-${r.session}-${r.track}`;
      if (r.id !== expected) err(display(roundsFile), "V7", `round id must be '${expected}'`, r.id);
    }
  }

  // taxonomy
  const subjectById = new Map<string, Node>();
  const conceptById = new Map<string, Node & { subject: string }>();
  if (taxonomy) {
    dupCheck(taxonomyFile, allSlugs(taxonomy), "taxonomy slug");
    for (const s of taxonomy) {
      subjectById.set(s.id, s);
      for (const t of s.topics) for (const c of t.concepts) conceptById.set(c.id, { ...c, subject: s.id });
    }
    for (const c of conceptById.values()) {
      if (!c.deprecated) continue;
      const target = conceptById.get(c.replaced_by);
      const f = display(taxonomyFile);
      if (!target) err(f, "V8", `replaced_by '${c.replaced_by}' is not an existing concept`, c.id);
      else if (target.deprecated) err(f, "V8", `replaced_by '${c.replaced_by}' is itself deprecated`, c.id);
      else if (target.subject !== c.subject) err(f, "V8", `replaced_by '${c.replaced_by}' belongs to another subject`, c.id);
    }
  }

  // 유형
  const typeIds = new Set<string>();
  if (types) {
    dupCheck(typesFile, types.map((t) => t.id), "question type");
    for (const t of types) typeIds.add(t.id);
  }

  // 문항
  const qDir = join(dataDir, "questions");
  let qFiles: string[] = [];
  try {
    qFiles = readdirSync(qDir).filter((f) => f.endsWith(".json")).sort();
  } catch (e) {
    err(display(qDir), "V1", `cannot read questions directory: ${(e as Error).message}`);
  }
  const seenQ = new Set<string>();
  for (const name of qFiles) {
    const path = join(qDir, name);
    const qs = load(path, "questions", true);
    if (!qs) continue;
    const f = display(path);
    const stem = basename(name, ".json");
    if (!ROUND_FILE_RE.test(stem)) err(f, "V7", `file name must be '<round-id>.json'`);
    const str = (v: unknown): v is string => typeof v === "string";
    for (const q of qs) {
      // 스키마를 어긴 항목은 필드 모양이 맞을 때만 교차 검증한다 (모양 오류는 V2 가 이미 보고함).
      if (q === null || typeof q !== "object" || !str(q.id)) continue;
      if (seenQ.has(q.id)) err(f, "V4", `duplicate question id '${q.id}'`, q.id);
      seenQ.add(q.id);
      if (str(q.round) && q.round !== stem) err(f, "V7", `round '${q.round}' does not match file name '${name}'`, q.id);
      if (str(q.round) && Number.isInteger(q.number) && q.id !== `${q.round}-q${q.number}`)
        err(f, "V7", `question id must be '${q.round}-q${q.number}'`, q.id);

      const round = str(q.round) ? roundById.get(q.round) : undefined;
      const subject = str(q.subject) ? subjectById.get(q.subject) : undefined;
      if (rounds && str(q.round) && !round) err(f, "V3", `unknown round '${q.round}'`, q.id);
      if (taxonomy && str(q.subject) && !subject) err(f, "V3", `unknown subject '${q.subject}'`, q.id);
      if (types && str(q.type) && !typeIds.has(q.type)) err(f, "V3", `unknown question type '${q.type}'`, q.id);
      if (round && subject && !subject.tracks.includes(round.track))
        err(f, "V6", `subject '${q.subject}' is not offered on track '${round.track}'`, q.id);
      if (!taxonomy || !Array.isArray(q.concepts)) continue;
      for (const cid of q.concepts.filter(str)) {
        const c = conceptById.get(cid);
        if (!c) err(f, "V3", `unknown concept '${cid}'`, q.id);
        else if (subject && c.subject !== q.subject) err(f, "V5", `concept '${cid}' belongs to subject '${c.subject}', not '${q.subject}'`, q.id);
        else if (c.deprecated)
          warnings.push({ file: f, id: q.id, code: "W1", cause: `concept '${cid}' is deprecated; use '${c.replaced_by}'` });
      }
    }
  }

  // V9: 기준 taxonomy 의 slug 가 사라졌는지 (폐기 처리는 허용)
  if (!opts.baselinePath) {
    notices.push("V9 skipped: no baseline taxonomy supplied (--baseline <taxonomy.json>)");
  } else {
    let baseline: unknown;
    try {
      baseline = JSON.parse(readFileSync(opts.baselinePath, "utf8"));
    } catch (e) {
      err(opts.baselinePath, "V1", `cannot read or parse baseline taxonomy: ${(e as Error).message}`);
    }
    if (baseline !== undefined && taxonomy) {
      const current = new Set(allSlugs(taxonomy));
      for (const slug of allSlugs(baseline))
        if (!current.has(slug)) err(display(taxonomyFile), "V9", `slug '${slug}' exists in the baseline taxonomy but was removed (deprecate it instead)`, slug);
    }
  }

  return { errors, warnings, notices };
}
