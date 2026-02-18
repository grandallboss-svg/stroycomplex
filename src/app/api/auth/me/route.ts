import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    // В реальном приложении здесь нужно проверять JWT токен из cookies
    // Для демо возвращаем первого администратора
    const authHeader = request.headers.get('authorization')
    const userId = authHeader?.replace('Bearer ', '')

    if (!userId) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json(
      { error: 'Ошибка получения данных пользователя' },
      { status: 500 }
    )
  }
}
