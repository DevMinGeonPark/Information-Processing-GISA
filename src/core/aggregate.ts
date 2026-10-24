// 순수 집계 함수 (SPEC-TREND-001 §C.5 R1~R7). DOM·네트워크에 의존하지 않는다.
import type { Dataset, Filter, Round, Question, ConceptRow, Freq, SortKey, Matrix, RoundTypes, YearSession } from "./types";

export const ALL: Filter = { track: "all", subject: null, confidence: "all", period: null };

const TRACK_ORDER = { written: 0, practical: 1 } as const;
const ys = (a: YearSession, b: YearSession) => a.year - b.year || a.session - b.session;

// R1
export function compareRounds(a: Round, b: Round): number {
  return ys(a, b) || TRACK_ORDER[a.track] - TRACK_ORDER[b.track];
}
export function sortRounds(rounds: Round[]): Round[] {
  return [...rounds].sort(compareRounds);
}

// R2 + R3(트랙)
export function filterRounds(rounds: Round[], f: Filter): Round[] {
  return sortRounds(rounds).filter(
    (r) => (f.track === "all" || r.track === f.track) && (!f.period || (ys(r, f.period.from) >= 0 && ys(r, f.period.to) <= 0)),
  );
}

// R3
export function filterQuestions(ds: Dataset, f: Filter): Question[] {
  const ids = new Set(filterRounds(ds.rounds, f).map((r) => r.id));
  return ds.questions.filter(
    (q) => ids.has(q.round) && (!f.subject || q.subject === f.subject) && (f.confidence === "all" || q.confidence === f.confidence),
  );
}

// R4
export function conceptRows(ds: Dataset, f: Filter): ConceptRow[] {
  const rows: ConceptRow[] = [];
  for (const s of ds.taxonomy) {
    if (f.subject && s.id !== f.subject) continue;
    if (f.track !== "all" && !s.tracks.includes(f.track)) continue;
    for (const t of s.topics) for (const c of t.concepts) if (!c.deprecated) rows.push({ id: c.id, name: c.name, subject: s.id });
  }
  return rows;
}

// R5: 폐기 개념은 replaced_by 로 바꾸고, 같은 문항 안의 중복은 1번만 센다.
function canonicalConcepts(ds: Dataset): (q: Question) => Set<string> {
  const replace = new Map<string, string>();
  for (const s of ds.taxonomy) for (const t of s.topics) for (const c of t.concepts) if (c.deprecated && c.replaced_by) replace.set(c.id, c.replaced_by);
  return (q) => new Set(q.concepts.map((c) => replace.get(c) ?? c));
}

// R6, 기본 정렬(R7 랭킹 규칙) 적용
export function conceptFrequency(ds: Dataset, f: Filter): Freq[] {
  const canon = canonicalConcepts(ds);
  const count = new Map<string, number>();
  const rounds = new Map<string, Set<string>>();
  for (const q of filterQuestions(ds, f)) {
    for (const c of canon(q)) {
      count.set(c, (count.get(c) ?? 0) + 1);
      if (!rounds.has(c)) rounds.set(c, new Set());
      rounds.get(c)!.add(q.round);
    }
  }
  return rank(conceptRows(ds, f).map((r) => ({ ...r, count: count.get(r.id) ?? 0, rounds: rounds.get(r.id)?.size ?? 0 })));
}

const bySlug = (a: Freq, b: Freq) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
const SORTS: Record<SortKey, (a: Freq, b: Freq) => number> = {
  count: (a, b) => b.count - a.count || b.rounds - a.rounds || bySlug(a, b),
  rounds: (a, b) => b.rounds - a.rounds || b.count - a.count || bySlug(a, b),
  name: (a, b) => a.name.localeCompare(b.name, "ko") || bySlug(a, b),
};
export function rank(rows: Freq[], key: SortKey = "count"): Freq[] {
  return [...rows].sort(SORTS[key]);
}

export function conceptRoundMatrix(ds: Dataset, f: Filter): Matrix {
  const rows = conceptFrequency(ds, f);
  const rounds = filterRounds(ds.rounds, f);
  const col = new Map(rounds.map((r, i) => [r.id, i]));
  const row = new Map(rows.map((r, i) => [r.id, i]));
  const cells = rows.map(() => rounds.map(() => 0));
  const canon = canonicalConcepts(ds);
  for (const q of filterQuestions(ds, f)) {
    for (const c of canon(q)) {
      const i = row.get(c);
      if (i !== undefined) cells[i][col.get(q.round)!]++;
    }
  }
  const max = Math.max(0, ...cells.flat());
  return { rows: rows.map(({ id, name, subject }) => ({ id, name, subject })), rounds, cells, max };
}

export function typeDistribution(ds: Dataset, f: Filter): RoundTypes[] {
  const qs = filterQuestions(ds, f);
  return filterRounds(ds.rounds, f).map((round) => {
    const counts = Object.fromEntries(ds.types.map((t) => [t.id, 0]));
    const inRound = qs.filter((q) => q.round === round.id);
    for (const q of inRound) counts[q.type] = (counts[q.type] ?? 0) + 1;
    return { round, counts, total: inRound.length };
  });
}

// R7
export function intensityLevel(v: number, max: number): number {
  return v === 0 || max === 0 ? 0 : Math.ceil((4 * v) / max);
}
