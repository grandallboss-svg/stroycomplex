import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const scheme = await db.installationScheme.findUnique({
      where: { id },
      include: {
        workDirection: true,
        building: true,
      },
    })

    if (!scheme) {
      return NextResponse.json(
        { error: 'Схема не найдена' },
        { status: 404 }
      )
    }

    return NextResponse.json(scheme)
  } catch (error) {
    console.error('Get scheme error:', error)
    return NextResponse.json(
      { error: 'Ошибка получения схемы монтажа' },
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

    const scheme = await db.installationScheme.update({
      where: { id },
      data: {
        name: data.name,
        workDirectionId: data.workDirectionId,
        buildingId: data.buildingId,
        floor: data.floor,
        description: data.description,
        fileUrl: data.fileUrl,
      },
      include: {
        workDirection: true,
        building: true,
      },
    })

    return NextResponse.json(scheme)
  } catch (error) {
    console.error('Update scheme error:', error)
    return NextResponse.json(
      { error: 'Ошибка обновления схемы монтажа' },
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
    await db.installationScheme.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Схема монтажа удалена' })
  } catch (error) {
    console.error('Delete scheme error:', error)
    return NextResponse.json(
      { error: 'Ошибка удаления схемы монтажа' },
      { status: 500 }
    )
  }
}
