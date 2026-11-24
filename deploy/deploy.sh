#!/usr/bin/env bash
# Runs on the VPS in ~/apps/clinicos (called by .github/workflows/deploy.yml).
# Rollback: IMAGE_TAG=<old git sha> ./deploy.sh
set -euo pipefail
cd "$(dirname "$0")"

COMPOSE="docker compose -f docker-compose.prod.yml"
export IMAGE_TAG="${IMAGE_TAG:-latest}"

echo "→ Pulling images ($IMAGE_TAG)"
$COMPOSE pull api web

echo "→ Starting database"
$COMPOSE up -d --wait db

echo "→ Running migrations"
$COMPOSE run --rm --no-deps api node_modules/.bin/prisma migrate deploy

echo "→ Starting api + web"
$COMPOSE up -d --remove-orphans

echo "→ Health check"
for _ in $(seq 1 20); do
  if curl -fsS http://127.0.0.1:5100/api/v1/health > /dev/null; then
    echo "✓ API healthy ($IMAGE_TAG)"
    docker image prune -f > /dev/null
    exit 0
  fi
  sleep 3
done

echo "✗ Health check failed. Logs: $COMPOSE logs --tail=100 api"
echo "  Rollback: IMAGE_TAG=<previous sha> ./deploy.sh"
exit 1
