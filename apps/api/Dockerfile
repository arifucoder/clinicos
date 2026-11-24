# syntax=docker/dockerfile:1
# ---------- 1) install + build ----------
FROM node:24-alpine AS build
WORKDIR /app
RUN corepack enable

# pnpm-workspace.yaml has allowBuilds (prisma engines) — without it: ERR_PNPM_IGNORED_BUILDS
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
# prisma generate does not connect to the DB, but prisma.config.ts reads DATABASE_URL
ARG DATABASE_URL=postgresql://build:build@localhost:5432/build
RUN pnpm generate && pnpm build && pnpm prune --prod

# ---------- 2) runtime ----------
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app

COPY --from=build --chown=app:app /app/package.json ./
COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/dist ./dist
# needed by `prisma migrate deploy` (deploy.sh)
COPY --from=build --chown=app:app /app/prisma ./prisma
COPY --from=build --chown=app:app /app/prisma.config.ts ./
# email templates are read at runtime from process.cwd()/templates
COPY --from=build --chown=app:app /app/templates ./templates

USER app
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:5000/api/v1/health > /dev/null || exit 1
CMD ["node", "--enable-source-maps", "dist/server.js"]
