'use client';

import { useCallback, useEffect, useState } from 'react';
import AnalyzePanel from './AnalyzePanel';
import FeedPanel from './FeedPanel';
import HistoryPanel from './HistoryPanel';
import { apiRequest } from './api';
import { DEMO_TABS, LEARNING_PROFILES } from './config';
import './trends-intelligence.css';

/**
 * Portfolio entry point for the Technology Intelligence demo.
 * Existing ProjectDemo.jsx still imports this component: no router changes needed.
 */
export default function TrendsDemo() {
  const [activeTab, setActiveTab] = useState('analyze');
  const [profile, setProfile] = useState('cloud');
  const [selectedArticleUrl, setSelectedArticleUrl] = useState('');
  const [capabilities, setCapabilities] = useState({ enabled: false });

  useEffect(() => {
    let active = true;

    apiRequest('/api/capabilities', { timeout: 8_000 })
      .then((result) => {
        if (active) setCapabilities(result);
      })
      .catch(() => {
        // The analysis form can still show a useful connection error.
      });

    return () => {
      active = false;
    };
  }, []);

  const openArticle = useCallback((url) => {
    setSelectedArticleUrl(url);
    setActiveTab('analyze');
  }, []);

  return (
    <div className="demo trendsdemo">
      <div className="demobar">
        <strong>tech-trends / intelligence API</strong>
        <span className="demobadge">LIVE DATA · SQLITE HISTORY · OPTIONAL OLLAMA</span>
      </div>

      <div className="trendsintro">
        <div>
          <h3>Read the news. Understand the technology.</h3>
          <p>
            Discover recent articles, extract known technologies, optionally identify
            unfamiliar concepts with AI, and track real observations over time.
            No fictional news records.
          </p>
        </div>
      </div>

      <div className="trend-global-controls">
        <label htmlFor="trends-profile">
          Learning profile
          <select
            id="trends-profile"
            value={profile}
            onChange={(event) => setProfile(event.target.value)}
          >
            {LEARNING_PROFILES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="trendsmodes trend-tabs" role="tablist" aria-label="Tech intelligence features">
        {DEMO_TABS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={activeTab === value}
            className={activeTab === value ? 'active' : ''}
            onClick={() => setActiveTab(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'analyze' && (
        <AnalyzePanel
          profile={profile}
          initialUrl={selectedArticleUrl}
          aiEnabled={capabilities.enabled}
        />
      )}
      {activeTab === 'discover' && <FeedPanel onAnalyze={openArticle} />}
      {activeTab === 'history' && <HistoryPanel profile={profile} />}
    </div>
  );
}
