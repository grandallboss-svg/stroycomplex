import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payment = await db.salaryPayment.findUnique({
      where: { id },
      include: {
        employee: true,
      },
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Начисление не найдено' },
        { status: 404 }
      )
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Get salary payment error:', error)
    return NextResponse.json(
      { error: 'Ошибка получения данных начисления' },
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

    const payment = await db.salaryPayment.update({
      where: { id },
      data: {
        amount: data.amount,
        bonus: data.bonus,
        deduction: data.deduction,
        total: (data.amount || 0) + (data.bonus || 0) - (data.deduction || 0),
        status: data.status,
        notes: data.notes,
        paidAt: data.status === 'PAID' ? new Date() : undefined,
      },
      include: {
        employee: true,
      },
    })

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Update salary payment error:', error)
    return NextResponse.json(
      { error: 'Ошибка обновления начисления' },
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
    await db.salaryPayment.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Начисление удалено' })
  } catch (error) {
    console.error('Delete salary payment error:', error)
    return NextResponse.json(
      { error: 'Ошибка удаления начисления' },
      { status: 500 }
    )
  }
}
