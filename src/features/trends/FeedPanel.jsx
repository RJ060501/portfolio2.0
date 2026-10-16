'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from './api';
import { TOPIC_OPTIONS } from './config';

/** Live discovery: reads the backend's existing GET /api/trends endpoint. */
export default function FeedPanel({ onAnalyze }) {
  const [topic, setTopic] = useState('all');
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({ topic, query, limit: '20' });

    setBusy(true);
    setError('');

    apiRequest(`/api/trends?${params}`, { timeout: 14_000 })
      .then((payload) => {
        if (active) setResult(payload);
      })
      .catch((reason) => {
        if (!active) return;
        setError(reason.message);
        setResult(null);
      })
      .finally(() => {
        if (active) setBusy(false);
      });

    return () => {
      active = false;
    };
  }, [topic, query, reload]);

  function search(event) {
    event.preventDefault();
    setQuery(draft.trim());
  }

  return (
    <section aria-label="Live technology news">
      <form className="trendssearch" onSubmit={search}>
        <label htmlFor="trend-query">Optional keyword search</label>
        <div>
          <input
            id="trend-query"
            value={draft}
            maxLength={100}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Leave blank to discover recent articles"
          />
          <button className="button primary" type="submit">
            Search feed &rarr;
          </button>
        </div>
      </form>

      <div className="trendtopics" role="group" aria-label="Technology categories">
        {TOPIC_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className={topic === value ? 'active' : ''}
            aria-pressed={topic === value}
            onClick={() => setTopic(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="trendsmeta">
        <code>GET /api/trends</code>
        <button type="button" className="textbutton" onClick={() => setReload((n) => n + 1)}>
          Refresh &orarr;
        </button>
      </div>

      {busy && <p className="trendsnotice" role="status">Retrieving live articles...</p>}
      {error && <p className="trendsnotice" role="alert">Unable to load articles: {error}</p>}
      {result?.meta?.stale && (
        <p className="trendsnotice">Sources are temporarily unavailable. Showing cached results.</p>
      )}
      {result?.meta?.unavailableSources?.length > 0 && (
        <p className="trendsnotice">
          Partial data: {result.meta.unavailableSources.join(', ')} unavailable.
        </p>
      )}

      {result && !busy && (
        <div className="trendresults" aria-live="polite">
          <div className="trendresulthead">
            <strong>{result.data.length} articles from real sources</strong>
            <span>
              {result.meta.fetchedAt
                ? `Updated ${new Date(result.meta.fetchedAt).toLocaleString()}`
                : ''}
            </span>
          </div>

          {result.data.length === 0 && (
            <p className="trendsnotice">No matches. Try another topic or clear the search.</p>
          )}

          {result.data.map((article) => (
            <article className="trenditem" key={article.id}>
              <div className="trenditemtop">
                <span>{article.source}</span>
                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
              </div>
              <h4>
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  {article.title} &nearr;
                </a>
              </h4>
              {article.description && <p>{article.description}</p>}
              <button
                className="textbutton trend-analyze-link"
                type="button"
                onClick={() => onAnalyze(article.url)}
              >
                Analyze this article &rarr;
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
