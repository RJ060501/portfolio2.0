import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { detectTechnologies, PROFILES } from './taxonomy.js';

const iso = (time) => new Date(time).toISOString();
const cutoff = (days, time) => iso(time - days * 86400000);
const hash = (url) => createHash('sha256').update(url).digest('hex');

export function createStore(path = process.env.DB_PATH || './data/trends.sqlite', now = Date.now) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  if (path !== ':memory:') db.exec('PRAGMA journal_mode = WAL;');
  db.exec(`
    CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY, url TEXT NOT NULL UNIQUE, title TEXT NOT NULL,
      source TEXT NOT NULL, published_at TEXT, first_seen TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS mentions (
      article_id TEXT NOT NULL, term TEXT NOT NULL, category TEXT NOT NULL,
      PRIMARY KEY (article_id, term),
      FOREIGN KEY (article_id) REFERENCES articles(id)
    );
    CREATE INDEX IF NOT EXISTS ix_articles_seen ON articles(first_seen);
    CREATE INDEX IF NOT EXISTS ix_mentions_term ON mentions(term);
  `);
  const insertStarted = db.prepare('INSERT OR IGNORE INTO metadata(key, value) VALUES (?, ?)');
  insertStarted.run('tracking_since', iso(now()));
  const insertArticle = db.prepare(`INSERT OR IGNORE INTO articles(id, url, title, source, published_at, first_seen) VALUES (?, ?, ?, ?, ?, ?)`);
  const insertMention = db.prepare('INSERT OR IGNORE INTO mentions(article_id, term, category) VALUES (?, ?, ?)');
  const count = db.prepare('SELECT count(*) AS total FROM articles');
  const started = db.prepare("SELECT value FROM metadata WHERE key = 'tracking_since'");

  function ingest(articles) {
    let added = 0;
    const timestamp = iso(now());
    db.exec('BEGIN');
    try {
      for (const article of articles) {
        const url = article.url;
        if (typeof url !== 'string' || !url.startsWith('https://')) continue;
        const id = hash(url);
        const result = insertArticle.run(id, url, String(article.title).slice(0, 200), String(article.source).slice(0, 80), article.publishedAt || null, timestamp);
        if (!result.changes) continue;
        added++;
        for (const term of detectTechnologies(`${article.title} ${article.description || ''}`)) {
          insertMention.run(id, term.name, term.category);
        }
      }
      db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); throw error; }
    return { added, total: count.get().total };
  }

  function insights({ days = 30, profile = 'cloud', limit = 10 } = {}) {
    const anchor = now();
    const since = cutoff(days, anchor);
    const before = cutoff(days * 2, anchor);
    const startTime = started.get().value;
    const complete = startTime <= before;
    const recentRows = db.prepare(`
      SELECT m.term AS name, m.category AS category, COUNT(*) AS articles
      FROM mentions m JOIN articles a ON a.id = m.article_id
      WHERE a.first_seen >= ? GROUP BY m.term, m.category ORDER BY articles DESC
    `).all(since);
    const previousRows = db.prepare(`
      SELECT m.term AS name, COUNT(*) AS articles FROM mentions m
      JOIN articles a ON a.id = m.article_id
      WHERE a.first_seen >= ? AND a.first_seen < ? GROUP BY m.term
    `).all(before, since);
    const previous = new Map(previousRows.map((row) => [row.name, row.articles]));
    const weights = PROFILES[profile]?.weights || PROFILES.cloud.weights;
    const ranked = recentRows.map((row) => {
      const prior = previous.get(row.name) || 0;
      const growthPercent = complete && prior > 0 ? Math.round((row.articles - prior) / prior * 100) : null;
      const growthPoints = growthPercent === null ? 0 : Math.max(-15, Math.min(20, growthPercent / 10));
      const relevance = (weights[row.category] || 1) * 20;
      return {
        ...row, previousArticles: complete ? prior : null, growthPercent,
        score: Math.round(relevance + Math.min(row.articles * 3, 30) + growthPoints),
        whyLearn: `${row.name} appeared in ${row.articles} distinct collected article${row.articles === 1 ? '' : 's'} during this window. Its ${row.category} topic aligns with ${PROFILES[profile]?.label || PROFILES.cloud.label} interests; read the sources before prioritizing it.`,
      };
    }).sort((a, b) => b.score - a.score || b.articles - a.articles);
    return {
      data: ranked.slice(0, limit),
      meta: { profile, days, trackingSince: startTime, totalCollected: count.get().total, historicalComparisonAvailable: complete, note: complete ? 'Growth compares distinct first-seen articles in equal-length windows.' : 'Not enough historical collection time for a reliable prior-period growth comparison. No growth values are fabricated.',
        method: 'Headlines and descriptions from collected sources; scores are heuristic learning relevance, not industry adoption statistics.' },
    };
  }

  function history({ days = 30, technology = '' } = {}) {
    const since = cutoff(days, now());
    const args = technology ? [since, technology] : [since];
    const rows = db.prepare(`SELECT substr(a.first_seen,1,10) AS day, COUNT(DISTINCT a.id) AS articles
      FROM articles a ${technology ? 'JOIN mentions m ON m.article_id = a.id' : ''}
      WHERE a.first_seen >= ? ${technology ? 'AND m.term = ?' : ''}
      GROUP BY day ORDER BY day`).all(...args);
    return { data: rows, meta: { technology: technology || 'all', days, trackingSince: started.get().value, measurement: 'Distinct articles first seen by this collector each UTC day. Missing days mean no recorded observations, not zero industry activity.' } };
  }

  return { ingest, insights, history, close: () => db.close() };
}
