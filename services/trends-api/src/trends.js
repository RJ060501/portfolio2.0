// Data processing is framework-independent so the API can be unit tested without network access.
export const TOPICS = {
  all: [],
  ai: ['ai', 'artificial intelligence', 'machine learning', 'llm', 'agents', 'openai', 'model'],
  cloud: ['cloud', 'aws', 'azure', 'gcp', 'kubernetes', 'terraform', 'serverless', 'devops'],
  security: ['security', 'vulnerability', 'breach', 'phishing', 'cve', 'ransomware', 'zero trust'],
  development: ['developer', 'development', 'programming', 'software', 'javascript', 'python', 'api'],
};

export const SOURCE_URLS = {
  hn: 'https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=100',
  dev: 'https://dev.to/api/articles?per_page=100&top=7',
};

function safeLink(candidate) {
  try {
    const url = new URL(candidate);
    // Upstream stories are external links; only present normal secure URLs.
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

function validArticle(title, url, createdAt, source, description = '') {
  const safeUrl = safeLink(url);
  const date = new Date(createdAt);
  if (!safeUrl || !String(title || '').trim() || Number.isNaN(date.getTime())) return null;
  return {
    id: `${source}:${safeUrl}`,
    title: String(title).trim().slice(0, 200),
    url: safeUrl,
    source,
    publishedAt: date.toISOString(),
    description: String(description || '').replace(/<[^>]*>/g, '').trim().slice(0, 260),
  };
}

export function normalizeHackerNews(data) {
  if (!Array.isArray(data?.hits)) throw new Error('Unexpected Hacker News response');
  return data.hits
    .map((item) => validArticle(item.title, item.url, item.created_at, 'Hacker News'))
    .filter(Boolean);
}

export function normalizeDev(data) {
  if (!Array.isArray(data)) throw new Error('Unexpected DEV response');
  return data
    .map((item) =>
      validArticle(item.title, item.canonical_url || item.url, item.published_at, 'DEV', item.description),
    )
    .filter(Boolean);
}

export function uniqueSorted(articles) {
  const urls = new Set();
  return articles
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .filter((item) => {
      const key = item.url.replace(/\/$/, '').toLowerCase();
      if (urls.has(key)) return false;
      urls.add(key);
      return true;
    });
}

export function filterArticles(articles, { topic = 'all', query = '', limit = 20 } = {}) {
  const terms = TOPICS[topic];
  if (!terms) throw new RangeError('Invalid topic');
  const search = String(query).trim().toLowerCase();
  const count = Number(limit);
  if (!Number.isInteger(count) || count < 1 || count > 50) throw new RangeError('Invalid limit');
  return articles
    .filter((item) => {
      const haystack = `${item.title} ${item.description}`.toLowerCase();
      return (!terms.length || terms.some((term) => haystack.includes(term))) &&
        (!search || haystack.includes(search));
    })
    .slice(0, count);
}

async function fetchJson(url, fetchFn) {
  const response = await fetchFn(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'RyanTechTrendsPortfolio/2.0' },
    signal: AbortSignal.timeout(7000),
  });
  if (!response.ok) throw new Error(`Upstream returned ${response.status}`);
  return response.json();
}

// Cache successful partial results, but never permanently cache an all-source failure.
export function createTrendsService({ fetchFn = fetch, now = Date.now, ttlMs = 300000 } = {}) {
  let cached = null;
  let pending = null;

  async function refresh() {
    const tasks = [
      ['Hacker News', SOURCE_URLS.hn, normalizeHackerNews],
      ['DEV', SOURCE_URLS.dev, normalizeDev],
    ];
    const responses = await Promise.allSettled(tasks.map(async ([source, url, normalize]) => {
      return { source, items: normalize(await fetchJson(url, fetchFn)) };
    }));
    const articles = [];
    const failures = [];
    responses.forEach((result, index) => {
      if (result.status === 'fulfilled') articles.push(...result.value.items);
      else failures.push(tasks[index][0]);
    });
    if (failures.length === tasks.length) throw new Error('News sources temporarily unavailable');
    cached = {
      articles: uniqueSorted(articles),
      fetchedAt: new Date(now()).toISOString(),
      failures,
      expiresAt: now() + ttlMs,
    };
    return cached;
  }

  async function getFeed() {
    if (cached && cached.expiresAt > now()) return { ...cached, stale: false };
    if (!pending) pending = refresh().finally(() => { pending = null; });
    try {
      return { ...(await pending), stale: false };
    } catch (error) {
      // Continue serving last known data if upstream APIs are temporarily unavailable.
      if (cached) return { ...cached, stale: true, failures: ['Hacker News', 'DEV'] };
      throw error;
    }
  }

  return { getFeed };
}
