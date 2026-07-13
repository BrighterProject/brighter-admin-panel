# syntax=docker/dockerfile:1.4

# ---- deps stage ----
FROM oven/bun:1-alpine AS deps
WORKDIR /app

COPY package.json bun.lock* ./

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# ---- build stage ----
FROM oven/bun:1-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG VITE_BASENAME=/admin
ENV VITE_BASENAME=$VITE_BASENAME

# Demo-only: offers the `dev` (ngrok) calendar channel in the property form.
# Defaults OFF so production images never expose it — pass
# --build-arg VITE_ENABLE_DEV_CALENDAR_CHANNEL=true only for demo builds.
ARG VITE_ENABLE_DEV_CALENDAR_CHANNEL=
ENV VITE_ENABLE_DEV_CALENDAR_CHANNEL=$VITE_ENABLE_DEV_CALENDAR_CHANNEL

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun run build

# ---- production stage ----
FROM oven/bun:1-alpine AS production
WORKDIR /app

COPY --from=builder /app/dist ./dist

COPY <<'SERVE' serve.ts
Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    const file = Bun.file(`dist${url.pathname}`);
    if (await file.exists()) return new Response(file);
    return new Response(Bun.file("dist/index.html"));
  },
});
SERVE

EXPOSE 3000

CMD ["bun", "serve.ts"]
