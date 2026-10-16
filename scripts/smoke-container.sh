#!/usr/bin/env sh
# Run after `docker compose up --build -d --wait`.
set -eu
base_url="${1:-http://127.0.0.1:3000}"

for route in / /work/ /about/ /contact/ /resume/ /projects/security-monitoring/ /projects/accounting-assistant/ /projects/article-scraper/ /projects/localdb-investigation/ /projects/video-explorer/ /projects/snake/ /projects/tech-trends-api/ /projects/terraform-aws-ec2/ /Ryan_Russell_Resume.pdf /healthz; do
  curl --fail --silent --show-error --output /dev/null "$base_url$route"
  printf 'OK %s\n' "$route"
done

curl --fail --silent --show-error --output /dev/null "$base_url/api/topics"
printf 'OK /api/topics (proxied API)\n'
status="$(curl --silent --output /dev/null --write-out '%{http_code}' "$base_url/this-route-does-not-exist/")"
if [ "$status" != "404" ]; then
  printf 'Expected HTTP 404, received %s\n' "$status" >&2
  exit 1
fi
printf 'Container HTTP smoke checks passed.\n'
