# Развертывание СтройКомплекс

## Варианты доступа к приложению

### 1. Веб-сайт (обычный доступ)

Приложение можно разместить на любом хостинге с поддержкой Node.js:

#### Vercel (рекомендуется)
```bash
# Установка Vercel CLI
npm i -g vercel

# Деплой
vercel --prod
```

#### Собственный сервер
```bash
# Сборка
bun run build

# Запуск production сервера
bun run start
```

#### Docker
```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM base AS runner
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

ENV NODE_ENV=production
EXPOSE 3000
CMD ["bun", "server.js"]
```

---

### 2. Telegram Mini App

Для работы через Telegram Mini Apps:

#### Шаг 1: Создание бота

1. Откройте @BotFather в Telegram
2. Отправьте `/newbot`
3. Укажите имя бота (например: "СтройКомплекс")
4. Укажите username бота (например: `stroycomplex_bot`)
5. Сохраните полученный токен: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

#### Шаг 2: Настройка Mini App

В @BotFather:
```
/newapp
```

Или через меню бота:
1. Выберите бота
2. Settings → Web App → Edit Web App URL
3. Введите URL вашего приложения: `https://your-domain.com`

#### Шаг 3: Настройка переменных окружения

Создайте `.env` файл:
```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

#### Шаг 4: Пример кода бота

Создайте файл `bot.js`:
```javascript
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// URL вашего приложения
const WEB_APP_URL = 'https://your-domain.com';

// Команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, 'Добро пожаловать в СтройКомплекс!', {
    reply_markup: {
      inline_keyboard: [[
        {
          text: 'Открыть приложение',
          web_app: { url: WEB_APP_URL }
        }
      ]]
    }
  });
});

// Обработка данных из Web App
bot.on('web_app_data', (msg) => {
  const chatId = msg.chat.id;
  const data = msg.web_app_data;
  console.log('Web App Data:', data);
});

console.log('Bot started');
```

---

## Использование Telegram SDK в коде

### Хук useTelegram

```tsx
import { useTelegram } from '@/hooks/useTelegram'

function MyComponent() {
  const { 
    isTelegram,        // Запущено ли в Telegram
    user,              // Данные пользователя Telegram
    themeParams,       // Параметры темы
    expand,            // Расширить на весь экран
    close,             // Закрыть приложение
    haptic,            // Вибрация
    showAlert,         // Показать alert
    showConfirm        // Показать confirm
  } = useTelegram()

  if (isTelegram) {
    // Адаптировать UI под Telegram
  }

  return (
    <button onClick={() => {
      haptic.impact('medium')  // Вибрация при нажатии
      showAlert('Действие выполнено!')
    }}>
      Действие
    </button>
  )
}
```

### Провайдер Telegram

```tsx
import { TelegramProvider, useTelegramContext } from '@/components/TelegramProvider'

function App({ children }) {
  return (
    <TelegramProvider>
      {children}
    </TelegramProvider>
  )
}

function UserInfo() {
  const telegram = useTelegramContext()
  
  if (telegram?.isTelegram) {
    return <div>Привет, {telegram.user?.first_name}!</div>
  }
  
  return null
}
```

---

## Особенности работы в Telegram

1. **Автоматическая аутентификация** - Пользователь определяется по Telegram ID
2. **Адаптивная тема** - Цвета подстраиваются под тему Telegram
3. **Haptic Feedback** - Вибрация при действиях
4. **MainButton / BackButton** - Нативные кнопки Telegram
5. **Безопасность** - Данные подписаны сервером Telegram

---

## Проверка работы

### Локально
```bash
bun run dev
```
Приложение доступно на http://localhost:3000

### В Telegram
1. Задеплойте на публичный HTTPS сервер
2. Настройте Web App URL в BotFather
3. Откройте бота и нажмите кнопку "Открыть приложение"

---

## Полезные ссылки

- [Telegram Mini Apps Documentation](https://core.telegram.org/bots/webapps)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Web App API Reference](https://core.telegram.org/bots/webapps#initializing-mini-apps)
