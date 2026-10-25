import { describe, it, expect } from "vitest";
import { fixture } from "./fixtures/aggregation";
import { subjectOptions, conceptOptions, buildSnippet, checkSnippet, type SnippetForm } from "../src/core/snippet";

const form = (over: Partial<SnippetForm> = {}): SnippetForm => ({
  round: "2023-2-practical", number: 3, subject: "t", concepts: ["e"], type: "code", confidence: "reconstructed",
  sourceLabel: "복원본", sourceUrl: "", note: "", ...over,
});

describe("snippet helper options (REQ-TREND2-007)", () => {
  it("offers only subjects whose tracks include the round's track", () => {
    expect(subjectOptions(fixture, "2023-1-written").map((s) => s.id)).toEqual(["s"]);
    expect(subjectOptions(fixture, "2023-2-practical").map((s) => s.id)).toEqual(["s", "t"]);
    expect(subjectOptions(fixture, "no-such-round")).toEqual([]);
  });

  it("offers only non-deprecated concepts of the chosen subject", () => {
    expect(conceptOptions(fixture, "s").map((c) => c.id)).toEqual(["a", "b", "c"]);
    expect(conceptOptions(fixture, "t").map((c) => c.id)).toEqual(["e"]);
    expect(conceptOptions(fixture, "nope")).toEqual([]);
  });
});

describe("buildSnippet / checkSnippet", () => {
  it("builds a question record whose id follows <round>-q<number> and passes the question schema", () => {
    const q = buildSnippet(form());
    expect(q).toEqual({
      id: "2023-2-practical-q3", round: "2023-2-practical", number: 3, subject: "t", concepts: ["e"],
      type: "code", confidence: "reconstructed", sources: [{ label: "복원본" }],
    });
    expect(checkSnippet(q)).toEqual([]);
  });

  it("includes trimmed url and note only when filled", () => {
    const q = buildSnippet(form({ sourceUrl: " https://example.com/a ", note: " 메모 " }));
    expect(q.sources).toEqual([{ label: "복원본", url: "https://example.com/a" }]);
    expect(q.note).toBe("메모");
    expect(checkSnippet(q)).toEqual([]);
  });

  it.each([
    ["empty source label", form({ sourceLabel: "  " })],
    ["no concepts", form({ concepts: [] })],
    ["javascript: url", form({ sourceUrl: "javascript:alert(1)" })],
    ["number 0", form({ number: 0 })],
    ["201-char note", form({ note: "가".repeat(201) })],
  ])("reports schema errors for %s", (_n, f) => {
    expect(checkSnippet(buildSnippet(f)).length).toBeGreaterThan(0);
  });
});
