import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const briefing = await db.safetyBriefing.findUnique({
      where: { id },
      include: {
        workDirection: true,
        safetyRecords: {
          include: {
            employee: true,
          },
        },
      },
    })

    if (!briefing) {
      return NextResponse.json(
        { error: 'Инструктаж не найден' },
        { status: 404 }
      )
    }

    return NextResponse.json(briefing)
  } catch (error) {
    console.error('Get briefing error:', error)
    return NextResponse.json(
      { error: 'Ошибка получения инструктажа' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const briefing = await db.safetyBriefing.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        workDirectionId: data.workDirectionId,
        required: data.required,
      },
      include: {
        workDirection: true,
      },
    })

    return NextResponse.json(briefing)
  } catch (error) {
    console.error('Update briefing error:', error)
    return NextResponse.json(
      { error: 'Ошибка обновления инструктажа' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.safetyBriefing.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Инструктаж удален' })
  } catch (error) {
    console.error('Delete briefing error:', error)
    return NextResponse.json(
      { error: 'Ошибка удаления инструктажа' },
      { status: 500 }
    )
  }
}
