import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
// GET /api/employees/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const employee = await db.employee.findUnique({
      where: { id },
      include: {
        workAssignments: {
          include: { workPlan: true }
        },
        salaryPayments: {
          orderBy: { period: 'desc' },
          take: 12
        },
        orderAssignments: {
          include: { order: true }
        }
      }
    })
    if (!employee) {
      return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
    }
    return NextResponse.json(employee)
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка получения' }, { status: 500 })
  }
}

// PUT /api/employees/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    const employee = await db.employee.update({
      where: { id },
      data: {
        fullName: data.fullName,
        shortName: data.shortName,
        phone: data.phone,
        email: data.email,
        position: data.position,
        specialty: data.specialty,
        hourlyRate: data.hourlyRate,
        monthlySalary: data.monthlySalary,
        status: data.status,
      }
    })
    return NextResponse.json(employee)
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 })
  }
}

// DELETE /api/employees/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.employee.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка удаления' }, { status: 500 })
  }
}
