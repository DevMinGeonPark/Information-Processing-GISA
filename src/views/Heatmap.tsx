import { useState } from "react";
import { conceptRoundMatrix, intensityLevel } from "../core/aggregate";
import { Disclaimer, type ViewProps } from "./common";

export function Heatmap({ data, filter }: ViewProps) {
  const m = conceptRoundMatrix(data, filter);
  const [tip, setTip] = useState<string | null>(null);

  return (
    <section>
      <h2>개념 × 회차 히트맵</h2>
      <Disclaimer />
      <p className="legend" aria-hidden="true">
        적음 {[0, 1, 2, 3, 4].map((l) => <span key={l} className={`cell level-${l}`} />)} 많음
      </p>
      <div className="heatmap-scroll">
        <table className="heatmap">
          <thead>
            <tr>
              <th scope="col">개념</th>
              {m.rounds.map((r) => (
                <th key={r.id} scope="col" className={`round-head ${r.track}`}>
                  {r.id}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {m.rows.map((row, i) => (
              <tr key={row.id}>
                <th scope="row">{row.name}</th>
                {m.rounds.map((round, j) => {
                  const v = m.cells[i][j];
                  const text = `${row.name} · ${round.id} · ${v}문항`;
                  return (
                    <td
                      key={round.id}
                      data-testid="heat-cell"
                      className={`cell level-${intensityLevel(v, m.max)}`}
                      tabIndex={0}
                      aria-label={`${row.name}, ${round.id}, ${v}문항`}
                      onMouseEnter={() => setTip(text)}
                      onMouseLeave={() => setTip(null)}
                      onFocus={() => setTip(text)}
                      onBlur={() => setTip(null)}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tip && (
        <div role="tooltip" className="tooltip">
          {tip}
        </div>
      )}
    </section>
  );
}
