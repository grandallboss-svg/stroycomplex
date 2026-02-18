import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
// GET /api/orders - Получить все наряды
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workPlanId = searchParams.get('workPlanId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (workPlanId) where.workPlanId = workPlanId
    if (status) where.status = status

    const orders = await db.installationOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        workPlan: {
          include: {
            workDirection: true,
            building: true,
          }
        },
        workStage: true,
        assignees: {
          include: {
            employee: true,
          }
        },
      }
    })
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Ошибка получения нарядов' }, { status: 500 })
  }
}

// POST /api/orders - Создать наряд
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const year = new Date().getFullYear()
    const count = await db.installationOrder.count({
      where: {
        number: { contains: `/${year}` }
      }
    })
    const number = `НРД-${String(count + 1).padStart(3, '0')}/${year}`

    const order = await db.installationOrder.create({
      data: {
        number,
        workPlanId: data.workPlanId,
        workStageId: data.workStageId,
        name: data.name,
        description: data.description,
        location: data.location,
        deadline: data.deadline ? new Date(data.deadline) : null,
        status: data.status || 'DRAFT',
        priority: data.priority || 2,
        notes: data.notes,
        createdById: data.createdById,
        assignees: data.assigneeIds ? {
          create: data.assigneeIds.map((id: string) => ({
            employeeId: id,
          }))
        } : undefined
      },
      include: {
        workPlan: true,
        workStage: true,
        assignees: {
          include: {
            employee: true,
          }
        },
      }
    })
    return NextResponse.json(order)
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Ошибка создания наряда' }, { status: 500 })
  }
}

// PUT /api/orders - Обновить наряд
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    
    const order = await db.installationOrder.update({
      where: { id: data.id },
      data: {
        status: data.status,
        completedAt: data.status === 'COMPLETED' ? new Date() : null,
      },
      include: {
        workPlan: true,
        assignees: {
          include: {
            employee: true,
          }
        },
      }
    })
    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Ошибка обновления наряда' }, { status: 500 })
  }
}
