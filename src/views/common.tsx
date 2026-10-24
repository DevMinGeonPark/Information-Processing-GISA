import type { Dataset, Filter, YearSession } from "../core/types";

export const ANALYSIS_NOTE = "실기 과목은 분석용 분류입니다.";

export interface ViewProps {
  data: Dataset;
  filter: Filter;
}

export function Disclaimer() {
  return (
    <p className="disclaimer" data-testid="data-disclaimer">
      이 데이터는 수험생이 복원한 기출을 바탕으로 정리한 것으로, 공식 자료가 아닙니다.
    </p>
  );
}

const key = (p: YearSession) => `${p.year}-${p.session}`;

export function periodOptions(data: Dataset): YearSession[] {
  const seen = new Map<string, YearSession>();
  for (const r of data.rounds) seen.set(key(r), { year: r.year, session: r.session });
  return [...seen.values()].sort((a, b) => a.year - b.year || a.session - b.session);
}

export function FilterBar({ data, filter, onChange }: ViewProps & { onChange: (f: Filter) => void }) {
  const periods = periodOptions(data);
  const from = filter.period?.from ?? periods[0];
  const to = filter.period?.to ?? periods[periods.length - 1];
  const pick = (v: string) => periods.find((p) => key(p) === v)!;
  const setPeriod = (f: YearSession, t: YearSession) => onChange({ ...filter, period: { from: f, to: t } });

  return (
    <form className="filters" onSubmit={(e) => e.preventDefault()}>
      <label>
        트랙
        <select value={filter.track} onChange={(e) => onChange({ ...filter, track: e.target.value as Filter["track"] })}>
          <option value="all">전체</option>
          <option value="written">필기</option>
          <option value="practical">실기</option>
        </select>
      </label>
      <label>
        과목
        <select value={filter.subject ?? ""} onChange={(e) => onChange({ ...filter, subject: e.target.value || null })}>
          <option value="">전체</option>
          {data.taxonomy.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <small className="hint">{ANALYSIS_NOTE}</small>
      {periods.length > 0 && (
        <>
          <label>
            기간 시작
            <select value={key(from)} onChange={(e) => setPeriod(pick(e.target.value), to)}>
              {periods.map((p) => (
                <option key={key(p)} value={key(p)}>{`${p.year}년 ${p.session}회`}</option>
              ))}
            </select>
          </label>
          <label>
            기간 끝
            <select value={key(to)} onChange={(e) => setPeriod(from, pick(e.target.value))}>
              {periods.map((p) => (
                <option key={key(p)} value={key(p)}>{`${p.year}년 ${p.session}회`}</option>
              ))}
            </select>
          </label>
        </>
      )}
      <label>
        신뢰도
        <select value={filter.confidence} onChange={(e) => onChange({ ...filter, confidence: e.target.value as Filter["confidence"] })}>
          <option value="all">전체</option>
          <option value="official">공식</option>
          <option value="reconstructed">복원</option>
        </select>
      </label>
    </form>
  );
}
