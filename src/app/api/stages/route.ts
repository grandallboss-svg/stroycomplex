import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const planId = searchParams.get('planId')

    if (!planId) {
      return NextResponse.json(
        { error: 'Требуется указать planId' },
        { status: 400 }
      )
    }

    const stages = await db.workStage.findMany({
      where: { workPlanId: planId },
      orderBy: { order: 'asc' },
      include: {
        workPlan: {
          include: {
            workDirection: true,
            building: true,
          },
        },
        works: true,
        _count: {
          select: { workAssignments: true },
        },
      },
    })

    return NextResponse.json(stages)
  } catch (error) {
    console.error('Get stages error:', error)
    return NextResponse.json(
      { error: 'Ошибка получения этапов работ' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Получаем максимальный порядок для плана
    const maxOrder = await db.workStage.aggregate({
      where: { workPlanId: data.workPlanId },
      _max: { order: true },
    })

    const order = (maxOrder._max.order || 0) + 1

    const stage = await db.workStage.create({
      data: {
        workPlanId: data.workPlanId,
        name: data.name,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: data.status || 'PENDING',
        plannedAmount: data.plannedAmount || 0,
        actualAmount: data.actualAmount || 0,
        order,
      },
      include: {
        workPlan: true,
      },
    })

    return NextResponse.json(stage, { status: 201 })
  } catch (error) {
    console.error('Create stage error:', error)
    return NextResponse.json(
      { error: 'Ошибка создания этапа работ' },
      { status: 500 }
    )
  }
}
