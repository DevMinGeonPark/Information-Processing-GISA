// 스니펫 도우미의 순수 로직 (SPEC-TREND-002 REQ-TREND2-007).
// 스키마는 사본을 두지 않고 data/schema 를 그대로 번들에 넣어 브라우저에서 검증한다.
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import questionsSchema from "../../data/schema/questions.schema.json";
import type { Concept, Confidence, Dataset, Question, Subject } from "./types";

export const CONTRIBUTING_URL = "https://github.com/DevMinGeonPark/Information-Processing-GISA/blob/main/CONTRIBUTING.md";

export interface SnippetForm {
  round: string;
  number: number;
  subject: string;
  concepts: string[];
  type: string;
  confidence: Confidence;
  sourceLabel: string;
  sourceUrl: string;
  note: string;
}

export function subjectOptions(data: Dataset, roundId: string): Subject[] {
  const round = data.rounds.find((r) => r.id === roundId);
  return round ? data.taxonomy.filter((s) => s.tracks.includes(round.track)) : [];
}

export function conceptOptions(data: Dataset, subjectId: string): Concept[] {
  const subject = data.taxonomy.find((s) => s.id === subjectId);
  return subject ? subject.topics.flatMap((t) => t.concepts).filter((c) => !c.deprecated) : [];
}

export function buildSnippet(f: SnippetForm): Question {
  const url = f.sourceUrl.trim();
  const note = f.note.trim();
  return {
    id: `${f.round}-q${f.number}`,
    round: f.round,
    number: f.number,
    subject: f.subject,
    concepts: f.concepts,
    type: f.type,
    confidence: f.confidence,
    sources: [url ? { label: f.sourceLabel.trim(), url } : { label: f.sourceLabel.trim() }],
    ...(note ? { note } : {}),
  };
}

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(questionsSchema);

// 스키마는 회차 파일(배열) 단위라 한 건을 배열로 감싸 검증하고, 경로의 "/0" 은 떼어 보여 준다.
export function checkSnippet(q: Question): string[] {
  if (validate([q])) return [];
  return (validate.errors ?? []).map((e) => `${e.instancePath.replace(/^\/0/, "") || "/"} ${e.message}`);
}
