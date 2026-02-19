import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Проверка подписи Telegram Login Widget
function verifyTelegramAuth(initData: string, botToken: string): boolean {
  try {
    const params = new URLSearchParams(initData)
    const hash = params.get('hash')
    
    if (!hash) return false
    
    params.delete('hash')
    
    // Сортируем параметры и создаём строку для проверки
    const dataCheckArr: string[] = []
    params.forEach((value, key) => {
      dataCheckArr.push(`${key}=${value}`)
    })
    dataCheckArr.sort()
    const dataCheckString = dataCheckArr.join('\n')
    
    // Вычисляем секретный ключ
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest()
    
    // Вычисляем хеш
    const computedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex')
    
    return computedHash === hash
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { initData } = body
    
    if (!initData) {
      return NextResponse.json(
        { error: 'initData is required' },
        { status: 400 }
      )
    }
    
    // В продакшене замените на реальный токен бота
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    
    if (!botToken) {
      // В режиме разработки пропускаем проверку
      console.warn('TELEGRAM_BOT_TOKEN not set, skipping verification')
    } else {
      const isValid = verifyTelegramAuth(initData, botToken)
      
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid Telegram auth' },
          { status: 401 }
        )
      }
    }
    
    // Парсим данные пользователя
    const params = new URLSearchParams(initData)
    const userJson = params.get('user')
    
    if (!userJson) {
      return NextResponse.json(
        { error: 'User data not found' },
        { status: 400 }
      )
    }
    
    const telegramUser = JSON.parse(userJson)
    
    // Здесь можно найти или создать пользователя в базе данных
    // const user = await prisma.user.upsert({...})
    
    return NextResponse.json({
      success: true,
      user: {
        telegramId: telegramUser.id,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        username: telegramUser.username,
        languageCode: telegramUser.language_code,
        isPremium: telegramUser.is_premium,
      }
    })
  } catch (error) {
    console.error('Telegram auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Telegram Auth API',
    endpoints: {
      POST: '/api/telegram/auth - Authenticate Telegram user'
    }
  })
}
