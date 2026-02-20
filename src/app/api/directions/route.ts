import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
// GET /api/directions - Получить все направления работ
export async function GET() {
  try {
    const directions = await db.workDirection.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { workPlans: true, schemes: true }
        }
      }
    })
    return NextResponse.json(directions)
  } catch (error) {
    console.error('Error fetching directions:', error)
    return NextResponse.json({ error: 'Ошибка получения направлений' }, { status: 500 })
  }
}

// POST /api/directions - Создать направление
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const direction = await db.workDirection.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        color: data.color || '#3B82F6',
        icon: data.icon,
      }
    })
    return NextResponse.json(direction)
  } catch (error) {
    console.error('Error creating direction:', error)
    return NextResponse.json({ error: 'Ошибка создания направления' }, { status: 500 })
  }
}
