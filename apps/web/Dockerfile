# NÃO TESTADO neste ambiente (sem Docker disponível durante o desenvolvimento).
# syntax=docker/dockerfile:1

FROM node:22-slim AS build
WORKDIR /repo
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci
COPY packages/shared packages/shared
COPY apps/web apps/web
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build:shared && npm run build -w web

FROM nginx:alpine AS runtime
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
