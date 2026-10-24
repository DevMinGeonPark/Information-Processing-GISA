// 데이터셋을 빌드 시 번들에 포함한다 (런타임 요청 없음, REQ-TREND-013).
import rounds from "../data/rounds.json";
import taxonomy from "../data/taxonomy.json";
import types from "../data/question-types.json";
import type { Dataset, Question } from "./core/types";

const files = import.meta.glob<Question[]>("../data/questions/*.json", { eager: true, import: "default" });

// 모양은 scripts/validate.ts 가 CI 에서 보장한다.
export const dataset: Dataset = {
  rounds: rounds as Dataset["rounds"],
  taxonomy: taxonomy as Dataset["taxonomy"],
  types,
  questions: Object.values(files).flat(),
};
