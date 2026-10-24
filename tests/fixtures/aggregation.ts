// acceptance.md 머리말의 집계 fixture.
// 과목 s: 개념 A·B·C, 폐기 개념 D(replaced_by A). C 는 출제 0회. 2023-2-written-q1 은 D 와 A 를 함께 태그.
// 회차 4개: 필기 2 + 실기 2, (2023, 2) 는 필기·실기 쌍. 2024-1-practical 은 과목 s 문항 0개.
// 과목 t(실기 전용, 개념 E)는 과목 필터 검증용.
import type { Dataset, Question } from "../../src/core/types";

const q = (round: string, number: number, subject: string, concepts: string[], type: string, confidence: Question["confidence"], label = "fixture-src"): Question => ({
  id: `${round}-q${number}`, round, number, subject, concepts, type, confidence, sources: [{ label }],
});

export const fixture: Dataset = {
  rounds: [
    { id: "2024-1-practical", year: 2024, session: 1, track: "practical" },
    { id: "2023-2-practical", year: 2023, session: 2, track: "practical" },
    { id: "2023-1-written", year: 2023, session: 1, track: "written" },
    { id: "2023-2-written", year: 2023, session: 2, track: "written" },
  ],
  taxonomy: [
    { id: "s", name: "과목 S", tracks: ["written", "practical"], topics: [{ id: "ts", name: "주제", concepts: [
      { id: "a", name: "개념 A" }, { id: "b", name: "개념 B" }, { id: "c", name: "개념 C" },
      { id: "d", name: "개념 D", deprecated: true, replaced_by: "a" },
    ] }] },
    { id: "t", name: "과목 T", tracks: ["practical"], topics: [{ id: "tt", name: "주제", concepts: [{ id: "e", name: "개념 E" }] }] },
  ],
  types: ["term", "concept", "calculation", "code", "sql", "descriptive"].map((id) => ({ id, name: id, criteria: id })),
  questions: [
    q("2023-1-written", 1, "s", ["a"], "term", "official", "출처 1"),
    q("2023-1-written", 2, "s", ["a", "b"], "concept", "reconstructed"),
    q("2023-2-written", 1, "s", ["d", "a"], "term", "reconstructed"),
    q("2023-2-written", 2, "s", ["b"], "calculation", "official"),
    q("2023-2-practical", 1, "s", ["d"], "code", "reconstructed"),
    q("2023-2-practical", 2, "s", ["b"], "sql", "reconstructed", "출처 1"),
    q("2024-1-practical", 1, "t", ["e"], "descriptive", "reconstructed", "출처 2"),
  ],
};

export const ROUND_ORDER = ["2023-1-written", "2023-2-written", "2023-2-practical", "2024-1-practical"];

// 과목 s 기준 기대값
export const EXPECTED = {
  frequency: { a: { count: 4, rounds: 3 }, b: { count: 3, rounds: 3 }, c: { count: 0, rounds: 0 } },
  matrix: { a: [2, 1, 1, 0], b: [1, 1, 1, 0], c: [0, 0, 0, 0] },
};
