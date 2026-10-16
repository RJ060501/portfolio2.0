# Technology Intelligence API (V1 + V2 + V3)

A custom Node.js 22+ HTTP service. It uses **only built-in Node modules** (including `node:sqlite`, experimental in Node 22). No Express, scraping, or database npm packages are required. The backend is deliberately isolated from the Next.js **static export** in `src/` and runs as the `trends-api` Compose service.

## Capabilities

- **V1 / real analysis:** `POST /api/analyze` accepts a public HTTPS article URL or pasted text. Fetching pins a verified public IPv4 address, checks redirect destinations, limits time and bytes, and extracts text from server-rendered HTML. Deterministic technology matching includes aliases, evidence excerpts, categories, and learning-profile relevance. Extraction is intentionally conservative; some websites are paywalled, use JavaScript, or prohibit scraping. Use pasted text instead. Only fetch publicly accessible content you are permitted to retrieve.
- **V2 / optional local AI:** Ollama enhances an analysis with a short summary, candidate unfamiliar concepts, and learning advice. Candidates require an exact technology name and supporting quotation in article text. If Ollama is disabled/unavailable, ordinary analysis still succeeds. AI output must be checked against the source. AI results **do not** silently add keywords to the controlled registry or claim verified trend growth.
- **V3 / real observed history:** An hourly collector loads Hacker News and DEV headlines/descriptions using the existing upstream API adapters, deduplicates by URL, and stores **first-observed** articles and known-tech mentions in a persistent SQLite volume. Learning relevance rankings and UTC daily counts are queryable. Growth over a prior equal-length period is **null** until that earlier window has been collected and contains baseline mentions. Rankings are heuristic and are **not** measurements of technology adoption or labor demand.

Data retention: the database retains observed article URL/title/source/dates and technology names from public feed records. It **does not save pasted full articles, URL-fetched article text, or AI responses**. No account/profile data is persisted; choosing a learning profile changes a query's ranking.

## HTTP endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /health` | Liveness |
| `GET /api/topics` | Valid feed categories and learning profiles |
| `GET /api/capabilities` | AI on/off + feature availability |
| `GET /api/trends?topic=cloud&query=&limit=20` | Live normalized HN/DEV discovery feed |
| `POST /api/analyze` | URL OR pasted-text analysis; AI optional |
| `GET /api/insights?profile=cloud&days=30` | Per-role recommended known technologies in observed articles |
| `GET /api/history?days=30&technology=Kubernetes` | UTC daily article counts (optional term) |

Valid profiles are `cloud`, `security`, `software`, `ai`. Valid periods are `7`, `30`, `90`. The frontend uses these exact API contracts.

```bash
curl -s http://localhost:8000/api/capabilities | jq
curl -s http://localhost:8000/api/insights?profile=cloud\&days=30 | jq
curl -s http://localhost:8000/api/history?days=30 | jq
curl -s -X POST http://localhost:8000/api/analyze \
  -H 'Content-Type: application/json' \
  -d '{"profile":"cloud","ai":false,"title":"Example text","text":"Kubernetes and Terraform are useful for cloud engineering. OpenTelemetry can help engineers understand the behavior of systems in production environments. Python scripts make it easier to manage cloud infrastructure and automate development workflows."}' | jq
```

For **Docker production**, the API is not directly accessible on the host; use `http://localhost:3000/api/...` through the website's Nginx reverse proxy. Local API dev serves on `localhost:8000`.

## Local Node usage

```bash
node --version          # Node 22.13+ required for node:sqlite without a flag
cd services/trends-api
npm test               # Node's built-in test runner; no npm install required
DB_PATH=./data/trends.sqlite PORT=8000 npm start
```

## Local Docker usage

```bash
docker compose up --build -d --wait
curl http://localhost:3000/api/capabilities
# SQLite persists in the named 'trends_data' volume across container restarts.
```

### Enable optional Ollama (Docker)

```bash
docker compose -f compose.yaml -f compose.ai.yaml --profile ai up --build -d --wait
docker compose -f compose.yaml -f compose.ai.yaml --profile ai exec ollama ollama pull llama3.2:3b
curl http://localhost:3000/api/capabilities
```

Wait for model download and load before testing. The `ollama` container is deliberately not bound to any host/public port. AI is CPU-intensive and may take tens of seconds per article. For an EC2 deployment, budget RAM and compute carefully; the regular API is intentionally independent of the AI service. See `TRENDS_SETUP.md` in the repo root for complete Ubuntu instructions.

## Source layout

- `src/server.js` — API contract, request size limits, basic rate limiting, collector interval
- `src/trends.js` — live discovery adapters, normalization, cache, partial outages
- `src/extractor.js` — bounded HTTPS article extraction with pinned DNS and redirect re-validation
- `src/taxonomy.js` — known tech terms, aliases, context evidence, profile relevance
- `src/ai.js` — opt-in Ollama enrichment and evidence validation
- `src/store.js` — SQLite schema, deduplicated observations, historical metrics
- `test/` — built-in `node:test` coverage, no external services required

## Security and limitations

- Arbitrary URL fetching is intrinsically sensitive. The implementation restricts HTTPS to port 443, rejects local/IP hosts, requires public IPv4 DNS answers, pins the vetted IP to each TLS connection, verifies TLS certificates, and validates every redirect. Response size and timeout are bounded. It also has a basic in-process per-client rate limit for article analysis. This is **defense in depth, not a claim of formal penetration testing**; public deployments should add provider-level WAF/egress firewall, reverse-proxy rate limiting, resource limits, metrics and operational alerting.
- `TRUST_PROXY=true` is only safe with the included Nginx reverse proxy on a private Docker network that overwrites `X-Forwarded-For`. Never expose the backend port to the public internet in that mode.
- URL input may fail on JavaScript-rendered and protected/paywalled websites. We do not bypass access restrictions. Pasted article text is the supported fallback.
- Node 22's built-in SQLite support is experimental; verify version compatibility before upgrades. History has no synthesized backfill: it only becomes meaningful as the container stays online and collects articles.
- The technology dictionary requires maintenance. Ollama suggests new concepts but does not automatically expand the registry. References to "AI" describe **optional** enrichment, not unsupervised verified reasoning.
