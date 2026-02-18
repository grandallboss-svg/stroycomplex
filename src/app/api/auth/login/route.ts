import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

import bcrypt from 'bcryptjs'

// POST /api/auth/login - Вход в систему
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Пользователь не найден или неактивен' },
        { status: 401 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Неверный пароль' },
        { status: 401 }
      )
    }

    // Возвращаем пользователя без пароля
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      user: userWithoutPassword,
      message: 'Вход выполнен успешно',
    })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Ошибка авторизации' },
      { status: 500 }
    )
  }
}
