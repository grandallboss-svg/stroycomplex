import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/documents/ks2 - Получить все КС-2
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workPlanId = searchParams.get('workPlanId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (workPlanId) where.workPlanId = workPlanId
    if (status) where.status = status

    const documents = await db.documentKS2.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        workPlan: {
          include: {
            workDirection: true,
            building: true,
          }
        },
        items: {
          orderBy: { lineNumber: 'asc' }
        },
        _count: {
          select: { documentsKS3: true }
        }
      }
    })
    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching KS2:', error)
    return NextResponse.json({ error: 'Ошибка получения документов КС-2' }, { status: 500 })
  }
}

// POST /api/documents/ks2 - Создать КС-2
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Генерируем номер документа
    const year = new Date().getFullYear()
    const count = await db.documentKS2.count({
      where: {
        number: { contains: `/${year}` }
      }
    })
    const number = `КС-2-${String(count + 1).padStart(3, '0')}/${year}`

    const document = await db.documentKS2.create({
      data: {
        number,
        workPlanId: data.workPlanId,
        period: new Date(data.period),
        totalAmount: data.totalAmount || 0,
        vatAmount: data.vatAmount || 0,
        totalWithVat: data.totalWithVat || 0,
        status: data.status || 'DRAFT',
        notes: data.notes,
        createdById: data.createdById,
        items: data.items ? {
          create: data.items.map((item: Record<string, unknown>, index: number) => ({
            lineNumber: index + 1,
            name: item.name as string,
            unit: item.unit as string,
            quantity: item.quantity as number,
            unitPrice: item.unitPrice as number,
            totalAmount: item.totalAmount as number,
          }))
        } : undefined
      },
      include: {
        items: true,
        workPlan: true,
      }
    })
    return NextResponse.json(document)
  } catch (error) {
    console.error('Error creating KS2:', error)
    return NextResponse.json({ error: 'Ошибка создания документа КС-2' }, { status: 500 })
  }
}
