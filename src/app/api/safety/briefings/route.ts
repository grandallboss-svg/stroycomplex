import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const directionId = searchParams.get('directionId')

    const where: Record<string, unknown> = {}
    if (directionId) where.workDirectionId = directionId

    const briefings = await db.safetyBriefing.findMany({
      where,
      include: {
        workDirection: true,
        _count: {
          select: { safetyRecords: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(briefings)
  } catch (error) {
    console.error('Get briefings error:', error)
    return NextResponse.json(
      { error: 'Ошибка получения инструктажей' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const briefing = await db.safetyBriefing.create({
      data: {
        name: data.name,
        description: data.description,
        workDirectionId: data.workDirectionId,
        required: data.required ?? true,
      },
      include: {
        workDirection: true,
      },
    })

    return NextResponse.json(briefing, { status: 201 })
  } catch (error) {
    console.error('Create briefing error:', error)
    return NextResponse.json(
      { error: 'Ошибка создания инструктажа' },
      { status: 500 }
    )
  }
}
