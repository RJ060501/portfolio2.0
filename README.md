# Ryan Russell | Systems, Cloud & Code

A portfolio built with Next.js App Router and React, with **eight project case studies** and **five interactive project demonstrations**. The latest revision makes the navigation genuinely multipage, preserves the playable Snake browser adaptation of my original **Python** project, and brings my Tech Trends API into the portfolio as a separately runnable service.

## What's on the site?

- `/` — short introduction and four featured projects, not a long one-page scroll.
- `/work/` — full eight-project archive. Filter by category; four projects per page with previous, next, numbered pages, and query-string state for sharing and browser back/forward.
- `/projects/<slug>/` — dedicated project case studies and live/sample demos.
- `/about/` — personal background and professional experience.
- `/contact/` — contact details.
- `/resume/` — résumé plus an existing downloadable PDF.

Highlighted projects: security monitoring, Tech Trends API, Terraform EC2, and Snake algorithms. Other projects remain in the work archive rather than being removed. The Terraform work is **not advertised as a completed portfolio deployment**. The uploaded historical EC2 lab appears under `infra/original-ec2-lab/` and an **unapplied** optional hosting blueprint is under `infra/aws/`.

## Local development

Requires Node.js 22+.

```bash
npm ci
npm run lint
npm test
npm run dev
```

Visit http://localhost:3000. For a working live feed, in another terminal start the API:

```bash
cd services/trends-api
CORS_ORIGIN=http://localhost:3000 npm start
```

Then start the Next.js development server with `NEXT_PUBLIC_TRENDS_API_BASE=http://localhost:8000` (add this to an untracked `.env.local` in the portfolio root or set the environment before `npm run dev`). In the Tech Trends demo, choose **Fetch live feed ↗**. It requests real articles from your Node.js API, not directly from HN/DEV. If the API is offline, the UI reports it and offers fictional sample records; it never substitutes samples silently.

Run the API's tests independently:

```bash
npm --prefix services/trends-api test
```

Build the static frontend:

```bash
npm run build
python3 scripts/check-export.py
```

Next.js uses `output: 'export'`. The frontend is static and does not have Next server endpoints. The API is a separate Node 22 service with no runtime packages required. Local frontend development needs a configured API origin as shown above; the production Nginx site proxies the same-origin `/api/*` path.

## Docker integration

```bash
docker compose up --build -d --wait
# Browse http://localhost:3000
curl http://localhost:3000/api/topics
curl 'http://localhost:3000/api/trends?topic=cloud&limit=5'
sh scripts/smoke-container.sh
```

The default production Compose stack has two containers: `portfolio` (static export served by non-root Nginx) and `trends-api` (unprivileged Node.js). Nginx proxies `/api/` on the private Docker network. The only host port is bound to loopback by default, so this configuration **is not by itself a public internet deployment**.

Development with Docker:

```bash
docker compose down
docker compose -f compose.dev.yaml up --build
```

The development configuration mounts source code for hot reload, exposes the API on localhost:8000, and configures local CORS. If you choose a different site `PORT`, both services use the corresponding origin; adjust any manually created local `.env.local` accordingly.

## Optional AWS deployment with Terraform

Review `infra/aws/README.md` **before spending money or creating AWS resources**. The Terraform example provisions an EC2 host in a default VPC with a public HTTPS security group, trusted-IP SSH, encryption, and IMDSv2. You then install Docker and deploy the stack via `compose.yaml` plus `compose.aws.yaml` with a domain pointing at the instance. Caddy provides public TLS and forwards to Nginx, which serves the static site and proxies the API.

**None of that cloud deployment has been executed on your AWS account by these files.** Only describe the portfolio as hosted on AWS after you actually apply the Terraform plan, run the containers on AWS, confirm TLS, and test the real public endpoint. If an EC2-hosted deployment remains too costly, a cheaper alternative to investigate is S3 + CloudFront for the static frontend, with the API deployed separately on a managed compute option. The original basic EC2 instance is currently stopped and never served this portfolio.

Your Linux home server can serve as a private build/staging environment, a Docker runner, or an operations sandbox. It does not need to handle public traffic or expose your home network. A project is stronger when its architecture is easy to explain and truthful than when every possible piece of hardware is inserted into the production path.

## Tech Trends API improvements

`services/trends-api/` replaces the initial scraper based on arbitrary links extracted from two webpages. It uses official third-party JSON APIs from Hacker News Algolia and DEV Community, with normalized `title`, `url`, `source`, `publishedAt` and description. Features include topic and free-text filtering, safe URL handling, limits on request parameters, date sorting, link deduplication, concurrent upstream requests, seven-second fetch timeouts, a five-minute cached feed, partial-source-failure reporting, stale-cache fallback, `/health`, and automated tests. See `services/trends-api/README.md` for the endpoint contract.

Suggested interview explanation: “To keep up with changes in cloud, security, and software development, I built a news-discovery API. I started with a basic scraper, then improved it to consume structured sources, remove duplicates, cache requests, handle failures, and let me filter current articles by topic. I integrated it into my portfolio so employers can see the application, architecture, and source code.” Only call this a **live feed** when you have the API running or deployed.

## Structure and validation

| Path                       | Purpose                                                                                |
| -------------------------- | -------------------------------------------------------------------------------------- |
| `src/app/`                 | Stateless Next.js route files for Home, Work, About, Contact, Resume, and each project |
| `src/content/projects.js`  | Accurate project cases, technologies, status, and source links                         |
| `src/components/projects/` | Artworks, paginated/filterable cards, interactive demo selection                       |
| `src/features/snake/`      | Pure game engine and testable React browser adaptation                                 |
| `src/features/trends/`     | Live API UI with separately marked fictional preview data                              |
| `services/trends-api/`     | Framework-free Node 22 HTTP service, source adapters, tests, Dockerfile                |
| `infra/original-ec2-lab/`  | Read-only archive of original Terraform `.tf` files (not ready for reuse)              |
| `infra/aws/`               | New, unapplied AWS host blueprint                                                      |
| `docker/`                  | Nginx reverse proxy and optional Caddy HTTPS configuration                             |
| `.github/workflows/ci.yml` | Build, format, tests, export links, Docker smoke checks                                |

Checks: `npm run lint`, `npm test`, `npm run format:check`, `npm run build`, `python3 scripts/check-export.py`, `docker compose config`, and `sh scripts/smoke-container.sh` after starting Docker. Network-dependent build or live-feed checks require connectivity. To regenerate the résumé PDF with `python scripts/create-resume.py`, install `reportlab` and DejaVu Sans regular/bold fonts locally (or provide `RESUME_FONT_REGULAR` and `RESUME_FONT_BOLD` pointing to your own installed font files); the font binaries are not included in this archive. Sample data never purports to represent a live production feed; the other interactive previews remain educational simulations.

_This repo includes the files required to deploy the application but does not provision AWS resources automatically. Credentials, domain DNS, live account access, and hosting bills remain under your control._

# portfolio2.0
