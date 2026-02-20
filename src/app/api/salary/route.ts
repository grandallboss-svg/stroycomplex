import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
// GET /api/salary - Получить все начисления зарплаты
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const period = searchParams.get('period')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (employeeId) where.employeeId = employeeId
    if (period) where.period = new Date(period)
    if (status) where.status = status

    const payments = await db.salaryPayment.findMany({
      where,
      orderBy: [{ period: 'desc' }, { createdAt: 'desc' }],
      include: {
        employee: true,
      }
    })
    return NextResponse.json(payments)
  } catch (error) {
    console.error('Error fetching salary payments:', error)
    return NextResponse.json({ error: 'Ошибка получения начислений' }, { status: 500 })
  }
}

// POST /api/salary - Создать начисление
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Автоматический расчёт налога и суммы к выплате
    const baseAmount = Number(data.baseAmount) || 0
    const bonus = Number(data.bonus) || 0
    const deductions = Number(data.deductions) || 0
    const grossAmount = baseAmount + bonus - deductions
    const tax = Math.round(grossAmount * 0.13) // НДФЛ 13%
    const total = grossAmount - tax
    
    const payment = await db.salaryPayment.create({
      data: {
        employeeId: data.employeeId,
        period: new Date(data.period),
        workDays: data.workDays || 22,
        hoursWorked: data.hoursWorked || 0,
        baseAmount,
        bonus,
        deductions,
        tax,
        total,
        status: data.status || 'PENDING',
        notes: data.notes,
      },
      include: {
        employee: true,
      }
    })
    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error creating salary payment:', error)
    return NextResponse.json({ error: 'Ошибка создания начисления' }, { status: 500 })
  }
}

// PUT /api/salary - Обновить статус
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    
    const payment = await db.salaryPayment.update({
      where: { id: data.id },
      data: {
        status: data.status,
        paidAt: data.status === 'PAID' ? new Date() : null,
      },
      include: {
        employee: true,
      }
    })
    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error updating salary payment:', error)
    return NextResponse.json({ error: 'Ошибка обновления начисления' }, { status: 500 })
  }
}
