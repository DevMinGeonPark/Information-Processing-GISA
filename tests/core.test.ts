import { describe, it, expect } from "vitest";
import { fixture, EXPECTED, ROUND_ORDER } from "./fixtures/aggregation";
import {
  ALL, sortRounds, filterRounds, filterQuestions, conceptRows, conceptFrequency, rank,
  conceptRoundMatrix, typeDistribution, intensityLevel,
} from "../src/core/aggregate";
import type { Filter, Freq } from "../src/core/types";

const S: Filter = { ...ALL, subject: "s" };
const byId = (rows: Freq[]) => Object.fromEntries(rows.map((r) => [r.id, { count: r.count, rounds: r.rounds }]));

describe("R1 round order", () => {
  it("sorts by year, session, then written before practical", () => {
    expect(sortRounds(fixture.rounds).map((r) => r.id)).toEqual(ROUND_ORDER);
  });
});

describe("AC-TREND-005 frequency and type distribution", () => {
  it("counts per concept with deprecated D merged into A once; no D row", () => {
    const f = conceptFrequency(fixture, S);
    expect(byId(f)).toEqual(EXPECTED.frequency);
    expect(f.some((r) => r.id === "d")).toBe(false);
  });
  it("per-round type counts sum to the round's question count", () => {
    const dist = typeDistribution(fixture, ALL);
    expect(dist.map((d) => d.round.id)).toEqual(ROUND_ORDER);
    for (const d of dist) {
      const n = fixture.questions.filter((q) => q.round === d.round.id).length;
      expect(Object.values(d.counts).reduce((a, b) => a + b, 0)).toBe(n);
      expect(d.total).toBe(n);
    }
    expect(dist[0].counts).toMatchObject({ term: 1, concept: 1, sql: 0 });
  });
});

describe("AC-TREND-006 filters", () => {
  it("track filter keeps only that track's rounds and questions", () => {
    const f: Filter = { ...ALL, track: "practical" };
    expect(filterRounds(fixture.rounds, f).map((r) => r.id)).toEqual(["2023-2-practical", "2024-1-practical"]);
    expect(filterQuestions(fixture, f).every((q) => q.round.endsWith("practical"))).toBe(true);
    expect(byId(conceptFrequency(fixture, { ...f, subject: "s" }))).toEqual({ a: { count: 1, rounds: 1 }, b: { count: 1, rounds: 1 }, c: { count: 0, rounds: 0 } });
  });
  it("subject filter keeps only that subject's questions and concept rows", () => {
    const f: Filter = { ...ALL, subject: "t" };
    expect(filterQuestions(fixture, f).map((q) => q.id)).toEqual(["2024-1-practical-q1"]);
    expect(conceptRows(fixture, f).map((r) => r.id)).toEqual(["e"]);
  });
  it("R4: written track hides concepts of practical-only subjects", () => {
    expect(conceptRows(fixture, { ...ALL, track: "written" }).map((r) => r.id)).toEqual(["a", "b", "c"]);
  });
  it("confidence filter keeps only that confidence", () => {
    const f: Filter = { ...S, confidence: "official" };
    expect(filterQuestions(fixture, f).map((q) => q.id)).toEqual(["2023-1-written-q1", "2023-2-written-q2"]);
    expect(byId(conceptFrequency(fixture, f))).toEqual({ a: { count: 1, rounds: 1 }, b: { count: 1, rounds: 1 }, c: { count: 0, rounds: 0 } });
  });
  it("period is inclusive on both ends and spans both tracks of the same (year, session)", () => {
    const f: Filter = { ...ALL, period: { from: { year: 2023, session: 2 }, to: { year: 2023, session: 2 } } };
    expect(filterRounds(fixture.rounds, f).map((r) => r.id)).toEqual(["2023-2-written", "2023-2-practical"]);
    const g: Filter = { ...ALL, period: { from: { year: 2023, session: 1 }, to: { year: 2024, session: 1 } } };
    expect(filterRounds(fixture.rounds, g).map((r) => r.id)).toEqual(ROUND_ORDER);
  });
  it("start later than end, or no matching question, gives empty counts without throwing", () => {
    const empties: Filter[] = [
      { ...S, period: { from: { year: 2024, session: 1 }, to: { year: 2023, session: 1 } } },
      { ...S, track: "written", subject: "t" },
      { ...ALL, subject: "nope" },
    ];
    for (const f of empties) {
      expect(filterQuestions(fixture, f)).toEqual([]);
      expect(conceptFrequency(fixture, f).every((r) => r.count === 0 && r.rounds === 0)).toBe(true);
      const m = conceptRoundMatrix(fixture, f);
      expect(m.cells.flat().every((v) => v === 0)).toBe(true);
      expect(m.max).toBe(0);
      expect(typeDistribution(fixture, f).every((d) => d.total === 0)).toBe(true);
    }
  });
  it("is deterministic: identical input gives deeply equal output", () => {
    for (const fn of [conceptFrequency, conceptRoundMatrix, typeDistribution, filterQuestions, conceptRows]) {
      expect(fn(fixture, S)).toEqual(fn(fixture, S));
    }
  });
});

describe("AC-TREND-007 ranking order", () => {
  const rows: Freq[] = [
    { id: "zero", name: "가", subject: "s", count: 0, rounds: 0 },
    { id: "y", name: "다", subject: "s", count: 3, rounds: 2 },
    { id: "x", name: "나", subject: "s", count: 3, rounds: 2 },
    { id: "w", name: "라", subject: "s", count: 3, rounds: 3 },
    { id: "v", name: "마", subject: "s", count: 5, rounds: 1 },
  ];
  it("count desc → rounds desc → slug asc, zero-count rows last", () => {
    expect(rank(rows).map((r) => r.id)).toEqual(["v", "w", "x", "y", "zero"]);
  });
  it("sorts by distinct rounds", () => {
    expect(rank(rows, "rounds").map((r) => r.id)).toEqual(["w", "x", "y", "v", "zero"]);
  });
  it("sorts by concept name", () => {
    expect(rank(rows, "name").map((r) => r.id)).toEqual(["zero", "x", "y", "w", "v"]);
  });
  it("does not mutate input", () => {
    const copy = [...rows];
    rank(rows);
    expect(rows).toEqual(copy);
  });
});

describe("AC-TREND-008 matrix and intensity", () => {
  it("is a 3×4 matrix with columns in R1 order and zero for absent pairs", () => {
    const m = conceptRoundMatrix(fixture, S);
    expect(m.rows.map((r) => r.id)).toEqual(["a", "b", "c"]);
    expect(m.rounds.map((r) => r.id)).toEqual(ROUND_ORDER);
    expect(Object.fromEntries(m.rows.map((r, i) => [r.id, m.cells[i]]))).toEqual(EXPECTED.matrix);
    expect(m.max).toBe(2);
  });
  it("levels: 0 if v=0 else ceil(4v/max)", () => {
    expect([0, 1, 5, 6, 8, 10].map((v) => intensityLevel(v, 10))).toEqual([0, 1, 2, 3, 4, 4]);
    expect(intensityLevel(0, 0)).toBe(0);
  });
});
