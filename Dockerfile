FROM node:20-alpine AS base

# Install OpenSSL and libc6-compat for Prisma Query Engine on Alpine
RUN apk add --no-cache libc6-compat openssl

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* .npmrc* ./
COPY prisma ./prisma/
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Build Next.js
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js standalone
ENV NEXT_TELEMETRY_DISABLED=1
ENV BUILD_STANDALONE=true
RUN npm run build

# Production runner image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Defaults that bootstrap reads if Coolify didn't pass them.
ENV DATABASE_URL=file:/app/data/league.db
ENV NEXTAUTH_URL=https://ligue.ro
ENV NEXTAUTH_SECRET=dev-secret-change-me-please-this-is-not-secure-change-in-production-min-32
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create persistent data directory for SQLite with correct permissions
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Copy Prisma CLI and engines so bootstrap can run migrations offline
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/bcryptjs ./node_modules/bcryptjs
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin ./node_modules/.bin

# Set the correct permission for prerender cache
RUN mkdir -p .next && chown nextjs:nodejs .next
RUN chmod +x ./scripts/bootstrap.sh

# Standalone output bundle
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Run bootstrap (schema push + user seeds) then start Next.js standalone server
CMD ["sh", "-c", "node prisma/bootstrap.js && node scripts/start.js"]
