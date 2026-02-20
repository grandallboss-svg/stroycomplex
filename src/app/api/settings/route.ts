import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const settings = await db.systemSetting.findMany()
    
    // Преобразуем в объект
    const settingsObj = settings.reduce((acc, s) => {
      acc[s.key] = s.value
      return acc
    }, {} as Record<string, string>)

    return NextResponse.json(settingsObj)
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json(
      { error: 'Ошибка получения настроек' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()

    // Обновляем или создаем настройки
    for (const [key, value] of Object.entries(data)) {
      await db.systemSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    }

    return NextResponse.json({ message: 'Настройки сохранены' })
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { error: 'Ошибка сохранения настроек' },
      { status: 500 }
    )
  }
}
