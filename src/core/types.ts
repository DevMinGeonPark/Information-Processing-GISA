// 데이터 계약 타입 (SPEC-TREND-001 §C.1~§C.4). data/schema 의 JSON Schema 와 같은 모양이다.
export type Track = "written" | "practical";
export type Confidence = "official" | "reconstructed";

export interface Round { id: string; year: number; session: number; track: Track }
export interface Concept { id: string; name: string; deprecated?: boolean; replaced_by?: string }
export interface Topic { id: string; name: string; concepts: Concept[] }
export interface Subject { id: string; name: string; tracks: Track[]; topics: Topic[] }
export interface QuestionType { id: string; name: string; criteria: string }
export interface Source { label: string; url?: string }
export interface Question {
  id: string; round: string; number: number; subject: string; concepts: string[];
  type: string; confidence: Confidence; sources: Source[]; note?: string;
}
export interface Dataset { rounds: Round[]; taxonomy: Subject[]; types: QuestionType[]; questions: Question[] }

export interface YearSession { year: number; session: number }
export interface Filter {
  track: Track | "all";
  subject: string | null;
  confidence: Confidence | "all";
  period: { from: YearSession; to: YearSession } | null;
}

export interface ConceptRow { id: string; name: string; subject: string }
export interface Freq extends ConceptRow { count: number; rounds: number }
export type SortKey = "count" | "rounds" | "name";
export interface Matrix { rows: ConceptRow[]; rounds: Round[]; cells: number[][]; max: number }
export interface RoundTypes { round: Round; counts: Record<string, number>; total: number }
