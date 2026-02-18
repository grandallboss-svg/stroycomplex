import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const document = await db.documentKS3.findUnique({
      where: { id },
      include: {
        workPlan: {
          include: {
            workDirection: true,
            building: true,
          },
        },
        documentKS2: {
          include: {
            items: true,
          },
        },
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
    console.error('Get KS3 document error:', error)
    return NextResponse.json(
      { error: 'Ошибка получения документа КС-3' },
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

    const document = await db.documentKS3.update({
      where: { id },
      data: {
        period: data.period ? new Date(data.period) : undefined,
        ks2Id: data.ks2Id,
        totalAmount: data.totalAmount,
        vatAmount: data.vatAmount,
        totalWithVat: data.totalWithVat,
        previousTotal: data.previousTotal,
        currentTotal: data.currentTotal,
        status: data.status,
        notes: data.notes,
        signedAt: data.status === 'SIGNED' || data.status === 'APPROVED' ? new Date() : null,
      },
      include: {
        workPlan: true,
        documentKS2: {
          include: {
            items: true,
          },
        },
      },
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error('Update KS3 document error:', error)
    return NextResponse.json(
      { error: 'Ошибка обновления документа КС-3' },
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
    await db.documentKS3.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Документ КС-3 удален' })
  } catch (error) {
    console.error('Delete KS3 document error:', error)
    return NextResponse.json(
      { error: 'Ошибка удаления документа КС-3' },
      { status: 500 }
    )
  }
}
