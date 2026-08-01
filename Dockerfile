# syntax=docker/dockerfile:1

# ---- deps ----------------------------------------------------------------
FROM public.ecr.aws/docker/library/node:22-alpine AS deps
WORKDIR /app
# Prisma's engine links against libssl; without it the loader fails at runtime.
RUN apk add --no-cache openssl
COPY package.json package-lock.json* ./
COPY prisma ./prisma
# `npm ci` runs prisma's postinstall, which needs schema.prisma present above.
RUN npm ci

# ---- builder -------------------------------------------------------------
FROM public.ecr.aws/docker/library/node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next inlines NEXT_PUBLIC_* at build time, so it must be present here rather
# than only in the runtime environment.
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_TELEMETRY_DISABLED=1

RUN npx prisma generate && npm run build

# ---- runner --------------------------------------------------------------
FROM public.ecr.aws/docker/library/node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
# standalone/ carries its own minimal node_modules and server.js.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma CLI + schema so migrations can be applied on release.
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin ./node_modules/.bin

USER nextjs
EXPOSE 3000

# App Runner injects HOSTNAME with the instance's internal hostname, which
# Next's standalone server binds to instead of all interfaces — the health check
# then never reaches the port. Clearing it in the command wins over the
# platform's env, unlike an ENV line.
CMD ["sh", "-c", "HOSTNAME=0.0.0.0 exec node server.js"]
