# Technology Intelligence V1–V3 · Ubuntu / WSL2 setup

This extension follows the existing **Portfolio 2.0** layout. It does not require a new Next.js server route or a redesign. `src/features/trends/TrendsDemo.jsx` is a client React component; `services/trends-api/` is your independent custom Node HTTP API; Nginx forwards `/api/` requests to the backend. The old `src/features/trends/sample.js` preview has been removed. Other apps and pages are left in place.

## Prerequisites — exact Ubuntu packages

You reported Ubuntu 20.04 under WSL2 with Docker Desktop already running. **Use Docker Desktop + WSL integration; don't install a second Docker daemon in the Ubuntu distro.** Confirm from the Ubuntu shell:

```bash
docker info                 # should show the Server section without sudo
docker compose version
```

These packages are useful for managing the repo and inspecting responses/database:

```bash
sudo apt update
sudo apt install -y ca-certificates curl git unzip jq sqlite3
```

No Python scraper, Chocolatey, system Apache/Nginx, Docker Engine reinstall, or native SQLite compiler packages are required. The stack builds its own Node and Nginx runtime in containers.

**Optional: run Node directly in Ubuntu rather than Docker.** Node.js >= 22.13 is needed for built-in `node:sqlite` without experimental flags. Check `node -v`. If older or missing, install the official Node 22 packages from NodeSource (review scripts obtained over the internet before executing them):

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x -o /tmp/nodesource_setup.sh
sudo -E bash /tmp/nodesource_setup.sh
sudo apt install -y nodejs
node --version
npm --version
```

Inside the portfolio folder, **install your existing frontend dependencies**:

```bash
npm ci
npm test
```

The Trends API adds **zero npm runtime packages**; its HTTP server, tests, and SQLite database use Node core functionality. The React app still requires the Next.js packages specified in the portfolio's existing root `package.json` and `package-lock.json`.

## Recommended: run V1 + V3 without AI first

```bash
cd ~/Projects/ryan-russell-portfolio
docker compose up --build -d --wait
docker compose ps
curl -s http://localhost:3000/api/capabilities | jq
curl -s http://localhost:3000/api/trends?limit=5 | jq
curl -s http://localhost:3000/api/insights?profile=cloud | jq
```

Open `http://localhost:3000/projects/tech-trends-api/` (trailing slash expected). Test the **Analyze article**, **Discover news**, and **Trend history** tabs. You don't need to supply search keywords. Pasting a 100+ character text article is the most reproducible end-to-end test; public HTTPS article URLs also work when a website permits text extraction.

The first refresh collects current source headlines automatically. SQLite persists in the `trends_data` **named Docker volume**, surviving `docker compose down` and ordinary rebuilds. Do **not** run `docker compose down -v` unless you intend to delete the historical observations.

To inspect the database without installing SQLite inside the container:

```bash
docker compose exec trends-api node -e "const {DatabaseSync}=require('node:sqlite'); const db=new DatabaseSync('/data/trends.sqlite'); console.log(db.prepare('SELECT COUNT(*) AS articles FROM articles').get());db.close();"
```

## Enable V2: local Ollama model (optional)

**No Ubuntu Ollama package is required** if you use the Compose AI overlay. It adds a separate private `ollama` container and an on-disk model volume.

```bash
docker compose -f compose.yaml -f compose.ai.yaml --profile ai up --build -d --wait
docker compose -f compose.yaml -f compose.ai.yaml --profile ai exec ollama ollama pull llama3.2:3b
curl -s http://localhost:3000/api/capabilities | jq
```

In the demo's Analyze tab, check **Add AI enrichment with Ollama**. The first analysis may be slow on a CPU. If you get AI unavailable, check:

```bash
docker compose -f compose.yaml -f compose.ai.yaml --profile ai logs -f ollama trends-api
```

Do not expose Ollama port 11434 or the backend port 8000 to the public internet. The overlay keeps Ollama private. You can run without AI at any time:

```bash
docker compose down
docker compose up --build -d --wait
```

## Development mode (hot reload)

```bash
docker compose -f compose.dev.yaml up --build
# UI: http://localhost:3000 ; API: http://localhost:8000
```

Or start the API locally in one shell:

```bash
cd services/trends-api
CORS_ORIGIN=http://localhost:3000 DB_PATH=./data/trends.sqlite npm run dev
```

And Next.js in another shell from repo root, with `NEXT_PUBLIC_TRENDS_API_BASE=http://localhost:8000` in `.env.local` (untracked):

```bash
npm run dev
```

## Validate before pushing to GitHub

```bash
npm ci
npm test
npm run build
python3 scripts/check-export.py
docker compose config
docker compose -f compose.yaml -f compose.ai.yaml --profile ai config
docker compose up --build -d --wait
sh scripts/smoke-container.sh
```

This build runs `npm test && npm run build` in the Docker image. For a real production launch, complete full browser, security, load, source-blocking and Ollama quality tests. A single internet outage can prevent the first news refresh, leaving history empty until the collector successfully reaches the public feeds. Growth comparison requires **at least twice your selected window** of sustained first-observed history and at least one previous-window mention; until then it is shown as unavailable rather than zero.

## Merge safely into your existing repository

Your live Ubuntu repo may include résumé changes **made after the uploaded archive**. **Don't overwrite your entire repo.** Apply only the changes for Trends and review the diff. A focused changes ZIP is included for convenience and a Git patch is included as an alternative:

```bash
# From the existing project, commit or stash your current changes first.
git status
git add -A && git commit -m "chore: checkpoint before trends intelligence rebuild"

# Option A: after placing the provided patch file in your project root:
git apply --check trends-intelligence-v3.patch
git apply trends-intelligence-v3.patch

# Check and test changes before committing.
git diff --stat
npm test
```

Do not apply both the patch and the ZIP overlay. The patch is generated against the **last supplied Portfolio 2.0 archive**; Git can report a conflict if you've changed the same files since then. Resolve conflicts instead of force-overwriting local work.

## What counts as a real trend?

The API counts **distinct source articles first observed by your collector**. That can demonstrate *article-discussion momentum* but **not** global industry adoption. The 7/30/90-day views use only data recorded since installation; they do not invent earlier months. Profiles weight cloud/security/software/AI categories for learning relevance; those rules are explicit heuristics and not labor-market statistics. Think of V3 as a genuine **observed technology-news intelligence** feature, not a predictive industry model.
