import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
// GET /api/plans/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const plan = await db.workPlan.findUnique({
      where: { id },
      include: {
        workDirection: true,
        building: true,
        stages: { orderBy: { order: 'asc' } },
        documentsKS2: { orderBy: { period: 'desc' } },
        documentsKS3: { orderBy: { period: 'desc' } },
        hiddenWorkActs: true,
        orders: {
          include: {
            assignees: { include: { employee: true } }
          }
        }
      }
    })
    if (!plan) {
      return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
    }
    return NextResponse.json(plan)
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка получения' }, { status: 500 })
  }
}

// PUT /api/plans/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    const plan = await db.workPlan.update({
      where: { id },
      data: {
        name: data.name,
        contractNumber: data.contractNumber,
        workDirectionId: data.workDirectionId,
        buildingId: data.buildingId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        totalAmount: data.totalAmount,
        status: data.status,
        notes: data.notes,
      },
      include: { workDirection: true, building: true }
    })
    return NextResponse.json(plan)
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 })
  }
}

// DELETE /api/plans/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.workPlan.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка удаления' }, { status: 500 })
  }
}
