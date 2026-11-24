# syntax=docker/dockerfile:1
# ---------- 1) install + build ----------
FROM node:24-alpine AS build
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
# NEXT_PUBLIC_* is inlined into the browser bundle at build time → build arg
ARG NEXT_PUBLIC_CLINIC_TIME_ZONE=Asia/Dhaka
# API_BASE_URL is server-only and comes at runtime (.env.web); this dummy only satisfies build-time checks
ENV NEXT_PUBLIC_CLINIC_TIME_ZONE=$NEXT_PUBLIC_CLINIC_TIME_ZONE \
    API_BASE_URL=http://api:5000/api/v1 \
    NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ---------- 2) runtime (standalone) ----------
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -S app && adduser -S app -G app

COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public

USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ > /dev/null || exit 1
CMD ["node", "server.js"]
