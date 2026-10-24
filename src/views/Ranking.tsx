import { useState } from "react";
import { conceptFrequency, rank } from "../core/aggregate";
import type { SortKey } from "../core/types";
import { Disclaimer, type ViewProps } from "./common";

const COLUMNS: [SortKey, string][] = [
  ["name", "개념"],
  ["count", "문항 수"],
  ["rounds", "등장 회차 수"],
];

export function Ranking({ data, filter }: ViewProps) {
  const [sort, setSort] = useState<SortKey>("count");
  const rows = rank(conceptFrequency(data, filter), sort);
  const subjectName = new Map(data.taxonomy.map((s) => [s.id, s.name]));

  return (
    <section>
      <h2>개념 중요도 랭킹</h2>
      <Disclaimer />
      <table className="ranking">
        <thead>
          <tr>
            <th scope="col">순위</th>
            {COLUMNS.map(([k, label]) => (
              <th key={k} scope="col" aria-sort={sort === k ? (k === "name" ? "ascending" : "descending") : "none"}>
                <button type="button" onClick={() => setSort(k)}>
                  {label}
                </button>
              </th>
            ))}
            <th scope="col">과목</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} data-testid="rank-row" data-concept={r.id} data-count={r.count} data-rounds={r.rounds}>
              <td>{i + 1}</td>
              <td>{r.name}</td>
              <td>{r.count}</td>
              <td>{r.rounds}</td>
              <td>{subjectName.get(r.subject)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
