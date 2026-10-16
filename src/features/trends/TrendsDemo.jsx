'use client';

import { useEffect, useMemo, useState } from 'react';
import { sampleArticles } from './sample';

const TOPICS = [
  ['all', 'All topics'],
  ['ai', 'AI'],
  ['cloud', 'Cloud'],
  ['security', 'Security'],
  ['development', 'Development'],
];
const BASE_URL = process.env.NEXT_PUBLIC_TRENDS_API_BASE || '';

export default function TrendsDemo() {
  const [mode, setMode] = useState('sample');
  const [topic, setTopic] = useState('all');
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const [feed, setFeed] = useState([]);
  const [meta, setMeta] = useState(null);
  const [state, setState] = useState('idle');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (mode !== 'live') return;
    const controller = new AbortController();
    let active = true;
    const timer = setTimeout(() => controller.abort(), 12000);
    const params = new URLSearchParams({ topic, query, limit: '20' });
    setState('loading');
    setMeta(null);
    fetch(`${BASE_URL}/api/trends?${params}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Service returned HTTP ${response.status}`);
        const payload = await response.json();
        if (!active) return;
        if (!Array.isArray(payload?.data)) throw new Error('Unexpected API response');
        setFeed(payload.data);
        setMeta(payload.meta);
        setState('ready');
      })
      .catch((error) => {
        if (!active) return;
        if (!controller.signal.aborted) setState(`error:${error.message}`);
        else setState('error:Request timed out');
      })
      .finally(() => clearTimeout(timer));
    return () => {
      active = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [mode, topic, query, reload]);

  const preview = useMemo(
    () =>
      sampleArticles.filter((article) => {
        const text = `${article.title} ${article.description}`.toLowerCase();
        return (topic === 'all' || article.topic === topic) && text.includes(query.toLowerCase());
      }),
    [topic, query],
  );
  const entries = mode === 'sample' ? preview : feed;
  const request = `/api/trends?${new URLSearchParams({ topic, query, limit: '20' })}`;

  function changeMode(next) {
    setMode(next);
    setFeed([]);
    setState('idle');
  }

  return (
    <div className="demo trendsdemo">
      <div className="demobar">
        <strong>tech-trends / discovery</strong>
        <span className="demobadge">
          {mode === 'live' ? 'LIVE API MODE' : 'FICTIONAL SAMPLE MODE'}
        </span>
      </div>
      <div className="trendsintro">
        <div>
          <h3>Stay curious. Follow the signal.</h3>
          <p>
            Search recent engineering links by topic, source, and publication date. The backend
            handles discovery, normalization, caching, and errors.
          </p>
        </div>
        <div className="trendsmodes" role="group" aria-label="Data source">
          <button
            type="button"
            className={mode === 'sample' ? 'active' : ''}
            aria-pressed={mode === 'sample'}
            onClick={() => changeMode('sample')}
          >
            Sample preview
          </button>
          <button
            type="button"
            className={mode === 'live' ? 'active' : ''}
            aria-pressed={mode === 'live'}
            onClick={() => changeMode('live')}
          >
            Fetch live feed ↗
          </button>
        </div>
      </div>
      <form
        className="trendssearch"
        onSubmit={(event) => {
          event.preventDefault();
          setQuery(draft.trim());
        }}
      >
        <label htmlFor="trends-query">Search the feed</label>
        <div>
          <input
            id="trends-query"
            type="search"
            value={draft}
            maxLength={100}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Try Python, AWS, or security"
          />
          <button className="button primary" type="submit">
            Search →
          </button>
        </div>
      </form>
      <div className="trendtopics" role="group" aria-label="Filter topics">
        {TOPICS.map(([value, text]) => (
          <button
            type="button"
            key={value}
            className={topic === value ? 'active' : ''}
            aria-pressed={topic === value}
            onClick={() => setTopic(value)}
          >
            {text}
          </button>
        ))}
      </div>
      <div className="trendsmeta">
        <code>GET {request}</code>
        <span>
          {mode === 'sample'
            ? 'Preview only · no real articles or network request'
            : state === 'loading'
              ? 'Contacting API…'
              : meta?.fetchedAt
                ? `Fetched ${new Date(meta.fetchedAt).toLocaleString()}`
                : 'Awaiting API'}
        </span>
      </div>
      {mode === 'live' && state === 'loading' && (
        <p className="trendsnotice" role="status">
          Loading the latest available feed…
        </p>
      )}
      {mode === 'live' && state.startsWith('error:') && (
        <div className="trendsnotice" role="alert">
          <strong>Live API unavailable.</strong> {state.slice(6)}. Run the Trends API alongside the
          portfolio or use the sample preview.
          <div className="trendactions">
            <button className="textbutton" onClick={() => setReload((n) => n + 1)}>
              Retry live
            </button>
            <button className="textbutton" onClick={() => changeMode('sample')}>
              View sample data
            </button>
          </div>
        </div>
      )}
      {mode === 'live' && meta?.stale && (
        <p className="trendsnotice">
          Showing cached results: the upstream sources could not be refreshed.
        </p>
      )}
      {mode === 'live' && meta?.unavailableSources?.length > 0 && (
        <p className="trendsnotice">
          Partial feed · unavailable sources: {meta.unavailableSources.join(', ')}
        </p>
      )}
      {(mode === 'sample' || state === 'ready') && (
        <div className="trendresults" aria-live="polite">
          <div className="trendresulthead">
            <strong>
              {entries.length} {mode === 'sample' ? 'illustrative examples' : 'recent results'}
            </strong>
            {mode === 'live' && (
              <button className="textbutton" onClick={() => setReload((n) => n + 1)}>
                Refresh ↻
              </button>
            )}
          </div>
          {entries.length === 0 && (
            <p className="trendsnotice">
              No matching results. Try a broader topic or a different search.
            </p>
          )}
          {entries.map((item) => (
            <article className="trenditem" key={item.id}>
              <div className="trenditemtop">
                <span>{item.source}</span>
                <span>
                  {item.publishedAt
                    ? new Date(item.publishedAt).toLocaleDateString()
                    : 'DEMO RECORD'}
                </span>
              </div>
              <h4>
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.title} ↗
                  </a>
                ) : (
                  item.title
                )}
              </h4>
              {item.description && <p>{item.description}</p>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
