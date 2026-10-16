'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from './api';

/**
 * The chart shows our own collected observations, not global technology adoption.
 * Historical comparisons appear only after enough real collection time has passed.
 */
export default function HistoryPanel({ profile }) {
  const [days, setDays] = useState(30);
  const [technology, setTechnology] = useState('');
  const [insights, setInsights] = useState(null);
  const [history, setHistory] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    const insightParams = new URLSearchParams({ days: String(days), profile });
    const historyParams = new URLSearchParams({
      days: String(days),
      technology,
    });

    Promise.all([
      apiRequest(`/api/insights?${insightParams}`),
      apiRequest(`/api/history?${historyParams}`),
    ])
      .then(([ranked, observations]) => {
        if (!active) return;
        setInsights(ranked);
        setHistory(observations);
      })
      .catch((reason) => {
        if (active) setError(reason.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [days, profile, technology, reload]);

  const observations = history?.data || [];
  const largestCount = Math.max(1, ...observations.map((point) => point.articles));

  return (
    <section aria-label="Historical trends and learning priorities" className="trend-history">
      <div className="trend-history-toolbar">
        <label htmlFor="trends-days">
          Observation window
          <select
            id="trends-days"
            value={days}
            onChange={(event) => setDays(Number(event.target.value))}
          >
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
          </select>
        </label>
        <button className="textbutton" type="button" onClick={() => setReload((n) => n + 1)}>
          Refresh &orarr;
        </button>
      </div>

      {loading && (
        <p className="trendsnotice" role="status">
          Loading collected history...
        </p>
      )}
      {error && (
        <p className="trendsnotice" role="alert">
          Could not retrieve history: {error}
        </p>
      )}

      {insights && !loading && (
        <>
          <p className="trendsnotice">
            {insights.meta.note} {insights.meta.method}
          </p>
          <p className="trend-muted">
            Tracking began {new Date(insights.meta.trackingSince).toLocaleString()} ·{' '}
            {insights.meta.totalCollected} distinct articles stored.
          </p>

          {insights.data.length === 0 && (
            <p className="trendsnotice">
              No technology mentions recorded yet. The collector needs to gather real articles
              first.
            </p>
          )}

          <div className="trend-tech-list">
            {insights.data.map((item) => (
              <button
                type="button"
                key={item.name}
                className={`trend-rank ${technology === item.name ? 'active' : ''}`}
                onClick={() => setTechnology(technology === item.name ? '' : item.name)}
              >
                <span>
                  <strong>{item.name}</strong>
                  <small>
                    {item.category} · {item.articles} articles · relevance {item.score}
                  </small>
                </span>
                <span>
                  {item.growthPercent === null
                    ? 'Growth: awaiting history'
                    : `${item.growthPercent > 0 ? '+' : ''}${item.growthPercent}% vs previous period`}
                </span>
              </button>
            ))}
          </div>

          <h4 className="trend-chart-title">
            Daily article observations · {technology || 'all sources'}
          </h4>
          <div className="trend-history-bars" aria-label="Daily observations bar chart">
            {observations.length ? (
              observations.map((point) => (
                <div
                  className="trend-history-bar"
                  key={point.day}
                  title={`${point.day}: ${point.articles} articles`}
                >
                  <span
                    style={{ height: `${Math.max(6, (point.articles / largestCount) * 100)}%` }}
                  />
                  <small>{point.day.slice(5)}</small>
                </div>
              ))
            ) : (
              <p>No observations for this selection.</p>
            )}
          </div>

          <p className="trend-muted">
            Counts represent collected article mentions, not industry adoption. Click a technology
            above to filter the chart.
          </p>
        </>
      )}
    </section>
  );
}
