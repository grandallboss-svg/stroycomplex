import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const order = await db.installationOrder.findUnique({
      where: { id },
      include: {
        workPlan: {
          include: {
            workDirection: true,
            building: true,
          },
        },
        workStage: true,
        assignees: {
          include: {
            employee: true,
          }
        },
        createdBy: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Наряд не найден' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Get order error:', error)
    return NextResponse.json(
      { error: 'Ошибка получения наряда' },
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
    const now = new Date()

    // Получаем текущий наряд для расчёта времени
    const currentOrder = await db.installationOrder.findUnique({
      where: { id },
    })

    let totalTimeMinutes = currentOrder?.totalTimeMinutes || 0

    // Расчёт времени при смене статуса
    if (currentOrder?.startedAt) {
      if (data.status === 'PAUSED' && currentOrder.status === 'IN_PROGRESS') {
        // Пауза - считаем время работы
        const workedMinutes = Math.floor((now.getTime() - new Date(currentOrder.startedAt).getTime()) / (1000 * 60))
        totalTimeMinutes += workedMinutes
      } else if (data.status === 'COMPLETED' && currentOrder.status === 'IN_PROGRESS') {
        // Завершение - считаем время работы
        const workedMinutes = Math.floor((now.getTime() - new Date(currentOrder.startedAt).getTime()) / (1000 * 60))
        totalTimeMinutes += workedMinutes
      }
    }

    const updateData: Record<string, unknown> = {
      status: data.status,
      priority: data.priority,
      notes: data.notes,
      description: data.description,
      location: data.location,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
    }

    // Обновляем временные метки
    if (data.status === 'IN_PROGRESS' && currentOrder?.status !== 'IN_PROGRESS') {
      updateData.startedAt = now
      updateData.pausedAt = null
    } else if (data.status === 'PAUSED') {
      updateData.pausedAt = now
    } else if (data.status === 'COMPLETED') {
      updateData.completedAt = now
    }

    updateData.totalTimeMinutes = totalTimeMinutes

    const order = await db.installationOrder.update({
      where: { id },
      data: updateData,
      include: {
        workPlan: {
          include: {
            workDirection: true,
          }
        },
        workStage: true,
        assignees: {
          include: {
            employee: true,
          }
        },
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json(
      { error: 'Ошибка обновления наряда' },
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
    
    // Сначала удаляем связанные назначения
    await db.orderAssignee.deleteMany({
      where: { orderId: id }
    })
    
    await db.installationOrder.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Наряд удален' })
  } catch (error) {
    console.error('Delete order error:', error)
    return NextResponse.json(
      { error: 'Ошибка удаления наряда' },
      { status: 500 }
    )
  }
}
