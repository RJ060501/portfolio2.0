import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createTrendsService, filterArticles, normalizeHackerNews, normalizeDev, uniqueSorted,
} from '../src/trends.js';

const hn = { hits: [
  { title: 'AWS security updates', url: 'https://example.com/security', created_at: '2026-10-10T10:00:00Z' },
  { title: 'Insecure link', url: 'javascript:alert(1)', created_at: '2026-10-11T10:00:00Z' },
] };
const dev = [{ title: 'Python API design', canonical_url: 'https://example.com/python', published_at: '2026-10-12T10:00:00Z', description: 'Development tips' }];

test('normalizes and rejects unsafe links', () => {
  assert.equal(normalizeHackerNews(hn).length, 1);
  assert.equal(normalizeDev(dev)[0].source, 'DEV');
});

test('sorts, deduplicates, and filters by topic and search', () => {
  const items = uniqueSorted([...normalizeHackerNews(hn), ...normalizeDev(dev), ...normalizeHackerNews(hn)]);
  assert.equal(items.length, 2);
  assert.equal(items[0].source, 'DEV');
  assert.equal(filterArticles(items, { topic: 'security' }).length, 1);
  assert.equal(filterArticles(items, { query: 'python' }).length, 1);
  assert.throws(() => filterArticles(items, { limit: 99 }), RangeError);
});

test('caches successful results, isolates source outages, and keeps stale data', async () => {
  let calls = 0;
  let time = 1000000;
  let broken = false;
  const fetchFn = async (url) => {
    calls++;
    if (broken) throw Error('offline');
    return { ok: true, json: async () => url.includes('algolia') ? hn : dev };
  };
  const service = createTrendsService({ fetchFn, now: () => time, ttlMs: 100 });
  assert.equal((await service.getFeed()).articles.length, 2);
  await service.getFeed();
  assert.equal(calls, 2);
  time += 101;
  broken = true;
  assert.equal((await service.getFeed()).stale, true);
  assert.equal(calls, 4);
});

test('returns failure when all sources unavailable and no cache exists', async () => {
  const service = createTrendsService({ fetchFn: async () => { throw Error('offline'); } });
  await assert.rejects(service.getFeed(), /unavailable/);
});

test('keeps available source when the other upstream service fails', async () => {
  const service = createTrendsService({
    fetchFn: async (url) => {
      if (url.includes('dev.to')) throw Error('rate limit');
      return { ok: true, json: async () => hn };
    },
  });
  const result = await service.getFeed();
  assert.equal(result.articles.length, 1);
  assert.deepEqual(result.failures, ['DEV']);
  assert.equal(result.stale, false);
});
