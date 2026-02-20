import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
// GET /api/schemes - Получить все схемы монтажа
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workDirectionId = searchParams.get('workDirectionId')
    const buildingId = searchParams.get('buildingId')

    const where: Record<string, unknown> = {}
    if (workDirectionId) where.workDirectionId = workDirectionId
    if (buildingId) where.buildingId = buildingId

    const schemes = await db.installationScheme.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        workDirection: true,
        building: true,
      }
    })
    return NextResponse.json(schemes)
  } catch (error) {
    console.error('Error fetching schemes:', error)
    return NextResponse.json({ error: 'Ошибка получения схем' }, { status: 500 })
  }
}

// POST /api/schemes - Создать схему
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const scheme = await db.installationScheme.create({
      data: {
        name: data.name,
        workDirectionId: data.workDirectionId,
        buildingId: data.buildingId,
        floor: data.floor,
        room: data.room,
        description: data.description,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        fileSize: data.fileSize,
      },
      include: {
        workDirection: true,
        building: true,
      }
    })
    return NextResponse.json(scheme)
  } catch (error) {
    console.error('Error creating scheme:', error)
    return NextResponse.json({ error: 'Ошибка создания схемы' }, { status: 500 })
  }
}
