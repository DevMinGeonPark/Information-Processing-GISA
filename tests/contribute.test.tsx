import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup, within, act } from "@testing-library/react";
import { fixture } from "./fixtures/aggregation";
import { App } from "../src/App";
import { Contribute } from "../src/views/Contribute";
import { checkSnippet } from "../src/core/snippet";

const CONTRIBUTING_URL = "https://github.com/DevMinGeonPark/Information-Processing-GISA/blob/main/CONTRIBUTING.md";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.location.hash = "";
});

const optionValues = (label: string) =>
  within(screen.getByLabelText(label)).getAllByRole("option").map((o) => (o as HTMLOptionElement).value);

function fillValid(source = "복원본 모음") {
  fireEvent.change(screen.getByLabelText("회차"), { target: { value: "2023-2-practical" } });
  fireEvent.change(screen.getByLabelText("문항 번호"), { target: { value: "4" } });
  fireEvent.change(screen.getByLabelText("과목"), { target: { value: "s" } });
  fireEvent.click(screen.getByLabelText("개념 B"));
  fireEvent.change(screen.getByLabelText("유형"), { target: { value: "sql" } });
  fireEvent.change(screen.getByLabelText("신뢰도"), { target: { value: "reconstructed" } });
  fireEvent.change(screen.getByLabelText("출처 이름"), { target: { value: source } });
}

describe("AC-TREND2-006 contribution entry point on every page", () => {
  it.each(["#/ranking", "#/heatmap", "#/trend", "#/sources", "#/contribute"])("%s links to CONTRIBUTING.md", (route) => {
    window.location.hash = route;
    render(<App data={fixture} />);
    expect(screen.getByRole("link", { name: "데이터 기여하기" }).getAttribute("href")).toBe(CONTRIBUTING_URL);
  });

  it("the helper route renders the snippet helper", () => {
    window.location.hash = "#/contribute";
    render(<App data={fixture} />);
    expect(screen.getByRole("heading", { name: /기여 도우미/ })).toBeTruthy();
  });
});

describe("AC-TREND2-007 snippet helper", () => {
  it("valid input shows schema-valid JSON and enables copy; clearing the source disables it", () => {
    render(<Contribute data={fixture} />);
    fillValid();
    const json = JSON.parse(screen.getByTestId("snippet").textContent!);
    expect(json).toEqual({
      id: "2023-2-practical-q4", round: "2023-2-practical", number: 4, subject: "s", concepts: ["b"],
      type: "sql", confidence: "reconstructed", sources: [{ label: "복원본 모음" }],
    });
    expect(checkSnippet(json)).toEqual([]);
    expect(screen.queryByRole("alert")).toBeNull();
    expect((screen.getByRole("button", { name: "복사" }) as HTMLButtonElement).disabled).toBe(false);

    fireEvent.change(screen.getByLabelText("출처 이름"), { target: { value: "" } });
    expect(screen.getByRole("alert").textContent).toMatch(/sources/);
    expect((screen.getByRole("button", { name: "복사" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("subject options follow the round's track and concept options exclude deprecated ones", () => {
    render(<Contribute data={fixture} />);
    fireEvent.change(screen.getByLabelText("회차"), { target: { value: "2023-1-written" } });
    expect(optionValues("과목")).toEqual(["s"]);
    fireEvent.change(screen.getByLabelText("회차"), { target: { value: "2024-1-practical" } });
    expect(optionValues("과목")).toEqual(["s", "t"]);

    fireEvent.change(screen.getByLabelText("과목"), { target: { value: "s" } });
    const concepts = within(screen.getByRole("group", { name: "개념" })).getAllByRole("checkbox").map((c) => c.getAttribute("value"));
    expect(concepts).toEqual(["a", "b", "c"]);
    fireEvent.change(screen.getByLabelText("과목"), { target: { value: "t" } });
    expect(within(screen.getByRole("group", { name: "개념" })).getAllByRole("checkbox").map((c) => c.getAttribute("value"))).toEqual(["e"]);
  });

  it("switching to a round whose track drops the subject resets subject and concepts", () => {
    render(<Contribute data={fixture} />);
    fireEvent.change(screen.getByLabelText("회차"), { target: { value: "2024-1-practical" } });
    fireEvent.change(screen.getByLabelText("과목"), { target: { value: "t" } });
    fireEvent.click(screen.getByLabelText("개념 E"));
    fireEvent.change(screen.getByLabelText("회차"), { target: { value: "2023-1-written" } });
    expect((screen.getByLabelText("과목") as HTMLSelectElement).value).toBe("s");
    expect(JSON.parse(screen.getByTestId("snippet").textContent!).concepts).toEqual([]);
  });
});

describe("AC-TREND2-008 no network request carries form input", () => {
  it("fetch / XMLHttpRequest / sendBeacon never see the marker", async () => {
    const MARKER = "MARKER-7f3a9c";
    const seen: string[] = [];
    const record = (...args: unknown[]) => { seen.push(args.map((a) => String(a)).join(" ")); };
    const fetchSpy = vi.fn((...a: unknown[]) => { record(...a); return Promise.resolve(new Response("")); });
    vi.stubGlobal("fetch", fetchSpy);
    const open = vi.spyOn(XMLHttpRequest.prototype, "open").mockImplementation(function (...a: unknown[]) { record(...a); });
    const send = vi.spyOn(XMLHttpRequest.prototype, "send").mockImplementation(function (...a: unknown[]) { record(...a); });
    const beacon = vi.fn((...a: unknown[]) => { record(...a); return true; });
    Object.defineProperty(navigator, "sendBeacon", { value: beacon, configurable: true });
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });

    render(<Contribute data={fixture} />);
    fillValid(MARKER);
    expect(screen.getByTestId("snippet").textContent).toContain(MARKER);
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "복사" })); });

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining(MARKER));
    expect(seen.filter((s) => s.includes(MARKER))).toEqual([]);
    expect(fetchSpy.mock.calls.length + open.mock.calls.length + send.mock.calls.length + beacon.mock.calls.length).toBe(0);
    vi.unstubAllGlobals();
  });
});
