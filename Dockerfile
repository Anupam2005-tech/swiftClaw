# ── Build stage ───────────────────────────────────────────────────────
FROM oven/bun:1.3 AS build

WORKDIR /app
COPY package.json bun.lock index.ts tsconfig.json ./
COPY tui/ tui/
COPY utils/ utils/
COPY modes/ modes/
COPY scripts/ scripts/
COPY ai/ ai/
RUN bun install --frozen-lockfile
RUN bun run scripts/compile.ts

# ── Runtime stage ─────────────────────────────────────────────────────
FROM gcr.io/distroless/base-debian12:nonroot

COPY --from=build /app/dist/bin/swiftclaw-linux-x64 /usr/local/bin/swiftclaw

ENTRYPOINT ["/usr/local/bin/swiftclaw"]
