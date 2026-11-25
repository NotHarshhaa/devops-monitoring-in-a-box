# syntax=docker/dockerfile:1.7

# Multi-stage distroless build using Chainguard Wolfi base images (0 CVEs, multi-arch index digests)
FROM cgr.dev/chainguard/node:latest@sha256:aaf2e52e7deb1f4e5e51461ec480516ddd9ed4559188866f131145f93dee0f44 AS builder-base
USER root
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Stage 1: Install dependencies with BuildKit cache and disabled install scripts
FROM builder-base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts --no-audit --no-fund

# Stage 2: Generate Prisma client and build Next.js standalone bundle
FROM deps AS builder
ARG NODE_OPTIONS=""
ENV NODE_OPTIONS="${NODE_OPTIONS}"
COPY . .
RUN --mount=type=cache,target=/app/.next/cache \
    npm run build && \
    rm -rf .next/standalone/node_modules/sharp \
           .next/standalone/node_modules/@img \
           .next/standalone/.env*

# Stage 3: Extract minimal Node runtime (strips npm, npx, node-gyp, busybox, headers)
FROM builder-base AS node-runtime
RUN mkdir -p /runtime/usr/bin /runtime/usr/lib /runtime/usr/share && \
    cp /usr/bin/node /runtime/usr/bin/node && \
    cp -a /usr/lib/libbrotli* \
          /usr/lib/libcares* \
          /usr/lib/libcrypto* \
          /usr/lib/libev* \
          /usr/lib/libicudata* \
          /usr/lib/libicui18n* \
          /usr/lib/libicuio* \
          /usr/lib/libicuuc* \
          /usr/lib/libnghttp2* \
          /usr/lib/libssl* \
          /usr/lib/libstdc++* \
          /usr/lib/libuv* \
          /usr/lib/libz* \
          /runtime/usr/lib/ && \
    (cp -a /usr/lib/ossl-modules* /runtime/usr/lib/ 2>/dev/null || true) && \
    cp -a /usr/share/icu /runtime/usr/share/ && \
    mkdir -p /runtime/app/.next/cache && \
    chown -R 65532:65532 /runtime/app

# Stage 4: Hardened distroless production runtime (Wolfi glibc-dynamic, non-root, no shell/pkg manager)
FROM cgr.dev/chainguard/glibc-dynamic:latest@sha256:eaa0c377a38e4c67f4192fd5fe9d24d39d51c4531613d97731537f9d33460ae4 AS runner

ARG BUILD_DATE=""
ARG VCS_REF=""
ARG VERSION="2.5.0"

LABEL org.opencontainers.image.title="DevOps Monitoring UI" \
      org.opencontainers.image.description="Hardened distroless Next.js DevOps monitoring dashboard" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.source="https://github.com/NotHarshhaa/devops-monitoring-in-a-box" \
      org.opencontainers.image.licenses="MIT"

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt \
    CONFIG_PATH=/tmp/config.json

# Minimal Node.js runtime + writable cache directory owned by nonroot (65532:65532)
COPY --from=node-runtime /runtime/usr/ /usr/
COPY --from=node-runtime --chown=65532:65532 /runtime/app/ /app/

# Copy only production standalone artifacts with non-root ownership
COPY --from=builder --chown=65532:65532 /app/public ./public
COPY --from=builder --chown=65532:65532 /app/.next/standalone ./
COPY --from=builder --chown=65532:65532 /app/.next/static ./.next/static

USER 65532:65532

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD ["/usr/bin/node", "-e", "fetch('http://127.0.0.1:3000/api/health?live=1').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]

ENTRYPOINT ["/usr/bin/node"]
CMD ["server.js"]
