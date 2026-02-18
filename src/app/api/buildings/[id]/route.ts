import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
// GET /api/buildings/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const building = await db.building.findUnique({
      where: { id },
      include: {
        workPlans: {
          include: { workDirection: true }
        }
      }
    })
    if (!building) {
      return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
    }
    return NextResponse.json(building)
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка получения' }, { status: 500 })
  }
}

// PUT /api/buildings/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    const building = await db.building.update({
      where: { id },
      data: {
        name: data.name,
        address: data.address,
        floors: data.floors,
        totalArea: data.totalArea,
        status: data.status,
      }
    })
    return NextResponse.json(building)
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 })
  }
}

// DELETE /api/buildings/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.building.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка удаления' }, { status: 500 })
  }
}
