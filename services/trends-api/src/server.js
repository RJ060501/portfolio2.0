import http from 'node:http';
import { createTrendsService, filterArticles, TOPICS } from './trends.js';

const service = createTrendsService();
const port = Number(process.env.PORT || 8000);
const allowedOrigin = process.env.CORS_ORIGIN || '';

function json(response, status, payload) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  response.end(JSON.stringify(payload));
}

export function makeHandler(feedService = service) {
  return async (request, response) => {
    if (allowedOrigin && request.headers.origin === allowedOrigin) {
      response.setHeader('Access-Control-Allow-Origin', allowedOrigin);
      response.setHeader('Vary', 'Origin');
    }
    if (request.method !== 'GET') return json(response, 405, { error: 'Method not allowed' });
    const url = new URL(request.url, 'http://localhost');
    if (url.pathname === '/health') return json(response, 200, { status: 'ok' });
    if (url.pathname === '/api/topics') return json(response, 200, { topics: Object.keys(TOPICS) });
    if (url.pathname !== '/api/trends') return json(response, 404, { error: 'Not found' });
    const topic = url.searchParams.get('topic') || 'all';
    const query = (url.searchParams.get('query') || '').trim();
    const limit = url.searchParams.get('limit') || '20';
    if (!Object.hasOwn(TOPICS, topic) || query.length > 100 || !/^\d+$/.test(limit) || Number(limit) < 1 || Number(limit) > 50) {
      return json(response, 400, { error: 'Invalid topic, query, or limit' });
    }
    try {
      const feed = await feedService.getFeed();
      const articles = filterArticles(feed.articles, { topic, query, limit });
      return json(response, 200, {
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
      return json(response, 503, { error: 'News sources unavailable. Try again later.' });
    }
  };
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  http.createServer(makeHandler()).listen(port, '0.0.0.0', () => {
    console.log(`Tech Trends API ready on port ${port}`);
  });
}
