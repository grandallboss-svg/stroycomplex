#!/bin/bash

# Скрипт деплоя СтройКомплекс

echo "🚀 СтройКомплекс - Выберите платформу для деплоя:"
echo ""
echo "1) Vercel (рекомендуется для Next.js)"
echo "2) Railway"
echo "3) Render"
echo "4) Fly.io"
echo "5) Docker (свой сервер)"
echo ""
read -p "Выберите вариант [1-5]: " choice

case $choice in
  1)
    echo ""
    echo "📦 Деплой на Vercel..."
    echo ""
    echo "1. Выполните команду: bunx vercel login"
    echo "2. Откройте ссылку в браузере и авторизуйтесь"
    echo "3. После авторизации выполните: bunx vercel --prod"
    echo ""
    echo "Или используйте веб-интерфейс:"
    echo "1. Откройте https://vercel.com/new"
    echo "2. Импортируйте репозиторий с кодом"
    echo "3. Vercel автоматически определит Next.js и настроит сборку"
    ;;
  2)
    echo ""
    echo "🚂 Деплой на Railway..."
    echo ""
    echo "1. Откройте https://railway.app"
    echo "2. Войдите через GitHub"
    echo "3. Нажмите 'New Project' → 'Deploy from GitHub repo'"
    echo "4. Выберите репозиторий"
    echo "5. Railway автоматически определит Next.js"
    echo "6. Добавьте переменную DATABASE_URL=file:/app/data/db.sqlite"
    echo "7. Деплой запустится автоматически"
    ;;
  3)
    echo ""
    echo "🎨 Деплой на Render..."
    echo ""
    echo "1. Откройте https://render.com"
    echo "2. Создайте аккаунт/войдите"
    echo "3. New → Web Service"
    echo "4. Подключите GitHub репозиторий"
    echo "5. Настройки:"
    echo "   - Build Command: bun run build"
    echo "   - Start Command: bun .next/standalone/server.js"
    echo "   - Environment: Node"
    echo "6. Добавьте переменные окружения"
    ;;
  4)
    echo ""
    echo "✈️ Деплой на Fly.io..."
    echo ""
    if command -v fly &> /dev/null; then
      echo "Fly CLI найден, запускаем деплой..."
      fly launch
    else
      echo "1. Установите Fly CLI: curl -L https://fly.io/install.sh | sh"
      echo "2. Авторизуйтесь: fly auth login"
      echo "3. Запустите: fly launch"
    fi
    ;;
  5)
    echo ""
    echo "🐳 Docker деплой..."
    echo ""
    echo "Сборка и запуск:"
    echo ""
    echo "  docker-compose up -d --build"
    echo ""
    echo "Приложение будет доступно на http://localhost:3000"
    echo ""
    echo "Для деплоя на свой сервер:"
    echo "1. Скопируйте проект на сервер"
    echo "2. Установите Docker и Docker Compose"
    echo "3. Выполните: docker-compose up -d --build"
    echo "4. Настройте nginx/traefik для HTTPS"
    ;;
  *)
    echo "Неверный выбор"
    exit 1
    ;;
esac
