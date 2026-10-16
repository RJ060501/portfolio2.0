# Tech Trends API · v2

A maintainable rewrite of my original two-page web scraper. The old implementation collected arbitrary links on startup, had no published dates or filtering, and could hang when an upstream page failed. This version uses official read-only JSON interfaces from **Hacker News (Algolia)** and **DEV Community** instead of scraping HTML. It is **news discovery**, not an AI summarizer or a claim that every article is a major trend.

## Run and test

Requires Node.js 22+. There are **no npm runtime dependencies**.

```bash
npm start
npm test
curl 'http://localhost:8000/api/trends?topic=cloud&limit=5'
curl 'http://localhost:8000/api/trends?query=python&limit=10'
curl 'http://localhost:8000/api/topics'
curl 'http://localhost:8000/health'
```

`GET /api/trends` returns `{data: [{id, title, url, source, publishedAt, description}], meta: {count, fetchedAt, stale, unavailableSources, topic, query}}`. Optional `topic` is `all | ai | cloud | security | development`, `query` is a case-insensitive substring (max 100 characters), and `limit` is 1–50 (default 20). Topics use transparent keyword matching, not ML classification. Articles are sorted newest-first, deduplicated by URL, and fetched concurrently. Successful results are cached for five minutes; if refresh fails, the most recent cache is served with `stale: true`. Initial total failure returns HTTP 503. One failed source returns a partial feed with `unavailableSources` metadata.

The API should be placed behind a proxy for public deployment. With the portfolio's Nginx, the same-origin endpoint is `/api/trends`; avoid cross-origin complexity and exposed secrets. For running the static Next.js development server separately, set `CORS_ORIGIN=http://localhost:3000` on this API and `NEXT_PUBLIC_TRENDS_API_BASE=http://localhost:8000` for the website.

The frontend has a clearly labeled sample preview and a live feed mode. It does not claim live results unless this API responds. External articles belong to their publishers. The API does not generate original content or cache entire articles.
