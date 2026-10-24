import { typeDistribution } from "../core/aggregate";
import type { Track } from "../core/types";
import { Disclaimer, type ViewProps } from "./common";

const TRACKS: [Track, string][] = [
  ["written", "필기"],
  ["practical", "실기"],
];

export function RoundTrend({ data, filter }: ViewProps) {
  const dist = typeDistribution(data, filter);
  const typeName = new Map(data.types.map((t) => [t.id, t.name]));

  return (
    <section>
      <h2>회차별 유형 분포</h2>
      <Disclaimer />
      {TRACKS.map(([track, label]) => {
        const rounds = dist.filter((d) => d.round.track === track);
        if (rounds.length === 0) return null;
        return (
          <div key={track} className={`trend-group ${track}`} data-testid={`trend-group-${track}`}>
            <h3>{label}</h3>
            <ul>
              {rounds.map(({ round, counts, total }) => {
                const parts = Object.entries(counts).filter(([, n]) => n > 0);
                return (
                  <li key={round.id} data-testid="trend-round" data-round={round.id} data-total={total}>
                    <span className="round-id">{round.id}</span>
                    <span className="bar" aria-hidden="true">
                      {parts.map(([t, n]) => (
                        <span key={t} className={`seg type-${t}`} style={{ width: `${(100 * n) / total}%` }} />
                      ))}
                    </span>
                    <span className="counts">
                      {total === 0 ? "문항 없음" : parts.map(([t, n]) => `${typeName.get(t) ?? t} ${n}`).join(" · ")} (총 {total})
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
