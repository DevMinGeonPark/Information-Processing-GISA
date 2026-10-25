import { useState } from "react";
import type { Confidence, Dataset } from "../core/types";
import { buildSnippet, checkSnippet, conceptOptions, subjectOptions, CONTRIBUTING_URL, type SnippetForm } from "../core/snippet";

// 입력값은 화면 안에서만 쓰고 네트워크로 보내지 않는다 (REQ-TREND2-008). 결과는 사용자가 직접 복사한다.
export function Contribute({ data }: { data: Dataset }) {
  const [form, setForm] = useState<SnippetForm>({
    round: data.rounds[0]?.id ?? "",
    number: 1,
    subject: "",
    concepts: [],
    type: data.types[0]?.id ?? "",
    confidence: "reconstructed",
    sourceLabel: "",
    sourceUrl: "",
    note: "",
  });
  const [copied, setCopied] = useState(false);

  // 회차가 바뀌어 고른 과목이 목록에서 빠지면 첫 과목으로, 개념은 그 과목 소속만 남긴다.
  const subjects = subjectOptions(data, form.round);
  const subject = subjects.some((s) => s.id === form.subject) ? form.subject : (subjects[0]?.id ?? "");
  const concepts = conceptOptions(data, subject);
  const chosen = form.concepts.filter((id) => concepts.some((c) => c.id === id));

  const snippet = buildSnippet({ ...form, subject, concepts: chosen });
  const json = JSON.stringify(snippet, null, 2);
  const errors = checkSnippet(snippet);

  const set = (patch: Partial<SnippetForm>) => {
    setCopied(false);
    setForm({ ...form, subject, concepts: chosen, ...patch });
  };
  const toggle = (id: string) => set({ concepts: chosen.includes(id) ? chosen.filter((c) => c !== id) : [...chosen, id] });
  const copy = async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
  };

  return (
    <section className="contribute">
      <h2>기여 도우미</h2>
      <p>
        값을 고르면 <code>data/questions/&lt;회차 id&gt;.json</code> 배열에 넣을 문항 JSON을 만들어 줍니다. 문항 원문은 넣지 마세요.
        작성 규칙은 <a href={CONTRIBUTING_URL}>기여 가이드</a>를 참고하세요.
      </p>
      <form className="filters" onSubmit={(e) => e.preventDefault()}>
        <label>
          회차
          <select value={form.round} onChange={(e) => set({ round: e.target.value })}>
            {data.rounds.map((r) => (
              <option key={r.id} value={r.id}>
                {r.id}
              </option>
            ))}
          </select>
        </label>
        <label>
          문항 번호
          <input type="number" min={1} value={form.number} onChange={(e) => set({ number: Number(e.target.value) })} />
        </label>
        <label>
          과목
          <select value={subject} onChange={(e) => set({ subject: e.target.value, concepts: [] })}>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <fieldset aria-label="개념">
          <legend>개념</legend>
          {concepts.map((c) => (
            <label key={c.id} className="check">
              <input type="checkbox" value={c.id} checked={chosen.includes(c.id)} onChange={() => toggle(c.id)} />
              {c.name}
            </label>
          ))}
        </fieldset>
        <label>
          유형
          <select value={form.type} onChange={(e) => set({ type: e.target.value })}>
            {data.types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          신뢰도
          <select value={form.confidence} onChange={(e) => set({ confidence: e.target.value as Confidence })}>
            <option value="reconstructed">복원</option>
            <option value="official">공식</option>
          </select>
        </label>
        <label>
          출처 이름
          <input value={form.sourceLabel} maxLength={100} onChange={(e) => set({ sourceLabel: e.target.value })} />
        </label>
        <label>
          출처 URL (선택)
          <input type="url" value={form.sourceUrl} placeholder="https://" onChange={(e) => set({ sourceUrl: e.target.value })} />
        </label>
        <label>
          메모 (선택)
          <input value={form.note} maxLength={200} onChange={(e) => set({ note: e.target.value })} />
        </label>
      </form>

      <pre className="snippet" data-testid="snippet">
        {json}
      </pre>
      {errors.length > 0 && (
        <div role="alert" className="snippet-errors">
          <p>스키마 검증 오류가 있어 복사할 수 없습니다.</p>
          <ul>
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      <button type="button" onClick={copy} disabled={errors.length > 0}>
        복사
      </button>
      {copied && <span role="status"> 복사했습니다.</span>}
    </section>
  );
}
