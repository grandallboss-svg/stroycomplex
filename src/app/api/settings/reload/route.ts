import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // В реальном приложении здесь можно добавить логику graceful shutdown
    // Для демо просто возвращаем успешный ответ
    return NextResponse.json({ message: 'Приложение перезагружается' })
  } catch (error) {
    console.error('Reload error:', error)
    return NextResponse.json({ error: 'Ошибка перезагрузки' }, { status: 500 })
  }
}
