import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
// GET /api/documents/hidden-acts - Получить все акты скрытых работ
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workPlanId = searchParams.get('workPlanId')

    const where: Record<string, unknown> = {}
    if (workPlanId) where.workPlanId = workPlanId

    const acts = await db.hiddenWorkAct.findMany({
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
      }
    })
    return NextResponse.json(acts)
  } catch (error) {
    console.error('Error fetching hidden acts:', error)
    return NextResponse.json({ error: 'Ошибка получения актов скрытых работ' }, { status: 500 })
  }
}

// POST /api/documents/hidden-acts - Создать акт скрытых работ
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const year = new Date().getFullYear()
    const count = await db.hiddenWorkAct.count({
      where: {
        number: { contains: `/${year}` }
      }
    })
    const number = `АСР-${String(count + 1).padStart(3, '0')}/${year}`

    const act = await db.hiddenWorkAct.create({
      data: {
        number,
        workPlanId: data.workPlanId,
        workStageId: data.workStageId,
        name: data.name,
        description: data.description,
        location: data.location,
        executedAt: new Date(data.executedAt),
        signedAt: data.signedAt ? new Date(data.signedAt) : null,
        status: data.status || 'DRAFT',
        contractorName: data.contractorName,
        contractorPosition: data.contractorPosition,
        customerName: data.customerName,
        customerPosition: data.customerPosition,
        supervisionName: data.supervisionName,
        supervisionPosition: data.supervisionPosition,
        notes: data.notes,
      },
      include: {
        workPlan: true,
        workStage: true,
      }
    })
    return NextResponse.json(act)
  } catch (error) {
    console.error('Error creating hidden act:', error)
    return NextResponse.json({ error: 'Ошибка создания акта скрытых работ' }, { status: 500 })
  }
}
