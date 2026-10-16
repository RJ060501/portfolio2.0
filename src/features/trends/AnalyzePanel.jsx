'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from './api';

/** Analyze a URL or pasted article using our custom POST /api/analyze endpoint. */
export default function AnalyzePanel({ initialUrl, profile, aiEnabled }) {
  const [inputType, setInputType] = useState('url');
  const [url, setUrl] = useState(initialUrl || '');
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [useAi, setUseAi] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!initialUrl) return;
    setUrl(initialUrl);
    setInputType('url');
    setResult(null);
  }, [initialUrl]);

  async function analyze(event) {
    event.preventDefault();
    setError('');
    setResult(null);
    setBusy(true);

    const input = inputType === 'url' ? { url } : { title, text };

    try {
      const payload = await apiRequest('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, profile, ai: useAi && aiEnabled }),
      });
      setResult(payload);
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-label="Analyze a technology article">
      <form className="trend-analyze-form" onSubmit={analyze}>
        <fieldset className="trends-choice">
          <legend>Article input</legend>
          <label>
            <input
              type="radio"
              name="source"
              checked={inputType === 'url'}
              onChange={() => setInputType('url')}
            />
            Article URL
          </label>
          <label>
            <input
              type="radio"
              name="source"
              checked={inputType === 'text'}
              onChange={() => setInputType('text')}
            />
            Paste article text
          </label>
        </fieldset>

        {inputType === 'url' ? (
          <label htmlFor="analyze-url">
            Public HTTPS article URL
            <input
              id="analyze-url"
              type="url"
              required
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com/technology-article"
            />
          </label>
        ) : (
          <>
            <label htmlFor="analyze-title">
              Article title (optional)
              <input
                id="analyze-title"
                value={title}
                maxLength={200}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Title of article"
              />
            </label>
            <label htmlFor="analyze-text">
              Article text (100-30,000 characters)
              <textarea
                id="analyze-text"
                required
                minLength={100}
                maxLength={30000}
                rows={7}
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Paste a technology article here..."
              />
            </label>
          </>
        )}

        <label className="trends-ai-choice">
          <input
            type="checkbox"
            checked={useAi && aiEnabled}
            disabled={!aiEnabled}
            onChange={(event) => setUseAi(event.target.checked)}
          />
          Add AI enrichment with Ollama {aiEnabled ? '(available)' : '(not configured)'}
        </label>

        <p className="trend-muted">
          Rule-based technology detection works without AI. Some websites block automatic
          extraction; paste the article text in those cases. Submitted article text is not saved.
        </p>
        <button className="button primary" type="submit" disabled={busy}>
          {busy ? 'Analyzing...' : 'Analyze technologies →'}
        </button>
      </form>

      {error && <p className="trendsnotice" role="alert">{error}</p>}
      {result && <AnalysisResult result={result} />}
    </section>
  );
}

function AnalysisResult({ result }) {
  const { data, meta } = result;

  return (
    <div className="trend-analysis" aria-live="polite">
      <div className="trendresulthead">
        <strong>Analysis · {data.wordCount} words</strong>
        <span>{meta.analysisMethod}</span>
      </div>

      <h4>{data.title}</h4>
      <p className="trend-muted">
        {data.technologies.length} recognized technologies ·{' '}
        {data.categories.join(', ') || 'No known categories detected'}
      </p>

      {data.technologies.length === 0 && (
        <p className="trendsnotice">
          No known technology terms were detected. An unfamiliar concept might still be present;
          optional AI analysis can suggest candidates.
        </p>
      )}

      <div className="trend-tech-list">
        {data.technologies.map((term) => (
          <article className="trend-tech" key={term.name}>
            <div>
              <strong>{term.name}</strong>
              <span>
                {term.category} · {term.mentions} mention{term.mentions === 1 ? '' : 's'}
              </span>
            </div>
            <p>{term.whyLearn}</p>
            {term.evidence?.[0] && <blockquote>{term.evidence[0]}</blockquote>}
          </article>
        ))}
      </div>

      {data.ai.status === 'ready' && (
        <section className="trend-ai-output">
          <h4>Ollama analysis (verify independently)</h4>
          <p>{data.ai.summary}</p>
          {data.ai.concepts.length > 0 && (
            <>
              <h5>Emerging concept candidates</h5>
              <ul>
                {data.ai.concepts.map((concept) => (
                  <li key={concept.name}>
                    <strong>{concept.name}:</strong> “{concept.evidence}”
                  </li>
                ))}
              </ul>
            </>
          )}
          {data.ai.learningAdvice && (
            <p><strong>Learning context:</strong> {data.ai.learningAdvice}</p>
          )}
          <p className="trend-muted">{data.ai.warning}</p>
        </section>
      )}

      {['disabled', 'unavailable'].includes(data.ai.status) && (
        <p className="trendsnotice">AI: {data.ai.message}</p>
      )}

      {data.url && (
        <a href={data.url} target="_blank" rel="noopener noreferrer" className="textbutton">
          Read original article &nearr;
        </a>
      )}
    </div>
  );
}
