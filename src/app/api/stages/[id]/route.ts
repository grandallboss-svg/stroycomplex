import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const stage = await db.workStage.findUnique({
      where: { id },
      include: {
        workPlan: {
          include: {
            workDirection: true,
            building: true,
          },
        },
        works: true,
        workAssignments: {
          include: {
            employee: true,
          },
        },
        hiddenWorkActs: true,
      },
    })

    if (!stage) {
      return NextResponse.json(
        { error: 'Этап работ не найден' },
        { status: 404 }
      )
    }

    return NextResponse.json(stage)
  } catch (error) {
    console.error('Get stage error:', error)
    return NextResponse.json(
      { error: 'Ошибка получения этапа работ' },
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

    const stage = await db.workStage.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        status: data.status,
        plannedAmount: data.plannedAmount,
        actualAmount: data.actualAmount,
        order: data.order,
      },
      include: {
        workPlan: true,
      },
    })

    return NextResponse.json(stage)
  } catch (error) {
    console.error('Update stage error:', error)
    return NextResponse.json(
      { error: 'Ошибка обновления этапа работ' },
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
    await db.workStage.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Этап работ удален' })
  } catch (error) {
    console.error('Delete stage error:', error)
    return NextResponse.json(
      { error: 'Ошибка удаления этапа работ' },
      { status: 500 }
    )
  }
}
