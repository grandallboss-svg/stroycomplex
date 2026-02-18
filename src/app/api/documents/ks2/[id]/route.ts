import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const document = await db.documentKS2.findUnique({
      where: { id },
      include: {
        workPlan: {
          include: {
            workDirection: true,
            building: true,
          },
        },
        items: true,
        documentsKS3: true,
      },
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Документ не найден' },
        { status: 404 }
      )
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error('Get KS2 document error:', error)
    return NextResponse.json(
      { error: 'Ошибка получения документа КС-2' },
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

    // Обновляем документ и позиции
    const document = await db.documentKS2.update({
      where: { id },
      data: {
        period: data.period ? new Date(data.period) : undefined,
        totalAmount: data.totalAmount,
        vatAmount: data.vatAmount,
        totalWithVat: data.totalWithVat,
        status: data.status,
        notes: data.notes,
        signedAt: data.status === 'SIGNED' || data.status === 'APPROVED' ? new Date() : null,
        ...(data.items && {
          items: {
            deleteMany: {},
            create: data.items.map((item: { name: string; unit: string; quantity: number; unitPrice: number; totalAmount: number }, index: number) => ({
              lineNumber: index + 1,
              name: item.name,
              unit: item.unit,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalAmount: item.totalAmount,
            }))
          }
        })
      },
      include: {
        workPlan: true,
        items: true,
      },
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error('Update KS2 document error:', error)
    return NextResponse.json(
      { error: 'Ошибка обновления документа КС-2' },
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

    // Проверяем есть ли связанные документы КС-3
    const relatedKS3 = await db.documentKS3.findFirst({
      where: { ks2Id: id },
      select: { number: true }
    })

    if (relatedKS3) {
      return NextResponse.json(
        { error: `Нельзя удалить документ КС-2, так как на него ссылается документ КС-3 "${relatedKS3.number}". Сначала удалите связанный документ КС-3.` },
        { status: 400 }
      )
    }

    // Сначала удаляем связанные позиции
    await db.documentKS2Item.deleteMany({
      where: { documentKS2Id: id }
    })

    // Затем удаляем документ
    await db.documentKS2.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Документ КС-2 удален' })
  } catch (error) {
    console.error('Delete KS2 document error:', error)
    return NextResponse.json(
      { error: 'Ошибка удаления документа КС-2' },
      { status: 500 }
    )
  }
}
