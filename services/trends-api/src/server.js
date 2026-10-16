import http from 'node:http';
import { createTrendsService, filterArticles, TOPICS } from './trends.js';
import { createStore } from './store.js';
import { detectTechnologies, PROFILES, recommend } from './taxonomy.js';
import { fetchArticle, ArticleError } from './extractor.js';
import { enrichWithAI, aiCapabilities } from './ai.js';

const port = Number(process.env.PORT || 8000);
const allowedOrigin = process.env.CORS_ORIGIN || '';

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(JSON.stringify(payload));
}

function applyCors(request, response) {
  response.setHeader('Vary', 'Origin');

  if (allowedOrigin && request.headers.origin === allowedOrigin) {
    response.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  }
}

async function readJsonBody(request) {
  const type = request.headers['content-type'] || '';
  if (!/^application\/json(?:\s*;|\s*$)/i.test(type)) {
    throw new ArticleError('Content-Type must be application/json.', 415);
  }

  const chunks = [];
  let bytes = 0;

  for await (const chunk of request) {
    bytes += chunk.length;
    if (bytes > 45_000) {
      throw new ArticleError('Request body is too large.', 413);
    }
    chunks.push(chunk);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new ArticleError('Invalid JSON request body.', 400);
  }
}

function makeRateLimiter(now) {
  // Process-local rate limit: six analyses per minute per client IP.
  // TRUST_PROXY must only be enabled behind trusted Nginx, which overwrites
  // X-Forwarded-For. Do not expose this API directly to the public internet.
  const clients = new Map();

  return function isLimited(request) {
    const forwarded = request.headers['x-forwarded-for'];
    const trustedProxy = process.env.TRUST_PROXY === 'true';
    const client = trustedProxy && forwarded
      ? String(forwarded).split(',')[0].trim()
      : request.socket.remoteAddress || 'unknown';

    const timestamp = now();
    if (clients.size > 5000) {
      for (const [key, value] of clients) {
        if (value.until <= timestamp) clients.delete(key);
      }
    }

    let quota = clients.get(client);
    if (!quota || quota.until <= timestamp) {
      quota = { count: 0, until: timestamp + 60_000 };
      clients.set(client, quota);
    }
    quota.count += 1;

    return quota.count > 6;
  };
}

/**
 * Create an injectable HTTP handler so tests do not depend on live websites,
 * a running Ollama model, or a disk-backed database.
 */
export function makeHandler(feedService = createTrendsService(), {
  store = createStore(':memory:'),
  articleFetcher = fetchArticle,
  aiAnalyzer = enrichWithAI,
  now = Date.now,
} = {}) {
  const isLimited = makeRateLimiter(now);

  async function handleAnalyze(request, response) {
    if (isLimited(request)) {
      return sendJson(response, 429, {
        error: 'Analysis limit exceeded. Try again in a minute.',
      });
    }

    try {
      const input = await readJsonBody(request);
      const profile = input?.profile || 'cloud';

      if (!Object.hasOwn(PROFILES, profile)) {
        throw new ArticleError('Invalid learning profile.', 400);
      }
      if (typeof input.url === 'string' && typeof input.text === 'string') {
        throw new ArticleError('Supply an article URL or pasted text, not both.', 400);
      }

      let article;
      let method;
      if (typeof input.url === 'string') {
        if (input.url.length > 2048) {
          throw new ArticleError('URL is too long.', 400);
        }
        article = await articleFetcher(input.url);
        method = 'url';
      } else if (typeof input.text === 'string') {
        const text = input.text.trim();
        if (text.length < 100 || text.length > 30_000) {
          throw new ArticleError('Paste between 100 and 30,000 characters of article text.', 400);
        }
        article = {
          title: String(input.title || 'Pasted article').slice(0, 200),
          text,
          wordCount: text.split(/\s+/).length,
        };
        method = 'text';
      } else {
        throw new ArticleError('Provide url or text.', 400);
      }

      const detected = detectTechnologies(`${article.title}\n${article.text}`);
      const technologies = recommend(detected, profile);
      const ai = input.ai === true
        ? await aiAnalyzer(article, { profile })
        : { status: 'not-requested' };

      return sendJson(response, 200, {
        data: {
          title: article.title,
          url: article.url || null,
          wordCount: article.wordCount,
          technologies,
          categories: [...new Set(technologies.map((term) => term.category))],
          ai,
        },
        meta: {
          method,
          profile,
          analysisMethod: 'dictionary + bounded evidence'
            + (ai.status === 'ready' ? ' + Ollama enrichment' : ''),
          persisted: false,
          notice: 'Analyzed article text is not saved. Verify AI conclusions against the source.',
        },
      });
    } catch (error) {
      return sendJson(response, error instanceof ArticleError ? error.status : 502, {
        error: error instanceof ArticleError
          ? error.message
          : 'Unable to analyze this article. Try pasting the text instead.',
      });
    }
  }

  function handleHistory(url, response) {
    const days = Number(url.searchParams.get('days') || 30);
    if (![7, 30, 90].includes(days)) {
      return sendJson(response, 400, { error: 'days must be 7, 30, or 90' });
    }

    if (url.pathname === '/api/insights') {
      const profile = url.searchParams.get('profile') || 'cloud';
      if (!Object.hasOwn(PROFILES, profile)) {
        return sendJson(response, 400, { error: 'Invalid learning profile' });
      }
      return sendJson(response, 200, store.insights({ days, profile }));
    }

    const technology = url.searchParams.get('technology') || '';
    if (technology.length > 70) {
      return sendJson(response, 400, { error: 'Invalid technology name' });
    }
    return sendJson(response, 200, store.history({ days, technology }));
  }

  async function handleFeed(url, response) {
    const topic = url.searchParams.get('topic') || 'all';
    const query = (url.searchParams.get('query') || '').trim();
    const limit = url.searchParams.get('limit') || '20';

    const invalid = !Object.hasOwn(TOPICS, topic)
      || query.length > 100
      || !/^\d+$/.test(limit)
      || Number(limit) < 1
      || Number(limit) > 50;

    if (invalid) {
      return sendJson(response, 400, { error: 'Invalid topic, query, or limit' });
    }

    try {
      const feed = await feedService.getFeed();
      // Only curated discovery feeds contribute to historical counts.
      // Publicly submitted articles cannot manipulate the stored trend data.
      store.ingest(feed.articles);
      const articles = filterArticles(feed.articles, { topic, query, limit });

      return sendJson(response, 200, {
        data: articles,
        meta: {
          count: articles.length,
          fetchedAt: feed.fetchedAt,
          stale: feed.stale,
          unavailableSources: feed.failures,
          topic,
          query,
        },
      });
    } catch {
      return sendJson(response, 503, {
        error: 'News sources unavailable. Try again later.',
      });
    }
  }

  async function route(request, response) {
    applyCors(request, response);

    if (request.method === 'OPTIONS' && request.url?.startsWith('/api/')) {
      return sendJson(
        response,
        allowedOrigin && request.headers.origin === allowedOrigin ? 204 : 403,
        {},
      );
    }

    const url = new URL(request.url, 'http://localhost');
    if (request.method === 'GET' && url.pathname === '/health') {
      return sendJson(response, 200, { status: 'ok' });
    }
    if (request.method === 'GET' && url.pathname === '/api/topics') {
      return sendJson(response, 200, {
        topics: Object.keys(TOPICS),
        profiles: Object.keys(PROFILES),
      });
    }
    if (request.method === 'GET' && url.pathname === '/api/capabilities') {
      return sendJson(response, 200, {
        ...aiCapabilities(),
        textAnalysis: true,
        urlAnalysis: true,
        history: true,
      });
    }
    if (url.pathname === '/api/analyze' && request.method === 'POST') {
      return handleAnalyze(request, response);
    }
    if (request.method !== 'GET') {
      return sendJson(response, 405, { error: 'Method not allowed' });
    }
    if (url.pathname === '/api/insights' || url.pathname === '/api/history') {
      return handleHistory(url, response);
    }
    if (url.pathname === '/api/trends') {
      return handleFeed(url, response);
    }
    return sendJson(response, 404, { error: 'Not found' });
  }

  return (request, response) => Promise.resolve(route(request, response)).catch((error) => {
    console.error('Unhandled API error:', error.message);
    if (!response.headersSent) {
      sendJson(response, 500, { error: 'Unexpected server error' });
    } else {
      response.end();
    }
  });
}

/** Store genuinely observed news every hour even if nobody opens the demo. */
export function startCollector(feedService, store, intervalMs = 60 * 60 * 1000) {
  async function collect() {
    try {
      const feed = await feedService.getFeed();
      if (!feed.stale) store.ingest(feed.articles);
    } catch (error) {
      console.warn('News collection unavailable:', error.message);
    }
  }

  void collect();
  const timer = setInterval(collect, intervalMs);
  return () => clearInterval(timer);
}

// This module can also be imported safely by the test runner.
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const feed = createTrendsService();
  const store = createStore();
  const server = http.createServer(makeHandler(feed, { store }));
  server.requestTimeout = 45_000;
  server.headersTimeout = 15_000;
  startCollector(feed, store);
  server.listen(port, '0.0.0.0', () => {
    console.log(`Tech Trends API ready on port ${port}`);
  });
}
