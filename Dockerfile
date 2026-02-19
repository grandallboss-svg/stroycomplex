# Dockerfile для СтройКомплекс
FROM oven/bun:1-alpine AS base
WORKDIR /app

# Установка зависимостей
FROM base AS deps
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Сборка
FROM base AS builder
# Копируем package.json и node_modules
COPY package.json ./
COPY --from=deps /app/node_modules ./node_modules

# Копируем prisma схему и генерируем клиент
COPY prisma ./prisma
RUN bunx prisma generate

# Копируем остальной код (исключая node_modules через .dockerignore)
COPY . .

# Сборка Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Production образ
FROM oven/bun:1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Создание пользователя
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копирование файлов
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Создание директории для базы данных
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

# Права доступа
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL="file:/app/data/stroycomplex.db"

# Запуск с миграцией используя локальный prisma
CMD ["sh", "-c", "./node_modules/prisma/build/index.js migrate deploy && bun server.js"]
