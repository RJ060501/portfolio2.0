'use client';

import { useState } from 'react';
import { sampleArticles } from './data';
export default function ScraperDemo() {
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('All sources');
  const results = sampleArticles.filter(
    (article) =>
      (source === 'All sources' || article.source === source) &&
      [article.title, article.summary, article.topic]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  );
  return (
    <div className="demo">
      <div className="demobar">
        <span>⌕ &nbsp; Article discovery</span>
        <span className="demobadge">LOCAL SAMPLE DATA</span>
      </div>
      <div className="scrapercontrols">
        <div>
          <label htmlFor="query">Search by keyword</label>
          <input
            id="query"
            placeholder="Try cloud, Python, or security…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="source">Source</label>
          <select id="source" value={source} onChange={(event) => setSource(event.target.value)}>
            {['All sources', ...new Set(sampleArticles.map((article) => article.source))].map(
              (article) => (
                <option key={article}>{article}</option>
              ),
            )}
          </select>
        </div>
      </div>
      <p className="searchcount" role="status">
        {results.length} matching sample articles
      </p>
      <div className="sampleresults">
        {results.map((article) => (
          <article key={article.title}>
            <div className="eyebrow">
              {article.source} / {article.topic}
            </div>
            <h3>{article.title}</h3>
            <p>{article.summary}</p>
          </article>
        ))}
        {!results.length && (
          <div className="empty">
            <h3>No matches for “{query}”</h3>
            <p>Try a broader keyword or another source.</p>
            <button
              className="button secondary"
              onClick={() => {
                setQuery('');
                setSource('All sources');
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
