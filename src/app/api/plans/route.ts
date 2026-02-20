import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
// GET /api/plans - Получить все планы работ
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const directionId = searchParams.get('directionId')
    const buildingId = searchParams.get('buildingId')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (directionId) where.workDirectionId = directionId
    if (buildingId) where.buildingId = buildingId

    const plans = await db.workPlan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        workDirection: true,
        building: true,
        stages: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { stages: true, documentsKS2: true, documentsKS3: true }
        }
      }
    })
    return NextResponse.json(plans)
  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json({ error: 'Ошибка получения планов работ' }, { status: 500 })
  }
}

// POST /api/plans - Создать план работ
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const plan = await db.workPlan.create({
      data: {
        name: data.name,
        contractNumber: data.contractNumber,
        workDirectionId: data.workDirectionId,
        buildingId: data.buildingId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        totalAmount: data.totalAmount || 0,
        vatRate: data.vatRate || 20,
        status: data.status || 'DRAFT',
        notes: data.notes,
      },
      include: {
        workDirection: true,
        building: true,
      }
    })
    return NextResponse.json(plan)
  } catch (error) {
    console.error('Error creating plan:', error)
    return NextResponse.json({ error: 'Ошибка создания плана работ' }, { status: 500 })
  }
}
