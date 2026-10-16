import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { makeHandler } from '../src/server.js';

async function withServer(service, callback) {
  const server = http.createServer(makeHandler(service));
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    await callback(base);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

const feed = {
  articles: [
    {
      id: 'test:1',
      title: 'Terraform cloud security',
      url: 'https://example.com/article',
      source: 'test',
      publishedAt: '2026-10-14T12:00:00.000Z',
      description: '',
    },
  ],
  fetchedAt: '2026-10-14T13:00:00.000Z',
  stale: false,
  failures: [],
};

test('HTTP API exposes health, topic discovery, filtering, and request validation', async () => {
  await withServer({ getFeed: async () => feed }, async (base) => {
    const health = await fetch(`${base}/health`);
    assert.equal(health.status, 200);
    assert.equal((await health.json()).status, 'ok');

    const topics = await (await fetch(`${base}/api/topics`)).json();
    assert.ok(topics.topics.includes('cloud'));

    const response = await fetch(`${base}/api/trends?topic=cloud&limit=10`);
    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.data.length, 1);
    assert.equal(payload.meta.topic, 'cloud');

    const none = await (await fetch(`${base}/api/trends?topic=ai`)).json();
    assert.equal(none.data.length, 0);
    assert.equal((await fetch(`${base}/api/trends?topic=wrong`)).status, 400);
    assert.equal((await fetch(`${base}/api/trends?limit=999`)).status, 400);
    assert.equal((await fetch(`${base}/not-found`)).status, 404);
    assert.equal((await fetch(`${base}/api/trends`, { method: 'POST' })).status, 405);
  });
});

test('HTTP API returns 503 when feed is unavailable', async () => {
  await withServer(
    {
      getFeed: async () => {
        throw new Error('network');
      },
    },
    async (base) => {
      const response = await fetch(`${base}/api/trends`);
      assert.equal(response.status, 503);
      assert.match((await response.json()).error, /unavailable/);
    },
  );
});
