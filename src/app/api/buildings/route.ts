import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
// GET /api/buildings - Получить все объекты
export async function GET() {
  try {
    const buildings = await db.building.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { workPlans: true, schemes: true }
        }
      }
    })
    return NextResponse.json(buildings)
  } catch (error) {
    console.error('Error fetching buildings:', error)
    return NextResponse.json({ error: 'Ошибка получения объектов' }, { status: 500 })
  }
}

// POST /api/buildings - Создать объект
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const building = await db.building.create({
      data: {
        name: data.name,
        address: data.address,
        floors: data.floors || 1,
        totalArea: data.totalArea,
        status: data.status || 'ACTIVE',
      }
    })
    return NextResponse.json(building)
  } catch (error) {
    console.error('Error creating building:', error)
    return NextResponse.json({ error: 'Ошибка создания объекта' }, { status: 500 })
  }
}
