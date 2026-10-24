import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act, within } from "@testing-library/react";
import { fixture } from "./fixtures/aggregation";
import { App } from "../src/App";
import { Heatmap } from "../src/views/Heatmap";
import { ALL, conceptFrequency, conceptRoundMatrix, typeDistribution, rank } from "../src/core/aggregate";
import type { Filter } from "../src/core/types";

const DISCLAIMER = "이 데이터는 수험생이 복원한 기출을 바탕으로 정리한 것으로, 공식 자료가 아닙니다.";
const ANALYSIS_NOTE = "실기 과목은 분석용 분류입니다.";

afterEach(() => {
  cleanup();
  window.location.hash = "";
});

function renderAt(route: string) {
  window.location.hash = route;
  return render(<App data={fixture} />);
}

describe("AC-TREND-009 heatmap cells", () => {
  it("renders 12 labelled cells with hover and focus tooltips", () => {
    render(<Heatmap data={fixture} filter={{ ...ALL, subject: "s" }} />);
    const cells = screen.getAllByTestId("heat-cell");
    expect(cells).toHaveLength(12);
    const m = conceptRoundMatrix(fixture, { ...ALL, subject: "s" });
    m.rows.forEach((row, i) =>
      m.rounds.forEach((round, j) => {
        const label = cells[i * m.rounds.length + j].getAttribute("aria-label")!;
        expect(label).toContain(row.name);
        expect(label).toContain(round.id);
        expect(label).toContain(`${m.cells[i][j]}문항`);
      }),
    );

    fireEvent.mouseEnter(cells[0]);
    expect(screen.getByRole("tooltip").textContent).toBe("개념 A · 2023-1-written · 2문항");
    fireEvent.mouseLeave(cells[0]);
    expect(screen.queryByRole("tooltip")).toBeNull();

    act(() => cells[5].focus());
    expect(screen.getByRole("tooltip").textContent).toBe("개념 B · 2023-2-written · 1문항");
  });
});

// 화면에 표시된 값을 집계 코어 결과와 비교한다.
const shown = {
  ranking: () => screen.getAllByTestId("rank-row").map((r) => [r.dataset.concept, r.dataset.count, r.dataset.rounds].join(":")),
  heatmap: () => screen.queryAllByTestId("heat-cell").map((c) => c.getAttribute("aria-label")),
  trend: () => screen.queryAllByTestId("trend-round").map((r) => `${r.dataset.round}:${r.dataset.total}`),
};
const expected = {
  ranking: (f: Filter) => conceptFrequency(fixture, f).map((r) => `${r.id}:${r.count}:${r.rounds}`),
  heatmap: (f: Filter) => {
    const m = conceptRoundMatrix(fixture, f);
    return m.rows.flatMap((row, i) => m.rounds.map((round, j) => `${row.name}, ${round.id}, ${m.cells[i][j]}문항`));
  },
  trend: (f: Filter) => typeDistribution(fixture, f).map((d) => `${d.round.id}:${d.total}`),
};

const filterChanges: [string, string, Filter][] = [
  ["트랙", "practical", { ...ALL, track: "practical" }],
  ["과목", "t", { ...ALL, subject: "t" }],
  ["신뢰도", "official", { ...ALL, confidence: "official" }],
  ["기간 시작", "2023-2", { ...ALL, period: { from: { year: 2023, session: 2 }, to: { year: 2024, session: 1 } } }],
];

describe("AC-TREND-010 filters re-render every view", () => {
  for (const view of ["ranking", "heatmap", "trend"] as const) {
    it.each(filterChanges)(`${view}: %s → %s`, (label, value, f) => {
      renderAt(`#/${view}`);
      expect(shown[view]()).toEqual(expected[view](ALL));
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
      expect(shown[view]()).toEqual(expected[view](f));
    });
  }

  it("ranking sort column reorders rows", () => {
    renderAt("#/ranking");
    const ids = () => screen.getAllByTestId("rank-row").map((r) => r.dataset.concept);
    const freq = conceptFrequency(fixture, ALL);
    fireEvent.click(screen.getByRole("button", { name: "등장 회차 수" }));
    expect(ids()).toEqual(rank(freq, "rounds").map((r) => r.id));
    fireEvent.click(screen.getByRole("button", { name: "개념" }));
    expect(ids()).toEqual(rank(freq, "name").map((r) => r.id));
    fireEvent.click(screen.getByRole("button", { name: "문항 수" }));
    expect(ids()).toEqual(rank(freq, "count").map((r) => r.id));
  });

  it("filter state survives navigation between views without reload", () => {
    renderAt("#/ranking");
    fireEvent.change(screen.getByLabelText("과목"), { target: { value: "t" } });
    act(() => {
      window.location.hash = "#/trend";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(shown.trend()).toEqual(expected.trend({ ...ALL, subject: "t" }));
  });
});

describe("AC-TREND-011 round trend groups", () => {
  it("shows per-round type distribution in separate written and practical groups", () => {
    renderAt("#/trend");
    const w = within(screen.getByTestId("trend-group-written")).getAllByTestId("trend-round").map((r) => r.dataset.round);
    const p = within(screen.getByTestId("trend-group-practical")).getAllByTestId("trend-round").map((r) => r.dataset.round);
    expect(w).toEqual(["2023-1-written", "2023-2-written"]);
    expect(p).toEqual(["2023-2-practical", "2024-1-practical"]);
    expect(screen.getAllByTestId("trend-round")[0].textContent).toContain("term 1 · concept 1 (총 2)");
  });
});

describe("AC-TREND-012 disclaimer, sources, analysis note", () => {
  it.each(["#/ranking", "#/heatmap", "#/trend"])("%s shows the exact disclaimer and analysis note", (route) => {
    renderAt(route);
    expect(screen.getByTestId("data-disclaimer").textContent).toBe(DISCLAIMER);
    expect(screen.getByText(ANALYSIS_NOTE)).toBeTruthy();
  });

  it("sources page lists each distinct label once and shows the analysis note", () => {
    renderAt("#/sources");
    const labels = screen.getAllByTestId("source-item").map((li) => li.textContent);
    expect(labels).toEqual(["fixture-src", "출처 1", "출처 2"]);
    expect(screen.getByText(ANALYSIS_NOTE)).toBeTruthy();
  });

  it("navigation uses hash links (AC-TREND-013)", () => {
    renderAt("#/ranking");
    expect(screen.getByRole("link", { name: "출처" }).getAttribute("href")).toBe("#/sources");
  });

  it("unknown route falls back to ranking", () => {
    renderAt("#/nope");
    expect(screen.getAllByTestId("rank-row").length).toBeGreaterThan(0);
  });
});
