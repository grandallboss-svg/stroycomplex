import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
// GET /api/directions/[id] - Получить направление
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const direction = await db.workDirection.findUnique({
      where: { id },
      include: {
        workPlans: {
          include: { building: true }
        },
        schemes: true,
      }
    })
    if (!direction) {
      return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
    }
    return NextResponse.json(direction)
  } catch (error) {
    console.error('Error fetching direction:', error)
    return NextResponse.json({ error: 'Ошибка получения' }, { status: 500 })
  }
}

// PUT /api/directions/[id] - Обновить направление
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    const direction = await db.workDirection.update({
      where: { id },
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        color: data.color,
        icon: data.icon,
      }
    })
    return NextResponse.json(direction)
  } catch (error) {
    console.error('Error updating direction:', error)
    return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 })
  }
}

// DELETE /api/directions/[id] - Удалить направление
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.workDirection.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting direction:', error)
    return NextResponse.json({ error: 'Ошибка удаления' }, { status: 500 })
  }
}
