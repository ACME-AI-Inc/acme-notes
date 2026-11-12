# Acme Notes: a one-page notes app with two planted bugs, hosted so new
# Composal signups have a real app behind their demo project. See README.md.
# Built with this directory as context, as Composal hosting builds it.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY build.mjs telemetry.js index.html logo.svg logo.png apple-touch-icon.png healthz ./
ARG POSTHOG_KEY
ARG POSTHOG_HOST
RUN npm run build

FROM caddy:2-alpine

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist/ /srv/

EXPOSE 8080

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
