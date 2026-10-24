import type { Dataset } from "../core/types";
import { ANALYSIS_NOTE } from "./common";

export function Sources({ data }: { data: Dataset }) {
  const urls = new Map<string, string | undefined>();
  for (const q of data.questions) for (const s of q.sources) if (!urls.get(s.label)) urls.set(s.label, s.url);
  const labels = [...urls.keys()].sort();

  return (
    <section>
      <h2>출처</h2>
      <p>{ANALYSIS_NOTE}</p>
      <ul>
        {labels.map((l) => {
          const url = urls.get(l);
          return (
            <li key={l} data-testid="source-item">
              {url ? (
                <a href={url} rel="noreferrer">
                  {l}
                </a>
              ) : (
                l
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
