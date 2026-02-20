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
          orderBy: { order: 'asc' },
          include: {
            works: { orderBy: { order: 'asc' } }
          }
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

// POST /api/plans - Создать план работ с этапами и составом работ
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Создаём план с этапами и работами в одной транзакции
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
        // Создаём этапы если есть
        stages: data.stages && data.stages.length > 0 ? {
          create: data.stages.map((stage: { name: string; description?: string; startDate?: string; endDate?: string; plannedAmount?: number; works?: { name: string; unit: string; quantity: number; unitPrice: number }[] }, idx: number) => ({
            name: stage.name,
            description: stage.description,
            order: idx,
            startDate: stage.startDate ? new Date(stage.startDate) : null,
            endDate: stage.endDate ? new Date(stage.endDate) : null,
            plannedAmount: stage.plannedAmount || 0,
            // Создаём работы внутри этапа если есть
            works: stage.works && stage.works.length > 0 ? {
              create: stage.works.map((work, widx: number) => ({
                name: work.name,
                unit: work.unit || 'шт',
                quantity: work.quantity || 1,
                unitPrice: work.unitPrice || 0,
                order: widx
              }))
            } : undefined
          }))
        } : undefined
      },
      include: {
        workDirection: true,
        building: true,
        stages: {
          orderBy: { order: 'asc' },
          include: { works: { orderBy: { order: 'asc' } } }
        }
      }
    })
    
    return NextResponse.json(plan)
  } catch (error) {
    console.error('Error creating plan:', error)
    return NextResponse.json({ error: 'Ошибка создания плана работ' }, { status: 500 })
  }
}
