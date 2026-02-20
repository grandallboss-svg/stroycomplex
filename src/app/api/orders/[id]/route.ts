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
        items: {
          orderBy: { id: 'asc' }
        },
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
        const workedMinutes = Math.floor((now.getTime() - new Date(currentOrder.startedAt).getTime()) / (1000 * 60))
        totalTimeMinutes += workedMinutes
      } else if (data.status === 'COMPLETED' && currentOrder.status === 'IN_PROGRESS') {
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
      name: data.name,
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

    // Обновление состава работ если передан
    if (data.items !== undefined) {
      // Удаляем старые работы
      await db.orderItem.deleteMany({
        where: { orderId: id }
      })
      
      // Создаём новые
      if (data.items && Array.isArray(data.items) && data.items.length > 0) {
        await db.orderItem.createMany({
          data: data.items.map((item: { name: string; unit: string; quantity: number; unitPrice: number; notes?: string }) => ({
            orderId: id,
            name: item.name,
            unit: item.unit || 'шт',
            quantity: Number(item.quantity) || 1,
            unitPrice: Number(item.unitPrice) || 0,
            notes: item.notes,
          }))
        })
      }
    }

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
        items: true,
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
    
    // Удаляем связанные работы
    await db.orderItem.deleteMany({
      where: { orderId: id }
    })
    
    // Удаляем связанные назначения
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
