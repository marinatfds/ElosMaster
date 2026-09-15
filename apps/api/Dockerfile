# NÃO TESTADO neste ambiente (sem Docker disponível durante o desenvolvimento).
# Revise e teste antes de usar em produção — especialmente a parte do Chromium/Puppeteer.
# syntax=docker/dockerfile:1

FROM node:22-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium fonts-liberation \
    && rm -rf /var/lib/apt/lists/*
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

FROM base AS build
WORKDIR /repo
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/api/package.json apps/api/package.json
RUN npm ci
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN npm run build:shared && npm run build -w api

FROM base AS runtime
WORKDIR /repo
ENV NODE_ENV=production
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages/shared/dist ./packages/shared/dist
COPY --from=build /repo/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /repo/apps/api/dist ./apps/api/dist
COPY --from=build /repo/apps/api/package.json ./apps/api/package.json
EXPOSE 8787
CMD ["node", "apps/api/dist/index.js"]
