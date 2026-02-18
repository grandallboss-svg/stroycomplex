import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const record = await db.safetyRecord.findUnique({
      where: { id },
      include: {
        employee: true,
        briefing: {
          include: {
            workDirection: true,
          },
        },
      },
    })

    if (!record) {
      return NextResponse.json(
        { error: 'Запись не найдена' },
        { status: 404 }
      )
    }

    return NextResponse.json(record)
  } catch (error) {
    console.error('Get safety record error:', error)
    return NextResponse.json(
      { error: 'Ошибка получения записи' },
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
    await db.safetyRecord.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Запись удалена' })
  } catch (error) {
    console.error('Delete safety record error:', error)
    return NextResponse.json(
      { error: 'Ошибка удаления записи' },
      { status: 500 }
    )
  }
}
