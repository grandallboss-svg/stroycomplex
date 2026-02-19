/**
 * Telegram Bot для СтройКомплекс Mini App
 * 
 * Для запуска:
 * 1. Создайте бота через @BotFather
 * 2. Скопируйте токен
 * 3. Установите Web App URL: /setmenubutton или /newapp
 * 4. Запустите: node telegram-bot.js
 */

// Если используется CommonJS (без компиляции)
// const TelegramBot = require('node-telegram-bot-api');

// Для использования с bun/ts
import TelegramBot from 'node-telegram-bot-api'

// Токен бота от @BotFather
const token = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE'

// URL вашего развёрнутого приложения (HTTPS обязательно!)
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://your-domain.com'

// Создаём бота
const bot = new TelegramBot(token, { polling: true })

console.log('🤖 СтройКомплекс Bot запущен!')
console.log(`📱 Web App URL: ${WEB_APP_URL}`)

// Команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id
  const firstName = msg.from?.first_name || 'Пользователь'

  bot.sendMessage(
    chatId,
    `🏗️ *Добро пожаловать в СтройКомплекс, ${firstName}!*\n\n` +
    `Система управления строительными проектами:\n` +
    `• 📊 Дашборд проектов\n` +
    `• 📋 Планы работ и КС-2/КС-3\n` +
    `• 👷 Учёт персонала и зарплаты\n` +
    `• 📝 Наряды на монтаж\n` +
    `• ⚠️ Техника безопасности\n\n` +
    `Нажмите кнопку ниже для входа:`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🚀 Открыть приложение',
              web_app: { url: WEB_APP_URL }
            }
          ],
          [
            {
              text: '📖 Инструкция',
              callback_data: 'help'
            }
          ]
        ]
      }
    }
  )
})

// Команда /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id

  bot.sendMessage(
    chatId,
    `📖 *Справка по СтройКомплекс*\n\n` +
    `*Основные разделы:*\n` +
    `• Дашборд - обзор всех проектов\n` +
    `• Направления - категории работ\n` +
    `• Объекты - строительные объекты\n` +
    `• План работ - графики и этапы\n` +
    `• КС-2/КС-3 - документы\n` +
    `• Персонал - сотрудники\n` +
    `• Зарплата - расчёт выплат\n` +
    `• Наряды - задания на работы\n` +
    `• Техника безопасности - инструктажи\n\n` +
    `*Доступ:*\n` +
    `Email: admin@stroytest.ru\n` +
    `Пароль: admin123`,
    { parse_mode: 'Markdown' }
  )
})

// Обработка callback queries
bot.on('callback_query', (query) => {
  const chatId = query.message?.chat.id

  if (query.data === 'help' && chatId) {
    bot.answerCallbackQuery(query.id)
    bot.sendMessage(
      chatId,
      `📖 Для входа используйте:\n` +
      `Email: admin@stroytest.ru\n` +
      `Пароль: admin123`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 Открыть приложение',
                web_app: { url: WEB_APP_URL }
              }
            ]
          ]
        }
      }
    )
  }
})

// Обработка данных из Web App
bot.on('web_app_data', (msg) => {
  const chatId = msg.chat.id
  const data = msg.web_app_data

  console.log('📱 Web App Data:', data)

  // Можно обрабатывать данные, отправленные из приложения
  if (data.data) {
    try {
      const parsed = JSON.parse(data.data)
      bot.sendMessage(chatId, `✅ Данные получены: ${JSON.stringify(parsed)}`)
    } catch {
      bot.sendMessage(chatId, `✅ Получены данные: ${data.data}`)
    }
  }
})

// Команда для установки Menu Button (Web App)
bot.onText(/\/setmenu/, async (msg) => {
  const chatId = msg.chat.id

  try {
    // Установка Web App в меню бота
    await bot.setChatMenuButton({
      chat_id: chatId,
      menu_button: {
        type: 'web_app',
        text: 'СтройКомплекс',
        web_app: { url: WEB_APP_URL }
      }
    })

    bot.sendMessage(chatId, '✅ Кнопка меню установлена!')
  } catch (error) {
    console.error('Error setting menu button:', error)
    bot.sendMessage(chatId, '❌ Ошибка установки меню')
  }
})

// Обработка ошибок polling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error)
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Остановка бота...')
  bot.stopPolling()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n👋 Остановка бота...')
  bot.stopPolling()
  process.exit(0)
})
