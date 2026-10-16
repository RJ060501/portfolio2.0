import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { detectTechnologies, recommend } from '../src/taxonomy.js';
import { ArticleError, extractArticle, fetchArticle, publicIPv4, validateArticleUrl } from '../src/extractor.js';
import { createStore } from '../src/store.js';
import { enrichWithAI } from '../src/ai.js';
import { makeHandler } from '../src/server.js';

const article = { title: 'Kubernetes adoption', text: 'A Kubernetes deployment uses OpenTelemetry and Docker for monitoring. Python handles automation. OpenTelemetry creates application traces for cloud reliability.'.repeat(3), wordCount: 48 };

async function withServer(handler, callback) {
  const server = http.createServer(handler);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try { await callback(`http://127.0.0.1:${server.address().port}`); }
  finally { await new Promise((resolve) => server.close(resolve)); }
}

test('technology recognition is boundary-aware, includes supporting article evidence, and ranks by profile', () => {
  assert.equal(detectTechnologies('reactive properties').some((row) => row.name === 'React'), false);
  const found = detectTechnologies(article.text);
  assert.ok(found.some((entry) => entry.name === 'Kubernetes' && entry.mentions === 3));
  assert.ok(found.find((entry) => entry.name === 'OpenTelemetry').evidence[0].includes('OpenTelemetry'));
  assert.equal(recommend(found, 'cloud')[0].category, 'cloud');
});

test('HTML extraction isolates main article and skips script/navigation', () => {
  const input = `<html><head><title>Kubernetes &amp; the cloud</title><script>privateToken</script></head><body><nav>navbar</nav><article>
    <h2>Platform reliability</h2><p>OpenTelemetry instruments Kubernetes applications with distributed traces, logs and metrics in production environments.</p>
    <p>Modern infrastructure engineers also use Terraform, Linux, and observability tools to understand their deployed services across cloud infrastructure.</p>
  </article><footer>footertext</footer></body></html>`;
  const extracted = extractArticle(input);
  assert.equal(extracted.title, 'Kubernetes & the cloud');
  assert.match(extracted.text, /Terraform/);
  assert.doesNotMatch(extracted.text, /privateToken|footertext|navbar/);
  assert.throws(() => extractArticle('<body>empty</body>'), ArticleError);
});

test('SSRF defense rejects local/private/reserved IPs and invalid URLs', async () => {
  for (const ip of ['127.0.0.1', '10.0.0.1', '172.31.0.5', '192.168.0.1', '169.254.169.254', '100.64.0.1', '203.0.113.9', '0.0.0.0']) {
    assert.equal(publicIPv4(ip), false, ip);
  }
  assert.equal(publicIPv4('8.8.8.8'), true);
  await assert.rejects(validateArticleUrl('http://example.com/a'), /Only public HTTPS/);
  await assert.rejects(validateArticleUrl('https://localhost/admin'), /Local, private/);
  await assert.rejects(validateArticleUrl('https://user:pass@example.com/'), /Only public HTTPS/);
  await assert.rejects(validateArticleUrl('https://example.com/', async () => [{ address: '169.254.169.254' }]), /public IPv4/);
  await assert.rejects(validateArticleUrl('https://example.com/', async () => [{ address: '1.1.1.1' }, { address: '10.1.2.3' }]), /public IPv4/);
  const safe = await validateArticleUrl('https://example.com/post#fragment', async () => [{ address: '8.8.8.8' }]);
  assert.equal(safe.ip, '8.8.8.8');
  assert.equal(safe.parsed.hash, '');
});

test('redirects are rechecked against restricted destinations', async () => {
  await assert.rejects(fetchArticle('https://example.com/a', {
    resolver: async (host) => [{ address: host === 'evil.com' ? '169.254.169.254' : '8.8.8.8' }],
    requester: async () => ({ status: 302, redirect: 'https://evil.com/latest' }),
  }), /public IPv4/);
});

test('SQLite stores observed mentions without duplicating collected articles', () => {
  let time = Date.parse('2026-10-01T00:00:00Z');
  const store = createStore(':memory:', () => time);
  const articleOne = { url: 'https://example.org/1', title: 'Kubernetes with Terraform', source: 'HN', description: 'Linux' };
  assert.equal(store.ingest([articleOne, articleOne]).added, 1);
  let stats = store.insights({ days: 7, profile: 'cloud' });
  assert.equal(stats.meta.totalCollected, 1);
  assert.equal(stats.meta.historicalComparisonAvailable, false);
  assert.equal(stats.data.find((entry) => entry.name === 'Kubernetes').articles, 1);
  time += 16 * 86400000;
  store.ingest([{ url: 'https://example.org/2', title: 'New Kubernetes tooling', source: 'DEV' }]);
  stats = store.insights({ days: 7, profile: 'cloud' });
  assert.equal(stats.meta.historicalComparisonAvailable, true);
  assert.equal(stats.data.find((entry) => entry.name === 'Kubernetes').articles, 1);
  assert.equal(stats.data.find((entry) => entry.name === 'Kubernetes').growthPercent, null); // previous window has zero mentions; avoid an undefined growth rate
  const history = store.history({ days: 30, technology: 'Kubernetes' });
  assert.equal(history.data.reduce((total, day) => total + day.articles, 0), 2);
  store.close();
});

test('Ollama candidates must be exact article evidence, and AI unavailability is safe', async () => {
  const old = process.env.OLLAMA_ENABLED;
  process.env.OLLAMA_ENABLED = 'true';
  try {
    const result = await enrichWithAI(article, { fetchFn: async () => ({ ok: true, json: async () => ({ message: { content: JSON.stringify({
      summary: 'Cloud engineers can study trace instrumentation.', learningAdvice: 'Try observability.',
      emergingConcepts: [
        { name: 'OpenTelemetry', evidence: 'OpenTelemetry creates application traces' },
        { name: 'InventedTool', evidence: 'bogus evidence' },
      ],
    }) } }) }) });
    assert.equal(result.status, 'ready');
    assert.equal(result.concepts.length, 1);
    assert.equal(result.concepts[0].name, 'OpenTelemetry');
    const fallback = await enrichWithAI(article, { fetchFn: async () => { throw new Error('offline'); } });
    assert.equal(fallback.status, 'unavailable');
  } finally { if (old === undefined) delete process.env.OLLAMA_ENABLED; else process.env.OLLAMA_ENABLED = old; }
});

test('HTTP POST analysis, history and validation work end-to-end with injected extractor', async () => {
  const store = createStore(':memory:');
  const feed = { getFeed: async () => ({ articles: [{ id: '1', title: 'Terraform in Linux', description: 'AWS deployment', url: 'https://example.org/story', source: 'test', publishedAt: '2026-10-16T00:00:00.000Z' }], fetchedAt: '2026-10-16T00:00:00Z', stale: false, failures: [] }) };
  const handler = makeHandler(feed, { store, articleFetcher: async () => ({ ...article, url: 'https://example.com/story' }), aiAnalyzer: async () => ({ status: 'disabled', message: 'disabled in tests' }) });
  await withServer(handler, async (base) => {
    const data = await fetch(`${base}/api/analyze`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: 'https://example.com/story', profile: 'cloud', ai: true }) });
    assert.equal(data.status, 200);
    const payload = await data.json();
    assert.ok(payload.data.technologies.some((t) => t.name === 'OpenTelemetry'));
    assert.equal(payload.data.ai.status, 'disabled');
    assert.equal((await fetch(`${base}/api/analyze`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 400);
    assert.equal((await fetch(`${base}/api/trends`)).status, 200);
    const insights = await (await fetch(`${base}/api/insights?profile=cloud`)).json();
    assert.equal(insights.meta.totalCollected, 1);
    assert.equal((await fetch(`${base}/api/history?days=30`)).status, 200);
    assert.equal((await fetch(`${base}/api/insights?days=123`)).status, 400);
    assert.equal((await fetch(`${base}/api/capabilities`)).status, 200);
  });
  store.close();
});
