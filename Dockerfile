# Optimized Dockerfile for DevOps Monitoring Dashboard
# Multi-stage build with Node.js 20 Alpine for security and performance

# Stage 1: Build the Next.js application
FROM node:20-alpine AS builder

# Update Alpine packages and install build dependencies
RUN apk update && apk upgrade && apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files for dependency installation
COPY ui-next/package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --ignore-scripts

# Copy source code
COPY ui-next/ .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Stage 2: Ultra-minimal production runtime
FROM node:20-alpine AS runner

# Update Alpine packages and install only wget for health checks
RUN apk update && apk upgrade && apk add --no-cache wget

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy only the essential files from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Simple health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application
CMD ["node", "server.js"]
