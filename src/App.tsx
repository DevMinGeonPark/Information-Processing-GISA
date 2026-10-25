import { useState, useSyncExternalStore } from "react";
import { ALL } from "./core/aggregate";
import type { Dataset, Filter } from "./core/types";
import { dataset } from "./data";
import { FilterBar } from "./views/common";
import { Ranking } from "./views/Ranking";
import { Heatmap } from "./views/Heatmap";
import { RoundTrend } from "./views/RoundTrend";
import { Sources } from "./views/Sources";
import { Contribute } from "./views/Contribute";
import { CONTRIBUTING_URL } from "./core/snippet";

// GitHub Pages 에는 서버 리라이트가 없으므로 해시 라우팅만 쓴다.
const ROUTES = [
  ["ranking", "랭킹"],
  ["heatmap", "히트맵"],
  ["trend", "회차별 경향"],
  ["sources", "출처"],
  ["contribute", "기여 도우미"],
] as const;
type Route = (typeof ROUTES)[number][0];

const subscribe = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
const readRoute = (): Route => {
  const r = window.location.hash.replace(/^#\//, "");
  return ROUTES.some(([id]) => id === r) ? (r as Route) : "ranking";
};

export function App({ data = dataset }: { data?: Dataset }) {
  const route = useSyncExternalStore(subscribe, readRoute);
  const [filter, setFilter] = useState<Filter>(ALL);

  return (
    <>
      <header>
        <h1>정보처리기사 출제 경향</h1>
        <nav>
          {ROUTES.map(([id, label]) => (
            <a key={id} href={`#/${id}`} aria-current={route === id ? "page" : undefined}>
              {label}
            </a>
          ))}
          <a href={CONTRIBUTING_URL} className="contribute-link">
            데이터 기여하기
          </a>
        </nav>
      </header>
      <main>
        {route === "sources" ? (
          <Sources data={data} />
        ) : route === "contribute" ? (
          <Contribute data={data} />
        ) : (
          <>
            <FilterBar data={data} filter={filter} onChange={setFilter} />
            {route === "ranking" && <Ranking data={data} filter={filter} />}
            {route === "heatmap" && <Heatmap data={data} filter={filter} />}
            {route === "trend" && <RoundTrend data={data} filter={filter} />}
          </>
        )}
      </main>
    </>
  );
}
