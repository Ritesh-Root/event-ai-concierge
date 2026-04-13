# syntax=docker/dockerfile:1.7
# ─────────────────────────────────────────────────────────────────────
# EventAI Concierge — production container for Google Cloud Run
# Multi-stage build keeps the final image small and free of dev deps.
# ─────────────────────────────────────────────────────────────────────

# ── Stage 1: install production dependencies ────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# ── Stage 2: runtime image ──────────────────────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=8080 \
    NPM_CONFIG_LOGLEVEL=warn

# Run as non-root for defense-in-depth
RUN addgroup -S app && adduser -S app -G app

COPY --from=deps /app/node_modules ./node_modules
COPY --chown=app:app server.js ./
COPY --chown=app:app src ./src
COPY --chown=app:app public ./public

USER app

EXPOSE 8080

# Healthcheck hits the lightweight /api/health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/api/health || exit 1

CMD ["node", "server.js"]
