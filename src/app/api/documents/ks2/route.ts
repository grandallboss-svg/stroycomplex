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
    const number = data.number || `КС-2-${String(count + 1).padStart(3, '0')}/${year}`

    // Подготовка items
    const items = data.items && Array.isArray(data.items) && data.items.length > 0
      ? data.items.map((item: { name: string; unit: string; quantity: number; unitPrice: number; totalAmount?: number }, index: number) => ({
          lineNumber: index + 1,
          name: item.name || '',
          unit: item.unit || 'шт',
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unitPrice) || 0,
          totalAmount: Number(item.totalAmount) || (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
        }))
      : []

    // Подсчёт сумм
    const totalAmount = items.reduce((sum: number, item: { totalAmount: number }) => sum + item.totalAmount, 0)
    const vatAmount = totalAmount * 0.2
    const totalWithVat = totalAmount * 1.2

    const document = await db.documentKS2.create({
      data: {
        number,
        workPlanId: data.workPlanId || undefined,
        period: data.period ? new Date(data.period) : new Date(),
        totalAmount: data.totalAmount ?? totalAmount,
        vatAmount: data.vatAmount ?? vatAmount,
        totalWithVat: data.totalWithVat ?? totalWithVat,
        status: data.status || 'DRAFT',
        notes: data.notes || null,
        createdById: data.createdById || null,
        items: items.length > 0 ? {
          create: items
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
