import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/documents/ks3 - Получить все КС-3
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workPlanId = searchParams.get('workPlanId')

    const where: Record<string, unknown> = {}
    if (workPlanId) where.workPlanId = workPlanId

    const documents = await db.documentKS3.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        workPlan: {
          include: {
            workDirection: true,
            building: true,
          }
        },
        documentKS2: true,
      }
    })
    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching KS3:', error)
    return NextResponse.json({ error: 'Ошибка получения документов КС-3' }, { status: 500 })
  }
}

// POST /api/documents/ks3 - Создать КС-3
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const year = new Date().getFullYear()
    const count = await db.documentKS3.count({
      where: {
        number: { contains: `/${year}` }
      }
    })
    const number = `КС-3-${String(count + 1).padStart(3, '0')}/${year}`

    const document = await db.documentKS3.create({
      data: {
        number,
        workPlanId: data.workPlanId,
        ks2Id: data.ks2Id,
        period: new Date(data.period),
        totalAmount: data.totalAmount || 0,
        vatAmount: data.vatAmount || 0,
        totalWithVat: data.totalWithVat || 0,
        previousTotal: data.previousTotal || 0,
        currentTotal: data.currentTotal || 0,
        status: data.status || 'DRAFT',
        notes: data.notes,
        createdById: data.createdById,
      },
      include: {
        workPlan: true,
        documentKS2: true,
      }
    })
    return NextResponse.json(document)
  } catch (error) {
    console.error('Error creating KS3:', error)
    return NextResponse.json({ error: 'Ошибка создания документа КС-3' }, { status: 500 })
  }
}
