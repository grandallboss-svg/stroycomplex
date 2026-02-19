# Dockerfile для СтройКомплекс
FROM oven/bun:1-alpine AS base
WORKDIR /app

# Установка зависимостей
FROM base AS deps
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Сборка
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Генерация Prisma клиента
RUN bunx prisma generate

# Сборка Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Production образ
FROM oven/bun:1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Создание пользователя для безопасности
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копирование файлов
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Установка конкретной версии Prisma 6 (не 7!)
RUN bun add prisma@6 @prisma/client@6

# Права доступа
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Инициализация БД и запуск
CMD ["sh", "-c", "bunx prisma migrate deploy && node server.js"]
