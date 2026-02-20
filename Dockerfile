# Dockerfile для СтройКомплекс
FROM oven/bun:1.2-alpine AS base
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

# Генерируем Prisma клиент снова после копирования
RUN bunx prisma generate

# Создаём пустую базу данных (только структура таблиц)
RUN mkdir -p /app/db && \
    DATABASE_URL="file:/app/db/empty.db" bunx prisma db push --skip-generate

# Создаём демо базу с данными (используем скрипт инициализации)
RUN DATABASE_URL="file:/app/db/demo.db" bunx prisma db push --skip-generate && \
    DATABASE_URL="file:/app/db/demo.db" bun run /app/scripts/init-demo-db.ts

# Сборка Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Production образ
FROM oven/bun:1.2-alpine AS runner
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

# Установка @prisma/client для CLI
RUN bun add @prisma/client@6.19.2

# Создание директорий для базы данных
RUN mkdir -p /app/data/backups /app/data/templates

# Копируем базы данных-шаблоны
COPY --from=builder /app/db/empty.db /app/data/templates/empty.db
COPY --from=builder /app/db/demo.db /app/data/templates/demo.db

# Создаем entrypoint скрипт для инициализации при первом запуске
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo '# Применяем миграции к текущей базе' >> /app/entrypoint.sh && \
    echo 'DATABASE_URL="file:/app/data/stroycomplex.db" bunx prisma db push --skip-generate 2>/dev/null || true' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo '# Проверяем, нужна ли первичная инициализация' >> /app/entrypoint.sh && \
    echo 'if [ ! -f /app/data/.initialized ]; then' >> /app/entrypoint.sh && \
    echo '  echo "🚀 First run - initializing databases..."' >> /app/entrypoint.sh && \
    echo '  ' >> /app/entrypoint.sh && \
    echo '  # Создаём папку для бэкапов если нет' >> /app/entrypoint.sh && \
    echo '  mkdir -p /app/data/backups' >> /app/entrypoint.sh && \
    echo '  ' >> /app/entrypoint.sh && \
    echo '  # Копируем пустую базу в backups' >> /app/entrypoint.sh && \
    echo '  cp /app/data/templates/empty.db /app/data/backups/Пустая.db' >> /app/entrypoint.sh && \
    echo '  echo "✅ Created: Пустая.db"' >> /app/entrypoint.sh && \
    echo '  ' >> /app/entrypoint.sh && \
    echo '  # Копируем демо базу в backups' >> /app/entrypoint.sh && \
    echo '  cp /app/data/templates/demo.db /app/data/backups/Демо.db' >> /app/entrypoint.sh && \
    echo '  echo "✅ Created: Демо.db"' >> /app/entrypoint.sh && \
    echo '  ' >> /app/entrypoint.sh && \
    echo '  # Устанавливаем демо базу как активную' >> /app/entrypoint.sh && \
    echo '  cp /app/data/templates/demo.db /app/data/stroycomplex.db' >> /app/entrypoint.sh && \
    echo '  echo "✅ Active database: Демо"' >> /app/entrypoint.sh && \
    echo '  ' >> /app/entrypoint.sh && \
    echo '  # Создаём маркер инициализации' >> /app/entrypoint.sh && \
    echo '  touch /app/data/.initialized' >> /app/entrypoint.sh && \
    echo '  echo "🎉 Initialization complete!"' >> /app/entrypoint.sh && \
    echo 'fi' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo 'exec bun server.js' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

RUN chown -R nextjs:nodejs /app/data

# Права доступа
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL="file:/app/data/stroycomplex.db"

# Запуск через entrypoint для инициализации
CMD ["/app/entrypoint.sh"]
